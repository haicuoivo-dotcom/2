/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import './ErrorDetailModal.css';

interface ErrorDetailModalProps {
  details: { error: any; history: string[] };
  onClose: () => void;
  onRetry: () => void;
  onOptimizedRetry: () => void;
}

const formatErrorForDisplay = (error: any): string => {
    const getCircularReplacer = () => {
        const seen = new WeakSet();
        return (key: string, value: any) => {
            if (typeof value === "object" && value !== null) {
                if (seen.has(value)) {
                    return "[Circular Reference]";
                }
                seen.add(value);
            }
            return value;
        };
    };

    if (error instanceof Error) {
        const plainObject: { [key: string]: any } = {
            name: error.name,
            message: error.message,
            stack: error.stack,
        };
        Object.keys(error).forEach(key => {
            plainObject[key] = (error as any)[key];
        });
        return JSON.stringify(plainObject, getCircularReplacer(), 2);
    }
    
    return JSON.stringify(error, getCircularReplacer(), 2);
};

export const ErrorDetailModal = ({ details, onClose, onRetry, onOptimizedRetry }: ErrorDetailModalProps) => {
    const [isTechDetailsOpen, setIsTechDetailsOpen] = useState(false);

    const headerContent = <h3>Lỗi Xử lý Lượt chơi</h3>;

    const footerContent = (
        <>
            <button className="confirmation-button cancel" onClick={onClose}>Đóng</button>
            <button className="confirmation-button" onClick={onRetry}>Thử lại Lượt</button>
            <button className="confirmation-button confirm-danger" onClick={onOptimizedRetry}>Tối ưu & Thử lại</button>
        </>
    );

    return (
        // FIX: Moved content inside Modal to provide 'children' prop.
        <Modal
            onClose={onClose}
            header={headerContent}
            footer={footerContent}
            overlayClassName="confirmation-overlay"
            className="error-detail-modal"
        >
            <div className="error-detail-body">
                <div className="error-icon">⚠️</div>
                <h4>Đã xảy ra lỗi không thể phục hồi</h4>
                <p>AI đã cố gắng xử lý yêu cầu của bạn nhiều lần nhưng không thành công. Bạn có thể thử lại, hoặc thử "Tối ưu & Thử lại" để AI tóm tắt bối cảnh trước khi thực hiện.</p>

                <div className="error-process-log">
                    <h5>Quá trình xử lý:</h5>
                    <ul className="log-list">
                        {details.history.map((entry, index) => (
                            <li key={index} className="log-entry">{entry}</li>
                        ))}
                         <li key="final-error" className="log-entry error">
                            <strong>Lỗi cuối cùng:</strong> {String(details.error)}
                        </li>
                    </ul>
                </div>

                <details className="tech-details-collapsible" onToggle={(e) => setIsTechDetailsOpen((e.target as any).open)}>
                    <summary>Chi tiết Kỹ thuật</summary>
                    <div className="tech-details-content">
                        <pre>{formatErrorForDisplay(details.error)}</pre>
                    </div>
                </details>
            </div>
        </Modal>
    );
};
