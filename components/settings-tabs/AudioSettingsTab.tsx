/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useMemo } from 'react';
import { FormField } from '../ui/FormField';
import { ToggleSwitch } from '../ui/ToggleSwitch';
import { useSettings } from '../contexts/SettingsContext';
import { useGameContext } from '../contexts/GameContext';
import { useToasts } from '../contexts/ToastContext';
import { useTTS } from '../contexts/TTSContext';
import { ApiKeyManager } from '../../services/ApiKeyManager';
import { getApiErrorMessage } from '../../utils/error';
import type { AppSettings } from '../../types';

export const AudioSettingsTab = () => {
    const { settings, updateSetting } = useSettings();
    const { gameState, worldSettings } = useGameContext();
    const { addToast } = useToasts();
    const { voices, isSpeaking } = useTTS();
    const [isTesting, setIsTesting] = useState(false);
    const [isSuggesting, setIsSuggesting] = useState(false);

    const handleSettingChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;

        if (type === 'checkbox') {
            updateSetting(name as keyof AppSettings, checked);
            return;
        }
        
        const numericValue = ['ttsRate', 'ttsPitch'].includes(name) ? parseFloat(value) : value;
        updateSetting(name as keyof AppSettings, numericValue);
    };

    const handleTestVoice = () => {
        if (isSpeaking || isTesting) return;

        setIsTesting(true);
        const utterance = new SpeechSynthesisUtterance("Xin chào, đây là giọng đọc thử nghiệm.");
        const selectedVoice = voices.find(v => v.voiceURI === settings.ttsVoiceURI);
        
        utterance.voice = selectedVoice || null;
        utterance.rate = settings.ttsRate;
        utterance.pitch = settings.ttsPitch;
        utterance.onend = () => setIsTesting(false);
        utterance.onerror = () => setIsTesting(false);

        window.speechSynthesis.speak(utterance);
    };
    
    const handleSuggestVoice = async () => {
        if (!gameState || !worldSettings) {
            addToast("Không thể gợi ý giọng đọc khi chưa vào game.", "warning");
            return;
        }
        if (isSuggesting || isSpeaking) return;

        setIsSuggesting(true);
        try {
            const suggestedURI = await ApiKeyManager.suggestTtsVoice(
                worldSettings,
                gameState.character,
                voices,
                addToast,
                () => {} // No need to increment main counter for a settings helper
            );

            if (suggestedURI) {
                updateSetting('ttsVoiceURI', suggestedURI);
                const suggestedVoice = voices.find(v => v.voiceURI === suggestedURI);
                addToast(`AI gợi ý: ${suggestedVoice?.name || 'một giọng đọc mới'}.`, 'success');
            } else {
                 addToast("AI không thể tìm thấy gợi ý phù hợp.", 'info');
            }
        } catch (error) {
            const userFriendlyError = getApiErrorMessage(error, "gợi ý giọng đọc");
            addToast(userFriendlyError, 'error');
        } finally {
            setIsSuggesting(false);
        }
    };

    const vietnameseVoices = useMemo(() => {
        const viVoices = voices.filter(v => v.lang.startsWith('vi'));
        const femaleVoices: SpeechSynthesisVoice[] = [];
        const maleVoices: SpeechSynthesisVoice[] = [];
        const otherVoices: SpeechSynthesisVoice[] = [];

        viVoices.forEach(voice => {
            const name = voice.name.toLowerCase();
            // Heuristics for gender detection based on common keywords/names
            if (name.includes('nữ') || name.includes('female') || ['linh', 'my', 'mai', 'an', 'nhu', 'thao'].some(n => name.includes(n))) {
                femaleVoices.push(voice);
            } else if (name.includes('nam') || name.includes('male') || ['minh', 'phat', 'quoc', 'bao'].some(n => name.includes(n))) {
                maleVoices.push(voice);
            } else {
                otherVoices.push(voice);
            }
        });

        return { femaleVoices, maleVoices, otherVoices };
    }, [voices]);

    return (
        <div className="settings-section">
            <h4>ÂM THANH & GIỌNG ĐỌC</h4>
            <ToggleSwitch
                id="enableTTS"
                label="Bật Giọng đọc AI"
                description="Tự động đọc diễn biến câu chuyện bằng giọng nói."
                name="enableTTS"
                checked={settings.enableTTS}
                onChange={handleSettingChange}
            />
            
            <fieldset className="settings-indented-group" disabled={!settings.enableTTS}>
                <FormField label="Giọng đọc" htmlFor="settings-tts-voice">
                    <div className="select-wrapper">
                        <select
                            id="settings-tts-voice"
                            name="ttsVoiceURI"
                            value={settings.ttsVoiceURI}
                            onChange={handleSettingChange}
                        >
                            <optgroup label="Tự động lựa chọn (Tiếng Việt)">
                                <option value="auto-best">Giọng phù hợp nhất (Mặc định)</option>
                                <option value="auto-female">Giọng Nữ</option>
                                <option value="auto-male">Giọng Nam</option>
                            </optgroup>
                            {vietnameseVoices.femaleVoices.length > 0 && (
                                <optgroup label="Giọng Nữ Tiếng Việt">
                                    {vietnameseVoices.femaleVoices.map(voice => (
                                        <option key={voice.voiceURI} value={voice.voiceURI}>
                                            {voice.name}
                                        </option>
                                    ))}
                                </optgroup>
                            )}
                            {vietnameseVoices.maleVoices.length > 0 && (
                                <optgroup label="Giọng Nam Tiếng Việt">
                                    {vietnameseVoices.maleVoices.map(voice => (
                                        <option key={voice.voiceURI} value={voice.voiceURI}>
                                            {voice.name}
                                        </option>
                                    ))}
                                </optgroup>
                            )}
                            {vietnameseVoices.otherVoices.length > 0 && (
                                <optgroup label="Giọng Tiếng Việt Khác">
                                    {vietnameseVoices.otherVoices.map(voice => (
                                        <option key={voice.voiceURI} value={voice.voiceURI}>
                                            {voice.name}
                                        </option>
                                    ))}
                                </optgroup>
                            )}
                        </select>
                    </div>
                </FormField>
                <FormField label={`Tốc độ: ${settings.ttsRate.toFixed(1)}`} htmlFor="settings-tts-rate">
                    <div className="slider-wrapper">
                        <input
                            id="settings-tts-rate"
                            type="range"
                            name="ttsRate"
                            min="0.5"
                            max="2"
                            step="0.1"
                            value={settings.ttsRate}
                            onChange={handleSettingChange}
                        />
                    </div>
                </FormField>
                <FormField label={`Cao độ: ${settings.ttsPitch.toFixed(1)}`} htmlFor="settings-tts-pitch">
                    <div className="slider-wrapper">
                        <input
                            id="settings-tts-pitch"
                            type="range"
                            name="ttsPitch"
                            min="0.5"
                            max="2"
                            step="0.1"
                            value={settings.ttsPitch}
                            onChange={handleSettingChange}
                        />
                    </div>
                </FormField>

                <div className="tts-preview-controls">
                     <button className="wc-button" onClick={handleTestVoice} disabled={isTesting || isSpeaking}>
                        {isTesting ? (
                            <>
                                <span className="spinner spinner-sm"></span>
                                Đang nói...
                            </>
                        ) : 'Nghe thử'}
                    </button>
                    <button
                        className="wc-button"
                        onClick={handleSuggestVoice}
                        disabled={isSuggesting || isSpeaking || !gameState}
                        title={!gameState ? "Phải ở trong game để dùng tính năng này." : "Dùng AI để chọn giọng đọc phù hợp nhất."}
                    >
                        {isSuggesting ? (
                             <>
                                <span className="spinner spinner-sm"></span>
                                Đang nghĩ...
                            </>
                        ) : 'Gợi ý Giọng đọc (AI)'}
                    </button>
                </div>

            </fieldset>
        </div>
    );
};