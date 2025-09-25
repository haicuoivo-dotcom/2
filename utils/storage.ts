/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

interface StorageResult<T> {
    success: boolean;
    data: T | null;
    error?: Error;
}

const createSafeStorage = (storage: Storage): {
    getItem: (key: string) => StorageResult<string>;
    setItem: (key: string, value: string) => StorageResult<void>;
    removeItem: (key: string) => StorageResult<void>;
} => {
    const isStorageAvailable = (): boolean => {
        try {
            const testKey = '__storage_test__';
            storage.setItem(testKey, testKey);
            storage.removeItem(testKey);
            return true;
        } catch (e) {
            return false;
        }
    };

    return {
        getItem: (key: string): StorageResult<string> => {
            if (!isStorageAvailable()) {
                const error = new Error("Storage is not available in this browser environment (e.g., private mode).");
                console.warn(error);
                return { success: false, data: null, error };
            }
            try {
                const data = storage.getItem(key);
                return { success: true, data };
            } catch (error) {
                console.error(`Error getting item "${key}" from storage:`, error);
                return { success: false, data: null, error: error as Error };
            }
        },

        setItem: (key: string, value: string): StorageResult<void> => {
            if (!isStorageAvailable()) {
                const error = new Error("Storage is not available in this browser environment (e.g., private mode).");
                console.warn(error);
                return { success: false, data: null, error };
            }
            try {
                storage.setItem(key, value);
                return { success: true, data: null };
            } catch (error) {
                console.error(`Error setting item "${key}" in storage:`, error);
                return { success: false, data: null, error: error as Error };
            }
        },

        removeItem: (key: string): StorageResult<void> => {
            if (!isStorageAvailable()) {
                const error = new Error("Storage is not available in this browser environment (e.g., private mode).");
                console.warn(error);
                return { success: false, data: null, error };
            }
            try {
                storage.removeItem(key);
                return { success: true, data: null };
            } catch (error) {
                console.error(`Error removing item "${key}" from storage:`, error);
                return { success: false, data: null, error: error as Error };
            }
        },
    };
};

export const safeLocalStorage = createSafeStorage(window.localStorage);
