/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import type { AppSettings } from '../types';

const OR_CONFIGS_STORAGE = 'openrouter_api_configs';
const APP_URL = "https://thich-ma-dao-ai.web.app/";
const APP_TITLE = "Thích Ma Đạo AI";

interface ApiConfig {
    key: string;
}

interface KeyValidationResult {
    key: string;
    status: 'valid' | 'invalid' | 'quota_exceeded';
}

export const OpenRouterManager = {
    keys: [] as string[],
    currentIndex: 0,
    
    loadKeys: function() {
        let configs: ApiConfig[] = [];
        try {
            const storedConfigs = localStorage.getItem(OR_CONFIGS_STORAGE);
            if (storedConfigs) {
                const parsed = JSON.parse(storedConfigs);
                if(Array.isArray(parsed)) configs = parsed;
            }
        } catch (e) {
             console.warn("Could not parse OpenRouter configs from localStorage", e);
        }
        
        this.keys = configs.map(c => c.key?.trim()).filter((key): key is string => !!key);
        this.currentIndex = 0;
    },

    saveKeys: function(keys: string[]) {
      const configs = keys.map(key => ({ key }));
      try {
          localStorage.setItem(OR_CONFIGS_STORAGE, JSON.stringify(configs));
          this.loadKeys(); // Reload internal state
      } catch (e) {
          console.error("Failed to save OpenRouter keys to localStorage", e);
      }
    },

    getKeys: function(): string[] {
        this.loadKeys();
        return this.keys;
    },
    
    getKey: function(): string | null {
        if (this.keys.length === 0) this.loadKeys();
        return this.keys.length > 0 ? this.keys[this.currentIndex] : null;
    },
    
    rotateKey: function() {
        if (this.keys.length > 1) {
            this.currentIndex = (this.currentIndex + 1) % this.keys.length;
        }
    },
    
    getCurrentIndex: function(): number {
        return this.keys.length > 0 ? this.currentIndex : -1;
    },

    validateKeys: async function(keys: string[]): Promise<KeyValidationResult[]> {
        const validations = keys.map(async (key) => {
            if (!key) return { key, status: 'invalid' as const };
            try {
                const response = await fetch("https://openrouter.ai/api/v1/auth/key", {
                    method: "GET",
                    headers: { "Authorization": `Bearer ${key}` },
                });
                if (response.ok) {
                    return { key, status: 'valid' as const };
                } else if (response.status === 402) {
                    return { key, status: 'quota_exceeded' as const };
                } else {
                    return { key, status: 'invalid' as const };
                }
            } catch (error) {
                return { key, status: 'invalid' as const };
            }
        });
        return Promise.all(validations);
    },

    generateImages: async function(
        prompt: string,
        numImages: number,
        addToast: (message: string, type?: 'info' | 'success' | 'error' | 'warning') => void,
        incrementRequestCount: () => void,
    ): Promise<string[]> {
        const settings: Partial<AppSettings> = JSON.parse(localStorage.getItem('app_settings') || '{}');
        const model = settings.storyImageOpenRouterModule || 'playgroundai/playground-v2.5';
        
        const totalKeys = this.keys.length > 0 ? this.keys.length : 1;
        let lastError: any = new Error("Không thể tạo ảnh qua OpenRouter sau khi đã thử hết các khóa.");

        for (let keyAttempt = 0; keyAttempt < totalKeys; keyAttempt++) {
            const key = this.getKey();
            if (!key) {
                throw new Error("Chưa thiết lập API Key của OpenRouter. Vui lòng vào 'Thiết lập API Key' -> 'OpenRouter'.");
            }
            incrementRequestCount();
            
            try {
                const response = await fetch("https://openrouter.ai/api/v1/images/generations", {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${key}`,
                        "Content-Type": "application/json",
                        "HTTP-Referer": APP_URL,
                        "X-Title": encodeURIComponent(APP_TITLE),
                    },
                    body: JSON.stringify({ prompt, model, n: numImages, response_format: 'b64_json' })
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({ error: { message: response.statusText }}));
                    const errorMessage = `Lỗi OpenRouter (${response.status}): ${errorData.error.message}`;
                     const isKeyError = response.status === 401 || response.status === 402 || response.status === 429;
                    if(isKeyError) throw new Error(`[KEY_ERROR] ${errorMessage}`);
                    throw new Error(errorMessage);
                }

                const result = await response.json();
                if (!result.data || result.data.length === 0) throw new Error("OpenRouter không trả về ảnh nào.");
                return result.data.map((img: any) => `data:image/png;base64,${img.b64_json}`);

            } catch (error: any) {
                lastError = error;
                const isKeyError = (error.message || '').toLowerCase().includes('[key_error]');
                
                if (isKeyError && keyAttempt < totalKeys - 1) {
                    addToast(`OpenRouter Key ${this.currentIndex + 1} gặp lỗi. Đang thử key tiếp theo...`, 'warning');
                    this.rotateKey();
                } else {
                    this.rotateKey();
                    throw lastError;
                }
            }
        }
        
        throw lastError;
    }
};

OpenRouterManager.loadKeys();
