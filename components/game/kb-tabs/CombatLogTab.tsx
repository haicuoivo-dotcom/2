/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useMemo } from 'react';
import { useGameContext } from '../../contexts/GameContext';
import { NoInfoPlaceholder } from '../../ui/NoInfoPlaceholder';
import { InlineStoryRenderer } from '../StoryRenderer';
import type { Turn } from '../../../types';
import './CombatLogTab.css';

interface CombatTurn extends Turn {
    turnNumber: number;
}

export const CombatLogTab = () => {
    const { gameState } = useGameContext();

    const combatTurns = useMemo(() => {
        if (!gameState?.turns) return [];
        
        return gameState.turns
            .map((turn, index) => ({ ...turn, turnNumber: index + 1 }))
            .filter(turn => turn.chosenAction?.startsWith('Tấn công'))
            .reverse() as CombatTurn[];
    }, [gameState?.turns]);

    if (combatTurns.length === 0) {
        return (
            <div className="combat-log-container">
                <NoInfoPlaceholder text="Chưa có nhật ký chiến đấu nào." />
            </div>
        );
    }

    return (
        <div className="combat-log-container">
            <ul className="combat-log-list">
                {combatTurns.map(turn => (
                    <li key={turn.id} className="combat-log-item">
                        <div className="combat-log-item-header">
                            <span className="combat-log-turn-number">Lượt {turn.turnNumber}</span>
                            <p className="combat-log-action">
                                <InlineStoryRenderer 
                                    text={turn.chosenAction} 
                                    gameState={gameState} 
                                    onEntityClick={() => {}}
                                />
                            </p>
                        </div>
                        <div className="combat-log-summary">
                             <InlineStoryRenderer 
                                text={turn.summary} 
                                gameState={gameState} 
                                onEntityClick={() => {}}
                            />
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};
