/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect } from 'react';
import { PencilIcon } from '../ui/Icons';
import { generateUniqueId } from '../../utils/id';
import { formatCurrency } from '../../utils/game';
import { useGameContext } from '../contexts/GameContext';
import type { Character } from '../../types';
import './AuctionPlayerPanel.css';

interface AuctionPlayerPanelProps {
    character: Character;
    currencyName: string;
    onPlaceBid: (bidAmount: number) => void;
    isEnding: boolean;
    currentBid: number;
    playerMoney: number;
    areCheatsEnabled: boolean;
    onUpdateCharacterData: (characterId: string, updates: Partial<Character>) => void;
    addToast: (message: string, type?: 'info' | 'success' | 'error' | 'warning') => void;
}

export const AuctionPlayerPanel = ({
    character, currencyName, onPlaceBid, isEnding, currentBid, playerMoney, areCheatsEnabled, onUpdateCharacterData, addToast
}: AuctionPlayerPanelProps) => {
    const { worldSettings } = useGameContext();
    const [playerBid, setPlayerBid] = useState('');
    const [bidError, setBidError] = useState('');
    const [isEditingMoney, setIsEditingMoney] = useState(false);
    const [editedMoney, setEditedMoney] = useState(playerMoney.toString());
    
    const activeTitle = character.stats?.find(s => s.category === 'Danh Hiệu' && s.isEquipped) || character.stats?.find(s => s.category === 'Danh Hiệu');
    
    useEffect(() => {
        setEditedMoney(playerMoney.toString());
    }, [playerMoney]);

    useEffect(() => {
        if (!playerBid) {
            setBidError('');
            return;
        }

        const bidAmount = parseInt(playerBid, 10);
        
        if (isNaN(bidAmount) || bidAmount <= 0) {
            setBidError('Giá đặt phải là một số dương.');
        } else if (bidAmount <= currentBid) {
            setBidError(`Giá phải lớn hơn ${currentBid.toLocaleString()}.`);
        } else if (bidAmount > playerMoney) {
            setBidError('Không đủ tiền.');
        } else {
            setBidError('');
        }
    }, [playerBid, currentBid, playerMoney]);
    
    useEffect(() => {
        if (currentBid > 0) {
            // Suggest a bid ~5% higher, rounded up to a reasonable number
            const suggestedBid = Math.ceil((currentBid * 1.05) / 10) * 10;
            setPlayerBid(String(suggestedBid));
        }
    }, [currentBid]);

    const handlePlaceBid = () => {
        if (bidError || !playerBid) {
            return;
        }
        onPlaceBid(parseInt(playerBid, 10));
        setPlayerBid('');
    };

    const handleSaveMoney = () => {
        const newAmount = parseInt(editedMoney, 10);
        if (isNaN(newAmount) || newAmount < 0) {
            addToast("Số tiền không hợp lệ.", "error");
            setEditedMoney(playerMoney.toString()); // revert
            setIsEditingMoney(false);
            return;
        }

        const moneyStat = character.stats.find(s => s.name === currencyName || s.category === 'Tài sản');
        let newStats;

        if (moneyStat) {
            newStats = character.stats.map(s => 
                s.id === moneyStat.id ? { ...s, value: newAmount, name: currencyName } : s
            );
        } else {
            newStats = [
                ...character.stats,
                { 
                    id: generateUniqueId('stat-money'), 
                    name: currencyName, 
                    value: newAmount, 
                    category: 'Thuộc tính', 
                    description: `Tiền tệ chính của thế giới: ${currencyName}`
                }
            ];
        }

        onUpdateCharacterData(character.id, { stats: newStats });
        addToast("Đã cập nhật số tiền.", "success");
        setIsEditingMoney(false);
    };

    const suggestedBidPlaceholder = `Gợi ý: ${Math.ceil((currentBid * 1.05) / 10) * 10}`;

    return (
        <div className="auction-player-panel-container">
            <div className="auction-player-info">
                <h3 className="auction-player-name">
                     {activeTitle && activeTitle.name ? `${activeTitle.name} ` : ''}{character.displayName}
                </h3>
                <div 
                    className={`auction-player-money-display ${areCheatsEnabled ? 'editable' : ''}`} 
                    title={areCheatsEnabled && !isEditingMoney ? "Nhấp để sửa" : ""}
                    onClick={() => areCheatsEnabled && !isEditingMoney && setIsEditingMoney(true)}
                >
                    <span className="money-label">Số dư</span>
                     {isEditingMoney && areCheatsEnabled ? (
                        <input 
                            type="number" 
                            className="money-value-input"
                            value={editedMoney}
                            onChange={(e) => setEditedMoney(e.target.value)}
                            onBlur={handleSaveMoney}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSaveMoney();
                                if (e.key === 'Escape') {
                                    setIsEditingMoney(false);
                                    setEditedMoney(playerMoney.toString());
                                }
                            }}
                            onClick={e => e.stopPropagation()}
                            autoFocus
                        />
                    ) : (
                        <div className="money-value-container">
                            <span className="money-value">{formatCurrency(playerMoney, worldSettings.genre, worldSettings.setting)}</span>
                            {areCheatsEnabled && <button className="edit-name-button"><PencilIcon /></button>}
                        </div>
                    )}
                </div>
            </div>
            <div className="auction-player-controls">
                <div className="bid-input-wrapper">
                    <input 
                        type="number"
                        className="player-bid-input"
                        placeholder={suggestedBidPlaceholder}
                        value={playerBid}
                        onChange={(e) => setPlayerBid(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handlePlaceBid()}
                        disabled={isEnding}
                    />
                    {bidError && <p className="bid-error-message">{bidError}</p>}
                </div>
                <button className="player-bid-button" onClick={handlePlaceBid} disabled={isEnding || !!bidError || !playerBid}>
                    Đặt Giá
                </button>
            </div>
        </div>
    );
};