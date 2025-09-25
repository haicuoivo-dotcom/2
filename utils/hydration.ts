/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { INITIAL_WC_FORM_DATA, FACTION_TYPES, GENRE_CORE_STATS, ONE_PIECE_OUTFIT_KEYWORDS } from '../constants/gameConstants';
import { PERSONALITY_TRAITS_LIBRARY } from '../constants/personalityTraits';
import { INFO_TAB_COMBAT_STATS, DEFAULT_EQUIPMENT_SLOTS, STAT_HEALTH } from '../constants/statConstants';
import { generateUniqueId } from './id';
import { stripEntityTags } from './text';
import { getScaleForLocationType } from './map';
import type { GameState, WorldSettings, Character, GameTime, Stat, Memory, MapLocation, Faction, KnowledgeEntity, MarketState, EquipmentSlot, Relationship, PersonalityTrait } from '../types';

export const DEFAULT_MARKET_STATE: MarketState = {};

const MODERN_GENRES_INTERNAL = ['Đô Thị Hiện Đại', 'Đô Thị Hiện Đại 100% bình thường', 'Đô Thị Dị Biến', 'Hậu Tận Thế', 'Thời Chiến'];

export const getRankNameForGenre = (genre: string): string => {
    switch (genre) {
        case 'Tu Tiên':
        case 'Huyền Huyễn Truyền Thuyết':
            return 'Cảnh giới';
        case 'Võ Lâm':
            return 'Võ học';
        case 'Dị Giới Fantasy':
        case 'Thế Giới Giả Tưởng (Game/Tiểu Thuyết)':
            return 'Cấp bậc';
        default:
            return 'Danh Vọng';
    }
};


export const hydrateWorldSettings = (settingsData: Partial<WorldSettings>): WorldSettings => {
    const hydrated = { ...INITIAL_WC_FORM_DATA, ...settingsData };
    hydrated.stats = Array.isArray(hydrated.stats) ? hydrated.stats : [];
    hydrated.loreRules = Array.isArray(hydrated.loreRules) ? hydrated.loreRules : [];
    hydrated.worldLogic = Array.isArray(hydrated.worldLogic) ? hydrated.worldLogic : [];
    hydrated.worldEvents = Array.isArray(hydrated.worldEvents) ? hydrated.worldEvents : [];
    return hydrated;
};

export const DEFAULT_CHARACTER_STRUCTURE: Omit<Character, 'id' | 'name' | 'displayName' | 'personality'> = {
    avatarUrl: undefined,
    schedule: undefined,
    stats: [],
    relationships: [],
    npcType: 'npc' as const,
    equipment: {},
    harem: [],
    tags: [],
    outfits: [],
    physicalAppearance: "Chưa có mô tả ngoại hình.",
    currentOutfit: "Mặc trang phục thông thường.",
    backstory: "Chưa có tiểu sử.",
    personalityAndMannerisms: "Chưa có mô tả.",
};

const generateDefaultOutfitDescription = (char: Partial<Character>, settings: WorldSettings): string => {
    const occupation = (char.stats || []).find(s => s.name === 'Chức nghiệp')?.value as string;
    const species = (char.stats || []).find(s => s.name === 'Chủng tộc')?.value as string;
    const gender = (char.stats || []).find(s => s.name === 'Giới tính')?.value as string;
    const { genre } = settings;

    if (occupation) {
        switch (occupation.toLowerCase()) {
            case 'lính gác':
            case 'binh lính':
                return "Mặc một bộ giáp da đơn giản của lính gác, có huy hiệu của thành phố.";
            case 'nông dân':
                return "Mặc một bộ quần áo vải thô bạc màu của nông dân, lấm lem bùn đất.";
            case 'thương nhân':
                return "Mặc một bộ trang phục gấm vóc, trông có vẻ khá giả.";
            case 'hiệp sĩ':
                return "Khoác trên mình một bộ giáp sắt sáng bóng, thể hiện thân phận hiệp sĩ.";
            case 'pháp sư':
                return "Mặc một chiếc áo choàng dài có mũ trùm đầu, thêu những hoa văn huyền bí.";
            case 'tu sĩ':
            case 'đạo sĩ':
                 return "Mặc một bộ đạo bào màu xanh nhạt, toát lên vẻ thoát tục.";
            case 'thợ rèn':
                return "Mặc một chiếc tạp dề da dày trên bộ quần áo lao động chắc chắn.";
            case 'quý tộc':
                 return "Mặc một bộ y phục lụa là gấm vóc sang trọng, thể hiện địa vị cao quý.";
        }
    }

    if (genre === 'Tu Tiên' || genre === 'Huyền Huyễn Truyền Thuyết') {
        return "Mặc một bộ đạo bào đơn giản của tu sĩ cấp thấp.";
    }
    if (genre === 'Võ Lâm') {
        return "Mặc một bộ kình trang gọn gàng của người trong giang hồ.";
    }
    if (genre === 'Dị Giới Fantasy') {
        if (species && species.toLowerCase().includes('elf')) {
            return "Mặc một bộ trang phục làm từ lá cây và lụa mềm đặc trưng của tộc Elf.";
        }
        if (species && species.toLowerCase().includes('dwarf')) {
            return "Mặc một bộ quần áo lao động bằng da và vải dày, có nhiều túi đựng dụng cụ.";
        }
        return "Mặc một bộ trang phục lữ hành bằng da thuộc.";
    }
    
    // Fallback
    if (gender === 'Nữ') {
        return "Mặc một chiếc váy vải đơn giản.";
    }
    
    return "Mặc một bộ quần áo vải thông thường.";
};

