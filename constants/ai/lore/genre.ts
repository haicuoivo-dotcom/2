/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

// Contains lore libraries for genre-specific elements like weapons and professions.

const LORE_LIBRARY_WEAPONS_CULTIVATION = `
**Vũ khí & Pháp bảo (Tu Tiên)**
*   **Phân loại theo cấp bậc:** Pháp Khí (thấp), Linh Khí, Bảo Khí, Tiên Khí/Thần Khí (cao).
*   **Công kích:** Phi kiếm, Phi đao, Pháp ấn, Chuông, Tháp.
*   **Phòng ngự:** Hộ thân khôi giáp, Thuẫn, Đỉnh.
*   **Phụ trợ:** Phi hành pháp bảo, Trận pháp, Túi trữ vật.
`;

const LORE_LIBRARY_WEAPONS_MODERN = `
**Vũ khí Cầm tay Hiện đại**
*   **Súng Ngắn:** Glock 19, Colt M1911, Beretta M9.
*   **Súng Tiểu Liên (SMG):** H&K MP5, Uzi.
*   **Súng Trường Tấn Công:** AK-47, M4 Carbine.
*   **Súng Bắn Tỉa:** Remington M24, Barrett M82.
*   **Dao Chiến Đấu:** Dao chiến thuật, Karambit.
`;

const LORE_LIBRARY_WEAPONS_FANTASY = `
**Vũ khí Fantasy**
*   **Cận chiến:** Kiếm (Đơn, Song, Đại), Rìu (Chiến, Ném), Dao găm, Chùy, Búa chiến.
*   **Tầm xa:** Cung (Ngắn, Dài), Nỏ.
*   **Ma thuật:** Gậy phép, Quyền trượng, Sách phép.
*   **Vũ khí có thể được yểm bùa** với các nguyên tố (Lửa, Băng, Sét...).
`;

const LORE_LIBRARY_WEAPONS_MARTIAL_ARTS = `
**Vũ khí Võ Lâm (Kiếm Hiệp)**
*   **Kiếm:** Biểu tượng của hiệp khách (Ỷ Thiên Kiếm).
*   **Đao:** Mạnh mẽ, dũng mãnh (Đồ Long Đao).
*   **Thương:** Vũ khí dài, linh hoạt.
*   **Côn/Bổng:** Vũ khí của Thiếu Lâm, Cái Bang (Đả Cẩu Bổng).
*   **Ám Khí:** Phi tiêu, kim châm, bột độc (vũ khí của Đường Môn).
*   **Quyền Cước:** Nắm đấm và đôi chân cũng là vũ khí.
`;

