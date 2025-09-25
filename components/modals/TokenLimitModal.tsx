/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import './TokenLimitModal.css';

interface TokenLimitModalProps {
    onRetry: () => Promise<void>;
    onClose: () => void;
}

export const TokenLimitModal = ({ onRetry, onClose }: TokenLimitModalProps) => {
    const [isProcessing, setIsProcessing] = useState(false);

    const handleRetryClick = async () => {
        setIsProcessing(true);
        await onRetry();
        // The modal will be closed by the parent component setting isTokenLimitError to false
    };

    const headerContent = <h3>Lỗi Giới hạn Bối cảnh</h3>;

    const footerContent = (
        <>
            <button className="confirmation-button cancel" onClick={onClose} disabled={isProcessing}>
                Tự sửa
            </button>
            <button className="confirmation-button confirm-danger" onClick={handleRetryClick} disabled={isProcessing}>
                {isProcessing ? (
                    <><span className="spinner spinner-sm"></span> Đang tối ưu...</>
                ) : 'Áp dụng Tối ưu & Thử lại'}
            </button>
        </>
    );

    return (
        // FIX: Moved content inside Modal to provide 'children' prop.
        <Modal
            onClose={() => !isProcessing && onClose()}
            header={headerContent}
            footer={footerContent}
            overlayClassName="confirmation-overlay"
            className="token-limit-modal"
        >
            <div className="token-limit-modal-body">
                <div className="token-limit-icon">🧠</div>
                <h4>Bối cảnh Truyện Quá Phức Tạp!</h4>
                <p>
                    Cuộc phiêu lưu của bạn đã trở nên rất chi tiết, khiến cho "bộ nhớ ngắn hạn" của AI bị quá tải. Điều này thường xảy ra trong các màn chơi dài hoặc khi có quá nhiều "Luật Lệ" đang hoạt động.
                </p>
                <div className="optimizer-box">
                    <h5>Giải pháp: AI Tối ưu Bối cảnh</h5>
                    <p>
                        Nhấn vào nút bên dưới, AI sẽ tự động thực hiện các biện pháp sau để đảm bảo lượt chơi tiếp theo thành công:
                    </p>
                    <ul>
                        <li><strong>Tóm tắt AI:</strong> Tóm tắt lại các chi tiết nền không quan trọng.</li>
                        <li><strong>Tắt Tạm thời Luật Lệ:</strong> Vô hiệu hóa tạm thời các "Luật Lệ" của bạn.</li>
                        <li><strong>Rút gọn Lịch sử:</strong> Chỉ tập trung vào diễn biến gần nhất.</li>
                    </ul>
                    <p className="field-hint">
                        Các thay đổi này chỉ áp dụng cho lượt thử lại. Cài đặt và luật lệ của bạn sẽ được khôi phục bình thường sau đó.
                    </p>
                </div>
            </div>
        </Modal>
    );
};
