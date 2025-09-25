/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { STORY_LENGTH_INSTRUCTIONS, DIFFICULTY_LEVELS } from '../constants/gameConstants';
// FIX: STAT_HEALTH is exported from statConstants.
import { STAT_HEALTH } from '../constants/statConstants';
import { DEFAULT_WORLD_LOGIC_SET, ADULT_RULE_PREFIXES, DIFFICULTY_LOGIC_EASY, DIFFICULTY_LOGIC_NORMAL, DIFFICULTY_LOGIC_HARD, DIFFICULTY_LOGIC_NIGHTMARE } from '../constants/worldLogic';
import { WORLD_ERA } from '../constants/tagConstants';
// FIX: Renamed the imported constant from the non-existent 'FANFIC_PRE_FLIGHT_SUMMARY_RULES' to the existing 'FANFIC_ANALYSIS_RULES' to fix the import error.
import { FANFIC_ANALYSIS_RULES } from '../constants/aiConstants';
// FIX: Correctly import schemas from the main schemas barrel file.
import { FANFIC_SUMMARY_SCHEMA, EMERGENCY_SUMMARY_SCHEMA, DIRECTIVE_BASED_TURN_UPDATE_SCHEMA } from '../constants/schemas';
import { ApiKeyManager } from '../services/ApiKeyManager';
// FIX: Import sanitizeTextForImagePrompt.
import { extractJsonFromString, stripThinkingBlock, stripEntityTags, sanitizeTextForImagePrompt } from './text';
import type { GameState, WorldSettings, Character, GameAction, Turn, GameTime, WorldEvent, AppSettings, KnowledgeEntity, Stat, StoryTendencies } from '../../types';

export interface FanficSummary {
    worldSummary: string;
    keyPlotPoints: string[];
    mainCharacters: { name: string; description: string }[];
    worldRules: string[];
}

export const getSafeTokenLimit = (modelName: string): number => {
    // These are conservative limits for the *input prompt* to leave room for the output.
    // The actual model context windows are much larger.
    if (modelName.includes('pro')) return 250000; // Safe limit for Gemini 2.5 Pro
    if (modelName.includes('flash')) return 120000; // Safe limit for Gemini 2.5 Flash
    return 28000; // Fallback for older models like Gemini 1.0 Pro
};

export const summarizeFanficContent = async (
    fanficText: string,
    settings: AppSettings,
    addToast: (message: string, type?: 'info' | 'success' | 'error' | 'warning') => void,
    incrementApiRequestCount: () => void,
): Promise<FanficSummary | null> => {
    const prompt = `
        **Nhiệm vụ:** Tóm tắt văn bản Đồng nhân sau đây theo schema đã cho.
        **Văn bản:**
        """
        ${fanficText.slice(0, 500000)}
        """
        ${FANFIC_ANALYSIS_RULES}
    `;

    try {
        const response = await ApiKeyManager.generateContentWithRetry(
            {
                model: settings.textModel,
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: FANFIC_SUMMARY_SCHEMA
                }
            },
            addToast,
            // FIX: Added a dummy function for the missing `setRetryMessage` argument.
            incrementApiRequestCount,
            () => {}
        );

        const result = await extractJsonFromString(stripThinkingBlock(response.text));
        if (result && result.worldSummary) {
            return result as FanficSummary;
        }
        throw new Error("AI did not return a valid fanfic summary.");
    } catch (error) {
        console.error("Fanfic summarization failed:", error);
        throw error;
    }
};

export const summarizeTextWithAI = async (
    textToSummarize: string,
    context: string,
    targetTokenCount: number,
    settings: AppSettings,
    addToast: (message: string, type?: 'info' | 'success' | 'error' | 'warning') => void,
    incrementApiRequestCount: () => void
): Promise<string> => {
    const prompt = `**NHIỆM VỤ:** Tóm tắt, cô đọng văn bản sau đây để nó có khoảng ${targetTokenCount} tokens (hoặc ngắn hơn). Giữ lại những chi tiết quan trọng nhất, cốt lõi nhất.
**Bối cảnh của văn bản:** ${context}
**Văn bản cần tóm tắt:**
"""
${textToSummarize}
"""
**YÊU CẦU:** Chỉ trả về văn bản đã được tóm tắt, không thêm bất kỳ lời dẫn hay giải thích nào.`;
    
    const response = await ApiKeyManager.generateContentWithRetry(
        {
            model: settings.textModel.includes('flash') ? settings.textModel : 'gemini-2.5-flash', // Use flash for speed
            contents: prompt,
            config: {
                temperature: 0.2 // Lower temp for factual summarization
            }
        },
        addToast,
        // FIX: Added a dummy function for the missing `setRetryMessage` argument.
        incrementApiRequestCount,
        () => {}
    );

    return stripThinkingBlock(response.text).trim();
};

