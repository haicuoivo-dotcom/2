/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import type { Stat } from '../types';
import { MISC_TAGS } from './tagConstants';

// This file contains libraries of predefined Stat objects for use by the AI.
// These constants ensure consistency for common statuses, items, and skills.

// =================================================================
// I. TRẠNG THÁI SINH LÝ & TÂM LÝ (PHYSIOLOGICAL & PSYCHOLOGICAL)
// =================================================================
// This library provides predefined Stat objects for various physiological
// and psychological conditions that the AI can apply to characters.
export const PHYSIOLOGICAL_STATUSES: Record<string, Omit<Stat, 'id'>> = {
    // =================================================================
    // A. Trạng thái Sinh tồn & Môi trường (Survival & Environmental)
    // =================================================================
    HYPOTHERMIA: {
        name: 'Hạ Thân Nhiệt',
        description: 'Cơ thể mất nhiệt nhanh chóng do giá lạnh, các cơ bắp trở nên cứng đờ.',
        category: 'Trạng thái',
        tags: ['negative', 'sinh lý', 'môi trường'],
        isPermanent: false,
        effects: [{ targetStat: 'Nhanh nhẹn', modifier: '-20' }, { targetStat: 'Sức mạnh', modifier: '-10' }]
    },
    HEATSTROKE: {
        name: 'Say Nắng',
        description: 'Cơ thể quá nóng, cảm thấy chóng mặt và kiệt sức.',
        category: 'Trạng thái',
        tags: ['negative', 'sinh lý', 'môi trường'],
        isPermanent: false,
        effects: [{ targetStat: 'Thể Lực', modifier: '-25' }, { targetStat: 'Trí tuệ', modifier: '-10' }]
    },
    WET: {
        name: 'Ướt Sũng',
        description: 'Quần áo và cơ thể đều ướt sũng. Có thể bị cảm lạnh nếu thời tiết xấu.',
        category: 'Trạng thái',
        tags: ['neutral', 'môi trường'],
        isPermanent: false, durationMinutes: 120,
        effects: []
    },
    POISONED_ENVIRONMENT: {
        name: 'Trúng Độc Khí',
        description: 'Hít phải khí độc từ môi trường, gây suy nhược cơ thể từ bên trong.',
        category: 'Trạng thái',
        tags: ['negative', 'sinh lý', 'môi trường', 'sát thương theo thời gian'],
        isPermanent: false, durationMinutes: 60,
        effects: [{ targetStat: 'Thể chất', modifier: '-10' }] // Logic mất máu sẽ do combat system xử lý
    },
    IRRADIATED: {
        name: 'Nhiễm Xạ',
        description: 'Cơ thể bị nhiễm phóng xạ, gây suy yếu dần và mất máu theo thời gian.',
        category: 'Trạng thái',
        tags: ['negative', 'sinh lý', 'môi trường', 'sát thương theo thời gian'],
        isPermanent: false, durationMinutes: 1440
    },
    ASPHYXIATING: {
        name: 'Ngạt Thở',
        description: 'Thiếu không khí, sinh lực giảm nhanh chóng.',
        category: 'Trạng thái',
        tags: ['negative', 'sinh lý', 'môi trường'],
        isPermanent: false, durationMinutes: 2
    },

    // =================================================================
    // B. Trạng thái Sức khỏe (Health Statuses)
    // =================================================================
    SICK: {
        name: 'Ốm',
        description: 'Cơ thể suy nhược do bệnh tật.',
        category: 'Trạng thái',
        tags: ['negative', 'sinh lý'],
        isPermanent: false, durationMinutes: 2880,
        effects: [{ targetStat: 'Sức mạnh', modifier: '-10' }, { targetStat: 'Thể chất', modifier: '-10' }]
    },
    FEVERISH: {
        name: 'Sốt Cao',
        description: 'Cơ thể nóng rực, tâm trí mơ màng và mất tập trung.',
        category: 'Trạng thái',
        tags: ['negative', 'sinh lý'],
        isPermanent: false, durationMinutes: 1440, // 1 day
        effects: [{ targetStat: 'Trí tuệ', modifier: '-15' }, { targetStat: 'Tinh thần', modifier: '-15' }, { targetStat: 'Thể Lực', modifier: '-20' }]
    },
    INJURED: {
        name: 'Bị thương',
        description: 'Vết thương gây đau đớn và hạn chế khả năng vận động.',
        category: 'Trạng thái',
        tags: ['negative', 'sinh lý'],
        isPermanent: false,
        effects: [{ targetStat: 'Sinh Lực', modifier: '-20%' }, { targetStat: 'Nhanh nhẹn', modifier: '-15' }]
    },
    ACCIDENT_INJURY: {
        name: 'Bị tai nạn',
        description: 'Bị thương nặng sau một tai nạn bất ngờ. Cần thời gian dài để hồi phục.',
        category: 'Trạng thái',
        tags: ['negative', 'sinh lý'],
        isPermanent: false, durationMinutes: 4320,
        effects: [{ targetStat: 'Sinh Lực', modifier: '-30%' }, { targetStat: 'Sức mạnh', modifier: '-20' }, { targetStat: 'Nhanh nhẹn', modifier: '-25' }]
    },
    CONCUSSION: {
        name: 'Chấn Động Não',
        description: 'Một cú va đập mạnh vào đầu gây choáng váng và lú lẫn.',
        category: 'Trạng thái',
        tags: ['negative', 'sinh lý'],
        isPermanent: false, durationMinutes: 120,
        effects: [{ targetStat: 'Trí tuệ', modifier: '-20' }, { targetStat: 'Tinh thần', modifier: '-15' }]
    },
    BROKEN_BONE_ARM: {
        name: 'Gãy Tay',
        description: 'Một cánh tay bị gãy, gần như không thể sử dụng vũ khí hay làm các công việc phức tạp.',
        category: 'Trạng thái',
        tags: ['negative', 'sinh lý'],
        isPermanent: false, durationMinutes: 10080, // 7 days
        effects: [{ targetStat: 'Sức mạnh', modifier: '-50%' }, { targetStat: 'Tấn Công', modifier: '-30%' }]
    },
    BROKEN_BONE_LEG: {
        name: 'Gãy Chân',
        description: 'Một bên chân bị gãy, việc di chuyển trở nên cực kỳ khó khăn và đau đớn.',
        category: 'Trạng thái',
        tags: ['negative', 'sinh lý'],
        isPermanent: false, durationMinutes: 10080, // 7 days
        effects: [{ targetStat: 'Nhanh nhẹn', modifier: '-70%' }, { targetStat: 'Né Tránh', modifier: '-50%' }]
    },
    INTERNAL_BLEEDING: {
        name: 'Chảy máu nội tạng',
        description: 'Bị thương nặng bên trong, mất máu âm thầm và cực kỳ nguy hiểm.',
        category: 'Trạng thái',
        tags: ['negative', 'sinh lý', 'chiến đấu', 'sát thương theo thời gian'],
        isPermanent: false, durationMinutes: 15,
        effects: [{ targetStat: 'Thể chất', modifier: '-20' }]
    },
    FOOD_POISONING: {
        name: 'Ngộ Độc Thực Phẩm',
        description: 'Ăn phải thứ gì đó không tốt. Bụng quặn đau và cơ thể mất nước.',
        category: 'Trạng thái',
        tags: ['negative', 'sinh lý'],
        isPermanent: false,
        durationMinutes: 720, // 12 hours
        effects: [{ targetStat: 'Thể Lực', modifier: '-30' }, { targetStat: 'Thể chất', modifier: '-15' }]
    },
    INFECTED_WOUND: {
        name: 'Vết Thương Nhiễm Trùng',
        description: 'Vết thương không được xử lý đúng cách đã bị nhiễm trùng, gây sốt và đau nhức.',
        category: 'Trạng thái',
        tags: ['negative', 'sinh lý', 'sát thương theo thời gian'],
        isPermanent: false,
        durationMinutes: 2880, // 2 days
        effects: [{ targetStat: 'Thể chất', modifier: '-20' }]
    },

    // =================================================================
    // C. Trạng thái Chiến đấu (Combat Statuses)
    // =================================================================
    ADRENALINE_RUSH: {
        name: 'Hưng Phấn Adrenaline',
        description: 'Dòng adrenaline chảy trong huyết quản, đẩy các giới hạn của cơ thể lên mức tối đa trong một thời gian ngắn.',
        category: 'Trạng thái',
        tags: ['positive', 'chiến đấu', 'sinh lý'],
        isPermanent: false, durationMinutes: 5, // Lasts for one battle
        effects: [{ targetStat: 'Sức mạnh', modifier: '+15%' }, { targetStat: 'Nhanh nhẹn', modifier: '+15%' }, { targetStat: 'Giảm Sát Thương', modifier: '+10%' }],
        removalConditions: ['Gây ra trạng thái "Mệt mỏi sau Trận chiến" khi hết hạn.']
    },
    POISONED: {
        name: 'Trúng Độc',
        description: 'Nọc độc đang ngấm dần vào cơ thể, gây sát thương liên tục và suy yếu thể chất.',
        category: 'Trạng thái',
        tags: ['negative', 'sinh lý', 'chiến đấu', 'sát thương theo thời gian'],
        isPermanent: false, durationMinutes: 10,
        effects: [{ targetStat: 'Thể chất', modifier: '-10' }]
    },
    BLEEDING: {
        name: 'Xuất Huyết',
        description: 'Mất máu liên tục từ một vết thương hở.',
        category: 'Trạng thái',
        tags: ['negative', 'sinh lý', 'chiến đấu', 'sát thương theo thời gian'],
        isPermanent: false, durationMinutes: 10,
        effects: [] // Damage is handled by combat logic based on the status name
    },
    BURNING: {
        name: 'Bỏng',
        description: 'Lửa thiêu đốt gây sát thương liên tục và làm giảm khả năng kháng Hỏa.',
        category: 'Trạng thái',
        tags: ['negative', 'sinh lý', 'chiến đấu', 'sát thương theo thời gian'],
        isPermanent: false, durationMinutes: 10,
        effects: [{ targetStat: 'Kháng Hỏa', modifier: '-10%' }]
    },
    STUNNED: {
        name: 'Choáng Váng',
        description: 'Bị choáng bởi một đòn tấn công mạnh, tạm thời mất khả năng hành động.',
        category: 'Trạng thái',
        tags: ['negative', 'khống chế', 'chiến đấu'],
        isPermanent: false, durationMinutes: 2, // 2 turns
        effects: []
    },
    FROZEN: {
        name: 'Đóng Băng',
        description: 'Cơ thể bị đóng băng, hoàn toàn không thể di chuyển hay hành động.',
        category: 'Trạng thái',
        tags: ['negative', 'khống chế', 'chiến đấu'],
        isPermanent: false, durationMinutes: 2,
        effects: []
    },
    SILENCED: {
        name: 'Câm Lặng',
        description: 'Bị yểm bùa câm lặng, không thể sử dụng các kỹ năng cần niệm chú hoặc lời nói.',
        category: 'Trạng thái',
        tags: ['negative', 'khống chế', 'chiến đấu'],
        isPermanent: false, durationMinutes: 5,
        effects: []
    },
    BLINDED: {
        name: 'Mù',
        description: 'Tầm nhìn bị suy giảm nghiêm trọng, khiến các đòn tấn công rất dễ trượt.',
        category: 'Trạng thái',
        tags: ['negative', 'khống chế', 'chiến đấu'],
        isPermanent: false, durationMinutes: 5,
        effects: [{ targetStat: 'Tấn Công', modifier: '-50%' }]
    },
    ROOTED: {
        name: 'Bị Trói Chân',
        description: 'Hai chân bị trói buộc bởi ma pháp hoặc dây leo, không thể di chuyển.',
        category: 'Trạng thái',
        tags: ['negative', 'khống chế', 'chiến đấu'],
        isPermanent: false, durationMinutes: 4,
        effects: []
    },
    GUARDED: {
        name: 'Phòng Thủ Cẩn Mật',
        description: 'Vào thế phòng thủ, tăng cường khả năng chống chịu nhưng hy sinh sức tấn công.',
        category: 'Trạng thái',
        tags: ['positive', 'chiến đấu', 'phòng thủ'],
        isPermanent: false, durationMinutes: 2,
        effects: [{ targetStat: 'Phòng Thủ', modifier: '+30%' }, { targetStat: 'Tấn Công', modifier: '-30%' }]
    },
    FOCUSED: {
        name: 'Tập Trung Cao Độ',
        description: 'Tâm trí hoàn toàn tập trung vào trận chiến, giúp các đòn tấn công trở nên hiểm hóc hơn.',
        category: 'Trạng thái',
        tags: ['positive', 'chiến đấu', 'buff'],
        isPermanent: false, durationMinutes: 5,
        effects: [{ targetStat: 'Tỷ lệ Chí mạng', modifier: '+15%' }]
    },
    ARMOR_BROKEN: {
        name: 'Phá Giáp',
        description: 'Giáp bị phá vỡ hoặc xuyên thủng, khiến khả năng phòng thủ giảm mạnh.',
        category: 'Trạng thái',
        tags: ['negative', 'chiến đấu', 'debuff'],
        isPermanent: false, durationMinutes: 10,
        effects: [{ targetStat: 'Phòng Thủ', modifier: '-30%' }]
    },
    SHIELD_SHATTERED: {
        name: 'Khiên Chắn Vỡ',
        description: 'Lá chắn phòng thủ đã bị phá vỡ, không còn tác dụng.',
        category: 'Trạng thái',
        tags: ['negative', 'chiến đấu', 'debuff'],
        isPermanent: false, durationMinutes: 5,
        effects: [{ targetStat: 'Giảm Sát Thương', modifier: '-100%' }]
    },
    ETHEREAL: {
        name: 'Hư Thể',
        description: 'Cơ thể trở nên hư ảo, tạm thời miễn nhiễm với các đòn tấn công vật lý.',
        category: 'Trạng thái',
        tags: ['positive', 'chiến đấu', 'phòng thủ'],
        isPermanent: false, durationMinutes: 2,
        effects: [] // Logic handled by combat system
    },
    POST_BATTLE_FATIGUE: {
        name: 'Mệt mỏi sau Trận chiến',
        description: 'Kiệt sức sau một trận chiến căng thẳng.',
        category: 'Trạng thái',
        tags: ['negative', 'sinh lý'],
        isPermanent: false, durationMinutes: 60,
        effects: [{ targetStat: 'Sức mạnh', modifier: '-10%' }, { targetStat: 'Nhanh nhẹn', modifier: '-10%' }]
    },
    TAUNTED: {
        name: 'Khiêu Khích',
        description: 'Bị khiêu khích, buộc phải tấn công kẻ đã khiêu khích mình.',
        category: 'Trạng thái',
        tags: ['negative', 'chiến đấu', 'khống chế'],
        isPermanent: false, durationMinutes: 3,
        effects: [] // Logic handled by combat system
    },
    COUNTER_STANCE: {
        name: 'Phản Đòn',
        description: 'Vào thế phản đòn, sẽ tự động phản công lại đòn tấn công cận chiến tiếp theo.',
        category: 'Trạng thái',
        tags: ['positive', 'chiến đấu', 'phòng thủ'],
        isPermanent: false, durationMinutes: 2,
        effects: [] // Logic handled by combat system
    },
    CONTROL_IMMUNITY: {
        name: 'Miễn Nhiễm Khống Chế',
        description: 'Tâm trí kiên định hoặc được thần linh bảo hộ, miễn nhiễm với các hiệu ứng khống chế.',
        category: 'Trạng thái',
        tags: ['positive', 'chiến đấu', 'buff'],
        isPermanent: false, durationMinutes: 10,
        effects: []
    },
    REGENERATION: {
        name: 'Tái Tạo',
        description: 'Cơ thể đang tự chữa lành, hồi phục một lượng nhỏ Sinh Lực mỗi lượt.',
        category: 'Trạng thái',
        tags: ['positive', 'chiến đấu', 'hồi máu theo thời gian'],
        isPermanent: false, durationMinutes: 10
    },
    CONFUSED: {
        name: 'Hỗn Loạn',
        description: 'Tâm trí hỗn loạn, có thể tấn công nhầm cả đồng đội.',
        category: 'Trạng thái',
        tags: ['negative', 'khống chế', 'chiến đấu'],
        isPermanent: false, durationMinutes: 3
    },
    CURSED_WOUND: {
        name: 'Vết Thương Bị Nguyền',
        description: 'Vết thương bị yểm bùa, không thể được chữa lành bằng các phương pháp thông thường.',
        category: 'Trạng thái',
        tags: ['negative', 'chiến đấu', 'debuff'],
        isPermanent: false, durationMinutes: 15
    },
    HASTE: {
        name: 'Tăng Tốc',
        description: 'Tốc độ được tăng cường, cho phép hành động nhanh hơn.',
        category: 'Trạng thái',
        tags: ['positive', 'chiến đấu', 'buff'],
        isPermanent: false, durationMinutes: 5,
        effects: [{ targetStat: 'Tốc Độ', modifier: '+30%' }]
    },
    EMPOWERED: {
        name: 'Được Cường Hóa',
        description: 'Sức mạnh được tăng cường tạm thời.',
        category: 'Trạng thái',
        tags: ['positive', 'chiến đấu', 'buff'],
        isPermanent: false, durationMinutes: 5,
        effects: [{ targetStat: 'Tấn Công', modifier: '+20%' }]
    },
    WEAKENED: {
        name: 'Suy Yếu',
        description: 'Cơ thể bị suy yếu, nhận thêm sát thương từ mọi nguồn.',
        category: 'Trạng thái',
        tags: ['negative', 'chiến đấu', 'debuff'],
        isPermanent: false, durationMinutes: 5,
        effects: [{ targetStat: 'Giảm Sát Thương', modifier: '-20%' }]
    },
    UNSTOPPABLE: {
        name: 'Không Thể Cản Phá',
        description: 'Trạng thái ý chí mãnh liệt hoặc được sức mạnh thần bí bảo vệ, miễn nhiễm với các hiệu ứng khống chế trong một thời gian ngắn.',
        category: 'Trạng thái',
        tags: ['positive', 'chiến đấu', 'buff'],
        isPermanent: false, durationMinutes: 3,
        effects: []
    },
    DISARMED: {
        name: 'Tước Vũ Khí',
        description: 'Vũ khí đã bị đánh rơi hoặc bị vô hiệu hóa, không thể sử dụng các kỹ năng dựa trên vũ khí.',
        category: 'Trạng thái',
        tags: ['negative', 'khống chế', 'chiến đấu'],
        isPermanent: false, durationMinutes: 2,
        effects: []
    },
    MARKED: {
        name: 'Đánh Dấu',
        description: 'Bị đánh dấu, nhận thêm sát thương từ các đòn tấn công tiếp theo.',
        category: 'Trạng thái',
        tags: ['negative', 'chiến đấu', 'debuff'],
        isPermanent: false,
        durationMinutes: 5,
        effects: [] // Logic handled by combat system
    },
    
    // =================================================================
    // D. Trạng thái Tâm lý & Nhận thức (Psychological & Cognitive)
    // =================================================================
    SHOCKED: {
        name: 'Sốc Tâm Lý',
        description: 'Tâm trí trống rỗng sau khi chứng kiến hoặc trải qua một sự kiện kinh hoàng.',
        category: 'Trạng thái',
        tags: ['negative', 'tâm lý'],
        isPermanent: false, durationMinutes: 180, // 3 hours
        effects: [{ targetStat: 'Trí tuệ', modifier: '-20' }, { targetStat: 'Nhanh nhẹn', modifier: '-15' }]
    },
    ELATED: {
        name: 'Hân Hoan',
        description: 'Cảm giác vui sướng và tự tin dâng trào sau một thành công vang dội.',
        category: 'Trạng thái',
        tags: ['positive', 'tâm lý'],
        isPermanent: false, durationMinutes: 180, // 3 hours
        effects: [{ targetStat: 'Tinh thần', modifier: '+20' }, { targetStat: 'May mắn', modifier: '+5' }]
    },
    GRIEVING: {
        name: 'Đau Buồn',
        description: 'Nỗi đau mất mát bao trùm, khiến tinh thần suy sụp và mất đi động lực.',
        category: 'Trạng thái',
        tags: ['negative', 'tâm lý'],
        isPermanent: false, durationMinutes: 4320, // 3 days
        effects: [{ targetStat: 'Tinh thần', modifier: '-40' }, { targetStat: 'Sức mạnh', modifier: '-10' }]
    },
    DEPRESSED: {
        name: 'Trầm Cảm',
        description: 'Nỗi buồn sâu sắc và dai dẳng, mất hứng thú với mọi thứ.',
        category: 'Trạng thái',
        tags: ['negative', 'tâm lý'],
        isPermanent: false, durationMinutes: 20160, // 14 days
        effects: [{ targetStat: 'Tinh thần', modifier: '-50' }, { targetStat: 'Năng lượng Hồi phục', modifier: '-20%' }]
    },
    DESPAIR: {
        name: 'Tuyệt Vọng',
        description: 'Mất hết hy vọng, ý chí chiến đấu và sinh tồn gần như biến mất. Một phiên bản nặng hơn của Đau Buồn.',
        category: 'Trạng thái',
        tags: ['negative', 'tâm lý'],
        isPermanent: false, durationMinutes: 10080, // 7 days
        effects: [{ targetStat: 'Tinh thần', modifier: '-80' }, { targetStat: 'Sức mạnh', modifier: '-30' }, { targetStat: 'Phòng Thủ', modifier: '-30%' }, { targetStat: 'Năng lượng Hồi phục', modifier: '-50%' }]
    },
    GRIEF_STRICKEN: {
        name: 'Đau Khổ Tột Cùng',
        description: 'Nỗi đau mất mát quá lớn khiến tinh thần hoàn toàn suy sụp, mất đi mọi ý chí.',
        category: 'Trạng thái',
        tags: ['negative', 'tâm lý'],
        isPermanent: false,
        durationMinutes: 10080, // 7 days
        effects: [{ targetStat: 'Tinh thần', modifier: '-60' }, { targetStat: 'Sức mạnh', modifier: '-20' }, { targetStat: 'Năng lượng Hồi phục', modifier: '-30%' }]
    },
    ENRAGED: {
        name: 'Tức Giận',
        description: 'Cơn thịnh nộ bùng lên, tăng cường sức mạnh nhưng làm mất đi sự tỉnh táo.',
        category: 'Trạng thái',
        tags: ['negative', 'tâm lý', 'chiến đấu'],
        isPermanent: false, durationMinutes: 30,
        effects: [{ targetStat: 'Tấn Công', modifier: '+20%' }, { targetStat: 'Phòng Thủ', modifier: '-15%' }, { targetStat: 'Trí tuệ', modifier: '-10' }]
    },
    TERRIFIED: {
        name: 'Khiếp Sợ',
        description: 'Nỗi sợ hãi tột độ làm tê liệt ý chí và cơ thể.',
        category: 'Trạng thái',
        tags: ['negative', 'tâm lý'],
        isPermanent: false, durationMinutes: 15,
        effects: [{ targetStat: 'Tấn Công', modifier: '-25%' }, { targetStat: 'Nhanh nhẹn', modifier: '-20' }, { targetStat: 'Tinh thần', modifier: '-30' }]
    },
    CONFIDENT: {
        name: 'Tự Tin',
        description: 'Cảm thấy tự tin vào bản thân, giúp các tương tác xã hội trở nên dễ dàng hơn.',
        category: 'Trạng thái',
        tags: ['positive', 'tâm lý', 'xã giao'],
        isPermanent: false, durationMinutes: 240,
        effects: [{ targetStat: 'Tinh thần', modifier: '+10' }]
    },
    DETERMINED: {
        name: 'Quyết Tâm',
        description: 'Ý chí sắt đá, tăng khả năng kháng lại các hiệu ứng tâm lý.',
        category: 'Trạng thái',
        tags: ['positive', 'tâm lý'],
        isPermanent: false, durationMinutes: 60,
        effects: [{ targetStat: 'Tinh thần', modifier: '+25' }]
    },
    INSPIRED: {
        name: 'Cảm Hứng',
        description: 'Trí óc trở nên minh mẫn và sáng tạo một cách lạ thường.',
        category: 'Trạng thái',
        tags: ['positive', 'tâm lý'],
        isPermanent: false, durationMinutes: 180,
        effects: [{ targetStat: 'Trí tuệ', modifier: '+15' }]
    },
    CREATIVE_FLOW: {
        name: 'Sáng tạo',
        description: 'Tâm trí tràn đầy những ý tưởng mới mẻ, tăng hiệu quả trong các hoạt động chế tác và nghệ thuật.',
        category: 'Trạng thái',
        tags: ['positive', 'tâm lý', 'nhận thức'],
        isPermanent: false, durationMinutes: 240,
        effects: [{ targetStat: 'Tỷ lệ Chế tạo Thành công', modifier: '+15%' }]
    },
    GUILTY: {
        name: 'Mặc Cảm Tội Lỗi',
        description: 'Cảm giác tội lỗi đè nặng lên tâm trí, gây ra sự dằn vặt và suy giảm tinh thần.',
        category: 'Trạng thái',
        tags: ['negative', 'tâm lý'],
        isPermanent: false, durationMinutes: 1440,
        effects: [{ targetStat: 'Tinh thần', modifier: '-20' }]
    },
    NOSTALGIC: {
        name: 'Hoài niệm',
        description: 'Nhớ về quá khứ, tâm trí trở nên mông lung và có chút buồn bã.',
        category: 'Trạng thái',
        tags: ['neutral', 'tâm lý'],
        isPermanent: false, durationMinutes: 120,
        effects: [{ targetStat: 'Tinh thần', modifier: '-5' }]
    },

    // =================================================================
    // E. Trạng thái Tình Yêu & Xã Giao (Love & Social)
    // =================================================================
    IN_LOVE: {
        name: 'Đang Yêu',
        description: 'Trái tim rung động vì một người đặc biệt, mọi quyết định đều có thể bị ảnh hưởng bởi hình bóng của người đó.',
        category: 'Trạng thái',
        tags: ['positive', 'tâm lý', 'xã giao'],
        isPermanent: true
    },
    HEARTBROKEN: {
        name: 'Thất Tình',
        description: 'Trái tim tan vỡ sau một mối tình. Thế giới dường như mất đi màu sắc vốn có.',
        category: 'Trạng thái',
        tags: ['negative', 'tâm lý', 'xã giao'],
        isPermanent: false, durationMinutes: 10080, // 7 days
        effects: [{ targetStat: 'Tinh thần', modifier: '-30' }]
    },
    LUSTFUL: {
        name: 'Dục Vọng',
        description: 'Bị chi phối bởi ham muốn thể xác, có thể dẫn đến những hành động bốc đồng.',
        category: 'Trạng thái',
        tags: ['neutral', 'tâm lý', 'sinh lý'],
        isPermanent: false, durationMinutes: 120,
        effects: [{ targetStat: 'Tinh thần', modifier: '-10' }, { targetStat: 'Nhan sắc', modifier: '+5' }]
    },
    EMBARRASSED: {
        name: 'Ngượng Ngùng',
        description: 'Cảm thấy xấu hổ và bối rối, khó có thể đối mặt với người khác một cách tự nhiên.',
        category: 'Trạng thái',
        tags: ['negative', 'tâm lý', 'xã giao'],
        isPermanent: false, durationMinutes: 60,
        effects: [{ targetStat: 'Tinh thần', modifier: '-5' }]
    },
    CHARMED: {
        name: 'Bị Mê Hoặc',
        description: 'Tâm trí bị điều khiển bởi ma thuật quyến rũ, tạm thời coi người khác là đồng minh thân cận nhất.',
        category: 'Trạng thái',
        tags: ['negative', 'tâm lý', 'khống chế', 'xã giao'],
        isPermanent: false, durationMinutes: 10,
        effects: []
    },
    MANIPULATED: {
        name: 'Bị Thao Túng',
        description: 'Suy nghĩ và hành động bị ảnh hưởng bởi một thế lực bên ngoài mà không hề hay biết.',
        category: 'Trạng thái',
        tags: ['negative', 'tâm lý', 'xã giao'],
        isPermanent: false, durationMinutes: 2880,
        effects: [{ targetStat: 'Trí tuệ', modifier: '-10' }]
    },
    REVENGEFUL: {
        name: 'Báo Thù',
        description: 'Bị ám ảnh bởi ý định trả thù một kẻ địch cụ thể. Gây thêm sát thương lên mục tiêu đó.',
        category: 'Trạng thái',
        tags: ['neutral', 'tâm lý', 'chiến đấu'],
        isPermanent: true,
        effects: []
    },
    OSTRACIZED: {
        name: 'Bị Tẩy Chay',
        description: 'Bị cộng đồng xa lánh, các tương tác xã hội trở nên cực kỳ khó khăn.',
        category: 'Trạng thái',
        tags: ['negative', 'xã giao'],
        isPermanent: true,
        effects: [{ targetStat: 'Thiện cảm', modifier: '-30' }]
    },

    // =================================================================
    // F. Trạng thái Ma thuật & Đặc biệt (Magic & Special)
    // =================================================================
    DRUNK: {
        name: 'Say Rượu',
        description: 'Thế giới quay cuồng. Cảm thấy dũng cảm hơn nhưng hành động lại vụng về.',
        category: 'Trạng thái',
        tags: ['negative', 'sinh lý'],
        isPermanent: false, durationMinutes: 120,
        effects: [{ targetStat: 'Nhanh nhẹn', modifier: '-15' }, { targetStat: 'Trí tuệ', modifier: '-15' }, { targetStat: 'Tinh thần', modifier: '+10' }]
    },
    VIRGINITY_LOST: {
        name: 'Vừa mất trinh',
        description: 'Một trải nghiệm thay đổi sâu sắc, mang lại những cảm xúc phức tạp và sự thay đổi trong tâm lý.',
        category: 'Trạng thái',
        tags: ['neutral', 'tâm lý'],
        isPermanent: false, durationMinutes: 1440, // 24 hours
        effects: [{ targetStat: 'Tinh thần', modifier: '-10' }, { targetStat: 'Nhan sắc', modifier: '+5' }]
    },
    SEXUAL_AFTERGLOW: {
        name: 'Khoái Cảm Kéo Dài',
        description: 'Cơ thể và tâm trí vẫn còn lâng lâng trong dư vị của khoái lạc, cảm thấy thư giãn và mãn nguyện.',
        category: 'Trạng thái',
        tags: ['positive', 'tâm lý', 'sinh lý'],
        isPermanent: false, durationMinutes: 240, // 4 hours
        effects: [{ targetStat: 'Tinh thần', modifier: '+15' }, { targetStat: 'Nhan sắc', modifier: '+5' }]
    },
    SELF_SATISFACTION: {
        name: 'Tự Thỏa Mãn',
        description: 'Vừa giải tỏa nhu cầu sinh lý, tâm trí trở nên bình tĩnh và có chút trống rỗng.',
        category: 'Trạng thái',
        tags: ['neutral', 'tâm lý'],
        isPermanent: false, durationMinutes: 60, // 1 hour
        effects: [{ targetStat: 'Tinh thần', modifier: '-5' }]
    },
    TRAUMATIZED_ASSAULT: {
        name: 'Tổn thương Tâm lý (Bị xâm hại)',
        description: 'Một vết sẹo tâm lý sâu sắc sau khi bị xâm hại tình dục. Cảm thấy sợ hãi, ghê tởm và mất niềm tin vào người khác.',
        category: 'Trạng thái',
        tags: ['negative', 'tâm lý', 'sinh lý'],
        isPermanent: false, durationMinutes: 10080, // 7 days
        effects: [{ targetStat: 'Tinh thần', modifier: '-50' }, { targetStat: 'Thể chất', modifier: '-15' }, { targetStat: 'Thiện cảm', modifier: '-20' }]
    },
    PETRIFIED: {
        name: 'Hóa Đá',
        description: 'Cơ thể bị biến thành đá, không thể hành động nhưng phòng thủ tăng vọt.',
        category: 'Trạng thái',
        tags: ['negative', 'khống chế', 'ma thuật'],
        isPermanent: false,
        effects: [{ targetStat: 'Phòng Thủ', modifier: '+200%' }]
    },
    BLESSED: {
        name: 'Được Ban Phước',
        description: 'Nhận được sự ưu ái của thần linh, mọi chỉ số đều được tăng cường.',
        category: 'Trạng thái',
        tags: ['positive', 'ma thuật', 'buff'],
        isPermanent: false, durationMinutes: 1440, // 1 day
        effects: [
            { targetStat: 'Sức mạnh', modifier: '+10' },
            { targetStat: 'Nhanh nhẹn', modifier: '+10' },
            { targetStat: 'Thể chất', modifier: '+10' },
            { targetStat: 'Trí tuệ', modifier: '+10' },
            { targetStat: 'Tinh thần', modifier: '+10' }
        ]
    },
    CURSED: {
        name: 'Bị Nguyền Rủa',
        description: 'Bị một lời nguyền hắc ám đeo bám, vận rủi và sự suy yếu luôn cận kề.',
        category: 'Trạng thái',
        tags: ['negative', 'ma thuật', 'debuff', MISC_TAGS.UNMERGEABLE],
        isPermanent: true,
        effects: [{ targetStat: 'May mắn', modifier: '-20' }, { targetStat: 'Thể chất', modifier: '-10' }]
    },
    WEREWOLF_TRANSFORMATION: {
        name: 'Hóa Sói',
        description: 'Biến thành một người sói hung tợn, tăng mạnh sức mạnh và tốc độ nhưng mất đi lý trí.',
        category: 'Trạng thái',
        tags: ['neutral', 'ma thuật', 'biến hình'],
        isPermanent: false, durationMinutes: 30,
        effects: [{ targetStat: 'Sức mạnh', modifier: '+50%' }, { targetStat: 'Nhanh nhẹn', modifier: '+30%' }, { targetStat: 'Trí tuệ', modifier: '-50%' }]
    },
    POSSESSED: {
        name: 'Bị Chiếm Đoạt Thân Thể',
        description: 'Một thực thể khác đang kiểm soát cơ thể này.',
        category: 'Trạng thái',
        tags: ['negative', 'ma thuật', 'khống chế'],
        isPermanent: false,
        effects: []
    },
    POLYMORPHED: {
        name: 'Bị Biến Hình',
        description: 'Bị biến thành một sinh vật yếu ớt (ví dụ: con cừu), không thể chiến đấu.',
        category: 'Trạng thái',
        tags: ['negative', 'khống chế', 'ma thuật'],
        isPermanent: false, durationMinutes: 3
    },
    INVISIBLE: {
        name: 'Tàng Hình',
        description: 'Trở nên vô hình với mắt thường.',
        category: 'Trạng thái',
        tags: ['positive', 'ma thuật', 'buff'],
        isPermanent: false, durationMinutes: 10
    },
    MAGIC_SHIELD: {
        name: 'Khiên Phép',
        description: 'Một lá chắn ma thuật hấp thụ một lượng sát thương phép nhất định.',
        category: 'Trạng thái',
        tags: ['positive', 'ma thuật', 'phòng thủ'],
        isPermanent: false, durationMinutes: 5
    },
    ENLIGHTENMENT_STATE: {
        name: 'Ngộ Đạo',
        description: 'Trong một khoảnh khắc lĩnh ngộ, tốc độ học hỏi và thấu hiểu các quy tắc của trời đất tăng vọt.',
        category: 'Trạng thái',
        tags: ['positive', 'tu tiên', 'buff'],
        isPermanent: false, durationMinutes: 60,
        effects: [{ targetStat: 'Ngộ Tính', modifier: '+100' }]
    },
    MAGIC_FATIGUE: {
        name: 'Suy nhược ma thuật',
        description: 'Sử dụng quá nhiều ma thuật khiến tinh thần và thể chất mệt mỏi, giảm hiệu quả của các phép thuật tiếp theo.',
        category: 'Trạng thái',
        tags: ['negative', 'ma thuật', 'debuff'],
        isPermanent: false, durationMinutes: 60,
        effects: [{ targetStat: 'Sát thương Phép', modifier: '-15%' }, { targetStat: 'Năng lượng Hồi phục', modifier: '-10%' }]
    },

    // =================================================================
    // G. Trạng thái Lén lút & Âm mưu (Stealth & Intrigue)
    // =================================================================
    HIDDEN_IN_SHADOWS: {
        name: 'Ẩn Thân Trong Bóng Tối',
        description: 'Hòa mình vào bóng tối, khiến kẻ địch khó phát hiện. Đòn tấn công tiếp theo sẽ gây thêm sát thương chí mạng.',
        category: 'Trạng thái',
        tags: ['positive', 'chiến đấu', 'lén lút'],
        isPermanent: false,
        durationMinutes: 5,
        effects: [{ targetStat: 'Sát thương Chí mạng', modifier: '+50%' }]
    },
    MARKED_FOR_DEATH: {
        name: 'Dấu Ấn Tử Thần',
        description: 'Bị đánh dấu bởi một sát thủ, mọi đòn tấn công từ kẻ địch có kỹ năng ám sát sẽ gây thêm sát thương.',
        category: 'Trạng thái',
        tags: ['negative', 'chiến đấu', 'debuff'],
        isPermanent: false,
        durationMinutes: 15,
        effects: [] // Logic handled by combat system
    },
    POISONED_WEAPON: {
        name: 'Vũ Khí Tẩm Độc',
        description: 'Vũ khí đã được tẩm một loại độc dược mạnh. Đòn tấn công tiếp theo sẽ áp dụng trạng thái "Trúng Độc" lên mục tiêu.',
        category: 'Trạng thái',
        tags: ['positive', 'chiến đấu', 'buff'],
        isPermanent: false,
        durationMinutes: 5,
        effects: []
    },
    DISGUISED: {
        name: 'Cải Trang',
        description: 'Đang ngụy trang thành một người khác. Có thể qua mặt được những người không quen biết.',
        category: 'Trạng thái',
        tags: ['neutral', 'xã giao', 'lén lút'],
        isPermanent: false,
        durationMinutes: 120,
        effects: []
    },
    
    // =================================================================
    // H. Sự kiện Cuộc đời (Life Events)
    // =================================================================
    PREGNANCY_EARLY: {
        name: 'Mang thai (Giai đoạn đầu)',
        description: 'Những thay đổi đầu tiên trong cơ thể, đôi khi cảm thấy mệt mỏi và buồn nôn.',
        category: 'Trạng thái',
        tags: ['neutral', 'sinh lý'],
        isPermanent: true,
        effects: [{ targetStat: 'Thể Lực', modifier: '-10' }]
    },
    PREGNANCY_LATE: {
        name: 'Mang thai (Giai đoạn cuối)',
        description: 'Cơ thể trở nên nặng nề, di chuyển khó khăn hơn nhưng cảm nhận được sự sống đang lớn dần.',
        category: 'Trạng thái',
        tags: ['neutral', 'sinh lý'],
        isPermanent: true,
        effects: [{ targetStat: 'Thể Lực', modifier: '-25' }, { targetStat: 'Nhanh nhẹn', modifier: '-15' }]
    },
    // =================================================================
    // I. Trạng thái Dựa trên Địa vị & Vai trò
    // =================================================================
    WANTED: {
        name: 'Bị truy nã',
        description: 'Bị chính quyền hoặc một thế lực lớn truy nã. Lính gác sẽ tấn công khi nhìn thấy.',
        category: 'Trạng thái',
        tags: ['negative', 'xã giao', 'pháp luật'],
        isPermanent: true
    },
    FACTION_LEADER: {
        name: 'Lãnh đạo Phe phái',
        description: 'Là người đứng đầu một phe phái, có quyền ra lệnh cho các thành viên và chịu trách nhiệm về vận mệnh của phe phái.',
        category: 'Trạng thái',
        tags: ['neutral', 'xã giao', 'danh vọng'],
        isPermanent: true
    },
    SLAVE: {
        name: 'Nô lệ',
        description: 'Mất tự do, là tài sản của một người khác và phải tuân theo mọi mệnh lệnh.',
        category: 'Trạng thái',
        tags: ['negative', 'xã giao', 'pháp luật'],
        isPermanent: true
    },
};


