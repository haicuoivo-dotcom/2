/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

export const MECHANICS_RULES_PROGRESSION = `
### MỆNH LỆNH TỐI THƯỢNG: HỆ THỐNG TIẾN TRIỂN & PHÁT TRIỂN
**1. Quyền Tối cao:** Bộ quy tắc này là MỆNH LỆNH TỐI THƯỢNG, chi phối TOÀN BỘ logic về việc thăng cấp, đột phá, và nhận phần thưởng của nhân vật.
**2. Hậu quả của việc Vi phạm:** Việc thăng cấp không đúng logic, bỏ qua các trạng thái "Bình Cảnh", hoặc không ban thưởng đúng sẽ phá vỡ sự cân bằng của game và bị coi là LỖI HỆ THỐNG NGHIÊM TRỌNG.
---
#### D. Hệ thống Tiến triển & Thăng cấp (QUAN TRỌNG)
Việc thăng cấp/đột phá phải mang lại cảm giác thành tựu và tuân theo một đường cong logic, tránh việc thăng cấp quá nhanh hoặc quá chậm.

1.  **Thế giới Fantasy / Giả Tưởng (Dị Giới, Game):**
    *   **Đơn vị:** Sử dụng "Kinh Nghiệm" (EXP).
    *   **Công thức:** Lượng EXP cần để lên cấp tiếp theo được tính bằng công thức: \`EXP cần thiết = (Cấp độ hiện tại ^ 1.5) * 100\`. Ví dụ: Từ cấp 1->2 cần 100 EXP. Từ cấp 10->11 cần (10^1.5)*100 ≈ 3162 EXP.
    *   **Nguồn EXP:** Người chơi nhận EXP từ việc đánh bại quái vật và khám phá các địa điểm mới. Quái vật mạnh hơn sẽ cho nhiều EXP hơn.
    *   **Phần thưởng Lên cấp:** Khi lên cấp, BẮT BUỘC phải thông báo cho người chơi và ban cho họ Điểm Thuộc tính (để cộng vào Sức mạnh, Nhanh nhẹn...) hoặc Điểm Kỹ Năng (để học kỹ năng mới).

2.  **Thế giới Tu Tiên / Huyền Huyễn:**
    *   **Đơn vị:** Sử dụng "Linh Khí".
    *   **Hệ thống Kép:**
        *   **Tăng Tầng (trong cùng Cảnh giới):** Để tăng từ Tầng 1 lên Tầng 9, nhân vật cần tích lũy đủ Linh Khí. Lượng Linh Khí yêu cầu sẽ tăng dần theo mỗi tầng.
        *   **Đột phá Đại Cảnh giới:** Để đột phá từ một đại cảnh giới này sang đại cảnh giới khác (ví dụ: Luyện Khí -> Trúc Cơ), việc tích lũy đủ Linh Khí là CHƯA ĐỦ. Nhân vật BẮT BUỘC phải thực hiện một hành động đặc biệt và có rủi ro, ví dụ như "bế quan" trong thời gian dài, sử dụng "đan dược" đột phá, vượt qua "tâm ma" hoặc đối mặt với "lôi kiếp". Đây phải là một sự kiện quan trọng trong câu chuyện.

3.  **Thế giới Võ Lâm / Thời Chiến:**
    *   **Đơn vị:** Sử dụng "Nội Lực" và "Kinh nghiệm thực chiến".
    *   **Hệ thống Dựa trên Sự kiện:** Việc thăng cấp không dựa trên việc tích lũy điểm số một cách máy móc. Thay vào đó, sự đột phá về trình độ võ học xảy ra sau những sự kiện quan trọng, chẳng hạn như:
        *   Đánh bại một cao thủ có danh tiếng.
        *   Lĩnh ngộ một bộ bí kíp mới.
        *   Có một khoảnh khắc "đốn ngộ" trong trận chiến sinh tử.
    *   **Tường thuật:** Thay vì chỉ thông báo "lên cấp", hãy mô tả sự thay đổi một cách chi tiết, ví dụ: "Sau trận chiến, bạn cảm thấy nội lực trong cơ thể trở nên tinh thuần hơn, những chiêu thức trước đây chưa hiểu rõ giờ đã thông suốt."

#### E. Hệ thống Điểm Danh Vọng (Honor Points System)
1.  **Mục đích:** Điểm Danh Vọng là một loại tiền tệ đặc biệt, được trao cho người chơi khi họ hoàn thành các nhiệm vụ quan trọng, chiến thắng các con trùm lớn, hoặc thực hiện các hành động anh hùng, có đạo đức cao.
2.  **Cơ chế Thưởng điểm (BẮT BUỘC):** Khi một sự kiện xứng đáng xảy ra (ví dụ: đánh bại một NPC có 'npcType: 'boss''), bạn BẮT BUỘC phải thưởng cho người chơi một lượng 'Điểm Danh Vọng' tương xứng.
    *   **Thực thi:** Sử dụng mệnh lệnh 'UPDATE_STAT' (hoặc 'ADD_STAT' nếu chưa có) để tăng giá trị cho Stat có 'name: 'Điểm Danh Vọng'' và 'category: 'Thuộc tính''.
    *   **Thông báo:** Đồng thời, BẮT BUỘC phải thêm một 'message' vào JSON trả về để thông báo cho người chơi, ví dụ: '"Bạn nhận được 50 Điểm Danh Vọng vì đã tiêu diệt Trùm cuối Hầm ngục."'.
3.  **Cơ chế Sử dụng:** Bạn phải tạo ra các NPC đặc biệt (ví dụ: Trưởng lão Guild, Thợ rèn Hoàng gia, Ẩn sĩ) hoặc các phe phái (ví dụ: Hội Hiệp sĩ) cung cấp các vật phẩm hoặc kỹ năng độc quyền chỉ có thể đổi bằng Điểm Danh Vọng. Khi tương tác với các NPC này, hãy gợi ý các hành động như "Hỏi về các vật phẩm đặc biệt (dùng Điểm Danh Vọng)".

#### F. Hệ thống Bình Cảnh & Đột Phá (QUAN TRỌNG NHẤT)
Hệ thống này chỉ áp dụng cho thể loại Tu Tiên, Huyền Huyễn, và Võ Lâm.
1.  **Phát hiện Bình Cảnh:** Khi một nhân vật tu luyện đến đỉnh của một Đại Cảnh Giới (ví dụ: Luyện Khí Kỳ - Tầng 9 viên mãn), bạn BẮT BUỘC phải ngay lập tức ra một mệnh lệnh 'ADD_STAT' để áp dụng trạng thái "Bình Cảnh".
    *   **Cấu trúc Trạng thái (BẮT BUỘC):**
        \`\`\`json
        {
          "command": "ADD_STAT",
          "args": {
            "characterName": "[Tên Nhân vật]",
            "stat": {
              "name": "Trạng thái Bình Cảnh",
              "description": "Linh khí/Nội lực trong cơ thể đã đạt đến giới hạn của cảnh giới hiện tại, trở nên hỗn loạn và không thể hấp thụ thêm. Cần một cơ duyên để đột phá.",
              "category": "Trạng thái",
              "tags": ["bình cảnh", "negative"],
              "effects": [
                { "targetStat": "Tốc độ Tu luyện", "modifier": "-100%" },
                { "targetStat": "Tấn Công", "modifier": "-5%" },
                { "targetStat": "Phòng Thủ", "modifier": "-5%" }
              ],
              "removalConditions": ["Đột phá cảnh giới thành công."]
            }
          }
        }
        \`\`\`
2.  **QUY TRÌNH ĐỘT PHÁ 2 BƯỚC (TWO-STEP BREAKTHROUGH PROCESS - BẮT BUỘC TUÂN THỦ):**
    Việc đột phá không còn diễn ra trong một lượt. Nó là một sự kiện kịch tính gồm 2 lượt chơi.

    **Lượt 1: Nỗ lực Đột phá (The Attempt)**
    a.  **Hành động của Người chơi:** Người chơi chọn một hành động như "Bế quan đột phá Trúc Cơ Kỳ".
    b.  **Phản hồi của AI (BẮT BUỘC):**
        *   **'story':** CHỈ mô tả giai đoạn BẮT ĐẦU của quá trình. Ví dụ: *“Bạn tìm một sơn động yên tĩnh, bắt đầu vận công theo tâm pháp, linh khí xung quanh cuồn cuộn đổ về phía bạn. Bạn cảm nhận được một bức tường vô hình vững chắc - chính là bình cảnh của Luyện Khí Kỳ. Quá trình này sẽ vô cùng khó khăn và nguy hiểm.”* TUYỆT ĐỐI KHÔNG mô tả kết quả thành công hay thất bại.
        *   **'directives':**
            *   **CẤM:** Không được thay đổi cảnh giới hoặc xóa "Bình Cảnh".
// FIX: Replaced backticks with single quotes to prevent breaking the template literal.
            *   **NÊN:** Có thể thêm một trạng thái mới: '[Trạng thái: Đang Đột Phá]'.
        *   **'actions' (Gợi ý):** Các hành động gợi ý MỚI BẮT BUỘC phải liên quan đến việc tiếp tục quá trình. Ví dụ:
            *   "Tiếp tục vận công, cố gắng phá vỡ bình cảnh."
            *   "Sử dụng [Vật phẩm: Trúc Cơ Đan] để hỗ trợ." (nếu có)
            *   "Từ bỏ đột phá lần này."

    **Lượt 2: Kết quả (The Outcome)**
    a.  **Hành động của Người chơi:** Người chơi chọn một trong các hành động tiếp tục từ Lượt 1.
    b.  **Phản hồi của AI (BẮT BUỘC):**
        *   **'story':** BÂY GIỜ mới mô tả KẾT QUẢ của việc đột phá (thành công hoặc thất bại).
            -   **Thành công:** *"Một tiếng ‘rắc’ vang lên trong đầu bạn, bức tường bình cảnh đã bị phá vỡ! Linh khí ào ạt đổ vào đan điền, tu vi của bạn tăng vọt, chính thức bước vào Trúc Cơ Kỳ!”*
            -   **Thất bại:** *"Linh khí đột nhiên trở nên hỗn loạn, một ngụm máu tươi phun ra. Bạn đã đột phá thất bại, nội thương nghiêm trọng.”*
        *   **'directives':**
// FIX: Replaced backticks with single quotes to prevent breaking the template literal.
            *   **CHỈ KHI THÀNH CÔNG,** bạn mới được phép ra các mệnh lệnh: 'REMOVE_STAT' (xóa "Bình Cảnh"), 'UPDATE_STAT' (tăng "Cảnh giới"), và 'ADD_STAT' (ban các phần thưởng đột phá theo mục 3 dưới đây).
// FIX: Replaced backticks with single quotes to prevent breaking the template literal.
            *   Nếu thất bại, ra mệnh lệnh 'ADD_STAT' cho trạng thái '[Bị thương nặng]' hoặc tương tự.
        *   **'actions':** Gợi ý các hành động mới phản ánh tình trạng sau đột phá của người chơi.

3.  **Phần thưởng Đột Phá (BẮT BUỘC & TĂNG TIẾN):**
    a.  **Tham chiếu Bảng Phần thưởng:** Sau khi đột phá thành công, bạn BẮT BUỘC phải tham chiếu đến hằng số 'REALM_BREAKTHROUGH_BENEFITS' trong mã nguồn.
    b.  **Áp dụng TOÀN BỘ Phần thưởng (Quy trình 3 bước):** Dựa trên cảnh giới MỚI mà nhân vật vừa đạt được (ví dụ: 'Trúc Cơ Kỳ'), bạn BẮT BUỘC phải ra một chuỗi các mệnh lệnh để ban phát **TOÀN BỘ** các lợi ích được liệt kê:
        i.  **Xóa Trạng thái Cũ:** Dùng mệnh lệnh 'REMOVE_STAT' để xóa BẤT KỲ trạng thái nào đã có từ lần đột phá trước (những trạng thái có tag 'đột phá'). Ví dụ: 'REMOVE_STAT('Đột Phá Luyện Khí')'. Điều này đảm bảo các lợi ích không bị cộng dồn vô lý.
        ii. **Thêm Trạng thái Mới:** Dùng mệnh lệnh 'ADD_STAT' để ban cho nhân vật trạng thái đột phá MỚI, được định nghĩa trong thuộc tính 'breakthroughStatus' của cảnh giới tương ứng. Trạng thái này chứa toàn bộ các hiệu ứng tăng chỉ số và tài nguyên.
        iii. **Ban Thưởng Lợi ích Khác:**
            -   **Tăng Thọ Nguyên:** Thêm hoặc cập nhật 'Stat' có 'name: 'Thọ Nguyên'' theo 'lifespanIncrease'.
            -   **Ban Kỹ năng mới:** Sử dụng 'ADD_STAT' để ban cho nhân vật kỹ năng mới được định nghĩa trong 'newSkill'.
`;