export const summarizeForEmergency = async (
    worldSummary: string,
    backstory: string,
    action: string,
    settings: AppSettings,
    addToast: (message: string, type?: 'info' | 'success' | 'error' | 'warning') => void,
    incrementApiRequestCount: () => void,
): Promise<{ summarizedWorld: string, summarizedBackstory: string, summarizedAction: string }> => {
    const prompt = `**NHIỆM VỤ:** Tóm tắt CỰC KỲ NGẮN GỌN từng đoạn văn bản sau đây. Giữ lại Ý CHÍNH TUYỆT ĐỐI.
**Văn bản 1 (Tóm tắt Thế giới):**
${worldSummary}
---
**Văn bản 2 (Tiểu sử Nhân vật):**
${backstory}
---
**Văn bản 3 (Hành động Người chơi):**
${action}
`;
    try {
        // FIX: Added a dummy function for the missing `setRetryMessage` argument.
        const response = await ApiKeyManager.generateContentWithRetry({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: EMERGENCY_SUMMARY_SCHEMA,
                temperature: 0.1,
            }
        }, addToast, incrementApiRequestCount, () => {});
        const result = await extractJsonFromString(stripThinkingBlock(response.text));
        if (result && result.summarizedWorld && result.summarizedBackstory && result.summarizedAction) {
            return result;
        }
        throw new Error("AI did not return a valid emergency summary.");
    } catch (error) {
        console.error("Emergency summarization failed:", error);
        throw error;
    }
};

export const slimCharacterForPrompt = (char: Character | null, settings?: AppSettings): any | null => {
    if (!char) return null;

    const { 
        history, 
        saveId, 
        avatarUrl, 
        physicalAppearance, 
        currentOutfit, 
        personalityAndMannerisms, 
        backstory, 
        ...rest 
    } = char as any;

    return rest;
};

export const truncateKnowledgeBaseForPrompt = (
    kb: GameState['knowledgeBase'],
    relevanceContext: string,
    onScreenNpcNames: Set<string>,
    settings: AppSettings,
    maxLength = 150
): GameState['knowledgeBase'] => {
    if (!kb) return { npcs: [], locations: [], factions: [], pcs: [], worldSkills: [] };

    const truncatedKb = JSON.parse(JSON.stringify(kb));
    
    if (truncatedKb.npcs) {
        truncatedKb.npcs = truncatedKb.npcs.map((npc: Character) => {
            if (onScreenNpcNames.has(npc.name)) {
                return npc;
            }
            return slimCharacterForPrompt(npc, settings);
        });
    }
    
    const generalTruncate = (text: string | undefined) => text && text.length > maxLength ? `${text.substring(0, maxLength)}...` : (text || '');
    
    const filterAndTruncate = <T extends KnowledgeEntity>(entities: T[] | undefined): T[] => {
        if (!entities) return [];
        return entities
            .filter(entity => relevanceContext.toLowerCase().includes(entity.name.toLowerCase()))
            .map(entity => ({ ...entity, description: generalTruncate(entity.description) }));
    };

    truncatedKb.locations = filterAndTruncate(kb.locations);
    truncatedKb.factions = filterAndTruncate(kb.factions);
    
    if (truncatedKb.pcs) (truncatedKb.pcs as KnowledgeEntity[]).forEach(e => { e.description = generalTruncate(e.description); });

    return truncatedKb;
};


export const getRecentTurnContext = (turns: Turn[], count: number): string => {
    return turns.slice(-count).map((turn: Turn) => {
        const actionText = turn.chosenAction ? `[Người chơi đã chọn: ${turn.chosenAction}]` : '[Diễn biến trước đó]';
        const turnContext = turn.summary || (turn.story ? turn.story.substring(0, 300) + '...' : 'Không có tóm tắt.');
        return `${actionText}\n[Kết quả/Tóm tắt]: ${turnContext}`.trim();
    }).join('\n\n---\n\n');
};

const getActiveLore = (worldSettings: WorldSettings): string => worldSettings.loreRules?.filter(r => r.isActive).map(r => r.text).join('\n') || '';

