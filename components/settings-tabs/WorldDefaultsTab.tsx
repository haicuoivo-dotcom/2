/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { FormField } from '../ui/FormField';
import { ToggleSwitch } from '../ui/ToggleSwitch';
import { useSettings } from '../contexts/SettingsContext';
import { useGameContext } from '../contexts/GameContext';
import { useToasts } from '../contexts/ToastContext';
import { DIFFICULTY_LEVELS } from '../../constants/gameConstants';
import type { AppSettings } from '../../types';

const WRITING_STYLE_TIPS = {
    literary_sfw: "AI sẽ sử dụng ngôn ngữ văn học, gợi cảm và tinh tế. Các cảnh 18+ (nếu được phép) sẽ được mô tả một cách nghệ thuật, tập trung vào cảm xúc thay vì hành động trần trụi.",
    default: "AI sẽ viết một cách trực diện, không né tránh. Các cảnh bạo lực và 18+ (nếu được phép) sẽ được mô tả chi tiết, trần trụi và thực tế.",
    no_segg_polite: "AI sẽ tránh hoàn toàn các chủ đề 18+. Mọi cảnh nhạy cảm sẽ được xử lý bằng kỹ thuật 'fade to black' (mờ dần) hoặc gợi ý một cách lãng mạn."
};

const NARRATIVE_VOICE_TIPS = {
    first: "Câu chuyện sẽ được kể từ góc nhìn của nhân vật chính, sử dụng 'Tôi'.",
    second: "Câu chuyện sẽ được kể như thể bạn là nhân vật chính, sử dụng 'Bạn'.",
    third_limited: "Câu chuyện được kể từ ngôi thứ ba nhưng chỉ theo sát suy nghĩ và cảm xúc của nhân vật chính.",
    third_omniscient: "Người kể chuyện biết mọi thứ, bao gồm cả suy nghĩ và cảm xúc của tất cả các nhân vật trong cảnh."
};

export const WorldDefaultsTab = () => {
    const { settings, updateSetting } = useSettings();
    const { gameState, dispatch: gameDispatch } = useGameContext();
    const { addToast } = useToasts();
    
    const handleWorldSettingChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;
        const payloadValue = type === 'checkbox' ? checked : value;
    
        updateSetting(name as keyof AppSettings, payloadValue);

        if (gameState) {
            gameDispatch({
                type: 'UPDATE_WORLD_SETTINGS',
                payload: { [name]: payloadValue }
            });
            addToast('Cài đặt thế giới đã được cập nhật và sẽ áp dụng ở lượt tiếp theo.', 'info');
        } else {
            addToast('Cài đặt mặc định cho thế giới mới đã được cập nhật.', 'success');
        }
    };

    return (
        <div className="settings-section">
            <h4>CÀI ĐẶT THẾ GIỚI</h4>
            {!gameState && (
                <p className="disabled-notice">
                    Các cài đặt này sẽ được dùng làm mặc định khi tạo thế giới mới.
                </p>
            )}
            <FormField label="Văn phong:" htmlFor="settings-writing-style">
                <div className="select-wrapper">
                    <select id="settings-writing-style" name="writingStyle" value={settings.writingStyle} onChange={handleWorldSettingChange}>
                        <option value="literary_sfw" title={WRITING_STYLE_TIPS.literary_sfw}>Sẽ Văn Chương (18+, An toàn)</option>
                        <option value="default" title={WRITING_STYLE_TIPS.default}>Chủ nghĩa Hiện thực (18+, Thô & Chi tiết)</option>
                        <option value="no_segg_polite" title={WRITING_STYLE_TIPS.no_segg_polite}>Trong Sáng (Không 18+)</option>
                    </select>
                </div>
            </FormField>
            <FormField label="Ngôi kể:" htmlFor="settings-narrative-voice">
                <div className="select-wrapper">
                    <select id="settings-narrative-voice" name="narrativeVoice" value={settings.narrativeVoice} onChange={handleWorldSettingChange}>
                        <option value="first" title={NARRATIVE_VOICE_TIPS.first}>Ngôi thứ nhất ("Tôi")</option>
                        <option value="second" title={NARRATIVE_VOICE_TIPS.second}>Ngôi thứ hai ("Bạn")</option>
                        <option value="third_limited" title={NARRATIVE_VOICE_TIPS.third_limited}>Ngôi thứ ba Giới hạn (Theo chân 1 nhân vật)</option>
                        <option value="third_omniscient" title={NARRATIVE_VOICE_TIPS.third_omniscient}>Ngôi thứ ba Toàn tri (Biết mọi thứ)</option>
                    </select>
                </div>
            </FormField>
            <FormField label="Độ khó:" htmlFor="settings-difficulty">
                <div className="select-wrapper">
                    <select id="settings-difficulty" name="difficulty" value={settings.difficulty} onChange={handleWorldSettingChange}>
                        {Object.entries(DIFFICULTY_LEVELS).map(([key, value]) => (
                            <option key={key} value={key} title={value.notes.join(' ')}>
                                {value.label}
                            </option>
                        ))}
                    </select>
                </div>
            </FormField>
            <ToggleSwitch
                id="allow18Plus"
                label="Cho phép nội dung 18+"
                description="Bật tùy chọn này để cho phép các chủ đề và mô tả người lớn, bao gồm cả nội dung khiêu dâm chi tiết."
                name="allow18Plus"
                checked={settings.allow18Plus}
                onChange={handleWorldSettingChange}
            />
        </div>
    );
};