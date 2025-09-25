/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { useState, useRef, useCallback, useEffect } from 'react';

// --- Helper Functions ---

type TouchLike = { clientX: number; clientY: number };

const getDistance = (touches: Array<TouchLike>) => {
    return Math.sqrt(
        Math.pow(touches[0].clientX - touches[1].clientX, 2) +
        Math.pow(touches[0].clientY - touches[1].clientY, 2)
    );
};

const getMidpoint = (touches: Array<TouchLike>) => {
    return {
        x: (touches[0].clientX + touches[1].clientX) / 2,
        y: (touches[0].clientY + touches[1].clientY) / 2,
    };
};

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

// --- Hook ---
export const usePinchZoomPan = (containerRef: React.RefObject<HTMLDivElement>, dependencyToReset: any) => {
    const [transform, setTransform] = useState({ scale: 1, offsetX: 0, offsetY: 0 });
    
    const initialGestureState = useRef<any>(null); // Store all initial state for a gesture

    const handleTouchStart = useCallback((e: React.TouchEvent) => {
        if (e.touches.length > 2) return; // Ignore more than 2 fingers

        initialGestureState.current = {
            // Chỉ lấy thuộc tính chung để tránh lỗi kiểu giữa React.Touch và Touch
            initialTouches: Array.from(e.touches).map((t) => ({ clientX: t.clientX, clientY: t.clientY })),
            initialTransform: { ...transform },
            initialPinchDistance: e.touches.length === 2 ? getDistance(Array.from(e.touches).map((t) => ({ clientX: t.clientX, clientY: t.clientY }))) : 0,
        };
    }, [transform]);

    const handleTouchMove = useCallback((e: React.TouchEvent) => {
        if (!initialGestureState.current) return;

        const container = containerRef.current;
        if (!container) return;

        const { initialTouches, initialTransform, initialPinchDistance } = initialGestureState.current;

    if (initialTouches.length === 1 && e.touches.length === 1) {
            // --- Panning ---
            if (transform.scale <= 1) return;
            e.preventDefault();

            const dx = e.touches[0].clientX - initialTouches[0].clientX;
            const dy = e.touches[0].clientY - initialTouches[0].clientY;

            let newOffsetX = initialTransform.offsetX + dx;
            let newOffsetY = initialTransform.offsetY + dy;

            // Clamp offsets
            const maxOffsetX = 0;
            const minOffsetX = container.clientWidth * (1 - transform.scale);
            const maxOffsetY = 0;
            const minOffsetY = container.clientHeight * (1 - transform.scale);

            newOffsetX = clamp(newOffsetX, minOffsetX, maxOffsetX);
            newOffsetY = clamp(newOffsetY, minOffsetY, maxOffsetY);
            
            setTransform(prev => ({ ...prev, offsetX: newOffsetX, offsetY: newOffsetY }));

    } else if (initialTouches.length === 2 && e.touches.length === 2) {
            // --- Pinching ---
            e.preventDefault();
            const touchesArr = Array.from(e.touches).map((t) => ({ clientX: t.clientX, clientY: t.clientY }));
            const currentPinchDistance = getDistance(touchesArr);
            const scaleMultiplier = currentPinchDistance / initialPinchDistance;
            const newScale = clamp(initialTransform.scale * scaleMultiplier, 1, 4);

            const midpoint = getMidpoint(touchesArr);
            const rect = container.getBoundingClientRect();
            const relativeMidpoint = { x: midpoint.x - rect.left, y: midpoint.y - rect.top };

            // Zoom towards the midpoint
            let newOffsetX = relativeMidpoint.x - ((relativeMidpoint.x - initialTransform.offsetX) / initialTransform.scale) * newScale;
            let newOffsetY = relativeMidpoint.y - ((relativeMidpoint.y - initialTransform.offsetY) / initialTransform.scale) * newScale;

            // Clamp offsets after zooming
            const maxOffsetX = 0;
            const minOffsetX = container.clientWidth * (1 - newScale);
            const maxOffsetY = 0;
            const minOffsetY = container.clientHeight * (1 - newScale);
            
            newOffsetX = clamp(newOffsetX, minOffsetX, maxOffsetX);
            newOffsetY = clamp(newOffsetY, minOffsetY, maxOffsetY);

            setTransform({ scale: newScale, offsetX: newOffsetX, offsetY: newOffsetY });
        }
    }, [containerRef, transform.scale]);

    const handleTouchEnd = useCallback((e: React.TouchEvent) => {
        if (e.touches.length === 0) {
            initialGestureState.current = null;
        } else {
            // If gesture changes (e.g., from 2 fingers to 1), restart the gesture tracking
            handleTouchStart(e);
        }
    }, [handleTouchStart]);

    useEffect(() => {
        setTransform({ scale: 1, offsetX: 0, offsetY: 0 });
    }, [dependencyToReset]);

    return {
        scale: transform.scale,
        offsetX: transform.offsetX,
        offsetY: transform.offsetY,
        eventHandlers: {
            onTouchStart: handleTouchStart,
            onTouchMove: handleTouchMove,
            onTouchEnd: handleTouchEnd,
        },
    };
};
