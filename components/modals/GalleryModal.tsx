/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import * as db from '../../services/db';
import { generateUniqueId } from '../../utils/id';
import { uploadImage } from '../../services/cloudinary';
import { useSettings } from '../contexts/SettingsContext';
import { ConfirmationModal } from './ConfirmationModal';
import { BackgroundManager } from '../../services/BackgroundManager';
import './GalleryModal.css';
import type { GalleryImage } from '../../types';

interface ImageViewerProps {
    images: GalleryImage[];
    currentIndex: number;
    onClose: () => void;
    onNavigate: (newIndex: number) => void;
    onDelete: (image: GalleryImage) => void;
    onSetAsMenuBg: (image: GalleryImage) => void;
    onSetAsGameBg: (image: GalleryImage) => void;
    onDownload: (image: GalleryImage) => void;
}

const getImageType = (img: GalleryImage): 'character' | 'item' | 'illustration' | 'user' => {
    if (img.type) {
        return img.type;
    }
    // Backward compatibility logic
    if (img.sourceTurnId) {
        return 'illustration';
    }
    if (!img.sourceTurnId && !!img.prompt) {
        return 'character'; // Assume old AI images are characters
    }
    return 'user';
};

const ImageViewer = ({ images, currentIndex, onClose, onNavigate, onDelete, onSetAsMenuBg, onSetAsGameBg, onDownload }: ImageViewerProps) => {
    const currentImage = images[currentIndex];

    const handlePrev = useCallback(() => { if (currentIndex > 0) onNavigate(currentIndex - 1); }, [currentIndex, onNavigate]);
    const handleNext = useCallback(() => { if (currentIndex < images.length - 1) onNavigate(currentIndex + 1); }, [currentIndex, images.length, onNavigate]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
            else if (e.key === 'ArrowLeft') handlePrev();
            else if (e.key === 'ArrowRight') handleNext();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handlePrev, handleNext, onClose]);

    if (!currentImage) return null;

    const stopPropagation = (e: React.MouseEvent) => e.stopPropagation();

    return (
        <div className="image-viewer-overlay" onClick={onClose}>
            <button className="image-viewer-nav prev" onClick={(e) => { e.stopPropagation(); handlePrev(); }} disabled={currentIndex === 0}>‹</button>
            <div className="image-viewer-content-wrapper">
                <img src={currentImage.dataUrl} alt={currentImage.description || currentImage.name} className="image-viewer-content" onClick={stopPropagation} />
                <div className="image-viewer-toolbar" onClick={stopPropagation}>
                    <div className="image-viewer-info">
                        <p className="image-viewer-name">{currentImage.name}</p>
                        {currentImage.description && <p className="image-viewer-desc">{currentImage.description}</p>}
                    </div>
                    <div className="image-viewer-actions">
                        <button className="viewer-action-button" onClick={() => onSetAsMenuBg(currentImage)}>Nền Menu</button>
                        <button className="viewer-action-button" onClick={() => onSetAsGameBg(currentImage)}>Nền Game</button>
                        <button className="viewer-action-button" onClick={() => onDownload(currentImage)}>Tải xuống</button>
                        <button className="viewer-action-button danger" onClick={() => onDelete(currentImage)}>Xóa</button>
                    </div>
                </div>
            </div>
            <button className="image-viewer-nav next" onClick={(e) => { e.stopPropagation(); handleNext(); }} disabled={currentIndex === images.length - 1}>›</button>
        </div>
    );
};

// FIX: Define the missing GalleryModalProps interface.
interface GalleryModalProps {
    onClose: () => void;
    addToast: (message: string, type?: 'info' | 'success' | 'error' | 'warning', details?: any) => void;
}

