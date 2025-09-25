/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useMemo } from 'react';
import { InlineStoryRenderer } from '../game/StoryRenderer';
import { useGameSession, useWorldData, usePlayerCharacter } from '../contexts/GameContext';
import type { Turn, GameState } from '../../types';
import './HistoryModal.css';

interface HistoryModalProps {
    turns: Turn[];
    onRevert: (index: number) => void;
    onClose: () => void;
    onEntityClick: (event: React.MouseEvent, name: string, type: string) => void;
    onEntityMouseEnter: (event: React.MouseEvent, name: string, type: string) => void;
    onEntityMouseLeave: () => void;
}

export const HistoryModal = ({ turns, onRevert, onClose, onEntityClick, onEntityMouseEnter, onEntityMouseLeave }: HistoryModalProps) => {
    const worldData = useWorldData();
    const playerCharacterData = usePlayerCharacter();
    const gameSession = useGameSession(); // Get access to the history array

    // Reconstruct a minimal gameState for the renderer.
    const gameState = useMemo(() => {
        if (!playerCharacterData || !worldData) return null;
        return {
            character: playerCharacterData.character,
            knowledgeBase: worldData.knowledgeBase,
        };
    }, [playerCharacterData, worldData]);


    const recentTurns = turns.slice(Math.max(0, turns.length - 20)).reverse();
    const latestTurnIndex = turns.length - 1;

    if (!gameState) {
        return null;
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content fullscreen-modal-content history-modal-content" onClick={e => e.stopPropagation()}>
                <header className="modal-header">
                    <h3>Lịch Sử Lượt Chơi</h3>
                    <button onClick={onClose} className="modal-close-button" aria-label="Đóng">×</button>
                </header>
                <div className="modal-body">
                    {recentTurns.length === 0 ? (
                        <p className="no-history-message">Không có lịch sử để hiển thị.</p>
                    ) : (
                        <ul className="history-list">
                            {recentTurns.map((turn, index) => {
                                const originalIndex = latestTurnIndex - index;
                                const summaryText = turn.summary || turn.chosenAction || "Bắt đầu cuộc hành trình";
                                const isCurrentTurn = originalIndex === latestTurnIndex;
                                const isRevertible = originalIndex < (gameSession?.history.length ?? 0);

                                return (
                                    <li key={turn.id} className={`history-item ${isCurrentTurn ? 'current-turn' : ''}`}>
                                        <div className="history-item-summary-row">
                                            <div className="history-info">
                                                <span className="history-turn-number">Lượt {originalIndex + 1}</span>
                                                <div className="history-summary">
                                                    <InlineStoryRenderer 
                                                        text={summaryText}
                                                        gameState={gameState as GameState}
                                                        onEntityClick={onEntityClick}
                                                        onEntityMouseEnter={onEntityMouseEnter}
                                                        onEntityMouseLeave={onEntityMouseLeave}
                                                    />
                                                </div>
                                            </div>
                                            <div className="history-item-actions">
                                                {isRevertible ? (
                                                    <button 
                                                        className="history-revert-button"
                                                        onClick={(e) => { e.stopPropagation(); onRevert(originalIndex); }}
                                                        title={`Quay lại lượt ${originalIndex + 1}`}
                                                    >
                                                        Quay Lại
                                                    </button>
                                                ) : (
                                                    <span className="current-turn-label" title="Đây là lượt chơi hiện tại của bạn hoặc một lượt đã bị ghi đè.">Lượt Hiện Tại</span>
                                                )}
                                            </div>
                                        </div>
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
