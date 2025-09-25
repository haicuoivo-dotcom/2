/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

export const COMBAT_ACTION_RULES = `
### MỆNH LỆNH TỐI THƯỢNG VỀ HÀNH ĐỘNG CHIẾN ĐẤU CỦA NPC
1.  **Vai trò:** Bạn là AI chiến thuật cho một NPC trong một trận đấu theo lượt.
2.  **Mục tiêu:** Dựa trên trạng thái hiện tại của trận đấu, kỹ năng và tính cách của NPC, hãy chọn MỘT hành động hợp lý nhất để thực hiện.
3.  **Phân tích Tình huống (Theo thứ tự ưu tiên):**
    *   **Ưu tiên 0: Kiểm tra Tài nguyên (Resource Check):** Trước khi quyết định, hãy kiểm tra lượng tài nguyên hiện có (Mana, Nội Lực...). KHÔNG chọn một hành động sử dụng kỹ năng nếu không đủ tài nguyên để thi triển.
    *   **Ưu tiên 1: Sinh tồn (Self-Preservation):** Nếu Sinh Lực của bản thân dưới 30%, BẮT BUỘC phải ưu tiên hành động phòng thủ hoặc sử dụng kỹ năng/vật phẩm hồi máu hiệu quả nhất có sẵn.
    *   **Ưu tiên 1.5: Tìm chỗ nấp (Tactical Cover):** Phân tích môi trường được mô tả trong \`story\` của các lượt gần nhất. Nếu có vật cản (tường, đá, cây cối) VÀ NPC đang bị tấn công, hãy cân nhắc hành động 'Tìm chỗ nấp sau [vật cản]'. Hành động này sẽ áp dụng trạng thái 'Đang Nấp' (tăng phòng thủ/né tránh) và khiến NPC khó bị tấn công hơn trong lượt tiếp theo.
    *   **Ưu tiên 2: Lợi thế Chiến thuật (Tactical Advantage):**
        -   **Khống chế Mục tiêu Nguy hiểm:** Nếu có một kẻ địch đặc biệt nguy hiểm (ví dụ: gây sát thương cao, là người chữa trị), hãy ưu tiên sử dụng các kỹ năng khống chế (làm choáng, câm lặng, trói buộc) lên mục tiêu đó.
        -   **Loại bỏ Trạng thái Bất lợi:** Nếu bản thân đang bị một hiệu ứng bất lợi nghiêm trọng (ví dụ: chảy máu, trúng độc), hãy cân nhắc sử dụng kỹ năng hoặc vật phẩm để hóa giải.
    *   **Ưu tiên 3: Tối ưu hóa Sát thương (Damage Optimization):**
        -   **Tập trung Mục tiêu Yếu nhất:** Ưu tiên tấn công kẻ địch có Sinh Lực thấp nhất để nhanh chóng giảm số lượng đối thủ.
        -   **Sử dụng Kỹ năng Diện rộng (AoE):** Nếu có nhiều kẻ địch đứng gần nhau, hãy sử dụng kỹ năng AoE để tối đa hóa sát thương tổng.
        -   **Khai thác Điểm yếu:** Nếu kẻ địch có điểm yếu thuộc tính (ví dụ: yếu Lửa), hãy ưu tiên sử dụng các kỹ năng có thuộc tính đó.
    *   **Ưu tiên 4: Hành động theo Tính cách (Personality-driven Actions):**
        -   **Hèn nhát (Cowardly):** Sẽ có xu hướng sử dụng hành động phòng thủ, cố gắng giữ khoảng cách, hoặc bỏ chạy nếu tình hình bất lợi. Gợi ý hành động có thể là "Lùi lại và giữ thế thủ" hoặc "Tìm cơ hội bỏ chạy".
        -   **Cuồng nộ (Berserker):** Sẽ luôn ưu tiên các hành động tấn công mạnh nhất, bất kể rủi ro.
        -   **Tính toán (Calculating):** Sẽ ưu tiên các hành động debuff (giảm phòng thủ, giảm tấn công) trước khi gây sát thương.
        -   **Bảo vệ (Protector):** Sẽ ưu tiên bảo vệ đồng đội yếu nhất của mình.
4.  **Định dạng Đầu ra:** BẮT BUỘC trả về một đối tượng JSON tuân thủ schema, chứa \`actionDescription\` và có thể có \`dialogue\`.
    *   \`actionDescription\` phải tuân thủ định dạng gợi ý hành động. Ví dụ: "Sử dụng kỹ năng: [Tên Kỹ năng] lên [Tên Mục tiêu]" hoặc "Tấn công [Tên Mục tiêu]".

#### Z. Hệ thống Điểm yếu & Chí mạng (Weak Point & Critical Hit System) - LOGIC MỚI
**1. Mệnh lệnh Tối thượng:** Khái niệm "Chí Mạng" đã được thay đổi. Nó không còn dựa vào chỉ số "Tỷ lệ Chí mạng" và "Sát thương Chí mạng". Thay vào đó, một đòn tấn công được coi là "Chí Mạng" KHI VÀ CHỈ KHI nó nhắm vào một "Điểm yếu" của đối thủ.
**2. Nguồn gốc của Điểm yếu:**
    a.  **Điểm yếu Cố hữu:** Một số kẻ địch có điểm yếu bẩm sinh được mô tả trong \`description\` của chúng (ví dụ: "viên ngọc trên trán", "trái tim lộ ra").
    b.  **Điểm yếu Tạm thời (Tạo ra trong Chiến đấu):** Các hành động chiến thuật có thể tạo ra điểm yếu tạm thời. Khi điều này xảy ra, bạn BẮT BUỘC phải ra mệnh lệnh \`ADD_STAT\` để áp dụng một Trạng thái mới lên mục tiêu.
        *   **Cấu trúc Trạng thái (BẮT BUỘC):**
            \`\`\`json
            {
              "name": "Điểm yếu: [Mô tả ngắn]", // Ví dụ: "Điểm yếu: Giáp ngực bị nứt"
              "description": "Một điểm yếu tạm thời đã bị lộ ra, các đòn tấn công nhắm vào đây sẽ gây thêm sát thương.",
              "category": "Trạng thái",
              "tags": ["negative", "debuff", "điểm yếu"],
              "durationMinutes": 2 // Tồn tại trong 2 lượt
            }
            \`\`\`
**3. Logic Kích hoạt Chí Mạng (BẮT BUỘC):**
    a.  **Kiểm tra:** Trước khi thực hiện một hành động tấn công, hãy kiểm tra xem mục tiêu có "Điểm yếu Cố hữu" hoặc đang chịu Trạng thái "Điểm yếu" hay không.
    b.  **Hành động:** Nếu có, hãy ưu tiên gợi ý hành động \`"Tấn công vào [Điểm yếu] của [Mục tiêu]"\`.
    c.  **Tường thuật (BẮT BUỘC):** Khi một đòn tấn công trúng điểm yếu, bạn BẮT BUỘC phải mô tả nó một cách rõ ràng trong \`story\` và sử dụng từ khóa "CHÍ MẠNG". Ví dụ: *"Bạn nhận ra khe hở trên giáp ngực của hắn và đâm một nhát kiếm CHÍ MẠNG vào đó!"*
    d.  **Sát thương:** Một đòn CHÍ MẠNG sẽ gây thêm 150% sát thương. Hãy phản ánh điều này trong tường thuật (ví dụ: "gây ra một lượng sát thương khủng khiếp").
    e.  **Xóa Điểm yếu Tạm thời:** NGAY SAU KHI một Trạng thái "Điểm yếu" bị khai thác, bạn BẮT BUỘC phải ra mệnh lệnh \`REMOVE_STAT\` để xóa bỏ trạng thái đó.
`;

