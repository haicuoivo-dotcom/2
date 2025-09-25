/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { useAvatarEditor } from '../../hooks/useAvatarEditor';
import { FormField } from '../ui/FormField';
import { IMAGE_STYLES } from '../../constants/gameConstants';
import type { Character, AppSettings, Stat } from '../../types';
import './AvatarEditModal.css';

interface AvatarEditModalProps {
    character?: Character;
    item?: Stat;
    onClose: () => void;
    onSave: (newUrl: string) => void;
    // FIX: Add missing props to handle toasts and API counting.
    addToast: (message: string, type?: 'info' | 'success' | 'error' | 'warning', details?: any) => void;
    incrementApiRequestCount: () => void;
}

type GoogleImageModel = AppSettings['npcAvatarModel'];

export const AvatarEditModal = (props: AvatarEditModalProps) => {
    const { character, item, onClose } = props;
    const entityName = character?.displayName || item?.name;
    const currentImageUrl = character?.avatarUrl || item?.imageUrl;
    
    const {
        activeTab,
        setActiveTab,
        urlInput,
        setUrlInput,
        galleryImages,
        isLoadingGallery,
        settings,
        prompt,
        setPrompt,
        numImages,
        setNumImages,
        isGenerating,
        generatedImages,
        style,
        setStyle,
        selectedModel,
        setSelectedModel,
        editText,
        setEditText,
        isEditing,
        editResults,
        fileInputRef,
        handleImageSelect,
        handleFileChange,
        handleUrlSave,
        handleGenerate,
        handleEdit,
    } = useAvatarEditor(props);

    return (
        <div className="modal-overlay avatar-edit-overlay" onClick={onClose}>
            <div className="modal-content avatar-edit-modal" onClick={e => e.stopPropagation()}>
                <header className="modal-header">
                    <h3>{`Chọn Ảnh cho ${entityName}`}</h3>
                    <button onClick={onClose} className="modal-close-button" aria-label="Đóng">×</button>
                </header>
                <div className="modal-body">
                    <div className="image-gen-tabs">
                        <button className={`image-gen-tab-button ${activeTab === 'ai-edit' ? 'active' : ''}`} onClick={() => setActiveTab('ai-edit')} disabled={!currentImageUrl || settings.disableAllImageGeneration}>Chỉnh sửa AI (Nano-Banana)</button>
                        <button className={`image-gen-tab-button ${activeTab === 'ai' ? 'active' : ''}`} onClick={() => setActiveTab('ai')} disabled={settings.disableAllImageGeneration}>Tạo bằng AI</button>
                        <button className={`image-gen-tab-button ${activeTab === 'gallery' ? 'active' : ''}`} onClick={() => setActiveTab('gallery')} disabled={galleryImages.length === 0}>Chọn từ Thư Viện</button>
                        <button className={`image-gen-tab-button ${activeTab === 'upload' ? 'active' : ''}`} onClick={() => setActiveTab('upload')}>Tải Lên từ Máy</button>
                        <button className={`image-gen-tab-button ${activeTab === 'url' ? 'active' : ''}`} onClick={() => setActiveTab('url')}>Dùng từ URL</button>
                    </div>

                    {activeTab === 'ai-edit' && (
                        <div className="image-edit-container">
                             <div className="image-edit-source">
                                <span className="image-edit-source-title">Ảnh Gốc</span>
                                <img src={currentImageUrl} alt="Ảnh gốc để chỉnh sửa" className="image-edit-source-image" />
                            </div>
                            <div className="image-edit-controls">
                                 <FormField label="Mệnh lệnh Chỉnh sửa" htmlFor="avatar-edit-text">
                                    <textarea
                                        id="avatar-edit-text"
                                        className="image-gen-prompt"
                                        value={editText}
                                        onChange={(e) => setEditText(e.target.value)}
                                        disabled={isEditing}
                                        placeholder="VD: thêm một vết sẹo trên mắt trái, thay đổi màu tóc thành màu xanh dương, cho cô ấy mỉm cười..."
                                        rows={3}
                                    />
                                </FormField>
                                <div className="image-gen-button-container">
                                    <button
                                        className={`wc-button image-gen-button ${isEditing ? 'processing' : ''}`}
                                        onClick={handleEdit}
                                        disabled={isEditing || !editText.trim()}
                                    >
                                        {isEditing ? <><span className="spinner spinner-md"></span> Đang sửa...</> : 'Áp dụng Chỉnh sửa'}
                                    </button>
                                    <p className="api-cost-notice">Chi phí: ~1 Yêu cầu API</p>
                                </div>
                                <div className="image-gen-results">
                                    {isEditing && <div className="gen-result-loading"><div className="spinner spinner-lg"></div></div>}
                                    {editResults.textResponse && (
                                        <div className="ai-response-text-container">
                                            <p><strong>Phản hồi từ AI:</strong> {editResults.textResponse}</p>
                                        </div>
                                    )}
                                    {editResults.imageUrls.length > 0 ? (
                                        editResults.imageUrls.map((imgSrc, index) => (
                                            <div key={index} className="generated-image-item" onClick={() => handleImageSelect(imgSrc)}>
                                                <img src={imgSrc} alt={`Edited avatar ${index + 1}`} />
                                                <div className="set-avatar-overlay">Chọn làm Ảnh</div>
                                            </div>
                                        ))
                                    ) : !isEditing && (
                                        <div className="gen-result-placeholder">Kết quả chỉnh sửa sẽ xuất hiện ở đây.</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {activeTab === 'gallery' && (
                        <div className="avatar-edit-tab-content">
                            {isLoadingGallery ? <div className="avatar-upload-label"><div className="spinner spinner-md"></div></div> :
                             galleryImages.length > 0 ? (
                                <div className="avatar-preview-grid">
                                    {galleryImages.map((image) => (
                                        <div key={image.id} className="avatar-preview-item" onClick={() => handleImageSelect(image.dataUrl)} title={image.description}>
                                            <img src={image.dataUrl} alt={image.name} />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <label className="avatar-upload-label" onClick={() => setActiveTab('upload')}>
                                    Thư viện của bạn trống.
                                    <br/><small>Chuyển sang tab "Tải Lên từ Máy" để bắt đầu.</small>
                                </label>
                            )}
                        </div>
                    )}

                    {activeTab === 'upload' && (
                        <div className="avatar-edit-tab-content">
                            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/png, image/jpeg, image/webp" style={{display: 'none'}} />
                            <label className="avatar-upload-label" onClick={() => fileInputRef.current?.click()}>
                                Nhấp để chọn tệp...
                                <br/><small>(Tối đa 10MB)</small>
                            </label>
                        </div>
                    )}

                    {activeTab === 'url' && (
                        <div className="avatar-edit-tab-content">
                            <div className="avatar-edit-url-input">
                                <input type="text" placeholder="https://..." value={urlInput} onChange={e => setUrlInput(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleUrlSave()} />
                                <button className="wc-button" style={{width: 'auto', marginTop: 0}} onClick={handleUrlSave}>Sử dụng</button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'ai' && (
                        <div className="image-gen-content">
                             <div className="image-gen-controls">
                                <div className="image-gen-prompt-group">                                   
                                    <FormField label="Prompt Tạo ảnh (AI đã tự động tạo, bạn có thể sửa lại)" htmlFor="avatar-prompt">
                                         <textarea
                                             id="avatar-prompt"
                                             className="image-gen-prompt"
                                             value={prompt}
                                             onChange={(e) => setPrompt(e.target.value)}
                                             disabled={isGenerating}
                                             placeholder="AI sẽ tự động tạo prompt dựa trên thông tin nhân vật của bạn..."
                                         />
                                     </FormField>
                                 </div>
                                <div className="image-gen-sub-controls">
                                     <FormField label="Phong cách Ảnh" htmlFor="image-style">
                                        <div className="select-wrapper">
                                            <select
                                                id="image-style"
                                                value={style}
                                                onChange={(e) => setStyle(e.target.value)}
                                                disabled={isGenerating}
                                            >
                                                {IMAGE_STYLES.map(s => <option key={s.label} value={s.value}>{s.label}</option>)}
                                            </select>
                                        </div>
                                    </FormField>
                                    {settings.npcAvatarProvider === 'google' && (
                                        <FormField label="Mô hình AI (Google)" htmlFor="image-model">
                                            <div className="select-wrapper">
                                                <select
                                                    id="image-model"
                                                    value={selectedModel}
                                                    onChange={(e) => setSelectedModel(e.target.value as GoogleImageModel)}
                                                    disabled={isGenerating}
                                                >
                                                    <option value="imagen">Imagen 4 (Chất lượng cao)</option>
                                                    <option value="gemini-2-5-flash-image-preview">Gemini 2.5 Flash Image Preview</option>
                                                </select>
                                            </div>
                                        </FormField>
                                    )}
                                    <FormField label="Số lượng ảnh" htmlFor="num-images">
                                        <input 
                                            type="number"
                                            id="num-images"
                                            value={numImages}
                                            onChange={(e) => setNumImages(Math.max(1, Math.min(4, parseInt(e.target.value, 10) || 1)))}
                                            min="1"
                                            max="4"
                                            disabled={isGenerating}
                                            style={{width: '80px'}}
                                        />
                                    </FormField>
                                    <div className="image-gen-button-container">
                                        <button
                                            className="wc-button image-gen-button"
                                            onClick={handleGenerate}
                                            disabled={isGenerating || !prompt.trim()}
                                        >
                                            {isGenerating ? <><span className="spinner spinner-sm"></span> Đang tạo...</> : 'Tạo Ảnh'}
                                        </button>
                                         <p className="api-cost-notice">
                                            {settings.npcAvatarProvider === 'openrouter' 
                                                ? 'Chi phí tùy thuộc vào mô hình đã chọn' 
                                                : 'Chi phí: ~1 Yêu cầu API'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="image-gen-results">
                                {isGenerating && (
                                    <div className="gen-result-loading">
                                        <div className="spinner spinner-lg"></div>
                                    </div>
                                )}
                                {generatedImages.length > 0 ? (
                                    generatedImages.map((imgSrc, index) => (
                                        <div key={index} className="generated-image-item" onClick={() => handleImageSelect(imgSrc)}>
                                            <img src={imgSrc} alt={`Generated avatar ${index + 1}`} />
                                            <div className="set-avatar-overlay">Chọn làm Ảnh</div>
                                        </div>
                                    ))
                                ) : !isGenerating && (
                                    <div className="gen-result-placeholder">
                                        Ảnh được tạo sẽ xuất hiện ở đây.
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
