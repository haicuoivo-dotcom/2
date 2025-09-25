/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useMemo, useRef, useCallback } from 'react';
import { useGameContext } from '../../contexts/GameContext';
import { useToasts } from '../../contexts/ToastContext';
import { NoInfoPlaceholder } from '../../ui/NoInfoPlaceholder';
import { generateUniqueId } from '../../../utils/id';
import { getRarityClass } from '../../../utils/game';
import { LEFT_HAND_SLOT, RIGHT_HAND_SLOT, DEFAULT_EQUIPMENT_SLOTS } from '../../../constants/statConstants';
import { ItemTooltip } from '../ItemTooltip';
import { ItemIcon } from '../../ui/ItemIcon';
import { LockIcon, PencilIcon } from '../../ui/Icons';
import { FormField } from '../../ui/FormField';
import type { Character, Stat, EquipmentSlot, OutfitSet } from '../../../types';
import './InventoryTab.css';

interface InventoryTabProps {
    character: Character;
    onOpenPicker: (slot: EquipmentSlot) => void;
}

const equipmentGroups: { title: string; slots: EquipmentSlot[] }[] = [
    {
        title: 'Vũ khí & Giáp chính',
        slots: ['Tay Phải', 'Tay Trái', 'Mũ', 'Thân ngoài', 'Thân trên', 'Thân dưới', 'Găng Tay', 'Giày'],
    },
    {
        title: 'Phụ kiện',
        slots: ['Phụ Kiện Cổ', 'Áo choàng', 'Thắt Lưng', 'Nhẫn 1', 'Nhẫn 2', 'Tai', 'Hoa tai', 'Cổ tay trái', 'Cổ tay phải'],
    },
    {
        title: 'Trang bị Đặc biệt',
        slots: ['Mặt', 'Áo Lót', 'Quần Lót', 'Phụ Kiện chân', 'Linh Thú', 'Túi 1', 'Túi 2', 'Phụ kiện khác'],
    },
];

const OUTFIT_CATEGORIES = ['Chưa phân loại', 'Chiến đấu', 'Thường ngày', 'Dự tiệc', 'Khám phá', 'Khác'];

