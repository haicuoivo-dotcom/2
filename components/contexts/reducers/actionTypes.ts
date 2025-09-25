/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import type { Action } from '../GameContext';

const CHARACTER_ACTIONS = new Set<Action['type']>([
    'UPDATE_CHARACTER', 'CLEAR_UNSEEN_QUEST_FLAG',
    'MERGE_BACKGROUND_UPDATES', 'CRAFT_ITEM', 'LIST_ITEM_FOR_AUCTION',
    'MOVE_ITEM', 'SAVE_OUTFIT', 'EQUIP_OUTFIT', 'DELETE_OUTFIT',
    'RENAME_OUTFIT', 'UPDATE_OUTFIT', 'UPDATE_OUTFIT_CATEGORY',
    'UPDATE_RELATIONSHIP_MANUAL'
]);

const COMBAT_ACTIONS = new Set<Action['type']>([
    'UPDATE_COMBAT_STATE', 'START_TEST_COMBAT', 'START_COMBAT'
]);

const WORLD_ACTIONS = new Set<Action['type']>([
    'UPDATE_WORLD_SUMMARY', 'CREATE_ENTITY', 'UPDATE_ENTITY', 'UPDATE_FACTION',
    'DELETE_ENTITY', 'UPDATE_MAP_DATA', 'UPDATE_PLAYER_POSITION', 'ADD_MAP_MARKER',
    'UPDATE_MAP_MARKER', 'DELETE_MAP_MARKER', 'TOGGLE_PIN_MEMORY', 'DELETE_MEMORY',
    'SUMMARIZE_MEMORIES', 'MERGE_FACTION_UPDATES', 'ADD_WORLD_SKILLS', 'ADD_TIMELINE_BLOCK',
    'CLEANUP_DATA'
]);

const TURN_ACTIONS = new Set<Action['type']>([
    'ADD_TURN', 'UPDATE_TURN'
]);

const MISC_ACTIONS = new Set<Action['type']>([
    'PAUSE_GAME', 'RESUME_GAME', 'UPDATE_SAVE_ID', 'PROCESS_AUCTIONS', 'PLACE_BID',
    'START_AUCTION', 'END_AUCTION', 'START_TEST_AUCTION',
]);

// Type guards
export const isCharacterAction = (action: Action): boolean => CHARACTER_ACTIONS.has(action.type);
export const isCombatAction = (action: Action): boolean => COMBAT_ACTIONS.has(action.type);
export const isWorldAction = (action: Action): boolean => WORLD_ACTIONS.has(action.type);
export const isTurnAction = (action: Action): boolean => TURN_ACTIONS.has(action.type);
export const isMiscAction = (action: Action): boolean => MISC_ACTIONS.has(action.type);