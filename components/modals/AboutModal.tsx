/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import './HelpModal.css';

interface AboutModalProps {
    onClose: () => void;
}

export const AboutModal = ({ onClose }: AboutModalProps) => {
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content help-modal-content about-modal-content" onClick={e => e.stopPropagation()}>
                <header className="modal-header">
                    <h3>Giới thiệu Trò chơi</h3>
                    <button onClick={onClose} className="modal-close-button" aria-label="Đóng">×</button>
                </header>
                <div className="modal-body">
                    <details className="help-section" open>
                        <summary>Chào mừng đến với Game AI Nhập Vai!</summary>
                        <p>
                            Đây không phải là một trò chơi thông thường. Mọi diễn biến, nhân vật, và sự kiện đều được tạo ra và điều khiển bởi một Trí tuệ Nhân tạo (AI) đóng vai trò là Game Master (GM) của bạn. Khả năng của bạn là vô hạn, và thế giới sẽ phản ứng một cách linh hoạt với mọi lựa chọn của bạn.
                        </p>
                    </details>
                    
                    <details className="help-section" open>
                        <summary>Thế giới "Sống" (A Living World)</summary>
                         <ul className="help-options-list">
                            <li><strong>AI là Người Kể chuyện Động:</strong> AI không tuân theo kịch bản định sẵn. Nó sáng tạo tình tiết, nhân vật và hội thoại dựa trên hành động của bạn, đảm bảo mỗi cuộc phiêu lưu là độc nhất.</li>
                            <li><strong>Mô phỏng NPC & Phe phái:</strong> Mỗi nhân vật (NPC) đều có mục tiêu, ký ức và mối quan hệ riêng. Các phe phái sẽ tự phát triển, tranh giành quyền lực. Hành động của bạn sẽ thực sự thay đổi cách họ nhìn nhận bạn và thế giới xung quanh.</li>
                             <li><strong>Thế Giới Tự Chữa Lành:</strong> Khi được bật, thế giới sẽ không "đứng yên" chờ bạn. Cứ sau 20 lượt, AI sẽ chạy các mô phỏng nền để NPC tự phát triển, theo đuổi mục tiêu riêng, và tự sửa các lỗi logic, làm cho thế giới trở nên năng động và chân thực hơn.</li>
                        </ul>
                    </details>
                    
                    <details className="help-section" open>
                        <summary>Nhân Vật Của Bạn, Câu Chuyện Của Bạn</summary>
                        <ul className="help-options-list">
                            <li><strong>Hệ thống Nhân vật Chi tiết:</strong> Quản lý mọi khía cạnh của nhân vật, từ Thuộc tính, Trang bị, Kỹ năng, Quan hệ, Tổ đội, Mục tiêu, Ký ức, Nhiệm vụ đến các Tài sản sở hữu.</li>
                            <li><strong>Hệ thống Tiến triển Đa dạng:</strong> Tùy thuộc vào thể loại, nhân vật của bạn sẽ phát triển theo các hệ thống khác nhau: Cấp độ & Kinh nghiệm (Fantasy), Đột phá Cảnh giới (Tu Tiên), hoặc thăng tiến Võ học (Võ Lâm).</li>
                            <li><strong>Học Kỹ năng từ Hành động:</strong> Khi bật tính năng "Tự động Học Kỹ năng", các hành động lặp đi lặp lại như chạy, nói chuyện, quan sát... sẽ dần dần được tích lũy và chuyển hóa thành các kỹ năng bị động cấp thấp, giúp nhân vật của bạn trưởng thành một cách tự nhiên.</li>
                             <li><strong>Chế tạo & Rèn đúc:</strong> Thu thập nguyên liệu và công thức để chế tạo các vật phẩm độc đáo, từ thuốc men, bùa chú đến vũ khí và áo giáp huyền thoại.</li>
                        </ul>
                    </details>

                    <details className="help-section">
                        <summary>Công Cụ Của "Thượng Đế"</summary>
                        <p>Bạn có toàn quyền kiểm soát thế giới của mình thông qua các công cụ mạnh mẽ sau:</p>
                        <ul className="help-options-list">
                             <li>
                                <strong>Luật Lệ (L):</strong> Công cụ quyền lực nhất để "dạy" AI. Thêm các quy tắc rõ ràng để định hình thế giới. Ví dụ:
                                <ul>
                                    <li>"Tạo ra một thanh kiếm tên là 'Hỏa Long Kiếm' có khả năng phun lửa."</li>
                                    <li>"KHÓA HÀNH ĐỘNG TÙY Ý: Nhân vật chính không thể chủ động tấn công người vô tội."</li>
                                </ul>
                            </li>
                            <li>
                                <strong>Ghim Ký ức (M):</strong> "Dòng Chảy Sự Kiện" là bộ nhớ ngắn hạn của AI. Nếu có một sự kiện bạn cho là rất quan trọng và muốn AI luôn ghi nhớ, hãy "Ghim" nó lại.
                            </li>
                             <li><strong>Bảng điều khiển AI (Nút tròn):</strong> Truy cập nhanh các công cụ mạnh mẽ như bật/tắt cheat, tự động trang bị, hoặc yêu cầu AI làm giàu thêm cho thế giới.</li>
                        </ul>
                    </details>

                    <details className="help-section">
                        <summary>Các Hệ Thống Nâng Cao</summary>
                         <ul className="help-options-list">
                            <li><strong>Hệ thống Chiến đấu Kép:</strong> Tự do lựa chọn giữa chế độ chiến đấu tường thuật (nhập vai) hoặc chuyển sang giao diện chiến đấu theo lượt (chiến thuật) đầy thử thách.</li>
                             <li><strong>Hệ thống Đấu giá:</strong> Tham gia các phiên đấu giá, cạnh tranh với các NPC khác để sở hữu những vật phẩm quý hiếm hoặc bán đi những món đồ của bạn để làm giàu.</li>
                             <li><strong>Tạo & Sửa ảnh bằng AI:</strong> Minh họa các cảnh truyện hoặc tạo ảnh đại diện cho nhân vật. Đặc biệt, bạn có thể dùng AI để chỉnh sửa một bức ảnh đã có theo ý muốn (ví dụ: "thêm một vết sẹo", "thay đổi màu tóc").</li>
                             <li><strong>Suy luận Tiên đoán:</strong> Khi bật, AI sẽ chạy trước một lượt chơi giả định trong nền. Nếu bạn chọn đúng hành động được dự đoán (nút phát sáng), kết quả sẽ hiện ra tức thì, loại bỏ hoàn toàn thời gian chờ.</li>
                        </ul>
                    </details>
                    
                    <details className="help-section">
                        <summary>Tùy Chỉnh Trải Nghiệm</summary>
                        <p>Bảng Cài đặt (,) cho phép bạn tùy chỉnh sâu sắc mọi khía cạnh của trò chơi, từ giao diện, font chữ, màu sắc đến các cài đặt cốt lõi của AI như:</p>
                         <ul className="help-options-list">
                            <li><strong>Chế độ Xử lý AI:</strong> Lựa chọn giữa tốc độ phản hồi nhanh hoặc chất lượng câu chuyện sâu sắc hơn.</li>
                            <li><strong>Phong cách Chơi:</strong> "Theo lượt" truyền thống hoặc "Tiểu thuyết Liên tục" để AI tự động viết tiếp câu chuyện.</li>
                             <li><strong>Giọng đọc AI (TTS):</strong> Bật tính năng đọc truyện tự động và chọn giọng đọc phù hợp.</li>
                             <li><strong>Tùy chỉnh Giao diện:</strong> Ẩn/hiện các nút trên giao diện để tạo ra một không gian chơi game gọn gàng theo ý thích của bạn.</li>
                        </ul>
                    </details>
                </div>
            </div>
        </div>
    );
};