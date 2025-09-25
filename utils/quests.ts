/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import type { GameState, Stat, QuestObjective, Message } from '../types';
import { generateUniqueId } from './id';
import { QUEST_TAGS } from '../constants/tagConstants';

type QuestEvent =
    | { type: 'defeat'; targetName: string }
    | { type: 'collect'; itemName: string; quantity: number };

export const checkQuestProgress = (
    event: QuestEvent,
    mutableState: GameState,
): { messages: (Message & { type: 'success' | 'info' })[] } => {
    let stateModified = false;
    const messages: (Message & { type: 'success' | 'info' })[] = [];
    const pc = mutableState.character;

    if (!pc.stats) return { messages: [] };

    const originalStats = pc.stats;
    const updatedStats = originalStats.map((quest: Stat) => {
        if (quest.category !== 'Nhiệm Vụ' || !quest.objectives || quest.tags?.includes(QUEST_TAGS.COMPLETED)) {
            return quest;
        }

        let questUpdated = false;
        const newObjectives = quest.objectives.map((obj: QuestObjective) => {
            if (obj.currentCount >= obj.requiredCount) return obj;

            let newCount = obj.currentCount;

            // This function now ONLY handles event-based progress, like defeating a monster.
            // Collection quests are handled retroactively.
            if (event.type === 'defeat' && obj.type === 'defeat' && obj.target === event.targetName) {
                newCount++;
            }
            
            if (newCount > obj.currentCount) {
                questUpdated = true;
                return { ...obj, currentCount: Math.min(obj.requiredCount, newCount) };
            }

            return obj;
        });

        if (questUpdated) {
            stateModified = true;
            const updatedQuest = { ...quest, objectives: newObjectives };
            const isQuestComplete = updatedQuest.objectives.every(obj => obj.currentCount >= obj.requiredCount);
            
            if (isQuestComplete) {
                updatedQuest.tags = (quest.tags || []).filter(t => t !== QUEST_TAGS.ACTIVE).concat(QUEST_TAGS.COMPLETED);
                messages.push({ id: generateUniqueId('quest-msg'), text: `Nhiệm vụ hoàn thành: ${quest.name}!`, type: 'success' });
            } else {
                messages.push({ id: generateUniqueId('quest-msg'), text: `Tiến độ nhiệm vụ "${quest.name}" đã được cập nhật.`, type: 'info' });
            }
            return updatedQuest;
        }

        return quest;
    });

    if (stateModified) {
        pc.stats = updatedStats;
    }
    
    return { messages };
};

/**
 * NEW: Retroactively checks ALL quest types against the player's current state.
 * This is a state-based check, ensuring quests complete if conditions were met before the quest started.
 * It is designed to be run once per turn after all directives are applied.
 * @param mutableState The current game state (expected to be a mutable draft).
 * @returns An object with any generated messages. The state is mutated directly.
 */
export const retroactivelyCheckAllQuests = (
    mutableState: GameState,
): { messages: (Message & { type: 'success' | 'info' })[] } => {
    const messages: (Message & { type: 'success' | 'info' })[] = [];
    const pc = mutableState.character;
    const { knowledgeBase } = mutableState;

    if (!pc.stats) return { messages: [] };

    // Create a map of items in inventory for efficient lookup
    const inventoryCount = new Map<string, number>();
    pc.stats.forEach(item => {
        if (item.category === 'Vật phẩm' || item.category === 'Nguyên liệu') {
            inventoryCount.set(item.name, (inventoryCount.get(item.name) || 0) + (item.quantity || 1));
        }
    });

    const currentLocation = knowledgeBase.locations.find(loc => loc.id === pc.locationId);

    pc.stats.forEach((quest: Stat) => {
        // Only check active quests with objectives
        if (quest.category !== 'Nhiệm Vụ' || !quest.objectives || !quest.tags?.includes(QUEST_TAGS.ACTIVE)) {
            return;
        }

        let questObjectivesUpdated = false;
        let questIsNowComplete = true;

        quest.objectives.forEach((obj: QuestObjective) => {
            // Check based on objective type
            switch (obj.type) {
                case 'collect': {
                    const requiredItemName = obj.target;
                    const currentInventoryAmount = inventoryCount.get(requiredItemName) || 0;
                    const newCount = Math.min(obj.requiredCount, currentInventoryAmount);
                    if (obj.currentCount !== newCount) {
                        obj.currentCount = newCount;
                        questObjectivesUpdated = true;
                    }
                    break;
                }
                case 'defeat': {
                    const defeatedCount = mutableState.killCount?.[obj.target] ?? 0;
                    const newCount = Math.min(obj.requiredCount, defeatedCount);
                     if (obj.currentCount !== newCount) {
                        obj.currentCount = newCount;
                        questObjectivesUpdated = true;
                    }
                    break;
                }
                 case 'explore': {
                    if (currentLocation && currentLocation.name === obj.target && obj.currentCount < obj.requiredCount) {
                        obj.currentCount = obj.requiredCount;
                        questObjectivesUpdated = true;
                    }
                    break;
                }
                // 'talk' quests are event-based and don't need retroactive checks.
            }

            // Check if this objective is met for the final quest completion check
            if (obj.currentCount < obj.requiredCount) {
                questIsNowComplete = false;
            }
        });

        if (questObjectivesUpdated) {
            if (questIsNowComplete) {
                quest.tags = (quest.tags || []).filter(t => t !== QUEST_TAGS.ACTIVE).concat(QUEST_TAGS.COMPLETED);
                messages.push({ id: generateUniqueId('quest-msg'), text: `Nhiệm vụ hoàn thành: ${quest.name}!`, type: 'success' });
            } else {
                 messages.push({ id: generateUniqueId('quest-msg'), text: `Tiến độ nhiệm vụ "${quest.name}" đã được cập nhật.`, type: 'info' });
            }
        }
    });

    return { messages };
};