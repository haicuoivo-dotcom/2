/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import type { Stat } from '../../types';
import './AuctionItemPanel.css';

export const AuctionItemPanel = ({ item }: { item: Stat }) => {
    return (
        <div className="auction-item-panel-container">
            <div className={`auction-item-image-wrapper`}>
                {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.name} className="auction-item-image" />
                ) : (
                    <div className="auction-item-icon">
                        
                    </div>
                )}
            </div>
            <div className="auction-item-info">
                <h3 className={`auction-item-name`}>{item.name}</h3>
                <p className="auction-item-description">{item.description}</p>
                {item.effects && item.effects.length > 0 && (
                    <div className="auction-item-effects">
                        <h5>Hiệu ứng</h5>
                        <ul>
                            {item.effects.map((effect, index) => (
                                <li key={index}>
                                    <span>{effect.targetStat}</span>
                                    <span className={effect.modifier.includes('+') ? 'positive' : 'negative'}>
                                        {effect.modifier}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};