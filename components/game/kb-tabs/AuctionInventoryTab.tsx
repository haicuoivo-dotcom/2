/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useMemo } from 'react';
import { useGameContext } from '../../contexts/GameContext';
// FIX: Corrected the function name from `getCurrencyNameForGenre` to `getCurrencyName` and it now requires `setting` as a second argument.
import { getCurrencyName } from '../../../utils/game';
import { NoInfoPlaceholder } from '../../ui/NoInfoPlaceholder';
import type { Stat } from '../../../types';
import './AuctionInventoryTab.css';

interface AuctionInventoryTabProps {
    addToast: (message: string, type?: 'info' | 'success' | 'error' | 'warning') => void;
}

export const AuctionInventoryTab = ({ addToast }: AuctionInventoryTabProps) => {
    const { gameState, worldSettings, dispatch } = useGameContext();
    const { character } = gameState;

    // State for the listing form
    const [itemToList, setItemToList] = useState<Stat | null>(null);
    const [startingBid, setStartingBid] = useState(100);
    const [duration, setDuration] = useState(24);

    const currencyName = getCurrencyName(worldSettings.genre, worldSettings.setting);

    const playerItems = useMemo(() => {
        return character.stats?.filter(s => s.category === 'Vật phẩm' || s.category === 'Nguyên liệu') || [];
    }, [character.stats]);
    
    const handleListItem = () => {
        if (!itemToList) return;
        if (startingBid <= 0) {
            addToast('Giá khởi điểm phải lớn hơn 0.', 'warning');
            return;
        }
        dispatch({
            type: 'LIST_ITEM_FOR_AUCTION',
            payload: { itemToSell: itemToList, startingBid, durationHours: duration }
        });
        addToast(`Đã đưa ${itemToList.name} lên sàn đấu giá.`, 'success');
        setItemToList(null);
        setStartingBid(100);
    };

    const renderListingForm = () => {
        if (!itemToList) return null;
        
        return (
            <div className="modal-overlay" onClick={() => setItemToList(null)}>
                <div className="modal-content auction-listing-form" onClick={e => e.stopPropagation()}>
                    <header className="modal-header">
                        <h3>Bán "{itemToList.name}"</h3>
                        <button onClick={() => setItemToList(null)} className="modal-close-button">×</button>
                    </header>
                    <div className="modal-body">
                         <div className="form-field">
                            <label htmlFor="startingBid">Giá khởi điểm ({currencyName})</label>
                            <input type="number" id="startingBid" value={startingBid} min="1" onChange={e => setStartingBid(parseInt(e.target.value, 10) || 0)} />
                         </div>
                         <div className="form-field">
                            <label htmlFor="duration">Thời gian đấu giá (giờ trong game)</label>
                             <select id="duration" value={duration} onChange={e => setDuration(parseInt(e.target.value, 10))}>
                                <option value="6">6 giờ</option>
                                <option value="12">12 giờ</option>
                                <option value="24">24 giờ (1 ngày)</option>
                                <option value="48">48 giờ (2 ngày)</option>
                            </select>
                         </div>
                         <button className="lore-button auction-list-item-button" onClick={handleListItem}>
                            Đưa lên Sàn
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="auction-inventory-container">
            {renderListingForm()}
            <h4>Vật phẩm của bạn</h4>
            {playerItems.length > 0 ? (
                <div className="auction-inventory-grid">
                    {playerItems.map(item => {
                         const marketPrice = item.price || 100;
                        return (
                             <div key={item.id} className="inventory-item-card">
                                <div className="item-card-icon-placeholder"></div>
                                <div className="item-card-footer">
                                    <span className="inventory-item-name" title={item.name}>{item.name}</span>
                                </div>
                                 {item.value && typeof item.value === 'number' && item.value > 1 && (
                                    <span className="inventory-item-quantity">x{item.value}</span>
                                )}
                                <div className="auction-item-overlay">
                                     <button className="auction-list-button" onClick={() => { setItemToList(item); setStartingBid(marketPrice); }}>Bán</button>
                                </div>
                             </div>
                        );
                    })}
                </div>
            ) : (
                <NoInfoPlaceholder text="Túi đồ của bạn trống." />
            )}
        </div>
    );
};