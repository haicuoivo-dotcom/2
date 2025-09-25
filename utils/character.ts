/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { STAT_HEALTH } from '../constants/statConstants';
import { generateUniqueId } from './id';
// FIX: Add MISC_TAGS to imports.
import type { Character, Stat, EffectiveStat, StatEffect, WorldSettings, EntityTooltipData } from '../types';
import { ONE_PIECE_OUTFIT_KEYWORDS, MISC_TAGS } from '../constants/gameConstants';

// A comprehensive map for reciprocal relationships
const RECIPROCAL_RELATIONSHIP_MAP: Record<string, string> = {
    // Family (Vietnamese Modern)
    'Bố': 'Con', 'Mẹ': 'Con', 'Cha': 'Con', 'Phụ thân': 'Con', 'Mẫu thân': 'Con',
    'Vợ': 'Chồng', 'Chồng': 'Vợ', 'Phu thê': 'Phu thê',
    'Anh trai': 'Em', 'Chị gái': 'Em', 'Em trai': 'Anh', 'Em gái': 'Chị',
    'Huynh đệ': 'Huynh đệ', 'Tỷ muội': 'Tỷ muội', 'Anh em': 'Anh em', 'Chị em': 'Chị em',
    // Tu Tien / Vo Lam
    'Sư tôn': 'Đệ tử', 'Sư phụ': 'Đệ tử', 'Đệ tử': 'Sư phụ/Sư tôn',
    'Sư huynh': 'Sư đệ/muội', 'Sư tỷ': 'Sư đệ/muội', 'Sư đệ': 'Sư huynh/tỷ', 'Sư muội': 'Sư huynh/tỷ',
    'Đồng môn': 'Đồng môn', 'Đồng đạo': 'Đồng đạo',
    'Đạo lữ': 'Đạo lữ', 'Song tu bầu bạn': 'Song tu bầu bạn',
    // Social
    'Bạn bè': 'Bạn bè', 'Bạn thân': 'Bạn thân', 'Bằng hữu': 'Bằng hữu', 'Đồng đội': 'Đồng đội', 'Người quen': 'Người quen', 'Người lạ': 'Người lạ',
    'Người yêu': 'Người yêu', 'Tình nhân': 'Tình nhân',
    // Hierarchy
    'Cấp trên': 'Cấp dưới', 'Cấp dưới': 'Cấp trên', 'Sếp': 'Cấp dưới',
    'Chủ nhân': 'Người hầu/Nô lệ', 'Người hầu': 'Chủ nhân', 'Nô lệ': 'Chủ nhân',
    // Hostile
    'Kẻ thù': 'Kẻ thù', 'Đối thủ': 'Đối thủ', 'Oan gia': 'Oan gia',
};

export const getReciprocalRelationshipType = (type: string, targetCharacterGender?: string): string => {
    if (type === 'Con') {
        if (targetCharacterGender === 'Nam') return 'Cha';
        if (targetCharacterGender === 'Nữ') return 'Mẹ';
        return 'Cha/Mẹ';
    }
    if (type === 'Em') {
        if (targetCharacterGender === 'Nam') return 'Anh trai';
        if (targetCharacterGender === 'Nữ') return 'Chị gái';
        return 'Anh/Chị';
    }
     if (type === 'Anh') {
         if (targetCharacterGender === 'Nam') return 'Em trai';
         if (targetCharacterGender === 'Nữ') return 'Em gái';
         return 'Em';
    }
     if (type === 'Chị') {
         if (targetCharacterGender === 'Nam') return 'Em trai';
         if (targetCharacterGender === 'Nữ') return 'Em gái';
         return 'Em';
    }
    // Simplified brother/sister logic for martial arts/cultivation
    if (type.includes('huynh') || type.includes('tỷ')) return 'Sư đệ/muội';
    if (type.includes('đệ') || type.includes('muội')) return 'Sư huynh/tỷ';
    
    return RECIPROCAL_RELATIONSHIP_MAP[type] || type;
};


