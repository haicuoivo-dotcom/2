/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { useApiKeyManager } from '../../hooks/useApiKeyManager';
import { Modal } from '../ui/Modal';
import './ApiKeyModal.css';
import './modals.css';

const EyeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
        <circle cx="12" cy="12" r="3"></circle>
    </svg>
);

const EyeOffIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07L3 3"></path>
    </svg>
);


interface ApiKeyModalProps {
    onClose: () => void;
    onKeysUpdated: () => void;
}

export const ApiKeyModal = ({ onClose, onKeysUpdated }: ApiKeyModalProps) => {
    const {
        activeTab,
        setActiveTab,
        geminiKeys,
        openRouterKeys,
        isChecking,
        systemApiKeyStatus,
        isCheckingSystemKey,
        statusMessages,
        checkSystemKey,
        handleKeyChange,
        handlePaste,
        handleAddKey,
        handleDeleteKey,
        handleToggleVisibility,
        handleCheckKeys,
        handleSave,
    } = useApiKeyManager({ onClose, onKeysUpdated });


    const renderKeyList = (provider: 'gemini' | 'openrouter') => {
        const [keys, title] = provider === 'gemini'
            ? [geminiKeys, "DANH SÁCH KHÓA API GEMINI CỦA BẠN"]
            : [openRouterKeys, "DANH SÁCH KHÓA API OPENROUTER CỦA BẠN"];
        
        return (
            <div className="api-key-section">
                <h5 className="api-key-section-title">{title}</h5>
                <div className="api-key-list">
                    {keys.map((item, index) => (
                        <div key={item.id} className="api-key-list-item">
                            <span className="api-key-index">{index + 1}.</span>
                            <div className="api-key-input-wrapper">
                                <input
                                    type={item.isVisible ? "text" : "password"}
                                    className="api-key-input"
                                    value={item.key}
                                    placeholder="Dán API Key của bạn tại đây..."
                                    onChange={(e) => handleKeyChange(index, e.target.value, provider)}
                                    onPaste={(e) => handlePaste(e, index, provider)}
                                    disabled={isChecking}
                                />
                                <button className="api-key-visibility-btn" onClick={() => handleToggleVisibility(item.id, provider)} disabled={isChecking} title="Hiện/Ẩn khóa API">
                                    {item.isVisible ? <EyeOffIcon /> : <EyeIcon />}
                                </button>
                            </div>
                            <div className="api-key-status-wrapper">
                                <div className={`api-key-status-indicator ${item.status}`}></div>
                                <span className={`api-key-status-message ${item.status}`}>
                                    {statusMessages[item.status]}
                                </span>
                            </div>
                            <button className="api-key-delete-btn" onClick={() => handleDeleteKey(item.id, provider)} disabled={isChecking} title="Xóa khóa API này">×</button>
                        </div>
                    ))}
                </div>
                 <p className="api-key-paste-tip">
                    Mẹo: Bạn có thể dán nhiều khóa cùng lúc (phân tách bằng dấu phẩy, dấu cách hoặc xuống dòng).
                </p>
                <button className="api-key-add-btn" onClick={() => handleAddKey(provider)} disabled={isChecking}>
                    + Thêm khóa API
                </button>
            </div>
        );
    };

    const footerContent = (
        <>
            {activeTab === 'gemini' ? (
                <button className="api-key-check-btn" onClick={() => handleCheckKeys('gemini')} disabled={isChecking}>
                    {isChecking ? <><span className="spinner spinner-sm"></span> Đang kiểm tra...</> : 'Kiểm tra khóa Gemini'}
                </button>
            ) : activeTab === 'openrouter' ? (
                    <button className="api-key-check-btn" onClick={() => handleCheckKeys('openrouter')} disabled={isChecking}>
                    {isChecking ? <><span className="spinner spinner-sm"></span> Đang kiểm tra...</> : 'Kiểm tra khóa OpenRouter'}
                </button>
            ) : ( <div></div> /* Placeholder for system tab */ )}
            <button className="api-key-close-btn" onClick={handleSave} disabled={isChecking}>Lưu & Đóng</button>
        </>
    );

    return (
        // FIX: Moved content inside Modal to provide 'children' prop.
        <Modal
            onClose={handleSave}
            header={<h3>Thiết lập API Key</h3>}
            footer={footerContent}
            className="api-key-modal"
        >
            <>
                <div className="modal-tabs api-key-tabs">
                    <button className={`modal-tab-button ${activeTab === 'gemini' ? 'active' : ''}`} onClick={() => setActiveTab('gemini')}>Google Gemini</button>
                    <button className={`modal-tab-button ${activeTab === 'openrouter' ? 'active' : ''}`} onClick={() => setActiveTab('openrouter')}>OpenRouter</button>
                    <button className={`modal-tab-button ${activeTab === 'system' ? 'active' : ''}`} onClick={() => setActiveTab('system')}>API Key Hệ Thống</button>
                </div>

                <div className={`api-key-tab-content ${activeTab === 'system' ? 'active' : ''}`}>
                    <div className="api-key-guide">
                        <h5>API Key Mặc định của Hệ thống</h5>
                        <p>Ứng dụng này có thể đã được cấu hình sẵn với một API Key của hệ thống để bạn có thể sử dụng ngay lập tức.</p>
                        <p>Bạn không cần phải thêm API key của riêng mình nếu key hệ thống đang hoạt động bình thường.</p>
                        <p className="field-hint" style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                            <strong>Lưu ý:</strong> Tab 'Google Gemini' và 'OpenRouter' dành cho những người dùng muốn chạy ứng dụng trên máy của mình hoặc sử dụng API key cá nhân.
                        </p>
                    </div>
                    <div className="api-key-section">
                        <h5 className="api-key-section-title">TRẠNG THÁI KEY HỆ THỐNG</h5>
                        <div className="system-key-display">
                            <div className="api-key-status-wrapper">
                                <div className={`api-key-status-indicator ${systemApiKeyStatus}`}>
                                    {systemApiKeyStatus === 'checking' && <div className="spinner spinner-sm"></div>}
                                </div>
                                <span className={`api-key-status-message ${systemApiKeyStatus}`}>
                                    {statusMessages[systemApiKeyStatus]}
                                </span>
                            </div>
                            <button className="api-key-check-btn" onClick={checkSystemKey} disabled={isCheckingSystemKey}>
                                {isCheckingSystemKey ? <><span className="spinner spinner-sm"></span> Đang kiểm tra...</> : 'Kiểm tra lại'}
                            </button>
                        </div>
                    </div>
                </div>
                <div className={`api-key-tab-content ${activeTab === 'gemini' ? 'active' : ''}`}>
                    <div className="api-key-guide">
                        <h5>Cách Lấy API Key Miễn Phí của Google Gemini</h5>
                        <ol>
                            <li>Truy cập <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer">Google AI Studio</a> và đăng nhập.</li>
                            <li>Nhấn vào "Create API key" và sao chép khóa vừa tạo.</li>
                            <li>Dán khóa vào ô bên dưới. Bạn có thể thêm nhiều khóa để dự phòng.</li>
                        </ol>
                        <p className="field-hint" style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                            <strong>Lưu ý:</strong> Trò chơi này yêu cầu API Key của Google Gemini để hoạt động.
                        </p>
                    </div>
                    {renderKeyList('gemini')}
                </div>
                
                <div className={`api-key-tab-content ${activeTab === 'openrouter' ? 'active' : ''}`}>
                        <div className="api-key-guide">
                            <h5>Cách Lấy API Key của OpenRouter</h5>
                            <ol>
                            <li>Truy cập <a href="https://openrouter.ai/keys" target="_blank" rel="noopener noreferrer">OpenRouter.ai</a> và đăng nhập.</li>
                            <li>Nạp một ít tín dụng nếu cần, vì nhiều mô hình yêu cầu trả phí.</li>
                            <li>Nhấn "Create Key", sao chép khóa và dán vào ô bên dưới.</li>
                            </ol>
                            <p className="field-hint" style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                            <strong>Lưu ý:</strong> Key này dùng cho các tính năng tạo ảnh thông qua OpenRouter. Key có dạng sk-or-xxxxxxxx.
                        </p>
                        </div>
                        {renderKeyList('openrouter')}
                </div>
            </>
        </Modal>
    );
};
