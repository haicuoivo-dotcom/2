/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { createContext, useState, useContext, useCallback } from 'react';
import { ToastContainer as ToastContainerComponent } from '../ui/Toast';
import { generateUniqueId } from '../../utils/id';
import { useLogs } from './LogContext';
import type { ToastData } from '../../types';

interface ToastContextType {
    addToast: (message: string, type?: ToastData['type'], details?: any) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
    const [toasts, setToasts] = useState<ToastData[]>([]);
    const { addLog } = useLogs();

    const addToast = useCallback((message: string, type: ToastData['type'] = 'info', details?: any) => {
        const id = generateUniqueId('toast');
        setToasts(prev => [...prev, { id, message, type }].slice(-5));
        addLog(message, type, details);
    }, [addLog]);

    const removeToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ addToast }}>
            {children}
            <ToastContainerComponent toasts={toasts} onRemove={removeToast} />
        </ToastContext.Provider>
    );
};

export const useToasts = () => {
    const context = useContext(ToastContext);
    if (context === undefined) {
        throw new Error('useToasts must be used within a ToastProvider');
    }
    return context;
};