const getActiveEvents = (worldSettings: WorldSettings, gameTime: GameTime): WorldEvent[] => {
    if (!worldSettings.worldEvents || !gameTime) return [];
    const { year, month, day } = gameTime;
    return worldSettings.worldEvents.filter(event => {
        if (!event.isActive) return false;
        const eventStartDayOfYear = (event.startMonth - 1) * 30 + event.startDay;
        const currentDayOfYear = (month - 1) * 30 + day;
        const eventEndDayOfYear = eventStartDayOfYear + event.durationDays;
        switch(event.frequency) {
            case 'Hàng năm': return currentDayOfYear >= eventStartDayOfYear && currentDayOfYear < eventEndDayOfYear;
            case 'Mỗi 5 năm': return (year - 547) % 5 === 0 && currentDayOfYear >= eventStartDayOfYear && currentDayOfYear < eventEndDayOfYear;
            case 'Mỗi 10 năm': return (year - 547) % 10 === 0 && currentDayOfYear >= eventStartDayOfYear && currentDayOfYear < eventEndDayOfYear;
            default: return false;
        }
    });
};

const buildIdLookupTable = (gameState: GameState): string => {
    const entries: string[] = [];
    const addedIds = new Set<string>();
    const addEntry = (id: string, type: string, name: string, tags: string[]) => {
        if (!id || addedIds.has(id)) return;
        entries.push(`- [id=${id}] ${type}: ${name} (Tags: ${tags.join(', ')})`);
        addedIds.add(id);
    };
    const getCharTags = (char: Character): string[] => {
        const tags = new Set<string>();
        if (char.npcType) tags.add(char.npcType);
        const species = char.stats?.find(s => s.name === 'Chủng tộc')?.value;
        if (species) tags.add(String(species));
        return Array.from(tags);
    };
    if (gameState.character) addEntry(gameState.character.id, 'PC', gameState.character.displayName, getCharTags(gameState.character));
    gameState.knowledgeBase.npcs.forEach(npc => addEntry(npc.id, 'NPC', npc.displayName, getCharTags(npc)));
    [gameState.character, ...gameState.knowledgeBase.npcs].forEach(char => {
        (char.stats || []).forEach(stat => {
            if (stat.category === 'Vật phẩm' && (stat.rarity === 'Huyền thoại' || stat.rarity === 'Sử thi' || Object.values(char.equipment || {}).includes(stat.id))) {
                addEntry(stat.id, 'Vật phẩm', stat.name, [stat.rarity, stat.quality, ...(stat.tags || [])].filter(Boolean) as string[]);
            } else if (stat.category === 'Nhiệm Vụ' && stat.tags?.includes('active')) {
                addEntry(stat.id, 'Nhiệm vụ', stat.name, ['đang thực hiện']);
            }
        });
    });
    if (entries.length === 0) return '';
    return `\n---\n**Bảng Tra cứu ID:**\n${entries.join('\n')}\n---`;
};

export const getGenrePromptText = (genre: string): string => {
    if (genre === 'Đồng nhân' || genre === 'Thế Giới Giả Tưởng (Game/Tiểu Thuyết)') {
        return `Dựa trên một tác phẩm có sẵn`;
    }
    return genre;
};

const getActiveEraTags = (worldSettings: WorldSettings): Set<string> => {
    const tags = new Set<string>();
    const genre = worldSettings.genre;

    switch (genre) {
        case 'Tu Tiên':
        case 'Huyền Huyễn Truyền Thuyết':
        case 'Võ Lâm':
        case 'Thời Chiến (Trung Hoa/Nhật Bản)':
        case 'Dị Giới Fantasy':
        case 'Thế Giới Giả Tưởng (Game/Tiểu Thuyết)':
            tags.add(WORLD_ERA.MEDIEVAL);
            tags.add(WORLD_ERA.ANCIENT);
            break;
        case 'Đô Thị Hiện Đại':
        case 'Đô Thị Hiện Đại 100% bình thường':
        case 'Đô Thị Dị Biến':
            tags.add(WORLD_ERA.MODERN);
            break;
        case 'Hậu Tận Thế':
            tags.add(WORLD_ERA.MODERN); // Post-modern
            tags.add(WORLD_ERA.FUTURISTIC);
            break;
        case 'Trống':
        case 'Đồng nhân':
        default:
            // For blank slates, enable all eras to give AI max flexibility
            tags.add(WORLD_ERA.ANCIENT);
            tags.add(WORLD_ERA.MEDIEVAL);
            tags.add(WORLD_ERA.MODERN);
            tags.add(WORLD_ERA.FUTURISTIC);
            break;
    }
    return tags;
};

