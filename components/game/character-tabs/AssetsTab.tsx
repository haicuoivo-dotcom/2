/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useMemo, useEffect } from 'react';
import { useGameContext } from '../../contexts/GameContext';
import { useAppContext } from '../../contexts/AppContext';
import { formatCurrency, getCurrencyName } from '../../utils/game';
import { generateUniqueId } from '../../utils/id';
import { PencilIcon } from '../../ui/Icons';
import { NoInfoPlaceholder } from '../../ui/NoInfoPlaceholder';
import type { Character, Stat } from '../../../types';
import './InventoryTab.css'; // Re-use some styles

interface AssetsTabProps {
    character: Character;
    isPlayerCharacter: boolean;
    onUpdateCharacterData: (characterId: string, updates: Partial<Character>) => void;
    enableCheats: boolean;
}

export const AssetsTab = ({ character, isPlayerCharacter, onUpdateCharacterData, enableCheats }: AssetsTabProps) => {
    const { worldSettings } = useGameContext();
    const { addToast } = useAppContext();
    
    const [editingAssetId, setEditingAssetId] = useState<string | null>(null);
    const [editedValue, setEditedValue] = useState('');

    const assetStats = useMemo(() => {
        return character.stats?.filter(s => s.category === 'Tài sản') || [];
    }, [character.stats]);

    const handleStartEdit = (stat: Stat) => {
        if (!enableCheats) return;
        setEditingAssetId(stat.id);
        setEditedValue(String(stat.value || 0));
    };

    const handleSaveMoney = (statId: string) => {
        const newAmount = parseInt(editedValue, 10);
        if (isNaN(newAmount) || newAmount < 0) {
            addToast("Số tiền không hợp lệ.", "error");
        } else {
            const newStats = character.stats.map(s => 
                s.id === statId ? { ...s, value: newAmount } : s
            );
            onUpdateCharacterData(character.id, { stats: newStats });
            addToast("Đã cập nhật số tiền.", "success");
        }
        setEditingAssetId(null);
    };

    const otherAssets = useMemo(() => {
        return character.stats?.filter(s => s.category === 'Tài sản' && assetStats.every(as => as.id !== s.id)) || [];
    }, [character.stats, assetStats]);

    return (
        <div className="assets-layout">
            <div className="inventory-money-panel">
                 <h4>Tiền Tệ</h4>
                 {assetStats.length > 0 ? (
                    <div className="currency-list">
                        {assetStats.map(stat => (
                             <div key={stat.id} className={`inventory-money ${enableCheats ? 'editable' : ''}`} title={enableCheats ? "Nhấp để sửa" : ""}>
                                {editingAssetId === stat.id && enableCheats ? (
                                    <input 
                                        type="number" 
                                        className="money-value-input" 
                                        value={editedValue} 
                                        onChange={(e) => setEditedValue(e.target.value)} 
                                        onBlur={() => handleSaveMoney(stat.id)} 
                                        onKeyDown={(e) => { if (e.key === 'Enter') handleSaveMoney(stat.id); if (e.key === 'Escape') setEditingAssetId(null); }} 
                                        autoFocus 
                                    />
                                ) : (
                                    <div className="money-value-container" onClick={() => handleStartEdit(stat)}>
                                        <span className="money-value">
                                            {(typeof stat.value === 'number' ? stat.value : 0).toLocaleString('vi-VN')} {stat.name}
                                        </span>
                                        {enableCheats && <span className="money-edit-icon"><PencilIcon /></span>}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <NoInfoPlaceholder text="Chưa sở hữu tiền tệ." />
                )}
            </div>
            <div className="char-detail-section">
                <h4>Tài sản khác</h4>
                {otherAssets.length > 0 ? (
                    <div className="data-list">
                        {otherAssets.map(asset => (
                            <div key={asset.id} className="stat-line">
                                <span>{asset.name}</span>
                                <span>{asset.value}</span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <NoInfoPlaceholder text="Không có tài sản nào khác." />
                )}
            </div>
        </div>
    );
};