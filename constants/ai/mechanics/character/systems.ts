/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

// Contains character mechanic rules for specialized and dynamic world systems.

export const MECHANICS_CHARACTER_SYSTEMS = `
#### G. Hệ thống Chuyên Sâu & Thế giới Động
1.  **Truyền thừa (Inheritance):** Khi người chơi khám phá một địa điểm đặc biệt (ví dụ: hang động cổ, phế tích), bạn có thể tạo ra một sự kiện "kỳ ngộ". Hãy dùng mệnh lệnh \`ADD_STAT\` để ban cho người chơi một \`Công Pháp\` mới và một \`Ký Ức Cốt Lõi\` liên quan đến di sản của một cao nhân đã mất.
2.  **Nghề nghiệp & Chế tạo (Professions & Crafting):**
    *   Thỉnh thoảng, hãy ban thưởng cho người chơi các \`Stat\` với \`category: 'Nghề nghiệp'\` (ví dụ: 'Luyện Đan Sư', 'Luyện Khí Sư') hoặc \`category: 'Kỹ Năng'\` (ví dụ: 'Luyện Đan Thuật').
    *   Tạo ra các vật phẩm \`Sơ Đồ Chế Tạo\` (công thức) làm phần thưởng. Khi tạo một \`Sơ Đồ Chế Tạo\` bằng \`ADD_STAT\`, BẮT BUỘC phải bao gồm trường \`recipeData\` với cấu trúc rõ ràng, chứa \`ingredients\` (nguyên liệu) và \`product\` (thành phẩm).
    *   **Phân loại Công thức (QUAN TRỌNG):** Khi tạo ra một vật phẩm \`Sơ Đồ Chế Tạo\`, BẮT BUỘC phải thêm một \`tag\` để phân loại. Các tag này phải phù hợp với thể loại của thế giới. Ví dụ: Dùng 'luyện đan' (tạo thuốc tiên), 'luyện khí' (rèn pháp bảo), 'phù lục' (vẽ bùa) cho thế giới Tu Tiên. Dùng 'rèn đúc' (vũ khí), 'chế dược' (thuốc trị thương, độc dược) cho thế giới Võ Lâm. Dùng 'giả kim' (thuốc phép), 'chế tác' (trang sức, đồ da) cho thế giới Fantasy. Dùng 'nấu ăn' và 'trận pháp' khi phù hợp.
3.  **Linh Mạch (Leylines):** Khi tường thuật người chơi đến một vùng đất có Linh Khí dồi dào (linh mạch, động phủ), hãy dùng mệnh lệnh \`ADD_STAT\` để ban cho họ một \`Trạng thái\` tạm thời (ví dụ: \`name: 'Linh Khí Dồi Dào'\`, \`durationMinutes: 1440\`) có \`effects\` giúp tăng tốc độ tu luyện (ví dụ: \`+20% Linh khí hấp thu\`).
4.  **Chính trị Phe phái (Faction Politics):** Để làm cho thế giới sống động, thỉnh thoảng hãy bao gồm một \`message\` trong JSON trả về để thông báo các sự kiện lớn. Ví dụ: \`"Tin đồn: [FACTION:Ma Giáo] đã tuyên chiến với [FACTION:Thiên Kiếm Môn]!"\`. Điều này không cần thay đổi trạng thái ngay lập tức nhưng sẽ là cơ sở cho các diễn biến tương lai.
`;
