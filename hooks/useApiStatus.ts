/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
// FIX: Add React import to resolve namespace error.
import { useState, useCallback, useMemo, useEffect } from 'react';
import { ApiKeyManager } from '../services/ApiKeyManager';
import { OpenRouterManager } from '../services/OpenRouterManager';

export const useApiStatus = () => {
    const getApiStatusText = useCallback(() => {
        const systemKey = typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_KEY ? import.meta.env.VITE_API_KEY : null;
        const geminiKeys = ApiKeyManager.getKeys();
        const openRouterKeys = OpenRouterManager.getKeys();
        const statuses = [];
        if (systemKey) { statuses.push('API Hệ Thống: Đã kích hoạt'); }
        if (geminiKeys.length > 0) { statuses.push(`Google Gemini (cá nhân): ${geminiKeys.length} khóa`); }
        if (openRouterKeys.length > 0) { statuses.push(`OpenRouter: ${openRouterKeys.length} khóa`); }
        if (statuses.length === 0) { return 'API chưa được cấu hình. Vui lòng thiết lập.'; }
        return statuses.join(' | ');
    }, []);

    const [apiStatus, setApiStatus] = useState('Đang kiểm tra trạng thái API...');

    const handleApiKeyUpdate = useCallback(() => {
        ApiKeyManager.loadKeys();
        OpenRouterManager.loadKeys();
        setApiStatus(getApiStatusText());
    }, [getApiStatusText]);
    
    useEffect(() => {
        handleApiKeyUpdate();
    }, [handleApiKeyUpdate]);

    const hasApiKey = useMemo(() => ApiKeyManager.hasAnyValidKey(), [apiStatus]);

    return { apiStatus, hasApiKey, handleApiKeyUpdate };
};
