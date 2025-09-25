/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useGameContext } from '../../contexts/GameContext';
import { CraftingCategoryView } from './CraftingCategoryView';
import { CRAFTING_TAGS } from '../../../constants/tagConstants';
import type { Character, Stat } from '../../../types';
import './CraftingTab.css';
import './VoLamArtsTab.css'; // Re-use styles for tabs

interface CraftingTabProps {
    character: Character;
    selectedRecipe: Stat | null;
    onRecipeSelect: (recipe: Stat) => void;
    searchTerm: string;
    suggestedRecipeIds: Set<string>;
    enableCheats: boolean;
    onDeleteRecipe: (recipeId: string) => void;
}

const CRAFTING_TABS_CONFIG: Record<string, { label: string; filter: (stat: Stat) => boolean; placeholder: string }[]> = {
    'Tu Tiên': [
        { label: 'Luyện Đan', filter: s => s.tags?.includes(CRAFTING_TAGS.ALCHEMY_CULTIVATION) ?? false, placeholder: 'Bạn chưa biết công thức luyện đan nào.' },
        { label: 'Vẽ Bùa Chú', filter: s => s.tags?.includes(CRAFTING_TAGS.TALISMAN) ?? false, placeholder: 'Bạn chưa biết công thức vẽ bùa nào.' },
        { label: 'Luyện chế khôi lỗi', filter: s => s.tags?.includes(CRAFTING_TAGS.PUPPETRY) ?? false, placeholder: 'Bạn chưa biết công thức luyện chế khôi lỗi nào.' },
        { label: 'Luyện Khí', filter: s => s.tags?.includes(CRAFTING_TAGS.REFINING_CULTIVATION) ?? false, placeholder: 'Bạn chưa biết công thức luyện khí nào.' },
    ],
    'Võ Lâm': [
        { label: 'Rèn Đúc', filter: s => s.tags?.includes(CRAFTING_TAGS.FORGING) ?? false, placeholder: 'Bạn chưa biết công thức rèn đúc nào.' },
        { label: 'Chế Dược', filter: s => s.tags?.includes(CRAFTING_TAGS.PHARMACY) ?? false, placeholder: 'Bạn chưa biết công thức chế thuốc nào.' },
        { label: 'Nấu ăn', filter: s => s.tags?.includes(CRAFTING_TAGS.COOKING) ?? false, placeholder: 'Bạn chưa biết công thức nấu ăn nào.' },
    ],
    'Dị Giới Fantasy': [
        { label: 'Rèn Đúc', filter: s => s.tags?.includes(CRAFTING_TAGS.FORGING) ?? false, placeholder: 'Bạn chưa biết công thức rèn đúc nào.' },
        { label: 'Giả Kim', filter: s => s.tags?.includes(CRAFTING_TAGS.ALCHEMY_FANTASY) ?? false, placeholder: 'Bạn chưa biết công thức giả kim nào.' },
        { label: 'Chế Tác', filter: s => s.tags?.includes(CRAFTING_TAGS.ARTISAN) ?? false, placeholder: 'Bạn chưa biết công thức chế tác nào.' },
        { label: 'Nấu ăn', filter: s => s.tags?.includes(CRAFTING_TAGS.COOKING) ?? false, placeholder: 'Bạn chưa biết công thức nấu ăn nào.' },
    ],
    'Đô Thị Hiện Đại': [
        { label: 'Chế tạo', filter: s => s.tags?.includes(CRAFTING_TAGS.MANUFACTURING), placeholder: 'Bạn chưa biết công thức chế tạo nào.' },
        { label: 'Nấu ăn', filter: s => s.tags?.includes(CRAFTING_TAGS.COOKING) ?? false, placeholder: 'Bạn chưa biết công thức nấu ăn nào.' },
    ],
    'Hậu Tận Thế': [
         { label: 'Chế tạo', filter: s => s.tags?.includes(CRAFTING_TAGS.MANUFACTURING), placeholder: 'Bạn chưa biết công thức chế tạo nào.' },
         { label: 'Nấu ăn', filter: s => s.tags?.includes(CRAFTING_TAGS.COOKING) ?? false, placeholder: 'Bạn chưa biết công thức nấu ăn nào.' },
    ],
    'Default': [
        { label: 'Chế Tạo', filter: s => ![CRAFTING_TAGS.COOKING, CRAFTING_TAGS.FORMATION, CRAFTING_TAGS.TALISMAN, CRAFTING_TAGS.ALCHEMY_CULTIVATION, CRAFTING_TAGS.REFINING_CULTIVATION, CRAFTING_TAGS.PHARMACY, CRAFTING_TAGS.ALCHEMY_FANTASY, CRAFTING_TAGS.ARTISAN, CRAFTING_TAGS.FORGING, CRAFTING_TAGS.PUPPETRY].some(tag => s.tags?.includes(tag)), placeholder: 'Bạn chưa biết công thức chế tạo nào.' },
    ]
};

