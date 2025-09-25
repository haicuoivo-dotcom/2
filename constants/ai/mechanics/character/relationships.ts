/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

// Contains character mechanic rules related to relationships and social interactions.

export const MECHANICS_CHARACTER_RELATIONSHIPS = `
#### M. HỆ THỐNG MỐI QUAN HỆ BẤT ĐỐI XỨNG (ASYMMETRICAL RELATIONSHIPS MANDATE - LOGIC BẤT BIẾN)
**1. Mệnh lệnh Tối thượng:** Mọi mối quan hệ trong game giờ đây là **MỘT CHIỀU (ONE-WAY)** và **BẤT ĐỐI XỨNG (ASYMMETRICAL)**. Thiện cảm của A đối với B hoàn toàn độc lập và có thể khác với thiện cảm của B đối với A.
**2. Mệnh lệnh về Mệnh lệnh (Directive Mandate):** Để tạo hoặc cập nhật một mối quan hệ, bạn BẮT BUỘC phải sử dụng mệnh lệnh \`UPDATE_RELATIONSHIP\`. Mệnh lệnh này chỉ ảnh hưởng đến một chiều.
    *   **Logic:** Ra lệnh \`UPDATE_RELATIONSHIP\` với \`characterName: A\`, \`targetCharacterName: B\` sẽ CHỈ thay đổi cách A nhìn nhận B. Mối quan hệ của B đối với A sẽ không bị ảnh hưởng.
**3. Logic Quan hệ Tương hỗ (Mutual Relationship Logic):**
    *   **IF** bạn muốn tạo ra một mối quan hệ tương hỗ (ví dụ: hai người cùng yêu nhau, hai người cùng là bạn bè), bạn **BẮT BUỘC** phải ra **HAI (2) MỆNH LỆNH RIÊNG BIỆT**:
        1.  Một mệnh lệnh từ A -> B.
        2.  Một mệnh lệnh từ B -> A.
    *   **Ví dụ:** Để A và B trở thành bạn bè:
        \`\`\`json
        "directives": [
          { "command": "UPDATE_RELATIONSHIP", "args": { "characterName": "A", "targetCharacterName": "B", "type": "Bạn bè", "affinity": 50 } },
          { "command": "UPDATE_RELATIONSHIP", "args": { "characterName": "B", "targetCharacterName": "A", "type": "Bạn bè", "affinity": 50 } }
        ]
        \`\`\`
**4. Hậu quả:** Việc chỉ ra một mệnh lệnh và cho rằng mối quan hệ là hai chiều sẽ gây ra lỗi logic nghiêm trọng.

#### N. MỆNH LỆNH VỀ LẦN GẶP ĐẦU TIÊN (FIRST ENCOUNTER MANDATE)
    a.  **Kích hoạt:** Khi PC gặp một NPC lần đầu tiên **VÀ** trong văn bản tường thuật không có bất kỳ dấu hiệu nào cho thấy họ đã biết nhau từ trước.
    b.  **Hành động BẮT BUỘC:** Bạn BẮT BUỘC phải ngay lập tức thiết lập mối quan hệ hai chiều giữa PC và NPC đó bằng cách sử dụng **HAI (2) mệnh lệnh \`UPDATE_RELATIONSHIP\`**.
    c.  **Mối quan hệ Mặc định:** Trừ khi bối cảnh yêu cầu khác, mối quan hệ mặc định cho lần gặp đầu tiên là 'Người lạ' với điểm thiện cảm là 0 cho cả hai chiều.
    d.  **Ví dụ Mệnh lệnh:** Nếu PC gặp NPC tên "Linh", bạn phải ra hai mệnh lệnh:
    \`\`\`json
    [
      { "command": "UPDATE_RELATIONSHIP", "args": { "characterName": "[PC:Tên PC]", "targetCharacterName": "[NPC:Linh]", "type": "Người lạ", "affinity": 0 } },
      { "command": "UPDATE_RELATIONSHIP", "args": { "characterName": "[NPC:Linh]", "targetCharacterName": "[PC:Tên PC]", "type": "Người lạ", "affinity": 0 } }
    ]
    \`\`\`

#### O. MỆNH LỆNH VỀ NGƯỜI QUEN (ACQUAINTANCE ENCOUNTER MANDATE - GHI ĐÈ LÊN MỆNH LỆNH N)
    a.  **Kích hoạt:** Khi PC gặp một NPC mà văn bản tường thuật gợi ý rằng họ đã biết nhau từ trước (ví dụ: "bạn cũ", "người quen", "kẻ thù cũ", "vị sư phụ đã lâu không gặp"). Mệnh lệnh này có quyền ưu tiên tuyệt đối so với "Lần gặp Đầu tiên".
    b.  **Hành động BẮT BUỘC:** TUYỆT ĐỐI KHÔNG được tạo mối quan hệ 'Người lạ'. Thay vào đó, bạn BẮT BUỘC phải:
        i.   Suy luận ra loại quan hệ phù hợp nhất từ văn bản (ví dụ: 'Bạn bè', 'Đối thủ', 'Sư tỷ').
        ii.  Suy luận ra một điểm thiện cảm ('affinity') hợp lý cho cả hai chiều (có thể khác nhau).
        iii. Sử dụng **HAI (2) mệnh lệnh \`UPDATE_RELATIONSHIP\`** để thiết lập mối quan hệ hai chiều này.
    c. **Hậu quả:** Áp dụng sai mệnh lệnh "Lần gặp Đầu tiên" trong trường hợp này là một lỗi logic nghiêm trọng, phá vỡ cốt truyện.

#### P. MỆNH LỆNH VỀ GIA ĐÌNH TRONG TIỂU SỬ (KHI TẠO NHÂN VẬT)
    a.  **Phân tích (BẮT BUỘC):** Khi tạo nhân vật, hãy đọc kỹ trường \`backstory\` của PC.
    b.  **Hành động (BẮT BUỘC):** NẾU \`backstory\` đề cập đến một thành viên gia đình (cha, mẹ, anh, chị, em...), bạn BẮT BUỘC phải:
        i.  Tạo ra một NPC hoàn chỉnh cho người đó trong mảng \`initialNpcs\`.
        ii. Thiết lập mối quan hệ gia đình hai chiều trong mảng \`relationships\` theo đúng Mệnh lệnh 8.
`;