// FIX: Add missing getRelationshipInfo function.
export const getRelationshipInfo = (score: number): { text: string; color: string } => {
    if (score <= -80) return { text: 'Kẻ Thù Không Đội Trời Chung', color: 'var(--accent-danger)' };
    if (score <= -50) return { text: 'Thù Địch', color: 'var(--accent-danger)' };
    if (score <= -20) return { text: 'Ghét Bỏ', color: 'var(--accent-warning)' };
    if (score < 20) return { text: 'Trung Lập', color: 'var(--text-secondary)' };
    if (score < 50) return { text: 'Thân Thiện', color: 'var(--accent-success)' };
    if (score < 80) return { text: 'Bạn Bè', color: 'var(--accent-success)' };
    return { text: 'Tri Kỷ', color: 'var(--accent-primary)' };
};

export const getStatusStyleClass = (status: Stat): string => {
    const name = status.name.toLowerCase();
    const tags = status.tags || [];

    if (name.includes('độc') || name.includes('chảy máu') || name.includes('suy yếu') || name.includes('giảm') || name.includes('trúng độc') || name.includes('trọng thương') || name.includes('tâm ma')) return 'status-negative';
    if (name.includes('choáng') || name.includes('tê liệt') || name.includes('đóng băng') || name.includes('hóa đá') || name.includes('trói buộc') || name.includes('phong ấn')) return 'status-control';
    if (name.includes('hồi phục') || name.includes('hồi máu') || name.includes('chữa trị')) return 'status-positive';
    if (name.includes('tăng công') || name.includes('tăng sát thương') || name.includes('cuồng nộ') || name.includes('tăng tốc') || name.includes('buff')) return 'status-offensive';
    if (name.includes('tăng thủ') || name.includes('lá chắn') || name.includes('bất tử') || name.includes('phòng ngự') || name.includes('miễn nhiễm')) return 'status-defensive';
    if (tags.includes('positive')) return 'status-positive';
    if (tags.includes('negative')) return 'status-negative';
    return 'status-neutral';
};

export const getStatusEffectType = (status: Stat): 'buff' | 'debuff' | 'neutral' => {
    const styleClass = getStatusStyleClass(status);
    if (styleClass === 'status-negative' || styleClass === 'status-control') return 'debuff';
    if (styleClass === 'status-positive' || styleClass === 'status-offensive' || styleClass === 'status-defensive') return 'buff';
    return 'neutral';
};

export const generateRelationshipDescription = (sourceCharName: string, targetCharName: string, relationshipType: string): string => {
    // Handling complex/reciprocal types first
    if (['Vợ', 'Chồng', 'Phu thê', 'Đạo lữ', 'Song tu bầu bạn'].includes(relationshipType)) {
        return `${sourceCharName} và ${targetCharName} là ${relationshipType.toLowerCase()} của nhau.`;
    }
    if (['Bạn bè', 'Bạn thân', 'Bằng hữu', 'Đồng môn', 'Đồng đội'].includes(relationshipType)) {
        return `${sourceCharName} và ${targetCharName} là ${relationshipType.toLowerCase()}.`;
    }
    if (relationshipType.includes('/')) { // Handles Sư huynh/tỷ etc.
         return `${sourceCharName} có mối quan hệ '${relationshipType}' với ${targetCharName}.`;
    }

    switch (relationshipType) {
        // Family
        case 'Cha':
        case 'Mẹ':
        case 'Phụ thân':
        case 'Mẫu thân':
            return `${sourceCharName} là cha/mẹ của ${targetCharName}.`;
        case 'Con':
            return `${sourceCharName} là con của ${targetCharName}.`;
        case 'Anh trai':
            return `${sourceCharName} là anh trai của ${targetCharName}.`;
        case 'Chị gái':
            return `${sourceCharName} là chị gái của ${targetCharName}.`;
        case 'Em trai':
            return `${sourceCharName} là em trai của ${targetCharName}.`;
        case 'Em gái':
            return `${sourceCharName} là em gái của ${targetCharName}.`;

        // Tu Tien / Vo Lam
        case 'Sư tôn':
        case 'Sư phụ':
            return `${sourceCharName} là sư phụ của ${targetCharName}.`;
        case 'Đệ tử':
            return `${sourceCharName} là đệ tử của ${targetCharName}.`;
        case 'Sư huynh':
            return `${sourceCharName} là sư huynh của ${targetCharName}.`;
        case 'Sư tỷ':
            return `${sourceCharName} là sư tỷ của ${targetCharName}.`;
        case 'Sư đệ':
            return `${sourceCharName} là sư đệ của ${targetCharName}.`;
        case 'Sư muội':
            return `${sourceCharName} là sư muội của ${targetCharName}.`;
        
        // Hostile
        case 'Kẻ thù':
            return `${sourceCharName} coi ${targetCharName} là kẻ thù.`;
        case 'Đối thủ':
             return `${sourceCharName} coi ${targetCharName} là đối thủ cạnh tranh.`;

        // Default
        default:
            return `${sourceCharName} có mối quan hệ '${relationshipType}' với ${targetCharName}.`;
    }
}

