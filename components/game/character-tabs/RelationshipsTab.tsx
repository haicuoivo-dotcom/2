/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useMemo, useState } from 'react';
import { useGameContext } from '../../contexts/GameContext';
import { NoInfoPlaceholder } from '../../ui/NoInfoPlaceholder';
import { getRelationshipInfo } from '../../../utils/game';
import type { Character, Relationship } from '../../../types';
import './RelationshipsTab.css';

interface RelationshipsTabProps {
    character: Character;
    onNpcSelect: (npcName: string) => void;
    areCheatsEnabled: boolean;
    onUpdateRelationship: (targetCharId: string, newAffinity: number) => void;
}

const RELATIONSHIP_CATEGORIES: Record<string, string[]> = {
    'Gia Đình & Thân Thiết': ['Vợ', 'Chồng', 'Cha', 'Mẹ', 'Con', 'Anh trai', 'Chị gái', 'Em trai', 'Em gái', 'Sư tôn', 'Sư phụ', 'Đệ tử', 'Đạo lữ', 'Người yêu', 'Bạn thân'],
    'Quan hệ Xã hội': ['Bạn bè', 'Bằng hữu', 'Đồng môn', 'Đồng đội', 'Người quen', 'Đồng nghiệp'],
    'Đối Địch': ['Kẻ thù', 'Đối thủ', 'Oan gia'],
};

