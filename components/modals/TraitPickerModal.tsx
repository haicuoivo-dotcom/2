/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useMemo, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { PERSONALITY_TRAITS_LIBRARY } from '../../constants/personalityTraits';
import type { Character, PersonalityTrait } from '../../types';
import './TraitPickerModal.css';

interface TraitPickerModalProps {
    character: Character;
    onClose: () => void;
    onAddTrait: (trait: PersonalityTrait) => void;
    onRemoveTrait: (traitId: string) => void;
}

export const TraitPickerModal = ({ character, onClose, onAddTrait, onRemoveTrait }: TraitPickerModalProps) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');

    const characterTraitIds = useMemo(() => new Set((character.personality || []).map(t => t.id)), [character.personality]);

    const { categorizedTraits, categories } = useMemo(() => {
        const categories = ['All', ...Object.keys(PERSONALITY_TRAITS_LIBRARY)];
        const lowerSearch = searchTerm.toLowerCase();

        const filtered = Object.fromEntries(
            Object.entries(PERSONALITY_TRAITS_LIBRARY).map(([category, traits]) => [
                category,
                traits.filter(trait => 
                    trait.name.toLowerCase().includes(lowerSearch) ||
                    trait.description.toLowerCase().includes(lowerSearch)
                )
            ])
        );

        return { categorizedTraits: filtered, categories };
    }, [searchTerm]);

    const traitsToDisplay = useMemo(() => {
        if (activeCategory === 'All') {
            return Object.values(categorizedTraits).flat();
        }
        return categorizedTraits[activeCategory] || [];
    }, [activeCategory, categorizedTraits]);

    const handleTraitClick = (trait: PersonalityTrait) => {
        if (characterTraitIds.has(trait.id)) {
            onRemoveTrait(trait.id);
        } else {
            onAddTrait(trait);
        }
    };

    return (
        // FIX: Moved content inside Modal to provide 'children' prop.
        <Modal
            onClose={onClose}
            header={<h3>Chỉnh sửa Tính cách</h3>}
            className="trait-picker-modal"
            footer={<button className="lore-button save-apply" onClick={onClose}>Hoàn tất</button>}
        >
            <>
                <div className="trait-picker-controls">
                    <input
                        type="text"
                        placeholder="Tìm kiếm tính cách..."
                        className="trait-search-input"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                    <div className="trait-category-filters">
                        {categories.map(category => (
                            <button
                                key={category}
                                className={`trait-category-button ${activeCategory === category ? 'active' : ''}`}
                                onClick={() => setActiveCategory(category)}
                            >
                                {category}
                            </button>
                        ))}
                    </div>
                </div>
                <ul className="trait-picker-list">
                    {traitsToDisplay.map(trait => {
                        const isSelected = characterTraitIds.has(trait.id);
                        return (
                            <li
                                key={trait.id}
                                className={`trait-picker-item ${isSelected ? 'selected' : ''}`}
                                onClick={() => handleTraitClick(trait)}
                            >
                                <div className="trait-picker-checkbox">{isSelected && '✓'}</div>
                                <div className="trait-picker-info">
                                    <strong className="trait-picker-name">{trait.name}</strong>
                                    <p className="trait-picker-description">{trait.description}</p>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            </>
        </Modal>
    );
};
