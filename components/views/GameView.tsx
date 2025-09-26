/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { useCallback, useEffect } from 'react';
import './GameView.css';
import { GameModals } from '../game/GameModals';
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
import { useGameContext } from '../contexts/GameContext';
import { GameEngineProvider } from '../contexts/GameEngineContext';
import { formatCurrency, getCurrencyName } from '../../utils/game';
import { generateUniqueId } from '../../utils/id';
import type { GameState, WorldSettings, PostEventSummary } from '../../types';

import { AsyncGameHandler } from '../../types/gameHandlers';

interface GameViewProps {
    onNavigateToMenu: () => void;
    onSaveGame: (gameState: GameState, worldSettings: WorldSettings) => void;
    onOpenLoadGameModal: () => void;
    modalManager: ReturnType<typeof useModalManager>;
    handleEmergencyTokenReductionAndRetry: AsyncGameHandler;
    // FIX: Add missing props for toast and API count to pass down to modals.
    addToast: (message: string, type?: 'info' | 'success' | 'error' | 'warning', details?: any) => void;
    incrementApiRequestCount: () => void;
}

export const GameView = (props: GameViewProps) => {
    // ...existing code...
    // ...existing code...
    const { addToast, modalManager, onNavigateToMenu, incrementApiRequestCount } = props;
    const { gameState: contextGameState, worldSettings, dispatch } = useGameContext();

    // Luôn lấy gameViewManager từ useGameViewManager
    const gameViewManager = useGameViewManager(props);
    const {
        gameState,
        gameEngine,
        gameActions,
        handleCloseSummary,
        handleNavClick,
        handlePause,
        handleResume,
        handleConfirmEvent,
        handleCancelEvent,
        pendingEvent,
        postEventSummary,
        settings,
        processingError,
        clearProcessingError,
        handleEmergencyTokenReductionAndRetry,
        isTokenLimitError,
        handleSurrender,
        isCombatActive,
        isAuctionActive,
        gameBodyRef,
        turnsToDisplay,
        scrollToBottom,
        isProcessing,
        handleTestCombat,
        handleTestAuction,
        skippedEvent,
        handleOpenSkippedEvent,
    } = gameViewManager;

    const {
        isHeaderCollapsed,
        setIsHeaderCollapsed,
        setIsMobileNavOpen,
        isMobileNavOpen,
        isFooterVisible,
        setIsFooterVisible,
        openModal
    } = modalManager || {};

    // LOG DEBUG GIÁ TRỊ TRUYỀN VÀO GAMEHEADER
    // Đặt sau khi đã khai báo các biến callback


    // FIX: Implement handleContinueAfterEvent locally to resolve the 'Cannot find name' error.
    // This function was likely defined in useGameViewManager but not exported.
    const handleContinueAfterEvent = useCallback(async (summary: PostEventSummary): Promise<void> => {
        if (!contextGameState || !worldSettings) return;

        if (summary.type === 'combat' && summary.data.status === 'victory') {
            const { expGained, moneyGained, itemsGained } = summary.data;
            const currencyName = getCurrencyName(worldSettings.genre, worldSettings.setting);

            // Tạo bản sao của stats để tránh mutation trực tiếp
            const baseStats = [...contextGameState.character.stats];
            
            // Tìm và cập nhật exp/money hiện có
            const hasExp = baseStats.some(s => s.name === 'Kinh Nghiệm');
            const hasMoney = baseStats.some(s => s.name === currencyName);

            // Tối ưu updates bằng cách tính toán một lần
            const updatedStats = baseStats.map(s => {
                if (s.name === 'Kinh Nghiệm') {
                    const [current, max] = (typeof s.value === 'string' ? s.value.split('/') : [String(s.value), '100']);
                    return { ...s, value: `${parseInt(current, 10) + expGained}/${max}` };
                }
                if (s.name === currencyName) {
                    return { ...s, value: (s.value as number || 0) + moneyGained };
                }
                return s;
            });

            // Tạo stats mới với category đúng kiểu
            const newExpStat = !hasExp && expGained > 0 ? [{
                id: generateUniqueId('stat-exp'),
                name: 'Kinh Nghiệm' as const,
                value: `${expGained}/100`,
                category: 'Thuộc tính' as const,
                description: 'Điểm kinh nghiệm để lên cấp.'
            }] : [];

            const newMoneyStat = !hasMoney && moneyGained > 0 ? [{
                id: generateUniqueId('stat-money'),
                name: currencyName,
                value: moneyGained,
                category: 'Tài sản' as const,
                description: 'Tiền tệ.'
            }] : [];

            // Kết hợp tất cả stats và cập nhật character
            if (dispatch && contextGameState.character) {
                const combinedStats = [
                    ...updatedStats,
                    ...itemsGained,
                    ...newExpStat,
                    ...newMoneyStat
                ];
                
                dispatch({
                    type: 'UPDATE_CHARACTER',
                    payload: {
                        characterName: contextGameState.character.name,
                        updates: { stats: combinedStats }
                    }
                });
            }
            // State updates đã được chuyển vào phần xử lý ở trên
        }

        // Đóng modal summary
        if (typeof handleCloseSummary === 'function') handleCloseSummary();

        // Tạo prompt cho AI tiếp tục
        let summaryText = '';
        if (summary.type === 'combat') {
            const data = summary.data;
            if (data.status === 'victory') {
                summaryText = `Trận chiến vừa kết thúc với chiến thắng. Phần thưởng: ${data.expGained} EXP, ${formatCurrency(data.moneyGained, worldSettings.genre, worldSettings.setting)}, và các vật phẩm.`;
            } else {
                summaryText = 'Trận chiến vừa kết thúc với thất bại.';
            }
        }

        // Xử lý lượt tiếp theo
        const prompt = `Sự kiện vừa kết thúc. Tóm tắt: ${summaryText}. Viết diễn biến tiếp theo và đề xuất hành động mới.`;
        if (gameEngine?.processTurn) {
            await gameEngine.processTurn({ id: 'ai_continue_event', description: prompt }, true);
        }
    }, [handleCloseSummary, gameEngine, worldSettings, contextGameState, dispatch]);

    // FIX: Implemented handleRenameEntity locally as it's missing from the useGameActions hook provided.
    // This follows the established pattern in this file for handling missing hook exports.
    const handleRenameEntity = useCallback((oldName: string, newName: string) => {
        dispatch({ type: 'RENAME_ENTITY', payload: { oldName, newName } });
        addToast('Thực thể đã được đổi tên.', 'success');
    }, [dispatch, addToast]);
    
    // Các handlers cho token limit error
    // Wrap async handler
    const wrappedEmergencyRetry = useCallback(async () => {
        try {
            await Promise.resolve(handleEmergencyTokenReductionAndRetry());
        } catch (error) {
            addToast('Lỗi khi thử lại: ' + (error instanceof Error ? error.message : 'Lỗi không xác định'), 'error');
        }
    }, [handleEmergencyTokenReductionAndRetry, addToast]);

    // Handlers cho UI navigation
    const handleToggleHeaderCollapse = useCallback(() => {
        setIsHeaderCollapsed((p: boolean) => !p);
    }, [setIsHeaderCollapsed]);

    const handleMobileNavOpen = useCallback(() => {
        setIsMobileNavOpen(true);
    }, [setIsMobileNavOpen]);

    const handleAuctionPauseToggle = useCallback(() => {
        if (gameState && gameState.isPaused) {
            if (typeof handleResume === 'function') handleResume();
        } else {
            if (typeof handlePause === 'function') handlePause();
        }
    }, [gameState, handlePause, handleResume]);
    // Bỏ điều kiện return khi !gameState, luôn render giao diện game
    // Tự động tóm tắt/gom nhóm ký ức dưới 75 điểm mỗi 50 lượt chơi
    useEffect(() => {
        let isMounted = true;
        
        const summarizeMemories = async () => {
            if (!gameState || !gameState.history) return;
            const turnCount = gameState.history.length;
            if (turnCount > 0 && turnCount % 50 === 0) {
                const memoriesToSummarize = (gameState.memories || []).filter(m => (m.relevanceScore || 0) < 75);
                if (memoriesToSummarize.length > 0 && isMounted) {
                    // TODO: Thực hiện tóm tắt/gom nhóm ký ức ở đây (ví dụ: gửi lên API hoặc dispatch action)
                    addToast(`Có ${memoriesToSummarize.length} ký ức dưới 75 điểm cần tóm tắt/gom nhóm.`, 'info');
                }
            }
        };

        summarizeMemories();
        
        return () => {
            isMounted = false;
        };
    }, [gameState?.history?.length, gameState?.memories, addToast]);
    
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
                        onRetry={handleEmergencyTokenReductionAndRetry}
                        onClose={useCallback(() => gameEngine.setError(null), [gameEngine])}
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
