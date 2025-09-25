/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useMemo } from 'react';
import { Modal } from '../ui/Modal';
import { FormField } from '../ui/FormField';
// FIX: Corrected import from PREDEFINED_RARITIES to PREDEFINED_QUALITIES and added PREDEFINED_RARITIES to satisfy type requirements.
import { PREDEFINED_QUALITIES, ITEM_SLOT_TYPES, PREDEFINED_RARITIES } from '../../constants/statConstants';
import { ITEM_TAGS, ELEMENTAL_TAGS, CRAFTING_TAGS } from '../../constants/tagConstants';
import { generateUniqueId } from '../../utils/id';
import type { Stat, StatEffect } from '../../types';
import './ItemEditorModal.css';

interface ItemEditorModalProps {
    item: Stat;
    onClose: () => void;
    onSave: (updatedItem: Stat) => void;
}

export const ItemEditorModal = ({ item, onClose, onSave }: ItemEditorModalProps) => {
    const [editedItem, setEditedItem] = useState<Stat>(item);
    const [selectedTag, setSelectedTag] = useState('');

    const allTags = useMemo(() => {
        return {
            'Chức năng & Tính chất': Object.values(ITEM_TAGS.FUNCTIONALITY),
            'Loại Trang bị': Object.values(ITEM_TAGS.EQUIPMENT_TYPE),
            'Loại Vũ khí': Object.values(ITEM_TAGS.WEAPON_TYPE),
            'Loại Súng': Object.values(ITEM_TAGS.GUN_TYPE),
            'Nguồn gốc / Phong cách': Object.values(ITEM_TAGS.ORIGIN),
            'Loại Vật liệu': Object.values(ITEM_TAGS.MATERIAL_TYPE),
            'Loại Phụ kiện & Khác': Object.values(ITEM_TAGS.MISC_TYPE),
            'Nguyên tố (Ngũ Hành)': Object.values(ELEMENTAL_TAGS.FIVE_ELEMENTS),
            'Nguyên tố (Mở rộng)': Object.values(ELEMENTAL_TAGS.EXTENDED_ELEMENTS),
            'Thuộc tính Ma thuật': Object.values(ELEMENTAL_TAGS.MAGIC_TYPE),
            'Chế tạo': Object.values(CRAFTING_TAGS),
        };
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const isNumber = type === 'number';
        setEditedItem(prev => ({
            ...prev,
            [name]: isNumber ? (parseInt(value, 10) || 0) : value
        }));
    };

    const handleEffectChange = (index: number, field: keyof StatEffect, value: string) => {
        const newEffects = [...(editedItem.effects || [])];
        (newEffects[index] as any)[field] = value;
        setEditedItem(prev => ({ ...prev, effects: newEffects }));
    };

    const addEffectField = () => {
        const newEffects = [...(editedItem.effects || []), { targetStat: '', modifier: '' }];
        setEditedItem(prev => ({ ...prev, effects: newEffects }));
    };

    const removeEffectField = (indexToRemove: number) => {
        const newEffects = (editedItem.effects || []).filter((_, index) => index !== indexToRemove);
        setEditedItem(prev => ({ ...prev, effects: newEffects }));
    };

    const handleAddTag = () => {
        if (selectedTag && !(editedItem.tags || []).includes(selectedTag)) {
            setEditedItem(prev => ({ ...prev, tags: [...(prev.tags || []), selectedTag] }));
        }
        setSelectedTag('');
    };

    const handleRemoveTag = (tagToRemove: string) => {
        setEditedItem(prev => ({
            ...prev,
            tags: (prev.tags || []).filter(t => t !== tagToRemove)
        }));
    };
    
    const handleSave = () => {
        const finalItem = {
            ...editedItem,
            effects: (editedItem.effects || []).filter(e => e.targetStat.trim() && e.modifier.trim())
        };
        onSave(finalItem);
    };

    const footerContent = (
        <>
            <button className="lore-button cancel" onClick={onClose}>Hủy</button>
            <button className="lore-button save-apply" onClick={handleSave}>Lưu Thay đổi</button>
        </>
    );

    return (
        // FIX: Moved content inside Modal to provide 'children' prop.
        <Modal
            onClose={onClose}
            header={<h3>Sửa Vật phẩm: {item.name}</h3>}
            footer={footerContent}
            className="item-editor-modal"
        >
            <div className="item-editor-form">
                <div className="item-editor-grid">
                    {/* FIX: Moved input inside FormField to provide children prop. */}
                    <FormField label="Tên Vật phẩm" htmlFor="item-name">
                        <input id="item-name" name="name" type="text" value={editedItem.name} onChange={handleChange} />
                    </FormField>
                    {/* FIX: Moved input inside FormField to provide children prop. */}
                    <FormField label="Giá trị" htmlFor="item-price">
                        <input id="item-price" name="price" type="number" value={editedItem.price || 0} onChange={handleChange} />
                    </FormField>
                    {/* FIX: Moved select inside FormField to provide children prop. */}
                    <FormField label="Độ hiếm" htmlFor="item-rarity">
                        <div className="select-wrapper">
                             <select id="item-rarity" name="rarity" value={editedItem.rarity || 'Phổ thông'} onChange={handleChange}>
                                {PREDEFINED_RARITIES.map(r => <option key={r} value={r}>{r}</option>)}
                            </select>
                        </div>
                    </FormField>
                    {/* FIX: Moved select inside FormField to provide children prop. */}
                    <FormField label="Ô trang bị" htmlFor="item-slot">
                         <div className="select-wrapper">
                            <select id="item-slot" name="slot" value={editedItem.slot || 'Không có'} onChange={handleChange}>
                                {ITEM_SLOT_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                    </FormField>
                </div>
                {/* FIX: Moved textarea inside FormField to provide children prop. */}
                <FormField label="Mô tả" htmlFor="item-description">
                    <textarea id="item-description" name="description" value={editedItem.description} onChange={handleChange} rows={4}></textarea>
                </FormField>
                <div>
                    <h5>Tags & Phân Loại</h5>
                    <div className="tags-editor-container">
                        <div className="tags-list">
                            {(editedItem.tags || []).map(tag => (
                                <span key={tag} className="tag-badge">
                                    {tag}
                                    <button onClick={() => handleRemoveTag(tag)} className="tag-remove-btn">×</button>
                                </span>
                            ))}
                            {(!editedItem.tags || editedItem.tags.length === 0) && (
                                <span className="no-tags-placeholder">Chưa có tag nào.</span>
                            )}
                        </div>
                        <div className="add-tag-controls">
                            <div className="select-wrapper">
                                <select value={selectedTag} onChange={e => setSelectedTag(e.target.value)}>
                                    <option value="">-- Chọn tag để thêm --</option>
                                    {/* FIX: Add explicit type annotation to fix 'map does not exist on type unknown' error */}
                                    {Object.entries(allTags).map(([group, tags]: [string, string[]]) => (
                                        <optgroup label={group} key={group}>
                                            {tags.map(tag => <option key={tag} value={tag}>{tag}</option>)}
                                        </optgroup>
                                    ))}
                                </select>
                            </div>
                            <button type="button" className="add-tag-button" onClick={handleAddTag} disabled={!selectedTag}>+ Thêm</button>
                        </div>
                    </div>
                </div>
                 <div>
                    <h5>Hiệu ứng Chỉ số</h5>
                    <div className="status-effects-editor">
                        {(editedItem.effects || []).map((effect, index) => (
                            <div key={index} className="status-effect-row">
                                <input type="text" placeholder="Thuộc tính (VD: Tấn Công)" value={effect.targetStat} onChange={e => handleEffectChange(index, 'targetStat', e.target.value)} />
                                <input type="text" placeholder="Giá trị (VD: +10, +5%)" value={effect.modifier} onChange={e => handleEffectChange(index, 'modifier', e.target.value)} />
                                <button className="remove-effect-button" onClick={() => removeEffectField(index)} title="Xóa hiệu ứng">×</button>
                            </div>
                        ))}
                        <button className="add-effect-button" onClick={addEffectField}>+ Thêm Hiệu ứng</button>
                    </div>
                </div>
            </div>
        </Modal>
    );
};