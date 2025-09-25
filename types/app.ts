/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import type { GameState } from './game';
import type { WorldSettings } from './world';
// FIX: Import PersonalityTrait from base types to resolve missing name error.
import type { Stat, StatEffect, SetBonus, PersonalityTrait } from './base';

// Contains types related to the application shell, UI, and user settings.

export interface SaveFile {
    id: string;
    name: string;
    timestamp: string;
    gameState: GameState;
    worldSettings: WorldSettings;
    type: 'manual' | 'auto';
}

export interface ToastData {
    id: string;
    message: string;
    type: 'info' | 'success' | 'error' | 'warning';
}

export interface EntityTooltipData {
    name: string;
    type: string;
    description: string;
    position: { top: number; left: number };
    displayName?: string;
    avatarUrl?: string;
    stats?: Stat[];
    effects?: (StatEffect & { originalValue?: string | number; newValue?: string | number })[];
    remainingTime?: string;
    removalConditions?: string[];
    variant?: 'default' | 'combat' | 'compact';
    combatPower?: number;
    resistances?: string[];
    vulnerabilities?: string[];
    personality?: PersonalityTrait[];
    mood?: string;
    statuses?: Stat[];
    value?: string | number;
    npcType?: 'npc' | 'unnamed_monster' | 'named_monster' | 'boss';
    price?: number;
    slot?: string;
    setName?: string;
    setBonuses?: SetBonus[];
    tags?: string[];
}

export interface StoryTendencies {
    adventure: number;
    romance: number;
    detective: number;
    horror: number;
    action: number;
    comedy: number;
    tragedy: number;
    intrigue: number;
    sciFi: number;
    sliceOfLife: number;
    philosophical: number;
    sex: number;
    gore: number;
}

export interface AppSettings {
    theme: 'system' | 'light' | 'dark';
    fontFamily: string;
    fontSize: number;
    storyLength: 'short' | 'standard' | 'detailed' | 'novel';
    gameplayStyle: 'turnByTurn' | 'continuousNovel';
    autoPinMemory: boolean;
    enableCheats: boolean;
    textColor: 'default' | 'gray';
    aiProcessingMode: 'super_speed' | 'speed' | 'adaptive' | 'quality' | 'max_quality';
    textModel: 'gemini-2.5-flash' | 'gemini-2.5-pro';
    enablePerformanceEffects: boolean;
    writingStyle: 'default' | 'literary_sfw' | 'no_segg_polite';
    narrativeVoice: 'first' | 'second' | 'third_limited' | 'third_omniscient';
    difficulty: 'easy' | 'normal' | 'hard' | 'nightmare';
    allow18Plus: boolean;
    mobileMode: 'on' | 'off';
    contextTurns: 'short' | 'medium' | 'long' | 'auto';
    showSuccessChance: boolean;
    benefitRiskAsTooltip: boolean;
    autoHideFooter: boolean;
    imageCompressionQuality: 'high' | 'medium' | 'low' | 'off';
    visibleButtons: Record<string, boolean>;
    showAiButton: boolean;
    disableAllImageGeneration: boolean;

    colorPalette: string;
    accentPrimary: string;
    accentSecondary: string;

    autoGenerateStoryImages: boolean;
    storyImageProvider: 'google' | 'openrouter';
    storyImageStyle: string;
    storyImageModel: 'imagen' | 'gemini-2.5-flash-image-preview';
    storyImageOpenRouterModule: string;

    autoGenerateNpcAvatars: boolean;
    npcAvatarProvider: 'google' | 'openrouter';
    npcAvatarStyle: string;
    npcAvatarModel: 'imagen' | 'gemini-2.5-flash-image-preview';
    npcAvatarOpenRouterModule: string;

    predictiveInference: boolean;
    enableWorldHealing: boolean;

    enableTTS: boolean;
    ttsVoiceURI: string;
    ttsRate: number;
    ttsPitch: number;
    
    storyTendencies: StoryTendencies;
    suggestMoreActions: boolean;
    showCombatView: boolean; // Hiển thị màn hình chiến đấu (mặc định tắt)
    showEquipmentTab: boolean; // Hiện tab Trang Bị (mặc định tắt)
}

export interface GalleryImage {
    id: string;
    name: string;
    dataUrl: string;
    description: string;
    prompt?: string;
    sourceTurnId?: string;
    type?: 'character' | 'item' | 'illustration' | 'user';
}
