/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { useSettings } from '../components/contexts/SettingsContext';
import { useGameContext } from '../components/contexts/GameContext';
import { useToasts } from '../components/contexts/ToastContext';
import { ApiKeyManager } from '../services/ApiKeyManager';
import { getApiErrorMessage } from '../utils/error';
import { extractJsonFromString, stripThinkingBlock } from '../utils/text';
import { generateUniqueId } from '../utils/id';
import { getRecentTurnContext, slimCharacterForPrompt, getActiveWorldLogic } from '../utils/ai';
import { applyDirectives, performLocalIntegrityCheckAndFix } from '../utils/game';
import { getItemScore } from '../utils/inventory';
// FIX: Add MEMORY_SUMMARIZATION_SCHEMA to imports for the new handleSummarizeMemories function.
import { UPDATED_CHARACTERS_SCHEMA, WORLD_HEALING_RESPONSE_SCHEMA, WORLD_SIMULATION_SCHEMA, ITEM_RELATIONSHIP_SUPPLEMENT_SCHEMA, BIG_DATA_ANALYSIS_SCHEMA, MEMORY_SUMMARIZATION_SCHEMA } from '../constants/schemas';
// FIX: Add MEMORY_SUMMARIZATION_RULES to imports for the new handleSummarizeMemories function.
import { NPC_UPDATE_RULES, WORLD_ENRICHMENT_RULES, WORLD_HEALING_RULES, WORLD_SIMULATION_RULES, BIG_DATA_ANALYSIS_RULES, MEMORY_SUMMARIZATION_RULES } from '../constants/aiConstants';
import type { GameState, WorldSettings, Character, GameAction, Turn, Stat, WorldHealingReport, SupplementReport } from '../../types';

interface UseGameAIProps {
    onSaveGame: (gameState: GameState, worldSettings: WorldSettings) => void;
    incrementApiRequestCount: () => void;
    isAITurnProcessing: boolean;
    isCombatActive: boolean;
    isPredicting: boolean;
}

