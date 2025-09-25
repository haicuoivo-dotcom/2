/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { STAT_HEALTH } from '../constants/statConstants';
import { generateUniqueId } from './id';
import { stripEntityTags } from './text';
import { checkQuestProgress } from './quests';
import { calculateEffectiveStats } from './character';
import type { GameState, Character, Stat, EffectiveStat, CombatResolution, CombatEvent, WorldSettings } from '../types';

export const performSkillCheck = (chance: number): boolean => {
    if (chance >= 100) return true;
    if (chance <= 0) return false;
    return Math.random() * 100 < chance;
};

const getEffectiveStatValue = (
    effectiveStats: Map<string, EffectiveStat>, 
    statName: string, 
    defaultValue: number
): number => {
    const stat = effectiveStats.get(statName);
    const value = stat?.modifiedValue;
    if (value === undefined || value === null) return defaultValue;
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
        const parsed = parseInt(value.split('/')[0], 10);
        return isNaN(parsed) ? defaultValue : parsed;
    }
    return defaultValue;
};

export const getLocalCombatAction = (
    actor: Character,
    state: GameState,
): { description: string; dialogue?: string } => {
    const isPlayerTeam = state.character.id === actor.id || (state.character.harem || []).includes(actor.name);
    const allChars = [state.character, ...state.knowledgeBase.npcs];
    
    const isDead = (char: Character) => (char.stats || []).some(s => s.name === 'Trạng thái Tử vong');

    // NEW: Target Locking Logic
    const lockedTargetId = state.combatState.lockedTargetId;
    if (lockedTargetId) {
        const lockedTarget = allChars.find(c => c.id === lockedTargetId && !isDead(c));
        if (lockedTarget && isPlayerTeam) { // Only player team follows the lock
            const targetTag = lockedTarget.id === state.character.id ? `[PC:${lockedTarget.name}]` : `[NPC:${lockedTarget.name}]`;
            return { description: `Tấn công ${targetTag}` };
        }
    }
    
    let potentialTargets: Character[];

    if (isPlayerTeam) {
        potentialTargets = state.combatState.opponentIds
            .map(id => allChars.find(c => c.id === id))
            .filter((c): c is Character => !!c && !isDead(c));
    } else {
        const playerTeamIds = new Set([
            state.character.id, 
            ...(state.character.harem?.map(name => allChars.find(c => c.name === name)?.id).filter(Boolean) || [])
        ]);
        potentialTargets = allChars.filter(c => playerTeamIds.has(c.id) && !isDead(c));
    }
    
    if (potentialTargets.length === 0) {
        return { description: 'Đứng yên và quan sát' };
    }

    potentialTargets.sort((a, b) => {
        const getHealth = (char: Character): number => {
            const healthStat = (char.stats || []).find(s => s.name === STAT_HEALTH);
            if (healthStat && typeof healthStat.value === 'string') {
                return parseInt(healthStat.value.split('/')[0], 10) || 9999;
            }
            return 9999;
        };
        return getHealth(a) - getHealth(b);
    });

    const target = potentialTargets[0];
    const targetTag = target.id === state.character.id ? `[PC:${target.name}]` : `[NPC:${target.name}]`;
    
    return { description: `Tấn công ${targetTag}` };
};

