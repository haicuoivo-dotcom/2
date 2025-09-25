/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

type DifficultyLevel = {
    label: string;
    notes: string[];
};

export const DIFFICULTY_LEVELS: Record<string, DifficultyLevel> = {
    easy: {
        label: 'Dễ - Người Dẫn chuyện Hiền hòa',
        notes: [
            'Thế giới ưu ái bạn, các sự kiện thường có lợi.',
            'NPC thân thiện và sẵn sàng giúp đỡ.',
            'Kẻ địch yếu hơn và ít gặp hơn.',
            'Lý tưởng để tận hưởng cốt truyện.'
        ]
    },
    normal: {
        label: 'Thường - Trọng tài Công bằng',
        notes: [
            'Trải nghiệm cân bằng giữa thử thách và phần thưởng.',
            'NPC và kẻ địch hành động một cách logic.',
            'Đây là chế độ chơi tiêu chuẩn.',
            'Đòi hỏi sự tính toán hợp lý.'
        ]
    },
    hard: {
        label: 'Khó - Đối thủ Xảo quyệt',
        notes: [
            'Thế giới trở nên khắc nghiệt hơn.',
            'Kẻ địch thông minh, biết dùng chiến thuật và phục kích.',
            'Tài nguyên khan hiếm, NPC khó tính hơn.',
            'Dành cho người chơi tìm kiếm thử thách.'
        ]
    },
    nightmare: {
        label: 'Ác Mộng - Thần linh Tàn nhẫn',
        notes: [
            'Chế độ sinh tồn tàn bạo, thế giới luôn chống lại bạn.',
            'Kẻ địch cực kỳ mạnh và tàn nhẫn.',
            'Các sự kiện tiêu cực xảy ra thường xuyên.',
            'NPC có thể phản bội, các chỉ số sinh tồn giảm nhanh.'
        ]
    }
};

export const STORY_LENGTH_OPTIONS = {
    short: 'Ngắn Gọn',
    standard: 'Tiêu Chuẩn',
    detailed: 'Chi Tiết',
    novel: 'Tiểu thuyết',
};

