/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { useCallback, useEffect } from 'react';
import './GameView.css';
import { GameModals } from '../game/GameModals';
// FIX: Changed import path to use the refactored CombatView component.
import { CombatView } from '../game/CombatView';
import { AuctionView } from '../game/AuctionView';
import { GameHeader } from '../game/GameHeader';
import { GameBody } from '../game/GameBody';
import { GameFooter } from '../game/GameFooter';
import { MobileNavPanel } from '../game/MobileNavPanel';
import { DraggableButton } from '../ui/DraggableButton';
import { PostEventModal } from '../modals/PostEventModal';
import { PreEventModal } from '../modals/PreEventModal';
import { PauseModal } from '../modals/PauseModal';
import { TokenLimitModal } from '../modals/TokenLimitModal';
import { ErrorDetailModal } from '../modals/ErrorDetailModal';
import { useGameViewManager } from '../../hooks/useGameViewManager';
import { useModalManager } from '../../hooks/useModalManager';
import { GameEngineProvider } from '../contexts/GameEngineContext';
// FIX: Add useGameContext to access state and dispatch for the new local function.
import { useGameContext } from '../contexts/GameContext';
// FIX: Add utility imports for the new local function.
import { formatCurrency, getCurrencyName } from '../../utils/game';
import { generateUniqueId } from '../../utils/id';
// FIX: Add PostEventSummary to the type imports.
import type { GameState, WorldSettings, PostEventSummary } from '../../types';

interface GameViewProps {
    onNavigateToMenu: () => void;
    onSaveGame: (gameState: GameState, worldSettings: WorldSettings) => void;
    onOpenLoadGameModal: () => void;
    modalManager: ReturnType<typeof useModalManager>;
    // FIX: Add missing props for toast and API count to pass down to modals.
    addToast: (message: string, type?: 'info' | 'success' | 'error' | 'warning', details?: any) => void;
    incrementApiRequestCount: () => void;
}

