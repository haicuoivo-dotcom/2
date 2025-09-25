/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

// This file assembles various lore libraries from sub-modules into a comprehensive
// world-building resource for the AI.

const LORE_LIBRARY_HISTORICAL_WARFARE = `
#### Thư viện về Chiến tranh Lịch sử
- **Mục đích:** Cung cấp kiến thức nền về các chiến thuật, đơn vị và khái niệm quân sự qua các thời kỳ lịch sử, giúp AI xây dựng các bối cảnh chiến tranh (đặc biệt cho thể loại 'Thời Chiến') một cách chân thực và có chiều sâu.

**I. Chiến tranh Trung Cổ (Medieval Warfare)**
*   **Chiến thuật Nổi bật:**
    *   **Công thành (Siege Warfare):** Sử dụng các vũ khí công thành như máy bắn đá (catapult, trebuchet), tháp công thành (siege tower), và xe phá cổng (battering ram) để tấn công các pháo đài kiên cố.
    *   **Kỵ binh Xung kích (Cavalry Charge):** Các hiệp sĩ mặc giáp nặng trên lưng ngựa chiến tạo thành một mũi nhọn tấn công, có sức công phá cực lớn để phá vỡ đội hình bộ binh.
    *   **Bức tường Khiên (Shield Wall):** Bộ binh (thường là người Viking hoặc Anglo-Saxon) xếp thành một hàng dày đặc, dùng khiên che chắn cho nhau để tạo thành một bức tường phòng thủ vững chắc.
*   **Đơn vị Đặc trưng:**
    *   **Hiệp sĩ (Knight):** Chiến binh quý tộc, được trang bị giáp trụ toàn thân, kiếm và ngựa chiến. Là lực lượng tinh nhuệ.
    *   **Cung thủ (Archer):** Đặc biệt là Cung thủ Anh (English Longbowman), có khả năng bắn tên với tốc độ và tầm xa đáng nể, tạo ra những cơn mưa tên chết chóc.
    *   **Lính giáo (Spearman):** Lực lượng bộ binh cơ bản, hiệu quả trong việc chống lại kỵ binh.

**II. Chiến tranh Thời kỳ Thuốc súng (Gunpowder Era - Thế kỷ 16-19)**
*   **Chiến thuật Nổi bật:**
    *   **Đội hình Dàn hàng ngang (Line Infantry Tactics):** Binh lính trang bị súng hỏa mai (musket) xếp thành các hàng dài, bắn đồng loạt để tối đa hóa hỏa lực.
    *   **Pháo binh (Artillery):** Đại bác trở thành vua của chiến trường, có khả năng phá hủy các công sự và gây thiệt hại lớn cho bộ binh từ xa.
*   **Đơn vị Đặc trưng:**
    *   **Lính hỏa mai (Musketeer):** Binh lính sử dụng súng hỏa mai, một loại súng nạp đạn từ đầu nòng, bắn chậm nhưng có khả năng xuyên giáp tốt hơn cung tên.
    *   **Kỵ binh Thiết giáp (Cuirassier):** Kỵ binh vẫn mặc giáp ngực, sử dụng súng lục và kiếm, dùng để tấn công vào sườn đội hình địch.

**III. Chiến tranh Thế giới (World War Era - Đầu thế kỷ 20)**
*   **Chiến thuật Nổi bật:**
    *   **Chiến tranh Chiến hào (Trench Warfare - WWI):** Hai bên đào các hệ thống chiến hào phức tạp, cố thủ và tấn công lẫn nhau qua một vùng đất trống gọi là "vùng đất không người" (No Man's Land). Giao tranh cực kỳ đẫm máu và ít tiến triển.
    *   **Chiến tranh Chớp nhoáng (Blitzkrieg - WWII):** Chiến thuật của Đức Quốc xã, kết hợp giữa các đơn vị xe tăng (Panzer) di chuyển nhanh, không quân (Luftwaffe) yểm trợ, và bộ binh cơ giới để chọc thủng phòng tuyến địch và bao vây đối phương một cách chóng vánh.
    *   **Không chiến (Dogfight):** Các máy bay tiêm kích (fighter plane) đối đầu trên không.
    *   **Ném bom Chiến lược (Strategic Bombing):** Sử dụng máy bay ném bom hạng nặng để phá hủy các mục tiêu công nghiệp và thành phố của đối phương.
*   **Vũ khí & Phương tiện Đặc trưng:**
    *   **Xe tăng (Tank):** Phương tiện bọc thép, xương sống của các cuộc tấn công trên bộ.
    *   **Máy bay Tiêm kích & Ném bom:** Làm chủ bầu trời.
    *   **Tàu ngầm (U-boat):** Vũ khí nguy hiểm trong chiến tranh hải quân, chuyên đánh chìm các tàu vận tải.
    *   **Tàu sân bay (Aircraft Carrier):** Thay thế Thiết giáp hạm trở thành trung tâm của hạm đội.

**IV. Chiến tranh Hiện đại (Modern Warfare - Cuối thế kỷ 20 đến nay)**
*   **Chiến thuật Nổi bật:**
    *   **Chiến tranh Phi đối xứng (Asymmetric Warfare):** Một bên yếu hơn về mặt quân sự (như quân nổi dậy) sử dụng các chiến thuật bất thường (du kích, khủng bố, IED) để chống lại một quân đội chính quy mạnh hơn.
    *   **Tác chiến Liên hợp (Combined Arms):** Phối hợp chặt chẽ giữa các quân chủng: bộ binh, thiết giáp, pháo binh, không quân, và hải quân để đạt hiệu quả tối đa.
    *   **Chiến tranh Mạng (Cyber Warfare):** Tấn công vào hệ thống máy tính và cơ sở hạ tầng mạng của đối phương.
*   **Đơn vị & Công nghệ Đặc trưng:**
    *   **Lực lượng Đặc nhiệm (Special Forces):** Các đơn vị tinh nhuệ, được huấn luyện cho các nhiệm vụ đặc biệt như trinh sát, chống khủng bố.
    *   **Máy bay không người lái (Drone):** Dùng cho cả mục đích do thám và tấn công.
    *   **Tên lửa Dẫn đường Chính xác (Precision-Guided Munitions):** Bom và tên lửa thông minh, có khả năng đánh trúng mục tiêu với sai số rất nhỏ.
`;