export const LORE_LIBRARY_MARTIAL_ARTS_CONCEPTS = `
#### Thư viện các Khái niệm Cốt lõi trong Võ Học (Wuxia Core Concepts)
- **Mục đích:** Cung cấp kiến thức nền sâu sắc về các khái niệm võ học để AI có thể mô tả các trận chiến, quá trình luyện tập, và các nhân vật một cách chân thực, có chiều sâu và phù hợp với thể loại Võ Lâm.

**1. Nội Công (Internal Energy / Neigong)**
*   **Khái niệm:** Nền tảng của mọi cao thủ. Đây là luồng năng lượng (khí) lưu chuyển bên trong cơ thể, được tích lũy qua nhiều năm khổ luyện. Nội công càng thâm hậu, sức mạnh càng kinh người.
*   **Luyện tập:** Thông qua các phương pháp như đả tọa (meditation), hô hấp (breathing techniques), và tu luyện các tâm pháp bí truyền.
*   **Biểu hiện:**
    *   **Cường hóa Thể chất:** Tăng cường sức mạnh, tốc độ, sức bền vượt xa người thường.
    *   **Chưởng phong / Kình khí (Palm Wind / Energy Force):** Có thể đả thương người khác từ xa mà không cần chạm vào, tạo ra các luồng gió áp bức.
    *   **Kiếm khí (Sword Qi):** Truyền nội lực vào vũ khí, tạo ra một luồng năng lượng sắc bén có thể kéo dài từ lưỡi kiếm, tăng phạm vi và sức công phá.
    *   **Hộ thể chân khí (Protective Aura):** Vận nội công tạo thành một lớp lá chắn vô hình bảo vệ cơ thể, chống lại các đòn tấn công.
    *   **Liệu thương (Healing):** Dùng nội công để chữa trị nội thương, đả thông kinh mạch.

**2. Ngoại Công (External Techniques / Waigong)**
*   **Khái niệm:** Các chiêu thức, kỹ thuật chiến đấu vật lý được thể hiện ra bên ngoài. Đây là sự vận dụng nội công vào thực chiến.
*   **Các loại hình chính:**
    *   **Quyền pháp (Fist Arts):** Sử dụng nắm đấm. Ví dụ: La Hán Quyền, Thái Cực Quyền.
    *   **Chưởng pháp (Palm Arts):** Sử dụng lòng bàn tay. Ví dụ: Hàng Long Thập Bát Chưởng.
    *   **Chỉ pháp (Finger Arts):** Sử dụng ngón tay để tấn công vào yếu huyệt. Ví dụ: Nhất Dương Chỉ, Lục Mạch Thần Kiếm.
    *   **Trảo pháp (Claw Arts):** Sử dụng các ngón tay cong lại như móng vuốt. Ví dụ: Cửu Âm Bạch Cốt Trảo.
    *   **Cước pháp (Kicking Arts):** Sử dụng các đòn đá.

**3. Khinh Công (Lightness Skill / Qinggong)**
*   **Khái niệm:** Kỹ năng vận dụng nội lực để làm cho cơ thể trở nên nhẹ nhàng, cho phép di chuyển với tốc độ phi thường, bay lượn trên không trung trong một khoảng thời gian ngắn, đi trên mặt nước, hoặc leo trèo trên các vách đá dựng đứng.
*   **Các kỹ năng nổi tiếng:** Lăng Ba Vi Bộ (Dali Duan Clan), Thê Vân Tung (Wudang).

**4. Binh Khí (Weapons)**
*   **Khái niệm:** Việc sử dụng thành thạo các loại vũ khí. Mỗi vũ khí có một "linh hồn" và triết lý sử dụng riêng.
*   **Triết lý:**
    *   **Kiếm:** "Bách binh chi quân tử" (Quân tử trong các loại binh khí), tượng trưng cho sự thanh cao, chính trực.
    *   **Đao:** "Bách binh chi bá" (Bá chủ trong các loại binh khí), tượng trưng cho sự dũng mãnh, uy lực.
    *   **Thương:** "Bách binh chi vương" (Vua của các loại binh khí), biến hóa khôn lường.

**5. Ám Khí (Hidden Weapons / Anqi)**
*   **Khái niệm:** Các loại vũ khí nhỏ, được che giấu và phóng ra một cách bất ngờ để hạ gục đối thủ. Đây là một nghệ thuật đòi hỏi sự chính xác và tính toán.
*   **Bậc thầy:** Đường Môn (Tang Clan) ở Tứ Xuyên được coi là gia tộc sử dụng ám khí và độc dược số một võ lâm.
*   **Các loại hình:** Phi tiêu, kim châm, phi đao, Bạo Vũ Lê Hoa Châm.

**6. Độc Công (Poison Arts / Dugong)**
*   **Khái niệm:** Nghệ thuật sử dụng các loại độc dược để tấn công hoặc hạ sát đối thủ. Độc có thể được tẩm vào vũ khí, ám khí, rắc trong không khí, hoặc bỏ vào thức ăn, nước uống.
*   **Bậc thầy:** Ngũ Độc Giáo (Five Venoms Sect) là môn phái chuyên về các loại độc từ côn trùng và thực vật.

**7. Điểm Huyệt (Acupoint Striking / Dianxue)**
*   **Khái niệm:** Kỹ thuật tấn công vào các huyệt đạo trên cơ thể đối phương để khống chế dòng chảy của nội lực (khí).
*   **Hiệu ứng:** Có thể gây tê liệt, bất động, mất tiếng nói, hoặc thậm chí là tử vong nếu đánh trúng tử huyệt.
*   **Giải huyệt:** Cần có người khác hoặc chính người ra đòn giải huyệt, hoặc phải chờ một khoảng thời gian để tự giải.

**V. Các Cảnh giới Tối cao trong Võ học (Supreme Realms in Martial Arts)**
*   **Nhân Kiếm hợp nhất (Man and Sword become one):**
    *   **Khái niệm:** Cảnh giới tối cao của kiếm thuật. Đây không phải là một chiêu thức, mà là một trạng thái triết học và chiến đấu, nơi ranh giới giữa người và kiếm hoàn toàn biến mất. Kiếm khách không còn "sử dụng" kiếm, mà họ và thanh kiếm đã "trở thành một".
    *   **Yêu cầu:** Đòi hỏi sự lĩnh ngộ sâu sắc về Kiếm Đạo (Way of the Sword), tài năng thiên bẩm, và thường là một mối liên kết tâm linh với một thanh kiếm cụ thể (thường là thần binh).
    *   **Biểu hiện:**
        *   **Kiếm tùy tâm động (Sword follows the Will):** Kiếm di chuyển theo ý nghĩ của người sử dụng một cách hoàn hảo, không có một chút độ trễ hay động tác thừa. Các chiêu thức trở nên linh hoạt, biến ảo khôn lường.
        *   **Kiếm khí Tự do (Effortless Sword Qi):** Người đạt đến cảnh giới này có thể dễ dàng phóng ra những luồng kiếm khí sắc bén, mạnh mẽ từ lưỡi kiếm, tấn công kẻ địch từ xa.
        *   **Linh hồn Cộng hưởng:** Kiếm của họ dường như có linh hồn, rung động và cộng hưởng với cảm xúc và ý chí của chủ nhân.
    *   **Tích hợp vào Game:** Đây có thể là một Kỹ năng bị động cấp SSS, một Trạng thái tâm pháp tối cao, hoặc là mô tả cho một đại cao thủ kiếm thuật như Độc Cô Cầu Bại.
`;

