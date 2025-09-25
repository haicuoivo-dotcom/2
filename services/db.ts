/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import type { SaveFile, GalleryImage } from '../types';

const DB_NAME = 'GameAI_DB';
const DB_VERSION = 2; 
const SAVE_STORE_NAME = 'saves';
const GALLERY_STORE_NAME = 'gallery_images';

let db: IDBDatabase;

const openDB = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
        if (db) {
            resolve(db);
            return;
        }

        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => {
            console.error('Error opening IndexedDB:', request.error);
            reject('Error opening IndexedDB');
        };

        request.onsuccess = () => {
            db = request.result;
            resolve(db);
        };

        request.onupgradeneeded = (event) => {
            const tempDb = (event.target as IDBOpenDBRequest).result;
            if (!tempDb.objectStoreNames.contains(SAVE_STORE_NAME)) {
                const saveStore = tempDb.createObjectStore(SAVE_STORE_NAME, { keyPath: 'id' });
                saveStore.createIndex('timestamp', 'timestamp', { unique: false });
            }
            if (!tempDb.objectStoreNames.contains(GALLERY_STORE_NAME)) {
                const galleryStore = tempDb.createObjectStore(GALLERY_STORE_NAME, { keyPath: 'id' });
                galleryStore.createIndex('name', 'name', { unique: false });
            }
        };
    });
};

export const addOrUpdateSave = async (saveFile: SaveFile): Promise<void> => {
    const db = await openDB();
    if (!saveFile.type) {
        saveFile.type = 'manual';
    }
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([SAVE_STORE_NAME], 'readwrite');
        const store = transaction.objectStore(SAVE_STORE_NAME);
        const request = store.put(saveFile);

        request.onsuccess = () => resolve();
        request.onerror = () => {
            console.error('Error adding/updating save:', request.error);
            reject('Error adding/updating save');
        };
    });
};

export const getAllSaves = async (): Promise<SaveFile[]> => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([SAVE_STORE_NAME], 'readonly');
        const store = transaction.objectStore(SAVE_STORE_NAME);
        const request = store.getAll();

        request.onsuccess = () => {
            const sortedSaves = request.result.sort((a, b) => 
                new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
            );
            resolve(sortedSaves);
        };
        request.onerror = () => {
            console.error('Error getting all saves:', request.error);
            reject('Error getting all saves');
        };
    });
};

export const deleteSave = async (saveId: string): Promise<void> => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([SAVE_STORE_NAME], 'readwrite');
        const store = transaction.objectStore(SAVE_STORE_NAME);
        const request = store.delete(saveId);

        request.onsuccess = () => resolve();
        request.onerror = () => {
            console.error('Error deleting save:', request.error);
            reject('Error deleting save');
        };
    });
};

export const deleteAllSaves = async (): Promise<void> => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([SAVE_STORE_NAME], 'readwrite');
        const store = transaction.objectStore(SAVE_STORE_NAME);
        const request = store.clear();

        request.onsuccess = () => resolve();
        request.onerror = () => {
            console.error('Error deleting all saves:', request.error);
            reject('Error deleting all saves');
        };
    });
};

// --- Gallery Functions ---

export const addOrUpdateImage = async (image: GalleryImage): Promise<void> => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([GALLERY_STORE_NAME], 'readwrite');
        const store = transaction.objectStore(GALLERY_STORE_NAME);
        const request = store.put(image);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(`Error adding/updating image: ${request.error}`);
    });
};

export const getAllImages = async (): Promise<GalleryImage[]> => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([GALLERY_STORE_NAME], 'readonly');
        const store = transaction.objectStore(GALLERY_STORE_NAME);
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(`Error getting all images: ${request.error}`);
    });
};

export const getImageById = async (id: string): Promise<GalleryImage | undefined> => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([GALLERY_STORE_NAME], 'readonly');
        const store = transaction.objectStore(GALLERY_STORE_NAME);
        const request = store.get(id);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(`Error getting image by id: ${request.error}`);
    });
};

export const deleteImage = async (id: string): Promise<void> => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([GALLERY_STORE_NAME], 'readwrite');
        const store = transaction.objectStore(GALLERY_STORE_NAME);
        const request = store.delete(id);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(`Error deleting image: ${request.error}`);
    });
};

export const updateImage = async (image: GalleryImage): Promise<void> => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([GALLERY_STORE_NAME], 'readwrite');
        const store = transaction.objectStore(GALLERY_STORE_NAME);
        const request = store.put(image);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(`Error updating image: ${request.error}`);
    });
};