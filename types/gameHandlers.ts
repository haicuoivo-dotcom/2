// Định nghĩa các types cho game engine handlers
export type AsyncGameHandler = () => Promise<void>;
export type GameErrorHandler = (error: Error | null) => void;

export interface GameHandlers {
    handleEmergencyTokenReductionAndRetry: AsyncGameHandler;
    retryLastAction: AsyncGameHandler;
    setError: GameErrorHandler;
}