export const getActiveWorldLogic = (worldSettings: WorldSettings): string => {
    const baseRules = worldSettings.worldLogic
        ?.filter(rule => {
            if (!rule.isActive) return false;
            const activeEraTags = getActiveEraTags(worldSettings);
            return !rule.tags || rule.tags.length === 0 || rule.tags.some(tag => activeEraTags.has(tag));
        })
        .map(rule => rule.text)
        .join('\n') || '';

    let difficultyRuleText = '';
    switch (worldSettings.difficulty) {
        case 'easy':
            difficultyRuleText = DIFFICULTY_LOGIC_EASY.text;
            break;
        case 'hard':
            difficultyRuleText = DIFFICULTY_LOGIC_HARD.text;
            break;
        case 'nightmare':
            difficultyRuleText = DIFFICULTY_LOGIC_NIGHTMARE.text;
            break;
        case 'normal':
        default:
            difficultyRuleText = DIFFICULTY_LOGIC_NORMAL.text;
            break;
    }

    return `${baseRules}\n\n${difficultyRuleText}`;
};

export const generateCreationOnlyInstructions = (worldSettings: WorldSettings): string => {
    const instructions = [];
    if (worldSettings.equipFullSet) {
        instructions.push("**Mệnh lệnh Trang bị Đầy đủ (Ưu tiên Tuyệt đối):** Người dùng đã bật tùy chọn 'Trang bị đầy đủ'. Bạn BẮT BUỘC phải tạo ra HAI (2) bộ trang phục khởi đầu hoàn chỉnh cho nhân vật:\n1.  **Bộ Trang bị Chiến đấu:** Bao gồm ít nhất 6 món cơ bản (vũ khí, mũ, giáp, quần, găng tay, giày) phù hợp với chức nghiệp và bối cảnh. Các vật phẩm này phải được thêm vào mảng `stats` VÀ được trang bị vào các ô `equipment` tương ứng. Trường `currentOutfit` cũng phải mô tả bộ trang bị này.\n2.  **Bộ Trang phục Thời trang/Thường ngày:** Tạo thêm một bộ trang phục phi chiến đấu (ví dụ: váy, áo sơ mi, đồ dạo phố...) phù hợp với tiểu sử và bối cảnh. Các vật phẩm này chỉ cần thêm vào mảng `stats` và KHÔNG được trang bị. Chúng phải có tag `'trang-phục-thường-ngày'`.\nCả hai bộ phải được tạo ra dưới dạng các `Stat` vật phẩm hoàn chỉnh.");
    }
    if (worldSettings.suggestPowerfulSkills) {
        instructions.push("**Cân bằng Sức mạnh:** YÊU CẦU TẠO KỸ NĂNG BÁ ĐẠO. Hãy tạo ra các kỹ năng và vật phẩm khởi đầu cực kỳ mạnh mẽ, vượt trội so với người thường, mang lại lợi thế lớn ngay từ đầu.");
    } else {
        instructions.push("**Cân bằng Sức mạnh:** YÊU CẦU TẠO KỸ NĂNG BÌNH THƯỜNG. Hãy tạo ra các kỹ năng và vật phẩm khởi đầu cân bằng, hợp lý, phù hợp với một người mới bắt đầu.");
    }
    return instructions.join('\n');
};

