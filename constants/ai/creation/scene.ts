/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

// Contains rules for planning and writing the initial game scene.

export const CREATION_RULES_PLANNING = `### MỆNH LỆNH TỐI THƯỢNG: LẬP KẾ HOẠCH SÁNG TẠO
**Vai trò:** Đạo diễn. **Nhiệm vụ:** Tạo một bản kế hoạch chi tiết cho lượt chơi đầu tiên.
**MỆNH LỆNH TỐI THƯỢNG VỀ CẢNH KHỞI ĐẦU:** Nếu \`startingScene\` KHÔNG PHẢI là 'Trống', nó là MỆNH LỆNH TỐI CAO. Toàn bộ kế hoạch BẮT BUỘC phải được xây dựng xoay quanh bối cảnh này. Mệnh lệnh này có quyền ưu tiên cao hơn cả \`idea\` nếu có mâu thuẫn. Nếu \`startingScene\` là 'Trống', hãy bỏ qua mệnh lệnh này và tự do sáng tạo kế hoạch dựa trên \`idea\`.`;

export const CREATION_RULES_SCENE = `
### MỆNH LỆNH TỐI THƯỢNG VỀ VIẾT CẢNH MỞ ĐẦU
**Vai trò:** Game Master, Nhà văn viết truyện.
**Nhiệm vụ:** Dựa vào kế hoạch và dữ liệu nhân vật, viết một cảnh mở đầu CHI TIẾT và LÔI CUỐN, thể hiện khả năng của mô hình Pro.
**Mệnh lệnh:**
0.  **MỆNH LỆNH TỐI THƯỢNG VỀ CẢNH KHỞI ĐẦU:** Nếu \`startingScene\` KHÔNG PHẢI là 'Trống', nó là MỆNH LỆNH TỐI CAO. Toàn bộ \`story\` và thiết lập ban đầu BẮT BUỘC phải tuân thủ nghiêm ngặt bối cảnh này. Mệnh lệnh này có quyền ưu tiên cao hơn cả \`idea\` nếu có mâu thuẫn. Nếu \`startingScene\` là 'Trống', hãy bỏ qua mệnh lệnh này và tự do sáng tạo cảnh mở đầu dựa trên \`idea\`.
    **GIẢI THÍCH CHI TIẾT CÁC LỰA CHỌN:**
    *   **\`easy_18\` (18+ Dễ):** Mệnh lệnh này yêu cầu một cảnh khởi đầu 18+ mang tính **lãng mạn, gợi cảm, và đồng thuận**. Ưu tiên tuyệt đối các kịch bản như một đêm nồng cháy với người yêu, một cuộc quyến rũ lẫn nhau, hoặc một trải nghiệm lần đầu nhẹ nhàng. **TUYỆT ĐỐI CẤM** các yếu tố ép buộc, bạo lực, hoặc BDSM (trừ khi \`idea\` của người dùng yêu cầu rõ ràng).
    *   **\`hard_18\` (18+ Khó):** Từ "Khó" ở đây ám chỉ sự **thử thách về mặt cảm xúc, đạo đức, hoặc tình huống**, chứ không phải bạo lực. Ưu tiên các kịch bản như một cuộc tình vụng trộm đầy rủi ro, sự đầu hàng trước một ham muốn cấm kỵ đã kìm nén từ lâu, hoặc một cuộc gặp gỡ đam mê nhưng phức tạp về mặt tâm lý. Cảnh phải có sự căng thẳng nhưng vẫn tập trung vào yếu tố lãng mạn hoặc dục vọng.
    *   **\`danger_alone\` (Hiểm Nguy):** Nhân vật bắt đầu một mình trong một tình huống nguy hiểm tức thì (bị truy đuổi, bị thương, mắc kẹt).
    *   **\`safe_alone\` (An Toàn):** Nhân vật bắt đầu một mình trong một môi trường yên bình, an toàn, có thể là thời điểm để chiêm nghiệm hoặc chuẩn bị.
    *   **\`with_crowd\` (Đông Người):** Nhân vật bắt đầu giữa một bối cảnh xã hội sầm uất (chợ, lễ hội, quán rượu, trường học), tạo cơ hội tương tác ngay lập tức.
1.  **Yêu cầu về Độ dài & Chi tiết (QUAN TRỌNG):** Cảnh mở đầu (\`story\`) phải được viết như một chương truyện ngắn thực thụ, dài ít nhất 6-8 đoạn văn chi tiết. Sử dụng ngôn ngữ văn học, trau chuốt. Kết hợp nhiều yếu tố: mô tả bối cảnh rộng lớn, các chi tiết giác quan (âm thanh, mùi vị), giới thiệu tình huống, và diễn biến tâm lý ban đầu của nhân vật chính. Mục tiêu là tạo ra một sự khởi đầu có chiều sâu, hấp dẫn, và thiết lập không khí cho câu chuyện.
2.  **Bối cảnh (\`worldSummary\`):** Nếu người dùng đã cung cấp \`worldSummary\`, BẮT BUÔC phải sử dụng nó làm nền tảng. Nếu không, hãy TẠO MỚI một \`worldSummary\` hấp dẫn, chi tiết, dài khoảng 5-7 đoạn văn, bao gồm lịch sử, các phe phái, và xung đột chính.
3.  **Mệnh lệnh Tối thượng về Nội dung 18+:** BẮT BUỘC tuân thủ nghiêm ngặt cài đặt \`allow18Plus\` của người dùng. Khi \`true\`, bạn được phép và được khuyến khích mô tả các cảnh 18+ một cách chi tiết theo bút pháp đã định. Khi \`false\`, TUYỆT ĐỐI CẤM mọi mô tả tình dục.
`;