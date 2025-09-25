/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useRef, useState, useLayoutEffect, useEffect } from 'react';
import { useGameContext } from '../contexts/GameContext';
import { formatCurrency, getRarityClass } from '../../utils/game';
import type { Stat } from '../../types';
import './EntityTooltip.css';

interface ItemTooltipProps {
    data: {
        item: Stat;
        position: { top: number; left: number };
        equippedSetCount?: number;
    } | null;
}

export const ItemTooltip = ({ data }: ItemTooltipProps) => {
    const { worldSettings } = useGameContext();
    const tooltipRef = useRef<HTMLDivElement>(null);
    const [style, setStyle] = useState<React.CSSProperties>({});
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    useLayoutEffect(() => {
        if (tooltipRef.current) {
            const rect = tooltipRef.current.getBoundingClientRect();
            if (rect.width !== dimensions.width || rect.height !== dimensions.height) {
                setDimensions({ width: rect.width, height: rect.height });
            }
        }
    }, [data, dimensions.width, dimensions.height]);

    useEffect(() => {
        if (data && dimensions.width > 0 && dimensions.height > 0) {
            const { position } = data;
            const { innerWidth, innerHeight } = window;
            
            let top = position.top + 20;
            let left = position.left + 20;

            if (left + dimensions.width > innerWidth - 20) {
                left = position.left - dimensions.width - 20;
            }
            if (top + dimensions.height > innerHeight - 20) {
                top = position.top - dimensions.height - 20;
            }
            if (left < 10) left = 10;
            if (top < 10) top = 10;
            
            setStyle({
                top: `${top}px`,
                left: `${left}px`,
                visibility: 'visible',
                opacity: 1
            });
        } else {
            setStyle(prev => ({ ...prev, visibility: 'hidden', opacity: 0 }));
        }
    }, [data, dimensions]);

    if (!data) return null;
    
    const { item, equippedSetCount } = data;
    const rarityClass = getRarityClass(item.rarity);

    return (
        <div ref={tooltipRef} className={`item-tooltip ${rarityClass}`} style={style}>
            <header className="item-tooltip-header">
                <div className="item-image-box-tooltip">
                    {item.imageUrl ? <img src={item.imageUrl} alt={item.name} /> : <div className="item-image-placeholder-tooltip"></div>}
                </div>
                <div className="item-header-title-tooltip">
                    <h3 className={rarityClass}>{item.name}</h3>
                    {item.rarity && <div className={`item-header-tag-tooltip ${rarityClass}`}>{item.rarity}</div>}
                </div>
            </header>
            <div className="item-tooltip-body">
                <p className="item-description">{item.description}</p>
                
                {(item.slot && item.slot !== 'Không có' || (item.tags && item.tags.length > 0)) && (
                    <div className="item-tags-container">
                        {item.slot && item.slot !== 'Không có' && <span className="item-tag slot-tag">{item.slot}</span>}
                        {item.tags?.map(tag => (
                            <span key={tag} className="item-tag generic-tag">{tag}</span>
                        ))}
                    </div>
                )}

                {typeof item.price === 'number' && (
                    <div className="item-info-section item-price-section">
                        <h4>Giá trị</h4>
                        <div className="price-value"><span>{formatCurrency(item.price, worldSettings.genre, worldSettings.setting)}</span></div>
                    </div>
                )}
                {item.effects && item.effects.length > 0 && (
                    <div className="item-info-section">
                        <h4>Thuộc tính & Hiệu ứng</h4>
                        <ul className="item-effects-list">
                            {item.effects.map((effect, index) => (
                                <li key={index} className="effect-line">
                                    <span>{effect.targetStat}</span>
                                    <span className={`effect-modifier ${effect.modifier.includes('+') ? 'positive' : 'negative'}`}>{effect.modifier}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
                {item.setName && item.setBonuses && (
                    <div className="item-info-section">
                        <h4>Set: {item.setName} ({equippedSetCount}/{item.setBonuses[item.setBonuses.length - 1].count})</h4>
                        <ul className="set-bonus-list">
                            {item.setBonuses.map(bonus => (
                                <li key={bonus.count} className={`set-bonus-item ${(equippedSetCount || 0) >= bonus.count ? 'active-bonus' : ''}`}>
                                    <strong>({bonus.count})</strong> {bonus.description}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};