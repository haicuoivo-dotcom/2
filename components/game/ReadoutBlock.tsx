/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { InlineStoryRenderer } from './StoryRenderer';
import type { GameState } from '../../types';

interface ReadoutBlockProps {
    children: React.ReactNode;
    title?: string;
}

const UnmemoizedReadoutBlock = ({ children, title }: ReadoutBlockProps) => {
    return (
        <div className="readout-container">
            {title && (
                <header className="readout-header">
                    {title}
                </header>
            )}
            <div className="readout-content">
                {children}
            </div>
        </div>
    );
};

export const ReadoutBlock = React.memo(UnmemoizedReadoutBlock);