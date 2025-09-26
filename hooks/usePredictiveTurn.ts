/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
// FIX: Add React import to resolve namespace error.
import { useCallback, MutableRefObject } from 'react';
import { useSettings } from '../components/contexts/SettingsContext';
import { useGameContext } from '../components/contexts/GameContext';
import { ApiKeyManager } from '../services/ApiKeyManager';
// FIX: Import stripEntityTags to resolve reference error.
import { extractJsonFromString, stripThinkingBlock, stripEntityTags } from '../utils/text';
import { generateUniqueId } from '../utils/id';
import { buildBasePrompt } from '../utils/ai';
import { DIRECTIVE_BASED_TURN_UPDATE_SCHEMA } from '../constants/schemas';
import { PROCESS_TURN_RULES } from '../constants/aiConstants';
import { applyDirectives } from '../utils/game';
import type { GameState, GameAction, Turn, Memory, GenerateContentParameters } from '../types';

interface UsePredictiveTurnProps {
    isMounted: MutableRefObject<boolean>;
    setPredictedTurn: (turn: any) => void;
    setPredictionStatus: (status: 'idle' | 'predicting' | 'predicted') => void;
    fanficSummaryRef: MutableRefObject<any>;
}

export const usePredictiveTurn = ({
    isMounted,
    setPredictedTurn,
    setPredictionStatus,
    fanficSummaryRef,
}: UsePredictiveTurnProps) => {
    const { settings } = useSettings();
    const { worldSettings } = useGameContext();

    const runPredictiveTurn = useCallback(async (actionToPredict: GameAction, currentState: GameState) => {
        if (!settings.predictiveInference || !isMounted.current) {
            if (isMounted.current) {
                setPredictionStatus('idle');
                setPredictedTurn(null);
            }
            return;
        }
    
        try {
            let totalApiRequestsThisTurn = 0;
            const incrementer = () => totalApiRequestsThisTurn++;
            
            const stateForPrompt = currentState;
            
            const basePrompt = buildBasePrompt(actionToPredict, stateForPrompt, worldSettings, settings, null, fanficSummaryRef.current);
            const mainTurnPrompt = `${basePrompt}${PROCESS_TURN_RULES}`;
            const safetySettings = worldSettings.allow18Plus ? [{ category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' }, { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' }] : [];
            const mainCallParams: GenerateContentParameters = { model: 'gemini-2.5-flash', contents: mainTurnPrompt, config: { responseMimeType: "application/json", responseSchema: DIRECTIVE_BASED_TURN_UPDATE_SCHEMA, thinkingConfig: { thinkingBudget: 0 } } };
            
            const silentToast = () => {};
            // FIX: Added a dummy function for the missing `setRetryMessage` argument and corrected the options object.
            const mainResponse = await ApiKeyManager.generateContentWithRetry(mainCallParams, silentToast, incrementer, () => {}, { safetySettings });
            const jsonText = stripThinkingBlock(mainResponse.text);
            // FIX: The `extractJsonFromString` function is async and must be awaited.
            const turnData = await extractJsonFromString(jsonText);
    
            if (!turnData || !turnData.story || !turnData.actions || !turnData.directives) throw new Error("Predictive turn AI response is invalid.");
            
            const { newState: stateAfterDirectives } = applyDirectives(stateForPrompt, turnData.directives, worldSettings);

            const newTurn: Turn = { id: generateUniqueId('turn'), story: turnData.story, messages: (turnData.messages || []).map((msg: any) => ({ id: generateUniqueId('msg'), ...msg })), chosenAction: actionToPredict.description || null, summary: (turnData.summary as any)?.text || stripEntityTags(actionToPredict.description || 'Diễn biến').substring(0, 100), tokenCount: mainResponse.usageMetadata?.totalTokenCount || 0, };
            const newMemory: Memory = { id: generateUniqueId('memory'), text: (turnData.summary as any).text, pinned: settings.autoPinMemory, timestamp: turnData.gameTime, tags: (turnData.summary as any).tags || [], relevanceScore: (turnData.summary as any).relevanceScore, reasoning: (turnData.summary as any).reasoning, };
            
            const predictedGameState: GameState = { ...stateAfterDirectives, history: [...(currentState.history || []), currentState].slice(-11), turns: [...currentState.turns, newTurn], actions: (turnData.actions || []).map((act: any) => ({ id: generateUniqueId('action'), ...act })), gameTime: turnData.gameTime, memories: [...currentState.memories, newMemory], isIntercourseScene: turnData.isIntercourseSceneStart || currentState.isIntercourseScene, totalTokenCount: currentState.totalTokenCount + newTurn.tokenCount, auctionHouse: currentState.auctionHouse };
    
            if (isMounted.current) {
                setPredictedTurn({
                    predictedActionDescription: actionToPredict.description,
                    predictedGameState,
                    predictedTotalApiRequests: totalApiRequestsThisTurn,
                    predictedOnStateVersion: stateForPrompt.version || 0,
                });
                setPredictionStatus('predicted');
            }
        } catch (error) {
            console.warn("Predictive turn failed silently:", error);
            if (isMounted.current) {
                setPredictionStatus('idle');
                setPredictedTurn(null);
            }
        }
    }, [settings, worldSettings, isMounted, fanficSummaryRef, setPredictedTurn, setPredictionStatus]);

    return { runPredictiveTurn };
};