export const RelationshipsTab = ({ character, onNpcSelect, areCheatsEnabled, onUpdateRelationship }: RelationshipsTabProps) => {
    const { gameState } = useGameContext();
    const [editingRel, setEditingRel] = useState<{ targetCharId: string, currentAffinity: string } | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const categorizedRelationships = useMemo(() => {
        const relationships = character.relationships || [];
        if (relationships.length === 0) return {};

        // FIX: Prevent an NPC from having a relationship with itself.
        const validRelationships = relationships.filter(rel => rel.characterId !== character.id);
        
        // FIX: Deduplicate relationships by characterId to handle reciprocal relationships
        // or corrupted save data that may contain duplicate relationship entries, ensuring each NPC appears only once.
        const uniqueRelationships = Array.from(new Map(validRelationships.map(item => [item.characterId, item])).values());

        const npcMap = new Map(gameState.knowledgeBase.npcs.map(npc => [npc.id, npc]));
        if (character.id !== gameState.character.id) {
            npcMap.set(gameState.character.id, gameState.character);
        }

        const filteredRelationships = uniqueRelationships.filter(rel => {
            const npc = npcMap.get(rel.characterId);
            if (!npc) return false;
            if (!searchTerm.trim()) return true;
            return npc.displayName.toLowerCase().includes(searchTerm.toLowerCase());
        });

        const categorized: Record<string, { npc: Character, relationship: Relationship, reciprocalRelationship?: Relationship }[]> = {};
        
        filteredRelationships.forEach(rel => {
            const npc = npcMap.get(rel.characterId);
            if (!npc) return;
            
            const reciprocalRel = npc.relationships?.find(r => r.characterId === character.id);

            let categoryFound = false;
            for (const category in RELATIONSHIP_CATEGORIES) {
                if (RELATIONSHIP_CATEGORIES[category].includes(rel.type)) {
                    if (!categorized[category]) categorized[category] = [];
                    categorized[category].push({ npc, relationship: rel, reciprocalRelationship: reciprocalRel });
                    categoryFound = true;
                    break;
                }
            }

            if (!categoryFound) {
                if (!categorized['Khác']) categorized['Khác'] = [];
                categorized['Khác'].push({ npc, relationship: rel, reciprocalRelationship: reciprocalRel });
            }
        });
        
        // Sort within each category
        for (const category in categorized) {
            categorized[category].sort((a, b) => b.relationship.affinity - a.relationship.affinity);
        }

        return categorized;
    }, [character, gameState.knowledgeBase.npcs, gameState.character, searchTerm]);

    const orderedCategories = useMemo(() => {
        const order = ['Gia Đình & Thân Thiết', 'Quan hệ Xã hội', 'Đối Địch', 'Khác'];
        return order.filter(cat => categorizedRelationships[cat] && categorizedRelationships[cat].length > 0);
    }, [categorizedRelationships]);


    const handleSaveAffinity = (targetCharId: string) => {
        if (!editingRel) return;
        const newAffinity = parseInt(editingRel.currentAffinity, 10);
        if (!isNaN(newAffinity)) {
            onUpdateRelationship(targetCharId, Math.max(-100, Math.min(100, newAffinity)));
        }
        setEditingRel(null);
    };

    return (
        <div className="relationships-tab-container">
            <input
                type="text"
                placeholder="Tìm kiếm theo tên..."
                className="relationship-search-input"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
            />

            {orderedCategories.length > 0 ? orderedCategories.map(category => (
                <div key={category} className="relationship-category">
                    <h4>{category} ({categorizedRelationships[category].length})</h4>
                    <div className="relationship-list">
                        {categorizedRelationships[category].map(({ npc, relationship, reciprocalRelationship }) => {
                            const affinityTo = relationship.affinity;
                            const affinityFrom = reciprocalRelationship?.affinity ?? 0;
                            const affinityInfoTo = getRelationshipInfo(affinityTo);
                            const affinityInfoFrom = getRelationshipInfo(affinityFrom);
                            const affinityPercentTo = (affinityTo + 100) / 2;
                            const affinityPercentFrom = (affinityFrom + 100) / 2;
                            const isEditingThis = editingRel?.targetCharId === npc.id;
                            
                            const title = `${relationship.description || `Mối quan hệ của bạn với ${npc.displayName} là ${relationship.type}.`}\n${reciprocalRelationship?.description || `Chưa rõ mối quan hệ của họ với bạn.`}`;

                            return (
                                <div key={npc.id} className="relationship-item" onClick={() => !isEditingThis && onNpcSelect(npc.name)} title={title}>
                                    <div className="relationship-npc-info">
                                        <div className="relationship-avatar">
                                            {npc.avatarUrl ? <img src={npc.avatarUrl} alt={npc.displayName} /> : <span>{npc.displayName.charAt(0)}</span>}
                                        </div>
                                        <div className="relationship-names">
                                            <span className="relationship-display-name">{npc.displayName}</span>
                                            <span className="relationship-type">{relationship.type}</span>
                                        </div>
                                    </div>
                                    <div className="relationship-affinity-visual">
                                        <div className="asymmetric-affinity">
                                            <div 
                                                className="affinity-line"
                                                title={areCheatsEnabled ? "Nhấp để sửa thiện cảm của bạn" : `Thiện cảm của bạn: ${affinityTo}`}
                                                onClick={areCheatsEnabled ? (e) => { e.stopPropagation(); setEditingRel({ targetCharId: npc.id, currentAffinity: String(affinityTo) }) } : undefined}
                                            >
                                                <span className="affinity-direction">Bạn →</span>
                                                {isEditingThis ? (
                                                    <input 
                                                        type="number"
                                                        value={editingRel.currentAffinity}
                                                        onChange={(e) => setEditingRel(prev => prev ? {...prev, currentAffinity: e.target.value} : null)}
                                                        onBlur={() => handleSaveAffinity(npc.id)}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') e.currentTarget.blur();
                                                            if (e.key === 'Escape') setEditingRel(null);
                                                        }}
                                                        onClick={(e) => e.stopPropagation()}
                                                        autoFocus
                                                    />
                                                ) : (
                                                    <span className="affinity-text" style={{ color: affinityInfoTo.color }}>{affinityTo}</span>
                                                )}
                                            </div>
                                            <div className="affinity-bar-container" title={`Thiện cảm của bạn: ${affinityTo}`}>
                                                <div className="affinity-bar" style={{ width: `${affinityPercentTo}%`, backgroundColor: affinityInfoTo.color }}></div>
                                            </div>
                                        </div>
                                         <div className="asymmetric-affinity">
                                            <div className="affinity-line" title={`Thiện cảm của họ: ${affinityFrom}`}>
                                                <span className="affinity-direction">Họ →</span>
                                                <span className="affinity-text" style={{ color: affinityInfoFrom.color }}>{affinityFrom}</span>
                                            </div>
                                            <div className="affinity-bar-container" title={`Thiện cảm của họ: ${affinityFrom}`}>
                                                <div className="affinity-bar" style={{ width: `${affinityPercentFrom}%`, backgroundColor: affinityInfoFrom.color }}></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )) : (
                <NoInfoPlaceholder text="Không có mối quan hệ nào phù hợp." />
            )}
        </div>
    );
};