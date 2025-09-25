/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { stripEntityTags } from './text';
import { generateUniqueId } from './id';
import { hydrateCharacterData, DEFAULT_CHARACTER_STRUCTURE } from './hydration';
import { pruneCharacterOnDeath, getReciprocalRelationshipType, getCharacterEquipmentStatus, getItemScore, generateRelationshipDescription } from './game';
import * as db from '../services/db';
import { deepClone } from './reducerUtils';
import type { GameState, WorldSettings, Character, Message, Stat, SaveFile } from '../types';

// Helper function to find a character in the state by name (displayName or internal name) and apply a mutation.
const findCharAndMutate = (state: GameState, name: string, callback: (char: Character) => void): Character | null => {
    const cleanName = stripEntityTags(name);
    if (state.character && (state.character.name === cleanName || state.character.displayName === cleanName)) {
        callback(state.character);
        return state.character;
    }
    const npcIndex = state.knowledgeBase.npcs.findIndex(n => n.name === cleanName || n.displayName === cleanName);
    if (npcIndex > -1) {
        callback(state.knowledgeBase.npcs[npcIndex]);
        return state.knowledgeBase.npcs[npcIndex];
    }
    return null;
};

// Handles the cascading consequences of a character's death.
const handleCharacterDeath = (state: GameState, deadCharacterName: string): { newState: GameState, messages: Message[] } => {
    // This is a simplified placeholder. Full logic would be more complex,
    // including item transfers, quest updates, relationship changes, etc.
    return { newState: state, messages: [] };
};

