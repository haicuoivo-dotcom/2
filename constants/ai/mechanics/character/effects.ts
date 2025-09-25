/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

// Contains character mechanic rules for advanced combat effects.

export const MECHANICS_CHARACTER_EFFECTS = `
#### K. Hệ thống Hiệu ứng Chiến đấu Chuyên sâu (Advanced Combat Effects System)
Đây là các hiệu ứng phức tạp hơn các thay đổi chỉ số thông thường. Bạn BẮT BUỘC phải sử dụng các cơ chế sau để tạo ra chúng.
1.  **Sát thương theo Thời gian (DoT) & Khống chế (CC):**
    -   **Cơ chế:** Các hiệu ứng như **'Xuất huyết'**, **'Trúng độc'**, **'Bỏng'**, **'Tê liệt'** BẮT BUỘC phải được tạo ra dưới dạng một \`Stat\` với \`category: 'Trạng thái'\`.
    -   **Quan trọng nhất:** \`description\` của Trạng thái này phải mô tả rõ ràng, định lượng và có thời gian. Mã nguồn sẽ dựa vào mô tả này để áp dụng hiệu ứng.
    -   **Ví dụ:**
        -   **Xuất huyết:** \`"name": "Trạng thái Xuất huyết", "description": "Mất 15 Sinh Lực mỗi lượt. Hiệu ứng kéo dài trong 3 lượt."\`
        -   **Trúng độc:** \`"name": "Trạng thái Trúng độc", "description": "Mất 10 Sinh Lực mỗi lượt và Giảm Sát Thương -10%. Kéo dài 5 lượt."\`
        -   **Tê liệt:** \`"name": "Trạng thái Tê liệt", "description": "Không thể hành động. Kéo dài 2 lượt."\`
    -   **Logic:** Khi một kỹ năng hoặc vật phẩm gây ra các hiệu ứng này, bạn phải ra mệnh lệnh \`ADD_STAT\` để áp dụng Trạng thái tương ứng lên mục tiêu.
2.  **Hồi máu (Heal):**
    -   **Cơ chế:** Sử dụng \`StatEffect\` với \`targetStat: 'Sinh Lực'\` và \`modifier\` là một số dương (ví dụ: \`'+50'\`).
3.  **Giảm Sát thương (Damage Reduction):**
    -   **Cơ chế:** Sử dụng \`StatEffect\` để ảnh hưởng đến một thuộc tính mới có tên là **'Giảm Sát Thương'**.
    -   **Ví dụ (trên một Trạng thái):** \`"name": "Thân Thể Cứng Cáp", "effects": [{ "targetStat": "Giảm Sát Thương", "modifier": "+15%" }]\`
    -   **Ví dụ (trên một trang bị):** Một chiếc khiên có thể có \`effects: [{ "targetStat": "Giảm Sát Thương", "modifier": "+5%" }]\`
4.  **Hút máu (Life Steal) & Phản sát thương (Damage Reflection):**
    -   **Cơ chế:** Các hiệu ứng này được quản lý thông qua \`tags\` trên vũ khí, trang bị hoặc kỹ năng.
    -   **Định dạng Tag (BẮT BUỘC):**
        -   **Hút máu:** \`lifesteal-[phần trăm]\` (ví dụ: \`'lifesteal-20'\` cho 20% hút máu).
        -   **Phản sát thương:** \`reflect-[phần trăm]\` (ví dụ: \`'reflect-15'\` cho 15% phản sát thương).
    -   **Mô tả:** \`description\` của vật phẩm/kỹ năng phải mô tả rõ ràng hiệu ứng này.
    -   **Ví dụ (Vũ khí):** Một thanh 'Ma Đao Hút Huyết' có thể có \`tags: ["Kiếm", "ma đạo", "lifesteal-15"]\` và \`description: "Thanh ma đao này hồi lại cho chủ nhân một lượng Sinh Lực bằng 15% sát thương gây ra."\`
    -   **Ví dụ (Áo giáp):** Một bộ 'Giáp Gai' có thể có \`tags: ["Giáp nặng", "reflect-10"]\` và \`description: "Phản lại 10% sát thương vật lý cận chiến cho kẻ tấn công."\`
`;