const LORE_LIBRARY_WORLD_GEO = `
#### Thư viện về các Quốc gia & Địa danh Nổi tiếng
- **Mục đích:** Cung cấp kiến thức nền về địa lý chính trị và các địa danh nổi tiếng thế giới để AI có thể tạo ra các bối cảnh hiện đại, lịch sử hoặc du hành một cách chân thực và có chiều sâu.

**I. Các Quốc gia Tiêu biểu (Theo Châu lục)**
*   **Châu Á:**
    *   **Trung Quốc:** Nền văn minh lâu đời, Vạn Lý Trường Thành, Tử Cấm Thành, Thượng Hải hiện đại.
    *   **Nhật Bản:** Văn hóa Samurai và Ninja, các đền chùa cổ kính ở Kyoto, sự sầm uất của Tokyo, núi Phú Sĩ.
    *   **Hàn Quốc:** Làn sóng văn hóa Hallyu (K-Pop, K-Drama), cung điện Gyeongbokgung, Seoul năng động.
    *   **Việt Nam:** Lịch sử chống ngoại xâm, Vịnh Hạ Long, Phố cổ Hội An, Thành phố Hồ Chí Minh nhộn nhịp.
    *   **Ấn Độ:** Nền văn hóa đa dạng, đền Taj Mahal, sông Hằng linh thiêng.
    *   **Thái Lan:** Các ngôi chùa vàng, cung điện hoàng gia, bãi biển nhiệt đới.
*   **Châu Âu:**
    *   **Anh:** Lịch sử hoàng gia, tháp đồng hồ Big Ben, London cổ kính và hiện đại.
    *   **Pháp:** Kinh đô ánh sáng Paris, tháp Eiffel, bảo tàng Louvre, văn hóa ẩm thực và thời trang.
    *   **Ý:** Đế chế La Mã, đấu trường Colosseum, tháp nghiêng Pisa, thành phố Venice thơ mộng.
    *   **Đức:** Lịch sử thế chiến, cổng Brandenburg, các lâu đài cổ tích.
    *   **Nga:** Quảng trường Đỏ, điện Kremlin, lịch sử Sa hoàng và Liên Xô.
    *   **Hy Lạp:** Cội nguồn văn minh phương Tây, đền Parthenon, các hòn đảo trên biển Aegean.
*   **Châu Mỹ:**
    *   **Hoa Kỳ (Mỹ):** Vùng đất của cơ hội, Tượng Nữ thần Tự do, Hollywood, các công viên quốc gia hùng vĩ như Grand Canyon.
    *   **Canada:** Thiên nhiên hoang dã, dãy núi Rocky, các thành phố đa văn hóa như Toronto và Vancouver.
    *   **Brazil:** Rừng rậm Amazon, lễ hội Carnival ở Rio de Janeiro, Tượng Chúa Cứu thế.
    *   **Mexico:** Nền văn minh Aztec và Maya, các kim tự tháp cổ.
*   **Châu Phi:**
    *   **Ai Cập:** Nền văn minh Ai Cập cổ đại, các kim tự tháp Giza, tượng Nhân sư.
    *   **Nam Phi:** Lịch sử Apartheid, Cape Town, các khu bảo tồn động vật hoang dã.
*   **Châu Đại Dương:**
    *   **Úc (Australia):** Thiên nhiên độc đáo (kangaroo, koala), nhà hát Opera Sydney, vùng Outback hoang dã.

**II. Các Địa danh Tự nhiên & Nhân tạo Nổi tiếng khác**
*   **Kỳ quan Thiên nhiên:** Rừng rậm Amazon, Thác Niagara, Thác Victoria, Rạn san hô Great Barrier Reef, Đỉnh Everest.
*   **Công trình Lịch sử:** Machu Picchu (Peru), Petra (Jordan), Bức tường Berlin (tàn tích).
*   **Thành phố Hiện đại Mang tính biểu tượng:** New York, Dubai, Singapore.
`;

export const WORLD_BUILDING_LIBRARIES = `
${LORE_LIBRARY_HISTORICAL_WARFARE}
${LORE_LIBRARY_WORLD_GEO}
`;
