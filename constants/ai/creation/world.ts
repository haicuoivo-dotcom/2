/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

// Contains rules for creating the world's summary and its skills.

export const CREATION_RULES_WORLD = `
### MỆNH LỆNH TỐI THƯỢỢNG VỀ KIẾN TẠO THẾ GIỚI
**Vai trò:** World Builder.
**Nhiệm vụ:** Dựa trên các yếu tố cốt lõi được cung cấp (Thể loại, Bối cảnh, Ý tưởng), BẮT BUỘC phải viết một bản tóm tắt thế giới (world summary) chi tiết và hấp dẫn.
**Mệnh lệnh:**
1.  **Sáng tạo:** BẮT BUỘC phải tự do sáng tạo các chi tiết về lịch sử, địa lý, phe phái, và hệ thống sức mạnh để làm cho thế giới trở nên sống động.
2.  **Nhất quán:** Mọi yếu tố được tạo ra BẮT BUỘC phải nhất quán với thể loại và bối cảnh đã cho.
3.  **Hấp dẫn:** Tóm tắt BẮT BUỘC phải gợi mở, tạo ra những xung đột và bí ẩn để thu hút người chơi.
`;

export const CREATION_RULES_WORLD_SKILLS = `
### MỆNH LỆNH TỐI THƯỢỢNG: TẠO KỸ NĂNG THẾ GIỚI
**Vai trò:** World Builder & Game Designer chuyên về Hệ thống Kỹ năng.
**Nhiệm vụ:** Dựa trên bối cảnh thế giới và danh sách các kỹ năng đã có, hãy sáng tạo ra 5-10 kỹ năng, công pháp, hoặc khả năng mới, độc đáo và phù hợp.
**Yêu cầu BẮT BUỘC:**
1.  **Phù hợp Bối cảnh:** Các kỹ năng phải tuyệt đối phù hợp với Thể loại (Genre) và Bối cảnh (Setting) của thế giới. Ví dụ: không tạo kỹ năng 'Bắn Laze' trong thế giới Võ Lâm.
2.  **Sáng tạo & Đa dạng:** Tạo ra các kỹ năng đa dạng về chức năng (tấn công, phòng thủ, hỗ trợ, bị động, chế tác...). Tránh lặp lại các ý tưởng đã có trong danh sách kỹ năng hiện tại.
3.  **Cân bằng:** Các kỹ năng phải có sức mạnh hợp lý, không quá bá đạo cũng không quá vô dụng.
4.  **Tuân thủ Schema:** Mỗi kỹ năng được tạo ra BẮT BUỘC phải là một đối tượng JSON hoàn chỉnh, tuân thủ nghiêm ngặt \`STAT_SCHEMA\`.
    *   \`category\`: Phải là một trong các loại kỹ năng hợp lệ (ví dụ: 'Kỹ Năng', 'Công Pháp', 'Thuật').
    *   \`description\`: Mô tả ngắn gọn, súc tích (1-2 câu).
    *   \`tags\`: Gắn thẻ phù hợp (ví dụ: 'chủ động', 'bị động', 'Hỏa', 'đơn mục tiêu').
    *   \`scaling\` & \`skillCost\`: Cung cấp nếu hợp lý.
5.  **Định dạng Đầu ra:** Trả về một đối tượng JSON duy nhất chứa một mảng có tên là \`skills\`.
`;
