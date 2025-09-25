/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState } from 'react';
import { FormField } from '../ui/FormField';
import { ToggleSwitch } from '../ui/ToggleSwitch';
import { useSettings } from '../contexts/SettingsContext';
import { IMAGE_STYLES, OPENROUTER_IMAGE_MODELS } from '../../constants/gameConstants';
import type { AppSettings } from '../../types';

export const ImageSettingsTab = () => {
    const { settings, updateSetting } = useSettings();
    const [activeImageTab, setActiveImageTab] = useState('story');

    const handleSettingChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;
        const payloadValue = type === 'checkbox' ? checked : value;
        updateSetting(name as keyof AppSettings, payloadValue);
    };

    return (
        <div className="settings-section">
            <div className="settings-subsection" style={{ borderTop: 'none', paddingTop: 0, marginTop: 0 }}>
                <h5>Cài đặt Ảnh AI</h5>

                <ToggleSwitch
                    id="disableAllImageGeneration"
                    label="Tắt Hoàn toàn Tính năng Tạo ảnh"
                    description="Công tắc tổng. Khi bật, tất cả các tính năng tạo ảnh bằng AI (tự động và thủ công) sẽ bị vô hiệu hóa."
                    name="disableAllImageGeneration"
                    checked={settings.disableAllImageGeneration}
                    onChange={handleSettingChange}
                />
                
                <fieldset className="settings-indented-group" disabled={settings.disableAllImageGeneration} style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-primary)', marginLeft: 0 }}>
                     <div className="image-settings-tabs">
                         <button
                            className={`image-settings-tab-button ${activeImageTab === 'story' ? 'active' : ''}`}
                            onClick={() => setActiveImageTab('story')}
                         >
                            Ảnh Truyện
                         </button>
                         <button
                            className={`image-settings-tab-button ${activeImageTab === 'avatar' ? 'active' : ''}`}
                            onClick={() => setActiveImageTab('avatar')}
                         >
                            Ảnh Đại Diện
                         </button>
                     </div>
                     <div className={`image-settings-tab-content ${activeImageTab === 'story' ? 'active' : ''}`}>
                         <ToggleSwitch
                            id="autoGenerateStoryImages"
                            label="Tự động tạo Ảnh truyện"
                            description="Tự động dùng AI để minh họa cảnh sau mỗi lượt chơi của bạn."
                            name="autoGenerateStoryImages"
                            checked={settings.autoGenerateStoryImages}
                            onChange={handleSettingChange}
                        />
                        <FormField label="Nhà Cung Cấp Ảnh Truyện" htmlFor="settings-story-image-provider">
                            <div className="select-wrapper">
                                <select
                                    id="settings-story-image-provider"
                                    name="storyImageProvider"
                                    value={settings.storyImageProvider}
                                    onChange={handleSettingChange}
                                >
                                    <option value="google">Google AI</option>
                                    <option value="openrouter">OpenRouter</option>
                                </select>
                            </div>
                        </FormField>
                        <FormField label="Phong cách ảnh truyện" htmlFor="settings-story-image-style">
                            <div className="select-wrapper">
                                <select
                                    id="settings-story-image-style"
                                    name="storyImageStyle"
                                    value={settings.storyImageStyle}
                                    onChange={handleSettingChange}
                                >
                                    {IMAGE_STYLES.map(s => <option key={s.label} value={s.value}>{s.label}</option>)}
                                </select>
                            </div>
                        </FormField>
                        {settings.storyImageProvider === 'openrouter' && (
                            <FormField label="Mô hình Ảnh Truyện (OpenRouter)" htmlFor="settings-openrouter-model">
                                <div className="select-wrapper">
                                    <select
                                        id="settings-openrouter-model"
                                        name="storyImageOpenRouterModule"
                                        value={settings.storyImageOpenRouterModule}
                                        onChange={handleSettingChange}
                                    >
                                        {OPENROUTER_IMAGE_MODELS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                                    </select>
                                </div>
                            </FormField>
                         )}
                         {settings.storyImageProvider === 'google' && (
                            <FormField label="Mô hình cho Ảnh Truyện (Google)" htmlFor="settings-story-image-model">
                                <div className="select-wrapper">
                                   <select
                                       id="settings-story-image-model"
                                       name="storyImageModel"
                                       value={settings.storyImageModel}
                                       onChange={handleSettingChange}
                                   >
                                       <option value="imagen">Imagen 4 (Chất lượng cao)</option>
                                       <option value="gemini_2_5_flash_image_preview">Gemini 2.5 Flash Image Preview</option>
                                   </select>
                               </div>
                               <p className="field-hint">
                                   Chọn mô hình AI để sử dụng cho tính năng "Minh họa cảnh này bằng AI".
                               </p>
                            </FormField>
                        )}
                     </div>
                     <div className={`image-settings-tab-content ${activeImageTab === 'avatar' ? 'active' : ''}`}>
                         <ToggleSwitch
                            id="autoGenerateNpcAvatars"
                            label="Tự động tạo ảnh đại diện NPC"
                            description="Tự động dùng AI để tạo ảnh cho các NPC mới xuất hiện trong game."
                            name="autoGenerateNpcAvatars"
                            checked={settings.autoGenerateNpcAvatars}
                            onChange={handleSettingChange}
                        />
                        <fieldset className="settings-indented-group" disabled={!settings.autoGenerateNpcAvatars}>
                            <FormField label="Nhà Cung Cấp Ảnh Đại Diện" htmlFor="settings-npc-avatar-provider">
                                <div className="select-wrapper">
                                    <select
                                        id="settings-npc-avatar-provider"
                                        name="npcAvatarProvider"
                                        value={settings.npcAvatarProvider}
                                        onChange={handleSettingChange}
                                    >
                                        <option value="google">Google AI</option>
                                        <option value="openrouter">OpenRouter</option>
                                    </select>
                                </div>
                            </FormField>
                            <FormField label="Phong cách ảnh đại diện NPC" htmlFor="settings-npc-avatar-style">
                                <div className="select-wrapper">
                                    <select
                                        id="settings-npc-avatar-style"
                                        name="npcAvatarStyle"
                                        value={settings.npcAvatarStyle}
                                        onChange={handleSettingChange}
                                    >
                                        {IMAGE_STYLES.map(s => <option key={s.label} value={s.value}>{s.label}</option>)}
                                    </select>
                                </div>
                            </FormField>
                            {settings.npcAvatarProvider === 'google' && (
                                <FormField label="Mô hình tạo ảnh đại diện NPC (Google)" htmlFor="settings-npc-avatar-model">
                                    <div className="select-wrapper">
                                    <select
                                        id="settings-npc-avatar-model"
                                        name="npcAvatarModel"
                                        value={settings.npcAvatarModel}
                                        onChange={handleSettingChange}
                                    >
                                        <option value="imagen">Imagen 4 (Chất lượng cao)</option>
                                        <option value="gemini_2_5_flash_image_preview">Gemini 2.5 Flash Image Preview</option>
                                    </select>
                                </div>
                                </FormField>
                            )}
                            {settings.npcAvatarProvider === 'openrouter' && (
                                <FormField label="Mô hình tạo ảnh đại diện NPC (OpenRouter)" htmlFor="settings-npc-openrouter-model">
                                    <div className="select-wrapper">
                                        <select
                                            id="settings-npc-openrouter-model"
                                            name="npcAvatarOpenRouterModule"
                                            value={settings.npcAvatarOpenRouterModule}
                                            onChange={handleSettingChange}
                                        >
                                            {OPENROUTER_IMAGE_MODELS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                                        </select>
                                    </div>
                                </FormField>
                            )}
                        </fieldset>
                     </div>
                </fieldset>
            </div>
        </div>
    );
};