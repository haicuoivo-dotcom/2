/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useGameContext } from '../contexts/GameContext';
import { useToasts } from '../contexts/ToastContext';
import { useSettings } from '../contexts/SettingsContext';
// FIX: getCurrencyName is exported from utils/hydration, not utils/game.
import { gameTimeToMinutes, formatCurrency, getCurrencyName } from '../../utils/game';
import { AuctionItemPanel } from './AuctionItemPanel';
import { AuctionPlayerPanel } from './AuctionPlayerPanel';
import { AuctionNpcPanel } from './AuctionNpcPanel';
import { NoInfoPlaceholder } from '../ui/NoInfoPlaceholder';
import { useScreenOrientation } from '../../hooks/useScreenOrientation';
import { ClockIcon, GavelIcon, CrownIcon, UsersIcon, ScrollTextIcon } from '../ui/Icons';
import type { Character } from '../../types';
import './AuctionView.css';

interface AuctionViewProps {
    areCheatsEnabled: boolean;
    onUpdateCharacterData: (characterId: string, updates: Partial<Character>) => void;
    onOpenModal: (modalName: string) => void;
    onPause: () => void;
    onNavigateToMenu: () => void;
    isProcessing: boolean;
    onEntityMouseEnter: (event: React.MouseEvent, name: string, type: string) => void;
    onEntityMouseLeave: () => void;
}

