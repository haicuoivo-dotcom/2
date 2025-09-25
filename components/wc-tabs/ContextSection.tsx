/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useMemo, useState, useEffect } from 'react';
import { FormField } from '../ui/FormField';
import { GENRES, SETTINGS, GENRE_SETTING_MAP, STORY_TEMPLATES } from '../../constants/gameConstants';
import type { WorldSettings, FanficSystemAnalysis } from '../../types';
import { LockIcon } from '../ui/Icons';
import { ToggleSwitch } from '../ui/ToggleSwitch';
import { CollapsibleSection } from '../ui/CollapsibleSection';

const startingSceneOptions = [
    { value: 'empty', label: 'Trống (Mặc định)', description: 'Vô hiệu hóa Cảnh Khởi Đầu. AI sẽ tự do sáng tạo cảnh mở đầu dựa trên Ý tưởng của bạn.' },
    { value: 'easy_18', label: '18+ Dễ', description: 'Nhân vật của bạn sẽ bắt đầu trong một tình huống 18+ hoặc chuẩn bị cho tình huống 18+ một cách thuận lợi và có sự đồng thuận.' },
    { value: 'hard_18', label: '18+ Khó', description: 'Bắt đầu trong một cảnh 18+ có thử thách.' },
    { value: 'danger_alone', label: 'Hiểm Nguy', description: 'Một mình đối mặt với tình huống khó khăn.' },
    { value: 'safe_alone', label: 'An Toàn', description: 'Một mình trong hoàn cảnh thuận lợi, yên bình.' },
    { value: 'with_crowd', label: 'Đông Người', description: 'Nhân vật của bạn bắt đầu giữa một đám đông hoặc tại một sự kiện công cộng sầm uất, ở nhà có nhiều thành viên hay ở trường lớp, trại.' }
];

interface ContextSectionProps {
    formData: WorldSettings;
    setFormData: React.Dispatch<React.SetStateAction<WorldSettings>>;
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
    handleStoryTemplateChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    fanficContent: string | null;
    setFanficContent: React.Dispatch<React.SetStateAction<string | null>>;
    fanficCharOption: 'main' | 'new';
    setFanficCharOption: React.Dispatch<React.SetStateAction<'main' | 'new'>>;
    isGeneratingContext: boolean;
    isAiBusy: boolean;
    handleSuggestWorldSummary: () => void;
    contextSuggestionTime: number;
    formatTime: (seconds: number) => string;
    onFanficUploadClick: () => void;
    isAnalyzingFanfic: boolean;
    fanficAnalysisTime: number;
    handleAnalyzeFanfic: () => void;
    // NEW PROPS FOR SYSTEM ANALYSIS
    isAnalyzingSystem: boolean;
    systemAnalysisTime: number;
    handleAnalyzeFanficSystem: () => void;
    fanficSystemAnalysis: FanficSystemAnalysis | null;
    handleFanficSystemChange: (category: keyof FanficSystemAnalysis | `coreStats.${number}` | `keySkills.${number}` | `keyItems.${number}` | `worldRules.${number}`, field: 'name' | 'description', value: string) => void;
}

