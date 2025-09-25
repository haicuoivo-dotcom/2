/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { useToasts } from '../contexts/ToastContext';
import { BackgroundManager } from '../../services/BackgroundManager';

interface BackgroundSettingsTabProps {
    onOpenBgSelector: (type: 'menu' | 'game') => void;
}

export const BackgroundSettingsTab = ({ onOpenBgSelector }: BackgroundSettingsTabProps) => {
    const { addToast } = useToasts();
    
    const handleClearMenuBackground = () => {
        BackgroundManager.clear('menu');
        addToast('Đã xóa ảnh nền Menu.', 'info');
    };
    
    const handleClearGameBackground = () => {
        BackgroundManager.clear('game');
        addToast('Đã xóa ảnh nền Game.', 'info');
    };

    return (
        <div className="settings-section">
            <h4>ẢNH NỀN</h4>
            <div className="background-controls">
                <button className="wc-button" onClick={() => onOpenBgSelector('menu')}>Chọn Nền Menu từ Thư viện</button>
                <button className="wc-button" onClick={() => onOpenBgSelector('game')}>Chọn Nền Game từ Thư viện</button>
                <button className="wc-button button-clear" onClick={handleClearMenuBackground}>Xoá Nền Menu</button>
                <button className="wc-button button-clear" onClick={handleClearGameBackground}>Xoá Nền Game</button>
            </div>
        </div>
    );
};