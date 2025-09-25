/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { generateUniqueId } from '../utils/id';
import { WORLD_ERA } from './tagConstants';
import type { WorldLogicRule } from '../types';

const initialTimestamp = new Date(0).toISOString();

export const DEFAULT_WORLD_LOGIC_RULES: WorldLogicRule[] = [
    { id: generateUniqueId('wlr-default-tu-tien-system'), text: 'Hệ Thống Cảnh Giới Tu Tiên: Sức mạnh được phân chia rõ ràng theo các Đại Cảnh Giới. Mỗi Đại Cảnh Giới bao gồm các tầng từ 1 đến 9, sau đó là một \'Bình Cảnh\' (bottleneck) trước khi có thể đột phá lên cảnh giới tiếp theo. Việc tu luyện sẽ tích lũy Linh Khí; khi Linh Khí đầy, tu vi sẽ được nâng lên một tầng (ví dụ: Luyện Khí Kỳ - Tầng 1 -> Luyện Khí Kỳ - Tầng 2). Đột phá Bình Cảnh để lên Đại Cảnh Giới tiếp theo là một quá trình cực kỳ khó khăn, thường phải đối mặt với Tâm Ma Kiếp hoặc Lôi Kiếp. Thứ tự cảnh giới từ thấp đến cao là: Luyện Khí Kỳ -> Trúc Cơ Kỳ -> Kim Đan Kỳ -> Nguyên Anh Kỳ -> Hóa Thần Kỳ -> Luyện Hư Kỳ -> Hợp Thể Kỳ -> Độ Kiếp Kỳ -> Đại Thừa Kỳ -> Đăng Tiên (và các cảnh giới cao hơn do AI phát triển).', isActive: true, author: 'player', timestamp: initialTimestamp, tags: [WORLD_ERA.MEDIEVAL] },
    { id: generateUniqueId('wlr-default-fantasy-system'), text: 'Hệ Thống Sức Mạnh Dị Giới Fantasy & Giả Tưởng: Thế giới này có hai hệ thống tiến triển song song. 1. Cấp Bậc Mạo Hiểm Giả (do Hiệp hội mạo hiểm giả Guild quản lý): Thể hiện danh tiếng và quyền lợi. Xếp hạng từ thấp đến cao: F (Sắt) - Tân binh, E (Đồng), D (Bạc), C (Vàng) - Mạo hiểm giả có kinh nghiệm, B (Bạch kim) - Tinh anh, A (Mithril) - Tinh anh cấp cao, S (Orichalcum) - Cấp bậc anh hùng, SS (Adamantite) - Cấp bậc huyền thoại, và cao hơn (SSS...). 2. Cấp Độ (Level): Áp dụng cho tất cả sinh vật sống (bao gồm NPC và quái vật), từ 1 đến vô hạn. Tăng cấp thông qua việc tích lũy điểm Kinh Nghiệm (EXP) từ chiến đấu và hoàn thành nhiệm vụ. Tăng cấp sẽ cho điểm để người chơi tùy ý cộng vào Bộ chỉ số.', isActive: true, author: 'player', timestamp: initialTimestamp, tags: [WORLD_ERA.MEDIEVAL] },
    { id: generateUniqueId('wlr-default-vo-lam-system'), text: 'Hệ Thống Cảnh Giới Võ Lâm: Sức mạnh được phân chia theo trình độ võ học. Việc rèn luyện và chiến đấu sẽ tích lũy Nội Lực; khi Nội Lực đạt đến đỉnh điểm, trình độ võ học sẽ được nâng lên một bậc. Thứ tự cấp bậc từ thấp đến cao: Tam lưu -> Nhị lưu -> Nhất lưu -> Cao thủ Hậu Thiên -> Cao thủ Tiên Thiên -> Tông Sư -> Đại Tông Sư. Cảnh giới càng cao, nội lực càng thâm hậu, có thể thi triển những võ công siêu phàm.', isActive: true, author: 'player', timestamp: initialTimestamp, tags: [WORLD_ERA.MEDIEVAL] },
    { id: generateUniqueId('wlr-new-kim-dan'), text: 'Hệ Thống Phẩm Cấp Kim Đan: Khi đột phá đến cảnh giới Kim Đan, Kim Đan được hình thành sẽ được phân chia thành các phẩm cấp khác nhau, từ thấp đến cao: Phàm phẩm, Linh phẩm, Tiên phẩm, và Thánh phẩm. Phẩm cấp càng cao, nền tảng tu luyện càng vững chắc, sức mạnh vượt cấp càng lớn, và tiềm năng đột phá các cảnh giới sau này càng cao. Phẩm cấp của Kim Đan chịu ảnh hưởng bởi độ tinh khiết của Linh Khí, công pháp tu luyện, và các loại thiên tài địa bảo đã sử dụng trước khi đột phá.', isActive: true, author: 'player', timestamp: initialTimestamp, tags: [WORLD_ERA.MEDIEVAL] },
    { id: generateUniqueId('wlr-new-ngu-hanh'), text: "Hệ Thống Tương Tác Ngũ Hành: Mọi công pháp, yêu thú, và thiên tài địa bảo trong thế giới này đều mang một trong năm thuộc tính cốt lõi: Kim, Mộc, Thủy, Hỏa, Thổ. Các thuộc tính này tuân thủ nghiêm ngặt quy luật Tương Sinh (Mộc sinh Hỏa, Hỏa sinh Thổ,...) và Tương Khắc (Kim khắc Mộc, Mộc khắc Thổ,...). AI BẮT BUỘC phải áp dụng logic này trong chiến đấu (công pháp khắc chế gây thêm sát thương), luyện đan (nguyên liệu tương sinh tăng tỷ lệ thành công), và các sự kiện thế giới (ví dụ: bí cảnh Hỏa thuộc tính sẽ nguy hiểm hơn cho người tu luyện Thủy thuộc tính).", isActive: true, author: 'player', timestamp: initialTimestamp, tags: [WORLD_ERA.MEDIEVAL] },
    { id: generateUniqueId('wlr-extended-elements-intro'), text: "Hệ thống Nguyên tố Mở rộng: Ngoài Ngũ Hành, còn tồn tại các nguyên tố đặc biệt và biến dị như Lôi, Phong, Băng, Quang, Ám, và Độc. Các nguyên tố này có tương tác riêng biệt với nhau và với hệ Ngũ Hành, tạo ra sự đa dạng trong chiến thuật.", isActive: true, author: 'player', timestamp: initialTimestamp, tags: [WORLD_ERA.MEDIEVAL] },
    { id: generateUniqueId('wlr-extended-elements-interactions'), text: "Quy luật Tương tác Nguyên tố Mở rộng: Quang và Ám là hai nguyên tố đối nghịch, khắc chế lẫn nhau một cách tuyệt đối. Hỏa và Băng cũng là một cặp khắc chế tự nhiên. Lôi khắc Kim (dẫn điện quá tải) và Mộc (sét đánh gãy). Phong khắc Thổ (gió bào mòn đất) nhưng lại Tương Sinh với Hỏa (gió助lửa). Độc khắc Kim (ăn mòn) và Thủy (làm ô nhiễm).", isActive: true, author: 'player', timestamp: initialTimestamp, tags: [WORLD_ERA.MEDIEVAL] },
    { id: generateUniqueId('wlr-new-bi-canh'), text: "Hệ Thống Bí Cảnh & Thiên Tài Địa Bảo: Các không gian phụ, được gọi là 'Bí Cảnh', sẽ định kỳ mở ra ở những địa điểm ngẫu nhiên trên thế giới. Mỗi bí cảnh có một thuộc tính và môi trường riêng (ví dụ: Bí cảnh Hỏa ngục, Vườn dược cổ), chứa đựng các loại Thiên Tài Địa Bảo tương ứng và được canh giữ bởi Yêu thú hoặc các cấm chế cổ xưa. Sự xuất hiện của một bí cảnh là một sự kiện lớn, thu hút các tu sĩ từ khắp nơi đến tranh đoạt cơ duyên.", isActive: true, author: 'player', timestamp: initialTimestamp, tags: [WORLD_ERA.MEDIEVAL] },
    { id: generateUniqueId('wlr-new-linh-can'), text: "Hệ Thống Linh Căn & Tư Chất Tu Luyện: Tư chất tu luyện của một người được quyết định bởi 'Linh Căn'. Linh Căn được phân thành nhiều loại (ví dụ: Ngũ Hành Tạp Linh Căn, Thiên Linh Căn, Dị Linh Căn) và phẩm cấp. Loại và phẩm cấp Linh Căn ảnh hưởng trực tiếp đến tốc độ hấp thụ Linh Khí và khả năng tu luyện các công pháp thuộc tính tương ứng. Người có Linh Căn cao cấp tu luyện nhanh hơn và dễ dàng đột phá hơn.", isActive: true, author: 'player', timestamp: initialTimestamp, tags: [WORLD_ERA.MEDIEVAL] },
    { id: generateUniqueId('wlr-underworld'), text: 'Hệ Thống Thế Giới Ngầm: Tồn tại một xã hội song song, ẩn giấu khỏi con mắt của pháp luật và chính quyền. Thế giới ngầm có luật lệ, hệ thống kinh tế (chợ đen), và các thế lực riêng. Đây là nơi diễn ra các hoạt động phi pháp, giao dịch thông tin, và các cuộc thanh trừng đẫm máu. Người chơi có thể tương tác, tham gia, hoặc chống lại các thế lực này.', isActive: true, author: 'player', timestamp: initialTimestamp, tags: [WORLD_ERA.MEDIEVAL, WORLD_ERA.MODERN] },
    { id: generateUniqueId('wlr-gangs'), text: "Hệ Thống Băng Đảng & Tổ chức Tội phạm: Các băng đảng tồn tại để kiểm soát các lãnh địa và hoạt động phi pháp (bảo kê, buôn lậu, cho vay nặng lãi). AI phải sử dụng tên gọi phù hợp với bối cảnh: 'Yakuza' (Nhật Bản), 'Mafia' (Phương Tây), 'Hội Tam Hoàng' hoặc 'Giang hồ' (Trung Quốc). Các tổ chức này có hệ thống cấp bậc, quy tắc danh dự riêng, và thường xuyên xảy ra xung đột tranh giành địa bàn.", isActive: true, author: 'player', timestamp: initialTimestamp, tags: [WORLD_ERA.MEDIEVAL, WORLD_ERA.MODERN] },
    { id: generateUniqueId('wlr-bandits'), text: 'Hệ Thống Sơn Tặc: Tại các vùng núi non hiểm trở, tồn tại các nhóm sơn tặc (lục lâm thảo khấu) chuyên cướp bóc các thương đoàn và lữ khách qua đường. Chúng thường có một sơn trại làm căn cứ và một thủ lĩnh cầm đầu. Đây là mối đe dọa thường trực trên các tuyến đường giao thương hẻo lánh.', isActive: true, author: 'player', timestamp: initialTimestamp, tags: [WORLD_ERA.MEDIEVAL] },
    { id: generateUniqueId('wlr-black-market'), text: 'Hệ Thống Chợ Đen: Là một mạng lưới giao dịch phi pháp, nơi người chơi có thể mua bán những vật phẩm không thể tìm thấy ở các cửa hàng hợp pháp (vật phẩm bị đánh cắp, vũ khí cấm, thông tin mật, nô lệ, công pháp tà đạo). Giao dịch ở chợ đen tiềm ẩn rủi ro bị lừa đảo hoặc bị chính quyền truy bắt.', isActive: true, author: 'player', timestamp: initialTimestamp, tags: [WORLD_ERA.MEDIEVAL, WORLD_ERA.MODERN] },
    { id: generateUniqueId('wlr-modern-prof-legal'), text: "Hệ Thống Nghề nghiệp Hiện đại (Hợp pháp): Xã hội bao gồm đa dạng các ngành nghề hợp pháp. AI phải sử dụng và tham chiếu đến các nghề nghiệp này một cách logic. Ví dụ: Nhân viên văn phòng, Bác sĩ, Luật sư, Lập trình viên, Giáo viên, Cảnh sát, Lính cứu hỏa, Đầu bếp, Barista, Nhạc sĩ, Họa sĩ, Tài xế...", isActive: true, author: 'player', timestamp: initialTimestamp, tags: [WORLD_ERA.MODERN] },
    { id: generateUniqueId('wlr-modern-prof-illegal'), text: "Hệ Thống Nghề nghiệp Hiện đại (Bất hợp pháp): Tồn tại các hoạt động và 'nghề nghiệp' bất hợp pháp trong thế giới ngầm. Ví dụ: Hacker (Tin tặc), Buôn lậu, Giao dịch hàng cấm, Sát thủ hợp đồng, Trộm cắp chuyên nghiệp, Lừa đảo.", isActive: true, author: 'player', timestamp: initialTimestamp, tags: [WORLD_ERA.MODERN] },
    { id: generateUniqueId('wlr-modern-health'), text: "Hệ Thống Bệnh tật & Sức khỏe: Các nhân vật có thể mắc các bệnh thông thường (cảm cúm, sốt), bệnh mãn tính (ung thư, tim mạch), hoặc bị thương do tai nạn. Việc chữa trị dựa vào y học hiện đại (bệnh viện, bác sĩ, thuốc men). Bệnh tật có thể ảnh hưởng đến chỉ số và hành động của nhân vật.", isActive: true, author: 'player', timestamp: initialTimestamp, tags: [WORLD_ERA.MODERN] },
    { id: generateUniqueId('wlr-modern-culture-tech'), text: "Hệ Thống Văn hóa & Công nghệ Hiện đại: Thế giới phản ánh Trái Đất hiện đại. Công nghệ bao gồm internet, điện thoại thông minh, mạng xã hội, ô tô, máy bay. Văn hóa đa dạng, tương ứng với các quốc gia và vùng lãnh thổ có thật. Các sự kiện và địa lý có thể tham chiếu đến các yếu tố có thật.", isActive: true, author: 'player', timestamp: initialTimestamp, tags: [WORLD_ERA.MODERN] },
    { id: generateUniqueId('wlr-modern-birthday'), text: "Khái niệm Sinh nhật (Hiện Đại): Trong các bối cảnh Hiện Đại, mỗi nhân vật sẽ có ngày tháng năm sinh (`dateOfBirth`). Chỉ số 'Tuổi' của họ được tính toán tự động dựa trên ngày sinh và `gameTime` hiện tại. AI phải quản lý `dateOfBirth` và không nên trực tiếp thay đổi giá trị của 'Tuổi'. Khi đến ngày sinh nhật của một nhân vật, AI nên tạo ra một sự kiện nhỏ liên quan.", isActive: true, author: 'player', timestamp: initialTimestamp, tags: [WORLD_ERA.MODERN] },
    { id: generateUniqueId('wlr-modern-brands'), text: "Hệ Thống Thương hiệu & Sản phẩm Có thật: Để tăng tính chân thực, AI được phép và được khuyến khích đề cập đến các thương hiệu và sản phẩm có thật trong đời sống. Ví dụ: điện thoại iPhone, xe hơi Toyota, cà phê Starbucks, đồ ăn nhanh McDonald's, quần áo Nike, v.v. Việc sử dụng phải phù hợp với bối cảnh và địa vị của nhân vật.", isActive: true, author: 'player', timestamp: initialTimestamp, tags: [WORLD_ERA.MODERN] },
    { id: generateUniqueId('wlr-default-auction-system'), text: 'Hệ Thống Đấu Giá Hội: Trong các thành phố lớn hoặc trung tâm thương mại, tồn tại các nhà đấu giá chuyên buôn bán các vật phẩm quý hiếm, độc nhất. Người chơi có thể đưa vật phẩm của mình lên sàn đấu giá. AI PHẢI quản lý quá trình đấu giá, bao gồm việc tạo ra các NPC khác tham gia đấu giá, mô tả diễn biến và xác định giá cuối cùng.', isActive: true, author: 'player', timestamp: initialTimestamp, tags: [WORLD_ERA.MEDIEVAL, WORLD_ERA.MODERN] },
    { id: generateUniqueId('wlr-default-smithing-system'), text: 'Hệ Thống Rèn Đúc & Nâng Cấp: Tồn tại các xưởng rèn nơi các thợ rèn (NPC) cung cấp dịch vụ chế tạo, sửa chữa và nâng cấp trang bị. Người chơi có thể mang nguyên liệu đến để yêu cầu chế tác. AI PHẢI xác định chi phí (tiền và nguyên liệu), thời gian cần thiết, và tỷ lệ thành công/thất bại dựa trên độ phức tạp của vật phẩm và kỹ năng của thợ rèn.', isActive: true, author: 'player', timestamp: initialTimestamp, tags: [WORLD_ERA.MEDIEVAL] },
    { id: generateUniqueId('wlr-default-shop-system'), text: 'Hệ Thống Cửa Hàng Trang Bị: Các cửa hàng vũ khí, áo giáp, và phụ kiện tồn tại để người chơi mua bán các trang bị từ phổ thông đến hiếm. AI PHẢI quản lý một danh sách vật phẩm (inventory) có sẵn để bán, có thể thay đổi theo thời gian. Người chơi có thể bán trang bị của mình cho cửa hàng với giá thấp hơn giá thị trường.', isActive: true, author: 'player', timestamp: initialTimestamp, tags: [WORLD_ERA.MEDIEVAL, WORLD_ERA.MODERN] },
    { id: generateUniqueId('wlr-default-brothel-system'), text: `**Bối cảnh Nhà thổ & Mại dâm (Chỉ khi 18+ được bật):**
- **Đô Thị Hiện Đại:** Có thể tồn tại dưới dạng các câu lạc bộ đêm, quán bar thoát y (strip club), hoặc các tiệm massage trá hình.
- **Võ Lâm/Tu Tiên:** Các "Lầu xanh" hoặc "Kỹ viện" không chỉ là nơi mua vui mà còn là trung tâm văn hóa và thu thập thông tin. Các kỹ nữ hàng đầu ("Hoa khôi") thường tài sắc vẹn toàn, cầm kỳ thi họa.
- **Fantasy/Dị Giới:** Các nhà thổ (brothel) hoặc các quán rượu có phòng cho thuê là phổ biến.
- **Hậu Tận Thế:** Mại dâm tồn tại như một hình thức trao đổi tài nguyên khắc nghiệt để sinh tồn.`, isActive: true, author: 'player', timestamp: initialTimestamp, tags: [WORLD_ERA.ANCIENT, WORLD_ERA.MEDIEVAL, WORLD_ERA.MODERN, WORLD_ERA.FUTURISTIC] },
    { id: generateUniqueId('wlr-default-guild-system'), text: 'Hệ Thống Hội Mạo Hiểm Giả (Guild): Trong các thế giới Fantasy và Giả Tưởng, tồn tại các Hội Mạo Hiểm Giả. Đây là nơi người chơi có thể nhận nhiệm vụ (săn quái, hộ tống, thu thập), báo cáo thành tích để tăng Cấp Bậc Mạo Hiểm Giả, và giao lưu với các mạo hiểm giả khác (NPC). AI PHẢI quản lý một bảng nhiệm vụ (quest board) và các NPC liên quan (nhân viên Guild, các mạo hiểm giả khác).', isActive: true, author: 'player', timestamp: initialTimestamp, tags: [WORLD_ERA.MEDIEVAL] },
    { id: generateUniqueId('wlr-default-merchant-system'), text: 'Hệ Thống Thương Hội & Thương Đoàn: Hoạt động thương mại được tổ chức bởi các Thương Hội trong thành phố và các Thương Đoàn lưu động. Thương Hội kiểm soát giá cả và nguồn cung hàng hóa. Thương Đoàn vận chuyển hàng hóa giữa các vùng, thường cần được bảo vệ. AI có thể tạo ra các cơ hội tương tác liên quan đến giao thương, hộ tống, hoặc cướp bóc.', isActive: true, author: 'player', timestamp: initialTimestamp, tags: [WORLD_ERA.MEDIEVAL] },
    { id: generateUniqueId('wlr-default-escort-agency-system'), text: 'Hệ Thống Tiêu Cục (Võ Lâm): Trong bối cảnh Võ Lâm, tồn tại các Tiêu Cục, là các tổ chức chuyên cung cấp dịch vụ bảo tiêu (hộ tống và bảo vệ) cho hàng hóa hoặc người quan trọng. Người chơi có thể thuê họ, hoặc nhận nhiệm vụ làm một Tiêu Sư. AI PHẢI quản lý các hợp đồng, rủi ro trên đường đi (bị cướp), và danh tiếng của các Tiêu Cục.', isActive: true, author: 'player', timestamp: initialTimestamp, tags: [WORLD_ERA.MEDIEVAL] },
    { id: generateUniqueId('wlr-default-porn-production-system'), text: 'Hệ Thống Sản xuất Nội dung Khiêu dâm (18+): Nếu allow18Plus là true, thế giới có thể tồn tại các hình thức sản xuất nội dung người lớn. QUAN TRỌNG: Loại hình sản xuất BẮT BUỘC phải phù hợp với bối cảnh. Trong các thế giới Đô Thị Hiện Đại hoặc Hậu Tận Thế, điều này có thể bao gồm các hãng phim sản xuất phim ảnh. Trong các bối cảnh khác (Fantasy, Tu Tiên, Võ Lâm...), nó sẽ là các dạng khác như ma pháp thạch ghi hình, tranh vẽ khiêu dâm, hoặc các buổi biểu diễn nghệ thuật nhạy cảm. AI PHẢI quản lý các yếu tố như việc tuyển mộ "diễn viên" hoặc nghệ sĩ, các vụ bê bối, hoặc các nhiệm vụ liên quan.', isActive: true, author: 'player', timestamp: initialTimestamp, tags: [WORLD_ERA.ANCIENT, WORLD_ERA.MEDIEVAL, WORLD_ERA.MODERN, WORLD_ERA.FUTURISTIC] },
    { id: generateUniqueId('wlr-default-nude-art-system'), text: 'Hệ Thống Nghệ thuật Khỏa thân & Người mẫu (18+): Nếu allow18Plus là true, có thể tồn tại các nghệ sĩ (họa sĩ, nhiếp ảnh gia) chuyên về nghệ thuật khỏa thân và những người mẫu làm việc cho họ. AI có thể tạo ra các tình huống liên quan đến việc được mời làm người mẫu, các vụ bê bối tranh nghệ thuật, hoặc tìm hiểu về các tác phẩm nổi tiếng.', isActive: true, author: 'player', timestamp: initialTimestamp, tags: [WORLD_ERA.ANCIENT, WORLD_ERA.MEDIEVAL, WORLD_ERA.MODERN, WORLD_ERA.FUTURISTIC] },
    { id: generateUniqueId('wlr-default-independent-prostitution-system'), text: 'Hệ Thống Bán dâm Cá nhân (18+): Ngoài các Lầu Xanh có tổ chức, nếu allow18Plus là true, AI có thể tạo ra các cá nhân hành nghề độc lập. Họ có thể là gái đứng đường ở các khu vực nguy hiểm, hoặc các kỹ nữ/nam sủng cao cấp phục vụ giới thượng lưu, đóng vai trò là nguồn cung cấp thông tin, nhiệm vụ, hoặc các mối quan hệ phức tạp.', isActive: true, author: 'player', timestamp: initialTimestamp, tags: [WORLD_ERA.ANCIENT, WORLD_ERA.MEDIEVAL, WORLD_ERA.MODERN, WORLD_ERA.FUTURISTIC] },
    {
        id: generateUniqueId('wlr-system-rumor-generation'),
        text: "Hệ Thống Danh Vọng & Tin đồn: Khi một sự kiện quan trọng xảy ra (lượt chơi có `isMilestone: true`), một 'Tin đồn' sẽ được tạo ra. Các hành động tốt sẽ tăng 'Danh Vọng', các hành động xấu sẽ tăng 'Tai tiếng'.",
        isActive: true, author: 'player', timestamp: initialTimestamp, tags: [WORLD_ERA.ANCIENT, WORLD_ERA.MEDIEVAL, WORLD_ERA.MODERN, WORLD_ERA.FUTURISTIC]
    },
    {
        id: generateUniqueId('wlr-system-rumor-propagation'),
        text: "Cơ chế Lan truyền Tin đồn: Tin đồn sẽ tự động lan truyền đến các địa điểm mới theo thời gian thông qua mô phỏng thế giới, và nội dung của chúng có thể bị 'tam sao thất bản' (thay đổi một chút).",
        isActive: true, author: 'player', timestamp: initialTimestamp, tags: [WORLD_ERA.ANCIENT, WORLD_ERA.MEDIEVAL, WORLD_ERA.MODERN, WORLD_ERA.FUTURISTIC]
    },
    {
        id: generateUniqueId('wlr-system-rumor-reaction'),
        text: "Phản ứng của NPC với Tin đồn: Khi tương tác, NPC BẮT BUỘC phải phản ứng với các tin đồn về người chơi đã lan đến địa điểm của họ. Phản ứng này ảnh hưởng đến thiện cảm và các lựa chọn đối thoại.",
        isActive: true, author: 'player', timestamp: initialTimestamp, tags: [WORLD_ERA.ANCIENT, WORLD_ERA.MEDIEVAL, WORLD_ERA.MODERN, WORLD_ERA.FUTURISTIC]
    },
    {
        id: generateUniqueId('wlr-system-infamy'),
        text: "Hệ Thống Tai tiếng (Infamy): Các hành động tiêu cực (trộm cắp, giết người, phản bội) sẽ làm tăng chỉ số 'Tai tiếng'. Tai tiếng cao có thể dẫn đến việc bị truy nã, bị NPC từ chối phục vụ, hoặc bị các thợ săn tiền thưởng truy lùng.",
        isActive: true, author: 'player', timestamp: initialTimestamp, tags: [WORLD_ERA.ANCIENT, WORLD_ERA.MEDIEVAL, WORLD_ERA.MODERN, WORLD_ERA.FUTURISTIC]
    },
     {
        id: generateUniqueId('wlr-system-faction-reputation'),
        text: "Hệ Thống Danh vọng Phe phái: Ngoài danh tiếng cá nhân, người chơi còn có một chỉ số danh vọng riêng với mỗi phe phái. Hành động giúp đỡ một phe sẽ tăng danh vọng với họ, trong khi hành động gây hại sẽ làm giảm. Danh vọng phe phái quyết định thái độ của các thành viên phe phái đó, mở khóa nhiệm vụ và các lợi ích độc quyền.",
        isActive: true, author: 'player', timestamp: initialTimestamp, tags: [WORLD_ERA.ANCIENT, WORLD_ERA.MEDIEVAL, WORLD_ERA.MODERN, WORLD_ERA.FUTURISTIC]
    },
    {
        id: generateUniqueId('wlr-system-reputation-consequences'),
        text: "Hệ quả của Danh vọng & Tai tiếng: Danh vọng cao có thể mang lại giảm giá, sự ngưỡng mộ và các nhiệm vụ anh hùng. Tai tiếng cao có thể khiến các cửa hàng tăng giá, lính gác trở nên thù địch, và thu hút các thợ săn tiền thưởng. Các NPC sẽ phản ứng dựa trên cả danh tiếng cá nhân và danh vọng với phe phái của họ.",
        isActive: true, author: 'player', timestamp: initialTimestamp, tags: [WORLD_ERA.ANCIENT, WORLD_ERA.MEDIEVAL, WORLD_ERA.MODERN, WORLD_ERA.FUTURISTIC]
    },
    {
        id: generateUniqueId('wlr-system-piety'),
        text: `### HỆ THỐNG TÍN NGƯỠNG & THẦN THÁNH (PIETY & DIVINITY SYSTEM)
**1. Chỉ số "Tín ngưỡng":** Một Stat mới, "Tín ngưỡng", đo lường lòng mộ đạo và kết nối thần thánh của một nhân vật (0-100).
**2. Sức mạnh Thần thánh (Scaling):** Sức mạnh của các kỹ năng mang thuộc tính 'Thánh' (ví dụ: Chữa Trị, Thánh Quang) BẮT BUỘC phải được tăng tiến (scaling) dựa trên chỉ số "Tín ngưỡng" của người sử dụng. Khi tường thuật, hãy mô tả hiệu ứng mạnh mẽ hơn đối với người có Tín ngưỡng cao.
**3. Phản ứng Xã hội:** Các NPC thuộc các tổ chức tôn giáo sẽ có thái độ tích cực hơn đối với những người có Tín ngưỡng cao.
**4. CƠ CHẾ "THẦN TÍCH" (MIRACLE MECHANISM - QUAN TRỌNG):**
    a.  **Điều kiện Kích hoạt:** KHI một nhân vật có chỉ số "Tín ngưỡng" CỰC KỲ CAO (trên 95) rơi vào tình huống thập tử nhất sinh (Sinh Lực dưới 10% của mức tối đa).
    b.  **Hành động của AI:** Trong tình huống trên, bạn có một **CƠ HỘI NHỎ** (khoảng 15-20%) để kích hoạt một "Thần tích".
    c.  **Hệ quả của Thần tích:** Nếu được kích hoạt, hãy mô tả một sự can thiệp thần thánh ngoạn mục. Ví dụ: một luồng thánh quang chữa lành hoàn toàn vết thương, một đòn tấn công thần thánh giáng xuống kẻ thù, hoặc một lá chắn thần thánh chặn một đòn chí mạng. Đây phải là một sự kiện thay đổi cục diện trận đấu.
    d.  **Mệnh lệnh (Directives):** Sau khi mô tả Thần tích trong \`story\`, hãy ra các mệnh lệnh \`UPDATE_STAT\` hoặc \`ADD_STAT\` tương ứng để phản ánh kết quả (ví dụ: hồi đầy Sinh Lực, gây sát thương lớn cho kẻ địch).`,
        isActive: true, author: 'player', timestamp: initialTimestamp, tags: [WORLD_ERA.ANCIENT, WORLD_ERA.MEDIEVAL, WORLD_ERA.MODERN, WORLD_ERA.FUTURISTIC]
    },
    { id: generateUniqueId('wlr-default-1'), text: 'Tu Tiên: Thế giới sẽ có các khái niệm như "Linh Căn" (tư chất tu luyện), "Cảnh giới" (cấp bậc sức mạnh như Luyện Khí, Trúc Cơ, Kim Đan), và đơn vị tiền tệ là "Linh Thạch". Các nhân vật sẽ tu luyện công pháp để trường sinh.', isActive: true, author: 'player', timestamp: initialTimestamp, tags: [WORLD_ERA.MEDIEVAL] },
    { id: generateUniqueId('wlr-default-2'), text: 'Võ Lâm: Thế giới sẽ tập trung vào "Công Pháp", "Chiêu Thức", "Khí Công". Các nhân vật sẽ tranh giành bí kíp, gia nhập môn phái, và đơn vị tiền tệ là "Lượng Bạc".', isActive: true, author: 'player', timestamp: initialTimestamp, tags: [WORLD_ERA.MEDIEVAL] },
    { id: generateUniqueId('wlr-default-3'), text: 'Dị Giới Fantasy: Thế giới sẽ có các chủng tộc đa dạng (Elf, Dwarf), hệ thống "Cấp bậc" Mạo hiểm giả và "Cấp độ" (Level), và đơn vị tiền tệ là "Đồng Vàng".', isActive: true, author: 'player', timestamp: initialTimestamp, tags: [WORLD_ERA.MEDIEVAL] },
    { id: generateUniqueId('wlr-default-4'), text: 'Đô Thị Hiện Đại 100% bình thường: Mọi yếu tố siêu nhiên sẽ bị loại bỏ. Logic thế giới sẽ tuân thủ nghiêm ngặt các quy luật vật lý và xã hội thông thường.', isActive: true, author: 'player', timestamp: initialTimestamp, tags: [WORLD_ERA.MODERN] },
    {
        id: generateUniqueId('wlr-concept-go'),
        text: "Khái niệm Cờ Vây (Go): Đây là một môn cờ chiến lược trừu tượng, mục tiêu là chiếm nhiều 'đất' (lãnh thổ) hơn đối thủ. Nó không tập trung vào việc tiêu diệt quân cờ, mà vào việc vây bắt và kiểm soát không gian. Cờ Vây được coi là một nghệ thuật đòi hỏi tư duy chiến lược sâu sắc và sự kiên nhẫn, thường được các bậc cao nhân và mưu sĩ sử dụng để rèn luyện tâm cảnh và tư duy.",
        isActive: true, author: 'player', timestamp: initialTimestamp, tags: [WORLD_ERA.ANCIENT, WORLD_ERA.MEDIEVAL]
    },
    {
        id: generateUniqueId('wlr-concept-chess'),
        text: "Khái niệm Cờ Vua (Chess): Đây là một môn cờ chiến lược mô phỏng một trận chiến, mục tiêu là 'chiếu bí' (checkmate) Vua của đối phương. Mỗi quân cờ (Vua, Hậu, Xe, Tượng, Mã, Tốt) có cách di chuyển và vai trò riêng biệt. Cờ Vua tượng trưng cho chiến thuật, các đòn phối hợp và sự hy sinh, thường được các tướng lĩnh và nhà vua sử dụng để rèn luyện tư duy quân sự.",
        isActive: true, author: 'player', timestamp: initialTimestamp, tags: [WORLD_ERA.ANCIENT, WORLD_ERA.MEDIEVAL]
    },
    {
        id: generateUniqueId('wlr-concept-acupuncture'),
        text: "Khái niệm Châm cứu (Acupuncture): Một phương pháp y học cổ truyền dùng kim mỏng châm vào các 'huyệt đạo' trên cơ thể. Mục đích là để đả thông 'kinh lạc' (các đường dẫn năng lượng), điều hòa dòng chảy của 'khí' (năng lượng sống), từ đó chữa bệnh và giảm đau. Đây là một kỹ năng y thuật cao siêu, thường được các Y sư hoặc Thần y nắm giữ.",
        isActive: true, author: 'player', timestamp: initialTimestamp, tags: [WORLD_ERA.ANCIENT, WORLD_ERA.MEDIEVAL, WORLD_ERA.MODERN]
    },
    {
        id: generateUniqueId('wlr-concept-point-striking'),
        text: "Khái niệm Điểm huyệt: Là ứng dụng kiến thức về huyệt đạo trong võ thuật, với mục đích tấn công hoặc khống chế đối thủ, thay vì chữa bệnh. Bằng cách dùng ngón tay hoặc vũ khí đánh chính xác vào các huyệt đạo, người ra đòn có thể gây ra các hiệu ứng như tê liệt, bất động, đau đớn tột cùng, hoặc thậm chí là tử vong nếu đánh trúng 'tử huyệt'. Đây là một kỹ thuật võ công cao cấp và hiểm độc.",
        isActive: true, author: 'player', timestamp: initialTimestamp, tags: [WORLD_ERA.ANCIENT, WORLD_ERA.MEDIEVAL]
    },
    {
        id: generateUniqueId('wlr-concept-power-transfer'),
        text: "Khái niệm Truyền công lực: Một hành động hy sinh, trong đó một cao thủ (thường là khi sắp qua đời) truyền toàn bộ hoặc một phần lớn 'công lực' (nội lực, linh lực đã tu luyện cả đời) cho một người khác. Người nhận có thể ngay lập tức sở hữu sức mạnh to lớn, nhưng quá trình này cực kỳ nguy hiểm cho cả hai. Người truyền thường sẽ mất hết võ công hoặc chết, còn người nhận có nguy cơ bị 'tẩu hỏa nhập ma' (năng lượng hỗn loạn phá hủy cơ thể) nếu không đủ sức chịu đựng.",
        isActive: true, author: 'player', timestamp: initialTimestamp, tags: [WORLD_ERA.MEDIEVAL]
    },
    {
        id: generateUniqueId('wlr-concept-condom'),
        text: "Khái niệm Bao cao su: Là một vật phẩm tiêu hao, được sử dụng trong các cảnh quan hệ tình dục để ngăn ngừa mang thai và các bệnh lây truyền. Nếu allow18Plus là true, đây là một vật phẩm có thể mua và sử dụng. Việc không sử dụng có thể dẫn đến hậu quả mang thai ngoài ý muốn.",
        isActive: true, author: 'player', timestamp: initialTimestamp, tags: [WORLD_ERA.MODERN]
    },
    {
        id: generateUniqueId('wlr-concept-birth-control'),
        text: "Khái niệm Thuốc tránh thai: Là một loại vật phẩm tiêu hao mà nhân vật nữ có thể sử dụng định kỳ để chủ động ngăn ngừa mang thai. Nếu allow18Plus là true, đây là một phương pháp phòng tránh thai hiệu quả.",
        isActive: true, author: 'player', timestamp: initialTimestamp, tags: [WORLD_ERA.MODERN]
    },
    {
        id: generateUniqueId('wlr-concept-scam'),
        text: "Khái niệm Lừa đảo: Là một hành vi tội phạm, trong đó một nhân vật sử dụng mưu mẹo, thông tin sai lệch để chiếm đoạt tài sản của người khác. Các hình thức có thể bao gồm lừa đảo qua mạng, các kế hoạch đầu tư giả mạo, hoặc các vụ lừa tình. Nhân vật có thể học 'Kỹ năng Lừa đảo' để tăng tỷ lệ thành công.",
        isActive: true, author: 'player', timestamp: initialTimestamp, tags: [WORLD_ERA.ANCIENT, WORLD_ERA.MEDIEVAL, WORLD_ERA.MODERN, WORLD_ERA.FUTURISTIC]
    },
    {
        id: generateUniqueId('wlr-concept-gold-digging'),
        text: "Khái niệm Đào mỏ: Là một hành vi xã hội, trong đó một nhân vật (thường là nữ) chủ động tiếp cận và xây dựng mối quan hệ tình cảm với một đối tượng giàu có với mục đích chính là lợi dụng tài chính. Đây có thể là một 'Mục Tiêu' hoặc một đặc điểm trong 'Tính cách' của nhân vật.",
        isActive: true, author: 'player', timestamp: initialTimestamp, tags: [WORLD_ERA.ANCIENT, WORLD_ERA.MEDIEVAL, WORLD_ERA.MODERN, WORLD_ERA.FUTURISTIC]
    },
    {
        id: generateUniqueId('wlr-concept-pickpocketing'),
        text: "Khái niệm Móc túi: Là một kỹ năng tội phạm, cho phép nhân vật lén lút lấy trộm vật phẩm hoặc tiền bạc từ túi của người khác mà không bị phát hiện. Tỷ lệ thành công phụ thuộc vào kỹ năng 'Nhanh nhẹn' và cấp độ của kỹ năng 'Móc túi'. Thất bại có thể dẫn đến bị bắt giữ hoặc bị tấn công.",
        isActive: true, author: 'player', timestamp: initialTimestamp, tags: [WORLD_ERA.ANCIENT, WORLD_ERA.MEDIEVAL, WORLD_ERA.MODERN, WORLD_ERA.FUTURISTIC]
    },
    {
        id: generateUniqueId('wlr-concept-bank-account'),
        text: "Khái niệm Tài khoản Ngân hàng: Trong bối cảnh Đô Thị Hiện Đại, Stat 'Tài sản' không chỉ đại diện cho tiền mặt mà còn bao gồm cả tiền trong tài khoản ngân hàng. Các giao dịch lớn thường được thực hiện qua chuyển khoản.",
        isActive: true, author: 'player', timestamp: initialTimestamp, tags: [WORLD_ERA.MODERN, WORLD_ERA.FUTURISTIC]
    },
    {
        id: generateUniqueId('wlr-concept-black-card'),
        text: "Khái niệm Thẻ Đen (Black Card): Là một loại thẻ tín dụng cao cấp, chỉ dành cho giới siêu giàu. Sở hữu một chiếc 'Thẻ Đen' là một vật phẩm biểu tượng cho địa vị xã hội và khả năng tài chính gần như không giới hạn. Nó có thể mở ra các cơ hội và dịch vụ độc quyền.",
        isActive: true, author: 'player', timestamp: initialTimestamp, tags: [WORLD_ERA.MODERN, WORLD_ERA.FUTURISTIC]
    },
    {
        id: generateUniqueId('wlr-concept-tattoo'),
        text: "Khái niệm Xăm mình (Tattoo): Là một hình thức nghệ thuật trên cơ thể. Các hình xăm là một phần của ngoại hình nhân vật và BẮT BUỘC phải được mô tả trong trường `physicalAppearance`. Hình xăm có thể mang ý nghĩa đặc biệt, thể hiện cá tính, hoặc là dấu hiệu của một tổ chức (ví dụ: băng đảng).",
        isActive: true, author: 'player', timestamp: initialTimestamp, tags: [WORLD_ERA.ANCIENT, WORLD_ERA.MEDIEVAL, WORLD_ERA.MODERN, WORLD_ERA.FUTURISTIC]
    },
    {
        id: generateUniqueId('wlr-concept-stone-gambling'),
        text: "Khái niệm Đỗ thạch (Cờ bạc Đá): Một hình thức cờ bạc trong đó người chơi mua những viên đá thô chưa được cắt (nguyên thạch), hy vọng rằng bên trong chứa 'đá quý' hoặc ngọc có giá trị cao. Quá trình 'cắt đá' để lộ ra bên trong là một khoảnh khắc đầy căng thẳng và kịch tính, có thể khiến một người trở nên giàu có hoặc mất trắng trong chốc lát. Đây là một hoạt động phổ biến trong các phường thị Tu Tiên hoặc các chợ đồ cổ.",
        isActive: true, author: 'player', timestamp: initialTimestamp, tags: [WORLD_ERA.MEDIEVAL]
    },
    {
        id: generateUniqueId('wlr-concept-lifespan'),
        text: "Khái niệm Thọ Nguyên (Lifespan/Life Essence): Đây là tổng thời gian sống tối đa của một sinh vật, khác biệt hoàn toàn với 'Sinh Lực' (Health Points). 'Sinh Lực' là thước đo sức khỏe tức thời và có thể hồi phục, trong khi 'Thọ Nguyên' là nền tảng sinh mệnh. Thọ Nguyên sẽ tăng lên đáng kể sau mỗi lần đột phá Đại Cảnh Giới. Tuy nhiên, nó có thể bị tổn hại vĩnh viễn khi sử dụng các cấm thuật, bí pháp tiêu hao sinh mệnh, hoặc khi bị thương tổn đến căn cơ. Khi Thọ Nguyên cạn kiệt, nhân vật sẽ chết vì tuổi già, bất kể Sinh Lực còn lại bao nhiêu.",
        isActive: true, author: 'player', timestamp: initialTimestamp, tags: [WORLD_ERA.MEDIEVAL]
    },
    {
        id: generateUniqueId('wlr-concept-gemstones'),
        text: "Khái niệm Đá quý (Gems): Các loại đá và khoáng vật quý hiếm như kim cương, hồng ngọc, ngọc bích. Chúng không chỉ là biểu tượng của sự giàu có mà còn có thể được dùng làm vật liệu để chế tác trang bị ma thuật, khảm nạm vào vũ khí, hoặc làm nguồn năng lượng cho các trận pháp.",
        isActive: true, author: 'player', timestamp: initialTimestamp, tags: [WORLD_ERA.ANCIENT, WORLD_ERA.MEDIEVAL, WORLD_ERA.MODERN, WORLD_ERA.FUTURISTIC]
    },
    {
        id: generateUniqueId('wlr-concept-antiques'),
        text: "Khái niệm Đồ cổ & Cổ vật (Antiques/Historical Relics): Là những vật phẩm có giá trị lịch sử, văn hóa hoặc nghệ thuật cao do tuổi đời của chúng. Chúng có thể là đồ gốm, đồ nội thất, vũ khí cũ, hoặc các vật dụng hàng ngày từ một thời đại đã qua. Việc buôn bán và sưu tầm đồ cổ là một hoạt động phổ biến của giới thượng lưu.",
        isActive: true, author: 'player', timestamp: initialTimestamp, tags: [WORLD_ERA.ANCIENT, WORLD_ERA.MEDIEVAL, WORLD_ERA.MODERN, WORLD_ERA.FUTURISTIC]
    },
    {
        id: generateUniqueId('wlr-concept-magical-artifact'),
        text: "Khái niệm Artifact (Thần khí): Khác với đồ cổ thông thường, Artifact là những cổ vật chứa đựng sức mạnh ma thuật hoặc công nghệ cổ xưa phi thường. Chúng thường là những vật phẩm độc nhất vô nhị, có khả năng thay đổi cục diện một trận chiến hoặc cả một quốc gia. Việc tìm kiếm và sở hữu một Artifact là mục tiêu của nhiều nhà thám hiểm và thế lực lớn.",
        isActive: true, author: 'player', timestamp: initialTimestamp, tags: [WORLD_ERA.ANCIENT, WORLD_ERA.MEDIEVAL]
    },
    {
        id: generateUniqueId('wlr-concept-valuable-painting'),
        text: "Khái niệm Tranh quý: Những tác phẩm hội họa có giá trị nghệ thuật và tài chính cao, được tạo ra bởi các danh họa nổi tiếng. Trong các bối cảnh kỳ ảo, tranh quý thậm chí có thể chứa đựng bí mật, bản đồ, hoặc các loại cấm chế ma thuật.",
        isActive: true, author: 'player', timestamp: initialTimestamp, tags: [WORLD_ERA.ANCIENT, WORLD_ERA.MEDIEVAL, WORLD_ERA.MODERN, WORLD_ERA.FUTURISTIC]
    },
    {
        id: generateUniqueId('wlr-concept-beverages'),
        text: "Khái niệm Đồ uống: Các nhân vật có thể tiêu thụ nhiều loại đồ uống khác nhau tùy theo bối cảnh. Bao gồm: 'Nước lọc' (thiết yếu), 'Trà' (phổ biến trong văn hóa Á Đông), 'Cà phê' (phổ biến ở Đô thị), 'Nước ngọt' (Đô thị), 'Bia' (Đô thị/Fantasy phương Tây), 'Rượu' (phổ biến ở mọi bối cảnh, từ rượu đế, rượu trắng đến rượu vang quý tộc). Đồ uống có thể dùng để giải khát, xã giao, hoặc mang lại các hiệu ứng tạm thời.",
        isActive: true, author: 'player', timestamp: initialTimestamp, tags: [WORLD_ERA.ANCIENT, WORLD_ERA.MEDIEVAL, WORLD_ERA.MODERN, WORLD_ERA.FUTURISTIC]
    },
    {
        id: generateUniqueId('wlr-concept-real-estate'),
        text: "Khái niệm Bất động sản (Real Estate): Bao gồm đất đai, nhà cửa, cửa hàng, và các công trình kiến trúc khác có thể được sở hữu, mua bán hoặc cho thuê. Sở hữu bất động sản là một hình thức đầu tư và thể hiện địa vị trong bối cảnh Đô Thị Hiện Đại. Trong các bối cảnh khác, nó có thể là 'Lãnh địa' hoặc 'Động phủ'.",
        isActive: true, author: 'player', timestamp: initialTimestamp, tags: [WORLD_ERA.MODERN, WORLD_ERA.FUTURISTIC]
    },
    {
        id: generateUniqueId('wlr-concept-crypto'),
        text: "Khái niệm Tiền ảo (Cryptocurrency): Trong bối cảnh Đô Thị Hiện Đại hoặc tương lai, tiền ảo như Bitcoin, Ethereum là một dạng tài sản kỹ thuật số phi tập trung. Nó có thể được sử dụng để giao dịch ẩn danh, đầu tư mạo hiểm, và là một phần quan trọng của nền kinh tế ngầm trên mạng.",
        isActive: true, author: 'player', timestamp: initialTimestamp, tags: [WORLD_ERA.MODERN, WORLD_ERA.FUTURISTIC]
    },
    {
        id: generateUniqueId('wlr-concept-royal-assets'),
        text: "Khái niệm Tài sản của Vua chúa: Đây là những tài sản gắn liền với hoàng tộc và quyền lực chính trị. Bao gồm các cung điện, quốc khố, bảo vật hoàng gia (vương miện, quyền trượng), và các vùng đất đai rộng lớn thuộc sở hữu của hoàng gia. Những tài sản này thường được truyền từ đời này sang đời khác và là biểu tượng của Thiên Mệnh.",
        isActive: true, author: 'player', timestamp: initialTimestamp, tags: [WORLD_ERA.ANCIENT, WORLD_ERA.MEDIEVAL]
    },
    {
        id: generateUniqueId('wlr-concept-tycoon-assets'),
        text: "Khái niệm Tài sản của Tài phiệt: Đây là sự giàu có của giới siêu giàu trong bối cảnh hiện đại, được tích lũy thông qua kinh doanh và đầu tư. Bao gồm cổ phần trong các tập đoàn lớn, các tòa nhà chọc trời, đội siêu xe, chuyên cơ riêng, du thuyền sang trọng, và các danh mục đầu tư tài chính khổng lồ.",
        isActive: true, author: 'player', timestamp: initialTimestamp, tags: [WORLD_ERA.MODERN]
    },
    {
        id: generateUniqueId('wlr-concept-inherited-assets'),
        text: "Khái niệm Tài sản Thừa kế: Là những tài sản được truyền lại qua nhiều thế hệ trong một gia tộc. Nó có thể là 'old money' (tiền cũ), các món đồ gia truyền quý giá, các dinh thự cổ, hoặc quyền kiểm soát một công ty gia đình lâu đời. Tài sản thừa kế thường đi kèm với lịch sử, trách nhiệm, và đôi khi là cả những bí mật hoặc lời nguyền.",
        isActive: true, author: 'player', timestamp: initialTimestamp, tags: [WORLD_ERA.ANCIENT, WORLD_ERA.MEDIEVAL, WORLD_ERA.MODERN, WORLD_ERA.FUTURISTIC]
    },
    {
        id: generateUniqueId('wlr-concept-bar-club'),
        text: "Khái niệm Quán bar/Club: Một địa điểm giải trí về đêm trong bối cảnh hiện đại, nơi mọi người đến để uống rượu, bia, cocktail và xã giao. Không khí có thể từ thư giãn, sang trọng đến ồn ào, náo nhiệt. Đây là nơi lý tưởng để thu thập thông tin, gặp gỡ các nhân vật, hoặc bắt đầu các mối quan hệ.",
        isActive: true, author: 'player', timestamp: initialTimestamp, tags: [WORLD_ERA.MODERN]
    },
    {
        id: generateUniqueId('wlr-concept-dance-strip-club'),
        text: "Khái niệm Vũ trường/Vũ trường Thoát y (18+): Vũ trường là nơi tập trung vào việc khiêu vũ với âm nhạc sôi động. Vũ trường Thoát y (strip club) là một biến thể chỉ dành cho người lớn, nơi các vũ công (stripper) biểu diễn các điệu nhảy khiêu gợi. Đây là một phần của thế giới ngầm và thường được các băng đảng kiểm soát.",
        isActive: true, author: 'player', timestamp: initialTimestamp, tags: [WORLD_ERA.MODERN]
    },
    {
        id: generateUniqueId('wlr-concept-karaoke'),
        text: "Khái niệm Quán Karaoke: Một hình thức giải trí phổ biến trong bối cảnh Á Đông, nơi khách hàng thuê các phòng riêng để hát theo nhạc. Các phòng karaoke có thể là nơi để giải trí đơn thuần, hoặc là địa điểm để thực hiện các giao dịch kinh doanh và xã giao quan trọng.",
        isActive: true, author: 'player', timestamp: initialTimestamp, tags: [WORLD_ERA.MODERN]
    },
    {
        id: generateUniqueId('wlr-concept-nightclub'),
        text: "Khái niệm Hộp đêm (Nightclub): Một thuật ngữ chung cho các địa điểm giải trí về đêm, kết hợp giữa quán bar, vũ trường, và đôi khi là các buổi biểu diễn nhạc sống. Hộp đêm thường có không khí sôi động, là nơi giới trẻ tụ tập và thường liên quan đến thế giới ngầm.",
        isActive: true, author: 'player', timestamp: initialTimestamp, tags: [WORLD_ERA.MODERN]
    },
    {
        id: generateUniqueId('wlr-concept-underground-fighting'),
        text: "Khái niệm Sàn đấu ngầm Trái phép: Một địa điểm bí mật và bất hợp pháp, nơi tổ chức các trận đấu không theo luật lệ. Các đấu sĩ có thể chiến đấu để kiếm tiền, danh vọng, hoặc giải quyết ân oán. Các trận đấu có thể từ quyền anh tay trần đến các cuộc đấu võ thuật sinh tử. Đây là nơi nguy hiểm, thường được điều hành bởi các tổ chức tội phạm và thu hút những kẻ giàu có đến cá cược.",
        isActive: true, author: 'player', timestamp: initialTimestamp, tags: [WORLD_ERA.ANCIENT, WORLD_ERA.MEDIEVAL, WORLD_ERA.MODERN, WORLD_ERA.FUTURISTIC]
    },
    {
        id: generateUniqueId('wlr-concept-shares'),
        text: "Khái niệm Cổ phần (Shares/Equity): Đại diện cho quyền sở hữu một phần của một công ty hoặc tập đoàn. Sở hữu cổ phần mang lại quyền biểu quyết và nhận cổ tức (chia lợi nhuận). Đây là một dạng 'Tài sản' quan trọng của các nhà đầu tư và tài phiệt.",
        isActive: true, author: 'player', timestamp: initialTimestamp, tags: [WORLD_ERA.MODERN, WORLD_ERA.FUTURISTIC]
    },
    {
        id: generateUniqueId('wlr-concept-stocks'),
        text: "Khái niệm Cổ phiếu (Stocks): Là một loại chứng khoán xác nhận quyền sở hữu cổ phần của một công ty. Cổ phiếu có thể được mua bán công khai trên 'Thị trường Chứng khoán', giá trị của chúng biến động liên tục dựa trên tình hình kinh doanh của công ty và thị trường.",
        isActive: true, author: 'player', timestamp: initialTimestamp, tags: [WORLD_ERA.MODERN, WORLD_ERA.FUTURISTIC]
    },
    {
        id: generateUniqueId('wlr-concept-securities'),
        text: "Khái niệm Chứng khoán (Securities): Là một thuật ngữ tài chính chung, bao gồm nhiều loại tài sản có thể giao dịch như 'Cổ phiếu', trái phiếu, và các công cụ tài chính khác. Giao dịch chứng khoán là một hoạt động đầu tư và đầu cơ phổ biến trong thế giới hiện đại.",
        isActive: true, author: 'player', timestamp: initialTimestamp, tags: [WORLD_ERA.MODERN, WORLD_ERA.FUTURISTIC]
    },
    {
        id: generateUniqueId('wlr-concept-social-nickname'),
        text: "Khái niệm Nickname trên Mạng Xã hội: Trong bối cảnh Đô Thị Hiện Đại, đây là tên giả mà các nhân vật sử dụng trên các nền tảng internet như diễn đàn, mạng xã hội, hoặc game online. Nickname có thể khác hoàn toàn với tên thật và thường được dùng để thể hiện cá tính hoặc che giấu danh tính.",
        isActive: true, author: 'player', timestamp: initialTimestamp, tags: [WORLD_ERA.MODERN, WORLD_ERA.FUTURISTIC]
    },
    {
        id: generateUniqueId('wlr-concept-ingame-name'),
        text: "Khái niệm Tên In-game: Trong bối cảnh game, đây là tên mà nhân vật sử dụng bên trong thế giới ảo của trò chơi. Nó khác với tên thật của người chơi ở thế giới thực. Ví dụ: một nhân vật tên 'Minh' có thể có tên in-game là 'DragonSlayer99'.",
        isActive: true, author: 'player', timestamp: initialTimestamp, tags: [WORLD_ERA.MODERN, WORLD_ERA.FUTURISTIC]
    },
    {
        id: generateUniqueId('wlr-concept-lottery'),
        text: "Khái niệm Xổ số (Lottery): Một hình thức cờ bạc trong đó người chơi mua vé số với hy vọng trúng một giải thưởng lớn. Đây là một sự kiện có thể xảy ra trong thế giới hiện đại, mang lại cơ hội đổi đời hoặc sự thất vọng.",
        isActive: true, author: 'player', timestamp: initialTimestamp, tags: [WORLD_ERA.MODERN]
    },
    {
        id: generateUniqueId('wlr-concept-ice-cream'),
        text: "Khái niệm Kem (Ice Cream): Một món tráng miệng đông lạnh, ngọt ngào, phổ biến trong bối cảnh hiện đại. Có nhiều hương vị khác nhau.",
        isActive: true, author: 'player', timestamp: initialTimestamp, tags: [WORLD_ERA.ANCIENT, WORLD_ERA.MEDIEVAL, WORLD_ERA.MODERN, WORLD_ERA.FUTURISTIC]
    },
    {
        id: generateUniqueId('wlr-concept-cake'),
        text: "Khái niệm Bánh kem (Cake): Một loại bánh ngọt thường được dùng trong các dịp đặc biệt như sinh nhật, lễ kỷ niệm. Thường được trang trí cầu kỳ.",
        isActive: true, author: 'player', timestamp: initialTimestamp, tags: [WORLD_ERA.ANCIENT, WORLD_ERA.MEDIEVAL, WORLD_ERA.MODERN, WORLD_ERA.FUTURISTIC]
    },
    {
        id: generateUniqueId('wlr-concept-bread'),
        text: "Khái niệm Bánh mì (Bread): Một loại thực phẩm cơ bản, được làm từ bột mì nướng. Có nhiều loại khác nhau và là một phần quan trọng của bữa ăn ở nhiều nền văn hóa.",
        isActive: true, author: 'player', timestamp: initialTimestamp, tags: [WORLD_ERA.ANCIENT, WORLD_ERA.MEDIEVAL, WORLD_ERA.MODERN, WORLD_ERA.FUTURISTIC]
    },
    {
        id: generateUniqueId('wlr-concept-cookies'),
        text: "Khái niệm Bánh quy (Cookies): Một loại bánh nướng nhỏ, dẹt và ngọt, thường được ăn như một món ăn nhẹ.",
        isActive: true, author: 'player', timestamp: initialTimestamp, tags: [WORLD_ERA.ANCIENT, WORLD_ERA.MEDIEVAL, WORLD_ERA.MODERN, WORLD_ERA.FUTURISTIC]
    },
    {
        id: generateUniqueId('wlr-concept-pie'),
        text: "Khái niệm Bánh nướng (Pie/Baked Goods): Một thuật ngữ chung cho các loại bánh được nướng trong lò, có thể có nhân ngọt hoặc mặn.",
        isActive: true, author: 'player', timestamp: initialTimestamp, tags: [WORLD_ERA.ANCIENT, WORLD_ERA.MEDIEVAL, WORLD_ERA.MODERN, WORLD_ERA.FUTURISTIC]
    },
    {
        id: generateUniqueId('wlr-concept-noodles'),
        text: "Khái niệm Mì (Noodles): Một loại thực phẩm làm từ bột không men được kéo, ép hoặc cán phẳng và cắt thành một trong nhiều hình dạng khác nhau. Mì ăn liền là một món ăn cực kỳ phổ biến trong bối cảnh hiện đại.",
        isActive: true, author: 'player', timestamp: initialTimestamp, tags: [WORLD_ERA.ANCIENT, WORLD_ERA.MEDIEVAL, WORLD_ERA.MODERN, WORLD_ERA.FUTURISTIC]
    },
    {
        id: generateUniqueId('wlr-concept-rice-noodles'),
        text: "Khái niệm Bún (Rice Noodles): Một loại mì làm từ bột gạo, sợi nhỏ và màu trắng, là một món ăn rất phổ biến trong văn hóa ẩm thực Việt Nam và các nước Á Đông.",
        isActive: true, author: 'player', timestamp: initialTimestamp, tags: [WORLD_ERA.ANCIENT, WORLD_ERA.MEDIEVAL, WORLD_ERA.MODERN]
    },
    { id: generateUniqueId('wlr-concept-vehicles'), text: "Khái niệm Phương tiện Di chuyển: Các nhân vật có thể sử dụng phương tiện để di chuyển. 'Ô tô' và 'Xe máy' là phương tiện cá nhân phổ biến ở Đô Thị. 'Máy bay' dùng để di chuyển đường dài trên hành tinh, trong khi 'Phi thuyền' dành cho du hành vũ trụ.", isActive: true, author: 'player', timestamp: initialTimestamp, tags: [WORLD_ERA.MODERN, WORLD_ERA.FUTURISTIC] },
    { id: generateUniqueId('wlr-concept-education'), text: "Khái niệm Giáo dục: Các cơ sở như 'Trường học' và 'Đại học' là nơi các nhân vật trẻ tuổi học tập, xây dựng mối quan hệ. 'Ký túc xá' là nơi ở chung của họ. 'Tốt nghiệp' là một sự kiện quan trọng, đánh dấu sự kết thúc của một giai đoạn học tập.", isActive: true, author: 'player', timestamp: initialTimestamp, tags: [WORLD_ERA.ANCIENT, WORLD_ERA.MEDIEVAL, WORLD_ERA.MODERN, WORLD_ERA.FUTURISTIC] },
    { id: generateUniqueId('wlr-concept-media'), text: "Khái niệm Truyền thông & Xã hội: 'Nhà báo' và các tổ chức 'Truyền thông' có vai trò lan truyền thông tin, có thể phanh phui sự thật hoặc bóp méo nó. 'Mạng xã hội' là nền tảng trực tuyến để các nhân vật tương tác, xây dựng danh tiếng và tạo ra các drama.", isActive: true, author: 'player', timestamp: initialTimestamp, tags: [WORLD_ERA.MODERN] },
    { id: generateUniqueId('wlr-concept-trauma'), text: "Khái niệm Ám ảnh tâm lý (Trauma): Một vết sẹo tinh thần sâu sắc do trải qua một sự kiện kinh hoàng. Nó có thể ảnh hưởng đến tính cách, hành vi, và các quyết định của nhân vật, đôi khi gây ra các cơn ác mộng hoặc các phản ứng tiêu cực.", isActive: true, author: 'player', timestamp: initialTimestamp, tags: [WORLD_ERA.ANCIENT, WORLD_ERA.MEDIEVAL, WORLD_ERA.MODERN, WORLD_ERA.FUTURISTIC] },
    { id: generateUniqueId('wlr-concept-fantasy-races'), text: "Khái niệm Chủng tộc Fantasy: Thế giới có thể có các chủng tộc kỳ ảo. 'Yêu tinh' (Goblin) là những quái vật nhỏ, xảo quyệt. 'Người lùn' (Dwarf) là những thợ rèn và chiến binh cừ khôi sống dưới lòng đất. 'Tiên tộc' (Elf) là chủng tộc cao quý, xinh đẹp, trường thọ, và là bậc thầy về cung thuật và ma pháp tự nhiên.", isActive: true, author: 'player', timestamp: initialTimestamp, tags: [WORLD_ERA.MEDIEVAL] },
    { id: generateUniqueId('wlr-concept-realms'), text: "Khái niệm Các Chiều không gian/Thế giới: Tồn tại các thế giới riêng biệt. 'Ma giới' (Demon Realm) là nơi ở của ma tộc, đầy rẫy năng lượng hắc ám. 'Tiên giới' (Immortal Realm) là nơi ở của các vị tiên, linh khí dồi dào. 'Minh giới' (Underworld) là thế giới của người chết, nơi linh hồn được phán xét và luân hồi.", isActive: true, author: 'player', timestamp: initialTimestamp, tags: [WORLD_ERA.MEDIEVAL] },
    { id: generateUniqueId('wlr-concept-espionage'), text: "Khái niệm Gián điệp & Tình báo: 'Gián điệp' (Spy) là những cá nhân hoạt động bí mật để thu thập thông tin tình báo về một thế lực đối địch. 'Tình báo' (Intelligence) là nghệ thuật thu thập, phân tích và sử dụng thông tin để đạt được lợi thế trong chính trị, quân sự hoặc kinh doanh.", isActive: true, author: 'player', timestamp: initialTimestamp, tags: [WORLD_ERA.ANCIENT, WORLD_ERA.MEDIEVAL, WORLD_ERA.MODERN, WORLD_ERA.FUTURISTIC] },
    { id: generateUniqueId('wlr-concept-cybernetics'), text: "Khái niệm Công nghệ Cao: 'Cấy ghép Cybernetic' là các bộ phận máy móc được cấy ghép vào cơ thể để tăng cường sức mạnh, phổ biến trong bối cảnh Cyberpunk. 'Robot' là các cỗ máy tự động, có thể là người giúp việc, công nhân, hoặc những cỗ máy chiến đấu đáng sợ.", isActive: true, author: 'player', timestamp: initialTimestamp, tags: [WORLD_ERA.FUTURISTIC] },
    { id: generateUniqueId('wlr-social-caste-system'), text: "Hệ thống Giai cấp: Xã hội được phân chia thành các giai cấp cứng nhắc như 'Quý tộc' (Noble), 'Bình dân' (Commoner), và 'Nô lệ' (Slave). Địa vị xã hội ảnh hưởng lớn đến cơ hội và quyền lợi của nhân vật.", isActive: true, author: 'player', timestamp: initialTimestamp, tags: [WORLD_ERA.ANCIENT, WORLD_ERA.MEDIEVAL] },
    { id: generateUniqueId('wlr-social-slavery'), text: "Chế độ Nô lệ: Việc mua bán và sở hữu nô lệ là một thực tế trong nhiều bối cảnh. Nô lệ không có quyền công dân và phải phục tùng chủ nhân tuyệt đối. Giải phóng nô lệ có thể là một mục tiêu anh hùng.", isActive: true, author: 'player', timestamp: initialTimestamp, tags: [WORLD_ERA.ANCIENT, WORLD_ERA.MEDIEVAL] },
    { id: generateUniqueId('wlr-social-council-of-elders'), text: "Hội đồng Trưởng lão: Một hình thức chính phủ phổ biến trong các bộ lạc, tông môn, hoặc thành phố cổ, nơi các thành viên lớn tuổi và khôn ngoan nhất đưa ra các quyết định quan trọng.", isActive: true, author: 'player', timestamp: initialTimestamp, tags: [WORLD_ERA.ANCIENT, WORLD_ERA.MEDIEVAL] },
    { id: generateUniqueId('wlr-social-revolution'), text: "Cách mạng: Một sự kiện thế giới lớn, trong đó dân chúng hoặc một phe phái bị áp bức nổi dậy bằng vũ lực để lật đổ chính quyền hiện tại, gây ra sự hỗn loạn và thay đổi trật tự xã hội.", isActive: true, author: 'player', timestamp: initialTimestamp, tags: [WORLD_ERA.ANCIENT, WORLD_ERA.MEDIEVAL, WORLD_ERA.MODERN, WORLD_ERA.FUTURISTIC] },
    { id: generateUniqueId('wlr-magic-necromancy'), text: "Chiêu hồn thuật (Necromancy): Một nhánh ma thuật hắc ám tập trung vào việc giao tiếp với người chết, triệu hồi linh hồn, và hồi sinh xác chết (undead). Thường bị coi là cấm thuật và bị các tổ chức chính nghĩa truy lùng.", isActive: true, author: 'player', timestamp: initialTimestamp, tags: [WORLD_ERA.MEDIEVAL] },
    { id: generateUniqueId('wlr-magic-illusion'), text: "Ảo thuật (Illusion Magic): Loại ma thuật tạo ra các hình ảnh, âm thanh, hoặc cảm giác giả để đánh lừa các giác quan của đối thủ. Được sử dụng để đánh lạc hướng, ngụy trang, hoặc tạo ra các đòn tấn công tâm lý.", isActive: true, author: 'player', timestamp: initialTimestamp, tags: [WORLD_ERA.MEDIEVAL] },
    { id: generateUniqueId('wlr-magic-summoning'), text: "Triệu hồi thuật (Summoning Magic): Kỹ năng triệu hồi các sinh vật từ các chiều không gian khác (yêu ma, tinh linh, nguyên tố) để chiến đấu hoặc phục vụ. Các sinh vật được triệu hồi có thể là tạm thời hoặc được ràng buộc vĩnh viễn thông qua khế ước.", isActive: true, author: 'player', timestamp: initialTimestamp, tags: [WORLD_ERA.MEDIEVAL] },
    { id: generateUniqueId('wlr-magic-curse'), text: "Lời nguyền: Một loại ma thuật hắc ám được gieo rắc lên một người, địa điểm hoặc vật phẩm, gây ra các hiệu ứng tiêu cực kéo dài. Hóa giải lời nguyền thường là một nhiệm vụ khó khăn, đòi hỏi các nghi lễ hoặc vật phẩm đặc biệt.", isActive: true, author: 'player', timestamp: initialTimestamp, tags: [WORLD_ERA.MEDIEVAL] },
    { id: generateUniqueId('wlr-magic-holy-dark'), text: "Ma thuật Thánh Quang & Hắc Ám: Hai loại ma thuật đối nghịch. 'Thánh Quang' thường gắn liền với chữa trị, thanh tẩy, và bảo vệ, có sức mạnh đặc biệt chống lại undead và ma quỷ. 'Hắc Ám' liên quan đến gây hại, mục rữa, hút sinh lực và chiêu hồn.", isActive: true, author: 'player', timestamp: initialTimestamp, tags: [WORLD_ERA.MEDIEVAL] },
    { id: generateUniqueId('wlr-warfare-guerrilla'), text: "Chiến tranh Du kích: Một chiến thuật quân sự trong đó các nhóm nhỏ sử dụng địa hình và sự cơ động để phục kích, phá hoại, và làm tiêu hao lực lượng địch lớn hơn.", isActive: true, author: 'player', timestamp: initialTimestamp, tags: [WORLD_ERA.ANCIENT, WORLD_ERA.MEDIEVAL, WORLD_ERA.MODERN, WORLD_ERA.FUTURISTIC] },
    { id: generateUniqueId('wlr-warfare-siege'), text: "Công thành/Bao vây (Siege): Hành động một đội quân bao vây và tấn công một thành trì hoặc pháo đài. Các cuộc công thành thường kéo dài và đòi hỏi các vũ khí đặc biệt như máy bắn đá, thang công thành.", isActive: true, author: 'player', timestamp: initialTimestamp, tags: [WORLD_ERA.ANCIENT, WORLD_ERA.MEDIEVAL] },
    { id: generateUniqueId('wlr-warfare-duel'), text: "Song đấu (Duel): Một trận quyết đấu tay đôi trang trọng giữa hai người để giải quyết một mối thù, tranh chấp danh dự hoặc quyết định một vấn đề quan trọng. Thường có các quy tắc rõ ràng và người chứng kiến.", isActive: true, author: 'player', timestamp: initialTimestamp, tags: [WORLD_ERA.ANCIENT, WORLD_ERA.MEDIEVAL, WORLD_ERA.MODERN, WORLD_ERA.FUTURISTIC] },
    { id: generateUniqueId('wlr-warfare-morale'), text: "Sĩ khí (Morale): Tinh thần và ý chí chiến đấu của một đội quân. Sĩ khí cao giúp binh lính chiến đấu dũng cảm hơn, trong khi sĩ khí thấp có thể dẫn đến sự hoảng loạn và tan rã hàng ngũ.", isActive: true, author: 'player', timestamp: initialTimestamp, tags: [WORLD_ERA.ANCIENT, WORLD_ERA.MEDIEVAL, WORLD_ERA.MODERN, WORLD_ERA.FUTURISTIC] },
    { id: generateUniqueId('wlr-culture-festival'), text: "Lễ hội: Các sự kiện ăn mừng công cộng, thường gắn liền với một mùa trong năm, một vị thần, hoặc một ngày lễ lịch sử. Là cơ hội để xã giao, tham gia các trò chơi và nhiệm vụ đặc biệt.", isActive: true, author: 'player', timestamp: initialTimestamp, tags: [WORLD_ERA.ANCIENT, WORLD_ERA.MEDIEVAL, WORLD_ERA.MODERN, WORLD_ERA.FUTURISTIC] },
    { id: generateUniqueId('wlr-culture-wedding'), text: "Hôn lễ: Nghi thức kết hôn giữa hai người. Trong các tầng lớp quý tộc, hôn lễ thường là một công cụ của các liên minh chính trị.", isActive: true, author: 'player', timestamp: initialTimestamp, tags: [WORLD_ERA.ANCIENT, WORLD_ERA.MEDIEVAL, WORLD_ERA.MODERN, WORLD_ERA.FUTURISTIC] },
    { id: generateUniqueId('wlr-culture-funeral'), text: "Tang lễ: Nghi thức tiễn đưa người đã khuất. Phong tục tang lễ phản ánh niềm tin của một nền văn hóa về thế giới bên kia.", isActive: true, author: 'player', timestamp: initialTimestamp, tags: [WORLD_ERA.ANCIENT, WORLD_ERA.MEDIEVAL, WORLD_ERA.MODERN, WORLD_ERA.FUTURISTIC] },
    { id: generateUniqueId('wlr-culture-rumors'), text: "Tin đồn: Một cơ chế lan truyền thông tin (hoặc thông tin sai lệch) trong thế giới. Nghe ngóng tin đồn trong các quán rượu hoặc chợ có thể dẫn đến các nhiệm vụ hoặc manh mối mới.", isActive: true, author: 'player', timestamp: initialTimestamp, tags: [WORLD_ERA.ANCIENT, WORLD_ERA.MEDIEVAL, WORLD_ERA.MODERN, WORLD_ERA.FUTURISTIC] },
    { id: generateUniqueId('wlr-justice-court'), text: "Tòa án: Nơi các tranh chấp pháp lý và các vụ án hình sự được xét xử. Các phán quyết có thể dựa trên bằng chứng, hoặc trong các thế giới kỳ ảo, dựa trên các thử thách hoặc ma thuật.", isActive: true, author: 'player', timestamp: initialTimestamp, tags: [WORLD_ERA.ANCIENT, WORLD_ERA.MEDIEVAL, WORLD_ERA.MODERN, WORLD_ERA.FUTURISTIC] },
    { id: generateUniqueId('wlr-justice-prison'), text: "Nhà tù: Nơi giam giữ tội phạm. Các nhà tù có thể từ những ngục tối đơn giản đến những pháo đài được canh gác nghiêm ngặt.", isActive: true, author: 'player', timestamp: initialTimestamp, tags: [WORLD_ERA.ANCIENT, WORLD_ERA.MEDIEVAL, WORLD_ERA.MODERN, WORLD_ERA.FUTURISTIC] },
    { id: generateUniqueId('wlr-justice-bounty-hunter'), text: "Thợ săn Tiền thưởng: Những người chuyên săn lùng và bắt giữ tội phạm hoặc quái vật để nhận phần thưởng (tiền thưởng) từ chính quyền hoặc các tổ chức.", isActive: true, author: 'player', timestamp: initialTimestamp, tags: [WORLD_ERA.ANCIENT, WORLD_ERA.MEDIEVAL, WORLD_ERA.MODERN, WORLD_ERA.FUTURISTIC] },
    { id: generateUniqueId('wlr-justice-trafficking'), text: "(18+) Buôn người: Một hoạt động tội phạm tàn nhẫn, trong đó con người bị bắt cóc và bán làm nô lệ hoặc cho các mục đích bất hợp pháp khác. Đây là một phần đen tối của thế giới ngầm.", isActive: true, author: 'player', timestamp: initialTimestamp, tags: [WORLD_ERA.ANCIENT, WORLD_ERA.MEDIEVAL, WORLD_ERA.MODERN, WORLD_ERA.FUTURISTIC] },
    {
        id: generateUniqueId('wlr-concept-suicide'),
        text: "Khái niệm Tự sát (Suicide): Là hành động một nhân vật tự kết liễu đời mình. Đây là một sự kiện cực kỳ nghiêm trọng, đen tối và có tác động tâm lý sâu sắc đến những người xung quanh. AI phải xử lý chủ đề này một cách cẩn trọng, mô tả sự tuyệt vọng dẫn đến hành động và hậu quả bi thảm của nó. Đây có thể là một kết thúc cho một nhân vật phản diện, hoặc một hành động hy sinh cao cả.",
        isActive: true, author: 'player', timestamp: initialTimestamp, tags: [WORLD_ERA.ANCIENT, WORLD_ERA.MEDIEVAL, WORLD_ERA.MODERN, WORLD_ERA.FUTURISTIC]
    },
    {
        id: generateUniqueId('wlr-concept-bdsm'),
        text: "Khái niệm BDSM (18+): Một thuật ngữ bao gồm các hoạt động tình dục liên quan đến sự trói buộc (Bondage), kỷ luật (Discipline), thống trị & phục tùng (Domination & Submission), và khổ dâm & bạo dâm (Sadism & Masochism). Nếu allow18Plus là true, AI có thể tạo ra các kịch bản liên quan đến các vai trò Dom (người thống trị) và Sub (người phục tùng), các hành vi trói buộc, sử dụng đạo cụ (roi, còng), và các hình phạt có tính chất tình dục. Mọi hoạt động phải dựa trên sự đồng thuận trong bối cảnh truyện (Safe, Sane, and Consensual).",
        isActive: true, author: 'player', timestamp: initialTimestamp, tags: [WORLD_ERA.ANCIENT, WORLD_ERA.MEDIEVAL, WORLD_ERA.MODERN, WORLD_ERA.FUTURISTIC]
    }
];

