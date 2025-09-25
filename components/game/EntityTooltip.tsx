/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useRef, useState, useLayoutEffect, useMemo } from 'react';
import { useGameContext } from '../contexts/GameContext';
import { DefaultTooltipContent } from './tooltips/DefaultTooltipContent';
import { NpcTooltipContent } from './tooltips/NpcTooltipContent';
import { ItemTooltipContent } from './tooltips/ItemTooltipContent';
import { StatusTooltipContent } from './tooltips/StatusTooltipContent';
import { ENTITY_TYPE_LABELS } from '../../constants/gameConstants';
import { calculateCombatPower, gameTimeToMinutes, formatRemainingTime, calculateEffectiveStats, calculatePreviewStats } from '../../utils/game';
import type { EntityTooltipData, GameState, Character, Stat, PersonalityTrait } from '../../types';
import './EntityTooltip.css';

interface ActiveTooltipInfo {
    name: string;
    type: string;
    position: { top: number; left: number };
    variant: EntityTooltipData['variant'];
    statId?: string;
}

interface EntityTooltipProps {
    data: ActiveTooltipInfo | null;
}

const UnmemoizedEntityTooltip = ({ data: activeTooltipInfo }: EntityTooltipProps) => {
    const { gameState, worldSettings } = useGameContext();
    const tooltipRef = useRef<HTMLDivElement>(null);
    const [style, setStyle] = useState<React.CSSProperties>({});

    const fullTooltipData: EntityTooltipData | null = useMemo(() => {
        if (!activeTooltipInfo || !gameState || !worldSettings) return null;

        const { name, type, statId } = activeTooltipInfo;
        const allChars = [gameState.character, ...(gameState.knowledgeBase?.npcs || [])];

        if (type === 'Trạng Thái' && statId) {
            let owner: Character | undefined;
            let status: Stat | undefined;

            for (const char of allChars) {
                status = char.stats?.find(s => s.id === statId);
                if (status) {
                    owner = char;
                    break;
                }
            }

            if (!status || !owner) return null;

            const effectiveStats = calculateEffectiveStats(owner);
            const previewStats = calculatePreviewStats(owner, statId);
            const detailedEffects = (status.effects || []).map(effect => {
                const originalStatData = previewStats.get(effect.targetStat);
                const modifiedStatData = effectiveStats.get(effect.targetStat);
                if (originalStatData && modifiedStatData) {
                    return { ...effect, originalValue: originalStatData.modifiedValue, newValue: modifiedStatData.modifiedValue };
                }
                return { ...effect };
            });

            let remainingTime = 'Vĩnh viễn';
            if (!status.isPermanent && status.expirationTime) {
                const totalMinutes = gameTimeToMinutes(status.expirationTime) - gameTimeToMinutes(gameState.gameTime);
                remainingTime = totalMinutes > 0 ? formatRemainingTime(totalMinutes) : 'Hết hạn';
            } else if (status.durationMinutes && !status.isPermanent) {
                remainingTime = formatRemainingTime(status.durationMinutes);
            }

            return {
                name: status.name,
                type: 'Trạng Thái',
                description: status.description,
                effects: detailedEffects,
                remainingTime,
                removalConditions: status.removalConditions,
                position: activeTooltipInfo.position,
                value: status.value,
            };
        }
        
        const normalizedEntityName = name.trim().toLowerCase();

        if (type === 'PC' || type === 'NPC') {
            const char = allChars.find(c => c.name.trim().toLowerCase() === normalizedEntityName || c.displayName.trim().toLowerCase() === normalizedEntityName);
            if (!char) return null;
            
            const moodStat = char.stats?.find(s => s.name === 'Tâm trạng');
            const statuses = char.stats?.filter(s => s.category === 'Trạng thái');
            const combatPower = calculateCombatPower(char);

            const tooltipData: EntityTooltipData = {
                name: char.name,
                displayName: char.displayName,
                type: type,
                description: char.backstory || '',
                position: activeTooltipInfo.position,
                avatarUrl: char.avatarUrl,
                stats: char.stats,
                // FIX: Removed .join(', ') to provide an array of PersonalityTrait objects, not a string, matching the type definition.
                personality: char.personality || [],
                mood: moodStat?.value as string,
                statuses: statuses,
                variant: activeTooltipInfo.variant,
                combatPower: combatPower,
                npcType: char.npcType,
            };
            
            if (type === 'NPC') {
                const relStat = char.stats?.find(s => s.category === 'Thiện cảm' && s.name === `[PC:${gameState.character.name}]`);
                if(relStat) {
                     tooltipData.stats = [...(tooltipData.stats || []), { ...relStat, name: 'Thiện cảm' }];
                }
            }
            return tooltipData;
        }

        const statCategories: { [key: string]: Stat['category'][] } = {
            'ITEM': ['Vật phẩm', 'Nguyên liệu', 'Trang phục', 'Sơ Đồ Chế Tạo'],
            'SKILL': ['Kỹ Năng'],
            'TECH': ['Công Pháp', 'Chiêu Thức', 'Khí Công', 'Thuật'],
        };
        const relevantCategories = statCategories[type];

        if (relevantCategories) {
            let foundStat: Stat | undefined = undefined;
            for (const char of allChars) {
                if (char && char.stats) {
                    foundStat = char.stats.find(s => s.name.trim().toLowerCase() === normalizedEntityName && relevantCategories.includes(s.category));
                    if (foundStat) break;
                }
            }
            if (foundStat) {
                return {
                    name: foundStat.name,
                    displayName: foundStat.name,
                    type: type,
                    description: foundStat.description,
                    position: activeTooltipInfo.position,
                    effects: foundStat.effects,
                    price: foundStat.price,
                    slot: foundStat.slot,
                    setName: foundStat.setName,
                    setBonuses: foundStat.setBonuses,
                    tags: foundStat.tags,
                };
            }
        }
        
        const keyMap: { [key: string]: keyof GameState['knowledgeBase'] } = {
            'LOC': 'locations',
            'FACTION': 'factions'
        };
        const kbKey = keyMap[type];
        if (kbKey && gameState.knowledgeBase) {
            const list = gameState.knowledgeBase[kbKey];
            const entity = Array.isArray(list) ? list.find((e: any) => e.name.trim().toLowerCase() === normalizedEntityName) : undefined;
            if (entity) {
                return {
                    name: entity.name,
                    type: type,
                    description: (entity as any).description,
                    position: activeTooltipInfo.position,
                };
            }
        }
        
        return {
            name: name,
            type: type,
            description: 'Thông tin chưa được khám phá.',
            position: activeTooltipInfo.position,
        };

    }, [activeTooltipInfo, gameState, worldSettings]);
    
    useLayoutEffect(() => {
        if (activeTooltipInfo && tooltipRef.current) {
            const { position } = activeTooltipInfo;
            const rect = tooltipRef.current.getBoundingClientRect();
            const { innerWidth, innerHeight } = window;
            
            let top = position.top + 20;
            let left = position.left + 10;

            if (left + rect.width > innerWidth - 20) {
                left = position.left - rect.width - 10;
            }
            if (top + rect.height > innerHeight - 20) {
                top = position.top - rect.height - 10;
            }
            if (left < 10) left = 10;
            if (top < 10) top = 10;
            
            setStyle({
                top: `${top}px`,
                left: `${left}px`,
            });
        }
    }, [activeTooltipInfo]);

    if (!activeTooltipInfo || !fullTooltipData || !gameState || !worldSettings) return null;
    
    const { type } = fullTooltipData;
    const label = ENTITY_TYPE_LABELS[type as keyof typeof ENTITY_TYPE_LABELS] || type;

    const isNpcTooltip = type === 'NPC' || type === 'PC';
    const isStatusTooltip = type === 'Trạng Thái';
    const isItemOrSkillTooltip = ['ITEM', 'SKILL', 'TECH'].includes(type) || ['Vật phẩm', 'Nguyên liệu'].includes(label);
    
    const getTooltipContent = () => {
        if (isStatusTooltip) return <StatusTooltipContent data={fullTooltipData} />;
        if (isNpcTooltip) return <NpcTooltipContent data={fullTooltipData} />;
        if (isItemOrSkillTooltip) return <ItemTooltipContent data={fullTooltipData} worldSettings={worldSettings} />;
        return <DefaultTooltipContent data={fullTooltipData} gameState={gameState as GameState} worldSettings={worldSettings} />;
    };
    
    // FIX: The prop 'data' was destructured and aliased to 'activeTooltipInfo', so 'data' was undefined. Using 'activeTooltipInfo' now to determine visibility.
    const tooltipContainerClass = `entity-tooltip ${isNpcTooltip ? 'npc-tooltip' : ''} ${isStatusTooltip || isItemOrSkillTooltip ? 'status-tooltip' : ''} ${activeTooltipInfo ? 'visible' : ''}`;

    return (
        <div
            ref={tooltipRef}
            className={tooltipContainerClass}
            style={style}
            onClick={(e) => e.stopPropagation()}
        >
            {getTooltipContent()}
        </div>
    );
};

export const EntityTooltip = React.memo(UnmemoizedEntityTooltip);
