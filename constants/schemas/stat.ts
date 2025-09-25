/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { Type } from "@google/genai";
import { STAT_CATEGORIES } from '../statConstants';

/** Hiệu ứng của Stat lên một thuộc tính khác. */
export const STAT_EFFECT_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        targetStat: { type: Type.STRING, description: "Tên CHÍNH XÁC của thuộc tính bị ảnh hưởng (BẮT BUỘC phải khớp với một stat 'Thuộc tính' khác)." },
        modifier: { type: Type.STRING, description: "Giá trị thay đổi, ví dụ: '+10', '-5', '+15%'. TUYỆT ĐỐI không bao gồm mô tả dài dòng." },
        color: { type: Type.STRING, description: "(CHỈ DÙNG CHO 'Danh Hiệu') Mã màu hex (ví dụ: '#4CAF50') để hiển thị." }
    },
    required: ['targetStat', 'modifier']
};

/** Công thức chế tạo. */
export const RECIPE_DATA_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        ingredients: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { name: { type: Type.STRING, description: "Tên chính xác của nguyên liệu." }, quantity: { type: Type.INTEGER, description: "Số lượng yêu cầu." } }, required: ['name', 'quantity'] } },
        product: { type: Type.STRING, description: "Tên vật phẩm mẫu (baseItemName) của thành phẩm. BẮT BUỘC phải khớp với một mẫu trong BASE_ITEM_TEMPLATES." }
    },
    required: ['ingredients', 'product']
};

/** Chi phí sử dụng kỹ năng. */
export const SKILL_COST_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        resource: { type: Type.STRING, description: "Tên tài nguyên (VD: 'Mana', 'Linh Lực', 'Nội Lực', 'Thể Lực', 'Sinh Lực')." },
        amount: { type: Type.INTEGER, description: "Số lượng tiêu tốn." }
    },
    required: ['resource', 'amount']
};

/** Tỷ lệ ảnh hưởng của thuộc tính lên kỹ năng. */
export const SKILL_SCALING_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        statName: { type: Type.STRING, description: "Tên thuộc tính ảnh hưởng (ví dụ: 'Sức mạnh', 'Trí tuệ')." },
        ratio: { type: Type.NUMBER, description: "Tỷ lệ ảnh hưởng (ví dụ: 1.5 tương đương 150%)." },
        effectType: { type: Type.STRING, enum: ['damage', 'heal', 'duration', 'chance', 'mitigation'], description: "Loại hiệu ứng bị ảnh hưởng. BẮT BUỘC phải là một trong các giá trị enum được cung cấp." },
        baseValue: { type: Type.INTEGER, description: "Giá trị cơ bản của hiệu ứng trước khi cộng thêm từ thuộc tính." }
    },
    required: ['statName', 'ratio', 'effectType', 'baseValue']
};

/** Mục tiêu của nhiệm vụ. */
export const QUEST_OBJECTIVE_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        description: { type: Type.STRING, description: "Mô tả mục tiêu (ví dụ: 'Thu thập 5 Da Sói')." },
        target: { type: Type.STRING, description: "Tên định danh của mục tiêu (ví dụ: 'Da Sói', 'Tên NPC', 'Tên Địa điểm'). BẮT BUỘC phải khớp chính xác với tên của đối tượng trong game." },
        requiredCount: { type: Type.INTEGER, description: "Số lượng yêu cầu." },
        currentCount: { type: Type.INTEGER, description: "Số lượng hiện tại, BẮT BUỘC khởi tạo bằng 0." },
        type: { type: Type.STRING, enum: ['defeat', 'collect', 'talk', 'explore'], description: "Loại mục tiêu. 'defeat' (đánh bại), 'collect' (thu thập vật phẩm), 'talk' (nói chuyện với NPC), 'explore' (khám phá địa điểm). BẮT BUỘC phải là một trong các giá trị enum được cung cấp." }
    },
    required: ['description', 'target', 'requiredCount', 'currentCount', 'type']
};

