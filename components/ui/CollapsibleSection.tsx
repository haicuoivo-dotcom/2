/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';

interface CollapsibleSectionProps {
    title: string;
    children: React.ReactNode;
    isOpen: boolean;
    onToggle: () => void;
}

const UnmemoizedCollapsibleSection = ({ title, children, isOpen, onToggle }: CollapsibleSectionProps) => {
    // Cấu trúc đã được đơn giản hóa và cơ chế animation được chuyển hoàn toàn sang CSS
    // để đảm bảo hoạt động đáng tin cậy, ngay cả khi được lồng vào nhau.
    return (
        <section className={`form-section ${isOpen ? 'open' : ''}`}>
            <header 
                className="section-header" 
                onClick={onToggle} 
                role="button" 
                tabIndex={0} 
                onKeyPress={(e) => (e.key === 'Enter' || e.key === ' ') && onToggle()}
                aria-expanded={isOpen}
            >
                <h2>{title}</h2>
                <span className="collapsible-chevron">
                    {isOpen ? '▼' : '►'}
                </span>
            </header>
            <div className="section-content">
                {children}
            </div>
        </section>
    );
};

export const CollapsibleSection = React.memo(UnmemoizedCollapsibleSection);