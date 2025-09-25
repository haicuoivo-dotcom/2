/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

// FIX: Import PersonalityTrait from base to avoid re-definition.
import type { Stat, EquipmentSlot, PersonalityTrait } from './base';

// Contains types related to characters, their stats, pets, and related data structures.

export interface Relationship {
  characterId: string; // ID of the other character
  affinity: number;    // The score from -100 to 100
  type: string;        // e.g., 'Bạn bè', 'Kẻ thù', 'Sư phụ'
  description?: string; // A brief description of their history/feelings
}

export interface OutfitSet {
  id: string;
  name: string;
  equipment: { [slot in EquipmentSlot | string]?: string };
  category?: string;
}

export interface Character {
    id: string;
    name: string;
    displayName: string;
    personality: PersonalityTrait[];
    physicalAppearance: string;
    currentOutfit: string;
    // FIX: Add missing property 'personalityAndMannerisms' to satisfy the Character type definition.
    personalityAndMannerisms: string;
    backstory: string;
    npcType: 'npc' | 'unnamed_monster' | 'named_monster' | 'boss';
    stats: Stat[];
    relationships?: Relationship[];
    avatarUrl?: string;
    schedule?: string;
    equipment?: { [slot in EquipmentSlot | string]?: string };
    harem?: string[];
    assets?: Stat[];
    tags?: string[];
    outfits?: OutfitSet[];
    locationId?: string;
    dateOfBirth?: {
        day: number;
        month: number;
        year: number;
    };
    isMicroActionLearningEnabled?: boolean;
    actionProgress?: {
        // Physical & Life
        running: { count: number; level: number; threshold: number };
        swimming: { count: number; level: number; threshold: number };
        climbing: { count: number; level: number; threshold: number };
        jumping: { count: number; level: number; threshold: number };
        dodging: { count: number; level: number; threshold: number };
        sneaking: { count: number; level: number; threshold: number };
        throwing: { count: number; level: number; threshold: number };
        blocking: { count: number; level: number; threshold: number };
        typing: { count: number; level: number; threshold: number };
        riding: { count: number; level: number; threshold: number };
        driving: { count: number; level: number; threshold: number };
        eating: { count: number; level: number; threshold: number };
        sleeping: { count: number; level: number; threshold: number };
        travelling: { count: number; level: number; threshold: number };

        // Combat & Tactics
        punching: { count: number; level: number; threshold: number };
        kicking: { count: number; level: number; threshold: number };
        swordplay: { count: number; level: number; threshold: number };
        archery: { count: number; level: number; threshold: number };
        parrying: { count: number; level: number; threshold: number };
        spellcasting: { count: number; level: number; threshold: number };
        heavy_weaponry: { count: number; level: number; threshold: number };
        light_weaponry: { count: number; level: number; threshold: number };
        wielding_weapon: { count: number; level: number; threshold: number };
        reloading: { count: number; level: number; threshold: number };
        use_support_item: { count: number; level: number; threshold: number };
        practice_martial_art: { count: number; level: number; threshold: number };
        aiming: { count: number; level: number; threshold: number };
        using_tactics: { count: number; level: number; threshold: number };
        leading: { count: number; level: number; threshold: number };

        // Interaction & Work
        persuasion: { count: number; level: number; threshold: number };
        commanding: { count: number; level: number; threshold: number };
        intimidation: { count: number; level: number; threshold: number };
        deception: { count: number; level: number; threshold: number };
        bargaining: { count: number; level: number; threshold: number };
        comforting: { count: number; level: number; threshold: number };
        flirting: { count: number; level: number; threshold: number };
        performing: { count: number; level: number; threshold: number };
        interrogating: { count: number; level: number; threshold: number };
        presenting: { count: number; level: number; threshold: number };
        teaching: { count: number; level: number; threshold: number };
        bartering: { count: number; level: number; threshold: number };
        trading: { count: number; level: number; threshold: number };
        intercourse: { count: number; level: number; threshold: number };
        negotiating: { count: number; level: number; threshold: number };
        reporting: { count: number; level: number; threshold: number };
        managing: { count: number; level: number; threshold: number };

        // Intellectual & Learning
        observation: { count: number; level: number; threshold: number };
        looking: { count: number; level: number; threshold: number };
        gazing: { count: number; level: number; threshold: number };
        searching: { count: number; level: number; threshold: number };
        studying: { count: number; level: number; threshold: number };
        learning: { count: number; level: number; threshold: number };
        solving_puzzles: { count: number; level: number; threshold: number };
        analyzing: { count: number; level: number; threshold: number };
        reading: { count: number; level: number; threshold: number };
        experimenting: { count: number; level: number; threshold: number };
        planning: { count: number; level: number; threshold: number };

        // Crafting & Survival
        healing: { count: number; level: number; threshold: number };
        cooking: { count: number; level: number; threshold: number };
        crafting: { count: number; level: number; threshold: number };
        disarming_traps: { count: number; level: number; threshold: number };
        lockpicking: { count: number; level: number; threshold: number };
        alchemy: { count: number; level: number; threshold: number };
        smithing: { count: number; level: number; threshold: number };
        fishing: { count: number; level: number; threshold: number };
        mining: { count: number; level: number; threshold: number };
        herbalism: { count: number; level: number; threshold: number };
        farming: { count: number; level: number; threshold: number };
        repairing: { count: number; level: number; threshold: number };
        building: { count: number; level: number; threshold: number };
        setting_traps: { count: number; level: number; threshold: number };

        // Arts & Creativity
        composing: { count: number; level: number; threshold: number };
        singing: { count: number; level: number; threshold: number };
        drawing: { count: number; level: number; threshold: number };
        writing: { count: number; level: number; threshold: number };
        poetry: { count: number; level: number; threshold: number };
        practicing: { count: number; level: number; threshold: number };
    };
}

export interface EffectiveStat {
    baseValue: string | number;
    modifiedValue: string | number;
    flatModifier: number;
    percentModifier: number;
    sources: string[];
}

export interface FamilyMember {
    character: Character;
    relationship: string;
}

export interface FamilyRelations {
    parents: FamilyMember[];
    spouses: FamilyMember[];
    siblings: FamilyMember[];
    children: FamilyMember[];
}
