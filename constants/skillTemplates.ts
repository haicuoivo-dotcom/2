/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import {
    SKILL_LIBRARY_FANTASY_COMMON,
    SKILL_LIBRARY_FANTASY_MAGE,
    SKILL_LIBRARY_FANTASY_WARRIOR,
    SKILL_LIBRARY_FANTASY_ROGUE,
} from './ai/skills/fantasy';
import {
    SKILL_LIBRARY_CULTIVATION_COMMON,
    SKILL_LIBRARY_CULTIVATION_FOUNDATION,
} from './ai/skills/cultivation';
import {
    SKILL_LIBRARY_MARTIAL_ARTS_COMMON,
    SKILL_LIBRARY_MARTIAL_ARTS_BASIC,
} from './ai/skills/martial-arts';
import type { Stat } from '../types';
import { SKILL_TAGS, CRAFTING_TAGS } from './tagConstants';


export const BASE_SKILL_TEMPLATES: Record<string, Omit<Stat, 'id'>> = {
    // Fantasy
    'Quả Cầu Lửa': SKILL_LIBRARY_FANTASY_MAGE['Quả Cầu Lửa'],
    'Chữa Trị Nhẹ': SKILL_LIBRARY_FANTASY_COMMON['Chữa Trị Nhẹ'],
    'Khiên Phép': SKILL_LIBRARY_FANTASY_MAGE['Khiên Phép'],
    'Tấn Công Mạnh': SKILL_LIBRARY_FANTASY_WARRIOR['Tấn Công Mạnh'],
    'Vào Thế Thủ': SKILL_LIBRARY_FANTASY_WARRIOR['Vào Thế Thủ'],
    'Tấn Công Lén Lút': SKILL_LIBRARY_FANTASY_ROGUE['Tấn Công Lén Lút'],
    'Né Tránh': SKILL_LIBRARY_FANTASY_ROGUE['Né Tránh'],

    // Cultivation
    'Dẫn Khí Nhập Thể': SKILL_LIBRARY_CULTIVATION_FOUNDATION['Dẫn Khí Nhập Thể'],
    'Linh Lực Hộ Thuẫn': SKILL_LIBRARY_CULTIVATION_COMMON['Linh Lực Hộ Thuẫn'],
    'Ngự Phong Quyết': SKILL_LIBRARY_CULTIVATION_FOUNDATION['Ngự Phong Quyết'],

    // Martial Arts
    'La Hán Quyền': SKILL_LIBRARY_MARTIAL_ARTS_BASIC['La Hán Quyền'],
    'Khinh Công': SKILL_LIBRARY_MARTIAL_ARTS_COMMON['Khinh Công'],
    'Tọa Vong Công': SKILL_LIBRARY_MARTIAL_ARTS_COMMON['Tọa Vong Công'],

    // Crafting & Social
    'Chế Dược Sơ Cấp': {
        name: 'Chế Dược Sơ Cấp',
        description: 'Kiến thức cơ bản về dược thảo và cách bào chế thuốc trị thương đơn giản.',
        category: 'Kỹ Năng',
        tags: [CRAFTING_TAGS.PHARMACY, SKILL_TAGS.TYPE.PASSIVE],
        skillTier: 'F',
    },
    'Rèn Đúc Cơ Bản': {
        name: 'Rèn Đúc Cơ Bản',
        description: 'Kiến thức cơ bản về khoáng thạch và cách rèn đúc vũ khí, công cụ đơn giản.',
        category: 'Kỹ Năng',
        tags: [CRAFTING_TAGS.FORGING, SKILL_TAGS.TYPE.PASSIVE],
        skillTier: 'F',
    },
    'Nấu Ăn Sơ Cấp': {
        name: 'Nấu Ăn Sơ Cấp',
        description: 'Có thể chế biến các món ăn đơn giản, giúp hồi phục thể lực.',
        category: 'Kỹ Năng',
        tags: [CRAFTING_TAGS.COOKING, SKILL_TAGS.TYPE.PASSIVE],
        skillTier: 'F',
    },
    'Thương Lượng': {
        name: 'Thương Lượng',
        description: 'Kỹ năng mặc cả, giúp mua vật phẩm với giá tốt hơn và bán với giá cao hơn.',
        category: 'Kỹ Năng',
        tags: [SKILL_TAGS.FUNCTIONALITY.SOFT_SKILL, SKILL_TAGS.FUNCTIONALITY.SOCIAL, SKILL_TAGS.TYPE.PASSIVE],
        skillTier: 'D',
    },
    'Thuyết Phục': {
        name: 'Thuyết Phục',
        description: 'Khả năng dùng lời lẽ để thuyết phục người khác tin hoặc làm theo ý mình.',
        category: 'Kỹ Năng',
        tags: [SKILL_TAGS.FUNCTIONALITY.SOFT_SKILL, SKILL_TAGS.FUNCTIONALITY.SOCIAL, SKILL_TAGS.TYPE.ACTIVE],
        skillTier: 'C',
    },
};

// FIX: Added definitions for synthesized skills to be used by the client-side turn processor.
export const SYNTHESIZED_SKILL_TEMPLATES: Record<string, Omit<Stat, 'id'>> = {
    'Dẫn Khí Nhập Thể Sơ Giai': {
        name: 'Dẫn Khí Nhập Thể Sơ Giai',
        description: 'Bạn đã kết hợp sự hiểu biết về di chuyển và hô hấp để bước đầu cảm nhận linh khí/nội lực, đặt nền móng cho con đường tu luyện.',
        category: 'Công Pháp',
        skillTier: 'D',
        tags: ['bị động'],
        effects: [
            { targetStat: 'Linh Lực Tối đa', modifier: '+20' },
            { targetStat: 'Nội Lực Tối đa', modifier: '+20' }
        ]
    },
    'Võ Thuật Cận Chiến Cơ Bản': {
        name: 'Võ Thuật Cận Chiến Cơ Bản',
        description: 'Kết hợp quyền và cước, các đòn tấn công tay không trở nên hiệu quả hơn.',
        category: 'Kỹ Năng',
        skillTier: 'D',
        tags: ['bị động', 'chiến đấu'],
        effects: [{ targetStat: 'Tấn Công', modifier: '+10%' }]
    },
    'Thuật Hùng Biện': {
        name: 'Thuật Hùng Biện',
        description: 'Kết hợp sự lưu loát và tư duy sắc bén, bạn có thể đưa ra những lập luận đơn giản để thuyết phục người khác.',
        category: 'Kỹ năng Mềm',
        skillTier: 'D',
        tags: ['bị động', 'xã giao']
    },
    'Trực Giác Nhạy Bén': {
        name: 'Trực Giác Nhạy Bén',
        description: 'Kết hợp khả năng quan sát và tìm kiếm, bạn dễ dàng nhận ra những chi tiết mà người khác bỏ qua.',
        category: 'Kỹ Năng',
        skillTier: 'D',
        tags: ['bị động'],
        effects: [{ targetStat: 'May mắn', modifier: '+5' }]
    }
};
