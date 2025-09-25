/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSettings } from '../components/contexts/SettingsContext';
import { useToasts } from '../components/contexts/ToastContext';
import { hydrateWorldSettings } from '../utils/hydration';
import { WC_FORM_DATA_KEY, INITIAL_WC_FORM_DATA, GENRE_SETTING_MAP, STORY_TEMPLATES, GENRE_CORE_STATS } from '../constants/gameConstants';
// FIX: Import PERSONALITY_TRAITS_LIBRARY and PersonalityTrait to handle the refactored personality logic.
import { PERSONALITY_TRAITS_LIBRARY } from '../constants/personalityTraits';
import type { WorldSettings, Stat, PersonalityTrait } from '../types';

export const useWorldCreatorForm = () => {
    const { settings } = useSettings();
    const { addToast } = useToasts();
    
    const [formData, setFormData] = useState<WorldSettings>(() => {
        try {
            const savedData = localStorage.getItem(WC_FORM_DATA_KEY);
            if (savedData) {
                const parsedData = JSON.parse(savedData);
                const hydrated = hydrateWorldSettings({ ...INITIAL_WC_FORM_DATA, ...parsedData });
                hydrated.equipFullSet = true; // This is now mandatory.

                // NEW: Filter out deprecated stats from old saved form data.
                if (hydrated.stats && Array.isArray(hydrated.stats)) {
                    hydrated.stats = hydrated.stats.filter(stat => stat.name !== 'Độ no' && stat.name !== 'Năng lượng');
                }

                return hydrated;
            }
        } catch (error) {
            console.error("Failed to load or parse world creator form data:", error);
        }
        
        // Nếu không có dữ liệu đã lưu, sử dụng cài đặt toàn cục làm mặc định ban đầu.
        return hydrateWorldSettings({
            ...INITIAL_WC_FORM_DATA,
            writingStyle: settings.writingStyle,
            narrativeVoice: settings.narrativeVoice,
            difficulty: settings.difficulty,
            allow18Plus: settings.allow18Plus,
        });
    });

    useEffect(() => {
        const handler = window.setTimeout(() => {
            try {
                localStorage.setItem(WC_FORM_DATA_KEY, JSON.stringify(formData));
            } catch (error) {
                console.error("Failed to save world creator form data:", error);
            }
        }, 500);

        return () => window.clearTimeout(handler);
    }, [formData]);

    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;

        // FIX: Intercept the deprecated 'personalityOuter' input to update the new 'personalityTraits' array.
        if (name === 'personalityOuter') {
            setFormData(prev => {
                const traitName = value;
                let newTraits: PersonalityTrait[] = [];
                if (traitName !== 'ai' && traitName !== 'Để AI quyết định') {
                    const flatTraitLibrary = Object.values(PERSONALITY_TRAITS_LIBRARY).flat();
                    const foundTrait = flatTraitLibrary.find(t => t.name === traitName);
                    if (foundTrait) {
                        newTraits = [foundTrait];
                    }
                }
                return { ...prev, personalityTraits: newTraits };
            });
            return;
        }

        setFormData(prev => {
            const updatedValue = type === 'checkbox' ? checked : value;
            let newState: WorldSettings = { ...prev, [name]: updatedValue };

            // If user changes the main genre dropdown, sync the core stats but preserve other customizations.
            if (name === 'genre') {
                const newGenre = value;
                const currentStats = newState.stats || [];
                const newCoreStatsTemplate = GENRE_CORE_STATS[newGenre] || GENRE_CORE_STATS.Default;
                
                const nonAttributeStats = currentStats.filter(s => s.category !== 'Thuộc tính');
                // FIX: Added explicit type cast to Stat[] to resolve 'unknown' type error. This is safe because GENRE_CORE_STATS is now correctly defined.
                const allCoreStatIds = new Set(Object.values(GENRE_CORE_STATS).flat().map(s => (s as Stat).id));
                const customUserAttributes = currentStats.filter(s => s.category === 'Thuộc tính' && !allCoreStatIds.has(s.id!));
                
                const currentUserCoreStatsMap = new Map(
                    currentStats
                        .filter(s => s.category === 'Thuộc tính' && allCoreStatIds.has(s.id!))
                        .map(s => [s.id, s])
                );

                const newCoreStats = newCoreStatsTemplate.map(templateStat => {
                    const userModifiedStat = currentUserCoreStatsMap.get(templateStat.id);
                    if (userModifiedStat && userModifiedStat.name === templateStat.name) {
                        return userModifiedStat;
                    }
                    return templateStat;
                });
                
                const newTotalStats = [...newCoreStats, ...customUserAttributes, ...nonAttributeStats];

                // Logic to reset setting and templateIdea if they are not compatible
                const validSettings = GENRE_SETTING_MAP[newGenre] || [];
                let newSetting = newState.setting;
                if (!validSettings.includes(newSetting)) {
                    newSetting = validSettings[0] || '';
                }
            
                let newTemplateIdea = newState.templateIdea;
                if (newTemplateIdea) {
                    let isTemplateValid = false;
                    const currentSetting = newSetting;
                    if (newGenre === 'Trống') {
                        isTemplateValid = true;
                    } else {
                         for (const category in STORY_TEMPLATES) {
                            const template = STORY_TEMPLATES[category].find(t => t.idea === newTemplateIdea);
                            if (template) {
                                const genreMatch = template.genres.includes(newGenre);
                                const settingMatch = !template.settings || template.settings.length === 0 || currentSetting === 'Trống' || template.settings.includes(currentSetting);
                                if (genreMatch && settingMatch) {
                                    isTemplateValid = true;
                                }
                                break;
                            }
                        }
                    }
                    if (!isTemplateValid) {
                        newTemplateIdea = '';
                    }
                }

                newState = {
                    ...newState,
                    stats: newTotalStats,
                    setting: newSetting,
                    templateIdea: newTemplateIdea,
                };
            }

            // If user types in the idea box, clear the template selection
            if (name === 'idea') {
                newState.templateIdea = '';
            }

            return newState;
        });
    }, [setFormData]);

    const handleStoryTemplateChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        if (value === '') {
            setFormData(prev => ({
                ...prev,
                templateIdea: '',
            }));
            return;
        }

        const [selectedCategory, selectedLabel] = value.split('::');
        const templatesInCategory = STORY_TEMPLATES[selectedCategory];
        if (templatesInCategory) {
            const template = templatesInCategory.find(t => t.label === selectedLabel);
            if (template) {
                setFormData(prev => ({
                    ...prev,
                    idea: '', 
                    templateIdea: template.idea,
                }));
            }
        }
    }, [setFormData]);
    
    const handleRefresh = useCallback(() => {
        // Khi làm mới, cũng reset về cài đặt toàn cục
        const wipedData = { 
            ...INITIAL_WC_FORM_DATA,
            writingStyle: settings.writingStyle,
            narrativeVoice: settings.narrativeVoice,
            difficulty: settings.difficulty,
            allow18Plus: settings.allow18Plus,
        };
        setFormData(wipedData);
    }, [settings]);
    
    return {
        formData,
        setFormData,
        handleInputChange,
        handleStoryTemplateChange,
        handleRefresh,
    };
};