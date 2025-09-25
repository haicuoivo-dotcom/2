/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { DEFAULT_WORLD_LOGIC_RULES } from './worldLogic';
import type { WorldSettings, Stat, PersonalityTrait } from '../types';

// Re-export all split constant files to act as a barrel file.
// This minimizes changes needed in other parts of the codebase.
export * from './storyTemplates';
export * from './worldLogic';
export * from './tagConstants';
export * from './uiConstants';
// FIX: Re-add moved constants to resolve import errors.
// export * from './genreConstants';
export * from './skillTemplates';

export const GENRES = [
    'Trống', 'Tu Tiên', 'Huyền Huyễn Truyền Thuyết', 'Võ Lâm', 'Thời Chiến (Trung Hoa/Nhật Bản)',
    'Dị Giới Fantasy', 'Thế Giới Giả Tưởng (Game/Tiểu Thuyết)', 'Đô Thị Hiện Đại',
    'Đô Thị Hiện Đại 100% bình thường', 'Đô Thị Dị Biến', 'Hậu Tận Thế', 'Đồng nhân'
];

export const SETTINGS = [
    'Trống', 'Trung Quốc', 'Nhật Bản', 'Hàn Quốc', 'Fantasy phương Tây',
    'Dị Giới (Đa dạng văn hóa)', 'Tự Do (Do người chơi hoặc AI quyết định)'
];

export const GENRE_SETTING_MAP: Record<string, string[]> = {
    'Trống': SETTINGS,
    'Tu Tiên': ['Trung Quốc', 'Dị Giới (Đa dạng văn hóa)'],
    'Huyền Huyễn Truyền Thuyết': ['Trung Quốc', 'Dị Giới (Đa dạng văn hóa)'],
    'Võ Lâm': ['Trung Quốc'],
    'Thời Chiến (Trung Hoa/Nhật Bản)': ['Trung Quốc', 'Nhật Bản'],
    'Dị Giới Fantasy': ['Fantasy phương Tây', 'Dị Giới (Đa dạng văn hóa)'],
    'Thế Giới Giả Tưởng (Game/Tiểu Thuyết)': ['Nhật Bản', 'Hàn Quốc', 'Fantasy phương Tây', 'Dị Giới (Đa dạng văn hóa)'],
    'Đô Thị Hiện Đại': ['Trung Quốc', 'Nhật Bản', 'Hàn Quốc', 'Tự Do (Do người chơi hoặc AI quyết định)'],
    'Đô Thị Hiện Đại 100% bình thường': ['Trung Quốc', 'Nhật Bản', 'Hàn Quốc', 'Tự Do (Do người chơi hoặc AI quyết định)'],
    'Đô Thị Dị Biến': ['Trung Quốc', 'Nhật Bản', 'Hàn Quốc', 'Tự Do (Do người chơi hoặc AI quyết định)'],
    'Hậu Tận Thế': ['Tự Do (Do người chơi hoặc AI quyết định)'],
    'Đồng nhân': SETTINGS,
};

const STAT_TEMPLATE_DEFAULT: Stat[] = [
    { id: 'attr-hp', name: 'Sinh Lực', value: '100/100', category: 'Thuộc tính', description: 'Điểm sinh mệnh.' },
    { id: 'attr-stamina', name: 'Thể Lực', value: '100/100', category: 'Thuộc tính', description: 'Năng lượng cho hành động vật lý.' },
    { id: 'attr-str', name: 'Sức mạnh', value: 10, category: 'Thuộc tính', description: 'Sức mạnh cơ bắp.' },
    { id: 'attr-agi', name: 'Nhanh nhẹn', value: 10, category: 'Thuộc tính', description: 'Sự linh hoạt, tốc độ.' },
    { id: 'attr-con', name: 'Thể chất', value: 10, category: 'Thuộc tính', description: 'Sức bền, sức sống.' },
    { id: 'attr-int', name: 'Trí tuệ', value: 10, category: 'Thuộc tính', description: 'Sự thông minh, sức mạnh tinh thần.' },
    { id: 'attr-spr', name: 'Tinh thần', value: 10, category: 'Thuộc tính', description: 'Ý chí, kháng cự tâm linh.' },
    { id: 'attr-luck', name: 'May mắn', value: 10, category: 'Thuộc tính', description: 'Ảnh hưởng yếu tố ngẫu nhiên.' },
];

