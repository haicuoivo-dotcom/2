/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

// This file acts as a central barrel file to re-export all types.
// This allows for a single import point (`from './types'`)
// throughout the application, while keeping the type definitions
// organized into smaller, domain-specific files.

export * from './types/app';
export * from './types/api';
export * from './types/base';
// FIX: Module './types/base' has already exported a member named 'PersonalityTrait'. Consider explicitly re-exporting to resolve the ambiguity.
export type { Character, EffectiveStat, FamilyMember, FamilyRelations, OutfitSet, Relationship } from './types/character';
export * from './types/game';
export * from './types/world';
