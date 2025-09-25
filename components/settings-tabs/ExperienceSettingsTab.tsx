/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { FormField } from '../ui/FormField';
import { ToggleSwitch } from '../ui/ToggleSwitch';
import { useSettings } from '../contexts/SettingsContext';
import { STORY_LENGTH_OPTIONS, STORY_LENGTH_INSTRUCTIONS } from '../../constants/gameConstants';
import type { AppSettings } from '../../types';
import './ExperienceSettingsTab.css';

const AI_PROCESSING_MODE_TIPS = {
    super_speed: "Chi phí: 1 API call (Tối thiểu). Tốc độ Tối đa, Chất lượng Tối thiểu. AI bỏ qua bước suy nghĩ VÀ sử dụng bối cảnh rút gọn (ít lịch sử, không có luật lệ) để cho ra kết quả gần như ngay lập tức. Phù hợp để lướt nhanh câu chuyện, nhưng có thể thiếu logic và sự nhất quán.",
    speed: "Chi phí: 1 API call (Tiết kiệm). Tốc độ Cao, Chất lượng Khá. AI sẽ bỏ qua bước suy nghĩ phức tạp (khi dùng model Flash) để phản hồi nhanh hơn. Câu chuyện tiến triển nhanh, nhưng đôi khi có thể bỏ qua các chi tiết tinh tế.",
    adaptive: "Chi phí: 1 API call (Linh hoạt). Tự động (Cân bằng & Đáng tin cậy). (Khuyến nghị) AI sẽ tự điều chỉnh mức độ tư duy để cân bằng giữa tốc độ và chất lượng, đảm bảo logic mà vẫn tối ưu thời gian chờ.",
    quality: "Chi phí: 1 API call (Tốn nhiều token hơn). Chất lượng Cao, Tốc độ Chậm hơn. AI sẽ dành nhiều thời gian hơn để suy nghĩ và lên kế hoạch, tạo ra một câu chuyện nhất quán và logic hơn, với các nhân vật và tình tiết có chiều sâu.",
    max_quality: "Chi phí: 1 API call (Tốn nhiều token nhất). Chất lượng Tối đa, Tốc độ Chậm nhất. AI sẽ thực hiện quy trình tư duy phức tạp nhất, phân tích nhiều khả năng và hệ quả dài hạn. Tạo ra các diễn biến như tiểu thuyết với chất lượng cao nhất, nhưng thời gian chờ sẽ lâu nhất."
};

const AI_PROCESSING_MODES = [
  { id: 'super_speed', label: 'Siêu Tốc', description: AI_PROCESSING_MODE_TIPS.super_speed },
  { id: 'speed', label: 'Tốc Độ Cao', description: AI_PROCESSING_MODE_TIPS.speed },
  { id: 'adaptive', label: 'Tự động', description: AI_PROCESSING_MODE_TIPS.adaptive },
  { id: 'quality', label: 'Chất lượng Cao', description: AI_PROCESSING_MODE_TIPS.quality },
  { id: 'max_quality', label: 'Chất lượng Tối Đa', description: AI_PROCESSING_MODE_TIPS.max_quality },
];


const CONTEXT_TURNS_TIPS = {
    auto: "Tự động (Tối ưu): AI tự động điều chỉnh độ sâu bối cảnh (số lượt đọc lại) từ 1 đến 5 lượt để cân bằng giữa tốc độ, chi phí token và chất lượng truyện. Khuyến nghị cho hầu hết người chơi.",
    short: "Ngắn (3 lượt): AI chỉ đọc 3 lượt gần nhất. Tăng tốc độ phản hồi và giảm mạnh mức sử dụng token, nhưng có thể làm giảm tính nhất quán của câu chuyện.",
    medium: "Vừa (5 lượt): AI đọc 5 lượt gần nhất. Một sự cân bằng tốt giữa tốc độ, chi phí và chất lượng truyện.",
    long: "Dài (10 lượt): AI đọc 10 lượt gần nhất. Tăng cường đáng kể tính nhất quán trong các câu chuyện dài, nhưng sẽ làm tăng đáng kể thời gian xử lý và lượng token sử dụng."
};

