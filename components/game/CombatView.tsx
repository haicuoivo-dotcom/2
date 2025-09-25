/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { useGameContext } from '../contexts/GameContext';
import { CombatActionModal } from './CombatActionModal';
import { CombatCharacterPanel } from './CombatCharacterPanel';
import { TurnOrderPanel } from './TurnOrderPanel';
import { useScreenOrientation } from '../../hooks/useScreenOrientation';
import { PlayIcon, StopIcon, TargetIcon, DazeIcon, FearIcon, ShieldIcon, SparklesIcon, PackageIcon, SwordsIcon } from '../ui/Icons';
import type { Character, GameAction, Stat, CombatEvent, EntityTooltipData } from '../../types';
import './CombatView.css';
import './CombatCharacterPanel.css';
import './TurnOrderPanel.css';

interface CombatViewProps {
    onAction: (action: Partial<GameAction>) => void;
    isProcessing: boolean;
    isAutoCombatActive: boolean;
    toggleAutoCombat: () => void;
    combatEvents: CombatEvent[];
    onEntityMouseEnter: (event: React.MouseEvent, name: string, type: string, variant: EntityTooltipData['variant']) => void;
    onEntityMouseLeave: () => void;
    onStatusMouseEnter: (event: React.MouseEvent, status: Stat) => void;
    onStatusMouseLeave: () => void;
}