const createDefaultActionProgress = (): Character['actionProgress'] => {
    const defaultAction = { count: 0, level: 0, threshold: 1 };
    return {
        // Physical & Life
        running: { ...defaultAction }, swimming: { ...defaultAction }, climbing: { ...defaultAction },
        jumping: { ...defaultAction }, dodging: { ...defaultAction }, sneaking: { ...defaultAction },
        throwing: { ...defaultAction }, blocking: { ...defaultAction }, typing: { ...defaultAction },
        riding: { ...defaultAction }, driving: { ...defaultAction }, eating: { ...defaultAction },
        sleeping: { ...defaultAction }, travelling: { ...defaultAction },

        // Combat & Tactics
        punching: { ...defaultAction }, kicking: { ...defaultAction }, swordplay: { ...defaultAction },
        archery: { ...defaultAction }, parrying: { ...defaultAction }, spellcasting: { ...defaultAction },
        heavy_weaponry: { ...defaultAction }, light_weaponry: { ...defaultAction },
        wielding_weapon: { ...defaultAction }, reloading: { ...defaultAction },
        use_support_item: { ...defaultAction }, practice_martial_art: { ...defaultAction },
        aiming: { ...defaultAction }, using_tactics: { ...defaultAction }, leading: { ...defaultAction },

        // Interaction & Work
        persuasion: { ...defaultAction }, commanding: { ...defaultAction }, intimidation: { ...defaultAction },
        deception: { ...defaultAction }, bargaining: { ...defaultAction }, comforting: { ...defaultAction },
        flirting: { ...defaultAction }, performing: { ...defaultAction }, interrogating: { ...defaultAction },
        presenting: { ...defaultAction }, teaching: { ...defaultAction }, bartering: { ...defaultAction },
        trading: { ...defaultAction }, intercourse: { ...defaultAction }, negotiating: { ...defaultAction },
        reporting: { ...defaultAction }, managing: { ...defaultAction },

        // Intellectual & Learning
        observation: { ...defaultAction }, looking: { ...defaultAction }, gazing: { ...defaultAction },
        searching: { ...defaultAction }, studying: { ...defaultAction }, learning: { ...defaultAction },
        solving_puzzles: { ...defaultAction }, analyzing: { ...defaultAction }, reading: { ...defaultAction },
        experimenting: { ...defaultAction }, planning: { ...defaultAction },

        // Crafting & Survival
        healing: { ...defaultAction }, cooking: { ...defaultAction }, crafting: { ...defaultAction },
        disarming_traps: { ...defaultAction }, lockpicking: { ...defaultAction }, alchemy: { ...defaultAction },
        smithing: { ...defaultAction }, fishing: { ...defaultAction }, mining: { ...defaultAction },
        herbalism: { ...defaultAction }, farming: { ...defaultAction }, repairing: { ...defaultAction },
        building: { ...defaultAction }, setting_traps: { ...defaultAction },

        // Arts & Creativity
        composing: { ...defaultAction }, singing: { ...defaultAction }, drawing: { ...defaultAction },
        writing: { ...defaultAction }, poetry: { ...defaultAction }, practicing: { ...defaultAction },
    };
};