export const DEFAULT_WORLD_LOGIC_SET = new Set(DEFAULT_WORLD_LOGIC_RULES.map(r => r.text));

// NEW: Exported constants for each difficulty level's logic.
export const DIFFICULTY_LOGIC_EASY: WorldLogicRule = {
    id: generateUniqueId('wlr-system-easy'),
    text: `### QUY TẮC LOGIC THẾ GIỚI (ĐỘ KHÓ: DỄ - NGƯỜI DẪN CHUYỆN HIỀN HÒA)\n**Mệnh lệnh:** AI sẽ đóng vai một người dẫn chuyện hiền hòa. Thế giới này ưu ái người chơi. Các sự kiện ngẫu nhiên thường mang lại lợi ích. NPC thân thiện và sẵn sàng giúp đỡ. Kẻ địch yếu hơn và ít xuất hiện hơn. AI sẽ tập trung vào việc kể một câu chuyện hấp dẫn và trao cho người chơi cảm giác của một người hùng. Các mối đe dọa và nguy cơ ở mức rất thấp.`,
    isActive: true,
    author: 'ai',
    timestamp: new Date().toISOString()
};

export const DIFFICULTY_LOGIC_NORMAL: WorldLogicRule = {
    id: generateUniqueId('wlr-system-normal'),
    text: `### QUY TẮC LOGIC THẾ GIỚI (ĐỘ KHÓ: THƯỜNG - TRỌNG TÀI CÔNG BẰNG)\n**Mệnh lệnh:** AI sẽ đóng vai một trọng tài công bằng. Thế giới vận hành một cách logic và cân bằng. Thử thách và phần thưởng đi đôi với nhau. Kẻ địch và NPC hành động hợp lý, dựa trên logic và tính cách của họ. Đây là trải nghiệm RPG tiêu chuẩn.`,
    isActive: true,
    author: 'ai',
    timestamp: new Date().toISOString()
};