export const calculateEffectiveStats = (character: Character): Map<string, EffectiveStat> => {
    const effectiveStats = new Map<string, EffectiveStat>();
    (character.stats || []).forEach(stat => {
        if (stat.category === 'Thuộc tính') {
            effectiveStats.set(stat.name, { baseValue: stat.value ?? 0, modifiedValue: stat.value ?? 0, flatModifier: 0, percentModifier: 0, sources: [] });
        }
    });

    const parseModifier = (modifier: string): { flat: number; percent: number } => {
        const value = parseFloat(modifier.replace('%', ''));
        if (isNaN(value)) return { flat: 0, percent: 0 };
        return modifier.includes('%') ? { flat: 0, percent: value } : { flat: value, percent: 0 };
    };

    const equippedItemIds = new Set(Object.values(character.equipment || {}).filter(Boolean));
    const sources = [
        ...(character.stats || []).filter(s => s.id && equippedItemIds.has(s.id)),
        ...(character.stats || []).filter(s => s.category === 'Trạng thái' && !s.isDisabled),
        ...(character.stats || []).filter(s => ['Cấp Độ', 'Cảnh giới', 'Võ học', 'Cấp bậc', 'Danh Vọng'].includes(s.name)),
        ...(character.stats || []).filter(s => s.category === 'Danh Hiệu' && s.isEquipped),
    ];
    
    sources.forEach(source => {
        if (!source?.effects) return;
        const stackCount = source.category === 'Trạng thái' && typeof source.value === 'number' ? source.value : 1;
        source.effects.forEach(effect => {
            const target = effectiveStats.get(effect.targetStat);
            if (target) {
                const { flat, percent } = parseModifier(effect.modifier);
                target.flatModifier += flat * stackCount;
                target.percentModifier += percent * stackCount;
                if (flat !== 0 || percent !== 0) {
                    target.sources.push(`${source.name}${stackCount > 1 ? ` (x${stackCount})` : ''} (${effect.modifier})`);
                }
            }
        });
    });

    const equippedItems = (character.stats || []).filter(stat => stat.id && equippedItemIds.has(stat.id));
    const equippedSets = new Map<string, Stat[]>();
    equippedItems.forEach(item => {
        if (item.setName) {
            if (!equippedSets.has(item.setName)) equippedSets.set(item.setName, []);
            equippedSets.get(item.setName)!.push(item);
        }
    });

    equippedSets.forEach((items, setName) => {
        const count = items.length;
        const setBonuses = items[0]?.setBonuses || [];
        let activeBonus: { count: number; description: string; effects: StatEffect[] } | null = null;
        for (const bonus of setBonuses) {
            if (count >= bonus.count) activeBonus = bonus;
        }
        if (activeBonus) {
            activeBonus.effects.forEach(effect => {
                const target = effectiveStats.get(effect.targetStat);
                if (target) {
                    const { flat, percent } = parseModifier(effect.modifier);
                    target.flatModifier += flat;
                    target.percentModifier += percent;
                    if (flat !== 0 || percent !== 0) target.sources.push(`Set ${setName} (${activeBonus!.count} món): ${effect.modifier}`);
                }
            });
        }
    });
    
    effectiveStats.forEach(stat => {
        if (stat.flatModifier !== 0 || stat.percentModifier !== 0) {
            const apply = (base: number) => (base + stat.flatModifier) * (1 + stat.percentModifier / 100);
            if (typeof stat.baseValue === 'number') {
                stat.modifiedValue = Math.round(apply(stat.baseValue));
            } else if (typeof stat.baseValue === 'string' && stat.baseValue.includes('/')) {
                const [current, max] = stat.baseValue.split('/').map(Number);
                if (!isNaN(current) && !isNaN(max)) {
                    const newMax = apply(max);
                    const newCurrent = (current === max) ? newMax : Math.min(current, newMax);
                    stat.modifiedValue = `${Math.round(newCurrent)}/${Math.round(newMax)}`;
                }
            } else if (typeof stat.baseValue === 'string' && !isNaN(Number(stat.baseValue))) {
                stat.modifiedValue = String(Math.round(apply(Number(stat.baseValue))));
            }
        }
    });

    return effectiveStats;
};

