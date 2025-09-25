/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
// FIX: Add React import to resolve namespace errors.
import { useState, useRef, useEffect, useCallback } from 'react';
import { useSettings } from '../components/contexts/SettingsContext';
import { ApiKeyManager } from '../services/ApiKeyManager';
import { getApiErrorMessage } from '../utils/error';
import { extractJsonFromString, stripThinkingBlock } from '../utils/text';
import { hydrateCharacterData, hydrateGameState } from '../utils/hydration';
import {
    QUICK_CREATE_SCHEMA,
    // FIX: Renamed schema to the correct one.
    FANFIC_SUMMARY_SCHEMA,
} from '../constants/schemas';
import {
    CREATION_QUICK_RULES,
    CREATION_DETAILED_RULES,
    FANFIC_ANALYSIS_RULES,
} from '../constants/aiConstants';
import { summarizeFanficContent, generateDynamicInstructions, generateCreationOnlyInstructions } from '../utils/ai';
import { generateUniqueId } from '../utils/id';
import { BASE_ITEM_TEMPLATES, DEFAULT_GENRE_RECIPES } from '../constants/items';
import { getReciprocalRelationshipType, generateRelationshipDescription } from '../utils/character';
import type { GameState, WorldSettings, Character, Stat } from '../../types';
import type { GenerateContentParameters } from '@google/genai';

interface UseWorldCreatorProps {
    onCreateWorld: (gameState: GameState, worldSettings: WorldSettings) => void;
    addToast: (message: string, type?: 'info' | 'success' | 'error' | 'warning') => void;
    incrementApiRequestCount: () => void;
    setError: React.Dispatch<React.SetStateAction<string | null>>;
    setFormData: React.Dispatch<React.SetStateAction<WorldSettings>>;
}

const addDefaultRecipeIfNeeded = (character: Character, genre: string): Character => {
    const hasExistingRecipe = character.stats?.some(s => s.category === 'Sơ Đồ Chế Tạo');
    if (hasExistingRecipe) {
        return character;
    }

    const defaultRecipeName = (DEFAULT_GENRE_RECIPES[genre] || DEFAULT_GENRE_RECIPES['Default'])?.[0];
    if (!defaultRecipeName) {
        return character;
    }

    const recipeTemplate = BASE_ITEM_TEMPLATES[defaultRecipeName];
    if (recipeTemplate) {
        const newRecipe: Stat = {
            ...recipeTemplate,
            id: generateUniqueId('recipe-default'),
            description: recipeTemplate.baseDescription,
        };
        const newStats = [...(character.stats || []), newRecipe];
        return { ...character, stats: newStats };
    }

    return character;
};