const UnmemoizedAuctionView = ({ areCheatsEnabled, onUpdateCharacterData, onOpenModal, onPause, onNavigateToMenu, isProcessing, onEntityMouseEnter, onEntityMouseLeave }: AuctionViewProps) => {
    useScreenOrientation('landscape-primary');
    const { gameState, worldSettings, dispatch } = useGameContext();
    const { settings } = useSettings();
    const { addToast } = useToasts();
    const { auctionState, character, knowledgeBase } = gameState;
    const [timeLeft, setTimeLeft] = useState(0);
    const [isEnding, setIsEnding] = useState(false);
    const [mobileTab, setMobileTab] = useState('auction');
    
    const currencyName = getCurrencyName(worldSettings.genre, worldSettings.setting);
    
    const timerRef = useRef<number | null>(null);
    const npcBidTimeoutRef = useRef<number | null>(null);
    const logContainerRef = useRef<HTMLUListElement>(null);

    const isMobile = settings.mobileMode === 'on';

    const npcBidders = useMemo(() => {
        if (!auctionState?.bidLog) return [];
        const bidderNames = new Set<string>();
        auctionState.bidLog.forEach(bid => {
            if (bid.bidder !== character.name) {
                bidderNames.add(bid.bidder);
            }
        });
        return knowledgeBase.npcs.filter(npc => bidderNames.has(npc.name));
    }, [auctionState?.bidLog, character.name, knowledgeBase.npcs]);

    useEffect(() => {
        if (logContainerRef.current) {
            logContainerRef.current.scrollTop = 0;
        }
    }, [auctionState?.bidLog]);

    useEffect(() => {
        if (!auctionState || !auctionState.isActive) return;

        const updateTimer = () => {
            const remaining = Math.max(0, Math.round((auctionState.endTime - Date.now()) / 1000));
            setTimeLeft(remaining);
            if (remaining === 0 && !isEnding) {
                setIsEnding(true);
                const winner = auctionState.highestBidder;
                if (winner === character.name) {
                    addToast(`Bạn đã thắng đấu giá "${auctionState.item.name}" với giá ${formatCurrency(auctionState.currentBid, worldSettings.genre, worldSettings.setting)}!`, 'success');
                } else if (winner !== 'Chưa có') {
                    addToast(`${winner} đã thắng đấu giá "${auctionState.item.name}"!`, 'info');
                } else {
                    addToast(`Không có ai mua "${auctionState.item.name}".`, 'warning');
                }
                setTimeout(() => dispatch({ type: 'END_AUCTION' }), 4000);
            }
        };

        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = window.setInterval(updateTimer, 1000);
        updateTimer();

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
            if (npcBidTimeoutRef.current) clearTimeout(npcBidTimeoutRef.current);
        };
    }, [auctionState, dispatch, isEnding, addToast, character.name, currencyName, worldSettings]);
    
    useEffect(() => {
        if (!auctionState || !auctionState.isActive || isEnding) return;
        if (npcBidTimeoutRef.current) clearTimeout(npcBidTimeoutRef.current);

        const shouldNpcBid = Math.random() < 0.6;
        if (shouldNpcBid) {
            npcBidTimeoutRef.current = window.setTimeout(() => {
                if (!auctionState.isActive || isEnding) return;
                
                const isPlayerWinning = auctionState.highestBidder === character.name;
                const isNpcWinning = auctionState.highestBidder !== character.name && auctionState.highestBidder !== 'Chưa có';
                
                if (isPlayerWinning || (isNpcWinning && Math.random() < 0.4)) {
                     const npcBidAmount = Math.ceil(auctionState.currentBid * (1 + Math.random() * 0.15 + 0.05));
                     const availableBidders = knowledgeBase.npcs.filter(n => 
                        (auctionState.potentialBidders || []).includes(n.name) && 
                        n.name !== auctionState.highestBidder
                     );

                     const affordableBidders = availableBidders.filter(n => {
                        const moneyStat = n.stats?.find(s => s.name === currencyName);
                        const npcMoney = typeof moneyStat?.value === 'number' ? moneyStat.value : 0;
                        return npcMoney >= npcBidAmount;
                     });
                     
                     if(affordableBidders.length > 0) {
                        const randomNpc = affordableBidders[Math.floor(Math.random() * affordableBidders.length)];
                        dispatch({ type: 'PLACE_BID', payload: { bidAmount: npcBidAmount, bidderName: randomNpc.name } });
                     }
                }
            }, Math.random() * 4000 + 1500);
        }

    }, [auctionState, character.name, knowledgeBase.npcs, dispatch, isEnding, currencyName]);

    const handlePlaceBid = (bidAmount: number) => {
        dispatch({ type: 'PLACE_BID', payload: { bidAmount, bidderName: character.name } });
    };
    
    if (!auctionState || !auctionState.isActive) return null;

    const { item, currentBid, highestBidder, bidLog } = auctionState;
    const sortedBidLog = useMemo(() => {
        return [...(bidLog || [])].sort((a, b) => b.amount - a.amount);
    }, [bidLog]);
    
    const moneyStat = character.stats.find(s => s.name === currencyName);
    const parsedMoney = moneyStat?.value ? parseInt(String(moneyStat.value), 10) : NaN;
    const playerMoney = isNaN(parsedMoney) ? 0 : parsedMoney;

    const renderDesktopView = () => (
        <div className="auction-view-container">
            {/* Column 1: Controls & Item */}
            <div className="auction-column auction-controls-column">
                <div className="auction-controls-panel">
                    <h4>Chức năng</h4>
                    <button className="nav-button" onClick={() => onOpenModal('auctionInventory')} disabled={isProcessing}>Bán</button>
                    <button className="nav-button" onClick={() => onOpenModal('auctionCart')} disabled={isProcessing}>Giỏ</button>
                    <button className="nav-button" onClick={onPause} disabled={isProcessing}>Dừng</button>
                    <button className="nav-button danger" onClick={onNavigateToMenu}>Thoát</button>
                </div>
                <AuctionItemPanel item={item} />
            </div>

            {/* Column 2: Bidding Status & Log */}
            <div className="auction-column auction-status-column">
                <div className="auction-timer-display">
                    <div className="timer-icon"><ClockIcon /></div>
                    <div>
                        <div className="timer-value">{String(Math.floor(timeLeft / 60)).padStart(2, '0')}:{String(timeLeft % 60).padStart(2, '0')}</div>
                        <div className="timer-label">Thời Gian Còn Lại</div>
                    </div>
                </div>
                <div className="auction-bid-info">
                    <div className="bid-info-item">
                        <div className="bid-label"><GavelIcon /><span>Giá Hiện Tại</span></div>
                        <span className="bid-value">{formatCurrency(currentBid, worldSettings.genre, worldSettings.setting)}</span>
                    </div>
                    <div className="bid-info-item">
                        <div className="bid-label"><CrownIcon /><span>Người Trả Cao Nhất</span></div>
                        <span className={`bid-value ${highestBidder === character.name ? 'player' : ''}`}>
                            {highestBidder === character.name ? 'Bạn' : highestBidder}
                        </span>
                    </div>
                </div>
                <div className="auction-log-panel">
                    <h4><ScrollTextIcon /> Nhật ký Đấu giá</h4>
                    <ul className="bid-log-list" ref={logContainerRef}>
                        {sortedBidLog.map((bid, index) => (
                            <li key={index} className={`bid-log-item ${bid.bidder === character.name ? 'player-bid' : ''}`}>
                                <span className="log-bidder">{bid.bidder === character.name ? 'Bạn' : bid.bidder}</span>
                                <span className="log-amount">{formatCurrency(bid.amount, worldSettings.genre, worldSettings.setting)}</span>
                            </li>
                        ))}
                    </ul>
                </div>
                <AuctionPlayerPanel 
                    character={character} 
                    currencyName={currencyName} 
                    onPlaceBid={handlePlaceBid} 
                    isEnding={isEnding}
                    currentBid={currentBid}
                    playerMoney={playerMoney}
                    areCheatsEnabled={areCheatsEnabled}
                    onUpdateCharacterData={onUpdateCharacterData}
                    addToast={addToast}
                />
            </div>

            {/* Column 3: Participants */}
            <div className="auction-column auction-participants-column">
                <h4><UsersIcon /> Người tham gia khác</h4>
                <div className="auction-npc-grid">
                    {npcBidders.length > 0 ? (
                        npcBidders.map(npc => (
                            <AuctionNpcPanel 
                                key={npc.name}
                                npc={npc}
                                isHighestBidder={highestBidder === npc.name}
                                onMouseEnter={(e) => onEntityMouseEnter(e, npc.name, 'NPC')}
                                onMouseLeave={onEntityMouseLeave}
                            />
                        ))
                    ) : (
                        <NoInfoPlaceholder text="Chưa có ai khác đặt giá."/>
                    )}
                </div>
            </div>
        </div>
    );
    
    const renderMobileView = () => (
         <div className="auction-view-container">
            <div className="auction-mobile-tabs">
                <button className={`auction-mobile-tab-button ${mobileTab === 'auction' ? 'active' : ''}`} onClick={() => setMobileTab('auction')}>
                    <GavelIcon/> Sàn Đấu Giá
                </button>
                <button className={`auction-mobile-tab-button ${mobileTab === 'details' ? 'active' : ''}`} onClick={() => setMobileTab('details')} disabled={!auctionState?.item}>
                    <ScrollTextIcon/> Chi Tiết
                </button>
                <button className={`auction-mobile-tab-button ${mobileTab === 'player' ? 'active' : ''}`} onClick={() => setMobileTab('player')}>
                    <UsersIcon/> Người Chơi
                </button>
            </div>
            
            {mobileTab === 'auction' && (
                <div className="auction-mobile-tab-content active">
                     <div className="auction-timer-display">
                        <div className="timer-icon"><ClockIcon /></div>
                        <div>
                            <div className="timer-value">{String(Math.floor(timeLeft / 60)).padStart(2, '0')}:{String(timeLeft % 60).padStart(2, '0')}</div>
                            <div className="timer-label">Thời Gian Còn Lại</div>
                        </div>
                    </div>
                    <div className="auction-bid-info">
                        <div className="bid-info-item">
                            <div className="bid-label"><GavelIcon /><span>Giá Hiện Tại</span></div>
                            <span className="bid-value">{formatCurrency(currentBid, worldSettings.genre, worldSettings.setting)}</span>
                        </div>
                        <div className="bid-info-item">
                            <div className="bid-label"><CrownIcon /><span>Người Trả Cao Nhất</span></div>
                            <span className={`bid-value ${highestBidder === character.name ? 'player' : ''}`}>
                                {highestBidder === character.name ? 'Bạn' : highestBidder}
                            </span>
                        </div>
                    </div>
                    <div className="auction-log-panel">
                        <h4><ScrollTextIcon /> Nhật ký Đấu giá</h4>
                        <ul className="bid-log-list" ref={logContainerRef}>
                            {sortedBidLog.map((bid, index) => (
                                <li key={index} className={`bid-log-item ${bid.bidder === character.name ? 'player-bid' : ''}`}>
                                    <span className="log-bidder">{bid.bidder === character.name ? 'Bạn' : bid.bidder}</span>
                                    <span className="log-amount">{formatCurrency(bid.amount, worldSettings.genre, worldSettings.setting)}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}

            {mobileTab === 'details' && auctionState?.item && (
                 <div className="auction-mobile-tab-content active">
                    <AuctionItemPanel item={item} />
                </div>
            )}
            
            {mobileTab === 'player' && (
                 <div className="auction-mobile-tab-content active">
                     <AuctionPlayerPanel 
                        character={character} 
                        currencyName={currencyName} 
                        onPlaceBid={handlePlaceBid} 
                        isEnding={isEnding}
                        currentBid={currentBid}
                        playerMoney={playerMoney}
                        areCheatsEnabled={areCheatsEnabled}
                        onUpdateCharacterData={onUpdateCharacterData}
                        addToast={addToast}
                    />
                    <div className="auction-participants-column" style={{flexGrow: 1}}>
                        <h4><UsersIcon /> Người tham gia khác</h4>
                        <div className="auction-npc-grid">
                            {npcBidders.length > 0 ? (
                                npcBidders.map(npc => (
                                    <AuctionNpcPanel 
                                        key={npc.name}
                                        npc={npc}
                                        isHighestBidder={highestBidder === npc.name}
                                        onMouseEnter={(e) => onEntityMouseEnter(e, npc.name, 'NPC')}
                                        onMouseLeave={onEntityMouseLeave}
                                    />
                                ))
                            ) : (
                                <NoInfoPlaceholder text="Chưa có ai khác đặt giá."/>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

    return (
        <>
            {isMobile ? renderMobileView() : renderDesktopView()}
            {isEnding && (
                <div className="auction-end-overlay">
                    <div className="auction-end-message">
                        <h2>Đấu Giá Kết Thúc!</h2>
                        <p>
                            <strong>{item.name}</strong> đã được bán cho 
                            <strong> {highestBidder === character.name ? 'bạn' : highestBidder} </strong> 
                            với giá <strong>{formatCurrency(currentBid, worldSettings.genre, worldSettings.setting)}</strong>.
                        </p>
                    </div>
                </div>
            )}
        </>
    );
};

export const AuctionView = React.memo(UnmemoizedAuctionView);