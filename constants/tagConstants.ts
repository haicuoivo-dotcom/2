/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

// =================================================================
// THƯ VIỆN TAGS TRUNG TÂM
// Mệnh lệnh Tối thượng: Luôn luôn thêm tags vào những nơi cần chúng.
// File này là thư viện trung tâm cho tất cả các tags được sử dụng trong game.
// Việc sử dụng các hằng số từ đây sẽ đảm bảo tính nhất quán và giảm lỗi chính tả.
// Các tags được nhóm theo chức năng để dễ quản lý.
// =================================================================

// -----------------------------------------------------------------
// TAGS KỶ NGUYÊN / CÔNG NGHỆ
// Dùng để kiểm soát logic nào được áp dụng cho thế giới.
// -----------------------------------------------------------------
export const WORLD_ERA = {
  ANCIENT: 'Cổ đại',
  MEDIEVAL: 'Trung cổ',
  MODERN: 'Hiện đại',
  FUTURISTIC: 'Tương lai',
};


// -----------------------------------------------------------------
// TAGS CHO VẬT PHẨM (ITEMS)
// -----------------------------------------------------------------
export const ITEM_TAGS = {
  // Loại trang bị
  EQUIPMENT_TYPE: {
    ONE_HANDED: '1 tay',
    TWO_HANDED: '2 tay',
    HEAVY_ARMOR: 'Giáp nặng',
    LIGHT_ARMOR: 'Giáp nhẹ',
  },
  // Loại vũ khí
  WEAPON_TYPE: {
    SWORD: 'Kiếm',
    BLADE: 'Đao',
    SPEAR: 'Thương',
    STAFF: 'Trượng',
    BOW: 'Cung',
    CROSSBOW: 'Nỏ',
    DAGGER: 'Dao',
    AXE: 'Rìu',
    HAMMER: 'Búa',
    POLEARM: 'Vũ khí cán dài',
    GREATSWORD: 'Đại kiếm',
    SHIELD: 'Khiên',
    ARROW: 'Mũi tên',
    AMMUNITION: 'Đạn Dược',
  },
  // Loại súng (hiện đại)
  GUN_TYPE: {
    PISTOL: 'Súng lục',
    RIFLE: 'Súng trường',
    SNIPER: 'Súng bắn tỉa',
    SHOTGUN: 'Shotgun',
  },
  // Chức năng & Tính chất
  FUNCTIONALITY: {
    CONSUMABLE: 'tiêu hao',
    HEALING: 'Chữa thương',
    HEAL_OVER_TIME: 'Hồi máu',
    RESTORE: 'Hồi phục',
    DETOXIFY: 'Giải độc',
    COMBAT: 'Chiến đấu',
    TACTICAL: 'Chiến thuật',
    LEARNABLE: 'Có thể học',
    MAP: 'Bản đồ',
    CONTRACT: 'Khế ước',
    CURSED: 'Bị nguyền rủa',
    BLESSED: 'Được ban phước',
    UNIQUE: 'Độc nhất',
    BUFF: 'buff',
    DEBUFF: 'debuff',
    IMPROVEMENT: 'Cải thiện',
    BREAKTHROUGH: 'Đột phá',
    THROWABLE: 'Vũ khí ném',
    AOE: 'Sát thương diện rộng',
    LIFESTEAL: 'hút máu', // Thường đi kèm giá trị động, ví dụ: 'lifesteal-15'
    REFLECT: 'phản sát thương', // Thường đi kèm giá trị động, ví dụ: 'reflect-10'
    MELEE: 'Cận chiến',
    RANGED: 'Tầm xa',
    MEDICAL: 'Y tế',
    COSMETIC: 'Trang phục thường ngày',
    DEFENSE: 'Phòng thủ',
  },
  // Nguồn gốc / Phong cách
  ORIGIN: {
    MODERN: 'Hiện đại',
    FANTASY: 'Fantasy',
    CULTIVATION: 'Tu tiên',
    MARTIAL_ARTS: 'Võ lâm',
    ANCIENT: 'Cổ đại',
  },
  // Loại vật phẩm khác
  MISC_TYPE: {
    JEWELRY: 'Trang sức',
    NECKLACE: 'Dây chuyền',
    BRACELET: 'Vòng tay',
    EARRINGS: 'Hoa tai',
    HEADPHONES_OVEREAR: 'Tai nghe trùm đầu',
    HEADPHONES_INEAR: 'Tai nghe nhét tai',
    GLASSES: 'Mắt kính',
    WATCH: 'Đồng hồ',
    BAG: 'Túi đồ',
    FOOD: 'Thực phẩm',
    DRESS: 'Váy',
    SHIRT: 'Áo sơ mi',
    COAT: 'Áo khoác',
    SUIT: 'Bộ vest',
    SWIMSUIT: 'Đồ bơi',
    LINGERIE: 'Nội y',
    STOCKINGS: 'Tất dài',
    HAIRPIN: 'Trâm cài tóc',
    BELT: 'Thắt lưng',
    SCARF: 'Khăn choàng',
  },
  // Loại nguyên liệu
  MATERIAL_TYPE: {
    LEATHER: 'Da thú',
    BONE: 'Xương thú',
    SCALE: 'Vảy',
    WOOD: 'Gỗ',
    ORE: 'Khoáng sản',
    HERB: 'Thảo dược',
    SPIRIT_FRUIT: 'Linh quả',
    RARE: 'Quý hiếm',
    LEGENDARY: 'Huyền thoại',
    MEAT_RAW: 'Thịt sống',
    CURRENCY: 'Tiền tệ',
    METAL: 'Kim loại',
    FABRIC: 'Vải',
    SILK: 'Lụa',
    POISON_SAC: 'Túi độc',
    SOUL_STONE: 'Đá hồn',
    CRYSTAL: 'Pha lê',
    GEMSTONE: 'Đá quý',
    GOLD: 'Vàng',
    SILVER: 'Bạc',
    DIAMOND: 'Kim cương',
    RUBY: 'Hồng ngọc',
    SAPPHIRE: 'Lam ngọc',
    EMERALD: 'Lục bảo',
  }
};

