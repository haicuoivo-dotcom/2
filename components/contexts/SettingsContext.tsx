/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { createContext, useState, useContext, useEffect, useMemo, useCallback } from 'react';
import { IMAGE_STYLES, OPENROUTER_IMAGE_MODELS } from '../../constants/gameConstants';
import { safeLocalStorage } from '../../utils/storage';
import type { AppSettings } from '../../types';

interface SettingsContextType {
    settings: AppSettings;
    updateSetting: (key: keyof AppSettings, value: any) => void;
    resetSettings: () => void;
    appliedTheme: 'light' | 'dark';
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const SETTINGS_STORAGE_KEY = 'app_settings';

const hexToRgb = (hex: string): string | null => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
        ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
        : null;
};

const initialSettings: AppSettings = {
    theme: 'system', 
    fontFamily: "'Be Vietnam Pro', sans-serif", 
    fontSize: 17, 
    storyLength: 'detailed',
    gameplayStyle: 'turnByTurn',
    autoPinMemory: true,
    enableCheats: false,
    textColor: 'default',
    aiProcessingMode: 'speed',
    textModel: 'gemini-2.5-flash',
    enablePerformanceEffects: true,
    writingStyle: 'default',
    narrativeVoice: 'second',
    difficulty: 'normal',
    allow18Plus: true,
    mobileMode: 'off',
    contextTurns: 'auto',
    showSuccessChance: true,
    benefitRiskAsTooltip: false,
    autoHideFooter: true,
    imageCompressionQuality: 'medium',
    visibleButtons: {},
    showAiButton: true,
    disableAllImageGeneration: true,

    colorPalette: 'default',
    accentPrimary: '',
    accentSecondary: '',

    // Story Image Settings
    autoGenerateStoryImages: false,
    storyImageProvider: 'google',
    storyImageStyle: IMAGE_STYLES[1].value,
    storyImageModel: 'gemini-2.5-flash-image-preview',
    storyImageOpenRouterModule: OPENROUTER_IMAGE_MODELS[0].value,

    // NPC Avatar Settings
    autoGenerateNpcAvatars: false,
    npcAvatarProvider: 'google',
    npcAvatarStyle: IMAGE_STYLES[1].value,
    npcAvatarModel: 'gemini-2.5-flash-image-preview',
    npcAvatarOpenRouterModule: OPENROUTER_IMAGE_MODELS[0].value,
    predictiveInference: false,
    enableWorldHealing: true,

    // FIX: Add missing Text-to-Speech settings to satisfy the AppSettings type.
    enableTTS: false,
    ttsVoiceURI: 'auto-best',
    ttsRate: 1,
    ttsPitch: 1,
    
    storyTendencies: {
        adventure: 0,
        romance: 0,
        detective: 0,
        horror: 0,
        action: 0,
        comedy: 0,
        tragedy: 0,
        intrigue: 0,
        sciFi: 0,
        sliceOfLife: 0,
        philosophical: 0,
        sex: 0,
        gore: 0,
    },
    suggestMoreActions: false,
    showCombatView: false,
    showEquipmentTab: false,
};