const STAT_TEMPLATE_FANTASY: Stat[] = [
    ...STAT_TEMPLATE_DEFAULT,
    { id: 'attr-mana', name: 'Mana', value: '100/100', category: 'Thuộc tính', description: 'Năng lượng ma thuật.' },
];

const STAT_TEMPLATE_CULTIVATION: Stat[] = [
    { id: 'attr-hp', name: 'Sinh Lực', value: '100/100', category: 'Thuộc tính', description: 'Điểm sinh mệnh.' },
    { id: 'attr-sp', name: 'Linh Lực', value: '100/100', category: 'Thuộc tính', description: 'Năng lượng tu luyện.' },
    { id: 'attr-lifespan', name: 'Thọ Nguyên', value: 100, category: 'Thuộc tính', description: 'Tuổi thọ tối đa.' },
    { id: 'attr-const', name: 'Căn Cốt', value: 10, category: 'Thuộc tính', description: 'Tư chất cơ thể.' },
    { id: 'attr-perc', name: 'Ngộ Tính', value: 10, category: 'Thuộc tính', description: 'Khả năng lĩnh ngộ.' },
    { id: 'attr-soul', name: 'Thần Hồn', value: 10, category: 'Thuộc tính', description: 'Sức mạnh linh hồn.' },
    { id: 'attr-luck', name: 'May mắn', value: 10, category: 'Thuộc tính', description: 'Ảnh hưởng yếu tố ngẫu nhiên.' },
];

const STAT_TEMPLATE_WUXIA: Stat[] = [
    { id: 'attr-hp', name: 'Sinh Lực', value: '100/100', category: 'Thuộc tính', description: 'Điểm sinh mệnh.' },
    { id: 'attr-ip', name: 'Nội Lực', value: '100/100', category: 'Thuộc tính', description: 'Năng lượng võ học.' },
    { id: 'attr-str', name: 'Sức mạnh', value: 10, category: 'Thuộc tính', description: 'Sức mạnh cơ bắp.' },
    { id: 'attr-agi', name: 'Nhanh nhẹn', value: 10, category: 'Thuộc tính', description: 'Sự linh hoạt, tốc độ.' },
    { id: 'attr-luck', name: 'May mắn', value: 10, category: 'Thuộc tính', description: 'Ảnh hưởng yếu tố ngẫu nhiên.' },
];


export const GENRE_CORE_STATS: Record<string, Stat[]> = {
    'Default': STAT_TEMPLATE_DEFAULT,
    'Tu Tiên': STAT_TEMPLATE_CULTIVATION,
    'Huyền Huyễn Truyền Thuyết': STAT_TEMPLATE_CULTIVATION,
    'Võ Lâm': STAT_TEMPLATE_WUXIA,
    'Thời Chiến (Trung Hoa/Nhật Bản)': STAT_TEMPLATE_WUXIA,
    'Dị Giới Fantasy': STAT_TEMPLATE_FANTASY,
    'Thế Giới Giả Tưởng (Game/Tiểu Thuyết)': STAT_TEMPLATE_FANTASY,
    'Đô Thị Hiện Đại': STAT_TEMPLATE_DEFAULT,
    'Đô Thị Hiện Đại 100% bình thường': STAT_TEMPLATE_DEFAULT,
    'Đô Thị Dị Biến': STAT_TEMPLATE_FANTASY,
    'Hậu Tận Thế': STAT_TEMPLATE_DEFAULT,
    'Trống': STAT_TEMPLATE_DEFAULT,
    'Đồng nhân': STAT_TEMPLATE_DEFAULT,
};


export const WC_FORM_DATA_KEY = 'worldCreatorFormData';

export const ONE_PIECE_OUTFIT_KEYWORDS = ['váy', 'đầm', 'áo dài', 'jumpsuit', 'romper', 'bộ đồ liền', 'bộ y phục', 'đạo bào'];

