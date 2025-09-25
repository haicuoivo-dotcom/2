/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

// Contains lore libraries related to accessories and jewelry across different genres.

export const LORE_LIBRARY_EYEWEAR_AND_VISION = `
#### Thư viện về Kính mắt & Thị lực
- **Mục đích:** Cung cấp kiến thức chuyên sâu về các loại kính mắt, kính áp tròng (lens) và các tật khúc xạ phổ biến. Điều này giúp AI mô tả ngoại hình nhân vật một cách chi tiết, thực tế và tạo ra các vật phẩm, trạng thái liên quan đến thị lực.
- **Quy tắc Logic Cốt lõi:** Việc đeo kính là một phần của ngoại hình và BẮT BUỘC phải được mô tả trong trường \`physicalAppearance\`. Các tật khúc xạ có thể được thể hiện dưới dạng một \`Stat\` với \`category: 'Trạng thái'\`.

**I. Kính gọng (Eyeglasses)**
*   **Mô tả:** Một phụ kiện quang học bao gồm tròng kính (lenses) được đặt trong một gọng (frame) để đeo trước mắt. Mục đích chính là để điều chỉnh các tật khúc xạ.
*   **Các loại Gọng kính:**
    *   **Gọng kim loại (Metal Frame):** Thanh mảnh, nhẹ nhàng, mang lại vẻ trí thức, tinh tế.
    *   **Gọng nhựa (Plastic/Acetate Frame):** Dày hơn, đa dạng về màu sắc và kiểu dáng, thể hiện cá tính.
    *   **Gọng không viền (Rimless Frame):** Gần như "vô hình" trên khuôn mặt.
*   **Các Kiểu dáng Gọng phổ biến:**
    *   **Gọng tròn (Round):** Cổ điển, mang hơi hướng vintage hoặc nghệ sĩ.
    *   **Gọng vuông (Square/Rectangular):** Mạnh mẽ, góc cạnh, tạo cảm giác chuyên nghiệp.
    *   **Gọng mắt mèo (Cat-eye):** Phần góc trên của gọng được kéo xếch lên, mang phong cách quyến rũ, hoài cổ.
*   **Các loại Tròng kính Chức năng:**
    *   **Tròng chống ánh sáng xanh (Blue Light Blocking):** Giảm mỏi mắt khi sử dụng các thiết bị điện tử.
    *   **Tròng đổi màu (Photochromic):** Tự động sẫm màu khi tiếp xúc với tia UV (ánh nắng mặt trời).
    *   **Tròng chiết suất cao (High-index):** Mỏng và nhẹ hơn, dành cho người có độ cận/viễn cao.

**II. Kính áp tròng (Contact Lenses / Lens)**
*   **Mô tả:** Một thấu kính mỏng được đặt trực tiếp lên bề mặt của mắt.
*   **Phân loại:**
    *   **Lens cận/viễn (Corrective Lenses):** Dùng để điều chỉnh tật khúc xạ, thay thế cho kính gọng. Chúng trong suốt và không làm thay đổi màu mắt tự nhiên.
    *   **Lens màu (Colored Lenses):** Dùng để thay đổi màu sắc của tròng đen, mang mục đích thẩm mỹ. Có thể có hoặc không có độ.
    *   **Lens giãn tròng (Circle Lenses):** Loại lens màu có đường kính lớn hơn tròng đen, tạo hiệu ứng mắt to tròn, long lanh. Rất phổ biến trong văn hóa giới trẻ châu Á.

**III. Kính râm (Sunglasses)**
*   **Mô tả:** Kính có tròng sẫm màu để bảo vệ mắt khỏi ánh sáng mặt trời chói chang và tia UV. Đồng thời cũng là một phụ kiện thời trang quan trọng.
*   **Các Kiểu dáng phổ biến:**
    *   **Kính phi công (Aviator):** Gọng kim loại mỏng, tròng kính lớn hình giọt nước.
    *   **Kính Wayfarer:** Gọng nhựa dày, hình thang.
    *   **Kính Clubmaster:** Nửa gọng trên dày, nửa dưới là viền kim loại mỏng.

**IV. Các Tật khúc xạ mắt (Refractive Errors)**
*   **Mô tả:** Đây là các tình trạng phổ biến khiến mắt không thể hội tụ ánh sáng đúng cách lên võng mạc, dẫn đến nhìn mờ. Có thể được thể hiện dưới dạng một \`Stat\` với \`category: 'Trạng thái'\`.
*   **Các loại Tật phổ biến:**
    *   **Cận thị (Myopia):**
        *   **Triệu chứng:** Nhìn rõ các vật ở gần nhưng nhìn mờ các vật ở xa.
        *   **Logic trong Game:** Có thể tạo ra một trạng thái \`'Cận thị'\` với \`description: "Khó khăn khi nhìn các vật ở xa nếu không có kính."\`. Có thể ảnh hưởng tiêu cực đến các kỹ năng tấn công tầm xa.
    *   **Viễn thị (Hyperopia):**
        *   **Triệu chứng:** Nhìn mờ các vật ở gần, có thể gây mỏi mắt, nhức đầu khi đọc sách hoặc làm việc gần.
        *   **Logic trong Game:** Có thể tạo ra trạng thái \`'Viễn thị'\`, gây bất lợi cho các hành động cần sự tỉ mỉ ở cự ly gần như đọc bản đồ, chế tác vật phẩm nhỏ.
    *   **Loạn thị (Astigmatism):**
        *   **Triệu chứng:** Hình ảnh bị mờ hoặc méo mó ở mọi khoảng cách.
        *   **Logic trong Game:** Có thể tạo ra trạng thái \`'Loạn thị'\` ảnh hưởng nhẹ đến độ chính xác của mọi hành động.
`;

