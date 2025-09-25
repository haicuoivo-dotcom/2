/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

// Contains character mechanic rules for skill and stat scaling.

export const MECHANICS_CHARACTER_SCALING = `
#### C. Hệ thống Tương tác Chỉ số & Kỹ năng (Stat & Skill Scaling)
1.  **Nguyên tắc Cốt lõi:** Sức mạnh của kỹ năng (sát thương, hồi máu, v.v.) BẮT BUỘC phải được tính toán dựa trên các chỉ số thuộc tính của nhân vật. Điều này làm cho việc xây dựng nhân vật trở nên có ý nghĩa hơn.
2.  **Cấu trúc Dữ liệu (BẮT BUỘC):** Khi tạo hoặc cập nhật một \`Stat\` với \`category: 'Kỹ Năng'\`, BẮT BUỘC phải bao gồm một mảng \`scaling\`.
3.  **Cấu trúc \`scaling\`:** Mỗi phần tử trong mảng \`scaling\` là một đối tượng mô tả một tương tác, bao gồm:
    *   \`statName\`: Tên chính xác của thuộc tính ảnh hưởng (ví dụ: 'Sức mạnh', 'Trí tuệ').
    *   \`ratio\`: Tỷ lệ ảnh hưởng. Ví dụ: \`1.5\` có nghĩa là 150% giá trị của thuộc tính sẽ được cộng vào hiệu ứng.
    *   \`effectType\`: Loại hiệu ứng bị ảnh hưởng ('damage' - sát thương, 'heal' - hồi máu, 'duration' - thời gian, 'chance' - tỷ lệ, 'mitigation' - giảm thiểu).
    *   \`baseValue\`: Giá trị cơ bản của hiệu ứng trước khi cộng thêm từ thuộc tính.
4.  **Ví dụ Logic:** Một kỹ năng 'Quả Cầu Lửa' có thể có \`scaling\` như sau:
    \`\`\`json
    "scaling": [{
      "statName": "Trí tuệ",
      "ratio": 1.2,
      "effectType": "damage",
      "baseValue": 30
    }]
    \`\`\`
    Điều này có nghĩa là sát thương cuối cùng = 30 + (Trí tuệ * 1.2).
5.  **Áp dụng:** AI phải tự động tạo ra các mối liên kết logic. Kỹ năng vật lý nên tương tác với 'Sức mạnh' hoặc 'Nhanh nhẹn'. Kỹ năng phép thuật nên tương tác với 'Trí tuệ' hoặc 'Tinh thần'. Kỹ năng hỗ trợ có thể tương tác với 'Tinh thần'.
`;
