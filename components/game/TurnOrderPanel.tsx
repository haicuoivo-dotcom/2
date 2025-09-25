/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useMemo } from 'react';
import type { Character, CombatQueueEntry } from '../../types';

interface TurnOrderPanelProps {
    turnQueue?: CombatQueueEntry[];
    currentTurnIndex?: number;
    allCombatants: Character[];
}

export const TurnOrderPanel = ({ turnQueue, currentTurnIndex, allCombatants }: TurnOrderPanelProps) => {
    const nextTurns = useMemo(() => {
        if (!turnQueue || turnQueue.length === 0 || typeof currentTurnIndex !== 'number') {
            return [];
        }

        const combatantMap = new Map(allCombatants.map(c => [c.id, c]));
        const turns: Character[] = [];
        const uniqueTurns = new Set<string>(); // Prevent showing the same character multiple times in a row if queue is short

        for (let i = 0; i < turnQueue.length * 2 && turns.length < 6; i++) { // Loop twice through queue to get enough future turns
            const nextIndex = (currentTurnIndex + i) % turnQueue.length;
            const characterId = turnQueue[nextIndex].characterId;
            
            if (uniqueTurns.has(characterId)) continue;

            const character = combatantMap.get(characterId);
            
            if (character && !character.stats?.some(s => s.name === 'Trạng thái Tử vong')) {
                turns.push(character);
                uniqueTurns.add(characterId);
            }
        }
        return turns;
    }, [turnQueue, currentTurnIndex, allCombatants]);
    
    if (nextTurns.length === 0) return null;

    return (
        <div className="turn-order-panel">
            <h4 className="turn-order-title">Thứ Tự Lượt Đánh</h4>
            <div className="turn-order-track">
                <div className="turn-order-list">
                    {nextTurns.map((char, index) => {
                         const isCurrentTurn = index === 0;
                         const isPC = char.id === allCombatants[0]?.id;
                         const characterInitial = (char.displayName || char.name).charAt(0).toUpperCase();

                         return (
                             <div key={`${char.id}-${index}`} className={`turn-order-item ${isCurrentTurn ? 'current-turn' : ''}`} title={char.displayName}>
                                 {isCurrentTurn && <div className="current-turn-indicator">▼</div>}
                                 <div className={`turn-order-avatar ${isPC ? 'pc-avatar' : 'npc-avatar'}`}>
                                     {char.avatarUrl ? (
                                         <img src={char.avatarUrl} alt={char.displayName} />
                                     ) : (
                                         <div className="turn-order-avatar-placeholder">
                                             {characterInitial}
                                         </div>
                                     )}
                                 </div>
                                 <span className="turn-order-name">{char.displayName}</span>
                             </div>
                         );
                    })}
                </div>
            </div>
        </div>
    );
};