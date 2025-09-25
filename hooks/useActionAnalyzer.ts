/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
// FIX: Add React import to resolve namespace error.
import { useState, useCallback } from 'react';
import { useSettings } from '../components/contexts/SettingsContext';
import { useGameContext } from '../components/contexts/GameContext';
import { useToasts } from '../components/contexts/ToastContext';
import { ApiKeyManager } from '../services/ApiKeyManager';
import { getApiErrorMessage } from '../utils/error';
import { extractJsonFromString } from '../utils/text';
import { getRecentTurnContext, slimCharacterForPrompt, performLocalAnalysis } from '../utils/ai';
// FIX: Corrected import to use the main schema barrel file which now correctly exports ACTION_ANALYSIS_SCHEMA.
import { ACTION_ANALYSIS_SCHEMA } from '../constants/schemas';
import { ACTION_ANALYSIS_RULES } from '../constants/aiConstants';
import { useAppContext } from '../components/contexts/AppContext';

interface UseActionAnalyzerProps {
    setError: (error: string | null) => void;
    isProcessing: boolean;
}

export const useActionAnalyzer = ({ setError, isProcessing }: UseActionAnalyzerProps) => {
    const { settings } = useSettings();
    const { gameState } = useGameContext();
    const { addToast, incrementApiRequestCount } = useAppContext();

    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [actionAnalysis, setActionAnalysis] = useState<any | null>(null);

    const analyzeAction = useCallback(async (customAction: string) => {
        if (isAnalyzing || !customAction.trim() || !gameState || isProcessing) return;

        if (settings.enableCheats) {
            setActionAnalysis({
                successChance: 100,
                benefit: 'Hành động được hỗ trợ bởi Cheat và sẽ thành công.',
                risk: 'Không có rủi ro nào.',
                timeCost: 'Tức thì'
            });
            return;
        }

        setIsAnalyzing(true);
        setError(null);
        setActionAnalysis(null);
        
        // Short delay to allow UI to update to "Analyzing..." state
        await new Promise(resolve => setTimeout(resolve, 100));

        try {
            // Step 1: Try local analysis first
            const localResult = performLocalAnalysis(customAction, gameState);
            if (localResult) {
                setActionAnalysis(localResult);
                return; // Stop here if local analysis is successful
            }
            
            // Step 2: If local analysis fails, proceed with AI
            const prompt = `**Trạng thái Game:**\n${JSON.stringify({
                character: slimCharacterForPrompt(gameState.character, settings),
                recentContext: getRecentTurnContext(gameState.turns, 3),
                knowledgeBase: { npcs: gameState.knowledgeBase.npcs.map(c => slimCharacterForPrompt(c, settings)) }
            })}\n**Hành động của người chơi:** "${customAction}"\n${ACTION_ANALYSIS_RULES}`;
            
            const response = await ApiKeyManager.generateContentWithRetry(
                {
                    model: 'gemini-2.5-flash', // Always use flash for speed
                    contents: prompt,
                    config: {
                        responseMimeType: "application/json",
                        responseSchema: ACTION_ANALYSIS_SCHEMA
                    }
                },
                addToast,
                // FIX: Added a dummy function for the missing `setRetryMessage` argument.
                incrementApiRequestCount,
                () => {}
            );
            
            // FIX: The `extractJsonFromString` function is async and must be awaited.
            const analysisResult = await extractJsonFromString(response.text);
            if (analysisResult) {
                setActionAnalysis(analysisResult);
            } else {
                throw new Error("AI không trả về phân tích hợp lệ.");
            }
        } catch (err) {
            const userFriendlyError = getApiErrorMessage(err, "phân tích hành động");
            setError(userFriendlyError);
            addToast(userFriendlyError, 'error');
        } finally {
            setIsAnalyzing(false);
        }
    }, [isAnalyzing, gameState, addToast, setError, isProcessing, settings.enableCheats, settings, incrementApiRequestCount]);

    return {
        isAnalyzing,
        actionAnalysis,
        setActionAnalysis,
        analyzeAction,
    };
};
