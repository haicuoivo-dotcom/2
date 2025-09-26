import { unstable_batchedUpdates } from 'react-dom';

export const batchStateUpdates = (callback: () => void) => {
    unstable_batchedUpdates(callback);
};

export const createAsyncStateHandler = (
    handler: () => Promise<void>,
    onError?: (error: Error) => void
) => {
    let isMounted = true;

    const wrappedHandler = async () => {
        try {
            await handler();
            if (!isMounted) return;
        } catch (error) {
            if (!isMounted) return;
            if (onError && error instanceof Error) {
                onError(error);
            }
        }
    };

    const cleanup = () => {
        isMounted = false;
    };

    return { wrappedHandler, cleanup };
};