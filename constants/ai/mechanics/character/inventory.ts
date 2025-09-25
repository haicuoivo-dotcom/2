/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

// Contains character mechanic rules for inventory and asset management.

export const MECHANICS_CHARACTER_INVENTORY = `
#### J. Hệ thống Vật phẩm Chứa đồ & Tài sản (Inventory Containers & Assets)
1.  **Hệ thống Sức chứa Túi đồ Mở rộng (QUAN TRỌNG):** Một số trang bị có thể tăng sức chứa cho túi đồ chính của người chơi.
    a.  **\`inventoryBonus: number\` (Cộng vào Túi đồ Chính):**
        -   **Sử dụng cho:** Các trang bị như Quần, Áo, Thắt lưng... những thứ có túi riêng nhưng về logic chỉ làm tăng thêm sức chứa chung.
        -   **Hiệu ứng:** Cộng thẳng số ô đồ vào giới hạn của túi đồ chính.
        -   **Ví dụ Mệnh lệnh tạo Quần +5 ô đồ:**
            \`\`\`json
            "directives": [{
              "command": "ADD_STAT",
              "args": {
                "characterName": "Tên NV",
                "stat": {
                  "name": "Quần Da Rằn Ri",
                  "description": "Một chiếc quần da bền chắc với nhiều túi phụ, giúp mang thêm được 5 vật phẩm.",
                  "category": "Vật phẩm",
                  "slot": "Quần",
                  "inventoryBonus": 5
                }
              }
            }]
            \`\`\`
2.  **Tài sản Lớn & Vật phẩm Đại diện (Large Assets & Representative Items):**
    a.  **Định nghĩa:** Dùng để quản lý các tài sản lớn không thể mang theo người (xe cộ, nhà cửa). Hệ thống bao gồm hai phần:
        -   **Tài sản (Asset):** Một \`Stat\` với \`category: 'Tài sản'\`. Nó được lưu trữ riêng và không chiếm chỗ trong túi đồ.
        -   **Vật phẩm Đại diện (Key Item):** Một \`Stat\` với \`category: 'Vật phẩm'\` (ví dụ: Chìa khóa xe, Giấy tờ nhà). Vật phẩm này nằm trong túi đồ của người chơi và được liên kết với Tài sản.
    b.  **Tạo ra (QUY TRÌNH 2 MỆNH LỆNH BẮT BUỘC):** Khi ban cho người chơi một tài sản lớn, bạn BẮT BUỘC phải tạo ra cả hai phần bằng hai mệnh lệnh \`ADD_STAT\` riêng biệt:
        1.  **Mệnh lệnh 1 (Tạo Tài sản):** Tạo một \`Stat\` với \`category: 'Tài sản'\`. Ví dụ:
            \`\`\`json
            {
              "command": "ADD_STAT",
              "args": {
                "characterName": "Tên NV",
                "stat": {
                  "id": "asset-sieuxe-123", // TẠO ID TẠM THỜI
                  "name": "Siêu Xe Thể Thao",
                  "description": "Một chiếc siêu xe thể thao màu đỏ, tốc độ cực nhanh.",
                  "category": "Tài sản"
                }
              }
            }
            \`\`\`
        2.  **Mệnh lệnh 2 (Tạo Vật phẩm Đại diện):** Tạo một \`Stat\` với \`category: 'Vật phẩm'\` và BẮT BUỘC phải có trường \`representsAssetId\` chứa ID tạm thời đã tạo ở Mệnh lệnh 1. Ví dụ:
            \`\`\`json
            {
              "command": "ADD_STAT",
              "args": {
                "characterName": "Tên NV",
                "stat": {
                  "name": "Chìa khóa Siêu Xe",
                  "description": "Chìa khóa điện tử của một chiếc siêu xe thể thao màu đỏ.",
                  "category": "Vật phẩm",
                  "representsAssetId": "asset-sieuxe-123"
                }
              }
            }
            \`\`\`
    c.  **Logic:** Mã nguồn sẽ tự động xử lý việc lưu trữ Tài sản vào đúng nơi và đảm bảo liên kết giữa hai vật phẩm. Bạn chỉ cần tuân thủ quy trình 2 mệnh lệnh trên.
3.  **Bán Sinh vật sống qua Khế ước (Selling Living Entities via Contracts):**
    a.  **Nguyên tắc:** Để bán một sinh vật sống (ví dụ: một Linh Thú từ mảng \`pets\`, hoặc một NPC là Nô lệ) tại nhà đấu giá, người chơi không bán trực tiếp sinh vật đó. Thay vào đó, họ bán một vật phẩm đại diện là **Khế ước**.
    b.  **Quy trình Bắt buộc:** Khi người chơi muốn bán một sinh vật sống, bạn BẮT BUỘC phải thực hiện quy trình sau:
        1.  **Tạo Khế ước:** Dùng mệnh lệnh \`ADD_STAT\` để tạo một vật phẩm mới với \`category: 'Vật phẩm'\` vào túi đồ của người chơi.
        2.  **Đặt tên Rõ ràng:** Tên của vật phẩm này phải rõ ràng. Ví dụ: "Khế ước Nô lệ: [Tên NPC]" hoặc "Linh Thú Khế ước: [Tên Linh Thú]".
        3.  **Mô tả Chi tiết:** \`description\` của vật phẩm khế ước phải mô tả ngắn gọn về sinh vật mà nó đại diện.
        4.  **Gắn thẻ (Tag):** Thêm tag \`'khế ước'\` để dễ nhận biết.
        5.  **Thông báo:** Sau khi tạo khế ước, hãy thông báo cho người chơi qua \`message\` rằng họ đã nhận được khế ước và có thể mang nó đi bán.
    c.  **Logic:** Sau khi khế ước được tạo, người chơi có thể bán nó như một vật phẩm thông thường. Mã nguồn sẽ tự động xử lý việc chuyển quyền sở hữu sinh vật tương ứng khi khế ước được bán.
`;
