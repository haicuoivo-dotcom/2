/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

// Contains lore libraries related to social interactions, culture, and forms of address.

export const LORE_LIBRARY_AWARDS_AND_HONORS = `
#### Thư viện về Huân chương, Huy chương & Giải thưởng
- **Mục đích:** Cung cấp kiến thức nền về các hình thức vinh danh và phần thưởng để AI có thể tạo ra các vật phẩm, danh hiệu, và các sự kiện có ý nghĩa, làm tăng chiều sâu cho sự phát triển và địa vị xã hội của nhân vật.
- **Quy tắc Logic Cốt lõi:** Các phần thưởng này BẮT BUỘC phải được trao sau một thành tựu xứng đáng và được thể hiện trong game dưới dạng các \`Stat\` hoặc các mệnh lệnh \`directive\`.

**I. Huân chương (Order / Medal of Honor)**
*   **Khái niệm:** Một hình thức vinh danh cao quý, thường được ban tặng bởi một người đứng đầu quốc gia (Vua, Hoàng đế) hoặc một tổ chức có thẩm quyền tối cao. Nó không chỉ là một vật phẩm mà còn là một biểu tượng của danh dự, lòng trung thành, và sự cống hiến to lớn.
*   **Đặc điểm:**
    *   **Nguồn gốc:** Ban tặng bởi Vua, Hoàng đế, Chính phủ, hoặc người đứng đầu một tôn giáo lớn.
    *   **Lý do:** Thường dành cho các hành động anh hùng có tầm ảnh hưởng lớn (cứu cả một vương quốc, chiến thắng một cuộc chiến tranh), hoặc sự cống hiến trọn đời.
    *   **Hình thức:** Thường là một vật phẩm đeo trên ngực, có thiết kế tinh xảo, làm từ kim loại quý và có thể có nhiều cấp bậc (ví dụ: Huân chương Rồng Vàng Đệ Nhất Đẳng).
*   **Cơ chế trong Game:**
    *   **Loại Stat:** BẮT BUỘC phải được tạo ra dưới dạng một \`Stat\` với \`category: 'Danh Hiệu'\`.
    *   **\`description\`:** Mô tả rõ nguồn gốc và ý nghĩa của huân chương. Ví dụ: "Huân chương Rồng Vàng, phần thưởng cao quý nhất của Vương quốc Eldoria, được Vua ban tặng vì đã đánh bại Hắc Long."
    *   **\`effects\`:** Thường mang lại các hiệu ứng xã hội mạnh mẽ. Ví dụ: \`[{ "targetStat": "Thiện cảm", "modifier": "+20" }]\` đối với tất cả NPC của vương quốc đó, hoặc có thể mở khóa các lựa chọn đối thoại đặc biệt với giới quý tộc.

**II. Huy chương (Medal)**
*   **Khái niệm:** Một phần thưởng vật chất để công nhận một thành tích cụ thể. Nó ít trang trọng và phổ biến hơn Huân chương.
*   **Đặc điểm:**
    *   **Nguồn gốc:** Có thể được trao bởi nhiều tổ chức khác nhau: quân đội, hội mạo hiểm giả, một thành phố, hoặc ban tổ chức một cuộc thi.
    *   **Lý do:** Hoàn thành một chiến dịch quân sự, chiến thắng một giải đấu, hoặc hoàn thành một nhiệm vụ khó khăn.
    *   **Hình thức:** Một miếng kim loại (vàng, bạc, đồng) có khắc hình và chữ.
*   **Cơ chế trong Game:**
    *   **Loại Stat:** Có thể là một \`Stat\` với \`category: 'Vật phẩm'\` (một vật phẩm vật lý trong túi đồ) hoặc một \`'Danh Hiệu'\` cấp thấp hơn.
    *   **\`description\`:** Mô tả thành tích đã đạt được. Ví dụ: "Huy chương Vô địch Lôi đài thành Tương Dương."
    *   **\`effects\`:** Có thể có hoặc không có hiệu ứng. Nếu có, thường là một bonus nhỏ, cụ thể. Ví dụ: một huy chương chiến dịch có thể cho \`+5 Sức mạnh\` khi đối đầu với loại kẻ địch cụ thể.

**III. Giải thưởng (Award / Prize)**
*   **Khái niệm:** Một thuật ngữ chung, bao gồm các phần thưởng vật chất hoặc phi vật chất được trao cho người chiến thắng một cuộc thi hoặc hoàn thành một nhiệm vụ. Đây là phần "thưởng" thực tế.
*   **Các loại hình:**
    *   **Tiền thưởng (Prize Money):** Một khoản tiền.
    *   **Vật phẩm (Item Prize):** Một vũ khí, áo giáp, hoặc vật phẩm quý hiếm.
    *   **Danh hiệu (Title):** Một chức danh mới (ví dụ: "Võ lâm Minh chủ", "Đệ nhất Luyện đan sư").
    *   **Cơ hội (Opportunity):** Một lời mời gia nhập một phe phái, một cuộc gặp gỡ với một nhân vật quan trọng, hoặc một manh mối dẫn đến một nhiệm vụ mới.
*   **Cơ chế trong Game (BẮT BUỘC):**
    *   **Sử dụng Mệnh lệnh (\`directives\`):** Giải thưởng BẮT BUỘC phải được thực thi bằng các mệnh lệnh.
        -   **Tiền thưởng:** Dùng \`UPDATE_STAT\` để tăng giá trị cho Stat \`'Tài sản'\`.
        -   **Vật phẩm:** Dùng \`ADD_STAT\` để thêm vật phẩm vào túi đồ của nhân vật.
        -   **Danh hiệu:** Dùng \`ADD_STAT\` để thêm một Stat \`'Danh Hiệu'\` mới.
        -   **Cơ hội:** Thể hiện qua các \`actions\` gợi ý mới hoặc một \`message\` thông báo.
`;