export const STORY_LENGTH_INSTRUCTIONS = {
    short: 'Hãy viết diễn biến trong 5-7 đoạn văn. Phải có sự cân bằng giữa mô tả hành động, đối thoại và kết quả. Dù ngắn gọn, câu chuyện vẫn cần có chi tiết để tạo bối cảnh và đi vào suy nghĩ nội tâm của nhân vật.',
    standard: 'Viết diễn biến trong khoảng 9-12 đoạn văn. Đi sâu vào mô tả môi trường, các chi tiết giác quan, và diễn biến nội tâm của nhân vật. Mỗi lượt chơi phải thúc đẩy câu chuyện tiến về phía trước một cách có ý nghĩa.',
    detailed: 'Viết diễn biến trong khoảng 13-16 đoạn văn chi tiết. Khai thác sâu sắc cảm xúc phức tạp của các nhân vật liên quan. Mô tả hành động và phản ứng một cách chi tiết. Bắt đầu gợi mở các tình tiết phụ và các sự kiện tương lai.',
    novel: '**MỆNH LỆNH TỐI THƯỢỢNG VỀ CHẤT LƯỢNG TIỂU THUYẾT (CẤP ĐỘ PRO):** Diễn biến (`story`) BẮT BUỘC phải được viết như một chương tiểu thuyết thực thụ, có chiều sâu văn học, ý nghĩa, và dài **tối thiểu 20-25 đoạn văn trở lên**. Tuyệt đối cấm viết các đoạn văn sơ sài, hời hợt, chỉ mô tả hành động và kết quả. Với khả năng của mô hình PRO, bạn PHẢI tuân thủ 5 trụ cột sau đây một cách **TUYỆT ĐỐI**:\n1.  **Dẫn dắt Cốt truyện & Phát triển Tình tiết phụ (Story & Subplot Driving):** Diễn biến KHÔNG CHỈ là phản ứng. Nó BẮT BUỘC phải tích cực thúc đẩy câu chuyện chính về phía trước VÀ gieo mầm hoặc phát triển các tình tiết phụ. Mỗi lượt chơi phải giới thiệu một chi tiết mới, một hậu quả sâu sắc (tốt hoặc xấu), một sự phát triển phức tạp trong mối quan hệ, hoặc gợi mở một bí ẩn/nhiệm vụ mới. Câu chuyện phải luôn có động lực, chiều sâu và hướng đi rõ ràng.\n2.  **Mô tả Giác quan & Môi trường Sống động:** Xây dựng một bức tranh hoàn chỉnh và sống động. Đi sâu vào mô tả chi tiết môi trường xung quanh, sử dụng các chi tiết về âm thanh, mùi vị, ánh sáng, nhiệt độ, và cảm giác để tạo ra một không khí chân thực, khiến người đọc có thể đắm chìm hoàn toàn.\n3.  **Diễn biến Nội tâm Phức tạp:** Khai thác sâu sắc và chi tiết những suy nghĩ, mâu thuẫn nội tâm, cảm xúc, và ký ức của nhân vật chính. Cho thấy sự kiện đang diễn ra tác động đến tâm lý của họ như thế nào, họ đang suy tính gì, và những quyết định của họ được hình thành ra sao. Phản ánh cả những suy nghĩ phức tạp của các NPC quan trọng.\n4.  **Hành động & Phản ứng Chi tiết, Tinh tế:** Mô tả hành động không chỉ là "cô ấy đi đến cửa", mà là "cô ấy bước từng bước chậm rãi về phía cánh cửa gỗ sồi, những thớ gỗ cũ kỹ hiện rõ dưới ánh trăng mờ, tay cô khẽ run khi vươn ra nắm lấy tay nắm cửa bằng đồng lạnh lẽo." Mô tả cả những phản ứng tinh tế, không lời của các NPC khác (ánh mắt, một cái nhíu mày, sự thay đổi trong hơi thở).\n5.  **Nhịp độ, Gợi mở & Điềm báo (Pacing & Foreshadowing):** Tạo ra nhịp độ cho câu chuyện, có lúc chậm rãi suy tư, có lúc dồn dập kịch tính. Quan trọng nhất, hãy khéo léo cài cắm những chi tiết gợi mở hoặc điềm báo cho các sự kiện hoặc bí mật lớn trong tương lai. Mỗi chương truyện phải để lại cho người đọc sự tò mò và mong đợi.\n**VI PHẠM BẤT KỲ ĐIỀU NÀO TRONG 5 TRỤ CỘT NÀY SẼ BỊ COI LÀ LỖI HỆ THỐNG NGHIÊM TRỌNG. VIẾT NGẮN, SƠ SÀI, HOẶC KHÔNG CÓ NỘI DUNG DẪN DẮT LÀ KHÔNG THỂ CHẤP NHẬN ĐƯỢỢC.**',
};

export const PERSONALITY_TRAITS = {
    'Mặc định': ['Để AI quyết định'],
    'Big Five (OCEAN)': [
        'Sáng tạo (Cởi mở)',
        'Tò mò (Cởi mở)',
        'Giàu trí tưởng tượng (Cởi mở)',
        'Có tổ chức (Tận tâm)',
        'Kỷ luật (Tận tâm)',
        'Đáng tin cậy (Tận tâm)',
        'Hòa đồng (Hướng ngoại)',
        'Năng động (Hướng ngoại)',
        'Tốt bụng (Dễ chịu)',
        'Hợp tác (Dễ chịu)',
        'Lo lắng (Bất ổn cảm xúc)',
        'Nhạy cảm (Bất ổn cảm xúc)',
    ],
    'DISC': [
        'Quyết đoán (Thống trị)',
        'Tự tin (Thống trị)',
        'Thuyết phục (Ảnh hưởng)',
        'Nhiệt tình (Ảnh hưởng)',
        'Kiên nhẫn (Kiên định)',
        'Bình tĩnh (Kiên định)',
        'Chính xác (Tuân thủ)',
        'Logic (Tuân thủ)',
    ],
    'Phổ biến khác': [
        'Hướng nội', 'Lý trí', 'Thực tế', 'Lạc quan',
        'Nghiêm túc', 'Thận trọng', 'Dũng cảm', 'Trung thực',
        'Giản dị', 'Hài hước', 'Kiêu ngạo', 'Tham vọng',
        'Ích kỷ', 'Nhút nhát', 'Bảo thủ', 'Khó tính',
        'Nóng nảy', 'Vị tha'
    ]
};

