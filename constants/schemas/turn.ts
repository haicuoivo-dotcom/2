/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { Type } from "@google/genai";
import { STAT_SCHEMA } from "./stat";
import { CHARACTER_SCHEMA } from "./character";
// REFACTOR: Import the reusable action schema.
import { ACTION_SUGGESTION_SCHEMA } from './action';

/**
 * Schema cho thời gian trong game.
 */
const GAME_TIME_SCHEMA = {
    type: Type.OBJECT,
    description: "Đối tượng đại diện cho thời gian trong game.",
    properties: {
        year: { type: Type.INTEGER },
        month: { type: Type.INTEGER },
        day: { type: Type.INTEGER },
        hour: { type: Type.INTEGER },
        minute: { type: Type.INTEGER },
        weather: { type: Type.STRING, description: "Mô tả thời tiết hiện tại (ví dụ: 'Trời quang mây tạnh', 'Mưa phùn', 'Bão tuyết')." },
    },
    required: ['year', 'month', 'day', 'hour', 'minute', 'weather']
};

/**
 * Schema cho một thông báo gửi đến người chơi.
 */
const MESSAGE_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        text: { type: Type.STRING, description: "Nội dung của thông báo." }
    },
    required: ['text']
};

/** Tóm tắt một lượt chơi để tạo thành ký ức. */
export const MEMORY_SUMMARY_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        text: { type: Type.STRING, description: "Tóm tắt ngắn gọn nhưng đầy đủ về sự kiện chính trong lượt chơi." },
        tags: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Các từ khóa liên quan đến ký ức." },
        relevanceScore: { type: Type.INTEGER, description: 'Điểm từ 1 (không quan trọng) đến 100 (thay đổi cốt truyện).' },
        reasoning: { type: Type.STRING, description: 'Giải thích ngắn gọn cho điểm số liên quan.' }
    },
    required: ['text', 'relevanceScore', 'reasoning']
};

/** Các tham số cho một mệnh lệnh. */
export const DIRECTIVE_ARGS_SCHEMA = {
    type: Type.OBJECT,
    description: "Các tham số cho mệnh lệnh. Nội dung của 'args' BẮT BUỘC phải phù hợp với 'command' đã chỉ định. Ví dụ: command 'UPDATE_STAT' yêu cầu 'characterName', 'statName', và 'value'.",
    properties: {
        characterName: { type: Type.STRING, description: "Tên định danh (`name`) của nhân vật mục tiêu. BẮT BUỘC phải khớp với trường `name`, TUYỆT ĐỐI không dùng `displayName`." },
        statName: { type: Type.STRING, description: "Tên của Stat mục tiêu." },
        property: { type: Type.STRING, description: "(CHỈ DÙNG CHO 'UPDATE_CHARACTER_PROPERTY'). Tên của thuộc tính nhân vật cần cập nhật (ví dụ: 'physicalAppearance', 'backstory')." },
        value: { type: Type.STRING, description: "(CHỈ DÙNG CHO 'UPDATE_STAT' và 'UPDATE_CHARACTER_PROPERTY'). Giá trị mới cho Stat hoặc thuộc tính." },
        stat: STAT_SCHEMA,
        characterData: CHARACTER_SCHEMA,
        type: { type: Type.STRING, description: "(CHỈ DÙNG CHO 'CREATE_KB_ENTITY' và 'UPDATE_KB_ENTITY'). Loại thực thể KnowledgeBase. BẮT BUỘC phải là một trong các giá trị sau: 'locations', 'factions'." },
        name: { type: Type.STRING, description: "(CHỈ DÙNG CHO 'CREATE_KB_ENTITY' và 'UPDATE_KB_ENTITY'). Tên định danh của thực thể." },
        description: { type: Type.STRING, description: "(CHỈ DÙNG CHO 'CREATE_KB_ENTITY' và 'UPDATE_KB_ENTITY'). Mô tả của thực thể." },
        coordinates: { type: Type.OBJECT, properties: { x: { type: Type.INTEGER }, y: { type: Type.INTEGER } } }
    }
};

/** Mệnh lệnh mà AI gửi đến mã nguồn để thay đổi trạng thái game. */
export const DIRECTIVE_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        command: { type: Type.STRING, enum: ['UPDATE_STAT', 'ADD_STAT', 'REMOVE_STAT', 'CREATE_NPC', 'UPDATE_CHARACTER_PROPERTY', 'CREATE_KB_ENTITY', 'UPDATE_KB_ENTITY', 'UPDATE_PLAYER_POSITION'], description: "Tên của mệnh lệnh. BẮT BUỘC phải là một trong các giá trị enum được cung cấp." },
        args: DIRECTIVE_ARGS_SCHEMA
    },
    required: ['command', 'args']
};

/**
 * Schema nền tảng cho các thành phần tường thuật của một lượt chơi.
 */
export const TURN_NARRATIVE_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        story: { type: Type.STRING, description: "Văn bản tường thuật diễn biến của lượt chơi. BẮT BUỘC tuân thủ các quy tắc định dạng (DIALOGUE, gắn thẻ thực thể)." },
        gameTime: GAME_TIME_SCHEMA,
        messages: { type: Type.ARRAY, items: MESSAGE_SCHEMA, description: "Các thông báo quan trọng cho người chơi (ví dụ: 'Bạn nhận được 50 EXP').", maxItems: 3 },
        actions: { type: Type.ARRAY, items: ACTION_SUGGESTION_SCHEMA, description: "BẮT BUỘC phải có BỐN (4) hành động gợi ý đa dạng và mang tính chiến thuật cho lượt tiếp theo." },
    }
};

/**
 * Schema nền tảng cho các kết quả logic của một lượt chơi.
 */
export const TURN_OUTCOME_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        summary: MEMORY_SUMMARY_SCHEMA,
        directives: { type: Type.ARRAY, description: "Danh sách các mệnh lệnh để mã game thực thi. Đây là CƠ CHẾ CHÍNH để thay đổi trạng thái game.", items: DIRECTIVE_SCHEMA },
        isIntercourseSceneStart: { type: Type.BOOLEAN, description: "(Tùy chọn) Đặt thành `true` NẾU lượt này bắt đầu một cảnh ân ái." },
        newChildrenBorn: { type: Type.INTEGER, description: "(Tùy chọn) Số lượng con cái được sinh ra trong lượt này." },
    }
};


/**
 * Schema tổng thể cho toàn bộ dữ liệu trả về sau mỗi lượt chơi.
 */
export const DIRECTIVE_BASED_TURN_UPDATE_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        ...TURN_NARRATIVE_SCHEMA.properties,
        ...TURN_OUTCOME_SCHEMA.properties,
    },
    required: ['story', 'gameTime', 'summary', 'actions', 'directives']
};

/** Hành động chiến đấu của một nhân vật. */
export const COMBAT_ACTION_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        actionDescription: { type: Type.STRING, description: "Mô tả đầy đủ hành động theo định dạng lệnh. Ví dụ: 'Sử dụng kỹ năng: Quả Cầu Lửa lên [NPC:Tên]' hoặc 'Tấn công [PC:Tên]'." },
        dialogue: { type: Type.STRING, description: "(Tùy chọn) Một câu thoại ngắn mà nhân vật nói khi thực hiện hành động." }
    },
    required: ['actionDescription']
};