export const LORE_LIBRARY_FORMS_OF_ADDRESS = `
#### Thư viện về Xưng Hô (Forms of Address)
- **Mục đích:** Cung cấp kiến thức nền chi tiết về cách nhân vật xưng hô với nhau trong các bối cảnh văn hóa và thể loại khác nhau. AI BẮT BUỘC phải tuân thủ các quy tắc này để tạo ra các đoạn hội thoại chân thực, có chiều sâu và phù hợp.

**I. Tu Tiên / Huyền Huyễn**
*   **Tự xưng (Self-address):**
    *   **Bình thường/Khiêm tốn:** Tại hạ, Vãn bối (với người lớn hơn), Tiểu tử/Tiểu nữ (tự ti hoặc khiêm tốn).
    *   **Ngang hàng:** Ta, Tại hạ, Đạo hữu.
    *   **Bề trên/Cường giả:** Ta, Bản tọa (người có địa vị cao), Lão phu/Lão thân (người già có thực lực), Bổn座 (bản tọa - mang tính bá đạo).
    *   **Nữ giới:** Thiếp (với chồng/đạo lữ), Tiểu nữ, Ta, Bản cung (người có địa vị trong hoàng tộc/tông môn).
*   **Gọi người khác:**
    *   **Tôn trọng (Bề trên):** Tiền bối, Tôn thượng, Lão nhân gia, Đại nhân.
    *   **Ngang hàng:** Đạo hữu, Các hạ, Huynh đài, Tiên tử (gọi nữ tu sĩ xinh đẹp).
    *   **Thân mật:** Huynh/Sư huynh, Tỷ/Sư tỷ, Đệ/Sư đệ, Muội/Sư muội.
    *   **Khinh thường (Bề dưới):** Tiểu bối, Tiểu tử, Tiểu nha đầu.
    *   **Tình cảm:** Đạo lữ, Phu quân, Nương tử.
*   **Trong Tông môn/Gia tộc:**
    *   **Người đứng đầu:** Tông chủ, Môn chủ, Gia chủ, Tộc trưởng.
    *   **Cấp cao:** Thái thượng Trưởng lão, Trưởng lão, Cung phụng.
    *   **Thầy-trò:** Sư tôn, Sư phụ, Ân sư. Đồ nhi, Đệ tử.

**II. Võ Lâm / Kiếm Hiệp**
*   **Tự xưng:**
    *   **Phổ biến:** Tại hạ, Tiểu sinh.
    *   **Người lớn tuổi:** Lão phu, Lão hủ.
    *   **Tu sĩ:** Bần tăng (nhà sư), Bần đạo (đạo sĩ).
    *   **Nữ giới:** Tiểu nữ, Tại hạ, Bổn cô nương (tự tin, kiêu ngạo).
*   **Gọi người khác:**
    *   **Tôn trọng:** Đại hiệp, Nữ hiệp, Tiền bối, Lão anh hùng.
    *   **Ngang hàng:** Huynh đài, Các hạ, Bằng hữu.
    *   **Gọi nữ giới:** Cô nương, Tiểu thư.
    *   **Gọi nam giới trẻ tuổi:** Công tử, Thiếu hiệp.
*   **Trong Môn phái:**
    *   **Người đứng đầu:** Chưởng môn nhân, Chưởng môn.
    *   **Thầy-trò:** Sư phụ. Đệ tử, Đồ nhi.
    *   **Đồng môn:** Sư huynh, Sư tỷ, Sư đệ, Sư muội, Sư thúc (em trai sư phụ), Sư bá (anh trai sư phụ).

**III. Dị Giới Fantasy (Bối cảnh Phương Tây)**
*   **Tự xưng:** Ta, Tôi.
*   **Gọi người khác:**
    *   **Hoàng gia:** Bệ hạ (Your Majesty - gọi Vua/Nữ hoàng), Điện hạ (Your Highness - gọi Hoàng tử/Công chúa).
    *   **Quý tộc:** Lãnh chúa (My Lord), Phu nhân (My Lady).
    *   **Hiệp sĩ & Quân đội:** Thưa Ngài (Sir), Chỉ huy (Commander).
    *   **Phổ biến (Ngang hàng hoặc gọi người lạ):** Thường dùng tên riêng. Có thể dùng các từ như "anh bạn" (friend), "này" (you).
    *   **Trang trọng:** Quý ông (Mister/Sir), Quý bà (Madam/Ma'am), Quý cô (Miss).

**IV. Đô Thị Hiện Đại (Bối cảnh Việt Nam)**
*   **Tự xưng:** Tôi (trang trọng), Mình, Tớ (bạn bè), Em (với người lớn hơn), Anh/Chị (với người nhỏ hơn), Con/Cháu (với người lớn tuổi trong gia đình).
*   **Gọi người khác (Ngôi thứ hai):**
    *   **Gia đình:** Ông, Bà, Bố/Ba/Cha, Mẹ/Má, Anh, Chị, Em, Cô, Dì, Chú, Bác, Cậu, Mợ...
    *   **Bạn bè đồng trang lứa:** Bạn, Cậu, Tên riêng.
    *   **Xã giao (ước chừng tuổi):**
        *   Gọi người lớn hơn một chút: Anh, Chị.
        *   Gọi người nhỏ hơn một chút: Em.
        *   Gọi người đáng tuổi cha mẹ: Bác, Chú, Cô.
        *   Gọi người đáng tuổi ông bà: Ông, Bà.
    *   **Tình cảm:** Anh - em, Cưng, Ông xã - Bà xã, Mình ơi.
    *   **Công sở:**
        *   Gọi cấp trên: Sếp, Giám đốc, Trưởng phòng, Anh/Chị + Tên.
        *   Gọi đồng nghiệp: Anh/Chị/Em + Tên (tùy tuổi), hoặc chỉ dùng Tên.
`;

