/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { Modal } from '../ui/Modal';
import type { SupplementReport } from '../../types';
import './SupplementReportModal.css';

interface SupplementReportModalProps {
    report: SupplementReport | null;
    onClose: () => void;
}

export const SupplementReportModal = ({ report, onClose }: SupplementReportModalProps) => {
    if (!report) return null;

    return (
        // FIX: Moved content inside Modal to provide 'children' prop.
        <Modal
            onClose={onClose}
            header={<h3>Báo cáo Bổ sung Dữ liệu</h3>}
            footer={<button className="lore-button save-apply" onClick={onClose}>Đã hiểu</button>}
            className="world-healing-modal" // Re-use styling
        >
            <div className="world-healing-report-container">
                <div className="report-summary">
                    <h4>✅ Hoàn tất</h4>
                    <p>{report.summary}</p>
                </div>
                <div className="report-details-grid" style={{gridTemplateColumns: '1fr'}}>
                    <div className="report-section">
                        <h5 className="report-title">Hành động đã Thực hiện</h5>
                        {report.actionsTaken.length > 0 ? (
                            <ul className="report-list">
                                {report.actionsTaken.map((action, index) => (
                                    <li key={index} className="report-item action">{action}</li>
                                ))}
                            </ul>
                        ) : <p className="no-issues-found">Không có hành động nào được thực hiện.</p>}
                    </div>
                </div>
            </div>
        </Modal>
    );
};
