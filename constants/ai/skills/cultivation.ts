/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import type { Stat } from '../../../types';
import { SKILL_TAGS } from '../../tagConstants';

export const SKILL_LIBRARY_CULTIVATION_COMMON: Record<string, Omit<Stat, 'id'>> = {
    'Linh Lực Hộ Thuẫn': {
        name: 'Linh Lực Hộ Thuẫn',
        description: 'Vận chuyển linh lực tạo thành một tấm khiên vô hình bảo vệ bản thân.',
        category: 'Kỹ Năng',
        tags: [SKILL_TAGS.TYPE.ACTIVE, SKILL_TAGS.FUNCTIONALITY.DEFENSE, SKILL_TAGS.TARGETING.SELF],
        skillTier: 'F',
        skillCost: [{ resource: 'Linh Lực', amount: 30 }],
        effects: [{ targetStat: 'Phòng Thủ', modifier: '+20%' }],
        durationMinutes: 5,
    },
};

export const SKILL_LIBRARY_CULTIVATION_FOUNDATION: Record<string, Omit<Stat, 'id'>> = {
    'Dẫn Khí Nhập Thể': {
        name: 'Dẫn Khí Nhập Thể',
        description: 'Công pháp cơ bản nhất để hấp thụ linh khí trời đất, chuyển hóa thành linh lực của bản thân.',
        category: 'Công Pháp',
        tags: [SKILL_TAGS.TYPE.PASSIVE, SKILL_TAGS.FUNCTIONALITY.IMPROVEMENT],
        skillTier: 'F',
    },
    'Ngự Phong Quyết': {
        name: 'Ngự Phong Quyết',
        description: 'Một pháp quyết cơ bản cho phép điều khiển gió để tăng tốc độ di chuyển.',
        category: 'Kỹ Năng',
        tags: [SKILL_TAGS.TYPE.ACTIVE, SKILL_TAGS.FUNCTIONALITY.MOVEMENT, SKILL_TAGS.TARGETING.SELF],
        skillTier: 'F',
        skillCost: [{ resource: 'Linh Lực', amount: 10 }],
        effects: [{ targetStat: 'Nhanh nhẹn', modifier: '+10' }],
        durationMinutes: 10,
    },
};
