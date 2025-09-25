/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState } from 'react';
import { useGameContext } from '../../contexts/GameContext';
import { useAppContext } from '../../contexts/AppContext';

interface WorldSummaryTabProps {
    onUpdateWorldSummary: (newSummary: string) => void;
}

export const WorldSummaryTab = ({ onUpdateWorldSummary }: WorldSummaryTabProps) => {
    const { gameState } = useGameContext();
    const { addToast } = useAppContext();
    const [summary, setSummary] = useState(gameState.worldSummary || '');

    const handleSave = () => {
        onUpdateWorldSummary(summary);
        addToast("Đã lưu bối cảnh thế giới.", "success");
    };
    
    return (
        <div className="world-summary-editor">
            <textarea
                className="world-summary-editor-textarea"
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                rows={20}
                placeholder="Mô tả bối cảnh, lịch sử, và các chi tiết quan trọng về thế giới của bạn tại đây..."
            />
            <button className="lore-button save-apply world-summary-save-button" onClick={handleSave}>
                Lưu Bối Cảnh
            </button>
        </div>
    );
};