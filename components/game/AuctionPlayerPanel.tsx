import { useState, useEffect } from 'react';
import { Character } from '../../types/character';
import { useGameContext } from '../contexts/GameContext';
import { type Stat } from '../../types/base';
import './AuctionPlayerPanel.css';

interface AuctionPlayerPanelProps {
    character: Character;
    currencyName: string; 
    onSubmitBid: (amount: number) => void;
}

export const AuctionPlayerPanel = ({ character, currencyName, onSubmitBid }: AuctionPlayerPanelProps) => {
    const [bidAmount, setBidAmount] = useState<number>(0);
    const { dispatch } = useGameContext();

    const getMoney = () => {
        const moneyStat = character.stats.find(s => s.name === currencyName || s.category === 'Tài sản');
        return moneyStat ? Number(moneyStat.value) : 0;
    };

    useEffect(() => {
        const money = getMoney();
        if (money < bidAmount) {
            setBidAmount(money);
        }
    }, [character.stats, bidAmount]);

    const handleBidAmountChange = (amount: number) => {
        const money = getMoney();
        if (amount < 0) amount = 0;
        if (amount > money) amount = money;
        setBidAmount(amount);
    };

    const handlePlaceBid = () => {
        const money = getMoney();
        if (bidAmount <= 0 || bidAmount > money) return;

        const moneyStat = character.stats.find(s => s.name === currencyName || s.category === 'Tài sản');
        let newStats: Stat[];

        if (moneyStat) {
            newStats = character.stats.map(s => {
                if (s.id === moneyStat.id) {
                    return {
                        ...s,
                        value: Number(s.value) - bidAmount,
                        category: 'Tài sản'
                    } as Stat;
                }
                return s;
            });
        } else {
            newStats = [
                ...character.stats,
                {
                    id: String(Date.now()),
                    name: currencyName,
                    value: -bidAmount,
                    category: 'Tài sản'
                } as Stat
            ];
        }

        dispatch({
            type: 'UPDATE_CHARACTER',
            payload: {
                characterName: character.name,
                updates: { stats: newStats }
            }
        });
        onSubmitBid(bidAmount);
    };

    return (
        <div className="auction-player-panel">
            <div className="player-info">
                <span className="money">Số tiền hiện có: {getMoney()}</span>
                <div className="bid-controls">
                    <input
                        type="number"
                        value={bidAmount}
                        onChange={e => handleBidAmountChange(Number(e.target.value))}
                        min={0}
                        max={getMoney()}
                    />
                    <button onClick={handlePlaceBid} disabled={bidAmount <= 0 || bidAmount > getMoney()}>
                        Đặt giá
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AuctionPlayerPanel;