// =================================================================
// II. CÁC HẰNG SỐ KHÁC LIÊN QUAN ĐẾN STAT
// =================================================================

// --- Character Info Tab Constants ---
export const INFO_TAB_INFO_STATS = [
    'Cấp Độ', 'Kinh Nghiệm', 'Cấp bậc', 'Cảnh giới', 'Võ học', 'Danh Vọng', 'Tai tiếng',
    'Chủng tộc', 'Giới tính', 'Tuổi', 'Nhan sắc', 'Chức nghiệp', 'Nghề nghiệp',
];

export const INFO_TAB_COMBAT_STATS = [
    'Sinh Lực', 'Thể Lực', 'Mana', 'Linh Lực', 'Nội Lực', 'Thọ Nguyên',
    'Sức mạnh', 'Nhanh nhẹn', 'Thể chất', 'Trí tuệ', 'Tinh thần', 'Căn Cốt', 'Ngộ Tính', 'Thần Hồn', 'Tấn Công', 'Phòng Thủ', 'Giảm Sát Thương', 'Tốc Độ', 'Né Tránh', 'Đỡ Đòn'
];

export const INFO_TAB_SOCIAL_STATS = [
    'Tâm trạng',
    'Tín ngưỡng'
];

export const INFO_TAB_DESTINY_STATS: string[] = ['Điểm Danh Vọng', 'Điểm Kỹ Năng'];

