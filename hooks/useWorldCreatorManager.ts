/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
// FIX: Add React import to resolve namespace error.
import { useState, useRef, useEffect, useCallback } from 'react';
import { useToasts } from '../components/contexts/ToastContext';
import { useAppContext } from '../components/contexts/AppContext';
import { useWorldCreatorForm } from './useWorldCreatorForm';
import { useWorldSuggester } from './useWorldSuggester';
import { useWorldCreator } from './useWorldCreator';
import { generateUniqueId } from '../utils/id';
import { removeAccents } from '../utils/text';
import { hydrateWorldSettings } from '../utils/hydration';
import { ApiKeyManager } from '../services/ApiKeyManager';
import { getApiErrorMessage } from '../utils/error';
import { extractJsonFromString, stripThinkingBlock } from '../utils/text';
import { FANFIC_CHARACTER_EXTRACTION_RULES, FANFIC_SYSTEM_ANALYSIS_RULES, STARTING_POINT_SUGGESTION_RULES } from '../constants/aiConstants';
import { FANFIC_CHARACTER_EXTRACTION_SCHEMA, FANFIC_SYSTEM_ANALYSIS_SCHEMA, STARTING_POINT_SUGGESTION_SCHEMA } from '../constants/schemas';
import type { WorldSettings, GameState, LoreRule, FanficSystemAnalysis, PersonalityTrait } from '../types';

interface FanficAnalysisItem {
    type: string;
    name: string;
    description: string;
    importance: number;
    details?: string;
}

interface StartingPointSuggestion {
    scene: string;
    description: string;
    mood: string;
    suggestedCharacters?: string[];
}

interface WorldCreatorManagerProps {
    onCreateWorld: (gameState: GameState, worldSettings: WorldSettings) => void;
}

const FANFIC_TEXT_LIMIT = 200 * 1024; // 200KB limit

