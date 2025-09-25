/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { useSettings } from '../contexts/SettingsContext';
import { ToggleSwitch } from '../ui/ToggleSwitch';
import { CUSTOMIZABLE_BUTTONS } from '../../constants/gameConstants';
import './modals.css';
import './CustomizeUIMoal.css';

interface CustomizeUIMoalProps {
    onClose: () => void;
}

export const CustomizeUIMoal = ({ onClose }: CustomizeUIMoalProps) => {
    const { settings, updateSetting } = useSettings();

    const handleToggle = (buttonId: string, isVisible: boolean) => {
        const newVisibleButtons = {
            ...settings.visibleButtons,
            [buttonId]: isVisible,
        };
        updateSetting('visibleButtons', newVisibleButtons);
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content customize-ui-modal" onClick={e => e.stopPropagation()}>
                <header className="modal-header">
                    <h3>Tùy chỉnh Giao diện</h3>
                    <button onClick={onClose} className="modal-close-button" aria-label="Đóng">×</button>
                </header>
                <div className="modal-body customize-ui-modal-body">
                    {Object.entries(CUSTOMIZABLE_BUTTONS).map(([groupKey, group]) => (
                        <div key={groupKey} className="customize-ui-section">
                            <h4>{group.title}</h4>
                            <div className="customize-ui-grid">
                                {group.buttons.map(button => (
                                    <ToggleSwitch
                                        key={button.id}
                                        id={`toggle-${button.id}`}
                                        label={button.label}
                                        description={button.description}
                                        name={button.id}
                                        checked={settings.visibleButtons[button.id] ?? button.default}
                                        onChange={(e) => handleToggle(button.id, e.target.checked)}
                                    />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
