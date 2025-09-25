/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
// FIX: Add React import to resolve namespace errors.
import { useState, useMemo, useCallback } from 'react';
import { useGameContext } from '../components/contexts/GameContext';
import { generateUniqueId } from '../utils/id';
import type { GameAction } from '../../types';

// The props passed from GameFooter.tsx
interface UseGameFooterManagerProps {
    isProcessing: boolean;
    isAnalyzing: boolean;
    actionAnalysis: any;
    setActionAnalysis: (analysis: any) => void;
    onAction: (action: Partial<GameAction>, isCustom?: boolean) => void;
    onAnalyzeAction: (customAction: string) => void;
    processingTime: number;
}


export const useGameFooterManager = (props: UseGameFooterManagerProps) => {
    const { isProcessing, isAnalyzing, actionAnalysis, setActionAnalysis, onAction, onAnalyzeAction } = props;
    const { gameState } = useGameContext();
    const [customAction, setCustomAction] = useState('');

    const handleCustomActionChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setCustomAction(e.target.value);
        if (actionAnalysis) {
            setActionAnalysis(null);
        }
    }, [actionAnalysis, setActionAnalysis]);

    const handleAnalyzeActionClick = useCallback(() => {
        if (!isAnalyzing && customAction.trim()) {
            onAnalyzeAction(customAction);
        }
    }, [isAnalyzing, customAction, onAnalyzeAction]);

    const handleSendActionClick = useCallback(() => {
        if (!isProcessing && (customAction.trim() || actionAnalysis)) {
            const actionToSend = actionAnalysis 
                ? { ...actionAnalysis, description: customAction } 
                : { description: customAction };
            onAction(actionToSend, true);
            setCustomAction('');
            setActionAnalysis(null);
        }
    }, [isProcessing, customAction, onAction, setActionAnalysis, actionAnalysis]);
    
    const handleKeyPress = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !isProcessing && (customAction.trim() || actionAnalysis)) {
            handleSendActionClick();
        }
    }, [isProcessing, customAction, handleSendActionClick, actionAnalysis]);

    const analyzeDisabledReason = useMemo(() => {
        if (isProcessing) return "AI đang xử lý...";
        if (!customAction.trim()) return "Nhập một hành động để phân tích.";
        return null;
    }, [isProcessing, customAction]);

    const sendDisabledReason = useMemo(() => {
        if (isProcessing) return "AI đang xử lý...";
        // FIX: If an analysis result exists, the confirm button should always be enabled,
        // regardless of the customAction input's state, as the action is already determined.
        if (actionAnalysis) {
            return null;
        }
        if (!customAction.trim()) return "Nhập một hành động để gửi.";
        return null;
    }, [isProcessing, customAction, actionAnalysis]);

    const allAvailableActions = useMemo(() => {
        const actions = gameState?.actions || [];
        // Ensure every action has a unique key for React rendering
        return actions.map(a => ({ ...a, id: a.id || generateUniqueId('action') }));
    }, [gameState?.actions]);

    const formatProcessingTime = useCallback((time: number) => {
        const mins = Math.floor(time / 60);
        const secs = Math.floor(time % 60);
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }, []);

    return {
        customAction,
        handleCustomActionChange,
        handleAnalyzeActionClick,
        handleSendActionClick,
        handleKeyPress,
        analyzeDisabledReason,
        sendDisabledReason,
        allAvailableActions,
        formatProcessingTime,
    };
};