export const useWorldCreator = ({ onCreateWorld, addToast, incrementApiRequestCount, setError, setFormData }: UseWorldCreatorProps) => {
    const { settings } = useSettings();
    const [isCreating, setIsCreating] = useState(false);
    const [creationMessage, setCreationMessage] = useState('Đang khởi tạo...');
    const [creationTimeElapsed, setCreationTimeElapsed] = useState(0);
    const creationSuccess = useRef(false);
    const timerRef = useRef<number | null>(null);
    const isMounted = useRef(true);

    useEffect(() => {
        isMounted.current = true;
        return () => { isMounted.current = false; };
    }, []);

    useEffect(() => {
        if (isCreating) {
            setCreationTimeElapsed(0);
            timerRef.current = window.setInterval(() => {
                if (isMounted.current) {
                    setCreationTimeElapsed(prev => prev + 1);
                }
            }, 1000);
        } else if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [isCreating]);

    const createWorld = useCallback(async (
        creationRules: string,
        formData: WorldSettings,
        fanficContent: string | null,
        fanficCharOption: 'main' | 'new'
    ) => {
        let worldData: WorldSettings = { ...formData };
        const isQuick = creationRules === CREATION_QUICK_RULES;
        let finalCreationRules = creationRules;

        if (formData.genre === 'Đồng nhân' && fanficContent) {
            setCreationMessage('Phân tích đồng nhân...');
            const summary = await summarizeFanficContent(fanficContent, settings, addToast, incrementApiRequestCount);
            if (!summary) throw new Error("AI không thể tóm tắt nội dung đồng nhân.");

            const fanficAnalysisPrompt = `**Nhiệm vụ:** Trích xuất thông tin từ văn bản để tạo thế giới game.\n**Văn bản:**\n${fanficContent.slice(0, 10000)}\n${FANFIC_ANALYSIS_RULES}`;
            // FIX: The FANFIC_ANALYSIS_SCHEMA was incorrectly named. It should be FANFIC_SUMMARY_SCHEMA.
            const analysisResponse = await ApiKeyManager.generateContentWithRetry({ model: 'gemini-2.5-flash', contents: fanficAnalysisPrompt, config: { responseMimeType: "application/json", responseSchema: FANFIC_SUMMARY_SCHEMA } }, addToast, incrementApiRequestCount, () => {});
            const analysisData = await extractJsonFromString(stripThinkingBlock(analysisResponse.text));

            if (analysisData) {
                worldData = {
                    ...worldData,
                    ...analysisData,
                    worldSummary: summary.worldSummary,
                    loreRules: [...worldData.loreRules, ...summary.worldRules.map(rule => ({ text: rule, isActive: true }))]
                };
                setFormData(worldData);
            } else {
                addToast("Không thể phân tích chi tiết đồng nhân, sẽ dùng tóm tắt.", 'warning');
            }

            let fanficRules = '';
            if (worldData.strictFanficAdherence ?? true) {
                fanficRules = `**MỆNH LỆNH TỐI THƯỢỢNG VỀ KIẾN TẠO ĐỒNG NHÂN (CHẾ ĐỘ NGHIÊM NGẶT):**
1.  **TUÂN THỦ IP TUYỆT ĐỐI:** Mọi nhân vật, sự kiện, và chi tiết thế giới BẮT BUỘC phải tuân thủ nghiêm ngặt nguyên tác (IP) được cung cấp. CẤM TUYỆT ĐỐI việc bịa đặt các nhân vật hoặc tình tiết không có trong hoặc không phù hợp với IP.
2.  **MỞ RỘNG NGUỒN THAM KHẢO:** Để đảm bảo tính chính xác, bạn BẮT BUỘC phải tham khảo thông tin từ các nguồn toàn cầu (Wikipedia, Google, Fandom wikis, etc.), sau đó tự động dịch và Việt hóa thông tin một cách tự nhiên.
3.  **BẢO TOÀN TÊN RIÊNG:** Giữ nguyên tên riêng của nhân vật và địa danh theo nguyên tác. Linh hoạt sử dụng tên theo bối cảnh (ví dụ: tên phương Tây cho bối cảnh Fantasy) nhưng viết bằng ký tự Latin/tiếng Việt. KHÔNG tự ý Việt hóa tên riêng.
4.  **BẢN SẮC VĂN HÓA:** Nỗ lực thể hiện các đặc điểm văn hóa, cách nói chuyện, và tính cách nhân vật cho thật giống với nguyên tác.
---`;
            } else {
                fanficRules = `**HƯỚNG DẪN KIẾN TẠO ĐỒNG NHÂN (CHẾ ĐỘ SÁNG TẠO):**
1.  **LẤY CẢM HỨNG TỪ IP:** Sử dụng nguyên tác (IP) được cung cấp làm nền tảng và nguồn cảm hứng chính.
2.  **TỰ DO SÁNG TẠO:** Bạn được phép và được khuyến khích sáng tạo thêm các nhân vật phụ, tình tiết mới, và các nhánh truyện phụ không có trong nguyên tác để làm cho thế giới trở nên phong phú hơn, miễn là chúng không mâu thuẫn trực tiếp với các sự kiện cốt lõi của IP.
---`;
            }
            finalCreationRules = `${fanficRules}\n${creationRules}`;
        }

        setCreationMessage(isQuick ? 'Tạo Nhanh: AI đang kiến tạo...' : 'Tạo Chi tiết: AI đang suy nghĩ sâu hơn...');
        
        const dynamicInstructions = generateDynamicInstructions(worldData);
        const creationOnlyInstructions = generateCreationOnlyInstructions(worldData);
        const prompt = `**Yêu cầu người dùng:**\n${JSON.stringify(worldData)}\n\n**Hướng dẫn bổ sung:**\n${dynamicInstructions}\n${creationOnlyInstructions}\n\n${finalCreationRules}`;
        const modelToUse = settings.textModel;
        const config: GenerateContentParameters['config'] = {
            responseMimeType: "application/json",
            responseSchema: QUICK_CREATE_SCHEMA,
        };

        if ((settings.aiProcessingMode === 'super_speed' || settings.aiProcessingMode === 'speed') && modelToUse.includes('flash')) {
            config.thinkingConfig = { thinkingBudget: 0 };
        }

        const safetySettings = formData.allow18Plus ? [{ category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' }, { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' }] : [];

        const response = await ApiKeyManager.generateContentWithRetry({
            model: modelToUse,
            contents: prompt,
            config: config,
        }, addToast, incrementApiRequestCount, () => {}, { safetySettings });

        const result = await extractJsonFromString(stripThinkingBlock(response.text));
        if (!result) throw new Error("AI không trả về dữ liệu hợp lệ.");
        
        const playerCharacterData = JSON.parse(JSON.stringify(result.playerCharacter));
        const initialNpcsData = JSON.parse(JSON.stringify(result.initialNpcs));

        let playerCharacter = hydrateCharacterData(playerCharacterData, {}, worldData, undefined, result.gameTime);
        playerCharacter = addDefaultRecipeIfNeeded(playerCharacter, worldData.genre);
        const initialNpcs = initialNpcsData.map((npc: any) => hydrateCharacterData(npc, {}, worldData, playerCharacter.name, result.gameTime));

        // Create a map for easy lookup by name
        const allChars = [playerCharacter, ...initialNpcs];
        const charMapByName = new Map<string, Character>(allChars.map(c => [c.name, c]));
    
        // Process relationships from the AI result to build two-way links
        if (result.relationships && Array.isArray(result.relationships)) {
            result.relationships.forEach((rel: any) => {
                const charA = charMapByName.get(rel.character1);
                const charB = charMapByName.get(rel.character2);
    
                if (charA && charB) {
                    // Relationship A -> B
                    if (!charA.relationships) charA.relationships = [];
                    charA.relationships.push({
                        characterId: charB.id,
                        type: rel.type,
                        affinity: rel.affinity,
                        description: generateRelationshipDescription(charA.displayName, charB.displayName, rel.type)
                    });
    
                    // Reciprocal Relationship B -> A
                    const targetGender = charA.stats?.find(s => s.name === 'Giới tính')?.value as string | undefined;
                    const reciprocalType = getReciprocalRelationshipType(rel.type, targetGender);
                    if (!charB.relationships) charB.relationships = [];
                    charB.relationships.push({
                        characterId: charA.id,
                        type: reciprocalType,
                        affinity: rel.affinity,
                        description: generateRelationshipDescription(charB.displayName, charA.displayName, reciprocalType)
                    });
                }
            });
        }

        const initialGameState: GameState = hydrateGameState({
            title: result.title,
            worldSummary: result.worldSummary,
            character: playerCharacter,
            knowledgeBase: { npcs: initialNpcs, factions: result.factions, locations: [], pcs: [], worldSkills: [] },
            turns: [{ id: generateUniqueId('turn'), story: result.story, messages: [], chosenAction: null, summary: 'Bắt đầu cuộc hành trình', tokenCount: response.usageMetadata?.totalTokenCount || 0 }],
            actions: result.actions.map((act: any) => ({ ...act, id: generateUniqueId('action') })),
            gameTime: result.gameTime,
        }, worldData);

        onCreateWorld(initialGameState, worldData);
    }, [settings, addToast, incrementApiRequestCount, onCreateWorld, setFormData, setCreationMessage]);

    const handleInitiateCreation = useCallback(async (
        isQuick: boolean,
        formData: WorldSettings,
        fanficContent: string | null,
        fanficCharOption: 'main' | 'new'
    ) => {
        setIsCreating(true);
        creationSuccess.current = false;
        setError(null);
        setCreationMessage(isQuick ? 'Tạo Nhanh: Đang khởi tạo...' : 'Tạo Chi tiết: Đang khởi tạo...');

        try {
            const rules = isQuick ? CREATION_QUICK_RULES : CREATION_DETAILED_RULES;
            await createWorld(rules, formData, fanficContent, fanficCharOption);
            creationSuccess.current = true;
        } catch (error) {
            const userFriendlyError = getApiErrorMessage(error, "tạo thế giới");
            if (isMounted.current) setError(userFriendlyError);
        } finally {
            if (isMounted.current) setIsCreating(false);
        }
    }, [createWorld, setError]);

    return {
        isCreating,
        creationMessage,
        creationTimeElapsed,
        creationSuccess,
        handleInitiateCreation,
    };
};
