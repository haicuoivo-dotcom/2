/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import type { Stat } from './base';

// Contains types related to AI responses and API interactions.

export interface PostCombatSummary {
    status: 'victory' | 'defeat';
    expGained: number;
    itemsGained: Stat[];
    moneyGained: number;
    defeatedOpponents: string[];
}

export interface PostAuctionSummary {
    status: 'won' | 'lost' | 'unsold';
    itemName: string;
    finalPrice: number;
    winnerName: string;
}

export type PreEventDetails = {
    id: string;
    type: 'combat' | 'auction';
    opponentNames?: string[];
    opponentIds?: string[];
    isLethal?: boolean;
};

export type PostEventSummary =
    | { type: 'combat'; data: PostCombatSummary }
    | { type: 'auction'; data: PostAuctionSummary };

export interface WorldHealingReport {
    problems_found: string[];
    actions_taken: string[];
    summary: string;
}

export interface SupplementReport {
    summary: string;
    actionsTaken: string[];
}

export interface WorldHealingResponse {
    report: WorldHealingReport;
    directives: any[]; // Using existing directive structure
}


// Dummy export for GenerateContentParameters if it's not available from the library
// in the context of this tool. The real one is from @google/genai
export type GenerateContentParameters = any;