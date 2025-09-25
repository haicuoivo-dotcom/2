/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { NoInfoPlaceholder } from '../../ui/NoInfoPlaceholder';
import type { Character, PersonalityTrait } from '../../../types';
import './PersonalityTab.css';
import { PencilIcon } from '../../ui/Icons';

interface PersonalityTabProps {
    character: Character;
    onOpenTraitPicker: () => void;
    onRemoveTrait: (traitId: string) => void;
    enableCheats: boolean;
}

export const PersonalityTab = ({ character, onOpenTraitPicker, onRemoveTrait, enableCheats }: PersonalityTabProps) => {
    const { personality } = character;

    return (
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
    );
};