export const resolveCombatTurn = (
    actionDescription: string,
    currentState: GameState,
    worldSettings: WorldSettings,
): CombatResolution => {
    const newState = JSON.parse(JSON.stringify(currentState));
    const genre = worldSettings.genre;
    
    const events: CombatEvent[] = [];
    let questMessages: { text: string; type: 'success' | 'info' }[] = [];
    
    const attackerId = newState.combatState.turnQueue[newState.combatState.currentTurnIndex].characterId;
    const attacker = [newState.character, ...newState.knowledgeBase.npcs].find((c: Character) => c.id === attackerId);

    if (!attacker) {
        return { nextState: newState, logEntry: `Lỗi: Không tìm thấy người tấn công.`, defeatedTarget: null, events, questMessages };
    }
    
    // NEW: Deduct skill cost from the attacker if a skill was used.
    const skillMatch = actionDescription.match(/Sử dụng Kỹ năng: ([^lên]+)/);
    if (skillMatch) {
        const skillName = skillMatch[1].trim();
        const skillUsed = attacker.stats?.find((s: Stat) => s.name === skillName && s.category === 'Kỹ Năng');
        if (skillUsed && skillUsed.skillCost) {
            skillUsed.skillCost.forEach(cost => {
                const resourceStat = attacker.stats.find((s: Stat) => s.name === cost.resource);
                if (resourceStat && typeof resourceStat.value === 'string' && resourceStat.value.includes('/')) {
                    const [current, max] = resourceStat.value.split('/').map(Number);
                    if (!isNaN(current) && !isNaN(max)) {
                        const newCurrent = Math.max(0, current - cost.amount);
                        resourceStat.value = `${newCurrent}/${max}`;
                    }
                }
            });
        }
    }

    const attackerEffectiveStats = calculateEffectiveStats(attacker);
    let logParts: string[] = [];

    const targetNameMatch = actionDescription.match(/lên (.+)/) || actionDescription.match(/Tấn công (.+)/);
    const targetName = targetNameMatch ? stripEntityTags(targetNameMatch[1]) : null;
    if (!targetName) return { nextState: newState, logEntry: `${attacker.displayName} thực hiện hành động không có mục tiêu.`, defeatedTarget: null, events, questMessages };
    
    const allChars = [newState.character, ...newState.knowledgeBase.npcs];
    const defender = allChars.find((c: Character) => c.name === targetName || c.displayName === targetName);
    
    if (!defender) return { nextState: newState, logEntry: `${attacker.displayName} tấn công một mục tiêu không tồn tại.`, defeatedTarget: null, events, questMessages };
    
    const defenderEffectiveStats = calculateEffectiveStats(defender);

    const attackerSpeed = getEffectiveStatValue(attackerEffectiveStats, 'Tốc Độ', 10);
    const defenderEvasion = getEffectiveStatValue(defenderEffectiveStats, 'Né Tránh', 5);
    const hitChance = Math.max(10, Math.min(95, 90 + (attackerSpeed - defenderEvasion) * 1.5));

    if (!performSkillCheck(hitChance)) {
        const logEntry = `${defender.displayName} đã nhanh nhẹn né được đòn tấn công của ${attacker.displayName}!`;
        events.push({ id: generateUniqueId('event'), type: 'miss', targetId: defender.id, text: 'Né!' });
        return { nextState: newState, logEntry, defeatedTarget: null, events, questMessages };
    }

    logParts.push(`${attacker.displayName} tấn công ${defender.displayName}.`);
    
    const attackerCritChance = getEffectiveStatValue(attackerEffectiveStats, 'Tỷ lệ Chí mạng', 5);
    const isCritical = performSkillCheck(attackerCritChance);
    if(isCritical) logParts.push(`Một đòn chí mạng!`);
    
    const attackerAttack = getEffectiveStatValue(attackerEffectiveStats, 'Tấn Công', 10);
    let finalDamage = 0;

    const modernGenres = ['Đô Thị Hiện Đại', 'Đô Thị Hiện Đại 100% bình thường', 'Đô Thị Dị Biến', 'Hậu Tận Thế'];
    const cultivationGenres = ['Tu Tiên', 'Huyền Huyễn Truyền Thuyết', 'Võ Lâm'];

    if (modernGenres.includes(genre)) {
        const defenderDamageReduction = getEffectiveStatValue(defenderEffectiveStats, 'Giảm Sát Thương', 0);
        finalDamage = Math.round(Math.max(1, attackerAttack * (1 - defenderDamageReduction / 100)));
    } else if (cultivationGenres.includes(genre)) {
        const attackerSpirit = getEffectiveStatValue(attackerEffectiveStats, 'Thần Hồn', 10);
        const defenderDefense = getEffectiveStatValue(defenderEffectiveStats, 'Phòng Thủ', 5);
        finalDamage = Math.round(Math.max(1, (attackerAttack * 1.0) + (attackerSpirit * 0.5) - defenderDefense));
    } else { // Default Fantasy
        const defenderDefense = getEffectiveStatValue(defenderEffectiveStats, 'Phòng Thủ', 5);
        finalDamage = Math.round(Math.max(1, (attackerAttack * 1.5) - defenderDefense));
    }
    
    if (isCritical) {
        const attackerCritDamage = getEffectiveStatValue(attackerEffectiveStats, 'Sát thương Chí mạng', 150);
        finalDamage = Math.round(finalDamage * (attackerCritDamage / 100));
    }

    logParts.push(`Gây ${finalDamage} sát thương.`);
    events.push({ id: generateUniqueId('event'), type: isCritical ? 'crit' : 'damage', targetId: defender.id, value: finalDamage });

    let isDefeated = false;
    let defeatedTargetName: string | null = null;
    
    if (!defender.stats) {
        defender.stats = [];
    }
    let healthStatIndex = defender.stats.findIndex((s: Stat) => s.name === STAT_HEALTH);
    
    if (healthStatIndex === -1) {
        logParts.push(`${defender.displayName} không có chỉ số Sinh Lực, đã tự động tạo mới!`);
        defender.stats.push({
            id: generateUniqueId('stat-health-healed'),
            name: STAT_HEALTH,
            value: '100/100',
            category: 'Thuộc tính',
            description: 'Chỉ số sinh mệnh.'
        });
        healthStatIndex = defender.stats.length - 1;
    }
    
    const healthStat = defender.stats[healthStatIndex];
    let current = 100, max = 100;
    
    if (typeof healthStat.value === 'string' && healthStat.value.includes('/')) {
        const parts = healthStat.value.split('/').map(Number);
        if (!isNaN(parts[0]) && !isNaN(parts[1])) {
            [current, max] = parts;
        } else {
            logParts.push(`Chỉ số Sinh Lực của ${defender.displayName} bị lỗi, đã reset!`);
        }
    }
    
    const newHealth = Math.max(0, current - finalDamage);
    isDefeated = newHealth <= 0;
    defeatedTargetName = isDefeated ? defender.name : null;
    
    defender.stats[healthStatIndex] = { ...healthStat, value: `${newHealth}/${max}` };
    
    if (isDefeated && !defender.stats.some(s => s.name === 'Trạng thái Tử vong')) {
        defender.stats.push({
            id: generateUniqueId('status-death'),
            name: 'Trạng thái Tử vong',
            description: `Bị đánh bại bởi ${attacker.displayName}.`,
            category: 'Trạng thái',
            isPermanent: true,
        });
    }
    
    const newDefender = { ...defender }; 
    
    if (newState.character.id === defender.id) {
        newState.character = newDefender;
    } else {
        newState.knowledgeBase.npcs = newState.knowledgeBase.npcs.map((npc: Character) => 
            npc.id === defender.id ? newDefender : npc
        );
    }
    
    const logEntry = logParts.join(' ');
    
    if (defeatedTargetName) {
        const questUpdateResult = checkQuestProgress({ type: 'defeat', targetName: defeatedTargetName }, newState);
        questMessages = questUpdateResult.messages;
    }

    return { nextState: newState, logEntry, defeatedTarget: defeatedTargetName, events, questMessages };
};