export const DEFAULT_EQUIPMENT_SLOTS = [
    'Mặt', 'Mũ', 'Phụ Kiện Cổ', 'Áo choàng', 'Thân ngoài', 'Thân trên', 'Thân dưới', 'Găng Tay', 'Thắt Lưng', 'Giày', 'Nhẫn 1', 'Nhẫn 2', 'Tay Phải', 'Tay Trái',
    'Tai', 'Hoa tai', 'Cổ tay trái', 'Cổ tay phải',
    'Phụ kiện khác', 'Túi 1', 'Túi 2', 'Áo Lót', 'Quần Lót', 'Phụ Kiện chân', 'Linh Thú'
];

export const ITEM_SLOT_TYPES = [
    'Không có', // For items that are not equippable
    'Vũ khí',
    'Mặt', 
    'Mũ', 
    'Thân ngoài',
    'Thân trên', 
    'Thân dưới', 
    'Găng Tay', 
    'Giày', 
    'Nhẫn', 
    'Phụ Kiện Cổ', 
    'Thắt Lưng', 
    'Áo choàng',
    'Tai',
    'Hoa tai',
    'Cổ tay',
    'Phụ kiện khác',
    'Túi',
    'Vật phẩm bỏ túi',
    'Áo Lót',
    'Quần Lót',
    'Phụ Kiện chân',
    'Linh Thú'
];