export const GENRE_RELATIONSHIP_MAP: Record<string, Record<string, string[]>> = {
    'Tu Tiên': {
        'Sư đồ & Tông môn': ['Sư tôn', 'Sư phụ', 'Đệ tử', 'Sư huynh', 'Sư tỷ', 'Sư đệ', 'Sư muội', 'Chưởng môn', 'Trưởng lão', 'Đồng môn'],
        'Tình cảm': ['Đạo lữ', 'Tình nhân', 'Song tu bầu bạn'],
        'Gia tộc': ['Lão tổ', 'Tổ phụ', 'Cha', 'Mẹ', 'Huynh đệ', 'Tỷ muội'],
        'Đối địch': ['Kẻ thù', 'Đối thủ tranh đoạt', 'Oan gia'],
        'Khác': ['Người lạ', 'Người quen'],
    },
    'Võ Lâm': {
        'Sư đồ & Môn phái': ['Sư phụ', 'Đệ tử', 'Sư huynh', 'Sư tỷ', 'Sư đệ', 'Sư muội', 'Chưởng môn'],
        'Giang hồ': ['Bằng hữu', 'Huynh đệ kết nghĩa', 'Minh chủ', 'Đồng đạo'],
        'Tình cảm': ['Người trong mộng', 'Người yêu', 'Phu thê'],
        'Đối địch': ['Kẻ thù truyền kiếp', 'Đối thủ không đội trời chung', 'Oan gia'],
        'Gia đình': ['Phụ thân', 'Mẫu thân', 'Anh em', 'Chị em'],
        'Khác': ['Người qua đường', 'Hàng xóm'],
    },
    'Dị Giới Fantasy': {
        'Đội nhóm & Bang hội': ['Đồng đội', 'Đội trưởng', 'Thành viên Guild'],
        'Xã hội & Giao tế': ['Bạn bè', 'Bạn thân', 'Người quen', 'Đối tác kinh doanh'],
        'Cấp bậc & Hoàng gia': ['Vua', 'Nữ hoàng', 'Cấp trên', 'Cấp dưới', 'Vệ sĩ', 'Chủ nhân', 'Người hầu'],
        'Tình cảm': ['Người yêu', 'Hôn thê/Hôn phu', 'Vợ/Chồng', 'Tình nhân'],
        'Gia đình': ['Cha', 'Mẹ', 'Anh trai', 'Chị gái', 'Em trai', 'Em gái'],
        'Đối địch': ['Kẻ thù', 'Đối thủ'],
        'Khác': ['Người lạ'],
    },
    'Đô Thị Hiện Đại': {
        'Gia đình': ['Bố', 'Mẹ', 'Anh trai', 'Chị gái', 'Em trai', 'Em gái', 'Vợ', 'Chồng', 'Con trai', 'Con gái', 'Bố dượng', 'Mẹ kế', 'Anh kế', 'Chị kế'],
        'Tình cảm': ['Bạn trai', 'Bạn gái', 'Người yêu cũ', 'Vợ/Chồng', 'Tình nhân', 'Bạn tình'],
        'Trường học': ['Bạn cùng lớp', 'Thầy/Cô giáo', 'Đàn anh (Senpai)', 'Đàn em (Kouhai)'],
        'Công sở': ['Sếp', 'Đồng nghiệp', 'Cấp dưới', 'Đối tác'],
        'Xã hội': ['Bạn thân', 'Bạn bè', 'Người quen', 'Hàng xóm'],
        'Đối địch': ['Kẻ thù', 'Đối thủ cạnh tranh', 'Tình địch'],
        'Khác': ['Người lạ'],
    },
    'Default': { // Fallback for other genres
        'Gia đình': ['Cha', 'Mẹ', 'Anh trai', 'Chị gái', 'Em trai', 'Em gái', 'Vợ', 'Chồng'],
        'Tình cảm': ['Người yêu', 'Tình nhân'],
        'Xã hội': ['Bạn bè', 'Bạn thân', 'Người quen', 'Đồng nghiệp', 'Hàng xóm'],
        'Đối địch': ['Kẻ thù', 'Đối thủ'],
        'Cấp bậc': ['Sư phụ', 'Đệ tử', 'Cấp trên', 'Cấp dưới'],
    }
};

