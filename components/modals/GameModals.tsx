/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useMemo } from 'react';
import { LoreModal } from '../modals/LoreModal';
import { MemoryModal } from '../modals/MemoryModal';
import { KnowledgeBaseModal } from '../modals/KnowledgeBaseModal';
import { CharacterDetailModal } from '../modals/CharacterDetailModal';
import { HistoryModal } from '../modals/HistoryModal';
import { GalleryModal } from '../modals/GalleryModal';
import { MapModal } from '../modals/MapModal';
import { AvatarEditModal } from '../modals/AvatarEditModal';
import { HelpModal } from '../modals/HelpModal';
import { CraftingModal } from '../modals/CraftingModal';
import { WorldHealingModal } from '../modals/WorldHealingModal';
import { EntityTooltip } from '../game/EntityTooltip';
import { AuctionInventoryTab } from '../game/kb-tabs/AuctionInventoryTab';
import { useGameContext } from '../contexts/GameContext';
import { useModalManager } from '../../hooks/useModalManager';
import { useGameEngineContext } from '../contexts/GameEngineContext';
import { useAppContext } from '../contexts/AppContext';
import { LogModal } from '../modals/LogModal';
import { CustomizeUIMoal } from '../modals/CustomizeUIMoal';
import { TechSimulationModal } from '../modals/TechSimulationModal';
import { DataCleanupModal } from '../modals/DataCleanupModal';
import { HaremModal } from '../modals/HaremModal';
import type { AppSettings, Character, GameAction, EntityTooltipData, LoreRule, Stat, WorldLogicRule, WorldEvent, GalleryImage, WorldHealingReport, SupplementReport } from '../../types';
import * as db from '../../services/db';
import { generateUniqueId } from '../../utils/id';

interface GameModalsProps {
    modalManager: ReturnType<typeof useModalManager>;
    settings: AppSettings;
    handleSaveLore: (newLoreRules: LoreRule[]) => void;
    handlePinMemory: (memoryId: string) => void;
    handleDeleteMemory: (memoryId: string) => void;
    handleRevert: (historyIndex: number) => void;
    handleRenameEntity: (oldName: string, newName: string) => void;
    handleUpdateCharacterData: (characterId: string, updates: Partial<Character>) => void;
    handleUpdateWorldSummary: (newSummary: string) => void;
    handleUpdateWorldLogic: (newLogic: WorldLogicRule[]) => void;
    handleUpdateWorldEvents: (newEvents: WorldEvent[]) => void;
    handleCraftItem: (recipeName: string, quantity: number) => void;
    onItemAction: (actionDescription: string) => Promise<void>;
    handleCleanupData: (payload: { statIds: Set<string>; memoryIds: Set<string>; relationshipsToPrune: { charId: string; targetId: string; }[] }) => void;
    // FIX: Add missing props for toast and API count to pass down.
    addToast: (message: string, type?: 'info' | 'success' | 'error' | 'warning', details?: any) => void;
    incrementApiRequestCount: () => void;
    manuallyTriggerWorldHealing: (onProgressUpdate: (message: string) => void) => Promise<WorldHealingReport | null>;
    supplementSingleCharacter: (character: Character) => Promise<SupplementReport | null>;
}

