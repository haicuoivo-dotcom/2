/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { Type } from "@google/genai";
import { STAT_SCHEMA } from "./stat";
import { CHARACTER_SCHEMA } from "./character";
import { FACTION_SCHEMA } from "./faction";
import { KNOWLEDGE_ENTITY_SCHEMA } from "./utility";
import { TURN_NARRATIVE_SCHEMA } from "./turnProcessing";

// This file consolidates all schemas used during the world creation process.

// --- Schemas for AI Suggestions ---

/** Schema for suggesting the initial relationships of a new character. */
export const INITIAL_RELATIONSHIP_SUGGESTION_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        npcDescription: { type: Type.STRING, description: "Mô tả ngắn gọn (1-2 câu) về ngoại hình, tính cách, và vai trò của NPC này." },
        relationshipType: { type: Type.STRING, description: "Loại quan hệ với nhân vật chính (ví dụ: 'Sư phụ', 'Kẻ thù', 'Bạn thời thơ ấu')." },
        affinity: { type: Type.INTEGER, description: "Điểm thiện cảm ban đầu (từ -100 đến 100)." },
    },
    required: ['npcDescription', 'relationshipType', 'affinity'],
};

/** Schema for AI to suggest a new character based on user input. */
export const CHARACTER_SUGGESTION_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        name: { type: Type.STRING, description: "Tên đầy đủ của nhân vật (có thể bao gồm họ)." },
        species: { type: Type.STRING, description: "Chủng tộc của nhân vật (ví dụ: 'Người', 'Elf', 'Yêu tộc')." },
        linhCan: { type: Type.STRING, description: "(Chỉ dùng cho Tu Tiên) Mô tả về loại và phẩm chất linh căn của nhân vật." },
        backstory: { type: Type.STRING, description: "BẮT BUỘC tóm tắt ngắn gọn (2-4 câu) tiểu sử và nguồn gốc." },
        stats: { type: Type.ARRAY, items: STAT_SCHEMA, description: "Danh sách các chỉ số, kỹ năng, và vật phẩm khởi đầu." },
        initialRelationships: {
            type: Type.ARRAY,
            description: "Tạo ra một số lượng Mối quan hệ Ban đầu theo yêu cầu. Mỗi mối quan hệ phải mô tả một NPC mới, loại quan hệ và điểm thiện cảm.",
            items: INITIAL_RELATIONSHIP_SUGGESTION_SCHEMA
        }
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


// --- Schemas for Initial World Creation Steps ---

/** Schema for defining a relationship during world creation. */
const WORLD_CREATE_RELATIONSHIP_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        character1: { type: Type.STRING, description: "Tên của nhân vật thứ nhất (PC hoặc NPC)." },
        character2: { type: Type.STRING, description: "Tên của nhân vật thứ hai (PC hoặc NPC)." },
        type: { type: Type.STRING, description: "Loại quan hệ từ character1 đến character2." },
        affinity: { type: Type.INTEGER, description: "Điểm thiện cảm." },
    },
    required: ['character1', 'character2', 'type', 'affinity'],
};

/** Tạo thế giới nhanh, tái sử dụng TURN_NARRATIVE_SCHEMA. */
export const QUICK_CREATE_SCHEMA = {
    type: Type.OBJECT,
    description: "Schema để tạo một thế giới game hoàn chỉnh trong một lần gọi API.",
    properties: {
        playerCharacter: CHARACTER_SCHEMA,
        // FIX: Updated description to be more robust, encouraging AI to create NPCs based on context rather than a fixed number.
        initialNpcs: { type: Type.ARRAY, items: CHARACTER_SCHEMA, description: "Mệnh lệnh về NPC Ban đầu (QUAN TRỌNG): Dựa trên loại địa điểm của cảnh mở đầu và bối cảnh thế giới, hãy tạo ra 3-5 NPC ban đầu sinh sống hoặc có mặt tại địa điểm đó. Với mỗi NPC, BẮT BUỘC phải cung cấp: 1. Tên & Danh xưng 2. Ngoại hình 3. Tính cách & Vai trò 4. Mối quan hệ ban đầu logic với người chơi hoặc các NPC khác." },
        relationships: { type: Type.ARRAY, description: "Danh sách các mối quan hệ ban đầu giữa PC và các NPC. AI BẮT BUỘC phải tạo NPC tương ứng trong mảng 'initialNpcs'.", items: WORLD_CREATE_RELATIONSHIP_SCHEMA },
        factions: { type: Type.ARRAY, items: FACTION_SCHEMA, description: "Tạo 2-3 phe phái chính." },
        title: { type: Type.STRING },
        worldSummary: { type: Type.STRING, description: "Tóm tắt thế giới chi tiết (3-5 đoạn văn)." },
        ...TURN_NARRATIVE_SCHEMA.properties,
    },
    required: ['playerCharacter', 'initialNpcs', 'factions', 'title', 'worldSummary', 'story', 'gameTime', 'actions']
};

/** Viết cảnh mở đầu, tái sử dụng TURN_NARRATIVE_SCHEMA. */
export const SCENE_WRITING_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        title: { type: Type.STRING, description: "Tên của thế giới game." },
        worldSummary: { type: Type.STRING, description: "Tóm tắt lịch sử, bối cảnh, và xung đột của thế giới (3-5 đoạn văn)." },
        ...TURN_NARRATIVE_SCHEMA.properties,
    },
    required: ['title', 'worldSummary', 'story', 'gameTime', 'actions']
};

/** Làm giàu thế giới bằng các thực thể mới. */
export const WORLD_ENRICHMENT_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        locations: { type: Type.ARRAY, items: KNOWLEDGE_ENTITY_SCHEMA },
        factions: { type: Type.ARRAY, items: FACTION_SCHEMA },
        npcs: { type: Type.ARRAY, items: CHARACTER_SCHEMA }
    },
    required: ['locations', 'factions', 'npcs']
};

/** Gợi ý điểm khởi đầu từ Đồng nhân */
export const STARTING_POINT_SUGGESTION_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    suggestions: {
      type: Type.ARRAY,
      description: "Một danh sách các gợi ý về điểm khởi đầu câu chuyện.",
      items: {
        type: Type.OBJECT,
        properties: {
          time: { type: Type.STRING, description: "Mô tả thời điểm bắt đầu trong câu chuyện (ví dụ: 'Ngay sau khi nhân vật chính tốt nghiệp học viện')." },
          place: { type: Type.STRING, description: "Địa điểm bắt đầu (ví dụ: 'Tại cổng làng Lá')." },
          description: { type: Type.STRING, description: "Mô tả ngắn gọn (1-2 câu) về lý do tại sao đây là một điểm khởi đầu thú vị." }
        },
        required: ['time', 'place', 'description']
      }
    }
  },
  required: ['suggestions']
};
