/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useGameContext } from '../contexts/GameContext';
import { useToasts } from '../contexts/ToastContext';
import { AuctionHouseTab } from '../game/kb-tabs/AuctionHouseTab';
import { AuctionCartTab } from '../game/kb-tabs/AuctionCartTab';
import { AuctionInventoryTab } from '../game/kb-tabs/AuctionInventoryTab';
import { NoInfoPlaceholder } from '../ui/NoInfoPlaceholder';
import { ItemIcon } from '../ui/ItemIcon';
import { UsersIcon, ScrollTextIcon } from '../ui/Icons';
// FIX: Changed import to use the correct barrel file.
import { getCurrencyName } from '../../utils/game';
import type { AuctionItem, Character } from '../../types';
import './modals.css';
import './KnowledgeBaseModal.css';
import './AuctionModal.css';

interface AuctionModalProps {
    onClose: () => void;
    addToast: (message: string, type?: 'info' | 'success' | 'error' | 'warning') => void;
}

const AuctionDetailPanel = ({ item, character, currencyName }: { item: AuctionItem, character: Character, currencyName: string }) => {
    const bidLogRef = useRef<HTMLUListElement>(null);
    const sortedBidLog = useMemo(() => {
        return [...(item.bidLog || [])].sort((a, b) => b.amount - a.amount);
    }, [item.bidLog]);

    useEffect(() => {
        if (bidLogRef.current) {
            bidLogRef.current.scrollTop = 0;
        }
    }, [sortedBidLog]);

    return (
        <div className="auction-detail-content">
            <div className="detail-header">
                <div className="detail-icon"><ItemIcon item={item.item} /></div>
                <div className="detail-title">
                    <h4>{item.item.name}</h4>
                    <span>{item.item.description}</span>
                </div>
            </div>
            
            {item.item.effects && item.item.effects.length > 0 && (
                <div className="detail-section">
                    <h5>Thuộc tính & Hiệu ứng</h5>
                    <ul className="item-effects-list">
                        {item.item.effects.map((effect, index) => (
                            <li key={index} className="effect-line">
                                <span>{effect.targetStat}</span>
                                <span className={`effect-modifier ${effect.modifier.includes('+') ? 'positive' : 'negative'}`}>
                                    {effect.modifier}
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            <div className="auction-log-panel detail-log-panel">
                <h4><ScrollTextIcon /> Lịch sử Trả giá</h4>
                <ul className="bid-log-list" ref={bidLogRef}>
                    {sortedBidLog.map((bid, index) => (
                         <li key={index} className={`bid-log-item ${bid.bidder === character.name ? 'player-bid' : ''}`}>
                            <span className="log-bidder">{bid.bidder === character.name ? 'Bạn' : bid.bidder}</span>
                            <span className="log-amount">{bid.amount.toLocaleString()} {currencyName}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export const AuctionModal = ({ onClose, addToast }: AuctionModalProps) => {
    const { gameState, worldSettings } = useGameContext();
    const { character } = gameState;
    const [selectedItem, setSelectedItem] = useState<AuctionItem | null>(null);
    const currencyName = getCurrencyName(worldSettings.genre, worldSettings.setting);

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content auction-fullscreen-modal" onClick={e => e.stopPropagation()}>
                <header className="modal-header">
                    <h3>Nhà Đấu Giá</h3>
                    <div className="auction-header-actions">
                        <button className="lore-button" onClick={onClose}>Rời khỏi</button>
                    </div>
                </header>
                <div className="modal-body auction-main-layout">
                    {/* Left Column */}
                    <div className="auction-column player-actions-column">
                        <div className="player-column-section">
                            <AuctionInventoryTab addToast={addToast} />
                        </div>
                        <div className="player-column-section">
                           <AuctionCartTab addToast={addToast} />
                        </div>
                    </div>

                    {/* Center Column */}
                    <div className="auction-column auction-house-column">
                       <AuctionHouseTab addToast={addToast} onSelectItem={setSelectedItem} selectedItemId={selectedItem?.id || null} />
                    </div>

                    {/* Right Column */}
                    <div className="auction-column auction-details-column">
                        <h4>Chi tiết Vật phẩm</h4>
                        {selectedItem ? (
                            <AuctionDetailPanel item={selectedItem} character={character} currencyName={currencyName} />
                        ) : (
                            <NoInfoPlaceholder text="Chọn một vật phẩm để xem chi tiết." />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};