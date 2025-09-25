/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import './PauseModal.css';

interface PauseModalProps {
    onResume: () => void;
    onSurrender: () => void;
    onNavigateToMenu: () => void;
    isCombatActive: boolean;
}

const ResumeIcon = () => (
    <svg className="pause-menu-icon" viewBox="0 0 24 24" fill="currentColor" strokeWidth="0">
        <path d="M8 5v14l11-7z" />
    </svg>
);

const SurrenderIcon = () => (
    <svg className="pause-menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
        <line x1="4" y1="22" x2="4" y2="15" />
    </svg>
);

const ExitIcon = () => (
    <svg className="pause-menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
);


const UnmemoizedPauseModal = ({ onResume, onSurrender, onNavigateToMenu, isCombatActive }: PauseModalProps) => {
    return (
        <div className="modal-overlay pause-overlay">
            <div className="pause-menu-container">
                <h2 className="pause-title">Tạm Dừng</h2>
                <nav className="pause-menu-nav">
                    <button className="pause-menu-button" onClick={onResume}>
                        <ResumeIcon />
                        <span>Tiếp Tục</span>
                    </button>
                    {isCombatActive && (
                        <button className="pause-menu-button danger" onClick={onSurrender}>
                            <SurrenderIcon />
                            <span>Đầu Hàng</span>
                        </button>
                    )}
                    <button className="pause-menu-button danger" onClick={onNavigateToMenu}>
                        <ExitIcon />
                        <span>Thoát Game</span>
                    </button>
                </nav>
            </div>
        </div>
    );
};

export const PauseModal = React.memo(UnmemoizedPauseModal);