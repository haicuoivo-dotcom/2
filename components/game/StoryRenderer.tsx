/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useMemo } from 'react';
import { DialogueBubble } from './DialogueBubble';
import { MonologueBlock } from './MonologueBlock';
import { ReadoutBlock } from './ReadoutBlock';
import { usePlayerCharacter, useWorldData } from '../contexts/GameContext';
import { stripEntityTags } from '../../utils/text';
import type { GameState, WorldSettings, Character } from '../../types';

interface StoryRendererProps {
    text: string | null | undefined;
    gameState: GameState;
    onEntityClick: (event: React.MouseEvent, name: string, type: string) => void;
    onAvatarClick?: (characterName: string) => void;
    onEntityMouseEnter?: (event: React.MouseEvent, name: string, type: string) => void;
    onEntityMouseLeave?: () => void;
    onEntityDoubleClick?: (event: React.MouseEvent, name: string, type: string) => void;
}

const UnmemoizedInlineStoryRenderer = ({ text, gameState, onEntityClick, onEntityMouseEnter, onEntityMouseLeave, onEntityDoubleClick }: Omit<StoryRendererProps, 'onAvatarClick'>) => {
    // OPTIMIZATION: Memoize the character list. The expensive text-parsing useMemo below
    // will now only re-run when the text or this specific list of characters changes,
    // not on every minor gameState update (like inventory or status effects changing).
    const allKnownChars = useMemo(() => {
        return [gameState.character, ...(gameState.knowledgeBase?.npcs || [])].filter(Boolean) as Character[];
    }, [gameState.character, gameState.knowledgeBase?.npcs]);

    const renderedElements = useMemo(() => {
        if (!text) return null;

        const renderTextSegment = (inputText: string, keyPrefix: string) => {
            if (!inputText || typeof inputText !== 'string') return null;
            // FIX: Clean both bracket types to prevent raw tags from ever appearing.
            const cleanedText = String(inputText).replace(/[\[\]<>]/g, '');
            return cleanedText.split(/<br\s*\/?>/gi).map((segment, index, array) => (
                <React.Fragment key={`${keyPrefix}-${index}`}>
                    {segment}
                    {index < array.length - 1 && <br />}
                </React.Fragment>
            ));
        };

        const getCharacterByFullName = (name: string) => {
            return allKnownChars.find(n => n.name === name);
        };
        
        const namesToFind = allKnownChars.flatMap(char => {
            const names = [];
            if (char.name) names.push(char.name);
            if (char.displayName && char.displayName !== char.name) names.push(char.displayName);
            return names;
        });
        // FIX: Add explicit string types to sort callback parameters to fix type inference issues.
        const uniqueNames = [...new Set(namesToFind)].sort((a: string, b: string) => b.length - a.length);
        const nameRegexString = uniqueNames.length > 0 ? `|(${uniqueNames.map(item => item.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')).join('|')})` : '';
        // FIX: Updated the regex to accept both <...> and [...] style tags from the AI, and use an OR condition for untagged names.
        const combinedRegex = new RegExp(`(<([A-Z_]+):([^>]+)>)|\\[([A-Z_]+):([^\\]]+)\\]${nameRegexString}`, 'g');
        
        const elements: React.ReactNode[] = [];
        let lastIndex = 0;
        
        // FIX: The previous filtering loop was buggy and redundant.
        // `matchAll` already provides a non-overlapping iterator. This simplifies the logic and fixes the bug.
        const matches = [...text.matchAll(combinedRegex)];
        
        if (matches.length === 0) {
            return <>{renderTextSegment(text, 'full-text')}</>;
        }

        matches.forEach((match, index) => {
            if (match.index! > lastIndex) {
                elements.push(renderTextSegment(text.substring(lastIndex, match.index), `text-${index}`));
            }

            const angleBracketMatch = match[1];
            const squareBracketMatch = match[4];
            const untaggedName = match[6];

            if (angleBracketMatch) {
                const type = match[2];
                const name = match[3];

                if (type === 'RACE') {
                    elements.push(renderTextSegment(name, `text-race-${index}`));
                } else {
                    const character = getCharacterByFullName(name);
                    const displayName = character?.displayName || name;
                    elements.push(
                        <span key={`entity-${index}`} className={`entity entity-${type.toLowerCase()}`} onClick={(e) => onEntityClick(e, name, type)} onMouseEnter={(e) => onEntityMouseEnter?.(e, name, type)} onMouseLeave={onEntityMouseLeave} onDoubleClick={(e) => onEntityDoubleClick?.(e, name, type)} role="button" tabIndex={0}>
                            {displayName}
                        </span>
                    );
                }
            } else if (squareBracketMatch) {
                const type = match[4];
                const name = match[5];
                 if (type === 'RACE') {
                    elements.push(renderTextSegment(name, `text-race-${index}`));
                } else {
                    const character = getCharacterByFullName(name);
                    const displayName = character?.displayName || name;
                    elements.push(
                        <span key={`entity-${index}`} className={`entity entity-${type.toLowerCase()}`} onClick={(e) => onEntityClick(e, name, type)} onMouseEnter={(e) => onEntityMouseEnter?.(e, name, type)} onMouseLeave={onEntityMouseLeave} onDoubleClick={(e) => onEntityDoubleClick?.(e, name, type)} role="button" tabIndex={0}>
                            {displayName}
                        </span>
                    );
                }
            } else if (untaggedName) {
                const char = allKnownChars.find(c =>
                    c.name === untaggedName ||
                    c.displayName === untaggedName
                );
                if (char) {
                    const type = char.name === gameState.character?.name ? 'PC' : 'NPC';
                    elements.push(
                        <span key={`entity-${index}`} className={`entity entity-${type.toLowerCase()}`} onClick={(e) => onEntityClick(e, char.name, type)} onMouseEnter={(e) => onEntityMouseEnter?.(e, char.name, type)} onMouseLeave={onEntityMouseLeave} onDoubleClick={(e) => onEntityDoubleClick?.(e, char.name, type)} role="button" tabIndex={0}>
                            {untaggedName}
                        </span>
                    );
                } else {
                     elements.push(renderTextSegment(untaggedName, `text-unhandled-${index}`));
                }
            }
            lastIndex = match.index! + match[0].length;
        });

        if (lastIndex < text.length) {
            elements.push(renderTextSegment(text.substring(lastIndex), 'text-last'));
        }

        return <>{elements}</>;

    }, [text, allKnownChars, onEntityClick, onEntityMouseEnter, onEntityMouseLeave, onEntityDoubleClick, gameState.character?.name]);

    return renderedElements;
};
export const InlineStoryRenderer = React.memo(UnmemoizedInlineStoryRenderer);