export const DIFFICULTY_LOGIC_HARD: WorldLogicRule = {
    id: generateUniqueId('wlr-system-hard'),
    text: `### QUY TẮC LOGIC THẾ GIỚI (ĐỘ KHÓ: KHÓ - ĐỐI THỦ XẢO QUYỆT)\n**Mệnh lệnh:** AI sẽ đóng vai một đối thủ xảo quyệt. Thế giới trở nên khắc nghiệt hơn. Tài nguyên khan hiếm hơn, giá cả đắt đỏ. Kẻ địch thông minh hơn, biết sử dụng chiến thuật, phục kích và nhắm vào điểm yếu. NPC khó tính và đa nghi hơn. AI sẽ chủ động tạo ra những thử thách hóc búa để kiểm tra năng lực của người chơi.`,
    isActive: true,
    author: 'ai',
    timestamp: new Date().toISOString()
};

export const DIFFICULTY_LOGIC_NIGHTMARE: WorldLogicRule = {
    id: generateUniqueId('wlr-system-nightmare'),
    text: `### QUY TẮC LOGIC THẾ GIỚI (ĐỘ KHÓ: ÁC MỘNG - THẦN LINH TÀN NHẪN)\n**Mệnh lệnh:** AI sẽ đóng vai một vị thần tàn nhẫn. Đây là chế độ sinh tồn khắc nghiệt. Thế giới là một nơi tàn bạo, luôn tìm cách chống lại người chơi. Kẻ địch cực kỳ mạnh, tàn nhẫn và đông đảo. Các sự kiện tiêu cực xảy ra thường xuyên. Các chỉ số sinh tồn (độ no, năng lượng) sẽ giảm nhanh hơn. NPC có thể lừa dối hoặc phản bội.`,
    isActive: true,
    author: 'ai',
    timestamp: new Date().toISOString()
};


