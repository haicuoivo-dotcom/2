/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { diagnoseError, attemptRecovery, GameError, ErrorType } from '../../utils/error';
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
        return (_key: string, value: any) => {
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
            ...(error instanceof GameError ? { context: error.context } : {})
        };
        Object.keys(error).forEach(key => {
            plainObject[key] = (error as any)[key];
        });
        return JSON.stringify(plainObject, getCircularReplacer(), 2);
    }
    
    return JSON.stringify(error, getCircularReplacer(), 2);
};

export const ErrorDetailModal = ({ details, onClose, onRetry, onOptimizedRetry }: ErrorDetailModalProps) => {
    const [isRecovering, setIsRecovering] = useState(false);
    const [diagnosticReport, setDiagnosticReport] = useState<ReturnType<typeof diagnoseError> | null>(null);

    useEffect(() => {
        const error = details.error instanceof Error ? details.error : new Error(String(details.error));
        const gameError = error instanceof GameError ? error : new GameError(
            error.message,
            ErrorType.UNKNOWN,
            {
                componentStack: error.stack,
                requestData: details.history.length > 0 ? { history: details.history } : undefined
            }
        );
        const report = diagnoseError(gameError);
        setDiagnosticReport(report);
    }, [details]);

    const handleRetry = async () => {
        if (!details.error || !diagnosticReport) return;

        setIsRecovering(true);
        const gameError = diagnosticReport.error instanceof GameError 
            ? diagnosticReport.error 
            : new GameError(diagnosticReport.error.message, ErrorType.UNKNOWN);

        const recoverySuccessful = await attemptRecovery(gameError);
        setIsRecovering(false);

        if (recoverySuccessful) {
            onRetry();
        } else {
            // Nếu không thể tự phục hồi, thử tối ưu
            onOptimizedRetry();
        }
    };

    const headerContent = <h3>Lỗi Xử lý Lượt chơi</h3>;

    const footerContent = (
        <>
            <button className="confirmation-button cancel" onClick={onClose}>Đóng</button>
            <button 
                className="confirmation-button" 
                onClick={handleRetry} 
                disabled={isRecovering}
            >
                {isRecovering ? 'Đang thử phục hồi...' : 'Thử phục hồi & Thử lại'}
            </button>
            <button 
                className="confirmation-button confirm-danger" 
                onClick={onOptimizedRetry}
                disabled={isRecovering}
            >
                Tối ưu & Thử lại
            </button>
        </>
    );

    return (
        <Modal
            onClose={onClose}
            header={headerContent}
            footer={footerContent}
            overlayClassName="confirmation-overlay"
            className="error-detail-modal"
        >
            <div className="error-detail-body">
                <div className="error-icon">⚠️</div>
                <h4>Đã xảy ra lỗi{diagnosticReport && ` - ${diagnosticReport.context.type}`}</h4>
                
                <p>AI đã cố gắng xử lý yêu cầu của bạn nhiều lần nhưng không thành công. Bạn có thể:</p>
                
                {diagnosticReport && (
                    <ul className="suggestions-list">
                        {diagnosticReport.suggestions.map((suggestion, index) => (
                            <li key={index}>{suggestion}</li>
                        ))}
                    </ul>
                )}

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

                <details className="tech-details-collapsible">
                    <summary>Chi tiết Kỹ thuật</summary>
                    <div className="tech-details-content">
                        <pre>{formatErrorForDisplay(details.error)}</pre>
                        {diagnosticReport && (
                            <div className="diagnostic-info">
                                <h6>Thông tin Chẩn đoán:</h6>
                                <pre>{JSON.stringify(diagnosticReport.context, null, 2)}</pre>
                            </div>
                        )}
                    </div>
                </details>
            </div>
        </Modal>
    );
};
