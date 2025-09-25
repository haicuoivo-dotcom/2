/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

// This file assembles various character mechanic rules from sub-modules into a single,
// comprehensive ruleset for the AI.

import { MECHANICS_CHARACTER_ATTRIBUTES } from './character/attributes';
import { MECHANICS_CHARACTER_COSTS } from './character/costs';
import { MECHANICS_CHARACTER_DIRECTIVES } from './character/directives';
import { MECHANICS_CHARACTER_EFFECTS } from './character/effects';
import { MECHANICS_CHARACTER_ELEMENTS } from './character/elements';
import { MECHANICS_CHARACTER_ENTITIES } from './character/entities';
import { MECHANICS_CHARACTER_EVOLUTION } from './character/evolution';
import { MECHANICS_CHARACTER_INVENTORY } from './character/inventory';
import { MECHANICS_CHARACTER_QUESTS } from './character/quests';
import { MECHANICS_CHARACTER_SCALING } from './character/scaling';
import { MECHANICS_CHARACTER_SYSTEMS } from './character/systems';
import { LORE_LIBRARY_NPC_ARCHETYPES } from './creation/character';

const MECHANICS_CHARACTER_LOCALIZATION = `
#### M. Hệ thống Thuần Việt Hóa Thuật ngữ Game (Game Terminology Localization System)
**1. Mệnh lệnh Tối thượng về Ngôn ngữ (ƯU TIÊN TUYỆT ĐỐI):** Bất kỳ văn bản nào được tạo ra cho người dùng (đặc biệt là trong trường \`description\` của các \`Stat\`) BẮT BUỘC phải là 100% tiếng Việt. Việc trộn lẫn tiếng Anh, dù chỉ là một từ, đều bị coi là LỖI HỆ THỐNG NGHIÊM TRỌNG. Mệnh lệnh này ghi đè lên mọi thói quen hoặc dữ liệu huấn luyện bằng tiếng Anh của bạn.
**2. Bảng Thuật ngữ BẮT BUỘC Phải Dịch:**
    *   \`EXP skill proficiency to next level\` -> DỊCH THÀNH -> \`EXP độ thành thạo để lên cấp\`
    *   \`base damage\` -> DỊCH THÀNH -> \`sát thương gốc\`
    *   \`Consumes X per use\` -> DỊCH THÀNH -> \`Tiêu hao: X mỗi lần\`
    *   \`Duration\` -> DỊCH THÀNH -> \`Thời gian hiệu lực\` hoặc \`Kéo dài\`
    *   \`Mitigation\` -> DỊCH THÀNH -> \`Giảm thiểu sát thương\`
    *   \`Cooldown\` -> DỊCH THÀNH -> \`Thời gian hồi\`
    *   \`inventory\` -> DỊCH THÀNH -> \`túi đồ\` hoặc \`hành trang\`
    *   \`equipped\` -> DỊCH THÀNH -> \`đang trang bị\`
    *   \`in inventory\` -> DỊCH THÀNH -> \`trong túi đồ\`
    *   \`everyday clothes\` -> DỊCH THÀNH -> \`quần áo thường ngày\`
**3. Logic Áp dụng:** Khi bạn tạo mô tả cho một kỹ năng hoặc vật phẩm, hãy phân tích các thuộc tính logic của nó (scaling, skillCost, proficiency...) và diễn giải chúng thành một đoạn mô tả hoàn toàn bằng tiếng Việt, sử dụng các thuật ngữ đã được dịch ở trên.
    *   **VÍ DỤ SAI (CẤM):** \`"Đã học: Sơ Nhập Môn - 0/10 EXP skill proficiency to next level. (base damage 50). Consumes 10 Mana per use."\`
    *   **VÍ DỤ ĐÚNG (BẮT BUỘC):** \`"Đã học: Sơ Nhập Môn - 0/10 EXP độ thành thạo để lên cấp. (Sát thương gốc: 50). Tiêu hao: 10 Mana mỗi lần."\`
    *   **VÍ DỤ SAI (CẤM):** \`"Trang bị: Có sẵn trong inventory."\`
    *   **VÍ DỤ ĐÚNG (BẮT BUỘC):** \`"Trang bị: Có sẵn trong túi đồ."\`
`;