export const hydrateCharacterData = (characterData: Partial<Character> & { description?: string, goals?: string[], keyMemories?: Memory[], money?: number, relationship?: number, motivation?: string, class?: string, occupation?: string, title?: string }, defaultData: Partial<Character>, worldSettings: WorldSettings, pcName?: string, gameTime?: GameTime): Character => {
    const hydrated: any = { ...DEFAULT_CHARACTER_STRUCTURE, ...defaultData, ...characterData };
    
    if (!Array.isArray(hydrated.stats)) {
        hydrated.stats = [];
    }
    
    // Ensure stable ID
    hydrated.id = hydrated.id || generateUniqueId('char');
    hydrated.tags = Array.isArray(hydrated.tags) ? hydrated.tags : [];
    
    // Backward compatibility from DescriptiveText object to string
    hydrated.physicalAppearance = typeof characterData.physicalAppearance === 'string' ? characterData.physicalAppearance : "Chưa có mô tả ngoại hình.";
    hydrated.currentOutfit = typeof characterData.currentOutfit === 'string' ? characterData.currentOutfit : "Mặc trang phục thông thường.";
    hydrated.backstory = typeof characterData.backstory === 'string' ? characterData.backstory : "Chưa có tiểu sử.";

    // Backwards compatibility for displayName and title
    // 1. Ensure displayName exists, defaulting from name
    hydrated.displayName = hydrated.displayName || hydrated.name || 'Nhân vật không tên';

    // NEW MIGRATION: Convert string-based personality to structured PersonalityTrait[]
    if (typeof hydrated.personality === 'string' && hydrated.personality.trim()) {
        const flatTraitLibrary = Object.values(PERSONALITY_TRAITS_LIBRARY).flat();
        const traitMapByName = new Map(flatTraitLibrary.map(t => [t.name.toLowerCase(), t]));

        const traitNames = hydrated.personality.split(',').map(t => t.trim().toLowerCase());
        const structuredTraits: PersonalityTrait[] = [];
        
        traitNames.forEach(name => {
            const foundTrait = traitMapByName.get(name);
            if (foundTrait) {
                structuredTraits.push(foundTrait);
            }
        });
        hydrated.personality = structuredTraits;
    } else if (!Array.isArray(hydrated.personality)) {
        hydrated.personality = [];
    }


    // New migration for top-level properties -> stats
    const newStats: Stat[] = [];
    
    // Backwards compatibility migration

    // NEW: Normalize species before migration
    if (hydrated.species && worldSettings && worldSettings.genre) {
        const humanCentricGenres = ['Võ Lâm', 'Đô Thị Hiện Đại', 'Đô Thị Hiện Đại 100% bình thường'];
        if (humanCentricGenres.includes(worldSettings.genre)) {
            // If it's a human-centric world, any species like 'Người Trung', 'Human', etc., should be normalized to 'Người'.
            hydrated.species = 'Người';
        }
    }

    // Migrate old skills array
    if (Array.isArray(hydrated.skills)) {
        hydrated.skills.forEach((skill: any) => {
            newStats.push({
                id: skill.id || generateUniqueId('skill-migrated'),
                name: skill.name || 'Không tên',
                description: skill.description || 'Không có mô tả',
                category: 'Kỹ Năng',
                evolutionDescription: skill.evolutionDescription,
            });
        });
        delete hydrated.skills;
    }

    // Migrate old VoLamArts object
    if (hydrated.voLamArts) {
        const voLam = hydrated.voLamArts;
        // The names are now descriptive
        if (voLam.congPhap) newStats.push({ id: generateUniqueId('vla-migrated-cp'), name: voLam.congPhap, description: 'Tâm pháp/nội công cốt lõi.', category: 'Công Pháp' });
        if (voLam.chieuThuc) newStats.push({ id: generateUniqueId('vla-migrated-ct'), name: voLam.chieuThuc, description: 'Các chiêu thức, võ học chính.', category: 'Chiêu Thức' });
        if (voLam.khiCong) newStats.push({ id: generateUniqueId('vla-migrated-kc'), name: voLam.khiCong, description: 'Kỹ năng vận khí đặc biệt.', category: 'Khí Công' });
        if (voLam.thuat) newStats.push({ id: generateUniqueId('vla-migrated-t'), name: voLam.thuat, description: 'Các thuật pháp kỳ môn.', category: 'Thuật' });
        delete hydrated.voLamArts;
    }

    // Migrate old abilities array (pre-stats)
    if (Array.isArray(hydrated.abilities)) {
         hydrated.abilities.forEach((ability: any) => {
            newStats.push({
                id: ability.id || generateUniqueId('ability-migrated'),
                name: ability.name || 'Không tên',
                description: ability.description || 'Không có mô tả',
                value: ability.value,
                category: 'Thuộc tính', // Abilities were always attributes
            });
        });
        delete hydrated.abilities;
    }

    if (hydrated.species) {
        newStats.push({ id: generateUniqueId('migrated-stat'), name: 'Chủng tộc', description: 'Chủng tộc của nhân vật.', category: 'Thuộc tính', value: hydrated.species });
        delete hydrated.species;
    }

    if (hydrated.occupation) {
        newStats.push({ id: generateUniqueId('migrated-stat'), name: 'Chức nghiệp', value: hydrated.occupation, description: 'Chức nghiệp chính của nhân vật.', category: 'Thuộc tính' });
        delete hydrated.occupation;
    }

    // Merge new stats with existing stats, ensuring no duplicates by name for core attributes
    const finalStatsMap = new Map<string, Stat>();
    (hydrated.stats || []).forEach((stat: Stat) => finalStatsMap.set(stat.name, { ...stat, id: stat.id || generateUniqueId('stat') }));
    newStats.forEach(stat => {
        if (!finalStatsMap.has(stat.name)) {
            finalStatsMap.set(stat.name, { ...stat, id: stat.id || generateUniqueId('stat') });
        }
    });

    hydrated.stats = Array.from(finalStatsMap.values());
    
    // Ensure essential stats exist
    const ensureStatExists = (name: string, value: string | number, category: Stat['category'], description: string, tags?: string[]) => {
        if (!hydrated.stats.some((s: Stat) => s.name === name)) {
            hydrated.stats.push({ id: generateUniqueId('stat-ensure'), name, value, category, description, tags });
        }
    };
    
    ensureStatExists('Giới tính', 'Nam', 'Thuộc tính', 'Giới tính của nhân vật.');
    ensureStatExists('Tuổi', 18, 'Thuộc tính', 'Tuổi của nhân vật.');
    ensureStatExists(STAT_HEALTH, '100/100', 'Thuộc tính', 'Điểm sinh mệnh của nhân vật. Khi về 0, nhân vật sẽ rơi vào trạng thái nguy kịch.');
    
    // NEW: Ensure a default, hidden title exists if none is provided.
    const hasTitle = hydrated.stats.some((s: Stat) => s.category === 'Danh Hiệu');
    if (!hasTitle) {
        hydrated.stats.push({
            id: generateUniqueId('stat-ensure-title'),
            name: 'Thường Dân',
            description: 'Một người bình thường, chưa có danh tiếng gì đặc biệt.',
            category: 'Danh Hiệu',
            tags: ['hidden'], // This tag will hide it from display lists.
            isEquipped: true, // It's the default equipped title.
        });
    }

    // NEW: Ensure every character has a resource stat (Mana, Linh Lực, etc.) for combat.
    const resourceStats = ['Mana', 'Linh Lực', 'Nội Lực', 'Thể Lực'];
    const hasResourceStat = hydrated.stats.some((s: Stat) => resourceStats.includes(s.name));
    if (!hasResourceStat) {
        let resourceName = 'Thể Lực';
        let resourceDescription = 'Năng lượng dùng cho các hành động vật lý.';
        switch(worldSettings.genre) {
            case 'Tu Tiên':
            case 'Huyền Huyễn Truyền Thuyết':
                resourceName = 'Linh Lực';
                resourceDescription = 'Năng lượng tâm linh dùng để thi triển pháp thuật.';
                break;
            case 'Võ Lâm':
            case 'Thời Chiến (Trung Hoa/Nhật Bản)':
                resourceName = 'Nội Lực';
                resourceDescription = 'Khí lực bên trong cơ thể dùng để thi triển võ công.';
                break;
            case 'Dị Giới Fantasy':
            case 'Thế Giới Giả Tưởng (Game/Tiểu Thuyết)':
                resourceName = 'Mana';
                resourceDescription = 'Năng lượng ma thuật dùng để thi triển phép thuật.';
                break;
        }
        hydrated.stats.push({
            id: generateUniqueId('stat-resource-healed'),
            name: resourceName,
            value: '100/100',
            category: 'Thuộc tính',
            description: resourceDescription,
        });
    }

    // **NEW**: Birthday hydration for modern settings
    const isModern = MODERN_GENRES_INTERNAL.includes(worldSettings.genre);
    if (isModern && !hydrated.dateOfBirth) {
        const ageStat = hydrated.stats.find((s: Stat) => s.name === 'Tuổi');
        const age = (typeof ageStat?.value === 'number' ? ageStat.value : 18) as number;
        const currentTime = gameTime || { year: 547, month: 1, day: 1, hour: 8, minute: 0 };
        
        hydrated.dateOfBirth = {
            day: Math.floor(Math.random() * 28) + 1,
            month: Math.floor(Math.random() * 12) + 1,
            year: currentTime.year - age,
        };
    }

    // Final check for equipment object
    hydrated.equipment = hydrated.equipment || {};

    // **OVERHAULED**: Clothing Integrity Check & Self-healing (Describe-First Logic)
    const NUDE_KEYWORDS = ['khỏa thân', 'nude', 'trần truồng', 'không mặc gì'];
    const isDescribedAsNude = hydrated.currentOutfit && NUDE_KEYWORDS.some(kw => hydrated.currentOutfit.toLowerCase().includes(kw));

    // Step 1: Ensure a valid, non-generic description if not nude.
    if (!isDescribedAsNude && (!hydrated.currentOutfit || hydrated.currentOutfit.trim() === '' || hydrated.currentOutfit.trim() === 'Mặc trang phục thông thường.')) {
        hydrated.currentOutfit = generateDefaultOutfitDescription(hydrated, worldSettings);
    }
    
    // The new items generated from this process will be added to stats at the end.
    const newItemsToCreate: Stat[] = [];

    if (!isDescribedAsNude) {
        const description = hydrated.currentOutfit || '';
        const lowerDesc = description.toLowerCase();
        
        // Helper to create and equip an item if the slot is empty
        const createAndEquipIfNeeded = (slot: EquipmentSlot, name: string, tags: string[], price: number) => {
            if (!hydrated.equipment[slot]) {
                const itemId = generateUniqueId(`item-hydrated-${slot.toLowerCase().replace(/\s/g, '-')}`);
                const newItem: Stat = {
                    id: itemId, name, description, category: 'Vật phẩm', slot, tags, rarity: 'Phổ thông', price,
                };
                newItemsToCreate.push(newItem);
                hydrated.equipment[slot] = itemId;
            }
        };

        // Step 2: Sync main clothing from description
        const isOnePiece = ONE_PIECE_OUTFIT_KEYWORDS.some(kw => lowerDesc.includes(kw));
        
        // Extract a sensible name from the description
        const cleanDescriptionForName = description.replace(/^(Mặc|Đang mặc|Khoác trên mình|Cô ấy mặc|Anh ấy mặc)\s+(một\s+chiếc\s+|một\s+bộ\s+)?/i, '').trim().split(',')[0];

        if (isOnePiece) {
            createAndEquipIfNeeded('Thân trên', cleanDescriptionForName, ['trang-phục-thường-ngày'], 100);
        } else {
            let topName = 'Áo';
            if (lowerDesc.includes('giáp')) topName = 'Giáp';
            else if (lowerDesc.includes('sơ mi')) topName = 'Áo sơ mi';
            else if (lowerDesc.includes('choàng')) topName = 'Áo choàng';
            
            let bottomName = 'Quần';
            if (lowerDesc.includes('váy')) bottomName = 'Chân váy';

            createAndEquipIfNeeded('Thân trên', topName, ['trang-phục-thường-ngày'], 50);
            createAndEquipIfNeeded('Thân dưới', bottomName, ['trang-phục-thường-ngày'], 50);
        }
        
        // Step 3: Safety Net for essentials (Underwear & Footwear)
        const SWIMSUIT_KEYWORDS = ['swimsuit', 'đồ bơi', 'bikini'];
        const isWearingSwimsuit = SWIMSUIT_KEYWORDS.some(kw => lowerDesc.includes(kw));
        if (!isWearingSwimsuit) {
            createAndEquipIfNeeded('Quần Lót', 'Quần lót', ['nội y'], 15);
            createAndEquipIfNeeded('Áo Lót', 'Áo lót', ['nội y'], 20);
        }

        if (!hydrated.equipment['Giày']) {
            createAndEquipIfNeeded('Giày', 'Giày', [], 40);
        }
    }

    if (newItemsToCreate.length > 0) {
        hydrated.stats.push(...newItemsToCreate);
    }
    
    // NEW: Hydrate expanded micro-action learning system
    // This merges any existing progress from old saves with the new default structure.
    hydrated.isMicroActionLearningEnabled = hydrated.isMicroActionLearningEnabled ?? true;
    
    const defaultActionProgress = createDefaultActionProgress();
    const loadedActionProgress = hydrated.actionProgress || {};
    const finalActionProgress: any = {};
    for (const key in defaultActionProgress) {
        if (Object.prototype.hasOwnProperty.call(defaultActionProgress, key)) {
            const actionKey = key as keyof typeof defaultActionProgress;
            finalActionProgress[actionKey] = {
                ...defaultActionProgress[actionKey],
                ...(loadedActionProgress[actionKey] || {}),
            };
        }
    }
    hydrated.actionProgress = finalActionProgress;

    hydrated.locationId = hydrated.locationId || undefined;

    return hydrated as Character;
};

