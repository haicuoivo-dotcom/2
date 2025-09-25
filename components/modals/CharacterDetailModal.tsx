/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useMemo, useEffect, useCallback, useState } from 'react';
import { InfoTab } from '../game/character-tabs/InfoTab';
import { BiographyTab } from '../game/character-tabs/BiographyTab';
import { SkillsTab } from '../game/character-tabs/SkillsTab';
import { InventoryTab } from '../game/character-tabs/InventoryTab';
import { MemoriesTab } from '../game/character-tabs/MemoriesTab';
import { QuestsTab } from '../game/character-tabs/QuestsTab';
import { EntityTooltip } from '../game/EntityTooltip';
import { EquipmentPickerModal } from '../game/character-tabs/EquipmentPickerModal';
import { useCharacterDetailManager } from '../../hooks/useCharacterDetailManager';
// ...existing code...
import { useGameContext } from '../contexts/GameContext';
import type { Character, AppSettings, SupplementReport } from '../../types';
import { useSettings } from '../contexts/SettingsContext';
import './CharacterDetailModal.css';
import { BagTab } from '../game/character-tabs/BagTab';
import { AssetsTab } from '../game/character-tabs/AssetsTab';
import { RelationshipsTab } from '../game/character-tabs/RelationshipsTab';
import { AvatarEditModal } from './AvatarEditModal';
// ...existing code...
import { TraitPickerModal } from './TraitPickerModal';


interface AvatarViewerModalProps {
    character: Character;
    onClose: () => void;
    onEdit: () => void;
}

const AvatarViewerModal = ({ character, onClose, onEdit }: AvatarViewerModalProps) => {
    if (!character.avatarUrl) {
        onClose();
        return null;
    }

    const handleDownload = () => {
        window.open(character.avatarUrl, '_blank');
    };

    return (
        <div className="modal-overlay avatar-viewer-overlay" onClick={onClose}>
            <div className="avatar-viewer-content" onClick={e => e.stopPropagation()}>
                <img src={character.avatarUrl} alt={`Avatar of ${character.displayName}`} className="avatar-viewer-image" />
                <div className="avatar-viewer-actions">
                    <button className="lore-button" onClick={onEdit}>Sửa Ảnh (AI/Tải lên)</button>
                    <button className="lore-button" onClick={handleDownload}>Tải Xuống</button>
                    <button className="lore-button cancel" onClick={onClose}>Đóng</button>
                </div>
            </div>
        </div>
    );
};

interface CharacterDetailModalProps {
    characterName: string | null;
    onClose: () => void;
    onEntityClick: (event: React.MouseEvent, name: string, type: string) => void;
    onNpcSelect: (npcName: string) => void;
    // FIX: Added missing onRenameEntity prop to align with its usage in GameModals.
    onRenameEntity: (oldName: string, newName: string) => void;
    onUpdateCharacterData: (characterId: string, updates: Partial<Character>) => void;
    onItemAction: (actionDescription: string) => Promise<void>;
    areCheatsEnabled: boolean;
    settings: AppSettings;
    supplementSingleCharacter: (character: Character) => Promise<SupplementReport | null>;
    defaultTab?: string;
    addToast: (message: string, type?: 'info' | 'success' | 'error' | 'warning', details?: any) => void;
    incrementApiRequestCount: () => void;
}

const isTrulyNamedMonster = (char: Character): boolean => {
    if (char.npcType !== 'named_monster') {
        return false;
    }
    const raceSynonyms = ['chủng tộc', 'loài', 'giống loài', 'tộc'];
    const speciesStat = char.stats?.find(s => raceSynonyms.includes(s.name.toLowerCase()));

    if (!speciesStat || typeof speciesStat.value !== 'string' || !speciesStat.value) {
        return true;
    }
    const species = speciesStat.value.toLowerCase();
    const displayName = (char.displayName || char.name).toLowerCase();
    return !displayName.includes(species);
};


