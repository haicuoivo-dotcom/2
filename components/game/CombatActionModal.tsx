/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { NoInfoPlaceholder } from '../ui/NoInfoPlaceholder';
import type { Character, Stat } from '../../types';
import './CombatActionModal.css';

interface CombatActionModalProps {
    isOpen: boolean;
    onClose: () => void;
    type: 'item' | 'equip' | null;
    character: Character;
    onSelect: (item: Stat) => void;
}

export const CombatActionModal = ({ isOpen, onClose, type, character, onSelect }: CombatActionModalProps) => {
    if (!isOpen || !type) return null;

    const title = type === 'item' ? 'Chọn Vật phẩm' : 'Chọn Trang bị';
    
    const items = (character.stats || []).filter(stat => {
        if (type === 'item') {
            return stat.category === 'Vật phẩm' && stat.tags?.includes('chiến đấu');
        }
        if (type === 'equip') {
            return stat.category === 'Vật phẩm' && stat.slot && stat.slot !== 'Không có';
        }
        return false;
    });

    return (
        <div className="modal-overlay combat-action-overlay" onClick={onClose}>
            <div className="modal-content combat-action-modal" onClick={e => e.stopPropagation()}>
                <header className="modal-header">
                    <h3>{title}</h3>
                    <button onClick={onClose} className="modal-close-button" aria-label="Đóng">X</button>
                </header>
                <div className="modal-body">
                    {items.length > 0 ? (
                        <ul className="combat-action-list">
                            {items.map(item => (
                                <li key={item.id} className="combat-action-item" onClick={() => onSelect(item)}>
                                    <div className="item-info-wrapper">
                                        <span className="item-name">{item.name}</span>
                                        <span className="item-description">{item.description}</span>
                                    </div>
                                    {item.quantity && item.quantity > 1 && (
                                        <span className="item-quantity-badge">x{item.quantity}</span>
                                    )}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <NoInfoPlaceholder text={type === 'item' ? 'Không có vật phẩm chiến đấu nào.' : 'Không có trang bị nào trong túi đồ.'} />
                    )}
                </div>
            </div>
        </div>
    );
};