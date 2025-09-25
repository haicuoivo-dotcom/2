/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

// Contains lore libraries related to ownable assets and wealth.

export const LORE_LIBRARY_CURRENCIES = `
#### Thư viện về Tiền tệ (Currencies)
- **Mục đích:** Cung cấp kiến thức nền về các loại tiền tệ trong các bối cảnh khác nhau, giúp AI tạo ra các Stat 'Tài sản' phù hợp và mô tả các giao dịch kinh tế một cách chân thực.

**I. Tiền tệ Tu Tiên / Võ Lâm**
*   **Linh Thạch (Spirit Stones):**
    *   **Mô tả:** Đơn vị tiền tệ và tài nguyên tu luyện cao cấp nhất. Là những viên đá chứa đựng linh khí trời đất tinh khiết.
    *   **Phân cấp:** Thường được chia thành Hạ phẩm, Trung phẩm, Thượng phẩm, và Cực phẩm, với tỷ lệ quy đổi (ví dụ: 100 hạ phẩm = 1 trung phẩm).
*   **Lượng Bạc (Silver Taels):**
    *   **Mô tả:** Đơn vị tiền tệ phổ biến trong giang hồ võ lâm. Thường là những nén bạc có trọng lượng nhất định.
    *   **Quy đổi:** Thường có các đơn vị nhỏ hơn như Tiền đồng.

**II. Tiền tệ Fantasy / Dị Giới**
*   **Đồng Vàng (Gold Coins):** Đơn vị tiền tệ tiêu chuẩn trong hầu hết các thế giới fantasy phương Tây.
*   **Đồng Bạc (Silver Coins) & Đồng Xu (Copper Coins):** Các đơn vị nhỏ hơn của Đồng Vàng. (ví dụ: 10 Bạc = 1 Vàng, 10 Xu = 1 Bạc).
*   **Septim (The Elder Scrolls):** Đồng tiền vàng của Đế chế Tamriel.
*   **Crowns (The Witcher):** Đơn vị tiền tệ của các Vương quốc phương Bắc.

**III. Tiền tệ Hiện đại (Real-world)**
*   **Đô la Mỹ (USD - $):** Đồng tiền dự trữ của thế giới, được sử dụng rộng rãi nhất.
*   **Euro (€):** Đồng tiền chung của nhiều quốc gia châu Âu.
*   **Yên Nhật (JPY - ¥):** Đơn vị tiền tệ của Nhật Bản.
*   **Nhân Dân Tệ (CNY - ¥):** Đơn vị tiền tệ của Trung Quốc.
*   **Won Hàn Quốc (KRW - ₩):** Đơn vị tiền tệ của Hàn Quốc.
*   **Đồng Việt Nam (VND - ₫):** Đơn vị tiền tệ của Việt Nam.

**IV. Tiền tệ Khoa học Viễn tưởng & Hậu Tận Thế (Sci-Fi & Post-Apocalyptic)**
*   **Tín dụng (Credits):** Đơn vị tiền tệ kỹ thuật số, phổ biến trong hầu hết các bối cảnh tương lai và du hành không gian.
*   **Nắp chai (Bottle Caps):** Đơn vị tiền tệ trong thế giới hậu tận thế của series game Fallout.

**V. Các loại tiền tệ khác**
*   **Thủy tinh thể Quái vật (Monster Crystals):** Lõi kết tinh từ quái vật, vừa là nguyên liệu chế tác vừa có thể dùng làm tiền tệ ở một số nơi.
`;