// --- Equipment Logic Constants ---
export const RIGHT_HAND_SLOT = 'Tay Phải';
export const LEFT_HAND_SLOT = 'Tay Trái';

// --- Inventory Classification Constants ---
export const PREDEFINED_QUALITIES = ['Tinh xảo', 'Bền chắc', 'Ma thuật', 'Cổ xưa', 'Bị nguyền rủa'];
export const PREDEFINED_RARITIES = ['Phổ thông', 'Cao cấp', 'Hiếm', 'Sử thi', 'Huyền thoại'];

// --- Data Integrity Constants ---
export const STAT_HEALTH = 'Sinh Lực';

// --- Tooltips for Stats ---
export const STAT_TOOLTIPS: Record<string, string> = {
    'Sinh Lực': 'Đơn vị: Điểm. Thể hiện lượng sát thương mà nhân vật có thể chịu đựng trước khi gục ngã hoặc chết. Khi về 0, nhân vật sẽ rơi vào trạng thái nguy kịch.',
    'Thể Lực': 'Đơn vị: Điểm. Năng lượng dùng cho các hành động vật lý như chạy, vung vũ khí nặng. Cạn kiệt sẽ gây ra trạng thái "Mệt mỏi", giảm hiệu quả chiến đấu.',
    'Mana': 'Đơn vị: Điểm. Năng lượng ma thuật dùng để thi triển phép thuật trong thế giới Fantasy. Càng nhiều Mana, càng dùng được nhiều phép thuật mạnh.',
    'Linh Lực': 'Đơn vị: Điểm. Năng lượng tâm linh trong thế giới Tu Tiên, dùng để thi triển pháp thuật và công pháp. Linh Lực càng dồi dào, tu vi càng cao.',
    'Nội Lực': 'Đơn vị: Điểm. Khí lực bên trong cơ thể trong thế giới Võ Lâm, dùng để thi triển võ công. Nội lực càng thâm hậu, chiêu thức càng uy mãnh.',
    'Nhan sắc': 'Đơn vị: Điểm (trên thang 100). Đánh giá vẻ đẹp ngoại hình. 50 là mức trung bình. Nhan sắc cao có thể mang lại lợi thế trong giao tiếp xã hội, nhưng cũng có thể thu hút những rắc rối không mong muốn.',
    
    // Thuộc tính Gốc (Base Attributes)
    'Sức mạnh': "Thuộc tính Gốc (đơn vị: điểm). Thể hiện sức mạnh cơ bắp. 10 điểm là mức của một người bình thường. Mỗi điểm Sức mạnh sẽ tăng trực tiếp chỉ số phái sinh 'Tấn Công', giúp tăng sát thương vật lý gây ra.",
    'Nhanh nhẹn': "Thuộc tính Gốc (đơn vị: điểm). Thể hiện sự linh hoạt, tốc độ phản xạ. 10 điểm là mức của một người bình thường. Ảnh hưởng đến các chỉ số phái sinh như 'Tốc Độ' (thứ tự hành động) và 'Né Tránh'. Càng cao càng tốt.",
    'Thể chất': "Thuộc tính Gốc (đơn vị: điểm). Thể hiện sức bền và sức sống. 10 điểm là mức của một người bình thường. Ảnh hưởng trực tiếp đến giới hạn Sinh Lực tối đa và khả năng kháng các hiệu ứng vật lý (ví dụ: choáng, đẩy lùi).",
    'Trí tuệ': "Thuộc tính Gốc (đơn vị: điểm). Thể hiện sự thông minh và sức mạnh tinh thần. 10 điểm là mức của một người bình thường. Ảnh hưởng đến sát thương phép thuật, giới hạn Mana/Linh Lực tối đa, và tốc độ học hỏi.",
    'Tinh thần': "Thuộc tính Gốc (đơn vị: điểm). Thể hiện ý chí và khả năng kháng cự tâm linh. 10 điểm là mức của một người bình thường. Ảnh hưởng đến khả năng kháng phép thuật và tốc độ hồi phục Mana/Linh Lực/Nội Lực.",
    'May mắn': "Thuộc tính Gốc (đơn vị: điểm). Ảnh hưởng đến các yếu tố ngẫu nhiên trong game. 10 là mức trung bình. Giá trị cao mang lại may mắn (tăng nhẹ tỷ lệ thành công, cơ hội tìm vật phẩm hiếm), trong khi giá trị âm có thể mang lại xui xẻo (dễ gặp sự kiện bất lợi, giảm tỷ lệ thành công).",
    'Căn Cốt': 'Thuộc tính Gốc (đơn vị: điểm, Tu Tiên/Võ Lâm). Thể hiện tư chất bẩm sinh của cơ thể. 10 điểm là tư chất trung bình. Ảnh hưởng đến tốc độ tu luyện, sức mạnh thể chất tiềm năng và giới hạn Sinh Lực tối đa. Càng cao càng tốt.',
    'Ngộ Tính': 'Thuộc tính Gốc (đơn vị: điểm, Tu Tiên/Võ Lâm). Thể hiện khả năng lĩnh ngộ công pháp, võ học và kỹ năng mới. 10 điểm là mức trung bình. Ngộ Tính càng cao, tốc độ học kỹ năng mới và đột phá cảnh giới càng nhanh.',
    'Thần Hồn': 'Thuộc tính Gốc (đơn vị: điểm, Tu Tiên). Thể hiện sức mạnh của linh hồn và ý chí. 10 điểm là mức của một người bình thường. Thần Hồn mạnh giúp tăng khả năng kháng lại các đòn tấn công tâm linh, ảo ảnh và tâm ma khi đột phá.',

    // Chỉ số Phái sinh (Derived Stats)
    'Tấn Công': "Chỉ số Phái sinh. Thể hiện tổng sát thương cơ bản bạn gây ra. Trong bối cảnh Fantasy/Võ lâm/Tu tiên, nó được tính từ các thuộc tính gốc. Trong bối cảnh Hiện đại, nó được quyết định chủ yếu bởi vũ khí đang trang bị.",
    'Phòng Thủ': "Chỉ số Phái sinh. Thể hiện khả năng giảm trừ sát thương vật lý nhận vào. Chỉ số này ít hiệu quả trong bối cảnh Hiện đại, nơi 'Giảm Sát Thương' quan trọng hơn.",
    'Giảm Sát Thương': "Chỉ số Phái sinh (đơn vị: %). Giảm trừ một phần trăm sát thương nhận vào từ mọi nguồn sau khi đã tính toán Phòng Thủ. Đây là chỉ số phòng thủ chính trong bối cảnh Hiện đại (áo chống đạn).",
    'Tốc Độ': "Chỉ số Phái sinh (đơn vị: điểm). Xác định thứ tự hành động trong chiến đấu theo lượt và ảnh hưởng đến độ chính xác. Được tính toán dựa trên 'Nhanh nhẹn'.",
    'Né Tránh': "Chỉ số Phái sinh (đơn vị: %). Thể hiện phần trăm cơ hội né tránh hoàn toàn một đòn tấn công vật lý. Ví dụ: 5 điểm tương đương 5% cơ hội né đòn. Được tính toán dựa trên 'Nhanh nhẹn'.",
    'Đỡ Đòn': 'Chỉ số Phái sinh (đơn vị: %). Thể hiện phần trăm cơ hội dùng vũ khí hoặc khiên để giảm một lượng lớn sát thương từ đòn tấn công. Ví dụ: 10 điểm tương đương 10% cơ hội đỡ đòn.',
};

