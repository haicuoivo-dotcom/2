/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { AvatarEditModal } from '../../modals/AvatarEditModal';
import { NoInfoPlaceholder } from '../../ui/NoInfoPlaceholder';
import { getStatusStyleClass } from '../../../utils/game';
import { INFO_TAB_INFO_STATS, INFO_TAB_COMBAT_STATS, INFO_TAB_SOCIAL_STATS, TU_TIEN_RANKS, VO_LAM_RANKS, FANTASY_ADVENTURER_RANKS, DEFAULT_REPUTATION_RANKS } from '../../../constants/statConstants';
import { StatBlock } from './StatBlock';
import { PencilIcon } from '../../ui/Icons';
// FIX: The hook was removed, logic is now passed via props. The constant is defined locally.
import { StatusEditorForm } from './info-tab/StatusEditorForm';
import { AttributeEditorForm } from './info-tab/AttributeEditorForm';
import { SupplementReportModal } from '../../modals/SupplementReportModal';
import type { Character, Stat, AppSettings, SupplementReport, EffectiveStat } from '../../../types';
import { useWorldData } from '../../contexts/GameContext';

// FIX: This constant was previously imported from a non-existent file.
// It's defined here as it's only used to initialize the "add status" form state within this component.
export const initialNewStatusData: Partial<Stat> = {
    category: 'Trạng thái',
    isPermanent: false,
    durationMinutes: 60,
    effects: [],
};

interface InfoTabProps {
    character: Character;
    onEntityClick: (event: React.MouseEvent, name: string, type: string) => void;
    onUpdateCharacterData: (characterId: string, updates: Partial<Character>) => void;
    // FIX: Add missing props for toast and API count to be passed down.
    addToast: (message: string, type?: 'info' | 'success' | 'error' | 'warning', details?: any) => void;
    incrementApiRequestCount: () => void;
    enableCheats: boolean;
    onStatusMouseEnter: (event: React.MouseEvent, status: Stat) => void;
    onStatusMouseLeave: () => void;
    handleStatusClick: (event: React.MouseEvent, status: Stat) => void;
    handleStatusDoubleClick: (event: React.MouseEvent, status: Stat) => void;
    isMobile: boolean;
    isDead: boolean;
    deathStat?: Stat;
    isPlayerCharacter: boolean;
    settings: AppSettings;
    supplementSingleCharacter: (character: Character) => Promise<SupplementReport | null>;
    // Props that were previously managed by useCharacterDetailManager
    statusFormState: { mode: 'add' | 'edit'; data: Partial<Stat> } | null;
    setStatusFormState: React.Dispatch<React.SetStateAction<{ mode: 'add' | 'edit'; data: Partial<Stat> } | null>>;
    highlightedLinks: { stats: Set<string>; statuses: Set<string> };
    previewStats: Map<string, EffectiveStat> | null;
    effectiveStats: Map<string, EffectiveStat>;
    combatPower: number;
    temporaryStatuses: Stat[];
    permanentStatuses: Stat[];
    activeSetBonuses: { setName: string; bonus: any }[];
    allAttributes: Stat[];
    handleStatusHoverStart: (status: Stat) => void;
    handleStatHoverStart: (statName: string) => void;
    handleHoverEnd: () => void;
    handleSaveStatus: () => void;
    handleDeleteStatus: (statusId: string) => void;
    handleStatUpdate: (statId: string, newValue: string | number) => void;
    // FIX: Add missing props for attribute editing.
    handleDeleteAttribute: (statId: string) => void;
    editingStat: { id: string, field: 'name' | 'value' } | null;
    editValue: string | number;
    setEditValue: React.Dispatch<React.SetStateAction<string | number>>;
    handleStartEdit: (id: string, field: 'name' | 'value', currentValue: any) => void;
    handleSaveEdit: () => void;
    setEditingStat: React.Dispatch<React.SetStateAction<{ id: string, field: 'name' | 'value' } | null>>;
}

