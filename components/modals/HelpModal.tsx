

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import './HelpModal.css';

interface HelpModalProps {
    onClose: () => void;
}

export const HelpModal = ({ onClose }: HelpModalProps) => {
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content help-modal-content" onClick={e => e.stopPropagation()}>
                <header className="modal-header">
                    <h3>Hướng Dẫn & Trợ Giúp</h3>
                    <button onClick={onClose} className="modal-close-button" aria-label="Đóng">×</button>
                </header>
                <div className="modal-body">
                    <details className="help-section" open>
                        <summary>Lối chơi Cơ bản</summary>
                        <p>
                            Chào mừng bạn đến với thế giới nhập vai được vận hành bởi AI! Lối chơi rất đơn giản:
                        </p>
                        <ul className="help-options-list">
                            <li><strong>Đọc Diễn biến:</strong> AI sẽ tường thuật câu chuyện và các sự kiện xảy ra xung quanh bạn.</li>
                            <li><strong>Chọn Hành động:</strong> Dựa trên tình hình, AI sẽ đề xuất 4 hành động gợi ý. Bạn có thể chọn một trong số đó.</li>
                            <li><strong>Hành động Tùy chỉnh:</strong> Hoặc, bạn có thể nhập hành động của riêng mình vào ô văn bản và nhấn "Gửi". Bạn cũng có thể nhấn "Phân tích" để AI đánh giá rủi ro và lợi ích trước khi thực hiện.</li>
                            <li><strong>Khám phá:</strong> Tương tác với thế giới, nhân vật (NPC), và vật phẩm bằng cách nhấp vào các từ được tô sáng trong văn bản.</li>
                        </ul>
                    </details>
                    
                    <details className="help-section">
                        <summary>Các Chế độ & Cài đặt Quan trọng</summary>
                        <p>Bạn có thể tùy chỉnh sâu trải nghiệm của mình trong bảng Cài đặt:</p>
                        <ul className="help-options-list">
                             <li>
                                <strong>Chế độ Xử lý AI:</strong> Điều chỉnh sự cân bằng giữa chất lượng câu chuyện và tốc độ phản hồi.
                                <ul>
                                    <li><strong>Tốc độ:</strong> Phản hồi nhanh, câu chuyện đơn giản hơn.</li>
                                    <li><strong>Chất lượng:</strong> Phản hồi chậm hơn, nhưng AI sẽ tư duy sâu hơn để tạo ra các tình tiết logic và phức tạp.</li>
                                    <li><strong>Tự động (Khuyến nghị):</strong> AI tự cân bằng giữa tốc độ và chất lượng tùy theo tình huống.</li>
                                </ul>
                            </li>
                             <li>
                                <strong>Phong cách Chơi:</strong>
                                <ul>
                                    <li><strong>Theo lượt (Mặc định):</strong> Sau hành động của bạn, AI sẽ dừng lại và chờ bạn ra lệnh tiếp.</li>
                                    <li><strong>Tiểu thuyết Liên tục:</strong> AI sẽ tự động viết tiếp 1-2 phân cảnh nữa sau hành động của bạn, tạo ra một chuỗi diễn biến dài và liền mạch hơn.</li>
                                </ul>
                            </li>
                            <li><strong>Thế Giới Tự Chữa Lành:</strong> Khi được bật, thế giới sẽ không còn "đứng yên". Cứ sau 20 lượt, AI sẽ chạy ngầm để sửa các lỗi logic và mô phỏng sự phát triển của các NPC, khiến họ theo đuổi mục tiêu riêng và phản ứng với các sự kiện đã xảy ra.</li>
                        </ul>
                    </details>
                    
                    <details className="help-section">
                        <summary>Hệ thống Chiến đấu</summary>
                        <p>Khi một cuộc chiến nổ ra, bạn sẽ có các lựa chọn sau:</p>
                        <ul className="help-options-list">
                            <li><strong>Tiếp tục Tường thuật:</strong> AI sẽ tiếp tục kể chuyện về trận chiến theo lối văn xuôi. Bạn sẽ ra lệnh bằng cách mô tả hành động ("Tôi vung kiếm chém vào chân nó"). Phù hợp cho những ai thích nhập vai.</li>
                            <li><strong>Chiến đấu theo lượt:</strong> Chuyển sang một giao diện chiến đấu chiến thuật. Các nhân vật sẽ hành động theo lượt dựa trên chỉ số Tốc độ. Bạn sẽ chọn kỹ năng và mục tiêu cụ thể.</li>
                             <li><strong>Tạm Dừng (Chỉ trong chiến đấu):</strong> Bất cứ lúc nào trong trận đấu, bạn có thể nhấn <kbd>Space</kbd> hoặc nút "Tạm Dừng" để mở menu. Tại đây bạn có thể kiểm tra nhân vật, cài đặt, hoặc "Đầu Hàng" để kết thúc trận chiến.</li>
                        </ul>
                    </details>

                    <details className="help-section">
                        <summary>Công cụ Tùy chỉnh & Kiểm soát</summary>
                        <p>Bạn có toàn quyền kiểm soát thế giới của mình thông qua các công cụ mạnh mẽ sau:</p>
                        <ul className="help-options-list">
                             <li>
                                <strong>Luật Lệ (L):</strong> Đây là công cụ quyền lực nhất để "dạy" AI. Hãy thêm các quy tắc rõ ràng để định hình thế giới. Ví dụ:
                                <ul>
                                    <li>"Tạo ra một thanh kiếm tên là 'Hỏa Long Kiếm' có khả năng phun lửa."</li>
                                    <li>"KHÓA HÀNH ĐỘNG TÙY Ý: Nhân vật chính không thể chủ động tấn công người vô tội."</li>
                                </ul>
                            </li>
                            <li>
                                <strong>Ghim Ký ức (M):</strong> "Dòng Chảy Sự Kiện" là bộ nhớ ngắn hạn của AI. Nếu có một sự kiện bạn cho là rất quan trọng và muốn AI luôn ghi nhớ, hãy "Ghim" nó lại.
                            </li>
                             <li><strong>Bảng điều khiển AI (Nút tròn):</strong> Nút tròn trôi nổi trên màn hình cho phép bạn truy cập nhanh các công cụ mạnh mẽ như bật/tắt cheat, tự động trang bị, hoặc yêu cầu AI làm giàu thêm cho thế giới.</li>
                        </ul>
                    </details>
                    
                    <details className="help-section">
                        <summary>Phím tắt</summary>
                        <div className="shortcuts-grid">
                            <div className="shortcut-item"><kbd>C</kbd><span>Mở bảng Nhân vật</span></div>
                            <div className="shortcut-item"><kbd>M</kbd><span>Mở Dòng Chảy Sự Kiện (Ký ức)</span></div>
                            <div className="shortcut-item"><kbd>K</kbd><span>Mở Tri Thức Thế Giới</span></div>
                            <div className="shortcut-item"><kbd>B</kbd><span>Mở Bản Đồ 2D</span></div>
                            <div className="shortcut-item"><kbd>G</kbd><span>Mở Thư Viện Ảnh</span></div>
                            <div className="shortcut-item"><kbd>L</kbd><span>Mở Luật Lệ</span></div>
                            <div className="shortcut-item"><kbd>H</kbd><span>Mở Lịch Sử Lượt Chơi</span></div>
                            <div className="shortcut-item"><kbd>,</kbd><span>Mở Cài Đặt</span></div>
                            <div className="shortcut-item"><kbd>?</kbd><span>Mở bảng Trợ giúp này</span></div>
                            <div className="shortcut-item"><kbd>Ctrl</kbd> + <kbd>S</kbd><span>Lưu game ra tệp</span></div>
                            <div className="shortcut-item"><kbd>Ctrl</kbd> + <kbd>Z</kbd><span>Quay lại lượt trước</span></div>
                            <div className="shortcut-item"><kbd>Space</kbd> / <kbd>Esc</kbd><span>Tạm dừng (trong chiến đấu)</span></div>
                        </div>
                    </details>
                </div>
            </div>
        </div>
    );
};