/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { createContext, useContext, useReducer, ReactNode, useMemo } from 'react';
import { rootReducer } from './reducers/rootReducer';
import { hydrateWorldSettings, hydrateGameState } from '../../utils/hydration';
import { INITIAL_WC_FORM_DATA } from '../../constants/gameConstants';
import type { GameState, WorldSettings, Character, LoreRule, Turn, Stat, KnowledgeEntity, AuctionItem, GameTime, MapData, Faction, MapMarker, CraftingHistoryEntry, Message, Memory, GameAction, KnowledgeBase, CombatState, AuctionState, MapLocation, MarketState, OutfitSet, TimelineBlock, Relationship } from '../../types';

//================================================================
// STATE & ACTION TYPES
//================================================================

export interface State {
    gameState: GameState | null; // Can be null when no game is loaded
    worldSettings: WorldSettings;
}

export type Action =
    | { type: 'SET_GAME_STATE'; payload: GameState }
    | { type: 'LOAD_GAME'; payload: { gameState: GameState; worldSettings: WorldSettings } }
    | { type: 'CLEAR_GAME' }
    | { type: 'UPDATE_SAVE_ID'; payload: string }
    | { type: 'UPDATE_WORLD_SETTINGS'; payload: Partial<WorldSettings> }
    | { type: 'REVERT_TO_TURN'; payload: number }
    | { type: 'TOGGLE_PIN_MEMORY'; payload: string }
    | { type: 'DELETE_MEMORY'; payload: string }
    | { type: 'RENAME_ENTITY'; payload: { oldName: string; newName: string } }
    | { type: 'UPDATE_CHARACTER'; payload: { characterName: string; updates: Partial<Character> } }
    | { type: 'UPDATE_RELATIONSHIP_MANUAL'; payload: { sourceCharId: string; targetCharId: string; newAffinity: number; } }
    | { type: 'CLEAR_UNSEEN_QUEST_FLAG' }
    | { type: 'MERGE_BACKGROUND_UPDATES'; payload: Character[] }
    | { type: 'UPDATE_WORLD_SUMMARY'; payload: string }
    | { type: 'ADD_TURN'; payload: Turn }
    | { type: 'UPDATE_TURN'; payload: { turnId: string; updates: Partial<Turn> } }
    | { type: 'CREATE_ENTITY'; payload: { entityType: 'npcs' | 'locations' | 'factions'; data: { name: string; description?: string } } }
    // FIX: Changed payload from entityName to entityId for reliability.
    | { type: 'UPDATE_ENTITY'; payload: { entityType: 'locations' | 'factions'; entityId: string; updates: Partial<KnowledgeEntity> } }
    | { type: 'UPDATE_FACTION'; payload: { factionId: string; updates: Partial<Faction> } }
    // FIX: Changed payload from entityName to entityId for reliability.
    | { type: 'DELETE_ENTITY'; payload: { entityType: 'npcs' | 'locations' | 'factions'; entityId: string } }
    | { type: 'UPDATE_MAP_DATA'; payload: { locations: MapLocation[], playerPosition: { x: number, y: number } } }
    | { type: 'UPDATE_PLAYER_POSITION'; payload: { x: number, y: number } }
    | { type: 'SUMMARIZE_MEMORIES'; payload: { summaryMemory: Memory; idsToDelete: string[] } }
    | { type: 'ADD_MAP_MARKER'; payload: MapMarker }
    | { type: 'UPDATE_MAP_MARKER'; payload: MapMarker }
    | { type: 'DELETE_MAP_MARKER'; payload: string }
    | { type: 'PAUSE_GAME' }
    | { type: 'RESUME_GAME' }
    | { type: 'UPDATE_COMBAT_STATE'; payload: Partial<GameState['combatState']> }
    | { type: 'START_TEST_COMBAT' }
    | { type: 'START_COMBAT'; payload: { opponentIds: string[]; isLethal?: boolean } }
    | { type: 'PROCESS_AUCTIONS'; payload: { currentTime: GameTime } }
    | { type: 'PLACE_BID'; payload: { auctionId?: string; bidAmount: number; bidderName: string } }
    | { type: 'LIST_ITEM_FOR_AUCTION'; payload: { itemToSell: Stat; startingBid: number; durationHours: number } }
    | { type: 'START_AUCTION'; payload: { itemId: string } }
    | { type: 'END_AUCTION' }
    | { type: 'START_TEST_AUCTION' }
    | { type: 'CRAFT_ITEM'; payload: { recipeName: string; quantity: number; areCheatsEnabled: boolean; } }
    | { type: 'MOVE_ITEM'; payload: { itemId: string; destinationContainerId: string | null } }
    | { type: 'MERGE_FACTION_UPDATES'; payload: Faction[] }
    | { type: 'ADD_WORLD_SKILLS'; payload: Stat[] }
    | { type: 'SAVE_OUTFIT'; payload: { characterName: string; outfitName: string } }
    | { type: 'EQUIP_OUTFIT'; payload: { characterName: string; outfitId: string } }
    | { type: 'DELETE_OUTFIT'; payload: { characterName: string; outfitId: string } }
    | { type: 'RENAME_OUTFIT'; payload: { characterName: string; outfitId: string; newName: string } }
    | { type: 'UPDATE_OUTFIT'; payload: { characterName: string; outfitId: string; newEquipment: OutfitSet['equipment'] } }
    | { type: 'UPDATE_OUTFIT_CATEGORY'; payload: { characterName: string; outfitId: string; newCategory: string } }
    | { type: 'ADD_TIMELINE_BLOCK'; payload: TimelineBlock }
    | { type: 'CLEANUP_DATA'; payload: { statIds: Set<string>; memoryIds: Set<string>; relationshipsToPrune: { charId: string; targetId: string; }[] } };

