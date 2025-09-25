/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import type { Character } from './character';
import type { PersonalityTrait } from './base';
import type { Stat, GameTime } from './base';

// Contains types related to the world itself: its settings, rules, factions, locations, etc.

export interface KnowledgeEntity {
    id: string;
    name: string;
    description: string;
}

export interface FactionPolicy {
    id: string;
    name: string;
    description: string;
    isActive: boolean;
}

export interface Faction {
    id: string;
    name: string;
    description: string;
    factionType: string;
    leaderId: string;
    territories: { locationId: string; locationName: string }[];
    resources: {
        treasury: number;
        manpower: number;
        food: number;
    };
    stats: {
        military: number;
        economy: number;
        influence: number;
        stability: number;
    };
    relations: { factionId: string; status: 'ally' | 'neutral' | 'hostile' | 'war' }[];
    policies: FactionPolicy[];
    playerReputation?: number;
    reputationStatus?: string;
}

export interface KnowledgeBase {
    pcs: Character[];
    npcs: Character[];
    locations: KnowledgeEntity[];
    factions: Faction[];
    worldSkills?: Stat[];
}

export interface MapLocation {
    id: string;
    name: string;
    description: string;
    type: string;
    coordinates: { x: number; y: number };
    discovered: boolean;
    resourceLevel?: number;
    scale?: number;
}

export interface MapMarker {
    id: string;
    coordinates: { x: number; y: number };
    label: string;
    note: string;
    icon: string;
}

export interface MapData {
    locations: MapLocation[];
    playerPosition: { x: number; y: number };
    markers?: MapMarker[];
}

export interface AuctionItem {
    id: string;
    item: Stat;
    sellerName: string;
    startingBid: number;
    currentBid: number;
    highestBidder: string;
    auctionEndTime: GameTime;
    bidLog: { bidder: string; amount: number; timestamp: number }[];
}

export interface InitialRelationship {
    id: string;
    npcDescription: string;
    relationshipType: string;
    affinity: number;
}

export interface FanficSystemAnalysis {
    coreStats: { name: string; description: string }[];
    energySystem: { name: string; description: string };
    keySkills: { name: string; description: string }[];
    keyItems: { name: string; description: string }[];
    worldRules: { name: string; description: string }[];
}

export interface WorldSettings {
    genre: string;
    setting: string;
    idea: string;
    suggestion: string;
    templateIdea?: string;
    startingScene: string;
    worldTone?: 'bright' | 'balanced' | 'dark';
    worldSummary: string;

    name: string;
    personalityTraits: PersonalityTrait[];
    species: string;
    gender: string;
    linhCan: string;
    backstory: string;

    stats: Stat[];

    writingStyle: 'default' | 'literary_sfw' | 'no_segg_polite';
    narrativeVoice: 'first' | 'second' | 'third_limited' | 'third_omniscient';
    difficulty: 'easy' | 'normal' | 'hard' | 'nightmare';
    allow18Plus: boolean;

    loreRules: LoreRule[];
    worldLogic: WorldLogicRule[];
    worldEvents: WorldEvent[];
    suggestPowerfulSkills: boolean;
    equipFullSet: boolean;
    initialRelationships?: InitialRelationship[];
    strictFanficAdherence?: boolean;
    fanficSystemAnalysis?: FanficSystemAnalysis;
}

export interface LoreRule {
    id?: string;
    text: string;
    isActive: boolean;
}

export interface WorldLogicRule {
    id: string;
    text: string;
    isActive: boolean;
    author: 'player' | 'ai';
    timestamp: string;
    tags?: string[];
}

export interface WorldEvent {
    id: string;
    name: string;
    description: string;
    startMonth: number;
    startDay: number;
    durationDays: number;
    frequency: 'Hàng năm' | 'Mỗi 5 năm' | 'Mỗi 10 năm' | 'Chỉ một lần';
    isActive: boolean;
}
