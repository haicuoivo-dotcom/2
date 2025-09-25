/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import './MainMenu.css';

interface MainMenuProps {
    onNavigate: (view: string) => void;
    onQuickPlay: () => void;
    hasSaves: boolean;
    areSavesLoading: boolean;
    onOpenApiKeyModal: () => void;
    onOpenSettingsModal: () => void;
    onOpenAboutModal: () => void;
    apiStatus: string;
    hasApiKey: boolean;
}

export const MainMenu = ({ onNavigate, onQuickPlay, hasSaves, areSavesLoading, onOpenApiKeyModal, onOpenSettingsModal, onOpenAboutModal, apiStatus, hasApiKey }: MainMenuProps) => (
        <div className="main-menu-wrapper">
            <div className="card" aria-labelledby="menu-title">
    <h1 className="title" id="menu-title">Hãy 'Bắn'<br />Theo Cách Của Bạn</h1>
    <nav className="menu" aria-label="Main Menu">
            <button 
                className="menu-button button-play-now" 
                onClick={onQuickPlay}
                disabled={areSavesLoading || !hasApiKey || !hasSaves}
                title={!hasApiKey ? "Vui lòng thiết lập API Key trước" : !hasSaves ? "Không có tệp lưu nào để chơi" : "Chơi ngay với tệp lưu gần nhất."}
            >
                {areSavesLoading ? (
                    <><span className="spinner spinner-sm"></span> Đang kiểm tra...</>
                ) : (
                    'Chơi Ngay'
                )}
            </button>
            <button 
                className="menu-button button-create" 
                onClick={() => onNavigate('create')} 
                disabled={!hasApiKey}
                title={!hasApiKey ? "Vui lòng thiết lập API Key trước" : "Bắt đầu một cuộc phiêu lưu mới bằng cách kiến tạo thế giới của riêng bạn."}
            >
                Tạo Thế Giới Mới
            </button>
            <button 
                className="menu-button button-load" 
                onClick={() => onNavigate('load')} 
                disabled={areSavesLoading || !hasApiKey}
                title={!hasApiKey ? "Vui lòng thiết lập API Key trước" : "Tải một trò chơi đã lưu trước đó hoặc quản lý các tệp lưu của bạn."}
            >
                {areSavesLoading ? (
                    <><span className="spinner spinner-sm"></span> Đang kiểm tra...</>
                ) : (
                    'Quản Lý & Tải Game'
                )}
            </button>
            <button className="menu-button button-about" onClick={onOpenAboutModal} title="Tìm hiểu về các tính năng và cơ chế của trò chơi.">Giới thiệu</button>
            <button className="menu-button button-settings" onClick={onOpenSettingsModal} title="Tùy chỉnh trải nghiệm chơi game, giao diện và các cài đặt AI.">Cài Đặt</button>
            <button 
                className={`menu-button button-api-keys ${!hasApiKey ? 'needs-setup' : ''}`} 
                onClick={onOpenApiKeyModal} 
                title="Thiết lập hoặc cập nhật các khóa API cần thiết để trò chơi hoạt động."
            >
                {hasApiKey ? 'Quản lý API Key' : 'Thiết lập API Key'}
            </button>
        </nav>
                <p className="api-status">{apiStatus}</p>
            </div>
        </div>
);