export const ExperienceSettingsTab = () => {
    const { settings, updateSetting } = useSettings();

    const handleSettingChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;

        const payloadValue = type === 'checkbox' ? checked : value;
        updateSetting(name as keyof AppSettings, payloadValue);
    };
    
    return (
        <>
            <div className="settings-section">
                <h4>Lối chơi & AI</h4>
                <FormField label="Phong cách Chơi" htmlFor="settings-gameplay-style">
                    <div className="select-wrapper">
                        <select
                            id="settings-gameplay-style"
                            name="gameplayStyle"
                            value={settings.gameplayStyle || 'turnByTurn'}
                            onChange={handleSettingChange}
                        >
                            <option value="turnByTurn">Theo lượt (Mặc định)</option>
                            <option value="continuousNovel">Tiểu thuyết Liên tục</option>
                        </select>
                    </div>
                    <p className="field-hint">
                        'Tiểu thuyết Liên tục': Sau khi bạn chọn hành động, AI sẽ tự động viết tiếp 1-2 phân cảnh nữa để tạo ra một chuỗi diễn biến dài, liền mạch như một chương truyện.
                    </p>
                </FormField>
                <FormField label="Chế độ xử lý AI" htmlFor="settings-ai-processing-mode">
                    <div className="processing-mode-grid">
                        {AI_PROCESSING_MODES.map(mode => (
                             <label 
                                key={mode.id} 
                                htmlFor={`mode-${mode.id}`} 
                                className={`processing-mode-button ${settings.aiProcessingMode === mode.id ? 'active' : ''}`}
                                title={mode.description}
                            >
                                <input
                                    type="radio"
                                    id={`mode-${mode.id}`}
                                    name="aiProcessingMode"
                                    value={mode.id}
                                    checked={settings.aiProcessingMode === mode.id}
                                    onChange={handleSettingChange}
                                />
                                {mode.label}
                            </label>
                        ))}
                    </div>
                    <p className="field-hint">
                        Điều chỉnh sự cân bằng giữa chất lượng câu chuyện và tốc độ phản hồi của AI. Di chuột để xem chi tiết.
                    </p>
                </FormField>
                <FormField label="Mô hình Văn bản & Logic" htmlFor="settings-text-model">
                    <div className="processing-mode-grid" style={{gridTemplateColumns: '1fr 1fr'}}>
                        <label 
                            htmlFor="model-pro" 
                            className={`processing-mode-button ${settings.textModel === 'gemini-2.5-pro' ? 'active' : ''}`}
                            title="Chất lượng cao nhất, sáng tạo nhất. Phù hợp cho việc kiến tạo thế giới và các diễn biến truyện phức tạp, đòi hỏi chiều sâu. Tốc độ xử lý chậm hơn và tốn nhiều token hơn Flash."
                        >
                            <input
                                type="radio"
                                id="model-pro"
                                name="textModel"
                                value="gemini-2.5-pro"
                                checked={settings.textModel === 'gemini-2.5-pro'}
                                onChange={handleSettingChange}
                            />
                            Gemini 2.5 Pro
                        </label>
                        <label 
                            htmlFor="model-flash" 
                            className={`processing-mode-button ${settings.textModel === 'gemini-2.5-flash' ? 'active' : ''}`}
                            title="Nhanh & Tối ưu (Mặc định). Tốc độ phản hồi cực nhanh, chi phí thấp. Lựa chọn tốt nhất cho lối chơi thông thường, đảm bảo trải nghiệm mượt mà."
                        >
                            <input
                                type="radio"
                                id="model-flash"
                                name="textModel"
                                value="gemini-2.5-flash"
                                checked={settings.textModel === 'gemini-2.5-flash'}
                                onChange={handleSettingChange}
                            />
                            Gemini 2.5 Flash
                        </label>
                    </div>
                     <p className="field-hint">
                        Chọn mô hình AI cho logic và tạo câu chuyện. Pro cho chất lượng tốt nhất, Flash cho tốc độ nhanh hơn.
                    </p>
                </FormField>
                <FormField label="Độ sâu Bối cảnh (Số lượt đọc)" htmlFor="settings-context-turns">
                    <div className="select-wrapper">
                        <select 
                            id="settings-context-turns" 
                            name="contextTurns" 
                            value={settings.contextTurns || 'auto'} 
                            onChange={handleSettingChange}
                        >
                            <option value="auto" title={CONTEXT_TURNS_TIPS.auto}>Tự động (Tối ưu)</option>
                            <option value="short" title={CONTEXT_TURNS_TIPS.short}>Ngắn (3 lượt)</option>
                            <option value="medium" title={CONTEXT_TURNS_TIPS.medium}>Vừa (5 lượt)</option>
                            <option value="long" title={CONTEXT_TURNS_TIPS.long}>Dài (10 lượt)</option>
                        </select>
                    </div>
                    <p className="field-hint">
                        Kiểm soát số lượt chơi gần nhất AI sẽ đọc lại để hiểu bối cảnh. 'Tự động' là lựa chọn cân bằng nhất.
                    </p>
                </FormField>
                <FormField label="Độ dài truyện" htmlFor="settings-story-length">
                    <div className="select-wrapper">
                        <select
                            id="settings-story-length"
                            name="storyLength"
                            value={settings.storyLength}
                            onChange={handleSettingChange}
                        >
                            {Object.entries(STORY_LENGTH_OPTIONS).map(([key, label]) => (
                                <option key={key} value={key} title={STORY_LENGTH_INSTRUCTIONS[key as keyof typeof STORY_LENGTH_INSTRUCTIONS]}>
                                    {label}
                                </option>
                            ))}
                        </select>
                    </div>
                    <p className="field-hint">
                        Kiểm soát độ dài và chi tiết của mỗi diễn biến do AI tạo ra. Các lựa chọn dài hơn sẽ tốn nhiều token hơn.
                    </p>
                </FormField>
            </div>
            <div className="settings-section">
                <h4>Tự động hóa & Hỗ trợ</h4>
                 <ToggleSwitch
                    id="suggestMoreActions"
                    label="Gợi ý nhiều hành động hơn"
                    description="Khi bật, AI sẽ tạo ra một danh sách hành động dài hơn, tập trung vào mô tả và thời gian, thay vì 4 hành động có Lợi/Hại. Phù hợp cho người chơi muốn nhiều lựa chọn."
                    name="suggestMoreActions"
                    checked={settings.suggestMoreActions}
                    onChange={handleSettingChange}
                />
                <ToggleSwitch
                    id="autoPinMemory"
                    label="Tự động ghim ký ức"
                    description="Tự động ghim lại ký ức được AI tạo ra sau mỗi lượt chơi."
                    name="autoPinMemory"
                    checked={settings.autoPinMemory || false}
                    onChange={handleSettingChange}
                />
                <ToggleSwitch
                    id="predictiveInference"
                    label="Suy luận Tiên đoán (Thử nghiệm)"
                    description="AI sẽ chạy trước một lượt chơi giả định trong nền để loại bỏ thời gian chờ. Hành động được dự đoán sẽ phát sáng. Nếu bạn chọn nó, kết quả sẽ hiện ra tức thì. Lưu ý: Tính năng này sẽ tốn thêm 1 yêu cầu API cho mỗi lượt."
                    name="predictiveInference"
                    checked={settings.predictiveInference || false}
                    onChange={handleSettingChange}
                />
                <ToggleSwitch
                    id="enableWorldHealing"
                    label="Thế Giới Tự Chữa Lành & Mô Phỏng"
                    description="Thế Giới Tự Chữa Lành & Mô Phỏng (Tốn API call). Cứ sau mỗi 20 lượt, AI sẽ chạy ngầm để mô phỏng các hoạt động của NPC, phe phái và tự sửa các lỗi logic, làm cho thế giới trở nên sống động và chân thực hơn. Tin tức về các sự kiện lớn sẽ được thông báo cho bạn."
                    name="enableWorldHealing"
                    checked={settings.enableWorldHealing || false}
                    onChange={handleSettingChange}
                />
            </div>
            <div className="settings-section">
                <h4>Công cụ Gỡ lỗi</h4>
                <ToggleSwitch
                    id="enableCheats"
                    label="Bật chế độ Cheat"
                    description="Khi bật, lựa chọn nhập vào ô sẽ có 100% thành công."
                    name="enableCheats"
                    checked={settings.enableCheats || false}
                    onChange={handleSettingChange}
                />
            </div>
        </>
    );
};