// -----------------------------------------------------------------
// TAGS CHO KỸ NĂNG (SKILLS)
// -----------------------------------------------------------------
export const SKILL_TAGS = {
  // Loại kỹ năng
  TYPE: {
    ACTIVE: 'Chủ động',
    PASSIVE: 'Bị động',
  },
  // Chức năng
  FUNCTIONALITY: {
    COMBAT: 'Chiến đấu',
    CRAFTING: 'Chế tác',
    SOFT_SKILL: 'Kỹ năng mềm',
    MOVEMENT: 'Di chuyển',
    DEFENSE: 'Phòng thủ',
    ATTACK: 'Tấn công',
    SOCIAL: 'Xã giao',
    SURVIVAL: 'Sinh tồn',
    HEALING: 'Chữa thương',
// FIX: Add missing 'RESTORE' tag.
    RESTORE: 'Hồi phục',
    TACTICAL: 'Chiến thuật',
    IMPROVEMENT: 'Cải thiện',
  },
  // Mục tiêu
  TARGETING: {
    SINGLE_TARGET: 'Đơn mục tiêu',
    MULTI_TARGET: 'Đa mục tiêu',
    AREA_OF_EFFECT: 'Diện rộng',
    SUPPORT: 'Hỗ trợ',
    SELF: 'Bản thân',
    SUMMON: 'Triệu hồi',
  },
};

// -----------------------------------------------------------------
// TAGS NGUYÊN TỐ & THUỘC TÍNH (ELEMENTS & ATTRIBUTES)
// -----------------------------------------------------------------
export const ELEMENTAL_TAGS = {
  // Ngũ hành
  FIVE_ELEMENTS: {
    METAL: 'Kim',
    WOOD: 'Mộc',
    WATER: 'Thủy',
    FIRE: 'Hỏa',
    EARTH: 'Thổ',
  },
  // Nguyên tố mở rộng
  EXTENDED_ELEMENTS: {
    LIGHTNING: 'Lôi',
    WIND: 'Phong',
    ICE: 'Băng',
    LIGHT: 'Quang',
    DARK: 'Ám',
    POISON: 'Độc',
  },
  // Thuộc tính ma thuật khác
  MAGIC_TYPE: {
    HOLY: 'Thánh',
    DEMONIC: 'Ma đạo',
    PSYCHIC: 'Tâm linh',
    MAGIC: 'Phép thuật',
  },
};

// -----------------------------------------------------------------
// TAGS CHẾ TẠO (CRAFTING)
// -----------------------------------------------------------------
export const CRAFTING_TAGS = {
  COOKING: 'Nấu ăn', // Chung.
  ALCHEMY_CULTIVATION: 'Luyện đan', // Tu Tiên.
  REFINING_CULTIVATION: 'Luyện khí', // Tu Tiên (rèn pháp bảo).
  TALISMAN: 'Phù lục', // Tu Tiên (vẽ bùa).
  PUPPETRY: 'Khôi lỗi', // Tu Tiên.
  FORGING: 'Rèn đúc', // Võ Lâm & Fantasy.
  PHARMACY: 'Chế dược', // Võ Lâm.
  ALCHEMY_FANTASY: 'Giả kim', // Fantasy.
  ARTISAN: 'Chế tác', // Fantasy (đồ da, trang sức).
  MANUFACTURING: 'Chế tạo', // Hiện đại / Hậu tận thế.
  FARMING: 'Nông nghiệp', // Chung.
  FORMATION: 'Trận pháp', // Tu Tiên.
  JEWELRY_MAKING: 'Chế tác trang sức', // Fantasy.
  ENCHANTING: 'Yểm bùa', // Fantasy.
};