export const useGameAI = ({ onSaveGame, incrementApiRequestCount, isAITurnProcessing, isCombatActive, isPredicting }: UseGameAIProps) => {
    const { settings } = useSettings();
    const { gameState, worldSettings, dispatch } = useGameContext();
    const { addToast } = useToasts();
    const isMounted = useRef(true);
    const timerRef = useRef<number | null>(null);
    const lastProcessedTurnIdRef = useRef<string | null>(null);

    const [isEnriching, setIsEnriching] = useState(false);
    const [processingStep, setProcessingStep] = useState('');
    const [enrichmentTime, setEnrichmentTime] = useState(0);

    // FIX: A consolidated processing flag to prevent race conditions between different AI tasks.
    const isProcessing = useMemo(() => isEnriching || isAITurnProcessing || isCombatActive || isPredicting, [isEnriching, isAITurnProcessing, isCombatActive, isPredicting]);

    useEffect(() => {
        isMounted.current = true;
        return () => { isMounted.current = false; };
    }, []);
    
    useEffect(() => {
        if (isEnriching) {
            setEnrichmentTime(0);
            timerRef.current = window.setInterval(() => {
                if (isMounted.current) {
                    setEnrichmentTime(prevTime => prevTime + 0.1);
                }
            }, 100);
        } else if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, [isEnriching]);

    const generateAndSaveNpcAvatars = useCallback(async (npcsToProcess: Character[]) => {
        if (settings.disableAllImageGeneration || !settings.autoGenerateNpcAvatars || npcsToProcess.length === 0) return;
        addToast(`Bắt đầu tạo ảnh đại diện cho ${npcsToProcess.length} NPC mới (tuần tự)...`, 'info');

        const queue = [...npcsToProcess];

        const processQueue = async () => {
            if (!isMounted.current || queue.length === 0) {
                if (isMounted.current) {
                    addToast('Hoàn tất quá trình tạo ảnh đại diện.', 'success');
                }
                return;
            }

            const npc = queue.shift();
            if (!npc || npc.avatarUrl) {
                await processQueue();
                return;
            }
            
            try {
                const { displayName, physicalAppearance, stats } = npc;
                const appearanceDescription = physicalAppearance || (npc as any).description || 'Chưa có mô tả';
                const gender = stats?.find(s => s.name === 'Giới tính')?.value || '';
                const species = stats?.find(s => s.name === 'Chủng tộc')?.value || '';
                const age = stats?.find(s => s.name === 'Tuổi')?.value || '';
                const mood = stats?.find(s => s.name === 'Tâm trạng')?.value || '';
                const artisticKeywords = "cinematic portrait photography, ultra-realistic, professional color grading, sharp focus, 8k";
                const basePrompt = `Ảnh chân dung nghệ thuật, ${displayName}, ${gender}, ${species}, ${age ? `khoảng ${age} tuổi` : ''}, ${mood ? `trạng thái ${mood}` : ''}, ${appearanceDescription}`;
                const finalPrompt = settings.npcAvatarStyle ? `${artisticKeywords}, ${basePrompt}, ${settings.npcAvatarStyle}` : `${artisticKeywords}, ${basePrompt}`;
                
                const images = await ApiKeyManager.generateImagesWithRetry(finalPrompt, 1, addToast, incrementApiRequestCount, 'npc_avatar');
                
                if (isMounted.current && images && images.length > 0) {
                    addToast(`Đã tạo ảnh cho ${displayName}. (${queue.length} còn lại)`, 'success');
                    dispatch({ type: 'UPDATE_CHARACTER', payload: { characterName: npc.name, updates: { avatarUrl: images[0] } } });
                }
            } catch (error: any) {
                console.error(`Failed to auto-generate avatar for ${npc.name}`, error);
                addToast(`Tạo ảnh cho ${npc.name} thất bại.`, 'warning', error);
            } finally {
                if (isMounted.current) {
                    setTimeout(processQueue, 500); 
                }
            }
        };

        await processQueue();
    }, [settings.autoGenerateNpcAvatars, settings.npcAvatarStyle, addToast, incrementApiRequestCount, dispatch, settings.disableAllImageGeneration]);

    const runInitialAvatarGeneration = useCallback(async (initialGameState: GameState) => {
        const npcsToProcess = initialGameState.knowledgeBase.npcs.filter(npc => !npc.avatarUrl);
        await generateAndSaveNpcAvatars(npcsToProcess);
    }, [generateAndSaveNpcAvatars]);

    const runBackgroundWorldSimulation = useCallback(async () => {
        // FIX: Use the consolidated processing flag to prevent race conditions.
        if (isProcessing || !gameState) return;
    
        try {
            const prompt = `**gameState:**\n${JSON.stringify(gameState)}\n\n${WORLD_SIMULATION_RULES}`;
    
            const response = await ApiKeyManager.generateContentWithRetry(
                {
                    model: settings.textModel,
                    contents: prompt,
                    config: {
                        responseMimeType: "application/json",
                        responseSchema: WORLD_SIMULATION_SCHEMA
                    }
                },
                () => {}, // Silent toast for background task
                // FIX: Added a dummy function for the missing `setRetryMessage` argument.
                incrementApiRequestCount,
                () => {}
            );
    
            if (!isMounted.current) return;
    
            const result = await extractJsonFromString(stripThinkingBlock(response.text));
            if (!result || !result.updatedNpcs || !result.updatedFactions || !result.worldNews) {
                console.warn("Background world simulation returned invalid data.");
                return;
            }
    
            if (result.updatedNpcs.length > 0) {
                dispatch({ type: 'MERGE_BACKGROUND_UPDATES', payload: result.updatedNpcs });
            }
            if (result.updatedFactions.length > 0) {
                dispatch({ type: 'MERGE_FACTION_UPDATES', payload: result.updatedFactions });
            }
    
            if (result.worldNews.length > 0) {
                result.worldNews.forEach((news: string) => {
                    addToast(news, 'info');
                });
            }
        } catch (error) {
            console.error("Background world simulation failed:", error);
        }
    }, [isProcessing, gameState, settings.textModel, incrementApiRequestCount, dispatch, addToast]);
    

    const manuallyTriggerWorldHealing = useCallback(async (onProgressUpdate: (message: string) => void): Promise<WorldHealingReport | null> => {
        // FIX: Use the consolidated processing flag to prevent race conditions.
        if (isProcessing || !gameState) return null;
    
        setIsEnriching(true);
        setProcessingStep("Đồng bộ & Sửa lỗi (AI)...");
    
        try {
            if (!isMounted.current) return null;
            onProgressUpdate('Chuẩn bị dữ liệu và gửi yêu cầu đến AI...');
            
            const prompt = `**gameState:**\n${JSON.stringify(gameState)}\n\n${WORLD_HEALING_RULES}`;
    
            const response = await ApiKeyManager.generateContentWithRetry(
                {
                    model: settings.textModel,
                    contents: prompt,
                    config: {
                        responseMimeType: "application/json",
                        responseSchema: WORLD_HEALING_RESPONSE_SCHEMA
                    }
                },
                addToast,
                // FIX: Added a dummy function for the missing `setRetryMessage` argument.
                incrementApiRequestCount,
                () => {}
            );
    
            const result = await extractJsonFromString(stripThinkingBlock(response.text));
            if (!result || !result.report || !result.directives) {
                throw new Error("AI không trả về báo cáo hoặc mệnh lệnh sửa lỗi hợp lệ.");
            }
            if (!isMounted.current) return null;
    
            onProgressUpdate('Đang áp dụng các thay đổi...');
            const { newState, generatedMessages } = applyDirectives(gameState, result.directives, worldSettings, addToast);
    
            if (isMounted.current) {
                dispatch({ type: 'SET_GAME_STATE', payload: newState });
    
                if (generatedMessages.length > 0) {
                    addToast(generatedMessages.map(m => m.text).join(' '), 'info');
                }
                addToast(result.report.summary || "Hoàn tất sửa lỗi thế giới!", 'success');
                return result.report as WorldHealingReport;
            }
            return null;
        } catch (error) {
            if (isMounted.current) {
                const userFriendlyError = getApiErrorMessage(error, "đồng bộ và sửa lỗi thế giới");
                addToast(userFriendlyError, 'error', error);
            }
            console.error("AI-powered world healing failed:", error);
            return null;
        } finally {
            if (isMounted.current) {
                setIsEnriching(false);
                setProcessingStep('');
            }
        }
    }, [isProcessing, gameState, settings.textModel, addToast, incrementApiRequestCount, dispatch, worldSettings]);


    const updateCharactersWithAi = useCallback(async () => {
        // FIX: Use the consolidated processing flag to prevent race conditions.
        if (isProcessing || !gameState) return;
        setIsEnriching(true); setProcessingStep("Đồng bộ Nhân vật... (1/1)");
        try {
            const prompt = `**Vai trò:** Biên kịch & Người quản lý dữ liệu nhân vật TOÀN DIỆN.
**Nhiệm vụ:** Rà soát, cập nhật, và bổ sung MỌI thông tin cho các nhân vật (PC và NPC) dựa trên diễn biến gần đây.
**Dữ liệu:**
- PC: ${JSON.stringify(slimCharacterForPrompt(gameState.character, settings))}
- NPCs: ${JSON.stringify(gameState.knowledgeBase.npcs.map(c => slimCharacterForPrompt(c, settings)))}
- Lượt chơi gần đây: ${getRecentTurnContext(gameState.turns, 5)}
**Yêu cầu BẮT BUỘC (TUÂN THỦ TUYỆT ĐỐI):**
1.  **Làm mới Tiểu sử:** Viết lại \`description\`, \`personality\`, và \`backstory\` để phản ánh những thay đổi và sự phát triển của nhân vật.
2.  **Bổ sung Thông tin Thiếu:** KIỂM TRA TỪNG NPC. Nếu thiếu các thông tin cơ bản như 'Tuổi', 'Giới tính', 'Chủng tộc', hãy suy luận một cách logic dựa trên bối cảnh và **BỔ SUNG** chúng vào mảng \`stats\`. Tuổi phải là một con số cụ thể.
3.  **Cập nhật Trạng thái & Quan hệ:**
    *   Dựa vào các sự kiện gần đây, hãy cập nhật các \`stats\` liên quan như 'Tâm trạng'.
    *   **Phân tích tương tác:** Đọc kỹ các lượt chơi gần đây để xác định các tương tác quan trọng giữa các nhân vật.
    *   **Cập nhật Thiện cảm:** Điều chỉnh \`Stat\` với \`category: 'Thiện cảm'\` (giá trị từ -100 đến 100) để phản ánh các tương tác đó. Tương tác tích cực làm tăng điểm, tiêu cực làm giảm điểm.
    *   **Cập nhật Loại quan hệ:** Nếu bản chất mối quan hệ thay đổi (ví dụ: từ 'Người lạ' thành 'Bạn bè'), hãy cập nhật \`Stat\` với \`category: 'Quan Hệ Gia Đình'\`.
    *   **QUAN HỆ HAI CHIỀU:** Mọi thay đổi về quan hệ phải được áp dụng cho cả hai nhân vật liên quan.
4.  **Cập nhật Túi đồ (Inventory):**
    *   **Rà soát sự kiện:** Tìm kiếm các sự kiện như nhặt được vật phẩm, được tặng, trao đổi, sử dụng hoặc mất vật phẩm trong các lượt chơi gần đây.
    *   **Thêm/Xóa Vật phẩm:** Cập nhật mảng \`stats\` của nhân vật tương ứng.
        *   Để thêm vật phẩm, hãy thêm một \`Stat\` mới với \`category: 'Vật phẩm'\` hoặc \`'Nguyên liệu'\`.
        *   Để xóa vật phẩm, hãy loại bỏ \`Stat\` đó khỏi mảng.
5.  **Giữ nguyên Dữ liệu Cốt lõi:** KHÔNG thay đổi \`name\`, \`id\`, hoặc các kỹ năng chiến đấu trừ khi có lý do cực kỳ rõ ràng từ diễn biến truyện.
${NPC_UPDATE_RULES}`;
            // FIX: Added a dummy function for the missing `setRetryMessage` argument.
            const response = await ApiKeyManager.generateContentWithRetry({ model: settings.textModel, contents: prompt, config: { responseMimeType: "application/json", responseSchema: UPDATED_CHARACTERS_SCHEMA } }, addToast, incrementApiRequestCount, () => {});
            const result = await extractJsonFromString(response.text);
            if (!result || !result.updatedPc || !result.updatedNpcs) throw new Error("Dữ liệu nhân vật cập nhật không hợp lệ.");
            if (isMounted.current) {
                // For PC: Match by ID and dispatch update with the latest name from current state.
                const latestPc = gameState.character;
                if (latestPc.id === result.updatedPc.id) {
                    dispatch({ type: 'UPDATE_CHARACTER', payload: { characterName: latestPc.name, updates: result.updatedPc } });
                }

                // For NPCs: Match by ID and dispatch update with the latest name from current state.
                result.updatedNpcs.forEach((updatedNpc: Character) => {
                    const latestNpc = gameState.knowledgeBase.npcs.find(n => n.id === updatedNpc.id);
                    if (latestNpc) {
                        dispatch({ type: 'UPDATE_CHARACTER', payload: { characterName: latestNpc.name, updates: updatedNpc } });
                    }
                });
                addToast("Đã cập nhật thành công PC và các NPC!", "success");
            }
        } catch (error: any) { const userFriendlyError = getApiErrorMessage(error, "cập nhật nhân vật"); addToast(userFriendlyError, 'error', error); } 
        finally { if (isMounted.current) { setIsEnriching(false); setProcessingStep(""); } }
    }, [isProcessing, gameState, addToast, incrementApiRequestCount, settings, dispatch]);
    
    const autoEquipHaremMembers = useCallback(() => {
        if (isProcessing || !gameState || !gameState.character.harem || gameState.character.harem.length === 0) { addToast("Hậu cung trống hoặc AI đang bận.", "info"); return; }
        let changesMade = false;
        gameState.character.harem.forEach(npcName => {
            const npc = gameState.knowledgeBase.npcs.find(n => n.name === npcName);
            if (!npc) return;
            let equipment = { ...npc.equipment };
            const inventory = npc.stats.filter(s => s.category === 'Vật phẩm' && s.slot);
            let equippedSomething = false;
            const bestItems = new Map<string, Stat>();
            inventory.forEach(item => {
                const slotType = item.slot!.startsWith('Nhẫn') ? 'Nhẫn' : item.slot!.startsWith('Vũ khí') ? 'Vũ khí' : item.slot!;
                const currentBest = bestItems.get(slotType);
                if (!currentBest || getItemScore(item) > getItemScore(currentBest)) bestItems.set(slotType, item);
            });
            Object.keys(equipment).forEach(slot => {
                const slotType = slot.startsWith('Nhẫn') ? 'Nhẫn' : slot.startsWith('Vũ khí') ? 'Vũ khí' : slot;
                const bestItemForSlot = bestItems.get(slotType);
                if (bestItemForSlot && equipment[slot] !== bestItemForSlot.id) {
                    equipment[slot] = bestItemForSlot.id;
                    equippedSomething = true;
                }
            });
            if (equippedSomething) {
                dispatch({ type: 'UPDATE_CHARACTER', payload: { characterName: npc.name, updates: { equipment } } });
                changesMade = true;
            }
        });
        if (changesMade) addToast("Đã tự động trang bị vật phẩm tốt nhất cho toàn bộ hậu cung.", "success"); 
        else addToast("Toàn bộ hậu cung đã trang bị vật phẩm tốt nhất.", "info");
    }, [isProcessing, gameState, dispatch, addToast]);

    const supplementSingleCharacter = useCallback(async (characterToSupplement: Character): Promise<SupplementReport | null> => {
        // FIX: Use the consolidated processing flag to prevent race conditions.
        if (isProcessing || !gameState) return null;
        try {
            const allOtherNpcs = gameState.knowledgeBase.npcs.filter(n => n.id !== characterToSupplement.id);
            const prompt = `
**Vai trò:** AI Phân tích Dữ liệu Nhân vật & Sửa lỗi Logic.
**Nhiệm vụ:** Rà soát CHỈ NHÂN VẬT được cung cấp. So sánh mô tả văn bản và dữ liệu game (\`stats\`) để tìm ra và sửa chữa các điểm mâu thuẫn logic.

**Dữ liệu Game:**
- **Nhân vật Cần Phân tích:** ${JSON.stringify(slimCharacterForPrompt(characterToSupplement, settings))}
- **Tất cả NPC khác (để đối chiếu quan hệ):** ${JSON.stringify(allOtherNpcs.map(n => slimCharacterForPrompt(n, settings)))}
- **Nhân vật Chính (PC) (để đối chiếu quan hệ):** ${JSON.stringify(slimCharacterForPrompt(gameState.character, settings))}

**QUY TRÌNH LOGIC 2 BƯỚC (BẮT BUỘC TUÂN THỦ):**

**BƯỚC 1: SO SÁNH VÀ TÌM MÂU THUẪN**
1.  **Phân tích Vật phẩm:** Đọc kỹ các trường \`backstory\`, \`physicalAppearance\`, \`currentOutfit\`. So sánh với các vật phẩm trong mảng \`stats\`.
    *   **Lỗi THIẾU:** Tìm vật phẩm được mô tả bằng văn bản nhưng **KHÔNG** có trong \`stats\`.
    *   **Lỗi THỪA:** Tìm vật phẩm có trong \`stats\` nhưng mô tả lại nói rằng nó **đã mất, đã bán, hoặc không nên tồn tại**. (Ví dụ: tiểu sử nói "cô ấy đã bán sợi dây chuyền" nhưng vật phẩm "Sợi dây chuyền" vẫn còn trong \`stats\`).
2.  **Phân tích Mối quan hệ:** Đọc kỹ \`backstory\`. So sánh với các mối quan hệ trong \`stats\`.
    *   **Lỗi THIẾU:** Tìm mối quan hệ được mô tả nhưng không có trong \`stats\`.
    *   **Lỗi THỪA:** Tìm mối quan hệ trong \`stats\` nhưng mâu thuẫn với tiểu sử.

**BƯỚC 2: ĐỀ XUẤT SỬA LỖI LOGIC**
Dựa trên **TẤT CẢ** các mâu thuẫn đã tìm thấy ở Bước 1, hãy tạo ra các mệnh lệnh (\`directives\`) để sửa lỗi một cách logic nhất.
*   **Lỗi THIẾU:** Dùng mệnh lệnh \`ADD_STAT\` để thêm vật phẩm/mối quan hệ còn thiếu.
*   **Lỗi THỪA:** Dùng mệnh lệnh \`REMOVE_STAT\` để xóa vật phẩm/mối quan hệ không nên tồn tại.
*   **Mối quan hệ:** Mọi thay đổi về quan hệ phải được áp dụng hai chiều cho cả hai nhân vật liên quan.

**ĐẦU RA:** Trả về một đối tượng JSON duy nhất, hợp lệ theo \`ITEM_RELATIONSHIP_SUPPLEMENT_SCHEMA\`, chỉ chứa một danh sách các mệnh lệnh \`directives\`. Nếu không tìm thấy lỗi nào, trả về một mảng \`directives\` rỗng.
`;

            const response = await ApiKeyManager.generateContentWithRetry(
                {
                    model: settings.textModel,
                    contents: prompt,
                    config: {
                        responseMimeType: "application/json",
                        responseSchema: ITEM_RELATIONSHIP_SUPPLEMENT_SCHEMA,
                    }
                },
                addToast,
                // FIX: Added a dummy function for the missing `setRetryMessage` argument.
                incrementApiRequestCount,
                () => {}
            );

            if (!isMounted.current) return null;

            const result = await extractJsonFromString(stripThinkingBlock(response.text));
            if (!result || !result.directives) {
                throw new Error("AI không trả về mệnh lệnh bổ sung hợp lệ.");
            }
            
            const report: SupplementReport = {
                summary: `AI đã đề xuất ${result.directives.length} thay đổi logic cho ${characterToSupplement.displayName}.`,
                actionsTaken: []
            };

            if (result.directives.length === 0) {
                report.summary = `AI không tìm thấy dữ liệu nào cần bổ sung cho ${characterToSupplement.displayName}.`;
                return report;
            }

            const { newState } = applyDirectives(gameState, result.directives, worldSettings, addToast);
            
            result.directives.forEach((d: any) => {
                if (d.command === 'ADD_STAT') report.actionsTaken.push(`Thêm ${d.args.stat.category}: ${d.args.stat.name} cho ${d.args.characterName}`);
                else if (d.command === 'REMOVE_STAT') report.actionsTaken.push(`Xóa ${d.args.statName} khỏi ${d.args.characterName}`);
            });

            if (isMounted.current) {
                dispatch({ type: 'SET_GAME_STATE', payload: newState });
            }

            return report;

        } catch (error) {
            if (isMounted.current) {
                const userFriendlyError = getApiErrorMessage(error, "bổ sung dữ liệu nhân vật");
                addToast(userFriendlyError, 'error', error);
            }
            console.error("AI-powered single character supplement failed:", error);
            return null;
        }
    }, [isProcessing, gameState, worldSettings, settings, addToast, incrementApiRequestCount, dispatch]);

    const analyzeBigData = useCallback(async (currentState: GameState): Promise<any | null> => {
        // FIX: Use the consolidated processing flag to prevent race conditions.
        if (isProcessing) {
            addToast("Không thể phân tích khi AI đang bận.", "warning");
            return null;
        }
        try {
            const prompt = `**gameState:**\n${JSON.stringify(currentState)}\n\n${BIG_DATA_ANALYSIS_RULES}`;
            const response = await ApiKeyManager.generateContentWithRetry(
                {
                    model: settings.textModel.includes('pro') ? 'gemini-2.5-pro' : 'gemini-2.5-flash',
                    contents: prompt,
                    config: {
                        responseMimeType: "application/json",
                        responseSchema: BIG_DATA_ANALYSIS_SCHEMA,
                    }
                },
                addToast,
                // FIX: Added a dummy function for the missing `setRetryMessage` argument.
                incrementApiRequestCount,
                () => {}
            );
            return await extractJsonFromString(stripThinkingBlock(response.text));
        } catch (error) {
            const userFriendlyError = getApiErrorMessage(error, "phân tích dữ liệu lớn");
            addToast(userFriendlyError, 'error', error);
            throw error;
        }
    }, [isProcessing, settings.textModel, addToast, incrementApiRequestCount]);
    
    // FIX: Added the missing handleSummarizeMemories function.
    const handleSummarizeMemories = useCallback(async () => {
        if (isProcessing || !gameState) return;
        setIsEnriching(true);
        setProcessingStep("Tối ưu Ký ức... (1/1)");
        try {
            const unpinnedMemories = gameState.memories.filter(m => !m.pinned);
            if (unpinnedMemories.length < 10) {
                addToast("Không đủ ký ức không được ghim để tối ưu hóa.", "info");
                return;
            }

            const memoriesToSummarize = unpinnedMemories.slice(0, 20); // Summarize oldest 20 unpinned
            const idsToDelete = memoriesToSummarize.map(m => m.id);
            const textToSummarize = memoriesToSummarize.map(m => m.text).join('\n---\n');

            const prompt = `
            **Dữ liệu:**
            - Bối cảnh: ${getRecentTurnContext(gameState.turns, 3)}
            - Các ký ức cũ cần tóm tắt:
            """
            ${textToSummarize}
            """
            ${MEMORY_SUMMARIZATION_RULES}`;

            const response = await ApiKeyManager.generateContentWithRetry({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: MEMORY_SUMMARIZATION_SCHEMA,
                }
            // FIX: Added a dummy function for the missing `setRetryMessage` argument.
            }, addToast, incrementApiRequestCount, () => {});

            const result = await extractJsonFromString(stripThinkingBlock(response.text));
            if (!result || !result.summaryMemory) {
                throw new Error("AI không trả về bản tóm tắt ký ức hợp lệ.");
            }

            if (isMounted.current) {
                const summaryMemory = {
                    ...result.summaryMemory,
                    id: generateUniqueId('mem-summary'),
                    timestamp: gameState.gameTime,
                    pinned: true, // Auto-pin the summary
                };
                dispatch({ type: 'SUMMARIZE_MEMORIES', payload: { summaryMemory, idsToDelete } });
                addToast(`Đã tóm tắt thành công ${idsToDelete.length} ký ức cũ.`, "success");
            }
        } catch (error) {
            const userFriendlyError = getApiErrorMessage(error, "tối ưu hóa ký ức");
            addToast(userFriendlyError, 'error', error);
        } finally {
            if (isMounted.current) {
                setIsEnriching(false);
                setProcessingStep('');
            }
        }
    }, [isProcessing, gameState, addToast, incrementApiRequestCount, dispatch]);


    useEffect(() => {
        const interval = setInterval(() => {
            // FIX: Use the consolidated processing flag to prevent race conditions.
            if (!isMounted.current || isProcessing || !settings.enableWorldHealing) return;
            
            const turns = gameState?.turns;
            if (!turns || turns.length < 20) return;
            
            if (turns.length > 0 && turns.length % 20 === 0) {
                const lastTurnId = turns[turns.length - 1].id;
                if (lastProcessedTurnIdRef.current !== lastTurnId) {
                    lastProcessedTurnIdRef.current = lastTurnId;
                    addToast("Thế giới đang thay đổi... AI đang mô phỏng các sự kiện ngầm.", 'info');
                    runBackgroundWorldSimulation();
                }
            }
        }, 5000);
        return () => clearInterval(interval);
    }, [gameState, isProcessing, settings.enableWorldHealing, runBackgroundWorldSimulation, addToast]);

    return {
        isEnriching,
        enrichmentTime,
        processingStep,
        runInitialAvatarGeneration,
        updateCharactersWithAi,
        manuallyTriggerWorldHealing,
        autoEquipHaremMembers,
        supplementSingleCharacter,
        analyzeBigData,
        // FIX: Export the newly added handleSummarizeMemories function.
        handleSummarizeMemories,
    };
};
