/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useEffect, useRef, useState, useMemo } from 'react';
import { StatusEffectIndicator } from './StatusEffectIndicator';
import { FloatingText } from './FloatingText';
import { STAT_HEALTH } from '../../constants/statConstants';
import { getStatusStyleClass, getStatusEffectType, calculateCombatPower } from '../../utils/game';
import { generateUniqueId } from '../../utils/id';
import type { Character, Stat, CombatEvent, EntityTooltipData } from '../../types';
import './CombatCharacterPanel.css';

interface ResourceBarProps {
    label: string;
    current: number;
    max: number;
    barClass: 'hp' | 'mp' | 'stamina';
    lastDamage?: number;
    onAnimationEnd?: (e: React.AnimationEvent) => void;
}

const ResourceBar = ({ label, current, max, barClass, lastDamage, onAnimationEnd }: ResourceBarProps) => {
    const percentage = max > 0 ? (current / max) * 100 : 0;
    const damagePercentage = max > 0 && lastDamage ? (lastDamage / max) * 100 : 0;
    
    return (
        <div className="resource-bar-container">
            <div className="resource-bar-info">
                <span className="resource-bar-label">{label}</span>
                <span className="resource-bar-value">{current} / {max}</span>
            </div>
            <div className="resource-bar-track">
                {damagePercentage > 0 && (
                     <div 
                        className="resource-bar-damage" 
                        style={{ left: `${percentage}%`, width: `${damagePercentage}%` }}
                        onAnimationEnd={onAnimationEnd}
                    />
                )}
                <div className={`resource-bar-fill ${barClass}`} style={{ width: `${percentage}%` }} />
            </div>
        </div>
    );
};

interface FloatingTextData {
    id: string;
    text: string;
    type: 'damage' | 'heal' | 'crit' | 'miss';
}

interface CombatCharacterPanelProps {
    character: Character;
    isPlayer: boolean;
    combatEvents: CombatEvent[];
    isCurrentTurn?: boolean;
    isLocked?: boolean;
    onTargetLock?: (characterId: string) => void;
    onMouseEnter?: (event: React.MouseEvent) => void;
    onMouseLeave?: () => void;
    onStatusMouseEnter?: (event: React.MouseEvent, status: Stat) => void;
    onStatusMouseLeave?: () => void;
}

