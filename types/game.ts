import type { PostEventSummary as ApiPostEventSummary, PreEventDetails as ApiPreEventDetails } from './api';
export type PostEventSummary = ApiPostEventSummary;
export type PreEventDetails = ApiPreEventDetails;
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import type { Character } from './character';
import type { KnowledgeBase, MapData, AuctionItem } from './world';
import type { Stat, GameTime, CraftingHistoryEntry } from './base';

// Contains types related to the core game state and its components like turns, actions, and combat.

export interface Message {
    id: string;
    text: string;
}

export interface Turn {
    id: string;
    story: string;
    messages: Message[];
    chosenAction: string | null;
    summary: string;
    tokenCount: number;
    generatedImageId?: string;
    apiRequestCount?: number;
    isMilestone?: boolean;
}

export interface Memory {
    id: string;
    text: string;
    pinned: boolean;
    timestamp: GameTime;
    tags: string[];
    relevanceScore?: number;
    reasoning?: string;
}

export interface CombatQueueEntry {
    characterId: string;
    speed: number;
}

export interface CombatState {
    isActive: boolean;
    opponentIds: string[];
    combatLog: string[];
    combatMode?: 'narrative' | 'turn-based';
    turnQueue?: CombatQueueEntry[];
    currentTurnIndex?: number;
    roundNumber?: number;
    isLethal?: boolean;
    lockedTargetId?: string | null;
}

export interface AuctionState {
    isActive: boolean;
    item: Stat;
    sellerName: string;
    startTime: number;
    endTime: number;
    startingBid: number;
    currentBid: number;
    highestBidder: string;
    bidLog: { bidder: string; amount: number; timestamp: number }[];
    potentialBidders: string[];
}

export interface MarketState {
    [key: string]: any; // Placeholder for future market properties.
}

export interface TimelineBlock {
    id: string;
    hash: string;
    timestamp: GameTime;
    summary: string;
}

export interface GameState {
    saveId?: string;
    title: string;
    worldSummary: string;
    version?: number;

    character: Character;
    knowledgeBase: KnowledgeBase;

    turns: Turn[];
    actions: GameAction[];
    memories: Memory[];
    history: GameState[];
    timeline: TimelineBlock[];

    gameTime: GameTime;
    map: MapData;

    playerFactionId: string | null;
    totalTokenCount: number;
    
    killCount?: { [enemyName: string]: number };

    auctionHouse: AuctionItem[];

    isIntercourseScene: boolean;
    intercourseStep: number;

    combatState: CombatState;

    auctionState?: AuctionState;

    isPaused: boolean;
    craftingHistory: CraftingHistoryEntry[];
    marketState: MarketState;
    hasUnseenQuest?: boolean;
}

export interface GameAction {
    id: string;
    description: string;
    successChance?: number;
    benefit?: string;
    risk?: string;
    timeCost?: string;
}

export interface CombatEvent {
    id: string;
    type: 'damage' | 'heal' | 'crit' | 'miss';
    targetId: string;
    value?: number;
    text?: string;
}

export interface CombatResolution {
    nextState: GameState;
    logEntry: string;
    defeatedTarget: string | null;
    events: CombatEvent[];
    questMessages: { text: string, type: 'success' | 'info' }[];
}