export const LORE_LIBRARY_MARTIAL_ARTS_KIM_DUNG = `
#### Thư viện Võ học Kinh điển (Kim Dung)
- **Mục đích:** Cung cấp kiến thức nền chi tiết về các bộ võ công nổi tiếng trong các tác phẩm của nhà văn Kim Dung, giúp AI tạo ra các nhân vật, tình tiết và thế giới Võ Lâm chân thực, có chiều sâu và hấp dẫn.

**I. Anh Hùng Xạ Điêu & Thần Điêu Hiệp Lữ (The Legend of the Condor Heroes & The Return of the Condor Heroes)**
*   **Hàng Long Thập Bát Chưởng (降龙十八掌):** Chưởng pháp chí dương, chí cương của Cái Bang. Uy lực vô song, mỗi chưởng đều mang hình rồng, do Hồng Thất Công và Quách Tĩnh sử dụng.
*   **Đả Cẩu Bổng Pháp (打狗棒法):** Gậy pháp trấn phái của Cái Bang, chỉ truyền cho bang chủ. Chiêu thức biến ảo khôn lường, tinh diệu.
*   **Cửu Âm Chân Kinh (九阴真经):** Bộ võ học thượng thừa, bao gồm nội công, ngoại công, khinh công, điểm huyệt. Gây ra vô số tranh đoạt trên giang hồ.
*   **Lạc Anh Thần Kiếm Chưởng (落英神剑掌):** Chưởng pháp của Hoàng Dược Sư (Đông Tà), mô phỏng cánh hoa rơi, vừa đẹp mắt vừa hiểm hóc.
*   **Đạn Chỉ Thần Thông (弹指神通):** Tuyệt kỹ búng ngón tay của Hoàng Dược Sư, có thể dùng để bắn sỏi đá như ám khí với uy lực kinh người.
*   **Cáp Mô Công (蛤蟆功):** Công phu độc môn của Âu Dương Phong (Tây Độc), mô phỏng con cóc, vận công kỳ dị nhưng uy mãnh.
*   **Tiên Thiên Công (先天功):** Môn nội công chí cao của Vương Trùng Dương (Trung Thần Thông), có khả năng khắc chế Cáp Mô Công.
*   **Ám Nhiên Tiêu Hồn Chưởng (黯然销魂掌):** Bộ chưởng pháp do Dương Quá sáng tạo trong 16 năm chờ đợi Tiểu Long Nữ, uy lực chỉ thua Hàng Long Thập Bát Chưởng.
*   **Ngọc Nữ Tâm Kinh (玉女心经):** Võ công của phái Cổ Mộ, đòi hỏi hai người nam nữ cùng tu luyện, bổ trợ cho nhau.
*   **Độc Cô Cửu Kiếm (独孤九剑):** Triết lý "vô chiêu thắng hữu chiêu", chỉ công không thủ, tìm ra sơ hở của đối phương để tấn công. Do Độc Cô Cầu Bại sáng tạo, Dương Quá lĩnh ngộ.

**II. Thiên Long Bát Bộ (Demi-Gods and Semi-Devils)**
*   **Lục Mạch Thần Kiếm (六脉神剑):** Tuyệt học của hoàng tộc nước Đại Lý, biến chỉ lực thành kiếm khí vô hình, sát thương cực lớn.
*   **Nhất Dương Chỉ (一阳指):** Chỉ pháp của họ Đoàn nước Đại Lý, dùng để tấn công và chữa thương.
*   **Bắc Minh Thần Công (北冥神功):** Công phu của phái Tiêu Dao, có khả năng hút nội lực của người khác làm của mình.
*   **Lăng Ba Vi Bộ (凌波微步):** Khinh công thượng thừa của phái Tiêu Dao, di chuyển theo hình bát quái, vừa né tránh vừa làm rối loạn đối thủ.
*   **Thiên Sơn Lục Dương Chưởng (天山六阳掌):** Chưởng pháp cao thâm của phái Tiêu Dao, uy lực vô cùng.
*   **Hàng Long Thập Bát Chưởng (phiên bản Tiêu Phong):** Do bang chủ Cái Bang Tiêu Phong sử dụng, mang khí thế hào hùng, uy mãnh vô song.
*   **Hóa Công Đại Pháp (化功大法):** Môn công phu tà độc của Đinh Xuân Thu, có khả năng làm tan rã nội lực của người khác.

**III. Tiếu Ngạo Giang Hồ (The Smiling, Proud Wanderer)**
*   **Độc Cô Cửu Kiếm (独孤九剑):** Được Phong Thanh Dương truyền lại cho Lệnh Hồ Xung.
*   **Tịch Tà Kiếm Phổ (辟邪剑法):** Kiếm pháp cực nhanh, cực hiểm, nhưng người luyện phải tự cung.
*   **Quỳ Hoa Bảo Điển (葵花宝典):** Môn võ công yêu cầu tự cung, là nguồn gốc của Tịch Tà Kiếm Phổ, do Đông Phương Bất Bại luyện.
*   **Hấp Tinh Đại Pháp (吸星大法):** Tương tự Bắc Minh Thần Công, hút nội lực của người khác nhưng có nhiều tác dụng phụ nguy hiểm.
*   **Tử Hà Thần Công (紫霞神功):** Nội công thượng thừa của phái Hoa Sơn, khi luyện mặt người tỏa ra ánh tím.

**IV. Ỷ Thiên Đồ Long Ký (The Heaven Sword and Dragon Saber)**
*   **Càn Khôn Đại Na Di (乾坤大挪移):** Tâm pháp trấn giáo của Minh Giáo, có khả năng di chuyển và sao chép nội lực, chiêu thức của đối thủ.
*   **Cửu Dương Thần Công (九阳神功):** Môn nội công chí dương, nội lực sinh sôi không ngừng, tự động hộ thể và phản chấn.
*   **Thái Cực Kiếm & Thái Cực Quyền (太极剑 / 太极拳):** Do Trương Tam Phong sáng tạo, triết lý "dĩ nhu khắc cương", dùng sự chậm rãi, mềm mại để chiến thắng sự nhanh, mạnh.
*   **Thất Thương Quyền (七伤拳):** Môn quyền pháp của phái Không Động, "tiên thương kỷ, hậu thương nhân" (trước làm hại mình, sau làm hại người).
*   **Huyền Minh Thần Chưởng (玄冥神掌):** Chưởng pháp cực kỳ âm hàn, người trúng chưởng sẽ bị hàn độc ăn mòn, đau đớn vô cùng.
`;