// --- Rank Constants for Cheats ---
export const TU_TIEN_RANKS = [
    'Luyện Khí Kỳ - Tầng 1', 'Luyện Khí Kỳ - Tầng 2', 'Luyện Khí Kỳ - Tầng 3', 'Luyện Khí Kỳ - Tầng 4', 'Luyện Khí Kỳ - Tầng 5', 'Luyện Khí Kỳ - Tầng 6', 'Luyện Khí Kỳ - Tầng 7', 'Luyện Khí Kỳ - Tầng 8', 'Luyện Khí Kỳ - Tầng 9', 'Luyện Khí Kỳ - Bình Cảnh',
    'Trúc Cơ Kỳ - Tầng 1', 'Trúc Cơ Kỳ - Tầng 2', 'Trúc Cơ Kỳ - Tầng 3', 'Trúc Cơ Kỳ - Tầng 4', 'Trúc Cơ Kỳ - Tầng 5', 'Trúc Cơ Kỳ - Tầng 6', 'Trúc Cơ Kỳ - Tầng 7', 'Trúc Cơ Kỳ - Tầng 8', 'Trúc Cơ Kỳ - Tầng 9', 'Trúc Cơ Kỳ - Bình Cảnh',
    'Kim Đan Kỳ - Tầng 1', 'Kim Đan Kỳ - Tầng 2', 'Kim Đan Kỳ - Tầng 3', 'Kim Đan Kỳ - Tầng 4', 'Kim Đan Kỳ - Tầng 5', 'Kim Đan Kỳ - Tầng 6', 'Kim Đan Kỳ - Tầng 7', 'Kim Đan Kỳ - Tầng 8', 'Kim Đan Kỳ - Tầng 9', 'Kim Đan Kỳ - Bình Cảnh',
    'Nguyên Anh Kỳ - Tầng 1', 'Nguyên Anh Kỳ - Tầng 2', 'Nguyên Anh Kỳ - Tầng 3', 'Nguyên Anh Kỳ - Tầng 4', 'Nguyên Anh Kỳ - Tầng 5', 'Nguyên Anh Kỳ - Tầng 6', 'Nguyên Anh Kỳ - Tầng 7', 'Nguyên Anh Kỳ - Tầng 8', 'Nguyên Anh Kỳ - Tầng 9', 'Nguyên Anh Kỳ - Bình Cảnh',
    'Hóa Thần Kỳ - Tầng 1', 'Hóa Thần Kỳ - Tầng 2', 'Hóa Thần Kỳ - Tầng 3', 'Hóa Thần Kỳ - Tầng 4', 'Hóa Thần Kỳ - Tầng 5', 'Hóa Thần Kỳ - Tầng 6', 'Hóa Thần Kỳ - Tầng 7', 'Hóa Thần Kỳ - Tầng 8', 'Hóa Thần Kỳ - Tầng 9', 'Hóa Thần Kỳ - Bình Cảnh',
    'Luyện Hư Kỳ - Tầng 1', 'Luyện Hư Kỳ - Tầng 2', 'Luyện Hư Kỳ - Tầng 3', 'Luyện Hư Kỳ - Tầng 4', 'Luyện Hư Kỳ - Tầng 5', 'Luyện Hư Kỳ - Tầng 6', 'Luyện Hư Kỳ - Tầng 7', 'Luyện Hư Kỳ - Tầng 8', 'Luyện Hư Kỳ - Tầng 9', 'Luyện Hư Kỳ - Bình Cảnh',
    'Hợp Thể Kỳ - Tầng 1', 'Hợp Thể Kỳ - Tầng 2', 'Hợp Thể Kỳ - Tầng 3', 'Hợp Thể Kỳ - Tầng 4', 'Hợp Thể Kỳ - Tầng 5', 'Hợp Thể Kỳ - Tầng 6', 'Hợp Thể Kỳ - Tầng 7', 'Hợp Thể Kỳ - Tầng 8', 'Hợp Thể Kỳ - Tầng 9', 'Hợp Thể Kỳ - Bình Cảnh',
    'Độ Kiếp Kỳ - Tầng 1', 'Độ Kiếp Kỳ - Tầng 2', 'Độ Kiếp Kỳ - Tầng 3', 'Độ Kiếp Kỳ - Tầng 4', 'Độ Kiếp Kỳ - Tầng 5', 'Độ Kiếp Kỳ - Tầng 6', 'Độ Kiếp Kỳ - Tầng 7', 'Độ Kiếp Kỳ - Tầng 8', 'Độ Kiếp Kỳ - Tầng 9', 'Độ Kiếp Kỳ - Bình Cảnh',
    'Đại Thừa Kỳ - Tầng 1', 'Đại Thừa Kỳ - Tầng 2', 'Đại Thừa Kỳ - Tầng 3', 'Đại Thừa Kỳ - Tầng 4', 'Đại Thừa Kỳ - Tầng 5', 'Đại Thừa Kỳ - Tầng 6', 'Đại Thừa Kỳ - Tầng 7', 'Đại Thừa Kỳ - Tầng 8', 'Đại Thừa Kỳ - Tầng 9', 'Đại Thừa Kỳ - Bình Cảnh',
    'Đăng Tiên - Tầng 1', 'Đăng Tiên - Tầng 2', 'Đăng Tiên - Tầng 3', 'Đăng Tiên - Tầng 4', 'Đăng Tiên - Tầng 5', 'Đăng Tiên - Tầng 6', 'Đăng Tiên - Tầng 7', 'Đăng Tiên - Tầng 8', 'Đăng Tiên - Tầng 9', 'Đăng Tiên - Bình Cảnh'
];
export const VO_LAM_RANKS = [
    'Chưa nhập môn', 'Tam lưu', 'Nhị lưu', 'Nhất lưu', 'Cao thủ Hậu Thiên', 'Cao thủ Tiên Thiên', 'Tông Sư', 'Đại Tông Sư'
];
export const FANTASY_ADVENTURER_RANKS = [
    'F (Sắt)', 'E (Đồng)', 'D (Bạc)', 'C (Vàng)', 'B (Bạch kim)', 'A (Mithril)', 'S (Orichalcum)', 'SS (Adamantite)'
];
export const DEFAULT_REPUTATION_RANKS = [
    'Vô danh tiểu tốt', 'Có chút tiếng tăm', 'Nổi danh một vùng', 'Uy danh lừng lẫy', 'Huyền thoại sống'
];

