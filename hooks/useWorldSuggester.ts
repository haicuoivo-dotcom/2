/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useSettings } from '../components/contexts/SettingsContext';
import { ApiKeyManager } from '../services/ApiKeyManager';
import { getApiErrorMessage } from '../utils/error';
import { generateUniqueId } from '../utils/id';
import { extractJsonFromString, stripThinkingBlock } from '../utils/text';
import { getGenrePromptText, getActiveWorldLogic, generateDynamicInstructions, generateCreationOnlyInstructions } from '../utils/ai';
import { CHARACTER_SUGGESTION_SCHEMA, WORLD_SUMMARY_SUGGESTION_SCHEMA } from '../constants/schemas';
import { WORLD_SUGGESTION_RULES, CHARACTER_SUGGESTION_RULES } from '../constants/aiConstants';
import type { WorldSettings, Stat } from '../../types';
import type { GenerateContentParameters } from '@google/genai';

interface UseWorldSuggesterProps {
    formData: WorldSettings;
    setFormData: React.Dispatch<React.SetStateAction<WorldSettings>>;
    addToast: (message: string, type?: 'info' | 'success' | 'error' | 'warning') => void;
    incrementApiRequestCount: () => void;
    setError: React.Dispatch<React.SetStateAction<string | null>>;
}

