/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
// FIX: Add React import to resolve namespace errors.
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useSettings } from '../components/contexts/SettingsContext';
import { useGameContext } from '../components/contexts/GameContext';
import { useToasts } from '../components/contexts/ToastContext';
import { useTTS } from '../components/contexts/TTSContext';
import { ApiKeyManager, ApiRetryError } from '../services/ApiKeyManager';
import { getApiErrorMessage } from '../utils/error';
import { stripEntityTags, extractJsonFromString, stripThinkingBlock } from '../utils/text';
import { generateUniqueId } from '../utils/id';
import { buildBasePrompt, summarizeFanficContent, getSafeTokenLimit, summarizeForEmergency } from '../utils/ai';
import { DIRECTIVE_BASED_TURN_UPDATE_SCHEMA } from '../constants/schemas';
import { PROCESS_TURN_RULES } from '../constants/aiConstants';
import { ADULT_RULES_BASE, ADULT_RULES_LIBRARIES } from '../constants/ai/adult';
import { applyDirectives, findBestAction, handleAutosave, performLocalIntegrityCheckAndFix, mergePermanentStatuses, retroactivelyCheckAllQuests } from '../utils/game';
import { getItemScore } from '../utils/inventory';
import { updateMapData, updateMapWithRevealedLocations } from '../utils/map';
import { SYNTHESIZED_SKILL_TEMPLATES } from '../constants/skillTemplates';
import type { GameState, GameAction, Turn, Memory, GenerateContentParameters, Stat, WorldSettings, AppSettings, Message, Character, EquipmentSlot, TimelineBlock, LoreRule } from '../../types';

interface UseTurnProcessorProps {
    onSaveGame: (gameState: GameState, worldSettings: any) => void;
    incrementApiRequestCount: () => void;
    runPredictiveTurn: (action: GameAction, state: GameState) => Promise<void>;
    predictedTurn: any;
    predictionStatus: 'idle' | 'predicting' | 'predicted';
    setPredictedTurn: (turn: any) => void;
    setPredictionStatus: (status: 'idle' | 'predicting' | 'predicted') => void;
    setError: (error: string | null) => void;
    setActionAnalysis: (analysis: any) => void;
    isMounted: React.MutableRefObject<boolean>;
    fanficSummaryRef: React.MutableRefObject<any>;
    runLocalTurnBasedCombat: (initialState: GameState, playerAction?: Partial<GameAction>) => Promise<void>;
}