//================================================================
// INITIAL STATE
//================================================================

export const initialState: State = {
    gameState: null,
    worldSettings: hydrateWorldSettings(INITIAL_WC_FORM_DATA),
};

//================================================================
// CONTEXT DEFINITIONS
//================================================================

// World Data (less frequent changes)
interface WorldDataContextType {
    worldSettings: WorldSettings;
    knowledgeBase: KnowledgeBase;
    worldSummary: string;
    title: string;
    map: MapData;
}
const WorldDataContext = createContext<WorldDataContextType | null | undefined>(undefined);

// Player Character (frequent changes)
interface PlayerCharacterContextType {
    character: Character;
}
const PlayerCharacterContext = createContext<PlayerCharacterContextType | null | undefined>(undefined);

// Game Session State (frequent changes)
interface GameSessionContextType {
    saveId?: string;
    stateVersion: number;
    turns: Turn[];
    actions: GameAction[];
    memories: Memory[];
    history: GameState[];
    timeline: TimelineBlock[];
    gameTime: GameTime;
    combatState: CombatState;
    auctionState?: AuctionState;
    isPaused: boolean;
    totalTokenCount: number;
    craftingHistory: CraftingHistoryEntry[];
    auctionHouse: AuctionItem[];
    marketState: MarketState;
    playerFactionId: string | null;
    isIntercourseScene: boolean;
    intercourseStep: number;
    hasUnseenQuest?: boolean;
}
const GameSessionContext = createContext<GameSessionContextType | null | undefined>(undefined);

// Dispatcher (stable)
type GameDispatch = React.Dispatch<Action>;
const GameDispatchContext = createContext<GameDispatch | undefined>(undefined);


//================================================================
// PROVIDER COMPONENT
//================================================================

export const GameProvider = ({ children }: { children: ReactNode }) => {
    const [state, dispatch] = useReducer(rootReducer, initialState);
    const { gameState, worldSettings } = state;

    // Memoize context values to prevent unnecessary re-renders when a slice of state hasn't changed.
    const worldDataValue = useMemo(() => (gameState ? {
        worldSettings,
        knowledgeBase: gameState.knowledgeBase,
        worldSummary: gameState.worldSummary,
        title: gameState.title,
        map: gameState.map,
    } : null), [worldSettings, gameState?.knowledgeBase, gameState?.worldSummary, gameState?.title, gameState?.map]);

    const playerCharacterValue = useMemo(() => (gameState ? {
        character: gameState.character,
    } : null), [gameState?.character]);

    const gameSessionValue = useMemo(() => (gameState ? {
        saveId: gameState.saveId,
        stateVersion: gameState.stateVersion,
        turns: gameState.turns,
        actions: gameState.actions,
        memories: gameState.memories,
        history: gameState.history,
        timeline: gameState.timeline,
        gameTime: gameState.gameTime,
        combatState: gameState.combatState,
        auctionState: gameState.auctionState,
        isPaused: gameState.isPaused,
        totalTokenCount: gameState.totalTokenCount,
        craftingHistory: gameState.craftingHistory,
        auctionHouse: gameState.auctionHouse,
        marketState: gameState.marketState,
        playerFactionId: gameState.playerFactionId,
        isIntercourseScene: gameState.isIntercourseScene,
        intercourseStep: gameState.intercourseStep,
        hasUnseenQuest: gameState.hasUnseenQuest,
    } : null), [
        gameState?.saveId, gameState?.stateVersion, gameState?.turns, gameState?.actions, gameState?.memories, gameState?.history,
        gameState?.timeline, gameState?.gameTime, gameState?.combatState, gameState?.auctionState, gameState?.isPaused,
        gameState?.totalTokenCount, gameState?.craftingHistory,
        gameState?.auctionHouse, gameState?.marketState, gameState?.playerFactionId,
        gameState?.isIntercourseScene, gameState?.intercourseStep, gameState?.hasUnseenQuest
    ]);

    return (
        <GameDispatchContext.Provider value={dispatch}>
            <WorldDataContext.Provider value={worldDataValue}>
                <PlayerCharacterContext.Provider value={playerCharacterValue}>
                    <GameSessionContext.Provider value={gameSessionValue}>
                        {children}
                    </GameSessionContext.Provider>
                </PlayerCharacterContext.Provider>
            </WorldDataContext.Provider>
        </GameDispatchContext.Provider>
    );
};

