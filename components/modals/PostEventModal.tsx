/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { useGameContext } from '../contexts/GameContext';
import { ItemIcon } from '../ui/ItemIcon';
import { getCurrencyName } from '../../utils/game';
import { formatCurrency } from '../../utils/game';
import type { PostEventSummary, Stat, PostAuctionSummary, PostCombatSummary, WorldSettings } from '../../types';
import './PostEventModal.css';

interface PostEventModalProps {
    summary: PostEventSummary | null;
    onClose: () => void;
    onContinue: () => Promise<void>;
}

const renderCombatSummary = (data: PostCombatSummary, worldSettings: WorldSettings) => {
    const isVictory = data.status === 'victory';
    
    return (
        <>
            <h2 className={isVictory ? 'victory-banner' : 'defeat-banner'}>
                {isVictory ? 'CHIẾN THẮNG!' : 'THẤT BẠI'}
            </h2>
            <div className="post-event-content">
                {isVictory ? (
                    <div className="rewards-section">
                        <h3>Phần thưởng</h3>
                        <div className="rewards-grid">
                            <div className="reward-item">
                                <span className="reward-label">Kinh nghiệm</span>
                                <span className="reward-value exp">{data.expGained.toLocaleString()} EXP</span>
                            </div>
                            <div className="reward-item">
                                <span className="reward-label">Tiền</span>
                                <span className="reward-value money">{formatCurrency(data.moneyGained, worldSettings.genre, worldSettings.setting)}</span>
                            </div>
                        </div>
                        {data.itemsGained.length > 0 && (
                            <div className="loot-section">
                                <h4>Vật phẩm thu được</h4>
                                <ul className="loot-list">
                                    {data.itemsGained.map((item: Stat) => (
                                        <li key={item.id} className="loot-item">
                                            <div className="loot-icon">
                                                {item.imageUrl ? <img src={item.imageUrl} alt={item.name} className="loot-image" /> : <ItemIcon item={item} />}
                                            </div>
                                            <span>{item.name}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                ) : (
                    <p className="defeat-message">
                        Bạn và đồng đội đã bị đánh bại. Hãy thử lại hoặc chuẩn bị tốt hơn cho lần sau.
                    </p>
                )}
            </div>
        </>
    );
};

const renderAuctionSummary = (data: PostAuctionSummary, worldSettings: WorldSettings) => {
    let title = "ĐẤU GIÁ KẾT THÚC";
    let message = `Vật phẩm "${data.itemName}" đã được bán cho ${data.winnerName} với giá ${formatCurrency(data.finalPrice, worldSettings.genre, worldSettings.setting)}.`;

    if (data.status === 'unsold') {
        message = `Vật phẩm "${data.itemName}" không có người mua và đã được trả lại cho người bán.`;
    } else if (data.status === 'won') {
        message = `Chúc mừng! Bạn đã thắng đấu giá vật phẩm "${data.itemName}" với giá ${formatCurrency(data.finalPrice, worldSettings.genre, worldSettings.setting)}. Vật phẩm sẽ được chuyển đến túi đồ của bạn trong thời gian sớm nhất.`;
    }

    return (
        <>
            <h2 className="auction-banner">{title}</h2>
            <div className="post-event-content">
                <p className="auction-message">{message}</p>
            </div>
        </>
    );
};

const UnmemoizedPostEventModal = ({ summary, onClose, onContinue }: PostEventModalProps) => {
    const { worldSettings } = useGameContext();

    if (!summary) return null;

    return (
        <div className="modal-overlay post-event-overlay">
            <div className="modal-content post-event-modal" onClick={e => e.stopPropagation()}>
                {summary.type === 'combat' && renderCombatSummary(summary.data, worldSettings)}
                {summary.type === 'auction' && renderAuctionSummary(summary.data, worldSettings)}
                <footer className="modal-footer">
                    {/* FIX: The onClick handler now awaits the onContinue promise to ensure asynchronous operations are handled correctly, preventing potential race conditions. */}
                    <button className="confirmation-button continue" onClick={async () => await onContinue()}>
                        Tiếp tục
                    </button>
                </footer>
            </div>
        </div>
    );
};

export const PostEventModal = React.memo(UnmemoizedPostEventModal);
