/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect } from 'react';
import type { ToastData } from '../../types';
import './Toast.css';

interface ToastProps extends ToastData {
    onClose: () => void;
}

const Toast = ({ message, type, onClose }: ToastProps) => {
    const [isFadingOut, setIsFadingOut] = useState(false);

    useEffect(() => {
        const showTimer = setTimeout(() => {
            setIsFadingOut(true);
        }, 2000); // 2 seconds

        const removeTimer = setTimeout(() => {
            onClose();
        }, 2000 + 400); // Add animation time

        return () => {
            clearTimeout(showTimer);
            clearTimeout(removeTimer);
        };
    }, [onClose]);

    return (
        <div className={`toast ${type} ${isFadingOut ? 'fade-out' : ''}`}>
            {message}
        </div>
    );
};


interface ToastContainerProps {
    toasts: ToastData[];
    onRemove: (id: string) => void;
}

export const ToastContainer = ({ toasts, onRemove }: ToastContainerProps) => (
    <div className="toast-container">
        {/* FIX: Explicitly pass props instead of spreading to avoid the 'key' prop being type-checked. */}
        {toasts.map((toast) => (
            <Toast key={toast.id} id={toast.id} message={toast.message} type={toast.type} onClose={() => onRemove(toast.id)} />
        ))}
    </div>
);
