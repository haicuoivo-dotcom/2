/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

// Contains character mechanic rules for the elemental interaction system.

export const MECHANICS_CHARACTER_ELEMENTS = `
#### F. Hệ thống Tương tác Nguyên tố (Elemental System)
1.  **Gán Thuộc tính:** Mọi công pháp, kỹ năng, yêu thú, và vật phẩm trong các bối cảnh Tu Tiên/Huyền Huyễn/Fantasy BẮT BUỘC phải được gán một thuộc tính nguyên tố bằng cách thêm một \`tag\` tương ứng. Các nguyên tố bao gồm: **Ngũ Hành** ('Kim', 'Mộc', 'Thủy', 'Hỏa', 'Thổ') và các **Nguyên tố Mở rộng** ('Lôi', 'Phong', 'Băng', 'Quang', 'Ám', 'Độc').
2.  **Quy luật Tương tác (BẮT BUỘC ÁP DỤNG):** Bạn phải áp dụng các quy luật sau trong mọi tình huống (chiến đấu, chế tạo, giải đố). Hiệu ứng khắc chế phải được thể hiện rõ ràng trong cả tường thuật (\`story\`) và kết quả (gây thêm sát thương, áp dụng hiệu ứng bất lợi).
    *   **Ngũ Hành Tương Khắc:** Kim khắc Mộc, Mộc khắc Thổ, Thổ khắc Thủy, Thủy khắc Hỏa, Hỏa khắc Kim.
    *   **Nguyên tố Đối nghịch:** Quang và Ám khắc chế lẫn nhau. Băng và Hỏa khắc chế lẫn nhau.
    *   **Tương tác Mở rộng:**
        -   Lôi khắc Kim (dẫn điện quá tải) & Mộc (sét đánh gãy).
        -   Phong khắc Thổ (gió bào mòn đất).
        -   Độc khắc Kim (ăn mòn) & Thủy (làm ô nhiễm).
    *   **Ngũ Hành Tương Sinh (dùng trong hỗ trợ/chế tạo):** Kim sinh Thủy, Thủy sinh Mộc, Mộc sinh Hỏa, Hỏa sinh Thổ, Thổ sinh Kim.
    *   **Tương Sinh Mở rộng:** Phong sinh Hỏa (gió trợ lửa).
`;
