/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import type { Stat } from '../../../types';
import { SKILL_TAGS, ELEMENTAL_TAGS } from '../../tagConstants';

export const SKILL_LIBRARY_FANTASY_COMMON: Record<string, Omit<Stat, 'id'>> = {
    'Chữa Trị Nhẹ': {
        name: 'Chữa Trị Nhẹ',
        description: 'Hồi phục một lượng nhỏ Sinh Lực cho mục tiêu.',
        category: 'Kỹ Năng',
        tags: [SKILL_TAGS.TYPE.ACTIVE, SKILL_TAGS.FUNCTIONALITY.HEALING, SKILL_TAGS.TARGETING.SINGLE_TARGET],
        skillTier: 'F',
        skillCost: [{ resource: 'Mana', amount: 15 }],
        scaling: [{ statName: 'Trí tuệ', ratio: 1.2, effectType: 'heal', baseValue: 25 }]
    },
};

export const SKILL_LIBRARY_FANTASY_MAGE: Record<string, Omit<Stat, 'id'>> = {
    'Quả Cầu Lửa': {
        name: 'Quả Cầu Lửa',
        description: 'Tạo ra một quả cầu lửa tấn công mục tiêu, gây sát thương Hỏa.',
        category: 'Kỹ Năng',
        tags: [SKILL_TAGS.TYPE.ACTIVE, SKILL_TAGS.FUNCTIONALITY.ATTACK, SKILL_TAGS.TARGETING.SINGLE_TARGET, ELEMENTAL_TAGS.FIVE_ELEMENTS.FIRE],
        skillTier: 'D',
        skillCost: [{ resource: 'Mana', amount: 10 }],
        scaling: [{ statName: 'Trí tuệ', ratio: 1.5, effectType: 'damage', baseValue: 30 }]
    },
    'Khiên Phép': {
        name: 'Khiên Phép',
        description: 'Tạo ra một lá chắn ma thuật tạm thời giúp hấp thụ sát thương.',
        category: 'Kỹ Năng',
        tags: [SKILL_TAGS.TYPE.ACTIVE, SKILL_TAGS.FUNCTIONALITY.DEFENSE, SKILL_TAGS.TARGETING.SELF],
        skillTier: 'D',
        skillCost: [{ resource: 'Mana', amount: 20 }],
        effects: [{ targetStat: 'Giảm Sát Thương', modifier: '+20%' }],
        durationMinutes: 5,
    },
};

export const SKILL_LIBRARY_FANTASY_WARRIOR: Record<string, Omit<Stat, 'id'>> = {
    'Tấn Công Mạnh': {
        name: 'Tấn Công Mạnh',
        description: 'Một đòn tấn công vật lý mạnh mẽ, gây thêm sát thương nhưng giảm nhẹ độ chính xác.',
        category: 'Kỹ Năng',
        tags: [SKILL_TAGS.TYPE.ACTIVE, SKILL_TAGS.FUNCTIONALITY.ATTACK, SKILL_TAGS.TARGETING.SINGLE_TARGET],
        skillTier: 'D',
        skillCost: [{ resource: 'Thể Lực', amount: 15 }],
        scaling: [{ statName: 'Sức mạnh', ratio: 2.0, effectType: 'damage', baseValue: 10 }]
    },
    'Vào Thế Thủ': {
        name: 'Vào Thế Thủ',
        description: 'Vào thế phòng thủ, tăng cường khả năng chống chịu nhưng hy sinh sức tấn công trong lượt tiếp theo.',
        category: 'Kỹ Năng',
        tags: [SKILL_TAGS.TYPE.ACTIVE, SKILL_TAGS.FUNCTIONALITY.DEFENSE, SKILL_TAGS.TARGETING.SELF],
        skillTier: 'D',
        skillCost: [{ resource: 'Thể Lực', amount: 10 }],
        effects: [{ targetStat: 'Phòng Thủ', modifier: '+50%' }],
        durationMinutes: 1, // 1 turn
    },
};

export const SKILL_LIBRARY_FANTASY_ROGUE: Record<string, Omit<Stat, 'id'>> = {
    'Tấn Công Lén Lút': {
        name: 'Tấn Công Lén Lút',
        description: 'Một đòn tấn công bất ngờ từ trong bóng tối, có tỷ lệ chí mạng rất cao.',
        category: 'Kỹ Năng',
        tags: [SKILL_TAGS.TYPE.ACTIVE, SKILL_TAGS.FUNCTIONALITY.ATTACK, SKILL_TAGS.TARGETING.SINGLE_TARGET],
        skillTier: 'C',
        skillCost: [{ resource: 'Thể Lực', amount: 20 }],
        scaling: [{ statName: 'Nhanh nhẹn', ratio: 1.8, effectType: 'damage', baseValue: 15 }],
        effects: [{ targetStat: 'Tỷ lệ Chí mạng', modifier: '+50%' }]
    },
    'Né Tránh': {
        name: 'Né Tránh',
        description: 'Tăng mạnh khả năng né tránh các đòn tấn công vật lý trong một thời gian ngắn.',
        category: 'Kỹ Năng',
        tags: [SKILL_TAGS.TYPE.ACTIVE, SKILL_TAGS.FUNCTIONALITY.DEFENSE, SKILL_TAGS.TARGETING.SELF],
        skillTier: 'C',
        skillCost: [{ resource: 'Thể Lực', amount: 15 }],
        effects: [{ targetStat: 'Né Tránh', modifier: '+30%' }],
        durationMinutes: 3, // 3 turns
    },
};
