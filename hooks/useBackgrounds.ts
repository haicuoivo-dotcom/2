/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
// FIX: Add React import to resolve namespace error.
import { useState, useCallback, useEffect } from 'react';
import { BackgroundManager } from '../services/BackgroundManager';

export const useBackgrounds = () => {
    const [menuBackgroundUrl, setMenuBackgroundUrl] = useState('');
    const [gameBackgroundUrl, setGameBackgroundUrl] = useState('');

    const updateBackgrounds = useCallback(() => {
        BackgroundManager.updateBackgrounds({
            setMenuBg: setMenuBackgroundUrl,
            setGameBg: setGameBackgroundUrl
        });
    }, []); // Empty dependency array is correct here, as setters from useState are stable.

    useEffect(() => {
        updateBackgrounds();
        window.addEventListener('resize', updateBackgrounds);
        window.addEventListener('backgroundChange', updateBackgrounds);
        return () => {
            window.removeEventListener('resize', updateBackgrounds);
            window.removeEventListener('backgroundChange', updateBackgrounds);
        };
    }, [updateBackgrounds]);

    return { menuBackgroundUrl, gameBackgroundUrl };
};
