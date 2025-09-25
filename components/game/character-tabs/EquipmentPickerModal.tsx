/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { NoInfoPlaceholder } from '../../ui/NoInfoPlaceholder';
import type { Stat, EquipmentSlot } from '../../../types';
import './EquipmentPickerModal.css';
import './InventoryTab.css';
import { getRarityClass } from '../../../utils/game';

interface EquipmentPickerModalProps {
    isOpen: boolean;
    onClose: () => void;
    inventory: Stat[];
    targetSlot: EquipmentSlot;
    onEquip: (item: Stat, slot: EquipmentSlot) => void;
    onUnequip: (slot: EquipmentSlot) => void;
    currentlyEquippedItem?: Stat;
}

export const EquipmentPickerModal = ({ isOpen, onClose, inventory, targetSlot, onEquip, onUnequip, currentlyEquippedItem }: EquipmentPickerModalProps) => {
    if (!isOpen) return null;

    const getBaseSlotType = (slot: string): string => {
        if (slot.startsWith('Nhẫn')) return 'Nhẫn';
        if (slot.startsWith('Vũ khí') || slot.startsWith('Tay')) return 'Vũ khí';
        if (slot.startsWith('Tai')) return 'Tai';
        if (slot.startsWith('Hoa tai')) return 'Hoa tai';
        if (slot.startsWith('Cổ tay')) return 'Cổ tay';
        if (slot.startsWith('Phụ kiện')) return 'Phụ kiện';
        if (slot.startsWith('Túi')) return 'Vật phẩm bỏ túi';
        return slot;
    };
    
    const baseTargetSlot = getBaseSlotType(targetSlot);
    const compatibleItems = inventory.filter(item => item.slot && getBaseSlotType(item.slot) === baseTargetSlot);

    const handleOverlayClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onClose();
    };

    return (
        <div className="modal-overlay equipment-picker-overlay" onClick={handleOverlayClick}>
            <div className="modal-content equipment-picker-modal" onClick={e => e.stopPropagation()}>
                <header className="modal-header">
                    <h3>{`Chọn trang bị cho: ${targetSlot}`}</h3>
                    <button onClick={onClose} className="modal-close-button" aria-label="Đóng">×</button>
                </header>
                <div className="modal-body equipment-picker-body">
                    {compatibleItems.length > 0 ? (
                        <div className="equipment-picker-grid">
                            {compatibleItems.map(item => (
                                <div
                                    key={item.id}
                                    className={`inventory-item-card ${getRarityClass(item.rarity)}`}
                                    onClick={() => onEquip(item, targetSlot)}
                                    title={`Trang bị: ${item.name}\n${item.description}`}
                                >
                                    <div className="picker-item-content">
                                        <span className={`inventory-item-name ${getRarityClass(item.rarity)}`}>{item.name}</span>
                                        {item.rarity && <span className={`item-rarity-display ${getRarityClass(item.rarity)}`}>{item.rarity}</span>}
                                    </div>
                                    {item.value && <span className="inventory-item-quantity">x{item.value}</span>}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <NoInfoPlaceholder text="Không có vật phẩm phù hợp trong túi đồ." />
                    )}
                </div>
                 {currentlyEquippedItem && !currentlyEquippedItem.isPlaceholderFor && (
                    <footer className="equipment-picker-footer">
                        <button className="lore-button delete" onClick={() => onUnequip(targetSlot)}>
                            Tháo {currentlyEquippedItem.name}
                        </button>
                    </footer>
                )}
            </div>
        </div>
    );
};
