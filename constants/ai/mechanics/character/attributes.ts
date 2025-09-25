/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

// Contains character mechanic rules related to core attributes, relationships, and progression.

export const MECHANICS_CHARACTER_ATTRIBUTES = `
#### H. Hệ thống Thuộc tính Cốt lõi & Cơ chế Chiến đấu theo Thể loại (Genre-Specific Combat Mechanics)
**MỆNH LỆNH TỐI THƯỢỢNG:** Hệ thống chiến đấu của game đã được đại tu. Giờ đây, mỗi thể loại (\`genre\`) có một bộ thuộc tính cốt lõi và công thức tính sát thương riêng. Bạn BẮT BUỘC phải hiểu và áp dụng các logic sau đây khi tạo nhân vật, kỹ năng, vật phẩm và tường thuật các trận chiến.

**1. Thể loại: Dị Giới Fantasy / Thế Giới Giả Tưởng (Game/Tiểu Thuyết)**
*   **Thuộc tính Cốt lõi:** Sức mạnh, Nhanh nhẹn, Thể chất, Trí tuệ, Tinh thần, May mắn.
*   **Chỉ số Phái sinh:**
    *   \`Tấn Công\`: Bắt nguồn từ \`Sức mạnh\` (vật lý) hoặc \`Trí tuệ\` (phép thuật).
    *   \`Phòng Thủ\`: Bắt nguồn từ \`Thể chất\`.
    *   \`Tốc Độ\`, \`Né Tránh\`, \`Tỷ lệ Chí mạng\`: Bắt nguồn từ \`Nhanh nhẹn\`.
*   **Công thức Sát thương (Logic Cốt lõi):** \`Sát thương cuối cùng ≈ (Tấn Công của người tấn công * Hệ số) - (Phòng Thủ của người phòng thủ * Hệ số)\`.
*   **Yêu cầu khi Tạo:**
    *   **Kỹ năng/Vật phẩm:** Phải tăng cường các thuộc tính cốt lõi trên và các chỉ số phái sinh tương ứng. Ví dụ: một thanh kiếm có thể cho \`+10 Sức mạnh\` và \`+15 Tấn Công\`. Một chiếc áo choàng pháp sư có thể cho \`+15 Trí tuệ\`.
    *   **Tường thuật:** Mô tả các đòn đánh vật lý mạnh mẽ, các phép thuật bùng nổ, và vai trò rõ ràng của giáp trụ trong việc giảm sát thương.

**2. Thể loại: Tu Tiên / Huyền Huyễn / Võ Lâm**
*   **Thuộc tính Cốt lõi:** Căn Cốt, Ngộ Tính, Thần Hồn, Linh Lực/Nội Lực.
*   **Logic Chiến đấu:** Chiến đấu không chỉ dựa vào sức mạnh cơ bắp mà chủ yếu dựa vào sự đối đầu của cảnh giới, độ thâm hậu của linh lực/nội lực và sự huyền ảo của công pháp.
*   **Công thức Sát thương (Logic Cốt lõi):** \`Sát thương cuối cùng ≈ (Sát thương Công pháp Cơ bản) + (Thần Hồn * Tỷ lệ) + (Linh Lực/Nội Lực * Tỷ lệ) - (Phòng thủ của đối phương)\`.
*   **Yêu cầu khi Tạo:**
    *   **Kỹ năng/Vật phẩm:** Phải tập trung vào việc tăng cường các thuộc tính cốt lõi này. Ví dụ: một viên đan dược có thể cho \`+50 Thần Hồn\`, một bộ công pháp có thể tăng mạnh \`Linh Lực\`. Các vật phẩm tăng 'Tấn Công' hoặc 'Phòng Thủ' trực tiếp sẽ ít phổ biến hơn.
    *   **Tường thuật:** Mô tả các trận đấu như sự va chạm của năng lượng (kiếm khí, chưởng phong), sự áp chế của cảnh giới, và sự huyền diệu của các pháp bảo/thần thông.

**3. Thể loại: Đô Thị Hiện Đại / Hậu Tận Thế**
*   **Thuộc tính Cốt lõi:** Nhanh nhẹn, Thể chất, Trí tuệ.
*   **Logic Chiến đấu:** Chiến đấu chủ yếu dựa vào kỹ năng sử dụng vũ khí và trang bị chiến thuật. Các thuộc tính cá nhân ảnh hưởng đến khả năng sống sót và độ chính xác.
*   **Chỉ số Quan trọng:**
    *   \`Tấn Công\`: Thể hiện sát thương cơ bản của vũ khí đang trang bị.
    *   \`Giảm Sát Thương (%)\`: Chỉ số phòng thủ chính, bắt nguồn từ áo giáp, mũ bảo hiểm.
*   **Công thức Sát thương (Logic Cốt lõi):** \`Sát thương cuối cùng ≈ (Tấn Công của Vũ khí) * (1 - Giảm Sát Thương % của người phòng thủ)\`.
*   **Yêu cầu khi Tạo:**
    *   **Kỹ năng/Vật phẩm:** Vật phẩm quan trọng nhất là súng và giáp. Súng sẽ có chỉ số \`Tấn Công\` cao. Áo giáp (ví dụ: áo chống đạn) sẽ cung cấp \`Giảm Sát Thương\`. Kỹ năng thường sẽ mang tính chiến thuật (ví dụ: 'Ngắm Bắn Chính Xác', 'Sơ Cứu Nhanh').
    *   **Tường thuật:** Mô tả các cuộc đấu súng một cách thực tế, tập trung vào việc tìm chỗ nấp, chiến thuật và tác động của vũ khí.

**QUY TẮC CHUNG:**
*   **\`Nhan sắc\`:** Mọi nhân vật BẮT BUỘC phải có chỉ số 'Nhan sắc' với \`category: 'Thuộc tính'\`. Giá trị của nó phải ở định dạng 'điểm/100', ví dụ: '85/100'.
`;