/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useMemo } from 'react';
import { useGameContext, useGameDispatch } from '../../contexts/GameContext';
import { NoInfoPlaceholder } from '../../ui/NoInfoPlaceholder';
import { ConfirmationModal } from '../../modals/ConfirmationModal';
import { Trash2Icon } from '../../ui/Icons';
import type { Character, KnowledgeEntity } from '../../../types';
import './EntityListTab.css';

interface EntityListTabProps {
    activeTab: 'npcs' | 'locations';
    areCheatsEnabled: boolean;
    onNpcSelect: (npcName: string) => void;
    onEntityClick: (event: React.MouseEvent, name: string, type: string) => void;
    onEntityMouseEnter: (event: React.MouseEvent, name: string, type: string) => void;
    onEntityMouseLeave: () => void;
}

export const EntityListTab = ({
    activeTab,
    areCheatsEnabled,
    onNpcSelect,
    onEntityClick,
    onEntityMouseEnter,
    onEntityMouseLeave,
}: EntityListTabProps) => {
    const { gameState } = useGameContext();
    const dispatch = useGameDispatch();
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOrder, setSortOrder] = useState('name-asc');
    const [showConfirm, setShowConfirm] = useState(false);
    const [entityToDelete, setEntityToDelete] = useState<{ id: string; name: string } | null>(null);

    const entities = useMemo(() => {
        if (!gameState.knowledgeBase) return [];
        // FIX: The type assertion here was incorrect. The list is now correctly typed as an array of a union of types.
        // This resolves the error where `(Character | KnowledgeEntity)[]` was not assignable to `Character[] | KnowledgeEntity[]`.
        const list: (Character | KnowledgeEntity)[] = gameState.knowledgeBase[activeTab] || [];
        
        let filteredList = list;
        if (searchTerm.trim()) {
            const lowerSearch = searchTerm.toLowerCase();
            // FIX: Use a type guard (`'displayName' in entity`) to safely access properties like `displayName` and `backstory` which only exist on `Character`.
            // This prevents type errors when filtering the mixed-type array.
            filteredList = list.filter(entity => {
                const nameMatch = entity.name.toLowerCase().includes(lowerSearch);
                if ('displayName' in entity) { // Character
                    return nameMatch ||
                        entity.displayName?.toLowerCase().includes(lowerSearch) ||
                        entity.backstory?.toLowerCase().includes(lowerSearch);
                }
                // KnowledgeEntity
                return nameMatch || entity.description?.toLowerCase().includes(lowerSearch);
            });
        }

        const sorted = [...filteredList];
        sorted.sort((a, b) => {
            // FIX: Use type guards to safely access `displayName`.
            const nameA = 'displayName' in a ? a.displayName || a.name : a.name;
            const nameB = 'displayName' in b ? b.displayName || b.name : b.name;
            if (sortOrder === 'name-asc') return nameA.localeCompare(nameB, 'vi');
            if (sortOrder === 'name-desc') return nameB.localeCompare(nameA, 'vi');
            return 0;
        });

        return sorted;
    }, [gameState.knowledgeBase, activeTab, searchTerm, sortOrder]);

    const handleDeleteClick = (e: React.MouseEvent, entityId: string, entityName: string) => {
        e.stopPropagation();
        setEntityToDelete({ id: entityId, name: entityName });
        setShowConfirm(true);
    };

    const confirmDelete = () => {
        if (entityToDelete) {
            dispatch({ type: 'DELETE_ENTITY', payload: { entityType: activeTab, entityId: entityToDelete.id } });
        }
        setShowConfirm(false);
        setEntityToDelete(null);
    };

    const entityTypeLabel = activeTab === 'npcs' ? 'NPC' : 'LOC';
    const hasEntities = entities.length > 0;

    return (
        <>
            <div className="kb-list-container full-height" style={{ gap: '1rem' }}>
                <div className="kb-search-wrapper" style={{ borderBottom: 'none', paddingBottom: 0 }}>
                    <input
                        type="text"
                        className="kb-search-input"
                        placeholder={`Tìm kiếm ${activeTab === 'npcs' ? 'NPC' : 'địa điểm'}...`}
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                    <div className="select-wrapper">
                        <select
                            className="kb-sort-select"
                            value={sortOrder}
                            onChange={e => setSortOrder(e.target.value)}
                        >
                            <option value="name-asc">Sắp xếp: Tên (A-Z)</option>
                            <option value="name-desc">Sắp xếp: Tên (Z-A)</option>
                        </select>
                    </div>
                </div>
                <div className="kb-list-container" style={{ paddingTop: 0 }}>
                    {hasEntities ? (
                        <ul className="kb-entity-list">
                            {entities.map(entity => {
                                // FIX: Use type guards to safely access properties that may not exist on all entity types.
                                const isDead = 'stats' in entity && entity.stats?.some(s => s.name === 'Trạng thái Tử vong');
                                const displayName = 'displayName' in entity ? entity.displayName || entity.name : entity.name;
                                return (
                                    <li
                                        key={entity.id}
                                        className={`kb-entity-item ${isDead ? 'is-dead' : ''}`}
                                        onClick={(e) => {
                                            if (activeTab === 'npcs') {
                                                onNpcSelect(entity.name);
                                            } else {
                                                onEntityClick(e, entity.name, entityTypeLabel);
                                            }
                                        }}
                                        onMouseEnter={(e) => onEntityMouseEnter(e, entity.name, entityTypeLabel)}
                                        onMouseLeave={onEntityMouseLeave}
                                    >
                                        <div className="kb-item-name">
                                            {displayName}
                                            {displayName !== entity.name && <span className="char-detail-fullname">({entity.name})</span>}
                                        </div>
                                        {areCheatsEnabled && (
                                            <button
                                                className="kb-delete-button"
                                                onClick={(e) => handleDeleteClick(e, entity.id, displayName)}
                                                title={`Xóa ${displayName}`}
                                            >
                                                <Trash2Icon />
                                            </button>
                                        )}
                                    </li>
                                );
                            })}
                        </ul>
                    ) : (
                        <NoInfoPlaceholder text={`Không có ${activeTab === 'npcs' ? 'NPC' : 'địa điểm'} nào.`} />
                    )}
                </div>
            </div>
            {showConfirm && entityToDelete && (
                <ConfirmationModal
                    isOpen={showConfirm}
                    onClose={() => setShowConfirm(false)}
                    onConfirm={confirmDelete}
                    title="Xác nhận Xóa"
                    message={<span>Bạn có chắc chắn muốn xóa <strong>"{entityToDelete.name}"</strong> không? Hành động này sẽ xóa vĩnh viễn thực thể và các mối quan hệ liên quan.</span>}
                    confirmText="Xóa"
                />
            )}
        </>
    );
};