export const LORE_LIBRARY_WEAPONS = `
#### Thư viện Vũ khí (Theo Thể loại)
- **Mục đích:** Cung cấp kiến thức nền về các loại vũ khí đặc trưng cho từng thể loại để AI có thể tạo ra các vật phẩm và mô tả phù hợp.

${LORE_LIBRARY_WEAPONS_CULTIVATION}
${LORE_LIBRARY_WEAPONS_FANTASY}
${LORE_LIBRARY_WEAPONS_MARTIAL_ARTS}
${LORE_LIBRARY_WEAPONS_MODERN}
`;

const LORE_LIBRARY_MODERN_PROFESSIONS = `
**Ngành nghề Hiện đại**
*   **Hợp pháp:** Ngân hàng, Bác sĩ, Luật sư, Lập trình viên, Giáo viên, Cảnh sát, Diễn viên, Ca sĩ, Nhà báo, Thám tử tư.
*   **Bất hợp pháp:** Sát thủ hợp đồng, Hacker, Buôn lậu, Tay đua đường phố.
`;

export const LORE_LIBRARY_PROFESSIONS = `
#### Thư viện Chức nghiệp & Ngành nghề
- **Mục đích:** Cung cấp kiến thức nền về hệ thống chức nghiệp và ngành nghề để AI tạo ra các nhân vật có vai trò và kỹ năng phù hợp với bối cảnh.

**Chức nghiệp Fantasy**
*   **Cận chiến:** Chiến Binh (Warrior), Hiệp Sĩ (Knight), Paladin, Cuồng Chiến Sĩ (Berserker).
*   **Tầm xa:** Cung Thủ (Archer), Pháp Sư (Mage), Phù Thủy (Sorcerer).
*   **Lén lút:** Sát Thủ (Assassin), Kẻ Trộm (Thief).
*   **Hỗ trợ:** Thầy Thuốc (Healer), Giáo Sĩ (Priest).
*   **Phi chiến đấu:** Thợ rèn, Thương nhân, Nhà giả kim, Học giả.

${LORE_LIBRARY_MODERN_PROFESSIONS}
`;