//================================================================
// CONSUMER HOOKS
//================================================================

/** Provides the game state dispatcher. This is stable and will not cause re-renders. */
export const useGameDispatch = () => {
    const context = useContext(GameDispatchContext);
    if (context === undefined) {
        throw new Error('useGameDispatch must be used within a GameProvider');
    }
    return context;
};

/**
 * Generic factory for creating hooks that can handle a null context (when no game is active).
 * Components inside the main game view can safely use the non-null assertion `!` because the
 * AppContentWrapper ensures they only render when a game is active.
 */
const createNullableContextHook = <T,>(context: React.Context<T | null | undefined>, hookName: string) => {
    return (): T | null => {
        const ctx = useContext(context);
        if (ctx === undefined) {
            throw new Error(`${hookName} must be used within a GameProvider`);
        }
        return ctx;
    };
};

/** Provides world data (settings, knowledge base, summary, etc.). Re-renders only when this data changes. */
export const useWorldData = createNullableContextHook<WorldDataContextType>(WorldDataContext, 'useWorldData');

/** Provides the player character object. Re-renders only when the character object changes. */
export const usePlayerCharacter = createNullableContextHook<PlayerCharacterContextType>(PlayerCharacterContext, 'usePlayerCharacter');

/** Provides session data (turns, actions, time, etc.). Re-renders only when this data changes. */
export const useGameSession = createNullableContextHook<GameSessionContextType>(GameSessionContext, 'useGameSession');


export const useGameContext = (): { gameState: GameState; worldSettings: WorldSettings; dispatch: GameDispatch } => {
    const dispatch = useGameDispatch();
    const worldData = useWorldData();
    const playerCharacter = usePlayerCharacter();
    const gameSession = useGameSession();

    const gameState = useMemo((): GameState | null => {
        if (!worldData || !playerCharacter || !gameSession) {
            return null;
        }

        // FIX: Construct the object manually to avoid spreading a potentially non-object type and satisfy TypeScript.
        // Also use type assertions to resolve 'property does not exist on unknown' errors.
        return {
            saveId: gameSession.saveId,
            stateVersion: gameSession.stateVersion,
            turns: gameSession.turns,
            actions: gameSession.actions,
            memories: gameSession.memories,
            history: gameSession.history,
            timeline: gameSession.timeline,
            gameTime: gameSession.gameTime,
            combatState: gameSession.combatState,
            auctionState: gameSession.auctionState,
            isPaused: gameSession.isPaused,
            totalTokenCount: gameSession.totalTokenCount,
            craftingHistory: gameSession.craftingHistory,
            auctionHouse: gameSession.auctionHouse,
            marketState: gameSession.marketState,
            playerFactionId: gameSession.playerFactionId,
            isIntercourseScene: gameSession.isIntercourseScene,
            intercourseStep: gameSession.intercourseStep,
            hasUnseenQuest: gameSession.hasUnseenQuest,
            character: playerCharacter.character,
            knowledgeBase: worldData.knowledgeBase,
            worldSummary: worldData.worldSummary,
            title: worldData.title,
            map: worldData.map,
        };
    }, [worldData, playerCharacter, gameSession]);

    return {
        gameState: gameState!,
        worldSettings: worldData ? worldData.worldSettings : initialState.worldSettings,
        dispatch,
    };
};
