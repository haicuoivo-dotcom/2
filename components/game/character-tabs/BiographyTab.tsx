/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState } from 'react';
import { InlineStoryRenderer } from '../StoryRenderer';
import { useGameContext } from '../../contexts/GameContext';
import { PencilIcon } from '../../ui/Icons';
import type { Character, GameState, PersonalityTrait } from '../../../types';
import { NoInfoPlaceholder } from '../../ui/NoInfoPlaceholder';
import './PersonalityTab.css';

interface BiographyTabProps {
    character: Character;
    isPlayerCharacter: boolean;
    onEntityClick: (event: React.MouseEvent, name: string, type: string) => void;
    onUpdateCharacterData: (characterId: string, updates: Partial<Character>) => void;
    enableCheats: boolean;
    onSetEquippedTitle: (titleId: string) => void;
    onOpenTraitPicker: () => void;
    onRemoveTrait: (traitId: string) => void;
}

const EditableField = ({ content, onSave, enableCheats, fieldName }: { content: string, onSave: (value: string) => void, enableCheats: boolean, fieldName: string }) => {
    const { gameState } = useGameContext();
    const [isEditing, setIsEditing] = useState(false);
    const [text, setText] = useState(content);

    const handleSave = () => {
        onSave(text);
        setIsEditing(false);
    };
    
    if (enableCheats) {
        if (isEditing) {
            return (
                <div className="editable-field-active">
                    <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        onBlur={handleSave}
                        onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSave(); } else if (e.key === 'Escape') setIsEditing(false); }}
                        rows={fieldName === 'backstory' ? 6 : 4}
                        className="inline-edit-textarea"
                        autoFocus
                    />
                </div>
            );
        }
        return (
            <div className="editable-field" onClick={() => setIsEditing(true)}>
                <p className="biography-text">
                    <InlineStoryRenderer text={content} gameState={gameState!} onEntityClick={() => {}} />
                </p>
                <button className="edit-name-button" title="Sửa"><PencilIcon /></button>
            </div>
        );
    }
    
    return (
        <p className="biography-text">
            <InlineStoryRenderer text={content} gameState={gameState!} onEntityClick={() => {}} />
        </p>
    );
};


export const BiographyTab = ({
    character,
    isPlayerCharacter,
    onEntityClick,
    onUpdateCharacterData,
    enableCheats,
    onSetEquippedTitle,
    onOpenTraitPicker,
    onRemoveTrait,
}: BiographyTabProps) => {
    const titles = React.useMemo(() => {
        return character.stats?.filter(s => s.category === 'Danh Hiệu') || [];
    }, [character.stats]);

    const { personality } = character;

    const handleUpdateField = (field: keyof Character, value: string) => {
        onUpdateCharacterData(character.id, { [field]: value });
    };

    return (
        <div className="biography-tab-content">
            <div className="char-detail-section">
                <h4 className="section-title-bar">Tiểu sử</h4>
                <EditableField
                    content={character.backstory}
                    onSave={(value) => handleUpdateField('backstory', value)}
                    enableCheats={enableCheats}
                    fieldName="backstory"
                />
            </div>
            
            <div className="char-detail-section">
                <h4 className="section-title-bar">Ngoại hình</h4>
                <EditableField
                    content={character.physicalAppearance}
                    onSave={(value) => handleUpdateField('physicalAppearance', value)}
                    enableCheats={enableCheats}
                    fieldName="physicalAppearance"
                />
            </div>

            <div className="char-detail-section">
                <h4 className="section-title-bar">Trang phục Hiện tại</h4>
                <EditableField
                    content={character.currentOutfit}
                    onSave={(value) => handleUpdateField('currentOutfit', value)}
                    enableCheats={enableCheats}
                    fieldName="currentOutfit"
                />
            </div>
            
            <div className="char-detail-section">
                <h4 className="section-title-bar">Danh hiệu</h4>
                {titles.length > 0 ? (
                    <ul className="titles-list">
                        {titles.map(title => (
                            <li key={title.id} className="title-item">
                                <div className="title-info">
                                    <strong>{title.name}</strong>
                                    <p>{title.description}</p>
                                </div>
                                <button
                                    className={`lore-button ${title.isEquipped ? 'equipped' : ''}`}
                                    onClick={() => onSetEquippedTitle(title.id!)}
                                    disabled={title.isEquipped}
                                >
                                    {title.isEquipped ? 'Đang dùng' : 'Sử dụng'}
                                </button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="biography-text">Chưa có danh hiệu nào.</p>
                )}
            </div>
            <div className="char-detail-section personality-tab-container">
                <div className="personality-header">
                    <h4>Tính cách & Đặc điểm</h4>
                    {enableCheats && (
                        <button className="harem-action-button" onClick={onOpenTraitPicker}>
                            <PencilIcon /> Chỉnh sửa
                        </button>
                    )}
                </div>
                {(personality || []).length > 0 ? (
                    <ul className="trait-list">
                        {(personality || []).map((trait: PersonalityTrait) => (
                            <li key={trait.id} className="trait-card">
                                <div className="trait-card-header">
                                    <h5 className="trait-name">{trait.name}</h5>
                                    {enableCheats && (
                                        <button className="trait-remove-button" onClick={() => onRemoveTrait(trait.id)} title={`Xóa tính cách ${trait.name}`}>×</button>
                                    )}
                                </div>
                                <p className="trait-description">{trait.description}</p>
                                <div className="trait-tags">
                                    {trait.tags.map(tag => (
                                        <span key={tag} className="trait-tag">{tag}</span>
                                    ))}
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <NoInfoPlaceholder text="Nhân vật này chưa có đặc điểm tính cách nổi bật." />
                )}
            </div>
        </div>
    );
};