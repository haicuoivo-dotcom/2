/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { FormField } from '../ui/FormField';
import { useSettings } from '../contexts/SettingsContext';
import type { AppSettings } from '../../types';
import './ExperienceSettingsTab.css'; // Can reuse the CSS

export const StoryTendenciesTab = () => {
    const { settings, updateSetting } = useSettings();

    const handleTendencyChange = (tendency: keyof AppSettings['storyTendencies'], value: number) => {
        updateSetting('storyTendencies', {
            ...settings.storyTendencies,
            [tendency]: value,
        });
    };

    return (
        <div className="settings-section">
            <h4>Thiên hướng Câu chuyện</h4>
            <p className="field-hint">
                Điều chỉnh các thanh trượt để ra lệnh cho AI ưu tiên các loại tình tiết mà bạn thích. Tổng các giá trị không cần phải là 100, AI sẽ tự cân đối theo tỷ lệ.
            </p>
            <div className="tendency-sliders">
                <FormField label={`Phiêu lưu: ${settings.storyTendencies.adventure}%`} htmlFor="tendency-adventure">
                    <input type="range" id="tendency-adventure" min="0" max="100" value={settings.storyTendencies.adventure} onChange={(e) => handleTendencyChange('adventure', parseInt(e.target.value, 10))} />
                </FormField>
                <FormField label={`Hành động: ${settings.storyTendencies.action}%`} htmlFor="tendency-action">
                    <input type="range" id="tendency-action" min="0" max="100" value={settings.storyTendencies.action} onChange={(e) => handleTendencyChange('action', parseInt(e.target.value, 10))} />
                </FormField>
                <FormField label={`Lãng mạn/Hậu cung: ${settings.storyTendencies.romance}%`} htmlFor="tendency-romance">
                    <input type="range" id="tendency-romance" min="0" max="100" value={settings.storyTendencies.romance} onChange={(e) => handleTendencyChange('romance', parseInt(e.target.value, 10))} />
                </FormField>
                <FormField label={`Trinh thám/Bí ẩn: ${settings.storyTendencies.detective}%`} htmlFor="tendency-detective">
                    <input type="range" id="tendency-detective" min="0" max="100" value={settings.storyTendencies.detective} onChange={(e) => handleTendencyChange('detective', parseInt(e.target.value, 10))} />
                </FormField>
                <FormField label={`Chính trị/Âm mưu: ${settings.storyTendencies.intrigue}%`} htmlFor="tendency-intrigue">
                    <input type="range" id="tendency-intrigue" min="0" max="100" value={settings.storyTendencies.intrigue} onChange={(e) => handleTendencyChange('intrigue', parseInt(e.target.value, 10))} />
                </FormField>
                <FormField label={`Kinh dị/Hồi hộp: ${settings.storyTendencies.horror}%`} htmlFor="tendency-horror">
                    <input type="range" id="tendency-horror" min="0" max="100" value={settings.storyTendencies.horror} onChange={(e) => handleTendencyChange('horror', parseInt(e.target.value, 10))} />
                </FormField>
                <FormField label={`Hài hước: ${settings.storyTendencies.comedy}%`} htmlFor="tendency-comedy">
                    <input type="range" id="tendency-comedy" min="0" max="100" value={settings.storyTendencies.comedy} onChange={(e) => handleTendencyChange('comedy', parseInt(e.target.value, 10))} />
                </FormField>
                <FormField label={`Bi kịch: ${settings.storyTendencies.tragedy}%`} htmlFor="tendency-tragedy">
                    <input type="range" id="tendency-tragedy" min="0" max="100" value={settings.storyTendencies.tragedy} onChange={(e) => handleTendencyChange('tragedy', parseInt(e.target.value, 10))} />
                </FormField>
                <FormField label={`Đời thường: ${settings.storyTendencies.sliceOfLife}%`} htmlFor="tendency-sliceOfLife">
                    <input type="range" id="tendency-sliceOfLife" min="0" max="100" value={settings.storyTendencies.sliceOfLife} onChange={(e) => handleTendencyChange('sliceOfLife', parseInt(e.target.value, 10))} />
                </FormField>
                <FormField label={`Khoa học Viễn tưởng: ${settings.storyTendencies.sciFi}%`} htmlFor="tendency-sciFi">
                    <input type="range" id="tendency-sciFi" min="0" max="100" value={settings.storyTendencies.sciFi} onChange={(e) => handleTendencyChange('sciFi', parseInt(e.target.value, 10))} />
                </FormField>
                <FormField label={`Triết học: ${settings.storyTendencies.philosophical}%`} htmlFor="tendency-philosophical">
                    <input type="range" id="tendency-philosophical" min="0" max="100" value={settings.storyTendencies.philosophical} onChange={(e) => handleTendencyChange('philosophical', parseInt(e.target.value, 10))} />
                </FormField>
                <FormField label={`Tình Dục: ${settings.storyTendencies.sex}%`} htmlFor="tendency-sex">
                    <input type="range" id="tendency-sex" min="0" max="100" value={settings.storyTendencies.sex} onChange={(e) => handleTendencyChange('sex', parseInt(e.target.value, 10))} />
                </FormField>
                <FormField label={`Máu Me Kinh Dị: ${settings.storyTendencies.gore}%`} htmlFor="tendency-gore">
                    <input type="range" id="tendency-gore" min="0" max="100" value={settings.storyTendencies.gore} onChange={(e) => handleTendencyChange('gore', parseInt(e.target.value, 10))} />
                </FormField>
            </div>
        </div>
    );
};