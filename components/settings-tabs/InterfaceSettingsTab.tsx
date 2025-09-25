/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { FormField } from '../ui/FormField';
import { ToggleSwitch } from '../ui/ToggleSwitch';
import { useSettings } from '../contexts/SettingsContext';
import type { AppSettings } from '../../types';
import './InterfaceSettingsTab.css';

const PREDEFINED_PALETTES: Record<string, { primary: string; secondary: string }> = {
    'default': { primary: '', secondary: '' },
    'ocean_blue': { primary: '#007BFF', secondary: '#17A2B8' },
    'crimson_red': { primary: '#DC3545', secondary: '#FF7B72' },
    'forest_green': { primary: '#28A745', secondary: '#7EE787' },
    'royal_purple': { primary: '#6F42C1', secondary: '#9B59B6' },
    'sunset_orange': { primary: '#FD7E14', secondary: '#FFA000' },
};

export const InterfaceSettingsTab = () => {
    const { settings, updateSetting } = useSettings();

    const handleSettingChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;

        if (type === 'checkbox') {
            updateSetting(name as keyof AppSettings, checked);
            return;
        }

        if (name === 'fontSize') {
            updateSetting(name, parseInt(value, 10));
        } else {
            updateSetting(name as keyof AppSettings, value);
        }
    };

    return (
        <>
            <div className="settings-section">
                <h4>Bố cục & Hiển thị</h4>
                <FormField label="Chế độ Di động" htmlFor="settings-mobile-mode">
                    <div className="processing-mode-grid" style={{gridTemplateColumns: '1fr 1fr'}}>
                        <label 
                            htmlFor="mobile-mode-on" 
                            className={`processing-mode-button ${settings.mobileMode === 'on' ? 'active' : ''}`}
                            title="Tối ưu hóa giao diện cho màn hình cảm ứng và kích thước nhỏ. Khuyến nghị cho điện thoại di động."
                        >
                            <input
                                type="radio"
                                id="mobile-mode-on"
                                name="mobileMode"
                                value="on"
                                checked={settings.mobileMode === 'on'}
                                onChange={handleSettingChange}
                            />
                            Bật
                        </label>
                        <label 
                            htmlFor="mobile-mode-off" 
                            className={`processing-mode-button ${settings.mobileMode === 'off' ? 'active' : ''}`}
                            title="Luôn sử dụng giao diện máy tính, bất kể kích thước màn hình. Phù hợp cho máy tính bảng ở chế độ ngang và máy tính để bàn."
                        >
                            <input
                                type="radio"
                                id="mobile-mode-off"
                                name="mobileMode"
                                value="off"
                                checked={settings.mobileMode === 'off'}
                                onChange={handleSettingChange}
                            />
                            Tắt
                        </label>
                    </div>
                    <p className="field-hint">"Bật" để tối ưu hóa giao diện cho màn hình nhỏ. "Tắt" để luôn sử dụng giao diện máy tính, bất kể kích thước màn hình.</p>
                </FormField>
                <ToggleSwitch
                    id="showCombatView"
                    label="Hiện màn hình chiến đấu"
                    description="Bật/tắt giao diện chiến đấu. Mặc định tắt."
                    name="showCombatView"
                    checked={settings.showCombatView}
                    onChange={handleSettingChange}
                />
                <ToggleSwitch
                    id="showEquipmentTab"
                    label="Hiện tab Trang Bị"
                    description="Bật/tắt tab Trang Bị trong chi tiết nhân vật. Mặc định tắt."
                    name="showEquipmentTab"
                    checked={settings.showEquipmentTab}
                    onChange={handleSettingChange}
                />
                <ToggleSwitch
                    id="showAiButton"
                    label="Hiện nút AI"
                    description="Bật/tắt nút tròn AI trôi nổi trên màn hình game."
                    name="showAiButton"
                    checked={settings.showAiButton}
                    onChange={handleSettingChange}
                />
            </div>
            
            <div className="settings-section">
                <h4>Giao diện & Font chữ</h4>
                <FormField label="Giao diện" htmlFor="settings-theme">
                    <div className="select-wrapper">
                        <select id="settings-theme" name="theme" value={settings.theme} onChange={handleSettingChange}>
                            <option value="system">Hệ thống</option>
                            <option value="light">Sáng</option>
                            <option value="dark">Tối</option>
                        </select>
                    </div>
                </FormField>
                <FormField label="Font chữ" htmlFor="settings-font-family">
                    <div className="select-wrapper">
                        <select id="settings-font-family" name="fontFamily" value={settings.fontFamily} onChange={handleSettingChange}>
                            <option value="'Be Vietnam Pro', sans-serif">Be Vietnam Pro</option>
                            <option value="'Inter', sans-serif">Inter</option>
                            <option value="'Roboto', sans-serif">Roboto</option>
                            <option value="'Open Sans', sans-serif">Open Sans</option>
                        </select>
                    </div>
                </FormField>
                <FormField label={`Cỡ chữ: ${settings.fontSize}px`} htmlFor="settings-font-size">
                <div className="slider-wrapper">
                    <input 
                            id="settings-font-size"
                            type="range"
                            name="fontSize"
                            min="12"
                            max="20"
                            step="1"
                            value={settings.fontSize}
                            onChange={handleSettingChange} 
                    />
                </div>
                </FormField>
                <FormField label="Màu chữ truyện" htmlFor="settings-text-color">
                    <div className="select-wrapper">
                        <select id="settings-text-color" name="textColor" value={settings.textColor} onChange={handleSettingChange}>
                            <option value="default">Mặc định (Trắng/Đen)</option>
                            <option value="gray">Xám (Dịu mắt)</option>
                        </select>
                    </div>
                </FormField>
            </div>
            
            <div className="settings-section">
                <h4>Màu sắc</h4>
                <FormField label="Bảng màu" htmlFor="settings-color-palette">
                    <div className="select-wrapper">
                        <select
                            id="settings-color-palette"
                            name="colorPalette"
                            value={settings.colorPalette}
                            onChange={(e) => {
                                const paletteName = e.target.value;
                                const palette = PREDEFINED_PALETTES[paletteName];
                                updateSetting('colorPalette', paletteName);
                                updateSetting('accentPrimary', palette.primary);
                                updateSetting('accentSecondary', palette.secondary);
                            }}
                        >
                            <option value="default">Mặc định (Theo Giao diện)</option>
                            <option value="ocean_blue">Xanh Đại dương</option>
                            <option value="crimson_red">Đỏ Thẫm</option>
                            <option value="forest_green">Xanh Rừng rậm</option>
                            <option value="royal_purple">Tím Hoàng gia</option>
                            <option value="sunset_orange">Cam Hoàng hôn</option>
                            {settings.colorPalette === 'custom' && <option value="custom">Tùy chỉnh</option>}
                        </select>
                    </div>
                </FormField>
                <div className="color-picker-group">
                    <FormField label="Màu Nhấn Chính" htmlFor="accent-primary-picker">
                        <input
                            type="color"
                            id="accent-primary-picker"
                            name="accentPrimary"
                            value={settings.accentPrimary || '#000000'}
                            onChange={(e) => {
                                updateSetting('accentPrimary', e.target.value);
                                updateSetting('colorPalette', 'custom');
                            }}
                        />
                    </FormField>
                    <FormField label="Màu Nhấn Phụ" htmlFor="accent-secondary-picker">
                        <input
                            type="color"
                            id="accent-secondary-picker"
                            name="accentSecondary"
                            value={settings.accentSecondary || '#000000'}
                            onChange={(e) => {
                                updateSetting('accentSecondary', e.target.value);
                                updateSetting('colorPalette', 'custom');
                            }}
                        />
                    </FormField>
                </div>
            </div>
            
            <div className="settings-section">
                <h4>Hiệu năng</h4>
                <ToggleSwitch
                    id="enablePerformanceEffects"
                    label="Hiệu ứng Đồ họa"
                    description="Bật/tắt các hiệu ứng đồ họa như hào quang, làm mờ hậu cảnh... Tắt để cải thiện hiệu năng."
                    name="enablePerformanceEffects"
                    checked={settings.enablePerformanceEffects}
                    onChange={handleSettingChange}
                />
            </div>
        </>
    );
};