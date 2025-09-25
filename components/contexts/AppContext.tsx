/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
// FIX: Add import for React to resolve namespace errors.
import React, { createContext, useContext } from 'react';
import { useAppManager } from '../../hooks/useAppManager';

type AppContextType = ReturnType<typeof useAppManager>;

// FIX: Correct context type to be nullable to match its initial value.
const AppContext = createContext<AppContextType | null>(null);

export const AppContextProvider = AppContext.Provider;

export const useAppContext = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error("useAppContext must be used within an AppContextProvider");
    }
    return context;
};