export const generateDynamicInstructions = (settings: { difficulty: string; narrativeVoice: string; writingStyle: string; }): string => {
    const instructions = [];
    const difficultyData = DIFFICULTY_LEVELS[settings.difficulty];
    if (difficultyData) {
        instructions.push(`**Độ khó:** ${difficultyData.label}. ${difficultyData.notes.join(' ')}`);
    }
    if (settings.narrativeVoice === 'second') {
        instructions.push("**Ngôi kể:** Sử dụng ngôi thứ hai ('Bạn') để người chơi nhập vai.");
    } else if (settings.narrativeVoice === 'first') {
        instructions.push("**Ngôi kể:** Sử dụng ngôi thứ nhất ('Tôi') từ góc nhìn nhân vật chính.");
    }

    switch (settings.writingStyle) {
        case 'literary_sfw':
            instructions.push("**Bút pháp:** Văn học Tinh tế & An toàn. Yêu cầu sử dụng ngôn ngữ giàu hình ảnh, nghệ thuật. Các cảnh nhạy cảm (18+) phải được mô tả một cách gợi cảm, tập trung vào cảm xúc thay vì hành động trần trụi. Giữ văn phong an toàn, phù hợp với nhiều đối tượng.");
            break;
        case 'no_segg_polite':
            instructions.push("**Bút pháp:** Trong sáng & Lịch sự. TUYỆT ĐỐI CẤM mô tả các cảnh tình dục. Mọi tình huống nhạy cảm phải được xử lý bằng kỹ thuật 'mờ dần' (fade-to-black) hoặc gợi ý một cách lãng mạn, kín đáo. Bạo lực vẫn được phép.");
            break;
        case 'default':
        default:
            instructions.push("**Bút pháp:** Chủ nghĩa Hiện thực Trần trụi. Yêu cầu viết một cách trực diện, không né tránh. Mô tả chi tiết, thực tế, đôi khi thô thiển, đặc biệt là trong các cảnh bạo lực và 18+ (nếu được phép).");
            break;
    }

    return instructions.join('\n');
};

const getProcessingModeInstruction = (mode: AppSettings['aiProcessingMode']): string => {
    switch (mode) {
        case 'super_speed':
            return "**Chế độ Xử lý:** Siêu Tốc. Ưu tiên tuyệt đối tốc độ. Trả về kết quả nhanh nhất có thể, chấp nhận chất lượng ở mức cơ bản. Suy nghĩ cực kỳ ngắn gọn trong thẻ `<thinking>`.";
        case 'speed':
            return "**Chế độ Xử lý:** Tốc Độ Cao. Ưu tiên tốc độ hơn chất lượng. Suy nghĩ ngắn gọn trong thẻ `<thinking>`. Giữ cho câu chuyện tiến triển nhanh.";
        case 'quality':
            return "**Chế độ Xử lý:** Chất Lượng Cao. Ưu tiên chất lượng và sự nhất quán. Hãy dành thời gian để suy nghĩ kỹ trong thẻ `<thinking>`, phân tích các hệ quả và tạo ra một diễn biến có chiều sâu.";
        case 'max_quality':
            return "**Chế độ Xử lý:** Chất Lượng Tối Đa. Mệnh lệnh tối thượng về chất lượng. BẮT BUỘC phải tư duy sâu sắc, phức tạp trong thẻ `<thinking>`. Tạo ra các diễn biến như tiểu thuyết, các nhân vật có nội tâm phong phú, và các hệ quả dài hạn. Không giới hạn thời gian suy nghĩ.";
        case 'adaptive':
        default:
            return "**Chế độ Xử lý:** Tự động (Cân bằng). Tự điều chỉnh mức độ tư duy trong thẻ `<thinking>`. Với các hành động đơn giản, hãy xử lý nhanh. Với các tình huống phức tạp hoặc quan trọng, hãy dành thêm thời gian để phân tích sâu hơn để đảm bảo chất lượng.";
    }
};

