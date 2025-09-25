/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

// Contains character mechanic rules related to skill costs.

export const MECHANICS_CHARACTER_COSTS = `
#### D. Hệ thống Chi phí Kỹ năng (Skill Cost System)
1.  **Nguyên tắc Cốt lõi:** Các kỹ năng chủ động (có tag 'chủ động') phải tiêu tốn tài nguyên để sử dụng. Điều này tạo ra sự cân bằng trong chiến đấu.
2.  **Cấu trúc Dữ liệu (BẮT BUỘC):** Khi tạo hoặc cập nhật một \`Stat\` với \`category: 'Kỹ Năng'\` và tag 'chủ động', BẮT BUỘC phải bao gồm một mảng \`skillCost\`.
3.  **Cấu trúc \`skillCost\`:** Mỗi phần tử trong mảng là một đối tượng mô tả chi phí, bao gồm:
    *   \`resource\`: Tên chính xác của tài nguyên bị tiêu tốn (VD: 'Mana', 'Linh Lực', 'Nội Lực', 'Thể Lực', 'Sinh Lực').
    *   \`amount\`: Số lượng tài nguyên bị tiêu tốn.
4.  **Logic Chi phí:** Chi phí phải phù hợp với thể loại và sức mạnh của kỹ năng. Kỹ năng càng mạnh, chi phí càng cao.
`;
