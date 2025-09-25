/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useMemo } from 'react';
import { NoInfoPlaceholder } from '../../ui/NoInfoPlaceholder';
import { FormField } from '../../ui/FormField';
import { generateUniqueId } from '../../../utils/id';
import { MISC_TAGS } from '../../../constants/tagConstants';
import type { Character, Stat } from '../../../types';
import './MemoriesTab.css';

interface MemoriesTabProps {
    character: Character;
    onUpdateCharacterData: (characterId: string, updates: Partial<Character>) => void;
    // FIX: Add missing addToast prop to the interface.
    addToast: (message: string, type?: 'info' | 'success' | 'error' | 'warning', details?: any) => void;
    enableCheats: boolean;
}

export const MemoriesTab = ({ character, onUpdateCharacterData, addToast, enableCheats }: MemoriesTabProps) => {
    const { stats } = character;
    
    const [isAdding, setIsAdding] = useState(false);
    const [newMemory, setNewMemory] = useState<Partial<Stat>>({ category: 'Ký Ức Cốt Lõi', tags: [] });

    const memories = useMemo(() => {
        const mems = stats?.filter(stat => stat.category === 'Ký Ức Cốt Lõi') || [];
        // Sort pinned memories to the top
        return mems.sort((a, b) => {
            const aPinned = a.tags?.includes(MISC_TAGS.PINNED) || false;
            const bPinned = b.tags?.includes(MISC_TAGS.PINNED) || false;
            if (aPinned && !bPinned) return -1;
            if (!aPinned && bPinned) return 1;
            return 0;
        });
    }, [stats]);

    const handleDelete = (statId: string) => {
        const updatedStats = character.stats.filter(s => s.id !== statId);
        onUpdateCharacterData(character.id, { stats: updatedStats });
        addToast("Đã xóa ký ức.", "success");
    };

    const handleAdd = () => {
        if (!newMemory.name?.trim() || !newMemory.description?.trim()) {
            addToast("Tiêu đề và Nội dung không được để trống.", "warning");
            return;
        }
        const memoryToAdd: Stat = {
            id: generateUniqueId('memory-manual'),
            name: newMemory.name.trim(),
            description: newMemory.description.trim(),
            category: 'Ký Ức Cốt Lõi',
            tags: newMemory.tags
        };
        const updatedStats = [...(character.stats || []), memoryToAdd];
        onUpdateCharacterData(character.id, { stats: updatedStats });
        setIsAdding(false);
        setNewMemory({ category: 'Ký Ức Cốt Lõi', tags: [] });
        addToast("Đã thêm ký ức thành công!", "success");
    };
    
    const handleTogglePin = (stat: Stat) => {
        const isPinned = stat.tags?.includes(MISC_TAGS.PINNED);
        const newTags = isPinned
            ? stat.tags?.filter(t => t !== MISC_TAGS.PINNED)
            : [...(stat.tags || []), MISC_TAGS.PINNED];
        
        const updatedStats = character.stats.map(s => s.id === stat.id ? { ...s, tags: newTags } : s);
        onUpdateCharacterData(character.id, { stats: updatedStats });
    };

    return (
        <div className="char-detail-section">
            <h4>Ký Ức Cốt Lõi</h4>
            {memories.length === 0 && !isAdding ? (
                <NoInfoPlaceholder text="Nhân vật này không có ký ức cốt lõi nào." />
            ) : (
                memories.map(memory => {
                    const isPinned = memory.tags?.includes(MISC_TAGS.PINNED);
                    return (
                        <div className="memory-item-container" key={memory.id}>
                            <div className="memory-item-header">
                                <h5 className="memory-title">{memory.name}</h5>
                                {isPinned && <span className="memory-pin-badge">Đã Ghim</span>}
                            </div>
                            <p className="memory-description">{memory.description}</p>
                            {enableCheats && (
                                <div className="add-stat-actions" style={{ justifyContent: 'flex-start', marginTop: '0.75rem' }}>
                                    <button className="lore-button" onClick={() => handleTogglePin(memory)}>{isPinned ? 'Bỏ Ghim' : 'Ghim'}</button>
                                    <button className="lore-button delete" onClick={() => handleDelete(memory.id!)}>Xóa</button>
                                </div>
                            )}
                        </div>
                    );
                })
            )}

            {enableCheats && (
                !isAdding ? (
                    <button className="add-stat-button" onClick={() => setIsAdding(true)}>+ Thêm Ký ức</button>
                ) : (
                    <div className="add-stat-form">
                        <FormField label="Tiêu đề Ký ức" htmlFor="new-memory-name">
                            <input id="new-memory-name" type="text" value={newMemory.name || ''} onChange={e => setNewMemory(p => ({ ...p, name: e.target.value }))} />
                        </FormField>
                        <FormField label="Nội dung" htmlFor="new-memory-desc">
                            <textarea id="new-memory-desc" value={newMemory.description || ''} onChange={e => setNewMemory(p => ({ ...p, description: e.target.value }))} rows={4}></textarea>
                        </FormField>
                        <div className="is-item-toggle">
                            <label>
                                <input
                                    type="checkbox"
                                    checked={newMemory.tags?.includes(MISC_TAGS.PINNED)}
                                    onChange={e => {
                                        const isPinned = e.target.checked;
                                        const currentTags = newMemory.tags || [];
                                        const newTags = isPinned
                                            ? [...currentTags, MISC_TAGS.PINNED]
                                            : currentTags.filter(t => t !== MISC_TAGS.PINNED);
                                        setNewMemory(p => ({ ...p, tags: newTags }));
                                    }}
                                />
                                Ghim ký ức này?
                            </label>
                        </div>
                        <div className="add-stat-actions">
                            <button className="lore-button cancel" onClick={() => setIsAdding(false)}>Hủy</button>
                            <button className="lore-button save-apply" onClick={handleAdd}>Lưu</button>
                        </div>
                    </div>
                )
            )}
        </div>
    );
};