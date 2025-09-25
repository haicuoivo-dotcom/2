/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useMemo } from 'react';
import { TurnRenderer } from './TurnRenderer';
import { InlineStoryRenderer } from './StoryRenderer';
import { useWorldData, usePlayerCharacter } from '../contexts/GameContext';
import type { Turn, GameState } from '../../types';

interface GameBodyProps {
    turns: Turn[];
    onEntityClick: (event: React.MouseEvent, name: string, type: string) => void;
    onEntityMouseEnter: (event: React.MouseEvent, name: string, type: string) => void;
    onEntityMouseLeave: () => void;
    onEntityDoubleClick: (event: React.MouseEvent, name: string, type: string) => void;
    onAvatarClick: (characterName: string) => void;
}

const GameBodyComponent = React.forwardRef<HTMLDivElement, GameBodyProps>(({
    turns,
    onEntityClick,
    onEntityMouseEnter,
    onEntityMouseLeave,
    onEntityDoubleClick,
    onAvatarClick,
}, ref) => {
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

    if (!gameState) {
        return null; // or a loading spinner, but null is fine for a sub-component
    }
    
    const worldSummary = worldData?.worldSummary;

    const renderedTurns = useMemo(() => turns.map(turn => (
        <TurnRenderer 
            key={turn.id}
            turn={turn}
            onEntityClick={onEntityClick}
            onEntityMouseEnter={onEntityMouseEnter}
            onEntityMouseLeave={onEntityMouseLeave}
            onEntityDoubleClick={onEntityDoubleClick}
            onAvatarClick={onAvatarClick}
        />
    )), [turns, onEntityClick, onEntityMouseEnter, onEntityMouseLeave, onEntityDoubleClick, onAvatarClick]);

    const showIntroElements = turns.length === 1 && turns[0].chosenAction === null;

    return (
        <main className="game-body" ref={ref}>
            {showIntroElements && worldSummary && (
                <div className="world-summary-container">
                    <h3>Bối Cảnh Thế Giới</h3>
                    <p>
                        <InlineStoryRenderer 
                            text={worldSummary} 
                            gameState={gameState as GameState} 
                            onEntityClick={onEntityClick} 
                            onEntityMouseEnter={onEntityMouseEnter}
                            onEntityMouseLeave={onEntityMouseLeave}
                            onEntityDoubleClick={onEntityDoubleClick}
                        />
                    </p>
                </div>
            )}
            {renderedTurns}
        </main>
    );
});

export const GameBody = React.memo(GameBodyComponent);