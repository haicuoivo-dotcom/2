/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import type { Character } from '../../types';
import './AuctionNpcPanel.css';

interface AuctionNpcPanelProps {
    npc: Character;
    isHighestBidder: boolean;
    onMouseEnter: (event: React.MouseEvent) => void;
    onMouseLeave: () => void;
}

export const AuctionNpcPanel = ({ npc, isHighestBidder, onMouseEnter, onMouseLeave }: AuctionNpcPanelProps) => {
    const characterInitial = (npc.displayName || npc.name).charAt(0).toUpperCase();

    return (
        <div
            className={`auction-npc-panel ${isHighestBidder ? 'highest-bidder' : ''}`}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
        >
            <div className="npc-icon">
                {npc.avatarUrl ? (
                    <img src={npc.avatarUrl} alt={npc.displayName} />
                ) : (
                    <span>{characterInitial}</span>
                )}
            </div>
            <span className="npc-name">{npc.displayName}</span>
        </div>
    );
};