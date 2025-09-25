

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { Type } from "@google/genai";
import { STAT_SCHEMA } from "../stat";
import { CHARACTER_PROPERTIES_DESCRIPTIVE } from '../parts/characterParts';

/** Schema for AI to suggest a new character based on user input. */
export const CHARACTER_SUGGESTION_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        name: { type: Type.STRING, description: "Tên đầy đủ của nhân vật (có thể bao gồm họ)." },
        species: { type: Type.STRING, description: "Chủng tộc của nhân vật (ví dụ: 'Người', 'Elf', 'Yêu tộc')." },
        linhCan: CHARACTER_PROPERTIES_DESCRIPTIVE.linhCan,
        backstory: { type: Type.STRING, description: "BẮT BUỘC tóm tắt ngắn gọn (2-4 câu) tiểu sử và nguồn gốc." },
        stats: { type: Type.ARRAY, items: STAT_SCHEMA, description: "Danh sách các chỉ số, kỹ năng, và vật phẩm khởi đầu." },
    },
    required: ['name', 'species', 'backstory', 'stats'],
};

/** Schema for AI to suggest a world summary. */
export const WORLD_SUMMARY_SUGGESTION_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        worldSummary: {
            type: Type.STRING,
            description: "Một bản tóm tắt thế giới chi tiết và hấp dẫn (4-6 đoạn văn), bao gồm lịch sử, địa lý, các phe phái, hệ thống sức mạnh, và xung đột chính."
        }
    },
    required: ['worldSummary']
};

/** Tạo các kỹ năng mới cho thế giới. */
export const WORLD_SKILLS_GENERATION_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        skills: { type: Type.ARRAY, description: "Một danh sách các kỹ năng hoặc khả năng mới được tạo ra.", items: STAT_SCHEMA }
    },
    required: ['skills']
};