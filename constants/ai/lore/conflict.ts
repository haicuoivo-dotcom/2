/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

// Contains lore libraries related to conflict, disasters, and other calamities.

export const LORE_LIBRARY_CONFLICT_AND_CALAMITY = `
#### Thư viện về Xung đột & Tai ương
- **Mục đích:** Cung cấp kiến thức nền chi tiết về các sự kiện tiêu cực, từ các hành động thù địch có chủ đích đến các tai họa ngẫu nhiên. Điều này giúp AI tạo ra các thử thách, nhiệm vụ và các tình huống kịch tính, làm cho thế giới trở nên năng động và nguy hiểm hơn.

**I. Xung đột có Chủ đích (Intentional Conflicts)**

*   **1. Ám sát (Assassination):**
    *   **Khái niệm:** Một hành động giết người có kế hoạch, bí mật, nhắm vào một mục tiêu cụ thể, thường là một nhân vật quan trọng (quý tộc, lãnh đạo phe phái, mục tiêu nhiệm vụ). Chìa khóa là sự lén lút và chính xác.
    *   **Tích hợp vào Game:**
        *   **Nhiệm vụ:** Có thể là một loại nhiệm vụ \`'ám sát'\` do một phe phái hoặc NPC giao cho người chơi.
        *   **Hành động của NPC:** Một NPC sát thủ có thể cố gắng ám sát người chơi hoặc một NPC khác, tạo ra một sự kiện bất ngờ.
        *   **Cơ chế:** Thành công hay thất bại phụ thuộc vào các chỉ số như \`Nhanh nhẹn\`, các kỹ năng có tag \`'lén lút'\`, và sự cảnh giác của mục tiêu. Thất bại có thể dẫn đến chiến đấu trực diện hoặc bị truy nã.

*   **2. Đột kích (Raid / Surprise Attack):**
    *   **Khái niệm:** Một cuộc tấn công bất ngờ, nhanh chóng vào một địa điểm cố định (làng mạc, tiền đồn, đoàn xe) với mục tiêu cướp bóc tài nguyên, phá hoại, hoặc tiêu diệt lực lượng phòng thủ.
    *   **Tích hợp vào Game:**
        *   **Sự kiện Thế giới (World Event):** Một sự kiện ngẫu nhiên hoặc có kế hoạch xảy ra tại một \`[LOC:]\`. Ví dụ: "[LOC:Làng A] đang bị một toán cướp đột kích!"
        *   **Nhiệm vụ:** Tạo ra các nhiệm vụ khẩn cấp như "Bảo vệ làng A" hoặc "Đánh lui bọn cướp".

*   **3. Truy sát (Pursuit / Hunt Down):**
    *   **Khái niệm:** Hành động săn đuổi, truy lùng ráo riết một cá nhân hoặc một nhóm đang lẩn trốn. Nhấn mạnh vào cuộc rượt đuổi và sự không ngừng nghỉ của kẻ truy đuổi.
    *   **Tích hợp vào Game:**
        *   **Hậu quả:** Có thể là hậu quả của một hành động (chạy trốn khỏi trận chiến) hoặc một nhiệm vụ thất bại.
        *   **Trạng thái:** Có thể áp dụng một \`Stat\` \`'Đang bị Truy sát'\` lên nhân vật, làm tăng khả năng gặp các cuộc phục kích ngẫu nhiên từ kẻ thù.

*   **4. Truy nã (Manhunt / Wanted):**
    *   **Khái niệm:** Một thông báo chính thức từ một thế lực có thẩm quyền (chính phủ, phe phái) rằng một cá nhân là tội phạm và treo thưởng cho việc bắt giữ hoặc tiêu diệt họ.
    *   **Tích hợp vào Game:**
        *   **Trạng thái (Bắt buộc):** Khi một nhân vật bị truy nã, BẮT BUỘC phải ra mệnh lệnh \`ADD_STAT\` để áp dụng một \`Stat\` với \`category: 'Trạng thái'\` và \`name: 'Bị truy nã'\`. \`description\` của Stat này nên ghi rõ lý do và mức tiền thưởng.
        *   **Hệ quả:** Lính gác ở các thành phố thuộc thế lực đó sẽ trở nên thù địch. Các NPC \`'Thợ săn Tiền thưởng'\` có thể chủ động săn lùng nhân vật bị truy nã.

**II. Tai ương Ngẫu nhiên (Random Calamities)**

*   **1. Tai nạn (Accident):**
    *   **Khái niệm:** Một sự kiện không mong muốn, xảy ra bất ngờ và không có chủ đích, gây ra thiệt hại hoặc thương tích. Khác với sát thương trong chiến đấu.
    *   **Tích hợp vào Game:**
        *   **Sự kiện Tường thuật:** Có thể xảy ra trong \`story\` khi di chuyển hoặc tương tác với môi trường. Ví dụ: sập hầm, ngã ngựa, trượt chân ngã từ trên cao.
        *   **Hệ quả:** Gây ra các trạng thái tiêu cực như \`'Bị thương (Tai nạn)'\`, \`'Gãy chân'\`. Các trạng thái này có thể cần các vật phẩm hoặc thời gian đặc biệt để chữa trị. Có thể làm hỏng trang bị.

*   **2. Thiên tai (Natural Disaster):**
    *   **Khái niệm:** Một thảm họa tự nhiên quy mô lớn, gây ra sự tàn phá trên diện rộng.
    *   **Các loại hình:** Động đất, Lũ lụt, Núi lửa phun trào, Bão tố, Hạn hán, Dịch bệnh.
    *   **Tích hợp vào Game:**
        *   **Sự kiện Thế giới:** Một sự kiện lớn ảnh hưởng đến cả một khu vực.
        *   **Hệ quả Lâu dài:** Có thể phá hủy hoặc thay đổi vĩnh viễn các \`[LOC:]\`. Ví dụ: "Trận động đất đã biến [LOC:Thành phố X] thành một đống đổ nát."
        *   **Tạo Nhiệm vụ:** Tạo ra các chuỗi nhiệm vụ mới như "Cứu trợ nạn nhân", "Tìm kiếm nguồn nước sạch", "Di tản đến nơi an toàn".
        *   **Ảnh hưởng Kinh tế:** Làm thay đổi giá cả hàng hóa, tạo ra sự khan hiếm tài nguyên.
`;
