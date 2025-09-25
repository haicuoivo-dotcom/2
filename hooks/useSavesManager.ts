/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
// FIX: Add React import to resolve namespace error.
import { useState, useEffect, useCallback } from 'react';
import * as db from '../services/db';
import { useToasts } from '../components/contexts/ToastContext';
import { useGameContext } from '../components/contexts/GameContext';
import type { SaveFile, GameState } from '../../types';

interface UseSavesManagerProps {
    gameState: GameState | null;
    dispatch: React.Dispatch<any>;
    closeModal: () => void;
    openModal: (modalName: string) => void;
    navigate: (view: string) => void;
}

export const useSavesManager = ({ gameState, dispatch, closeModal, openModal, navigate }: UseSavesManagerProps) => {
    const { addToast } = useToasts();
    const [saves, setSaves] = useState<SaveFile[]>([]);
    const [areSavesLoading, setAreSavesLoading] = useState(true);

    const loadSaves = useCallback(async () => {
        setAreSavesLoading(true);
        try {
            const allSaves = await db.getAllSaves();
            setSaves(allSaves);
        } catch (error) {
            console.error("Failed to load saves:", error);
            addToast("Không thể tải các tệp đã lưu.", "error", error);
        } finally {
            setAreSavesLoading(false);
        }
    }, [addToast]);

    useEffect(() => {
        loadSaves();
    }, [loadSaves]);

    const handleLoadGame = useCallback((saveData: SaveFile) => {
        if (!saveData || !saveData.gameState) {
            addToast("Tệp lưu không hợp lệ hoặc bị hỏng.", 'error'); return;
        }
        dispatch({ type: 'LOAD_GAME', payload: { gameState: saveData.gameState, worldSettings: saveData.worldSettings } });
        closeModal();
        navigate('game');
    }, [dispatch, addToast, navigate, closeModal]);

    const handleDeleteGame = useCallback(async (saveId: string) => {
        try {
            await db.deleteSave(saveId);
            setSaves(prevSaves => prevSaves.filter(s => s.id !== saveId));
            if (gameState && gameState.saveId === saveId) {
                dispatch({ type: 'CLEAR_GAME' });
            }
            addToast("Đã xóa tệp lưu thành công.", "success");
        } catch (error) {
            addToast("Đã xảy ra lỗi khi xóa tệp lưu.", "error", error);
        }
    }, [gameState, dispatch, addToast]);

    const handleDeleteAllGames = useCallback(async () => {
        try {
            await db.deleteAllSaves();
            setSaves([]);
            if (gameState) {
                dispatch({ type: 'CLEAR_GAME' });
            }
            addToast("Đã xóa toàn bộ tệp lưu thành công.", "success");
        } catch (error) {
            addToast("Đã xảy ra lỗi khi xóa toàn bộ tệp lưu.", "error", error);
        }
    }, [gameState, dispatch, addToast]);
    
    const handleOpenLoadGameModal = useCallback(async () => {
        try {
            const allSaves = await db.getAllSaves();
            setSaves(allSaves);
        } catch (error) {
            setSaves([]);
        }
        openModal('loadGame');
    }, [openModal]);

    return {
        saves,
        setSaves,
        areSavesLoading,
        handleLoadGame,
        handleDeleteGame,
        handleDeleteAllGames,
        handleOpenLoadGameModal
    };
};
