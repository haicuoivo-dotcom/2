/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useEffect } from 'react';
import './StatusEffectIndicator.css';

interface StatusEffectIndicatorProps {
    name: string;
    type: 'buff' | 'debuff' | 'neutral';
    onComplete: () => void;
}

export const StatusEffectIndicator = ({ name, type, onComplete }: StatusEffectIndicatorProps) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onComplete();
        }, 1500); // Should match animation duration

        return () => clearTimeout(timer);
    }, [onComplete]);

    return (
        <div className={`status-effect-indicator ${type}`}>
            {name}
        </div>
    );
};