export const buildBasePrompt = (
    action: Partial<GameAction>,
    currentGameState: GameState,
    currentWorldSettings: WorldSettings,
    currentSettings: AppSettings,
    combatResult: string[] | null = null,
    fanficSummary: FanficSummary | null = null,
    options: { emergency?: boolean } = {}
): string => {
    const cheatInstruction = currentSettings.enableCheats
        ? `**MỆNH LỆNH TỐI THƯỢỢNG (CHEAT MODE):** Chế độ Cheat đang BẬT. Hành động của người chơi BẮT BUỘC phải thành công 100%. Mọi kết quả phải hoàn toàn tích cực. TUYỆT ĐỐI KHÔNG được tạo ra bất kỳ hậu quả tiêu cực, rủi ro, hoặc thất bại nào. Mệnh lệnh này GHI ĐÈ lên mọi quy tắc logic khác.\n---\n`
        : '';
    
    const isSuperSpeed = currentSettings.aiProcessingMode === 'super_speed';

    const { storyLength, contextTurns, gameplayStyle } = currentSettings;
    
    let turnsToRead = options.emergency ? 1 : ({ short: 3, medium: 5, long: 10, auto: 5 }[contextTurns] || 5);
    if (isSuperSpeed) {
        turnsToRead = 1; 
    }
    const recentContext = getRecentTurnContext(currentGameState.turns, turnsToRead);

    const activeLore = options.emergency ? '' : getActiveLore(currentWorldSettings);
    const activeWorldLogic = getActiveWorldLogic({ ...currentWorldSettings, ...currentSettings });
    const dynamicInstructions = generateDynamicInstructions(currentSettings);
    const storyLengthInstruction = STORY_LENGTH_INSTRUCTIONS[storyLength as keyof typeof STORY_LENGTH_INSTRUCTIONS] || STORY_LENGTH_INSTRUCTIONS.standard;
    const processingModeInstruction = getProcessingModeInstruction(currentSettings.aiProcessingMode);
    
    const onScreenNpcNames = new Set<string>();
    const npcRegex = /\[NPC:([^\]]+)\]/g;
    let match;
    const latestStory = currentGameState.turns[currentGameState.turns.length - 1]?.story || '';
    while ((match = npcRegex.exec(latestStory)) !== null) onScreenNpcNames.add(match[1]);
    if (action.description) while ((match = npcRegex.exec(action.description)) !== null) onScreenNpcNames.add(match[1]);
    
    const activeEvents = getActiveEvents(currentWorldSettings, currentGameState.gameTime);
    
    let relevanceContext = recentContext + ' ' + (action.description || '') + ' ' + (currentGameState.character.backstory || '') + ' ' + (currentGameState.worldSummary || '');
    currentGameState.knowledgeBase.npcs.filter(npc => onScreenNpcNames.has(npc.name)).forEach(npc => { relevanceContext += ' ' + (npc.backstory || ''); });
    
    const processedKnowledgeBase = truncateKnowledgeBaseForPrompt(currentGameState.knowledgeBase, relevanceContext, onScreenNpcNames, currentSettings);
    
    const actionDescription = `**Hành động Người chơi:**\n${action.description}`;
    const combatResultString = combatResult ? combatResult.join('\n- ') : null;
    const combatResultInstruction = combatResultString 
        ? `\n**Kết quả Chiến đấu (BẮT BUỘC TUÂN THỦ):**\n- ${combatResultString}\n**YÊU CẦU:** Dựa trên kết quả trên, hãy tường thuật lại diễn biến trận chiến một cách sinh động trong \`story\`.`
        : '';
        
    const worldSummaryForPrompt = fanficSummary 
        ? `
        **BỐI CẢNH ĐỒNG NHÂN (ĐÃ TÓM TẮT):**
        - **Tóm tắt Thế giới:** ${fanficSummary.worldSummary}
        - **Cốt truyện chính:**\n${fanficSummary.keyPlotPoints.map(p => `- ${p}`).join('\n')}
        - **Nhân vật chính:**\n${fanficSummary.mainCharacters.map(c => `- ${c.name}: ${c.description}`).join('\n')}
        - **Luật lệ Thế giới:**\n${fanficSummary.worldRules.map(r => `- ${r}`).join('\n')}
        `
        : currentGameState.worldSummary || '';

    const gameplayStyleInstruction = `**Phong cách Chơi:** ${gameplayStyle === 'continuousNovel' ? 'Tiểu thuyết Liên tục. Viết với dự đoán rằng câu chuyện sẽ tiếp diễn ngay lập tức.' : 'Theo lượt. Viết một phân cảnh hoàn chỉnh và dừng lại.'}`;
    
    const tendencies = currentSettings.storyTendencies;
    const tendencyLabels: { [key in keyof StoryTendencies]: string } = {
        adventure: 'Phiêu lưu',
        romance: 'Lãng mạn/Hậu cung',
        detective: 'Trinh thám/Bí ẩn',
        horror: 'Kinh dị/Hồi hộp',
        action: 'Hành động',
        comedy: 'Hài hước',
        tragedy: 'Bi kịch',
        intrigue: 'Chính trị & Âm mưu',
        sciFi: 'Khoa học Viễn tưởng',
        sliceOfLife: 'Đời thường',
        philosophical: 'Triết học',
        sex: 'Tình Dục',
        gore: 'Máu Me Kinh Dị',
    };

    const tendencyText = Object.entries(tendencies)
        .map(([key, value]) => {
            const label = tendencyLabels[key as keyof StoryTendencies] || key;
            return `- ${label}: ${value}%`;
        })
        .join('\n');
    const tendencyInstruction = `**MỆNH LỆNH VỀ THIÊN HƯỚNG CÂU CHUYỆN (Story Tendency Mandate):**\nDựa trên sở thích của người chơi, bạn BẮT BUỘC phải điều chỉnh nội dung truyện (\`story\`) và các hành động gợi ý (\`actions\`) để phản ánh tỷ lệ thiên hướng sau đây. Đây là một chỉ dẫn quan trọng về phong cách kể chuyện mong muốn.\n${tendencyText}`;

    const sections = [
        !isSuperSpeed && activeWorldLogic ? `**Logic Thế giới:**\n${activeWorldLogic}` : '',
        !isSuperSpeed && activeLore ? `**Luật lệ (Lore):**\n${activeLore}` : '',
        activeEvents.length > 0 ? `**Sự kiện đang diễn ra:**\n${activeEvents.map(e => `- ${e.name}: ${e.description}`).join('\n')}` : '',
        !isSuperSpeed ? buildIdLookupTable(currentGameState) : '',
        tendencyInstruction,
        dynamicInstructions,
        processingModeInstruction,
        `**Mệnh lệnh Độ dài Truyện:** ${storyLengthInstruction}`,
        gameplayStyleInstruction,
        `**Bối cảnh:**\n${recentContext}`,
        `**Trạng thái Game:**\n${JSON.stringify({
            gameTime: currentGameState.gameTime,
            character: slimCharacterForPrompt(currentGameState.character, currentSettings),
            knowledgeBase: processedKnowledgeBase,
            worldSummary: worldSummaryForPrompt,
        })}`,
        `${actionDescription}${combatResultInstruction}`
    ];
    return cheatInstruction + sections.filter(Boolean).join('\n---\n');
};

