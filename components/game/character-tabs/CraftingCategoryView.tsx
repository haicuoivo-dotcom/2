/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useMemo } from 'react';
import { NoInfoPlaceholder } from '../../ui/NoInfoPlaceholder';
import { ITEM_TAGS } from '../../../constants/tagConstants';
import { BASE_ITEM_TEMPLATES } from '../../../constants/items';
import { getRarityClass } from '../../../utils/game';
import type { Character, Stat } from '../../../types';
import './CraftingTab.css';

interface CraftingCategoryViewProps {
    character: Character;
    recipeFilter: (stat: Stat) => boolean;
    placeholderText: string;
    selectedRecipe: Stat | null;
    onRecipeSelect: (recipe: Stat) => void;
    searchTerm: string;
    suggestedRecipeIds: Set<string>;
    enableCheats: boolean;
    onDeleteRecipe: (recipeId: string) => void;
}

export const CraftingCategoryView = ({ character, recipeFilter, placeholderText, selectedRecipe, onRecipeSelect, searchTerm, suggestedRecipeIds, enableCheats, onDeleteRecipe }: CraftingCategoryViewProps) => {
    const characterMaterials = useMemo(() => {
        const materialMap = new Map<string, number>();
        character.stats?.forEach(stat => {
            if (stat.category === 'Nguyên liệu' || stat.category === 'Vật phẩm') {
                materialMap.set(stat.name, (materialMap.get(stat.name) || 0) + (typeof stat.value === 'number' ? stat.value : 1));
            }
        });
        return materialMap;
    }, [character.stats]);

    const knownRecipes = useMemo(() => {
        const allRecipes = character.stats?.filter(recipeFilter) || [];
        if (!searchTerm) {
            return allRecipes;
        }
        const lowerSearch = searchTerm.toLowerCase();
        return allRecipes.filter(recipeStat => {
            if (recipeStat.name.toLowerCase().includes(lowerSearch)) {
                return true;
            }
            if (recipeStat.recipeData?.ingredients.some(ing => ing.name.toLowerCase().includes(lowerSearch))) {
                return true;
            }
            return false;
        });
    }, [character.stats, recipeFilter, searchTerm]);

    return (
        <div className="crafting-tab-content">
            {knownRecipes.length === 0 ? (
                <NoInfoPlaceholder text={searchTerm ? "Không tìm thấy công thức nào." : placeholderText} />
            ) : (
                <div className="crafting-grid">
                    {knownRecipes.map(recipeStat => {
                        const recipe = recipeStat.recipeData!;
                        const productTemplate = BASE_ITEM_TEMPLATES[recipe.product];
                        const canCraft = enableCheats || recipe.ingredients.every(ingredient =>
                            (characterMaterials.get(ingredient.name) || 0) >= ingredient.quantity
                        );
                        const isSelected = selectedRecipe?.id === recipeStat.id;
                        const isSuggested = !canCraft && (recipeStat.id ? suggestedRecipeIds.has(recipeStat.id) : false);
                        const productRarityClass = productTemplate ? getRarityClass(productTemplate.rarity) : '';

                        const cardClasses = [
                            'recipe-card',
                            !canCraft ? 'cannot-craft' : '',
                            isSelected ? 'selected' : '',
                            canCraft ? 'craftable' : '',
                            isSuggested ? 'suggested' : '',
                            productRarityClass,
                        ].filter(Boolean).join(' ');


                        return (
                            <div 
                                key={recipeStat.id} 
                                className={cardClasses}
                                onClick={() => onRecipeSelect(recipeStat)}
                            >
                                {enableCheats && (
                                    <button
                                        className="recipe-delete-button"
                                        title={`Xóa công thức ${recipeStat.name}`}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onDeleteRecipe(recipeStat.id!);
                                        }}
                                    >
                                        ×
                                    </button>
                                )}
                                <h5 className="recipe-name">{recipeStat.name}</h5>
                                <ul className="ingredient-list">
                                    {recipe.ingredients.map(ingredient => {
                                        const owned = characterMaterials.get(ingredient.name) || 0;
                                        const hasEnough = enableCheats || (owned >= ingredient.quantity);
                                        return (
                                            <li key={ingredient.name} className={`ingredient-item ${hasEnough ? 'has-enough' : 'not-enough'}`}>
                                                <span className="ingredient-status-dot"></span>
                                                <span>{ingredient.name}</span>
                                                <span>x {ingredient.quantity}</span>
                                            </li>
                                        );
                                    })}
                                </ul>
                                {productTemplate && (
                                    <div className="recipe-product-info">
                                        <span>➔</span>
                                        <span className={`product-rarity-badge ${getRarityClass(productTemplate.rarity)}`}>{productTemplate.rarity}</span>
                                        <span className={`product-name ${getRarityClass(productTemplate.rarity)}`}>{recipe.product}</span>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
