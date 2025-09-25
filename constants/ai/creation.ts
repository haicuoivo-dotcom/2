/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

// This file acts as a barrel file, re-exporting all world creation rules
// from their specialized sub-modules.

export * from './creation/character';
export * from './creation/scene';
export * from './creation/utility';
export * from './creation/world';

export const FANFIC_SYSTEM_ANALYSIS_RULES = `
**Vai trò:** Chuyên gia Phân tích Hệ thống Game & World Builder.
**Nhiệm vụ:** Đọc kỹ văn bản Đồng nhân (Fan-fiction) được cung cấp. Phân tích sâu để trích xuất các hệ thống cốt lõi của thế giới đó (IP - Intellectual Property).
**QUY TRÌNH TƯ DUY (BẮT BUỘC):**
1.  **Đọc & Hiểu:** Đọc toàn bộ văn bản để nắm bắt không khí, bối cảnh, và các khái niệm sức mạnh chính.
2.  **Xác định Chỉ số Cốt lõi:** Tìm kiếm các thuật ngữ được lặp lại nhiều lần để mô tả sức mạnh của nhân vật. Đây là các \`coreStats\`. (Ví dụ: Chakra, Ki, Sức mạnh, Tinh thần lực, Linh lực).
3.  **Phân tích Hệ thống Năng lượng:** Thế giới này có một hệ thống năng lượng đặc biệt không (Haki, Nen, Ma thuật...)? Mô tả cách nó hoạt động trong \`energySystem\`. Nếu không có hệ thống rõ ràng, hãy mô tả nguồn sức mạnh chung.
4.  **Trích xuất Kỹ năng & Vật phẩm Tiêu biểu:** Liệt kê những kỹ năng, chiêu thức, hoặc vật phẩm mang tính biểu tượng, đóng vai trò quan trọng trong việc định hình sức mạnh và cốt truyện.
5.  **Tổng hợp Luật lệ Thế giới:** Rút ra những quy tắc nền tảng, bất biến của vũ trụ đó. (Ví dụ: "Người ăn Trái Ác Quỷ sẽ bị biển cả nguyền rủa", "Chỉ có thể sử dụng Nen sau khi đã khai mở các Tinh khổng").
**YÊU CẦU ĐẦU RA (BẮT BUỘC):**
*   Trả về một đối tượng JSON duy nhất, hợp lệ theo \`FANFIC_SYSTEM_ANALYSIS_SCHEMA\`.
*   Mọi mô tả phải ngắn gọn, súc tích và tập trung vào cơ chế.
`;

export const STARTING_POINT_SUGGESTION_RULES = `
**Vai trò:** Đạo diễn & Biên kịch cho game nhập vai.
**Nhiệm vụ:** Đọc kỹ văn bản Đồng nhân (Fan-fiction) và bản phân tích hệ thống được cung cấp. Dựa trên đó, hãy đề xuất 3-5 điểm khởi đầu (thời gian và địa điểm) thú vị và tiềm năng cho một cuộc phiêu lưu mới trong thế giới này.
**QUY TRÌNH TƯ DUY (BẮT BUỘC):**
1.  **Đọc & Hiểu:** Nắm bắt các sự kiện chính, nhân vật quan trọng, và các địa điểm được đề cập trong văn bản.
2.  **Xác định các "Ngã rẽ":** Tìm kiếm những khoảnh khắc quan trọng hoặc các bối cảnh có tiềm năng phát triển câu chuyện theo nhiều hướng khác nhau. Đó có thể là:
    *   Ngay trước một sự kiện lớn.
    *   Ngay sau một biến cố quan trọng.
    *   Tại một địa điểm bí ẩn hoặc đầy thử thách.
    *   Một thời điểm "bình thường" nhưng ẩn chứa sóng gió sắp ập đến.
3.  **Viết Gợi ý:** Với mỗi điểm khởi đầu được chọn, hãy viết một mô tả ngắn gọn, hấp dẫn, giải thích tại sao nó lại là một điểm khởi đầu tốt. Mô tả phải bao gồm cả yếu tố **Thời gian** (ví dụ: "Ngay sau khi nhân vật chính tốt nghiệp học viện") và **Địa điểm** (ví dụ: "Tại cổng làng").
**YÊU CẦU ĐẦU RA (BẮT BUỘC):**
*   Trả về một đối tượng JSON duy nhất, hợp lệ theo \`STARTING_POINT_SUGGESTION_SCHEMA\`.
*   Mô tả phải ngắn gọn và lôi cuốn.
`;