export const SettingsProvider = ({ children }: { children: React.ReactNode }) => {
    const [settings, setSettings] = useState<AppSettings>(() => {
        const savedSettingsResult = safeLocalStorage.getItem(SETTINGS_STORAGE_KEY);
        if (savedSettingsResult.success && savedSettingsResult.data) {
            try {
                const savedSettings = JSON.parse(savedSettingsResult.data);

                // Migration for old image model values
                const storyModel = savedSettings.storyImageModel;
                if (storyModel === 'gemini_2_5_flash_preview' || storyModel === 'gemini_2_5_flash_image' || storyModel === 'gemini_preview') {
                    savedSettings.storyImageModel = 'gemini-2.5-flash-image-preview';
                }
                const npcModel = savedSettings.npcAvatarModel;
                if (npcModel === 'gemini_2_5_flash_preview' || npcModel === 'gemini_2_5_flash_image' || npcModel === 'gemini_preview') {
                    savedSettings.npcAvatarModel = 'gemini-2.5-flash-image-preview';
                }

                // Migration for invalid OpenRouter model
                if (savedSettings.storyImageOpenRouterModule === 'google/gemini-2.5-flash-image-preview') {
                    savedSettings.storyImageOpenRouterModule = OPENROUTER_IMAGE_MODELS[0].value;
                }
                if (savedSettings.npcAvatarOpenRouterModule === 'google/gemini-2.5-flash-image-preview') {
                    savedSettings.npcAvatarOpenRouterModule = OPENROUTER_IMAGE_MODELS[0].value;
                }

                // Hợp nhất với cài đặt ban đầu để đảm bảo các khóa mới được bao gồm
                return { ...initialSettings, ...savedSettings };
            } catch (error) {
                 console.error("Không thể phân tích cú pháp cài đặt từ localStorage", error);
            }
        }
        return initialSettings;
    });
    
    const getSystemTheme = () => {
        try {
            return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        } catch (e) {
            return 'light'; // Fallback for environments where matchMedia is not available
        }
    };
    const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>(getSystemTheme());

    const updateSetting = (key: keyof AppSettings, value: any) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    const resetSettings = useCallback(() => {
        safeLocalStorage.removeItem(SETTINGS_STORAGE_KEY);
        setSettings(initialSettings);
    }, []);

    // Lưu cài đặt vào localStorage mỗi khi chúng thay đổi
    useEffect(() => {
        safeLocalStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    }, [settings]);

    useEffect(() => {
        try {
            const themeQuery = window.matchMedia('(prefers-color-scheme: dark)');
            const handleThemeChange = (e: MediaQueryListEvent) => setSystemTheme(e.matches ? 'dark' : 'light');
            themeQuery.addEventListener('change', handleThemeChange);
            return () => {
                themeQuery.removeEventListener('change', handleThemeChange);
            };
        } catch (e) {
            console.warn("window.matchMedia is not supported in this environment.");
        }
    }, []);
    
    const appliedTheme: 'light' | 'dark' = useMemo(() => {
        if (settings.theme === 'light') return 'light';
        if (settings.theme === 'dark') return 'dark';
        return systemTheme; // Fallback for 'system' or any other invalid string
    }, [settings.theme, systemTheme]);

    const appliedMobileMode: 'on' | 'off' = settings.mobileMode;
    
    useEffect(() => {
        document.documentElement.style.setProperty('--base-font-size', `${settings.fontSize}px`);
        document.body.style.fontFamily = settings.fontFamily;
        
        document.body.setAttribute('data-text-color', settings.textColor);
        document.body.setAttribute('data-mobile-mode', appliedMobileMode);
        
        document.body.classList.remove('theme-dark', 'theme-light');
        document.body.classList.add(`theme-${appliedTheme}`);

        document.body.setAttribute('data-performance-effects', settings.enablePerformanceEffects ? 'enabled' : 'disabled');

    }, [settings, appliedTheme, appliedMobileMode]);

    useEffect(() => {
        const root = document.documentElement;
        const { accentPrimary, accentSecondary } = settings;

        if (accentPrimary) {
            root.style.setProperty('--user-accent-primary', accentPrimary);
            const rgbPrimary = hexToRgb(accentPrimary);
            if (rgbPrimary) {
                root.style.setProperty('--user-rgb-accent-primary', rgbPrimary);
            }
        } else {
            root.style.removeProperty('--user-accent-primary');
            root.style.removeProperty('--user-rgb-accent-primary');
        }

        if (accentSecondary) {
            root.style.setProperty('--user-accent-secondary', accentSecondary);
            const rgbSecondary = hexToRgb(accentSecondary);
            if (rgbSecondary) {
                root.style.setProperty('--user-rgb-accent-secondary', rgbSecondary);
            }
        } else {
            root.style.removeProperty('--user-accent-secondary');
            root.style.removeProperty('--user-rgb-accent-secondary');
        }
    }, [settings.accentPrimary, settings.accentSecondary]);

    const contextValue = useMemo(() => ({ settings, updateSetting, resetSettings, appliedTheme }), [settings, appliedTheme, resetSettings]);

    return (
        <SettingsContext.Provider value={contextValue}>
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettings = () => {
    const context = useContext(SettingsContext);
    if (context === undefined) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
};
