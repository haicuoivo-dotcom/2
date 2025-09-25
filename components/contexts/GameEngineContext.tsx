/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
// FIX: Add import for React to resolve namespace errors.
import React, { createContext, useContext } from 'react';
import { useGameEngine } from '../../hooks/useGameEngine';

type GameEngineContextType = ReturnType<typeof useGameEngine>;

// FIX: Correct context type to be nullable to match its initial value.
const GameEngineContext = createContext<GameEngineContextType | null>(null);

export const GameEngineProvider = GameEngineContext.Provider;

export const useGameEngineContext = () => {
    const context = useContext(GameEngineContext);
    if (!context) {
        throw new Error("useGameEngineContext must be used within a GameEngineProvider");
    }
    return context;
};
