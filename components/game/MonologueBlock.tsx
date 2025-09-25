/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState } from 'react';
import type { GameState } from '../../types';
import { InlineStoryRenderer } from './StoryRenderer';

interface MonologueBlockProps {
    children: React.ReactNode;
    speakerName?: string;
    avatarUrl?: string;
    speakerDisplayName?: string;
    onAvatarClick?: (characterName: string) => void;
}

const UnmemoizedMonologueBlock = ({ children, speakerName, avatarUrl, speakerDisplayName, onAvatarClick }: MonologueBlockProps) => {
    const [imageError, setImageError] = useState(false);
    const characterInitial = speakerDisplayName ? speakerDisplayName.charAt(0).toUpperCase() : '?';
    const showImage = avatarUrl && !imageError;

    return (
        <div className="monologue-container">
            <div className="dialogue-avatar" onClick={() => speakerName && onAvatarClick?.(speakerName)}>
                {showImage ? (
                    <img 
                        src={avatarUrl} 
                        alt={speakerDisplayName || 'Avatar'} 
                        className="dialogue-avatar-img" 
                        onError={() => setImageError(true)}
                    />
                ) : (
                    <div className="dialogue-avatar-placeholder">
                        <span>{characterInitial}</span>
                    </div>
                )}
            </div>
            <div className="monologue-block">
                <div className="monologue-text">
                    {children}
                </div>
            </div>
        </div>
    );
};

export const MonologueBlock = React.memo(UnmemoizedMonologueBlock);