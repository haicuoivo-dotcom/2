/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import type { Character, Stat } from '../types';

export const INVENTORY_LIMIT = 100;

export const canAddItem = (character: Character, countToAdd: number = 1): boolean => {
    // Calculate total inventory capacity including bonuses from equipped items.
    const equippedItemIds = new Set(Object.values(character.equipment || {}).filter(Boolean));
    const inventoryBonus = character.stats
        ?.filter(stat => stat.id && equippedItemIds.has(stat.id) && typeof stat.inventoryBonus === 'number')
        .reduce((sum, item) => sum + (item.inventoryBonus || 0), 0) || 0;
    const maxInventorySize = INVENTORY_LIMIT + inventoryBonus;

    // Count items currently in the main inventory (not equipped, not in a container).
    // Each Stat object represents one occupied slot, stacking is handled by the `value` property.
    const mainInventoryItems = character.stats?.filter(s => 
        (s.category === 'Vật phẩm' || s.category === 'Nguyên liệu') &&
        !equippedItemIds.has(s.id!)
    ) || [];
    
    const usedSlots = mainInventoryItems.length;

    return (usedSlots + countToAdd) <= maxInventorySize;
};

export const getItemScore = (item: Stat): number => {
    return item.price || 0;
};