const UnmemoizedStoryRenderer = ({ text, gameState, onEntityClick, onAvatarClick, onEntityMouseEnter, onEntityMouseLeave, onEntityDoubleClick }: StoryRendererProps) => {
    const elements = useMemo(() => {
        const renderedElements: React.ReactNode[] = [];
        if (!text) return renderedElements;

        const NARRATION_SPLIT_THRESHOLD = 2000; // Character count threshold to split long narration.
        
        const allKnownChars = [gameState.character, ...(gameState.knowledgeBase?.npcs || [])].filter(Boolean) as Character[];
        const speakerNames = [...new Set([
            ...allKnownChars.flatMap(char => [char.name, char.displayName].filter(Boolean)),
            'Hệ thống', 'System'
        ])];
        speakerNames.sort((a, b) => b.length - a.length);
        const escapedSpeakerNames = speakerNames.map(name => name.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'));

        // NEW: More specific and robust regexes
        const READOUT_REGEX = /^READOUT:\s*(?:([^:]+):)?\s*(.*)$/i;
        const MONOLOGUE_REGEX = /^MONOLOGUE:\s*([^:(]+?)\s*(?:\(([^)]+)\))?:\s*(.*)$/i;
        const DIALOGUE_PREFIXED_REGEX = /^DIALOGUE:\s*([^:(]+?)\s*(?:\(([^)]+)\))?:\s*(.*)$/i;
        const DIALOGUE_TAGGED_REGEX = /^<(PC|NPC):\s*([^>]+?)\s*(?:\(([^)]+)\))?>:\s*(.*)$/i;
        const DIALOGUE_UNPREFIXED_REGEX = new RegExp(`^(${escapedSpeakerNames.join('|')})(?:\\s*\\(([^)]+)\\))?:\\s*(.*)$`, 'i');

        const preprocessedText = (text || '').replace(/(DIALOGUE:|MONOLOGUE:|READOUT:)/g, '\n$1');
        const lines = preprocessedText.split('\n');

        let narrationGroup: string[] = [];

        const flushNarrationGroup = () => {
            const narrationText = narrationGroup.join('\n').trim();
            if (narrationText) {
                // NEW: Logic to split long narration blocks.
                if (narrationText.length > NARRATION_SPLIT_THRESHOLD) {
                    const midpoint = Math.floor(narrationText.length / 2);
                    const lastPeriodBeforeMid = narrationText.lastIndexOf('.', midpoint);
                    const firstPeriodAfterMid = narrationText.indexOf('.', midpoint);

                    let splitIndex = -1;
                    if (lastPeriodBeforeMid === -1) {
                        splitIndex = firstPeriodAfterMid;
                    } else if (firstPeriodAfterMid === -1) {
                        splitIndex = lastPeriodBeforeMid;
                    } else {
                        splitIndex = (midpoint - lastPeriodBeforeMid) < (firstPeriodAfterMid - midpoint)
                            ? lastPeriodBeforeMid
                            : firstPeriodAfterMid;
                    }

                    if (splitIndex !== -1) {
                        const part1 = narrationText.substring(0, splitIndex + 1).trim();
                        const part2 = narrationText.substring(splitIndex + 1).trim();
                        
                        renderedElements.push(
                            <div key={`narration-group-${renderedElements.length}-a`} className="story-narration">
                                <InlineStoryRenderer text={part1} gameState={gameState} onEntityClick={onEntityClick} onEntityMouseEnter={onEntityMouseEnter} onEntityMouseLeave={onEntityMouseLeave} onEntityDoubleClick={onEntityDoubleClick} />
                            </div>
                        );
                        if (part2) {
                            renderedElements.push(
                                <div key={`narration-group-${renderedElements.length}-b`} className="story-narration">
                                    <InlineStoryRenderer text={part2} gameState={gameState} onEntityClick={onEntityClick} onEntityMouseEnter={onEntityMouseEnter} onEntityMouseLeave={onEntityMouseLeave} onEntityDoubleClick={onEntityDoubleClick} />
                                </div>
                            );
                        }
                    } else {
                        // Fallback if no suitable split point is found
                        renderedElements.push(
                            <div key={`narration-group-${renderedElements.length}`} className="story-narration">
                                <InlineStoryRenderer text={narrationText} gameState={gameState} onEntityClick={onEntityClick} onEntityMouseEnter={onEntityMouseEnter} onEntityMouseLeave={onEntityMouseLeave} onEntityDoubleClick={onEntityDoubleClick} />
                            </div>
                        );
                    }
                } else {
                    // Original behavior for shorter text
                    renderedElements.push(
                        <div key={`narration-group-${renderedElements.length}`} className="story-narration">
                            <InlineStoryRenderer text={narrationText} gameState={gameState} onEntityClick={onEntityClick} onEntityMouseEnter={onEntityMouseEnter} onEntityMouseLeave={onEntityMouseLeave} onEntityDoubleClick={onEntityDoubleClick} />
                        </div>
                    );
                }
            }
            narrationGroup = [];
        };

        lines.forEach((line, lineIndex) => {
            const trimmedLine = line.trim();
            if (!trimmedLine) return;

            // Step 1: Handle explicit, unambiguous prefixes first
            const readoutMatch = trimmedLine.match(READOUT_REGEX);
            if (readoutMatch) {
                flushNarrationGroup();
                const uniqueKey = `line-${lineIndex}`;
                const title = readoutMatch[1]?.trim();
                const content = readoutMatch[2]?.trim();
                
                if (content) {
                     renderedElements.push(
                        <ReadoutBlock key={`${uniqueKey}-readout`} title={title}>
                            <InlineStoryRenderer text={content} gameState={gameState} onEntityClick={onEntityClick} onEntityMouseEnter={onEntityMouseEnter} onEntityMouseLeave={onEntityMouseLeave} onEntityDoubleClick={onEntityDoubleClick} />
                        </ReadoutBlock>
                    );
                }
                return;
            }
            
            const monologueMatch = trimmedLine.match(MONOLOGUE_REGEX);
            if (monologueMatch) {
                flushNarrationGroup();
                const uniqueKey = `line-${lineIndex}`;
                const speakerName = monologueMatch[1]?.trim();
                const fullContent = monologueMatch[3]?.trim();

                if (speakerName && fullContent) {
                    const speakerChar = (gameState.knowledgeBase?.npcs || []).find(n => n.name === speakerName || n.displayName === speakerName);
                    const finalSpeakerName = speakerChar?.displayName || speakerName;

                     renderedElements.push(
                        <MonologueBlock
                            key={`${uniqueKey}-monologue`}
                            speakerName={speakerChar?.name}
                            avatarUrl={speakerChar?.avatarUrl}
                            speakerDisplayName={finalSpeakerName}
                            onAvatarClick={onAvatarClick}
                        >
                            <InlineStoryRenderer text={fullContent} gameState={gameState} onEntityClick={onEntityClick} onEntityMouseEnter={onEntityMouseEnter} onEntityMouseLeave={onEntityMouseLeave} onEntityDoubleClick={onEntityDoubleClick} />
                        </MonologueBlock>
                    );
                }
                return;
            }

            // Step 2: Combine logic for all dialogue formats
            let isDialogue = false;
            let dialogueParts = { speakerName: '', emotion: '', fullContent: '' };
            let isPlayerOverride: boolean | null = null;
            
            const dialogueTaggedMatch = trimmedLine.match(DIALOGUE_TAGGED_REGEX);
            if (dialogueTaggedMatch) {
                isDialogue = true;
                isPlayerOverride = dialogueTaggedMatch[1].toUpperCase() === 'PC';
                dialogueParts = {
                    speakerName: dialogueTaggedMatch[2]?.trim(),
                    emotion: dialogueTaggedMatch[3]?.trim(),
                    fullContent: dialogueTaggedMatch[4]?.trim()
                };
            } else {
                const dialoguePrefixMatch = trimmedLine.match(DIALOGUE_PREFIXED_REGEX);
                if (dialoguePrefixMatch) {
                    isDialogue = true;
                    dialogueParts = {
                        speakerName: dialoguePrefixMatch[1]?.trim(),
                        emotion: dialoguePrefixMatch[2]?.trim(),
                        fullContent: dialoguePrefixMatch[3]?.trim()
                    };
                } else {
                    const dialogueUnprefixedMatch = trimmedLine.match(DIALOGUE_UNPREFIXED_REGEX);
                    if (dialogueUnprefixedMatch) {
                        isDialogue = true;
                        dialogueParts = {
                            speakerName: dialogueUnprefixedMatch[1]?.trim(),
                            emotion: dialogueUnprefixedMatch[2]?.trim(),
                            fullContent: dialogueUnprefixedMatch[3]?.trim()
                        };
                    }
                }
            }
            
            if (isDialogue) {
                flushNarrationGroup();
                const uniqueKey = `line-${lineIndex}`;
                let { speakerName, emotion, fullContent } = dialogueParts;
                
                speakerName = stripEntityTags(speakerName);

                if (fullContent) {
                    let dialogueText = fullContent;
                    let trailingNarration = '';

                    const firstQuoteIndex = fullContent.indexOf('"');
                    const lastQuoteIndex = fullContent.lastIndexOf('"');

                    if (firstQuoteIndex !== -1 && lastQuoteIndex > firstQuoteIndex && lastQuoteIndex < fullContent.length - 1) {
                        const potentialTrailingText = fullContent.substring(lastQuoteIndex + 1);
                        if (potentialTrailingText.trim().length > 0) {
                            dialogueText = fullContent.substring(0, lastQuoteIndex + 1).trim();
                            trailingNarration = potentialTrailingText.trim();
                        }
                    }
                    
                    if (speakerName && (speakerName.toLowerCase() === 'hệ thống' || speakerName.toLowerCase() === 'system')) {
                        renderedElements.push(
                            <div key={`${uniqueKey}-sys`} className="system-narration">
                                <InlineStoryRenderer text={dialogueText} gameState={gameState} onEntityClick={onEntityClick} onEntityMouseEnter={onEntityMouseEnter} onEntityMouseLeave={onEntityMouseLeave} onEntityDoubleClick={onEntityDoubleClick} />
                            </div>
                        );
                    } else if (speakerName) {
                        const pc = gameState.character;
                        
                        const isPlayer = isPlayerOverride !== null ? isPlayerOverride : 
                                         (speakerName === pc?.name || 
                                         speakerName === pc?.displayName);

                        const speakerChar = isPlayer ? pc : allKnownChars.find(n => n.name === speakerName || n.displayName === speakerName);
                        const finalSpeakerName = speakerChar?.displayName || speakerName;
                        
                        renderedElements.push(
                            <DialogueBubble 
                                key={`${uniqueKey}-bubble`} 
                                isPlayer={isPlayer} 
                                speakerName={speakerChar?.name}
                                avatarUrl={speakerChar?.avatarUrl}
                                speakerDisplayName={finalSpeakerName}
                                onAvatarClick={onAvatarClick}
                                emotion={emotion}
                            >
                                <InlineStoryRenderer text={dialogueText} gameState={gameState} onEntityClick={onEntityClick} onEntityMouseEnter={onEntityMouseEnter} onEntityMouseLeave={onEntityMouseLeave} onEntityDoubleClick={onEntityDoubleClick} />
                            </DialogueBubble>
                        );
                    }
                    
                    if (trailingNarration) {
                        narrationGroup.push(trailingNarration);
                        flushNarrationGroup();
                    }
                }
            } else {
                // Step 3: If nothing matched, it's narration
                narrationGroup.push(line);
            }
        });

        flushNarrationGroup();

        return renderedElements;
    }, [text, gameState, onEntityClick, onAvatarClick, onEntityMouseEnter, onEntityMouseLeave, onEntityDoubleClick]);

    return <>{elements}</>;
};
export const StoryRenderer = React.memo(UnmemoizedStoryRenderer);