export const CombatView = ({ onAction, isProcessing, isAutoCombatActive, toggleAutoCombat, combatEvents, onEntityMouseEnter, onEntityMouseLeave, onStatusMouseEnter, onStatusMouseLeave }: CombatViewProps) => {
    useScreenOrientation('landscape-primary');
    const { gameState, dispatch } = useGameContext();
    const { character: pc, combatState, actions } = gameState;
    const combatLog = combatState.combatLog || [];

    const logContainerRef = useRef<HTMLUListElement>(null);

    const [modalType, setModalType] = useState<'item' | 'equip' | null>(null);
    const [commandView, setCommandView] = useState<'main' | 'skills' | 'other'>('main');

    const currentActorId = combatState?.turnQueue?.[combatState.currentTurnIndex ?? 0]?.characterId;
    const opponents = useMemo(() => 
        (combatState?.opponentIds || [])
            .map(id => gameState.knowledgeBase.npcs.find(npc => npc.id === id))
            .filter((npc): npc is Character => !!npc), 
        [combatState?.opponentIds, gameState.knowledgeBase.npcs]
    );

    const allCombatants = useMemo(() => [pc, ...opponents], [pc, opponents]);

    const isPcTurn = combatState?.combatMode === 'turn-based' && (currentActorId === pc.id);
    const showPlayerActions = isPcTurn && !isAutoCombatActive;

    useEffect(() => {
        if (logContainerRef.current) {
            logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
        }
    }, [combatLog]);

    useEffect(() => {
        if (!isProcessing && !isAutoCombatActive) {
            setCommandView('main');
        }
    }, [isProcessing, isAutoCombatActive]);

    const handleTargetLock = useCallback((characterId: string) => {
        if (isProcessing) return;
        const currentLockId = combatState.lockedTargetId;
        const newLockId = currentLockId === characterId ? null : characterId;
        dispatch({ type: 'UPDATE_COMBAT_STATE', payload: { lockedTargetId: newLockId } });
    }, [combatState.lockedTargetId, dispatch, isProcessing]);

    const handleActionSelect = (item: Stat) => {
        const prefix = modalType === 'item' ? 'Sử dụng Vật phẩm:' : 'Trang bị:';
        onAction({ description: `${prefix} ${item.name}` });
        setModalType(null);
    };
    
    const skillActions = actions.filter(a => a.description.includes('Kỹ năng'));
    const otherActions = actions.filter(a => !a.description.includes('Tấn công') && !a.description.includes('Kỹ năng'));

    const renderActionButtons = () => {
        if (!showPlayerActions) {
            return (
                <div className="combat-status-indicator">
                    <div className="spinner spinner-md"></div>
                    <span>
                        {isProcessing
                            ? 'Đang xử lý...'
                            : isAutoCombatActive
                                ? 'Tự động chiến đấu...'
                                : 'Đang chờ...'}
                    </span>
                </div>
            );
        }

        switch (commandView) {
            case 'skills':
                return (
                    <div className="combat-action-menu combat-submenu-actions">
                        {skillActions.map(action => (
                            <div key={action.id}>
                                <button className="action-button" onClick={() => onAction(action)} disabled={isProcessing}>{action.description}</button>
                            </div>
                        ))}
                        <button className="action-button command-back" onClick={() => setCommandView('main')} disabled={isProcessing}>Quay Lại</button>
                    </div>
                );
            case 'other':
                 return (
                    <div className="combat-action-menu combat-submenu-actions">
                        {otherActions.map(action => (
                             <div key={action.id}>
                                <button className="action-button" onClick={() => onAction(action)} disabled={isProcessing}>{action.description}</button>
                            </div>
                        ))}
                        <button className="action-button command-back" onClick={() => setCommandView('main')} disabled={isProcessing}>Quay Lại</button>
                    </div>
                );
            case 'main':
            default:
                const isLethal = combatState.isLethal !== false;
                return (
                    <div className="combat-command-board">
                        <div className="tactical-grid">
                            <button className="tactical-button lethal-strike" onClick={() => onAction({ description: "Thực hiện Đòn Trí Mạng" })} disabled={isProcessing || !isLethal} title={isLethal ? "Gây sát thương tối đa, có thể kết liễu đối thủ." : "Không thể thực hiện đòn trí mạng trong trận giao hữu."}><TargetIcon/><span>Đòn Trí Mạng</span></button>
                            <button className="tactical-button subduing-blow" onClick={() => onAction({ description: "Thực hiện Đòn Vô Hiệu Hóa" })} disabled={isProcessing} title="Gây sát thương vừa phải, có khả năng gây choáng."><DazeIcon/><span>Đòn Vô Hiệu Hóa</span></button>
                            <button className="tactical-button" onClick={() => setCommandView('skills')} disabled={isProcessing || skillActions.length === 0}><SparklesIcon/><span>Kỹ Năng</span></button>
                            <button className="tactical-button" onClick={() => setModalType('item')} disabled={isProcessing}><PackageIcon/><span>Vật Phẩm</span></button>
                        </div>
                         <div className="side-actions">
                            <button className="tactical-button warning-shot" onClick={() => onAction({ description: "Thực hiện Đòn Dọa Nạt" })} disabled={isProcessing} title="Gây sát thương tối thiểu, có khả năng làm đối thủ hoảng sợ."><FearIcon/><span>Đòn Dọa Nạt</span></button>
                            <button className="tactical-button" onClick={() => setCommandView('other')} disabled={isProcessing || otherActions.length === 0}><SwordsIcon/><span>Khác</span></button>
                        </div>
                    </div>
                );
        }
    };

    return (
        <>
            <CombatActionModal
                isOpen={!!modalType}
                type={modalType}
                character={pc}
                onClose={() => setModalType(null)}
                onSelect={handleActionSelect}
            />
            <div className="combat-view-grid">
                <div className="combat-group-panel opponents-panel">
                    <h4 className="combat-group-title">Kẻ Địch</h4>
                    <div className="combat-group-list">
                        {opponents.map(opponent => (
                            <CombatCharacterPanel
                                key={opponent.id}
                                character={opponent}
                                isPlayer={false}
                                combatEvents={combatEvents}
                                isCurrentTurn={opponent.id === currentActorId}
                                isLocked={opponent.id === combatState.lockedTargetId}
                                onTargetLock={handleTargetLock}
                                onMouseEnter={(e) => onEntityMouseEnter(e, opponent.name, 'NPC', 'combat')}
                                onMouseLeave={onEntityMouseLeave}
                                onStatusMouseEnter={onStatusMouseEnter}
                                onStatusMouseLeave={onStatusMouseLeave}
                            />
                        ))}
                    </div>
                </div>
                <div className="combat-log-and-actions">
                    <TurnOrderPanel 
                        turnQueue={combatState?.turnQueue}
                        currentTurnIndex={combatState?.currentTurnIndex}
                        allCombatants={allCombatants}
                    />
                    <div className="combat-log-panel">
                        <ul ref={logContainerRef} className="combat-log-list">
                            {combatLog.map((entry, index) => (
                                <li key={index} className="combat-log-entry">
                                    {entry}
                                </li>
                            ))}
                            {isProcessing && (
                                <li className="combat-log-entry thinking">
                                    <div className="spinner spinner-sm"></div>
                                    <span>AI đang suy nghĩ...</span>
                                </li>
                            )}
                        </ul>
                    </div>
                    <div className="combat-actions-wrapper">
                        <div className="combat-actions-panel">
                            {renderActionButtons()}
                        </div>
                        <button
                            className={`action-button auto-combat-button ${isAutoCombatActive ? 'stop' : 'start'}`}
                            onClick={toggleAutoCombat}
                        >
                            {isAutoCombatActive ? <><StopIcon /> Dừng</> : <><PlayIcon /> Tự Động</>}
                        </button>
                    </div>
                </div>
                <div className="combat-group-panel party-panel">
                    <h4 className="combat-group-title">Nhân Vật</h4>
                    <div className="combat-group-list">
                        <CombatCharacterPanel
                            character={pc}
                            isPlayer={true}
                            combatEvents={combatEvents}
                            isCurrentTurn={pc.id === currentActorId}
                            onMouseEnter={(e) => onEntityMouseEnter(e, pc.name, 'PC', 'combat')}
                            onMouseLeave={onEntityMouseLeave}
                            onStatusMouseEnter={onStatusMouseEnter}
                            onStatusMouseLeave={onStatusMouseLeave}
                        />
                    </div>
                </div>
            </div>
        </>
    );
};
