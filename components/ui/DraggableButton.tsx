/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useRef, useMemo } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { useGameEngineContext } from '../contexts/GameEngineContext';
import { useGameContext } from '../contexts/GameContext';
import { useSettings } from '../contexts/SettingsContext';
import { useDraggable } from '../../hooks/useDraggable';
import { ToggleRightIcon as ToggleIcon, UsersIcon, RefreshCwIcon as SyncIcon, RotateCcwIcon as UndoIcon, SmartphoneIcon as MobileIcon, ZapIcon, HelpCircleIcon as HelpIcon, FolderDownIcon as FolderIcon, PencilIcon, SwordIcon, GavelIcon, FileClockIcon, CombineIcon, Trash2Icon } from './Icons';
import './DraggableButton.css';
import { useModalManager } from '../../hooks/useModalManager';

interface DraggableButtonProps {
    modalManager: ReturnType<typeof useModalManager>;
    onTestCombat: () => void;
    onTestAuction: () => void;
}

const formatProcessingTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

const UnmemoizedDraggableButton = ({ modalManager, onTestCombat, onTestAuction }: DraggableButtonProps) => {
    const app = useAppContext();
    const gameEngine = useGameEngineContext();
    const { gameState } = useGameContext();
    const { settings, updateSetting } = useSettings();

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const buttonRef = useRef<HTMLButtonElement | null>(null) as React.RefObject<HTMLButtonElement>;
    const { position, isDragging, hasDragged, handleDragStart, getMenuPositionClass } = useDraggable(buttonRef);

    const handleButtonClick = () => {
        if (!hasDragged.current) {
            setIsMenuOpen(prev => !prev);
        }
    };
    
    const isProcessing = useMemo(() => gameEngine.isAITurnProcessing || gameEngine.isAnalyzing || gameEngine.isEnriching, [gameEngine.isAITurnProcessing, gameEngine.isAnalyzing, gameEngine.isEnriching]);

    const isHaremNotEmpty = (gameState?.character.harem?.length ?? 0) > 0;
    const hasMemoriesToSummarize = (gameState?.memories?.length ?? 0) > 25;

    return (
        <div
            className={`draggable-button-container ${isDragging ? 'dragging' : ''}`}
            style={{ top: `${position.y}px`, left: `${position.x}px` }}
        >
            <button
                ref={buttonRef}
                className="draggable-button"
                onMouseDown={(e) => handleDragStart(e.clientX, e.clientY)}
                onTouchStart={(e) => e.touches[0] && handleDragStart(e.touches[0].clientX, e.touches[0].clientY)}
                onClick={handleButtonClick}
                aria-label="Mở Bảng điều khiển AI"
                aria-haspopup="true"
                aria-expanded={isMenuOpen}
            >
                <div className="draggable-button-ring"></div>
            </button>

            {isMenuOpen && (
                <div className={`ai-action-menu ${getMenuPositionClass()}`}>
                    <button className="ai-menu-close-button" onClick={() => setIsMenuOpen(false)} aria-label="Đóng Menu">×</button>
                    <div className="ai-menu-actions-section">
                        {/* Quick Settings */}
                        <button onClick={() => updateSetting('enableCheats', !settings.enableCheats)} disabled={isProcessing} title="Bật/tắt chế độ cheat, khiến mọi hành động tùy chỉnh có 100% tỷ lệ thành công." className="ai-action-menu-item">
                            <span className="ai-action-icon"><ToggleIcon /></span>
                            <span className="ai-action-label">{`Cheat (${settings.enableCheats ? 'Bật' : 'Tắt'})`}</span>
                        </button>
                        <button onClick={() => updateSetting('mobileMode', settings.mobileMode === 'on' ? 'off' : 'on')} disabled={isProcessing} title="Bật/tắt giao diện di động, tối ưu cho màn hình nhỏ." className="ai-action-menu-item">
                            <span className="ai-action-icon"><MobileIcon /></span>
                            <span className="ai-action-label">{`Di động (${settings.mobileMode === 'on' ? 'Bật' : 'Tắt'})`}</span>
                        </button>
                        <button onClick={() => updateSetting('enablePerformanceEffects', !settings.enablePerformanceEffects)} disabled={isProcessing} title="Bật/tắt các hiệu ứng đồ họa để cải thiện hiệu năng trên máy yếu." className="ai-action-menu-item">
                            <span className="ai-action-icon"><ZapIcon /></span>
                            <span className="ai-action-label">{`Hiệu ứng (${settings.enablePerformanceEffects ? 'Bật' : 'Tắt'})`}</span>
                        </button>
                        <div className="ai-menu-separator"></div>
                        {/* AI Functions */}
                        <button onClick={gameEngine.updateCharactersWithAi} disabled={isProcessing} title="Chi phí: ~1 API call. Yêu cầu AI làm mới lại mô tả, tiểu sử của các nhân vật dựa trên diễn biến gần đây." className="ai-action-menu-item">
                            <span className="ai-action-icon"><SyncIcon /></span>
                            <span className="ai-action-label">{gameEngine.isEnriching ? `Đang cập nhật... (${formatProcessingTime(gameEngine.enrichmentTime)})` : "Cập nhật PC & NPC"}</span>
                        </button>
                        {isHaremNotEmpty && (
                            <button onClick={gameEngine.autoEquipHaremMembers} disabled={isProcessing} title="Tự động trang bị vật phẩm tốt nhất cho tất cả thành viên trong hậu cung." className="ai-action-menu-item">
                                <span className="ai-action-icon"><UsersIcon /></span>
                                <span className="ai-action-label">Trang bị Hậu cung</span>
                            </button>
                        )}
                        {hasMemoriesToSummarize && (
                            <button onClick={gameEngine.handleSummarizeMemories} disabled={isProcessing} title="Chi phí: ~1 API call. Tối ưu hóa bộ nhớ ngắn hạn của AI." className="ai-action-menu-item">
                                <span className="ai-action-icon"><CombineIcon /></span>
                                <span className="ai-action-label">{gameEngine.isEnriching ? `Đang tối ưu... (${formatProcessingTime(gameEngine.enrichmentTime)})` : "Tối ưu Ký ức"}</span>
                            </button>
                        )}
                        <div className="ai-menu-separator"></div>
                        {/* Tools & Debug */}
                        <button onClick={() => modalManager.openModal('dataCleanup')} disabled={isProcessing} title="Mở bảng điều khiển để dọn dẹp các vật phẩm, kỹ năng, và dữ liệu không cần thiết để tối ưu hóa game." className="ai-action-menu-item">
                            <span className="ai-action-icon"><Trash2Icon /></span>
                            <span className="ai-action-label">Dọn dẹp Dữ liệu</span>
                        </button>
                        <button onClick={() => modalManager.openModal('log')} disabled={isProcessing} title="Xem lại các thông báo và lỗi đã xuất hiện gần đây." className="ai-action-menu-item">
                            <span className="ai-action-icon"><FileClockIcon /></span>
                            <span className="ai-action-label">Nhật ký</span>
                        </button>
                        {settings.enableCheats && (
                            <>
                                <button onClick={onTestCombat} disabled={isProcessing} title="Bắt đầu một trận chiến thử nghiệm với một NPC ngẫu nhiên." className="ai-action-menu-item">
                                    <span className="ai-action-icon"><SwordIcon /></span>
                                    <span className="ai-action-label">Test Chiến đấu</span>
                                </button>
                                <button onClick={onTestAuction} disabled={isProcessing} title="Bắt đầu một phiên đấu giá thử nghiệm với một vật phẩm huyền thoại." className="ai-action-menu-item">
                                    <span className="ai-action-icon"><GavelIcon /></span>
                                    <span className="ai-action-label">Test Đấu giá</span>
                                </button>
                                <button onClick={app.resetApiRequestCount} disabled={isProcessing} title="Đặt lại bộ đếm API request về 0." className="ai-action-menu-item">
                                    <span className="ai-action-icon"><UndoIcon /></span>
                                    <span className="ai-action-label">Reset Request ({app.apiRequestCount})</span>
                                </button>
                            </>
                        )}
                        <div className="ai-menu-separator"></div>
                        {/* Management */}
                         <button onClick={() => app.handleOpenLoadGameModal()} disabled={isProcessing} title="Mở bảng quản lý và tải game." className="ai-action-menu-item">
                            <span className="ai-action-icon"><FolderIcon /></span>
                            <span className="ai-action-label">Tải Game</span>
                        </button>
                        <button onClick={() => modalManager.openModal('customizeUI')} disabled={isProcessing} title="Tùy chỉnh các nút hiển thị trên giao diện." className="ai-action-menu-item">
                            <span className="ai-action-icon"><PencilIcon /></span>
                            <span className="ai-action-label">Tùy chỉnh Giao diện</span>
                        </button>
                         <button onClick={() => modalManager.openModal('help')} disabled={isProcessing} title="Mở bảng hướng dẫn và phím tắt." className="ai-action-menu-item">
                            <span className="ai-action-icon"><HelpIcon /></span>
                            <span className="ai-action-label">Trợ giúp</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export const DraggableButton = React.memo(UnmemoizedDraggableButton);