/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState } from 'react';

interface DialogueBubbleProps {
    children: React.ReactNode;
    isPlayer: boolean;
    speakerName?: string;
    avatarUrl?: string;
    speakerDisplayName?: string;
    onAvatarClick?: (characterName: string) => void;
    emotion?: string;
}

const emotionToEmojiMap: Record<string, string> = {
    // Positive Emotions
    'vui vẻ': '😊', 'hạnh phúc': '😄', 'cười': '😆', 'hân hoan': '🎉',
    'yêu thích': '😍', 'ngưỡng mộ': '🤩', 'hài lòng': '😌', 'tự hào': '😌',
    'nhẹ nhõm': '😅', 'hy vọng': '🙏', 'thích thú': '😃',

    // Negative Emotions
    'buồn': '😢', 'thất vọng': '😞', 'đau khổ': '😭', 'cô đơn': '😔',
    'tức giận': '😠', 'phẫn nộ': '😡', 'khó chịu': '😤',
    'sợ hãi': '😨', 'kinh hoàng': '😱', 'lo lắng': '😟',
    'ghê tởm': '🤢', 'khinh bỉ': '😒',

    // Surprise Emotions
    'ngạc nhiên': '😮', 'sốc': '😲', 'kinh ngạc': '🤯',

    // Neutral/Complex Emotions
    'xấu hổ': '😳', 'ngượng ngùng': '😊', 'bối rối': '😕',
    'tò mò': '🤔', 'suy tư': ' contemplative',
    'nháy mắt': '😉', 'tinh nghịch': '😜',
    'lạnh lùng': '😐', 'nghiêm túc': '🧐', 'bí ẩn': '🤫',
    'mệt mỏi': '😩', 'buồn ngủ': '😴',
};


const UnmemoizedDialogueBubble = ({ children, isPlayer, speakerName, avatarUrl, speakerDisplayName, onAvatarClick, emotion }: DialogueBubbleProps) => {
    const [imageError, setImageError] = useState(false);
    const characterInitial = speakerDisplayName ? speakerDisplayName.charAt(0).toUpperCase() : '?';
    const showImage = avatarUrl && !imageError;

    const emoji = emotion ? emotionToEmojiMap[emotion.toLowerCase()] : null;

    return (
        <div className={`dialogue-container ${isPlayer ? 'player-container' : 'npc-container'}`}>
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
            <div className={`dialogue-bubble ${isPlayer ? 'player' : 'npc'}`}>
                <div className="dialogue-text">
                    {emoji && <span className="dialogue-emotion-emoji" role="img" aria-label={emotion}>{emoji}</span>}
                    {!isPlayer && speakerDisplayName && (
                        <strong className="dialogue-speaker">
                            {speakerDisplayName}
                            {speakerName && speakerDisplayName !== speakerName && ` (${speakerName})`}
                            : </strong>
                    )}
                    {children}
                </div>
            </div>
        </div>
    );
};


export const DialogueBubble = React.memo(UnmemoizedDialogueBubble);