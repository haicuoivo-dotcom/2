/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
// FIX: Add React import to resolve namespace errors.
import { useState, useEffect, useRef, useCallback } from 'react';
import { ApiKeyManager } from '../services/ApiKeyManager';
import { OpenRouterManager } from '../services/OpenRouterManager';
import { generateUniqueId } from '../utils/id';

export interface ApiKeyConfig {
  id: string;
  key: string;
  isVisible: boolean;
  status: 'unchecked' | 'valid' | 'invalid' | 'quota_exceeded' | 'checking';
}

interface UseApiKeyManagerProps {
    onClose: () => void;
    onKeysUpdated: () => void;
}

export const useApiKeyManager = ({ onClose, onKeysUpdated }: UseApiKeyManagerProps) => {
    const [activeTab, setActiveTab] = useState('gemini');
    const [geminiKeys, setGeminiKeys] = useState<ApiKeyConfig[]>([]);
    const [openRouterKeys, setOpenRouterKeys] = useState<ApiKeyConfig[]>([]);
    const [isChecking, setIsChecking] = useState(false);

    const [systemApiKeyStatus, setSystemApiKeyStatus] = useState<'unchecked' | 'valid' | 'invalid' | 'quota_exceeded' | 'checking'>('unchecked');
    const [isCheckingSystemKey, setIsCheckingSystemKey] = useState(false);
    const isMounted = useRef(true);

    useEffect(() => {
        isMounted.current = true;
        return () => { isMounted.current = false; };
    }, []);

    // FIX: Listen for system key auth failure events dispatched from the ApiKeyManager.
    useEffect(() => {
        const handleSystemKeyFailure = () => {
            if (isMounted.current) {
                setSystemApiKeyStatus('invalid');
            }
        };

        window.addEventListener('systemKeyAuthFailure', handleSystemKeyFailure);

        return () => {
            window.removeEventListener('systemKeyAuthFailure', handleSystemKeyFailure);
        };
    }, [setSystemApiKeyStatus]); // Add dependency for state setter

    useEffect(() => {
        const loadedGeminiKeys = ApiKeyManager.getKeys().map(key => ({ id: generateUniqueId('gemini-key'), key, isVisible: false, status: 'unchecked' as const }));
        const loadedOpenRouterKeys = OpenRouterManager.getKeys().map(key => ({ id: generateUniqueId('or-key'), key, isVisible: false, status: 'unchecked' as const }));
        setGeminiKeys(loadedGeminiKeys.length > 0 ? loadedGeminiKeys : [{ id: generateUniqueId('gemini-key'), key: '', isVisible: true, status: 'unchecked' }]);
        setOpenRouterKeys(loadedOpenRouterKeys.length > 0 ? loadedOpenRouterKeys : [{ id: generateUniqueId('or-key'), key: '', isVisible: true, status: 'unchecked' }]);
    }, []);

    const statusMessages = {
        unchecked: 'Chưa kiểm tra',
        checking: 'Đang kiểm tra...',
        valid: 'Hợp lệ & Sẵn sàng',
        invalid: 'Không hợp lệ hoặc chưa cấu hình',
        quota_exceeded: 'Hết hạn mức',
    };

    const checkSystemKey = useCallback(async () => {
        if (!isMounted.current) return;
        setIsCheckingSystemKey(true);
        setSystemApiKeyStatus('checking');

        try {
            const systemKey = typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_KEY ? import.meta.env.VITE_API_KEY : null;

            if (!systemKey) {
                if (isMounted.current) setSystemApiKeyStatus('invalid');
                return;
            }

            const results = await ApiKeyManager.validateKeys([systemKey]);
            if (isMounted.current) {
                if (results.length > 0 && results[0].status) {
                    setSystemApiKeyStatus(results[0].status);
                } else {
                    setSystemApiKeyStatus('invalid');
                }
            }
        } catch (e) {
            console.error("System API key validation failed:", e);
            if (isMounted.current) setSystemApiKeyStatus('invalid');
        } finally {
            if (isMounted.current) setIsCheckingSystemKey(false);
        }
    }, []);

    useEffect(() => {
        checkSystemKey();
    }, [checkSystemKey]);

    const handleKeyChange = (index: number, value: string, provider: 'gemini' | 'openrouter') => {
        const updater = provider === 'gemini' ? setGeminiKeys : setOpenRouterKeys;
        updater(prev => prev.map((item, i) => i === index ? { ...item, key: value, status: 'unchecked' } : item));
    };
    
    const handlePaste = (e: React.ClipboardEvent, index: number, provider: 'gemini' | 'openrouter') => {
        const pastedText = e.clipboardData.getData('text');
        const keys = pastedText.split(/[\s,;\n]+/).map(k => k.trim()).filter(Boolean);
        if (keys.length <= 1) return;

        e.preventDefault();
        const updater = provider === 'gemini' ? setGeminiKeys : setOpenRouterKeys;
        updater(prev => {
            const newKeys = keys.map(key => ({ id: generateUniqueId('pasted-key'), key, isVisible: true, status: 'unchecked' as const }));
            const updated = [...prev];
            updated.splice(index, 1, ...newKeys);
            return updated;
        });
    };

    const handleAddKey = (provider: 'gemini' | 'openrouter') => {
        const updater = provider === 'gemini' ? setGeminiKeys : setOpenRouterKeys;
        updater(prev => [...prev, { id: generateUniqueId('key'), key: '', isVisible: true, status: 'unchecked' }]);
    };

    const handleDeleteKey = (id: string, provider: 'gemini' | 'openrouter') => {
        const updater = provider === 'gemini' ? setGeminiKeys : setOpenRouterKeys;
        updater(prev => {
            const filtered = prev.filter(item => item.id !== id);
            return filtered.length > 0 ? filtered : [{ id: generateUniqueId('key'), key: '', isVisible: true, status: 'unchecked' }];
        });
    };
    
    const handleToggleVisibility = (id: string, provider: 'gemini' | 'openrouter') => {
        const updater = provider === 'gemini' ? setGeminiKeys : setOpenRouterKeys;
        updater(prev => prev.map(item => item.id === id ? { ...item, isVisible: !item.isVisible } : item));
    };

    const handleCheckKeys = async (provider: 'gemini' | 'openrouter') => {
        setIsChecking(true);
        const [keys, updater, manager] = provider === 'gemini'
            ? [geminiKeys, setGeminiKeys, ApiKeyManager]
            : [openRouterKeys, setOpenRouterKeys, OpenRouterManager];

        updater(prev => prev.map(k => k.key.trim() ? { ...k, status: 'checking' } : k));
        
        const results = await manager.validateKeys(keys.map(k => k.key).filter(Boolean));

        updater(prev => prev.map(k => {
            const result = results.find(r => r.key === k.key);
            return result ? { ...k, status: result.status } : k;
        }));
        setIsChecking(false);
    };

    const handleSave = () => {
        const geminiKeyStrings = geminiKeys.map(k => k.key.trim()).filter(Boolean);
        const openRouterKeyStrings = openRouterKeys.map(k => k.key.trim()).filter(Boolean);

        ApiKeyManager.saveKeys(geminiKeyStrings);
        OpenRouterManager.saveKeys(openRouterKeyStrings);
        
        onKeysUpdated();
        onClose();
    };

    return {
        activeTab,
        setActiveTab,
        geminiKeys,
        openRouterKeys,
        isChecking,
        systemApiKeyStatus,
        isCheckingSystemKey,
        statusMessages,
        checkSystemKey,
        handleKeyChange,
        handlePaste,
        handleAddKey,
        handleDeleteKey,
        handleToggleVisibility,
        handleCheckKeys,
        handleSave,
    };
};