// NEW: Skill Tiers
export const SKILL_TIERS = ['F', 'D', 'C', 'B', 'A', 'S', 'SS', 'SSS'];

// NEW: Constant for realm breakthrough benefits
export const REALM_BREAKTHROUGH_BENEFITS: Record<string, {
    lifespanIncrease: number;
    breakthroughStatus: Omit<Stat, 'id'>;
    newSkill?: Omit<Stat, 'id'>;
}> = {
    'Trúc Cơ Kỳ': {
        lifespanIncrease: 100,
        breakthroughStatus: {
            name: 'Đột Phá Trúc Cơ',
            description: 'Trạng thái nhận được sau khi đột phá thành công Trúc Cơ Kỳ, nền tảng tu vi được củng cố vững chắc.',
            category: 'Trạng thái',
            tags: ['đột phá', 'positive'],
            isPermanent: true,
            effects: [
                { targetStat: 'Căn Cốt', modifier: '+10' },
                { targetStat: 'Ngộ Tính', modifier: '+10' },
                { targetStat: 'Thần Hồn', modifier: '+20' },
                { targetStat: 'Sinh Lực', modifier: '+200' },
                { targetStat: 'Linh Lực', modifier: '+200' },
            ]
        },
        newSkill: {
            name: 'Linh Lực Hộ Thuẫn',
            description: 'Tạo ra một lá chắn bằng linh lực, hấp thụ một lượng sát thương nhất định.',
            category: 'Kỹ Năng',
            tags: ['phòng thủ', 'bị động'],
        }
    },
    'Kim Đan Kỳ': {
        lifespanIncrease: 300,
        breakthroughStatus: {
            name: 'Đột Phá Kim Đan',
            description: 'Trạng thái nhận được sau khi ngưng kết thành công Kim Đan, sức mạnh có sự lột xác về chất.',
            category: 'Trạng thái',
            tags: ['đột phá', 'positive'],
            isPermanent: true,
            effects: [
                { targetStat: 'Căn Cốt', modifier: '+25' },
                { targetStat: 'Ngộ Tính', modifier: '+25' },
                { targetStat: 'Thần Hồn', modifier: '+100' },
                { targetStat: 'Sinh Lực', modifier: '+1000' },
                { targetStat: 'Linh Lực', modifier: '+1000' },
            ]
        },
        newSkill: {
            name: 'Ngự Kiếm Phi Hành',
            description: 'Điều khiển phi kiếm để bay trên không trung với tốc độ cao.',
            category: 'Kỹ Năng',
            tags: ['di chuyển', 'bị động'],
        }
    },
    'Nguyên Anh Kỳ': {
        lifespanIncrease: 1000,
        breakthroughStatus: {
            name: 'Đột Phá Nguyên Anh',
            description: 'Trạng thái nhận được sau khi tu thành Nguyên Anh, thần hồn và linh lực đạt đến một tầm cao mới.',
            category: 'Trạng thái',
            tags: ['đột phá', 'positive'],
            isPermanent: true,
            effects: [
                { targetStat: 'Căn Cốt', modifier: '+50' },
                { targetStat: 'Ngộ Tính', modifier: '+50' },
                { targetStat: 'Thần Hồn', modifier: '+500' },
                { targetStat: 'Sinh Lực', modifier: '+5000' },
                { targetStat: 'Linh Lực', modifier: '+5000' },
            ]
        },
        newSkill: {
            name: 'Nguyên Anh Xuất Khiếu',
            description: 'Nguyên Anh có thể rời khỏi cơ thể, tồn tại độc lập trong một thời gian ngắn và thi triển thần thông.',
            category: 'Kỹ Năng',
            tags: ['chủ động', 'chiến đấu'],
        }
    }
};

