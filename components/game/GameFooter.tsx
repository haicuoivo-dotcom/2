/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { useGameContext } from '../contexts/GameContext';
import { useSettings } from '../contexts/SettingsContext';
import { useGameEngineContext } from '../contexts/GameEngineContext';
import { InlineStoryRenderer } from './StoryRenderer';
import { useGameFooterManager } from '../../hooks/useGameFooterManager';
import type { GameAction, PreEventDetails } from '../../types';

interface GameFooterProps {
    onEntityClick: (event: React.MouseEvent, name: string, type: string) => void;
    onEntityMouseEnter: (event: React.MouseEvent, name: string, type: string) => void;
    onEntityMouseLeave: () => void;
    onEntityDoubleClick: (event: React.MouseEvent, name: string, type: string) => void;
    onAction: (action: Partial<GameAction>, isCustom?: boolean) => void;
    onAnalyzeAction: (customAction: string) => void;
    onScrollToBottom: (behavior: 'smooth' | 'auto') => void;
    isFooterVisible: boolean;
    setIsFooterVisible: (visible: boolean) => void;
    skippedEvent: PreEventDetails | null;
    onOpenSkippedEvent: () => void;
    // FIX: Add missing props required by useGameFooterManager.
    isProcessing: boolean;
    isAnalyzing: boolean;
    actionAnalysis: any;
    setActionAnalysis: (analysis: any) => void;
    processingTime: number;
}

export const GameFooter = React.memo((props: GameFooterProps) => {
    const {
        onEntityClick, onEntityMouseEnter, onEntityMouseLeave, onEntityDoubleClick, 
        onScrollToBottom, isFooterVisible, setIsFooterVisible, skippedEvent, onOpenSkippedEvent
    } = props;

    const { gameState } = useGameContext();
    const { settings } = useSettings();
    const gameEngine = useGameEngineContext();
    
    const {
        customAction,
        handleCustomActionChange,
        handleAnalyzeActionClick,
        handleSendActionClick,
        handleKeyPress,
        analyzeDisabledReason,
        sendDisabledReason,
        allAvailableActions,
        formatProcessingTime,
    } = useGameFooterManager(props);
    
    const isProcessing = gameEngine.isAITurnProcessing || gameEngine.isAnalyzing || gameEngine.isEnriching;

    return (
        <footer className={`game-footer ${!isFooterVisible && !isProcessing && !gameEngine.processingError ? 'collapsed' : ''}`}>
            <button className="toggle-actions-button" onClick={() => setIsFooterVisible(!isFooterVisible)} aria-expanded={isFooterVisible}>
                {isFooterVisible ? 'Thu gọn' : 'Hiện gợi ý'}
            </button>
            {isFooterVisible && (
                <div className="footer-scroll-container">
                    <div className="action-grid">
                        {allAvailableActions.map((action) => (
                            <ActionChoiceButton
                                key={action.id}
                                action={action}
                                onAction={props.onAction}
                                isProcessing={isProcessing}
                                predictionStatus={gameEngine.predictionStatus}
                                predictedTurn={gameEngine.predictedTurn}
                                onEntityClick={onEntityClick}
                                onEntityMouseEnter={onEntityMouseEnter}
                                onEntityMouseLeave={onEntityMouseLeave}
                                onEntityDoubleClick={onEntityDoubleClick}
                                settings={settings}
                            />
                        ))}
                    </div>
                    <div className="input-area-wrapper">
                        <div className="custom-action-area">
                            <input type="text" className="custom-action-input" placeholder="Nhập lựa chọn của bạn hoặc dùng AI để phân tích..." value={customAction} onChange={handleCustomActionChange} onKeyPress={handleKeyPress} disabled={isProcessing} />
                            <div className="custom-action-buttons-wrapper">
                                <button 
                                    className="custom-action-button ai-button" 
                                    onClick={handleAnalyzeActionClick} 
                                    aria-label="Phân tích hành động bằng AI" 
                                    disabled={!!analyzeDisabledReason}
                                    title={analyzeDisabledReason || "Chi phí: 1 Yêu cầu API. Phân tích hành động của bạn."}
                                >
                                    {gameEngine.isAnalyzing ? '...' : 'Phân tích'}
                                </button>
                                <button 
                                    className="custom-action-button send-button" 
                                    onClick={handleSendActionClick} 
                                    disabled={!!sendDisabledReason}
                                    title={sendDisabledReason || "Chi phí: 1 Yêu cầu API. Xử lý lượt chơi."}
                                >
                                    {gameEngine.actionAnalysis ? 'Xác nhận' : 'Gửi'}
                                </button>
                                {skippedEvent && (
                                    <button
                                        className="custom-action-button event-button"
                                        onClick={onOpenSkippedEvent}
                                        title="Mở lại sự kiện đã bỏ qua"
                                    >
                                        Sự Kiện
                                    </button>
                                )}
                                <button className="custom-action-button scroll-down-button" onClick={() => onScrollToBottom('auto')} aria-label="Cuộn xuống cuối" title="Cuộn xuống cuối" disabled={isProcessing}>↓</button>
                            </div>
                        </div>

                        {gameEngine.predictionStatus === 'predicting' && (
                            <div className="loading-indicator overlay-indicator">
                                <div className="spinner spinner-md"></div>
                                <span>AI đang tiên đoán... ({formatProcessingTime(gameEngine.predictionTime)})</span>
                            </div>
                        )}
                        {(gameEngine.isAITurnProcessing || gameEngine.isEnriching) && !gameEngine.isAnalyzing && (
                            <div className="loading-indicator overlay-indicator">
                                <div className="spinner spinner-md"></div>
                                <span>
                                    {gameEngine.retryMessage ? (
                                        <span className="retry-message">{gameEngine.retryMessage}</span>
                                    ) : (
                                        gameEngine.isResolvingCombat ? "Đang tính toán kết quả trận chiến..." : (gameEngine.processingStep || 'AI đang xử lý...')
                                    )}
                                    {gameEngine.isAITurnProcessing && ` (${formatProcessingTime(gameEngine.processingTime)})`}
                                </span>
                            </div>
                        )}
                        {gameEngine.isAnalyzing && (
                            <div className="loading-indicator overlay-indicator">
                                <span className="spinner spinner-md"></span><span>AI đang phân tích hành động...</span>
                            </div>
                        )}
                        {gameEngine.processingError && ( 
                            <div className="error-message overlay-indicator">
                                <span>{gameEngine.processingError.error}</span>
                                <div className="error-actions">
                                    <button onClick={gameEngine.retryLastAction} className="error-action-button fix-button" aria-label="Thử lại hành động trước">Thử Lại</button>
                                    <button onClick={() => gameEngine.clearProcessingError()} className="error-action-button close-button" aria-label="Đóng thông báo lỗi">X</button>
                                </div>
                            </div>
                        )}
                    </div>
                    {gameEngine.actionAnalysis && <ActionAnalysisResult analysis={gameEngine.actionAnalysis} onEntityClick={onEntityClick} onEntityMouseEnter={onEntityMouseEnter} onEntityMouseLeave={onEntityMouseLeave} onEntityDoubleClick={onEntityDoubleClick} />}
                </div>
            )}
        </footer>
    );
});