export const calculatePreviewStats = (character: Character, statusIdToIgnore: string): Map<string, EffectiveStat> => {
    const tempCharacter = JSON.parse(JSON.stringify(character));
    if (tempCharacter.stats) {
        tempCharacter.stats = tempCharacter.stats.map((stat: Stat) => stat.id === statusIdToIgnore ? { ...stat, isDisabled: true } : stat);
    }
    return calculateEffectiveStats(tempCharacter);
};

export const calculateCombatPower = (character: Character): number => {
    const effectiveStats = calculateEffectiveStats(character);
    const getStat = (name: string, def: number = 0) => {
        const val = effectiveStats.get(name)?.modifiedValue;
        if (typeof val === 'number') return val;
        if (typeof val === 'string') {
            const parsed = parseInt(val.split('/')[0], 10);
            return isNaN(parsed) ? def : parsed;
        }
        return def;
    };
    let power = 0;
    power += getStat('Tấn Công', 10) * 2.5;
    power += getStat('Tỷ lệ Chí mạng', 5) * 20;
    power += Math.max(0, getStat('Sát thương Chí mạng', 150) - 150) * 2;
    power += getStat(STAT_HEALTH, 100) * 0.5;
    power += getStat('Phòng Thủ', 5) * 3;
    power += getStat('Né Tránh', 5) * 15;
    power += getStat('Đỡ Đòn', 5) * 12;
    power += getStat('Tốc Độ', 10) * 5;
    const mana = getStat('Mana') || getStat('Linh Lực') || getStat('Nội Lực') || 0;
    power += mana * 0.3;
    return Math.round(power);
};

/**
 * Ensures a character has at least one basic skill.
 * This acts as a self-healing mechanism if the AI fails to generate any skills.
 * @param character The character to check.
 * @param worldSettings The world settings (currently unused, but for future-proofing).
 * @returns The character, potentially with a new basic skill added.
 */
