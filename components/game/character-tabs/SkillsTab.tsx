/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useMemo, useState, useEffect } from 'react';
import { NoInfoPlaceholder } from '../../ui/NoInfoPlaceholder';
import { useGameContext } from '../../contexts/GameContext';
import { FormField } from '../../ui/FormField';
import { generateUniqueId } from '../../../utils/id';
import { InlineStoryRenderer } from '../StoryRenderer';
import { ELEMENTAL_TAGS, SKILL_TAGS } from '../../../constants/tagConstants';
import { SKILL_TIERS } from '../../../constants/statConstants';
import { BASE_SKILL_TEMPLATES } from '../../../constants/gameConstants';
import { ToggleSwitch } from '../../ui/ToggleSwitch';
import type { Character, Stat, SkillCost } from '../../../types';
import './SkillsTab.css';

interface SkillsTabProps {
    character: Character;
    onUpdateCharacterData: (characterId: string, updates: Partial<Character>) => void;
    // FIX: Add missing addToast prop to the interface.
    addToast: (message: string, type?: 'info' | 'success' | 'error' | 'warning', details?: any) => void;
    enableCheats: boolean;
    onEntityClick: (event: React.MouseEvent, name: string, type: string) => void;
    isPlayerCharacter: boolean;
}

const SKILL_CATEGORIES = ['Kỹ Năng', 'Công Pháp', 'Chiêu Thức', 'Khí Công', 'Thuật'];
const MARTIAL_ARTS_CATEGORIES = ['Công Pháp', 'Chiêu Thức', 'Khí Công', 'Thuật'];