// Memoized Presentational Components
const ActionChoiceButton = React.memo(({ action, onAction, isProcessing, predictionStatus, predictedTurn, onEntityClick, onEntityMouseEnter, onEntityMouseLeave, onEntityDoubleClick, settings }: any) => {
    const { gameState } = useGameContext();
    const cleanDescription = (action.description || '').replace(/\[([A-Z_]+):([^\]]+)\]/g, '$2');
    const isPredicted = predictionStatus === 'predicted' && predictedTurn?.predictedActionDescription === action.description;

    const isCombatAction = action.description === 'Bắt đầu Chiến đấu theo lượt';
    const isAuctionAction = action.description === 'Tham gia Đấu giá';

    const handleClick = () => {
        if (!isCombatAction && !isAuctionAction) {
            onAction(action);
        }
    };
    
    let buttonContent;
    let tooltipText;

    if (settings.suggestMoreActions) {
        // New mode: Show description and time cost
        buttonContent = (
            <span className="action-description">
                {cleanDescription}
                {action.timeCost && <span className="action-time-cost">({action.timeCost})</span>}
            </span>
        );
        tooltipText = isProcessing ? "AI đang xử lý..." : undefined;

    } else {
        // Original mode: Show benefit/risk/chance
        const tooltipParts = [];
        const elementsToShow = [];

        if (action.timeCost) {
            if (settings.benefitRiskAsTooltip) tooltipParts.push(`Thời gian: ${action.timeCost}`);
            else elementsToShow.push(<span key="time">{action.timeCost}</span>);
        }
        if (!gameState.isIntercourseScene && !isCombatAction && !isAuctionAction) {
            if (typeof action.successChance === 'number' && settings.showSuccessChance) {
                if (settings.benefitRiskAsTooltip) tooltipParts.push(`Thành công: ${action.successChance}%`);
                else elementsToShow.push(<span key="chance">{`${action.successChance}%`}</span>);
            }
            if (action.benefit) {
                if (settings.benefitRiskAsTooltip) tooltipParts.push(`Lợi: ${(action.benefit || '').replace(/\[([A-Z_]+):([^\]]+)\]/g, '$2')}`);
                else elementsToShow.push(<span key="benefit">Lợi: <InlineStoryRenderer text={action.benefit} gameState={gameState} onEntityClick={onEntityClick} onEntityMouseEnter={onEntityMouseEnter} onEntityMouseLeave={onEntityMouseLeave} onEntityDoubleClick={onEntityDoubleClick} /></span>);
            }
            if (action.risk) {
                if (settings.benefitRiskAsTooltip) tooltipParts.push(`Hại: ${(action.risk || '').replace(/\[([A-Z_]+):([^\]]+)\]/g, '$2')}`);
                else elementsToShow.push(<span key="risk">Hại: <InlineStoryRenderer text={action.risk} gameState={gameState} onEntityClick={onEntityClick} onEntityMouseEnter={onEntityMouseEnter} onEntityMouseLeave={onEntityMouseLeave} onEntityDoubleClick={onEntityDoubleClick} /></span>);
            }
        }
        tooltipText = isCombatAction || isAuctionAction
        ? "Tính năng này đã bị tắt. Dùng nút Test trong menu AI."
        : settings.benefitRiskAsTooltip
            ? tooltipParts.join(' | ')
            : undefined;

        buttonContent = (
            <span className="action-description">
                {cleanDescription}
                {!settings.benefitRiskAsTooltip && elementsToShow.length > 0 && ' ('}
                {!settings.benefitRiskAsTooltip && elementsToShow.map((elem, index) => (
                    <React.Fragment key={index}>{elem}{index < elementsToShow.length - 1 && ' - '}</React.Fragment>
                ))}
                {!settings.benefitRiskAsTooltip && elementsToShow.length > 0 && ')'}
            </span>
        );
    }

    const buttonClass = `
        action-button 
        ${isPredicted ? 'predicted-action' : ''} 
        ${isCombatAction ? 'combat-start-button' : ''} 
        ${isAuctionAction ? 'auction-start-button' : ''}
    `;

    return (
        <button
            className={buttonClass}
            onClick={handleClick}
            disabled={isProcessing || isCombatAction || isAuctionAction}
            title={isProcessing ? "AI đang xử lý..." : tooltipText}
        >
            {buttonContent}
        </button>
    );
});