// NEW: Component to edit a single outfit
const OutfitEditor = ({
    character,
    initialOutfit,
    onSave,
    onCancel,
    onOpenPicker,
}: {
    character: Character,
    initialOutfit: OutfitSet,
    onSave: (outfit: OutfitSet) => void,
    onCancel: () => void,
    onOpenPicker: (slot: EquipmentSlot, onEquip: (item: Stat, slot: EquipmentSlot) => void, onUnequip: (slot: EquipmentSlot) => void) => void
}) => {
    const [draft, setDraft] = useState(initialOutfit);

    const handleEquip = (item: Stat, slot: EquipmentSlot) => {
        const newEquipment = { ...draft.equipment };
        newEquipment[slot] = item.id;
        if (item.tags?.includes('2-tay')) {
            newEquipment[RIGHT_HAND_SLOT] = item.id;
            newEquipment[LEFT_HAND_SLOT] = item.id;
        }
        setDraft(prev => ({ ...prev, equipment: newEquipment }));
    };

    const handleUnequip = (slot: EquipmentSlot) => {
        const newEquipment = { ...draft.equipment };
        const itemId = newEquipment[slot];
        const item = itemId ? character.stats.find(s => s.id === itemId) : undefined;
        if (item?.tags?.includes('2-tay')) {
            newEquipment[RIGHT_HAND_SLOT] = undefined;
            newEquipment[LEFT_HAND_SLOT] = undefined;
        } else {
            newEquipment[slot] = undefined;
        }
        setDraft(prev => ({ ...prev, equipment: newEquipment }));
    };
    
    const equipmentMap = useMemo(() => {
        const itemMap = new Map((character.stats || []).map(item => [item.id!, item]));
        const eqMap = new Map<EquipmentSlot, Stat | undefined>();
        Object.entries(draft.equipment || {}).forEach(([slot, itemId]) => {
            if (itemId) {
                const item = itemMap.get(itemId);
                if (item?.isPlaceholderFor) {
                    eqMap.set(slot as EquipmentSlot, itemMap.get(item.isPlaceholderFor));
                } else {
                    eqMap.set(slot as EquipmentSlot, item);
                }
            }
        });
        return eqMap;
    }, [draft.equipment, character.stats]);

    return (
        <div className="wardrobe-item expanded editor-view">
            <div className="outfit-details">
                <div className="equipment-categories-grid">
                    {equipmentGroups.map(group => (
                        <div key={group.title} className="equipment-category">
                            <h5 className="equipment-category-title" style={{fontSize: '0.9rem'}}>{group.title}</h5>
                             <div className="equipment-category-list">
                                {group.slots.map(slot => {
                                    const item = equipmentMap.get(slot);
                                    if (slot === LEFT_HAND_SLOT && equipmentMap.get(RIGHT_HAND_SLOT)?.tags?.includes('2-tay')) {
                                        return (
                                            <div key={slot} className="equipment-slot-item placeholder">
                                                <div className="slot-identifier"><span className="slot-icon"><LockIcon /></span><span className="slot-label">{slot}</span></div>
                                                <span className="item-name-display placeholder-text">Vũ khí 2 tay</span>
                                            </div>
                                        );
                                    }
                                    const rarityClass = item ? getRarityClass(item.rarity) : '';
                                    return (
                                        <div key={slot} className={`equipment-slot-item ${item ? `equipped ${rarityClass}` : 'empty'}`} onClick={() => onOpenPicker(slot, handleEquip, handleUnequip)}>
                                            <div className="slot-identifier">
                                                <span className="slot-icon">{item && item.imageUrl ? <img src={item.imageUrl} alt={item.name} className="slot-item-image" /> : null}</span>
                                                <span className="slot-label">{slot.replace(' (Tay Phải)', '').replace(' (Tay Trái)', '')}</span>
                                            </div>
                                            {item ? (
                                                <span className={`item-name-display ${rarityClass}`}>{item.name}</span>
                                            ) : (
                                                <span className="item-name-display empty-text">Trống</span>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
                <div className="wardrobe-editor-actions">
                    <button className="lore-button cancel" onClick={onCancel}>Hủy</button>
                    <button className="lore-button save-apply" onClick={() => onSave(draft)}>Lưu Thay đổi</button>
                </div>
            </div>
        </div>
    );
};

export const InventoryTab = ({ character, onOpenPicker }: InventoryTabProps) => {
    const { gameState, dispatch } = useGameContext();
    const { addToast } = useToasts();
    const [hoveredEquippedItem, setHoveredEquippedItem] = useState<{ item: Stat; position: { top: number; left: number }; equippedSetCount: number; } | null>(null);
    const [activeEquipmentSubTab, setActiveEquipmentSubTab] = useState<'equipped' | 'wardrobe'>('equipped');
    const [newOutfitName, setNewOutfitName] = useState('');
    const [editingOutfit, setEditingOutfit] = useState<OutfitSet | null>(null);
    const [editingOutfitInfo, setEditingOutfitInfo] = useState<{ id: string, field: 'name' | 'category', value: string } | null>(null);
    
    const [pickerState, setPickerState] = useState<{
        isOpen: boolean;
        targetSlot: EquipmentSlot | null;
        onEquip: (item: Stat, slot: EquipmentSlot) => void;
        onUnequip: (slot: EquipmentSlot) => void;
        currentlyEquippedItem?: Stat;
        inventory: Stat[];
    }>({ isOpen: false, targetSlot: null, onEquip: () => {}, onUnequip: () => {}, inventory: [] });


    const nameInputRef = useRef<HTMLInputElement>(null);

    const { equipmentMap, allEquippableItems } = useMemo(() => {
        const itemMap = new Map((character.stats || []).map(item => [item.id!, item]));
        const eqMap = new Map<EquipmentSlot, Stat | undefined>();
        Object.entries(character.equipment || {}).forEach(([slot, itemId]) => {
            if (itemId) {
                const item = itemMap.get(itemId);
                if (item?.isPlaceholderFor) {
                    eqMap.set(slot as EquipmentSlot, itemMap.get(item.isPlaceholderFor));
                } else {
                    eqMap.set(slot as EquipmentSlot, item);
                }
            }
        });
        const allEquippable = (character.stats || []).filter(s => s.slot && s.slot !== 'Không có');
        return { equipmentMap: eqMap, allEquippableItems: allEquippable };
    }, [character]);
    
    const handleOpenWardrobePicker = useCallback((
        slot: EquipmentSlot,
        onEquip: (item: Stat, slot: EquipmentSlot) => void,
        onUnequip: (slot: EquipmentSlot) => void
    ) => {
        const currentlyEquippedInDraftId = editingOutfit?.equipment[slot];
        const currentlyEquippedInDraft = currentlyEquippedInDraftId
            ? character.stats.find(s => s.id === currentlyEquippedInDraftId)
            : undefined;

        setPickerState({
            isOpen: true,
            targetSlot: slot,
            onEquip,
            onUnequip,
            inventory: allEquippableItems,
            currentlyEquippedItem: currentlyEquippedInDraft,
        });
    }, [editingOutfit, character.stats, allEquippableItems]);

    const handleEquippedItemMouseEnter = (event: React.MouseEvent, item: Stat) => {
        const equippedItemIds = new Set(Object.values(character.equipment || {}).filter(Boolean));
        const equippedItems = character.stats?.filter(stat => stat.id && equippedItemIds.has(stat.id)) || [];
        const count = item.setName ? equippedItems.filter(i => i.setName === item.setName).length : 0;
        
        setHoveredEquippedItem({ item, position: { top: event.clientY, left: event.clientX }, equippedSetCount: count });
    };

    const handleEquippedItemMouseLeave = () => setHoveredEquippedItem(null);

    const handleSaveOutfit = () => {
        if (!newOutfitName.trim()) { addToast("Vui lòng nhập tên cho bộ trang bị.", "warning"); return; }
        dispatch({ type: 'SAVE_OUTFIT', payload: { characterName: character.name, outfitName: newOutfitName.trim() } });
        addToast(`Đã lưu bộ trang bị "${newOutfitName.trim()}".`, "success");
        setNewOutfitName('');
    };

    const handleEquipOutfit = (outfitId: string) => {
        dispatch({ type: 'EQUIP_OUTFIT', payload: { characterName: character.name, outfitId } });
        addToast("Đã thay trang bị.", "success");
    };
    
    const handleDeleteOutfit = (outfitId: string) => {
        dispatch({ type: 'DELETE_OUTFIT', payload: { characterName: character.name, outfitId } });
        addToast("Đã xóa bộ trang bị.", "info");
    };

    const handleStartEditInfo = (outfit: OutfitSet, field: 'name' | 'category') => {
        setEditingOutfitInfo({ id: outfit.id, field, value: field === 'name' ? outfit.name : (outfit.category || 'Chưa phân loại') });
        setTimeout(() => nameInputRef.current?.focus(), 0);
    };

    const handleSaveEditInfo = () => {
        if (!editingOutfitInfo) return;
        if (editingOutfitInfo.field === 'name') {
            if (!editingOutfitInfo.value.trim()) { addToast("Tên không được để trống.", "warning"); return; }
            dispatch({ type: 'RENAME_OUTFIT', payload: { characterName: character.name, outfitId: editingOutfitInfo.id, newName: editingOutfitInfo.value.trim() } });
        } else {
            dispatch({ type: 'UPDATE_OUTFIT_CATEGORY', payload: { characterName: character.name, outfitId: editingOutfitInfo.id, newCategory: editingOutfitInfo.value } });
        }
        setEditingOutfitInfo(null);
    };

    const handleSaveEditedOutfit = (updatedOutfit: OutfitSet) => {
        dispatch({ type: 'UPDATE_OUTFIT', payload: { characterName: character.name, outfitId: updatedOutfit.id, newEquipment: updatedOutfit.equipment } });
        addToast(`Đã lưu thay đổi cho bộ trang bị "${updatedOutfit.name}".`, 'success');
        setEditingOutfit(null);
    };

    const renderSlot = (slot: EquipmentSlot) => {
        const item = equipmentMap.get(slot);
        if (slot === LEFT_HAND_SLOT && equipmentMap.get(RIGHT_HAND_SLOT)?.tags?.includes('2-tay')) {
            return (
                <div key={slot} className="equipment-slot-item placeholder">
                    <div className="slot-identifier"><span className="slot-icon"><LockIcon /></span><span className="slot-label">{slot}</span></div>
                    <span className="item-name-display placeholder-text">Vũ khí 2 tay</span>
                </div>
            );
        }
        const rarityClass = item ? getRarityClass(item.rarity) : '';
        return (
            <div key={slot} className={`equipment-slot-item ${item ? `equipped ${rarityClass}` : 'empty'}`} onClick={() => onOpenPicker(slot)} onMouseEnter={item ? (e) => handleEquippedItemMouseEnter(e, item) : undefined} onMouseLeave={handleEquippedItemMouseLeave} title={item ? `${slot}: ${item.name}` : `Trang bị ${slot}`}>
                <div className="slot-identifier">
                    <span className="slot-label">{slot.replace(' (Tay Phải)', '').replace(' (Tay Trái)', '')}</span>
                </div>
                {item ? (
                    <div className="item-info-group">
                        <div className="item-name-group">
                            <span className={`item-name-display ${rarityClass}`}>{item.name}</span>
                        </div>
                        {item.rarity && <span className={`item-rarity-display ${rarityClass}`}>{item.rarity}</span>}
                    </div>
                ) : (
                    <span className="item-name-display empty-text">Trống</span>
                )}
            </div>
        );
    };

    return (
        <>
            <ItemTooltip data={hoveredEquippedItem} />
            <div className="inventory-tab-container">
                <div className="equipment-view">
                    <div className="equipment-sub-tabs">
                        <button className={`equipment-sub-tab-button ${activeEquipmentSubTab === 'equipped' ? 'active' : ''}`} onClick={() => setActiveEquipmentSubTab('equipped')}>Đang Mặc</button>
                        <button className={`equipment-sub-tab-button ${activeEquipmentSubTab === 'wardrobe' ? 'active' : ''}`} onClick={() => setActiveEquipmentSubTab('wardrobe')}>Tủ Đồ</button>
                    </div>
                    {activeEquipmentSubTab === 'equipped' && (
                        <div className="equipment-categories-grid">
                            {equipmentGroups.map(group => (
                                <div key={group.title} className="equipment-category">
                                    <h5 className="equipment-category-title">{group.title}</h5>
                                    <div className="equipment-category-list">{group.slots.map(slot => renderSlot(slot))}</div>
                                </div>
                            ))}
                        </div>
                    )}
                    {activeEquipmentSubTab === 'wardrobe' && (
                        <div className="wardrobe-container">
                            {(character.outfits || []).length > 0 ? (
                                <ul className="wardrobe-list">
                                    {(character.outfits || []).map(outfit => (
                                        <li key={outfit.id}>
                                            {editingOutfit?.id === outfit.id ? (
                                                <OutfitEditor
                                                    character={character}
                                                    initialOutfit={editingOutfit}
                                                    onSave={handleSaveEditedOutfit}
                                                    onCancel={() => setEditingOutfit(null)}
                                                    onOpenPicker={handleOpenWardrobePicker}
                                                />
                                            ) : (
                                                <div className="wardrobe-item">
                                                     <header className="wardrobe-item-header">
                                                        <div className="wardrobe-item-name-group">
                                                            {editingOutfitInfo?.id === outfit.id && editingOutfitInfo.field === 'name' ? (
                                                                <input ref={nameInputRef} type="text" value={editingOutfitInfo.value} onChange={e => setEditingOutfitInfo(p => p ? {...p, value: e.target.value} : null)} onBlur={handleSaveEditInfo} onKeyDown={e => {if (e.key === 'Enter') handleSaveEditInfo(); if (e.key === 'Escape') setEditingOutfitInfo(null);}} onClick={e => e.stopPropagation()} />
                                                            ) : (
                                                                <span className="outfit-name">{outfit.name}</span>
                                                            )}
                                                            <button className="edit-name-button" title="Đổi tên" onClick={(e) => { e.stopPropagation(); handleStartEditInfo(outfit, 'name'); }}><PencilIcon /></button>
                                                        </div>
                                                        <div className="outfit-actions">
                                                            <button className="lore-button" onClick={(e) => { e.stopPropagation(); handleEquipOutfit(outfit.id); }}>Mặc</button>
                                                            <button className="lore-button" onClick={() => setEditingOutfit(JSON.parse(JSON.stringify(outfit)))}>Sửa</button>
                                                            <button className="lore-button delete" onClick={(e) => { e.stopPropagation(); handleDeleteOutfit(outfit.id); }}>Xóa</button>
                                                        </div>
                                                    </header>
                                                </div>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            ) : ( <NoInfoPlaceholder text="Bạn chưa lưu bộ trang bị nào."/> )}
                            <div className="save-outfit-section">
                                <FormField label="Lưu Bộ trang bị Hiện tại" htmlFor="new-outfit-name">
                                    <div className="save-outfit-input-group">
                                        <input id="new-outfit-name" type="text" placeholder="Tên bộ trang bị (VD: Đồ đi săn)..." value={newOutfitName} onChange={e => setNewOutfitName(e.target.value)} />
                                        <button className="lore-button save-apply" onClick={handleSaveOutfit}>Lưu</button>
                                    </div>
                                    <p className="field-hint">Lưu tất cả các vật phẩm đang được trang bị thành một bộ mới.</p>
                                </FormField>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};