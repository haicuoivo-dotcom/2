/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useMemo } from 'react';
import { useSettings } from '../contexts/SettingsContext';
import { useTTS } from '../contexts/TTSContext';
import { useGameContext } from '../contexts/GameContext';
import { useGameEngineContext } from '../contexts/GameEngineContext';
import { useAppContext } from '../contexts/AppContext';
import { SettingsIcon, SaveIcon } from '../ui/Icons';
import type { GameTime } from '../../types';

interface GameHeaderProps {
    isHeaderCollapsed: boolean;
    onToggleCollapse: () => void;
    onDesktopNavClick: (label: string) => void;
    onMobileNavOpen: () => void;
    onRevertToPreviousTurn: () => void;
}

// FIX: Define the missing MAIN_NAV_ITEMS constant.
const MAIN_NAV_ITEMS = [
    { id: 'header_character', label: "Nhân Vật", hotkey: "C" },
    { id: 'header_harem', label: "Hậu Cung", hotkey: "P", requiresHarem: true },
    { id: 'header_memory', label: "Dòng Chảy Sự Kiện", hotkey: "M" },
    { id: 'header_knowledge', label: "Tri Thức", hotkey: "K" },
    { id: 'header_map', label: "Bản Đồ", hotkey: "B" },
    { id: 'header_crafting', label: "Chế Tạo", hotkey: "I" },
    { id: 'header_gallery', label: "Thư Viện", hotkey: "G" },
    { id: 'header_lore', label: "Luật Lệ", hotkey: "L" },
    { id: 'header_history', label: "Lịch Sử", requiresHistory: true, hotkey: "H" },
];

const formatGameTimeOnly = (time?: GameTime) => {
    if (!time) return '';
    const { year, month, day, hour, minute } = time;
    const paddedHour = String(hour).padStart(2, '0');
    const paddedMinute = String(minute).padStart(2, '0');
    return `Ngày ${day}-${month}-${year}, ${paddedHour}:${paddedMinute}`;
};

const SpeakerOnIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path></svg>;
const PauseTTSIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>;
const PlayTTSIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>;


