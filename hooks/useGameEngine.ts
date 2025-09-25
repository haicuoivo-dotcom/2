/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
// FIX: Add React import to resolve namespace error.
import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { useGameAI } from './useGameAI';
import { useActionAnalyzer } from './useActionAnalyzer';
import { usePredictiveTurn } from './usePredictiveTurn';
import { useCombatManager } from './useCombatManager';
import { useGameContext } from '../components/contexts/GameContext';
import { useTurnProcessor } from './useTurnProcessor';
import { useAppContext } from '../components/contexts/AppContext';
import type { GameState, WorldSettings, GameAction } from '../../types';

interface UseGameEngineProps {
    onSaveGame: (gameState: GameState, worldSettings: WorldSettings) => void;
}

export const useGameEngine = ({ onSaveGame }: UseGameEngineProps) => {
    const { incrementApiRequestCount } = useAppContext();
    
    // --- Refs ---
    const isMounted = useRef(true);
    const fanficSummaryRef = useRef<any | null>(null);

    useEffect(() => {
        isMounted.current = true;
        return () => { isMounted.current = false; };
    }, []);

    // --- Shared States ---
    const { gameState } = useGameContext();
    const [error, setError] = useState<string | null>(null);
    const [predictedTurn, setPredictedTurn] = useState<any | null>(null);
    const [predictionStatus, setPredictionStatus] = useState<'idle' | 'predicting' | 'predicted'>('idle');
    const [predictionTime, setPredictionTime] = useState(0);
    const predictionTimerRef = useRef<number | null>(null);

    // --- Child Hooks ---

    const {
        isAnalyzing,
        actionAnalysis,
        setActionAnalysis,
        analyzeAction,
    } = useActionAnalyzer({
        setError,
        isProcessing: false, // isAITurnProcessing will be passed to GameFooter directly
    });
    
    const { runPredictiveTurn } = usePredictiveTurn({
        isMounted,
        setPredictedTurn,
        setPredictionStatus,
        fanficSummaryRef,
    });
    
    const {
        isAutoCombatActive,
        toggleAutoCombat,
        isResolvingCombat,
        lastTurnEvents,
        setLastTurnEvents,
        runLocalTurnBasedCombat,
    } = useCombatManager({
        onSaveGame,
        setError,
    });

    const {
        isAITurnProcessing,
        processingTime,
        processTurn,
        retryLastAction,
        processingStep: turnProcessingStep,
        isTokenLimitError,
        handleEmergencyTokenReductionAndRetry,
        retryMessage,
        processingError,
        clearProcessingError,
    } = useTurnProcessor({
        onSaveGame,
        incrementApiRequestCount,
        runPredictiveTurn,
        predictedTurn,
        predictionStatus,
        setPredictedTurn,
        setPredictionStatus,
        setError,
        setActionAnalysis,
        isMounted,
        fanficSummaryRef,
        runLocalTurnBasedCombat,
    });
    
    const isCombatActive = useMemo(() => !!gameState?.combatState?.isActive, [gameState?.combatState]);

    const {
        isEnriching,
        enrichmentTime,
        processingStep: enrichmentProcessingStep,
        runInitialAvatarGeneration,
        updateCharactersWithAi,
        manuallyTriggerWorldHealing,
        handleSummarizeMemories,
        autoEquipHaremMembers,
        supplementSingleCharacter,
    } = useGameAI({
        onSaveGame,
        incrementApiRequestCount,
        isAITurnProcessing,
        isCombatActive,
        isPredicting: predictionStatus === 'predicting',
    });

    const isAuctionActive = gameState?.auctionState?.isActive || false;

    const processingStep = useMemo(() => {
        if (isAITurnProcessing) return turnProcessingStep;
        if (isEnriching) return enrichmentProcessingStep;
        return '';
    }, [isAITurnProcessing, isEnriching, turnProcessingStep, enrichmentProcessingStep]);
    
    useEffect(() => {
        if (predictionStatus === 'predicting') {
            setPredictionTime(0);
            predictionTimerRef.current = window.setInterval(() => {
                if (isMounted.current) {
                    setPredictionTime(prevTime => prevTime + 1);
                }
            }, 1000);
        } else if (predictionTimerRef.current) {
            clearInterval(predictionTimerRef.current);
            predictionTimerRef.current = null;
        }
        return () => {
            if (predictionTimerRef.current) {
                clearInterval(predictionTimerRef.current);
            }
        };
    }, [predictionStatus]);

    const retryLastActionWithClear = useCallback(() => {
        clearProcessingError();
        retryLastAction();
    }, [clearProcessingError, retryLastAction]);

    const handleEmergencyTokenReductionAndRetryWithClear = useCallback(() => {
        clearProcessingError();
        handleEmergencyTokenReductionAndRetry();
    }, [clearProcessingError, handleEmergencyTokenReductionAndRetry]);

    return {
        processTurn,
        analyzeAction,
        retryLastAction: retryLastActionWithClear,
        isAITurnProcessing,
        processingTime,
        isAnalyzing,
        isEnriching,
        enrichmentTime,
        isAuctionActive,
        processingStep,
        actionAnalysis,
        setActionAnalysis,
        error,
        setError,
        runInitialAvatarGeneration,
        updateCharactersWithAi,
        manuallyTriggerWorldHealing,
        handleSummarizeMemories,
        autoEquipHaremMembers,
        supplementSingleCharacter,
        predictedTurn,
        predictionStatus,
        predictionTime,
        isResolvingCombat,
        isAutoCombatActive,
        toggleAutoCombat,
        lastTurnEvents,
        isTokenLimitError,
        handleEmergencyTokenReductionAndRetry: handleEmergencyTokenReductionAndRetryWithClear,
        retryMessage,
        processingError,
        clearProcessingError,
    };
};
