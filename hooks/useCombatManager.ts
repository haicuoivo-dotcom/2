/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
// FIX: Add React import to resolve namespace errors.
import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { useGameContext } from '../components/contexts/GameContext';
import { useToasts } from '../components/contexts/ToastContext';
import { resolveCombatTurn, checkQuestProgress, getLocalCombatAction, handleAutosave, addHoursToGameTime, calculateEffectiveStats } from '../utils/game';
import { STAT_HEALTH } from '../constants/statConstants';
import type { GameState, GameAction, CombatEvent, Character, Stat, EffectiveStat } from '../../types';

interface UseCombatManagerProps {
    onSaveGame: (gameState: GameState, worldSettings: any) => void;
    setError: (error: string | null) => void;
}

const getSpeed = (char: Character): number => {
    const speedStat = char.stats?.find(s => s.name === 'Tốc Độ');
    if (speedStat && typeof speedStat.value === 'number') return speedStat.value;
    if (speedStat && typeof speedStat.value === 'string') {
        const parsed = parseInt(speedStat.value.split('/')[0], 10);
        return isNaN(parsed) ? 10 : parsed;
    }
    return 10;
};

export const useCombatManager = ({ onSaveGame, setError }: UseCombatManagerProps) => {
    const { gameState, worldSettings, dispatch } = useGameContext();
    const { addToast } = useToasts();
    
    const [isAutoCombatActive, setIsAutoCombatActive] = useState(false);
    const [lastTurnEvents, setLastTurnEvents] = useState<CombatEvent[]>([]);
    const [isResolvingCombat, setIsResolvingCombat] = useState(false);
    
    const isMounted = useRef(true);

    const runLocalTurnBasedCombat = useCallback(async (currentState: GameState, playerAction?: Partial<GameAction>) => {
        let nextState = JSON.parse(JSON.stringify(currentState));
        let combatLog = [...nextState.combatState.combatLog];
        let events: CombatEvent[] = [];
        let turnIndex = nextState.combatState.currentTurnIndex!;
        const allChars = [nextState.character, ...nextState.knowledgeBase.npcs];
        const currentActorId = nextState.combatState.turnQueue[turnIndex].characterId;
        const actor = allChars.find(c => c.id === currentActorId);

        if (!actor || actor.stats.some(s => s.name === 'Trạng thái Tử vong')) {
            const nextTurnIndex = (turnIndex + 1) % nextState.combatState.turnQueue.length;
            dispatch({ type: 'UPDATE_COMBAT_STATE', payload: { currentTurnIndex: nextTurnIndex } });
            return;
        }

        let actionDescription: string;
        if (playerAction && actor.id === nextState.character.id) {
            actionDescription = playerAction.description!;
        } else {
            const aiAction = getLocalCombatAction(actor, nextState);
            if (aiAction.dialogue) combatLog.push(`DIALOGUE: ${actor.displayName}: "${aiAction.dialogue}"`);
            actionDescription = aiAction.description;
        }

        const resolution = resolveCombatTurn(actionDescription, nextState, worldSettings);
        nextState = resolution.nextState;
        combatLog.push(resolution.logEntry);
        events = [...events, ...resolution.events];
        
        if (resolution.questMessages.length > 0) {
            resolution.questMessages.forEach(msg => addToast(msg.text, msg.type));
        }

        const opponents = nextState.knowledgeBase.npcs.filter((n: Character) => nextState.combatState.opponentIds.includes(n.id));
        // FIX: The player party in combat should only consist of the player character for now,
        // as the harem members do not participate in combat according to the AI rules.
        const playerParty = [nextState.character];

        const isVictory = opponents.every((opp: Character) => opp.stats.some((s: Stat) => s.name === 'Trạng thái Tử vong'));
        const isDefeat = playerParty.every((member: Character) => member.stats.some((s: Stat) => s.name === 'Trạng thái Tử vong'));

        if (isVictory || isDefeat) {
            combatLog.push(isVictory ? "Tất cả kẻ địch đã bị đánh bại! Bạn đã chiến thắng!" : "Bạn và đồng đội đã bị đánh bại!");
            nextState.combatState.isActive = false;
            nextState.actions = [];
        }

        const nextTurnIndex = (turnIndex + 1) % nextState.combatState.turnQueue.length;
        let roundNumber = nextState.combatState.roundNumber || 1;

        if (nextTurnIndex === 0 && !isVictory && !isDefeat) {
            roundNumber++;
            combatLog.push(`--- Vòng ${roundNumber} ---`);
        }
        
        setLastTurnEvents(events);
        dispatch({
            type: 'SET_GAME_STATE',
            payload: {
                ...nextState,
                combatState: { ...nextState.combatState!, combatLog, currentTurnIndex: nextTurnIndex, roundNumber },
            }
        });

        if (!nextState.combatState.isActive) {
            onSaveGame(nextState, worldSettings);
            await handleAutosave(nextState, worldSettings);
        }
    }, [addToast, onSaveGame, worldSettings, dispatch]);

    useEffect(() => {
        const combatState = gameState?.combatState;
        if (!combatState?.isActive || combatState.combatMode !== 'turn-based' || isResolvingCombat) {
            return;
        }
        const currentActorId = combatState.turnQueue?.[combatState.currentTurnIndex ?? 0]?.characterId;
        if (!currentActorId) return;

        const isPlayerTurn = currentActorId === gameState.character.id;
        const shouldRunTurn = isAutoCombatActive || !isPlayerTurn;

        if (shouldRunTurn) {
            const timeoutId = setTimeout(() => {
                runLocalTurnBasedCombat(gameState);
            }, 800);
            return () => clearTimeout(timeoutId);
        }
    }, [gameState?.combatState?.isActive, gameState?.combatState?.currentTurnIndex, gameState?.character?.id, isAutoCombatActive, isResolvingCombat, runLocalTurnBasedCombat, gameState]);

    const toggleAutoCombat = useCallback(() => setIsAutoCombatActive(prev => !prev), []);

    return {
        isAutoCombatActive,
        toggleAutoCombat,
        isResolvingCombat,
        lastTurnEvents,
        setLastTurnEvents,
        runLocalTurnBasedCombat,
    };
};
