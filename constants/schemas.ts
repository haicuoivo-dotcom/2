/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { Type } from "@google/genai";

// This barrel file re-exports all schemas from their new, consolidated locations.
// This maintains a single import point (`from '.../constants/schemas'`) for the application.

// Core entity schemas
export * from './schemas/stat';
export * from './schemas/character';
export * from './schemas/faction';

// Player and AI action schemas
export * from './schemas/action';

// Schemas used for world creation and AI suggestions
// FIX: Export schemas explicitly to avoid name clashes with fanfic schemas.
// FIX: Added STARTING_POINT_SUGGESTION_SCHEMA to the export list.
export {
    CHARACTER_SUGGESTION_SCHEMA,
    WORLD_SUMMARY_SUGGESTION_SCHEMA,
    WORLD_SKILLS_GENERATION_SCHEMA,
    QUICK_CREATE_SCHEMA,
    SCENE_WRITING_SCHEMA,
    WORLD_ENRICHMENT_SCHEMA,
    STARTING_POINT_SUGGESTION_SCHEMA,
} from './schemas/creation';


// Schemas used for turn processing and gameplay logic
export * from './schemas/turnProcessing';

// Schemas for fan-fiction analysis
// FIX: Changed from a wildcard export to an explicit named export to prevent module resolution issues.
export {
    // FIX: Removed FANFIC_CHARACTER_EXTRACTION_SCHEMA from here as it's now exported from './creation'.
    FANFIC_CHARACTER_EXTRACTION_SCHEMA,
    FANFIC_SYSTEM_ANALYSIS_SCHEMA,
    FANFIC_SUMMARY_SCHEMA
} from './schemas/fanfic';

// Miscellaneous utility schemas
export * from './schemas/utility';