export const applyDirectives = (
    initialState: GameState,
    directives: any[],
    worldSettings: WorldSettings,
    addToast?: (message: string, type?: 'info' | 'success' | 'error' | 'warning') => void
): { newState: GameState; generatedMessages: Message[] } => {
    const newState = JSON.parse(JSON.stringify(initialState));
    let generatedMessages: Message[] = [];

    directives.forEach(directive => {
        const { command, args } = directive;
        if (!command || !args) return;

        try {
            switch (command) {
                case 'UPDATE_STAT': {
                    const { characterName, statName, value } = args;
                    findCharAndMutate(newState, characterName, char => {
                        if (!Array.isArray(char.stats)) {
                            char.stats = [];
                        }
                        const stat = char.stats.find(s => s.name === statName);
                        if (stat) {
                            stat.value = value;
                        }
                    });
                    break;
                }
                case 'ADD_STAT': {
                    const { characterName, stat } = args;
                    if (!stat || !stat.name) break;

                    findCharAndMutate(newState, characterName, char => {
                        if (!Array.isArray(char.stats)) {
                            char.stats = [];
                        }
                        
                        const newStat: Stat = { ...stat, id: generateUniqueId('stat-dir') };
                        char.stats.push(newStat);

                        if (newStat.name === 'Trạng thái Tử vong') {
                            const { newState: stateAfterDeathLogic, messages: deathMessages } = handleCharacterDeath(newState, char.name);
                            Object.assign(newState, stateAfterDeathLogic); 
                            generatedMessages.push(...deathMessages);

                            // NEW: Update kill count
                            if (!newState.killCount) {
                                newState.killCount = {};
                            }
                            const enemyName = char.name;
                            newState.killCount[enemyName] = (newState.killCount[enemyName] || 0) + 1;


                            const prunedChar = pruneCharacterOnDeath(char);
                            Object.assign(char, prunedChar);
                        }
                    });
                    
                    break;
                }
                case 'REMOVE_STAT': {
                    const { characterName, statName } = args;
                    findCharAndMutate(newState, characterName, char => {
                        if (!Array.isArray(char.stats)) return;
                        char.stats = char.stats.filter(s => s.name !== statName);
                    });
                    break;
                }
                case 'UPDATE_CHARACTER_PROPERTY': {
                    const { characterName, property, value } = args;
                    findCharAndMutate(newState, characterName, char => {
                        (char as any)[property] = value;
                    });
                    break;
                }
                 case 'CREATE_NPC': {
                    const { characterData, creatorName } = args;
                    if (!characterData || !characterData.name) break;
                    if (newState.knowledgeBase.npcs.some(n => n.name === characterData.name)) break;
                
                    // Create the NPC
                    const newNpc = hydrateCharacterData(characterData, DEFAULT_CHARACTER_STRUCTURE, worldSettings, newState.character.name);
                    newState.knowledgeBase.npcs.push(newNpc);
                
                    const allChars = [newState.character, ...newState.knowledgeBase.npcs];
                    const creator = creatorName 
                        ? allChars.find(c => c.name === stripEntityTags(creatorName)) 
                        : newState.character;
                
                    if (creator) {
                        const newNpcJustAdded = newState.knowledgeBase.npcs.find(n => n.id === newNpc.id);
                        if (newNpcJustAdded) {
                            // Relationship: Creator -> New NPC
                            if (!creator.relationships) creator.relationships = [];
                            creator.relationships.push({
                                characterId: newNpc.id,
                                type: 'Tạo vật',
                                affinity: 50,
                                description: `Mối quan hệ với ${newNpc.displayName}.`
                            });
                
                            // Relationship: New NPC -> Creator
                            if (!newNpcJustAdded.relationships) newNpcJustAdded.relationships = [];
                            newNpcJustAdded.relationships.push({
                                characterId: creator.id,
                                type: 'Người tạo',
                                affinity: 50,
                                description: `Mối quan hệ với ${creator.displayName}.`
                            });
                        }
                    }
                    break;
                }
                case 'UPDATE_PLAYER_POSITION': {
                    const { coordinates } = args;
                    if (coordinates && typeof coordinates.x === 'number' && typeof coordinates.y === 'number') {
                        newState.map.playerPosition = coordinates;
                    }
                    break;
                }
                case 'UPDATE_RELATIONSHIP': {
                    const { characterName, targetCharacterName, type, affinity } = args;
                    const charA = findCharAndMutate(newState, characterName, () => {});
                    const charB = findCharAndMutate(newState, targetCharacterName, () => {});
            
                    if (charA && charB) {
                        // Update A -> B
                        if (!charA.relationships) charA.relationships = [];
                        let relA = charA.relationships.find(r => r.characterId === charB.id);
                        const descA = generateRelationshipDescription(charA.displayName, charB.displayName, type);
                        if (!relA) {
                            charA.relationships.push({ characterId: charB.id, type, affinity, description: descA });
                        } else {
                            if (type !== undefined) relA.type = type;
                            if (affinity !== undefined) relA.affinity = affinity;
                            relA.description = descA;
                        }
            
                        // Reciprocal Relationship B -> A
                        if (!charB.relationships) charB.relationships = [];
                        let relB = charB.relationships.find(r => r.characterId === charA.id);
                        const targetGender = charA.stats?.find(s => s.name === 'Giới tính')?.value as string | undefined;
                        const reciprocalType = getReciprocalRelationshipType(type, targetGender);
                        const descB = generateRelationshipDescription(charB.displayName, charA.displayName, reciprocalType);
            
                        if (!relB) {
                            charB.relationships.push({ characterId: charA.id, type: reciprocalType, affinity, description: descB });
                        } else {
                            if (type !== undefined) relB.type = reciprocalType;
                            if (affinity !== undefined) relB.affinity = affinity;
                            relB.description = descB;
                        }
                    }
                    break;
                }
                case 'UPDATE_FACTION_REPUTATION': {
                    const { factionName, amount } = args;
                    const faction = newState.knowledgeBase.factions.find(f => f.name === factionName);
                    if (faction) {
                        faction.playerReputation = (faction.playerReputation ?? 0) + amount;
                
                        // Update status string based on new reputation
                        const rep = faction.playerReputation;
                        if (rep <= -80) faction.reputationStatus = 'Kẻ địch truyền kiếp';
                        else if (rep <= -50) faction.reputationStatus = 'Thù địch';
                        else if (rep < 20) faction.reputationStatus = 'Trung lập';
                        else if (rep < 50) faction.reputationStatus = 'Thân thiện';
                        else if (rep < 80) faction.reputationStatus = 'Được Tôn trọng';
                        else faction.reputationStatus = 'Đồng minh Danh dự';
                    }
                    break;
                }
            }
        } catch (e) {
            console.error("Error applying directive:", directive, e);
            if (addToast) addToast(`Lỗi khi thực thi mệnh lệnh AI: ${command}`, 'error');
        }
    });

    return { newState, generatedMessages };
};

