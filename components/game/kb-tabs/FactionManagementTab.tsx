/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useMemo } from 'react';
import { useGameContext, useGameDispatch } from '../../contexts/GameContext';
import { NoInfoPlaceholder } from '../../ui/NoInfoPlaceholder';
import { ConfirmationModal } from '../../modals/ConfirmationModal';
import { Trash2Icon } from '../../ui/Icons';
import { generateUniqueId } from '../../../utils/id';
import type { Faction, Character } from '../../../types';
import './FactionManagementTab.css';

interface FactionManagementTabProps {
    areCheatsEnabled: boolean;
    onNpcSelect: (npcName: string) => void;
}

export const FactionManagementTab = ({ areCheatsEnabled, onNpcSelect }: FactionManagementTabProps) => {
    const { gameState } = useGameContext();
    const dispatch = useGameDispatch();
    const [selectedFaction, setSelectedFaction] = useState<Faction | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [showConfirm, setShowConfirm] = useState(false);
    const [factionToDelete, setFactionToDelete] = useState<{ id: string; name: string } | null>(null);
    const [isAdding, setIsAdding] = useState(false);
    const [newFactionName, setNewFactionName] = useState('');

    const factions = useMemo(() => {
        const list = gameState.knowledgeBase?.factions || [];
        const lowerSearch = searchTerm.toLowerCase();
        return list.filter(f => f.name.toLowerCase().includes(lowerSearch));
    }, [gameState.knowledgeBase?.factions, searchTerm]);

    const npcMap = useMemo(() => {
        const allChars = [gameState.character, ...(gameState.knowledgeBase?.npcs || [])];
        return new Map(allChars.map(c => [c.id, c]));
    }, [gameState.character, gameState.knowledgeBase?.npcs]);

    const handleDeleteClick = (e: React.MouseEvent, faction: Faction) => {
        e.stopPropagation();
        setFactionToDelete({ id: faction.id, name: faction.name });
        setShowConfirm(true);
    };

    const onConfirm = () => {
        if (factionToDelete) {
            dispatch({ type: 'DELETE_ENTITY', payload: { entityType: 'factions', entityId: factionToDelete.id } });
            if (selectedFaction?.id === factionToDelete.id) {
                setSelectedFaction(null);
            }
        }
        setShowConfirm(false);
        setFactionToDelete(null);
    };

    const handleAddFaction = () => {
        if (!newFactionName.trim()) return;
        dispatch({ type: 'CREATE_ENTITY', payload: { entityType: 'factions', data: { name: newFactionName.trim() } } });
        setNewFactionName('');
        setIsAdding(false);
    };

    const renderDetailView = () => {
        if (!selectedFaction) {
            return <div className="faction-detail-panel"><NoInfoPlaceholder text="Chọn một phe phái để xem chi tiết." /></div>;
        }
        const leader = selectedFaction.leaderId ? npcMap.get(selectedFaction.leaderId) : null;
        return (
            <div className="faction-detail-panel">
                <div className="faction-tab-content">
                    <div className="faction-detail-header">
                        <h3>{selectedFaction.name}</h3>
                        <p className="faction-type-badge">{selectedFaction.factionType}</p>
                    </div>
                    <div className="faction-detail-section">
                        <h4>Mô tả</h4>
                        <p>{selectedFaction.description || "Chưa có mô tả."}</p>
                    </div>
                    <div className="faction-detail-section">
                        <h4>Thông tin</h4>
                        <div className="faction-info-grid">
                            <div><strong>Lãnh đạo:</strong> <span className="faction-leader" onClick={() => leader && onNpcSelect(leader.name)}>{leader?.displayName || 'Chưa rõ'}</span></div>
                            <div><strong>Lãnh địa:</strong> <span>{selectedFaction.territories.map(t => t.locationName).join(', ') || 'Chưa có'}</span></div>
                        </div>
                    </div>
                     <div className="faction-detail-section">
                        <h4>Nguồn lực & Chỉ số</h4>
                        <div className="faction-stats-grid">
                            <div className="faction-resource-item"><span>Ngân khố</span><strong>{selectedFaction.resources.treasury.toLocaleString()}</strong></div>
                            <div className="faction-resource-item"><span>Nhân lực</span><strong>{selectedFaction.resources.manpower.toLocaleString()}</strong></div>
                            <div className="faction-resource-item"><span>Quân sự</span><strong>{selectedFaction.stats.military}</strong></div>
                            <div className="faction-resource-item"><span>Kinh tế</span><strong>{selectedFaction.stats.economy}</strong></div>
                            <div className="faction-resource-item"><span>Ảnh hưởng</span><strong>{selectedFaction.stats.influence}</strong></div>
                            <div className="faction-resource-item"><span>Ổn định</span><strong>{selectedFaction.stats.stability}</strong></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };
    
    return (
        <>
            <div className="faction-management-tab-container">
                <div className="faction-list-panel">
                    <div className="kb-search-wrapper">
                        <input
                            type="text"
                            className="kb-search-input"
                            placeholder="Tìm phe phái..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                        {areCheatsEnabled && (
                            isAdding ? (
                                <div className="add-faction-form">
                                    <input type="text" value={newFactionName} onChange={e => setNewFactionName(e.target.value)} placeholder="Tên phe phái mới..." autoFocus onKeyDown={e => e.key === 'Enter' && handleAddFaction()} />
                                    <button onClick={handleAddFaction}>Lưu</button>
                                    <button onClick={() => setIsAdding(false)}>Hủy</button>
                                </div>
                            ) : (
                                <button className="add-stat-button" onClick={() => setIsAdding(true)}>+ Thêm Phe phái</button>
                            )
                        )}
                    </div>
                    <ul className="faction-list">
                        {factions.length > 0 ? factions.map(faction => (
                            <li
                                key={faction.id}
                                className={`faction-list-item ${selectedFaction?.id === faction.id ? 'selected' : ''}`}
                                onClick={() => setSelectedFaction(faction)}
                            >
                                <span>{faction.name}</span>
                                {areCheatsEnabled && (
                                    <button className="kb-delete-button" onClick={(e) => handleDeleteClick(e, faction)}>
                                        <Trash2Icon />
                                    </button>
                                )}
                            </li>
                        )) : <NoInfoPlaceholder text="Không có phe phái nào." />}
                    </ul>
                </div>
                {renderDetailView()}
            </div>
            {showConfirm && factionToDelete && (
                <ConfirmationModal
                    isOpen={showConfirm}
                    onClose={() => setShowConfirm(false)}
                    onConfirm={onConfirm}
                    title="Xác nhận Xóa Phe phái"
                    message={<span>Bạn có chắc muốn xóa <strong>"{factionToDelete.name}"</strong> không?</span>}
                    confirmText="Xóa"
                />
            )}
        </>
    );
};
