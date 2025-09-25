/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import type { Draft } from 'immer';
import type { State, Action } from '../GameContext';

export const turnReducer = (draft: Draft<State>, action: Action): void => {
    const { gameState } = draft;

    switch (action.type) {
        case 'ADD_TURN': {
            const newTurn = action.payload;
            gameState.turns.push(newTurn);
            return;
        }
        case 'UPDATE_TURN': {
            const { turnId, updates } = action.payload;
            const turnIndex = gameState.turns.findIndex(turn => turn.id === turnId);
            if (turnIndex > -1) {
                Object.assign(gameState.turns[turnIndex], updates);
            }
            return;
        }
    }
};