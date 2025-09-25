/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

const LORE_LIBRARY_MARTIAL_ARTS_SECTS = `
#### Thư viện các Môn Phái Võ Lâm (Wuxia Sects)
- **Mục đích:** Cung cấp kiến thức nền về các môn phái lớn và các thế lực trong giang hồ để AI có thể xây dựng một thế giới võ lâm có chiều sâu, với các mối quan hệ phe phái phức tạp và các bộ võ công đặc trưng.

**I. Chính Phái (Righteous Sects)**

*   **Thiếu Lâm Tự (Shaolin Temple):**
    *   **Vị trí:** Tung Sơn, Hà Nam.
    *   **Đặc điểm:** Thái sơn bắc đẩu trong võ lâm, là một ngôi chùa Phật giáo. Đệ tử là các nhà sư, tuân thủ nghiêm ngặt giới luật nhà Phật.
    *   **Triết lý:** Từ bi hỷ xả, lấy võ công để bảo vệ chính nghĩa, không sát sinh.
    *   **Võ công Tiêu biểu:** Thất Thập Nhị Huyền Công (72 tuyệt kỹ), Dịch Cân Kinh (nội công), Tẩy Tủy Kinh (nội công), Long Trảo Thủ (cầm nã), La Hán Quyền, Đạt Ma Kiếm Pháp.
    *   **Nhân vật:** Các vị cao tăng đức cao vọng trọng, các võ tăng dũng mãnh.
*   **Võ Đang Phái (Wudang Sect):**
    *   **Vị trí:** Núi Võ Đang, Hồ Bắc.
    *   **Đặc điểm:** Môn phái Đạo giáo, có địa vị ngang hàng với Thiếu Lâm. Đệ tử là các đạo sĩ.
    *   **Triết lý:** "Dĩ nhu khắc cương", "Tứ lạng bạt thiên cân". Võ công chú trọng sự mềm mại, mượn lực đánh lực.
    *   **Võ công Tiêu biểu:** Thái Cực Kiếm, Thái Cực Quyền, Thê Vân Tung (khinh công), Thuần Dương Vô Cực Công (nội công).
    *   **Nhân vật:** Các đạo trưởng tiên phong đạo cốt, các đệ tử trẻ tuổi tài cao.
*   **Nga Mi Phái (Emei Sect):**
    *   **Vị trí:** Núi Nga Mi, Tứ Xuyên.
    *   **Đặc điểm:** Môn phái lớn do phụ nữ lãnh đạo và hầu hết đệ tử là nữ.
    *   **Triết lý:** Hành hiệp trượng nghĩa, nhưng đôi khi có phần cực đoan và tàn nhẫn với kẻ ác.
    *   **Võ công Tiêu biểu:** Nga Mi Kiếm Pháp, Cửu Âm Bạch Cốt Trảo (biến thể), Phiêu Tuyết Xuyên Vân Chưởng.
    *   **Nhân vật:** Các sư thái nghiêm nghị, các nữ hiệp xinh đẹp nhưng lạnh lùng.
*   **Cái Bang (Beggar's Sect):**
    *   **Vị trí:** Khắp nơi, không có tổng đàn cố định.
    *   **Đặc điểm:** "Thiên hạ đệ nhất bang", là tổ chức của những người ăn mày. Mạng lưới thông tin tình báo rộng lớn nhất giang hồ.
    *   **Triết lý:** Tự do, phóng khoáng, đại nghĩa.
    *   **Võ công Tiêu biểu:** Hàng Long Thập Bát Chưởng (chưởng pháp chí dương), Đả Cẩu Bổng Pháp (gậy pháp chí cương).
    *   **Nhân vật:** Các bang chủ nghĩa hiệp, các trưởng lão kỳ quái.
*   **Côn Lôn Phái (Kunlun Sect):**
    *   **Vị trí:** Dãy núi Côn Lôn xa xôi ở phía Tây.
    *   **Đặc điểm:** Một môn phái lớn, thường được miêu tả có cả đạo sĩ và kiếm khách.
    *   **Võ công Tiêu biểu:** Côn Lôn Kiếm Pháp, Lưỡng Nghi Kiếm Pháp.

**II. Tà Phái / Ma Giáo (Evil / Demonic Sects)**

*   **Minh Giáo (Ming Cult) / Nhật Nguyệt Thần Giáo (Sun Moon Holy Cult):**
    *   **Vị trí:** Quang Minh Đỉnh (Minh Giáo), Hắc Mộc Nhai (Nhật Nguyệt Thần Giáo).
    *   **Đặc điểm:** Thường bị chính phái coi là ma giáo. Hành sự tàn độc, không theo quy tắc giang hồ. Nội bộ phân chia phe phái, tranh giành quyền lực khốc liệt.
    *   **Triết lý:** "Hành thiện trừ ác, duy ngã độc tôn" (làm việc thiện ác tùy ý, chỉ có ta là nhất).
    *   **Võ công Tiêu biểu:** Càn Khôn Đại Na Di (tâm pháp di chuyển nội lực), Hấp Tinh Đại Pháp (hút nội lực người khác), Quỳ Hoa Bảo Điển (yêu cầu tự cung).
    *   **Nhân vật:** Các giáo chủ bá đạo, các trưởng lão âm mưu, các thánh cô xinh đẹp nhưng tà dị.
*   **Ngũ Độc Giáo (Five Venoms Sect):**
    *   **Vị trí:** Miền Nam hoang vu, nhiều rừng độc.
    *   **Đặc điểm:** Chuyên sử dụng các loại độc trùng (rắn, rết, bọ cạp, cóc, nhện) và các loại độc dược chết người.
    *   **Triết lý:** Sống theo luật của tự nhiên, không từ thủ đoạn.
    *   **Võ công Tiêu biểu:** Ngũ Độc Thần Chưởng, Vạn Độc Tâm Kinh.
    *   **Nhân vật:** Thường là các nữ nhân yêu kiều nhưng vô cùng độc ác.

**III. Các Thế lực Trung lập / Bí ẩn**

*   **Đường Môn (Tang Clan):**
    *   **Vị trí:** Tứ Xuyên.
    *   **Đặc điểm:** Gia tộc nổi tiếng về chế tạo và sử dụng các loại ám khí và độc dược tinh xảo, chết người trong chớp mắt. Ít khi can thiệp vào chuyện giang hồ nhưng không ai dám đắc tội.
    *   **Võ công Tiêu biểu:** Mãn Thiên Hoa Vũ (ám khí), các loại độc dược không thuốc chữa.
*   **Cẩm Y Vệ (Brocade-Clad Guard) / Lục Phiến Môn (Six Fan Doors):**
    *   **Đặc điểm:** Các tổ chức của triều đình, có nhiệm vụ giám sát và duy trì trật tự trong võ lâm. Quyền lực lớn, hành sự bí mật.
    *   **Mục tiêu:** Cân bằng các thế lực giang hồ, không để môn phái nào trở nên quá mạnh, đe dọa đến triều đình.
*   **Tiêu Cục (Escort Agency):**
    *   **Đặc điểm:** Tổ chức kinh doanh dịch vụ bảo tiêu, vận chuyển hàng hóa quý giá. Cần có võ công cao cường và danh tiếng tốt. Ví dụ: Long Môn Tiêu Cục.
`;

