/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import type { Draft } from 'immer';
import { hydrateCharacterData, DEFAULT_CHARACTER_STRUCTURE } from '../../../utils/hydration';
import { generateUniqueId } from '../../../utils/id';
import type { State, Action } from '../GameContext';
import type { GameState, Character, Stat, PersonalityTrait } from '../../../types';
// FIX: Import PERSONALITY_TRAITS_LIBRARY to correctly create the test monster's personality.
import { PERSONALITY_TRAITS_LIBRARY } from '../../../constants/personalityTraits';

const getSpeed = (char: Character): number => {
    const speedStat = char.stats?.find(s => s.name === 'Tốc Độ');
    if (speedStat && typeof speedStat.value === 'number') return speedStat.value;
    if (speedStat && typeof speedStat.value === 'string') {
        const parsed = parseInt(speedStat.value.split('/')[0], 10);
        return isNaN(parsed) ? 10 : parsed;
    }
    return 10;
};

export const combatReducer = (draft: Draft<State>, action: Action): void => {
    const { gameState } = draft;

    switch (action.type) {
        case 'START_COMBAT': {
            const { opponentIds, isLethal } = action.payload;
            const opponents = gameState.knowledgeBase.npcs.filter((n: Character) => opponentIds.includes(n.id));
            if (opponents.length === 0) return;

            const allCombatants = [
                gameState.character,
                ...opponents,
                // FIX: Property 'party' does not exist on type 'WritableDraft<Character>'. Use 'harem' instead.
                ...gameState.knowledgeBase.npcs.filter(n => gameState.character.harem?.includes(n.name))
            ].filter(c => !c.stats?.some(s => s.name === 'Trạng thái Tử vong'));
        
            const turnQueue = allCombatants
                .map(c => ({ characterId: c.id, speed: getSpeed(c) }))
                .sort((a, b) => b.speed - a.speed);
            
            const opponentNames = opponents.map(o => o.displayName || o.name).join(', ');
            const newCombatLog = [`Trận chiến với ${opponentNames} đã bắt đầu!`, '--- Vòng 1 ---'];
    
            // Add friendly match rule notification
            if (isLethal === false) {
                newCombatLog.unshift("LUẬT GIAO HỮU: Trận đấu sẽ kết thúc khi một bên mất khả năng chiến đấu. Sẽ không có đòn kết liễu.");
            }

            const newCombatState: GameState['combatState'] = {
                isActive: true,
                opponentIds: opponentIds,
                combatLog: newCombatLog,
                combatMode: 'turn-based',
                turnQueue: turnQueue,
                currentTurnIndex: 0,
                roundNumber: 1,
                isLethal: isLethal ?? true,
            };

            gameState.actions = []; // Clear old actions from story mode
            
            // FIX: Generate default combat actions so the buttons are not disabled.
            const firstOpponent = gameState.knowledgeBase.npcs.find(n => n.id === opponentIds[0]);
            const firstOpponentName = firstOpponent ? `[NPC:${firstOpponent.name}]` : 'kẻ địch';

            gameState.actions = [
                { id: generateUniqueId('action-combat-attack'), description: `Tấn công ${firstOpponentName}` },
                { id: generateUniqueId('action-combat-defend'), description: 'Vào thế thủ' },
                { id: generateUniqueId('action-combat-flee'), description: 'Tìm cách bỏ chạy' },
            ];
            
            gameState.combatState = newCombatState;
        
            return;
        }
        case 'START_TEST_COMBAT': {
            // 1. Find or create an opponent
            let opponent = gameState.knowledgeBase.npcs.find((n: Character) => !n.stats?.some((s: Stat) => s.name === 'Trạng thái Tử vong'));
            
            if (!opponent) {
                // FIX: Changed personality from a string to an array of PersonalityTrait objects to match the type.
                const hotHeadedTrait = PERSONALITY_TRAITS_LIBRARY['Phổ biến khác'].find(t => t.id === 'trait_hot_headed');
                const decisiveTrait = PERSONALITY_TRAITS_LIBRARY['DISC'].find(t => t.id === 'trait_decisive');
                const traits = [hotHeadedTrait, decisiveTrait].filter(Boolean) as PersonalityTrait[];

                const testMonster: Character = hydrateCharacterData({
                    name: "Ma Cây Thử Nghiệm",
                    displayName: "Ma Cây Thử Nghiệm",
                    npcType: 'named_monster',
                    physicalAppearance: "Một cái cây cổ thụ khổng lồ, với những cành cây xoắn xuýt như cánh tay và vỏ cây sần sùi như áo giáp. Hai hốc mắt rực sáng ánh sáng đỏ.",
                    backstory: "Một ma cây được triệu hồi để thử nghiệm.",
                    personality: traits,
                    currentOutfit: "Không có",
                    stats: [
                        { id: generateUniqueId('stat-m'), name: "Sinh Lực", value: "300/300", category: "Thuộc tính", description: "" },
                        { id: generateUniqueId('stat-m'), name: "Tấn Công", value: 25, category: "Thuộc tính", description: "" },
                        { id: generateUniqueId('stat-m'), name: "Phòng Thủ", value: 15, category: "Thuộc tính", description: "" },
                        { id: generateUniqueId('stat-m'), name: "Tốc Độ", value: 8, category: "Thuộc tính", description: "" },
                    ]
                }, {}, draft.worldSettings);
                gameState.knowledgeBase.npcs.push(testMonster);
                opponent = testMonster;
            }
        
            // 2. Build combat state directly, skipping pendingCombat
            const allCombatants = [
                gameState.character,
                opponent,
                // FIX: Property 'party' does not exist on type 'WritableDraft<Character>'. Use 'harem' instead.
                ...gameState.knowledgeBase.npcs.filter(n => gameState.character.harem?.includes(n.name))
            ];
        
            const turnQueue = allCombatants
                .map(c => ({ characterId: c.id, speed: getSpeed(c) }))
                .sort((a, b) => b.speed - a.speed);
            
            const opponentName = `[NPC:${opponent.name}]`;
            const newCombatLog = [`Trận chiến thử nghiệm với ${opponent.displayName} đã bắt đầu!`, '--- Vòng 1 ---'];
            newCombatLog.unshift("LUẬT GIAO HỮU: Trận đấu sẽ kết thúc khi một bên mất khả năng chiến đấu. Sẽ không có đòn kết liễu.");

            const newCombatState: GameState['combatState'] = {
                isActive: true,
                opponentIds: [opponent.id],
                combatLog: newCombatLog,
                combatMode: 'turn-based',
                turnQueue: turnQueue,
                currentTurnIndex: 0,
                roundNumber: 1,
                isLethal: false,
            };
            gameState.combatState = newCombatState;
            gameState.actions = [
                { id: generateUniqueId('action-tc'), description: `Tấn công ${opponentName}` },
                { id: generateUniqueId('action-pt'), description: 'Vào thế thủ' },
                { id: generateUniqueId('action-td'), description: `Thăm dò điểm yếu của ${opponentName}` },
                { id: generateUniqueId('action-bc'), description: 'Tìm cách bỏ chạy' },
            ]; // Provide initial actions
        
            return;
        }
        case 'UPDATE_COMBAT_STATE': {
            Object.assign(gameState.combatState, action.payload);
            return;
        }
    }
};