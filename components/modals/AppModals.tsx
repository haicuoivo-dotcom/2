/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { ApiKeyModal } from './ApiKeyModal';
import { AboutModal } from './AboutModal';
import { LoadGameModal } from './LoadGameModal';
import { SettingsModal } from './SettingsModal';
import { KnowledgeBaseModal } from './KnowledgeBaseModal';
import { CustomizeUIMoal } from './CustomizeUIMoal';
import { useAppContext } from '../contexts/AppContext';
import type { SaveFile, AppSettings } from '../../types';
import './modals.css';

interface AppModalsProps {
    activeModal: string | null;
    closeModal: () => void;
    handleApiKeyUpdate: () => void;
    saves: SaveFile[];
    handleLoadGame: (save: SaveFile) => void;
    handleDeleteGame: (saveId: string) => void;
    handleUploadSaves: (event: React.ChangeEvent<HTMLInputElement>) => void;
    handleDeleteAllGames: () => void;
    settings: AppSettings;
    handleEntityClick: (event: React.MouseEvent, name: string, type: string) => void;
    handleEntityMouseEnter: (event: React.MouseEvent, name: string, type: string) => void;
    handleEntityMouseLeave: () => void;
    handleNpcSelect: (npcName: string) => void;
}

export const AppModals = (props: AppModalsProps) => {
    const {
        activeModal,
        closeModal,
        handleApiKeyUpdate,
        saves,
        handleLoadGame,
        handleDeleteGame,
        handleUploadSaves,
        handleDeleteAllGames,
        settings,
        handleEntityClick,
        handleEntityMouseEnter,
        handleEntityMouseLeave,
        handleNpcSelect,
    } = props;

    const { addToast, incrementApiRequestCount } = useAppContext();

    return (
        <>
            {activeModal === 'apiKey' && <ApiKeyModal onClose={closeModal} onKeysUpdated={handleApiKeyUpdate} />}
            {activeModal === 'settings' && <SettingsModal onClose={closeModal} />}
            {activeModal === 'about' && <AboutModal onClose={closeModal} />}
            {activeModal === 'loadGame' && <LoadGameModal saves={saves} onClose={closeModal} onLoad={handleLoadGame} onDelete={handleDeleteGame} onUpload={handleUploadSaves} onDeleteAll={handleDeleteAllGames} />}
            {activeModal === 'factionManagement' && <KnowledgeBaseModal defaultTab="factions" areCheatsEnabled={settings.enableCheats} onClose={closeModal} onEntityClick={handleEntityClick} onEntityMouseEnter={handleEntityMouseEnter} onEntityMouseLeave={handleEntityMouseLeave} onNpcSelect={handleNpcSelect} onUpdateWorldSummary={() => {}} onUpdateWorldLogic={() => {}} onUpdateWorldEvents={() => {}} addToast={addToast} incrementApiRequestCount={incrementApiRequestCount} />}
            {activeModal === 'customizeUI' && <CustomizeUIMoal onClose={closeModal} />}
        </>
    );
};