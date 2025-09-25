/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import type { Stat } from '../../../types';
import { SKILL_TAGS } from '../../tagConstants';

export const SKILL_LIBRARY_MARTIAL_ARTS_COMMON: Record<string, Omit<Stat, 'id'>> = {
    'Khinh Công': {
        name: 'Khinh Công',
        description: 'Kỹ năng di chuyển cơ bản của người trong giang hồ, giúp thân pháp trở nên nhẹ nhàng, linh hoạt hơn.',
        category: 'Kỹ Năng',
        tags: [SKILL_TAGS.TYPE.PASSIVE, SKILL_TAGS.FUNCTIONALITY.MOVEMENT],
        skillTier: 'F',
        effects: [{ targetStat: 'Nhanh nhẹn', modifier: '+5' }]
    },
    'Tọa Vong Công': {
        name: 'Tọa Vong Công',
        description: 'Tâm pháp cơ bản để đả tọa, vận khí, giúp hồi phục nội lực nhanh hơn.',
        category: 'Công Pháp',
        tags: [SKILL_TAGS.TYPE.PASSIVE, SKILL_TAGS.FUNCTIONALITY.RESTORE],
        skillTier: 'F',
    },
};

export const SKILL_LIBRARY_MARTIAL_ARTS_BASIC: Record<string, Omit<Stat, 'id'>> = {
    'La Hán Quyền': {
        name: 'La Hán Quyền',
        description: 'Một bộ quyền pháp cơ bản của Thiếu Lâm, chú trọng sự vững chãi và cương mãnh.',
        category: 'Chiêu Thức',
        tags: [SKILL_TAGS.TYPE.ACTIVE, SKILL_TAGS.FUNCTIONALITY.ATTACK, SKILL_TAGS.TARGETING.SINGLE_TARGET],
        skillTier: 'F',
        skillCost: [{ resource: 'Nội Lực', amount: 10 }],
        scaling: [{ statName: 'Sức mạnh', ratio: 1.2, effectType: 'damage', baseValue: 10 }]
    },
};