export const ensureCharacterHasSkills = (character: Character, worldSettings: WorldSettings): Character => {
    if (!character || !character.stats) {
        return character;
    }

    const SKILL_CATEGORIES: Stat['category'][] = ['Kỹ Năng', 'Công Pháp', 'Chiêu Thức', 'Khí Công', 'Thuật', 'Phép Thuật'];
    const hasAnySkill = character.stats.some(stat => SKILL_CATEGORIES.includes(stat.category));

    if (hasAnySkill) {
        return character;
    }

    // Character has no skills, add a basic one.
    const newCharacter = JSON.parse(JSON.stringify(character));
    
    const BASIC_ATTACK_SKILL: Omit<Stat, 'id'> = {
        name: 'Tấn công thường',
        description: 'Một đòn tấn công vật lý cơ bản bằng vũ khí hoặc tay không.',
        category: 'Kỹ Năng',
        tags: ['chủ động', 'tấn công', 'đơn mục tiêu'],
        skillTier: 'F',
        scaling: [{
            statName: 'Sức mạnh',
            ratio: 1.0,
            effectType: 'damage',
            baseValue: 5
        }],
        isLearned: true,
    };

    newCharacter.stats.push({
        ...BASIC_ATTACK_SKILL,
        id: generateUniqueId('skill-healed'),
    } as Stat);

    return newCharacter;
};

// FIX: Added the missing function `getCharacterEquipmentStatus` which was causing an import error.
export const getCharacterEquipmentStatus = (character: Character): { status: 'Đầy đủ' | 'Bán khỏa thân' | 'Khỏa thân'; missing: string[] } => {
    const equipment = character.equipment || {};
    const stats = character.stats || [];

    const getItemInSlot = (slot: string) => {
        const itemId = equipment[slot as keyof typeof equipment];
        return itemId ? stats.find(s => s.id === itemId) : undefined;
    };

    const topItem = getItemInSlot('Thân trên');
    const hasTopOuter = !!topItem;
    const hasBottomOuter = !!getItemInSlot('Thân dưới');
    const isOnePiece = topItem ? ONE_PIECE_OUTFIT_KEYWORDS.some(kw => topItem.name.toLowerCase().includes(kw)) : false;

    const isFullyDressed = (hasTopOuter && isOnePiece) || (hasTopOuter && hasBottomOuter);

    if (isFullyDressed) {
        return { status: 'Đầy đủ', missing: [] };
    }

    const hasUnderwearTop = !!getItemInSlot('Áo Lót');
    const hasUnderwearBottom = !!getItemInSlot('Quần Lót');
    
    if (hasUnderwearTop || hasUnderwearBottom) {
        const missing = [];
        if (!hasTopOuter) missing.push('Áo ngoài');
        if (!hasBottomOuter && !isOnePiece) missing.push('Quần ngoài');
        return { status: 'Bán khỏa thân', missing };
    }

    const missing = [];
    if (!hasTopOuter && !hasUnderwearTop) missing.push('Trang phục trên');
    if (!hasBottomOuter && !hasUnderwearBottom && !isOnePiece) missing.push('Trang phục dưới');
    
    return { status: 'Khỏa thân', missing };
};

/**
 * "Prunes" a character's data upon death, removing active gameplay elements
 * while preserving essential identifying and historical information. This is an
 * optimization to reduce save file size and complexity over long playthroughs.
 * @param character The character who has died.
 * @returns A new, slimmed-down character object.
 */
export const pruneCharacterOnDeath = (character: Character): Character => {
    if (!character) return character;

    const NECESSARY_CATEGORIES: Stat['category'][] = [
        'Thuộc tính', 'Danh Hiệu', 'Biệt danh'
    ];

    const statsToKeep = (character.stats || []).filter(stat =>
        NECESSARY_CATEGORIES.includes(stat.category) || stat.name === 'Trạng thái Tử vong'
    );

    // Ensure the death status is present, in case it was missing for some reason.
    if (!statsToKeep.some(s => s.name === 'Trạng thái Tử vong')) {
        statsToKeep.push({
            id: generateUniqueId('status-death-pruned'),
            name: 'Trạng thái Tử vong',
            description: 'Nhân vật này đã qua đời.',
            category: 'Trạng thái',
            isPermanent: true,
        });
    }

    // Create the pruned character object, keeping only essential fields.
    const prunedCharacter: Character = {
        // Essential identifiers
        id: character.id,
        name: character.name,
        displayName: character.displayName,
        npcType: character.npcType,
        
        // Descriptive historical info
        backstory: character.backstory,
        physicalAppearance: character.physicalAppearance,
        personality: character.personality,
        personalityAndMannerisms: character.personalityAndMannerisms,
        avatarUrl: character.avatarUrl,
        tags: character.tags,

        // Pruned/Cleared fields
        stats: statsToKeep,
        equipment: {},
        harem: [],
        schedule: undefined,
        currentOutfit: "Trang phục cuối cùng.",
        outfits: undefined,
        actionProgress: undefined,
        isMicroActionLearningEnabled: false,
    };

    return prunedCharacter;
};

