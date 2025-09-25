/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect, useCallback } from 'react';
import { useGameContext } from '../contexts/GameContext';
import { useSettings } from '../contexts/SettingsContext';
import { useAppContext } from '../contexts/AppContext';
import { ApiKeyManager } from '../../services/ApiKeyManager';
import * as db from '../../services/db';
import { generateUniqueId } from '../../utils/id';
import { stripEntityTags } from '../../utils/text';
import { getApiErrorMessage } from '../../utils/error';
import type { Turn, GalleryImage, Character } from '../../types';

interface StoryImageProps {
    turn: Turn;
}

export const StoryImage = ({ turn }: StoryImageProps) => {
    const { gameState, dispatch } = useGameContext();
    const { addToast, incrementApiRequestCount } = useAppContext();
    const { settings } = useSettings();
    
    const [isLoading, setIsLoading] = useState(false);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const findImage = useCallback(async () => {
        if (turn.generatedImageId) {
            try {
                const image = await db.getImageById(turn.generatedImageId);
                if (image) {
                    setImageUrl(image.dataUrl);
                }
            } catch (err) {
                console.error("Failed to load image for turn:", err);
            }
        }
    }, [turn.generatedImageId]);

    useEffect(() => {
        findImage();
    }, [findImage]);

    const handleGenerateImage = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            // Find NPCs in scene
            const npcNames = new Set<string>();
            const npcRegex = /\[NPC:([^\]]+)\]/g;
            let match;
            while ((match = npcRegex.exec(turn.story)) !== null) {
                npcNames.add(match[1]);
            }
            const npcsInScene = gameState.knowledgeBase.npcs.filter(npc => npcNames.has(npc.name));
            
            // 1. Generate Prompt locally
            const imagePrompt = ApiKeyManager.generateLocalImagePrompt(
                turn.story,
                gameState.worldSummary,
                gameState.character,
                npcsInScene,
                settings.storyImageStyle
            );

            // 2. Generate Image using the selected model from settings
            const generatedImagesData = await ApiKeyManager.generateImagesWithRetry(
                imagePrompt, 1, addToast, incrementApiRequestCount, 'story'
            );

            if (!generatedImagesData || generatedImagesData.length === 0) {
                throw new Error("AI did not return any images.");
            }

            const imageDataUrl = generatedImagesData[0];
            
            // 3. Save to Gallery
            const newImage: GalleryImage = {
                id: generateUniqueId('img-story'),
                name: `Cảnh từ lượt #${gameState.turns.findIndex(t => t.id === turn.id) + 1}`,
                dataUrl: imageDataUrl,
                description: `Minh họa cho hành động: "${stripEntityTags(turn.chosenAction)}"`,
                prompt: imagePrompt,
                sourceTurnId: turn.id,
                type: 'illustration',
            };

            await db.addOrUpdateImage(newImage);

            // 4. Update Turn State
            dispatch({ type: 'UPDATE_TURN', payload: { turnId: turn.id, updates: { generatedImageId: newImage.id } } });

            // 5. Update UI
            setImageUrl(imageDataUrl);

        } catch (err) {
            const userFriendlyError = getApiErrorMessage(err, "minh họa cảnh");
            setError(userFriendlyError);
            addToast(userFriendlyError, 'error');
        } finally {
            setIsLoading(false);
        }
    }, [turn.id, turn.story, turn.chosenAction, gameState, dispatch, addToast, incrementApiRequestCount, settings.storyImageStyle]);

    useEffect(() => {
        const isLatestTurn = gameState.turns[gameState.turns.length - 1]?.id === turn.id;
        if (settings.autoGenerateStoryImages && !settings.disableAllImageGeneration && !turn.generatedImageId && !isLoading && !imageUrl && isLatestTurn) {
            handleGenerateImage();
        }
    }, [turn.id, turn.generatedImageId, settings.autoGenerateStoryImages, settings.disableAllImageGeneration, isLoading, imageUrl, handleGenerateImage, gameState.turns]);
    
    if (settings.disableAllImageGeneration) {
        return null;
    }

    if (imageUrl) {
        return (
            <div className="story-image-container generated">
                <img src={imageUrl} alt={`Illustration for the scene`} className="story-image" />
            </div>
        );
    }
    
    if (isLoading) {
        return (
            <div className="story-image-loader">
                <div className="spinner spinner-md"></div>
                <span>AI đang vẽ tranh...</span>
            </div>
        );
    }

    if (error) {
        return <div className="story-image-error">{error}</div>;
    }
    
    return (
        <div className="story-image-container">
            <button
                className="generate-story-image-btn"
                onClick={handleGenerateImage}
            >
                🎨 Minh họa cảnh này bằng AI
            </button>
            <p className="api-cost-notice">Chi phí: ~1 Yêu cầu API (tạo ảnh)</p>
        </div>
    );
};