export const useTurnProcessor = ({
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
}: UseTurnProcessorProps) => {
    const { settings } = useSettings();
    const { gameState, worldSettings, dispatch } = useGameContext();
    const { addToast } = useToasts();
    const { speak, cancel: cancelSpeech } = useTTS();

    const [isAITurnProcessing, setIsAITurnProcessing] = useState(false);
    const [processingTime, setProcessingTime] = useState(0);
    const [processingStep, setProcessingStep] = useState('');
    const [lastAction, setLastAction] = useState<Partial<GameAction> | null>(null);
    const [isLastActionCustom, setIsLastActionCustom] = useState(false);
    const [isTokenLimitError, setIsTokenLimitError] = useState(false);
    const [retryMessage, setRetryMessage] = useState<string | null>(null);
    const [processingError, setProcessingError] = useState<{ error: any; history: string[] } | null>(null);
    
    const timerRef = useRef<number | null>(null);
    const lastHealedTurnRef = useRef<number>(0);
    const lastMergedTurnRef = useRef<number>(0);
    
    useEffect(() => {
        if (isAITurnProcessing) {
            setProcessingTime(0);
            timerRef.current = window.setInterval(() => { setProcessingTime(prevTime => prevTime + 0.1); }, 100);
        } else if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [isAITurnProcessing]);
    
    const processTurn = useCallback(async (action: Partial<GameAction>, isCustom = false, isEmergencyRetry = false) => {
        cancelSpeech();
        if (isAITurnProcessing || !gameState) return;

        if (gameState.combatState?.isActive && gameState.combatState.combatMode === 'turn-based' && !isEmergencyRetry) {
            setIsAITurnProcessing(true);
            setError(null);
            const initialCombatState = { ...gameState, history: [...(gameState.history || []), gameState].slice(-1) };
            await runLocalTurnBasedCombat(initialCombatState, action);
            setIsAITurnProcessing(false);
            return;
        }

        setIsAITurnProcessing(true);
        setError(null);
        setIsTokenLimitError(false);
        setProcessingError(null);
        setActionAnalysis(null);
        setRetryMessage(null);
        
        if (predictedTurn && predictionStatus === 'predicted' && !isCustom && action.description === predictedTurn.predictedActionDescription && gameState.stateVersion === predictedTurn.predictedOnStateVersion) {
            const { predictedGameState, predictedTotalApiRequests } = predictedTurn;
            setPredictedTurn(null); setPredictionStatus('idle');
            for (let i = 0; i < predictedTotalApiRequests; i++) incrementApiRequestCount();
            
            const lastTurnIndex = predictedGameState.turns.length - 1;
            if (lastTurnIndex >= 0) (predictedGameState.turns[lastTurnIndex] as any).apiRequestCount = predictedTotalApiRequests;
            
            dispatch({ type: 'SET_GAME_STATE', payload: predictedGameState });
            onSaveGame(predictedGameState, worldSettings);
            await handleAutosave(predictedGameState, worldSettings);

            if (settings.predictiveInference && isMounted.current) {
                const nextActionToPredict = findBestAction(predictedGameState.actions);
                if (nextActionToPredict) {
                    setPredictionStatus('predicting');
                    runPredictiveTurn(nextActionToPredict, predictedGameState);
                }
            }
            setIsAITurnProcessing(false);
            return;
        }

        setPredictedTurn(null); setPredictionStatus('idle');
        const actionToProcess = settings.enableCheats ? { ...action, successChance: 100, benefit: 'Được hỗ trợ bởi Cheat', risk: 'Không có' } : action;
        if (!isEmergencyRetry) {
            setLastAction(actionToProcess);
            setIsLastActionCustom(isCustom);
        }

        let loopState = { ...gameState, history: [...(gameState.history || []), gameState].slice(-11) };
        let combinedStoryForTTS = '';
        const isContinuous = settings.gameplayStyle === 'continuousNovel' && !gameState.combatState?.isActive;
        const turnCount = isContinuous ? (1 + (1 + Math.floor(Math.random() * 2))) : 1;
        
        try {
            let currentAction = actionToProcess;
            
            for (let i = 0; i < turnCount; i++) {
                if (!isMounted.current) break;

                const isPlayerTurn = (i === 0);
                if (!isPlayerTurn) {
                    const nextAction = findBestAction(loopState.actions);
                    if (!nextAction) break; 
                    currentAction = nextAction;
                }
                
                let mainResponse;
                let totalTokensThisTurn = 0;
                let turnSpecificApiRequests = 0;
                const incrementer = () => { turnSpecificApiRequests++; incrementApiRequestCount(); };

                const safetySettings = settings.allow18Plus ? [{ category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' }, { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' }] : [];
                
                if (i === 0 && worldSettings.genre === 'Đồng nhân' && !fanficSummaryRef.current) {
                    addToast("Lần đầu chạy Đồng nhân, AI đang tóm tắt nội dung... Việc này có thể mất một lúc.", 'info');
                    fanficSummaryRef.current = await summarizeFanficContent(gameState.worldSummary, settings, addToast, incrementer);
                    if (!fanficSummaryRef.current) throw new Error("AI không thể tóm tắt nội dung Đồng nhân.");
                    addToast("Tóm tắt Đồng nhân thành công. Bắt đầu xử lý lượt chơi.", 'success');
                }

                let turnRules = PROCESS_TURN_RULES;
                if (settings.allow18Plus) {
                    turnRules += `\n${ADULT_RULES_BASE}\n${ADULT_RULES_LIBRARIES}`;
                }

                const basePrompt = buildBasePrompt(currentAction, loopState, worldSettings, settings, null, fanficSummaryRef.current, { emergency: isEmergencyRetry });
                
                const estimatedTokens = Math.ceil(basePrompt.length / 3.5);
                const safeTokenLimit = getSafeTokenLimit(settings.textModel);

                if (estimatedTokens > safeTokenLimit) {
                    const detailedError = new Error(`Token limit exceeded before API call.`);
                    (detailedError as any).context = { tokenCount: estimatedTokens, tokenLimit: safeTokenLimit };
                    throw detailedError;
                }
                
                const stepCounter = turnCount > 1 ? ` (${i + 1}/${turnCount})` : '';
                setProcessingStep(`AI đang xử lý...${stepCounter}`);
                const mainTurnPrompt = `${basePrompt}${turnRules}`;
                const modelToUse = settings.textModel;
                
                const mainCallConfig: GenerateContentParameters['config'] = {
                    responseMimeType: "application/json",
                    responseSchema: DIRECTIVE_BASED_TURN_UPDATE_SCHEMA,
                };

                if ((settings.aiProcessingMode === 'super_speed' || settings.aiProcessingMode === 'speed') && modelToUse.includes('flash')) {
                    mainCallConfig.thinkingConfig = { thinkingBudget: 0 };
                }

                const mainCallParams: GenerateContentParameters = { model: modelToUse, contents: mainTurnPrompt, config: mainCallConfig };
                mainResponse = await ApiKeyManager.generateContentWithRetry(mainCallParams, addToast, incrementApiRequestCount, setRetryMessage, { safetySettings });
                totalTokensThisTurn = mainResponse.usageMetadata?.totalTokenCount || 0;
                const turnData = await extractJsonFromString(stripThinkingBlock(mainResponse.text));

                if (!turnData || !turnData.story || !turnData.actions || !turnData.directives) throw new Error("InvalidTurnStructure: AI did not return a valid story, actions, or directives.");
                
                const newTurn: Turn = { id: generateUniqueId('turn'), story: turnData.story, messages: (turnData.messages || []).map((msg: any) => ({ id: generateUniqueId('msg'), ...msg })), chosenAction: isPlayerTurn ? (currentAction.description || null) : `(AI: ${currentAction.description})`, summary: (turnData.summary as any)?.text || stripEntityTags(currentAction.description || 'Diễn biến').substring(0, 100), tokenCount: totalTokensThisTurn, apiRequestCount: turnSpecificApiRequests, isMilestone: turnData.summary.isMilestone };

                if (newTurn.isMilestone) {
                    const newTimelineBlock: TimelineBlock = {
                        id: generateUniqueId('timeline'),
                        hash: generateUniqueId('hash'), // A simple unique ID is sufficient for a hash here
                        timestamp: turnData.gameTime,
                        summary: newTurn.summary,
                    };
                    if (!loopState.timeline) loopState.timeline = [];
                    loopState.timeline = [...loopState.timeline, newTimelineBlock];
                    addToast("Một sự kiện quan trọng đã được ghi vào Dòng Thời Gian Bất Biến!", "success");
                }

                const { newState: stateAfterDirectives, generatedMessages } = applyDirectives(loopState, turnData.directives, worldSettings, addToast);
                
                const { messages: retroactiveQuestMessages } = retroactivelyCheckAllQuests(stateAfterDirectives);

                const autoEquipMessages: Message[] = [];
                const npcsWhoGotItems = new Set<string>();
                (turnData.directives || []).forEach((d: any) => {
                    if (d.command === 'ADD_STAT' && d.args?.characterName && d.args?.stat?.category === 'Vật phẩm') {
                        const charName = stripEntityTags(d.args.characterName);
                        if (charName !== stateAfterDirectives.character.name) {
                            npcsWhoGotItems.add(charName);
                        }
                    }
                });

                if (npcsWhoGotItems.size > 0) {
                    npcsWhoGotItems.forEach(npcName => {
                        const npcIndex = stateAfterDirectives.knowledgeBase.npcs.findIndex((n: Character) => n.name === npcName);
                        if (npcIndex === -1) return;
                
                        const npc = stateAfterDirectives.knowledgeBase.npcs[npcIndex];
                        let equipmentChanged = false;
                        const newEquipment = { ...npc.equipment };
                        const allEquippableSlots = Object.keys(newEquipment);
                        
                        const equippedItemIds = new Set(Object.values(newEquipment).filter(Boolean));
                        const unequippedItems = (npc.stats || []).filter(s => 
                            s.category === 'Vật phẩm' && s.slot && s.slot !== 'Không có' && !equippedItemIds.has(s.id!)
                        );
                        
                        if (unequippedItems.length === 0) return;
                
                        allEquippableSlots.forEach(slotKey => {
                            const slot = slotKey as EquipmentSlot;
                            if (!newEquipment[slot]) {
                                const bestItemForSlot = unequippedItems
                                    .filter(item => item.slot === slot)
                                    .sort((a, b) => getItemScore(b) - getItemScore(a))[0];
                                
                                if (bestItemForSlot) {
                                    newEquipment[slot] = bestItemForSlot.id;
                                    equipmentChanged = true;
                                    autoEquipMessages.push({
                                        id: generateUniqueId('msg-equip'),
                                        text: `[NPC:${npc.name}] đã tự động trang bị [ITEM:${bestItemForSlot.name}].`
                                    });
                                    const indexToRemove = unequippedItems.findIndex(i => i.id === bestItemForSlot.id);
                                    if (indexToRemove > -1) {
                                        unequippedItems.splice(indexToRemove, 1);
                                    }
                                }
                            }
                        });
                        
                        if (equipmentChanged) {
                            stateAfterDirectives.knowledgeBase.npcs[npcIndex].equipment = newEquipment;
                        }
                    });
                }

                let allMessages = [...newTurn.messages, ...generatedMessages, ...autoEquipMessages, ...retroactiveQuestMessages];
                
                const synthesisRecipes: Record<string, { name: string; ingredients: string[] }> = {
                    'Dẫn Khí Nhập Thể Sơ Giai': {
                        name: 'Dẫn Khí Nhập Thể Sơ Giai',
                        ingredients: ['Thân Pháp Sơ Cấp', 'Hô Hấp Sơ Cấp']
                    },
                    'Võ Thuật Cận Chiến Cơ Bản': {
                        name: 'Võ Thuật Cận Chiến Cơ Bản',
                        ingredients: ['Quyền Thuật Sơ Cấp', 'Cước Pháp Sơ Cấp']
                    },
                    'Thuật Hùng Biện': {
                        name: 'Thuật Hùng Biện',
                        ingredients: ['Khẩu Khiếu Sơ Cấp', 'Minh Tư Sơ Cấp']
                    },
                    'Trực Giác Nhạy Bén': {
                        name: 'Trực Giác Nhạy Bén',
                        ingredients: ['Kỹ năng Quan Sát Sơ Cấp', 'Kỹ năng Tìm Kiếm Sơ Cấp']
                    }
                };

                for (const synthesizedSkillName in synthesisRecipes) {
                    const recipe = synthesisRecipes[synthesizedSkillName];
                    const hasAllIngredients = recipe.ingredients.every(ingName =>
                        stateAfterDirectives.character.stats.some(s => s.name === ingName)
                    );
                
                    if (hasAllIngredients) {
                        recipe.ingredients.forEach(ingName => {
                            const indexToRemove = stateAfterDirectives.character.stats.findIndex(s => s.name === ingName);
                            if (indexToRemove > -1) {
                                stateAfterDirectives.character.stats.splice(indexToRemove, 1);
                            }
                        });
                
                        const newSkill = SYNTHESIZED_SKILL_TEMPLATES[recipe.name];
                        if (newSkill) {
                             stateAfterDirectives.character.stats.push({ ...newSkill, id: generateUniqueId('skill-synth'), description: newSkill.description });
                        }
                
                        allMessages.push({ id: generateUniqueId('msg-synth'), text: `Các kỹ năng của bạn đã dung hợp, tạo thành một năng lực mới: ${recipe.name}!` });
                    }
                }

                newTurn.messages = allMessages;

                const playerMapItems = stateAfterDirectives.character.stats.filter((s: Stat) => s.category === 'Vật phẩm' && s.tags?.includes('bản đồ'));
                const mapUpdateFromItems = playerMapItems.length > 0 ? updateMapWithRevealedLocations(playerMapItems, stateAfterDirectives.map, stateAfterDirectives.knowledgeBase) : null;
                const stateAfterMapItemUpdate = mapUpdateFromItems ? { ...stateAfterDirectives, map: mapUpdateFromItems } : stateAfterDirectives;
                const newMapState = updateMapData(turnData.story, stateAfterMapItemUpdate);
                
                const newMemory: Memory = { id: generateUniqueId('memory'), text: (turnData.summary as any)?.text, pinned: settings.autoPinMemory, timestamp: turnData.gameTime, tags: (turnData.summary as any)?.tags || [], relevanceScore: (turnData.summary as any)?.relevanceScore, reasoning: (turnData.summary as any)?.reasoning, };

                loopState = { ...stateAfterMapItemUpdate, history: loopState.history, turns: [...stateAfterMapItemUpdate.turns, newTurn], actions: (turnData.actions || []).map((act: any) => ({ id: generateUniqueId('action'), ...act })), gameTime: turnData.gameTime, memories: [...stateAfterMapItemUpdate.memories, newMemory], isIntercourseScene: turnData.isIntercourseSceneStart || stateAfterMapItemUpdate.isIntercourseScene, intercourseStep: turnData.isIntercourseSceneStart ? 1 : (stateAfterMapItemUpdate.isIntercourseScene ? stateAfterMapItemUpdate.intercourseStep + 1 : 0), totalTokenCount: stateAfterMapItemUpdate.totalTokenCount + newTurn.tokenCount, map: newMapState || stateAfterMapItemUpdate.map };
                combinedStoryForTTS += `${turnData.story}\n\n`;
            }
            
            if (settings.enableTTS) speak(combinedStoryForTTS);

            let finalState = performLocalIntegrityCheckAndFix(loopState).newState;
            
            const oldQuests = new Set(gameState.character.stats.filter(s => s.category === 'Nhiệm Vụ').map(q => q.name));
            const newQuests = finalState.character.stats.filter(s => s.category === 'Nhiệm Vụ');
            const newlyAddedQuests = newQuests.filter(q => !oldQuests.has(q.name));

            if (newlyAddedQuests.length > 0) {
                finalState.hasUnseenQuest = true;
                newlyAddedQuests.forEach(q => {
                    addToast(`Nhiệm vụ mới: ${q.name}`, 'success');
                });
            }

            const currentTurnCount = finalState.turns.length;
            if (currentTurnCount > 0 && currentTurnCount % 19 === 0 && currentTurnCount !== lastMergedTurnRef.current) {
                lastMergedTurnRef.current = currentTurnCount;
                let totalMerged = 0;
        
                const mergeChar = (char: Character): Character => {
                    const { updatedCharacter, mergedCount } = mergePermanentStatuses(char);
                    if (mergedCount > 0) {
                        totalMerged += mergedCount;
                    }
                    return updatedCharacter;
                };
                
                finalState.character = mergeChar(finalState.character);
                finalState.knowledgeBase.npcs = finalState.knowledgeBase.npcs.map(mergeChar);
        
                if (totalMerged > 0) {
                    addToast(`Đã tự động tối ưu hóa và gộp ${totalMerged} trạng thái vĩnh viễn để cải thiện hiệu năng.`, 'info');
                }
            }
            
            dispatch({ type: 'SET_GAME_STATE', payload: finalState });
            onSaveGame(finalState, worldSettings);
            if (finalState.turns.length > 1 && finalState.turns.length % 5 === 0) {
                await handleAutosave(finalState, worldSettings);
            }

            if (settings.predictiveInference && isMounted.current && !finalState.combatState?.isActive) {
                const nextActionToPredict = findBestAction(finalState.actions);
                if (nextActionToPredict) {
                    setPredictionStatus('predicting');
                    runPredictiveTurn(nextActionToPredict, finalState);
                }
            }

        } catch (err: any) {
            if (err instanceof ApiRetryError) {
                const userFriendlyError = getApiErrorMessage(err.originalError, "xử lý lượt chơi");
                if (isMounted.current) {
                    setProcessingError({ error: userFriendlyError, history: err.history });
                }
            } else {
                const userFriendlyError = getApiErrorMessage(err, "xử lý lượt chơi");
                if (userFriendlyError.startsWith("TOKEN_LIMIT_ERROR:")) {
                    if (isMounted.current) {
                        setError(userFriendlyError.split(':')[1]);
                        setIsTokenLimitError(true);
                    }
                } else {
                    if (isMounted.current) {
                        setProcessingError({ error: userFriendlyError, history: ["Đã xảy ra lỗi không mong muốn trước khi hệ thống có thể thử lại."] });
                    }
                }
            }
        } finally {
            if (isMounted.current) {
                setIsAITurnProcessing(false);
                setProcessingStep('');
            }
        }
    }, [ cancelSpeech, isAITurnProcessing, gameState, predictedTurn, predictionStatus, settings, onSaveGame, worldSettings, dispatch, runPredictiveTurn, setError, setActionAnalysis, setLastAction, setIsLastActionCustom, addToast, incrementApiRequestCount, speak, runLocalTurnBasedCombat, isMounted, fanficSummaryRef, setPredictedTurn, setPredictionStatus]);
    
    const handleEmergencyTokenReductionAndRetry = useCallback(async () => {
        if (!lastAction || !gameState) return;
        
        setProcessingError(null);
        setIsAITurnProcessing(true);
        setIsTokenLimitError(false);
        setError(null);
        setProcessingStep('Tối ưu Bối cảnh (1/2)...');
    
        try {
            const tempState = JSON.parse(JSON.stringify(gameState));
            
            // Step 1: Summarize long texts
            const { summarizedWorld, summarizedBackstory, summarizedAction } = await summarizeForEmergency(
                tempState.worldSummary,
                tempState.character.backstory,
                lastAction.description || '',
                settings, addToast, incrementApiRequestCount
            );
    
            tempState.worldSummary = summarizedWorld;
            tempState.character.backstory = summarizedBackstory;
            const tempAction = { ...lastAction, description: summarizedAction };
    
            // Step 2: Temporarily disable all lore rules
            const tempWorldSettings = JSON.parse(JSON.stringify(worldSettings));
            tempWorldSettings.loreRules.forEach((rule: LoreRule) => rule.isActive = false);
    
            // Step 3: Reprocess the turn with the optimized context
            setProcessingStep('Tối ưu Bối cảnh (2/2)...');
            await processTurn(tempAction, isLastActionCustom, true);
    
        } catch (err) {
            const userFriendlyError = getApiErrorMessage(err, "thử lại tối ưu");
            if (isMounted.current) {
                setError(userFriendlyError);
                addToast(userFriendlyError, 'error', err);
            }
        } finally {
            if (isMounted.current) {
                setIsAITurnProcessing(false);
            }
        }
    }, [lastAction, isLastActionCustom, gameState, worldSettings, settings, addToast, incrementApiRequestCount, processTurn, setError]);

    const retryLastAction = useCallback(() => {
        if (lastAction) {
            setProcessingError(null);
            processTurn(lastAction, isLastActionCustom);
        }
    }, [lastAction, isLastActionCustom, processTurn]);

    // Auto world healing logic
    useEffect(() => {
        if (!gameState || isAITurnProcessing || settings.enableCheats) return;

        const turnCount = gameState.turns.length;
        if (turnCount > 0 && turnCount % 10 === 0 && turnCount !== lastHealedTurnRef.current) {
            lastHealedTurnRef.current = turnCount;

            addToast("Đang tự động kiểm tra và sửa lỗi logic thế giới...", 'info');
            
            // Use a timeout to allow the main turn processing to finish rendering
            setTimeout(() => {
                const { newState, fixes } = performLocalIntegrityCheckAndFix(gameState);
                
                if (fixes.length > 0) {
                    dispatch({ type: 'SET_GAME_STATE', payload: newState });
                    addToast(`Hoàn tất! Đã tự động thực hiện ${fixes.length} sửa lỗi. Chi tiết: ${fixes.join(' ')}`, 'success');
                } else {
                    addToast("Kiểm tra hoàn tất. Không tìm thấy lỗi logic.", 'info');
                }
            }, 1000);
        }
    }, [gameState, isAITurnProcessing, settings.enableCheats, dispatch, addToast]);

    return {
        isAITurnProcessing,
        processingTime,
        processTurn,
        retryLastAction,
        processingStep,
        isTokenLimitError,
        handleEmergencyTokenReductionAndRetry,
        retryMessage,
        processingError,
        clearProcessingError: () => setProcessingError(null),
    };
}
