/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useMemo } from 'react';
import { NoInfoPlaceholder } from '../../ui/NoInfoPlaceholder';
import { FormField } from '../../ui/FormField';
import { generateUniqueId } from '../../../utils/id';
import { QUEST_TAGS } from '../../../constants/tagConstants';
import type { Character, Stat, QuestObjective } from '../../../types';
import './QuestsTab.css';

const getStatusFromTags = (tags: string[] = []): 'active' | 'completed' | 'failed' => {
    const safeTags = tags || [];
    if (safeTags.includes(QUEST_TAGS.COMPLETED)) return 'completed';
    if (safeTags.includes(QUEST_TAGS.FAILED)) return 'failed';
    return 'active';
};

const statusLabels: { [key in 'active' | 'completed' | 'failed']: string } = {
    active: 'Đang Thực Hiện',
    completed: 'Đã Hoàn Thành',
    failed: 'Thất Bại'
};

// FIX: Define the missing QuestsTabProps interface.
interface QuestsTabProps {
    character: Character;
    onUpdateCharacterData: (characterId: string, updates: Partial<Character>) => void;
    // FIX: Add missing addToast prop to the interface.
    addToast: (message: string, type?: 'info' | 'success' | 'error' | 'warning', details?: any) => void;
    enableCheats: boolean;
}

