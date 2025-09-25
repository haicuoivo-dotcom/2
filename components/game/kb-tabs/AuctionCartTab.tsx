/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { useGameContext } from '../../contexts/GameContext';
// FIX: getCurrencyName is exported from utils/hydration, not utils/game.
import { gameTimeToMinutes, formatCurrency, getCurrencyName } from '../../../utils/game';
import { NoInfoPlaceholder } from '../../ui/NoInfoPlaceholder';
import { ItemIcon } from '../../ui/ItemIcon';
import type { AuctionItem } from '../../../types';
import './AuctionInventoryTab.css'; // Re-use styles

interface AuctionCartTabProps {
    addToast: (message: string, type?: 'info' | 'success' | 'error' | 'warning') => void;
}

export const AuctionCartTab = ({ addToast }: AuctionCartTabProps) => {
    const { gameState, worldSettings } = useGameContext();
    const { character, auctionHouse, gameTime } = gameState;

    const currencyName = getCurrencyName(worldSettings.genre, worldSettings.setting);

    const playerAuctionItems = (auctionHouse || []).filter(item => item.sellerName === character.name);

    const formatTimeRemaining = (endTime: AuctionItem['auctionEndTime']): string => {
        const endMinutes = gameTimeToMinutes(endTime);
        const currentMinutes = gameTimeToMinutes(gameTime);
        const diffMinutes = endMinutes - currentMinutes;

        if (diffMinutes <= 0) return "Kết thúc";
        const hours = Math.floor(diffMinutes / 60);
        const minutes = diffMinutes % 60;
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    };

    return (
        <div className="auction-inventory-container">
            <h4>Vật phẩm đang bán</h4>
            {playerAuctionItems.length > 0 ? (
                <div className="auction-inventory-grid">
                    {playerAuctionItems.map(auction => {
                        const rarityClass = `rarity--${(auction.item.rarity || 'phổ thông').toLowerCase().replace(/\s+/g, '-')}`;
                        return (
                            <div key={auction.id} className={`inventory-item-card auction-cart-item ${rarityClass}`}>
                                <div className="item-card-icon-placeholder"><ItemIcon item={auction.item} /></div>
                                <div className="item-card-footer">
                                    <span className="inventory-item-name" title={auction.item.name}>{auction.item.name}</span>
                                    <span className="auction-cart-price">{formatCurrency(auction.currentBid, worldSettings.genre, worldSettings.setting)}</span>
                                    <span className="auction-cart-time">{formatTimeRemaining(auction.auctionEndTime)}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <NoInfoPlaceholder text="Bạn chưa bán vật phẩm nào." />
            )}
        </div>
    );
};