export const handleAutosave = async (gameState: GameState, worldSettings: WorldSettings): Promise<void> => {
    try {
        const allSaves = await db.getAllSaves();
        const autoSaves = allSaves.filter(s => s.type === 'auto').sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        
        // Keep only the 4 most recent autosaves, the new one will be the 5th
        if (autoSaves.length >= 5) {
            const oldestSaves = autoSaves.slice(4);
            for (const oldSave of oldestSaves) {
                await db.deleteSave(oldSave.id);
            }
        }

        const worldTitle = gameState.title || 'Game Chưa Có Tên';
        // OPTIMIZATION: Only include the most recent history state in the autosave to drastically reduce size.
        const gameStateToSave = { ...gameState, history: gameState.history.slice(-1) }; 
        const saveFile: SaveFile = {
            id: generateUniqueId('autosave'),
            name: `${worldTitle} (Tự động)`,
            timestamp: new Date().toISOString(),
            gameState: gameStateToSave,
            worldSettings: worldSettings,
            type: 'auto',
        };
        await db.addOrUpdateSave(saveFile);
    } catch (error) {
        console.error("Lỗi khi tự động lưu game:", error);
    }
};

export const performLocalIntegrityCheckAndFix = (gameState: GameState): { newState: GameState, fixes: string[] } => {
    const newState = deepClone(gameState);
    const fixes: string[] = [];
    const allCharacters = [newState.character, ...newState.knowledgeBase.npcs];
    const charMapByName = new Map(allCharacters.map(c => [c.name, c]));

    allCharacters.forEach(sourceChar => {
        if (!sourceChar || !sourceChar.stats) return;

        // Check for invalid equipment
        const equippedIds = new Set(Object.values(sourceChar.equipment || {}));
        equippedIds.forEach(itemId => {
            if (!itemId) return;
            const itemInInventory = (sourceChar.stats || []).some(s => s.id === itemId);
            if (!itemInInventory) {
                fixes.push(`Sửa trang bị không hợp lệ cho ${sourceChar.displayName}.`);
                Object.keys(sourceChar.equipment!).forEach(slot => {
                    if (sourceChar.equipment![slot as keyof typeof sourceChar.equipment] === itemId) {
                        sourceChar.equipment![slot as keyof typeof sourceChar.equipment] = undefined;
                    }
                });
            }
        });

        // NEW: Check for nudity and auto-equip
        if (sourceChar.id !== newState.character.id) { // Skip player
            const equipmentStatus = getCharacterEquipmentStatus(sourceChar);
            if (equipmentStatus.status === 'Khỏa thân' || equipmentStatus.status === 'Bán khỏa thân') {
                const currentlyEquippedIds = new Set(Object.values(sourceChar.equipment || {}).filter(Boolean));
                const inventory = (sourceChar.stats || []).filter(s =>
                    s.category === 'Vật phẩm' && s.slot && s.slot !== 'Không có' && !currentlyEquippedIds.has(s.id!)
                );

                if (inventory.length > 0) {
                    let changed = false;
                    const essentialSlots: ('Thân trên' | 'Thân dưới' | 'Quần Lót')[] = ['Thân trên', 'Thân dưới', 'Quần Lót'];

                    essentialSlots.forEach(slot => {
                        if (!sourceChar.equipment || !sourceChar.equipment[slot]) {
                            const bestItemForSlot = inventory
                                .filter(item => item.slot === slot)
                                .sort((a, b) => getItemScore(b) - getItemScore(a))[0];

                            if (bestItemForSlot) {
                                if (!sourceChar.equipment) sourceChar.equipment = {};
                                sourceChar.equipment[slot] = bestItemForSlot.id;
                                fixes.push(`Tự động trang bị ${bestItemForSlot.name} cho ${sourceChar.displayName}.`);
                                changed = true;
                                const index = inventory.findIndex(i => i.id === bestItemForSlot.id);
                                if (index > -1) inventory.splice(index, 1);
                            }
                        }
                    });
                }
            }
        }
    });

    return { newState, fixes };
};