export const GameHeader = React.memo(({
    isHeaderCollapsed,
    onToggleCollapse,
    onDesktopNavClick,
    onMobileNavOpen,
    onRevertToPreviousTurn,
}: GameHeaderProps) => {
    const { settings } = useSettings();
    const { gameState } = useGameContext();
    const { apiRequestCount } = useAppContext();
    const gameEngine = useGameEngineContext();
    
    const { visibleButtons } = settings;
    const tts = useTTS();
    
    const formattedTimeOnly = useMemo(() => {
        if (!gameState.gameTime) return '';
        return formatGameTimeOnly(gameState.gameTime);
    }, [gameState.gameTime]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    };

    const handleTTSToggle = () => {
        if (tts.isSpeaking) tts.pause();
        else if (tts.isPaused) tts.resume();
        else tts.cancel(); // If idle, stop any queued items
    };

    const getTTSButton = () => {
        if (!settings.enableTTS) return null;

        let icon = <SpeakerOnIcon />;
        let title = 'Dừng giọng đọc';
        if (tts.isSpeaking) {
            icon = <PauseTTSIcon />;
            title = 'Tạm dừng giọng đọc';
        } else if (tts.isPaused) {
            icon = <PlayTTSIcon />;
            title = 'Tiếp tục giọng đọc';
        }

        return (
            <button
                onClick={handleTTSToggle}
                className="nav-button tts-control-button"
                title={title}
                disabled={gameEngine.isAITurnProcessing}
            >
                {icon}
            </button>
        );
    };
    
    const turnCount = gameState.turns?.length || 0;
    const totalTokenCount = gameState.totalTokenCount || 0;
    const latestTurn = gameState.turns?.[gameState.turns.length - 1];
    const latestTurnTokens = latestTurn?.tokenCount || 0;
    const latestTurnApiRequests = latestTurn?.apiRequestCount || 0;
    
    const navItems = useMemo(() => MAIN_NAV_ITEMS.filter(item => item.id !== 'header_history'), []);
    const historyItem = useMemo(() => MAIN_NAV_ITEMS.find(item => item.id === 'header_history'), []);

    return (
        <header className={`game-header ${isHeaderCollapsed ? 'collapsed' : ''}`}>
            <div className="game-header-left">
                <button 
                    className="nav-button mobile-hamburger-button" 
                    onClick={onMobileNavOpen} 
                    aria-label="Mở menu"
                    disabled={gameEngine.isAITurnProcessing}
                    title={gameEngine.isAITurnProcessing ? "AI đang xử lý..." : "Mở menu điều hướng"}
                >
                    ☰
                </button>
                <h1 className="game-title">{gameState.title}</h1>
                <div className="game-time-container" role="status" >
                    <div className="game-time-display">
                        {formattedTimeOnly && <span>{formattedTimeOnly}</span>}
                    </div>
                </div>
                {gameEngine.isEnriching && (
                    <div className="background-task-indicator" title="AI đang thực hiện tác vụ nền...">
                        <div className="spinner spinner-sm"></div>
                        <span>{gameEngine.processingStep} ({formatTime(gameEngine.enrichmentTime)})</span>
                    </div>
                )}
                <div className="game-stats-tooltip">
                    <span>Lượt chơi:</span>
                    <span>{turnCount.toLocaleString('vi-VN')}</span>
                    <span>Token mới nhất:</span>
                    <span>{latestTurnTokens.toLocaleString('vi-VN')}</span>
                    <span>Request lượt mới nhất:</span>
                    <span>{latestTurnApiRequests.toLocaleString('vi-VN')}</span>
                    <span>Tổng Tokens:</span>
                    <span>{totalTokenCount.toLocaleString('vi-VN')}</span>
                    <span>Yêu cầu API:</span>
                    <span>{apiRequestCount.toLocaleString('vi-VN')}</span>
                </div>
            </div>
            
            <nav className="game-nav desktop-nav">
                {navItems.map(item => {
                    if (item.requiresHistory && gameState.history.length === 0) {
                        return null; // Hide history-related buttons if no history
                    }
                    const isCharacterButtonWithQuest = item.id === 'header_character' && gameState?.hasUnseenQuest;
                    const isDisabled = gameEngine.isAITurnProcessing;
                    const title = isDisabled ? "AI đang xử lý..." : `${item.label} (${item.hotkey})`;
                    return (
                        visibleButtons[item.id] !== false && (
                            <button
                                key={item.label}
                                onClick={() => {
                                    if (typeof onDesktopNavClick !== 'function') {
                                        console.warn('onDesktopNavClick bị undefined!', item.label);
                                    }
                                    if (isDisabled) {
                                        console.log('Nút bị disable do AI đang xử lý:', item.label);
                                    }
                                    if (typeof onDesktopNavClick === 'function' && !isDisabled) {
                                        onDesktopNavClick(item.label);
                                    }
                                }}
                                className={`nav-button ${isCharacterButtonWithQuest ? 'new-content-indicator' : ''}`}
                                disabled={isDisabled}
                                title={title}
                            >
                                {item.label} {item.requiresHarem ? `(${gameState.character.harem?.length ?? 0})` : ''}
                            </button>
                        )
                    );
                })}
                {getTTSButton()}

                {historyItem && visibleButtons[historyItem.id] !== false && gameState.history.length > 0 && (
                    <button
                        onClick={() => {
                            if (typeof onDesktopNavClick !== 'function') {
                                console.warn('onDesktopNavClick bị undefined!', historyItem.label);
                            }
                            if (gameEngine.isAITurnProcessing) {
                                console.log('Nút Lịch Sử bị disable do AI đang xử lý');
                            }
                            if (typeof onDesktopNavClick === 'function' && !gameEngine.isAITurnProcessing) {
                                onDesktopNavClick(historyItem.label);
                            }
                        }}
                        className="nav-button"
                        disabled={gameEngine.isAITurnProcessing}
                        title={gameEngine.isAITurnProcessing ? "AI đang xử lý..." : `${historyItem.label} (${historyItem.hotkey})`}
                    >
                        {historyItem.label}
                    </button>
                )}

                {visibleButtons['header_revert'] !== false && gameState.history.length > 0 && (
                    <button onClick={() => {
                        if (typeof onRevertToPreviousTurn !== 'function') {
                            console.warn('onRevertToPreviousTurn bị undefined!');
                        }
                        if (gameEngine.isAITurnProcessing) {
                            console.log('Nút Lùi bị disable do AI đang xử lý');
                        }
                        if (typeof onRevertToPreviousTurn === 'function' && !gameEngine.isAITurnProcessing) {
                            onRevertToPreviousTurn();
                        }
                    }} className="nav-button" title={gameEngine.isAITurnProcessing ? "AI đang xử lý..." : "Lùi lại một lượt (Ctrl + Z)"} disabled={gameEngine.isAITurnProcessing}>Lùi</button>
                )}
                 {visibleButtons['header_exit'] !== false && (
                    <button className="nav-button danger" onClick={() => {
                        if (typeof onDesktopNavClick !== 'function') {
                            console.warn('onDesktopNavClick bị undefined!', 'Thoát');
                        }
                        if (gameEngine.isAITurnProcessing) {
                            console.log('Nút Thoát bị disable do AI đang xử lý');
                        }
                        if (typeof onDesktopNavClick === 'function' && !gameEngine.isAITurnProcessing) {
                            onDesktopNavClick('Thoát');
                        }
                    }} disabled={gameEngine.isAITurnProcessing} title={gameEngine.isAITurnProcessing ? "AI đang xử lý..." : "Thoát game về màn hình chính."}>Thoát</button>
                )}
            </nav>
            <div className="game-header-persistent-actions">
                 {visibleButtons['header_settings'] !== false && (
                    <button onClick={() => {
                        if (typeof onDesktopNavClick !== 'function') {
                            console.warn('onDesktopNavClick bị undefined!', 'Cài Đặt');
                        }
                        if (gameEngine.isAITurnProcessing) {
                            console.log('Nút Cài Đặt bị disable do AI đang xử lý');
                        }
                        if (typeof onDesktopNavClick === 'function' && !gameEngine.isAITurnProcessing) {
                            onDesktopNavClick('Cài Đặt');
                        }
                    }} className="nav-button nav-button-icon" title={gameEngine.isAITurnProcessing ? "AI đang xử lý..." : "Mở bảng Cài đặt (,)"} disabled={gameEngine.isAITurnProcessing}>
                        <SettingsIcon />
                    </button>
                )}
                 {visibleButtons['header_saveFile'] !== false && (
                    <button onClick={() => {
                        if (typeof onDesktopNavClick !== 'function') {
                            console.warn('onDesktopNavClick bị undefined!', 'Lưu Tệp');
                        }
                        if (gameEngine.isAITurnProcessing) {
                            console.log('Nút Lưu Tệp bị disable do AI đang xử lý');
                        }
                        if (typeof onDesktopNavClick === 'function' && !gameEngine.isAITurnProcessing) {
                            onDesktopNavClick('Lưu Tệp');
                        }
                    }} className="nav-button nav-button-icon" title={gameEngine.isAITurnProcessing ? "AI đang xử lý..." : "Lưu game ra tệp JSON (Ctrl + S)"} disabled={gameEngine.isAITurnProcessing}>
                        <SaveIcon />
                    </button>
                )}
                <button
                    className="nav-button header-toggle-button"
                    onClick={onToggleCollapse}
                    aria-label={isHeaderCollapsed ? "Mở rộng thanh tiêu đề" : "Thu gọn thanh tiêu đề"}
                    title={isHeaderCollapsed ? "Mở rộng" : "Thu gọn"}
                >
                    {isHeaderCollapsed ? '▼' : '▲'}
                </button>
            </div>
        </header>
    );
});