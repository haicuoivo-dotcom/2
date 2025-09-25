/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useRef, useEffect, useCallback } from 'react';
import * as db from '../services/db';
import { generateUniqueId } from '../utils/id';
import { useSettings } from '../components/contexts/SettingsContext';
import { ApiKeyManager } from '../services/ApiKeyManager';
import { uploadImage } from '../services/cloudinary';
import { getApiErrorMessage } from '../utils/error';
import { IMAGE_STYLES } from '../constants/gameConstants';
import type { Character, GalleryImage, AppSettings, Stat } from '../../types';

const MAX_FILE_SIZE_MB = 10;
type GoogleImageModel = AppSettings['npcAvatarModel'];

interface UseAvatarEditorProps {
    character?: Character;
    item?: Stat;
    onClose: () => void;
    onSave: (newUrl: string) => void;
    // FIX: Add missing props to handle toasts and API counting.
    addToast: (message: string, type?: 'info' | 'success' | 'error' | 'warning', details?: any) => void;
    incrementApiRequestCount: () => void;
}

export const useAvatarEditor = ({ character, item, onClose, onSave, addToast, incrementApiRequestCount }: UseAvatarEditorProps) => {
    const [activeTab, setActiveTab] = useState('upload');
    const [urlInput, setUrlInput] = useState('');
    const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
    const [isLoadingGallery, setIsLoadingGallery] = useState(true);
    const { settings } = useSettings();
    
    // State for AI Generation
    const [prompt, setPrompt] = useState('');
    const [numImages, setNumImages] = useState(1);
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedImages, setGeneratedImages] = useState<string[]>([]);
    const [style, setStyle] = useState(IMAGE_STYLES[1].value);
    const [selectedModel, setSelectedModel] = useState<GoogleImageModel>(settings.npcAvatarModel);
    
    // State for AI Editing
    const [editText, setEditText] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [editResults, setEditResults] = useState<{ textResponse: string | null, imageUrls: string[] }>({ textResponse: null, imageUrls: [] });

    const fileInputRef = useRef<HTMLInputElement>(null);
    const isMounted = useRef(true);

    useEffect(() => {
        isMounted.current = true;
        
        const loadGallery = async () => {
            setIsLoadingGallery(true);
            try {
                const images = await db.getAllImages();
                if(isMounted.current) {
                    setGalleryImages(images.reverse());
                    const hasImage = character?.avatarUrl || item?.imageUrl;
                    
                    if (settings.disableAllImageGeneration) {
                        if (images.length > 0) {
                            setActiveTab('gallery');
                        } else {
                            setActiveTab('upload');
                        }
                    } else {
                        if (images.length > 0 && !hasImage) {
                            setActiveTab('gallery');
                        } else if (hasImage) {
                            setActiveTab('ai-edit');
                        } else {
                            setActiveTab('upload');
                        }
                    }
                }
            } catch (err) {
                addToast("Không thể tải ảnh từ thư viện.", 'error', err);
                setActiveTab('upload');
            } finally {
                if(isMounted.current) setIsLoadingGallery(false);
            }
        };
        loadGallery();
        return () => { isMounted.current = false; };
    }, [addToast, character, item, settings.disableAllImageGeneration]);
    
    useEffect(() => {
        if (activeTab === 'ai') {
            let constructedPrompt = '';
            if (character) {
                const { displayName, physicalAppearance, currentOutfit, personalityAndMannerisms, stats } = character;
                const gender = stats?.find(s => s.name === 'Giới tính')?.value || '';
                const species = stats?.find(s => s.name === 'Chủng tộc')?.value || '';
                const age = stats?.find(s => s.name === 'Tuổi')?.value || '';
                const mood = stats?.find(s => s.name === 'Tâm trạng')?.value || '';
                const artisticKeywords = "cinematic portrait photography, ultra-realistic, professional color grading, sharp focus, 8k";
                
                const promptParts = [
                    artisticKeywords,
                    displayName,
                    gender,
                    species,
                    (age ? `${age} tuổi` : ''),
                    (mood ? `trạng thái ${mood}` : ''),
                    physicalAppearance,
                    `mặc ${currentOutfit}`,
                    personalityAndMannerisms,
                ];
                
                constructedPrompt = promptParts.filter(Boolean).join(', ');
            } else if (item) {
                const { name, description, rarity, tags } = item;
                const artisticKeywords = "cinematic still life photography of a magical item, detailed, professional color grading, sharp focus, 8k";
                const promptParts = [ artisticKeywords, name, description, rarity, ...(tags || []) ];
                constructedPrompt = promptParts.filter(Boolean).join(', ');
            }
            setPrompt(constructedPrompt);
        }
    }, [character, item, activeTab]);

    const handleImageSelect = useCallback((url: string) => {
        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.src = url;
        img.onload = () => {
            onSave(url);
            onClose();
        };
        img.onerror = (e) => {
            addToast('Không thể tải ảnh từ URL được cung cấp. Vui lòng kiểm tra lại URL và đảm bảo nó cho phép truy cập chéo (CORS).', 'error', e);
        }
    }, [onSave, onClose, addToast]);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
            addToast(`Tệp "${file.name}" quá lớn (tối đa ${MAX_FILE_SIZE_MB}MB).`, 'error');
            return;
        }

        try {
            addToast('Đang tải ảnh lên Cloudinary, vui lòng chờ...', 'info');
            const cloudinaryUrl = await uploadImage(file);
            handleImageSelect(cloudinaryUrl);
        } catch (err) {
            const message = err instanceof Error ? err.message : "Lỗi không xác định";
            addToast(`Tải ảnh lên thất bại: ${message}`, 'error', err);
            console.error(err);
        } finally {
             if(e.target) e.target.value = '';
        }
    };

    const handleUrlSave = () => {
        if (urlInput.trim()) {
            handleImageSelect(urlInput.trim());
        }
    };

    const handleGenerate = async () => {
        if (!prompt.trim() || isGenerating) return;
        setIsGenerating(true);
        setGeneratedImages([]);
        const finalPrompt = style ? `${prompt.trim()}, ${style}` : prompt.trim();
        try {
            const context = character ? 'npc_avatar' : 'item';
            const images = await ApiKeyManager.generateImagesWithRetry(
                finalPrompt,
                numImages,
                addToast,
                incrementApiRequestCount,
                context,
                settings.npcAvatarProvider === 'google' ? selectedModel : undefined
            );
            if (isMounted.current) {
                setGeneratedImages(images);
            }
        } catch(err) {
            const userFriendlyError = getApiErrorMessage(err, "tạo ảnh");
            addToast(userFriendlyError, 'error', err);
        } finally {
            if (isMounted.current) {
                setIsGenerating(false);
            }
        }
    };

    const handleEdit = async () => {
        const sourceImageUrl = character?.avatarUrl || item?.imageUrl;
        if (!sourceImageUrl || !editText.trim() || isEditing) return;
        setIsEditing(true);
        setEditResults({ textResponse: null, imageUrls: [] });
        try {
            const response = await fetch(sourceImageUrl);
            const blob = await response.blob();
            const reader = new FileReader();
            reader.readAsDataURL(blob);
            reader.onloadend = async () => {
                const base64data = reader.result as string;
                const results = await ApiKeyManager.editImageWithAi(
                    base64data,
                    blob.type,
                    editText,
                    addToast,
                    incrementApiRequestCount
                );
                if (isMounted.current) {
                    setEditResults(results);
                }
            };
        } catch (err) {
            const userFriendlyError = getApiErrorMessage(err, "chỉnh sửa ảnh");
            addToast(userFriendlyError, 'error', err);
        } finally {
            if (isMounted.current) {
                setIsEditing(false);
            }
        }
    };
    
    return {
        activeTab,
        setActiveTab,
        urlInput,
        setUrlInput,
        galleryImages,
        isLoadingGallery,
        settings,
        prompt,
        setPrompt,
        numImages,
        setNumImages,
        isGenerating,
        generatedImages,
        style,
        setStyle,
        selectedModel,
        setSelectedModel,
        editText,
        setEditText,
        isEditing,
        editResults,
        fileInputRef,
        handleImageSelect,
        handleFileChange,
        handleUrlSave,
        handleGenerate,
        handleEdit,
    };
};