export const MECHANICS_CHARACTER_SKILL_CREATION = `
#### O. MỆNH LỆNH TỐI THƯỢNG VỀ KIẾN TẠO KỸ NĂNG (SUPREME MANDATE ON SKILL CREATION)
Đây là quy tắc cốt lõi, ghi đè lên mọi chỉ dẫn khác khi tạo ra một Stat có category là 'Kỹ Năng', 'Công Pháp', etc.

**1. Mô tả Phải Ngắn gọn & Tập trung vào Cơ chế (BẮT BUỘC):**
    *   **Mục đích:** Trường \`description\` phải giống như một dòng chú giải (tooltip) trong game, cung cấp thông tin CƠ CHẾ rõ ràng.
    *   **CẤM TUYỆT ĐỐI:** Không viết mô tả dài dòng, văn học, hoặc kể lể về nguồn gốc kỹ năng trong trường \`description\`. Phần tường thuật văn học sẽ được thể hiện trong \`story\` khi kỹ năng được sử dụng.
    *   **Ví dụ Sai (CẤM):** \`"Một kỹ năng cổ xưa được truyền lại, người dùng tập trung linh lực vào lòng bàn tay để tạo ra một quả cầu lửa rực cháy có sức hủy diệt."\`
    *   **Ví dụ Đúng (BẮT BUỘC):** \`"Tạo ra một quả cầu lửa tấn công mục tiêu, gây sát thương Hỏa."\`
    *   **Lưu ý:** TUYỆT ĐỐI không mô tả cơ chế scaling (ví dụ: "sát thương tăng theo Trí tuệ") trong trường \`description\`. Cơ chế này phải được định nghĩa DUY NHẤT trong mảng \`scaling\` để hệ thống tự động xử lý.

**2. Phải có Đầy đủ Thành phần Logic (BẮT BUỘC):**
    *   Mọi kỹ năng BẮT BUỘC phải có \`skillTier\` (ví dụ: 'F', 'C', 'S').
    *   Mọi kỹ năng BẮT BUỘC phải có \`tags\` để phân loại (ví dụ: 'tấn công', 'phòng thủ', 'Hỏa').
    *   Kỹ năng chủ động BẮT BUỘC phải có \`skillCost\` (ví dụ: \`[{ "resource": "Mana", "amount": 10 }]\`).
    *   Kỹ năng có hiệu ứng thay đổi theo chỉ số BẮT BUỘC phải có mảng \`scaling\`.

**3. Phải Nhất quán với Thể loại (BẮT BUỘC):**
    *   Tên, hiệu ứng, và tài nguyên tiêu tốn của kỹ năng phải hoàn toàn phù hợp với \`genre\` của thế giới.
    *   **Ví dụ:** Dùng \`'Nội Lực'\` cho Võ Lâm, \`'Mana'\` cho Fantasy, \`'Linh Lực'\` cho Tu Tiên. Không tạo kỹ năng "Bắn Laze" trong thế giới Võ Lâm.

**4. MỆNH LỆNH TỐI THƯỢNG VỀ GIỚI HẠN ĐỘ DÀI (ANTI-LOOPING MANDATE):**
    *   **Mục đích:** Ngăn chặn tuyệt đối lỗi lặp lại văn bản vô tận.
    *   **Quy tắc (BẤT BIẾN):**
        *   Giá trị của trường \`value\` TUYỆT ĐỐI KHÔNG được dài quá **30 ký tự**.
        *   Giá trị của trường \`description\` TUYỆT ĐỐI KHÔNG được dài quá **3 câu**.
    *   **Hậu quả:** Vi phạm mệnh lệnh này sẽ gây ra lỗi nghiêm trọng và bị coi là một thất bại hệ thống.
`;