export const InfoTab = (props: InfoTabProps) => {
    // FIX: Destructure all props, removing the call to the non-existent useInfoTabManager hook.
    const { 
        character, onUpdateCharacterData, addToast, incrementApiRequestCount, enableCheats, onStatusMouseEnter, onStatusMouseLeave, 
        handleStatusClick, handleStatusDoubleClick, isMobile, isDead, deathStat, isPlayerCharacter, settings, supplementSingleCharacter,
        statusFormState, setStatusFormState, highlightedLinks, previewStats, effectiveStats,
        combatPower, temporaryStatuses, permanentStatuses, activeSetBonuses, allAttributes,
        handleStatusHoverStart, handleStatHoverStart, handleHoverEnd, handleSaveStatus,
        handleDeleteStatus, handleStatUpdate, handleDeleteAttribute, editingStat, editValue, setEditValue, handleStartEdit, handleSaveEdit, setEditingStat
    } = props;

    const worldData = useWorldData();
    
    const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
    const [activeStatusTab, setActiveStatusTab] = useState<'temporary' | 'permanent'>('temporary');

    const [isSupplementing, setIsSupplementing] = useState(false);
    const [supplementTime, setSupplementTime] = useState(0);
    const [supplementReport, setSupplementReport] = useState<SupplementReport | null>(null);
    const supplementTimerRef = useRef<number | null>(null);
    
    const { infoStatNames, combatStatNames } = useMemo(() => {
        if (!worldData?.worldSettings) {
            return { 
                infoStatNames: INFO_TAB_INFO_STATS, 
                combatStatNames: INFO_TAB_COMBAT_STATS 
            };
        }
    
        const genre = worldData.worldSettings.genre;
        const modernGenres = ['Đô Thị Hiện Đại', 'Đô Thị Hiện Đại 100% bình thường', 'Đô Thị Dị Biến', 'Hậu Tận Thế'];
        let info = [...INFO_TAB_INFO_STATS];
        let combat = [...INFO_TAB_COMBAT_STATS];
    
        if (modernGenres.includes(genre)) {
            info = info.filter(stat => !['Chủng tộc', 'Cấp bậc', 'Cảnh giới', 'Võ học'].includes(stat));
            combat = combat.filter(stat => !['Mana', 'Linh Lực', 'Nội Lực', 'Thọ Nguyên', 'Căn Cốt', 'Ngộ Tính', 'Thần Hồn'].includes(stat));
        } else if (['Dị Giới Fantasy', 'Thế Giới Giả Tưởng (Game/Tiểu Thuyết)'].includes(genre)) {
             info = info.filter(stat => !['Cảnh giới', 'Võ học'].includes(stat));
             combat = combat.filter(stat => !['Linh Lực', 'Nội Lực', 'Thọ Nguyên', 'Căn Cốt', 'Ngộ Tính', 'Thần Hồn'].includes(stat));
        } else if (['Tu Tiên', 'Huyền Huyễn Truyền Thuyết'].includes(genre)) {
             info = info.filter(stat => !['Cấp bậc', 'Võ học', 'Cấp Độ', 'Kinh Nghiệm'].includes(stat));
             combat = combat.filter(stat => !['Mana', 'Nội Lực', 'Sức mạnh', 'Nhanh nhẹn', 'Thể chất', 'Trí tuệ', 'Tinh thần', 'Tấn Công', 'Phòng Thủ'].includes(stat));
        } else if (['Võ Lâm', 'Thời Chiến (Trung Hoa/Nhật Bản)'].includes(genre)) {
            info = info.filter(stat => !['Cấp bậc', 'Cảnh giới', 'Cấp Độ', 'Kinh Nghiệm'].includes(stat));
            combat = combat.filter(stat => !['Mana', 'Linh Lực', 'Thọ Nguyên', 'Thể chất', 'Trí tuệ', 'Tinh thần', 'Thần Hồn'].includes(stat));
        }

        // Loại bỏ các chỉ số không còn sử dụng
        combat = combat.filter(stat => !['Độ no', 'Năng lượng'].includes(stat));
    
        return { 
            infoStatNames: info, 
            combatStatNames: combat 
        };
    }, [worldData?.worldSettings]);

    useEffect(() => {
        if (isSupplementing) {
            setSupplementTime(0);
            supplementTimerRef.current = window.setInterval(() => {
                setSupplementTime(prev => prev + 1);
            }, 1000);
        } else {
            if (supplementTimerRef.current) clearInterval(supplementTimerRef.current);
        }
        return () => {
            if (supplementTimerRef.current) clearInterval(supplementTimerRef.current);
        };
    }, [isSupplementing]);


    useEffect(() => {
        if (temporaryStatuses.length > 0) {
            setActiveStatusTab('temporary');
        } else if (permanentStatuses.length > 0) {
            setActiveStatusTab('permanent');
        }
    }, [temporaryStatuses.length, permanentStatuses.length]);

    const handleAvatarChange = (newUrl: string) => {
        if (character) {
            onUpdateCharacterData(character.id, { avatarUrl: newUrl });
            addToast("Đã cập nhật ảnh đại diện.", "success");
        }
        setIsAvatarModalOpen(false);
    };
    
    const handleSupplementClick = async () => {
        setIsSupplementing(true);
        const report = await supplementSingleCharacter(character);
        if (supplementTimerRef.current) clearInterval(supplementTimerRef.current);
        if (report) {
            setSupplementReport(report);
        } else {
            setIsSupplementing(false); // Reset if it failed
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    };

    const characterInitial = (character.displayName || character.name).charAt(0).toUpperCase();

    const rankOptionsMap: Record<string, string[]> = {
        'Cảnh giới': TU_TIEN_RANKS,
        'Võ học': VO_LAM_RANKS,
        'Cấp bậc': FANTASY_ADVENTURER_RANKS,
        'Danh Vọng': DEFAULT_REPUTATION_RANKS,
    };
    
    const statusesToDisplay = activeStatusTab === 'temporary' ? temporaryStatuses : permanentStatuses;

    return (
        <>
            {isAvatarModalOpen && character && <AvatarEditModal character={character} onClose={() => setIsAvatarModalOpen(false)} onSave={handleAvatarChange} addToast={addToast} incrementApiRequestCount={incrementApiRequestCount} />}
            {supplementReport && (
                <SupplementReportModal
                    report={supplementReport}
                    onClose={() => {
                        setSupplementReport(null);
                        setIsSupplementing(false);
                    }}
                />
            )}
            <div className="info-tab-grid">
                <div className="info-tab-left">
                    <div className="char-avatar-wrapper" onClick={() => setIsAvatarModalOpen(true)} title="Chỉnh sửa ảnh đại diện">
                        {character.avatarUrl 
                            ? <img src={character.avatarUrl} alt={`Avatar of ${character.displayName}`} className="char-avatar-image" /> 
                            : <div className="char-avatar-placeholder"><span>{characterInitial}</span></div>
                        }
                        <div className="char-avatar-edit-overlay">Chỉnh sửa</div>
                    </div>
                </div>
                <div className="info-tab-right">
                    {isDead && deathStat && (
                        <div className="death-notice">
                            <h3>ĐÃ MẤT</h3>
                            <p>{deathStat.description}</p>
                        </div>
                    )}

                    <div className="char-detail-section no-frame">
                        <h4 className="section-title-bar">Thông Tin Cơ Bản</h4>
                        <StatBlock
                            title=""
                            statNames={infoStatNames}
                            character={character}
                            effectiveStats={effectiveStats}
                            previewStats={previewStats}
                            isPlayerCharacter={isPlayerCharacter}
                            highlightedStatNames={highlightedLinks.stats}
                            onStatHoverStart={handleStatHoverStart}
                            onStatHoverEnd={handleHoverEnd}
                            enableCheats={enableCheats}
                            handleStatUpdate={handleStatUpdate}
                        />
                    </div>
                    {!isPlayerCharacter && 
                        <StatBlock 
                            title="Chỉ số Xã hội & Tình Cảm" 
                            statNames={INFO_TAB_SOCIAL_STATS} 
                            character={character} 
                            effectiveStats={effectiveStats} 
                            previewStats={previewStats} 
                            isPlayerCharacter={isPlayerCharacter} 
                            highlightedStatNames={highlightedLinks.stats} 
                            onStatHoverStart={handleStatHoverStart} 
                            onStatHoverEnd={handleHoverEnd}
                            enableCheats={enableCheats}
                            handleStatUpdate={handleStatUpdate}
                        />}
                    
                    <div className="char-detail-section">
                        <h4 className="section-title-bar">Chỉ số Chiến đấu & Sinh tồn</h4>
                        <div className="data-list">
                            <div className="stat-line-container" title="Tổng hợp sức mạnh chiến đấu của nhân vật, được tính toán từ các chỉ số gốc.">
                                <div className="stat-line">
                                    <span>Lực Chiến</span>
                                    <div className="stat-value-container">
                                        <span style={{color: 'var(--accent-warning)', fontWeight: 600}}>⚡️ {combatPower.toLocaleString('vi-VN')}</span>
                                    </div>
                                </div>
                            </div>
                            <StatBlock 
                                title=""
                                statNames={combatStatNames} 
                                character={character} 
                                effectiveStats={effectiveStats} 
                                previewStats={previewStats} 
                                isPlayerCharacter={isPlayerCharacter} 
                                highlightedStatNames={highlightedLinks.stats} 
                                onStatHoverStart={handleStatHoverStart} 
                                onStatHoverEnd={handleHoverEnd}
                                enableCheats={enableCheats}
                                handleStatUpdate={handleStatUpdate}
                            />
                        </div>
                    </div>
                
                    {activeSetBonuses.length > 0 && (
                        <div className="char-detail-section">
                            <h4 className="section-title-bar">Hiệu ứng Set</h4>
                            <div className="data-list set-bonus-list">
                                {activeSetBonuses.map(({ setName, bonus }) => (
                                    <div key={`${setName}-${bonus.count}`} className="set-bonus-item">
                                        <span className="set-bonus-name">Set {setName} ({bonus.count} món)</span>
                                        <span className="set-bonus-desc">{bonus.description}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {(temporaryStatuses.length > 0 || permanentStatuses.length > 0 || enableCheats) && (
                        <div className="char-detail-section">
                            <h4 className="section-title-bar">Trạng thái</h4>
                            {(temporaryStatuses.length > 0 || permanentStatuses.length > 0) && (
                                <div className="status-tabs">
                                    {temporaryStatuses.length > 0 && (
                                        <button 
                                            className={`status-tab-button ${activeStatusTab === 'temporary' ? 'active' : ''}`}
                                            onClick={() => setActiveStatusTab('temporary')}
                                        >
                                            Tạm Thời ({temporaryStatuses.length})
                                        </button>
                                    )}
                                    {permanentStatuses.length > 0 && (
                                        <button 
                                            className={`status-tab-button ${activeStatusTab === 'permanent' ? 'active' : ''}`}
                                            onClick={() => setActiveStatusTab('permanent')}
                                        >
                                            Vĩnh Viễn ({permanentStatuses.length})
                                        </button>
                                    )}
                                </div>
                            )}
                            <div className="statuses-list">
                                {statusesToDisplay.map(status => {
                                    const statusClass = getStatusStyleClass(status);
                                    const isHighlighted = highlightedLinks.statuses.has(status.id!);
                                    const eventHandlers = isMobile
                                        ? { onDoubleClick: (e: React.MouseEvent) => { e.stopPropagation(); handleStatusDoubleClick(e, status); } }
                                        : { 
                                            onMouseEnter: (e: React.MouseEvent) => { onStatusMouseEnter(e, status); handleStatusHoverStart(status); }, 
                                            onMouseLeave: () => { onStatusMouseLeave(); handleHoverEnd(); },
                                            onClick: (e: React.MouseEvent) => { e.stopPropagation(); handleStatusClick(e, status); }
                                          };
                                    const cleanStatusName = status.name.replace(/^Trạng thái\s?/, '');
                                    return (
                                        <div key={status.id} className={`status-badge ${statusClass} ${isHighlighted ? 'highlighted' : ''}`} {...eventHandlers}>
                                            <span>{cleanStatusName}{typeof status.value === 'number' && status.value > 1 ? ` (x${status.value})` : ''}</span>
                                            {enableCheats && (
                                                <div className="status-actions">
                                                    <button className="status-edit-button" onClick={(e) => { e.stopPropagation(); setStatusFormState({ mode: 'edit', data: status }); }} title={`Sửa ${cleanStatusName}`}><PencilIcon /></button>
                                                    <button className="status-delete-button" onClick={() => handleDeleteStatus(status.id!)} title={`Xóa ${cleanStatusName}`}>×</button>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                                {enableCheats && (
                                    <button className="add-status-button" onClick={() => setStatusFormState({ mode: 'add', data: initialNewStatusData })}>
                                        +
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                    {enableCheats && (
                        <div className="char-detail-section">
                            <h4 className="section-title-bar">Công cụ AI</h4>
                            <button
                                className="add-stat-button"
                                onClick={handleSupplementClick}
                                disabled={isSupplementing}
                                title="Chi phí: ~1 API call. AI sẽ rà soát tiểu sử và mô tả của CHỈ NHÂN VẬT NÀY để tự động bổ sung các vật phẩm hoặc mối quan hệ còn thiếu, đảm bảo tính nhất quán."
                            >
                                {isSupplementing ? (
                                    <>
                                        <span className="spinner spinner-sm"></span>
                                        Đang bổ sung... ({formatTime(supplementTime)})
                                    </>
                                ) : (
                                    'Bổ sung Vật phẩm & Quan hệ (AI)'
                                )}
                            </button>
                        </div>
                    )}
                    {enableCheats && (
                        <div className="char-detail-section">
                            <h4 className="section-title-bar">Quản lý Trạng thái</h4>
                            {statusFormState ? (
                                <StatusEditorForm formState={statusFormState} setFormState={setStatusFormState} onSave={handleSaveStatus} />
                            ) : (
                                <p className="field-hint">Nhấp vào biểu tượng bút chì trên một trạng thái để chỉnh sửa, hoặc dấu '+' ở cuối danh sách để thêm mới.</p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};