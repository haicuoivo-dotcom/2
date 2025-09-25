/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import type { GameTime } from '../types';

export const gameTimeToMinutes = (time: GameTime | undefined): number => {
    if (!time) return 0;
    const year = time.year || 0;
    const month = time.month || 1;
    const day = time.day || 1;
    const hour = time.hour || 0;
    const minute = time.minute || 0;
    // Approximate conversion, sufficient for sorting.
    return year * 525600 + // 365 * 24 * 60
           month * 43200 +  // 30 * 24 * 60
           day * 1440 +     // 24 * 60
           hour * 60 +
           minute;
};

export const isTimeAPastTimeB = (timeA: GameTime, timeB: GameTime): boolean => {
    return gameTimeToMinutes(timeA) > gameTimeToMinutes(timeB);
};

export const addHoursToGameTime = (time: GameTime, hours: number): GameTime => {
    const newTime = { ...time };
    let totalMinutes = newTime.hour * 60 + newTime.minute + hours * 60;
    
    let daysToAdd = Math.floor(totalMinutes / (24 * 60));
    totalMinutes %= (24 * 60);
    
    newTime.hour = Math.floor(totalMinutes / 60);
    newTime.minute = totalMinutes % 60;
    
    newTime.day += daysToAdd;
    
    // Handle month/year overflow (simplified: assumes 30 days/month)
    while (newTime.day > 30) {
        newTime.day -= 30;
        newTime.month += 1;
        if (newTime.month > 12) {
            newTime.month = 1;
            newTime.year += 1;
        }
    }
    return newTime;
};