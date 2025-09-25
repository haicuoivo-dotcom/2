/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { Modal } from '../ui/Modal';
import './ConfirmationModal.css';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: React.ReactNode;
    confirmText?: string;
    cancelText?: string;
}

export const ConfirmationModal = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Xác nhận',
    cancelText = 'Hủy'
}: ConfirmationModalProps) => {
    if (!isOpen) return null;

    const handleConfirm = () => {
        onConfirm();
        onClose();
    }

    const headerContent = <h3>{title}</h3>;

    const footerContent = (
        <>
            <button className="confirmation-button cancel" onClick={onClose}>
                {cancelText}
            </button>
            <button className="confirmation-button confirm-danger" onClick={handleConfirm}>
                {confirmText}
            </button>
        </>
    );

    return (
        // FIX: Moved content inside Modal to provide 'children' prop.
        <Modal
            onClose={onClose}
            header={headerContent}
            footer={footerContent}
            overlayClassName="confirmation-overlay"
            className="confirmation-modal-content"
        >
             <p className="confirmation-message">{message}</p>
        </Modal>
    );
};