export const ContextSection = ({
    formData,
    setFormData,
    handleInputChange,
    handleStoryTemplateChange,
    fanficContent,
    setFanficContent,
    fanficCharOption,
    setFanficCharOption,
    isGeneratingContext,
    isAiBusy,
    handleSuggestWorldSummary,
    contextSuggestionTime,
    formatTime,
    onFanficUploadClick,
    isAnalyzingFanfic,
    fanficAnalysisTime,
    handleAnalyzeFanfic,
    // NEW PROPS
    isAnalyzingSystem,
    systemAnalysisTime,
    handleAnalyzeFanficSystem,
    fanficSystemAnalysis,
    handleFanficSystemChange,
}: ContextSectionProps) => {

    const [activeTab, setActiveTab] = useState(formData.genre === 'Đồng nhân' ? 'fanfic' : 'default');
    const [isFanficHelpOpen, setIsFanficHelpOpen] = useState(false);
    const [isSystemSectionOpen, setIsSystemSectionOpen] = useState(true);

    useEffect(() => {
        const newTab = formData.genre === 'Đồng nhân' ? 'fanfic' : 'default';
        if (newTab !== activeTab) {
            setActiveTab(newTab);
        }
    }, [formData.genre, activeTab]);

    const handleTabClick = (tab: 'default' | 'fanfic') => {
        if (tab === activeTab) return;
    
        setActiveTab(tab);
    
        if (tab === 'fanfic') {
            setFormData(prev => ({
                ...prev,
                genre: 'Đồng nhân',
                idea: '',
                templateIdea: '',
                suggestion: '',
                worldSummary: ''
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                genre: prev.genre === 'Đồng nhân' ? 'Trống' : prev.genre,
            }));
            setFanficContent(null);
        }
    };

    const isIdeaDriven = useMemo(() => formData.idea.trim() !== '', [formData.idea]);
    
    const isGenreEmptyAndIdeaMissing = useMemo(() => 
        formData.genre === 'Trống' && !formData.idea.trim() && !formData.templateIdea,
    [formData.genre, formData.idea, formData.templateIdea]);
    
    const validSettings = GENRE_SETTING_MAP[formData.genre] || [];

    const selectedTemplateValue = useMemo(() => {
        if (!formData.templateIdea) return "";
        for (const category in STORY_TEMPLATES) {
            const template = STORY_TEMPLATES[category].find(t => t.idea === formData.templateIdea);
            if (template) return `${category}::${template.label}`;
        }
        return "";
    }, [formData.templateIdea]);

    const selectedTemplateLabel = useMemo(() => {
        if (!formData.templateIdea) return null;
        for (const category in STORY_TEMPLATES) {
            const template = STORY_TEMPLATES[category].find(t => t.idea === formData.templateIdea);
            if (template) return template.label;
        }
        return null;
    }, [formData.templateIdea]);

    const filteredTemplates = useMemo(() => {
        const result: Record<string, any[]> = {};
        const currentGenre = formData.genre;
        const currentSetting = formData.setting;
    
        if (currentGenre === 'Trống') {
            return STORY_TEMPLATES;
        }
    
        for (const category in STORY_TEMPLATES) {
            const compatibleTemplates = STORY_TEMPLATES[category].filter(template => {
                if (!template.genres.includes(currentGenre)) {
                    return false;
                }
    
                const userHasNotSelectedSetting = currentSetting === 'Trống';
                const templateHasNoSettingRestriction = !template.settings || template.settings.length === 0;
                
                if (userHasNotSelectedSetting) {
                    return true;
                } else {
                    return templateHasNoSettingRestriction || template.settings.includes(currentSetting);
                }
            });
    
            if (compatibleTemplates.length > 0) {
                result[category] = compatibleTemplates;
            }
        }
        return result;
    }, [formData.genre, formData.setting]);
    
    const getSuggestButtonTooltip = () => {
        if (isAiBusy) {
            return "Đang xử lý...";
        }
        if (isIdeaDriven) {
            return "Tùy chọn này bị khóa vì bạn đang sử dụng ô 'Ý Tưởng Của Bạn'. AI sẽ phát triển thế giới dựa trên ý tưởng đó khi bạn nhấn 'Tạo Thế Giới'.";
        }
        if (isGenreEmptyAndIdeaMissing) {
            return "Vui lòng chọn 'Kiểu Thế Giới' để AI có thể đưa ra gợi ý phù hợp.";
        }
        return "Chi phí: 1 Yêu cầu API. AI sẽ tạo ra một bối cảnh thế giới chi tiết dựa trên các lựa chọn của bạn.";
    };

    return (
        <>
            <div className="modal-tabs" style={{ marginBottom: 'var(--space-6)' }}>
                <button
                    className={`modal-tab-button ${activeTab === 'default' ? 'active' : ''}`}
                    onClick={() => handleTabClick('default')}
                >
                    Kiến tạo Mặc định
                </button>
                <button
                    className={`modal-tab-button ${activeTab === 'fanfic' ? 'active' : ''}`}
                    onClick={() => handleTabClick('fanfic')}
                >
                    Kiến tạo từ Đồng nhân
                </button>
            </div>

            {activeTab === 'default' ? (
                <>
                    <FormField label="Ý Tưởng Của Bạn (Ưu tiên cao nhất)" htmlFor="idea">
                        <textarea 
                            id="idea" 
                            name="idea" 
                            rows={4} 
                            placeholder="VD: Một nhân vật chính có khả năng hồi sinh và bị săn lùng bởi một giáo phái..." 
                            value={formData.idea} 
                            onChange={(e) => { handleInputChange(e); setFanficContent(null); }}
                        />
                        <p className="field-hint">Nếu điền vào đây, AI sẽ ưu tiên ý tưởng này và các mục bên dưới sẽ bị vô hiệu hóa. Ngược lại, nếu bạn thay đổi các mục bên dưới, ô này sẽ bị khóa.</p>
                    </FormField>

                     <div className="fieldset-wrapper">
                        <fieldset disabled={isIdeaDriven} className={`optional-context-fieldset ${isIdeaDriven ? 'disabled' : ''}`}>
                            <FormField label="Kiểu Thế Giới" htmlFor="genre">
                                <select id="genre" name="genre" value={formData.genre} onChange={handleInputChange}>
                                    {GENRES.map(genre => <option key={genre} value={genre}>{genre}</option>)}
                                </select>
                            </FormField>
    
                            <FormField label="Bối Cảnh" htmlFor="setting">
                                <select id="setting" name="setting" value={formData.setting} onChange={handleInputChange}>
                                    {SETTINGS.map(setting => (
                                        <option key={setting} value={setting} disabled={!validSettings.includes(setting)}>
                                            {setting}
                                        </option>
                                    ))}
                                </select>
                            </FormField>
    
                            <FormField label="Mẫu Cốt truyện (Tùy chọn)" htmlFor="storyTemplate">
                                <div className="select-wrapper">
                                    <select
                                        id="storyTemplate"
                                        name="storyTemplate"
                                        onChange={handleStoryTemplateChange}
                                        value={selectedTemplateValue}
                                    >
                                        <option value="">Trống (Mặc định)</option>
                                        {Object.entries(filteredTemplates).map(([category, templates]) => (
                                            <optgroup label={category} key={category}>
                                                {templates.map((template) => (
                                                    <option key={template.label} value={`${category}::${template.label}`}>
                                                        {template.label}
                                                    </option>
                                                ))}
                                            </optgroup>
                                        ))}
                                    </select>
                                </div>
                            </FormField>
                            
                            {selectedTemplateLabel && (
                                <p className="template-selected-feedback">
                                    Đã áp dụng mẫu: <strong>{selectedTemplateLabel}</strong>. AI sẽ sử dụng ý tưởng này.
                                </p>
                            )}
                            
                            <FormField label="Gợi ý của bạn (Tùy Chọn)" htmlFor="suggestion">
                                <textarea
                                    id="suggestion"
                                    name="suggestion"
                                    rows={2}
                                    placeholder="VD: Thế giới đang trên bờ vực chiến tranh, có một lời nguyền cổ xưa..."
                                    value={formData.suggestion}
                                    onChange={handleInputChange}
                                />
                                <p className="field-hint">Thêm chi tiết bạn muốn AI tập trung vào khi phát triển bối cảnh.</p>
                            </FormField>
                            
                            <button 
                                className="wc-button button-suggest-context" 
                                onClick={handleSuggestWorldSummary} 
                                disabled={isAiBusy || isIdeaDriven || isGenreEmptyAndIdeaMissing} 
                                aria-busy={isGeneratingContext} 
                                aria-label={isGeneratingContext ? 'Đang tạo thế giới...' : 'Gợi ý Thế Giới'}
                                title={getSuggestButtonTooltip()}
                            >
                                {isGeneratingContext ? (<><span className="spinner spinner-md"></span> Đang tạo... ({formatTime(contextSuggestionTime)})</>) : (<>Gợi ý Thế Giới</>)}
                            </button>
    
                            <FormField label="Tóm Tắt Bối Cảnh Thế Giới do AI phát triển" htmlFor="worldSummary">
                                <textarea id="worldSummary" name="worldSummary" rows={5} placeholder="AI sẽ phát triển một bối cảnh thế giới quy mô dựa trên các lựa chọn của bạn..." value={formData.worldSummary || ''} onChange={handleInputChange}></textarea>
                            </FormField>
    
                            <FormField label="Cảnh Khởi Đầu" htmlFor="startingScene">
                                <div className="select-wrapper">
                                    <select
                                        id="startingScene"
                                        name="startingScene"
                                        value={formData.startingScene}
                                        onChange={handleInputChange}
                                    >
                                        {startingSceneOptions.map(option => (
                                            <option key={option.value} value={option.value}>
                                                {`${option.label}: ${option.description}`}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </FormField>

                            <FormField label="Độ Dark của Thế giới" htmlFor="worldTone">
                                <div className="select-wrapper">
                                    <select
                                        id="worldTone"
                                        name="worldTone"
                                        value={formData.worldTone || 'balanced'}
                                        onChange={handleInputChange}
                                    >
                                        <option value="bright">Tươi sáng bình yên</option>
                                        <option value="balanced">Cân bằng hài hòa</option>
                                        <option value="dark">U ám nguy hiểm</option>
                                    </select>
                                </div>
                                <p className="field-hint">Tùy chọn này sẽ ảnh hưởng đến không khí chung, các sự kiện và hành vi của NPC trong thế giới được tạo ra.</p>
                            </FormField>
                        </fieldset>
                        {isIdeaDriven && (
                            <div className="fieldset-overlay" title="Tùy chọn này bị khóa vì bạn đang sử dụng ô 'Ý Tưởng Của Bạn'.">
                                <LockIcon />
                            </div>
                        )}
                    </div>
                </>
            ) : (
                 <>
                    <FormField label="Dán hoặc Tải lên Nội dung Đồng nhân" htmlFor="idea">
                        <textarea
                            id="idea"
                            name="idea"
                            rows={8}
                            placeholder="Dán nội dung truyện hoặc mô tả chi tiết thế giới bạn muốn tạo từ fan-fiction..."
                            value={fanficContent ? `[Đã tải lên tệp.]\n\nNội dung tệp sẽ được sử dụng. Để thay đổi, vui lòng tải lên lại.` : formData.idea}
                            onChange={handleInputChange}
                            readOnly={!!fanficContent}
                        />
                    </FormField>
                    <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: 'calc(var(--space-4) * -1)', marginBottom: 'var(--space-4)' }}>
                        <button
                            type="button"
                            className="wc-button button-import"
                            onClick={onFanficUploadClick}
                            style={{ width: 'auto', marginTop: 0 }}
                        >
                            Tải lên tệp (.txt)
                        </button>
                    </div>
                    <p className="field-hint">Tối đa 200KB. AI sẽ phân tích nội dung để tự động điền các mục.</p>
                     <div className="wc-context-actions" style={{marginTop: 0, marginBottom: 0}}>
                        <button 
                            className="wc-button button-suggest-context" 
                            onClick={handleAnalyzeFanfic} 
                            disabled={isAiBusy || !(fanficContent || formData.idea)} 
                            aria-busy={isAnalyzingFanfic} 
                            aria-label={isAnalyzingFanfic ? 'Đang phân tích...' : 'Phân tích Nhân vật (Cơ bản)'}
                            title={!(fanficContent || formData.idea) ? "Vui lòng dán hoặc tải lên nội dung trước." : "Chi phí: ~1 API call. Phân tích văn bản để tìm các nhân vật chính."}
                        >
                            {isAnalyzingFanfic ? (
                                <><span className="spinner spinner-md"></span> Đang phân tích... ({formatTime(fanficAnalysisTime)})</>
                            ) : (
                                'Phân tích Nhân vật (Cơ bản)'
                            )}
                        </button>
                        <button 
                            className="wc-button button-suggest-context" 
                            onClick={handleAnalyzeFanficSystem} 
                            disabled={isAiBusy || !(fanficContent || formData.idea)} 
                            aria-busy={isAnalyzingSystem} 
                            aria-label={isAnalyzingSystem ? 'Đang phân tích...' : 'Phân tích Hệ thống Chiến đấu (Nâng cao)'}
                            title={!(fanficContent || formData.idea) ? "Vui lòng dán hoặc tải lên nội dung trước." : "Chi phí: ~1 API call. Phân tích sâu để trích xuất hệ thống chỉ số, năng lượng, kỹ năng và các quy tắc của thế giới."}
                        >
                            {isAnalyzingSystem ? (
                                <><span className="spinner spinner-md"></span> Đang phân tích hệ thống... ({formatTime(systemAnalysisTime)})</>
                            ) : (
                                'Phân tích Hệ thống Chiến đấu (Nâng cao)'
                            )}
                        </button>
                    </div>
                    {fanficSystemAnalysis && (
                        <CollapsibleSection title="Hệ thống Thế giới (Phân tích từ AI)" isOpen={isSystemSectionOpen} onToggle={() => setIsSystemSectionOpen(p => !p)}>
                            <p className="field-hint" style={{textAlign: 'left', marginTop: 0}}>
                                AI đã phân tích các hệ thống cốt lõi từ nội dung bạn cung cấp. Bạn có thể chỉnh sửa các thông tin này tại đây. Dữ liệu này sẽ được ưu tiên tuyệt đối khi tạo thế giới.
                            </p>
                            <div className="fanfic-system-display">
                                <div className="system-group">
                                    <h4 className="system-group-title">Hệ Chỉ số Cốt lõi</h4>
                                    {(fanficSystemAnalysis.coreStats || []).map((item, index) => (
                                        <div key={index} className="editable-item">
                                            <input value={item.name} onChange={(e) => handleFanficSystemChange(`coreStats.${index}`, 'name', e.target.value)} />
                                            <textarea value={item.description} onChange={(e) => handleFanficSystemChange(`coreStats.${index}`, 'description', e.target.value)} rows={2} />
                                        </div>
                                    ))}
                                </div>
                                <div className="system-group">
                                    <h4 className="system-group-title">Hệ thống Năng lượng</h4>
                                    <div className="editable-item">
                                        <input value={fanficSystemAnalysis.energySystem.name} onChange={(e) => handleFanficSystemChange('energySystem', 'name', e.target.value)} />
                                        <textarea value={fanficSystemAnalysis.energySystem.description} onChange={(e) => handleFanficSystemChange('energySystem', 'description', e.target.value)} rows={3} />
                                    </div>
                                </div>
                                <div className="system-group">
                                    <h4 className="system-group-title">Kỹ năng & Năng lực Tiêu biểu</h4>
                                     {(fanficSystemAnalysis.keySkills || []).map((item, index) => (
                                        <div key={index} className="editable-item">
                                            <input value={item.name} onChange={(e) => handleFanficSystemChange(`keySkills.${index}`, 'name', e.target.value)} />
                                            <textarea value={item.description} onChange={(e) => handleFanficSystemChange(`keySkills.${index}`, 'description', e.target.value)} rows={2} />
                                        </div>
                                    ))}
                                </div>
                                 <div className="system-group">
                                    <h4 className="system-group-title">Vật phẩm & Trang bị Quan trọng</h4>
                                     {(fanficSystemAnalysis.keyItems || []).map((item, index) => (
                                        <div key={index} className="editable-item">
                                            <input value={item.name} onChange={(e) => handleFanficSystemChange(`keyItems.${index}`, 'name', e.target.value)} />
                                            <textarea value={item.description} onChange={(e) => handleFanficSystemChange(`keyItems.${index}`, 'description', e.target.value)} rows={2} />
                                        </div>
                                    ))}
                                </div>
                                 <div className="system-group">
                                    <h4 className="system-group-title">Luật lệ Thế giới</h4>
                                     {(fanficSystemAnalysis.worldRules || []).map((item, index) => (
                                        <div key={index} className="editable-item">
                                            <input value={item.name} onChange={(e) => handleFanficSystemChange(`worldRules.${index}`, 'name', e.target.value)} />
                                            <textarea value={item.description} onChange={(e) => handleFanficSystemChange(`worldRules.${index}`, 'description', e.target.value)} rows={2} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </CollapsibleSection>
                    )}
                    <div className="form-field" style={{marginTop: 'var(--space-4)'}}>
                        <label>Lựa chọn nhân vật:</label>
                        <div className="processing-mode-grid" style={{gridTemplateColumns: '1fr 1fr'}}>
                            <label 
                                htmlFor="char-option-main" 
                                className={`processing-mode-button ${fanficCharOption === 'main' ? 'active' : ''}`}
                                title="AI sẽ trích xuất nhân vật chính từ văn bản để bạn nhập vai."
                            >
                                <input
                                    type="radio"
                                    id="char-option-main"
                                    name="fanficCharOption"
                                    value="main"
                                    checked={fanficCharOption === 'main'}
                                    onChange={(e) => setFanficCharOption(e.target.value as 'main' | 'new')}
                                />
                                Nhập vai vào nhân vật chính
                            </label>
                            <label 
                                htmlFor="char-option-new" 
                                className={`processing-mode-button ${fanficCharOption === 'new' ? 'active' : ''}`}
                                title="Tạo một nhân vật hoàn toàn mới (OC) để đưa vào thế giới fan-fiction."
                            >
                                <input
                                    type="radio"
                                    id="char-option-new"
                                    name="fanficCharOption"
                                    value="new"
                                    checked={fanficCharOption === 'new'}
                                    onChange={(e) => setFanficCharOption(e.target.value as 'main' | 'new')}
                                />
                                Tạo nhân vật mới
                            </label>
                        </div>
                    </div>
                    <CollapsibleSection
                        title="Hướng dẫn Kiến tạo Đồng nhân"
                        isOpen={isFanficHelpOpen}
                        onToggle={() => setIsFanficHelpOpen(p => !p)}
                    >
                        <div className="harem-mechanics-info-content" style={{fontSize: '0.9rem', lineHeight: '1.6'}}>
                            <p>
                                <strong>Cách hoạt động:</strong> Dán nội dung, tóm tắt, hoặc các ghi chú về tác phẩm bạn yêu thích vào ô bên trên. AI sẽ phân tích văn bản để tự động xây dựng bối cảnh thế giới, các quy tắc, và các nhân vật chính.
                            </p>
                            <p><strong>Tùy chọn nhân vật:</strong></p>
                            <ul>
                                <li><strong>Nhập vai vào nhân vật chính:</strong> AI sẽ trích xuất nhân vật chính từ văn bản để bạn nhập vai. Bảng "Nhân Vật Chính" sẽ bị khóa.</li>
                                <li><strong>Tạo nhân vật mới:</strong> AI vẫn sẽ xây dựng thế giới từ văn bản, nhưng bạn có thể tự do tạo một nhân vật hoàn toàn mới (OC - Original Character) để đưa vào thế giới đó.</li>
                            </ul>
                            <hr style={{borderColor: 'var(--border-primary)', margin: '1rem 0'}} />
                            <p><strong>Giải thích tùy chọn "Tuân thủ IP & Việt hóa Nâng cao":</strong></p>
                            <ul>
                                <li>
                                    <strong>Khi BẬT (Mặc định):</strong>
                                    <ul>
                                        <li><strong>Tuân thủ nghiêm ngặt:</strong> AI sẽ cố gắng bám sát 100% vào nguyên tác (IP) bạn cung cấp. Nó sẽ không bịa đặt các nhân vật hay tình tiết mâu thuẫn với IP.</li>
                                        <li><strong>Nghiên cứu sâu rộng:</strong> Để đảm bảo tính chính xác, AI sẽ mở rộng nguồn tham khảo ra toàn cầu (Wikipedia, Google, Fandom wikis...) để thu thập thông tin, sau đó tự động dịch và tích hợp vào game bằng tiếng Việt một cách tự nhiên.</li>
                                        <li><strong>Xử lý tên riêng thông minh:</strong> Thay vì Việt hóa mọi cái tên, AI sẽ linh hoạt sử dụng tên theo bối cảnh (ví dụ: giữ nguyên 'Arthur' cho bối cảnh Fantasy phương Tây) nhưng vẫn viết bằng ký tự Latin/tiếng Việt.</li>
                                    </ul>
                                </li>
                                <li>
                                    <strong>Khi TẮT:</strong>
                                    <ul>
                                        <li><strong>Sáng tạo tự do:</strong> AI sẽ xem nội dung bạn cung cấp là nguồn cảm hứng. Nó được phép sáng tạo thêm các nhân vật phụ, địa điểm, và các nhánh truyện mới không có trong nguyên tác, miễn là chúng phù hợp với không khí chung của thế giới.</li>
                                    </ul>
                                </li>
                            </ul>
                        </div>
                    </CollapsibleSection>
                    <div className="wc-creation-mode-toggle" style={{maxWidth: '100%', margin: '1rem 0'}}>
                        <ToggleSwitch
                            id="strictFanficAdherenceToggle"
                            label="Tuân thủ IP & Việt hóa Nâng cao"
                            description="Bật để AI tuân thủ nghiêm ngặt IP gốc, tìm kiếm thông tin trên toàn cầu và Việt hóa. Tắt để AI có thêm không gian sáng tạo nhân vật và tình tiết mới."
                            name="strictFanficAdherence"
                            checked={formData.strictFanficAdherence ?? true}
                            onChange={handleInputChange}
                        />
                    </div>
                </>
            )}
        </>
    );
};