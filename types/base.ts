/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

// Contains the most fundamental types for the application, such as Stat and its direct dependencies,
// to prevent circular dependencies in other type files.

export type EquipmentSlot = 'Mũ' | 'Phụ Kiện Cổ' | 'Áo choàng' | 'Thân trên' | 'Thân ngoài' | 'Thân dưới' | 'Găng Tay' | 'Thắt Lưng' | 'Giày' | 'Nhẫn 1' | 'Nhẫn 2' | 'Tay Phải' | 'Tay Trái' | 'Cổ tay trái' | 'Cổ tay phải' | 'Áo Lót' | 'Phụ kiện khác 2' | 'Túi 1' | 'Túi 2' | 'Không có' | 'Vũ khí' | 'Nhẫn' | 'Phụ kiện khác' | 'Hoa tai' | 'Cổ tay' | 'Túi' | 'Quần Lót' | 'Phụ Kiện chân' | 'Mặt' | 'Tai' | 'Linh Thú';

export interface GameTime {
    year: number;
    month: number;
    day: number;
    hour: number;
    minute: number;
}

// FIX: Define and export the 'PersonalityTrait' interface to resolve dependency issues in other type files.
export interface PersonalityTrait {
    id: string; // e.g., 'trait_cold', 'trait_decisive'
    name: string; // 'Lạnh lùng', 'Quyết đoán'
    description: string; // Mô tả chi tiết về đặc điểm tính cách
    tags: string[]; // e.g., ['negative', 'social', 'logic']
}

export interface StatEffect {
    targetStat: string;
    modifier: string;
    color?: string;
}

export interface SetBonus {
    count: number;
    description: string;
    effects: StatEffect[];
}

export interface RecipeData {
    ingredients: { name: string, quantity: number }[];
    product: string;
    difficulty?: number;
    craftingSkill?: string;
}

export interface SkillScaling {
    statName: string;
    ratio: number;
    effectType: 'damage' | 'heal' | 'duration' | 'chance' | 'mitigation';
    baseValue: number;
}

export interface SkillCost {
    resource: string;
    amount: number;
}

export interface QuestObjective {
    description: string;
    target: string;
    requiredCount: number;
    currentCount: number;
    type: 'defeat' | 'collect' | 'talk' | 'explore';
}

export interface QuestReward {
    description: string;
}

export interface Stat {
    id: string;
    name: string;
    description: string;
    value?: string | number;
    quantity?: number; // NEW: Added for stackable items
    category: 'Thuộc tính' | 'Kỹ Năng' | 'Vật phẩm' | 'Công Pháp' | 'Chiêu Thức' | 'Khí Công' | 'Thuật' | 'Trạng thái' | 'Mối Thù' | 'Sơ Đồ Chế Tạo' | 'Khế Ước' | 'Quan Hệ Gia Đình' | 'Thiện cảm' | 'Mục Tiêu' | 'Ký Ức Cốt Lõi' | 'Tâm Trạng' | 'Nguyên liệu' | 'Nhiệm Vụ' | 'Nghề nghiệp' | 'Trang phục' | 'Tài sản' | 'Trận Pháp' | 'Phép Thuật' | 'Kỹ năng Mềm' | 'Kỹ năng Nghề' | 'Danh Hiệu' | 'Biệt danh';
    slot?: EquipmentSlot | string;
    isDisabled?: boolean;
    tags?: string[];
    quality?: string;
    rarity?: 'Phổ thông' | 'Cao cấp' | 'Hiếm' | 'Sử thi' | 'Huyền thoại';
    price?: number;
    evolutionDescription?: string;
    effects?: StatEffect[];
    isLearned?: boolean;
    recipeData?: RecipeData;
    expirationTime?: GameTime;
    isPermanent?: boolean;
    durationMinutes?: number;
    removalConditions?: string[];
    isEquipped?: boolean;
    setName?: string;
    setBonuses?: SetBonus[];
    inventoryBonus?: number;
    location?: string;
    representsAssetId?: string;
    isPlaceholderFor?: string;
    baseItemName?: string;
    skillCost?: SkillCost[];
    scaling?: SkillScaling[];
    imageUrl?: string;
    objectives?: QuestObjective[];
    rewards?: QuestReward[];
    proficiency?: number;
    masteryLevel?: string;
    masteryThreshold?: number;
    skillTier?: string;
    containerId?: string;
    containerProperties?: {
        capacity: number;
        containedItemIds: string[];
    };
    summonsNpcName?: string;
    source?: string[];
}

export interface CraftingHistoryEntry {
    id: string;
    recipeName: string;
    quantity: number;
    timestamp: GameTime;
    outcome: 'success' | 'failure';
    quality?: string;
    materialsLost?: { name: string, quantity: number }[];
}