const CORE_SYSTEM_RULES = {
    'Tu Tiên': ['Tu Tiên:', 'Hệ Thống Cảnh Giới Tu Tiên:', 'Hệ Thống Phẩm Cấp Kim Đan:', 'Hệ Thống Tương Tác Ngũ Hành:', 'Hệ Thống Bí Cảnh & Thiên Tài Địa Bảo:', 'Hệ Thống Linh Căn & Tư Chất Tu Luyện:', 'Hệ thống Nguyên tố Mở rộng:', 'Quy luật Tương tác Nguyên tố Mở rộng:', '**Bối cảnh Học đường (Thế giới Tu Tiên):**', '**Bối cảnh Công sở (Thế giới Tu Tiên):**', '**Bối cảnh Tàng Kinh Các & Thư viện Cấm:**', '**Bối cảnh Tụ Bảo Lâu & Nhà Đấu giá Cao cấp:**', '**Bối cảnh Mật Thất (Phòng Bí mật):**', '**Các Dạng Kỹ Năng Tu Tiên: Công Pháp Tu Luyện**', '**Các Dạng Kỹ Năng Tu Tiên: Thuật Pháp và Độn Thuật**', '**Các Dạng Kỹ Năng Tu Tiên: Luyện Đan và Chế Tạo Pháp Bảo**', '**Các Dạng Kỹ Năng Tu Tiên: Thể Phách và Thần Thức**', '**Các Dạng Kỹ Năng Tu Tiên: Võ Kỹ và Kiếm Đạo**', '**Các Dạng Kỹ Năng Tu Tiên: Khác**'],
    'Võ Lâm': ['Võ Lâm:', 'Hệ Thống Cảnh Giới Võ Lâm:', 'Hệ Thống Tiêu Cục (Võ Lâm):', '**Bối cảnh Học đường (Thế giới Võ Lâm):**', '**Bối cảnh Công sở (Thế giới Võ Lâm/Giang hồ):**', '**Bối cảnh Tàng Kinh Các & Thư viện Cấm:**', '**Bối cảnh Tụ Bảo Lâu & Nhà Đấu giá Cao cấp:**', '**Bối cảnh Mật Thất (Phòng Bí mật):**'],
    'Fantasy': ['Dị Giới Fantasy:', 'Hệ Thống Sức Mạnh Dị Giới Fantasy & Giả Tưởng:', 'Hệ Thống Hội Mạo Hiểm Giả (Guild):', 'Hệ thống Nguyên tố Mở rộng:', 'Quy luật Tương tác Nguyên tố Mở rộng:', '**Bối cảnh Học đường (Thế giới Fantasy/Dị Giới):**', '**Bối cảnh Công sở (Thế giới Fantasy/Dị Giới):**', '**Bối cảnh Tàng Kinh Các & Thư viện Cấm:**', '**Bối cảnh Tụ Bảo Lâu & Nhà Đấu giá Cao cấp:**', '**Bối cảnh Mật Thất (Phòng Bí mật):**'],
    'Modern Normal': ['Đô Thị Hiện Đại 100% bình thường:', '**Bối cảnh Học đường (Thế giới Đô Thị):**', '**Bối cảnh Công sở (Thế giới Đô Thị):**'],
};

