/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useRef, useState } from 'react';
import { useGameSession } from '../contexts/GameContext';
import { useToasts } from '../contexts/ToastContext';
import { useSettings } from '../contexts/SettingsContext';
import * as db from '../../services/db';
import { BackgroundManager } from '../../services/BackgroundManager';
import { Modal } from '../ui/Modal';
import { ExperienceSettingsTab } from '../settings-tabs/ExperienceSettingsTab';
import { AudioSettingsTab } from '../settings-tabs/AudioSettingsTab';
import { InterfaceSettingsTab } from '../settings-tabs/InterfaceSettingsTab';
import { WorldDefaultsTab } from '../settings-tabs/WorldDefaultsTab';
import { BackgroundSettingsTab } from '../settings-tabs/BackgroundSettingsTab';
import { ImageSettingsTab } from '../settings-tabs/ImageSettingsTab';
import { StoryTendenciesTab } from '../settings-tabs/StoryTendenciesTab';
import type { GalleryImage } from '../../types';
import './SettingsModal.css';
import './GalleryModal.css';

interface SettingsModalProps {
    onClose: () => void;
}

export const SettingsModal = ({ onClose }: SettingsModalProps) => {
    const gameSession = useGameSession();
    const { addToast } = useToasts();
    const { resetSettings } = useSettings();
    
    const [selectingBackgroundFor, setSelectingBackgroundFor] = useState<'menu' | 'game' | null>(null);
    const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
    const [isLoadingGallery, setIsLoadingGallery] = useState(false);
    const backgroundUploadInputRef = useRef<HTMLInputElement>(null);

    const handleOpenBgSelector = (type: 'menu' | 'game') => {
        setSelectingBackgroundFor(type);
        setIsLoadingGallery(true);
        db.getAllImages().then(imgs => {
            setGalleryImages(imgs.reverse());
            setIsLoadingGallery(false);
        }).catch((error) => {
            addToast('Không thể tải thư viện ảnh.', 'error', error);
            setIsLoadingGallery(false);
        });
    };
    
    const handleBackgroundSelect = (imageId: string) => {
        if (!selectingBackgroundFor) return;
    
        if (selectingBackgroundFor === 'menu') {
            BackgroundManager.set('menu_desktop', imageId);
            BackgroundManager.set('menu_mobile', imageId);
            addToast('Đã cập nhật ảnh nền Menu.', 'success');
        } else {
            BackgroundManager.set('game_desktop', imageId);
            BackgroundManager.set('game_mobile', imageId);
            addToast('Đã cập nhật ảnh nền Game.', 'success');
        }
        setSelectingBackgroundFor(null);
    };

    const handleResetSettings = () => {
        resetSettings();
        addToast('Đã khôi phục cài đặt về mặc định.', 'success');
    };
    
    const renderSettingsView = () => (
        // FIX: Moved content inside Modal to provide 'children' prop.
        <Modal
            onClose={onClose}
            header={<h3>Cài Đặt</h3>}
            className="fullscreen-modal-content settings-modal-content"
        >
            <div className="settings-grid">
                <ExperienceSettingsTab />
                <StoryTendenciesTab />
                <WorldDefaultsTab />
                <BackgroundSettingsTab onOpenBgSelector={handleOpenBgSelector} />
                <InterfaceSettingsTab />
                <ImageSettingsTab />
                <AudioSettingsTab />

                <div className="settings-section">
                    <h4>KHÔI PHỤC CÀI ĐẶT</h4>
                    <button
                        className="wc-button button-reset"
                        onClick={handleResetSettings}
                    >
                        Khôi phục về Mặc định
                    </button>
                    <p className="field-hint">
                        Thao tác này sẽ đưa tất cả các tùy chọn về trạng thái ban đầu. Các cài đặt mặc định được tối ưu để sử dụng các tính năng miễn phí.
                    </p>
                </div>
            </div>
        </Modal>
    );

    const renderBackgroundSelectorView = () => {
        const headerContent = (
            <div className="modal-header-content">
                <h3>{`Chọn Ảnh Nền cho ${selectingBackgroundFor === 'menu' ? 'Menu' : 'Game'}`}</h3>
                <div className="gallery-header-actions">
                    <button className="lore-button file-action upload-primary" onClick={() => backgroundUploadInputRef.current?.click()}>
                        + Tải Lên Ảnh Mới
                    </button>
                </div>
            </div>
        );

        return (
             // FIX: Moved content inside Modal to provide 'children' prop.
             <Modal
                onClose={() => setSelectingBackgroundFor(null)}
                header={headerContent}
                className="fullscreen-modal-content gallery-modal-content"
             >
                {isLoadingGallery ? (
                    <div className="gallery-message"><div className="spinner spinner-lg"></div></div>
                ) : galleryImages.length === 0 ? (
                    <div className="gallery-message">Thư viện của bạn trống. Hãy tải lên một ảnh.</div>
                ) : (
                    <div className="gallery-grid bg-selector-grid">
                        {galleryImages.map(image => (
                            <div key={image.id} className="gallery-item" onClick={() => handleBackgroundSelect(image.id)} title={image.description || image.name}>
                                <img src={image.dataUrl} alt={image.name} className="gallery-item-image" />
                                <div className="gallery-item-overlay">
                                    <p className="gallery-item-desc">Chọn ảnh này</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Modal>
        );
    };
    
    return selectingBackgroundFor ? renderBackgroundSelectorView() : renderSettingsView();
};
