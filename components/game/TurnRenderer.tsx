/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useMemo } from 'react';
import { InlineStoryRenderer, StoryRenderer } from './StoryRenderer';
import { StoryImage } from './StoryImage';
import { useWorldData, usePlayerCharacter } from '../contexts/GameContext';
import { DialogueBubble } from './DialogueBubble';
import type { Turn, GameState } from '../../types';

interface TurnRendererProps {
    turn: Turn;
    onEntityClick: (event: React.MouseEvent, name: string, type: string) => void;
    onEntityMouseEnter: (event: React.MouseEvent, name: string, type: string) => void;
    onEntityMouseLeave: () => void;
    onEntityDoubleClick: (event: React.MouseEvent, name: string, type: string) => void;
    onAvatarClick: (characterName: string) => void;
}

export const TurnRenderer = React.memo(({ turn, onEntityClick, onEntityMouseEnter, onEntityMouseLeave, onEntityDoubleClick, onAvatarClick }: TurnRendererProps) => {
    const worldData = useWorldData();
    const playerCharacterData = usePlayerCharacter();

    // Reconstruct a minimal gameState for the renderer.
    const gameState = useMemo(() => {
        if (!playerCharacterData || !worldData) return null;
        return {
            character: playerCharacterData.character,
            knowledgeBase: worldData.knowledgeBase,
        };
    }, [playerCharacterData, worldData]);

    if (!gameState || !worldData) {
        return null;
    }

    // Renders the player's chosen action in a distinct style, separate from dialogue bubbles.
    const renderChosenAction = (actionText: string | null | undefined) => {
        if (!actionText) return null;
    
        // The entire chosen action is rendered in a distinct container to differentiate it from spoken dialogue.
        return (
            <div className="chosen-action-container">
                <InlineStoryRenderer
                    text={actionText}
                    gameState={gameState as GameState}
                    onEntityClick={onEntityClick}
                    onEntityMouseEnter={onEntityMouseEnter}
                    onEntityMouseLeave={onEntityMouseLeave}
                    onEntityDoubleClick={onEntityDoubleClick}
                />
            </div>
        );
    };


    return (
        <div className="turn-container">
            {renderChosenAction(turn.chosenAction)}
            <StoryRenderer text={turn.story} gameState={gameState as GameState} onEntityClick={onEntityClick} onAvatarClick={onAvatarClick} onEntityMouseEnter={onEntityMouseEnter} onEntityMouseLeave={onEntityMouseLeave} onEntityDoubleClick={onEntityDoubleClick} />

            {turn.messages && turn.messages.length > 0 && (
                <div className="turn-messages">
                    <ul>
                        {turn.messages.map(msg => 
                            <li key={msg.id}>
                                <InlineStoryRenderer text={msg.text} gameState={gameState as GameState} onEntityClick={onEntityClick} onEntityMouseEnter={onEntityMouseEnter} onEntityMouseLeave={onEntityMouseLeave} onEntityDoubleClick={onEntityDoubleClick} />
                            </li>
                        )}
                    </ul>
                </div>
            )}
            <StoryImage turn={turn} />
        </div>
    );
});