interface LocalAnalysisResult {
    successChance: number;
    benefit: string;
    risk: string;
    timeCost: string;
}

export const performLocalAnalysis = (actionText: string, gameState: GameState): LocalAnalysisResult | null => {
    const cleanActionText = stripEntityTags(actionText).toLowerCase();
    const pc = gameState.character;
    const allCharacters = [pc, ...gameState.knowledgeBase.npcs];

    const COMBAT_KEYWORDS = ['tấn công', 'đánh', 'chém', 'giết', 'bắn', 'đấm', 'đá', 'hạ gục', 'tiêu diệt'];
    const SOCIAL_KEYWORDS = ['nói', 'hỏi', 'thuyết phục', 'đe dọa', 'trò chuyện', 'khen', 'chê', 'mắng', 'ra lệnh', 'trêu', 'tán tỉnh'];
    const ITEM_KEYWORDS = ['dùng', 'sử dụng', 'uống', 'ăn', 'ném', 'kiểm tra'];
    const MOVEMENT_KEYWORDS = ['đi đến', 'tới', 'vào', 'rời khỏi', 'chạy đến', 'quay lại'];
    const EXPLORE_KEYWORDS = ['khám phá', 'nhìn', 'quan sát', 'tìm kiếm', 'điều tra'];

    const findTarget = (text: string, characters: Character[]): Character | null => {
        const cleanText = text.toLowerCase();
        const sortedChars = [...characters].sort((a,b) => (b.displayName || b.name).length - (a.displayName || a.name).length);
        for (const char of sortedChars) {
            if (cleanText.includes((char.displayName || char.name).toLowerCase())) {
                return char;
            }
        }
        return null;
    };
    
    const findItem = (text: string, inventory: Stat[]): Stat | null => {
        const cleanText = text.toLowerCase();
        const sortedItems = [...inventory].sort((a,b) => b.name.length - a.name.length);
        for (const item of sortedItems) {
            if (cleanText.includes(item.name.toLowerCase())) {
                return item;
            }
        }
        return null;
    }
    
    if (ITEM_KEYWORDS.some(kw => cleanActionText.startsWith(kw))) {
        const inventory = pc.stats.filter(s => s.category === 'Vật phẩm' || s.category === 'Nguyên liệu');
        const item = findItem(cleanActionText, inventory);
        if (item) {
            const isConsumable = item.tags?.includes('tiêu hao');
            return {
                successChance: 95,
                benefit: `Sử dụng ${item.name}. ${item.description || ''}`,
                risk: isConsumable ? `Sẽ tiêu thụ mất ${item.name}.` : 'Hành động có thể thất bại hoặc có kết quả không mong muốn.',
                timeCost: 'Vài giây'
            };
        }
    }

    if (COMBAT_KEYWORDS.some(kw => cleanActionText.startsWith(kw))) {
        const target = findTarget(cleanActionText, allCharacters.filter(c => c.id !== pc.id));
        if (target) {
            return {
                successChance: 70,
                benefit: `Gây sát thương cho ${target.displayName}.`,
                risk: `Có thể bị ${target.displayName} phản công.`,
                timeCost: 'Vài giây'
            };
        }
    }

    if (SOCIAL_KEYWORDS.some(kw => cleanActionText.startsWith(kw))) {
        const target = findTarget(cleanActionText, allCharacters.filter(c => c.id !== pc.id));
        if (target) {
            return {
                successChance: 75,
                benefit: `Tương tác với ${target.displayName}, có thể nhận được thông tin hoặc cải thiện quan hệ.`,
                risk: `Có thể làm ${target.displayName} phật lòng hoặc gây ra hiểu lầm.`,
                timeCost: 'Vài phút'
            };
        }
    }

    if (MOVEMENT_KEYWORDS.some(kw => cleanActionText.startsWith(kw))) {
        return {
            successChance: 100,
            benefit: 'Di chuyển đến một vị trí mới, khám phá thế giới.',
            risk: 'Trên đường đi có thể gặp nguy hiểm hoặc các sự kiện bất ngờ.',
            timeCost: 'Tùy khoảng cách'
        };
    }

    if (EXPLORE_KEYWORDS.some(kw => cleanActionText.startsWith(kw))) {
         return {
            successChance: 85,
            benefit: 'Bạn có thể phát hiện ra điều gì đó hữu ích hoặc một manh mối quan trọng.',
            risk: 'Có thể không tìm thấy gì, hoặc thu hút sự chú ý không mong muốn.',
            timeCost: '5-10 phút'
        };
    }

    // If no simple pattern is matched, return null to let the AI handle it.
    return null;
};

