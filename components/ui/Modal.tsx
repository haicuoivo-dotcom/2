/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';

interface ModalProps {
    onClose: () => void;
    header: React.ReactNode;
    children: React.ReactNode;
    footer?: React.ReactNode;
    className?: string;
    overlayClassName?: string;
}

export const Modal = ({ onClose, header, children, footer, className = '', overlayClassName = '' }: ModalProps) => {
    return (
        <div className={`modal-overlay ${overlayClassName}`} onClick={onClose}>
            <div className={`modal-content ${className}`} onClick={e => e.stopPropagation()}>
                <header className="modal-header">
                    {header}
                    <button onClick={onClose} className="modal-close-button" aria-label="Đóng">×</button>
                </header>
                <div className="modal-body">
                    {children}
                </div>
                {footer && (
                    <footer className="modal-footer">
                        {footer}
                    </footer>
                )}
            </div>
        </div>
    );
};
