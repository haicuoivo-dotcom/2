/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { InlineStoryRenderer } from '../game/StoryRenderer';
import { useWorldData, usePlayerCharacter } from '../contexts/GameContext';
import { ConfirmationModal } from './ConfirmationModal';
import { gameTimeToMinutes } from '../../utils/game';
import type { Memory, GameState } from '../../types';
import './MemoryModal.css';

interface MemoryModalProps {
    memories: Memory[];
    onPin: (id: string) => void;
    onDelete: (id: string) => void;
    onClose: () => void;
    onEntityClick: (event: React.MouseEvent, name: string, type: string) => void;
    onEntityMouseEnter: (event: React.MouseEvent, name: string, type: string) => void;
    onEntityMouseLeave: () => void;
}

const getScoreCategory = (score: number) => {
    if (score >= 75) return 'high';
    if (score >= 40) return 'medium';
    return 'low';
};

export const MemoryModal = ({ memories, onPin, onDelete, onClose, onEntityClick, onEntityMouseEnter, onEntityMouseLeave }: MemoryModalProps) => {
    const worldData = useWorldData();
    const playerCharacterData = usePlayerCharacter();

    // Reconstruct a minimal gameState for the renderer.
    const gameState = useMemo(() => {
        if (!playerCharacterData || !worldData) return null;
        return {
            character: playerCharacterData.character,
            knowledgeBase: worldData.knowledgeBase,
        };
    }, [playerCharacterData, worldData]);

    const [memoryToDelete, setMemoryToDelete] = useState<string | null>(null);
    const [sortOrder, setSortOrder] = useState('default');
    const [filterPinned, setFilterPinned] = useState(false);
    const [isSortMenuOpen, setIsSortMenuOpen] = useState(false);
    const sortMenuRef = useRef<HTMLDivElement>(null);

    const sortOptions: Record<string, string> = {
        default: 'Sắp xếp: Mặc định',
        relevance_desc: 'Liên quan (Cao-Thấp)',
        relevance_asc: 'Liên quan (Thấp-Cao)',
        time_desc: 'Mới nhất',
        time_asc: 'Cũ nhất',
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (sortMenuRef.current && !sortMenuRef.current.contains(event.target as Node)) {
                setIsSortMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [sortMenuRef]);

    const filteredAndSortedMemories = useMemo(() => {
        let processedMemories = [...(memories || [])];

        // Filter by pinned
        if (filterPinned) {
            processedMemories = processedMemories.filter(m => m.pinned);
        }

        // Sort
        processedMemories.sort((a, b) => {
            switch (sortOrder) {
                case 'relevance_asc':
                    return (a.relevanceScore || 0) - (b.relevanceScore || 0);
                case 'time_desc':
                    return gameTimeToMinutes(b.timestamp) - gameTimeToMinutes(a.timestamp);
                case 'time_asc':
                    return gameTimeToMinutes(a.timestamp) - gameTimeToMinutes(b.timestamp);
                case 'default':
                case 'relevance_desc':
                default:
                    if (a.pinned && !b.pinned) return -1;
                    if (!a.pinned && b.pinned) return 1;
                    return (b.relevanceScore || 0) - (a.relevanceScore || 0);
            }
        });

        return processedMemories;
    }, [memories, sortOrder, filterPinned]);


    const handleDeleteClick = (memoryId: string) => {
        setMemoryToDelete(memoryId);
    };

    const confirmDelete = () => {
        if (memoryToDelete) {
            onDelete(memoryToDelete);
        }
        setMemoryToDelete(null);
    };

    if (!gameState) {
        return null;
    }

    return (
        <>
            <div className="modal-overlay" onClick={onClose}>
                <div className="modal-content fullscreen-modal-content memory-modal-content" onClick={e => e.stopPropagation()}>
                    <header className="modal-header memory-header">
                        <div className="modal-header-content">
                            <h3>Dòng Chảy Sự Kiện (Ký Ức Tạm Thời của AI)</h3>
                            <div className="sort-button-wrapper" ref={sortMenuRef}>
                                <button
                                    className="modal-close-button sort-button"
                                    onClick={() => setIsSortMenuOpen(p => !p)}
                                    aria-haspopup="true"
                                    aria-expanded={isSortMenuOpen}
                                >
                                    {sortOptions[sortOrder]}
                                </button>
                                {isSortMenuOpen && (
                                    <div className="sort-dropdown-menu">
                                        {Object.entries(sortOptions).map(([key, label]) => (
                                            <button
                                                key={key}
                                                className={`sort-dropdown-option ${sortOrder === key ? 'active' : ''}`}
                                                onClick={() => {
                                                    setSortOrder(key);
                                                    setIsSortMenuOpen(false);
                                                }}
                                            >
                                                {label}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <label className="memory-filter-pinned">
                                <input 
                                    type="checkbox" 
                                    checked={filterPinned} 
                                    onChange={e => setFilterPinned(e.target.checked)} 
                                />
                                <span>Ghim</span>
                            </label>
                        </div>
                        <button onClick={onClose} className="modal-close-button" aria-label="Đóng">×</button>
                    </header>
                    <div className="modal-body">
                        {filteredAndSortedMemories.length === 0 ? (
                            <p className="no-memories-message">Không tìm thấy ký ức nào phù hợp.</p>
                        ) : (
                            <ul className="memory-list">
                                {filteredAndSortedMemories.map(memory => (
                                    <li key={memory.id} className="memory-item">
                                        <div className="memory-details">
                                            {typeof memory.relevanceScore === 'number' && (
                                                <div 
                                                    className={`memory-score-badge score-${getScoreCategory(memory.relevanceScore)}`}
                                                    title={`Lý do: ${memory.reasoning || 'Chưa có'}`}
                                                >
                                                    {memory.relevanceScore}
                                                </div>
                                            )}
                                            <span className="memory-text">
                                                <InlineStoryRenderer text={memory.text} gameState={gameState as GameState} onEntityClick={onEntityClick} onEntityMouseEnter={onEntityMouseEnter} onEntityMouseLeave={onEntityMouseLeave}/>
                                            </span>
                                        </div>
                                        <div className="memory-item-actions">
                                            <button
                                                className={`memory-pin-button ${memory.pinned ? 'pinned' : ''}`}
                                                onClick={() => onPin(memory.id)}
                                                aria-label={memory.pinned ? `Bỏ ghim ký ức` : `Ghim ký ức`}
                                            >
                                                <span>{memory.pinned ? 'Đã Ghim' : 'Ghim'}</span>
                                            </button>
                                            <button
                                                className="memory-delete-button"
                                                onClick={() => handleDeleteClick(memory.id)}
                                                aria-label="Xóa ký ức"
                                            >
                                                Xóa
                                            </button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </div>
            {memoryToDelete && (
                <ConfirmationModal
                    isOpen={!!memoryToDelete}
                    onClose={() => setMemoryToDelete(null)}
                    onConfirm={confirmDelete}
                    title="Xác Nhận Xóa Ký Ức"
                    message="Bạn có chắc chắn muốn xóa ký ức này không? AI sẽ không còn tham chiếu đến nó trong tương lai."
                    confirmText="Xóa"
                />
            )}
        </>
    );
};