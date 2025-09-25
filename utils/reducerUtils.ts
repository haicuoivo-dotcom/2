/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

/**
 * Recursively traverses an object and replaces all occurrences of a string.
 * Handles entity tags like `[PC:OldName]` and plain text.
 * @param obj The object to traverse.
 * @param oldName The name to replace.
 * @param newName The new name.
 * @returns A new object with the names replaced.
 */
export const deepReplace = (obj: any, oldName: string, newName: string): any => {
    if (obj === null || typeof obj !== 'object') {
        if (typeof obj === 'string') {
            const oldNameEscaped = oldName.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
            const tagRegex = new RegExp(`\\[(PC|NPC):${oldNameEscaped}\\]`, 'g');
            
            // Determine the new tag type by checking the old one
            let newTag = `[NPC:${newName}]`; // Default to NPC
            const oldTagMatch = obj.match(tagRegex);
            if (oldTagMatch && oldTagMatch[0].includes('[PC:')) {
                newTag = `[PC:${newName}]`;
            }
            
            let newText = obj.replace(tagRegex, newTag);
            
            // Replace plain text occurrences only if they are whole words
            const plainTextRegex = new RegExp(`\\b${oldNameEscaped}\\b`, 'g');
            newText = newText.replace(plainTextRegex, newName);

            return newText;
        }
        return obj;
    }

    if (Array.isArray(obj)) {
        return obj.map(item => deepReplace(item, oldName, newName));
    }

    const newObj: { [key: string]: any } = {};
    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            // Special handling for relationship stats where the name itself is the key
             if ((key === 'name' && typeof obj[key] === 'string') && (obj.category === 'Thiện cảm' || obj.category === 'Quan Hệ Gia Đình')) {
                const statName = obj[key];
                const tagMatch = statName.match(/\[(PC|NPC):([^\]]+)\]/);
                if (tagMatch && tagMatch[2] === oldName) {
                    newObj[key] = `[${tagMatch[1]}:${newName}]`;
                } else {
                     newObj[key] = statName;
                }
            }
            // Special handling for party/partner arrays which store plain names
            else if ((key === 'party' || key === 'partners') && Array.isArray(obj[key])) {
                newObj[key] = obj[key].map((name: string) => name === oldName ? newName : name);
            }
            else {
                newObj[key] = deepReplace(obj[key], oldName, newName);
            }
        }
    }
    return newObj;
};

// FIX: Add missing deepClone function required by other utilities.
export const deepClone = <T>(obj: T): T => {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }
    try {
        return JSON.parse(JSON.stringify(obj));
    } catch (e) {
        console.error("Could not deep clone object", obj, e);
        // Fallback for complex objects that can't be stringified,
        // though for game state this should be fine.
        return obj; 
    }
};