const GENERIC_FANTASY_RULES = [
    'Hệ Thống Đấu Giá Hội:',
    'Hệ Thống Rèn Đúc & Nâng Cấp:',
    'Hệ Thống Cửa Hàng Trang Bị:',
    'Hệ Thống Thương Hội & Thương Đoàn:',
    '**Bối cảnh Quán trọ & Nơi ở Tạm thời:**',
    '**Bối cảnh Cửa hàng, Chợ & Mua sắm:**',
    '**Bối cảnh Cơ sở Y tế:**',
    '**Bối cảnh Cơ quan Pháp luật:**',
    '**Bối cảnh Không gian Công cộng & Giải trí:**',
    '**Bối cảnh Nơi lưu trữ Tri thức & Văn hóa:**',
    '**Bối cảnh Công trình Tôn giáo:**',
    '**Bối cảnh Trung tâm Quyền lực & Quân sự:**',
    '**Bối cảnh Phương tiện Giao thông:**',
    '**Bối cảnh Vũ khí & Súng đạn:**',
    '**Bối cảnh Khí tài Quân sự:**',
    '**Bối cảnh Máy móc & Thiết bị:**',
    '**Bối cảnh Liên lạc & Thông tin:**',
];

export const ADULT_RULE_PREFIXES = [
    '**Bối cảnh Nhà thổ & Mại dâm (Chỉ khi 18+ được bật):**',
    'Hệ Thống Sản xuất Nội dung Khiêu dâm (18+):',
    'Hệ Thống Nghệ thuật Khỏa thân & Người mẫu (18+):',
    'Hệ Thống Bán dâm Cá nhân (18+):',
];

