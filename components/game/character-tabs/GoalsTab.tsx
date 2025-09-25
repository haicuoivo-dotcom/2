/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useMemo } from 'react';
import { NoInfoPlaceholder } from '../../ui/NoInfoPlaceholder';
import { FormField } from '../../ui/FormField';
import { generateUniqueId } from '../../../utils/id';
import { QUEST_TAGS } from '../../../constants/tagConstants';
import type { Character, Stat } from '../../../types';
import './GoalsTab.css';

const getStatusFromTags = (tags: string[] = []): 'active' | 'completed' | 'abandoned' | 'unknown' => {
    const safeTags = tags || [];
    if (safeTags.includes(QUEST_TAGS.COMPLETED)) return 'completed';
    if (safeTags.includes(QUEST_TAGS.ABANDONED)) return 'abandoned';
    if (safeTags.includes(QUEST_TAGS.ACTIVE)) return 'active';
    return 'unknown';
};

const statusLabels = {
    active: 'Đang Thực Hiện',
    completed: 'Đã Hoàn Thành',
    abandoned: 'Đã Từ Bỏ',
    unknown: 'Chưa Rõ'
};

// FIX: Define the missing GoalsTabProps interface.
interface GoalsTabProps {
    character: Character;
    onUpdateCharacterData: (characterId: string, updates: Partial<Character>) => void;
    // FIX: Add missing addToast prop to the interface.
    addToast: (message: string, type?: 'info' | 'success' | 'error' | 'warning', details?: any) => void;
    enableCheats: boolean;
}

export const GoalsTab = ({ character, onUpdateCharacterData, addToast, enableCheats }: GoalsTabProps) => {
    const { stats } = character;
    
    const [isAdding, setIsAdding] = useState(false);
    const [newGoal, setNewGoal] = useState<Partial<Stat>>({ category: 'Mục Tiêu', tags: [QUEST_TAGS.ACTIVE] });

    const goals = useMemo(() => stats?.filter(stat => stat.category === 'Mục Tiêu') || [], [stats]);

    const handleDelete = (statId: string) => {
        const updatedStats = character.stats.filter(s => s.id !== statId);
        onUpdateCharacterData(character.id, { stats: updatedStats });
        addToast("Đã xóa mục tiêu.", "success");
    };

    const handleAdd = () => {
        if (!newGoal.name?.trim()) {
            addToast("Tên không được để trống.", "warning");
            return;
        }
        const goalToAdd: Stat = {
            id: generateUniqueId('goal-manual'),
            name: newGoal.name.trim(),
            description: newGoal.description?.trim() || 'Chưa có mô tả chi tiết.',
            category: 'Mục Tiêu',
            tags: newGoal.tags
        };
        const updatedStats = [...(character.stats || []), goalToAdd];
        onUpdateCharacterData(character.id, { stats: updatedStats });
        setIsAdding(false);
        setNewGoal({ category: 'Mục Tiêu', tags: [QUEST_TAGS.ACTIVE] });
        addToast("Đã thêm mục tiêu thành công!", "success");
    };

    return (
        <div className="char-detail-section">
            <h4>Mục Tiêu</h4>
            {goals.length === 0 && !isAdding ? (
                <NoInfoPlaceholder text="Nhân vật này không có mục tiêu cụ thể nào." />
            ) : (
                <ul className="goal-list-ul">
                    {goals.map(goal => {
                        const status = getStatusFromTags(goal.tags);
                        return (
                            <li className="goal-item-container" key={goal.id}>
                                <div className="goal-item-header">
                                    <h5 className="goal-title">{goal.name}</h5>
                                    <span className={`goal-status-badge ${status}`}>{statusLabels[status]}</span>
                                </div>
                                <p className="goal-description">{goal.description}</p>
                                {enableCheats && (
                                    <div className="add-stat-actions" style={{justifyContent: 'flex-start', marginTop: '0.75rem'}}>
                                        <button className="lore-button delete" onClick={() => handleDelete(goal.id!)}>Xóa</button>
                                    </div>
                                )}
                            </li>
                        );
                    })}
                </ul>
            )}

            {enableCheats && (
                !isAdding ? (
                    <button className="add-stat-button" onClick={() => setIsAdding(true)}>+ Thêm Mục tiêu</button>
                ) : (
                    <div className="add-stat-form">
                        <FormField label="Tên Mục tiêu" htmlFor="new-goal-name">
                            <input id="new-goal-name" type="text" value={newGoal.name || ''} onChange={e => setNewGoal(p => ({ ...p, name: e.target.value }))} />
                        </FormField>
                        <FormField label="Mô tả" htmlFor="new-goal-desc">
                            <textarea id="new-goal-desc" value={newGoal.description || ''} onChange={e => setNewGoal(p => ({ ...p, description: e.target.value }))} rows={3}></textarea>
                        </FormField>
                         <FormField label="Trạng thái" htmlFor="new-goal-status">
                            <select 
                                id="new-goal-status" 
                                value={getStatusFromTags(newGoal.tags)} 
                                onChange={e => {
                                    const statusKey = e.target.value as 'completed' | 'abandoned' | 'active';
                                    const tagMap = {
                                        completed: QUEST_TAGS.COMPLETED,
                                        abandoned: QUEST_TAGS.ABANDONED,
                                        active: QUEST_TAGS.ACTIVE,
                                    };
                                    setNewGoal(p => ({ ...p, tags: [tagMap[statusKey]] }))
                                }}
                            >
                                <option value="active">Đang thực hiện</option>
                                <option value="completed">Đã hoàn thành</option>
                                <option value="abandoned">Đã từ bỏ</option>
                            </select>
                        </FormField>
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