export const LORE_LIBRARY_ASSETS = `
#### Thư viện về các loại Tài sản
- **Mục đích:** Cung cấp kiến thức nền về các loại tài sản mà một nhân vật có thể sở hữu, vượt ra ngoài tiền bạc và vật phẩm thông thường. Điều này giúp AI có thể tạo ra các phần thưởng, mục tiêu, và các tình huống kinh tế-xã hội một cách đa dạng và có chiều sâu hơn.
- **Cơ chế trong Game:** Các tài sản này thường được đại diện bởi một Stat có category: 'Tài sản' hoặc 'Vật phẩm' (ví dụ: 'Giấy tờ nhà', 'Chìa khóa xe').

**I. Tài sản Tài chính (Financial Assets)**
*   **Mô tả:** Các dạng của cải có tính thanh khoản, có thể dùng để giao dịch hoặc đầu tư.
*   **Ví dụ:**
    *   **Tiền mặt (Cash):** Tiền tệ vật chất (Linh Thạch, Lượng Bạc, Đô la) mà nhân vật mang theo người.
    *   **Tài khoản Ngân hàng (Bank Account):** Phổ biến trong bối cảnh Hiện đại & Tương lai. Tiền được gửi trong một tổ chức tài chính.
    *   **Cổ phần / Cổ phiếu (Stocks/Shares):** Quyền sở hữu một phần của một công ty hoặc thương hội. Mang lại cổ tức hoặc có thể bán đi để kiếm lời.
    *   **Tiền ảo (Cryptocurrency):** (Hiện đại/Tương lai) Tài sản kỹ thuật số phi tập trung như Bitcoin, Ethereum.
    *   **Giấy ghi nợ (Debt Notes):** Giấy tờ chứng minh một người khác nợ nhân vật một khoản tiền.

**II. Bất động sản (Real Estate)**
*   **Mô tả:** Đất đai và các công trình kiến trúc gắn liền với đất.
*   **Ví dụ:**
    *   **Nhà ở (Residence):** Từ một căn nhà nhỏ, căn hộ trong thành phố, đến một biệt thự sang trọng hoặc một trang viên rộng lớn.
    *   **Động phủ (Cave Abode - Tu Tiên):** Một hang động đã được cải tạo, thường nằm ở nơi có linh khí dồi dào, dùng làm nơi ở và tu luyện.
    *   **Lãnh địa (Fief/Territory):** Một vùng đất rộng lớn mà nhân vật (thường là quý tộc, lãnh chúa) có quyền cai trị, thu thuế và khai thác tài nguyên.
    *   **Bất động sản Thương mại:** Cửa hàng, nhà kho, quán trọ, nhà hàng. Có thể tự kinh doanh hoặc cho thuê để tạo thu nhập thụ động.
    *   **Đất đai:** Các mảnh đất trống có thể dùng để xây dựng hoặc canh tác.

**III. Doanh nghiệp & Kinh doanh (Businesses & Ventures)**
*   **Mô tả:** Các hoạt động kinh doanh tạo ra thu nhập.
*   **Ví dụ:**
    *   **Cửa hàng (Shop):** Một cửa hàng bán lẻ (vũ khí, thuốc, tạp hóa...).
    *   **Quán trọ / Tửu lầu (Tavern/Inn):** Cung cấp dịch vụ ăn uống và nghỉ ngơi.
    *   **Xưởng chế tác (Workshop):** Xưởng rèn, xưởng luyện đan, xưởng may...
    *   **Thương đoàn (Merchant Caravan):** Một đoàn xe vận chuyển hàng hóa giữa các thành phố để buôn bán.
    *   **Tuyến đường Thương mại (Trade Route):** Quyền kiểm soát hoặc thu thuế trên một tuyến đường giao thương quan trọng.
    *   **Công ty / Tập đoàn (Company/Corporation):** (Hiện đại/Tương lai) Một tổ chức kinh doanh lớn.

**IV. Phương tiện Di chuyển (Vehicles)**
*   **Mô tả:** Các phương tiện dùng để di chuyển cá nhân hoặc vận chuyển hàng hóa.
*   **Ví dụ:**
    *   **Thú cưỡi (Mount):** Ngựa, Lạc đà, Sói chiến, Griffin...
    *   **Xe ngựa (Carriage):** Phương tiện di chuyển đường bộ phổ biến thời trung cổ.
    *   **Thuyền / Tàu (Boat/Ship):** Dùng để di chuyển trên mặt nước.
    *   **Phi hành pháp bảo (Flying Artifact - Tu Tiên):** Kiếm bay, hồ lô, thuyền bay...
    *   **Ô tô / Xe máy (Car/Motorcycle):** (Hiện đại) Phương tiện cá nhân.
    *   **Máy bay / Chuyên cơ riêng (Airplane/Private Jet):** (Hiện đại) Di chuyển đường dài.
    *   **Phi thuyền (Starship):** (Tương lai) Du hành giữa các hành tinh.

**V. Vật phẩm Quý giá (Valuables)**
*   **Mô tả:** Các vật phẩm có giá trị cao do tính hiếm có, nghệ thuật, hoặc lịch sử. Có thể dùng để cất giữ giá trị hoặc bán đi khi cần.
*   **Ví dụ:**
    *   **Trang sức & Đá quý (Jewelry & Gemstones):** Vàng, bạc, kim cương, ngọc lục bảo...
    *   **Tác phẩm Nghệ thuật:** Tranh quý, tượng điêu khắc.
    *   **Đồ cổ / Cổ vật (Antiques/Artifacts):** Các vật phẩm có giá trị lịch sử hoặc ma thuật.
    *   **Bí kíp / Sách hiếm:** Các công pháp võ học, sách ma thuật cổ.

**VI. Tài sản Vô hình (Intangible Assets)**
*   **Mô tả:** Các tài sản không có hình dạng vật chất nhưng vẫn có giá trị.
*   **Ví dụ:**
    *   **Thông tin / Bí mật (Information/Secrets):** Một bí mật quan trọng về một nhân vật hoặc phe phái có thể được dùng để uy hiếp hoặc trao đổi.
    *   **Danh tiếng (Reputation):** Danh tiếng tốt hoặc xấu có thể mở ra hoặc đóng lại các cơ hội.
    *   **Chức tước / Danh hiệu (Titles):** Địa vị quý tộc hoặc một danh hiệu anh hùng mang lại quyền lực và sự tôn trọng.
    *   **Bằng sáng chế / Bản quyền (Patents/Copyrights):** Quyền sở hữu trí tuệ đối với một phát minh hoặc tác phẩm.

${LORE_LIBRARY_CURRENCIES}
`;

