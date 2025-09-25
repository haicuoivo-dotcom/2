/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { CraftingTab } from '../game/character-tabs/CraftingTab';
import { NoInfoPlaceholder } from '../ui/NoInfoPlaceholder';
import { BASE_ITEM_TEMPLATES } from '../../constants/items';
import { ItemIcon } from '../ui/ItemIcon';
import { useGameContext } from '../contexts/GameContext';
import { useToasts } from '../contexts/ToastContext';
import { useSettings } from '../contexts/SettingsContext';
import { FormField } from '../ui/FormField';
import { generateUniqueId } from '../../utils/id';
// FIX: Corrected import from PREDEFINED_RARITIES to PREDEFINED_QUALITIES to match available exports.
import { DEFAULT_EQUIPMENT_SLOTS, STAT_HEALTH, PREDEFINED_QUALITIES, ITEM_SLOT_TYPES, PREDEFINED_RARITIES } from '../../constants/statConstants';
import { ITEM_TAGS, CRAFTING_TAGS } from '../../constants/tagConstants';
import { getRarityClass } from '../../utils/game';
import type { AppSettings, Character, Stat, GameTime, RecipeData } from '../../types';
import '../game/character-tabs/CraftingTab.css'; // Re-use the stylesheet

interface ResearchPanelProps {
    character: Character;
    worldSettings: any;
    addToast: (message: string, type?: 'info' | 'success' | 'error' | 'warning') => void;
    dispatch: React.Dispatch<any>;
    settings: AppSettings;
    // FIX: Add missing incrementApiRequestCount prop to satisfy the type check from the calling component.
    incrementApiRequestCount: () => void;
}

