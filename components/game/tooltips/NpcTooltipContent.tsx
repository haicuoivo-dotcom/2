/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { getStatusStyleClass } from '../../../utils/game';
import type { EntityTooltipData, Stat, Character } from '../../../types';
import { useGameContext } from '../../contexts/GameContext';


const isTrulyNamedMonster = (data: EntityTooltipData): boolean => {
    if (data.npcType !== 'named_monster') {
        return false;
    }
    const speciesStat = data.stats?.find(s => s.name === 'Chủng tộc');
    if (!speciesStat || typeof speciesStat.value !== 'string' || !speciesStat.value) {
        return true;
    }
    const species = speciesStat.value.toLowerCase();
    const displayName = (data.displayName || data.name).toLowerCase();
    return !displayName.includes(species);
};

interface NpcTooltipContentProps {
    data: EntityTooltipData;
}

export const NpcTooltipContent = ({ data }: NpcTooltipContentProps) => {
    const { gameState } = useGameContext();
    const { name, displayName, avatarUrl, stats, personality, mood, statuses, combatPower } = data;

    const findStat = (statName: string): Stat | undefined => stats?.find(s => s.name === statName);
    
    const age = findStat('Tuổi')?.value;
    const gender = findStat('Giới tính')?.value;
    const rankStat = stats?.find(s => ['Cấp bậc', 'Cảnh giới', 'Võ học', 'Danh Vọng'].includes(s.name));

    const relationship = (data as unknown as Character).relationships?.find(r => r.characterId === gameState.character.id);

    const activeStatuses = (statuses || []).filter(s => s.name !== 'Trạng thái Tử vong');
    const isDescriptiveMonster = (data.npcType === 'named_monster' && !isTrulyNamedMonster(data)) || data.npcType === 'unnamed_monster';
    
    const personalityTraits = Array.isArray(personality) ? personality : [];

    return (
        <>
            {avatarUrl ? (
                <img src={avatarUrl} alt={displayName || name} className="npc-tooltip-avatar" />
            ) : (
                <div className="npc-tooltip-avatar-placeholder">
                    <span>{(displayName || name).charAt(0)}</span>
                </div>
            )}
            <div className="npc-tooltip-content">
                <div className="npc-tooltip-main">
                    <div className="npc-tooltip-header">
                        <div className="npc-tooltip-title">
                            <h4 className="tooltip-name">{displayName || name}</h4>
                            {displayName && displayName !== name && !isDescriptiveMonster && <span className="char-detail-fullname">({name})</span>}
                        </div>
                    </div>

                    <div className="npc-tooltip-personal-info">
                        <div className="npc-tooltip-stat"><strong>Tuổi:</strong> <span>{age || 'Không rõ'}</span></div>
                        <div className="npc-tooltip-stat"><strong>Giới tính:</strong> <span>{gender || 'Không rõ'}</span></div>
                        {rankStat && (
                            <div className="npc-tooltip-stat"><strong>{rankStat.name}:</strong> <span>{String(rankStat.value) || 'Không rõ'}</span></div>
                        )}
                        {combatPower !== undefined && (
                            <div className="npc-tooltip-stat"><strong>Lực Chiến:</strong> <span style={{color: 'var(--accent-warning)', fontWeight: 600}}>⚡️ {combatPower.toLocaleString('vi-VN')}</span></div>
                        )}
                        <div className="npc-tooltip-stat"><strong>Tâm trạng:</strong> <span>{mood || 'Bình thường'}</span></div>
                        {relationship && (
                             <div className="npc-tooltip-stat"><strong>Quan hệ:</strong> <span>{relationship.type} ({relationship.affinity})</span></div>
                        )}
                    </div>
                    
                    {personalityTraits.length > 0 && (
                        <>
                           <hr className="tooltip-divider" />
                           <div className="npc-tooltip-statuses">
                               {personalityTraits.map(trait => (
                                   <span key={trait.id} className="status-badge-sm status-neutral" title={trait.description}>
                                       {trait.name}
                                   </span>
                               ))}
                           </div>
                       </>
                    )}

                    {activeStatuses.length > 0 && (
                         <>
                            <hr className="tooltip-divider" />
                            <div className="npc-tooltip-statuses">
                                {activeStatuses.map(status => (
                                    <span key={status.id} className={`status-badge-sm ${getStatusStyleClass(status)}`} title={status.description}>
                                        {status.name}{typeof status.value === 'number' && status.value > 1 ? ` (x${status.value})` : ''}
                                    </span>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </>
    );
};