export const CharacterDetailModal = (props: CharacterDetailModalProps) => {
    const { characterName, onClose, onEntityClick, onNpcSelect, areCheatsEnabled, settings, supplementSingleCharacter, onUpdateCharacterData, addToast, incrementApiRequestCount } = props;
    const { gameState, dispatch } = useGameContext();
    const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
    const [isAvatarViewerOpen, setIsAvatarViewerOpen] = useState(false);

    const character = useMemo(() => {
        if (!characterName || !gameState) return null;
        if (characterName === gameState.character?.name) return gameState.character;
        return gameState.knowledgeBase?.npcs?.find(npc => npc.name === characterName) || null;
    }, [characterName, gameState]);

    const isPlayerCharacter = useMemo(() => {
        return character?.id === gameState?.character?.id;
    }, [character, gameState]);

    const managerProps = { ...props, character, isPlayerCharacter };
    const {
    // ...existing code...
        activeTab,
        setActiveTab,
        activeTooltip,
        handleEquipItem,
        handleUnequipItem,
        handleSetEquippedTitle,
        handleStatusMouseEnter,
        handleStatusMouseLeave,
        handleStatusClick,
        handleStatusDoubleClick,
        isMobile,
        activeTitle,
        isDead,
        deathStat,
        pickerSlot,
        handleOpenPicker,
        handleClosePicker,
        statusFormState, 
        setStatusFormState, 
        highlightedLinks, 
        previewStats, 
        effectiveStats, 
        combatPower, 
        temporaryStatuses, 
        permanentStatuses, 
        activeSetBonuses, 
        allAttributes,
        handleStatusHoverStart, 
        handleStatHoverStart, 
        handleHoverEnd, 
        handleSaveStatus, 
        handleDeleteStatus, 
        handleStatUpdate, 
        handleDeleteAttribute, 
        editingStat, 
        editValue, 
        setEditValue, 
        handleStartEdit, 
        handleSaveEdit, 
        setEditingStat,
        isTraitPickerOpen,
        handleOpenTraitPicker,
        handleCloseTraitPicker,
        handleAddTrait,
        handleRemoveTrait,
    } = useCharacterDetailManager(managerProps);
    
    useEffect(() => {
        if (activeTab === 'quests' && isPlayerCharacter && gameState?.hasUnseenQuest) {
            dispatch({ type: 'CLEAR_UNSEEN_QUEST_FLAG' });
        }
    }, [activeTab, isPlayerCharacter, gameState?.hasUnseenQuest, dispatch]);

    const handleUpdateRelationship = useCallback((targetCharId: string, newAffinity: number) => {
        if (!character) return;
        dispatch({
            type: 'UPDATE_RELATIONSHIP_MANUAL',
            payload: {
                sourceCharId: character.id,
                targetCharId,
                newAffinity,
            }
        });
        props.addToast("Đã cập nhật thiện cảm.", "success");
    }, [character, dispatch, props.addToast]);

    const unequippedItems = useMemo(() => {
        if (!character?.stats) return [];
        const equippedIds = new Set(Object.values(character.equipment || {}).filter(Boolean));
        return character.stats.filter(s => 
            (s.category === 'Vật phẩm' || s.category === 'Nguyên liệu') && !equippedIds.has(s.id)
        );
    }, [character]);
    
    const currentlyEquippedInPickerSlot = useMemo(() => {
        if (!pickerSlot || !character?.equipment) return undefined;
        const equippedId = character.equipment[pickerSlot];
        if (!equippedId) return undefined;
        
        const item = character.stats.find(s => s.id === equippedId);
        if (item?.isPlaceholderFor) {
            return character.stats.find(s => s.id === item.isPlaceholderFor);
        }
        return item;
    }, [pickerSlot, character]);

    if (!character) return null;

    const renderTabContent = () => {
        switch (activeTab) {
            case 'biography':
                return <BiographyTab
                    character={character}
                    isPlayerCharacter={isPlayerCharacter}
                    onEntityClick={onEntityClick}
                    onUpdateCharacterData={props.onUpdateCharacterData}
                    enableCheats={areCheatsEnabled}
                    onSetEquippedTitle={handleSetEquippedTitle}
                    onOpenTraitPicker={handleOpenTraitPicker}
                    onRemoveTrait={handleRemoveTrait}
                />;
            case 'info':
                return <InfoTab 
                    character={character} 
                    onEntityClick={onEntityClick}
                    onUpdateCharacterData={props.onUpdateCharacterData}
                    addToast={addToast}
                    incrementApiRequestCount={incrementApiRequestCount}
                    enableCheats={areCheatsEnabled}
                    onStatusMouseEnter={handleStatusMouseEnter}
                    onStatusMouseLeave={handleStatusMouseLeave}
                    handleStatusClick={handleStatusClick}
                    handleStatusDoubleClick={handleStatusDoubleClick}
                    isMobile={isMobile}
                    isDead={isDead}
                    deathStat={deathStat}
                    isPlayerCharacter={isPlayerCharacter}
                    settings={settings}
                    supplementSingleCharacter={supplementSingleCharacter}
                    statusFormState={statusFormState}
                    setStatusFormState={setStatusFormState}
                    highlightedLinks={highlightedLinks}
                    previewStats={previewStats}
                    effectiveStats={effectiveStats}
                    combatPower={combatPower}
                    temporaryStatuses={temporaryStatuses}
                    permanentStatuses={permanentStatuses}
                    activeSetBonuses={activeSetBonuses}
                    allAttributes={allAttributes}
                    handleStatusHoverStart={handleStatusHoverStart}
                    handleStatHoverStart={handleStatHoverStart}
                    handleHoverEnd={handleHoverEnd}
                    handleSaveStatus={handleSaveStatus}
                    handleDeleteStatus={handleDeleteStatus}
                    handleStatUpdate={handleStatUpdate}
                    handleDeleteAttribute={handleDeleteAttribute}
                    editingStat={editingStat}
                    editValue={editValue}
                    setEditValue={setEditValue}
                    handleStartEdit={handleStartEdit}
                    handleSaveEdit={handleSaveEdit}
                    setEditingStat={setEditingStat}
                />;
            case 'equipment':
                return useSettings().settings.showEquipmentTab ? (
                    <InventoryTab
                        character={character}
                        onOpenPicker={handleOpenPicker}
                    />
                ) : null;
            case 'bag':
                return <BagTab
                    character={character}
                    isPlayerCharacter={isPlayerCharacter}
                    onUpdateCharacterData={props.onUpdateCharacterData}
                    onItemAction={props.onItemAction}
                    enableCheats={areCheatsEnabled}
                    onOpenPicker={handleOpenPicker}
                    incrementApiRequestCount={incrementApiRequestCount}
                />;
            case 'assets':
                 return <AssetsTab
                    character={character}
                    isPlayerCharacter={isPlayerCharacter}
                    onUpdateCharacterData={props.onUpdateCharacterData}
                    enableCheats={areCheatsEnabled}
                />;
            case 'skills':
                return <SkillsTab
                    character={character}
                    isPlayerCharacter={isPlayerCharacter}
                    onEntityClick={onEntityClick}
                    onUpdateCharacterData={props.onUpdateCharacterData}
                    addToast={addToast}
                    enableCheats={areCheatsEnabled}
                />;
            case 'memories':
                return <MemoriesTab
                    character={character}
                    onUpdateCharacterData={props.onUpdateCharacterData}
                    addToast={addToast}
                    enableCheats={areCheatsEnabled}
                />;
            case 'relationships':
                return <RelationshipsTab
                    character={character}
                    onNpcSelect={onNpcSelect}
                    areCheatsEnabled={areCheatsEnabled}
                    onUpdateRelationship={handleUpdateRelationship}
                />;
            case 'quests':
                return <QuestsTab
                    character={character}
                    onUpdateCharacterData={props.onUpdateCharacterData}
                    addToast={addToast}
                    enableCheats={areCheatsEnabled}
                />;
            default:
                return null;
        }
    };

    const isDescriptiveMonster = (character.npcType === 'named_monster' && !isTrulyNamedMonster(character)) || character.npcType === 'unnamed_monster';

    return (
        <div className="modal-overlay character-detail-overlay" onClick={() => { if (activeTooltip) { handleStatusMouseLeave(); } else { onClose(); } }}>
            {isTraitPickerOpen && (
                <TraitPickerModal
                    character={character}
                    onClose={handleCloseTraitPicker}
                    onAddTrait={handleAddTrait}
                    onRemoveTrait={handleRemoveTrait}
                />
            )}
            {isAvatarViewerOpen && character && character.avatarUrl && (
                <AvatarViewerModal
                    character={character}
                    onClose={() => setIsAvatarViewerOpen(false)}
                    onEdit={() => {
                        setIsAvatarViewerOpen(false);
                        setIsAvatarModalOpen(true);
                    }}
                />
            )}
            {isAvatarModalOpen && character && 
                <AvatarEditModal 
                    character={character} 
                    onClose={() => setIsAvatarModalOpen(false)} 
                    onSave={(newUrl) => onUpdateCharacterData(character.id, { avatarUrl: newUrl })} 
                    addToast={addToast}
                    incrementApiRequestCount={incrementApiRequestCount}
                />
            }
            <EquipmentPickerModal
                isOpen={!!pickerSlot}
                onClose={handleClosePicker}
                inventory={unequippedItems}
                targetSlot={pickerSlot!}
                onEquip={handleEquipItem}
                onUnequip={handleUnequipItem}
                currentlyEquippedItem={currentlyEquippedInPickerSlot}
            />
            <EntityTooltip data={activeTooltip} />
            <div className="modal-content fullscreen-modal-content character-detail-modal" onClick={e => e.stopPropagation()}>
                <header className={`modal-header ${isPlayerCharacter ? 'pc-header' : 'npc-header'}`}>
                    <div className="char-header-main">
                        <h3 className={isPlayerCharacter ? 'pc-title' : 'npc-title'}>
                            <div className="entity-name-wrapper">
                                <span>{activeTitle && activeTitle.name ? `${activeTitle.name} ` : ''}{character.displayName || character.name}</span>
                                {character.displayName && character.displayName !== character.name && !isDescriptiveMonster && <span className="char-detail-fullname">({character.name})</span>}
                            </div>
                        </h3>
                    </div>
                    <button onClick={onClose} className="modal-close-button" aria-label="Đóng">×</button>
                </header>
                <div className="char-detail-body">
                    <nav className="modal-tabs char-detail-tabs">
                        <button onClick={() => setActiveTab('info')} className={`modal-tab-button char-detail-tab-button ${activeTab === 'info' ? 'active' : ''}`}>Chính</button>
                        {useSettings().settings.showEquipmentTab && (
                            <button onClick={() => setActiveTab('equipment')} className={`modal-tab-button char-detail-tab-button ${activeTab === 'equipment' ? 'active' : ''}`}>Trang bị</button>
                        )}
                        <button onClick={() => setActiveTab('bag')} className={`modal-tab-button char-detail-tab-button ${activeTab === 'bag' ? 'active' : ''}`}>Túi</button>
                        <button onClick={() => setActiveTab('assets')} className={`modal-tab-button char-detail-tab-button ${activeTab === 'assets' ? 'active' : ''}`}>Tài Sản</button>
                        <button onClick={() => setActiveTab('skills')} className={`modal-tab-button char-detail-tab-button ${activeTab === 'skills' ? 'active' : ''}`} disabled={isDead}>Năng lực</button>
                        <button onClick={() => setActiveTab('relationships')} className={`modal-tab-button char-detail-tab-button ${activeTab === 'relationships' ? 'active' : ''}`}>Quan hệ</button>
                        {isPlayerCharacter && <button onClick={() => setActiveTab('quests')} className={`modal-tab-button char-detail-tab-button ${activeTab === 'quests' ? 'active' : ''} ${gameState?.hasUnseenQuest ? 'new-content-indicator' : ''}`}>Nhiệm Vụ</button>}
                        {character?.npcType !== 'unnamed_monster' && (
                            <button onClick={() => setActiveTab('memories')} className={`modal-tab-button char-detail-tab-button ${activeTab === 'memories' ? 'active' : ''}`}>Ký Ức Cốt Lõi</button>
                        )}
                        <button onClick={() => setActiveTab('biography')} className={`modal-tab-button char-detail-tab-button ${activeTab === 'biography' ? 'active' : ''}`}>Hồ Sơ</button>
                    </nav>

                    <div className="char-detail-tab-content">
                        {renderTabContent()}
                    </div>
                </div>
            </div>
        </div>
    );
};