const DEFAULT_GAME_STATE: Omit<GameState, 'character' | 'knowledgeBase' | 'title' | 'worldSummary'> = {
    saveId: undefined,
    stateVersion: 1,
    turns: [],
    actions: [],
    memories: [],
    history: [],
    timeline: [],
    gameTime: { year: 547, month: 1, day: 1, hour: 8, minute: 0 },
    map: { locations: [], playerPosition: { x: 0, y: 0 }, markers: [] },
    playerFactionId: null,
    totalTokenCount: 0,
    auctionHouse: [],
    isIntercourseScene: false,
    intercourseStep: 0,
    combatState: { isActive: false, opponentIds: [], combatLog: [] },
    auctionState: undefined,
    isPaused: false,
    craftingHistory: [],
    marketState: DEFAULT_MARKET_STATE,
};

const migrateAndBuildRelationships = (allCharacters: Character[]): void => {
    const charMapByName = new Map(allCharacters.map(c => [c.name, c]));
    const charMapById = new Map(allCharacters.map(c => [c.id, c]));

    // Pass 1: Migrate from stats to the new relationships array for each character.
    allCharacters.forEach(char => {
        if (!char.stats) return;

        // Check if migration has already run by looking for the new array
        if (char.relationships && char.relationships.length > 0) return; 

        // If the character doesn't have the old relationship stats, no need to check further.
        const hasOldRelStats = char.stats.some(s => s.category === 'Thiện cảm' || s.category === 'Quan Hệ Gia Đình');
        if (!hasOldRelStats) return;

        char.relationships = char.relationships || [];
        const statsToKeep: Stat[] = [];
        const relationshipsMap = new Map<string, Partial<Relationship>>();

        char.stats.forEach(stat => {
            if (stat.category === 'Thiện cảm' || stat.category === 'Quan Hệ Gia Đình') {
                const targetName = stripEntityTags(stat.name);
                const targetChar = charMapByName.get(targetName);
                if (targetChar) {
                    let rel = relationshipsMap.get(targetChar.id);
                    if (!rel) {
                        rel = { characterId: targetChar.id };
                        relationshipsMap.set(targetChar.id, rel);
                    }
                    if (stat.category === 'Thiện cảm') {
                        rel.affinity = typeof stat.value === 'number' ? stat.value : 0;
                    } else { // Quan Hệ Gia Đình
                        rel.type = typeof stat.value === 'string' ? stat.value : 'Người lạ';
                    }
                } else {
                    console.warn(`[Relationship Migration] Orphaned relationship found for character "${char.name}" with non-existent target "${targetName}". This relationship stat will be discarded.`);
                }
            } else {
                statsToKeep.push(stat);
            }
        });

        relationshipsMap.forEach((rel, charId) => {
            char.relationships!.push({
                characterId: charId,
                affinity: rel.affinity ?? 0,
                type: rel.type ?? 'Người lạ',
                description: `Mối quan hệ với ${charMapById.get(charId)?.displayName}.`
            });
        });

        char.stats = statsToKeep;
    });

    // Pass 2: Ensure all relationships are two-way.
    allCharacters.forEach(charA => {
        (charA.relationships || []).forEach(relA => {
            const charB = charMapById.get(relA.characterId);
            if (charB) {
                charB.relationships = charB.relationships || [];
                let relB = charB.relationships.find(r => r.characterId === charA.id);
                if (!relB) {
                    const reciprocalMap: { [key: string]: string } = {
                        'Cha': charA.stats.find(s => s.name === 'Giới tính')?.value === 'Nam' ? 'Con trai' : 'Con gái',
                        'Mẹ': charA.stats.find(s => s.name === 'Giới tính')?.value === 'Nam' ? 'Con trai' : 'Con gái',
                        'Vợ': 'Chồng', 'Chồng': 'Vợ', 'Anh trai': 'Em trai', 'Chị gái': 'Em gái',
                        'Em trai': 'Anh trai', 'Em gái': 'Chị gái',
                        'Sư phụ': 'Đệ tử', 'Đệ tử': 'Sư phụ'
                    };
                    const reciprocalType = reciprocalMap[relA.type] || relA.type;
                    charB.relationships.push({
                        characterId: charA.id,
                        affinity: relA.affinity,
                        type: reciprocalType,
                        description: `Mối quan hệ với ${charA.displayName}.`
                    });
                }
            }
        });
    });
};

