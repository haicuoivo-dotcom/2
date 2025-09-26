import { useState, useCallback, useEffect } from 'react';
import { batchStateUpdates } from '../utils/stateUtils';
// Types được định nghĩa inline để tránh circular dependencies

interface UseTokenLimitHandlerProps {
    gameEngine: {
        setError: (error: string | Error | null) => void;
    };
    handleEmergencyTokenReductionAndRetry: () => Promise<void>;
    addToast: (message: string, type: 'info' | 'success' | 'error' | 'warning') => void;
}

export const useTokenLimitHandler = ({
    gameEngine,
    handleEmergencyTokenReductionAndRetry,
    addToast
}: UseTokenLimitHandlerProps) => {
    const [isProcessing, setIsProcessing] = useState(false);

    const handleTokenLimitRetry = useCallback(async () => {
        try {
            setIsProcessing(true);
            await handleEmergencyTokenReductionAndRetry();
        } catch (error) {
            addToast('Lỗi khi thử lại: ' + (error instanceof Error ? error.message : 'Lỗi không xác định'), 'error');
        } finally {
            setIsProcessing(false);
        }
    }, [handleEmergencyTokenReductionAndRetry, addToast]);

    const handleTokenLimitClose = useCallback(() => {
        batchStateUpdates(() => {
            gameEngine.setError(null);
            setIsProcessing(false);
        });
    }, [gameEngine]);

    useEffect(() => {
        return () => {
            // Cleanup nếu component unmount trong khi đang xử lý
            if (isProcessing) {
                setIsProcessing(false);
            }
        };
    }, [isProcessing]);

    return {
        isProcessing,
        handleTokenLimitRetry,
        handleTokenLimitClose
    };
};