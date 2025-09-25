/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { Type } from "@google/genai";
import { STAT_SCHEMA } from "./stat";

// This file consolidates all character-related schemas.

/** Các thuộc tính định danh cốt lõi của một nhân vật. */
const CHARACTER_PROPERTIES_CORE = {
    id: { type: Type.STRING, description: "ID định danh duy nhất của nhân vật. KHI CẬP NHẬT, BẮT BUỘC GIỮ NGUYÊN ID GỐC. Khi tạo nhân vật mới, AI sẽ bỏ qua trường này." },
    name: { type: Type.STRING, description: "Tên khai sinh đầy đủ, dùng làm định danh duy nhất. BẮT BUỘC phải có họ và tên nếu bối cảnh yêu cầu. KHÔNG chứa chức danh." },
    displayName: { type: Type.STRING, description: "Tên thường gọi, sẽ được hiển thị và gắn thẻ trong truyện. KHÔNG chứa chức danh." },
};

/** Các thuộc tính mô tả ngoại hình và tính cách của nhân vật. */
export const CHARACTER_PROPERTIES_DESCRIPTIVE = {
    personality: { type: Type.STRING, description: "BẮT BUỘC là 3-5 từ khóa ngắn gọn, cách nhau bằng dấu phẩy. Ví dụ: 'Lạnh lùng, Quyết đoán, Nội tâm'." },
    physicalAppearance: { type: Type.STRING, description: "Mô tả ngoại hình chi tiết." },
    currentOutfit: { type: Type.STRING, description: "Mô tả trang phục hiện tại." },
    backstory: { type: Type.STRING, description: "Tiểu sử của nhân vật." },
    linhCan: { type: Type.STRING, description: "(Chỉ dùng cho Tu Tiên) Mô tả về loại và phẩm chất linh căn của nhân vật." },
};

/** Các thuộc tính liên quan đến logic game của nhân vật. */
const CHARACTER_PROPERTIES_GAMEPLAY = {
    locationId: { type: Type.STRING, description: "ID của địa điểm mà nhân vật đang ở. BẮT BUỘC phải khớp với ID của một thực thể địa điểm." },
    npcType: { type: Type.STRING, enum: ['npc', 'unnamed_monster', 'named_monster', 'boss'], description: "Loại NPC, dùng để phân biệt hành vi. Mặc định là 'npc'." },
    stats: { type: Type.ARRAY, description: "Mảng chứa TẤT CẢ các thuộc tính, kỹ năng, vật phẩm, mối quan hệ, v.v. Đây là trường QUAN TRỌNG NHẤT.", items: STAT_SCHEMA },
    tags: { type: Type.ARRAY, items: { type: Type.STRING }, description: "(Tùy chọn) Mảng các từ khóa để phân loại bản chất của thực thể (ví dụ: 'nhân-loại', 'yêu-tộc', 'cận-chiến', 'phép-thuật')." },
};

/**
 * Schema cho một nhân vật (PC hoặc NPC).
 */
export const CHARACTER_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        ...CHARACTER_PROPERTIES_CORE,
        ...CHARACTER_PROPERTIES_DESCRIPTIVE,
        ...CHARACTER_PROPERTIES_GAMEPLAY,
    },
    required: ['name', 'displayName', 'personality', 'physicalAppearance', 'currentOutfit', 'backstory', 'stats', 'tags']
};