/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useGameContext } from '../components/contexts/GameContext';
import { gameTimeToMinutes, formatRemainingTime, calculateEffectiveStats, calculatePreviewStats, calculateCombatPower } from '../utils/game';
import { RIGHT_HAND_SLOT, LEFT_HAND_SLOT } from '../constants/statConstants';
import { ITEM_TAGS } from '../constants/tagConstants';
import { generateUniqueId } from '../utils/id';
import type { Character, Stat, EquipmentSlot, EntityTooltipData, AppSettings, StatEffect, EffectiveStat, PersonalityTrait } from '../../types';

export const initialNewStatusData: Partial<Stat> = {
    category: 'Trạng thái',
    isPermanent: false,
    durationMinutes: 60,
    effects: [],
};

interface ActiveTooltipInfo {
    name: string;
    type: string;
    position: { top: number; left: number };
    variant: EntityTooltipData['variant'];
    statId?: string;
}

interface CharacterDetailManagerProps {
    character: Character | null;
    isPlayerCharacter: boolean;
    onClose: () => void;
    onUpdateCharacterData: (characterId: string, updates: Partial<Character>) => void;
    addToast: (message: string, type?: 'info' | 'success' | 'error' | 'warning') => void;
    settings: AppSettings;
    defaultTab?: string;
}