export const hydrateGameState = (gameStateData: Partial<GameState>, worldSettings: WorldSettings): GameState => {
    // 1. Hydrate the player character
    const hydratedCharacter = hydrateCharacterData(
        gameStateData.character || {},
        DEFAULT_CHARACTER_STRUCTURE,
        worldSettings,
        undefined,
        gameStateData.gameTime
    );

    // 2. Hydrate NPCs
    const hydratedNpcs = (gameStateData.knowledgeBase?.npcs || []).map(npcData => 
        hydrateCharacterData(npcData, DEFAULT_CHARACTER_STRUCTURE, worldSettings, hydratedCharacter.name, gameStateData.gameTime)
    );
    
    // 3. Hydrate Factions (NEW)
    const hydratedFactions = (gameStateData.knowledgeBase?.factions || []).map(faction => ({
        ...faction,
        playerReputation: faction.playerReputation ?? 0,
        reputationStatus: faction.reputationStatus ?? 'Trung lập',
    }));


    // 4. Hydrate the rest of the knowledge base
    const hydratedKnowledgeBase = {
        pcs: gameStateData.knowledgeBase?.pcs || [],
        npcs: hydratedNpcs,
        locations: gameStateData.knowledgeBase?.locations || [],
        factions: hydratedFactions,
        worldSkills: gameStateData.knowledgeBase?.worldSkills || [],
    };
    
    // 5. Merge with defaults
    const hydratedGameState: GameState = {
        ...DEFAULT_GAME_STATE,
        ...gameStateData,
        character: hydratedCharacter,
        knowledgeBase: hydratedKnowledgeBase,
        title: gameStateData.title || worldSettings.idea || 'Cuộc phiêu lưu Mới',
        worldSummary: gameStateData.worldSummary || worldSettings.worldSummary || '',
        // Ensure arrays are not undefined
        turns: gameStateData.turns || [],
        actions: gameStateData.actions || [],
        memories: gameStateData.memories || [],
        history: gameStateData.history || [],
        timeline: gameStateData.timeline || [],
        auctionHouse: gameStateData.auctionHouse || [],
        craftingHistory: gameStateData.craftingHistory || [],
        // Ensure objects are not undefined
        gameTime: gameStateData.gameTime || DEFAULT_GAME_STATE.gameTime,
        map: gameStateData.map || DEFAULT_GAME_STATE.map,
        combatState: gameStateData.combatState || DEFAULT_GAME_STATE.combatState,
        marketState: gameStateData.marketState || DEFAULT_GAME_STATE.marketState,
    };
    
    // 6. Run the relationship migration
    migrateAndBuildRelationships([hydratedGameState.character, ...hydratedGameState.knowledgeBase.npcs]);

    return hydratedGameState;
};