/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { useEffect } from 'react';
import { useSettings } from '../components/contexts/SettingsContext';

type OrientationLockType = 'any' | 'natural' | 'landscape' | 'portrait' | 'portrait-primary' | 'portrait-secondary' | 'landscape-primary' | 'landscape-secondary';

export const useScreenOrientation = (orientation: OrientationLockType) => {
    const { settings } = useSettings();

    useEffect(() => {
        if (settings.mobileMode !== 'on') {
            return;
        }

        let isLocked = false;

        const lockOrientation = async () => {
            if (!('orientation' in screen) || typeof (screen.orientation as any).lock !== 'function') {
                console.warn('Screen Orientation API not supported or lock function is unavailable.');
                return;
            }
            try {
                await (screen.orientation as any).lock(orientation);
                isLocked = true;
            } catch (error) {
                console.warn(`Failed to lock screen orientation to ${orientation}:`, error);
            }
        };

        const unlockOrientation = () => {
             if (isLocked && 'orientation' in screen && typeof (screen.orientation as any).unlock === 'function') {
                (screen.orientation as any).unlock();
            }
        };

        lockOrientation();

        return () => {
            unlockOrientation();
        };
    }, [orientation, settings.mobileMode]);
};
