/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState } from 'react';
import { KNOWLEDGE_BASE_CATEGORIES, KB_CATEGORY_ORDER } from '../../constants/gameConstants';
import { WorldSummaryTab } from '../game/kb-tabs/WorldSummaryTab';
import { WorldLogicTab } from '../game/kb-tabs/WorldLogicTab';
import { WorldEventsTab } from '../game/kb-tabs/WorldEventsTab';
import { EntityListTab } from '../game/kb-tabs/EntityListTab';
import { FactionManagementTab } from '../game/kb-tabs/FactionManagementTab';
import { WorldSkillsTab } from '../game/kb-tabs/WorldSkillsTab'; 
import { ReputationTab } from '../game/kb-tabs/ReputationTab';
import { useWorldData } from '../contexts/GameContext'; 
import type { WorldLogicRule, WorldEvent } from '../../types';
import './KnowledgeBaseModal.css';
import '../game/kb-tabs/WorldSkillsTab.css'; 

interface KnowledgeBaseModalProps {
    areCheatsEnabled: boolean;
    onClose: () => void;
    onEntityClick: (event: React.MouseEvent, name: string, type: string) => void;
    onEntityMouseEnter: (event: React.MouseEvent, name: string, type: string) => void;
    onEntityMouseLeave: () => void;
    onNpcSelect: (npcName: string) => void;
    onUpdateWorldSummary: (newSummary: string) => void;
    onUpdateWorldLogic: (newLogic: WorldLogicRule[]) => void;
    onUpdateWorldEvents: (newEvents: WorldEvent[]) => void;
    defaultTab?: keyof typeof KNOWLEDGE_BASE_CATEGORIES;
    addToast: (message: string, type?: 'info' | 'success' | 'error' | 'warning', details?: any) => void;
    incrementApiRequestCount: () => void;
}

export const KnowledgeBaseModal = ({
    areCheatsEnabled,
    onClose,
    onEntityClick,
    onEntityMouseEnter,
    onEntityMouseLeave,
    onNpcSelect,
    onUpdateWorldSummary,
    onUpdateWorldLogic,
    onUpdateWorldEvents,
    defaultTab,
    addToast,
    incrementApiRequestCount
}: KnowledgeBaseModalProps) => {
    const worldData = useWorldData();
    const [activeTab, setActiveTab] = useState<keyof typeof KNOWLEDGE_BASE_CATEGORIES>(defaultTab || 'npcs');

    if (!worldData) {
        return null; 
    }
    const { worldSettings } = worldData;
    
    const getTabLabel = (key: keyof typeof KNOWLEDGE_BASE_CATEGORIES) => {
        if (key === 'world_skills') {
            const genre = worldSettings.genre;
            if (genre === 'Võ Lâm') {
                return 'Võ Học';
            }
            if (['Dị Giới Fantasy', 'Thế Giới Giả Tưởng (Game/Tiểu Thuyết)', 'Đô Thị Dị Biến'].includes(genre)) {
                return 'Siêu Năng Lực/Skill';
            }
            if (['Tu Tiên', 'Huyền Huyễn Truyền Thuyết'].includes(genre)) {
                return 'Công pháp/Bí kíp';
            }
            return 'Siêu Năng Lực/Kỹ Năng/Võ Học';
        }
        return KNOWLEDGE_BASE_CATEGORIES[key].label;
    };

    const renderContent = () => {
        switch(activeTab) {
            case 'reputation':
                return (
                    <ReputationTab />
                );
            case 'world_summary':
                return (
                    <WorldSummaryTab
                        onUpdateWorldSummary={onUpdateWorldSummary}
                    />
                );
            case 'world_logic':
                return (
                     <WorldLogicTab
                        onUpdateWorldLogic={onUpdateWorldLogic}
                    />
                );
            case 'world_events':
                return (
                     <WorldEventsTab
                        onUpdateWorldEvents={onUpdateWorldEvents}
                    />
                );
            case 'factions':
                return (
                    <FactionManagementTab
                        areCheatsEnabled={areCheatsEnabled}
                        onNpcSelect={onNpcSelect}
                    />
                );
            case 'npcs':
            case 'locations':
                 return (
                    <EntityListTab
                        activeTab={activeTab}
                        areCheatsEnabled={areCheatsEnabled}
                        onNpcSelect={onNpcSelect}
                        onEntityClick={onEntityClick}
                        onEntityMouseEnter={onEntityMouseEnter}
                        onEntityMouseLeave={onEntityMouseLeave}
                    />
                );
            case 'world_skills': 
                return (
                    <WorldSkillsTab
                        onEntityClick={onEntityClick}
                        addToast={addToast}
                        incrementApiRequestCount={incrementApiRequestCount}
                    />
                );
            default:
                return null;
        }
    };


    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content fullscreen-modal-content kb-modal-content" onClick={e => e.stopPropagation()}>
                <header className="modal-header">
                    <h3>Tri Thức Thế Giới</h3>
                    <button onClick={onClose} className="modal-close-button" aria-label="Đóng">×</button>
                </header>
                <div className="modal-body kb-modal-body">
                    <nav className="kb-tabs">
                        {KB_CATEGORY_ORDER.map(key => { 
                            const catKey = key as keyof typeof KNOWLEDGE_BASE_CATEGORIES;
                            if (!KNOWLEDGE_BASE_CATEGORIES[catKey]) return null;
                            return (
                                <button 
                                    key={key} 
                                    className={`kb-tab-button ${activeTab === key ? 'active' : ''}`} 
                                    onClick={() => setActiveTab(catKey)}
                                >
                                    <span>{getTabLabel(catKey)}</span> 
                                </button>
                            ); 
                        })}
                    </nav>
                    <div className="kb-content">
                        {renderContent()}
                    </div>
                </div>
            </div>
        </div>
    );
};