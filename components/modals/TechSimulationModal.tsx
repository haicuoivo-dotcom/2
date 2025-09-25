/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect, useRef } from 'react';
import { Modal } from '../ui/Modal';
import { useGameContext } from '../contexts/GameContext';
import { useGameAI } from '../../hooks/useGameAI';
import { useAppContext } from '../contexts/AppContext';
import { InlineStoryRenderer } from '../game/StoryRenderer';
import { generateUniqueId } from '../../utils/id';
import type { TimelineBlock } from '../../types';

interface TechSimulationModalProps {
    onClose: () => void;
    // FIX: Add missing prop for API request counting.
    incrementApiRequestCount: () => void;
}

interface AnalysisResult {
    hiddenRelationships: { character1: string, character2: string, relationship: string, evidence: string }[];
    futurePredictions: { prediction: string, reasoning: string }[];
    strategicAdvice: { advice: string, justification: string }[];
}

export const TechSimulationModal = ({ onClose, incrementApiRequestCount }: TechSimulationModalProps) => {
    const { gameState } = useGameContext();
    const { addToast } = useAppContext();
    const [activeTab, setActiveTab] = useState<'bigData' | 'blockchain'>('bigData');
    
    // Big Data State
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisTime, setAnalysisTime] = useState(0);
    const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
    const analysisTimerRef = useRef<number | null>(null);

    // This is a dummy useGameAI hook just to get the analyzeBigData function.
    // The other features of the hook are not used here.
    const { analyzeBigData } = useGameAI({
        onSaveGame: () => {},
        incrementApiRequestCount: incrementApiRequestCount,
        isAITurnProcessing: false,
        isCombatActive: false,
        isPredicting: false,
    });
    
    useEffect(() => {
        if (isAnalyzing) {
            setAnalysisTime(0);
            analysisTimerRef.current = window.setInterval(() => {
                setAnalysisTime(prev => prev + 1);
            }, 1000);
        } else {
            if (analysisTimerRef.current) clearInterval(analysisTimerRef.current);
        }
        return () => {
            if (analysisTimerRef.current) clearInterval(analysisTimerRef.current);
        };
    }, [isAnalyzing]);
    
    const handleRunAnalysis = async () => {
        setIsAnalyzing(true);
        setAnalysisResult(null);
        try {
            const result = await analyzeBigData(gameState);
            setAnalysisResult(result);
            addToast("Phân tích dữ liệu lớn hoàn tất!", "success");
        } catch (error) {
            // Error toast is handled inside useGameAI
        } finally {
            setIsAnalyzing(false);
        }
    };
    
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    };

    const renderBigDataTab = () => (
        <div className="tech-sim-content">
            <div className="tech-sim-actions">
                <button className="lore-button save-apply" onClick={handleRunAnalysis} disabled={isAnalyzing}>
                    {isAnalyzing ? <><span className="spinner spinner-sm"></span> Đang Phân tích... ({formatTime(analysisTime)})</> : 'Bắt đầu Phân Tích Sâu'}
                </button>
                <p className="field-hint">Chi phí: ~1 Yêu cầu API. AI sẽ phân tích toàn bộ trạng thái game để tìm ra các thông tin ẩn và đưa ra dự đoán.</p>
            </div>

            {isAnalyzing && (
                <div className="tech-sim-loading">
                    <div className="scanner-bar"></div>
                    <p>Đang xử lý {gameState.turns.length} lượt chơi và {gameState.knowledgeBase.npcs.length} thực thể...</p>
                </div>
            )}
            
            {analysisResult && (
                <div className="analysis-results">
                    <div className="analysis-section">
                        <h4>🔮 Dự Đoán Tương Lai</h4>
                        <ul>
                            {analysisResult.futurePredictions.map(p => (
                                <li key={generateUniqueId('pred')}>
                                    <strong>{p.prediction}</strong>
                                    <p><em>Lý do: {p.reasoning}</em></p>
                                </li>
                            ))}
                        </ul>
                    </div>
                     <div className="analysis-section">
                        <h4>❤️ Mối Quan Hệ Tiềm Ẩn</h4>
                         <ul>
                            {analysisResult.hiddenRelationships.map(r => (
                                <li key={generateUniqueId('rel')}>
                                    <strong>{r.character1} & {r.character2}: {r.relationship}</strong>
                                    <p><em>Bằng chứng: {r.evidence}</em></p>
                                </li>
                            ))}
                        </ul>
                    </div>
                     <div className="analysis-section">
                        <h4>📝 Lời Khuyên Chiến Lược</h4>
                         <ul>
                            {analysisResult.strategicAdvice.map(a => (
                                <li key={generateUniqueId('adv')}>
                                    <strong>{a.advice}</strong>
                                    <p><em>Lý do: {a.justification}</em></p>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );

    const renderBlockchainTab = () => (
        <div className="tech-sim-content">
             <div className="blockchain-timeline">
                {(gameState.timeline || []).length > 0 ? (
                    [...gameState.timeline].reverse().map((block: TimelineBlock, index: number, arr) => (
                        <React.Fragment key={block.id}>
                            <div className="timeline-block">
                                <div className="timeline-block-header">
                                    <span className="block-timestamp">Thời gian: Ngày {block.timestamp.day}-{block.timestamp.month}-{block.timestamp.year}</span>
                                    <span className="block-hash" title={block.hash}>Hash: ...{block.hash.slice(-8)}</span>
                                </div>
                                <div className="timeline-block-content">
                                    <p><InlineStoryRenderer text={block.summary} gameState={gameState} onEntityClick={() => {}} /></p>
                                </div>
                            </div>
                            {index < arr.length - 1 && <div className="timeline-connector"></div>}
                        </React.Fragment>
                    ))
                ) : (
                    <p className="field-hint" style={{textAlign: 'center', padding: '2rem'}}>Chưa có sự kiện cột mốc nào được ghi lại.</p>
                )}
            </div>
        </div>
    );
    
    return (
        <Modal
            onClose={onClose}
            header={<h3>Mô Phỏng Công Nghệ</h3>}
            className="tech-sim-modal"
        >
            <div className="api-key-tabs">
                <button className={`api-key-tab-button ${activeTab === 'bigData' ? 'active' : ''}`} onClick={() => setActiveTab('bigData')}>Phân Tích Sâu (Big Data)</button>
                <button className={`api-key-tab-button ${activeTab === 'blockchain' ? 'active' : ''}`} onClick={() => setActiveTab('blockchain')}>Dòng Thời Gian (Blockchain)</button>
            </div>
            <div className={`api-key-tab-content active`}>
                {activeTab === 'bigData' ? renderBigDataTab() : renderBlockchainTab()}
            </div>
        </Modal>
    );
};