export const LORE_LIBRARY_MODERN_RARITY = `
#### Thư viện về Khái niệm "Độ hiếm" trong Bối cảnh Hiện đại
- **Mục đích:** Cung cấp kiến thức nền về cách xác định độ hiếm của vật phẩm trong thế giới hiện đại, khác biệt với các bối cảnh fantasy/tu tiên. AI BẮT BUỘC phải tuân thủ logic này khi tạo ra hoặc đánh giá vật phẩm.
- **Nguyên tắc Cốt lõi:** Trong bối cảnh hiện đại, 'Độ hiếm' không đo lường sức mạnh chiến đấu, mà đo lường sự **độc nhất, giá trị sưu tầm, ý nghĩa lịch sử/văn hóa, và sự khan hiếm**.

*   **Phổ thông (Common):**
    *   **Định nghĩa:** Các vật phẩm được sản xuất hàng loạt, dễ dàng mua được.
    *   **Ví dụ:** Điện thoại thông minh (iPhone, Samsung), laptop, quần áo hàng hiệu (phiên bản thường), xe hơi phổ thông, hầu hết các loại vũ khí hiện đại (súng lục, súng trường). Một khẩu súng mạnh mẽ, đắt tiền cũng là 'Phổ thông' vì nó được sản xuất hàng loạt.

*   **Cao cấp (Uncommon):**
    *   **Định nghĩa:** Các vật phẩm sản xuất hàng loạt nhưng có giá trị cao hơn, ít phổ biến hơn.
    *   **Ví dụ:** Đồng hồ Thụy Sĩ phiên bản tiêu chuẩn (Rolex, Omega), túi xách hàng hiệu phiên bản thông thường (Hermès Birkin), một chiếc ô tô hạng sang (Mercedes S-Class).

*   **Hiếm (Rare):**
    *   **Định nghĩa:** Các vật phẩm có số lượng giới hạn, khó tìm, hoặc có giá trị lịch sử.
    *   **Ví dụ:** Đồ cổ (một chiếc bình gốm từ thế kỷ 18), xe hơi phiên bản giới hạn (chỉ sản xuất vài trăm chiếc), một tác phẩm nghệ thuật của một nghệ sĩ có tên tuổi.

*   **Sử thi (Epic):**
    *   **Định nghĩa:** Các vật phẩm gần như độc nhất vô nhị, có câu chuyện hoặc nguồn gốc đặc biệt.
    *   **Ví dụ:** Một chiếc xe cổ từng thuộc về một người nổi tiếng, một bản thảo gốc của một cuốn sách best-seller, một món đồ trang sức được chế tác riêng cho một sự kiện lịch sử (ví dụ: vương miện hoa hậu).

*   **Huyền thoại (Legendary):**
    *   **Định nghĩa:** Các vật phẩm độc nhất, vô giá, có tầm quan trọng lịch sử hoặc văn hóa to lớn.
    *   **Ví dụ:** Cây đàn guitar mà John Lennon đã dùng để sáng tác 'Imagine', viên kim cương Hy Vọng, một cổ vật quốc gia được trưng bày trong bảo tàng.

**QUY TẮC BẮT BUỘC:** Khi tạo vật phẩm trong bối cảnh hiện đại, hãy luôn tự hỏi: "Vật này có được sản xuất hàng loạt không?" Nếu câu trả lời là có, độ hiếm của nó không thể cao hơn 'Cao cấp'.
`;
