/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { useRef, useCallback, useMemo, useEffect, useState } from 'react';
import { useGameEngine } from './useGameEngine';
import { useGameActions } from './useGameActions';
import { useGameContext } from '../components/contexts/GameContext';
import { useSettings } from '../components/contexts/SettingsContext';
import { useAppContext } from '../components/contexts/AppContext';
import { useModalManager } from './useModalManager';
import { formatCurrency, calculateCombatPower, INVENTORY_LIMIT, getCurrencyName } from '../utils/game';
import { generateUniqueId } from '../utils/id';
import type { GameState, PostEventSummary, PreEventDetails } from '../types/game';
import type { WorldSettings } from '../types/world';
import type { Stat } from '../types/base';
import type { Character } from '../types/character';

interface GameViewManagerProps {
    onNavigateToMenu: () => void;
    onSaveGame: (gameState: GameState, worldSettings: WorldSettings) => void;
    onOpenLoadGameModal: () => void;
    modalManager: ReturnType<typeof useModalManager>;
}

export const useGameViewManager = (props: GameViewManagerProps) => {
    const { onNavigateToMenu, onSaveGame } = props;
    const { addToast } = useAppContext();
    const { gameState, worldSettings, dispatch } = useGameContext();
    const { settings } = useSettings();
    
    const gameBodyRef = useRef<HTMLDivElement>(null);
    const [postEventSummary, setPostEventSummary] = useState<PostEventSummary | null>(null);
    const [pendingEvent, setPendingEvent] = useState<PreEventDetails | null>(null);
    const [skippedEvent, setSkippedEvent] = useState<PreEventDetails | null>(null);
    const [acknowledgedTurnId, setAcknowledgedTurnId] = useState<string | null>(null);
    const prevCombatState = useRef(gameState?.combatState?.isActive || false);

    const modalManager = props.modalManager;
    const {
        handleCloseTooltip,
        openModal,
        openCharacterModal,
        setIsMobileNavOpen,
    } = modalManager;

    const isCombatActive = useMemo(() => !!gameState?.combatState?.isActive, [gameState?.combatState]);
    const isAuctionActive = useMemo(() => !!gameState?.auctionState?.isActive, [gameState?.auctionState]);

    const gameEngine = useGameEngine({
        onSaveGame,
    });
    
    const isProcessing = useMemo(() => gameEngine.isAITurnProcessing || gameEngine.isAnalyzing || gameEngine.isEnriching, [gameEngine.isAITurnProcessing, gameEngine.isAnalyzing, gameEngine.isEnriching]);

    const gameActions = useGameActions({
        onSaveGame,
        onNavigateToMenu,
        setError: gameEngine.setError,
        processTurn: gameEngine.processTurn,
        analyzeAction: gameEngine.analyzeAction,
    });
    
    const scrollToBottom = useCallback((behavior: 'smooth' | 'auto' = 'smooth') => {
        gameBodyRef.current?.scrollTo({
            top: gameBodyRef.current.scrollHeight,
            behavior: behavior,
        });
    }, []);

    // REFACTOR: Logic moved from GameView component to this manager hook for cleanliness.
    const handlePause = useCallback(() => dispatch({ type: 'PAUSE_GAME' }), [dispatch]);
    const handleResume = useCallback(() => dispatch({ type: 'RESUME_GAME' }), [dispatch]);
    
    const handleSurrender = useCallback(() => {
        handleResume();
        gameEngine.processTurn({ description: "Đầu hàng" }, true);
    }, [handleResume, gameEngine]);

    const handleTestCombat = useCallback(() => {
        dispatch({ type: 'START_TEST_COMBAT' });
        addToast("Bắt đầu trận chiến thử nghiệm...", "info");
    }, [dispatch, addToast]);
    
    useEffect(() => {
        const latestTurn = gameState?.turns?.[gameState.turns.length - 1];
        if (!latestTurn || latestTurn.id === acknowledgedTurnId) {
            return;
        }

        if (isCombatActive || isAuctionActive || postEventSummary || pendingEvent) {
            return;
        }
    
        setAcknowledgedTurnId(latestTurn.id);

        const textToScan = latestTurn.story + ' ' + gameState.actions.map(a => a.description).join(' ');
        
        const highConfidenceCombatKeywords = ['chiến đấu', 'giao thủ', 'tấn công', 'đánh nhau', 'giao tranh', 'giao chiến'];
        const friendlyKeywords = ['tỷ thí', 'giao hữu', 'giao đấu', 'luyện tập', 'đấu thử'];
        const hasTextTrigger = highConfidenceCombatKeywords.some(kw => textToScan.toLowerCase().includes(kw));

        const isCombatActionSuggested = gameState.actions.some(action => 
            action.description.toLowerCase().startsWith('tấn công')
        );

        if (hasTextTrigger && isCombatActionSuggested) {
            const npcRegex = /\[NPC:([^\]]+)\]/g;
            let match;
            const opponentNamesInStory = new Set<string>();
            while ((match = npcRegex.exec(latestTurn.story)) !== null) {
                const npcName = match[1];
                if (!gameState.character.harem?.includes(npcName)) {
                    opponentNamesInStory.add(npcName);
                }
            }
            
            const opponents = gameState.knowledgeBase.npcs.filter(npc => opponentNamesInStory.has(npc.name));
            const opponentIds = opponents.map(opp => opp.id).sort();

            if (opponentIds.length > 0 && !(gameState.combatState.isActive && gameState.combatState.combatMode === 'narrative')) {
                const isFriendly = friendlyKeywords.some(kw => textToScan.toLowerCase().includes(kw));
                const eventId = `combat-${opponentIds.join('-')}`;
                if (skippedEvent?.id !== eventId) {
                    setPendingEvent({
                        id: eventId,
                        type: 'combat',
                        opponentNames: opponents.map(o => o.displayName),
                        opponentIds: opponentIds,
                        isLethal: !isFriendly,
                    });
                    setSkippedEvent(null);
                    return;
                }
            }
        }

        const auctionKeywords = ['đấu giá'];
        const hasAuctionTrigger = auctionKeywords.some(kw => textToScan.toLowerCase().includes(kw));
        if (hasAuctionTrigger) {
            const eventId = `auction-${latestTurn.id}`;
            if (skippedEvent?.id !== eventId) {
                setPendingEvent({
                    id: eventId,
                    type: 'auction'
                });
                setSkippedEvent(null);
                return;
            }
        }

    }, [gameState?.turns, isCombatActive, isAuctionActive, postEventSummary, acknowledgedTurnId, gameState?.actions, gameState?.character?.harem, gameState?.knowledgeBase?.npcs, pendingEvent, skippedEvent]);


    const handleConfirmEvent = () => {
        if (!pendingEvent || !gameState) return;

        if (pendingEvent.type === 'combat') {
            const opponents = gameState.knowledgeBase.npcs.filter(npc => 
                pendingEvent.opponentNames?.includes(npc.name) || pendingEvent.opponentIds?.includes(npc.id)
            );
            const opponentIds = opponents.map(opp => opp.id);
    
            if (opponentIds.length > 0) {
                dispatch({ type: 'START_COMBAT', payload: { opponentIds, isLethal: pendingEvent.isLethal } });
            } else {
                addToast("Không tìm thấy đối thủ được đề cập để bắt đầu chiến đấu.", "warning");
            }
        } else if (pendingEvent.type === 'auction') {
            dispatch({ type: 'START_TEST_AUCTION' });
        }
    
        setPendingEvent(null);
        setSkippedEvent(null);
    };
    
    const handleCancelEvent = () => {
        if (pendingEvent) {
            setSkippedEvent(pendingEvent);
        }
        setPendingEvent(null);
    };

    const handleOpenSkippedEvent = () => {
        if (skippedEvent) {
            setPendingEvent(skippedEvent);
            setSkippedEvent(null);
        }
    };

    useEffect(() => {
        const combatWasActive = prevCombatState.current;
        const combatIsNowInactive = !isCombatActive;

        if (combatWasActive && combatIsNowInactive) {
            const playerParty = [gameState.character, ...(gameState.character.harem?.map(name => gameState.knowledgeBase.npcs.find(n => n.name === name)).filter(Boolean) || [])];
            const isDefeat = playerParty.every(member => member?.stats.some(s => s.name === 'Trạng thái Tử vong'));
            
            if (isDefeat) {
                setPostEventSummary({ type: 'combat', data: { status: 'defeat', expGained: 0, itemsGained: [], moneyGained: 0, defeatedOpponents: [] } });
            } else {
                 const defeatedOpponentObjects = (gameState.combatState.opponentIds || [])
                    .map(id => gameState.knowledgeBase.npcs.find(n => n.id === id))
                    .filter((n): n is Character => !!n);
                const totalCombatPower = defeatedOpponentObjects.reduce((sum, opp) => sum + calculateCombatPower(opp), 0);
                const expGained = Math.round(totalCombatPower * 0.25);
                const moneyGained = Math.round(totalCombatPower * 0.1) + Math.floor(Math.random() * (totalCombatPower * 0.05));
                const defeatedOpponents = defeatedOpponentObjects.map(opp => opp.displayName);
                const itemsGained: Stat[] = [];
                defeatedOpponentObjects.forEach((opp: Character) => {
                    const potentialDrops = opp.stats?.filter((s: Stat) => s.category === 'Vật phẩm' || s.category === 'Nguyên liệu') || [];
                    potentialDrops.forEach((item: Stat) => {
                        const rarity = item.rarity || 'Phổ thông';
                        let dropChance = 0;
                        switch(rarity) {
                            case 'Phổ thông': dropChance = 0.5; break;
                            case 'Hiếm': dropChance = 0.2; break;
                            case 'Sử thi': dropChance = 0.05; break;
                            case 'Huyền thoại': dropChance = 0.01; break;
                            default: dropChance = 0.6; 
                        }
                        if (item.category === 'Nguyên liệu') dropChance = 0.75;

                        if (Math.random() < dropChance) {
                            const newItem = { ...item, id: generateUniqueId('item-drop') };
                            itemsGained.push(newItem);
                        }
                    });
                });
                const currentInventorySize = gameState.character.stats.filter(s => s.category === 'Vật phẩm' || s.category === 'Nguyên liệu').length;
                const spaceAvailable = INVENTORY_LIMIT - currentInventorySize;
                const itemsToAdd = itemsGained.slice(0, spaceAvailable);
                if (itemsGained.length > itemsToAdd.length) {
                    addToast('Túi đồ đã đầy! Một số vật phẩm không thể nhận.', 'warning');
                }
                
                // Set the summary, which now contains all reward data for the next step.
                setPostEventSummary({ type: 'combat', data: { status: 'victory', expGained, itemsGained: itemsToAdd, moneyGained, defeatedOpponents } });
            }
        }
        prevCombatState.current = isCombatActive;
    }, [isCombatActive, gameState, worldSettings, dispatch, addToast]);

    const handleCloseSummary = useCallback(() => {
        setPostEventSummary(null);
        if (!isCombatActive) {
            dispatch({ type: 'UPDATE_COMBAT_STATE', payload: { isActive: false, opponentIds: [], combatLog: [] } });
        }
    }, [dispatch, isCombatActive]);
    
    const handleContinueAfterEvent = useCallback(async (summary: PostEventSummary): Promise<void> => {
        if (summary.type === 'combat' && summary.data.status === 'victory') {
            const { expGained, moneyGained, itemsGained } = summary.data;
            const newStats = [...gameState.character.stats];
            newStats.push(...itemsGained);
            let expUpdated = false;
            let moneyUpdated = false;
            const currencyName = getCurrencyName(worldSettings.genre, worldSettings.setting);

            const finalStats = newStats.map(s => {
                if (s.name === 'Kinh Nghiệm') {
                    const currentValue = typeof s.value === 'string' ? parseInt(s.value.split('/')[0], 10) : (s.value as number | undefined) || 0;
                    const max = typeof s.value === 'string' ? s.value.split('/')[1] : '100';
                    expUpdated = true;
                    return { ...s, value: `${currentValue + expGained}/${max}` };
                }
                if (s.name === currencyName) {
                    moneyUpdated = true;
                    return { ...s, value: (s.value as number || 0) + moneyGained };
                }
                return s;
            });
            if (!expUpdated && expGained > 0) finalStats.push({ id: generateUniqueId('stat-exp'), name: 'Kinh Nghiệm', value: `${expGained}/100`, category: 'Thuộc tính', description: 'Điểm kinh nghiệm để lên cấp.' });
            if (!moneyUpdated && moneyGained > 0) finalStats.push({ id: generateUniqueId('stat-money'), name: currencyName, value: moneyGained, category: 'Tài sản', description: 'Tiền tệ.' });
            
            dispatch({ type: 'UPDATE_CHARACTER', payload: { characterName: gameState.character.name, updates: { stats: finalStats } }});
        }

        handleCloseSummary();
        let summaryText = '';
        if (summary.type === 'combat') {
            const data = summary.data;
            if (data.status === 'victory') {
                summaryText = `Trận chiến vừa kết thúc với chiến thắng. Phần thưởng: ${data.expGained} EXP, ${formatCurrency(data.moneyGained, worldSettings.genre, worldSettings.setting)}, và các vật phẩm.`;
            } else {
                summaryText = 'Trận chiến vừa kết thúc với thất bại.';
            }
        }
        const prompt = `Sự kiện vừa kết thúc. Tóm tắt: ${summaryText}. Viết diễn biến tiếp theo và đề xuất hành động mới.`;
        await gameEngine.processTurn({ id: 'ai_continue_event', description: prompt }, true);
    }, [handleCloseSummary, gameEngine, worldSettings, gameState, dispatch]);

    useEffect(() => { scrollToBottom('auto'); }, [gameState.turns, scrollToBottom]);
    
    const handleNavClick = useCallback((label: string) => {
    console.log('handleNavClick called with label:', label);
    gameEngine.setError(null);
    handleCloseTooltip();
    setIsMobileNavOpen(false);
    if (label === 'Nhân Vật') openCharacterModal(gameState.character.name);
    else if (label === 'Hậu Cung') openModal('harem');
    else if (label === 'Cài Đặt') openModal('settings');
    else if (label === 'Tạm Dừng') dispatch({ type: 'PAUSE_GAME' });
    else if (label === 'Trợ giúp') openModal('help');
    else if (label === 'Luật Lệ') openModal('lore');
    else if (label === 'Bản Đồ') openModal('map');
    else if (label === 'Dòng Chảy Sự Kiện') openModal('memory');
    else if (label === 'Tri Thức') openModal('knowledge');
    else if (label === 'Thư Viện') openModal('gallery');
    else if (label === 'Lịch Sử') openModal('history');
    else if (label === 'Chế Tạo') openModal('crafting');
    else if (label === 'Lưu Tệp') gameActions.handleSaveToFile();
    else if (label === 'Thoát') onNavigateToMenu();
    }, [gameState.character, gameEngine, gameActions, onNavigateToMenu, openModal, openCharacterModal, handleCloseTooltip, setIsMobileNavOpen, dispatch]);
    
    const handleTestAuction = useCallback(() => {
        dispatch({ type: 'START_TEST_AUCTION' });
        addToast("Bắt đầu phiên đấu giá thử nghiệm...", "info");
    }, [dispatch, addToast]);
    
    const turnsToDisplay = useMemo(() => gameState?.turns?.slice(-20) || [], [gameState?.turns]);

    return {
        gameState, settings, gameBodyRef, 
        gameEngine, gameActions, isProcessing, isCombatActive, isAuctionActive,
        scrollToBottom, handleNavClick, turnsToDisplay, dispatch, handleTestAuction,
        postEventSummary, handleCloseSummary, pendingEvent, handleConfirmEvent, handleCancelEvent,
        skippedEvent, handleOpenSkippedEvent,
        handleContinueAfterEvent,
        handlePause,
        handleResume,
        handleSurrender,
        handleTestCombat,
        isTokenLimitError: gameEngine.isTokenLimitError,
        handleEmergencyTokenReductionAndRetry: gameEngine.handleEmergencyTokenReductionAndRetry,
        processingError: gameEngine.processingError,
        clearProcessingError: gameEngine.clearProcessingError,
    };
};