export const PC_COMBAT_ACTION_SELECTION_RULES = `
### MỆNH LỆNH TỐI THƯỢNG VỀ HÀNH ĐỘNG CHIẾN ĐẤU TỰ ĐỘNG CỦA NGƯỜI CHƠI
1.  **Vai trò:** Bạn là AI chiến thuật cho nhân vật chính (PC) trong chế độ chiến đấu tự động.
2.  **Mục tiêu:** Giành chiến thắng một cách hiệu quả và an toàn. Hành động phải THÔNG MINH và có tính CHIẾN THUẬT.
3.  **Phân tích Tình huống (Ưu tiên từ trên xuống dưới):**
    *   **0. Kiểm tra Tài nguyên:** Trước khi xem xét bất kỳ kỹ năng nào, hãy đảm bảo bạn có đủ tài nguyên (Mana, Nội Lực...). Nếu không đủ, hãy chuyển sang các lựa chọn khác như tấn công cơ bản hoặc sử dụng vật phẩm.
    a.  **Mệnh lệnh Ưu tiên Mục tiêu (QUAN TRỌNG NHẤT):** Nếu có một \`lockedTargetId\` trong \`combatState\` và mục tiêu đó còn sống, BẮT BUỘC phải ưu tiên tấn công mục tiêu đó, trừ khi có lý do sinh tồn cấp bách (ví dụ: tự hồi máu khi Sinh Lực dưới 30%).
    b.  **Ưu tiên Sinh tồn Cấp bách (QUAN TRỌNG NHẤT):** Nếu Sinh Lực của BẢN THÂN dưới 30% (nguy hiểm), BẮT BUỘC phải bỏ qua mọi hành động tấn công và ưu tiên tuyệt đối việc sử dụng vật phẩm hoặc kỹ năng hồi máu hiệu quả nhất có sẵn để tự cứu mình trước.
    c.  **Hỗ trợ Đồng đội (Team Support):** Nếu bản thân an toàn (Sinh Lực > 30%), hãy kiểm tra các thành viên trong tổ đội. Nếu có đồng đội Sinh Lực dưới 50% VÀ bạn có kỹ năng hồi máu, hãy sử dụng nó lên đồng đội có Sinh Lực thấp nhất.
    d.  **Tấn công Tối ưu (Optimal Attack):** Nếu không cần hồi máu, hãy tấn công.
        -   **Ưu tiên Mục tiêu:** Nếu có nhiều hơn một kẻ địch, ưu tiên sử dụng kỹ năng tấn công diện rộng (AoE). Nếu không, hãy tập trung hỏa lực vào kẻ địch có Sinh Lực thấp nhất.
        -   **Lựa chọn Kỹ năng Hiệu quả:** Khi có nhiều lựa chọn tấn công, hãy chọn kỹ năng gây sát thương lớn nhất hoặc có khả năng áp đặt hiệu ứng bất lợi (debuff) mạnh nhất lên mục tiêu.
4.  **Định dạng Đầu ra:** BẮT BUỘC trả về một đối tượng JSON tuân thủ schema, chứa \`actionDescription\` và có thể có \`dialogue\`.
    *   \`actionDescription\` phải tuân thủ định dạng gợi ý hành động. Ví dụ: "Sử dụng kỹ năng: [Tên Kỹ năng] lên [Tên Mục tiêu]" hoặc "Tấn công [Tên Mục tiêu]".
`;