export const useCharacterDetailManager = (props: CharacterDetailManagerProps) => {
    const { character, isPlayerCharacter, onClose, onUpdateCharacterData, addToast, settings, defaultTab } = props;
    const { gameState, worldSettings, dispatch } = useGameContext();
    const [activeTab, setActiveTab] = useState(defaultTab || 'info');
    const [pickerSlot, setPickerSlot] = useState<EquipmentSlot | null>(null);
    const [activeTooltip, setActiveTooltip] = useState<ActiveTooltipInfo | null>(null);
    const isMobile = useMemo(() => settings.mobileMode === 'on', [settings.mobileMode]);
    const [isTraitPickerOpen, setIsTraitPickerOpen] = useState(false);


    // --- LOGIC MOVED FROM useInfoTabManager ---
    const [statusFormState, setStatusFormState] = useState<{ mode: 'add' | 'edit', data: Partial<Stat> } | null>(null);
    const [highlightedLinks, setHighlightedLinks] = useState<{ stats: Set<string>, statuses: Set<string> }>({ stats: new Set(), statuses: new Set() });
    const [previewStats, setPreviewStats] = useState<Map<string, EffectiveStat> | null>(null);
    const [editingStat, setEditingStat] = useState<{ id: string, field: 'name' | 'value' } | null>(null);
    const [editValue, setEditValue] = useState<string | number>('');

    const effectiveStats = useMemo(() => {
        if (!character) return new Map();
        return calculateEffectiveStats(character);
    }, [character]);

    const combatPower = useMemo(() => {
        if (!character) return 0;
        return calculateCombatPower(character);
    }, [character]);

    const { temporaryStatuses, permanentStatuses } = useMemo(() => {
        const allStatuses = character?.stats?.filter(s => s.category === 'Trạng thái') || [];
        return {
            temporaryStatuses: allStatuses.filter(s => !s.isPermanent),
            permanentStatuses: allStatuses.filter(s => s.isPermanent),
        };
    }, [character?.stats]);

    const activeSetBonuses = useMemo(() => {
        if (!character) return [];
        const equippedItemIds = new Set(Object.values(character.equipment || {}).filter(Boolean));
        const equippedItems = character.stats?.filter(stat => stat.id && equippedItemIds.has(stat.id)) || [];
        const sets = new Map<string, { count: number, bonuses: any[] }>();
        equippedItems.forEach(item => {
            if (item.setName) {
                const current = sets.get(item.setName) || { count: 0, bonuses: item.setBonuses || [] };
                current.count++;
                sets.set(item.setName, current);
            }
        });

        const active: { setName: string, bonus: any }[] = [];
        sets.forEach((setData, setName) => {
            let activeBonus = null;
            for (const bonus of setData.bonuses) {
                if (setData.count >= bonus.count) {
                    activeBonus = bonus;
                }
            }
            if (activeBonus) {
                active.push({ setName, bonus: activeBonus });
            }
        });
        return active;
    }, [character?.equipment, character?.stats]);

    const allAttributes = useMemo(() => {
        return character?.stats?.filter(s => s.category === 'Thuộc tính') || [];
    }, [character?.stats]);

    const handleHoverEnd = useCallback(() => {
        setHighlightedLinks({ stats: new Set(), statuses: new Set() });
        setPreviewStats(null);
    }, []);

    const handleStatusHoverStart = useCallback((status: Stat) => {
        if (!character || !status.id) return;
        const newPreviewStats = calculatePreviewStats(character, status.id);
        const newHighlightedLinks = { stats: new Set<string>(), statuses: new Set<string>([status.id]) };
        (status.effects || []).forEach(effect => {
            newHighlightedLinks.stats.add(effect.targetStat);
        });
        setPreviewStats(newPreviewStats);
        setHighlightedLinks(newHighlightedLinks);
    }, [character]);
    
    const handleStatHoverStart = useCallback((statName: string) => {
        if (!character) return;
        const newHighlightedLinks = { stats: new Set<string>([statName]), statuses: new Set<string>() };
        const equippedItemIds = new Set(Object.values(character.equipment || {}).filter(Boolean));
        const sources = [
            ...character.stats.filter(s => s.id && equippedItemIds.has(s.id)),
            ...character.stats.filter(s => s.category === 'Trạng thái'),
        ];
        sources.forEach(source => {
            (source.effects || []).forEach(effect => {
                if (effect.targetStat === statName && source.id) {
                    newHighlightedLinks.statuses.add(source.id);
                }
            });
        });
        setHighlightedLinks(newHighlightedLinks);
    }, [character]);
    
    const handleSaveStatus = useCallback(() => {
        if (!character || !statusFormState) return;
        const { mode, data } = statusFormState;
        if (!data.name?.trim()) {
            addToast("Tên trạng thái không được để trống.", 'warning');
            return;
        }
        let updatedStats: Stat[];
        if (mode === 'edit' && data.id) {
            updatedStats = character.stats.map(s => s.id === data.id ? { ...s, ...data } as Stat : s);
        } else {
            const newStatus = { ...initialNewStatusData, ...data, id: generateUniqueId('status-cheat') } as Stat;
            updatedStats = [...character.stats, newStatus];
        }
        onUpdateCharacterData(character.id, { stats: updatedStats });
        addToast(`Đã lưu trạng thái: ${data.name}`, 'success');
        setStatusFormState(null);
    }, [character, statusFormState, onUpdateCharacterData, addToast]);
    
    const handleDeleteStatus = useCallback((statusId: string) => {
        if (!character) return;
        const updatedStats = character.stats.filter(s => s.id !== statusId);
        onUpdateCharacterData(character.id, { stats: updatedStats });
        addToast("Đã xóa trạng thái.", 'info');
    }, [character, onUpdateCharacterData, addToast]);
    
    const handleDeleteAttribute = useCallback((statId: string) => {
        if (!character) return;
        const updatedStats = (character.stats || []).filter(s => s.id !== statId);
        onUpdateCharacterData(character.id, { stats: updatedStats });
        addToast("Đã xóa thuộc tính.", 'info');
    }, [character, onUpdateCharacterData, addToast]);

    const handleStartEdit = useCallback((id: string, field: 'name' | 'value', currentValue: any) => {
        setEditingStat({ id, field });
        setEditValue(currentValue);
    }, []);

    const handleSaveEdit = useCallback(() => {
        if (!editingStat || !character) return;
        const updatedStats = (character.stats || []).map(s => {
            if (s.id !== editingStat.id) {
                return s;
            }
    
            const updatedStat = { ...s };
    
            if (editingStat.field === 'name') {
                updatedStat.name = String(editValue);
            } else if (editingStat.field === 'value') {
                const originalStat = s;
                let finalValue: string | number = editValue;
                if (typeof originalStat.value === 'number') {
                    const parsed = parseFloat(String(editValue));
                    finalValue = isNaN(parsed) ? 0 : parsed;
                } else if (typeof originalStat.value === 'string' && originalStat.value.includes('/')) {
                    const [currentStr, maxStr] = String(editValue).split('/');
                    const current = parseInt(currentStr, 10);
                    const max = parseInt(maxStr, 10);
                    const [, oldMaxStr] = originalStat.value.split('/');

                    if (!isNaN(current) && !isNaN(max)) {
                        finalValue = `${current}/${max}`;
                    } else if (!isNaN(current)) {
                        finalValue = `${current}/${oldMaxStr || '100'}`;
                    } else {
                        finalValue = originalStat.value;
                    }
                }
                 updatedStat.value = finalValue;
            }
            return updatedStat;
        });
        onUpdateCharacterData(character.id, { stats: updatedStats });
        setEditingStat(null);
    }, [editingStat, editValue, character, onUpdateCharacterData]);
    
    const handleStatUpdate = useCallback((statId: string, newValue: string | number) => {
        if (!character) return;
        const updatedStats = character.stats.map(s => {
            if (s.id === statId) {
                const originalStat = character.stats.find(os => os.id === statId);
                let finalValue: string | number = newValue;
                // Attempt to preserve original data type
                if (originalStat && typeof originalStat.value === 'number') {
                    const parsed = parseFloat(String(newValue));
                    finalValue = isNaN(parsed) ? 0 : parsed;
                } else if (originalStat && typeof originalStat.value === 'string' && originalStat.value.includes('/')) {
                    // Handle "current/max" format
                    const [currentStr, maxStr] = String(newValue).split('/');
                    const current = parseInt(currentStr, 10);
                    const max = parseInt(maxStr, 10);
                    if (!isNaN(current) && !isNaN(max)) {
                        finalValue = `${current}/${max}`;
                    } else if (!isNaN(current)) {
                        // If user only enters one number for a current/max stat, assume they mean the current value
                        const [, oldMaxStr] = originalStat.value.split('/');
                        finalValue = `${current}/${oldMaxStr}`;
                    } else {
                        finalValue = originalStat.value; // Revert if invalid
                    }
                }
                return { ...s, value: finalValue };
            }
            return s;
        });
        onUpdateCharacterData(character.id, { stats: updatedStats });
    }, [character, onUpdateCharacterData]);

    // --- END OF LOGIC MOVED FROM useInfoTabManager ---

    const handleOpenTraitPicker = useCallback(() => setIsTraitPickerOpen(true), []);
    const handleCloseTraitPicker = useCallback(() => setIsTraitPickerOpen(false), []);

    const handleAddTrait = useCallback((trait: PersonalityTrait) => {
        if (!character) return;
        const currentTraits = character.personality || [];
        if (currentTraits.some(t => t.id === trait.id)) {
            addToast(`Nhân vật đã có tính cách "${trait.name}".`, 'warning');
            return;
        }
        onUpdateCharacterData(character.id, { personality: [...currentTraits, trait] });
    }, [character, onUpdateCharacterData, addToast]);

    const handleRemoveTrait = useCallback((traitId: string) => {
        if (!character) return;
        const updatedTraits = (character.personality || []).filter(t => t.id !== traitId);
        onUpdateCharacterData(character.id, { personality: updatedTraits });
    }, [character, onUpdateCharacterData]);

    useEffect(() => {
        if (character) {
            if (character.npcType === 'unnamed_monster' && (activeTab === 'goals' || activeTab === 'memories')) {
                setActiveTab('info');
            }
        }
    }, [character, activeTab]);

    const handleOpenPicker = (slot: EquipmentSlot) => setPickerSlot(slot);
    const handleClosePicker = () => setPickerSlot(null);

    const handleEquipItem = (itemToEquip: Stat, targetSlot: EquipmentSlot) => {
        if (!character) return;
    
        const newEquipment = { ...(character.equipment || {}) };
        const isTwoHanded = itemToEquip.tags?.includes(ITEM_TAGS.EQUIPMENT_TYPE.TWO_HANDED);
        const isHandSlot = targetSlot === RIGHT_HAND_SLOT || targetSlot === LEFT_HAND_SLOT;
    
        if (!isTwoHanded && isHandSlot) {
            const otherHandSlot = targetSlot === RIGHT_HAND_SLOT ? LEFT_HAND_SLOT : RIGHT_HAND_SLOT;
            const itemInOtherHandId = newEquipment[otherHandSlot];
            if (itemInOtherHandId) {
                const itemInOtherHand = character.stats.find(s => s.id === itemInOtherHandId);
                if (itemInOtherHand?.tags?.includes(ITEM_TAGS.EQUIPMENT_TYPE.TWO_HANDED)) {
                    addToast(`Đã tự động tháo: ${itemInOtherHand.name}.`, 'info');
                    newEquipment[RIGHT_HAND_SLOT] = undefined;
                    newEquipment[LEFT_HAND_SLOT] = undefined;
                }
            }
        }
    
        if (isTwoHanded && isHandSlot) {
            const itemInMainHandId = newEquipment[RIGHT_HAND_SLOT];
            const itemInOffHandId = newEquipment[LEFT_HAND_SLOT];
            
            if (itemInMainHandId) addToast(`Đã tháo: ${character.stats.find(s=>s.id === itemInMainHandId)?.name}.`, 'info');
            if (itemInOffHandId && itemInOffHandId !== itemInMainHandId) addToast(`Đã tháo: ${character.stats.find(s=>s.id === itemInOffHandId)?.name}.`, 'info');
    
            newEquipment[RIGHT_HAND_SLOT] = itemToEquip.id;
            newEquipment[LEFT_HAND_SLOT] = itemToEquip.id;
        } else {
            const currentlyEquippedId = newEquipment[targetSlot];
            if (currentlyEquippedId) {
                const itemInSlot = character.stats.find(s => s.id === currentlyEquippedId);
                if (itemInSlot) {
                     if (itemInSlot.tags?.includes(ITEM_TAGS.EQUIPMENT_TYPE.TWO_HANDED)) {
                        const otherHandSlot = targetSlot === RIGHT_HAND_SLOT ? LEFT_HAND_SLOT : RIGHT_HAND_SLOT;
                        newEquipment[otherHandSlot] = undefined;
                    }
                    addToast(`Đã tháo: ${itemInSlot.name}.`, 'info');
                }
            }
            newEquipment[targetSlot] = itemToEquip.id;
        }
    
        onUpdateCharacterData(character.id, { equipment: newEquipment });
        handleClosePicker();
        addToast(`Đã trang bị ${itemToEquip.name}.`, 'success');
    };

    const handleUnequipItem = (slotToUnequip: EquipmentSlot) => {
        if (!character) {
            handleClosePicker();
            return;
        }
    
        const newEquipment = { ...(character.equipment || {}) };
        const itemToUnequipId = newEquipment[slotToUnequip];
    
        if (!itemToUnequipId) {
            handleClosePicker();
            return;
        }
        
        const itemToUnequip = character.stats.find(s => s.id === itemToUnequipId);
        
        if (!itemToUnequip) {
            newEquipment[slotToUnequip] = undefined;
            onUpdateCharacterData(character.id, { equipment: newEquipment });
            handleClosePicker();
            addToast(`Đã tháo vật phẩm không xác định.`, 'warning');
            return;
        }
    
        const isTwoHanded = itemToUnequip.tags?.includes(ITEM_TAGS.EQUIPMENT_TYPE.TWO_HANDED);
    
        if (isTwoHanded && (slotToUnequip === RIGHT_HAND_SLOT || slotToUnequip === LEFT_HAND_SLOT)) {
            newEquipment[RIGHT_HAND_SLOT] = undefined;
            newEquipment[LEFT_HAND_SLOT] = undefined;
        } else {
            newEquipment[slotToUnequip] = undefined;
        }
    
        onUpdateCharacterData(character.id, { equipment: newEquipment });
        handleClosePicker();
        addToast(`Đã tháo ${itemToUnequip.name}.`, 'success');
    };

    const handleSetEquippedTitle = (titleIdToEquip: string) => {
        if (!character) return;
        const newStats = character.stats.map(stat => {
            if (stat.category === 'Danh Hiệu') {
                return { ...stat, isEquipped: stat.id === titleIdToEquip };
            }
            return stat;
        });
        onUpdateCharacterData(character.id, { stats: newStats });
        addToast("Đã cập nhật danh hiệu hiển thị.", "success");
    };

    const handleStatusMouseEnter = (event: React.MouseEvent, status: Stat) => {
        if (isMobile || !gameState || !status || !character) return;

        setActiveTooltip({
            name: status.name,
            type: 'Trạng Thái',
            position: { top: event.clientY + 20, left: event.clientX },
            variant: 'default',
            statId: status.id,
        });
    };

    const handleStatusMouseLeave = () => setActiveTooltip(null);
    
    const handleStatusClick = useCallback((event: React.MouseEvent, status: Stat) => {
        if (isMobile) return;
        if (activeTooltip && activeTooltip.statId === status.id) {
            setActiveTooltip(null);
        } else {
            handleStatusMouseEnter(event, status);
        }
    }, [activeTooltip, handleStatusMouseEnter, isMobile]);

    const handleStatusDoubleClick = useCallback((event: React.MouseEvent, status: Stat) => {
        event.stopPropagation();
        if (!isMobile) return;

        if (activeTooltip && activeTooltip.statId === status.id) {
            setActiveTooltip(null);
        } else {
            setActiveTooltip({
                name: status.name,
                type: 'Trạng Thái',
                position: { top: event.clientY + 20, left: event.clientX },
                variant: 'default',
                statId: status.id,
            });
        }
    }, [isMobile, activeTooltip]);

    const deathStat = useMemo(() => character?.stats?.find(s => s.name === 'Trạng thái Tử vong'), [character?.stats]);
    const isDead = !!deathStat;

    const activeTitle = useMemo(() => {
        if (!character?.stats) return undefined;
        return character.stats.find(s => s.category === 'Danh Hiệu' && s.isEquipped) || character.stats.find(s => s.category === 'Danh Hiệu');
    }, [character?.stats]);
    
    return {
        worldSettings,
        activeTab,
        setActiveTab,
        pickerSlot,
        handleOpenPicker,
        handleClosePicker,
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
    };
};