export const LORE_LIBRARY_FOOD_AND_DRINKS = `
#### Thư viện Ẩm thực & Đồ uống (Theo Thể loại)
- **Mục đích:** Cung cấp kiến thức nền về các loại đồ ăn, thức uống đặc trưng cho từng bối cảnh để AI có thể làm cho thế giới trở nên sống động và chân thực hơn thông qua các chi tiết về cuộc sống hàng ngày.

**1. Đồ ăn & Thức uống trong Quán trọ Fantasy**
*   **Đồ ăn:**
    *   **Thịt hầm (Stew):** Món ăn phổ biến nhất, thường được hầm từ các loại thịt rẻ tiền (thỏ, gà) và rau củ.
    *   **Bánh mì đen (Black Bread):** Loại bánh mì thô, đặc ruột, ăn kèm với phô mai hoặc thịt hầm.
    *   **Thịt nướng nguyên tảng (Roasted Meat):** Dành cho những người có tiền, thường là thịt heo rừng hoặc thịt nai nướng trên lửa.
    *   **Cá hun khói (Smoked Fish):** Phổ biến ở các vùng gần sông hoặc biển.
*   **Đồ uống:**
    *   **Bia Ale:** Loại bia lên men bề mặt, có màu sẫm và vị đậm, là thức uống chính.
    *   **Rượu mật ong (Mead):** Rượu được lên men từ mật ong, ngọt và mạnh.
    *   **Rượu vang rẻ tiền (Cheap Wine):** Thường có vị chua, đựng trong các vò sành.

**2. Tiên tửu & Linh quả trong Thế giới Tu Tiên**
*   **Đồ ăn (Thường là phụ):**
    *   **Linh cốc (Spirit Grain):** Gạo được trồng ở những nơi có linh khí dồi dào, ăn vào giúp tăng nhẹ tu vi.
    *   **Thịt yêu thú (Demon Beast Meat):** Thịt của các loài yêu thú, chứa đựng năng lượng, có thể giúp cường hóa thể phách.
    *   **Linh quả (Spirit Fruit):** Các loại trái cây mọc ở nơi linh khí hội tụ, có thể tăng mạnh tu vi hoặc mang lại các hiệu ứng đặc biệt.
*   **Đồ uống:**
    *   **Linh trà (Spirit Tea):** Trà được pha từ những lá trà ngấm đẫm linh khí, giúp tĩnh tâm và thanh lọc cơ thể.
    *   **Tiên tửu (Immortal Wine):** Rượu được ủ bằng linh quả và thảo dược quý hiếm, uống vào có thể tăng mạnh linh lực. Ví dụ: 'Hầu Nhi Tửu', 'Bách Hoa Nhưỡng'.

**3. Lương thực trong Bối cảnh Hậu Tận Thế**
*   **Đồ ăn:**
    *   **Đồ hộp (Canned Goods):** Nguồn cung cấp thực phẩm chính và đáng tin cậy nhất.
    *   **Lương khô (Hardtack/Rations):** Bánh quy cứng, không vị nhưng để được rất lâu.
    *   **Thịt săn (Hunted Meat):** Thịt của các loài động vật hoang dã hoặc đã bị đột biến.
    *   **Rau củ tự trồng (Homegrown Vegetables):** Hiếm và quý giá, thường chỉ có ở các khu định cư an toàn.
*   **Đồ uống:**
    *   **Nước sạch (Clean Water):** Tài nguyên quý giá nhất, thường phải được đun sôi hoặc lọc.
    *   **Rượu tự chưng cất (Moonshine):** Rượu mạnh được làm từ các nguyên liệu thô, vừa để uống vừa để trao đổi.

**4. Ẩm thực trong Bối cảnh Hiện đại**
*   **Đa dạng:** Bao gồm tất cả các món ăn và đồ uống có thật trên thế giới.
*   **Thức ăn nhanh (Fast Food):** Hamburger, Pizza, Gà rán (KFC, McDonald's).
*   **Đồ ăn đường phố (Street Food):** Phổ biến ở các nước châu Á (Phở, Bánh mì ở Việt Nam; Takoyaki, Ramen ở Nhật Bản; Tteokbokki ở Hàn Quốc).
*   **Cà phê & Trà sữa:** Các chuỗi cửa hàng như Starbucks, Highlands Coffee, Gong Cha... là những địa điểm xã giao phổ biến.
`;