export const FANTASY_RANK_DATA: {short: string; long: string}[] = [
  { short: 'F', long: 'Sắt' },
  { short: 'E', long: 'Đồng' },
  { short: 'D', long: 'Bạc' },
  { short: 'C', long: 'Vàng' },
  { short: 'B', long: 'Bạch kim' },
  { short: 'A', long: 'Mithril' },
  { short: 'S', long: 'Orichalcum' },
  { short: 'SS', long: 'Adamantite' }
];

export const KNOWLEDGE_BASE_CATEGORIES = {
    npcs: { label: "NPC", key: 'npcs' },
    world_summary: { label: "Thế Giới", key: 'world_summary' },
    world_logic: { label: "Logic Thế Giới", key: 'world_logic' },
    world_events: { label: "Sự Kiện", key: 'world_events' },
    factions: { label: "Phe Phái", key: 'factions' },
    locations: { label: "Địa Điểm", key: 'locations' },
    world_skills: { label: "Kỹ Năng", key: 'world_skills' },
};

export const KB_CATEGORY_ORDER = [
    'npcs',
    'world_logic',
    'world_summary',
    'world_events',
    'factions',
    'locations',
    'world_skills',
];

export const ENTITY_TYPE_LABELS = {
    PC: 'Nhân Vật',
    NPC: 'NPC',
    LOC: 'Địa Điểm',
    FACTION: 'Phe Phái',
    ITEM: 'Vật phẩm',
    SKILL: 'Kỹ năng',
    TECH: 'Công pháp',
};

export const IMAGE_STYLES = [
    { label: 'Mặc định (Không có)', value: '' },
    { label: 'Chân thực (Photorealistic)', value: 'photorealistic, cinematic film still, detailed, 8k, professional photography' },
    { label: 'Tranh Anime/Manga', value: 'anime key visual, vibrant colors, detailed illustration, manga style' },
    { label: 'Tranh Fantasy Kỹ thuật số', value: 'fantasy digital painting, epic, concept art, detailed, trending on artstation' },
    { label: 'Tranh Màu nước (Watercolor)', value: 'watercolor painting, soft, flowing colors, beautiful, artistic' },
    { label: 'Tranh Sơn dầu (Oil Painting)', value: 'oil painting, classic, textured brush strokes, rich colors' },
    { label: 'Tranh Thủy Mặc (Ink Wash)', value: 'Chinese ink wash painting, sumi-e, minimalist, black and white, flowing brush strokes' },
    { label: 'Nghệ thuật Cyberpunk', value: 'cyberpunk art, neon lighting, futuristic city, dystopian, high tech' },
    { label: 'Phong cách Chibi', value: 'chibi style, cute, small character, simple background, adorable' },
    { label: 'Tranh lụa Việt Nam', value: 'Vietnamese silk painting style, traditional, soft colors, elegant lines, romantic' },
    { label: 'Tranh Đông Hồ Việt Nam', value: 'Vietnamese Dong Ho woodblock print style, folk art, bold lines, simple colors' },
];

export const OPENROUTER_IMAGE_MODELS = [
    { label: 'Playground v2.5 (Miễn phí)', value: 'playgroundai/playground-v2.5' },
    { label: 'Google Imagen 3 (Có phí)', value: 'google/imagen-3' },
    { label: 'OpenAI DALL-E 2 (Có phí)', value: 'openai/dall-e-2' },
    { label: 'Stable Diffusion 3 (Có phí)', value: 'stabilityai/stable-diffusion-3' },
];

