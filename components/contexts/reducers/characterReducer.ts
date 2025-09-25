/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import type { Draft } from 'immer';
import { deepReplace } from './reducerUtils';
import { hydrateCharacterData, DEFAULT_CHARACTER_STRUCTURE } from '../../../utils/hydration';
import { generateUniqueId } from '../../../utils/id';
import { canAddItem, addHoursToGameTime, getReciprocalRelationshipType, generateRelationshipDescription } from '../../../utils/game';
import { BASE_ITEM_TEMPLATES } from '../../../constants/items';
import { ITEM_TAGS } from '../../../constants/tagConstants';
import { RIGHT_HAND_SLOT, LEFT_HAND_SLOT } from '../../../constants/statConstants';
import type { State, Action } from '../GameContext';
// FIX: Import RecipeData to explicitly type the destructured object.
import type { Character, Stat, Message, AuctionItem, OutfitSet, EquipmentSlot, RecipeData } from '../../../types';

export const characterReducer = (draft: Draft<State>, action: Action): void => {
    const { gameState, worldSettings } = draft;

    const findCharAndMutate = (name: string, callback: (char: Character) => void) => {
        if (gameState.character.name === name) {
            callback(gameState.character);
            return;
        }
        const npcIndex = gameState.knowledgeBase.npcs.findIndex((n: Character) => n.name === name);
        if (npcIndex > -1) {
            callback(gameState.knowledgeBase.npcs[npcIndex]);
        }
    };

    switch (action.type) {
        case 'UPDATE_CHARACTER': {
            const { characterName, updates } = action.payload;
            
            // PREVENT ID CHANGE
            if ('id' in updates) {
                delete (updates as any).id;
            }

            if (gameState.character.name === characterName) {
                Object.assign(gameState.character, updates);
            } else {
                const npcIndex = gameState.knowledgeBase.npcs.findIndex(npc => npc.name === characterName);
                if (npcIndex > -1) {
                    Object.assign(gameState.knowledgeBase.npcs[npcIndex], updates);
                }
            }
            return;
        }
        case 'UPDATE_RELATIONSHIP_MANUAL': {
            const { sourceCharId, targetCharId, newAffinity } = action.payload;
            
            const allChars = [gameState.character, ...gameState.knowledgeBase.npcs];
            const sourceChar = allChars.find(c => c.id === sourceCharId);
            const targetChar = allChars.find(c => c.id === targetCharId);
        
            if (!sourceChar || !targetChar) return;
        
            if (!sourceChar.relationships) sourceChar.relationships = [];
            let relToTarget = sourceChar.relationships.find(r => r.characterId === targetCharId);
            if (relToTarget) {
                relToTarget.affinity = newAffinity;
            } else {
                const type = 'Người lạ';
                const description = generateRelationshipDescription(sourceChar.displayName, targetChar.displayName, type);
                sourceChar.relationships.push({ characterId: targetCharId, affinity: newAffinity, type, description });
            }
            
            return;
        }
        case 'CLEAR_UNSEEN_QUEST_FLAG': {
            if (gameState.character) {
                gameState.hasUnseenQuest = false;
            }
            return;
        }
        case 'CRAFT_ITEM': {
            const { recipeName, quantity, areCheatsEnabled } = action.payload;
            const char = gameState.character;
            const recipeStat = char.stats.find(s => s.category === 'Sơ Đồ Chế Tạo' && s.name === recipeName);
            if (!recipeStat || !recipeStat.recipeData) return;
        
            const { ingredients, product: productName, difficulty = 1, craftingSkill: requiredSkillName }: RecipeData = recipeStat.recipeData;
        
            const characterSkill = requiredSkillName ? char.stats.find(s => s.name === requiredSkillName && s.category === 'Kỹ Năng') : null;
            const skillLevel = (characterSkill && typeof characterSkill.value === 'number') ? characterSkill.value : 1;
            const proficiency = (characterSkill && typeof characterSkill.proficiency === 'number') ? characterSkill.proficiency : 0;
        
            const baseSuccessRate = 80;
            const bonusPerLevelDiff = 5;
            const bonusPerProficiencyPoint = 0.1;
            const successChance = Math.max(10, Math.min(100, baseSuccessRate + ((skillLevel - difficulty) * bonusPerLevelDiff) + (proficiency * bonusPerProficiencyPoint)));
        
            const roll = Math.random() * 100;
            const isSuccess = areCheatsEnabled || (roll < successChance);
        
            const newStats = [...char.stats];
            const materialsLost: { name: string, quantity: number }[] = [];
            let craftedItemQuality: string | undefined;
        
            if (!areCheatsEnabled) {
                ingredients.forEach(ing => {
                    const totalRequired = ing.quantity * quantity;
                    let remainingToConsume = totalRequired;
                    for (let i = newStats.length - 1; i >= 0 && remainingToConsume > 0; i--) {
                        const stat = newStats[i];
                        if (stat.name === ing.name && (stat.category === 'Nguyên liệu' || stat.category === 'Vật phẩm')) {
                            const stackQuantity = stat.quantity || 1;
                            const amountToTake = Math.min(remainingToConsume, stackQuantity);
                            if (stackQuantity - amountToTake <= 0) {
                                newStats.splice(i, 1);
                            } else {
                                stat.quantity = stackQuantity - amountToTake;
                            }
                            remainingToConsume -= amountToTake;
                        }
                    }
                });
            }

            if (isSuccess) {
                const qualityRoll = Math.random() * 100;
                let quality: 'Thường' | 'Tốt' | 'Tinh xảo' = 'Thường';
                const goodChance = 75 - (skillLevel * 2);
                const excellentChance = 95 - (skillLevel * 1);
                if (qualityRoll > excellentChance) quality = 'Tinh xảo';
                else if (qualityRoll > goodChance) quality = 'Tốt';
                craftedItemQuality = quality;
        
                const productTemplate = BASE_ITEM_TEMPLATES[productName];
                if (productTemplate) {
                    const finalProductName = quality !== 'Thường' ? `[${quality}] ${productTemplate.name}` : productTemplate.name;
                    const isStackable = productTemplate.tags?.includes('tiêu hao') || productTemplate.category === 'Nguyên liệu';
                    
                    let existingStack = isStackable ? newStats.find(s => s.name === finalProductName) : null;
        
                    if (existingStack) {
                        existingStack.quantity = (existingStack.quantity || 1) + quantity;
                    } else {
                        const newItem: Stat = {
                            ...productTemplate,
                            id: generateUniqueId('item-crafted'),
                            description: productTemplate.baseDescription,
                            baseItemName: productName,
                            quantity: quantity,
                            name: finalProductName,
                            quality: quality
                        };
        
                        if (quality !== 'Thường' && newItem.effects) {
                            const multiplier = quality === 'Tốt' ? 1.25 : 1.5;
                            newItem.effects = newItem.effects.map(effect => {
                                const modifierMatch = effect.modifier.match(/([+-])(\d+)(%?)/);
                                if (modifierMatch) {
                                    const sign = modifierMatch[1];
                                    const numValue = parseInt(modifierMatch[2], 10);
                                    const suffix = modifierMatch[3] || '';
                                    const newValue = Math.round(numValue * multiplier);
                                    return { ...effect, modifier: `${sign}${newValue}${suffix}` };
                                }
                                return effect;
                            });
                        }
                        newStats.push(newItem);
                    }
                }
            } else { // Failure
                // Material consumption is handled before success check now.
                // We can add logic here for partial material loss if needed.
            }
        
            if (characterSkill) {
                const skillIndex = newStats.findIndex(s => s.id === characterSkill.id);
                if (skillIndex > -1) {
                    const skillToUpdate = newStats[skillIndex];
                    skillToUpdate.proficiency = (skillToUpdate.proficiency || 0) + (isSuccess ? 2 : 1);
                }
            }
        
            char.stats = newStats;
            if (!gameState.craftingHistory) gameState.craftingHistory = [];
            gameState.craftingHistory.unshift({
                id: generateUniqueId('craft-hist'),
                recipeName: recipeName,
                quantity: quantity,
                timestamp: gameState.gameTime,
                outcome: isSuccess ? 'success' : 'failure',
                quality: craftedItemQuality,
                materialsLost: materialsLost.length > 0 ? materialsLost : undefined,
            });
        
            return;
        }
        case 'LIST_ITEM_FOR_AUCTION': {
            const { itemToSell, startingBid, durationHours } = action.payload;
            gameState.character.stats = gameState.character.stats.filter(s => s.id !== itemToSell.id);

            const newAuctionItem: AuctionItem = {
                id: generateUniqueId('auction-item'),
                item: itemToSell,
                sellerName: gameState.character.name,
                startingBid: startingBid,
                currentBid: startingBid,
                highestBidder: 'Chưa có',
                auctionEndTime: addHoursToGameTime(gameState.gameTime, durationHours),
                bidLog: [],
            };

            if (!gameState.auctionHouse) {
                gameState.auctionHouse = [];
            }
            gameState.auctionHouse.push(newAuctionItem);

            return;
        }
        case 'MOVE_ITEM': {
            const { itemId, destinationContainerId } = action.payload;
            const char = gameState.character;
            const itemToMove = char.stats.find(s => s.id === itemId);
        
            if (!itemToMove) return; 
        
            const sourceContainerId = itemToMove.containerId || null;
            if (sourceContainerId === destinationContainerId) return; 
        
            if (destinationContainerId) {
                const destContainer = char.stats.find(s => s.id === destinationContainerId);
                if (!destContainer || !destContainer.containerProperties) return;
                const containedItems = char.stats.filter(s => s.containerId === destinationContainerId);
                if (containedItems.length >= destContainer.containerProperties.capacity) {
                    return;
                }
            }
        
            itemToMove.containerId = destinationContainerId || undefined;
        
            return;
        }
        case 'SAVE_OUTFIT': {
            const { characterName, outfitName } = action.payload;
            findCharAndMutate(characterName, char => {
                const newOutfit: OutfitSet = {
                    id: generateUniqueId('outfit'),
                    name: outfitName,
                    equipment: { ...(char.equipment || {}) },
                    category: 'Chưa phân loại'
                };
                if (!char.outfits) char.outfits = [];
                char.outfits.push(newOutfit);
            });
            return;
        }
        case 'EQUIP_OUTFIT': {
            const { characterName, outfitId } = action.payload;
            findCharAndMutate(characterName, char => {
                const outfitToEquip = (char.outfits || []).find(o => o.id === outfitId);
                if (!outfitToEquip) return;
                
                const newEquipment = { ...(char.equipment || {}) };
                Object.assign(newEquipment, outfitToEquip.equipment);

                const rightHandItemId = newEquipment[RIGHT_HAND_SLOT];
                if (rightHandItemId) {
                    const rightHandItem = char.stats.find(s => s.id === rightHandItemId);
                    if (rightHandItem?.tags?.includes(ITEM_TAGS.EQUIPMENT_TYPE.TWO_HANDED)) {
                        newEquipment[LEFT_HAND_SLOT] = rightHandItemId;
                    }
                }
                char.equipment = newEquipment;
            });
            return;
        }
        case 'DELETE_OUTFIT': {
            const { characterName, outfitId } = action.payload;
            findCharAndMutate(characterName, char => {
                if (!char.outfits) return;
                const outfitIndex = char.outfits.findIndex(o => o.id === outfitId);
                if (outfitIndex > -1) {
                    char.outfits.splice(outfitIndex, 1);
                }
            });
            return;
        }
        case 'RENAME_OUTFIT': {
            const { characterName, outfitId, newName } = action.payload;
            findCharAndMutate(characterName, char => {
                const outfit = (char.outfits || []).find(o => o.id === outfitId);
                if (outfit) outfit.name = newName;
            });
            return;
        }
        // FIX: Added case for 'UPDATE_OUTFIT' action to handle updating a saved outfit's equipment.
        case 'UPDATE_OUTFIT': {
            const { characterName, outfitId, newEquipment } = action.payload;
            findCharAndMutate(characterName, char => {
                if (!char.outfits) return;
                const outfitIndex = char.outfits.findIndex(o => o.id === outfitId);
                if (outfitIndex > -1) {
                    char.outfits[outfitIndex].equipment = newEquipment;
                }
            });
            return;
        }
        case 'UPDATE_OUTFIT_CATEGORY': {
            const { characterName, outfitId, newCategory } = action.payload;
            findCharAndMutate(characterName, char => {
                const outfit = (char.outfits || []).find(o => o.id === outfitId);
                if (outfit) outfit.category = newCategory;
            });
            return;
        }
    }
};