// Aliases for genres that share crafting systems
CRAFTING_TABS_CONFIG['Huyền Huyễn Truyền Thuyết'] = CRAFTING_TABS_CONFIG['Tu Tiên'];
CRAFTING_TABS_CONFIG['Thời Chiến (Trung Hoa/Nhật Bản)'] = CRAFTING_TABS_CONFIG['Võ Lâm'];
CRAFTING_TABS_CONFIG['Thế Giới Giả Tưởng (Game/Tiểu Thuyết)'] = CRAFTING_TABS_CONFIG['Dị Giới Fantasy'];
CRAFTING_TABS_CONFIG['Đô Thị Hiện Đại 100% bình thường'] = CRAFTING_TABS_CONFIG['Đô Thị Hiện Đại'];
CRAFTING_TABS_CONFIG['Đô Thị Dị Biến'] = CRAFTING_TABS_CONFIG['Đô Thị Hiện Đại'];
CRAFTING_TABS_CONFIG['Đồng nhân'] = CRAFTING_TABS_CONFIG['Default'];
CRAFTING_TABS_CONFIG['Trống'] = CRAFTING_TABS_CONFIG['Default'];


export const CraftingTab = ({ character, selectedRecipe, onRecipeSelect, searchTerm, suggestedRecipeIds, enableCheats, onDeleteRecipe }: CraftingTabProps) => {
    const { worldSettings } = useGameContext();
    const { genre } = worldSettings;

    const tabs = useMemo(() => CRAFTING_TABS_CONFIG[genre] || CRAFTING_TABS_CONFIG['Default'], [genre]);
    const [activeSubTab, setActiveSubTab] = useState<string>(tabs[0].label);

    useEffect(() => {
        const currentTabs = CRAFTING_TABS_CONFIG[genre] || CRAFTING_TABS_CONFIG['Default'];
        if (!currentTabs.some(tab => tab.label === activeSubTab)) {
            setActiveSubTab(currentTabs[0].label);
        }
    }, [genre, activeSubTab]);

    const activeTabInfo = useMemo(() => tabs.find(tab => tab.label === activeSubTab) || tabs[0], [tabs, activeSubTab]);

    const finalRecipeFilter = useCallback((stat: Stat) => {
        return stat.category === 'Sơ Đồ Chế Tạo' && stat.recipeData && activeTabInfo.filter(stat);
    }, [activeTabInfo]);

    return (
        <div className="crafting-tab-container">
            <div className="vo-lam-sub-tabs">
                {tabs.map(tab => (
                    <button
                        key={tab.label}
                        className={`vo-lam-sub-tab-button ${activeSubTab === tab.label ? 'active' : ''}`}
                        onClick={() => setActiveSubTab(tab.label)}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>
            <div className="vo-lam-sub-tab-content">
                <CraftingCategoryView
                    character={character}
                    recipeFilter={finalRecipeFilter}
                    placeholderText={activeTabInfo.placeholder}
                    selectedRecipe={selectedRecipe}
                    onRecipeSelect={onRecipeSelect}
                    searchTerm={searchTerm}
                    suggestedRecipeIds={suggestedRecipeIds}
                    enableCheats={enableCheats}
                    onDeleteRecipe={onDeleteRecipe}
                />
            </div>
        </div>
    );
};