export const QuestsTab = ({ character, onUpdateCharacterData, addToast, enableCheats }: QuestsTabProps) => {
    const { stats } = character;
    
    const [isAdding, setIsAdding] = useState(false);
    const [newQuest, setNewQuest] = useState<Partial<Stat>>({
        category: 'Nhiệm Vụ',
        tags: [QUEST_TAGS.ACTIVE],
        objectives: [{ description: '', target: '', requiredCount: 1, currentCount: 0, type: 'collect' }]
    });

    const quests = useMemo(() => {
        if (!stats) return { active: [], completed: [], failed: [] };
        
        const questStats = stats.filter(stat => stat.category === 'Nhiệm Vụ');
        
        const grouped: { active: Stat[], completed: Stat[], failed: Stat[] } = { active: [], completed: [], failed: [] };
        
        questStats.forEach(quest => {
            const status = getStatusFromTags(quest.tags);
            if (status === 'completed') grouped.completed.push(quest);
            else if (status === 'failed') grouped.failed.push(quest);
            else grouped.active.push(quest);
        });

        return grouped;
    }, [stats]);

    const hasQuests = quests.active.length > 0 || quests.completed.length > 0 || quests.failed.length > 0;

    const handleDelete = (statId: string) => {
        const updatedStats = character.stats.filter(s => s.id !== statId);
        onUpdateCharacterData(character.id, { stats: updatedStats });
        addToast("Đã xóa nhiệm vụ.", "success");
    };

    const handleAdd = () => {
        if (!newQuest.name?.trim() || !newQuest.description?.trim()) {
            addToast("Tên và Mô tả không được để trống.", "warning");
            return;
        }
        const questToAdd: Stat = {
            id: generateUniqueId('quest-manual'),
            name: newQuest.name.trim(),
            description: newQuest.description.trim(),
            category: 'Nhiệm Vụ',
            tags: newQuest.tags,
            objectives: newQuest.objectives,
        };
        const updatedStats = [...(character.stats || []), questToAdd];
        onUpdateCharacterData(character.id, { stats: updatedStats });
        setIsAdding(false);
        setNewQuest({ category: 'Nhiệm Vụ', tags: [QUEST_TAGS.ACTIVE], objectives: [{ description: '', target: '', requiredCount: 1, currentCount: 0, type: 'collect' }] });
        addToast("Đã thêm nhiệm vụ thành công!", "success");
    };
    
    const renderObjective = (objective: QuestObjective, index: number) => {
        const progressPercent = objective.requiredCount > 0 ? (objective.currentCount / objective.requiredCount) * 100 : 0;
        return (
            <li key={index} className="quest-objective-item">
                <div className="objective-info">
                    <span className="objective-description">{objective.description}</span>
                    <span className="objective-progress-text">{objective.currentCount} / {objective.requiredCount}</span>
                </div>
                <div className="objective-progress-bar-container">
                    <div className="objective-progress-bar" style={{ width: `${progressPercent}%` }}></div>
                </div>
            </li>
        );
    };

    const renderQuestList = (questList: Stat[], status: 'active' | 'completed' | 'failed') => {
        if (questList.length === 0) return null;

        return (
            <div key={status}>
                <h4 className="quest-category-title">{statusLabels[status]} ({questList.length})</h4>
                <ul className="quest-list-ul">
                    {questList.map(quest => (
                        <li className="quest-item" key={quest.id}>
                            <div className="quest-item-header">
                                <h5 className="quest-title">{quest.name}</h5>
                                <div className="quest-header-right">
                                    <span className={`quest-status-badge ${status}`}>{statusLabels[status]}</span>
                                </div>
                            </div>
                            <p className="quest-description">{quest.description}</p>
                            {quest.objectives && quest.objectives.length > 0 && (
                                <ul className="quest-objectives-list">
                                    {quest.objectives.map(renderObjective)}
                                </ul>
                            )}
                            {(quest.rewards && quest.rewards.length > 0) && (
                                <div className="quest-rewards">
                                    <h6>🎁 Phần thưởng:</h6>
                                    <ul>
                                        {quest.rewards.map((reward, i) => <li key={i}>{reward.description}</li>)}
                                    </ul>
                                </div>
                            )}
                            {enableCheats && (
                                <div className="add-stat-actions" style={{justifyContent: 'flex-start', marginTop: '0.75rem'}}>
                                    <button className="lore-button delete" onClick={() => handleDelete(quest.id!)}>Xóa</button>
                                </div>
                            )}
                        </li>
                    ))}
                </ul>
            </div>
        );
    };

    return (
        <div className="char-detail-section">
            <h4>Nhật Ký Nhiệm Vụ</h4>
            {!hasQuests && !isAdding ? (
                <NoInfoPlaceholder text="Không có nhiệm vụ nào." />
            ) : (
                <>
                    {renderQuestList(quests.active, 'active')}
                    {renderQuestList(quests.completed, 'completed')}
                    {renderQuestList(quests.failed, 'failed')}
                </>
            )}

            {enableCheats && (
                !isAdding ? (
                    <button className="add-stat-button" onClick={() => setIsAdding(true)}>+ Thêm Nhiệm vụ</button>
                ) : (
                    <div className="add-stat-form">
                        <FormField label="Tên Nhiệm vụ" htmlFor="new-quest-name">
                            <input id="new-quest-name" type="text" value={newQuest.name || ''} onChange={e => setNewQuest(p => ({ ...p, name: e.target.value }))} placeholder="VD: Tìm kiếm Cổ vật Mất tích..." />
                        </FormField>
                        <FormField label="Mô tả & Mục tiêu" htmlFor="new-quest-desc">
                            <textarea id="new-quest-desc" value={newQuest.description || ''} onChange={e => setNewQuest(p => ({ ...p, description: e.target.value }))} rows={4} placeholder="Mô tả chi tiết nhiệm vụ tại đây..."></textarea>
                        </FormField>
                         <FormField label="Trạng thái" htmlFor="new-quest-status">
                            <select 
                                id="new-quest-status" 
                                value={getStatusFromTags(newQuest.tags)} 
                                onChange={e => {
                                    const statusKey = e.target.value as 'completed' | 'failed' | 'active';
                                    const tagMap = {
                                        completed: QUEST_TAGS.COMPLETED,
                                        failed: QUEST_TAGS.FAILED,
                                        active: QUEST_TAGS.ACTIVE,
                                    };
                                    setNewQuest(p => ({ ...p, tags: [tagMap[statusKey]] }));
                                }}
                            >
                                <option value="active">Đang thực hiện</option>
                                <option value="completed">Đã hoàn thành</option>
                                <option value="failed">Thất bại</option>
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