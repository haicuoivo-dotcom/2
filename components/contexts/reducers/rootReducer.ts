/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { produce, Draft } from 'immer';
import { isCharacterAction, isCombatAction, isWorldAction, isTurnAction, isMiscAction } from './actionTypes';
import { characterReducer } from './characterReducer';
import { combatReducer } from './combatReducer';
import { worldReducer } from './worldReducer';
import { turnReducer } from './turnReducer';
import { miscReducer } from './miscReducer';
import { hydrateGameState, hydrateWorldSettings } from '../../../utils/hydration';
import { deepClone } from './reducerUtils';
import type { State, Action } from '../GameContext';
import { initialState } from '../GameContext';

const subReducers = (draft: Draft<State>, action: Action) => {
    if (isCharacterAction(action)) {
        characterReducer(draft, action);
        return;
    }
    if (isCombatAction(action)) {
        combatReducer(draft, action);
        return;
    }
    if (isWorldAction(action)) {
        worldReducer(draft, action);
        return;
    }
    if (isTurnAction(action)) {
        turnReducer(draft, action);
        return;
    }
    if (isMiscAction(action)) {
        miscReducer(draft, action);
        return;
    }
};

export const rootReducer = (state: State, action: Action): State => {
    return produce(state, draft => {
        if (!draft.gameState && !['LOAD_GAME', 'CLEAR_GAME'].includes(action.type)) {
            return;
        }

        switch (action.type) {
            case 'SET_GAME_STATE':
                draft.gameState = action.payload;
                break;
            case 'LOAD_GAME':
                draft.gameState = hydrateGameState(action.payload.gameState, action.payload.worldSettings);
                draft.worldSettings = hydrateWorldSettings(action.payload.worldSettings);
                break;
            case 'CLEAR_GAME':
                return initialState;
            case 'UPDATE_WORLD_SETTINGS':
                Object.assign(draft.worldSettings, action.payload);
                break;
            case 'REVERT_TO_TURN': {
                const historyToRevert = state.gameState!.history || [];
                if (action.payload < 0 || action.payload >= historyToRevert.length) {
                    return; 
                }
                if (!draft.gameState) return;
                const currentTimeline = draft.gameState.timeline;
                const revertedState = deepClone(historyToRevert[action.payload]); // Create a mutable copy
                revertedState.timeline = currentTimeline; // Safely modify the copy
                draft.gameState = revertedState; // Assign the new state
                break;
            }
            default:
                subReducers(draft, action);
                break;
        }
        
        // Increment version with each state change
        draft.version += 1;
    });
};
