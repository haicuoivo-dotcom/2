/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import type { GameAction } from '../types';

export const findBestAction = (actions: GameAction[]): GameAction | null => {
    if (!actions || actions.length === 0) {
        return null;
    }
    return actions.reduce((best, current) => {
        const bestChance = best.successChance ?? -1;
        const currentChance = current.successChance ?? -1;
        return currentChance > bestChance ? current : best;
    });
};