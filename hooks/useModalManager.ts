/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
// FIX: Add React import to resolve namespace error.
import { useState, useCallback, useRef } from 'react';
import { useGameContext } from '../components/contexts/GameContext';
import type { Character } from '../types/character';
import type { EntityTooltipData, AppSettings } from '../types/app';
import type { Stat } from '../types/base';

interface ActiveTooltipInfo {
    name: string;
    type: string;
    position: { top: number; left: number };
    variant: EntityTooltipData['variant'];
    statId?: string;
}


export const useModalManager = ({ settings }: { settings: AppSettings }) => {
    const { gameState } = useGameContext();
    const [activeModal, setActiveModal] = useState<string | null>(null);
    const [selectedCharacterName, setSelectedCharacterName] = useState<string | null>(null);
    const [characterToEditAvatar, setCharacterToEditAvatar] = useState<Character | null>(null);
    const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
    const [isFooterVisible, setIsFooterVisible] = useState(true);
    const [isHeaderCollapsed, setIsHeaderCollapsed] = useState(false);
    const [activeTooltip, setActiveTooltip] = useState<ActiveTooltipInfo | null>(null);
    const tooltipTimerRef = useRef<number | null>(null);


    const openModal = useCallback((modalName: string) => {
        console.log('openModal called with modalName:', modalName);
        setActiveModal(modalName);
    }, []);
    
    const closeModal = useCallback(() => {
        setActiveModal(null);
        setSelectedCharacterName(null);
        setCharacterToEditAvatar(null);
    }, []);

    const handleCloseTooltip = useCallback(() => {
        if (tooltipTimerRef.current) clearTimeout(tooltipTimerRef.current);
        setActiveTooltip(null);
    }, []);

    const openCharacterModal = useCallback((characterName: string) => {
        console.log('openCharacterModal called with characterName:', characterName);
        handleCloseTooltip();
        setSelectedCharacterName(characterName);
        setActiveModal('character');
    }, [handleCloseTooltip]);

    const openAvatarEditModal = useCallback((character: Character) => {
        setCharacterToEditAvatar(character);
        // This modal is standalone and doesn't set activeModal, it appears on top.
    }, []);

    const handleEntityClick = useCallback((event: React.MouseEvent, entityName: string, entityType: string) => {
        event.stopPropagation();
        handleCloseTooltip(); // Close any active tooltip on click
    
        if (entityType === 'PC' || entityType === 'NPC') {
            openCharacterModal(entityName);
            return;
        }
    
        // For other types, you might want to show a pinned tooltip or a different modal.
        // For now, we'll just show the hover tooltip.
        handleEntityMouseEnter(event, entityName, entityType);

    }, [openCharacterModal, handleCloseTooltip]);
    
    const handleEntityMouseEnter = useCallback((event: React.MouseEvent, entityName: string, entityType: string, variant: EntityTooltipData['variant'] = 'default') => {
        if (settings.mobileMode === 'on') return;
        if (tooltipTimerRef.current) clearTimeout(tooltipTimerRef.current);

        tooltipTimerRef.current = window.setTimeout(() => {
            setActiveTooltip({
                name: entityName,
                type: entityType,
                position: { top: event.clientY, left: event.clientX },
                variant: variant,
            });
        }, 200);
    }, [gameState, settings.mobileMode]);

    const handleEntityMouseLeave = useCallback(() => {
        // Clear any pending "show" timer
        if (tooltipTimerRef.current) clearTimeout(tooltipTimerRef.current);
        
        // Use a small delay before hiding to allow mouse to move onto the tooltip
        tooltipTimerRef.current = window.setTimeout(() => {
            setActiveTooltip(null);
        }, 150);
    }, []);

    const handleEntityDoubleClick = useCallback((event: React.MouseEvent, entityName: string, entityType: string, variant: EntityTooltipData['variant'] = 'default') => {
        event.stopPropagation();
        if (settings.mobileMode !== 'on') return;

        // If the same tooltip is active, hide it. Otherwise, show the new one.
        if (activeTooltip && activeTooltip.name === entityName && activeTooltip.type === entityType) {
            setActiveTooltip(null);
        } else {
            setActiveTooltip({
                name: entityName,
                type: entityType,
                position: { top: event.clientY, left: event.clientX },
                variant: variant,
            });
        }
    }, [settings.mobileMode, activeTooltip]);

    const handleStatusMouseEnter = useCallback((event: React.MouseEvent, status: Stat) => {
        if (settings.mobileMode === 'on' || !gameState) return;
        if (tooltipTimerRef.current) clearTimeout(tooltipTimerRef.current);

        tooltipTimerRef.current = window.setTimeout(() => {
            setActiveTooltip({
                name: status.name,
                type: 'Trạng Thái',
                position: { top: event.clientY + 20, left: event.clientX },
                variant: 'default',
                statId: status.id,
            });
        }, 200);
    }, [gameState, settings.mobileMode]);

    const handleStatusMouseLeave = handleEntityMouseLeave;
    
    const handleStatusClick = useCallback((event: React.MouseEvent, status: Stat) => {
        if (activeTooltip && activeTooltip.name === status.name) {
            setActiveTooltip(null);
        } else {
            handleStatusMouseEnter(event, status);
        }
    }, [activeTooltip, handleStatusMouseEnter]);


    const handleAvatarClick = useCallback((characterName: string) => {
        if (!gameState) return;
        let characterToEdit: Character | undefined;
        if (gameState.character?.name === characterName) {
            characterToEdit = gameState.character;
        } else {
            characterToEdit = gameState.knowledgeBase?.npcs?.find(npc => npc.name === characterName);
        }
        if (characterToEdit) {
            openAvatarEditModal(characterToEdit);
        }
    }, [gameState, openAvatarEditModal]);

    const handleNpcSelect = useCallback((npcName: string) => {
        openCharacterModal(npcName);
    }, [openCharacterModal]);

    return {
        activeModal,
        setActiveModal,
        selectedCharacterName,
        characterToEditAvatar,
        isMobileNavOpen,
        isFooterVisible,
        isHeaderCollapsed,
        activeTooltip: activeTooltip,
        setActiveTooltip,
        handleEntityClick,
        handleEntityMouseEnter,
        handleEntityDoubleClick,
        handleEntityMouseLeave,
        handleAvatarClick,
        handleNpcSelect,
        handleCloseTooltip,
        handleStatusMouseEnter,
        handleStatusMouseLeave,
        handleStatusClick,
        openModal,
        closeModal,
        openCharacterModal,
        openAvatarEditModal,
        setIsMobileNavOpen,
        setIsFooterVisible,
        setIsHeaderCollapsed,
    };
};