export const SkillsTab = ({ character, onUpdateCharacterData, addToast, enableCheats, onEntityClick, isPlayerCharacter }: SkillsTabProps) => {
    const { gameState } = useGameContext();
    const { stats } = character;
    
    const [isAdding, setIsAdding] = useState(false);
    const [editingSkill, setEditingSkill] = useState<Partial<Stat> | null>(null);
    const [selectedSkill, setSelectedSkill] = useState<Stat | null>(null);
    const [skillTemplateList, setSkillTemplateList] = useState<{ label: string; value: string }[]>([]);

    useEffect(() => {
        const list = Object.keys(BASE_SKILL_TEMPLATES).map(key => ({ label: key, value: key }));
        list.sort((a, b) => a.label.localeCompare(b.label, 'vi'));
        setSkillTemplateList(list);
    }, []);

    const { combatSkills, martialArtsSkills, craftingSkills, softSkills } = useMemo(() => {
        const allSkills = stats?.filter(s => SKILL_CATEGORIES.includes(s.category)) || [];
        
        const martialArts = allSkills.filter(s => MARTIAL_ARTS_CATEGORIES.includes(s.category));
        
        const combat = allSkills.filter(s => 
            !s.tags?.includes(SKILL_TAGS.FUNCTIONALITY.CRAFTING) && 
            !s.tags?.includes(SKILL_TAGS.FUNCTIONALITY.SOFT_SKILL) &&
            !MARTIAL_ARTS_CATEGORIES.includes(s.category)
        );

        const crafting = allSkills.filter(s => s.tags?.includes(SKILL_TAGS.FUNCTIONALITY.CRAFTING));
        const soft = allSkills.filter(s => s.tags?.includes(SKILL_TAGS.FUNCTIONALITY.SOFT_SKILL));

        const sortByName = (a: Stat, b: Stat) => a.name.localeCompare(b.name, 'vi');
        combat.sort(sortByName);
        martialArts.sort(sortByName);
        crafting.sort(sortByName);
        soft.sort(sortByName);

        return { combatSkills: combat, martialArtsSkills: martialArts, craftingSkills: crafting, softSkills: soft };
    }, [stats]);

    const skillGroups = useMemo(() => [
        { key: 'martialArts', title: 'Võ Học / Công Pháp', skills: martialArtsSkills, placeholder: 'Không có công pháp hay bí thuật nào.' },
        { key: 'combat', title: 'Kỹ năng Chiến đấu', skills: combatSkills, placeholder: 'Không có kỹ năng chiến đấu nào.' },
        { key: 'crafting', title: 'Kỹ năng Nghề nghiệp', skills: craftingSkills, placeholder: 'Không có kỹ năng nghề nghiệp nào.' },
        { key: 'soft', title: 'Kỹ năng Mềm', skills: softSkills, placeholder: 'Không có kỹ năng mềm nào.' },
    ], [combatSkills, martialArtsSkills, craftingSkills, softSkills]);
    
    useEffect(() => {
        const allSkills = skillGroups.flatMap(g => g.skills);
        if (selectedSkill) {
            const selectedSkillStillExists = allSkills.some(s => s.id === selectedSkill.id);
            if (!selectedSkillStillExists) {
                setSelectedSkill(allSkills[0] || null);
            }
        } else if (allSkills.length > 0) {
            setSelectedSkill(allSkills[0]);
        }
    }, [skillGroups, selectedSkill]);
    
    const handleSkillCostChange = (index: number, field: keyof SkillCost, value: string | number) => {
        if (!editingSkill) return;
        const newCosts = [...(editingSkill.skillCost || [])];
        (newCosts[index] as any)[field] = field === 'amount' ? Number(value) : value;
        setEditingSkill(p => ({ ...p, skillCost: newCosts }));
    };

    const addSkillCostField = () => {
        if (!editingSkill) return;
        setEditingSkill(p => ({ ...p, skillCost: [...(p.skillCost || []), { resource: 'Mana', amount: 10 }] }));
    };

    const removeSkillCostField = (indexToRemove: number) => {
        if (!editingSkill) return;
        setEditingSkill(p => ({ ...p, skillCost: (p.skillCost || []).filter((_, index) => index !== indexToRemove) }));
    };

    const handleSaveSkill = () => {
        if (!editingSkill) return;
        if (!editingSkill.name?.trim()) {
            addToast("Tên kỹ năng không được để trống.", "warning");
            return;
        }
        
        let updatedStats: Stat[];

        if (editingSkill.id) { // Editing existing skill
            updatedStats = character.stats.map(s => s.id === editingSkill.id ? { ...s, ...editingSkill } as Stat : s);
            addToast("Đã cập nhật kỹ năng.", "success");
        } else { // Adding new skill
            const newSkill: Stat = {
                id: generateUniqueId('skill-manual'),
                name: editingSkill.name.trim(),
                description: editingSkill.description || 'Không có mô tả.',
                category: 'Kỹ Năng',
                skillCost: editingSkill.skillCost || [],
                tags: editingSkill.tags || [],
                isLearned: editingSkill.isLearned || false,
                proficiency: 0,
                masteryLevel: 'Sơ Nhập Môn',
                masteryThreshold: 10,
                skillTier: editingSkill.skillTier || 'C',
            };
            updatedStats = [...(character.stats || []), newSkill];
            addToast("Đã thêm kỹ năng mới.", "success");
        }
        
        onUpdateCharacterData(character.id, { stats: updatedStats });
        setIsAdding(false);
        setEditingSkill(null);
    };

     const handleDeleteSkill = (skillId: string) => {
        const updatedStats = character.stats.filter(s => s.id !== skillId);
        onUpdateCharacterData(character.id, { stats: updatedStats });
        addToast("Đã xóa kỹ năng.", "success");
        if (selectedSkill?.id === skillId) {
            const allSkills = [...combatSkills, ...craftingSkills, ...softSkills].filter(s => s.id !== skillId);
            setSelectedSkill(allSkills[0] || null);
        }
    };

    const handleTemplateSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const templateName = e.target.value;
        if (!templateName) return;

        const template = BASE_SKILL_TEMPLATES[templateName];
        if (template) {
            setEditingSkill(prev => ({
                ...prev,
                ...template,
                name: template.name || templateName,
            }));
        }
        e.target.value = ''; // Reset dropdown after selection
    };
    
    const renderSkillEditor = () => {
        if (!editingSkill) return null;
         return (
            <div className="add-stat-form">
                <h5>{editingSkill.id ? 'Sửa Kỹ năng' : 'Thêm Kỹ năng Mới'}</h5>
                <div className="name-template-group">
                    <FormField label="Tên" htmlFor="skill-name">
                        <input id="skill-name" type="text" value={editingSkill.name || ''} onChange={e => setEditingSkill(p => ({ ...p, name: e.target.value }))} />
                    </FormField>
                    <FormField label="Hoặc chọn mẫu" htmlFor="skill-template-select">
                        <div className="select-wrapper">
                            <select id="skill-template-select" value="" onChange={handleTemplateSelect}>
                                <option value="">-- Mẫu Kỹ năng --</option>
                                {skillTemplateList.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>
                    </FormField>
                </div>
                <FormField label="Cấp bậc Kỹ năng" htmlFor="skill-tier">
                    <div className="select-wrapper">
                        <select
                            id="skill-tier"
                            value={editingSkill.skillTier || 'C'}
                            onChange={e => setEditingSkill(p => ({ ...p, skillTier: e.target.value }))}
                        >
                            {SKILL_TIERS.map(tier => <option key={tier} value={tier}>Cấp {tier}</option>)}
                        </select>
                    </div>
                </FormField>
                <FormField label="Mô tả" htmlFor="skill-desc">
                    <textarea id="skill-desc" value={editingSkill.description || ''} onChange={e => setEditingSkill(p => ({ ...p, description: e.target.value }))} rows={3}></textarea>
                </FormField>
                    <FormField label="Thuộc tính Nguyên tố" htmlFor="skill-elements">
                    <div className="tags-checkbox-group">
                        {[...Object.values(ELEMENTAL_TAGS.FIVE_ELEMENTS), ...Object.values(ELEMENTAL_TAGS.EXTENDED_ELEMENTS)].map(tag => (
                            <label key={tag}>
                                <input
                                    type="checkbox"
                                    checked={editingSkill.tags?.includes(tag) ?? false}
                                    onChange={e => {
                                        const currentTags = editingSkill.tags || [];
                                        const newTags = e.target.checked ? [...currentTags, tag] : currentTags.filter(t => t !== tag);
                                        setEditingSkill(p => ({ ...p, tags: newTags }));
                                    }}
                                />
                                <span className={`element-tag element-${tag.toLowerCase()}`}>{tag}</span>
                            </label>
                        ))}
                    </div>
                </FormField>
                <FormField label="Chi phí Sử dụng" htmlFor="skill-use-cost">
                    <div className="status-effects-editor">
                        {(editingSkill.skillCost || []).map((cost, index) => (
                            <div key={index} className="status-effect-row">
                                <input type="text" placeholder="Tài nguyên (VD: Mana)" value={cost.resource} onChange={e => handleSkillCostChange(index, 'resource', e.target.value)} />
                                <input type="number" placeholder="Số lượng" value={cost.amount} onChange={e => handleSkillCostChange(index, 'amount', e.target.value)} />
                                <button className="remove-effect-button" onClick={() => removeSkillCostField(index)} title="Xóa chi phí">×</button>
                            </div>
                        ))}
                        <button className="add-effect-button" onClick={addSkillCostField}>+ Thêm Chi phí</button>
                    </div>
                </FormField>
                <div className="add-stat-actions">
                    <button className="lore-button cancel" onClick={() => { setIsAdding(false); setEditingSkill(null); }}>Hủy</button>
                    <button className="lore-button save-apply" onClick={handleSaveSkill}>Lưu</button>
                </div>
            </div>
        );
    };

    const renderDetailPanel = () => {
        if (isAdding || editingSkill) return renderSkillEditor();

        if (!selectedSkill) {
            return (
                <div className="skill-detail-placeholder">
                    <p>Chọn một kỹ năng để xem chi tiết.</p>
                </div>
            );
        }
        
        return (
            <div className="skill-detail-content">
                <header className="skill-detail-header">
                    <div className="skill-detail-title">
                        <h3>{selectedSkill.name}</h3>
                        {selectedSkill.skillTier && <span className={`skill-tier-badge tier--${selectedSkill.skillTier.toLowerCase()}`}>{selectedSkill.skillTier}</span>}
                    </div>
                    {enableCheats && (
                        <div className="add-stat-actions" style={{gap: '0.5rem'}}>
                             <button className="lore-button" onClick={() => { setEditingSkill(selectedSkill); setSelectedSkill(null); }}>Sửa</button>
                            <button className="lore-button delete" onClick={() => handleDeleteSkill(selectedSkill.id!)}>Xóa</button>
                        </div>
                    )}
                </header>
                <div className="skill-detail-body">
                    <p className="skill-description">
                        <InlineStoryRenderer text={selectedSkill.description} gameState={gameState} onEntityClick={onEntityClick} />
                    </p>
                    {typeof selectedSkill.proficiency === 'number' && (
                        <div className="proficiency-section">
                            <div className="proficiency-info">
                                <span>{selectedSkill.masteryLevel || 'Sơ Nhập Môn'}</span>
                                <span>{selectedSkill.proficiency} / {selectedSkill.masteryThreshold || 10} EXP</span>
                            </div>
                            <div className="proficiency-bar-container">
                                <div className="proficiency-bar" style={{ width: `${(selectedSkill.proficiency / (selectedSkill.masteryThreshold || 10)) * 100}%` }}></div>
                            </div>
                        </div>
                    )}
                    <div className="skill-attributes-grid">
                        {selectedSkill.skillCost && selectedSkill.skillCost.length > 0 && (
                            <div className="skill-attribute-box">
                                <h4>Chi Phí</h4>
                                {selectedSkill.skillCost.map((cost, i) => <p key={i}>{cost.amount} {cost.resource}</p>)}
                            </div>
                        )}
                        {selectedSkill.scaling && selectedSkill.scaling.length > 0 && (
                            <div className="skill-attribute-box">
                                <h4>Tăng tiến theo</h4>
                                {selectedSkill.scaling.map((scale, i) => <p key={i}>{scale.statName} ({scale.ratio}x)</p>)}
                            </div>
                        )}
                    </div>
                    {selectedSkill.tags && selectedSkill.tags.length > 0 && (
                        <div className="skill-tags">
                            {selectedSkill.tags.map(tag => {
                                const findTag = (obj: any): string | undefined => Object.values(obj).find(val => val === tag) as string;
                                const elementTag = findTag(ELEMENTAL_TAGS.FIVE_ELEMENTS) || findTag(ELEMENTAL_TAGS.EXTENDED_ELEMENTS);
                                const colorClass = elementTag ? `element-${elementTag.toLowerCase()}` : '';
                                return <span key={tag} className={`element-tag ${colorClass}`}>{tag}</span>;
                            })}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const hasAnySkills = useMemo(() => combatSkills.length > 0 || craftingSkills.length > 0 || softSkills.length > 0 || martialArtsSkills.length > 0, [combatSkills, craftingSkills, softSkills, martialArtsSkills]);

    return (
        <div className="skills-tab-container">
            <div className="skill-list-panel">
                {isPlayerCharacter && (
                    <div className="char-detail-section" style={{ padding: '1rem', marginBottom: '1rem', background: 'rgba(var(--rgb-bg-tertiary), 0.5)' }}>
                        <ToggleSwitch
                            id="microActionLearningToggle"
                            label="Tự động Học Kỹ năng"
                            description="Bật để tự động học các kỹ năng cấp thấp từ những hành động lặp đi lặp lại như di chuyển, nói chuyện, suy nghĩ."
                            name="isMicroActionLearningEnabled"
                            checked={character.isMicroActionLearningEnabled ?? true}
                            onChange={(e) => onUpdateCharacterData(character.id, { isMicroActionLearningEnabled: e.target.checked })}
                        />
                    </div>
                )}
                
                {skillGroups.map(group => (
                    group.skills.length > 0 ? (
                        <div key={group.key} className="skill-group">
                            <h4 className="skill-group-title">{group.title}</h4>
                            <div className="skill-list">
                                {group.skills.map(skill => (
                                    <button
                                        key={skill.id}
                                        className={`skill-list-item ${selectedSkill?.id === skill.id ? 'selected' : ''}`}
                                        onClick={() => { setSelectedSkill(skill); setIsAdding(false); setEditingSkill(null); }}
                                    >
                                        <span className="skill-list-name">{skill.name}</span>
                                        {skill.skillTier && <span className={`skill-tier-badge tier--${skill.skillTier.toLowerCase()}`}>{skill.skillTier}</span>}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : null
                ))}
                {!hasAnySkills && <NoInfoPlaceholder text="Không có kỹ năng nào." />}
                {enableCheats && (
                    <button className="add-stat-button" style={{ marginTop: '1rem' }} onClick={() => { setIsAdding(true); setEditingSkill({ category: 'Kỹ Năng', isLearned: true, skillTier: 'C' }); setSelectedSkill(null); }}>
                        + Thêm Kỹ năng Mới
                    </button>
                )}
            </div>
            <div className="skill-detail-panel">
                {renderDetailPanel()}
            </div>
        </div>
    );
};