/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { createContext, useState, useContext, useCallback, ReactNode } from 'react';
import { generateUniqueId } from '../../utils/id';

export interface LogEntry {
    id: string;
    timestamp: Date;
    message: string;
    type: 'info' | 'success' | 'error' | 'warning';
    details?: any;
}

interface LogContextType {
    logs: LogEntry[];
    addLog: (message: string, type: LogEntry['type'], details?: any) => void;
    clearLogs: () => void;
}

const LogContext = createContext<LogContextType | undefined>(undefined);

export const LogProvider = ({ children }: { children: ReactNode }) => {
    const [logs, setLogs] = useState<LogEntry[]>([]);

    const addLog = useCallback((message: string, type: LogEntry['type'] = 'info', details?: any) => {
        const newLog: LogEntry = {
            id: generateUniqueId('log'),
            timestamp: new Date(),
            message,
            type,
            details,
        };
        // Add to the beginning of the array and keep the last 100 entries
        setLogs(prev => [newLog, ...prev].slice(0, 100));
    }, []);

    const clearLogs = useCallback(() => {
        setLogs([]);
    }, []);

    return (
        <LogContext.Provider value={{ logs, addLog, clearLogs }}>
            {children}
        </LogContext.Provider>
    );
};

export const useLogs = () => {
    const context = useContext(LogContext);
    if (context === undefined) {
        throw new Error('useLogs must be used within a LogProvider');
    }
    return context;
};