// NEW: Stat categories for cheat mode
export const STAT_CATEGORIES = [
    { value: 'Thuộc tính', label: 'Thuộc tính' },
    { value: 'Kỹ Năng', label: 'Kỹ Năng' },
    { value: 'Vật phẩm', label: 'Vật phẩm' },
    { value: 'Trạng thái', label: 'Trạng thái' },
    { value: 'Công Pháp', label: 'Công Pháp' },
    { value: 'Chiêu Thức', label: 'Chiêu Thức' },
    { value: 'Khí Công', label: 'Khí Công' },
    { value: 'Thuật', label: 'Thuật' },
    { value: 'Quan Hệ Gia Đình', label: 'Quan Hệ Gia Đình' },
    { value: 'Thiện cảm', label: 'Thiện cảm' },
    { value: 'Mục Tiêu', label: 'Mục Tiêu' },
    { value: 'Ký Ức Cốt Lõi', label: 'Ký Ức Cốt Lõi' },
];

// NEW: Fame and Infamy Titles
export const FAME_THRESHOLDS: Record<number, Omit<Stat, 'id'>> = {
    100: { name: "Người Mới Nổi", description: "Bạn đã bắt đầu tạo được một chút tiếng vang.", category: "Danh Hiệu", effects: [{ targetStat: 'Thiện cảm', modifier: '+5' }] },
    500: { name: "Anh Hùng Dân Gian", description: "Tên của bạn được người dân truyền tai nhau.", category: "Danh Hiệu", effects: [{ targetStat: 'Thiện cảm', modifier: '+10' }] },
    1500: { name: "Chiến Binh Lừng Lẫy", description: "Danh tiếng của bạn vang xa, được cả đồng minh và kẻ thù công nhận.", category: "Danh Hiệu", effects: [{ targetStat: 'Thiện cảm', modifier: '+15' }] },
    5000: { name: "Huyền Thoại Sống", description: "Hành động của bạn sẽ được ghi vào sử sách.", category: "Danh Hiệu", effects: [{ targetStat: 'Thiện cảm', modifier: '+25' }] },
};

