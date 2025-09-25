/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
// FIX: Add React import to resolve namespace error.
import { useState, useEffect, useRef, useCallback } from 'react';

const STORAGE_KEY = 'draggable_ai_button_position';

export const useDraggable = (buttonRef: React.RefObject<HTMLButtonElement>) => {
    const [position, setPosition] = useState({ x: 20, y: 80 });
    const [isDragging, setIsDragging] = useState(false);
    const dragStartInfo = useRef<{ x: number, y: number, offsetX: number, offsetY: number } | null>(null);
    const hasDragged = useRef(false);

    useEffect(() => {
        try {
            const savedPosition = localStorage.getItem(STORAGE_KEY);
            if (savedPosition) {
                setPosition(JSON.parse(savedPosition));
            }
        } catch (e) {
            console.warn("Could not load draggable button position.", e);
        }
    }, []);

    useEffect(() => {
        if (!isDragging) {
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(position));
            } catch (e) {
                console.warn("Could not save draggable button position.", e);
            }
        }
    }, [isDragging, position]);
    
    const handleDragMove = useCallback((clientX: number, clientY: number) => {
        if (!dragStartInfo.current || !buttonRef.current) return;
        
        const dx = Math.abs(clientX - dragStartInfo.current.x);
        const dy = Math.abs(clientY - dragStartInfo.current.y);
        if (!hasDragged.current && (dx > 5 || dy > 5)) {
            hasDragged.current = true;
        }
        
        let newX = clientX - dragStartInfo.current.offsetX;
        let newY = clientY - dragStartInfo.current.offsetY;

        const { innerWidth, innerHeight } = window;
        const buttonSize = buttonRef.current.offsetWidth;
        const margin = 8;
        newX = Math.max(margin, Math.min(newX, innerWidth - buttonSize - margin));
        newY = Math.max(margin, Math.min(newY, innerHeight - buttonSize - margin));
        
        setPosition({ x: newX, y: newY });
    }, [buttonRef]);

    const onMouseMove = (e: MouseEvent) => handleDragMove(e.clientX, e.clientY);
    const onTouchMove = (e: TouchEvent) => e.touches[0] && handleDragMove(e.touches[0].clientX, e.touches[0].clientY);

    const handleDragEnd = useCallback(() => {
        setIsDragging(false);
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', handleDragEnd);
        window.removeEventListener('touchmove', onTouchMove);
        window.removeEventListener('touchend', handleDragEnd);
        dragStartInfo.current = null;
        // Use a short timeout to reset hasDragged after the click event has fired
        setTimeout(() => { hasDragged.current = false; }, 0);
    }, [onMouseMove, onTouchMove]);
    
    const handleDragStart = useCallback((clientX: number, clientY: number) => {
        if (!buttonRef.current) return;
        
        hasDragged.current = false;
        setIsDragging(true);
        const rect = buttonRef.current.getBoundingClientRect();
        dragStartInfo.current = { 
            x: clientX, 
            y: clientY,
            offsetX: clientX - rect.left,
            offsetY: clientY - rect.top,
        };

        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', handleDragEnd);
        window.addEventListener('touchmove', onTouchMove, { passive: false });
        window.addEventListener('touchend', handleDragEnd);

    }, [handleDragEnd, onMouseMove, onTouchMove, buttonRef]);

    const getMenuPositionClass = useCallback(() => {
        if (!buttonRef.current) return 'bottom-right';
        const { innerWidth, innerHeight } = window;
        const buttonRect = buttonRef.current.getBoundingClientRect();
        
        const isRight = buttonRect.left + buttonRect.width / 2 > innerWidth / 2;
        const isBottom = buttonRect.top + buttonRect.height / 2 > innerHeight / 2;

        if (isBottom && isRight) return 'top-left';
        if (isBottom && !isRight) return 'top-right';
        if (!isBottom && isRight) return 'bottom-left';
        return 'bottom-right';
    }, [buttonRef]);

    return {
        position,
        isDragging,
        hasDragged,
        handleDragStart,
        getMenuPositionClass,
    };
};
