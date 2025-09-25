/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { Type } from "@google/genai";

/** Các thuộc tính cốt lõi của một Phe phái. */
const FACTION_PROPERTIES_CORE = {
    id: { type: Type.STRING, description: "ID định danh duy nhất của phe phái. KHI CẬP NHẬT, BẮT BUỘC GIỮ NGUYÊN ID GỐC." },
    name: { type: Type.STRING, description: "Tên định danh duy nhất của phe phái." },
    description: { type: Type.STRING, description: "Mô tả chi tiết về lịch sử, mục tiêu, và văn hóa của phe phái." },
    factionType: { type: Type.STRING, description: "Loại phe phái (ví dụ: 'Quốc gia', 'Gia tộc', 'Tông Môn')." },
    leaderId: { type: Type.STRING, description: "ID của nhân vật lãnh đạo, BẮT BUỘC phải khớp với ID của một nhân vật đã được tạo." },
    territories: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { locationId: { type: Type.STRING }, locationName: { type: Type.STRING } }, required: ['locationId', 'locationName'] } },
};

/** Các thuộc tính về tài nguyên của một Phe phái. */
const FACTION_PROPERTIES_RESOURCES = {
    resources: { type: Type.OBJECT, properties: { treasury: { type: Type.INTEGER, description: "Ngân khố" }, manpower: { type: Type.INTEGER, description: "Nhân lực" }, food: { type: Type.INTEGER, description: "Lương thực" } }, required: ['treasury', 'manpower', 'food'] },
};

/** Các thuộc tính về chỉ số của một Phe phái. */
const FACTION_PROPERTIES_STATS = {
    stats: { type: Type.OBJECT, properties: { military: { type: Type.INTEGER, description: "Sức mạnh quân sự" }, economy: { type: Type.INTEGER, description: "Sức mạnh kinh tế" }, influence: { type: Type.INTEGER, description: "Tầm ảnh hưởng" }, stability: { type: Type.INTEGER, description: "Sự ổn định" } }, required: ['military', 'economy', 'influence', 'stability'] },
};

/** Các thuộc tính về quan hệ ngoại giao của một Phe phái. */
const FACTION_PROPERTIES_RELATIONS = {
    relations: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { factionId: { type: Type.STRING }, status: { type: Type.STRING, enum: ['ally', 'neutral', 'hostile', 'war'] } }, required: ['factionId', 'status'] } },
};

/** Các thuộc tính về chính sách của một Phe phái. */
const FACTION_PROPERTIES_POLICIES = {
    policies: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { id: { type: Type.STRING }, name: { type: Type.STRING }, description: { type: Type.STRING }, isActive: { type: Type.BOOLEAN } }, required: ['id', 'name', 'description', 'isActive'] } },
};

/**
 * Schema cho một phe phái.
 * Được xây dựng bằng cách hợp nhất các khối thuộc tính đã định nghĩa.
 */
export const FACTION_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        ...FACTION_PROPERTIES_CORE,
        ...FACTION_PROPERTIES_RESOURCES,
        ...FACTION_PROPERTIES_STATS,
        ...FACTION_PROPERTIES_RELATIONS,
        ...FACTION_PROPERTIES_POLICIES,
    },
    required: ['id', 'name', 'description', 'factionType', 'leaderId', 'territories', 'resources', 'stats', 'relations', 'policies']
};