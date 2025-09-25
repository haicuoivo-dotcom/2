/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useMemo, useCallback } from 'react';
import { useGameContext } from '../contexts/GameContext';
import { NoInfoPlaceholder } from '../ui/NoInfoPlaceholder';
import { STAT_HEALTH } from '../../constants/statConstants';
import { getRelationshipInfo } from '../../utils/game';
import { CollapsibleSection } from '../ui/CollapsibleSection';
import { Modal } from '../ui/Modal';
import type { Character, Relationship } from '../../types';
import './HaremModal.css';

interface HaremModalProps {
    onClose: () => void;
    character: Character;
    onUpdateCharacterData: (characterId: string, updates: Partial<Character>) => void;
    addToast: (message: string, type?: 'info' | 'success' | 'error' | 'warning') => void;
    onNpcSelect: (npcName: string) => void;
    areCheatsEnabled: boolean;
}

const HAREM_RELATIONSHIP_TYPES = ['Người yêu', 'Tình nhân', 'Vợ', 'Bạn gái', 'Nô lệ nữ', 'Đạo lữ', 'Song tu bầu bạn', 'Phu thê'];

export const HaremModal = ({ onClose, character, onUpdateCharacterData, addToast, onNpcSelect, areCheatsEnabled }: HaremModalProps) => {
    const { gameState } = useGameContext();
    const { npcs } = gameState.knowledgeBase;

    const [searchTerm, setSearchTerm] = useState('');
    const [sortOrder, setSortOrder] = useState<'default' | 'name-asc' | 'name-desc' | 'affinity-low-high'>('default');
    const [isInfoOpen, setIsInfoOpen] = useState(false);
    
    const isNpcDead = (npc: Character) => npc.stats?.some(s => s.name === 'Trạng thái Tử vong');

    const getRelationship = useCallback((npc: Character): Relationship | undefined => {
        return npc.relationships?.find(r => r.characterId === character.id);
    }, [character.id]);
    
    const haremMemberNameSet = useMemo(() => new Set(character.harem || []), [character.harem]);

    const haremMembers = useMemo(() => {
        return (character.harem || [])
            .map(name => npcs.find(npc => npc.name === name))
            .filter((npc): npc is Character => !!npc && !isNpcDead(npc));
    }, [character.harem, npcs]);
    
    const availableNpcs = useMemo(() => {
        const getAffinity = (npc: Character) => getRelationship(npc)?.affinity ?? -101;
        
        let available = npcs.filter(npc => {
            const relationship = getRelationship(npc);
            const gender = npc.stats?.find(s => s.name === 'Giới tính')?.value;

            const meetsCriteria = areCheatsEnabled || (
                gender === 'Nữ' &&
                relationship &&
                (HAREM_RELATIONSHIP_TYPES.includes(relationship.type) || relationship.affinity >= 50)
            );
            
            return !haremMemberNameSet.has(npc.name) && 
                   !isNpcDead(npc) &&
                   meetsCriteria;
        });

        if (searchTerm.trim() !== '') {
            const lowercasedFilter = searchTerm.toLowerCase();
            available = available.filter(npc => 
                npc.displayName.toLowerCase().includes(lowercasedFilter) ||
                npc.name.toLowerCase().includes(lowercasedFilter)
            );
        }

        const sorted = [...available];
        switch (sortOrder) {
            case 'name-asc':
                sorted.sort((a, b) => a.displayName.localeCompare(b.displayName, 'vi'));
                break;
            case 'name-desc':
                sorted.sort((a, b) => b.displayName.localeCompare(a.displayName, 'vi'));
                break;
            case 'affinity-low-high':
                sorted.sort((a, b) => getAffinity(a) - getAffinity(b));
                break;
            case 'default':
            default:
                sorted.sort((a, b) => getAffinity(b) - getAffinity(a));
                break;
        }

        return sorted;
    }, [npcs, haremMemberNameSet, areCheatsEnabled, searchTerm, sortOrder, getRelationship]);

    const handleAddMember = (npcName: string) => {
        const newHarem = [...(character.harem || []), npcName];
        onUpdateCharacterData(character.id, { harem: newHarem });
        addToast(`Đã thêm ${npcName} vào hậu cung.`, 'success');
    };

    const handleRemoveMember = (npcName: string) => {
        const newHarem = (character.harem || []).filter(name => name !== npcName);
        onUpdateCharacterData(character.id, { harem: newHarem });
        addToast(`Đã loại ${npcName} khỏi hậu cung.`, 'info');
    };
    
    const renderNpcCard = (member: Character, isMember: boolean) => {
        const healthStat = member.stats?.find(s => s.name === STAT_HEALTH);
        let hpPercent = 100;
        let hpText = 'N/A';
        if (healthStat && typeof healthStat.value === 'string') {
            const [current, max] = healthStat.value.split('/').map(Number);
            if (!isNaN(current) && !isNaN(max) && max > 0) {
                hpPercent = (current / max) * 100;
                hpText = `${current}/${max}`;
            }
        }

        const relationship = getRelationship(member);
        const affinity = relationship?.affinity ?? 0;
        const affinityInfo = getRelationshipInfo(affinity);
        const affinityPercent = (affinity + 100) / 2;
    
        return (
            <li key={member.name} className="harem-npc-card" onClick={() => onNpcSelect(member.name)}>
                 <div className="harem-npc-avatar-wrapper">
                    {member.avatarUrl ? (
                        <img src={member.avatarUrl} alt={member.displayName} className="harem-npc-avatar" />
                    ) : (
                        <div className="harem-npc-avatar-placeholder">
                            <span>{member.displayName.charAt(0)}</span>
                        </div>
                    )}
                </div>
                <div className="harem-npc-details">
                    <div className="harem-npc-header">
                        <span className="harem-npc-name">{member.displayName}</span>
                    </div>
                    <div className="harem-npc-info-grid">
                        <div className="harem-npc-stat" title={`Sinh Lực: ${hpText}`}>
                            <span className="harem-npc-stat-icon">❤️</span>
                            <div className="harem-npc-hp-bar-container">
                                <div className="harem-npc-hp-bar" style={{ width: `${hpPercent}%` }}></div>
                                <span className="harem-npc-hp-text">{hpText}</span>
                            </div>
                        </div>
                        <div className="harem-npc-stat" title={`Thiện cảm: ${affinity}`}>
                            <span className="harem-npc-stat-icon" style={{color: affinityInfo.color}}>💕</span>
                             <div className="harem-affinity-bar-container">
                                <div className="harem-affinity-bar" style={{ width: `${affinityPercent}%`, backgroundColor: affinityInfo.color }}></div>
                                <span className="harem-affinity-text">{affinity}</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="harem-npc-actions">
                    {isMember ? (
                        <button className="harem-action-button remove" onClick={(e) => { e.stopPropagation(); handleRemoveMember(member.name); }}>Loại</button>
                    ) : (
                        <button className="harem-action-button add" onClick={(e) => { e.stopPropagation(); handleAddMember(member.name); }}>Thêm</button>
                    )}
                </div>
            </li>
        );
    }

    return (
        // FIX: Moved content inside Modal to provide 'children' prop.
        <Modal
            onClose={onClose}
            header={<h3>Hậu Cung</h3>}
            className="fullscreen-modal-content harem-modal"
        >
            <div className="harem-modal-body">
                <CollapsibleSection
                    title="Cơ chế Hậu Cung & Thiện Cảm"
                    isOpen={isInfoOpen}
                    onToggle={() => setIsInfoOpen(p => !p)}
                >
                    <div className="harem-mechanics-info-content">
                        <p><strong>Cơ chế Hậu Cung:</strong> Đây là nơi quản lý các mối quan hệ lãng mạn. Thành viên trong hậu cung sẽ <strong>không</strong> tự động tham gia chiến đấu. Để họ trở thành đồng đội, bạn cần thuyết phục họ trong diễn biến câu chuyện.</p>
                        <p><strong>Tăng Thiện Cảm:</strong></p>
                        <ul>
                            <li>Tương tác tích cực (trò chuyện, giúp đỡ, tặng quà).</li>
                            <li>Hoàn thành các nhiệm vụ liên quan đến họ.</li>
                            <li>Đưa ra các lựa chọn mà họ đồng tình trong câu chuyện.</li>
                            <li><strong>Lưu ý:</strong> Hành động tiêu cực (sỉ nhục, tấn công) sẽ làm giảm mạnh thiện cảm.</li>
                        </ul>
                    </div>
                </CollapsibleSection>
                <div className="harem-columns">
                    <div className="harem-section">
                        <h4>Thành viên Hiện tại ({haremMembers.length})</h4>
                        {haremMembers.length > 0 ? (
                            <ul className="harem-list">
                                {haremMembers.map(npc => renderNpcCard(npc, true))}
                            </ul>
                        ) : (
                            <NoInfoPlaceholder text="Hậu cung của bạn chưa có ai." />
                        )}
                    </div>
                    <div className="harem-section">
                        <div className="harem-available-header">
                            <h4>Có thể Chiêu mộ ({availableNpcs.length})</h4>
                            <div className="harem-controls">
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm..."
                                    className="harem-search-input"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                <select
                                    className="harem-sort-select"
                                    value={sortOrder}
                                    onChange={(e) => setSortOrder(e.target.value as 'default' | 'name-asc' | 'name-desc' | 'affinity-low-high')}
                                >
                                    <option value="default">Sắp xếp: Thiện cảm (Cao-Thấp)</option>
                                    <option value="name-asc">Tên (A-Z)</option>
                                    <option value="name-desc">Tên (Z-A)</option>
                                    <option value="affinity-low-high">Thiện cảm (Thấp-Cao)</option>
                                </select>
                            </div>
                        </div>
                        {availableNpcs.length > 0 ? (
                            <ul className="harem-list">
                                {availableNpcs.map(npc => renderNpcCard(npc, false))}
                            </ul>
                        ) : (
                            <NoInfoPlaceholder text={areCheatsEnabled ? "Không tìm thấy NPC nào." : "Không có NPC nào đủ điều kiện (Nữ, thiện cảm > 50 hoặc có quan hệ tình cảm)."} />
                        )}
                    </div>
                </div>
            </div>
        </Modal>
    );
};
