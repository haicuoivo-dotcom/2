/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect } from 'react';
import { PencilIcon } from '../../ui/Icons';
// FIX: STAT_TOOLTIPS is exported from statConstants.
import { STAT_TOOLTIPS } from '../../../constants/statConstants';
import type { Character, EffectiveStat, Stat } from '../../../types';

interface StatLineProps {
    statName: string;
    character: Character;
    effectiveStats: Map<string, EffectiveStat>;
    previewStats: Map<string, EffectiveStat> | null;
    isHighlighted: boolean;
    onStatHoverStart: (statName: string) => void;
    onStatHoverEnd: () => void;
    enableCheats: boolean;
    handleStatUpdate: (statId: string, newValue: string | number) => void;
}

const parseValue = (value: string | number | undefined): { current: number, max: number | null } => {
    if (typeof value === 'number') {
        return { current: value, max: null };
    }
    if (typeof value === 'string') {
        if (value.includes('/')) {
            const [current, max] = value.split('/').map(Number);
            return { current: isNaN(current) ? 0 : current, max: isNaN(max) ? null : max };
        }
        const num = Number(value);
        return { current: isNaN(num) ? 0 : num, max: null };
    }
    return { current: 0, max: null };
};

export const StatLine = (props: StatLineProps) => {
    const { 
        statName, character, effectiveStats, previewStats, isHighlighted, 
        onStatHoverStart, onStatHoverEnd, enableCheats, handleStatUpdate
    } = props;

    const [isHovered, setIsHovered] = useState(false);
    
    const findStat = (name: string) => character.stats?.find(s => s.name === name);
    let baseStat = findStat(statName);

    if (!baseStat) {
        if (statName === 'Thiện cảm') {
            baseStat = { id: 'default-thien-cam', name: 'Thiện cảm', value: 0, category: 'Thuộc tính', description: 'Mức độ thiện cảm với nhân vật chính.' };
        } else {
            return null;
        }
    }

    const effectiveStat = effectiveStats.get(statName);
    const finalValue = effectiveStat ? effectiveStat.modifiedValue : baseStat.value;

    const [localValue, setLocalValue] = useState(String(finalValue));

    useEffect(() => {
        // Sync local state if the prop changes (e.g., from an AI update or preview end)
        setLocalValue(String(finalValue));
    }, [finalValue]);
    
    const handleLocalSave = () => {
        if (String(finalValue) !== localValue) {
            handleStatUpdate(baseStat!.id, localValue);
        }
    };
    
    const handleInputKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleLocalSave();
            (e.target as HTMLInputElement).blur(); // Remove focus
        }
        if (e.key === 'Escape') {
            setLocalValue(String(finalValue)); // Revert changes
            (e.target as HTMLInputElement).blur();
        }
    };


    const { current, max } = parseValue(finalValue);
    const hasBar = max !== null && max > 0;

    const getBarClass = (name: string) => {
        const lowerName = name.toLowerCase();
        if (lowerName.includes('sinh lực')) return 'hp';
        if (lowerName.includes('mana') || lowerName.includes('linh lực')) return 'mana';
        if (lowerName.includes('nội lực') || lowerName.includes('thể lực')) return 'stamina';
        if (lowerName.includes('kinh nghiệm')) return 'exp';
        return '';
    };

    const modifierParts: string[] = [];
    if (effectiveStat && !previewStats) { // Only show base modifiers when not in preview mode
        if (effectiveStat.flatModifier !== 0) {
            modifierParts.push(effectiveStat.flatModifier > 0 ? `+${effectiveStat.flatModifier}` : `${effectiveStat.flatModifier}`);
        }
        if (effectiveStat.percentModifier !== 0) {
            modifierParts.push(effectiveStat.percentModifier > 0 ? `+${effectiveStat.percentModifier}%` : `${effectiveStat.percentModifier}%`);
        }
    }
    
    const modifierDisplay = modifierParts.length > 0 ? `(${modifierParts.join(', ')})` : '';

    const statDescription = STAT_TOOLTIPS[statName] || baseStat?.description || '';
    const sourcesHeader = effectiveStat?.sources.length > 0 ? '\n--- Nguồn Ảnh hưởng ---' : '';
    const sourcesText = effectiveStat?.sources.join('\n') || '';
    const tooltipTitle = `${statDescription}${sourcesHeader}\n${sourcesText}`.trim();

    const renderNonCheatValue = () => {
        const previewEffectiveStat = previewStats ? previewStats.get(statName) : null;

        if (!previewEffectiveStat || !effectiveStat || JSON.stringify(previewEffectiveStat.modifiedValue) === JSON.stringify(effectiveStat.modifiedValue)) {
            const isModified = effectiveStat && effectiveStat.modifiedValue !== effectiveStat.baseValue;
            const isPositive = isModified && parseValue(effectiveStat.modifiedValue).current > parseValue(effectiveStat.baseValue).current;
            return <span className={isModified ? (isPositive ? 'positive' : 'negative') : ''}>{String(finalValue)} {modifierDisplay}</span>;
        }

        const original = parseValue(previewEffectiveStat.modifiedValue);
        const modified = parseValue(effectiveStat.modifiedValue);
        
        const diffCurrent = modified.current - original.current;
        const diffMax = (modified.max ?? 0) - (original.max ?? 0);
        
        const changeClass = diffCurrent > 0 || diffMax > 0 ? 'positive' : 'negative';
        
        const renderChange = (diff: number, prefix = '') => {
            if (diff === 0) return null;
            return `(${diff > 0 ? '+' : ''}${diff} ${prefix})`.trim();
        };
        
        return (
            <>
                <span className="original-value">{String(previewEffectiveStat.modifiedValue)}</span>
                <span className="arrow">→</span>
                <span>{String(effectiveStat.modifiedValue)}</span>
                <span className={`preview-change ${changeClass}`}>
                    {renderChange(diffCurrent)} {renderChange(diffMax, 'Max')}
                </span>
            </>
        );
    };

    return (
        <div 
            className={`stat-line-container ${isHighlighted ? 'highlighted' : ''}`}
            onMouseEnter={() => { setIsHovered(true); onStatHoverStart(statName); }}
            onMouseLeave={() => { setIsHovered(false); onStatHoverEnd(); }}
        >
            <div className="stat-line">
                <span>{statName}</span>
                <div className="stat-value-container">
                    {enableCheats ? (
                         <input
                            type="text"
                            className="inline-edit-input stat-value-input"
                            value={localValue}
                            onChange={e => setLocalValue(e.target.value)}
                            onBlur={handleLocalSave}
                            onKeyDown={handleInputKeyDown}
                            onClick={e => e.stopPropagation()}
                        />
                    ) : (
                        <span>
                            {renderNonCheatValue()}
                        </span>
                    )}
                </div>
            </div>
             {hasBar && (
                <div className="stat-bar-container">
                    <div 
                        className={`stat-bar-fill ${getBarClass(statName)}`}
                        style={{ width: `${(current / max!) * 100}%` }}
                    ></div>
                </div>
            )}
             {isHovered && tooltipTitle && (
                <div className="info-tooltip-content">
                    {tooltipTitle.split('\n').map((line, index) => {
                        if (line.startsWith('---')) {
                            return <hr key={index} className="tooltip-divider" />;
                        }
                         if (line.includes(':') && index > 0) {
                            const [source, ...modifier] = line.split('(');
                            return (
                                <span key={index} className="tooltip-line tooltip-source-line">
                                    <span>{source.trim()}</span>
                                    <span className="tooltip-source-modifier">({modifier.join('(')}</span>
                                </span>
                            );
                        }
                        return (
                            <span key={index} className={`tooltip-line ${index === 0 ? 'tooltip-main-desc' : ''}`}>
                                {line}
                            </span>
                        );
                    })}
                </div>
            )}
        </div>
    );
};