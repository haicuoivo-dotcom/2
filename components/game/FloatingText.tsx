/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useEffect, useRef } from 'react';
import './FloatingText.css';

interface FloatingTextProps {
    text: string;
    type: 'damage' | 'heal' | 'crit' | 'miss';
    onComplete: () => void;
}

export const FloatingText = ({ text, type, onComplete }: FloatingTextProps) => {
    const elementRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const onAnimationEnd = () => {
            onComplete();
        };

        const element = elementRef.current;
        element?.addEventListener('animationend', onAnimationEnd);

        return () => {
            element?.removeEventListener('animationend', onAnimationEnd);
        };
    }, [onComplete]);

    return (
        <div ref={elementRef} className={`floating-text ${type}`}>
            {text}
        </div>
    );
};