const ActionAnalysisResult = React.memo(({ analysis, onEntityClick, onEntityMouseEnter, onEntityMouseLeave, onEntityDoubleClick }: any) => {
    const { gameState } = useGameContext();
    const { settings } = useSettings();
    const benefitText = (analysis.benefit || '').replace(/\[([A-Z_]+):([^\]]+)\]/g, '$2');
    const riskText = (analysis.risk || '').replace(/\[([A-Z_]+):([^\]]+)\]/g, '$2');
    const tooltipText = `Lợi: ${benefitText} | Hại: ${riskText}`;

    return (
        <div className="action-analysis-container" title={settings.benefitRiskAsTooltip ? tooltipText : undefined}>
            <div className="analysis-header">
                {settings.showSuccessChance && <span>Thành công: <strong className="success-rate">{analysis.successChance}%</strong></span>}
                {analysis.timeCost && <span>Thời gian: <strong className="time-cost">{analysis.timeCost}</strong></span>}
            </div>
            {!settings.benefitRiskAsTooltip && (
                <p className="analysis-details">
                    <strong className="benefit">Lợi:</strong> <InlineStoryRenderer text={analysis.benefit} gameState={gameState} onEntityClick={onEntityClick} onEntityMouseEnter={onEntityMouseEnter} onEntityMouseLeave={onEntityMouseLeave} onEntityDoubleClick={onEntityDoubleClick} />{' '}
                    <strong className="risk">Hại:</strong> <InlineStoryRenderer text={analysis.risk} gameState={gameState} onEntityClick={onEntityClick} onEntityMouseEnter={onEntityMouseEnter} onEntityMouseLeave={onEntityMouseLeave} onEntityDoubleClick={onEntityDoubleClick} />
                </p>
            )}
        </div>
    );
});