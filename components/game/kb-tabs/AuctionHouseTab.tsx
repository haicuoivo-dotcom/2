/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useMemo, useEffect } from 'react';
import { useGameContext } from '../../contexts/GameContext';
// FIX: Corrected the import path for getCurrencyName.
import { gameTimeToMinutes, formatCurrency, getCurrencyName } from '../../../utils/game';
import { NoInfoPlaceholder } from '../../ui/NoInfoPlaceholder';
import { GavelIcon } from '../../ui/Icons';
import type { AuctionItem } from '../../../types';
import './AuctionHouseTab.css';

interface AuctionHouseTabProps {
    addToast: (message: string, type?: 'info' | 'success' | 'error' | 'warning') => void;
    onSelectItem: (item: AuctionItem | null) => void;
    selectedItemId: string | null;
}

export const AuctionHouseTab = ({ addToast, onSelectItem, selectedItemId }: AuctionHouseTabProps) => {
    const { gameState, worldSettings, dispatch } = useGameContext();
    const { character, auctionHouse, gameTime, knowledgeBase } = gameState;

    const [bidAmounts, setBidAmounts] = useState<Record<string, number>>({});
    const [timeTriggers, setTimeTriggers] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeTriggers(prev => prev + 1);
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const currencyName = getCurrencyName(worldSettings.genre, worldSettings.setting);
    const moneyStat = character.stats.find(s => s.name === currencyName);
    const playerMoney = typeof moneyStat?.value === 'number' ? moneyStat.value : 0;
    
    const handlePlaceBid = (auction: AuctionItem) => {
        const bidAmount = bidAmounts[auction.id] || 0;
        if (bidAmount <= auction.currentBid) {
            addToast('Giá đặt phải cao hơn giá hiện tại.', 'warning');
            return;
        }
        if (playerMoney < bidAmount) {
            addToast('Bạn không đủ tiền.', 'error');
            return;
        }
        dispatch({
            type: 'PLACE_BID',
            payload: { auctionId: auction.id, bidAmount, bidderName: character.name }
        });
        addToast(`Bạn đã đặt giá ${formatCurrency(bidAmount, worldSettings.genre, worldSettings.setting)} cho ${auction.item.name}.`, 'success');
        setBidAmounts(prev => ({ ...prev, [auction.id]: 0 }));

        // Simulate NPC outbidding
        const willNpcBid = Math.random() < 0.7; // 70% chance
        if (willNpcBid) {
            setTimeout(() => {
                const npcBidAmount = Math.ceil(bidAmount * (1 + Math.random() * 0.15 + 0.05)); // 5-20% higher
                const availableNpcs = knowledgeBase.npcs.filter(n => n.name !== character.name);
                if (availableNpcs.length > 0) {
                    const randomNpc = availableNpcs[Math.floor(Math.random() * availableNpcs.length)];
                    dispatch({
                        type: 'PLACE_BID',
                        payload: { auctionId: auction.id, bidAmount: npcBidAmount, bidderName: randomNpc.name }
                    });
                    addToast(`${randomNpc.displayName} đã trả giá cao hơn: ${formatCurrency(npcBidAmount, worldSettings.genre, worldSettings.setting)}!`, 'info');
                }
            }, Math.random() * 4000 + 1000); // 1-5 second delay
        }
    };

    const formatTimeRemaining = (endTime: AuctionItem['auctionEndTime']): string => {
        const endMinutes = gameTimeToMinutes(endTime);
        const currentMinutes = gameTimeToMinutes(gameTime);
        const diffMinutes = endMinutes - currentMinutes;

        if (diffMinutes <= 0) return "Đã kết thúc";
        const hours = Math.floor(diffMinutes / 60);
        const minutes = diffMinutes % 60;
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    };

    return (
        <div className="auction-house-tab-container">
            <h4 className="auction-house-title"><GavelIcon /> Sàn Đấu Giá</h4>
            <div className="auction-items-list">
                {auctionHouse.length > 0 ? auctionHouse.map(auction => {
                    const isPlayerHighestBidder = auction.highestBidder === character.name;
                    const minBid = auction.currentBid + 1;
                    return (
                        <div 
                            key={auction.id} 
                            className={`auction-item-card ${selectedItemId === auction.id ? 'selected' : ''}`}
                            onClick={() => onSelectItem(auction)}
                        >
                            <div className="auction-item-header">
                                <span className="auction-item-name">{auction.item.name}</span>
                            </div>
                            <div className="auction-item-details">
                                <span>Giá hiện tại: <strong>{formatCurrency(auction.currentBid, worldSettings.genre, worldSettings.setting)}</strong></span>
                                <span>Thời gian: <strong>{formatTimeRemaining(auction.auctionEndTime)}</strong></span>
                            </div>
                            <div className="auction-item-details">
                                <span>Người bán: <strong>{auction.sellerName === character.name ? 'Bạn' : auction.sellerName}</strong></span>
                                <span>Cao nhất: <strong className={isPlayerHighestBidder ? 'highest-bidder-pc' : ''}>{auction.highestBidder === character.name ? 'Bạn' : auction.highestBidder}</strong></span>
                            </div>
                            {auction.sellerName !== character.name && (
                                <div className="auction-bid-form">
                                    <input
                                        type="number"
                                        className="auction-bid-input"
                                        placeholder={`Tối thiểu ${minBid.toLocaleString()}`}
                                        min={minBid}
                                        value={bidAmounts[auction.id] || ''}
                                        onChange={(e) => setBidAmounts(prev => ({ ...prev, [auction.id]: parseInt(e.target.value, 10) || 0 }))}
                                        onClick={e => e.stopPropagation()}
                                    />
                                    <button 
                                        className="auction-bid-button" 
                                        onClick={(e) => { e.stopPropagation(); handlePlaceBid(auction); }} 
                                        disabled={!bidAmounts[auction.id] || bidAmounts[auction.id] <= auction.currentBid}
                                    >
                                        Đặt
                                    </button>
                                </div>
                            )}
                        </div>
                    );
                }) : (
                    <NoInfoPlaceholder text="Hiện không có vật phẩm nào đang được đấu giá." />
                )}
            </div>
        </div>
    );
};