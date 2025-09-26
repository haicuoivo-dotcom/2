// Định nghĩa các type cho game engine và handlers
export interface GameEngineHandlers {
    handleEmergencyTokenReductionAndRetry: () => Promise<void>;
    retryLastAction: () => Promise<void>;
    setError: (error: Error | null) => void;
}

export interface GameUIHandlers {
    addToast: (message: string, type: 'info' | 'success' | 'error' | 'warning', details?: any) => void;
    setIsProcessing: (value: boolean) => void;
}

export interface GameEngine {
    setError: (error: Error | null) => void;
    // Thêm các properties khác nếu cần
}