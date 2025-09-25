/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { Type } from "@google/genai";

// This file defines schemas related to player and AI actions.

/**
 * Common properties for an action.
 */
const ACTION_PROPERTIES = {
    description: { type: Type.STRING, description: "Mô tả ngắn gọn, rõ ràng, mang tính hành động về lựa chọn." },
    successChance: { type: Type.INTEGER, description: "(Tùy chọn) Tỷ lệ thành công của hành động (từ 0 đến 100)." },
    benefit: { type: Type.STRING, description: "(Tùy chọn) Lợi ích có thể nhận được nếu thành công." },
    risk: { type: Type.STRING, description: "(Tùy chọn) Rủi ro có thể gặp phải nếu thất bại." },
    timeCost: { type: Type.STRING, description: "(Tùy chọn) Thời gian trong game mà hành động này tiêu tốn (ví dụ: '5 phút', '2 giờ')." }
};

/**
 * Schema for an action suggestion from the AI. Only description is required.
 */
export const ACTION_SUGGESTION_SCHEMA = {
    type: Type.OBJECT,
    properties: ACTION_PROPERTIES,
    required: ['description']
};

/**
 * Schema for the analysis of a custom player action. All properties are required.
 */
export const ACTION_ANALYSIS_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        successChance: ACTION_PROPERTIES.successChance,
        benefit: ACTION_PROPERTIES.benefit,
        risk: ACTION_PROPERTIES.risk,
        timeCost: ACTION_PROPERTIES.timeCost,
    },
    required: ['successChance', 'benefit', 'risk', 'timeCost']
};
