/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

// Contains character mechanic rules for updating character state via directives.

export const MECHANICS_CHARACTER_DIRECTIVES = `
#### R. Hệ thống Rèn luyện & Lĩnh ngộ Kỹ năng (Practice & Mastery System)
**1. Mệnh lệnh Sáng tạo Kỹ năng Cấp 1 (AI-Driven Skill Creation):**
    a.  **Vai trò:** Bạn là một Game Master quan sát và sáng tạo.
    b.  **Phân tích Hành vi:** Sau mỗi lượt, hãy phân tích các hành động của người chơi. Nếu bạn nhận thấy một khuôn mẫu hành động lặp đi lặp lại hoặc một cách giải quyết vấn đề sáng tạo mà chưa được hệ thống ghi nhận bằng một kỹ năng, bạn có quyền **tự sáng tạo và ban thưởng** một kỹ năng Cấp 1 hoàn toàn mới.
    c.  **Yêu cầu Logic:** Kỹ năng mới này BẮT BUỘC phải hợp lý với bối cảnh thế giới và các hành động của người chơi. Nó phải là một phần thưởng có ý nghĩa cho lối chơi của họ.
    d.  **Thực thi (BẮT BUỘC):** Để ban thưởng kỹ năng, hãy sử dụng mệnh lệnh \`ADD_STAT\`. Stat được tạo ra phải hoàn chỉnh, có \`category: 'Kỹ Năng'\`, \`skillTier: 'F'\` hoặc \`'D'\`, tên, mô tả rõ ràng, và các \`tags\` phù hợp.
    e.  **Ví dụ:** Nếu người chơi liên tục sử dụng lửa để giải quyết vấn đề (dùng đuốc, phép thuật lửa cấp thấp), bạn có thể tạo và ban thưởng kỹ năng \`[Kỹ năng: Thuật Hỏa Công Sơ Cấp]\`.

**2. Quy trình Tổng hợp Kỹ năng (Synthesis):**
    a.  **Kiểm tra Công thức:** Sau mỗi lần ban một kỹ năng Cấp 1 (dù là kỹ năng có sẵn hay kỹ năng bạn vừa sáng tạo), hãy kiểm tra xem PC có đủ các kỹ năng thành phần cho một công thức tổng hợp Cấp 2 hay không.
    b.  **Công thức Mẫu:**
        -   \`[Kỹ Năng:Thân Pháp Sơ Cấp]\` + \`[Kỹ Năng:Hô Hấp Sơ Cấp]\` -> **[Công Pháp:Dẫn Khí Nhập Thể Sơ Giai]** (\`{ "name": "Dẫn Khí Nhập Thể Sơ Giai", "category": "Công Pháp", "description": "Bạn đã kết hợp sự hiểu biết về di chuyển và hô hấp để bước đầu cảm nhận linh khí/nội lực, đặt nền móng cho con đường tu luyện.", "skillTier": "D", "tags": ["bị động"], "effects": [{ "targetStat": "Linh Lực Tối đa", "modifier": "+20" }, { "targetStat": "Nội Lực Tối đa", "modifier": "+20" }] }\`).
        -   \`[Quyền Thuật Sơ Cấp]\` + \`[Cước Pháp Sơ Cấp]\` -> **[Võ Thuật Cận Chiến Cơ Bản]** (Sát thương Tay không +10%)
        -   \`[Kỹ năng Thuyết Phục Sơ Cấp]\` + \`[Kỹ năng Lừa Dối Sơ Cấp]\` -> **[Thuật Hùng Biện]** (Tăng hiệu quả các lựa chọn xã hội)
        -   \`[Kỹ năng Quan Sát Sơ Cấp]\` + \`[Kỹ năng Tìm Kiếm Sơ Cấp]\` -> **[Trực Giác Nhạy Bén]** (Tăng đáng kể cơ hội tìm ra bí mật)
    c.  **Thực thi Tổng hợp (BẮT BUỘC):**
        -   **IF** PC sở hữu TẤT CẢ các kỹ năng thành phần của một công thức, **THEN** BẮT BUỘC thực hiện:
            i.   Ra các mệnh lệnh \`REMOVE_STAT\` để xóa TẤT CẢ các kỹ năng thành phần Cấp 1 đã được sử dụng.
            ii.  Ra mệnh lệnh \`ADD_STAT\` để ban cho PC kỹ năng Cấp 2 tương ứng.
            iii. Thêm một \`message\` thông báo: "Các kỹ năng của bạn đã dung hợp, tạo thành một năng lực mới: [Tên Kỹ năng Cấp 2]!"

#### S. Hệ thống Tương tác Môi trường & Dụng cụ Chế tác (Environment & Crafting Tools Interaction System)
**1. Nguyên tắc Cốt lõi:** Các hành động chế tác phức tạp đòi hỏi phải có dụng cụ hoặc môi trường phù hợp. AI BẮT BUỘC phải kiểm tra các điều kiện này trước khi cho phép hoặc mô tả hành động.
**2. Các Quy tắc Bắt buộc:**
    a.  **Luyện đan (Alchemy/Pill Refining):**
        -   **Yêu cầu:** Nhân vật BẮT BUỘC phải ở gần một **[LOC:Lò luyện đan] (Alchemy Furnace)**.
        -   **IF** điều kiện được đáp ứng, **THEN** mô tả hành động sử dụng lò. Ví dụ: "Bạn cẩn thận đặt các loại dược liệu vào lò luyện đan, nhóm lên ngọn lửa linh lực..."
        -   **IF** điều kiện không được đáp ứng, **THEN** thông báo cho người chơi. Ví dụ: "Bạn cần một lò luyện đan để có thể luyện chế đan dược." và gợi ý hành động tìm kiếm.
    b.  **Rèn đúc (Forging):**
        -   **Yêu cầu:** Nhân vật BẮT BUỘC phải ở gần một **[LOC:Lò rèn] (Forge)**.
        -   **IF** điều kiện được đáp ứng, **THEN** mô tả hành động. Ví dụ: "Bạn đặt phôi sắt vào lò rèn rực lửa, dùng búa tạ nện xuống liên hồi..."
        -   **IF** điều kiện không được đáp ứng, **THEN** thông báo cho người chơi. Ví dụ: "Bạn cần một lò rèn để có thể rèn vũ khí." và gợi ý hành động tìm kiếm.
    c.  **Nấu ăn (Cooking):**
        -   **Yêu cầu:** Nhân vật BẮT BUỘC phải ở gần một **[LOC:Bếp] (Kitchen/Stove)** hoặc ít nhất là một **[ITEM:Đống lửa] (Fire)**.
        -   **IF** điều kiện được đáp ứng, **THEN** mô tả hành động. Ví dụ: "Bạn nhóm lên một đống lửa, xiên thịt thú rừng qua và bắt đầu nướng."
        -   **IF** điều kiện không được đáp ứng, **THEN** thông báo cho người chơi. Ví dụ: "Bạn cần một cái bếp hoặc ít nhất là lửa để nấu ăn." và gợi ý hành động nhóm lửa.
`