export const CUSTOMIZABLE_BUTTONS = {
    header: {
        title: 'Thanh Tiêu Đề (Desktop)',
        buttons: [
            { id: 'header_character', label: 'Nhân Vật', description: 'Mở bảng thông tin nhân vật chính.', default: true },
            { id: 'header_memory', label: 'Dòng Chảy Sự Kiện', description: 'Xem và quản lý ký ức của AI.', default: true },
            { id: 'header_knowledge', label: 'Tri Thức', description: 'Khám phá thông tin về thế giới, NPC...', default: true },
            { id: 'header_map', label: 'Bản Đồ', description: 'Xem bản đồ thế giới.', default: true },
            { id: 'header_crafting', label: 'Chế Tạo', description: 'Mở bảng chế tạo, rèn đúc, luyện đan.', default: true },
            { id: 'header_gallery', label: 'Thư Viện', description: 'Xem lại các ảnh đã tạo.', default: true },
            { id: 'header_lore', label: 'Luật Lệ', description: 'Quản lý các quy tắc của thế giới.', default: true },
            { id: 'header_history', label: 'Lịch Sử', description: 'Xem và quay lại các lượt chơi trước.', default: true },
            { id: 'header_revert', label: 'Lùi', description: 'Nút quay lại nhanh một lượt.', default: true },
            { id: 'header_pause', label: 'Tạm Dừng', description: 'Nút tạm dừng trong chiến đấu.', default: true },
            { id: 'header_exit', label: 'Thoát', description: 'Thoát game về màn hình chính.', default: true },
            { id: 'header_settings', label: 'Cài Đặt', description: 'Nút truy cập nhanh cài đặt.', default: true },
            { id: 'header_saveFile', label: 'Lưu Tệp', description: 'Nút lưu game ra tệp JSON.', default: true },
        ],
    },
    mobile: {
        title: 'Menu Điều Hướng (Mobile)',
        buttons: [
            { id: 'mobile_character', label: 'Nhân Vật', description: 'Mở bảng thông tin nhân vật chính.', default: true },
            { id: 'mobile_memory', label: 'Dòng Chảy Sự Kiện', description: 'Xem và quản lý ký ức của AI.', default: true },
            { id: 'mobile_knowledge', label: 'Tri Thức', description: 'Khám phá thông tin về thế giới, NPC...', default: true },
            { id: 'mobile_map', label: 'Bản Đồ', description: 'Xem bản đồ thế giới.', default: true },
            { id: 'mobile_gallery', label: 'Thư Viện', description: 'Xem lại các ảnh đã tạo.', default: true },
            { id: 'mobile_lore', label: 'Luật Lệ', description: 'Quản lý các quy tắc của thế giới.', default: true },
            { id: 'mobile_crafting', label: 'Chế Tạo', description: 'Mở bảng chế tạo, rèn đúc, luyện đan.', default: true },
            { id: 'mobile_history', label: 'Lịch Sử', description: 'Xem và quay lại các lượt chơi trước.', default: true },
            { id: 'mobile_saveFile', label: 'Lưu Tệp', description: 'Lưu game ra tệp JSON.', default: true },
            { id: 'mobile_settings', label: 'Cài Đặt', description: 'Mở bảng cài đặt.', default: true },
            { id: 'mobile_pause', label: 'Tạm Dừng', description: 'Tạm dừng trong chiến đấu.', default: true },
            { id: 'mobile_exit', label: 'Thoát', description: 'Thoát game về màn hình chính.', default: true },
        ],
    }
};

export const FACTION_TYPES = [
    'Quân đội', 'Thành phố', 'Lãnh địa', 'Quốc gia', 'Gia tộc', 'Công ty', 'Tập đoàn', 'Thế giới'
];