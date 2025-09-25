/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
// FIX: Add React import to resolve namespace error.
import { useCallback, useState, useEffect } from 'react';
import { useHashNavigation } from './useHashNavigation';
import { useToasts } from '../components/contexts/ToastContext';
import { useGameContext } from '../components/contexts/GameContext';
import { useSettings } from '../components/contexts/SettingsContext';
import { useModalManager } from './useModalManager';
import * as db from '../services/db';
import { generateUniqueId } from '../utils/id';
import { useSavesManager } from './useSavesManager';
import { useApiStatus } from './useApiStatus';
import { useBackgrounds } from './useBackgrounds';
import { performLocalIntegrityCheckAndFix } from '../utils/game';
import type { SaveFile, GameState, WorldSettings } from '../../types';

export const useAppManager = () => {
    const [currentView, navigate] = useHashNavigation();
    const { addToast } = useToasts();
    const { gameState, worldSettings, dispatch } = useGameContext();
    const { settings } = useSettings();

    // REFACTOR: All this logic was moved from AppContent component into this manager hook.
    const { apiStatus, hasApiKey, handleApiKeyUpdate } = useApiStatus();
    const { menuBackgroundUrl, gameBackgroundUrl } = useBackgrounds();
    const modalManager = useModalManager({ settings });
    const { openModal, closeModal } = modalManager;
    const { saves, areSavesLoading, handleLoadGame, handleDeleteGame, handleDeleteAllGames, handleOpenLoadGameModal } = useSavesManager({ gameState, dispatch, closeModal, openModal, navigate });
    
    const [apiRequestCount, setApiRequestCount] = useState(0);
    const incrementApiRequestCount = useCallback(() => setApiRequestCount(c => c + 1), []);
    const resetApiRequestCount = useCallback(() => {
        setApiRequestCount(0);
        addToast('Đã reset bộ đếm API request.', 'success');
    }, [addToast]);

    useEffect(() => {
        const handleSystemKeyFailure = () => {
            addToast('Lỗi API Key Hệ thống: Key không hợp lệ hoặc đã hết hạn mức. Vui lòng kiểm tra trong phần Cài đặt.', 'error');
        };

        window.addEventListener('systemKeyAuthFailure', handleSystemKeyFailure);

        return () => {
            window.removeEventListener('systemKeyAuthFailure', handleSystemKeyFailure);
        };
    }, [addToast]);

    const handleSaveGame = useCallback(async (currentGameState: GameState, currentWorldSettings: WorldSettings) => {
        try {
            const saveId = currentGameState.saveId || generateUniqueId('save');
            const gameStateToSave = { ...currentGameState, history: currentGameState.history.slice(-1) }; 
            const saveFile: SaveFile = {
                id: saveId,
                name: currentGameState.title,
                timestamp: new Date().toISOString(),
                gameState: gameStateToSave,
                worldSettings: currentWorldSettings,
                type: 'manual',
            };
            await db.addOrUpdateSave(saveFile);
            if (!currentGameState.saveId) {
                dispatch({ type: 'UPDATE_SAVE_ID', payload: saveId });
            }
        } catch (error) {
            addToast("Đã xảy ra lỗi khi lưu game.", 'error', error);
        }
    }, [dispatch, addToast]);

    const handleCreateWorld = useCallback(async (newGameState: GameState, newWorldSettings: WorldSettings) => {
        const { newState: healedState, fixes } = performLocalIntegrityCheckAndFix(newGameState);
        if (fixes.length > 0) {
            addToast(`Đã tự động sửa ${fixes.length} lỗi logic trong dữ liệu thế giới ban đầu.`, 'info');
        }

        dispatch({ type: 'LOAD_GAME', payload: { gameState: healedState, worldSettings: newWorldSettings } });
        await handleSaveGame(healedState, newWorldSettings);
        addToast('Thế giới đã được tạo và lưu thành công!', 'success');
        navigate('game');
    }, [dispatch, handleSaveGame, addToast, navigate]);
    
    const handleBackFromCreator = useCallback(() => navigate('menu'), [navigate]);
    
    const handleUploadSaves = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files || files.length === 0) return;

        let successCount = 0;
        let errorCount = 0;
        // FIX: Add explicit File type to the map callback to resolve 'unknown' type errors.
        const fileReadPromises = Array.from(files).map((file: File) => {
            return new Promise<SaveFile>((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = e => {
                    try {
                        const saveData = JSON.parse(e.target?.result as string);
                        // FIX: Add null checks for file and saveData properties.
                        if (saveData && saveData.gameState && saveData.worldSettings && saveData.id && saveData.name) {
                            resolve(saveData as SaveFile);
                        } else {
                            reject(new Error(`Tệp ${file?.name || 'không xác định'} không hợp lệ.`));
                        }
                    } catch (err) {
                        reject(new Error(`Lỗi phân tích ${file?.name || 'không xác định'}: ${(err as Error).message}`));
                    }
                };
                reader.onerror = () => reject(new Error(`Lỗi khi đọc ${file?.name || 'không xác định'}.`));
                reader.readAsText(file);
            });
        });

        for (const promise of fileReadPromises) {
            try {
                const saveFile = await promise;
                await db.addOrUpdateSave(saveFile);
                successCount++;
            } catch (err) {
                errorCount++;
                addToast((err as Error).message, 'error', err);
            }
        }

        if (successCount > 0) {
            addToast(`Đã tải lên thành công ${successCount} tệp.`, 'success');
            closeModal();
            handleOpenLoadGameModal();
        }
        if (event.target) event.target.value = '';
    }, [addToast, closeModal, handleOpenLoadGameModal]);

    return {
        // State & context values
        currentView,
        gameState,
        worldSettings,
        settings,
        saves,
        areSavesLoading,
        apiStatus,
        hasApiKey,
        apiRequestCount,
        menuBackgroundUrl,
        gameBackgroundUrl,
        modalManager,
        
        // Actions & handlers
        navigate,
        dispatch,
        addToast,
        incrementApiRequestCount,
        resetApiRequestCount,
        handleSaveGame,
        handleCreateWorld,
        handleLoadGame,
        handleDeleteGame,
        handleDeleteAllGames,
        handleOpenLoadGameModal,
        handleBackFromCreator,
        handleUploadSaves,
        handleApiKeyUpdate,
    };
};
