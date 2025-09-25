/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import type { Draft } from 'immer';
import { hydrateCharacterData, DEFAULT_CHARACTER_STRUCTURE } from '../../../utils/hydration';
import { generateUniqueId } from '../../../utils/id';
import type { State, Action } from '../GameContext';
import type { Character, KnowledgeEntity, Faction, Stat, Relationship } from '../../../types';

export const worldReducer = (draft: Draft<State>, action: Action): void => {
    const { gameState, worldSettings } = draft;

    switch (action.type) {
        case 'UPDATE_WORLD_SUMMARY':
            gameState.worldSummary = action.payload;
            return;
        case 'CREATE_ENTITY': {
            const { entityType, data } = action.payload;
            const currentList = gameState.knowledgeBase[entityType] || [];
            if (currentList.some((e: any) => e.name.trim().toLowerCase() === data.name.trim().toLowerCase())) {
                return;
            }
            
            if (entityType === 'npcs') {
                const barebonesNpc = { name: data.name, displayName: data.name, description: data.description || 'Chưa có mô tả.' };
                const newNpc = hydrateCharacterData(barebonesNpc, DEFAULT_CHARACTER_STRUCTURE, worldSettings, gameState.character.name);
                gameState.knowledgeBase.npcs.push(newNpc);
            } else {
                 const newEntity = { id: generateUniqueId(entityType), name: data.name, description: data.description || 'Chưa có mô tả.' };
                 if (entityType === 'factions') {
                    (newEntity as Faction).factionType = 'Tổ chức';
                    (newEntity as Faction).leaderId = '';
                    (newEntity as Faction).territories = [];
                    (newEntity as Faction).resources = { treasury: 1000, manpower: 100, food: 500 };
                    (newEntity as Faction).stats = { military: 50, economy: 50, influence: 50, stability: 50 };
                    (newEntity as Faction).relations = [];
                    (newEntity as Faction).policies = [];
                 }
                 (gameState.knowledgeBase[entityType] as any[]).push(newEntity);
            }
            return;
        }
        case 'UPDATE_ENTITY': {
            const { entityType, entityId, updates } = action.payload;
            const list = gameState.knowledgeBase[entityType] as (KnowledgeEntity[] | Faction[]) | undefined;
            if (!list) return;
            const entityIndex = list.findIndex(e => e.id === entityId);
            if (entityIndex > -1) {
                // PREVENT ID CHANGE
                if ('id' in updates) {
                    delete (updates as any).id;
                }
                Object.assign(list[entityIndex], updates);
            }
            return;
        }
        case 'UPDATE_FACTION': {
            const { factionId, updates } = action.payload;
            const factionIndex = gameState.knowledgeBase.factions.findIndex(f => f.id === factionId);
            if (factionIndex > -1) {
                // PREVENT ID CHANGE
                if ('id' in updates) {
                    delete (updates as any).id;
                }
                Object.assign(gameState.knowledgeBase.factions[factionIndex], updates);
            }
            return;
        }
        case 'DELETE_ENTITY': {
            const { entityType, entityId } = action.payload;
        
            if (entityType === 'npcs') {
                const npcIndexToDelete = gameState.knowledgeBase.npcs.findIndex((e: Character) => e.id === entityId);
                if (npcIndexToDelete === -1) return;

                const npcIdToDelete = gameState.knowledgeBase.npcs[npcIndexToDelete].id;
                gameState.knowledgeBase.npcs.splice(npcIndexToDelete, 1);
        
                const cleanupRelationships = (character: Character): void => {
                    if (character.relationships) {
                        character.relationships = character.relationships.filter(r => r.characterId !== npcIdToDelete);
                    }
                };
                cleanupRelationships(gameState.character);
                gameState.knowledgeBase.npcs.forEach(cleanupRelationships);
        
                if (npcIdToDelete) {
                    gameState.knowledgeBase.factions.forEach(faction => {
                        if (faction.leaderId === npcIdToDelete) {
                            faction.leaderId = '';
                        }
                    });
                }
            } else if (gameState.knowledgeBase[entityType]) {
                const list = gameState.knowledgeBase[entityType] as any[];
                const entityIndex = list.findIndex(e => e.id === entityId);
                if (entityIndex > -1) {
                    list.splice(entityIndex, 1);
                }
            }
        
            return;
        }
        case 'TOGGLE_PIN_MEMORY': {
            const mem = gameState.memories.find(mem => mem.id === action.payload);
            if (mem) {
                mem.pinned = !mem.pinned;
            }
            return;
        }
        case 'DELETE_MEMORY': {
            const memoryIndex = gameState.memories.findIndex(mem => mem.id === action.payload);
            if (memoryIndex > -1) {
                gameState.memories.splice(memoryIndex, 1);
            }
            return;
        }
        case 'SUMMARIZE_MEMORIES': {
            const { summaryMemory, idsToDelete } = action.payload;
            const idsToDeleteSet = new Set(idsToDelete);
            
            let i = gameState.memories.length;
            while(i--) {
                if (idsToDeleteSet.has(gameState.memories[i].id)) {
                    gameState.memories.splice(i, 1);
                }
            }
            
            gameState.memories.unshift(summaryMemory);
            return;
        }
        case 'UPDATE_MAP_DATA':
            gameState.map = action.payload;
            return;
        case 'UPDATE_PLAYER_POSITION': {
            const { x, y } = action.payload;
            if (typeof x === 'number' && typeof y === 'number') {
                const coordinates = { x, y };
                gameState.map.playerPosition = coordinates;
                const targetLocation = gameState.map.locations.find(
                    loc => loc.coordinates.x === coordinates.x && loc.coordinates.y === coordinates.y
                );
                if (targetLocation) {
                    gameState.character.locationId = targetLocation.id;
                }
            }
            return;
        }
        case 'ADD_MAP_MARKER':
            if (!gameState.map.markers) gameState.map.markers = [];
            gameState.map.markers.push(action.payload);
            return;
        case 'UPDATE_MAP_MARKER':
            const markerIndex = (gameState.map.markers || []).findIndex(m => m.id === action.payload.id);
            if (markerIndex > -1) {
                gameState.map.markers[markerIndex] = action.payload;
            }
            return;
        case 'DELETE_MAP_MARKER': {
            if (!gameState.map.markers) return;
            const markerIdx = gameState.map.markers.findIndex(m => m.id === action.payload);
            if (markerIdx > -1) {
                gameState.map.markers.splice(markerIdx, 1);
            }
            return;
        }
        case 'MERGE_FACTION_UPDATES': {
            const updatedFactionsFromPayload = action.payload;
            if (!updatedFactionsFromPayload || updatedFactionsFromPayload.length === 0) {
                return;
            }
        
            const factionMap = new Map(gameState.knowledgeBase.factions.map(faction => [faction.id, faction]));
        
            updatedFactionsFromPayload.forEach(updatedFaction => {
                if (updatedFaction.id && factionMap.has(updatedFaction.id)) {
                    const existingFaction = factionMap.get(updatedFaction.id)!;
                    // Preserve ID, merge the rest.
                    Object.assign(existingFaction, updatedFaction);
                }
            });
            gameState.knowledgeBase.factions = Array.from(factionMap.values());
            return;
        }
        case 'ADD_WORLD_SKILLS': {
            const newSkills = action.payload;
            if (!gameState.knowledgeBase.worldSkills) {
                gameState.knowledgeBase.worldSkills = [];
            }
            const existingSkillNames = new Set(gameState.knowledgeBase.worldSkills.map(s => s.name));
            const uniqueNewSkills = newSkills.filter(s => !existingSkillNames.has(s.name));
            gameState.knowledgeBase.worldSkills.push(...uniqueNewSkills);
            return;
        }
        case 'ADD_TIMELINE_BLOCK': {
            if (!gameState.timeline) {
                gameState.timeline = [];
            }
            gameState.timeline.push(action.payload);
            return;
        }
        case 'CLEANUP_DATA': {
            const { statIds, memoryIds, relationshipsToPrune } = action.payload;
    
            const cleanupStats = (stats: Stat[]) => stats ? stats.filter(s => !statIds.has(s.id)) : [];
            
            // Cleanup for all characters
            const allChars = [gameState.character, ...gameState.knowledgeBase.npcs];
            allChars.forEach(char => {
                if (char.stats) {
                    char.stats = cleanupStats(char.stats);
                }
            });
    
            // Cleanup memories
            if (gameState.memories) {
                gameState.memories = gameState.memories.filter(m => !memoryIds.has(m.id));
            }
    
            // Cleanup relationships
            if (relationshipsToPrune && relationshipsToPrune.length > 0) {
                const relsToPruneSet = new Set(relationshipsToPrune.map(r => `${r.charId}::${r.targetId}`));
                
                allChars.forEach(char => {
                    if (char.relationships) {
                        char.relationships = char.relationships.filter(r => 
                            !relsToPruneSet.has(`${char.id}::${r.characterId}`)
                        );
                    }
                });
            }
    
            return;
        }
    }
};