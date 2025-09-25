/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { Type } from "@google/genai";
import { CHARACTER_SCHEMA } from "./character";
import { FACTION_SCHEMA } from "./faction";
import { DIRECTIVE_SCHEMA, MEMORY_SUMMARY_SCHEMA } from "./turnProcessing";

// This file consolidates utility and maintenance schemas.

/**
 * Schema chung cho các thực thể trong KnowledgeBase (ví dụ: Địa điểm).
 */
export const KNOWLEDGE_ENTITY_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        name: { type: Type.STRING, description: "Tên định danh duy nhất của thực thể." },
        description: { type: Type.STRING, description: "Mô tả chi tiết về thực thể." },
        coordinates: { type: Type.OBJECT, properties: { x: { type: Type.INTEGER }, y: { type: Type.INTEGER } }, description: "(CHỈ DÙNG CHO ĐỊA ĐIỂM) Tọa độ (x, y) trên bản đồ 2D." }
    },
    required: ['name', 'description']
};

/** Phân tích hình ảnh. */
export const IMAGE_ANALYSIS_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        description: { type: Type.STRING, description: "Mô tả chi tiết, giàu hình ảnh về nội dung của bức ảnh." },
        category: { type: Type.STRING, description: "Danh mục chính (ví dụ: Nhân vật, Bối cảnh, Vật phẩm)." },
        tags: { type: Type.ARRAY, items: { type: Type.STRING } },
        isNSFW: { type: Type.BOOLEAN, description: "BẮT BUỘC là `true` nếu ảnh chứa nội dung khiêu dâm hoặc nhạy cảm cao." }
    },
    required: ["description", "category", "tags", "isNSFW"]
};

/** Gợi ý giọng đọc TTS. */
export const VOICE_SUGGESTION_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        voiceURI: { type: Type.STRING, description: "URI của giọng đọc được đề xuất từ danh sách đã cung cấp." }
    },
    required: ['voiceURI']
};

/** Schema for emergency text summarization to avoid token limits. */
export const EMERGENCY_SUMMARY_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        summarizedWorld: { type: Type.STRING, description: "Phiên bản tóm tắt CỰC NGẮN của bối cảnh thế giới." },
        summarizedBackstory: { type: Type.STRING, description: "Phiên bản tóm tắt CỰC NGẮN của tiểu sử nhân vật." },
        summarizedAction: { type: Type.STRING, description: "Phiên bản tóm tắt CỰC NGẮN của hành động người chơi." }
    },
    required: ['summarizedWorld', 'summarizedBackstory', 'summarizedAction']
};

/** Schema for AI to summarize a list of memories. */
export const MEMORY_SUMMARIZATION_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        summaryMemory: {
            ...MEMORY_SUMMARY_SCHEMA,
            description: "Một đối tượng Ký ức mới, tóm tắt lại toàn bộ các ký ức đã cung cấp."
        }
    },
    required: ['summaryMemory']
};

// --- Maintenance Schemas ---

/** Báo cáo từ tính năng "Đồng bộ AI & Sửa lỗi". */
const WORLD_HEALING_REPORT_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        problems_found: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Một danh sách các mâu thuẫn hoặc thiếu sót được phát hiện." },
        actions_taken: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Một danh sách các hành động đã được thực hiện để sửa chữa." },
        summary: { type: Type.STRING, description: "Một tóm tắt ngắn gọn về 'sức khỏe' chung của thế giới." }
    },
    required: ["problems_found", "actions_taken", "summary"]
};

/** Phản hồi đầy đủ từ tính năng "Đồng bộ AI & Sửa lỗi". */
export const WORLD_HEALING_RESPONSE_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        report: WORLD_HEALING_REPORT_SCHEMA,
        directives: { type: Type.ARRAY, items: DIRECTIVE_SCHEMA, description: "Danh sách các mệnh lệnh để sửa chữa các lỗi." }
    },
    required: ["report", "directives"]
};

/** Bổ sung vật phẩm và mối quan hệ còn thiếu. */
export const ITEM_RELATIONSHIP_SUPPLEMENT_SCHEMA = {
    type: Type.OBJECT,
    description: "Schema để AI trả về một danh sách các mệnh lệnh để bổ sung các vật phẩm và mối quan hệ còn thiếu.",
    properties: {
        directives: { type: Type.ARRAY, description: "Một danh sách các mệnh lệnh để thêm hoặc cập nhật các stat.", items: DIRECTIVE_SCHEMA }
    },
    required: ["directives"]
};

/** Cập nhật các nhân vật. */
export const UPDATED_CHARACTERS_SCHEMA = {
    type: Type.OBJECT,
    description: "Dùng để trả về phiên bản cập nhật của PC và các NPC.",
    properties: {
        updatedPc: CHARACTER_SCHEMA,
        updatedNpcs: { type: Type.ARRAY, items: CHARACTER_SCHEMA },
    },
    required: ['updatedPc', 'updatedNpcs'],
};

/** Mô phỏng và làm giàu thế giới. */
export const WORLD_SIMULATION_SCHEMA = {
    type: Type.OBJECT,
    description: "Dùng cho tính năng 'Thế giới Tự chữa lành' và Mô phỏng Thế giới.",
    properties: {
        updatedNpcs: { type: Type.ARRAY, items: CHARACTER_SCHEMA, description: "Danh sách các NPC đã được cập nhật." },
        updatedFactions: { type: Type.ARRAY, items: FACTION_SCHEMA, description: "Danh sách các phe phái đã được cập nhật." },
        worldNews: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Một hoặc hai (1-2) thông báo ngắn gọn về các sự kiện quan trọng nhất." },
    },
    required: ['updatedNpcs', 'updatedFactions', 'worldNews'],
};

/** Phân tích dữ liệu lớn. */
export const BIG_DATA_ANALYSIS_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        hiddenRelationships: {
            type: Type.ARRAY,
            description: "Danh sách các mối quan hệ tiềm ẩn.",
            items: { type: Type.OBJECT, properties: { character1: { type: Type.STRING }, character2: { type: Type.STRING }, relationship: { type: Type.STRING }, evidence: { type: Type.STRING } }, required: ['character1', 'character2', 'relationship', 'evidence'] }
        },
        futurePredictions: {
            type: Type.ARRAY,
            description: "Danh sách các sự kiện có thể xảy ra trong tương lai.",
            items: { type: Type.OBJECT, properties: { prediction: { type: Type.STRING }, reasoning: { type: Type.STRING } }, required: ['prediction', 'reasoning'] }
        },
        strategicAdvice: {
            type: Type.ARRAY,
            description: "Các lời khuyên chiến lược cho người chơi.",
            items: { type: Type.OBJECT, properties: { advice: { type: Type.STRING }, justification: { type: Type.STRING } }, required: ['advice', 'justification'] }
        }
    },
    required: ["hiddenRelationships", "futurePredictions", "strategicAdvice"]
};
