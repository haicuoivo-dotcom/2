/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { StatLine } from './StatLine';
import type { Character, EffectiveStat, Stat } from '../../../types';

interface StatBlockProps {
    title: string;
    statNames: string[];
    character: Character;
    effectiveStats: Map<string, EffectiveStat>;
    previewStats: Map<string, EffectiveStat> | null;
    isPlayerCharacter: boolean;
    highlightedStatNames: Set<string>;
    onStatHoverStart: (statName: string) => void;
    onStatHoverEnd: () => void;
    enableCheats: boolean;
    handleStatUpdate: (statId: string, newValue: string | number) => void;
}

export const StatBlock = (props: StatBlockProps) => {
    const { 
        title, statNames, character, effectiveStats, previewStats, isPlayerCharacter, 
        highlightedStatNames, onStatHoverStart, onStatHoverEnd, enableCheats,
        handleStatUpdate
    } = props;

    const renderedStats = statNames
        .map(statName => {
            const statExists = character.stats?.some(s => s.name === statName);
            const isGuaranteedSocialStat = statName === 'Thiện cảm';

            if (statExists || isGuaranteedSocialStat) {
                const isHighlighted = highlightedStatNames.has(statName);
                return <StatLine 
                            key={statName} 
                            statName={statName} 
                            character={character} 
                            effectiveStats={effectiveStats}
                            previewStats={previewStats}
                            isHighlighted={isHighlighted}
                            onStatHoverStart={onStatHoverStart}
                            onStatHoverEnd={onStatHoverEnd}
                            enableCheats={enableCheats ?? false}
                            handleStatUpdate={handleStatUpdate}
                        />;
            }
            return null;
        })
        .filter(Boolean);

    if (renderedStats.length === 0 && (title !== 'Chỉ số Xã hội & Tình Cảm' || isPlayerCharacter)) {
        return null;
    }

    if (!title) {
        return <>{renderedStats}</>;
    }

    return (
        <div className="data-block">
            <h4 className="section-title-bar">{title}</h4>
            <div className="data-list">
                {renderedStats}
            </div>
        </div>
    );
};