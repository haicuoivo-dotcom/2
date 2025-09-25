/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Modal } from '../ui/Modal';
import type { WorldHealingReport } from '../../types';
import './WorldHealingModal.css';

interface WorldHealingModalProps {
    onClose: () => void;
    onTriggerWorldHealing: (onProgressUpdate: (message: string) => void) => Promise<WorldHealingReport | null>;
}

export const WorldHealingModal = ({ onClose, onTriggerWorldHealing }: WorldHealingModalProps) => {
    const [status, setStatus] = useState<'idle' | 'processing' | 'complete'>('idle');
    const [report, setReport] = useState<WorldHealingReport | null>(null);
    const [processingStep, setProcessingStep] = useState('Đang khởi tạo...');
    const [elapsedTime, setElapsedTime] = useState(0);
    const timerRef = useRef<number | null>(null);

    useEffect(() => {
        if (status === 'processing') {
            setElapsedTime(0);
            timerRef.current = window.setInterval(() => {
                setElapsedTime(prev => prev + 1);
            }, 1000);
        } else {
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [status]);


    const handleStart = useCallback(async () => {
        setStatus('processing');
        setReport(null);
        
        const updateProgress = (message: string) => {
            setProcessingStep(message);
        };

        try {
            const resultReport = await onTriggerWorldHealing(updateProgress);
            if (resultReport) {
                setReport(resultReport);
            }
        } catch (error) {
            console.error("World healing trigger failed in modal:", error);
        } finally {
            setStatus('complete');
        }
    }, [onTriggerWorldHealing]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    };

    const renderContent = () => {
        switch (status) {
            case 'idle':
                return (
                    <div className="world-healing-state-container">
                        <div className="healing-icon">🩺</div>
                        <p className="healing-description">
                            Hệ thống sẽ thực hiện một cuộc "kiểm tra sức khỏe" toàn diện cho thế giới game của bạn. Nó sẽ rà soát dữ liệu, tìm kiếm các mâu thuẫn logic, các thông tin thiếu sót, và tự động sửa chữa chúng để đảm bảo tính nhất quán (không tốn API call).
                        </p>
                        <p className="field-hint">Ví dụ: sửa các mối quan hệ một chiều, thêm trạng thái "đã chết" cho nhân vật được mô tả là đã qua đời trong truyện, v.v.</p>
                    </div>
                );
            case 'processing':
                return (
                    <div className="world-healing-state-container">
                        <div className="spinner spinner-lg"></div>
                        <div className="processing-details">
                            <p className="healing-step">{processingStep}</p>
                            <p className="healing-timer">{formatTime(elapsedTime)}</p>
                        </div>
                    </div>
                );
            case 'complete':
                return (
                    <div className="world-healing-report-container">
                        {report ? (
                            <>
                                <div className="report-summary">
                                    <h4>✅ Đồng bộ Hoàn tất</h4>
                                    <p>{report.summary}</p>
                                </div>
                                <div className="report-details-grid">
                                    <div className="report-section">
                                        <h5 className="report-title">Vấn đề được Phát hiện</h5>
                                        {report.problems_found.length > 0 ? (
                                            <ul className="report-list">
                                                {report.problems_found.map((problem, index) => (
                                                    <li key={index} className="report-item problem">{problem}</li>
                                                ))}
                                            </ul>
                                        ) : <p className="no-issues-found">Không tìm thấy vấn đề nào.</p>}
                                    </div>
                                    <div className="report-section">
                                        <h5 className="report-title">Hành động đã Thực hiện</h5>
                                        {report.actions_taken.length > 0 ? (
                                            <ul className="report-list">
                                                {report.actions_taken.map((action, index) => (
                                                    <li key={index} className="report-item action">{action}</li>
                                                ))}
                                            </ul>
                                        ) : <p className="no-issues-found">Không có hành động nào được thực hiện.</p>}
                                    </div>
                                </div>
                            </>
                        ) : (
                             <div className="world-healing-state-container">
                                <p className="healing-description error">
                                    Đã xảy ra lỗi trong quá trình đồng bộ. Vui lòng thử lại.
                                </p>
                            </div>
                        )}
                    </div>
                );
        }
    };

    const renderFooter = () => {
        switch (status) {
            case 'idle':
                return (
                    <>
                        <button className="lore-button cancel" onClick={onClose}>Hủy</button>
                        <button className="lore-button save-apply" onClick={handleStart}>Bắt đầu Phân tích & Sửa lỗi</button>
                    </>
                );
            case 'processing':
                return <p className="field-hint">Vui lòng chờ...</p>;
            case 'complete':
                return <button className="lore-button save-apply" onClick={onClose}>Đã hiểu</button>;
        }
    };
    
    return (
        // FIX: Moved content inside Modal to provide 'children' prop.
        <Modal
            onClose={onClose}
            header={<h3>Đồng bộ & Sửa lỗi Thế giới (AI)</h3>}
            footer={renderFooter()}
            className="world-healing-modal"
        >
            {renderContent()}
        </Modal>
    );
};