export const GalleryModal = ({ onClose, addToast }: GalleryModalProps) => {
    const { settings } = useSettings();
    const [images, setImages] = useState<GalleryImage[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedImageIds, setSelectedImageIds] = useState<Set<string>>(new Set());
    const [viewerIndex, setViewerIndex] = useState<number | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [mainTab, setMainTab] = useState<'user' | 'ai'>('user');
    const [aiSubTab, setAiSubTab] = useState<'illustration' | 'avatar' | 'item'>('illustration');

    const fileInputRef = useRef<HTMLInputElement>(null);

    const loadImages = useCallback(async () => {
        setIsLoading(true);
        try {
            const allImages = await db.getAllImages();
            setImages(allImages.reverse());
        } catch (error) { addToast('Không thể tải thư viện ảnh.', 'error', error); } 
        finally { setIsLoading(false); }
    }, [addToast]);

    useEffect(() => { loadImages(); }, [loadImages]);
    
    const filteredImages = useMemo(() => {
        let tabFilteredImages: GalleryImage[];

        if (mainTab === 'user') {
            tabFilteredImages = images.filter(img => getImageType(img) === 'user');
        } else { // AI generated
            if (aiSubTab === 'illustration') {
                tabFilteredImages = images.filter(img => getImageType(img) === 'illustration');
            } else if (aiSubTab === 'item') {
                tabFilteredImages = images.filter(img => getImageType(img) === 'item');
            } else { // Avatars
                tabFilteredImages = images.filter(img => getImageType(img) === 'character');
            }
        }
        return tabFilteredImages;
    }, [images, mainTab, aiSubTab]);

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files || files.length === 0) return;

        let newCount = 0;
        let updatedCount = 0;
        addToast(`Đang xử lý và tải lên ${files.length} ảnh...`, 'info');

        // Get a fresh list of images to check for duplicates by name
        const currentImages = await db.getAllImages();
        const currentImagesMap = new Map(currentImages.map(img => [img.name, img]));

        const uploadPromises = Array.from(files).map(async (file) => {
            if (file.size > 10 * 1024 * 1024) {
                addToast(`Tệp "${file.name}" quá lớn (tối đa 10MB) và sẽ bị bỏ qua.`, 'warning');
                return;
            }
            try {
                const cloudinaryUrl = await uploadImage(file);
                const existingImage = currentImagesMap.get(file.name);

                if (existingImage) {
                    // Overwrite existing image
                    const updatedImage: GalleryImage = {
                        ...existingImage,
                        dataUrl: cloudinaryUrl,
                        description: 'Cập nhật bởi người dùng',
                        type: 'user',
                    };
                    await db.addOrUpdateImage(updatedImage);
                    updatedCount++;
                } else {
                    // Add new image
                    const newImage: GalleryImage = {
                        id: generateUniqueId('img'),
                        name: file.name,
                        dataUrl: cloudinaryUrl,
                        description: 'Tải lên bởi người dùng',
                        type: 'user',
                    };
                    await db.addOrUpdateImage(newImage);
                    newCount++;
                }
            } catch (e) {
                const message = e instanceof Error ? e.message : "Lỗi không xác định";
                addToast(`Tải lên thất bại cho ${file.name}: ${message}`, 'error', e);
            }
        });

        await Promise.all(uploadPromises);

        let successMessage = '';
        if (newCount > 0) {
            successMessage += `Đã thêm ${newCount} ảnh mới. `;
        }
        if (updatedCount > 0) {
            successMessage += `Đã cập nhật ${updatedCount} ảnh đã có.`;
        }
        
        if (successMessage) {
            addToast(successMessage.trim(), 'success');
            await loadImages();
        }

        if (event.target) event.target.value = '';
    };

    const confirmDelete = async () => {
        const idsToDelete = Array.from(selectedImageIds);
        try {
            await Promise.all(idsToDelete.map(id => db.deleteImage(id)));
            addToast(`Đã xóa ${idsToDelete.length} ảnh thành công.`, 'success');
            await loadImages();
        } catch (error) { addToast('Xóa ảnh thất bại.', 'error', error); }
        setShowDeleteConfirm(false);
        setSelectedImageIds(new Set());
    };
    
    const handleSelectImage = (imageId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (e.shiftKey && filteredImages.length > 0) {
            const lastSelectedId = Array.from(selectedImageIds).pop();
            const lastIndex = lastSelectedId ? filteredImages.findIndex(img => img.id === lastSelectedId) : -1;
            const currentIndex = filteredImages.findIndex(img => img.id === imageId);
            if (lastIndex !== -1 && currentIndex !== -1) {
                const start = Math.min(lastIndex, currentIndex);
                const end = Math.max(lastIndex, currentIndex);
                const newSelection = new Set(selectedImageIds);
                for (let i = start; i <= end; i++) {
                    newSelection.add(filteredImages[i].id);
                }
                setSelectedImageIds(newSelection);
                return;
            }
        }
        setSelectedImageIds(prev => {
            const newSet = new Set(prev);
            newSet.has(imageId) ? newSet.delete(imageId) : newSet.add(imageId);
            return newSet;
        });
    };

    const handleSetMenuBg = (image: GalleryImage) => {
        BackgroundManager.set('menu_desktop', image.id);
        BackgroundManager.set('menu_mobile', image.id);
        addToast(`Đã đặt "${image.name}" làm ảnh nền Menu.`, 'success');
    };
    
    const handleSetGameBg = (image: GalleryImage) => {
        BackgroundManager.set('game_desktop', image.id);
        BackgroundManager.set('game_mobile', image.id);
        addToast(`Đã đặt "${image.name}" làm ảnh nền Game.`, 'success');
    };

    const handleDownload = (image: GalleryImage) => {
        // Since it's a Cloudinary URL, we can just open it in a new tab for the user to save.
        window.open(image.dataUrl, '_blank');
    };
    
    const handleDeleteFromViewer = (image: GalleryImage) => {
        setViewerIndex(null);
        setSelectedImageIds(new Set([image.id]));
        setShowDeleteConfirm(true);
    };

    return (
        <>
            <div className="modal-overlay" onClick={onClose}>
                <div className="modal-content fullscreen-modal-content gallery-modal-content" onClick={e => e.stopPropagation()}>
                    <header className="modal-header">
                        <div className="gallery-header-content">
                            <h3>Thư Viện Ảnh</h3>
                             <div className="gallery-main-tabs">
                                <button className={`gallery-main-tab-button ${mainTab === 'user' ? 'active' : ''}`} onClick={() => setMainTab('user')}>Thư viện của bạn</button>
                                <button className={`gallery-main-tab-button ${mainTab === 'ai' ? 'active' : ''}`} onClick={() => setMainTab('ai')}>Ảnh AI tạo</button>
                            </div>
                            <div className="gallery-header-actions">
                                <button className="gallery-action-button" onClick={() => fileInputRef.current?.click()}>Tải Lên</button>
                                <input type="file" ref={fileInputRef} onChange={handleFileChange} style={{ display: 'none' }} accept="image/png, image/jpeg, image/webp" multiple />
                            </div>
                        </div>
                        <button onClick={onClose} className="modal-close-button" aria-label="Đóng">×</button>
                    </header>
                    <div className="gallery-modal-body">
                        {mainTab === 'ai' && (
                             <div className="gallery-sub-tabs">
                                <button className={`gallery-sub-tab-button ${aiSubTab === 'illustration' ? 'active' : ''}`} onClick={() => setAiSubTab('illustration')}>Ảnh minh họa</button>
                                <button className={`gallery-sub-tab-button ${aiSubTab === 'avatar' ? 'active' : ''}`} onClick={() => setAiSubTab('avatar')}>Ảnh đại diện</button>
                                <button className={`gallery-sub-tab-button ${aiSubTab === 'item' ? 'active' : ''}`} onClick={() => setAiSubTab('item')}>Vật Phẩm</button>
                            </div>
                        )}
                        <main className="gallery-main">
                            {selectedImageIds.size > 0 && (
                                <div className="gallery-action-toolbar">
                                    <span className="selection-count">{selectedImageIds.size} ảnh đã chọn</span>
                                    <div className="toolbar-right-controls">
                                        <button className="toolbar-button delete" onClick={() => setShowDeleteConfirm(true)}>Xóa</button>
                                    </div>
                                </div>
                            )}
                            <div className="gallery-grid-wrapper">
                                {isLoading ? <div className="gallery-message"><div className="spinner spinner-lg"></div></div> : filteredImages.length === 0 ? <div className="gallery-message">Không có ảnh nào trong mục này.</div> : (
                                    <div className="gallery-grid">
                                        {filteredImages.map((image, index) => {
                                            const isSelected = selectedImageIds.has(image.id);
                                            return (
                                                <div 
                                                    key={image.id} 
                                                    className={`gallery-item ${isSelected ? 'selected' : ''}`} 
                                                    title={image.description || image.name}
                                                    onClick={(e) => handleSelectImage(image.id, e)}
                                                    onDoubleClick={() => setViewerIndex(index)}
                                                >
                                                    <img src={image.dataUrl} alt={image.name} className="gallery-item-image" loading="lazy" />
                                                    <div className="gallery-item-overlay">
                                                        <p className="gallery-item-desc">{image.description || image.name}</p>
                                                        <div className="gallery-item-actions">
                                                            <div className={`selection-checkbox ${isSelected ? 'selected' : ''}`} role="checkbox" aria-checked={isSelected} title="Chọn ảnh">{isSelected && '✓'}</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </main>
                    </div>
                </div>
            </div>
            {viewerIndex !== null && <ImageViewer images={filteredImages} currentIndex={viewerIndex} onClose={() => setViewerIndex(null)} onNavigate={setViewerIndex} onDelete={handleDeleteFromViewer} onSetAsMenuBg={handleSetMenuBg} onSetAsGameBg={handleSetGameBg} onDownload={handleDownload} />}
            {showDeleteConfirm && <ConfirmationModal isOpen={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)} onConfirm={confirmDelete} title="Xác Nhận Xóa" message={`Bạn có chắc chắn muốn xóa ${selectedImageIds.size} ảnh đã chọn không? Hành động này không thể hoàn tác.`} confirmText="Xóa" />}
        </>
    );
};