// Map aliases to base genres
GENRE_RELATIONSHIP_MAP['Huyền Huyễn Truyền Thuyết'] = GENRE_RELATIONSHIP_MAP['Tu Tiên'];
GENRE_RELATIONSHIP_MAP['Thời Chiến (Trung Hoa/Nhật Bản)'] = GENRE_RELATIONSHIP_MAP['Võ Lâm'];
GENRE_RELATIONSHIP_MAP['Thế Giới Giả Tưởng (Game/Tiểu Thuyết)'] = GENRE_RELATIONSHIP_MAP['Dị Giới Fantasy'];
GENRE_RELATIONSHIP_MAP['Đô Thị Hiện Đại 100% bình thường'] = GENRE_RELATIONSHIP_MAP['Đô Thị Hiện Đại'];
GENRE_RELATIONSHIP_MAP['Đô Thị Dị Biến'] = GENRE_RELATIONSHIP_MAP['Đô Thị Hiện Đại'];
GENRE_RELATIONSHIP_MAP['Hậu Tận Thế'] = GENRE_RELATIONSHIP_MAP['Đô Thị Hiện Đại'];
GENRE_RELATIONSHIP_MAP['Trống'] = GENRE_RELATIONSHIP_MAP['Default'];
GENRE_RELATIONSHIP_MAP['Đồng nhân'] = GENRE_RELATIONSHIP_MAP['Default'];

export const FACTION_TYPES = [
    'Quân đội', 'Thành phố', 'Lãnh địa', 'Quốc gia', 'Gia tộc', 'Công ty', 'Tập đoàn', 'Thế giới'
];

export const KNOWLEDGE_BASE_CATEGORIES = {
    npcs: { label: "NPC", key: 'npcs' },
    reputation: { label: "Danh Vọng", key: 'reputation' },
    world_summary: { label: "Thế Giới", key: 'world_summary' },
    world_logic: { label: "Logic Thế Giới", key: 'world_logic' },
    world_events: { label: "Sự Kiện", key: 'world_events' },
    factions: { label: "Phe Phái", key: 'factions' },
    locations: { label: "Địa Điểm", key: 'locations' },
    world_skills: { label: "Kỹ Năng", key: 'world_skills' },
};

export const KB_CATEGORY_ORDER = [
    'npcs',
    'reputation',
    'world_logic',
    'world_summary',
    'world_events',
    'factions',
    'locations',
    'world_skills',
];

export const INITIAL_WC_FORM_DATA: WorldSettings = {
    genre: 'Trống',
    setting: 'Trống',
    idea: '',
    suggestion: '',
    startingScene: 'empty',
    worldTone: 'balanced',
    worldSummary: '',
    name: '',
    // FIX: Removed deprecated 'personalityOuter' property to align with the WorldSettings type.
    personalityTraits: [],
    species: '',
    gender: 'Nam',
    linhCan: '',
    backstory: '',
    stats: [],
    writingStyle: 'default',
    narrativeVoice: 'second',
    difficulty: 'normal',
    allow18Plus: true,
    loreRules: [],
    worldLogic: DEFAULT_WORLD_LOGIC_RULES,
    worldEvents: [],
    initialRelationships: [],
    suggestPowerfulSkills: false,
    equipFullSet: true,
    strictFanficAdherence: true,
};

export const CURRENCY_UNITS = [
    // Tu Tiên / Võ Lâm
    'Linh Thạch', 'Lượng Bạc',
    // Fantasy
    'Đồng Vàng', 'Septim', 'Crowns',
    // Hiện Đại
    'Đô la Mỹ (USD)', 'Euro (€)', 'Yên Nhật (¥)', 'Nhân Dân Tệ (¥)', 'Won Hàn Quốc (₩)', 'Đồng Việt Nam (₫)',
    // Sci-fi / Hậu Tận Thế
    'Tín dụng (Credits)', 'Nắp chai',
    // Tùy chỉnh
    'Tùy chỉnh...',
];