// -----------------------------------------------------------------
// TAGS TRẠNG THÁI (STATUSES)
// -----------------------------------------------------------------
export const STATUS_TAGS = {
  POSITIVE: 'positive',
  NEGATIVE: 'negative',
  NEUTRAL: 'neutral',
  BUFF: 'buff',
  DEBUFF: 'debuff',
  CONTROL: 'Khống chế', // Stun, sleep, etc.
  DOT: 'Sát thương theo thời gian', // Damage over time
  HOT: 'Hồi máu theo thời gian', // Heal over time
  BREAKTHROUGH: 'Đột phá',
  BOTTLENECK: 'Bình cảnh',
  SILENCE: 'Câm lặng',
  BLIND: 'Mù',
  SLEEP: 'Ngủ',
  FEAR: 'Sợ hãi',
};

// -----------------------------------------------------------------
// TAGS NHIỆM VỤ & MỤC TIÊU (QUEST & GOALS)
// -----------------------------------------------------------------
export const QUEST_TAGS = {
  ACTIVE: 'Đang thực hiện',
  COMPLETED: 'Hoàn thành',
  FAILED: 'Thất bại',
  ABANDONED: 'Từ bỏ',
};

// -----------------------------------------------------------------
// TAGS CHO THỰC THỂ & SINH VẬT (ENTITIES & CREATURES)
// -----------------------------------------------------------------
export const ENTITY_TAGS = {
  // Chủng tộc/Loài
  RACE: {
    HUMAN: 'Nhân Loại', // Loài người.
    ELF: 'Elf', // Tiên tộc, thường sống lâu và giỏi ma pháp.
    DWARF: 'Dwarf', // Người lùn, bậc thầy rèn đúc và sống dưới lòng đất.
    ORC: 'Orc', // Orc, chủng tộc hiếu chiến với sức mạnh thể chất vượt trội.
    UNDEAD: 'Xác sống', // Các sinh vật đã chết được hồi sinh (Zombie, Skeleton).
    DEMON: 'Ma tộc', // Sinh vật đến từ Ma giới, thường độc ác và mạnh mẽ.
    BEAST_FOLK: 'Yêu tộc', // Các chủng tộc có hình dạng nửa người nửa thú (Miêu nhân, Lang nhân).
    DRAGON: 'Long tộc', // Rồng và các loài có họ hàng với rồng.
    PLANT: 'Thực vật', // Các sinh vật dạng thực vật (Ma cây).
    INSECT: 'Côn trùng', // Các sinh vật dạng côn trùng khổng lồ.
    SPIRIT: 'Linh tộc', // Các tinh linh nguyên tố hoặc tự nhiên.
  },
  // Phân loại chung
  CLASSIFICATION: {
    HUMANOID: 'Nhân hình', // Các sinh vật có hình dạng giống người.
    BEAST: 'Yêu thú', // Các loài động vật, có thể có hoặc không có trí thông minh.
    MONSTER: 'Quái vật', // Các sinh vật hung dữ, thường là kẻ địch.
    SPIRIT_BEAST: 'Linh thú', // Các loài thú có linh trí, có thể tu luyện.
    BOSS: 'boss', // Kẻ địch cực mạnh, trùm cuối của một khu vực.
    MINIBOSS: 'Mini boss', // Kẻ địch mạnh hơn bình thường nhưng dưới cấp boss.
  },
  // Vai trò chiến đấu
  COMBAT_ROLE: {
    MELEE: 'Cận chiến', // Vai trò chiến đấu tầm gần.
    RANGED: 'Tầm xa', // Vai trò chiến đấu tầm xa.
    MAGIC_USER: 'Phép thuật', // Sử dụng phép thuật làm vũ khí chính.
    HEALER: 'Chữa trị', // Có khả năng hồi phục cho đồng minh.
    TANK: 'Phòng thủ cao', // Có khả năng chịu đòn cao, bảo vệ đồng đội.
    ASSASSIN: 'Sát thủ', // Gây sát thương lớn trong chớp nhoáng, giỏi lén lút.
    SUMMONER: 'Triệu hồi sư', // Triệu hồi các sinh vật khác để chiến đấu.
  },
  // Đặc tính & Cơ chế
  TRAITS: {
    FLYING: 'Bay', // Có khả năng bay.
    AQUATIC: 'Bơi', // Có khả năng sống/chiến đấu dưới nước.
    SWARM: 'Bầy đàn', // Thường xuất hiện và chiến đấu theo nhóm đông.
    LARGE: 'To lớn', // Có kích thước vượt trội.
    FAST: 'Nhanh nhẹn', // Có tốc độ di chuyển và tấn công cao.
    UNDEGROUND: 'Dưới lòng đất', // Sống và di chuyển dưới lòng đất.
    REGENERATION: 'Tự hồi phục', // Có khả năng tự hồi phục sinh lực.
    LIFESTEAL: 'Hút máu', // Hồi phục sinh lực dựa trên sát thương gây ra.
    REFLECT_DAMAGE: 'Phản sát thương', // Phản lại một phần sát thương cho kẻ tấn công.
    ARMOR_PENETRATION: 'Xuyên giáp', // Có khả năng bỏ qua một phần phòng thủ của đối phương.
  },
  // Điểm yếu & Kháng cự
  AFFINITY: {
    WEAK_FIRE: 'Yếu hỏa', // Yếu tố Hỏa gây thêm sát thương.
    RESIST_FIRE: 'Kháng hỏa', // Giảm sát thương từ yếu tố Hỏa.
    IMMUNE_FIRE: 'Miễn nhiễm hỏa', // Hoàn toàn miễn nhiễm với sát thương Hỏa.
    WEAK_ICE: 'Yếu băng', // Yếu tố Băng gây thêm sát thương.
    RESIST_ICE: 'Kháng băng', // Giảm sát thương từ yếu tố Băng.
    IMMUNE_ICE: 'Miễn nhiễm băng', // Hoàn toàn miễn nhiễm với sát thương Băng.
    WEAK_POISON: 'Yếu độc', // Yếu tố Độc gây thêm sát thương hoặc hiệu ứng.
    RESIST_POISON: 'Kháng độc', // Giảm sát thương/hiệu ứng từ yếu tố Độc.
    IMMUNE_POISON: 'Miễn nhiễm độc', // Hoàn toàn miễn nhiễm với yếu tố Độc.
    WEAK_HOLY: 'Yếu thánh', // Yếu tố Thánh gây thêm sát thương (thường dùng cho undead, demon).
    RESIST_PHYSICAL: 'Kháng vật lý', // Giảm sát thương từ các đòn tấn công vật lý (chém, đâm, đập).
  },
  // Vai trò xã hội
  SOCIAL_ROLE: {
    FRIENDLY: 'Thân thiện', // Sẽ không chủ động tấn công, có thể giúp đỡ.
    HOSTILE: 'Thù địch', // Sẽ tấn công khi nhìn thấy.
    NEUTRAL: 'Trung lập', // Không tấn công trừ khi bị khiêu khích.
    MERCHANT: 'Thương nhân', // Có thể mua bán vật phẩm.
    GUARD: 'Lính gác', // Bảo vệ một khu vực hoặc nhân vật.
    BLACKSMITH: 'Thợ rèn', // Có thể chế tạo hoặc sửa chữa trang bị.
    ALCHEMIST: 'Luyện đan sư', // Có thể chế tạo thuốc hoặc đan dược.
    NOBLE: 'Quý tộc', // Thuộc tầng lớp quý tộc, có địa vị xã hội.
    QUEST_GIVER: 'Giao nhiệm vụ', // Cung cấp nhiệm vụ cho người chơi.
  },
  // Môi trường sống
  ENVIRONMENT: {
    FOREST: 'Rừng', // Thường được tìm thấy trong rừng.
    MOUNTAIN: 'Núi', // Thường được tìm thấy ở vùng núi.
    CAVE: 'Hang động', // Thường được tìm thấy trong hang động.
    RIVER_LAKE: 'Sông hồ', // Sống ở hoặc gần sông, hồ.
    SWAMP: 'Đầm lầy', // Sống ở vùng đầm lầy.
    DESERT: 'Sa mạc', // Sống ở sa mạc.
    URBAN: 'Thành thị', // Sống ở các khu vực đô thị, thành phố.
  },
};

// -----------------------------------------------------------------
// TAGS KHÁC
// -----------------------------------------------------------------
export const MISC_TAGS = {
  PINNED: 'Ghim', // Dùng để ghim các Ký ức Cốt lõi.
  UNMERGEABLE: 'không-hợp-nhất', // Dùng để ngăn trạng thái bị gộp tự động.
  OUTFIT_CATEGORY: 'Outfit category', // Tiền tố cho các thẻ phân loại trang phục, ví dụ: 'outfit-category:Hàng ngày'.
};