export const GameModals = ({
    modalManager,
    settings,
    handleSaveLore,
    handlePinMemory,
    handleDeleteMemory,
    handleRevert,
    handleRenameEntity,
    handleUpdateCharacterData,
    handleUpdateWorldSummary,
    handleUpdateWorldLogic,
    handleUpdateWorldEvents,
    handleCraftItem,
    onItemAction,
    handleCleanupData,
    // FIX: Destructure newly added props.
    addToast,
    incrementApiRequestCount,
    manuallyTriggerWorldHealing,
    supplementSingleCharacter,
}: GameModalsProps) => {
    const { gameState, worldSettings } = useGameContext();
    const gameEngine = useGameEngineContext();
    const app = useAppContext();
    
    const {
        activeModal,
        selectedCharacterName,
        characterToEditAvatar,
        activeTooltip,
        handleEntityClick,
        handleEntityMouseEnter,
        handleEntityMouseLeave,
        handleNpcSelect,
        closeModal
    } = modalManager;
    
    if (!gameState) return null;

    return (
        <>
            {/* FIX: Passed the required `onRenameEntity` prop to CharacterDetailModal. */}
            {activeModal === 'character' && <CharacterDetailModal settings={settings} areCheatsEnabled={settings.enableCheats} characterName={selectedCharacterName} onClose={closeModal} onEntityClick={handleEntityClick} onNpcSelect={handleNpcSelect} onRenameEntity={handleRenameEntity} onUpdateCharacterData={handleUpdateCharacterData} addToast={addToast} incrementApiRequestCount={incrementApiRequestCount} onItemAction={onItemAction} supplementSingleCharacter={gameEngine.supplementSingleCharacter} />}
            {activeModal === 'harem' && <HaremModal onClose={closeModal} character={gameState.character} onUpdateCharacterData={handleUpdateCharacterData} addToast={app.addToast} onNpcSelect={handleNpcSelect} areCheatsEnabled={settings.enableCheats} />}
            {activeModal === 'knowledge' && <KnowledgeBaseModal areCheatsEnabled={settings.enableCheats} onClose={closeModal} onEntityClick={handleEntityClick} onEntityMouseEnter={handleEntityMouseEnter} onEntityMouseLeave={handleEntityMouseLeave} onNpcSelect={handleNpcSelect} onUpdateWorldSummary={handleUpdateWorldSummary} onUpdateWorldLogic={handleUpdateWorldLogic} onUpdateWorldEvents={handleUpdateWorldEvents} addToast={addToast} incrementApiRequestCount={incrementApiRequestCount}/>}
            {activeModal === 'lore' && <LoreModal initialRules={worldSettings.loreRules || []} onSave={handleSaveLore} onClose={closeModal} />}
            {activeModal === 'memory' && <MemoryModal memories={gameState.memories || []} onPin={handlePinMemory} onDelete={handleDeleteMemory} onClose={closeModal} onEntityClick={handleEntityClick} onEntityMouseEnter={handleEntityMouseEnter} onEntityMouseLeave={handleEntityMouseLeave} />}
            {activeModal === 'history' && <HistoryModal turns={gameState.turns} onRevert={handleRevert} onClose={closeModal} onEntityClick={handleEntityClick} onEntityMouseEnter={handleEntityMouseEnter} onEntityMouseLeave={handleEntityMouseLeave} />}
            {activeModal === 'help' && <HelpModal onClose={closeModal} />}
            {activeModal === 'gallery' && <GalleryModal onClose={closeModal} addToast={app.addToast} />}
            {activeModal === 'map' && <MapModal onClose={closeModal} />}
            {activeModal === 'crafting' && <CraftingModal onClose={closeModal} character={gameState.character} onCraftItem={handleCraftItem} areCheatsEnabled={settings.enableCheats} incrementApiRequestCount={incrementApiRequestCount} />}
            {activeModal === 'log' && <LogModal onClose={closeModal} />}
            {activeModal === 'worldHealing' && <WorldHealingModal onClose={closeModal} onTriggerWorldHealing={manuallyTriggerWorldHealing} />}
            {activeModal === 'customizeUI' && <CustomizeUIMoal onClose={closeModal} />}
            {activeModal === 'techSim' && <TechSimulationModal onClose={closeModal} incrementApiRequestCount={incrementApiRequestCount} />}
            {activeModal === 'dataCleanup' && <DataCleanupModal onClose={closeModal} onConfirmCleanup={handleCleanupData} />}
            {characterToEditAvatar && <AvatarEditModal 
                character={characterToEditAvatar} 
                onClose={closeModal} 
                onSave={async (newUrl) => {
                    const charToUpdate = [gameState.character, ...gameState.knowledgeBase.npcs].find(c => c.id === characterToEditAvatar.id);
                    if (charToUpdate) {
                        handleUpdateCharacterData(charToUpdate.id, { avatarUrl: newUrl });
                        app.addToast("Đã cập nhật ảnh đại diện.", "success");

                        try {
                            const newImage: GalleryImage = {
                                id: generateUniqueId('gallery-char'),
                                name: charToUpdate.displayName,
                                dataUrl: newUrl,
                                description: `Ảnh đại diện cho ${charToUpdate.displayName}`,
                                type: 'character',
                            };
                            await db.addOrUpdateImage(newImage);
                            app.addToast("Đã lưu ảnh đại diện vào thư viện.", "success");
                        } catch (error) {
                             console.error("Failed to save avatar to gallery:", error);
                             app.addToast("Không thể lưu ảnh đại diện vào thư viện.", "error");
                        }

                    } else {
                        app.addToast("Lỗi: Không tìm thấy nhân vật để cập nhật.", "error");
                    }
                    closeModal();
                }} 
                addToast={addToast} 
                incrementApiRequestCount={incrementApiRequestCount}
            />}
            
            {activeModal === 'auctionInventory' && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content kb-modal-content" onClick={e => e.stopPropagation()}>
                        <header className="modal-header">
                            <h3>Bán Vật phẩm của bạn (Túi đồ)</h3>
                            <button onClick={closeModal} className="modal-close-button">X</button>
                        </header>
                        <div className="modal-body">
                            <AuctionInventoryTab addToast={app.addToast} />
                        </div>
                    </div>
                </div>
            )}

            <EntityTooltip data={activeTooltip} />
        </>
    );
};