export const generateLocalImagePrompt = function(
    storyText: string,
    worldSummary: string | undefined,
    character: Character,
    npcsInScene: Character[],
    style: string
  ): string {
    const baseStyle = "cinematic film still, photorealistic, hyper-detailed, 8k, professional photography, dramatic lighting";

    const pcDescription = `${character.displayName}, ${character.physicalAppearance}, wearing ${character.currentOutfit}`;
    
    const npcDescriptions = npcsInScene.map(npc => 
        `${npc.displayName}, ${npc.physicalAppearance}, wearing ${npc.currentOutfit}`
    ).join(', ');

    const storySnippet = stripEntityTags(storyText).substring(0, 250).replace(/DIALOGUE:.*?:/gi, '').replace(/"/g, '');
    
    const promptParts = [
      baseStyle,
      style,
      pcDescription,
      npcDescriptions,
      storySnippet,
      worldSummary ? `in a world described as: ${worldSummary.substring(0, 100)}...` : ''
    ];
    
    const rawPrompt = promptParts.filter(Boolean).join(', ');
    return sanitizeTextForImagePrompt(rawPrompt);
  };

export const repairJsonWithAI = async (brokenJsonString: string): Promise<string> => {
    const prompt = `**VAI TRÒ:** Trình sửa lỗi JSON.
**NHIỆM VỤ:** Văn bản sau đây là một chuỗi JSON gần như hợp lệ nhưng chứa lỗi cú pháp (ví dụ: thiếu dấu phẩy, dấu ngoặc, hoặc có dấu phẩy thừa). Nhiệm vụ của bạn là sửa các lỗi cú pháp này để tạo ra một chuỗi JSON hợp lệ 100%.
**MỆNH LỆNH TỐI THƯỢỢNG:**
1.  **CHỈ SỬA CÚ PHÁP:** TUYỆT ĐỐI KHÔNG được thay đổi giá trị của bất kỳ trường nào. Chỉ sửa các lỗi cú pháp.
2.  **KHÔNG GIẢI THÍCH:** Chỉ trả về chuỗi JSON đã được sửa. KHÔNG thêm thẻ \`<thinking>\` hoặc bất kỳ lời giải thích nào khác.
**JSON BỊ LỖI:**
"""
${brokenJsonString}
"""`;
    try {
        // FIX: Added a dummy function for the missing `setRetryMessage` argument.
        const response = await ApiKeyManager.generateContentWithRetry(
            { model: 'gemini-2.5-flash', contents: prompt },
            () => {}, // Silent toast for this internal operation
            () => {},  // Do not increment global request count for this internal repair
            () => {}
        );
        return stripThinkingBlock(response.text).trim();
    } catch (e) {
        console.error("AI JSON repair failed:", e);
        // If the repair itself fails, return the original broken string
        // to let the final parsing attempt throw the original error.
        return brokenJsonString;
    }
};