export const LORE_LIBRARY_HIERARCHIES = `
#### Thư viện về Cấp bậc & Chức vụ (Hierarchies & Ranks)
- **Mục đích:** Cung cấp kiến thức nền chi tiết về các hệ thống cấp bậc trong quân đội, chính phủ, tông môn, và các tổ chức khác. AI BẮT BUỘC phải tham chiếu thư viện này khi tạo ra các NPC có vai trò xã hội hoặc khi mô tả các cấu trúc quyền lực, đảm bảo tính logic và phù hợp với bối cảnh thể loại.

**I. Hệ thống Quân đội (Military Ranks)**
*   **Áp dụng cho:** Thời Chiến, Hậu Tận Thế, Dị Giới Fantasy (Vương quốc).
*   **Cấp bậc (Từ cao đến thấp):**
    *   **Thống soái / Nguyên soái (Marshal / Generalissimo):** Cấp bậc quân sự cao nhất, chỉ huy toàn bộ quân đội.
    *   **Đại Tướng / Tướng quân (General):** Chỉ huy một tập đoàn quân lớn.
    *   **Trung Tướng (Lieutenant General):** Chỉ huy một quân đoàn.
    *   **Thiếu Tướng (Major General):** Chỉ huy một sư đoàn.
    *   **Đại Tá (Colonel):** Chỉ huy một trung đoàn hoặc lữ đoàn.
    *   **Trung Tá (Lieutenant Colonel):** Phó chỉ huy trung đoàn hoặc chỉ huy tiểu đoàn.
    *   **Thiếu Tá (Major):** Sĩ quan tham mưu hoặc phó chỉ huy tiểu đoàn.
    *   **Đại Úy (Captain):** Chỉ huy một đại đội (khoảng 100-250 lính).
    *   **Trung Úy (First Lieutenant):** Phó chỉ huy đại đội hoặc chỉ huy trung đội.
    *   **Thiếu Úy (Second Lieutenant):** Chỉ huy một trung đội (khoảng 30-50 lính).
    *   **Hạ sĩ quan (Non-Commissioned Officers - NCOs):** Thượng sĩ, Trung sĩ, Hạ sĩ - đóng vai trò xương sống của quân đội, trực tiếp chỉ huy các nhóm nhỏ binh lính.
    *   **Binh lính (Soldiers):** Binh nhất, Binh nhì.

**II. Hệ thống Quan lại & Chính phủ (Government & Civil Service)**

//--- A. Phong kiến & Lịch sử (Feudal & Historical) ---
*   **1. Trung Hoa Cổ đại (Imperial China):**
    *   **Hoàng đế (Emperor):** Người cai trị tối cao.
    *   **Tể tướng / Thừa tướng (Prime Minister / Chancellor):** Người đứng đầu quan văn.
    *   **Đại Tướng quân (Grand General):** Người đứng đầu quan võ.
    *   **Lục Bộ Thượng Thư (Six Ministers):** Những vị quan đứng đầu 6 bộ quan trọng (Lại, Hộ, Lễ, Binh, Hình, Công).
    *   **Tổng đốc (Viceroy / Governor-General):** Quan đứng đầu một hoặc nhiều tỉnh.
    *   **Tuần phủ (Provincial Governor):** Quan đứng đầu một tỉnh.
    *   **Tri phủ / Tri huyện (Prefect / Magistrate):** Quan đứng đầu một phủ hoặc một huyện.
    *   **Thái giám (Eunuch):** Quan lại phục vụ trong cung.
*   **2. Nhật Bản Phong kiến (Feudal Japan):**
    *   **Thiên Hoàng (Emperor):** Người đứng đầu mang tính biểu tượng, có quyền lực tâm linh.
    *   **Shōgun (Tướng quân):** Người cai trị quân sự trên thực tế, nắm toàn bộ quyền lực.
    *   **Daimyō (Lãnh chúa):** Người cai trị các phiên quốc (lãnh địa) lớn.
    *   **Samurai:** Tầng lớp võ sĩ, phục vụ cho Daimyō.
        *   **Hatamoto:** Samurai cấp cao, chư hầu trực tiếp của Shōgun.
        *   **Gokenin:** Chư hầu cấp thấp hơn.
    *   **Rōnin (Lãng nhân):** Samurai vô chủ.
    *   **Ninja / Shinobi:** Gián điệp, sát thủ.
*   **3. Châu Âu Trung Cổ (Medieval Europe):**
    *   **Vua / Nữ hoàng (King / Queen):** Người cai trị tối cao của một vương quốc.
    *   **Công tước (Duke / Duchess):** Quý tộc cấp cao nhất, cai trị một công quốc.
    *   **Hầu tước (Marquis / Marquise):** Quý tộc cai trị vùng biên giới.
    *   **Bá tước (Earl / Count / Countess):** Quý tộc cai trị một bá quốc (county).
    *   **Tử tước (Viscount / Viscountess):** Cấp bậc dưới bá tước.
    *   **Nam tước (Baron / Baroness):** Cấp bậc quý tộc thấp nhất.
    *   **Hiệp sĩ (Knight):** Võ sĩ được sắc phong, tuân theo tinh thần thượng võ.
    *   **Thị trưởng (Mayor):** Người đứng đầu một thành phố hoặc thị trấn.

//--- B. Hiện đại (Modern) ---
*   **1. Hệ thống Chung / Phương Tây (General / Western System):**
    *   **Hành pháp:** Tổng thống (President), Thủ tướng (Prime Minister), Bộ trưởng (Minister), Thống đốc (Governor), Thị trưởng (Mayor).
    *   **Lập pháp:** Chủ tịch Quốc hội/Nghị viện (Speaker), Nghị sĩ (Senator/Congressman).
    *   **Tư pháp & Điều tra:** Bộ trưởng Bộ Tư pháp (Attorney General), Công tố viên (Prosecutor), Chánh án (Chief Justice), Thẩm phán (Judge), Luật sư (Lawyer), Giám đốc Sở Cảnh sát (Police Commissioner), Chánh Thanh tra (Chief Inspector), Cảnh sát trưởng (Police Captain/Chief), Sĩ quan Cảnh sát (Police Officer).
*   **2. Nhật Bản Hiện đại (Modern Japan):**
    *   **Chính phủ:** Thiên Hoàng (Emperor - Nguyên thủ Quốc gia), Thủ tướng (Prime Minister - Người đứng đầu Chính phủ), Bộ trưởng (Minister), Nghị sĩ Quốc hội (Diet Member).
    *   **Doanh nghiệp (Kaisha):** Kaichō (会長 - Chủ tịch), Shachō (社長 - Giám đốc/Tổng Giám đốc), Buchō (部長 - Trưởng phòng), Kachō (課長 - Trưởng bộ phận).
*   **3. Hàn Quốc Hiện đại (Modern South Korea):**
    *   **Chính phủ:** Tổng thống (President), Thủ tướng (Prime Minister).
    *   **Tập đoàn Chaebol (Tài phiệt):** Hwejang (회장 - Chủ tịch), Sajang (사장 - Giám đốc/Tổng Giám đốc), Yisa (이사 - Giám đốc điều hành).
*   **4. Trung Quốc Hiện đại (Modern China):**
    *   **Đảng & Nhà nước:** Tổng Bí thư Đảng Cộng sản (General Secretary - chức vụ quyền lực nhất), Chủ tịch nước (President), Thủ tướng Quốc vụ viện (Premier), Ủy viên Bộ Chính trị (Politburo Member).

**III. Hệ thống Tông môn (Sect Hierarchy - Tu Tiên, Võ Lâm)**
*   **Cấp bậc (Từ cao đến thấp):**
    *   **Thái thượng Trưởng lão (Grand Elder):** Thường là các vị tổ sư đã nghỉ hưu nhưng có sức mạnh và tiếng nói quyết định.
    *   **Tông chủ / Môn chủ (Sect Master):** Người lãnh đạo tối cao hiện tại của tông môn.
    *   **Trưởng lão (Elder):** Các vị cao thủ có địa vị cao, phụ trách các mảng khác nhau (Truyền công, Chấp pháp, Luyện đan...).
    *   **Hộ pháp (Protector):** Chịu trách nhiệm bảo vệ tông môn.
    *   **Chân truyền Đệ tử (Core Disciple):** Những đệ tử tài năng nhất, được coi là người kế vị tương lai.
    *   **Nội môn Đệ tử (Inner Disciple):** Đệ tử chính thức, được truyền thụ công pháp cốt lõi.
    *   **Ngoại môn Đệ tử (Outer Disciple):** Đệ tử cấp thấp, làm các công việc tạp vụ và chỉ được học võ công cơ bản.
    *   **Tạp dịch Đệ tử (Servant Disciple):** Gần như là người hầu, không có địa vị.

**IV. Hệ thống Công ty Hiện đại (Chung)**
*   **Cấp bậc (Từ cao đến thấp):**
    *   **Chủ tịch Hội đồng Quản trị (Chairman of the Board).**
    *   **Tổng Giám đốc Điều hành (CEO - Chief Executive Officer).**
    *   **Giám đốc (Director / Manager):** Giám đốc Tài chính (CFO), Giám đốc Vận hành (COO), Giám đốc Công nghệ (CTO)...
    *   **Trưởng phòng (Head of Department).**
    *   **Nhân viên (Employee).**

**V. Hệ thống Tôn giáo (Religious Hierarchies)**
*   **Áp dụng cho:** Dị Giới Fantasy, Tu Tiên, Võ Lâm (cho các giáo phái), Thời Chiến (khi tôn giáo có vai trò chính trị).
*   **Mục đích:** Cung cấp cấu trúc cho các tổ chức tôn giáo, từ các giáo hội lớn có tổ chức chặt chẽ đến các giáo phái bí ẩn.

*   **1. Thiên Chúa Giáo / Giáo hội Phương Tây (Christianity / Western Church Style):**
    *   **Lãnh đạo Tối cao:** Giáo hoàng (Pope).
    *   **Hồng y Đoàn (College of Cardinals):** Hồng y (Cardinal) - cố vấn cho Giáo hoàng và bầu ra người kế vị.
    *   **Giám mục đoàn:** Tổng Giám mục (Archbishop - đứng đầu một tổng giáo phận quan trọng), Giám mục (Bishop - đứng đầu một giáo phận).
    *   **Linh mục đoàn:** Linh mục (Priest - coi sóc một giáo xứ, nhà thờ), Phó tế (Deacon).
    *   **Dòng tu (Monastic Orders):** Tu viện trưởng (Abbot/Abbess), Tu sĩ (Monk), Nữ tu (Nun).
    *   **Dòng tu Quân sự (Military Orders - Rất phổ biến trong Fantasy):** Đại Hiệp sĩ (Grand Master), Chỉ huy (Commander), Thánh kỵ sĩ (Paladin), Hiệp sĩ (Knight).
    *   **Các chức vụ khác:** Phán quan (Inquisitor - điều tra dị giáo), Giáo sĩ (Cleric - người có năng lực phép thuật thần thánh).
    *   **Cấp thấp nhất:** Tín đồ (Acolyte).

*   **2. Phật Giáo (Buddhism Style):**
    *   **Lãnh đạo tinh thần cao nhất:** Pháp chủ (Supreme Patriarch).
    *   **Chức sắc cao cấp:** Hòa thượng (Most Venerable - thường dành cho các nhà sư lớn tuổi, có đức độ cao), Thượng tọa (Venerable).
    *   **Quản lý Tự viện (Chùa):** Trụ trì (Abbot).
    *   **Tu sĩ (chính thức):** Tỳ kheo (Bhikshu - Monk), Tỳ kheo ni (Bhikshuni - Nun).
    *   **Tập sự:** Sa di (Śrāmaṇera - Novice monk), Sa di ni (Śrāmaṇerī - Novice nun).
    *   **Cư sĩ (Lay follower):** Phật tử.

*   **3. Hồi Giáo (Islam Style):**
    *   **Lãnh đạo Lịch sử/Chính trị-Tôn giáo:** Caliph (Người kế vị của nhà tiên tri, lãnh đạo toàn cõi Hồi giáo).
    *   **Lãnh đạo Tinh thần & Cầu nguyện:** Imam (Người hướng dẫn buổi cầu nguyện, lãnh đạo cộng đồng).
    *   **Học giả & Trưởng lão:** Sheikh (Học giả uyên bác, trưởng lão bộ lạc, hoặc lãnh đạo tâm linh).
    *   **Nhà Luật học:** Mufti (Học giả đưa ra các phán quyết về luật Hồi giáo - fatwa).
    *   **Thẩm phán:** Qadi (Thẩm phán của tòa án Hồi giáo).

*   **4. Giáo Hội Fantasy (Chung - Generic Fantasy Church):**
    *   **Lãnh đạo Tối cao:** Đại Tư tế / Giáo chủ (High Priest / Pontiff).
    *   **Hội đồng Tối cao:** Hội đồng Trưởng lão / Hồng y đoàn (Council of Elders / Conclave of Cardinals).
    *   **Cấp Khu vực:** Tổng Giám mục / Giám mục (Archbishop / Bishop).
    *   **Cấp Địa phương:** Tư tế / Nữ tư tế (Priest / Priestess).
    *   **Nhánh Quân sự:**
        *   **Thánh kỵ sĩ (Paladin):** Chiến binh thần thánh, đại diện cho sức mạnh và lòng mộ đạo.
        *   **Phán quan (Inquisitor):** Săn lùng và trừng phạt dị giáo, kẻ thù của đức tin.
    *   **Nhánh Học thuật/Tu hành:**
        *   **Học giả (Scholar):** Nghiên cứu các giáo lý và lịch sử.
        *   **Tu sĩ (Monk):** Sống khổ hạnh và cầu nguyện.
    *   **Cấp thấp:** Tín đồ (Acolyte), Người mới nhập đạo (Initiate).
`;