const UNDERWORLD_RULES = [
    'Hệ Thống Thế Giới Ngầm:',
    'Hệ Thống Băng Đảng & Tổ chức Tội phạm:',
    'Hệ Thống Chợ Đen:',
    'Khái niệm Sàn đấu ngầm Trái phép:',
];

const MARTIAL_ARTS_UNDERWORLD_RULES = [
    ...UNDERWORLD_RULES,
    'Hệ Thống Sơn Tặc:',
];

const MODERN_REALISM_RULES = [
    'Hệ Thống Nghề nghiệp Hiện đại (Hợp pháp):',
    'Hệ Thống Nghề nghiệp Hiện đại (Bất hợp pháp):',
    'Hệ Thống Bệnh tật & Sức khỏe:',
    'Hệ Thống Văn hóa & Công nghệ Hiện đại:',
    'Hệ Thống Thương hiệu & Sản phẩm Có thật:',
    'Khái niệm Sinh nhật (Hiện Đại):',
    '**Bối cảnh Quán trọ & Nơi ở Tạm thời:**',
    '**Bối cảnh Cửa hàng, Chợ & Mua sắm:**',
    '**Bối cảnh Cơ sở Y tế:**',
    '**Bối cảnh Cơ quan Pháp luật:**',
    '**Bối cảnh Không gian Công cộng & Giải trí:**',
    '**Bối cảnh Nơi lưu trữ Tri thức & Văn hóa:**',
    '**Bối cảnh Công trình Tôn giáo:**',
    '**Bối cảnh Trung tâm Quyền lực & Quân sự:**',
    '**Bối cảnh Phương tiện Giao thông:**',
    '**Bối cảnh Vũ khí & Súng đạn:**',
    '**Bối cảnh Khí tài Quân sự:**',
    '**Bối cảnh Máy móc & Thiết bị:**',
    '**Bối cảnh Liên lạc & Thông tin:**',
    '**Bối cảnh Mật Thất (Phòng Bí mật):**',
    'Khái niệm Quán bar/Club:',
    'Khái niệm Vũ trường/Vũ trường Thoát y (18+):',
    'Khái niệm Quán Karaoke:',
    'Khái niệm Hộp đêm (Nightclub):',
];