export const LORE_LIBRARY_ACCESSORIES = `
#### Thư viện Phụ kiện và Trang sức
- **Mục đích:** Cung cấp kiến thức chuyên sâu về các loại phụ kiện và trang sức cho các thể loại Hiện Đại, Võ Lâm, và Tu Tiên để AI có thể mô tả và tạo ra các nhân vật, vật phẩm một cách chân thực, phù hợp với bối cảnh.

**I. Phụ kiện và Trang sức Hiện đại**
Trong thế giới hiện đại, phụ kiện và trang sức đa dạng về mẫu mã, chất liệu và công năng, phục vụ nhu cầu thẩm mỹ cũng như thể hiện cá tính.

*   **1. Phụ kiện:**
    *   **Túi xách:** Từ ví cầm tay, túi đeo chéo, túi tote, đến clutch, phục vụ nhu cầu đựng đồ cá nhân và hoàn thiện bộ trang phục. Chất liệu đa dạng như da, canvas, nhựa.
    *   **Kính mắt:** Kính râm bảo vệ mắt khỏi ánh nắng, kính cận/viễn để điều chỉnh thị lực, và kính thời trang tạo điểm nhấn cho gương mặt.
    *   **Thắt lưng:** Không chỉ giữ quần, thắt lưng còn là phụ kiện thời trang quan trọng, làm nổi bật vòng eo và tạo sự chỉn chu cho trang phục.
    *   **Khăn:** Khăn quàng cổ, khăn turban, khăn choàng có thể là phụ kiện giữ ấm hoặc tạo điểm nhấn màu sắc, họa tiết cho bộ trang phục.
    *   **Mũ nón:** Mũ lưỡi trai, mũ bucket, mũ fedora, mũ len... vừa có tác dụng che chắn, vừa là phụ kiện thời trang thể hiện phong cách.
    *   **Đồng hồ:** Bên cạnh chức năng xem giờ, đồng hồ còn là món trang sức thể hiện đẳng cấp và gu thẩm mỹ của người đeo.

*   **2. Trang sức:**
    *   **Nhẫn:** Đa dạng về chất liệu (vàng, bạc, bạch kim, titan) và kiểu dáng (nhẫn trơn, nhẫn đính đá, nhẫn cặp, nhẫn phong thủy).
    *   **Dây chuyền, Vòng cổ:** Có mặt dây chuyền đa dạng hình dáng và chất liệu, từ đơn giản đến cầu kỳ, phù hợp với nhiều phong cách và trang phục.
    *   **Bông tai, Khuyên tai:** Bao gồm đinh tai, khuyên tròn, khuyên dài, khuyên nụ, với đủ loại đá quý, ngọc trai, kim loại.
    *   **Vòng tay, Lắc tay, Lắc chân:** Từ vòng charm, vòng da, vòng kim loại, đến lắc tay đính đá, thể hiện sự tinh tế và cá tính.
    *   **Phụ kiện tóc:** Kẹp tóc, cài tóc, băng đô, dây buộc tóc, thường được đính đá, ngọc trai hoặc kim loại để tăng thêm vẻ duyên dáng.

**II. Phụ kiện và Trang sức trong Võ Lâm**
Trong thế giới Võ Lâm, phụ kiện và trang sức thường gắn liền với các trang bị, mang lại những chỉ số cộng thêm hỗ trợ chiến đấu, hoặc đơn giản là biểu tượng môn phái, thân phận.

*   **1. Trang bị hỗ trợ chiến đấu (thường là "Trang Sức"):**
    *   **Nhẫn:** Các loại nhẫn có thể tăng cường sức mạnh, nội lực, sinh lực, thân pháp, độ chính xác, né tránh, hoặc thậm chí có hiệu ứng đặc biệt khi tấn công (như đóng băng, giảm tốc). Ví dụ: Nhẫn Trường Sinh (tăng sinh lực), Trấn Nhạc (tăng sức mạnh), hoặc nhẫn có khả năng tạo tường băng.
    *   **Dây chuyền, Mặt dây chuyền:** Tương tự nhẫn, dây chuyền có thể tăng công kích kỹ năng, triệt tiêu sát thương, hoặc tăng kinh nghiệm nhận được.
    *   **Vòng cổ/Bội:** Tăng cường các chỉ số phòng thủ, kháng tính, hoặc hỗ trợ hiệu quả chiến đấu.
    *   **Bội quan/Vương miện:** Thường dành cho nhân vật có thân phận cao, hoặc mang lại những hiệu ứng mạnh mẽ về chỉ số.
    *   **Bối Sức:** Là một hệ thống trang bị đặc biệt, tượng trưng cho sức mạnh tổng hợp, giúp tăng năng lực cơ bản, điểm Binh Giáp, thuộc tính ngũ hành, sát thương cuối. Bối Sức thường có ngoại trang thay đổi theo cấp bậc.
    *   **Kim Bài/Huy chương:** Các vật phẩm được ban tặng vì công lao, thường mang ý nghĩa quyền uy và có thể có giá trị lớn trong game.

*   **2. Phụ kiện mang tính biểu tượng hoặc trang trí:**
    *   **Khăn che mặt:** Phổ biến cho các nữ hiệp, thích khách hoặc những nhân vật muốn ẩn danh.
    *   **Khăn quàng cổ:** Ngoài giữ ấm, còn có thể là điểm nhấn cho trang phục.
    *   **Mũ/Nón:** Khăn đóng, nón lá, hoặc các loại mũ nan để che giấu thân phận hoặc phù hợp với bối cảnh.
    *   **Trâm cài tóc:** Dành cho nữ nhân vật, có thể được chế tác tinh xảo, đôi khi ẩn chứa bí mật hoặc sức mạnh.

**III. Phụ kiện và Trang sức trong Tu Tiên**
Trong Tu Tiên, phụ kiện và trang sức mang đậm tính huyền ảo, tâm linh và thường đóng vai trò là Pháp Bảo, Linh Khí, hoặc các vật phẩm hỗ trợ tu luyện, gia tăng sức mạnh siêu nhiên.

*   **1. Pháp Bảo và Linh Khí (tích hợp vai trò trang sức):**
    *   **Nhẫn:** Không chỉ tăng chỉ số, nhẫn trong tu tiên có thể là nhẫn không gian (chứa đồ vật), nhẫn khống chế (trói buộc đối thủ), hoặc nhẫn chứa linh lực cường đại.
    *   **Vòng cổ/Dây chuyền:** Có thể là bùa hộ mệnh chống lại tà khí, vòng cổ ngưng tụ linh khí để hỗ trợ tu luyện, hoặc các dây chuyền pháp bảo tấn công mạnh mẽ.
    *   **Vòng tay/Vòng ngọc:** Có thể là vòng ngọc hộ thân tăng cường phòng thủ, vòng tay chứa trận pháp, hoặc vòng tay phong ấn sức mạnh của yêu ma.
    *   **Trâm cài tóc/Trâm:** Một pháp bảo phổ biến của nữ tu sĩ, có thể biến thành kiếm, kim châm tấn công, hoặc tạo ra ảo ảnh.
    *   **Bông tai/Hoa tai:** Đôi khi được chế tạo từ ngọc quý, tinh thể đặc biệt, có khả năng tăng cường thần thức, kháng phép, hoặc phát ra sóng âm công kích.
    *   **Vương miện/Băng đô:** Thường dành cho các vị tiên vương, thần nữ, có khả năng khống chế phạm vi lớn, tăng cường uy áp, hoặc kết nối với thiên địa.

*   **2. Vật phẩm hỗ trợ tu luyện:**
    *   **Ngọc bội/Ngọc bội nội đan:** Chứa đựng linh khí, nguyên lực, giúp tăng tốc độ tu luyện, hồi phục thương thế, hoặc tăng cường cảnh giới.
    *   **Châu/Hạt:** Các loại hạt châu được làm từ linh đan, tinh thể tu luyện, có thể dùng để chế tạo pháp bảo, hoặc trực tiếp hấp thụ linh khí.
    *   **Bùa chú/Phù lục:** Mặc dù không phải trang sức, nhưng chúng thường được đeo bên mình hoặc gắn trên trang phục, mang lại hiệu quả phòng ngự, tấn công, hoặc hỗ trợ tu luyện.

*   **3. Phụ kiện mang tính biểu tượng:**
    *   **Khăn voan/Khăn chít đầu:** Thường dùng để che mặt, tăng thêm vẻ thần bí, hoặc là biểu tượng của một môn phái, thế lực nào đó.
    *   **Túi Càn Khôn/Túi không gian:** Dù không phải là trang sức đeo trên người, nhưng chúng thường được mang theo, là vật phẩm "bất ly thân" để chứa đựng pháp bảo, linh dược, và vật phẩm tu luyện.

#### Thư viện Túi & Ví
- **Mục đích:** Cung cấp kiến thức chi tiết về các loại túi và ví phổ biến để AI có thể mô tả trang phục một cách đa dạng và phù hợp với bối cảnh.

**I. Túi Xách**
Túi xách được phân loại dựa trên nhiều tiêu chí như cách sử dụng, kiểu dáng, chất liệu.
*   **Phân loại theo cách sử dụng:**
    *   **Túi đeo vai (Shoulder Bag):** Có quai đeo đủ dài để đeo trên vai hoặc vắt chéo qua người. Phù hợp từ đi làm đến đi chơi.
    *   **Túi đeo chéo (Crossbody Bag):** Dây đeo dài hơn, cho phép đeo chéo qua ngực hoặc lưng, mang lại sự tiện dụng và năng động.
    *   **Túi xách tay (Handbag):** Túi nhỏ gọn, được cầm tay hoặc đeo trên cánh tay. Mang vẻ thanh lịch, sang trọng.
    *   **Balo (Backpack):** Có hai quai đeo, thích hợp cho việc di chuyển nhiều, du lịch hoặc đựng nhiều đồ.
    *   **Túi bao tử (Bumbag/Fanny Pack):** Loại túi nhỏ gọn, thường đeo quanh eo hoặc đeo chéo trước ngực.
*   **Phân loại theo kiểu dáng:**
    *   **Túi Tote:** Kích thước lớn, hình chữ nhật, miệng túi mở. Rất đa năng, có thể đựng laptop, tài liệu.
    *   **Túi Hobo:** Thiết kế hình bán nguyệt, thường có một dây đeo vai duy nhất. Phong cách phóng khoáng.
    *   **Túi Baguette:** Dáng hình chữ nhật dài, hẹp, giống bánh mì baguette. Rất thời trang.
    *   **Túi Satchel:** Phom dáng cứng cáp, vuông vắn, có nắp đậy. Phong cách cổ điển, thanh lịch.
    *   **Túi Bucket (Túi Loang):** Hình dạng giống chiếc xô, miệng túi rút dây. Phong cách bohemian.
    *   **Túi Envelope:** Thiết kế giống phong bì thư, nắp gập, sang trọng và tinh tế.
    *   **Túi Ring Bag:** Có chi tiết hình tròn giống chiếc nhẫn, tạo điểm nhấn độc đáo.
*   **Phân loại theo chất liệu:**
    *   **Túi da thật:** Sang trọng, bền bỉ.
    *   **Túi da tổng hợp (PU, PVC, Simili):** Phổ biến, đa dạng mẫu mã.
    *   **Túi vải (Canvas, Polyester):** Nhẹ nhàng, thoải mái, phong cách casual.

**II. Ví Cầm Tay (Clutch & Wallet)**
Ví cầm tay thường nhỏ gọn, được thiết kế để cầm trực tiếp trên tay hoặc để trong túi xách lớn hơn.
*   **Clutch (Ví dạ hội):** Kích thước lớn hơn ví thông thường, đủ đựng điện thoại, chìa khóa, son môi. Mang vẻ sang trọng, đẳng cấp, phù hợp cho các buổi tiệc tùng, sự kiện.
*   **Wallet (Ví thông thường):** Dạng ví cầm tay phổ biến, sử dụng hàng ngày. Có nhiều kích thước và kiểu dáng (ví dáng ngang, ví dáng đứng, ví gấp đôi, ví gấp ba). Chức năng chính là để đựng tiền mặt, giấy tờ tùy thân, thẻ ATM.

#### Thư viện Phối đồ Phá cách & Quyến rũ
- **Mục đích:** Cung cấp cho AI các "công thức" và ý tưởng phối đồ mang tính phá cách, độc đáo và quyến rũ, giúp AI không chỉ liệt kê trang phục mà còn có thể mô tả các nhân vật với phong cách thời trang cá tính và hấp dẫn hơn.

**1. Nội y làm Ngoại y (Lingerie as Outerwear)**
*   **Khái niệm:** Xu hướng mặc các món đồ vốn là nội y (áo corset, bralette, bodysuit) như một phần của trang phục chính bên ngoài.
*   **Cách phối:**
    *   **Corset/Bustier:** Mặc bên ngoài áo sơ mi trắng, áo thun, hoặc mặc một mình như một chiếc áo crop-top.
    *   **Bralette ren:** Để lộ một cách tinh tế bên dưới áo blazer khoác hờ, áo len cổ V khoét sâu, hoặc áo sơ mi không cài hết cúc.
    *   **Bodysuit:** Dùng thay thế cho áo thun hoặc áo sơ mi để tạo một silhouette gọn gàng, liền mạch khi phối với quần jean cạp cao hoặc chân váy.

**2. Tương phản Chất liệu (Material Contrast)**
*   **Khái niệm:** Kết hợp các chất liệu có tính chất đối lập (mềm mại vs. cứng cáp, mỏng manh vs. dày dặn) để tạo ra một tổng thể thú vị và có chiều sâu.
*   **Ví dụ kinh điển:**
    *   Váy lụa (Slip dress) + Áo khoác da (Leather jacket) + Bốt chiến binh (Combat boots).
    *   Áo ren (Lace top) + Quần jean rách (Ripped jeans).
    *   Áo len oversized (Oversized sweater) + Chân váy satin (Satin skirt).

**3. "Lộ mà không hở" - Vẻ đẹp Tinh tế (Subtle Revelation)**
*   **Khái niệm:** Tạo ra sự quyến rũ một cách tinh tế thông qua các chi tiết thiết kế thay vì phô bày quá nhiều da thịt.
*   **Các chi tiết thiết kế:**
    *   **Hở lưng (Backless):** Váy hoặc áo khoét sâu phần lưng.
    *   **Xẻ tà (Slit):** Chân váy hoặc đầm có đường xẻ tà cao, để lộ một phần chân khi di chuyển.
    *   **Vải xuyên thấu (Sheer Panels):** Sử dụng các mảng vải voan, lưới, ren ở những vị trí như tay áo, vai, hoặc eo.
    *   **Cut-out:** Những đường cắt xẻ táo bạo ở eo, hông, hoặc vai.
    *   **Trễ vai (Off-the-shoulder):** Khoe khéo phần xương quai xanh và bờ vai.

**4. Phong cách Oversize (Oversized Styling)**
*   **Khái niệm:** Sử dụng các món đồ có kích thước lớn hơn bình thường để tạo sự tương phản với vóc dáng, tạo ra vẻ ngoài vừa thoải mái, vừa cá tính và gợi cảm.
*   **Cách phối:**
    *   **Giấu quần (No-pants look):** Mặc một chiếc áo sơ mi, áo thun, hoặc hoodie oversized đủ dài để che đi quần short bên trong.
    *   **Cân bằng tỷ lệ:** Phối áo oversized với quần skinny, legging, hoặc chân váy bó để tạo sự cân đối.

**5. Bodysuit / Đồ tắm làm Áo (Bodysuit/Swimsuit as a Top)**
*   **Khái niệm:** Tận dụng sự ôm sát và liền mạch của đồ tắm một mảnh hoặc bodysuit để thay thế cho áo thông thường.
*   **Lợi ích:** Tạo ra một bề mặt phẳng, gọn gàng, không bị xộc xệch khi sơ vin. Rất hiệu quả khi mặc với quần cạp cao, chân váy bút chì.
*   **Ví dụ:** Phối đồ tắm một mảnh màu đen với quần jean ống rộng cạp cao và một chiếc áo khoác blazer.

#### Thư viện Mỹ phẩm & Làm đẹp
- **Mục đích:** Cung cấp kiến thức chi tiết về các loại mỹ phẩm và các phong cách trang điểm phổ biến để AI có thể mô tả ngoại hình nhân vật một cách chân thực, tinh tế và đa dạng hơn.

**I. Các Loại Sản phẩm Trang điểm**

*   **1. Trang điểm Nền (Base Makeup):**
    *   **Kem lót (Primer):** Tạo lớp màng mỏng, giúp làm mịn da và giữ lớp nền lâu trôi.
    *   **Kem nền (Foundation):** Làm đều màu da, che phủ các khuyết điểm. Có nhiều dạng (lỏng, kem, nén) và mức độ che phủ khác nhau.
    *   **Kem che khuyết điểm (Concealer):** Dùng để che phủ các vùng da có khuyết điểm rõ rệt như quầng thâm mắt, mụn, vết thâm.
    *   **Phấn phủ (Powder):** Cố định lớp nền, kiềm dầu, tạo bề mặt da mịn màng.
    *   **Phấn má hồng (Blush):** Tạo sức sống và sự tươi tắn cho gò má.
    *   **Tạo khối (Contour):** Dùng các tông màu tối để tạo chiều sâu, làm cho khuôn mặt trông thon gọn hơn.
    *   **Bắt sáng (Highlighter):** Dùng các tông màu sáng, có nhũ để làm nổi bật các vùng cao trên khuôn mặt như gò má, sống mũi, tạo hiệu ứng căng bóng.

*   **2. Trang điểm Mắt (Eye Makeup):**
    *   **Phấn mắt (Eyeshadow):** Tạo màu sắc và chiều sâu cho mí mắt.
    *   **Kẻ mắt (Eyeliner):** Kẻ đường viền mí mắt để tạo độ sắc sảo, làm cho đôi mắt trông to và có hồn hơn. Các kiểu phổ biến: kẻ mắt mèo (winged eyeliner), kẻ viền trong.
    *   **Mascara:** Làm dày, dài và cong mi.
    *   **Chì kẻ mày (Eyebrow Pencil/Powder):** Định hình và tô màu cho lông mày, tạo khung cho khuôn mặt.

*   **3. Trang điểm Môi (Lip Makeup):**
    *   **Son môi (Lipstick):** Sản phẩm tạo màu phổ biến nhất.
        *   **Son lì (Matte):** Không bóng, lên màu chuẩn và lâu trôi.
        *   **Son bóng (Glossy/Satin):** Có độ bóng, tạo hiệu ứng môi căng mọng.
        *   **Son kem (Cream):** Chất son mềm mịn.
    *   **Son bóng (Lip Gloss):** Trong suốt hoặc có màu nhẹ, tạo độ bóng cho môi.
    *   **Chì kẻ viền môi (Lip Liner):** Định hình viền môi, giúp son không bị lem.

**II. Các Phong cách Trang điểm Phổ biến**

*   **Phong cách Tự nhiên "Trong veo" (Natural / "No-Makeup" Look):**
    *   **Mục tiêu:** Trông như không trang điểm nhưng vẫn tươi tắn.
    *   **Cách thực hiện:** Lớp nền mỏng nhẹ, che khuyết điểm những vùng cần thiết, phấn phủ không màu, má hồng phớt nhẹ, lông mày chải tự nhiên, một lớp mascara mỏng, son môi màu nude hoặc hồng đất.
*   **Phong cách Quyến rũ Cổ điển (Classic Glam):**
    *   **Mục tiêu:** Vẻ đẹp sang trọng, vượt thời gian.
    *   **Cách thực hiện:** Lớp nền hoàn hảo, đường kẻ mắt mèo (winged eyeliner) sắc sảo, và điểm nhấn là đôi môi đỏ mọng quyến rũ.
*   **Phong cách Mắt khói (Smoky Eye):**
    *   **Mục tiêu:** Tạo chiều sâu và sự bí ẩn, thu hút cho đôi mắt.
    *   **Cách thực hiện:** Sử dụng các tông màu tối (đen, xám, nâu) tán đều và lan tỏa ra ngoài bầu mắt. Kẻ viền mắt đậm. Môi thường sử dụng màu nude để cân bằng.
*   **Phong cách Cá tính / Sáng tạo (Editorial/Creative):**
    *   **Mục tiêu:** Phá vỡ các quy tắc, thể hiện sự sáng tạo.
    *   **Cách thực hiện:** Có thể sử dụng các màu sắc nổi bật (xanh, tím), kẻ mắt đồ họa (graphic liner), đính đá hoặc kim tuyến.

#### Thư viện về các Phương pháp Tránh thai An toàn
- **Mục đích:** Cung cấp kiến thức về các biện pháp tránh thai an toàn để AI có thể xử lý các tình huống liên quan một cách chân thực và có trách nhiệm trong các bối cảnh hiện đại.

**I. Bao cao su (Condom)**
*   **Mô tả:** Là một phương pháp rào cản, thường được làm từ latex, được sử dụng trong quan hệ tình dục để ngăn ngừa mang thai và các bệnh lây truyền qua đường tình dục (STIs). Đây là phương pháp duy nhất có hiệu quả cao trong cả hai việc.
*   **Các loại Bao cao su phổ biến:**
    *   **Mỏng (Thin/Ultra-Thin):** Thiết kế mỏng hơn để tăng cảm giác chân thật.
    *   **Có gai/gân (Textured/Ribbed/Dotted):** Có các cấu trúc bề mặt để tăng cường khoái cảm cho nữ giới.
    *   **Kéo dài thời gian (Extended Pleasure/Delay):** Chứa một lượng nhỏ chất gây tê (như benzocaine) ở bên trong để giúp nam giới kéo dài thời gian quan hệ.
    *   **Hương thơm (Flavored):** Có thêm các hương vị như dâu, bạc hà, thường dùng cho quan hệ bằng miệng.
    *   **Kích thước (Sizing):** Có các kích thước khác nhau (nhỏ, lớn) để phù hợp với người dùng.
*   **Các Thương hiệu Nổi tiếng:** Durex, Sagami, Okamoto, Trojan.

**II. Các Phương pháp Tránh thai khác cho Nữ (Thường dùng hormone)**
*   **Thuốc tránh thai hàng ngày (Birth Control Pills):** Uống một viên mỗi ngày vào một giờ nhất định để ngăn rụng trứng. Hiệu quả rất cao nếu tuân thủ đúng.
*   **Thuốc tránh thai khẩn cấp (Emergency Contraceptive Pills):** Dùng sau khi quan hệ tình dục không được bảo vệ. Không nên lạm dụng.
*   **Que cấy tránh thai (Contraceptive Implant):** Một que nhỏ được cấy dưới da cánh tay, có tác dụng trong vài năm.
*   **Vòng tránh thai (IUD - Intrauterine Device):** Một dụng cụ nhỏ được đặt vào tử cung, có tác dụng lâu dài.

**III. Các Phương pháp Khác**
*   **Triệt sản Nam/Nữ (Vasectomy/Tubal Ligation):** Phương pháp vĩnh viễn, hiệu quả gần như 100%.
*   **Xuất tinh ngoài (Withdrawal Method):** Nam giới rút dương vật ra khỏi âm đạo trước khi xuất tinh. **Hiệu quả thấp** và không ngăn ngừa được STIs.