export const MECHANICS_RULES_WORLD_SYSTEMS = `
### MỆNH LỆNH TỐI THƯỢNG: CÁC HỆ THỐNG VẬN HÀNH THẾ GIỚI
**1. Quyền Tối cao:** Bộ quy tắc này là MỆNH LỆNH TỐI THƯỢNG, chi phối các hệ thống con của thế giới như đấu giá, chế tạo, và các tổ chức.
**2. Hậu quả của việc Vi phạm:** Bỏ qua hoặc thực hiện sai các logic hệ thống này sẽ làm hỏng trải nghiệm chơi và bị coi là LỖI HỆ THỐNG NGHIÊM TRỌNG.
---
#### C. Hệ thống Thế giới
1.  **NPC Chủ động & Thế giới Sống:** Thế giới không đứng yên. Mô tả các sự kiện do NPC chủ động khởi xướng. Phân biệt giữa NPC "Trên Màn Hình" (ưu tiên cập nhật tức thời) và "Ngoài Màn Hình" (được hệ thống mô phỏng riêng). Các NPC có thể có một trường \`schedule\` mô tả lịch trình/thói quen của họ; hãy tham chiếu đến nó để quyết định hành động và vị trí của họ vào các thời điểm khác nhau trong ngày.
2.  **Sự kiện Thế giới:** Nếu có sự kiện đang diễn ra, phải lồng ghép nó vào truyện, hành vi của NPC và các hành động gợi ý.
3.  **Hệ quả Lan truyền:** Hành động của người chơi phải có hệ quả gián tiếp (thay đổi thái độ phe phái, tin đồn lan truyền).
4.  **Hệ Thống Đấu Giá Hội:** Trong các thành phố lớn hoặc trung tâm thương mại, tồn tại các nhà đấu giá chuyên buôn bán các vật phẩm quý hiếm, độc nhất, và đôi khi cả những sinh vật sống như Nô lệ hoặc Linh Thú.
    *   **Thông báo Trước:** Trước khi một cuộc đấu giá quan trọng diễn ra, hãy thông báo cho người chơi qua \`message\`. Ví dụ: "Nhà đấu giá Hoàng Gia vừa thông báo sẽ tổ chức một phiên đấu giá đặc biệt vào tuần tới. Nghe nói vật phẩm cuối cùng là một quả trứng rồng." Điều này tạo sự mong đợi.
    *   **Đối tượng Đấu giá:** Người chơi có thể đưa vật phẩm, Linh Thú, hoặc Nô lệ (nếu có) của mình lên sàn đấu giá.
    *   **Logic Bán Sinh vật sống:** Khi bán một sinh vật sống (Nô lệ, Linh Thú), AI phải tạo ra một vật phẩm đại diện (ví dụ: 'Khế ước Nô lệ [Tên NPC]', 'Linh Thú Khế ước [Tên Linh Thú]') trong túi đồ của người bán. Chính vật phẩm khế ước này sẽ được đưa ra đấu giá.
    *   **Quản lý của AI:** AI PHẢI quản lý quá trình đấu giá, bao gồm việc tạo ra các NPC khác tham gia, mô tả diễn biến và xác định giá cuối cùng.
${LORE_LIBRARY_MARTIAL_ARTS_SECTS}
`;