export const useWorldCreatorManager = ({ onCreateWorld }: WorldCreatorManagerProps) => {
    const { addToast } = useToasts();
    const { incrementApiRequestCount } = useAppContext();
    
    // Form State Management
    const {
        formData,
        setFormData,
        handleInputChange,
        handleStoryTemplateChange,
        handleRefresh: refreshForm,
    } = useWorldCreatorForm();
    
    // UI & File Management State
    const [fanficContent, setFanficContent] = useState<string | null>(null);
    const [fanficCharOption, setFanficCharOption] = useState<'main' | 'new'>('main');
    const [isQuickCreate, setIsQuickCreate] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showLoreModal, setShowLoreModal] = useState(false);
    const importFileRef = useRef<HTMLInputElement>(null);
    const [openSections, setOpenSections] = useState({ context: true, character: true });
    const [isSuggestionPanelOpen, setIsSuggestionPanelOpen] = useState(false);
    const [isTraitPickerOpen, setIsTraitPickerOpen] = useState(false);
    const [suggestionConfig, setSuggestionConfig] = useState({
        skills: 3,
        items: 2,
        relationships: 1,
    });
    const [isAnalyzingFanfic, setIsAnalyzingFanfic] = useState(false);
    const [fanficAnalysisTime, setFanficAnalysisTime] = useState(0);
    const [fanficAnalysisResult, setFanficAnalysisResult] = useState<FanficAnalysisItem[] | null>(null);
    const isMounted = useRef(true);

    const [isAnalyzingSystem, setIsAnalyzingSystem] = useState(false);
    const [systemAnalysisTime, setSystemAnalysisTime] = useState(0);
    const [fanficSystemAnalysis, setFanficSystemAnalysis] = useState<FanficSystemAnalysis | null>(formData.fanficSystemAnalysis || null);

    // NEW State for starting point suggestions
    const [isSuggestingStartingPoints, setIsSuggestingStartingPoints] = useState(false);
    const [startingPointSuggestions, setStartingPointSuggestions] = useState<StartingPointSuggestion[] | null>(null);

    useEffect(() => {
        isMounted.current = true;
        return () => { isMounted.current = false; };
    }, []);

    // Suggestion Logic (Hook)
    const { isGeneratingContext, isGeneratingChar, handleSuggestWorldSummary, handleSuggestCharacter: suggestCharacterFromHook, contextSuggestionTime, charSuggestionTime } = useWorldSuggester({
        formData, setFormData, addToast, incrementApiRequestCount, setError
    });
    
    // Creation Logic (Hook)
    const { isCreating, creationMessage, creationTimeElapsed, creationSuccess, handleInitiateCreation: initiateCreationFromHook } = useWorldCreator({
        onCreateWorld, addToast, incrementApiRequestCount, setError, setFormData
    });

    const handleSuggestCharacter = useCallback(() => {
        suggestCharacterFromHook(suggestionConfig);
        setIsSuggestionPanelOpen(false);
    }, [suggestCharacterFromHook, suggestionConfig]);
    
    useEffect(() => {
        return () => {
            if (!creationSuccess.current) {
                addToast("Tiến trình tạo thế giới của bạn đã được lưu tự động.", 'info');
            }
        };
    }, [addToast, creationSuccess]);

    useEffect(() => {
        if (isAnalyzingFanfic) {
            setFanficAnalysisTime(0);
            const timer = window.setInterval(() => {
                setFanficAnalysisTime(prev => prev + 1);
            }, 1000);
            
            return () => clearInterval(timer);
        }
    }, [isAnalyzingFanfic, setFanficAnalysisTime]);

     useEffect(() => {
        if (isAnalyzingSystem) {
            setSystemAnalysisTime(0);
            const timer = window.setInterval(() => {
                setSystemAnalysisTime(prev => prev + 1);
            }, 1000);
            
            return () => clearInterval(timer);
        }
    }, [isAnalyzingSystem, setSystemAnalysisTime]);

    const handleSuggestStartingPoints = useCallback(async (content: string) => {
        if (!isMounted.current) return;
        setIsSuggestingStartingPoints(true);
        setError(null);
        try {
            const prompt = `**Văn bản Đồng nhân:**\n"""\n${content.slice(0, 100000)}\n"""\n\n${STARTING_POINT_SUGGESTION_RULES}`;
            const response = await ApiKeyManager.generateContentWithRetry({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: STARTING_POINT_SUGGESTION_SCHEMA,
                }
            }, addToast, incrementApiRequestCount, () => {});

            const result = await extractJsonFromString(stripThinkingBlock(response.text));
            if (isMounted.current && result?.suggestions) {
                setStartingPointSuggestions(result.suggestions);
            } else {
                throw new Error("AI không trả về gợi ý điểm khởi đầu hợp lệ.");
            }
        } catch (error) {
            if (isMounted.current) {
                console.error("Failed to suggest starting points:", error);
            }
        } finally {
            if (isMounted.current) {
                setIsSuggestingStartingPoints(false);
            }
        }
    }, [addToast, incrementApiRequestCount, setError]);

    const handleAnalyzeFanficSystem = useCallback(async () => {
        const content = fanficContent || formData.idea;
        if (!content) {
            addToast("Vui lòng dán hoặc tải lên nội dung trước.", 'warning');
            return;
        }
        
        setIsAnalyzingSystem(true);
        setError(null);
        setStartingPointSuggestions(null);

        try {
            const prompt = `**Văn bản Đồng nhân:**\n"""\n${content.slice(0, 100000)}\n"""\n\n${FANFIC_SYSTEM_ANALYSIS_RULES}`;
            const response = await ApiKeyManager.generateContentWithRetry({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: FANFIC_SYSTEM_ANALYSIS_SCHEMA,
                }
            }, addToast, incrementApiRequestCount, () => {});

            const result = await extractJsonFromString(stripThinkingBlock(response.text));
            if (isMounted.current && result) {
                setFanficSystemAnalysis(result as FanficSystemAnalysis);
                addToast("Phân tích hệ thống thành công!", 'success');
                await handleSuggestStartingPoints(content);
            } else {
                throw new Error("AI không trả về hệ thống hợp lệ.");
            }
        } catch (error) {
            if (isMounted.current) {
                const userFriendlyError = getApiErrorMessage(error, "phân tích hệ thống đồng nhân");
                setError(userFriendlyError);
            }
        } finally {
            if (isMounted.current) {
                setIsAnalyzingSystem(false);
            }
        }
    }, [fanficContent, formData.idea, addToast, incrementApiRequestCount, setError, handleSuggestStartingPoints]);

    const handleAnalyzeFanfic = useCallback(async () => {
        const content = fanficContent || formData.idea;
        if (!content) {
            addToast("Vui lòng dán hoặc tải lên nội dung đồng nhân trước khi phân tích.", 'warning');
            return;
        }
        
        setIsAnalyzingFanfic(true);
        setError(null);

        try {
            const prompt = `**Văn bản Đồng nhân:**\n"""\n${content.slice(0, 50000)}\n"""\n\n${FANFIC_CHARACTER_EXTRACTION_RULES}`;
            const response = await ApiKeyManager.generateContentWithRetry({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: FANFIC_CHARACTER_EXTRACTION_SCHEMA,
                }
            }, addToast, incrementApiRequestCount, () => {});

            const result = await extractJsonFromString(stripThinkingBlock(response.text));
            if (isMounted.current && result?.characters) {
                setFanficAnalysisResult(result.characters);
            } else {
                throw new Error("AI không trả về danh sách nhân vật hợp lệ.");
            }
        } catch (error) {
            if (isMounted.current) {
                const userFriendlyError = getApiErrorMessage(error, "phân tích đồng nhân");
                setError(userFriendlyError);
            }
        } finally {
            if (isMounted.current) {
                setIsAnalyzingFanfic(false);
            }
        }
    }, [fanficContent, formData.idea, addToast, incrementApiRequestCount, setError]);

    const handleSelectFanficCharacter = useCallback((charName: string) => {
        setFormData(prev => ({ ...prev, name: charName }));
        setFanficAnalysisResult(null); // Close modal
        addToast(`Đã chọn "${charName}" làm nhân vật chính. Các chi tiết khác sẽ được AI điền khi tạo thế giới.`, 'success');
    }, [setFormData, addToast]);

    const handleInitiateCreation = (isQuick: boolean) => {
        const finalFormData = { ...formData, fanficSystemAnalysis: fanficSystemAnalysis };
        initiateCreationFromHook(isQuick, finalFormData, fanficContent, fanficCharOption);
    };

    const toggleSection = (sectionName: keyof typeof openSections) => {
        setOpenSections(prev => ({ ...prev, [sectionName]: !prev[sectionName] }));
    };
    
    const handleRefresh = useCallback(() => {
        refreshForm();
        setFanficContent(null);
        setFanficSystemAnalysis(null);
        setStartingPointSuggestions(null);
    }, [refreshForm]);

    const handleExportSettings = useCallback(() => {
        try {
            const exportData = {
                worldSettings: { ...formData, fanficSystemAnalysis },
                fanficContent,
                fanficCharOption,
                isQuickCreate,
            };
            const jsonString = JSON.stringify(exportData, null, 2);
            const blob = new Blob([jsonString], { type: 'application/json' });
            const unaccentedGenre = removeAccents(formData.genre || 'the_gioi');
            const sanitizedGenre = unaccentedGenre.replace(/\s+/g, '_').replace(/[^a-z0-9_]/gi, '').toLowerCase();
            const timestampStr = new Date().toISOString().slice(0, 10);
            const fileName = `kientao_${sanitizedGenre}_${timestampStr}.json`;
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            addToast(`Đã xuất tệp kiến tạo "${fileName}"!`, 'success');
        } catch (err) {
            console.error("Lỗi khi xuất kiến tạo:", err);
            const message = err instanceof Error ? err.message : "Unknown error";
            setError(`Không thể xuất tệp. Đã xảy ra lỗi: ${message}`);
            addToast("Lỗi khi xuất tệp kiến tạo.", "error");
        }
    }, [formData, fanficContent, fanficCharOption, isQuickCreate, addToast, setError, fanficSystemAnalysis]);
    
    const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const content = e.target?.result as string;
                if (!content) throw new Error("File is empty.");

                setFanficSystemAnalysis(null);
                setStartingPointSuggestions(null);

                if (file.type === "application/json") {
                    const parsedData = JSON.parse(content);
                    
                    if (parsedData.worldSettings) {
                        const hydratedData = hydrateWorldSettings(parsedData.worldSettings);
                        hydratedData.equipFullSet = true; // This is now mandatory.
                        setFormData(hydratedData);
                        setFanficContent(parsedData.fanficContent || null);
                        setFanficCharOption(parsedData.fanficCharOption || 'main');
                        setIsQuickCreate(parsedData.isQuickCreate ?? true);
                        setFanficSystemAnalysis(parsedData.worldSettings.fanficSystemAnalysis || null); // Load analysis data
                        addToast(`Đã nhập thành công kiến tạo "${file.name}"!`, 'success');
                    } else {
                        throw new Error("Invalid save file format.");
                    }
                } else if (file.type === "text/plain") {
                    if (content.length > FANFIC_TEXT_LIMIT) {
                        throw new Error(`Text file exceeds ${FANFIC_TEXT_LIMIT / 1024}KB limit.`);
                    }
                    setFanficContent(content);
                    addToast(`Đã nhập thành công đồng nhân từ "${file.name}"!`, 'success');
                    setFormData(prev => ({...prev, genre: 'Đồng nhân', idea: ''}));
                } else {
                    throw new Error("Unsupported file type.");
                }
            } catch (err) {
                const message = err instanceof Error ? err.message : "Unknown error";
                setError(`Không thể nhập tệp. Lỗi: ${message}`);
                addToast("Lỗi khi nhập tệp.", "error");
            }
        };
        reader.readAsText(file);
        if (event.target) event.target.value = '';
    }, [setFormData, addToast, setFanficContent, setError, setFanficCharOption, setIsQuickCreate]);

    const handleLoreSave = (newLoreRules: Omit<LoreRule, 'id'>[]) => {
        setFormData(prev => ({ 
            ...prev, 
            loreRules: newLoreRules.map(rule => ({ 
                ...rule, 
                id: generateUniqueId('rule'),
                isActive: true,
                text: rule.text
            })) 
        }));
        addToast("Luật lệ đã được cập nhật.", 'success');
    };
    
    const handleFanficSystemChange = useCallback((
        category: keyof FanficSystemAnalysis | `coreStats.${number}` | `keySkills.${number}` | `keyItems.${number}` | `worldRules.${number}`,
        field: 'name' | 'description',
        value: string
    ) => {
        setFanficSystemAnalysis((prev: FanficSystemAnalysis | null) => {
            if (!prev) return null;
            
            const newAnalysis = JSON.parse(JSON.stringify(prev)); // Deep copy

            if (typeof category === 'string' && category.includes('.')) {
                const [cat, indexStr] = category.split('.');
                const index = parseInt(indexStr, 10);
                if (cat && !isNaN(index)) {
                    const catArray = newAnalysis[cat as keyof FanficSystemAnalysis];
                    if (Array.isArray(catArray) && catArray[index]) {
                        catArray[index][field] = value;
                    }
                }
            } else if (category in newAnalysis) {
                const categoryObj = newAnalysis[category as keyof FanficSystemAnalysis];
                if (categoryObj && typeof categoryObj === 'object') {
                    (categoryObj as Record<string, string>)[field] = value;
                }
            }
            return newAnalysis;
        });
    }, []);

    const handleSelectStartingPoint = useCallback((suggestion: any) => {
        const suggestionText = `Bắt đầu tại ${suggestion.place}, vào thời điểm ${suggestion.time}. ${suggestion.description}`;
        setFormData(prev => ({
            ...prev,
            suggestion: suggestionText,
            idea: '', // Clear idea to prioritize suggestion
            templateIdea: '' // Clear template idea as well
        }));
        addToast('Đã áp dụng gợi ý điểm khởi đầu!', 'success');
    }, [setFormData, addToast]);

    const handlePersonalityTraitsSave = (newTraits: PersonalityTrait[]) => {
        setFormData(prev => ({ ...prev, personalityTraits: newTraits }));
        setIsTraitPickerOpen(false);
    };

    return {
        formData,
        setFormData,
        handleInputChange,
        handleStoryTemplateChange,
        handleRefresh,
        fanficContent,
        setFanficContent,
        fanficCharOption,
        setFanficCharOption,
        isQuickCreate,
        setIsQuickCreate,
        isGeneratingContext,
        isGeneratingChar,
        contextSuggestionTime,
        charSuggestionTime,
        isCreating,
        creationMessage,
        error,
        setError,
        creationTimeElapsed,
        handleSuggestWorldSummary,
        handleSuggestCharacter,
        onOpenSuggestionPanel: () => setIsSuggestionPanelOpen(true),
        isSuggestionPanelOpen,
        setIsSuggestionPanelOpen,
        isTraitPickerOpen,
        setIsTraitPickerOpen,
        handlePersonalityTraitsSave,
        suggestionConfig,
        setSuggestionConfig,
        handleInitiateCreation,
        showLoreModal,
        setShowLoreModal,
        handleLoreSave,
        importFileRef,
        openSections,
        toggleSection,
        handleExportSettings,
        handleFileChange,
        isAnalyzingFanfic,
        fanficAnalysisTime,
        fanficAnalysisResult,
        setFanficAnalysisResult,
        handleAnalyzeFanfic,
        handleSelectFanficCharacter,
        isAnalyzingSystem,
        systemAnalysisTime,
        handleAnalyzeFanficSystem,
        fanficSystemAnalysis,
        handleFanficSystemChange,
        isSuggestingStartingPoints,
        startingPointSuggestions,
        handleSelectStartingPoint,
    };
};