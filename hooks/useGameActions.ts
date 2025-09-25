/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useCallback } from 'react';
import { useGameContext } from '../components/contexts/GameContext';
import { useToasts } from '../components/contexts/ToastContext';
import { useSettings } from '../components/contexts/SettingsContext';
import { useModalManager } from './useModalManager';
import { generateUniqueId } from '../utils/id';
import { removeAccents } from '../utils/text';
import { canAddItem } from '../utils/game';
import { STAT_HEALTH } from '../constants/statConstants';
import { BASE_ITEM_TEMPLATES } from '../constants/items';
import { ITEM_TAGS } from '../constants/tagConstants';
import * as db from '../services/db';
import type { GameState, WorldSettings, Character, GameAction, LoreRule, Stat, WorldLogicRule, WorldEvent, Relationship, SaveFile } from '../../types';

interface UseGameActionsProps {
    onSaveGame: (gameState: GameState, worldSettings: WorldSettings) => void;
    onNavigateToMenu: () => void;
    setError: (error: string | null) => void;
    processTurn: (action: Partial<GameAction>, isCustom?: boolean) => Promise<void>;
    analyzeAction: (customAction: string) => Promise<void>;
}

export const useGameActions = ({
    onSaveGame,
    onNavigateToMenu,
    setError,
    processTurn,
    analyzeAction
}: UseGameActionsProps) => {
    const { gameState, worldSettings, dispatch } = useGameContext();
    const { addToast } = useToasts();
    const { settings } = useSettings();
    const modalManager = useModalManager({ settings });

    const handleAction = useCallback(async (action: Partial<GameAction>, isCustom = false) => {
        await processTurn(action, isCustom);
    }, [processTurn]);
    
    const handleItemAction = useCallback(async (actionDescription: string) => {
        if (!actionDescription) return;
        modalManager.closeModal();
    
        const itemNameMatch = actionDescription.match(/Sử dụng:\s*'([^']*)'/);
        if (!itemNameMatch) {
            addToast(`Không thể xử lý hành động: ${actionDescription}`, 'warning');
            return;
        }
        const itemName = itemNameMatch[1];
    
        const characterToUpdate = JSON.parse(JSON.stringify(gameState.character));
        const itemIndex = characterToUpdate.stats.findIndex((s: Stat) => s.category === 'Vật phẩm' && s.name === itemName);
    
        if (itemIndex === -1) {
            addToast(`Không tìm thấy vật phẩm "${itemName}" trong túi đồ.`, 'error');
            return;
        }
    
        const item = characterToUpdate.stats[itemIndex];
        let changesMade = false;
        let toastMessages: string[] = [];
    
        if (item.tags?.includes(ITEM_TAGS.FUNCTIONALITY.LEARNABLE)) {
            const grantedStat = (item as any).grantsStatOnUse;
            if (!grantedStat || !grantedStat.name || !grantedStat.category) {
                addToast(`Vật phẩm "${itemName}" bị lỗi và không thể học.`, 'error');
                return;
            }
    
            const alreadyKnown = characterToUpdate.stats.some(
                (s: Stat) => s.name === grantedStat.name && s.category === grantedStat.category
            );
    
            if (alreadyKnown) {
                addToast(`Bạn đã biết "${grantedStat.name}" rồi.`, 'info');
                return;
            }
    
            const newStatToAdd = { ...grantedStat, id: generateUniqueId('stat-learned') };
            characterToUpdate.stats.splice(itemIndex, 1);
            characterToUpdate.stats.push(newStatToAdd);
    
            dispatch({
                type: 'UPDATE_CHARACTER',
                payload: { characterName: characterToUpdate.name, updates: { stats: characterToUpdate.stats } }
            });
            addToast(`Bạn đã học được: ${grantedStat.name}!`, 'success');
            return;
        }
    
        if (item.effects && item.effects.length > 0) {
            for (const effect of item.effects) {
                const targetStatIndex = characterToUpdate.stats.findIndex((s: Stat) => s.name === effect.targetStat);
                if (targetStatIndex > -1) {
                    const targetStat = characterToUpdate.stats[targetStatIndex];
                    const originalValueString = JSON.stringify(targetStat.value);
                    const modifier = effect.modifier;
    
                    const modifierMatch = modifier.match(/([+-])(\d+)(%?)/);
                    if (!modifierMatch) continue;
    
                    const sign = modifierMatch[1];
                    const numValue = parseInt(modifierMatch[2], 10);
                    const isPercent = modifierMatch[3] === '%';
                    const change = (sign === '-') ? -numValue : numValue;
    
                    let newValue: string | number | undefined = targetStat.value;
    
                    if (typeof targetStat.value === 'string' && targetStat.value.includes('/')) {
                        let [current, max] = targetStat.value.split('/').map(Number);
                        if (!isNaN(current) && !isNaN(max)) {
                            let originalMax = max;
                            if (isPercent) {
                                max += Math.round(max * (change / 100));
                            } else {
                                current += change;
                            }
                            if(max !== originalMax && current === originalMax) {
                                current = max;
                            }
                            current = Math.max(0, Math.min(current, max));
                            newValue = `${Math.round(current)}/${Math.round(max)}`;
                        }
                    } else if (typeof targetStat.value === 'number') {
                        if (isPercent) {
                            newValue = targetStat.value + Math.round(targetStat.value * (change / 100));
                        } else {
                            newValue = targetStat.value + change;
                        }
                    } else if (typeof targetStat.value === 'string') {
                        const num = parseInt(targetStat.value, 10);
                        if (!isNaN(num)) {
                            if (isPercent) {
                                newValue = String(num + Math.round(num * (change / 100)));
                            } else {
                                newValue = String(num + change);
                            }
                        }
                    }
    
                    if (JSON.stringify(newValue) !== originalValueString) {
                        characterToUpdate.stats[targetStatIndex].value = newValue;
                        toastMessages.push(`${targetStat.name} đã thay đổi.`);
                        changesMade = true;
                    }
                }
            }
        }
    
        if (item.tags?.includes(ITEM_TAGS.FUNCTIONALITY.CONSUMABLE)) {
            let consumed = false;
            if (typeof item.value === 'number' && item.value > 1) {
                item.value -= 1;
                consumed = true;
            } else {
                characterToUpdate.stats.splice(itemIndex, 1);
                consumed = true;
            }
            if (consumed) {
                 toastMessages.push(`Đã tiêu thụ ${itemName}.`);
                 changesMade = true;
            }
        }
    
        if (changesMade) {
            dispatch({
                type: 'UPDATE_CHARACTER',
                payload: { characterName: characterToUpdate.name, updates: { stats: characterToUpdate.stats } }
            });
            addToast(toastMessages.join(' '), 'success');
        } else {
            addToast(`Vật phẩm "${itemName}" không có hiệu ứng tức thì.`, 'info');
        }
    }, [gameState.character, dispatch, addToast, modalManager]);
    
    const handleCraftItem = useCallback((recipeName: string, quantity: number) => {
        const recipeStat = gameState.character.stats.find(s => s.category === 'Sơ Đồ Chế Tạo' && s.name === recipeName);
        if (!recipeStat || !recipeStat.recipeData) {
            addToast("Không tìm thấy công thức.", 'error');
            return;
        }

        if (!settings.enableCheats) {
            const productTemplate = BASE_ITEM_TEMPLATES[recipeStat.recipeData.product];
            if (!productTemplate) {
                addToast(`Lỗi dữ liệu: Không tìm thấy mẫu cho sản phẩm "${recipeStat.recipeData.product}".`, 'error');
                return;
            }
            
            const existingProduct = gameState.character.stats.find(s => s.name === productTemplate.name);
            const productIsStackable = productTemplate.tags?.includes(ITEM_TAGS.FUNCTIONALITY.CONSUMABLE) || productTemplate.category === 'Nguyên liệu';
            
            if (!productIsStackable || !existingProduct) {
                 if (!canAddItem(gameState.character, 1)) {
                    addToast("Túi đồ đã đầy! Không thể chế tạo vật phẩm mới.", 'error');
                    return;
                }
            }

            const materials = new Map<string, number>();
            gameState.character.stats.forEach(s => {
                if (s.category === 'Nguyên liệu' || s.category === 'Vật phẩm') {
                    materials.set(s.name, (materials.get(s.name) || 0) + (typeof s.value === 'number' ? s.value : 1));
                }
            });

            for (const ing of recipeStat.recipeData.ingredients) {
                if ((materials.get(ing.name) || 0) < ing.quantity * quantity) {
                    addToast(`Không đủ nguyên liệu: Cần ${ing.quantity * quantity} x ${ing.name}.`, 'error');
                    return;
                }
            }
        }
        
        dispatch({ type: 'CRAFT_ITEM', payload: { recipeName, quantity, areCheatsEnabled: settings.enableCheats } });

    }, [gameState.character, dispatch, addToast, settings.enableCheats]);

    const handleAnalyzeAction = useCallback(async (customAction: string) => {
        await analyzeAction(customAction);
    }, [analyzeAction]);
    
    const handleSaveToFile = useCallback(() => {
        if (!gameState) return;

        const saveLogic = async () => {
            try {
                const worldTitle = gameState.title || 'Game Chưa Có Tên';
                
                const allSaves = await db.getAllSaves();
                const existingManualSave = allSaves.find(save => save.name === worldTitle && save.type === 'manual');
                const saveId = existingManualSave ? existingManualSave.id : generateUniqueId('save-manual');
                
                const gameStateToSave = { ...gameState, history: gameState.history.slice(-1) }; 
                const saveObjectForDb: SaveFile = { 
                    id: saveId, 
                    name: worldTitle, 
                    timestamp: new Date().toISOString(), 
                    gameState: gameStateToSave, 
                    worldSettings, 
                    type: 'manual' as const 
                };

                await db.addOrUpdateSave(saveObjectForDb);
                addToast(`Đã lưu game "${worldTitle}" vào bộ nhớ của trình duyệt.`, 'success');

                if (gameState.saveId !== saveId) {
                    dispatch({ type: 'UPDATE_SAVE_ID', payload: saveId });
                }

                const jsonString = JSON.stringify(saveObjectForDb, null, 2);
                
                const unaccentedTitle = removeAccents(worldTitle);
                const sanitizedTitle = unaccentedTitle.replace(/\s+/g, '_').replace(/[^a-z0-9_]/gi, '').toLowerCase();
                const timestampStr = new Date().toISOString().slice(0, 10);
                const fileName = `${sanitizedTitle}_${timestampStr}.json`;

                const blob = new Blob([jsonString], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = fileName;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
        
                addToast(`Đã tải tệp lưu "${fileName}" thành công!`, 'success');
            } catch (error) {
                const message = error instanceof Error ? error.message : "Unknown error";
                console.error("Lỗi khi lưu game ra tệp:", error);
                setError(`Không thể lưu tệp. Lỗi: ${message}`);
            }
        };

        saveLogic();
    }, [gameState, worldSettings, dispatch, addToast, setError]);
    
    const handleRevert = useCallback((historyIndex: number) => {
        dispatch({ type: 'REVERT_TO_TURN', payload: historyIndex });
        modalManager.closeModal();
        addToast('Đã quay lại lượt chơi trước đó.', 'success');
    }, [dispatch, addToast, modalManager]);

    const handleRevertToPreviousTurn = useCallback(() => {
        if (gameState.history.length > 0) {
            handleRevert(gameState.history.length - 1);
        }
    }, [gameState.history, handleRevert]);

    const handleSaveLore = useCallback((newLoreRules: LoreRule[]) => {
        dispatch({ type: 'UPDATE_WORLD_SETTINGS', payload: { loreRules: newLoreRules } });
        addToast("Luật lệ đã được cập nhật và sẽ áp dụng ở lượt tiếp theo.", 'success');
    }, [dispatch, addToast]);

    const handlePinMemory = useCallback((memoryId: string) => {
        dispatch({ type: 'TOGGLE_PIN_MEMORY', payload: memoryId });
    }, [dispatch]);

    const handleDeleteMemory = useCallback((memoryId: string) => {
        dispatch({ type: 'DELETE_MEMORY', payload: memoryId });
        addToast('Đã xóa ký ức.', 'success');
    }, [dispatch, addToast]);
    
    const handleUpdateCharacterData = useCallback((characterId: string, updates: Partial<Character>) => {
        const allChars = [gameState.character, ...gameState.knowledgeBase.npcs];
        const charToUpdate = allChars.find(c => c.id === characterId);
        if (charToUpdate) {
            dispatch({ type: 'UPDATE_CHARACTER', payload: { characterName: charToUpdate.name, updates } });
        } else {
            console.error(`Could not find character with ID ${characterId} to update.`);
            addToast("Lỗi: Không tìm thấy nhân vật để cập nhật.", "error");
        }
    }, [dispatch, gameState.character, gameState.knowledgeBase.npcs, addToast]);
    
    const handleUpdateWorldSummary = useCallback((newSummary: string) => {
        const newGameState = { ...gameState, worldSummary: newSummary };
        dispatch({ type: 'UPDATE_WORLD_SUMMARY', payload: newSummary });
        onSaveGame(newGameState, worldSettings);
    }, [dispatch, gameState, onSaveGame, worldSettings]);
    
    const handleUpdateWorldLogic = useCallback((newLogic: WorldLogicRule[]) => {
        const newWorldSettings = { ...worldSettings, worldLogic: newLogic };
        dispatch({ type: 'UPDATE_WORLD_SETTINGS', payload: { worldLogic: newLogic } });
        onSaveGame(gameState, newWorldSettings);
        addToast("Logic thế giới đã được cập nhật và sẽ áp dụng ở lượt tiếp theo.", 'success');
    }, [dispatch, gameState, onSaveGame, worldSettings, addToast]);
    
    const handleUpdateWorldEvents = useCallback((newEvents: WorldEvent[]) => {
        const newWorldSettings = { ...worldSettings, worldEvents: newEvents };
        dispatch({ type: 'UPDATE_WORLD_SETTINGS', payload: { worldEvents: newEvents } });
        onSaveGame(gameState, newWorldSettings);
        addToast("Các sự kiện thế giới đã được cập nhật.", 'success');
    }, [dispatch, gameState, onSaveGame, worldSettings, addToast]);

    const handleCleanupData = useCallback((payload: { statIds: Set<string>, memoryIds: Set<string>, relationshipsToPrune: { charId: string, targetId: string }[] }) => {
        dispatch({ type: 'CLEANUP_DATA', payload });
        modalManager.closeModal();
        const total = payload.statIds.size + payload.memoryIds.size + payload.relationshipsToPrune.length;
        addToast(`Đã dọn dẹp thành công ${total} mục.`, 'success');
    }, [dispatch, addToast, modalManager]);

    return {
        handleAction,
        handleItemAction,
        handleCraftItem,
        handleAnalyzeAction,
        handleSaveToFile,
        handleRevert,
        handleRevertToPreviousTurn,
        handleSaveLore,
        handlePinMemory,
        handleDeleteMemory,
        handleUpdateCharacterData,
        handleUpdateWorldSummary,
        handleUpdateWorldLogic,
        handleUpdateWorldEvents,
        handleCleanupData,
    };
};