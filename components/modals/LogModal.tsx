/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState } from 'react';
import { useLogs } from '../contexts/LogContext';

interface LogModalProps {
    onClose: () => void;
}

// Helper to format error objects for display in JSON.
const formatErrorForDisplay = (error: any): string => {
    // A replacer function to handle circular references in complex objects
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
        // Create a plain object from the Error object to ensure all properties are serialized
        const plainObject: { [key: string]: any } = {
            name: error.name,
            message: error.message,
            stack: error.stack,
        };
        // Add any other custom properties the error might have
        Object.keys(error).forEach(key => {
            plainObject[key] = (error as any)[key];
        });
        return JSON.stringify(plainObject, getCircularReplacer(), 2);
    }
    
    // For non-Error objects, stringify as is, handling circular refs
    return JSON.stringify(error, getCircularReplacer(), 2);
};

export const LogModal = ({ onClose }: LogModalProps) => {
    const { logs, clearLogs } = useLogs();
    const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

    const handleToggleExpand = (logId: string) => {
        setExpandedLogId(prevId => (prevId === logId ? null : logId));
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content log-modal-content" onClick={e => e.stopPropagation()}>
                <header className="modal-header">
                    <h3>Nhật ký Thông báo & Lỗi</h3>
                    <div className="log-header-actions">
                        <button onClick={clearLogs} className="log-action-button" disabled={logs.length === 0}>
                            Xóa Nhật ký
                        </button>
                    </div>
                    <button onClick={onClose} className="modal-close-button" aria-label="Đóng">×</button>
                </header>
                <div className="modal-body log-modal-body">
                    {logs.length === 0 ? (
                        <p className="no-logs-message">Chưa có thông báo nào được ghi lại.</p>
                    ) : (
                        <ul className="log-list">
                            {logs.map(log => {
                                const isExpanded = expandedLogId === log.id;
                                return (
                                    <li
                                        key={log.id}
                                        className={`log-item log-type-${log.type} ${isExpanded ? 'expanded' : ''}`}
                                        onClick={log.details ? () => handleToggleExpand(log.id) : undefined}
                                        title={log.details ? "Nhấp để xem chi tiết" : ""}
                                    >
                                        <div className="log-item-header">
                                            <span className={`log-item-type-badge type-${log.type}`}>{log.type}</span>
                                            <span className="log-item-timestamp">
                                                {log.timestamp.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                            </span>
                                        </div>
                                        <p className="log-item-message">{log.message}</p>
                                        {isExpanded && log.details && (
                                            <div className="log-item-details">
                                                <pre>{formatErrorForDisplay(log.details)}</pre>
                                            </div>
                                        )}
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
};