// NEW: Research Panel Component
const ResearchPanel = ({ character, addToast, dispatch }: ResearchPanelProps) => {
    const [isResearching, setIsResearching] = useState(false);
    const [newlyResearchedRecipe, setNewlyResearchedRecipe] = useState<Stat | null>(null);
    const [researchTime, setResearchTime] = useState(0);
    const timerRef = useRef<number | null>(null);
    const isMounted = useRef(true);

    useEffect(() => {
        isMounted.current = true;
        return () => { isMounted.current = false; };
    }, []);

    useEffect(() => {
        if (isResearching) {
            setResearchTime(0);
            timerRef.current = window.setInterval(() => {
                if (isMounted.current) {
                    setResearchTime(p => p + 1)
                }
            }, 1000);
        } else if (timerRef.current) {
            clearInterval(timerRef.current);
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [isResearching]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    };

    const handleResearch = async () => {
        setIsResearching(true);
        setNewlyResearchedRecipe(null);
        addToast("Bắt đầu quá trình nghiên cứu sâu...", 'info');
    
        try {
            const knownRecipeNames = new Set(
                character.stats
                    .filter((s: Stat) => s.category === 'Sơ Đồ Chế Tạo')
                    .map((s: Stat) => s.name)
            );
    
            const allTemplateRecipes = Object.values(BASE_ITEM_TEMPLATES).filter(
                t => t.category === 'Sơ Đồ Chế Tạo'
            );
    
            const unknownRecipes = allTemplateRecipes.filter(
                t => !knownRecipeNames.has(t.name)
            );
    
            if (unknownRecipes.length === 0) {
                addToast("Bạn đã học hết tất cả các công thức cơ bản!", 'success');
                if (isMounted.current) setIsResearching(false);
                return;
            }
    
            const targetRecipeTemplate = unknownRecipes[Math.floor(Math.random() * unknownRecipes.length)];
    
            await new Promise(resolve => setTimeout(resolve, 10000 + Math.random() * 5000));
    
            if (!isMounted.current) return;
    
            const recipeWithId: Stat = {
                ...(targetRecipeTemplate as Omit<Stat, 'id' | 'description'> & { baseDescription: string }),
                id: generateUniqueId('recipe-researched'),
                description: (targetRecipeTemplate as any).baseDescription,
            };
    
            setNewlyResearchedRecipe(recipeWithId);
            addToast(`Nghiên cứu thành công: ${recipeWithId.name}!`, 'success');
        } catch (error) {
            console.error("Lỗi trong quá trình nghiên cứu:", error);
            addToast("Quá trình nghiên cứu đã gặp lỗi.", 'error');
        } finally {
            if (isMounted.current) setIsResearching(false);
        }
    };

    const handleLearnRecipe = () => {
        if (!newlyResearchedRecipe) return;
        dispatch({ type: 'UPDATE_CHARACTER', payload: { characterName: character.name, updates: { stats: [...(character.stats || []), newlyResearchedRecipe] } } });
        addToast(`Đã học được công thức: ${newlyResearchedRecipe.name}`, 'success');
        setNewlyResearchedRecipe(null);
    };

    return (
        <div className="crafting-history-panel">
            <div className="tech-sim-actions">
                <button className="lore-button suggest" onClick={handleResearch} disabled={isResearching}>
                    {isResearching ? <><span className="spinner spinner-sm"></span> Đang Nghiên cứu... ({formatTime(researchTime)})</> : 'Bắt đầu Nghiên cứu'}
                </button>
                <p className="field-hint">Quá trình này sẽ mất một chút thời gian. Nhân vật của bạn sẽ tự nghiên cứu để tìm ra một công thức mới dựa trên kiến thức hiện có.</p>
            </div>

            {newlyResearchedRecipe && (
                <div className="research-result-container">
                    <h4>Kết quả Nghiên cứu</h4>
                    <div className="recipe-card craftable" style={{ cursor: 'default' }}>
                        <h5 className="recipe-name">{newlyResearchedRecipe.name}</h5>
                        <ul className="ingredient-list">
                            {newlyResearchedRecipe.recipeData!.ingredients.map((ing: any) => (
                                <li key={ing.name} className="ingredient-item has-enough">
                                    <span className="ingredient-status-dot"></span>
                                    <span>{ing.name}</span>
                                    <span>x {ing.quantity}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="research-actions">
                        <button className="lore-button" onClick={handleResearch}>Thử lại</button>
                        <button className="lore-button save-apply" onClick={handleLearnRecipe}>Học Công thức này</button>
                    </div>
                </div>
            )}
        </div>
    );
};


interface CraftingModalProps {
    onClose: () => void;
    character: Character;
    onCraftItem: (recipeName: string, quantity: number) => void;
    areCheatsEnabled: boolean;
    incrementApiRequestCount: () => void;
}

export const CraftingModal = ({ onClose, character, onCraftItem, areCheatsEnabled, incrementApiRequestCount }: CraftingModalProps) => {
    const { gameState, worldSettings, dispatch } = useGameContext();
    const { settings } = useSettings();
    const { addToast } = useToasts();
    const [selectedRecipe, setSelectedRecipe] = useState<Stat | null>(null);
    const [craftQuantity, setCraftQuantity] = useState(1);
    const [activeMainTab, setActiveMainTab] = useState<'crafting' | 'history' | 'research'>('crafting');
    const [searchTerm, setSearchTerm] = useState('');
    const [suggestedRecipeIds, setSuggestedRecipeIds] = useState<Set<string>>(new Set());
    const [isAdding, setIsAdding] = useState(false);
    const [newItem, setNewItem] = useState<Partial<Stat> & { recipeData: Partial<RecipeData> }>({
        category: 'Sơ Đồ Chế Tạo',
        recipeData: { ingredients: [{ name: '', quantity: 1 }], product: '' },
        tags: [],
    });
    // FIX: Define itemTemplateList state to resolve 'Cannot find name' error.
    const [itemTemplateList, setItemTemplateList] = useState<{ label: string; value: string }[]>([]);
    const lastHistoryId = useRef<string | null>(null);

    // FIX: Add useEffect to populate the item template list for the item editor.
    useEffect(() => {
        const list = Object.keys(BASE_ITEM_TEMPLATES).map(key => ({ label: key, value: key }));
        list.sort((a, b) => a.label.localeCompare(b.label, 'vi'));
        setItemTemplateList(list);
    }, []);

    const characterMaterials = useMemo(() => {
        const materialMap = new Map<string, number>();
        character.stats?.forEach(stat => {
            if (stat.category === 'Nguyên liệu' || stat.category === 'Vật phẩm') {
                materialMap.set(stat.name, (materialMap.get(stat.name) || 0) + (typeof stat.value === 'number' ? stat.value : 1));
            }
        });
        return materialMap;
    }, [character.stats]);

    const productTemplate = useMemo(() => {
        if (!selectedRecipe || !selectedRecipe.recipeData) return null;
        return BASE_ITEM_TEMPLATES[selectedRecipe.recipeData.product];
    }, [selectedRecipe]);

    const maxCraftable = useMemo(() => {
        if (areCheatsEnabled) return 999;
        if (!selectedRecipe || !selectedRecipe.recipeData) return 0;
        const quantities = selectedRecipe.recipeData.ingredients.map(ing => {
            const owned = characterMaterials.get(ing.name) || 0;
            return Math.floor(owned / ing.quantity);
        });
        return Math.min(...quantities);
    }, [selectedRecipe, characterMaterials, areCheatsEnabled]);

     const { successChance, requiredSkillName, skillLevel } = useMemo(() => {
        if (!selectedRecipe || !selectedRecipe.recipeData) {
            return { successChance: 0, requiredSkillName: null, skillLevel: 0 };
        }
        if (areCheatsEnabled) {
            return { successChance: 100, requiredSkillName: 'Cheat', skillLevel: 999 };
        }
        const { difficulty = 1, craftingSkill } = selectedRecipe.recipeData;
        const characterSkill = craftingSkill ? character.stats?.find(s => s.name === craftingSkill) : null;
        const level = (characterSkill && typeof characterSkill.value === 'number') ? characterSkill.value : 1;
        const proficiency = (characterSkill && typeof characterSkill.proficiency === 'number') ? characterSkill.proficiency : 0;
        
        const baseSuccessRate = 80;
        const bonusPerLevelDiff = 5;
        const bonusPerProficiencyPoint = 0.1;
        const chance = Math.max(10, Math.min(100, baseSuccessRate + ((level - difficulty) * bonusPerLevelDiff) + (proficiency * bonusPerProficiencyPoint)));
        
        return { successChance: Math.round(chance), requiredSkillName: craftingSkill, skillLevel: level };
    }, [selectedRecipe, character.stats, areCheatsEnabled]);

    useEffect(() => {
        if (gameState.craftingHistory && gameState.craftingHistory.length > 0) {
            const latestEntry = gameState.craftingHistory[0];
            if (latestEntry.id !== lastHistoryId.current) {
                lastHistoryId.current = latestEntry.id;
                
                if (latestEntry.outcome === 'success') {
                    const qualityText = latestEntry.quality && latestEntry.quality !== 'Thường' ? `[${latestEntry.quality}] ` : '';
                    addToast(`Chế tạo thành công ${latestEntry.quantity} x ${qualityText}${latestEntry.recipeName}!`, 'success');
                } else {
                    const lostText = latestEntry.materialsLost?.map(m => `${m.quantity} ${m.name}`).join(', ') || 'một số';
                    addToast(`Chế tạo thất bại! Mất ${lostText} nguyên liệu.`, 'error');
                }
            }
        }
    }, [gameState.craftingHistory, addToast]);
    
     const updateCraftingSuggestions = useCallback(() => {
        const suggestions = new Set<string>();
        const allRecipes = character.stats?.filter(s => s.category === 'Sơ Đồ Chế Tạo' && s.recipeData) || [];

        const healthStat = character.stats?.find(s => s.name === STAT_HEALTH);
        if (healthStat && typeof healthStat.value === 'string') {
            const [current, max] = healthStat.value.split('/').map(Number);
            if (!isNaN(current) && !isNaN(max) && max > 0 && current / max < 0.7) {
                allRecipes.forEach(recipe => {
                    if (!recipe.id) return;
                    const productTemplate = BASE_ITEM_TEMPLATES[recipe.recipeData!.product];
                    if (productTemplate && productTemplate.tags?.includes(ITEM_TAGS.FUNCTIONALITY.HEALING)) {
                        suggestions.add(recipe.id);
                    }
                });
            }
        }

        const getStatValue = (item: { effects?: any[] } | undefined, statName: string): number => {
            if (!item || !item.effects) return 0;
            const effect = item.effects.find(e => e.targetStat === statName);
            if (!effect || !effect.modifier) return 0;
            return parseInt(effect.modifier, 10) || 0;
        };
        
        const getPowerScore = (item: { effects?: any[] } | undefined): number => {
            if (!item) return 0;
            return getStatValue(item, 'Tấn Công') + getStatValue(item, 'Phòng Thủ');
        };

        const craftableEquipment = allRecipes
            .map(recipe => ({ recipe, product: BASE_ITEM_TEMPLATES[recipe.recipeData!.product] }))
            .filter(item => item.product && item.product.slot && item.product.slot !== 'Không có');

        DEFAULT_EQUIPMENT_SLOTS.forEach(slot => {
            const equippedItemId = character.equipment?.[slot];
            const equippedItem = equippedItemId ? character.stats.find(s => s.id === equippedItemId) : undefined;
            
            if (equippedItem?.isPlaceholderFor) return;

            const equippedPower = getPowerScore(equippedItem);
            
            const bestCraftableForSlot = craftableEquipment
                .filter(({ product }) => {
                    const baseSlot = product.slot?.startsWith('Vũ khí') ? 'Vũ khí' : product.slot;
                    const baseTargetSlot = slot.startsWith('Vũ khí') ? 'Vũ khí' : slot;
                    return baseSlot === baseTargetSlot;
                })
                .sort((a, b) => getPowerScore(b.product) - getPowerScore(a.product))[0];
            
            if (bestCraftableForSlot) {
                const craftablePower = getPowerScore(bestCraftableForSlot.product);
                if (!equippedItem) {
                    if(bestCraftableForSlot.recipe.id) suggestions.add(bestCraftableForSlot.recipe.id);
                } else if (craftablePower > equippedPower) {
                     if(bestCraftableForSlot.recipe.id) suggestions.add(bestCraftableForSlot.recipe.id);
                }
            }
        });

        setSuggestedRecipeIds(suggestions);
        if (suggestions.size > 0) {
            addToast(`Đã tìm thấy ${suggestions.size} gợi ý chế tạo hữu ích!`, 'success');
        }
    }, [character, addToast]);

    useEffect(() => {
        if (activeMainTab === 'crafting') {
            updateCraftingSuggestions();
        }
    }, [activeMainTab, updateCraftingSuggestions]);


    const handleCraft = useCallback(() => {
        if (!selectedRecipe || craftQuantity <= 0) return;
        if (!areCheatsEnabled && craftQuantity > maxCraftable) return;
        onCraftItem(selectedRecipe.name, craftQuantity);
    }, [selectedRecipe, craftQuantity, maxCraftable, onCraftItem, areCheatsEnabled]);
    
    useEffect(() => {
        if (selectedRecipe && maxCraftable < craftQuantity) {
            setCraftQuantity(Math.max(1, maxCraftable));
        }
    }, [selectedRecipe, maxCraftable, craftQuantity]);

    const formatGameTime = (time: GameTime | undefined): string => {
        if (!time) return 'Không rõ';
        const { year, month, day, hour, minute } = time;
        const paddedHour = String(hour).padStart(2, '0');
        const paddedMinute = String(minute).padStart(2, '0');
        return `Ngày ${day}-${month}-${year}, ${paddedHour}:${paddedMinute}`;
    };

    const handleDeleteRecipe = (recipeId: string) => {
        const updatedStats = character.stats.filter(s => s.id !== recipeId);
        dispatch({ type: 'UPDATE_CHARACTER', payload: { characterName: character.name, updates: { stats: updatedStats } } });
        addToast("Đã xóa công thức.", "success");
        if (selectedRecipe?.id === recipeId) {
            setSelectedRecipe(null);
        }
    };
    
    const handleSaveNewRecipe = () => {
        if (!newItem.name?.trim() || !newItem.recipeData.product?.trim()) {
            addToast("Tên công thức và tên thành phẩm không được để trống.", "warning");
            return;
        }
        if (newItem.recipeData.ingredients?.some(ing => !ing.name.trim() || ing.quantity < 1)) {
            addToast("Tên nguyên liệu không được để trống và số lượng phải lớn hơn 0.", "warning");
            return;
        }

        const recipeToAdd: Stat = {
            id: generateUniqueId('recipe-manual'),
            name: newItem.name.trim(),
            description: newItem.description?.trim() || `Công thức chế tạo ${newItem.name.trim()}.`,
            category: 'Sơ Đồ Chế Tạo',
            recipeData: {
                product: newItem.recipeData.product.trim(),
                ingredients: newItem.recipeData.ingredients!.filter(ing => ing.name.trim() && ing.quantity > 0)
            },
            tags: newItem.tags || [],
        };

        const updatedStats = [...(character.stats || []), recipeToAdd];
        dispatch({ type: 'UPDATE_CHARACTER', payload: { characterName: character.name, updates: { stats: updatedStats } } });
        addToast("Đã thêm công thức mới!", "success");
        setIsAdding(false);
        setNewItem({ category: 'Sơ Đồ Chế Tạo', recipeData: { ingredients: [{ name: '', quantity: 1 }], product: '' }, tags: [] });
    };

    const handleIngredientChange = (index: number, field: 'name' | 'quantity', value: string | number) => {
        const updatedIngredients = [...(newItem.recipeData.ingredients || [])];
        updatedIngredients[index] = { ...updatedIngredients[index], [field]: value };
        setNewItem(prev => ({ ...prev, recipeData: { ...prev.recipeData, ingredients: updatedIngredients } }));
    };

    const addIngredientField = () => {
        const updatedIngredients = [...(newItem.recipeData.ingredients || []), { name: '', quantity: 1 }];
        setNewItem(prev => ({ ...prev, recipeData: { ...prev.recipeData, ingredients: updatedIngredients } }));
    };
    
    const removeIngredientField = (index: number) => {
        const updatedIngredients = (newItem.recipeData.ingredients || []).filter((_, i) => i !== index);
        setNewItem(prev => ({ ...prev, recipeData: { ...prev.recipeData, ingredients: updatedIngredients } }));
    };

    const handleTemplateSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const templateName = e.target.value;
        if (!templateName) return;
        const template = BASE_ITEM_TEMPLATES[templateName];
        if (template) {
            setNewItem(prev => ({
                ...prev,
                ...template,
                name: `Sơ Đồ Chế Tạo: ${template.name || templateName}`,
                recipeData: {
                    ...(prev.recipeData),
                    product: template.name || templateName,
                },
                description: template.baseDescription,
                quantity: prev?.quantity || 1,
            }));
        }
        e.target.value = '';
    };

    const renderDetailPanel = () => {
        if (isAdding) {
            return (
                 <div className="add-stat-form">
                    <h5>Thêm Công thức Mới</h5>
                    <div className="name-template-group">
                        <FormField label="Tên" htmlFor="new-item-name">
                            <input id="new-item-name" type="text" value={newItem.name || ''} onChange={e => setNewItem(p => ({ ...p, name: e.target.value }))} />
                        </FormField>
                        <FormField label="Hoặc chọn mẫu" htmlFor="item-template-select">
                            <div className="select-wrapper">
                                <select id="item-template-select" value="" onChange={handleTemplateSelect}>
                                    <option value="">-- Mẫu Vật phẩm --</option>
                                    {itemTemplateList.map(opt => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                            </div>
                        </FormField>
                    </div>
                    <FormField label="Tên Thành phẩm (BaseItemName)" htmlFor="new-recipe-product">
                        <input id="new-recipe-product" type="text" value={newItem.recipeData.product || ''} onChange={e => setNewItem(p => ({ ...p, recipeData: { ...p.recipeData, product: e.target.value } }))} />
                    </FormField>
                     <FormField label="Mô tả" htmlFor="new-recipe-desc">
                        <textarea id="new-recipe-desc" value={newItem.description || ''} onChange={e => setNewItem(p => ({ ...p, description: e.target.value }))} rows={2}></textarea>
                    </FormField>
                     <FormField label="Phân loại (Tags)" htmlFor="new-recipe-tags">
                        <div className="tags-checkbox-group">
                            <label><input type="checkbox" checked={newItem.tags?.includes(CRAFTING_TAGS.COOKING)} onChange={e => setNewItem(p => ({...p, tags: e.target.checked ? [...(p.tags||[]), CRAFTING_TAGS.COOKING] : (p.tags||[]).filter(t => t !== CRAFTING_TAGS.COOKING)}))} /> Nấu ăn</label>
                            <label><input type="checkbox" checked={newItem.tags?.includes(CRAFTING_TAGS.FORMATION)} onChange={e => setNewItem(p => ({...p, tags: e.target.checked ? [...(p.tags||[]), CRAFTING_TAGS.FORMATION] : (p.tags||[]).filter(t => t !== CRAFTING_TAGS.FORMATION)}))} /> Trận pháp</label>
                        </div>
                    </FormField>
                    <FormField label="Nguyên liệu" htmlFor="new-recipe-ingredients">
                        <div className="status-effects-editor">
                             {(newItem.recipeData.ingredients || []).map((ing, index) => (
                                <div key={index} className="status-effect-row">
                                    <input type="text" placeholder="Tên Nguyên liệu" value={ing.name} onChange={e => handleIngredientChange(index, 'name', e.target.value)} />
                                    <input type="number" placeholder="Số lượng" value={ing.quantity} min="1" onChange={e => handleIngredientChange(index, 'quantity', parseInt(e.target.value, 10) || 1)} style={{flex: '0 1 80px'}}/>
                                    <button className="remove-effect-button" onClick={() => removeIngredientField(index)} title="Xóa nguyên liệu">×</button>
                                </div>
                            ))}
                            <button className="add-effect-button" onClick={addIngredientField}>+ Thêm Nguyên liệu</button>
                        </div>
                    </FormField>
                    <div className="add-stat-actions">
                        <button className="lore-button cancel" onClick={() => setIsAdding(false)}>Hủy</button>
                        <button className="lore-button save-apply" onClick={handleSaveNewRecipe}>Lưu</button>
                    </div>
                </div>
            )
        }
        
        if (!selectedRecipe || !productTemplate) {
            return <NoInfoPlaceholder text="Chọn một công thức để xem chi tiết." />;
        }
        
        const productStatForIcon: Stat = {
            ...productTemplate,
            id: `temp-recipe-product-${selectedRecipe.id}`,
            description: productTemplate.baseDescription
        };
        const rarityClass = getRarityClass(productTemplate.rarity);

        return (
            <div className="crafting-detail-content">
                <header className="detail-header">
                    <div className="detail-icon">
                        <ItemIcon item={productStatForIcon} />
                    </div>
                    <div className="detail-title">
                        <h4 className={rarityClass}>{productTemplate.name}</h4>
                        <span>{productTemplate.baseDescription}</span>
                    </div>
                </header>

                {productTemplate.effects && productTemplate.effects.length > 0 && (
                    <div className="detail-section">
                        <h5>Thuộc tính & Hiệu ứng</h5>
                        <ul className="item-effects-list">
                            {productTemplate.effects.map((effect, index) => (
                                <li key={index} className="effect-line">
                                    <span>{effect.targetStat}</span>
                                    <span className={`effect-modifier ${effect.modifier.includes('+') ? 'positive' : 'negative'}`}>
                                        {effect.modifier}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
                
                 <div className="detail-section">
                    <h5>Yêu cầu & Tỷ lệ</h5>
                    <div className="ingredient-list-wrapper">
                        <li className="ingredient-item-wrapper">
                            <div className="ingredient-item">
                                <span>Kỹ năng Yêu cầu</span>
                                <span>{requiredSkillName || 'Không có'} (Cấp {skillLevel})</span>
                            </div>
                        </li>
                        <li className="ingredient-item-wrapper">
                            <div className="ingredient-item">
                                <span>Độ khó Công thức</span>
                                <span>{selectedRecipe?.recipeData?.difficulty || 1}</span>
                            </div>
                        </li>
                         <li className="ingredient-item-wrapper">
                            <div className="ingredient-item">
                                <span>Tỷ lệ Thành công</span>
                                <strong style={{color: successChance > 50 ? 'var(--accent-success)' : 'var(--accent-warning)'}}>{successChance}%</strong>
                            </div>
                        </li>
                    </div>
                </div>

                <div className="detail-section">
                    <h5>Nguyên liệu Cần thiết</h5>
                    <ul className="ingredient-list-wrapper">
                        {selectedRecipe.recipeData!.ingredients.map(ing => {
                            const owned = characterMaterials.get(ing.name) || 0;
                            const required = ing.quantity * craftQuantity;
                            const hasEnough = areCheatsEnabled || owned >= required;
                            const ingredientTemplate = BASE_ITEM_TEMPLATES[ing.name];

                            return (
                                <li key={ing.name} className="ingredient-item-wrapper">
                                    <div className={`ingredient-item ${hasEnough ? 'has-enough' : 'not-enough'}`}>
                                        <span className="ingredient-status-dot"></span>
                                        <span>{ing.name}</span>
                                        <span>{owned} / {required}</span>
                                    </div>
                                    {ingredientTemplate?.source && (
                                        <div className="ingredient-source-hint">
                                            💡 {ingredientTemplate.source.join(' ')}
                                        </div>
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                </div>
                
                <div className="crafting-actions">
                    <input 
                        type="number" 
                        min="1" 
                        max={maxCraftable > 0 ? maxCraftable : 1}
                        value={craftQuantity}
                        onChange={e => setCraftQuantity(Math.max(1, Math.min(maxCraftable, parseInt(e.target.value, 10) || 1)))}
                        disabled={!areCheatsEnabled && maxCraftable === 0}
                    />
                    <button 
                        className="craft-button"
                        onClick={handleCraft}
                        disabled={!areCheatsEnabled && (maxCraftable < 1 || craftQuantity > maxCraftable)}
                    >
                        Chế tạo x{craftQuantity}
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content fullscreen-modal-content crafting-modal-content" onClick={e => e.stopPropagation()}>
                <header className="modal-header">
                    <div className="modal-header-content">
                        <h3>Chế Tạo</h3>
                        <div className="crafting-main-tabs">
                            <button 
                                className={`crafting-main-tab-button ${activeMainTab === 'crafting' ? 'active' : ''}`}
                                onClick={() => setActiveMainTab('crafting')}
                            >
                                Chế Tạo
                            </button>
                            <button 
                                className={`crafting-main-tab-button ${activeMainTab === 'research' ? 'active' : ''}`}
                                onClick={() => setActiveMainTab('research')}
                            >
                                Nghiên cứu
                            </button>
                            <button 
                                className={`crafting-main-tab-button ${activeMainTab === 'history' ? 'active' : ''}`}
                                onClick={() => setActiveMainTab('history')}
                            >
                                Lịch sử
                            </button>
                        </div>
                    </div>
                    <button onClick={onClose} className="modal-close-button" aria-label="Đóng">×</button>
                </header>
                {activeMainTab === 'crafting' ? (
                    <div className="crafting-modal-body">
                        <div className="crafting-recipes-panel">
                             <div className="crafting-search-bar">
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Tìm theo tên hoặc nguyên liệu..."
                                    className="map-search-input"
                                />
                                {settings.enableCheats && <button className="add-stat-button" style={{marginTop: '0.75rem'}} onClick={() => { setIsAdding(true); setSelectedRecipe(null); }}>+ Thêm Công thức mới</button>}
                            </div>
                            <CraftingTab 
                                character={character} 
                                selectedRecipe={selectedRecipe}
                                onRecipeSelect={(recipe) => {
                                    setSelectedRecipe(recipe);
                                    setIsAdding(false);
                                    setCraftQuantity(1);
                                }}
                                searchTerm={searchTerm}
                                suggestedRecipeIds={suggestedRecipeIds}
                                enableCheats={areCheatsEnabled}
                                onDeleteRecipe={handleDeleteRecipe}
                            />
                        </div>
                        <div className="crafting-detail-panel">
                            {renderDetailPanel()}
                        </div>
                    </div>
                ) : activeMainTab === 'history' ? (
                    <div className="crafting-history-panel">
                        {gameState.craftingHistory && gameState.craftingHistory.length > 0 ? (
                            <ul className="crafting-history-list">
                                {gameState.craftingHistory.slice().reverse().map(entry => (
                                    <li key={entry.id} className="crafting-history-item">
                                        <span className="history-item-name">{entry.recipeName} x{entry.quantity}</span>
                                        <span className="history-item-timestamp">{formatGameTime(entry.timestamp)}</span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <NoInfoPlaceholder text="Lịch sử chế tạo trống." />
                        )}
                    </div>
                ) : (
                    <ResearchPanel 
                        character={character}
                        worldSettings={worldSettings}
                        addToast={addToast}
                        dispatch={dispatch}
                        incrementApiRequestCount={incrementApiRequestCount}
                        settings={settings}
                    />
                )}
            </div>
        </div>
    );
};
