/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState } from 'react';
import './WorldCreator.css';
import { CollapsibleSection } from '../ui/CollapsibleSection';
import { LoreModal } from '../modals/LoreModal';
import { ContextSection } from '../wc-tabs/ContextSection';
import { CharacterSection } from '../wc-tabs/CharacterSection';
import { ToggleSwitch } from '../ui/ToggleSwitch';
import { useWorldCreatorManager } from '../../hooks/useWorldCreatorManager';
import { FormField } from '../ui/FormField';
import type { WorldSettings, GameState } from '../../types';

// FIX: Defined the missing 'WorldCreatorProps' interface.
interface WorldCreatorProps {
    onBack: () => void;
    onCreateWorld: (gameState: GameState, worldSettings: WorldSettings) => void;
}

export const WorldCreator = ({ onBack, onCreateWorld }: WorldCreatorProps) => {
    const {
        formData,
        setFormData,
        handleInputChange,
        handleStoryTemplateChange,
        handleRefresh,
        fanficContent,
        setFanficContent,
        fanficCharOption,
        setFanficCharOption,
        isQuickCreate,
        setIsQuickCreate,
        isGeneratingContext,
        isGeneratingChar,
        contextSuggestionTime,
        charSuggestionTime,
        isCreating,
        creationMessage,
        error,
        setError,
        creationTimeElapsed,
        handleSuggestWorldSummary,
        handleSuggestCharacter,
        onOpenSuggestionPanel,
        isSuggestionPanelOpen,
        setIsSuggestionPanelOpen,
        suggestionConfig,
        setSuggestionConfig,
        handleInitiateCreation,
        showLoreModal,
        setShowLoreModal,
        handleLoreSave,
        importFileRef,
        openSections,
        toggleSection,
        handleExportSettings,
        handleFileChange,
        isAnalyzingFanfic,
        fanficAnalysisTime,
        fanficAnalysisResult,
        setFanficAnalysisResult,
        handleAnalyzeFanfic,
        handleSelectFanficCharacter,
        isAnalyzingSystem,
        systemAnalysisTime,
        handleAnalyzeFanficSystem,
        fanficSystemAnalysis,
        handleFanficSystemChange,
        isSuggestingStartingPoints,
        startingPointSuggestions,
        handleSelectStartingPoint,
    } = useWorldCreatorManager({ onBack, onCreateWorld });

    const [isFanficCharSectionOpen, setIsFanficCharSectionOpen] = useState(true);
    const [isStartingPointSectionOpen, setIsStartingPointSectionOpen] = useState(true);
    
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    };

    const isAiBusy = isGeneratingContext || isGeneratingChar || isCreating || isAnalyzingFanfic || isAnalyzingSystem || isSuggestingStartingPoints;

    return (
        <div className="wc-container">
            {showLoreModal && (
                <LoreModal
                    initialRules={formData.loreRules || []}
                    onSave={handleLoreSave}
                    onClose={() => setShowLoreModal(false)}
                />
            )}
            {fanficAnalysisResult && (
                <div className="suggestion-panel-overlay" onClick={() => setFanficAnalysisResult(null)}>
                    <div className="suggestion-panel" onClick={e => e.stopPropagation()} style={{maxWidth: '600px'}}>
                        <h4>Chọn Nhân vật Chính</h4>
                        <p className="field-hint">Dựa trên phân tích, đây là các nhân vật tiềm năng để bạn nhập vai.</p>
                        <ul className="fanfic-char-list">
                            {fanficAnalysisResult.map(char => (
                                <li key={char.name} className="fanfic-char-item">
                                    <div className="fanfic-char-info">
                                        <strong>{char.name}</strong>
                                        <p>{char.description}</p>
                                    </div>
                                    <button
                                        className="lore-button save-apply"
                                        onClick={() => handleSelectFanficCharacter(char.name)}
                                    >
                                        Chọn
                                    </button>
                                </li>
                            ))}
                        </ul>
                        <div className="suggestion-panel-actions" style={{justifyContent: 'center'}}>
                            <button className="lore-button cancel" onClick={() => setFanficAnalysisResult(null)}>
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {isSuggestionPanelOpen && (
                 <div className="suggestion-panel-overlay" onClick={() => setIsSuggestionPanelOpen(false)}>
                    <div className="suggestion-panel" onClick={e => e.stopPropagation()}>
                        <h4>Tùy chỉnh Gợi ý AI</h4>
                        <p className="field-hint">Chọn số lượng kỹ năng, vật phẩm, và mối quan hệ ban đầu mà bạn muốn AI tạo ra.</p>
                        <div className="suggestion-panel-grid">
                            {/* FIX: Moved input inside FormField to provide children prop. */}
                            <FormField label={`Kỹ năng (${suggestionConfig.skills})`} htmlFor="skill-count">
                                 <div className="slider-wrapper">
                                    <input
                                        id="skill-count"
                                        type="range"
                                        min="0"
                                        max="4"
                                        value={suggestionConfig.skills}
                                        onChange={e => setSuggestionConfig(prev => ({...prev, skills: parseInt(e.target.value, 10)}))}
                                        disabled={isGeneratingChar}
                                    />
                                </div>
                            </FormField>
                            {/* FIX: Moved input inside FormField to provide children prop. */}
                            <FormField label={`Vật phẩm Khởi đầu (${suggestionConfig.items})`} htmlFor="item-count">
                                 <div className="slider-wrapper">
                                    <input
                                        id="item-count"
                                        type="range"
                                        min="0"
                                        max="4"
                                        value={suggestionConfig.items}
                                        onChange={e => setSuggestionConfig(prev => ({...prev, items: parseInt(e.target.value, 10)}))}
                                        disabled={isGeneratingChar}
                                    />
                                </div>
                            </FormField>
                            {/* FIX: Moved input inside FormField to provide children prop. */}
                            <FormField label={`Mối quan hệ (${suggestionConfig.relationships})`} htmlFor="relationship-count">
                                 <div className="slider-wrapper">
                                    <input
                                        id="relationship-count"
                                        type="range"
                                        min="0"
                                        max="15"
                                        value={suggestionConfig.relationships}
                                        onChange={e => setSuggestionConfig(prev => ({...prev, relationships: parseInt(e.target.value, 10)}))}
                                        disabled={isGeneratingChar}
                                    />
                                </div>
                            </FormField>
                        </div>
                        <div className="suggestion-panel-actions">
                            <button className="lore-button cancel" onClick={() => setIsSuggestionPanelOpen(false)} disabled={isGeneratingChar}>Hủy</button>
                            <button 
                                className="lore-button save-apply" 
                                onClick={handleSuggestCharacter} 
                                disabled={isGeneratingChar}
                            >
                                {isGeneratingChar ? (<><span className="spinner spinner-sm"></span> Đang tạo...</>) : 'Tạo'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {(isCreating || isAnalyzingFanfic || isAnalyzingSystem) && (
                <div className="wc-quick-create-overlay">
                    <div className="spinner spinner-lg"></div>
                    <span>
                        {isCreating ? creationMessage :
                         isAnalyzingFanfic ? 'Đang phân tích nhân vật...' :
                         'Đang phân tích hệ thống chiến đấu...'}
                    </span>
                    <div className="wc-creation-progress">
                        <div className="progress-details">
                            <span>
                                {formatTime(
                                    isCreating ? creationTimeElapsed :
                                    isAnalyzingFanfic ? fanficAnalysisTime :
                                    systemAnalysisTime
                                )}
                            </span>
                        </div>
                    </div>
                </div>
            )}
            <header className="wc-header">
                <button className="wc-button-icon" onClick={onBack} aria-label="Về Trang Chủ">Về Trang Chủ</button>
                <h1 className="wc-title">Kiến Tạo Thế Giới</h1>
                <button className="wc-button-icon" onClick={handleRefresh} aria-label="Làm Mới">Làm Mới</button>
            </header>
            <p className="wc-hint">Bạn không cần điền tất cả, AI sẽ điền thay bạn.</p>
            <main className="wc-form" aria-label="World Creation Form">
                <div className="form-content-wrapper">
                     <div className="wc-creation-mode-toggle">
                        <ToggleSwitch
                            id="quickCreateToggle"
                            label={<span>Tạo Nhanh (1 API Call) <span className="recommended-badge">Khuyến nghị</span></span>}
                            description="Tạo Nhanh sử dụng prompt đơn giản cho kết quả nhanh và tiết kiệm. Tạo Chi tiết sử dụng prompt phức tạp, AI suy nghĩ sâu hơn cho thế giới có chiều sâu hơn nhưng tốn nhiều token và thời gian xử lý hơn. Cả hai chế độ đều chỉ dùng 1 lệnh gọi API."
                            name="quickCreate"
                            checked={isQuickCreate}
                            onChange={(e) => setIsQuickCreate(e.target.checked)}
                        />
                    </div>
                    <div className="form-grid">
                        <div className="grid-col">
                           <CollapsibleSection title="Bối Cảnh Truyện" isOpen={openSections.context} onToggle={() => toggleSection('context')} >
                               <ContextSection
                                   formData={formData}
                                   setFormData={setFormData}
                                   handleInputChange={handleInputChange}
                                   handleStoryTemplateChange={handleStoryTemplateChange}
                                   fanficContent={fanficContent}
                                   setFanficContent={setFanficContent}
                                   fanficCharOption={fanficCharOption}
                                   setFanficCharOption={setFanficCharOption}
                                   isGeneratingContext={isGeneratingContext}
                                   isAiBusy={isAiBusy}
                                   handleSuggestWorldSummary={handleSuggestWorldSummary}
                                   contextSuggestionTime={contextSuggestionTime}
                                   formatTime={formatTime}
                                   onFanficUploadClick={() => importFileRef.current?.click()}
                                   isAnalyzingFanfic={isAnalyzingFanfic}
                                   fanficAnalysisTime={fanficAnalysisTime}
                                   handleAnalyzeFanfic={handleAnalyzeFanfic}
                                   isAnalyzingSystem={isAnalyzingSystem}
                                   systemAnalysisTime={systemAnalysisTime}
                                   handleAnalyzeFanficSystem={handleAnalyzeFanficSystem}
                                   fanficSystemAnalysis={fanficSystemAnalysis}
                                   handleFanficSystemChange={handleFanficSystemChange}
                               />
                                {formData.genre === 'Đồng nhân' && (isSuggestingStartingPoints || (startingPointSuggestions && startingPointSuggestions.length > 0)) && (
                                    <CollapsibleSection title="Gợi ý Điểm Khởi đầu" isOpen={isStartingPointSectionOpen} onToggle={() => setIsStartingPointSectionOpen(p => !p)}>
                                        {isSuggestingStartingPoints ? (
                                            <div style={{ display: 'flex', justifyContent: 'center', padding: '1rem' }}>
                                                <span className="spinner spinner-md"></span>
                                            </div>
                                        ) : (
                                            <>
                                                <p className="field-hint" style={{ textAlign: 'left', marginTop: 0 }}>
                                                    Dựa trên phân tích, đây là các điểm khởi đầu tiềm năng. Chọn một gợi ý sẽ tự động điền vào mục "Gợi ý của bạn" ở tab Mặc định.
                                                </p>
                                                <ul className="fanfic-char-list">
                                                    {(startingPointSuggestions || []).map((suggestion, index) => (
                                                        <li key={index} className="fanfic-char-item">
                                                            <div className="fanfic-char-info">
                                                                <strong>{suggestion.place}</strong>
                                                                <p><strong>Thời gian:</strong> {suggestion.time}</p>
                                                                <p>{suggestion.description}</p>
                                                            </div>
                                                            <button
                                                                className="lore-button save-apply"
                                                                onClick={() => handleSelectStartingPoint(suggestion)}
                                                            >
                                                                Chọn
                                                            </button>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </>
                                        )}
                                    </CollapsibleSection>
                                )}
                                {formData.genre === 'Đồng nhân' && fanficCharOption === 'main' && (
                                    <CollapsibleSection
                                        title="Thông tin Nhân vật Chính (Nhập vai)"
                                        isOpen={isFanficCharSectionOpen}
                                        onToggle={() => setIsFanficCharSectionOpen(p => !p)}
                                    >
                                        <p className="field-hint" style={{textAlign: 'left', marginTop: 0}}>
                                            Điền các thông tin cốt lõi về nhân vật bạn muốn nhập vai. AI sẽ tự động phát triển các chi tiết còn lại (chỉ số, kỹ năng, vật phẩm...) dựa trên nội dung Đồng nhân khi bạn tạo thế giới.
                                        </p>
                                        {/* FIX: Moved input inside FormField to provide children prop. */}
                                        <FormField label="Tên" htmlFor="fanfic-char-name">
                                            <input
                                                id="fanfic-char-name"
                                                type="text"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleInputChange}
                                                placeholder="Tên nhân vật chính trong truyện..."
                                            />
                                        </FormField>
                                        {/* FIX: Moved select inside FormField to provide children prop. */}
                                        <FormField label="Giới tính" htmlFor="fanfic-char-gender">
                                            <div className="select-wrapper">
                                                <select
                                                    id="fanfic-char-gender"
                                                    name="gender"
                                                    value={formData.gender}
                                                    onChange={handleInputChange}
                                                >
                                                    <option>Nam</option>
                                                    <option>Nữ</option>
                                                </select>
                                            </div>
                                        </FormField>
                                        {/* FIX: Moved input inside FormField to provide children prop. */}
                                        <FormField label="Chủng tộc" htmlFor="fanfic-char-species">
                                            <input
                                                id="fanfic-char-species"
                                                type="text"
                                                name="species"
                                                value={formData.species}
                                                onChange={handleInputChange}
                                                placeholder="VD: Người, Elf, Yêu tộc..."
                                            />
                                        </FormField>
                                        {/* FIX: Moved textarea inside FormField to provide children prop. */}
                                        <FormField label="Tiểu sử" htmlFor="fanfic-char-backstory">
                                            <textarea
                                                id="fanfic-char-backstory"
                                                name="backstory"
                                                rows={4}
                                                value={formData.backstory}
                                                onChange={handleInputChange}
                                                placeholder="Tóm tắt ngắn gọn tiểu sử, nguồn gốc nhân vật..."
                                            />
                                        </FormField>
                                    </CollapsibleSection>
                                )}
                            </CollapsibleSection>
                        </div>
                        <div className="grid-col">
                            <div className="fieldset-wrapper">
                                {formData.genre === 'Đồng nhân' && fanficCharOption === 'main' ? (
                                     <div className="form-section open">
                                        <div className="fieldset-overlay-content" style={{padding: '2rem', textAlign: 'center'}}>
                                            <p>Thông tin nhân vật chính được điền ở mục "Bối Cảnh Truyện" bên trái.</p>
                                            <p className="field-hint">AI sẽ tự động tạo các chỉ số, kỹ năng và vật phẩm khởi đầu dựa trên nội dung Đồng nhân khi bạn tạo thế giới.</p>
                                        </div>
                                    </div>
                                ) : (
                                    <CollapsibleSection title="Nhân Vật Chính" isOpen={openSections.character} onToggle={() => toggleSection('character')} >
                                        <CharacterSection
                                            formData={formData}
                                            handleInputChange={handleInputChange}
                                            setFormData={setFormData}
                                            setError={setError}
                                            isGeneratingChar={isGeneratingChar}
                                            isAiBusy={isAiBusy}
                                            handleSuggestCharacter={onOpenSuggestionPanel}
                                            fanficCharOption={fanficCharOption}
                                            charSuggestionTime={charSuggestionTime}
                                            formatTime={formatTime}
                                        />
                                    </CollapsibleSection>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="wc-context-actions" style={{ marginTop: 'var(--space-6)', marginBottom: 'var(--space-6)' }}>
                    <button type="button" className="wc-button button-lore" onClick={() => setShowLoreModal(true)}>
                        Luật Lệ
                    </button>
                    <button type="button" className="wc-button button-import" onClick={() => importFileRef.current?.click()}>
                        Nhập Kiến Tạo (json)
                    </button>
                    <button type="button" className="wc-button button-export" onClick={handleExportSettings}>
                        Xuất Kiến Tạo
                    </button>
                </div>
                <input
                    type="file"
                    ref={importFileRef}
                    style={{ display: 'none' }}
                    accept=".json,.txt"
                    onChange={handleFileChange}
                />
                <footer className="wc-footer">
                    {error && ( <div className="error-message"><span>{error}</span><button onClick={() => setError(null)} aria-label="Đóng thông báo lỗi">X</button></div> )}
                    <button 
                        className="wc-button button-create-world" 
                        onClick={() => handleInitiateCreation(isQuickCreate)} 
                        disabled={isAiBusy} 
                        aria-busy={isAiBusy} 
                        aria-label={isCreating ? 'Đang tạo thế giới...' : 'Tạo Thế Giới'}
                        title={isQuickCreate ? "Tạo Nhanh: 1 lệnh gọi API, nhanh, tiết kiệm." : "Tạo Chi tiết: 1 lệnh gọi API, AI xử lý lâu hơn, tốn nhiều token hơn."}
                    >
                        {isCreating ? (<><span className="spinner spinner-md"></span> Đang tạo... ({formatTime(creationTimeElapsed)})</>) : 'Tạo Thế Giới'}
                    </button>
                </footer>
            </main>
        </div>
    );
};
