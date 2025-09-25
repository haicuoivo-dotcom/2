/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { Type } from "@google/genai";

// This file contains schemas related to analyzing fan-fiction content.

export const FANFIC_CHARACTER_EXTRACTION_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        characters: {
            type: Type.ARRAY,
            description: "Một danh sách các nhân vật chính và phụ quan trọng được tìm thấy trong văn bản.",
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING, description: "Tên đầy đủ, chính xác của nhân vật." },
                    description: { type: Type.STRING, description: "Một mô tả ngắn gọn (1-2 câu) về vai trò, tính cách, hoặc đặc điểm nổi bật của nhân vật trong truyện." }
                },
                required: ['name', 'description']
            }
        }
    },
    required: ['characters']
};

const FANFIC_SYSTEM_ANALYSIS_ITEM_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        name: { type: Type.STRING, description: "Tên của chỉ số/kỹ năng/vật phẩm/quy tắc." },
        description: { type: Type.STRING, description: "Mô tả ngắn gọn về cơ chế hoạt động của nó." }
    },
    required: ['name', 'description']
};

export const FANFIC_SYSTEM_ANALYSIS_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        coreStats: {
            type: Type.ARRAY,
            description: "Danh sách các chỉ số cốt lõi quyết định sức mạnh chiến đấu trong thế giới này (ví dụ: Chakra, Sức mạnh, Tinh thần lực).",
            items: FANFIC_SYSTEM_ANALYSIS_ITEM_SCHEMA
        },
        energySystem: {
            type: Type.OBJECT,
            description: "Mô tả về hệ thống năng lượng đặc trưng (nếu có, ví dụ: Nen, Haki, Ma thuật).",
            properties: {
                name: { type: Type.STRING, description: "Tên của hệ thống năng lượng." },
                description: { type: Type.STRING, description: "Mô tả chi tiết cách nó hoạt động." }
            }
        },
        keySkills: {
            type: Type.ARRAY,
            description: "Danh sách các kỹ năng, năng lực hoặc chiêu thức tiêu biểu và quan trọng trong IP.",
            items: FANFIC_SYSTEM_ANALYSIS_ITEM_SCHEMA
        },
        keyItems: {
            type: Type.ARRAY,
            description: "Danh sách các vật phẩm hoặc trang bị mang tính biểu tượng, có vai trò quan trọng.",
            items: FANFIC_SYSTEM_ANALYSIS_ITEM_SCHEMA
        },
        worldRules: {
            type: Type.ARRAY,
            description: "Các quy tắc nền tảng, bất biến của vũ trụ đó.",
            items: FANFIC_SYSTEM_ANALYSIS_ITEM_SCHEMA
        }
    },
    required: ['coreStats', 'energySystem', 'keySkills', 'keyItems', 'worldRules']
};

export const FANFIC_SUMMARY_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        worldSummary: { type: Type.STRING, description: "Tóm tắt chi tiết về thế giới." },
        keyPlotPoints: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Các điểm cốt truyện chính." },
        mainCharacters: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING, description: "Tên nhân vật." },
                    description: { type: Type.STRING, description: "Mô tả nhân vật." }
                },
                required: ['name', 'description']
            },
            description: "Danh sách các nhân vật chính."
        },
        worldRules: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Các quy tắc của thế giới." }
    },
    required: ['worldSummary', 'keyPlotPoints', 'mainCharacters', 'worldRules']
};