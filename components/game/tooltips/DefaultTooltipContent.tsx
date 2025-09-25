/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { StoryRenderer } from '../StoryRenderer';
import { ENTITY_TYPE_LABELS } from '../../../constants/gameConstants';
import type { EntityTooltipData, GameState, WorldSettings } from '../../../types';

interface DefaultTooltipContentProps {
    data: EntityTooltipData;
    gameState: GameState;
    // FIX: Add worldSettings to props to match what is being passed.
    worldSettings: WorldSettings;
}

export const DefaultTooltipContent = ({ data, gameState, worldSettings }: DefaultTooltipContentProps) => {
    const { name, type, description, displayName } = data;
    const label = ENTITY_TYPE_LABELS[type as keyof typeof ENTITY_TYPE_LABELS] || type;

    return (
        <>
            <div className="tooltip-header">
                <span className={`tooltip-type entity-label-${type.toLowerCase()}`}>{label}</span>
                 <h4 className="tooltip-name">
                    {displayName || name}
                    {displayName && displayName !== name && <span className="char-detail-fullname" style={{fontSize: '0.8rem', marginLeft: '0.5rem', fontWeight: 400}}>({name})</span>}
                </h4>
            </div>
            <div className="tooltip-description">
                 <StoryRenderer
                    text={description}
                    gameState={gameState}
                    onEntityClick={() => {}}
                    onEntityMouseEnter={() => {}}
                    onEntityMouseLeave={() => {}}
                />
            </div>
        </>
    );
};