export const useWorldSuggester = ({ formData, setFormData, addToast, incrementApiRequestCount, setError }: UseWorldSuggesterProps) => {
    const { settings } = useSettings();
    const [isGeneratingContext, setIsGeneratingContext] = useState(false);
    const [isGeneratingChar, setIsGeneratingChar] = useState(false);
    const [contextSuggestionTime, setContextSuggestionTime] = useState(0);
    const [charSuggestionTime, setCharSuggestionTime] = useState(0);
    const contextTimerRef = useRef<number | null>(null);
    const charTimerRef = useRef<number | null>(null);
    const isMounted = useRef(true);

    useEffect(() => {
        isMounted.current = true;
        return () => { 
            isMounted.current = false; 
            stopTimer(contextTimerRef);
            stopTimer(charTimerRef);
        };
    }, []);

    const startTimer = (setter: React.Dispatch<React.SetStateAction<number>>, timerRef: React.MutableRefObject<number | null>) => {
        if (timerRef.current) clearInterval(timerRef.current);
        setter(0);
        timerRef.current = window.setInterval(() => {
            if (isMounted.current) {
                setter(prev => prev + 0.1);
            }
        }, 100);
    };

    const stopTimer = (timerRef: React.MutableRefObject<number | null>) => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
    };


    const handleGenericAiError = useCallback((error: unknown, context: string) => {
        if (isMounted.current) {
            const userFriendlyError = getApiErrorMessage(error, context);
            setError(userFriendlyError);
            addToast(userFriendlyError, 'error');
        }
    }, [addToast, setError]);

    const handleSuggestWorldSummary = useCallback(async () => {
        if (isGeneratingContext) return;
        setIsGeneratingContext(true); 
        startTimer(setContextSuggestionTime, contextTimerRef);
        setError(null);
        try {
            const activeWorldLogic = getActiveWorldLogic(formData);
            const activeLore = formData.loreRules?.filter(r => r.isActive).map(r => r.text).join('\n');
            const worldLogicPromptSection = activeWorldLogic ? `**Logic Thế giới:**\n${activeWorldLogic}\n---` : '';
            const lorePromptSection = activeLore ? `**Luật lệ (Lore):**\n${activeLore}\n---` : '';
            const dynamicInstructions = generateDynamicInstructions(formData);
            const finalIdea = formData.templateIdea || formData.idea;
            
            const prompt = `
${worldLogicPromptSection}
${lorePromptSection}
${dynamicInstructions}
**Nhiệm vụ:** Viết một bản tóm tắt thế giới (world summary) chi tiết và hấp dẫn.
**Yếu tố Cốt lõi:**
- Kiểu Thế Giới: ${getGenrePromptText(formData.genre)}
- Bối cảnh: ${formData.setting}
- Ý tưởng Chính: "${finalIdea.trim() || "(Trống)"}"
- Gợi ý: "${formData.suggestion || 'Không có.'}"
**Yêu cầu:**
1.  **Ưu tiên Ý tưởng Chính:** Nếu "Ý tưởng Chính" có nội dung, hãy xây dựng thế giới trực tiếp từ đó. Nếu không, hãy kết hợp các yếu tố còn lại.
2.  **Nội dung:** Bao gồm lịch sử, địa lý, các phe phái, hệ thống sức mạnh, và xung đột chính.
3.  **Hình thức:** Trả về JSON theo schema.
${WORLD_SUGGESTION_RULES}`;
            const modelToUse = settings.textModel;
            const config: GenerateContentParameters['config'] = {
                responseMimeType: "application/json",
                responseSchema: WORLD_SUMMARY_SUGGESTION_SCHEMA,
            };

            if ((settings.aiProcessingMode === 'super_speed' || settings.aiProcessingMode === 'speed') && modelToUse.includes('flash')) {
                config.thinkingConfig = { thinkingBudget: 0 };
            }
            // FIX: Added a dummy function for the missing `setRetryMessage` argument.
            const response = await ApiKeyManager.generateContentWithRetry({
                model: modelToUse,
                contents: prompt,
                config: config,
            }, addToast, incrementApiRequestCount, () => {});
            
            // FIX: The `extractJsonFromString` function is async and must be awaited.
            const result = await extractJsonFromString(stripThinkingBlock(response.text));
            const generatedText = result?.worldSummary?.trim();

            if (generatedText && isMounted.current) {
                setFormData(prev => ({ ...prev, worldSummary: generatedText }));
            }
        } catch (err) {
            handleGenericAiError(err, "gợi ý thế giới");
        } finally {
            if (isMounted.current) setIsGeneratingContext(false);
            stopTimer(contextTimerRef);
        }
    }, [isGeneratingContext, formData, setFormData, addToast, incrementApiRequestCount, handleGenericAiError, settings.textModel, settings.aiProcessingMode]);

    const handleSuggestCharacter = useCallback(async (suggestionConfig: { skills: number; items: number; relationships: number }) => {
        if (isGeneratingChar) return;
        setIsGeneratingChar(true); 
        startTimer(setCharSuggestionTime, charTimerRef);
        setError(null);
        try {
            const activeWorldLogic = getActiveWorldLogic(formData);
            const activeLore = formData.loreRules?.filter(r => r.isActive).map(r => r.text).join('\n');
            const worldLogicPromptSection = activeWorldLogic ? `**Logic Thế giới:**\n${activeWorldLogic}\n---` : '';
            const lorePromptSection = activeLore ? `**Luật lệ (Lore):**\n${activeLore}\n---` : '';
            const dynamicInstructions = generateDynamicInstructions(formData);
            const creationInstructions = generateCreationOnlyInstructions(formData);
            
            const prompt = `
${worldLogicPromptSection}
${lorePromptSection}
${dynamicInstructions}
${creationInstructions}
**Nhiệm vụ:** Sáng tạo hoặc hoàn thiện một nhân vật hoàn chỉnh dựa trên thông tin được cung cấp.
**Bối cảnh Thế giới:**
- Kiểu Thế giới: ${getGenrePromptText(formData.genre)}
- Bối cảnh: ${formData.setting}
- Tóm tắt: ${formData.worldSummary || 'Chưa có, hãy tự do sáng tạo.'}

**Thông tin Nhân vật đã biết:** ${JSON.stringify({ name: formData.name, species: formData.species, // FIX: Replaced deprecated 'personalityOuter' with 'personalityTraits'.
personalityTraits: formData.personalityTraits, gender: formData.gender, linhCan: formData.linhCan })}

**Yêu cầu về Số lượng (BẮT BUỘC):**
-   Tạo ra chính xác ${suggestionConfig.skills} Kỹ năng Khởi đầu.
-   Tạo ra chính xác ${suggestionConfig.items} Vật phẩm Khởi đầu.
-   Tạo ra chính xác ${suggestionConfig.relationships} Mối quan hệ Ban đầu.

**Yêu cầu:**
1.  **Tôn trọng Tên:** Nếu 'Tên hiện tại' có giá trị, BẮT BUÔC phải sử dụng chính xác tên đó.
2.  **Sáng tạo:** Tạo ra tiểu sử (\`backstory\`), các chỉ số, kỹ năng, vật phẩm khởi đầu (\`stats\`), và các mối quan hệ ban đầu (\`initialRelationships\`) phù hợp.
3.  **Nhất quán:** Tên và các yếu tố phải tuân thủ nghiêm ngặt Bối cảnh (\`setting\`).
4.  **Chỉ số Tiến triển:** Dựa trên Kiểu Thế giới, thêm các chỉ số phù hợp (Linh Khí, Nội Lực, hoặc Cấp Độ/Kinh Nghiệm).
5.  **Định dạng:** Trả về một đối tượng JSON hợp lệ theo schema.
${CHARACTER_SUGGESTION_RULES}`;
            
            const modelToUse = settings.textModel;
            const config: GenerateContentParameters['config'] = {
                responseMimeType: "application/json",
                responseSchema: CHARACTER_SUGGESTION_SCHEMA,
            };

            if ((settings.aiProcessingMode === 'super_speed' || settings.aiProcessingMode === 'speed') && modelToUse.includes('flash')) {
                config.thinkingConfig = { thinkingBudget: 0 };
            }

            // FIX: Corrected variable name from 'characterPrompt' to 'prompt'.
            const response = await ApiKeyManager.generateContentWithRetry({ model: modelToUse, contents: prompt, config }, addToast, incrementApiRequestCount, () => {});
            // FIX: The `extractJsonFromString` function is async and must be awaited.
            const generatedData = await extractJsonFromString(stripThinkingBlock(response.text));

            if (!isMounted.current) return;
            if (generatedData && generatedData.name && generatedData.species && generatedData.backstory && Array.isArray(generatedData.stats)) {
                setFormData(prev => {
                    const finalStatsMap = new Map<string, Stat>();
                    (prev.stats || []).forEach(stat => finalStatsMap.set(stat.name, stat));
            
                    const newStatsWithIds = (generatedData.stats || []).map((stat: any) => ({ ...stat, id: generateUniqueId('stat') }));
                    newStatsWithIds.forEach((stat: Stat) => finalStatsMap.set(stat.name, stat));
            
                    return {
                        ...prev,
                        name: generatedData.name,
                        species: generatedData.species,
                        linhCan: formData.genre === 'Tu Tiên' ? generatedData.linhCan || prev.linhCan : '',
                        backstory: generatedData.backstory,
                        stats: Array.from(finalStatsMap.values()),
                        initialRelationships: (generatedData.initialRelationships || []).map((rel: any) => ({
                            ...rel,
                            id: generateUniqueId('init-rel')
                        })),
                    };
                });
            } else {
                throw new Error("Dữ liệu JSON từ AI không chứa các trường 'name', 'species', 'backstory' hoặc 'stats' hợp lệ.");
            }
        } catch (err) {
            handleGenericAiError(err, "gợi ý nhân vật");
        } finally {
            if (isMounted.current) setIsGeneratingChar(false);
            stopTimer(charTimerRef);
        }
    }, [isGeneratingChar, formData, setFormData, addToast, incrementApiRequestCount, handleGenericAiError, settings.textModel, settings.aiProcessingMode]);
    
    return {
        isGeneratingContext,
        isGeneratingChar,
        contextSuggestionTime,
        charSuggestionTime,
        handleSuggestWorldSummary,
        handleSuggestCharacter,
    };
};