export const GameView = (props: GameViewProps) => {
    // ...existing code...
    // ...existing code...
    const { modalManager, onNavigateToMenu, addToast, incrementApiRequestCount } = props;
    const { gameState: contextGameState, worldSettings, dispatch } = useGameContext();

    // Luôn lấy gameViewManager từ useGameViewManager
    const gameViewManager = useGameViewManager(props);
    const {
        gameState,
        settings,
        gameBodyRef,
        gameEngine,
        gameActions,
        isProcessing,
        isCombatActive,
        isAuctionActive,
        scrollToBottom,
        handleNavClick,
        turnsToDisplay,
        handleTestAuction,
        postEventSummary,
        handleCloseSummary,
        pendingEvent,
        handleConfirmEvent,
        handleCancelEvent,
        skippedEvent,
        handleOpenSkippedEvent,
        handlePause,
        handleResume,
        handleSurrender,
        handleTestCombat,
        isTokenLimitError,
        handleEmergencyTokenReductionAndRetry,
        processingError,
        clearProcessingError,
    } = gameViewManager;

    const {
        isMobileNavOpen,
        isFooterVisible,
        isHeaderCollapsed,
        setIsMobileNavOpen,
        setIsFooterVisible,
        setIsHeaderCollapsed,
        openModal
    } = modalManager;

    // LOG DEBUG GIÁ TRỊ TRUYỀN VÀO GAMEHEADER
    // Đặt sau khi đã khai báo các biến callback


    // FIX: Implement handleContinueAfterEvent locally to resolve the 'Cannot find name' error.
    // This function was likely defined in useGameViewManager but not exported.
    const handleContinueAfterEvent = useCallback(async (summary: PostEventSummary): Promise<void> => {
        if (!contextGameState || !worldSettings) return;
        if (summary.type === 'combat' && summary.data.status === 'victory') {
            const { expGained, moneyGained, itemsGained } = summary.data;
            const newStats = [...contextGameState.character.stats];
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
            if (dispatch && contextGameState.character) {
                dispatch({ type: 'UPDATE_CHARACTER', payload: { characterName: contextGameState.character.name, updates: { stats: finalStats } }});
            }
        }
        if (typeof handleCloseSummary === 'function') handleCloseSummary();
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
        if (gameEngine && typeof gameEngine.processTurn === 'function') {
            await gameEngine.processTurn({ id: 'ai_continue_event', description: prompt }, true);
        }
    }, [handleCloseSummary, gameEngine, worldSettings, contextGameState, dispatch]);

    // FIX: Implemented handleRenameEntity locally as it's missing from the useGameActions hook provided.
    // This follows the established pattern in this file for handling missing hook exports.
    const handleRenameEntity = useCallback((oldName: string, newName: string) => {
        dispatch({ type: 'RENAME_ENTITY', payload: { oldName, newName } });
        addToast('Thực thể đã được đổi tên.', 'success');
    }, [dispatch, addToast]);
    
    const handleMobileNavOpen = useCallback(() => {
        setIsMobileNavOpen(true);
    }, [setIsMobileNavOpen]);

    const handleToggleHeaderCollapse = useCallback(() => {
        setIsHeaderCollapsed(p => !p);
    }, [setIsHeaderCollapsed]);

    const handleAuctionPauseToggle = useCallback(() => {
        if (gameState && gameState.isPaused) {
            if (typeof handleResume === 'function') handleResume();
        } else {
            if (typeof handlePause === 'function') handlePause();
        }
    }, [gameState, handlePause, handleResume]);

    // LOG trạng thái AI processing
    console.log('AI processing (gameEngine.isAITurnProcessing):', gameEngine.isAITurnProcessing);

    // LOG DEBUG GIÁ TRỊ TRUYỀN VÀO GAMEHEADER
    console.log('DEBUG GameHeader props:', {
        isHeaderCollapsed,
        handleToggleHeaderCollapse,
        handleNavClick,
        handleMobileNavOpen,
        handleRevertToPreviousTurn: gameActions.handleRevertToPreviousTurn,
        handlePause,
        handleResume,
        gameEngine_isAITurnProcessing: gameEngine.isAITurnProcessing
    });
    
    // Bỏ điều kiện return khi !gameState, luôn render giao diện game
    // Tự động tóm tắt/gom nhóm ký ức dưới 75 điểm mỗi 50 lượt chơi
    useEffect(() => {
        if (!gameState || !gameState.history) return;
        const turnCount = gameState.history.length;
        if (turnCount > 0 && turnCount % 50 === 0) {
            const memoriesToSummarize = (gameState.memories || []).filter(m => (m.relevanceScore || 0) < 75);
            if (memoriesToSummarize.length > 0) {
                // TODO: Thực hiện tóm tắt/gom nhóm ký ức ở đây (ví dụ: gửi lên API hoặc dispatch action)
                addToast(`Có ${memoriesToSummarize.length} ký ức dưới 75 điểm cần tóm tắt/gom nhóm.`, 'info');
            }
        }
    }, [gameState?.history?.length]);
    
    if (pendingEvent) {
        return <PreEventModal type={pendingEvent.type} onConfirm={handleConfirmEvent} onCancel={handleCancelEvent} opponentNames={pendingEvent.opponentNames} />;
    } else if (postEventSummary) {
        // FIX: Type '() => void' is not assignable to type '() => Promise<void>'.
        // The onContinue prop for PostEventModal expects a function returning a Promise<void>.
        // Using an async arrow function that awaits handleContinueAfterEvent ensures the returned type is a Promise, satisfying the prop type.
        return <PostEventModal summary={postEventSummary} onClose={handleCloseSummary} onContinue={async () => await handleContinueAfterEvent(postEventSummary)} />;
    }

    // LOG DEBUG GIÁ TRỊ TRUYỀN VÀO GAMEHEADER
    console.log('DEBUG GameHeader props:', {
        isHeaderCollapsed,
        handleToggleHeaderCollapse,
        handleNavClick,
        handleMobileNavOpen,
        handleRevertToPreviousTurn: gameActions.handleRevertToPreviousTurn,
        handlePause,
        handleResume,
        gameEngine_isAITurnProcessing: gameEngine.isAITurnProcessing
    });

    return (
        <GameEngineProvider value={gameEngine}>
            <div className="game-container">
                {/* Modal blocks: đảm bảo mỗi block JSX đều đóng đúng */}
                {settings.showCombatView && processingError && (
                    <ErrorDetailModal
                        details={processingError}
                        onClose={clearProcessingError}
                        onRetry={gameEngine.retryLastAction}
                        onOptimizedRetry={handleEmergencyTokenReductionAndRetry}
                    />
                )}
                {settings.showCombatView && isTokenLimitError && (
                    <TokenLimitModal 
                        onRetry={async () => { await handleEmergencyTokenReductionAndRetry(); }}
                        onClose={() => gameEngine.setError(null)}
                    />
                )}
                {settings.showCombatView && gameState.isPaused && (
                    <PauseModal
                        onResume={handleResume}
                        onSurrender={handleSurrender}
                        isCombatActive={isCombatActive}
                        onNavigateToMenu={onNavigateToMenu}
                    />
                )}
                {settings.showAiButton && !isCombatActive && !isAuctionActive && (
                    <DraggableButton
                        modalManager={modalManager}
                        onTestCombat={handleTestCombat}
                        onTestAuction={handleTestAuction}
                    />
                )}
                <MobileNavPanel 
                    isOpen={isMobileNavOpen && !isCombatActive && !isAuctionActive} 
                    onClose={() => setIsMobileNavOpen(false)} 
                    onNavClick={handleNavClick} 
                    historyLength={gameState.history.length}
                    isProcessing={isProcessing}
                    isCombatActive={isCombatActive}
                />
                <GameModals
                    addToast={addToast}
                    incrementApiRequestCount={incrementApiRequestCount}
                    manuallyTriggerWorldHealing={gameEngine.manuallyTriggerWorldHealing}
                    supplementSingleCharacter={gameEngine.supplementSingleCharacter}
                    modalManager={modalManager}
                    settings={settings}
                    handleSaveLore={gameActions.handleSaveLore}
                    handlePinMemory={gameActions.handlePinMemory}
                    handleDeleteMemory={gameActions.handleDeleteMemory}
                    handleRevert={gameActions.handleRevert}
                    handleRenameEntity={handleRenameEntity}
                    handleUpdateCharacterData={gameActions.handleUpdateCharacterData}
                    handleUpdateWorldSummary={gameActions.handleUpdateWorldSummary}
                    handleUpdateWorldLogic={gameActions.handleUpdateWorldLogic}
                    handleUpdateWorldEvents={gameActions.handleUpdateWorldEvents}
                    handleCraftItem={gameActions.handleCraftItem}
                    onItemAction={gameActions.handleItemAction}
                    handleCleanupData={gameActions.handleCleanupData}
                    />
                {/* Sử dụng settings.showCombatView để kiểm soát hoàn toàn logic CombatView */}
                {settings.showCombatView && isCombatActive ? (
                    <header className="game-header combat-only-header">
                        <h1 className="game-title">Chiến đấu</h1>
                        <div className="combat-header-actions">
                            <button className="nav-button" onClick={gameState.isPaused ? handleResume : handlePause} disabled={isProcessing}>{gameState.isPaused ? 'Tiếp Tục' : 'Tạm Dừng'}</button>
                            <button className="nav-button danger" onClick={onNavigateToMenu}>Thoát</button>
                        </div>
                    </header>
                ) : isAuctionActive ? (
                    <header className="game-header combat-only-header">
                        <h1 className="game-title">Đấu giá</h1>
                    </header>
                ) : (
                    <GameHeader 
                        isHeaderCollapsed={isHeaderCollapsed}
                        onToggleCollapse={handleToggleHeaderCollapse}
                        onDesktopNavClick={handleNavClick}
                        onMobileNavOpen={handleMobileNavOpen}
                        onRevertToPreviousTurn={gameActions.handleRevertToPreviousTurn}
                        // ...existing code...
                    />
                )}
                <div className="game-main-content">
                    {settings.showCombatView && isCombatActive ? (
                        <CombatView
                            onAction={gameActions.handleAction}
                            isProcessing={isProcessing}
                            isAutoCombatActive={gameEngine.isAutoCombatActive}
                            toggleAutoCombat={gameEngine.toggleAutoCombat}
                            combatEvents={gameEngine.lastTurnEvents || []}
                            onEntityMouseEnter={(e, name, type) => modalManager.handleEntityMouseEnter(e, name, type, 'combat')}
                            onEntityMouseLeave={modalManager.handleEntityMouseLeave}
                            onStatusMouseEnter={modalManager.handleStatusMouseEnter}
                            onStatusMouseLeave={modalManager.handleStatusMouseLeave}
                        />
                    ) : isAuctionActive ? (
                        <AuctionView 
                            areCheatsEnabled={settings.enableCheats}
                            onUpdateCharacterData={gameActions.handleUpdateCharacterData}
                            onOpenModal={openModal}
                            onPause={handleAuctionPauseToggle}
                            onNavigateToMenu={onNavigateToMenu}
                            isProcessing={isProcessing}
                            onEntityMouseEnter={modalManager.handleEntityMouseEnter}
                            onEntityMouseLeave={modalManager.handleEntityMouseLeave}
                        />
                    ) : (
                        <>
                            <GameBody 
                                ref={gameBodyRef}
                                turns={turnsToDisplay}
                                onEntityClick={modalManager.handleEntityClick}
                                onEntityMouseEnter={modalManager.handleEntityMouseEnter}
                                onEntityMouseLeave={modalManager.handleEntityMouseLeave}
                                onEntityDoubleClick={modalManager.handleEntityDoubleClick}
                                onAvatarClick={modalManager.handleAvatarClick}
                            />
                            <GameFooter
                                onEntityClick={modalManager.handleEntityClick}
                                onEntityMouseEnter={modalManager.handleEntityMouseEnter}
                                onEntityMouseLeave={modalManager.handleEntityMouseLeave}
                                onEntityDoubleClick={modalManager.handleEntityDoubleClick}
                                onAction={gameActions.handleAction}
                                onAnalyzeAction={gameActions.handleAnalyzeAction}
                                onScrollToBottom={scrollToBottom}
                                isFooterVisible={isFooterVisible}
                                setIsFooterVisible={setIsFooterVisible}
                                skippedEvent={skippedEvent}
                                onOpenSkippedEvent={handleOpenSkippedEvent}
                                isProcessing={isProcessing}
                                isAnalyzing={gameEngine.isAnalyzing}
                                actionAnalysis={gameEngine.actionAnalysis}
                                setActionAnalysis={gameEngine.setActionAnalysis}
                                processingTime={gameEngine.processingTime}
                            />
                        </>
                    )}
                </div>
            </div>
        </GameEngineProvider>
    );
};
