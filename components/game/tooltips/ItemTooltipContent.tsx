/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { formatCurrency } from '../../../utils/game';
import { ENTITY_TYPE_LABELS } from '../../../constants/gameConstants';
import type { EntityTooltipData, WorldSettings, Stat } from '../../../types';

interface ItemTooltipContentProps {
    data: EntityTooltipData;
    worldSettings: WorldSettings;
}

export const ItemTooltipContent = ({ data, worldSettings }: ItemTooltipContentProps) => {
    const { name, type, description, price, slot, effects, setName, setBonuses, tags } = data;
    const label = ENTITY_TYPE_LABELS[type as keyof typeof ENTITY_TYPE_LABELS] || type;
    
    return (
        <>
            <div className="tooltip-header">
                <span className={`tooltip-type entity-label-${(type || '').toLowerCase().replace(/\s/g, '-')}`}>{label}</span>
                <h4 className={`tooltip-name`}>{name}</h4>
            </div>
            <div className="tooltip-description">
                <p>{description}</p>
            </div>
    
            {(price || (slot && slot !== 'Không có')) && <hr className="tooltip-divider" />}
            <div className="status-details" style={{borderTop: 'none', marginTop: 0, paddingTop: 0}}>
                {typeof price === 'number' && (
                    <div className="status-detail-item">
                        <strong>Giá trị:</strong>
                        <span>{formatCurrency(price, worldSettings.genre, worldSettings.setting)}</span>
                    </div>
                )}
                {slot && slot !== 'Không có' && (
                     <div className="status-detail-item">
                        <strong>Loại:</strong>
                        <span>{slot}</span>
                    </div>
                )}
            </div>
    
            {effects && effects.length > 0 && (
                <>
                    <hr className="tooltip-divider" />
                    <div className="status-details">
                        <div className="status-detail-item">
                            <strong>Hiệu ứng:</strong>
                            <ul>
                                {effects.map((effect, index) => (
                                    <li key={index}>{effect.targetStat}: {effect.modifier}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </>
            )}
    
            {setName && setBonuses && (
                 <>
                    <hr className="tooltip-divider" />
                     <div className="item-set-info">
                        <h5 className="set-info-name">{setName}</h5>
                        <ul className="set-bonus-list">
                            {setBonuses.map(bonus => (
                                <li key={bonus.count} className={`set-bonus-item`}>
                                    <strong>({bonus.count})</strong> {bonus.description}
                                </li>
                            ))}
                        </ul>
                    </div>
                </>
            )}
            {tags && tags.length > 0 && (
                <>
                    <hr className="tooltip-divider" />
                    <div className="item-tags-container">
                        {tags.map(tag => (
                            <span key={tag} className="item-tag">{tag}</span>
                        ))}
                    </div>
                </>
            )}
        </>
    );
};