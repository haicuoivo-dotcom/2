/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { GoogleGenAI, GenerateContentParameters, GenerateContentResponse, Modality } from "@google/genai";
import { stripEntityTags, extractJsonFromString, sanitizeTextForImagePrompt, stripThinkingBlock } from '../utils/text';
import { OpenRouterManager } from './OpenRouterManager';
import { VOICE_SUGGESTION_SCHEMA } from '../constants/schemas';
import type { Character, AppSettings, WorldSettings } from '../types';

// Khai báo biến ENV_API_KEY ở đầu file
const ENV_API_KEY = typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_KEY ? import.meta.env.VITE_API_KEY : null;

const GEMINI_CONFIGS_STORAGE = 'gemini_api_configs';

export class ApiRetryError extends Error {
    constructor(message: string, public history: string[], public originalError: any) {
        super(message);
        this.name = 'ApiRetryError';
    }
}

interface ApiConfig {
  key: string;
}

interface KeyValidationResult {
    key: string;
    status: 'valid' | 'invalid' | 'quota_exceeded';
}

const ApiKeyManager = {
  keys: [] as string[],
  currentIndex: 0,
  
  loadKeys: function() {
    let configs: ApiConfig[] = [];
    try {
        const storedConfigs = localStorage.getItem(GEMINI_CONFIGS_STORAGE);
        if (storedConfigs) {
            const parsed = JSON.parse(storedConfigs);
            if(Array.isArray(parsed)) configs = parsed;
        }
    } catch (e) {
         console.warn("Could not parse Gemini configs from localStorage", e);
    }
    this.keys = configs.map(c => c.key?.trim()).filter((key): key is string => !!key);
    this.currentIndex = 0;
  },

  saveKeys: function(keys: string[]) {
      const configs = keys.map(key => ({ key }));
      try {
          localStorage.setItem(GEMINI_CONFIGS_STORAGE, JSON.stringify(configs));
          this.loadKeys(); 
      } catch (e) {
          console.error("Failed to save Gemini keys to localStorage", e);
      }
  },

  getKeys: function(): string[] {
      this.loadKeys();
      return this.keys;
  },
  
  hasAnyValidKey: function(): boolean {
      this.loadKeys();
      return this.keys.length > 0 || !!ENV_API_KEY;
  },

  getKey: function(): string | null {
    if (this.keys.length === 0) this.loadKeys();
    if (this.keys.length > 0) return this.keys[this.currentIndex];
    return ENV_API_KEY || null;
  },
  
  rotateKey: function() {
    if (this.keys.length > 1) {
        this.currentIndex = (this.currentIndex + 1) % this.keys.length;
    }
  },

  getAiClient: function(apiKeyOverride?: string) {
    const key = apiKeyOverride || this.getKey();
    if (!key) {
        throw new Error("API Key của Google Gemini chưa được cấu hình. Vui lòng thêm key trong phần Thiết lập.");
    }
    return new GoogleGenAI({ apiKey: key });
  },

  validateKeys: async function(keys: string[]): Promise<KeyValidationResult[]> {
      const validations = keys.map(async (key) => {
          if (!key) return { key, status: 'invalid' as const };
          try {
              const ai = this.getAiClient(key);
              await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: 'test' });
              return { key, status: 'valid' as const };
          } catch (error: any) {
              const message = (error.message || '').toLowerCase();
              if (message.includes('quota')) {
                  return { key, status: 'quota_exceeded' as const };
              }
              return { key, status: 'invalid' as const };
          }
      });
      return Promise.all(validations);
  },

  generateContentWithRetry: async function(
    params: GenerateContentParameters,
    addToast: (message: string, type?: 'info' | 'success' | 'error' | 'warning') => void,
    incrementRequestCount: () => void,
    setRetryMessage: (message: string | null) => void,
    options?: { safetySettings?: any[] }
  ): Promise<GenerateContentResponse> {
    const totalKeys = this.keys.length > 0 ? this.keys.length : (ENV_API_KEY ? 1 : 0);
    if (totalKeys === 0) {
        throw new Error("Không có API Key nào được cấu hình (cả cá nhân và hệ thống).");
    }
    
    const retryHistory: string[] = [];
    let lastError: any = new Error("Yêu cầu API thất bại sau khi thử tất cả các khóa.");
    retryHistory.push(`Bắt đầu yêu cầu đến model: ${params.model}`);

    for (let keyAttempt = 0; keyAttempt < totalKeys; keyAttempt++) {
        let keyFailed = false;
        const maxRetries = 2; 

        for (let retryAttempt = 0; retryAttempt <= maxRetries; retryAttempt++) {
            incrementRequestCount();
            
            const currentParams = { ...params };
            if (options?.safetySettings) {
                currentParams.config = { ...currentParams.config, safetySettings: options.safetySettings };
            }

            const lowerCaseMessage = (lastError.message || '').toLowerCase();
            const isRecoverableError = lowerCaseMessage.includes('schema') || lowerCaseMessage.includes('json') || lowerCaseMessage.includes('emptyairesponse') || lowerCaseMessage.includes('blocked') || lowerCaseMessage.includes('invalidturnstructure');

            if (retryAttempt > 0 && isRecoverableError) {
                let correctionMandate = `**MỆNH LỆNH SỬA LỖI (ƯU TIÊN TUYỆT ĐỐI):** Ở lần thực thi trước, bạn đã trả về lỗi: "${lastError.message}". Đây là một lỗi nghiêm trọng. Lần này, bạn BẮT BUỘC phải kiểm tra kỹ lưỡng và đảm bảo tuân thủ 100% schema và các quy tắc định dạng.`;
                
                if (lowerCaseMessage.includes('invalidturnstructure')) {
                    const originalAction = (params.contents as string).match(/\*\*Hành động Người chơi:\*\*\n(.*?)\n---/s)?.[1] || "Hành động phức tạp trước đó";
                    correctionMandate = `**MỆNH LỆNH SỬA LỖI & CHIA NHỎ NHIỆM VỤ (ƯU TIÊN TUYỆT ĐỐI):**
**VAI TRÒ:** AI Lập Kế hoạch & Chia nhỏ Nhiệm vụ.
**VẤN ĐỀ:** Yêu cầu trước đó ("${originalAction}") quá phức tạp và đã thất bại. Việc chỉ thử lại sẽ tiếp tục thất bại.
**NHIỆM VỤ MỚI CỦA BẠN LÀ:**
1.  **Phân tích & Chia nhỏ:** Phân tích hành động phức tạp đó thành 2-3 bước logic, tuần tự.
2.  **Tường thuật Bước đầu tiên:** Trong trường \`story\`, BẮT BUỘC chỉ viết diễn biến cho **BƯỚC ĐẦU TIÊN** của kế hoạch.
3.  **Gợi ý các Bước tiếp theo:** Trong trường \`actions\`, BẮT BUỘC tạo ra các hành động gợi ý cho các bước tiếp theo.
**VÍ DỤ BẮT BUỘC:**
-   **Hành động Phức tạp Thất bại:** "Cố gắng thuyết phục tên lính gác rồi lẻn vào lâu đài."
-   **Kết quả Sửa lỗi ĐÚNG:**
    -   \`story\`: "Bạn hít một hơi sâu, tiến lại gần tên lính gác và bắt đầu cuộc trò chuyện, cố gắng dùng lời lẽ để thuyết phục hắn..." (Chỉ mô tả bước đầu tiên).
    -   \`actions\`: Phải chứa một hành động như \`{"description": "Lẻn vào lâu đài sau khi đã thuyết phục thành công."}\` (Gợi ý cho bước tiếp theo).
**HÃY ÁP DỤNG LOGIC NÀY NGAY BÂY GIỜ.**`;
                }

                if (typeof currentParams.contents === 'string') currentParams.contents = `${correctionMandate}\n\n${currentParams.contents}`;
                if (retryAttempt === 2) currentParams.config = { ...currentParams.config, temperature: 0.4 };
            }
            
            try {
                const ai = this.getAiClient();
                const response = await ai.models.generateContent(currentParams);

                if (!response.text?.trim() && Array.isArray(response.candidates) && response.candidates[0]?.content?.parts && response.candidates[0].content.parts.some(p => p.inlineData)) {
                    throw new Error("EmptyAIResponse: AI đã trả về một phản hồi rỗng.");
                }
                
                setRetryMessage(null);
                return response; 
            } catch (error: any) {
                lastError = error;
                const errorMessage = (error.message || '').toLowerCase();

                const isKeySpecificError = errorMessage.includes('api key not valid') ||
                                           errorMessage.includes('permission denied') ||
                                           errorMessage.includes('billing') ||
                                           errorMessage.includes('429') ||
                                           errorMessage.includes('rate limit') ||
                                           errorMessage.includes('quota');
                
                if (isKeySpecificError) {
                    keyFailed = true;
                    if (this.keys.length === 0 && ENV_API_KEY) {
                        window.dispatchEvent(new CustomEvent('systemKeyAuthFailure'));
                    }
                    break; 
                }
                
                const isTransientError = errorMessage.includes('500') ||
                                         errorMessage.includes('503') ||
                                         errorMessage.includes('server') ||
                                         errorMessage.includes('network') ||
                                         errorMessage.includes('timed out');
                
                if (isTransientError) {
                    setRetryMessage(null);
                    retryHistory.push('Lỗi máy chủ AI. Ngừng xử lý theo yêu cầu.');
                    throw new ApiRetryError("Yêu cầu API thất bại do lỗi máy chủ.", retryHistory, lastError);
                }
                
                if (retryAttempt < maxRetries) {
                    const isRecoverableNow = isRecoverableError || lowerCaseMessage.includes('invalidturnstructure');
                    if (isRecoverableNow) {
                        const message = lowerCaseMessage.includes('invalidturnstructure') 
                            ? "Hành động quá phức tạp. AI đang tự động chia nhỏ..." 
                            : (retryAttempt === 0 ? "AI trả về lỗi có thể phục hồi. Thử lại với mệnh lệnh sửa lỗi..." : "Vẫn thất bại. Thử lại với temperature thấp hơn...");
                        setRetryMessage(message);
                        retryHistory.push(`Thử lại lần ${retryAttempt + 1}: ${message}`);
                        await new Promise(resolve => setTimeout(resolve, 1000));
                    } else {
                        setRetryMessage(null);
                        throw new ApiRetryError("Yêu cầu API thất bại.", retryHistory, lastError);
                    }
                }
            }
        } 
        
        if (keyFailed && keyAttempt < totalKeys - 1) {
            const message = `Key ${this.currentIndex + 1} không hợp lệ hoặc hết hạn mức. Đang thử key tiếp theo...`;
            addToast(message, 'warning');
            retryHistory.push(message);
            this.rotateKey();
        } else if (keyFailed) {
            setRetryMessage(null);
            throw new ApiRetryError("Yêu cầu API thất bại sau khi thử tất cả các khóa.", retryHistory, lastError);
        }

    } 
    setRetryMessage(null);
    throw new ApiRetryError("Yêu cầu API thất bại sau khi thử tất cả các khóa.", retryHistory, lastError);
  },
  
  _generateImagesWithSDK: async function(
    prompt: string,
    numImages: number,
    context: 'story' | 'npc_avatar' | 'item'
  ): Promise<string[]> {
    const ai = this.getAiClient();
    
    let aspectRatio = '1:1'; 
    if (context === 'story') {
        aspectRatio = '16:9';
    } else if (context === 'npc_avatar') {
        aspectRatio = '1:2';
    }

    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: prompt,
        config: {
          numberOfImages: numImages,
          outputMimeType: 'image/jpeg',
          aspectRatio: aspectRatio,
        },
    });

    if (!response.generatedImages || response.generatedImages.length === 0) {
        throw new Error("AI safety filters blocking the request or no images were returned.");
    }

    return response.generatedImages.map(img => img.image && img.image.imageBytes ? `data:image/jpeg;base64,${img.image.imageBytes}` : '');
  },

  _generateImagesWithGemini25FlashSDK: async function(
    prompt: string,
    numImages: number
  ): Promise<string[]> {
    const ai = this.getAiClient();
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image-preview',
        contents: {
          parts: [{ text: prompt }]
        },
        config: {
            responseModalities: [Modality.IMAGE, Modality.TEXT],
            candidateCount: numImages,
        },
    });

    const imageUrls: string[] = [];
    if (response.candidates && Array.isArray(response.candidates)) {
        for (const candidate of response.candidates) {
            if (candidate.content && candidate.content.parts && Array.isArray(candidate.content.parts)) {
                for (const part of candidate.content.parts) {
                    if (part.inlineData) {
                        const base64ImageBytes: string = typeof part.inlineData?.data === 'string' ? part.inlineData.data : '';
                        const mimeType = part.inlineData.mimeType || 'image/png';
                        imageUrls.push(`data:${mimeType};base64,${base64ImageBytes}`);
                    }
                }
            }
        }
    }
    
    if (imageUrls.length === 0) {
       throw new Error("AI safety filters blocking the request or no images were returned.");
    }
    
    return imageUrls;
  },

  generateImagesWithRetry: async function(
    prompt: string,
    numImages: number,
    addToast: (message: string, type?: 'info' | 'success' | 'error' | 'warning') => void,
    incrementRequestCount: () => void,
    context: 'story' | 'npc_avatar' | 'item',
    modelOverride?: 'imagen' | 'gemini_2_5_flash_image_preview'
  ): Promise<string[]> {
      const settings: Partial<AppSettings> = JSON.parse(localStorage.getItem('app_settings') || '{}');
      const provider = context === 'npc_avatar' 
          ? settings.npcAvatarProvider
          : settings.storyImageProvider;
  
      if (provider === 'openrouter' && (context === 'story' || context === 'item')) {
          return OpenRouterManager.generateImages(prompt, numImages, addToast, incrementRequestCount);
      }

    const modelType = modelOverride || (context === 'npc_avatar' ? settings.npcAvatarModel : settings.storyImageModel);
    
    incrementRequestCount();
    try {
        if (modelType === 'imagen') {
            return await this._generateImagesWithSDK(prompt, numImages, context);
        } else {
            return await this._generateImagesWithGemini25FlashSDK(prompt, numImages);
        }
    } catch (error: any) {
        this.rotateKey(); 
        throw error;
    }
  },

  generateLocalImagePrompt: function(
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
  },

  suggestTtsVoice: async function(
    worldSettings: WorldSettings,
    character: Character,
    voices: SpeechSynthesisVoice[],
    addToast: (message: string, type?: 'info' | 'success' | 'error' | 'warning') => void,
    incrementRequestCount: () => void
  ): Promise<string | null> {
    const simplifiedVoices = voices.map(v => ({ name: v.name, lang: v.lang, voiceURI: v.voiceURI }));

    const prompt = `
      **Vai trò:** Bạn là một đạo diễn lồng tiếng (voice casting director) cho một audiobook.
      **Nhiệm vụ:** Dựa trên bối cảnh câu chuyện và thông tin nhân vật chính, hãy chọn MỘT (1) giọng đọc phù hợp nhất từ danh sách các giọng đọc có sẵn của hệ thống.
      
      **Thông tin bối cảnh:**
      - **Thể loại (Genre):** ${worldSettings.genre}
      - **Bối cảnh (Setting):** ${worldSettings.setting}
      
      **Thông tin Nhân vật chính:**
      - **Tên:** ${character.displayName}
      - **Giới tính:** ${character.stats.find(s => s.name === 'Giới tính')?.value}
      - **Chủng tộc:** ${character.stats.find(s => s.name === 'Chủng tộc')?.value}
      - **Tính cách:** ${(character.personality || []).map(p => p.name).join(', ')}

      **Danh sách Giọng đọc có sẵn:**
      ${JSON.stringify(simplifiedVoices, null, 2)}

      **Yêu cầu:**
      1.  Phân tích các yếu tố trên. Ví dụ, một thế giới "Tu Tiên" ở "Trung Quốc" nên ưu tiên giọng đọc có ngôn ngữ \`zh-CN\`. Một nhân vật nam nên có giọng nam.
      2.  Chọn ra giọng đọc có \`voiceURI\` phù hợp nhất.
      3.  Trả về kết quả dưới dạng một đối tượng JSON duy nhất theo schema.
    `;

    try {
        const response = await this.generateContentWithRetry(
            {
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: VOICE_SUGGESTION_SCHEMA
                }
            },
            addToast,
            incrementRequestCount,
            // FIX: Added a dummy function for the missing `setRetryMessage` argument.
            () => {}
        );

        const result = await extractJsonFromString(stripThinkingBlock(response.text));
        if (result && result.voiceURI) {
            return result.voiceURI;
        }
        throw new Error("AI did not return a valid voiceURI.");

    } catch (error) {
        throw error; 
    }
  },

  editImageWithAi: async function(
    base64ImageData: string,
    mimeType: string,
    prompt: string,
    addToast: (message: string, type?: 'info' | 'success' | 'error' | 'warning') => void,
    incrementRequestCount: () => void
  ): Promise<{ textResponse: string | null; imageUrls: string[] }> {
    const base64Data = base64ImageData.split(',')[1];
    if (!base64Data) throw new Error("Invalid base64 image data provided.");

    const imagePart = { inlineData: { data: base64Data, mimeType } };
    const textPart = { text: prompt };

    try {
        const response = await this.generateContentWithRetry(
            {
                model: 'gemini-2.5-flash-image-preview',
                contents: { parts: [imagePart, textPart] },
                config: {
                    responseModalities: [Modality.IMAGE, Modality.TEXT],
                    candidateCount: 1,
                },
            },
            addToast,
            incrementRequestCount,
            () => {}
        );

        let textResponse: string | null = null;
        const imageUrls: string[] = [];
        const candidate = response.candidates?.[0];

        if (candidate?.content?.parts) {
            for (const part of candidate.content.parts) {
                if (part.text) {
                    textResponse = (textResponse || '') + part.text;
                } else if (part.inlineData) {
                    const base64Bytes = part.inlineData.data;
                    const responseMimeType = part.inlineData.mimeType || 'image/png';
                    imageUrls.push(`data:${responseMimeType};base64,${base64Bytes}`);
                }
            }
        }
        
        if (imageUrls.length === 0) {
            throw new Error("AI safety filters blocking the request or no edited images were returned.");
        }

        return { textResponse, imageUrls };
    } catch (error) {
        throw error;
    }
  },
};

ApiKeyManager.loadKeys();

window.addEventListener('storage', (event) => {
    if (event.key === GEMINI_CONFIGS_STORAGE) {
        console.log('API keys updated in another tab. Reloading.');
        ApiKeyManager.loadKeys();
    }
});


export { ApiKeyManager };