export const INFAMY_THRESHOLDS: Record<number, Omit<Stat, 'id'>> = {
    100: { name: "Kẻ Gây Rối", description: "Bạn được biết đến là một kẻ hay gây chuyện.", category: "Danh Hiệu", effects: [{ targetStat: 'Thiện cảm', modifier: '-5' }] },
    500: { name: "Tội Phạm Khét Tiếng", description: "Luật pháp đang truy lùng bạn.", category: "Danh Hiệu", effects: [{ targetStat: 'Thiện cảm', modifier: '-10' }] },
    1500: { name: "Nỗi Khiếp Sợ Của Kẻ Ác", description: "Tên của bạn khiến cả những tên tội phạm cứng đầu nhất cũng phải run sợ.", category: "Danh Hiệu", effects: [{ targetStat: 'Thiện cảm', modifier: '-15' }] },
    5000: { name: "Ác Ma Tái Thế", description: "Sự hiện diện của bạn gieo rắc kinh hoàng khắp vùng đất.", category: "Danh Hiệu", effects: [{ targetStat: 'Thiện cảm', modifier: '-25' }] },
};

// FIX: Added level property to ranks for getRankInfo utility.
// NEW: Fame and Infamy Ranks
export const FAME_RANKS = [
    { level: 0, threshold: 0, name: 'Vô danh tiểu tốt' },
    { level: 1, threshold: 100, name: 'Người Mới Nổi' },
    { level: 2, threshold: 500, name: 'Anh Hùng Dân Gian' },
    { level: 3, threshold: 1500, name: 'Chiến Binh Lừng Lẫy' },
    { level: 4, threshold: 5000, name: 'Huyền Thoại Sống' },
];

export const INFAMY_RANKS = [
    { level: 0, threshold: 0, name: 'Vô hại' },
    { level: 1, threshold: 100, name: 'Kẻ Gây Rối' },
    { level: 2, threshold: 500, name: 'Tội Phạm Khét Tiếng' },
    { level: 3, threshold: 1500, name: 'Mối Đe dọa' },
    { level: 4, threshold: 5000, name: 'Ác Ma Tái Thế' },
];

// FIX: Exported the missing GENRE_RANK_SYSTEMS constant.
// NEW: Genre-specific rank systems
export const GENRE_RANK_SYSTEMS: Record<string, {
    fame: { level: number, threshold: number, name: string }[],
    infamy: { level: number, threshold: number, name: string }[],
}> = {
    'Tu Tiên': { fame: FAME_RANKS, infamy: INFAMY_RANKS },
    'Võ Lâm': { fame: FAME_RANKS, infamy: INFAMY_RANKS },
    'Dị Giới Fantasy': { fame: FAME_RANKS, infamy: INFAMY_RANKS },
    'Đô Thị Hiện Đại': { fame: FAME_RANKS, infamy: INFAMY_RANKS },
    'Default': { fame: FAME_RANKS, infamy: INFAMY_RANKS }
};

// Map aliases
GENRE_RANK_SYSTEMS['Huyền Huyễn Truyền Thuyết'] = GENRE_RANK_SYSTEMS['Tu Tiên'];
GENRE_RANK_SYSTEMS['Thời Chiến'] = GENRE_RANK_SYSTEMS['Võ Lâm'];
GENRE_RANK_SYSTEMS['Thế Giới Giả Tưởng (Game/Tiểu Thuyết)'] = GENRE_RANK_SYSTEMS['Dị Giới Fantasy'];
GENRE_RANK_SYSTEMS['Đô Thị Hiện Đại 100% bình thường'] = GENRE_RANK_SYSTEMS['Đô Thị Hiện Đại'];
GENRE_RANK_SYSTEMS['Đô Thị Dị Biến'] = GENRE_RANK_SYSTEMS['Đô Thị Hiện Đại'];
GENRE_RANK_SYSTEMS['Hậu Tận Thế'] = GENRE_RANK_SYSTEMS['Đô Thị Hiện Đại'];
GENRE_RANK_SYSTEMS['Trống'] = GENRE_RANK_SYSTEMS['Default'];
GENRE_RANK_SYSTEMS['Đồng nhân'] = GENRE_RANK_SYSTEMS['Default'];