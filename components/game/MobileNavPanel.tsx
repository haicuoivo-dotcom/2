/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useMemo } from 'react';
import { useGameContext } from '../contexts/GameContext';
import { useSettings } from '../contexts/SettingsContext';
// FIX: Replaced missing icon imports with available ones using aliases.
import { UserIcon, BookTextIcon as MemoryIcon, LibraryIcon as KnowledgeIcon, MapIcon, ImageIcon as GalleryIcon, ScrollTextIcon as LoreIcon, SettingsIcon, HistoryIcon, SaveIcon, LogOutIcon as ExitIcon, PauseIcon, HammerIcon, UsersIcon } from '../ui/Icons';

const NAV_ITEMS_BASE = [
    // Group 1: Khám phá Thế giới
    { id: 'mobile_character', label: "Nhân Vật", icon: <UserIcon />, hotkey: "C" },
    { id: 'mobile_harem', label: "Hậu Cung", icon: <UsersIcon />, hotkey: "P", requiresHarem: true },
    { id: 'mobile_memory', label: "Dòng Chảy Sự Kiện", icon: <MemoryIcon />, hotkey: "M" },
    { id: 'mobile_knowledge', label: "Tri Thức", icon: <KnowledgeIcon />, hotkey: "K" },
    { id: 'mobile_map', label: "Bản Đồ", icon: <MapIcon />, hotkey: "B" },
    { id: 'mobile_crafting', label: "Chế Tạo", icon: <HammerIcon />, hotkey: "I" },
    { id: 'mobile_gallery', label: "Thư Viện", icon: <GalleryIcon />, hotkey: "G" },
    { id: 'mobile_lore', label: "Luật Lệ", icon: <LoreIcon />, hotkey: "L" },
    
    // Group 2: Công cụ Quản lý
    { id: 'mobile_history', label: "Lịch Sử", separator: true, requiresHistory: true, icon: <HistoryIcon />, hotkey: "H" },
    { id: 'mobile_saveFile', label: "Lưu Tệp", icon: <SaveIcon />, hotkey: "Ctrl + S" },
    { id: 'mobile_settings', label: "Cài Đặt", icon: <SettingsIcon />, hotkey: "," },

    // Group 3: Hành động Trong Game
    { id: 'mobile_pause', label: "Tạm Dừng", separator: true, requiresCombat: true, icon: <PauseIcon />, hotkey: "Space" },

    // Group 4: Hành động Thoát
    { id: 'mobile_exit', label: "Thoát", separator: true, isDanger: true, icon: <ExitIcon /> }
];

interface MobileNavPanelProps {
    isOpen: boolean;
    onClose: () => void;
    onNavClick: (label: string) => void;
    historyLength: number;
    isProcessing: boolean;
    isCombatActive: boolean;
}

const UnmemoizedMobileNavPanel = ({ isOpen, onClose, onNavClick, historyLength, isProcessing, isCombatActive }: MobileNavPanelProps) => {
    const { gameState } = useGameContext();
    const { settings } = useSettings();
    const { visibleButtons } = settings;
    const character = gameState?.character;
    const haremLength = character?.harem?.length ?? 0;
    const hasNewQuest = gameState?.hasUnseenQuest;
    
    const navItems = NAV_ITEMS_BASE;

    return (
        <>
            <div className={`mobile-nav-overlay ${isOpen ? 'open' : ''}`} onClick={onClose} />
            <div className={`mobile-nav-panel ${isOpen ? 'open' : ''}`}>
                 {character && (
                    <div className="mobile-nav-header">
                        <div className="mobile-nav-avatar">
                            {character.avatarUrl ? (
                                <img src={character.avatarUrl} alt={character.displayName} />
                            ) : (
                                <span>{(character.displayName || character.name).charAt(0)}</span>
                            )}
                        </div>
                        <div className="mobile-nav-char-info">
                            <h4 className="mobile-nav-char-name">{character.displayName || character.name}</h4>
                        </div>
                    </div>
                )}
                <nav className="mobile-nav-list">
                    {navItems
                        .filter(item => !(item.requiresCombat && !isCombatActive))
                        .filter(item => !(item.requiresHistory && historyLength === 0))
                        .map(item => {
                            const isCharacterButtonWithQuest = item.id === 'mobile_character' && hasNewQuest;
                            const isDisabled = isProcessing;
                            return (
                                visibleButtons[item.id] !== false && (
                                    <React.Fragment key={item.label}>
                                        {item.separator && <div className="mobile-nav-separator"></div>}
                                        <button
                                            onClick={() => onNavClick(item.label)}
                                            className={`mobile-nav-button ${item.isDanger ? 'danger' : ''} ${isCharacterButtonWithQuest ? 'new-content-indicator' : ''}`}
                                            disabled={isDisabled}
                                            title={item.hotkey ? `${item.label} (${item.hotkey})` : item.label}
                                        >
                                            <span className="mobile-nav-icon">{item.icon}</span>
                                            <span>{item.label} {item.requiresHarem ? `(${haremLength})` : ''}</span>
                                        </button>
                                    </React.Fragment>
                                )
                            );
                        })}
                </nav>
            </div>
        </>
    );
};

export const MobileNavPanel = React.memo(UnmemoizedMobileNavPanel);