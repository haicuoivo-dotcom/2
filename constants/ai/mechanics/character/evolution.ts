/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

// Contains character mechanic rules for the monster evolution system.

export const MECHANICS_CHARACTER_EVOLUTION = `
#### I. Hệ thống Tiến hóa Quái vật (Monster Evolution System)
1.  **Nguyên tắc Cốt lõi:** Quái vật trong thế giới này không phải là các thực thể tĩnh. Chúng có khả năng tiến hóa thành các dạng mạnh hơn, cao cấp hơn. Điều này làm cho thế giới trở nên nguy hiểm và năng động hơn theo thời gian.
2.  **Điều kiện Tiến hóa (Ví dụ):** Một quái vật có thể tiến hóa khi đáp ứng một hoặc nhiều điều kiện sau:
    *   **Kinh nghiệm:** Sống sót qua 10 trận chiến, đạt đến một "cấp độ" ẩn.
    *   **Hấp thụ:** Tiêu thụ một vật phẩm đặc biệt. Ví dụ: một con Sói Quỷ hấp thụ "[Vật phẩm:Hỏa Linh Tinh]" có thể tiến hóa thành Hỏa Ngục Khuyển.
    *   **Môi trường:** Ở trong một khu vực có năng lượng dồi dào trong một thời gian dài. Ví dụ: một con Golem Đá ở trong "[LOC:Mỏ Mithril]" trong một tháng có thể tiến hóa thành Golem Mithril.
    *   **Đột biến:** Một sự kiện ngẫu nhiên hoặc do tác động ma thuật từ người chơi.
3.  **Quy trình Tiến hóa (BẮT BUỘC):** Khi bạn quyết định một quái vật tiến hóa, bạn phải:
    a.  **Tường thuật** sự kiện một cách kịch tính trong \`story\`. Mô tả sự thay đổi về hình dạng, kích thước, và khí chất của nó. Ví dụ: "Con Sói Quỷ hú lên một tiếng đau đớn, bộ lông của nó bốc cháy rực rỡ, biến thành Hỏa Ngục Khuyển!"
    b.  **Sử dụng Mệnh lệnh** để cập nhật trạng thái của quái vật. **Đây là phần QUAN TRỌNG NHẤT.**
        -   **Ví dụ về Mệnh lệnh Tiến hóa Sói Quỷ thành Hỏa Ngục Khuyển:**
        \`\`\`json
        "directives": [
          {
            "command": "UPDATE_CHARACTER_PROPERTY",
            "args": { "characterName": "Sói Quỷ", "property": "name", "value": "Hỏa Ngục Khuyển" }
          },
          {
            "command": "UPDATE_CHARACTER_PROPERTY",
            "args": { "characterName": "Sói Quỷ", "property": "displayName", "value": "Hỏa Ngục Khuyển" }
          },
          {
            "command": "UPDATE_CHARACTER_PROPERTY",
            "args": { "characterName": "Sói Quỷ", "property": "physicalAppearance", "value": "Một con chó săn khổng lồ với bộ lông rực cháy và đôi mắt đỏ ngầu, có khả năng thở ra lửa." }
          },
          {
            "command": "UPDATE_STAT",
            "args": { "characterName": "Sói Quỷ", "statName": "Sinh Lực", "value": "250/250" }
          },
          {
            "command": "UPDATE_STAT",
            "args": { "characterName": "Sói Quỷ", "statName": "Tấn Công", "value": 35 }
          },
          {
            "command": "ADD_STAT",
            "args": {
              "characterName": "Sói Quỷ",
              "stat": {
                "name": "Hơi Thở Lửa",
                "description": "Thổi ra một luồng lửa gây sát thương Hỏa lên một mục tiêu.",
                "category": "Kỹ Năng",
                "tags": ["chủ động", "đơn mục tiêu", "Hỏa"]
              }
            }
          },
          {
            "command": "ADD_STAT",
            "args": {
              "characterName": "Sói Quỷ",
              "stat": { "name": "Kháng Hỏa", "description": "Giảm 50% sát thương từ lửa.", "value": "50%", "category": "Thuộc tính", "tags": ["bị động"] }
            }
          }
        ]
        \`\`\`
4.  **Các Con đường Tiến hóa Phổ biến (Ví dụ tham khảo):**
    *   **Slime** -> **Slime Vua (King Slime):** To lớn hơn, có khả năng phân tách và kháng vật lý cao hơn.
    *   **Goblin** -> **Hobgoblin:** To lớn, mạnh mẽ hơn, có kỷ luật hơn, thường là những chiến binh thiện chiến.
    *   **Goblin** -> **Goblin Shaman:** Tiến hóa theo con đường trí tuệ, có khả năng sử dụng các phép thuật hắc ám hoặc triệu hồi.
    *   **Sói (Wolf)** -> **Sói Quỷ (Dire Wolf):** Lớn hơn, hung dữ hơn, có thể có thêm các kỹ năng như tiếng hú làm tê liệt.
    *   **Sói (Wolf)** -> **Hỏa Ngục Khuyển (Hellhound):** Tiến hóa theo thuộc tính, có khả năng phun lửa và kháng sát thương lửa.
    *   **Người Đá (Stone Golem)** -> **Golem Mithril (Mithril Golem):** Cứng hơn, mạnh hơn, và có thể kháng ma thuật.
    *   **Wyvern** -> **Rồng (Dragon):** Từ một sinh vật bay giống rồng, tiến hóa thành một con rồng thực sự với trí tuệ và sức mạnh vượt trội.
    *   **Tu Tiên (Yêu thú):** Yêu thú tuân theo một hệ thống cấp bậc rõ ràng.
        -   **Cấp bậc chung:** Yêu Thú -> Yêu Tướng -> Yêu Vương -> Yêu Hoàng -> Yêu Đế.
        -   **Theo loài:** **Xà Yêu (Snake Demon)** -> **Mãng Xà Yêu (Python Demon)** (to lớn hơn, có độc) -> **Giao Long (Flood Dragon)** (bắt đầu mọc sừng và vảy rồng, có khả năng điều khiển nước).
`;