const THREE_KINGDOMS_RULES = [
    '**Bối cảnh Tam Quốc (Three Kingdoms) - Thế lực:**',
    '**Bối cảnh Tam Quốc - Tướng lĩnh Thục Hán:**',
    '**Bối cảnh Tam Quốc - Tướng lĩnh Tào Ngụy:**',
    '**Bối cảnh Tam Quốc - Tướng lĩnh Đông Ngô:**',
    '**Bối cảnh Tam Quốc - Nhân vật Đặc biệt:**',
    '**Bối cảnh Tam Quốc - Khái niệm Cốt lõi:**',
    '**Bối cảnh Tam Quốc - Vũ khí & Trang bị:**',
];

const GAMBLING_RULE = '**Bối cảnh Sòng bạc & Cờ bạc:**';

export const GENRE_RULE_MAP: Record<string, string[]> = {
    'Tu Tiên': [...CORE_SYSTEM_RULES['Tu Tiên'], ...GENERIC_FANTASY_RULES, ...MARTIAL_ARTS_UNDERWORLD_RULES, GAMBLING_RULE],
    'Huyền Huyễn Truyền Thuyết': [...CORE_SYSTEM_RULES['Tu Tiên'], ...GENERIC_FANTASY_RULES, ...MARTIAL_ARTS_UNDERWORLD_RULES, GAMBLING_RULE],
    'Võ Lâm': [...CORE_SYSTEM_RULES['Võ Lâm'], ...GENERIC_FANTASY_RULES, ...MARTIAL_ARTS_UNDERWORLD_RULES, GAMBLING_RULE],
    'Thời Chiến': [...UNDERWORLD_RULES, ...MODERN_REALISM_RULES, ...THREE_KINGDOMS_RULES, GAMBLING_RULE],
    'Dị Giới Fantasy': [...CORE_SYSTEM_RULES['Fantasy'], ...GENERIC_FANTASY_RULES, ...MARTIAL_ARTS_UNDERWORLD_RULES, GAMBLING_RULE],
    'Thế Giới Giả Tưởng (Game/Tiểu Thuyết)': [...CORE_SYSTEM_RULES['Fantasy'], ...GENERIC_FANTASY_RULES, ...MARTIAL_ARTS_UNDERWORLD_RULES, GAMBLING_RULE],
    'Đô Thị Hiện Đại': [...UNDERWORLD_RULES, ...MODERN_REALISM_RULES, '**Bối cảnh Học đường (Thế giới Đô Thị):**', '**Bối cảnh Công sở (Thế giới Đô Thị):**', GAMBLING_RULE],
    'Đô Thị Hiện Đại 100% bình thường': [...CORE_SYSTEM_RULES['Modern Normal'], ...MODERN_REALISM_RULES, GAMBLING_RULE],
    'Đô Thị Dị Biến': [...UNDERWORLD_RULES, ...CORE_SYSTEM_RULES['Tu Tiên'], ...MODERN_REALISM_RULES, '**Bối cảnh Học đường (Thế giới Đô Thị):**', '**Bối cảnh Công sở (Thế giới Đô Thị):**', '**Bối cảnh Tàng Kinh Các & Thư viện Cấm:**', GAMBLING_RULE],
    'Hậu Tận Thế': [
        'Hệ Thống Thương Hội & Thương Đoàn:', 
        'Hệ Thống Cửa Hàng Trang Bị:', 
        'Hệ Thống Rèn Đúc & Nâng Cấp:',
        '**Bối cảnh Học đường (Thế giới Hậu Tận Thế):**',
        '**Bối cảnh Công sở (Thế giới Hậu Tận Thế):**',
        '**Bối cảnh Phương tiện Giao thông:**',
        '**Bối cảnh Vũ khí & Súng đạn:**',
        '**Bối cảnh Khí tài Quân sự:**',
        '**Bối cảnh Máy móc & Thiết bị:**',
        '**Bối cảnh Liên lạc & Thông tin:**',
        '**Bối cảnh Quán trọ & Nơi ở Tạm thời:**',
        ...MARTIAL_ARTS_UNDERWORLD_RULES,
        GAMBLING_RULE
    ],
};
