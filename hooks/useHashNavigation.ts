/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
// FIX: Add React import to resolve namespace error.
import { useState, useEffect, useCallback } from 'react';

export const useHashNavigation = (): [string, (newHash: string) => void] => {
    const [hash, setHash] = useState(window.location.hash.substring(1) || 'menu');

    useEffect(() => {
        const handleHashChange = () => { setHash(window.location.hash.substring(1) || 'menu'); };
        window.addEventListener('hashchange', handleHashChange, false);
        return () => window.removeEventListener('hashchange', handleHashChange, false);
    }, []);

    const navigate = useCallback((newHash: string) => {
        window.location.hash = newHash;
    }, []);
    
    return [hash, navigate];
};