export const CombatCharacterPanel = ({ character, isPlayer, combatEvents, isCurrentTurn, isLocked, onTargetLock, onMouseEnter, onMouseLeave, onStatusMouseEnter, onStatusMouseLeave }: CombatCharacterPanelProps) => {
    const [lastHealth, setLastHealth] = useState<number | null>(null);
    const [damageTaken, setDamageTaken] = useState(0);
    const [isDamaged, setIsDamaged] = useState(false);
    const [effectsToShow, setEffectsToShow] = useState<{ id: string; name: string; type: 'buff' | 'debuff' | 'neutral' }[]>([]);
    const [floatingTexts, setFloatingTexts] = useState<FloatingTextData[]>([]);
    const prevStatsRef = useRef<Stat[] | undefined>(undefined);

    const { healthStat, resourceStat, combatPower } = useMemo(() => {
        const health = character.stats?.find(s => s.name === STAT_HEALTH);
        const resource = character.stats?.find(s => ['Mana', 'Linh Lực', 'Nội Lực', 'Thể Lực'].includes(s.name));
        const power = calculateCombatPower(character);
        return { healthStat: health, resourceStat: resource, combatPower: power };
    }, [character]);
    
    let currentHealth = 100, maxHealth = 100;
    if (healthStat && typeof healthStat.value === 'string') {
        const [current, max] = healthStat.value.split('/').map(Number);
        if (!isNaN(current) && !isNaN(max)) {
            currentHealth = current;
            maxHealth = max;
        }
    }

    let currentResource = 0, maxResource = 0, resourceLabel = '', resourceClass: 'mp' | 'stamina' = 'mp';
    if (resourceStat && typeof resourceStat.value === 'string') {
        const [current, max] = resourceStat.value.split('/').map(Number);
        if (!isNaN(current) && !isNaN(max)) {
            currentResource = current;
            maxResource = max;
            resourceLabel = resourceStat.name;
            if(resourceStat.name === 'Thể Lực') resourceClass = 'stamina';
        }
    }


    useEffect(() => {
        if (lastHealth !== null && currentHealth < lastHealth) {
            setDamageTaken(lastHealth - currentHealth);
        }
        setLastHealth(currentHealth);
    }, [currentHealth, lastHealth]);
    
    useEffect(() => {
        if (prevStatsRef.current === undefined) {
            prevStatsRef.current = character.stats;
            return;
        }

        const prevStatuses = new Set(
            (prevStatsRef.current ?? [])
                .filter(s => s.category === 'Trạng thái')
                .map(s => s.name)
        );
        const currentStatuses = character.stats?.filter(s => s.category === 'Trạng thái') || [];

        const newEffects = currentStatuses
            .filter(s => !prevStatuses.has(s.name))
            .map(s => ({
                id: s.id || generateUniqueId('status-effect'),
                name: s.name,
                type: getStatusEffectType(s)
            }));

        if (newEffects.length > 0) {
            setEffectsToShow(prev => [...prev, ...newEffects]);
        }

        prevStatsRef.current = character.stats;
    }, [character.stats]);
    
    useEffect(() => {
        const myEvents = combatEvents.filter(e => e.targetId === character.id);
        if (myEvents.length > 0) {
            const newTexts = myEvents.map(event => ({
                id: event.id,
                text: event.type === 'miss' ? (event.text || 'Miss!') : (event.type === 'heal' ? `+${event.value}` : String(event.value)),
                type: event.type
            }));
            setFloatingTexts(prev => [...prev, ...newTexts]);
            
            if (myEvents.some(e => e.type === 'damage' || e.type === 'crit')) {
                setIsDamaged(true);
            }
        }
    }, [combatEvents, character.id]);


    const handleEffectComplete = (id: string) => {
        setEffectsToShow(prev => prev.filter(effect => effect.id !== id));
    };

    const handleDamageAnimationEnd = (e: React.AnimationEvent) => {
        if (e.animationName === 'damage-flash' || e.animationName === 'damage-shake') {
            setIsDamaged(false);
        }
        if (e.animationName === 'damage-bar-flash') {
            setDamageTaken(0);
        }
    };

    const handleFloatingTextComplete = (id: string) => {
        setFloatingTexts(prev => prev.filter(text => text.id !== id));
    };

    const statuses = character.stats?.filter(s => s.category === 'Trạng thái' && s.name !== 'Trạng thái Tử vong') || [];
    const activeTitle = character.stats?.find(s => s.category === 'Danh Hiệu' && s.isEquipped) || character.stats?.find(s => s.category === 'Danh Hiệu');
    
    return (
        <div 
            className={`combat-character-panel ${isPlayer ? 'player-panel' : 'opponent-panel'} ${isDamaged ? 'damaged' : ''} ${isCurrentTurn ? 'current-turn' : ''} ${isLocked ? 'locked' : ''}`} 
            onAnimationEnd={handleDamageAnimationEnd} 
            onMouseEnter={onMouseEnter} 
            onMouseLeave={onMouseLeave}
            onClick={() => onTargetLock && onTargetLock(character.id)}
        >
             <div className="status-effects-overlay">
                {effectsToShow.map(effect => (
                    <StatusEffectIndicator
                        key={effect.id}
                        name={effect.name}
                        type={effect.type}
                        onComplete={() => handleEffectComplete(effect.id)}
                    />
                ))}
                 {floatingTexts.map(text => (
                    <FloatingText
                        key={text.id}
                        text={text.text}
                        type={text.type}
                        onComplete={() => handleFloatingTextComplete(text.id)}
                    />
                ))}
            </div>
            <div className="combat-character-info">
                <h3 className={`combat-character-name ${isPlayer ? 'pc-name' : 'npc-name'}`}>
                    {activeTitle && activeTitle.name ? `${activeTitle.name} ` : ''}{character.displayName}
                </h3>
                
                <ResourceBar label="Sinh lực" current={currentHealth} max={maxHealth} barClass="hp" lastDamage={damageTaken} onAnimationEnd={handleDamageAnimationEnd} />
                
                {resourceStat && (
                    <ResourceBar label={resourceLabel} current={currentResource} max={maxResource} barClass={resourceClass} />
                )}
                
                 <div className="combat-power-display">
                    <span className="combat-power-icon">⚡️</span>
                    <span className="combat-power-label">Lực chiến</span>
                    <span className="combat-power-value">{combatPower.toLocaleString('vi-VN')}</span>
                </div>

                {statuses.length > 0 && (
                    <div className="combat-statuses">
                        {statuses.map(status => {
                            const statusClass = getStatusStyleClass(status);
                            return (
                                <div 
                                    key={status.id} 
                                    className={`combat-status-badge ${statusClass}`} 
                                    title={status.description}
                                    onMouseEnter={(e) => onStatusMouseEnter?.(e, status)}
                                    onMouseLeave={onStatusMouseLeave}
                                >
                                    {status.name}{typeof status.value === 'number' && status.value > 1 ? ` (x${status.value})` : ''}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};