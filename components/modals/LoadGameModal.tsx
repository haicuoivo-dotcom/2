/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useRef, useState, useMemo } from 'react';
import { ConfirmationModal } from './ConfirmationModal';
import { Modal } from '../ui/Modal';
import { formatBytes } from '../../utils/game';
import type { SaveFile } from '../../types';
import './LoadGameModal.css';

interface LoadGameModalProps {
    saves: SaveFile[];
    onClose: () => void;
    onLoad: (save: SaveFile) => void;
    onDelete: (saveId: string) => void;
    onUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onDeleteAll: () => void;
}

export const LoadGameModal = ({ saves, onClose, onLoad, onDelete, onUpload, onDeleteAll }: LoadGameModalProps) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showDeleteAllConfirmModal, setShowDeleteAllConfirmModal] = useState(false);
    const [saveToDelete, setSaveToDelete] = useState<{ id: string; name: string } | null>(null);

    const { manualSaves, autoSaves } = useMemo(() => {
        return {
            manualSaves: saves.filter(save => save.type !== 'auto'),
            autoSaves: saves.filter(save => save.type === 'auto'),
        };
    }, [saves]);

    const handleDeleteClick = (saveId: string, saveName: string) => {
        setSaveToDelete({ id: saveId, name: saveName });
        setShowConfirmModal(true);
    };

    const confirmDelete = () => {
        if (saveToDelete) {
            onDelete(saveToDelete.id);
        }
        setShowConfirmModal(false);
        setSaveToDelete(null);
    };

    const confirmDeleteAll = () => {
        onDeleteAll();
        setShowDeleteAllConfirmModal(false);
    };
    
    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const renderSaveCard = (save: SaveFile) => (
        <div key={save.id} className={`save-card ${save.type === 'auto' ? 'save-card-auto' : 'save-card-manual'}`}>
            <div className="save-card-details">
                <h5 className="save-card-name">{save.name}</h5>
                <div className="save-card-meta">
                    <span>Lần cuối lưu: {new Date(save.timestamp).toLocaleString('vi-VN')}</span>
                    <span>Dung lượng: {formatBytes(JSON.stringify(save).length)}</span>
                </div>
            </div>
            <div className="save-card-actions">
                <button className={`btn-load ${save.type === 'auto' ? 'other' : 'manual'}`} onClick={() => onLoad(save)}>Tải Game</button>
                <button className="btn-delete" onClick={() => handleDeleteClick(save.id, save.name)}>Xóa Lưu</button>
            </div>
        </div>
    );

    const headerContent = (
        <div className="modal-header-content">
            <h3 className="load-game-title">Tệp Lưu</h3>
            <div className="load-game-header-actions">
                <button onClick={handleUploadClick} className="load-game-upload-button">
                    Tải Lên Tệp
                </button>
                <button onClick={() => setShowDeleteAllConfirmModal(true)} className="load-game-delete-all-button" disabled={saves.length === 0}>
                    Xóa Toàn Bộ
                </button>
            </div>
        </div>
    );


    return (
        <>
            {/* FIX: Moved content inside Modal to provide 'children' prop. */}
            <Modal onClose={onClose} header={headerContent} className="load-game-modal">
                <>
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={onUpload} 
                        style={{ display: 'none' }} 
                        accept=".json" 
                        multiple 
                    />
                    {(manualSaves.length === 0 && autoSaves.length === 0) ? (
                        <p className="no-saves-message">
                            Không tìm thấy tệp lưu nào.
                        </p>
                    ) : (
                        <div className="saves-container">
                            {manualSaves.length > 0 && (
                                <section className="saves-section">
                                    <h4 className="saves-section-title">Lưu Thủ Công</h4>
                                    {manualSaves.map(save => renderSaveCard(save))}
                                </section>
                            )}
                            {autoSaves.length > 0 && (
                                <section className="saves-section">
                                    <h4 className="saves-section-title">Lưu Tự Động (5 lượt gần nhất)</h4>
                                    {autoSaves.map(save => renderSaveCard(save))}
                                </section>
                            )}
                        </div>
                    )}
                </>
            </Modal>
            
            {showConfirmModal && saveToDelete && (
                <ConfirmationModal
                    isOpen={showConfirmModal}
                    onClose={() => setShowConfirmModal(false)}
                    onConfirm={confirmDelete}
                    title="Xác Nhận Xóa"
                    message={<span>Bạn có chắc chắn muốn xóa tệp lưu <strong>"{saveToDelete.name}"</strong> không? Hành động này không thể hoàn tác.</span>}
                    confirmText="Xóa"
                />
            )}
            {showDeleteAllConfirmModal && (
                <ConfirmationModal
                    isOpen={showDeleteAllConfirmModal}
                    onClose={() => setShowDeleteAllConfirmModal(false)}
                    onConfirm={confirmDeleteAll}
                    title="Xác Nhận Xóa Toàn Bộ"
                    message={<span>Bạn có chắc chắn muốn xóa <strong>TOÀN BỘ {saves.length} tệp lưu</strong> không? Hành động này không thể hoàn tác và sẽ xóa tất cả tiến trình của bạn.</span>}
                    confirmText="Xóa Toàn Bộ"
                />
            )}
        </>
    );
};
