/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { Type } from "@google/genai";
import { DIRECTIVE_SCHEMA } from "./turn";

// This file contains schemas related to world maintenance and error correction.

/** Báo cáo từ tính năng "Đồng bộ AI & Sửa lỗi". */
export const WORLD_HEALING_REPORT_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        problems_found: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Một danh sách các mâu thuẫn hoặc thiếu sót được phát hiện trong trạng thái game." },
        actions_taken: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Một danh sách các hành động đã được thực hiện để sửa chữa các vấn đề đã phát hiện." },
        summary: { type: Type.STRING, description: "Một tóm tắt ngắn gọn về 'sức khỏe' chung của thế giới sau khi đồng bộ." }
    },
    required: ["problems_found", "actions_taken", "summary"]
};

/** Phản hồi đầy đủ từ tính năng "Đồng bộ AI & Sửa lỗi". */
export const WORLD_HEALING_RESPONSE_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        report: WORLD_HEALING_REPORT_SCHEMA,
        directives: { type: Type.ARRAY, items: DIRECTIVE_SCHEMA, description: "Danh sách các mệnh lệnh để mã game thực thi và sửa chữa các lỗi đã được báo cáo." }
    },
    required: ["report", "directives"]
};