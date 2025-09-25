/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useMemo, useCallback } from 'react';
import { Modal } from '../ui/Modal';
import { ConfirmationModal } from './ConfirmationModal';
import { useGameContext } from '../contexts/GameContext';
import { NoInfoPlaceholder } from '../ui/NoInfoPlaceholder';
import { PREDEFINED_RARITIES, SKILL_TIERS } from '../../constants/statConstants';
import './DataCleanupModal.css';

interface DeletableRelationship {
    charId: string;
    charName: string;
    targetId: string;
    targetName: string;
    type: string;
}

interface DataCleanupModalProps {
    onClose: () => void;
    onConfirmCleanup: (payload: { statIds: Set<string>; memoryIds: Set<string>; relationshipsToPrune: { charId: string; targetId: string; }[] }) => void;
}

export const DataCleanupModal = ({ onClose, onConfirmCleanup }: DataCleanupModalProps) => {
    const { gameState } = useGameContext();
    const [activeTab, setActiveTab] = useState<'items' | 'skills' | 'quests' | 'memories' | 'relationships'>('items');
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [showConfirm, setShowConfirm] = useState(false);

    // Filter states
    const [itemRarityFilter, setItemRarityFilter] = useState<string[]>(['Phổ thông']);
    const [skillTierFilter, setSkillTierFilter] = useState<string[]>(['F', 'D']);
    const [questStatusFilter, setQuestStatusFilter] = useState<string[]>(['Hoàn thành', 'Thất bại']);
    // Thêm filter cho ký ức
    const [memoryScoreMax, setMemoryScoreMax] = useState<number>(70);

    const isEquipped = useCallback((itemId: string) => {
        if (!gameState) return false;
        const allChars = [gameState.character, ...gameState.knowledgeBase.npcs];
        return allChars.some(char => Object.values(char.equipment || {}).includes(itemId));
    }, [gameState]);
    
    const SKILL_CATEGORIES = ['Kỹ Năng', 'Công Pháp', 'Chiêu Thức', 'Khí Công', 'Thuật'];

    const deletableData = useMemo(() => {
        if (!gameState) return { items: [], skills: [], quests: [], memories: [], relationships: [] };
        const allChars = [gameState.character, ...gameState.knowledgeBase.npcs];
    const allStats = allChars.flatMap(c => (c.stats || []).map(s => ({...s, owner: c.displayName})));

    const items = allStats.filter(s => (s.category === 'Vật phẩm' || s.category === 'Nguyên liệu') && itemRarityFilter.includes(s.rarity || 'Phổ thông') && !isEquipped(s.id));
    const skills = allStats.filter(s => SKILL_CATEGORIES.includes(s.category) && skillTierFilter.includes(s.skillTier || 'F'));
    // Sửa lỗi so sánh category 'Nhiệm vụ' không hợp lệ
    const quests = gameState.character.stats?.filter(s => s.category && String(s.category).toLowerCase().includes('nhiệm vụ') && questStatusFilter.some(status => s.tags?.includes(status))) || [];
    const memories = gameState.memories?.filter(m => (m.relevanceScore || 0) < memoryScoreMax) || [];
        
        const deadNpcIds = new Set(allChars.filter(c => c.stats?.some(s => s.name === 'Trạng thái Tử vong')).map(c => c.id));
        const relationships: DeletableRelationship[] = [];
        allChars.forEach(char => {
            (char.relationships || []).forEach(rel => {
                if (deadNpcIds.has(rel.characterId)) {
                    const deadNpc = allChars.find(c => c.id === rel.characterId);
                    relationships.push({
                        charId: char.id,
                        charName: char.displayName,
                        targetId: rel.characterId,
                        targetName: deadNpc?.displayName || 'Unknown',
                        type: `Quan hệ với ${deadNpc?.displayName} (đã mất)`,
                    });
                }
            });
        });
        
        return { items, skills, quests, memories, relationships };
    }, [gameState, isEquipped, itemRarityFilter, skillTierFilter, questStatusFilter]);
    
    const tabs = useMemo(() => [
        { id: 'items', label: 'Vật phẩm', data: deletableData.items, description: "Các vật phẩm và nguyên liệu có độ hiếm được chọn và hiện không được bạn hay bất kỳ ai trang bị." },
        { id: 'skills', label: 'Kỹ năng', data: deletableData.skills, description: "Các kỹ năng có cấp bậc được chọn mà có thể bạn đã không còn sử dụng." },
        { id: 'quests', label: 'Nhiệm vụ', data: deletableData.quests, description: "Các nhiệm vụ đã được hoàn thành hoặc đã thất bại trong nhật ký của bạn." },
        { id: 'memories', label: 'Ký ức', data: deletableData.memories, description: "Các ký ức tạm thời (trong Dòng Chảy Sự Kiện) có điểm liên quan thấp (dưới 70). Đây thường là những sự kiện nhỏ, không ảnh hưởng nhiều đến cốt truyện." },
        { id: 'relationships', label: 'Quan hệ', data: deletableData.relationships, description: "Các mối quan hệ với những nhân vật (NPC) đã chết. Vì họ không còn tồn tại trong thế giới, việc giữ lại các liên kết quan hệ này là không cần thiết." },
    ], [deletableData]);

    const activeTabData = useMemo(() => tabs.find(t => t.id === activeTab)!, [tabs, activeTab]);

    const handleToggleSelect = (id: string) => {
        setSelectedIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) newSet.delete(id);
            else newSet.add(id);
            return newSet;
        });
    };
    
    const handleSelectAll = () => {
        const allIdsInTab = new Set(activeTabData.data.map((item: any) => item.id || `${item.charId}::${item.targetId}`));
        const currentSelectedInTab = new Set([...selectedIds].filter(id => allIdsInTab.has(id)));

        if (currentSelectedInTab.size === allIdsInTab.size && allIdsInTab.size > 0) {
            setSelectedIds(prev => new Set([...prev].filter(id => !allIdsInTab.has(id))));
        } else {
            setSelectedIds(prev => new Set([...prev, ...allIdsInTab]));
        }
    };
    
    const handleConfirm = () => {
        setShowConfirm(false);
        const statIds = new Set<string>();
        const memoryIds = new Set<string>();
        const relationshipsToPrune: { charId: string; targetId: string; }[] = [];

        selectedIds.forEach(id => {
            if (id.includes('::')) {
                const [charId, targetId] = id.split('::');
                relationshipsToPrune.push({ charId, targetId });
            } else if (id.startsWith('mem')) {
                memoryIds.add(id);
            } else {
                statIds.add(id);
            }
        });

        onConfirmCleanup({ statIds, memoryIds, relationshipsToPrune });
        setSelectedIds(new Set());
    };
    
    const handleTabChange = (tabId: 'items' | 'skills' | 'quests' | 'memories' | 'relationships') => {
        setActiveTab(tabId);
    };

    const handleFilterToggle = (value: string, currentFilter: string[], setFilter: React.Dispatch<React.SetStateAction<string[]>>) => {
        const newSet = new Set(currentFilter);
        if (newSet.has(value)) {
            newSet.delete(value);
        } else {
            newSet.add(value);
        }
        setFilter(Array.from(newSet));
    };

    const renderItem = (item: any) => {
        const id = item.id || `${item.charId}::${item.targetId}`;
        const isSelected = selectedIds.has(id);
        const name = item.name || item.type;
        const context = item.reasoning || item.description || (item.owner ? `của ${item.owner}` : '') || (item.charName ? `của ${item.charName}` : '');
        const score = typeof item.relevanceScore === 'number' ? item.relevanceScore : null;

        return (
            <li key={id} className="cleanup-item" onClick={() => handleToggleSelect(id)}>
                <input type="checkbox" checked={isSelected} readOnly onChange={() => {}}/>
                <div className="cleanup-item-details">
                    <div className="cleanup-item-name">{name}
                        {score !== null && (
                            <span style={{marginLeft: 8, color: '#8E8E93', fontSize: '0.85em', fontWeight: 400}} title="Điểm liên quan">({score})</span>
                        )}
                    </div>
                    <div className="cleanup-item-context">{context}</div>
                </div>
            </li>
        );
    };

    return (
        <>
            <Modal
                onClose={onClose}
                header={<h3>Dọn dẹp Dữ liệu</h3>}
                className="data-cleanup-modal fullscreen-modal-content"
                footer={
                    <>
                        <span className="selection-info">Đã chọn: <strong>{selectedIds.size}</strong> mục</span>
                        <div className="lore-main-actions">
                            <button className="lore-button cancel" onClick={onClose}>Hủy</button>
                            <button className="lore-button delete" onClick={() => setShowConfirm(true)} disabled={selectedIds.size === 0}>
                                Xóa {selectedIds.size} mục đã chọn
                            </button>
                        </div>
                    </>
                }
            >
                <>
                    <p className="cleanup-description">{activeTabData.description}</p>
                    <div className="cleanup-content">
                        <nav className="kb-tabs">
                            {tabs.map(tab => (
                                <button key={tab.id} className={`kb-tab-button ${activeTab === tab.id ? 'active' : ''}`} onClick={() => handleTabChange(tab.id as any)}>
                                    {tab.label} ({tab.data.length})
                                </button>
                            ))}
                        </nav>
                        <div className="cleanup-list-container">
                            <div className="cleanup-list-actions">
                                <div className="cleanup-top-actions">
                                    <button className="lore-button" onClick={handleSelectAll} disabled={activeTabData.data.length === 0} style={{width: 'auto', marginTop: 0}}>Chọn/Bỏ chọn Tất cả</button>
                                </div>
                                <div className="cleanup-filters">
                                    {activeTab === 'items' && PREDEFINED_RARITIES.map(rarity => (
                                        <label key={rarity}>
                                            <input type="checkbox" checked={itemRarityFilter.includes(rarity)} onChange={() => handleFilterToggle(rarity, itemRarityFilter, setItemRarityFilter)} />
                                            {rarity}
                                        </label>
                                    ))}
                                    {activeTab === 'skills' && SKILL_TIERS.map(tier => (
                                        <label key={tier}>
                                            <input type="checkbox" checked={skillTierFilter.includes(tier)} onChange={() => handleFilterToggle(tier, skillTierFilter, setSkillTierFilter)} />
                                            Cấp {tier}
                                        </label>
                                    ))}
                                    {activeTab === 'quests' && ['Hoàn thành', 'Thất bại'].map(status => (
                                        <label key={status}>
                                            <input type="checkbox" checked={questStatusFilter.includes(status)} onChange={() => handleFilterToggle(status, questStatusFilter, setQuestStatusFilter)} />
                                            {status}
                                        </label>
                                    ))}
                                    {activeTab === 'memories' && (
                                        <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                                            <input type="number" value={memoryScoreMax} style={{width: 60, marginRight: 8}} onChange={e => setMemoryScoreMax(Number(e.target.value.replace(/[^0-9]/g, '')))} />
                                            <span>Lọc ký ức có điểm nhỏ hơn</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <ul className="cleanup-list">
                                {activeTabData.data.length > 0 ? (
                                    activeTabData.data.map(renderItem)
                                ) : (
                                    <NoInfoPlaceholder text={`Không có mục nào để dọn dẹp trong phần này.`} />
                                )}
                            </ul>
                        </div>
                    </div>
                </>
            </Modal>
            {showConfirm && (
                <ConfirmationModal
                    isOpen={showConfirm}
                    onClose={() => setShowConfirm(false)}
                    onConfirm={handleConfirm}
                    title="Xác nhận Dọn dẹp"
                    message={`Bạn có chắc chắn muốn xóa vĩnh viễn ${selectedIds.size} mục đã chọn không? Hành động này không thể hoàn tác.`}
                    confirmText="Xóa Vĩnh viễn"
                />
            )}
        </>
    );
};