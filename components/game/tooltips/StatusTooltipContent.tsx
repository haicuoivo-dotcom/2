/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import type { EntityTooltipData } from '../../../types';

// This helper function is specific to status tooltips with stacking effects.
const parseNumericValue = (value: string | number | undefined): number => {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
        if (value.includes('/')) {
            const num = parseInt(value.split('/')[0], 10);
            return isNaN(num) ? 0 : num;
        }
        const num = parseInt(value, 10);
        return isNaN(num) ? 0 : num;
    }
    return 0;
};

interface StatusTooltipContentProps {
    data: EntityTooltipData;
}

export const StatusTooltipContent = ({ data }: StatusTooltipContentProps) => {
    const { name, type, description, effects, remainingTime, removalConditions } = data;
    const stackCount = data.value && typeof data.value === 'number' ? data.value : 1;
    const cleanName = name.replace(/^Trạng thái\s?/, '');

    return (
        <>
            <div className="tooltip-header">
                <span className={`tooltip-type entity-label-${type.toLowerCase().replace(/\s/g, '-')}`}>{type}</span>
                <h4 className="tooltip-name">{cleanName}{stackCount > 1 ? ` (x${stackCount})` : ''}</h4>
            </div>
            <div className="tooltip-description">
                <p>{description}</p>
            </div>
            <hr className="tooltip-divider" />
            <div className="status-details">
                {effects && effects.length > 0 && (
                    <div className="status-detail-item">
                        <strong>Hiệu ứng{stackCount > 1 ? ' (Tổng cộng)' : ''}:</strong>
                        <ul>
                            {effects.map((effect, index) => {
                                if (effect.originalValue !== undefined && effect.newValue !== undefined && effect.originalValue !== effect.newValue) {
                                    const isPositive = parseNumericValue(effect.newValue) > parseNumericValue(effect.originalValue);
                                    const changeClass = isPositive ? 'positive' : 'negative';
                                    return (
                                        <li key={index} className="detailed-effect">
                                            <span>{effect.targetStat}:</span>
                                            <div className="effect-change">
                                                <span className="original-value">{String(effect.originalValue)}</span>
                                                <span className="arrow">→</span>
                                                <span className={`new-value ${changeClass}`}>{String(effect.newValue)}</span>
                                                <span className="modifier">({effect.modifier})</span>
                                            </div>
                                        </li>
                                    );
                                }

                                const modifier = effect.modifier;
                                const match = modifier.match(/([+-])?(\d+)(%?)/);
                                if (match && stackCount > 1) {
                                    const sign = match[1] || '';
                                    const num = parseInt(match[2], 10);
                                    const suffix = match[3] || '';
                                    const total = num * stackCount;
                                    const totalModifier = `${sign}${total}${suffix}`;
                                    return <li key={index}>{effect.targetStat}: {totalModifier}</li>;
                                }
                                return <li key={index}>{effect.targetStat}: {modifier}</li>;
                            })}
                        </ul>
                    </div>
                )}
                 {remainingTime && (
                    <div className="status-detail-item">
                        <strong>Thời gian:</strong>
                        <span>{remainingTime}</span>
                    </div>
                )}
                {removalConditions && removalConditions.length > 0 && (
                    <div className="status-detail-item">
                        <strong>Hóa giải:</strong>
                        <span>{removalConditions.join(', ')}</span>
                    </div>
                )}
            </div>
        </>
    );
};