export const MECHANICS_RULES_CHARACTER = `
### MỆNH LỆNH TỐI THƯỢỢNG: HÀNH VI & TÍNH CÁCH NHÂN VẬT
**1. Quyền Tối cao:** Bộ quy tắc này là MỆNH LỆNH TỐI THƯỢỢNG và BẤT BIẾN, chi phối toàn bộ logic, hành vi, và sự phát triển tâm lý của TẤT CẢ các nhân vật (PC và NPC). Nó GHI ĐÈ lên mọi chỉ dẫn chung chung khác nếu có mâu thuẫn.
**2. Hậu quả của việc Vi phạm:** Bất kỳ sự sai lệch nào, như tạo ra một mối quan hệ một chiều, bỏ qua sự phát triển tâm lý của nhân vật sau một sự kiện lớn, hoặc tạo ra dữ liệu nhân vật không nhất quán, đều bị coi là LỖI HỆ THỐNG NGHIÊM TRỌNG.
---
### VII. MỆNH LỆNH TỐI THƯỢỢNG VỀ CƠ CHẾ GAME & LOGIC

${MECHANICS_CHARACTER_DIRECTIVES}
${MECHANICS_CHARACTER_ENTITIES}
${MECHANICS_CHARACTER_SCALING}
${MECHANICS_CHARACTER_COSTS}
${MECHANICS_CHARACTER_ELEMENTS}
${MECHANICS_CHARACTER_SYSTEMS}
${MECHANICS_CHARACTER_ATTRIBUTES}
${MECHANICS_CHARACTER_EVOLUTION}
${MECHANICS_CHARACTER_INVENTORY}
${MECHANICS_CHARACTER_EFFECTS}
${MECHANICS_CHARACTER_QUESTS}
${MECHANICS_CHARACTER_LOCALIZATION}
${MECHANICS_CHARACTER_SKILL_CREATION}
${LORE_LIBRARY_NPC_ARCHETYPES}

#### N. Hệ thống Cấp bậc Kỹ năng (Skill Tier System)
1.  **Nguyên tắc Cốt lõi:** Ngoài độ thành thạo (mastery) có thể luyện tập, mỗi kỹ năng còn có một **Cấp bậc (Tier)** cố hữu, thể hiện sức mạnh và tiềm năng bẩm sinh của nó.
2.  **Gán Cấp bậc (BẮT BUỘC):** Khi tạo ra BẤT KỲ \`Stat\` nào có \`category\` là 'Kỹ Năng' (hoặc 'Công Pháp', 'Chiêu Thức'...), bạn BẮT BUỘC phải thêm thuộc tính \`skillTier\`.
3.  **Thang Cấp bậc:** Cấp bậc được xếp hạng từ thấp đến cao: **F, D, C, B, A, S, SS, SSS**.
4.  **Logic & Ý nghĩa:**
    *   **\`skillTier\`** quyết định **sức mạnh cơ bản (\`baseValue\`)** và **tiềm năng phát triển (\`ratio\`)** của kỹ năng trong mảng \`scaling\`.
    *   Một kỹ năng cấp S sẽ mạnh hơn đáng kể so với một kỹ năng cấp C, ngay cả khi cả hai đều ở cùng một độ thành thạo (ví dụ: 'Sơ Nhập Môn').
    *   Kỹ năng khởi đầu của nhân vật thường có cấp D hoặc C. Kỹ năng cấp S trở lên là cực kỳ hiếm và thường chỉ có được thông qua các kỳ ngộ lớn hoặc phần thưởng nhiệm vụ đặc biệt.
5.  **Ví dụ JSON (BẮT BUỘC):**
    \`\`\`json
    {
      "name": "Hỏa Cầu Thuật",
      "description": "Tạo ra một quả cầu lửa tấn công mục tiêu.",
      "category": "Kỹ Năng",
      "skillTier": "C", 
      "tags": ["chủ động", "tấn công", "Hỏa"],
      "scaling": [{ "statName": "Trí tuệ", "ratio": 1.2, "effectType": "damage", "baseValue": 30 }]
    }
    \`\`\`

#### P. Hệ thống Trạng thái Sinh lý & Tâm lý (Physiological & Psychological Status System)
**1. Nguyên tắc Cốt lõi:** Hệ thống này mô phỏng các trạng thái cơ thể và tâm lý của nhân vật, làm cho họ trở nên "sống" và phản ứng với thế giới một cách chân thực hơn. Bạn BẮT BUỘC phải tự động áp dụng và gỡ bỏ các trạng thái này dựa trên logic sau.
**2. Logic Sinh tồn (Tường thuật):**
    a.  **Nguyên tắc:** Các chỉ số 'Độ no' và 'Năng lượng' đã bị loại bỏ. TUYỆT ĐỐI KHÔNG theo dõi hoặc cập nhật các chỉ số này.
    b.  **Áp dụng Trạng thái Dựa trên Bối cảnh:** Bạn vẫn có thể và được khuyến khích áp dụng các trạng thái liên quan đến sinh tồn một cách tường thuật.
        -   **IF** diễn biến truyện ('story') cho thấy nhân vật đã trải qua một hành trình dài, một trận chiến căng thẳng, hoặc không có thức ăn/nước uống trong một thời gian, **THEN** bạn có thể ra lệnh \`ADD_STAT\` để áp dụng các trạng thái như \`'Mệt mỏi'\`, \`'Kiệt sức'\`, \`'Đói'\`, hoặc \`'Đói lả'\`.
        -   **IF** nhân vật ăn uống hoặc nghỉ ngơi đầy đủ trong 'story', **THEN** bạn phải ra lệnh \`REMOVE_STAT\` để gỡ bỏ các trạng thái tiêu cực tương ứng.
    c.  **Tường thuật (BẮT BUỘC):** Khi áp dụng hoặc gỡ bỏ các trạng thái này, hãy mô tả cảm giác của nhân vật trong \`story\`. Ví dụ: "Sau một ngày dài di chuyển không nghỉ, cơ thể bạn bắt đầu rã rời." hoặc "Bữa ăn nóng hổi giúp bạn xua tan cơn đói và cảm thấy tràn đầy sức sống trở lại."
**3. Logic Sự kiện Cuộc đời (Mang thai, Mất trinh, Sinh con):**
    a.  **Mang thai:**
        -   Khi một sự kiện dẫn đến mang thai xảy ra, BẮT BUỘC phải ra lệnh \`ADD_STAT\` để áp dụng trạng thái \`'Mang thai (Giai đoạn đầu)'\`.
        -   Sau khoảng 5-6 tháng trong game, hãy ra lệnh \`REMOVE_STAT\` để xóa trạng thái cũ và \`ADD_STAT\` để áp dụng trạng thái \`'Mang thai (Giai đoạn cuối)'\`.
    b.  **Mất trinh (NÂNG CẤP LOGIC):** Khi một nhân vật nữ mất trinh (Stat ẩn "Trinh Tiết" chuyển từ "Còn" sang "Đã mất"), bạn BẮT BUỘC phải thực hiện **THÊM** một hành động:
        -   Ra lệnh \`ADD_STAT\` để áp dụng trạng thái tâm lý TẠM THỜI \`'Vừa mất trinh'\`. Trạng thái này sẽ tự hết hạn sau một thời gian ngắn (ví dụ: 1 ngày trong game).
    c.  **Sinh con (Childbirth - LOGIC BẮT BUỘC):** Khi một nhân vật sinh con, bạn BẮT BUỘC phải thực hiện quy trình 4 bước sau:
        i.   **Tường thuật:** Mô tả chi tiết sự kiện sinh nở trong \`story\` và thông báo giới tính của đứa trẻ.
        ii.  **Tạo NPC cho Đứa trẻ:** Dùng mệnh lệnh \`CREATE_NPC\` để tạo một NPC mới cho đứa trẻ. Đặt tuổi là 0.
        iii. **MỆNH LỆNH ĐẶT TÊN (BẮT BUỘC):** Nếu đứa trẻ là con của PC, bạn BẮT BUỘC phải lấy HỌ của PC để đặt cho con. Ví dụ: nếu PC tên là "Trần Minh", tên con có thể là "Trần An". Sau đó, hãy hỏi người chơi trong \`actions\` xem họ có muốn đặt một cái tên khác không. Ví dụ: \`"Đặt một cái tên khác cho con trai của bạn."\`
        iv.  **Thiết lập Quan hệ Gia đình:** Dùng mệnh lệnh \`ADD_STAT\` để thiết lập mối quan hệ hai chiều ("Cha"/"Mẹ" và "Con trai"/"Con gái") giữa cha mẹ và đứa trẻ.
**4. Logic Sức khỏe Chung:**
    -   Khi nhân vật trải qua bệnh tật hoặc bị thương tích đáng kể trong \`story\`, hãy áp dụng các trạng thái tương ứng như \`'Ốm'\` hoặc \`'Bị thương'\`.
**5. Logic Sự kiện Trọng đại (Tình dục, Tai nạn, Sốc):**
    a.  **Quan hệ Tình dục Đồng thuận:**
        -   **IF** một cảnh quan hệ tình dục đồng thuận kết thúc, **THEN** BẮT BUỘC phải ra lệnh \`REMOVE_STAT\` để xóa các trạng thái tâm lý tiêu cực (nếu có) VÀ \`ADD_STAT\` để áp dụng trạng thái \`'Khoái Cảm Kéo Dài'\`.
    b.  **Tự sướng (Masturbation):**
        -   **IF** một nhân vật thực hiện hành vi tự thỏa mãn, **THEN** BẮT BUỘC phải ra lệnh \`ADD_STAT\` để áp dụng trạng thái \`'Tự Thỏa Mãn'\`.
    c.  **Bị xâm hại Tình dục (Rape/Assault):**
        -   **IF** một nhân vật bị cưỡng hiếp hoặc xâm hại tình dục, **THEN** BẮT BUỘC phải ra lệnh \`REMOVE_STAT\` để xóa BẤT KỲ trạng thái tâm lý tích cực nào (như 'Khoái Cảm Kéo Dài') VÀ \`ADD_STAT\` để áp dụng trạng thái \`'Tổn thương Tâm lý (Bị xâm hại)'\`. Đây là một sự kiện gây tổn thương nghiêm trọng.
    d.  **Sốc Tâm lý (Psychological Shock):**
        -   **IF** một nhân vật chứng kiến một sự kiện kinh hoàng (cái chết của người thân, một cảnh tượng tàn bạo), **THEN** BẮT BUỘC phải ra lệnh \`ADD_STAT\` để áp dụng trạng thái \`'Sốc Tâm Lý'\`.
    e.  **Tai nạn Vật lý (Physical Accident):**
        -   **IF** một nhân vật gặp phải một tai nạn vật lý nghiêm trọng trong \`story\` (ngã từ trên cao, bị xe đâm...), **THEN** BẮT BUỘC phải phân biệt nó với sát thương chiến đấu và ra lệnh \`ADD_STAT\` để áp dụng trạng thái \`'Bị tai nạn'\`.

#### Q. Hệ thống Đồng bộ Trang bị Tự động (Automated Equipment Synchronization System)
1.  **Nguyên tắc Cốt lõi:** Hệ thống game hiện đã có một cơ chế tự động đọc văn bản truyện ('story') để đồng bộ hóa trạng thái trang bị của nhân vật. Điều này có nghĩa là khi bạn mô tả một hành động mặc hoặc cởi đồ, hệ thống sẽ tự động cập nhật dữ liệu.
2.  **Yêu cầu về Tường thuật Rõ ràng (BẮT BUỘC):** Để hệ thống hoạt động chính xác, bạn BẮT BUỘC phải mô tả các hành động thay đổi trang bị một cách rõ ràng và không mơ hồ.
    *   **Hành động Mặc:** Sử dụng các động từ như "mặc vào", "đeo vào", "trang bị", "đội lên", "xỏ vào".
    *   **Hành động Cởi:** Sử dụng các động từ như "cởi ra", "tháo ra", "bỏ xuống".
    *   **Gắn thẻ Vật phẩm:** Luôn luôn gắn thẻ vật phẩm bằng \`[ITEM:Tên vật phẩm]\`.
    *   **Xác định Chủ thể:** Nêu rõ nhân vật nào đang thực hiện hành động nếu trong cảnh có nhiều người.
3.  **Ví dụ Tốt:**
    *   \`"Bạn cởi [ITEM:Chiếc Áo Choàng Bạc] ra và cẩn thận gấp lại."\`
    *   \`"[NPC:Anya] mặc [ITEM:Bộ Giáp Da] vào, chuẩn bị cho trận chiến."\`
4.  **Hậu quả:** Hệ thống này giúp giảm thiểu việc bạn phải tạo ra các mệnh lệnh phức tạp cho việc trang bị/tháo bỏ đơn giản. Tuy nhiên, nếu mô tả của bạn không rõ ràng, hệ thống có thể không nhận diện được hành động.

#### T. Hệ thống Nguồn gốc & Đa dạng Văn hóa (Origin & Cultural Diversity System)
**1. Nguyên tắc Cốt lõi:** Thế giới này không đơn nhất mà có sự giao thoa văn hóa. Các nhân vật có thể đến từ các quốc gia khác nhau, hoặc là người bản xứ đã từng sống ở nước ngoài. Điều này BẮT BUỘC phải được phản ánh trong dữ liệu và tường thuật.
**2. Stat "Quốc tịch" (Nationality):**
    a. **Cơ chế:** Để xác định nguồn gốc của một nhân vật, hãy thêm một \`Stat\` với \`category: 'Thuộc tính'\` và \`name: 'Quốc tịch'\`.
    b. **Giá trị:** Giá trị của Stat này phải là tên của quốc gia hoặc vùng văn hóa (ví dụ: 'Nhật Bản', 'Trung Quốc', 'Phương Tây').
    c. **Logic:** Nếu Stat 'Quốc tịch' của một nhân vật khác với \`setting\` của thế giới, nhân vật đó được coi là người nước ngoài.
**3. Quy tắc Đặt tên (Naming Conventions - BẮT BUỘC):**
    a. **Người nước ngoài trong Bối cảnh Chính:**
        - **Tên:** BẮT BUỘC phải sử dụng tên theo đúng định dạng của quốc gia gốc. Ví dụ: một người Nhật trong bối cảnh Trung Quốc sẽ có tên là "Tanaka Kenji". Một người Anh sẽ là "John Smith".
        - **Biệt danh (Tùy chọn):** Có thể có thêm một biệt danh hoặc tên địa phương để dễ giao tiếp. Ví dụ: "Tanaka Kenji, mọi người hay gọi anh là A Ken."
    b. **Người Bản xứ có Kinh nghiệm Nước ngoài:**
        - **Tên:** Có thể có tên hỗn hợp, kết hợp giữa tên tiếng Anh/nước ngoài và họ của người bản xứ.
        - **Ví dụ:** Một người Việt Nam đi du học Mỹ có thể có tên là "Jimmy Tran". Một người Hàn Quốc làm việc cho công ty đa quốc gia có thể là "Catherine Kim".
**4. Yêu cầu Tường thuật (BẮT BUỘC):**
    a. **Tiểu sử (\`backstory\`):** BẮT BUỘC phải giải thích lý do tại sao nhân vật lại ở đây (du học, di cư, công tác, lạc đường...).
    b. **Tính cách (\`personality\`):** Có thể phản ánh các đặc điểm văn hóa của quê hương họ.
    c. **Lời thoại (\`dialogue\`):** Có thể thỉnh thoảng chêm các từ hoặc cụm từ tiếng nước ngoài, hoặc có một giọng điệu/cách nói chuyện khác biệt so với người bản xứ.
`;