/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useMemo, useCallback } from 'react';
import { NoInfoPlaceholder } from '../../ui/NoInfoPlaceholder';
import { INVENTORY_LIMIT, getRarityClass } from '../../../utils/game';
import { ItemDetailModal } from '../../modals/ItemDetailModal';
import { ItemEditorModal } from '../../modals/ItemEditorModal';
import { generateUniqueId } from '../../../utils/id';
import { useAppContext } from '../../contexts/AppContext';
// FIX: Removed unused imports for StarRating and calculateStarRating as the feature has been deprecated.
import type { Character, Stat, EquipmentSlot } from '../../../types';
import './InventoryTab.css';

interface BagTabProps {
    character: Character;
    isPlayerCharacter: boolean;
    onUpdateCharacterData: (characterId: string, updates: Partial<Character> | { stats: Stat[] }) => void;
    onItemAction: (actionDescription: string) => Promise<void>;
    enableCheats: boolean;
    onOpenPicker: (slot: EquipmentSlot) => void;
    // FIX: Add missing prop for API request counting.
    incrementApiRequestCount: () => void;
}

export const BagTab = ({ character, isPlayerCharacter, onUpdateCharacterData, onItemAction, enableCheats, onOpenPicker, incrementApiRequestCount }: BagTabProps) => {
    const { addToast } = useAppContext();
    const [detailedItem, setDetailedItem] = useState<Stat | null>(null);
    const [editingItem, setEditingItem] = useState<Stat | null>(null);
    
    const { unequippedItems, usedSlots, maxInventorySize } = useMemo(() => {
        const equippedIds = new Set(Object.values(character.equipment || {}).filter(Boolean));
        const items = character.stats?.filter(s => (s.category === 'Vật phẩm' || s.category === 'Nguyên liệu' || s.category === 'Sơ Đồ Chế Tạo') && !equippedIds.has(s.id!)) || [];
        
        const inventoryBonus = character.stats
            ?.filter(stat => stat.id && equippedIds.has(stat.id) && typeof stat.inventoryBonus === 'number')
            .reduce((sum, item) => sum + (item.inventoryBonus || 0), 0) || 0;
        
        return { 
            unequippedItems: items,
            usedSlots: items.length,
            maxInventorySize: INVENTORY_LIMIT + inventoryBonus
        };
    }, [character]);

    const handleEquipItem = useCallback((itemToEquip: Stat) => {
        if (!itemToEquip.slot || itemToEquip.slot === 'Không có') return;
        setDetailedItem(null);
        onOpenPicker(itemToEquip.slot as EquipmentSlot);
    }, [onOpenPicker]);
    
    const handleUnequipItem = useCallback((itemToUnequip: Stat) => {
        // This function is for equipped items, so it's not directly used in BagTab
        // but passed to ItemDetailModal for consistency.
    }, []);

    const handleRemoveItem = useCallback(() => {
        if (!detailedItem?.id) return;
        const newStats = character.stats.filter(s => s.id !== detailedItem.id);
        onUpdateCharacterData(character.id, { stats: newStats });
        addToast(`Đã ${enableCheats ? 'xóa' : 'vứt bỏ'}: ${detailedItem.name}.`, 'info');
        setDetailedItem(null);
    }, [character, onUpdateCharacterData, addToast, detailedItem, enableCheats]);

    const handleSaveItem = (updatedItem: Stat) => {
        onUpdateCharacterData(character.id, {
            stats: character.stats.map(s => s.id === updatedItem.id ? updatedItem : s)
        });
        addToast(`Đã cập nhật: ${updatedItem.name}`, 'success');
        setEditingItem(null);
    };

    return (
        <>
            {editingItem && <ItemEditorModal item={editingItem} onClose={() => setEditingItem(null)} onSave={handleSaveItem} />}
            {detailedItem && (
                <ItemDetailModal
                    item={detailedItem}
                    onClose={() => setDetailedItem(null)}
                    onUse={isPlayerCharacter ? () => onItemAction(`Sử dụng: '${detailedItem.name}'`) : undefined}
                    onEdit={() => { setEditingItem(detailedItem); setDetailedItem(null); }}
                    onUpdate={(updates) => onUpdateCharacterData(character.id, { stats: character.stats.map(s => s.id === detailedItem.id ? { ...s, ...updates } : s) })}
                    onRemove={handleRemoveItem}
                    enableCheats={enableCheats}
                    isPlayerCharacter={isPlayerCharacter}
                    isEquipped={false}
                    onEquip={() => handleEquipItem(detailedItem)}
                    onUnequip={() => {}} // Not applicable for bag items
                    equippedSetCount={0} // Not applicable
                    // FIX: Pass down the required incrementApiRequestCount prop.
                    incrementApiRequestCount={incrementApiRequestCount}
                />
            )}
             <div className="inventory-containers-panel">
                <header className="container-header">
                    <div className="container-title">
                        <h5>Túi đồ</h5>
                        <span className="inventory-capacity-display">({usedSlots} / {maxInventorySize})</span>
                    </div>
                </header>
                <div className="inventory-container-list">
                    {unequippedItems.length > 0 ? (
                        <div className="inventory-grid container-item-grid">
                            {unequippedItems.map((item) => (
                                <div
                                    key={item.id}
                                    className={`inventory-item-card ${getRarityClass(item.rarity)}`}
                                    onClick={() => setDetailedItem(item)}
                                    title={item.name}
                                >
                                    {item.imageUrl ? <img src={item.imageUrl} alt={item.name} className="inventory-item-image" /> : <div className="item-card-icon-placeholder"></div>}
                                    {item.quantity && item.quantity > 1 && <span className="item-quantity-badge">x{item.quantity}</span>}
                                    <div className="inventory-item-name-overlay">
                                        {item.rarity && <span className={`item-rarity-display ${getRarityClass(item.rarity)}`}>{item.rarity}</span>}
                                        <span className={getRarityClass(item.rarity)}>{item.name}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <NoInfoPlaceholder text="Túi đồ của bạn trống." />
                    )}
                </div>
            </div>
        </>
    );
};