/** Phần thưởng nhiệm vụ. */
export const QUEST_REWARD_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        description: { type: Type.STRING, description: "Mô tả phần thưởng (ví dụ: '500 Đồng Vàng', '[ITEM:Kiếm Sắt]', '+50 EXP')." }
    },
    required: ['description']
};

/** Các thuộc tính cốt lõi của một Stat. */
const STAT_PROPERTIES_BASE = {
    name: { type: Type.STRING, description: "Tên của Stat." },
    description: { type: Type.STRING, description: "Mô tả CƠ CHẾ của Kỹ năng/Vật phẩm. BẮT BUỘC phải CỰC KỲ ngắn gọn (TỐI ĐA 3 câu). TUYỆT ĐỐI KHÔNG lặp lại văn bản. Ví dụ đúng: 'Gây sát thương Hỏa lên mục tiêu'. Ví dụ sai: 'Người dùng tập trung linh lực vào tay để tạo ra một quả cầu lửa rực cháy...'" },
    value: { type: Type.STRING, description: "Giá trị NGẮN GỌN của stat (ví dụ: '50', '100/100', 'Sơ cấp'). TUYỆT ĐỐI KHÔNG dài quá 30 ký tự. Mọi mô tả dài BẮT BUỘC phải nằm trong trường 'description'." },
    category: {
        type: Type.STRING,
        description: `Loại của stat. BẮT BUỘC phải là MỘT trong các giá trị sau: ${STAT_CATEGORIES.map(c => `'${c.value}'`).join(', ')}.`
    },
    tags: { type: Type.ARRAY, items: { type: Type.STRING }, description: "(Tùy chọn) Mảng các từ khóa để phân loại hoặc cung cấp logic bổ sung (ví dụ: 'chủ động', 'bị động', '1-tay', 'Hỏa')." },
};

/** Các thuộc tính dành riêng cho Vật phẩm. */
const STAT_PROPERTIES_ITEM = {
    slot: { type: Type.STRING, description: "CHỈ DÙNG CHO category 'Vật phẩm'. Ô trang bị mà vật phẩm này thuộc về. Phải là một trong các giá trị hợp lệ." },
    price: { type: Type.INTEGER, description: "CHỈ DÙNG CHO category 'Vật phẩm'. Giá trị cơ bản của vật phẩm." },
};

/**
 * Schema cốt lõi cho một Stat. Đây là khối xây dựng cơ bản nhất cho mọi
 * thứ mà một nhân vật sở hữu, từ thuộc tính, kỹ năng, đến vật phẩm.
 */
export const STAT_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        ...STAT_PROPERTIES_BASE,
        ...STAT_PROPERTIES_ITEM,
        effects: { type: Type.ARRAY, description: "CHỈ DÙNG CHO category 'Vật phẩm', 'Trạng thái', 'Danh Hiệu'. Mảng các hiệu ứng lên thuộc tính.", items: STAT_EFFECT_SCHEMA },
        recipeData: { ...RECIPE_DATA_SCHEMA, description: "CHỈ DÙNG CHO category 'Sơ Đồ Chế Tạo'. Công thức chế tạo." },
        skillCost: { type: Type.ARRAY, description: "CHỈ DÙNG CHO 'Kỹ Năng' có tag 'chủ động'. Chi phí để sử dụng kỹ năng.", items: SKILL_COST_SCHEMA },
        scaling: { type: Type.ARRAY, description: "CHỈ DÙNG CHO 'Kỹ Năng'. Cách kỹ năng tăng sức mạnh dựa trên thuộc tính.", items: SKILL_SCALING_SCHEMA },
        objectives: { type: Type.ARRAY, description: "CHỈ DÙNG CHO 'Nhiệm Vụ'. Các mục tiêu của nhiệm vụ.", items: QUEST_OBJECTIVE_SCHEMA },
        rewards: { type: Type.ARRAY, description: "CHỈ DÙNG CHO 'Nhiệm Vụ'. Phần thưởng khi hoàn thành.", items: QUEST_REWARD_SCHEMA },
    },
    required: ['name', 'description', 'category']
};