// FIX: Add missing mergePermanentStatuses function.
export const mergePermanentStatuses = (character: Character): { updatedCharacter: Character; mergedCount: number } => {
    if (!character.stats) {
        return { updatedCharacter: character, mergedCount: 0 };
    }

    const newCharacter = JSON.parse(JSON.stringify(character));
    const permanentStatuses = newCharacter.stats.filter((s: Stat) => s.isPermanent && s.category === 'Trạng thái' && !s.tags?.includes(MISC_TAGS.UNMERGEABLE));
    const otherStats = newCharacter.stats.filter((s: Stat) => !s.isPermanent || s.category !== 'Trạng thái' || s.tags?.includes(MISC_TAGS.UNMERGEABLE));

    const mergedStatuses = new Map<string, Stat>();
    let mergedCount = 0;

    permanentStatuses.forEach((status: Stat) => {
        const key = `${status.name}_${JSON.stringify(status.effects)}`; // Key by name and effects
        if (mergedStatuses.has(key)) {
            const existing = mergedStatuses.get(key)!;
            const existingValue = typeof existing.value === 'number' ? existing.value : 1;
            const currentValue = typeof status.value === 'number' ? status.value : 1;
            existing.value = existingValue + currentValue;
            mergedCount++;
        } else {
            mergedStatuses.set(key, { ...status });
        }
    });

    newCharacter.stats = [...otherStats, ...Array.from(mergedStatuses.values())];

    return { updatedCharacter: newCharacter, mergedCount };
};

export const isTrulyNamedMonster = (char: Character): boolean => {
    if (char.npcType !== 'named_monster') {
        return false;
    }
    // Updated logic: Check for multiple synonyms for "Race" in a case-insensitive manner.
    const raceSynonyms = ['chủng tộc', 'loài', 'giống loài', 'tộc'];
    const speciesStat = char.stats?.find(s => raceSynonyms.includes(s.name.toLowerCase()));

    if (!speciesStat || typeof speciesStat.value !== 'string' || !speciesStat.value) {
        // If no species stat is found, we assume it's a truly named monster to avoid display issues.
        return true;
    }
    const species = speciesStat.value.toLowerCase();
    const displayName = (char.displayName || char.name).toLowerCase();
    // A proper name (like "Fenrir") would not typically contain the species name ("Wolf").
    return !displayName.includes(species);
};

export const getRankInfo = (value: number, rankSystem: { level: number, threshold: number, name: string }[]): { name: string; level: number; progress: number; nextThreshold: number } => {
    if (!rankSystem || rankSystem.length === 0) {
        return { name: 'Chưa xác định', level: 0, progress: 0, nextThreshold: 100 };
    }

    for (let i = rankSystem.length - 1; i >= 0; i--) {
        const currentRank = rankSystem[i];
        if (value >= currentRank.threshold) {
            const nextRank = rankSystem[i + 1];
            const nextThreshold = nextRank ? nextRank.threshold : Infinity;
            const progress = nextRank ? ((value - currentRank.threshold) / (nextRank.threshold - currentRank.threshold)) * 100 : 100;

            return {
                name: currentRank.name,
                level: currentRank.level,
                progress: Math.min(100, progress),
                nextThreshold: nextThreshold
            };
        }
    }

    // If value is less than the first threshold
    const firstRank = rankSystem[0];
    return {
        name: 'Chưa có cấp bậc',
        level: 0,
        progress: (value / firstRank.threshold) * 100,
        nextThreshold: firstRank.threshold
    };
};