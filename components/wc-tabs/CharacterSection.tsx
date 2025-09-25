/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { FormField } from '../ui/FormField';
import { generateUniqueId } from '../../utils/id';
import { getCurrencyName } from '../../utils/game';
import { GENRE_CORE_STATS, PERSONALITY_TRAITS, GENRE_RELATIONSHIP_MAP, CURRENCY_UNITS, BASE_SKILL_TEMPLATES } from '../../constants/gameConstants';
import { ITEM_SLOT_TYPES } from '../../constants/statConstants';
import { BASE_ITEM_TEMPLATES } from '../../constants/items';
import type { WorldSettings, Stat, InitialRelationship } from '../../types';
import { ToggleSwitch } from '../ui/ToggleSwitch';
import { AttributeEditorForm } from '../game/character-tabs/info-tab/AttributeEditorForm';

interface CharacterSectionProps {
    formData: WorldSettings;
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
    setFormData: React.Dispatch<React.SetStateAction<WorldSettings>>;
    setError: React.Dispatch<React.SetStateAction<string | null>>;
    isGeneratingChar: boolean;
    isAiBusy: boolean;
    handleSuggestCharacter: () => void;
    fanficCharOption: 'main' | 'new';
    charSuggestionTime: number;
    formatTime: (seconds: number) => string;
}

const CoreAttributeEditor = ({ attribute, onChange, onDelete }: { attribute: Stat, onChange: (id: string, field: 'name' | 'value' | 'description', value: string | number) => void, onDelete: (id: string) => void }) => {
    return (
        <div className="core-attribute-item editable" title={attribute.description}>
            <input
                className="editable-attr-name"
                value={attribute.name}
                onChange={(e) => onChange(attribute.id!, 'name', e.target.value)}
                placeholder="Tên Thuộc tính"
            />
             <input
                className="editable-attr-value"
                type={typeof attribute.value === 'number' ? 'number' : 'text'}
                value={attribute.value as string | number}
                onChange={(e) => onChange(attribute.id!, 'value', e.target.value)}
                placeholder="Giá trị"
            />
            <button className="skill-delete-button" onClick={() => onDelete(attribute.id!)} aria-label={`Xóa ${attribute.name}`}>×</button>
        </div>
    );
};


export const CharacterSection = ({
    formData,
    handleInputChange,
    setFormData,
    setError,
    isGeneratingChar,
    isAiBusy,
    handleSuggestCharacter,
    fanficCharOption,
    charSuggestionTime,
    formatTime,
}: CharacterSectionProps) => {
    const [newStat, setNewStat] = useState<Partial<Stat>>({ category: 'Kỹ Năng' });
    const [isAddingStat, setIsAddingStat] = useState(false);
    const [isAddingRelationship, setIsAddingRelationship] = useState(false);
    const [newRelationship, setNewRelationship] = useState<Omit<InitialRelationship, 'id'>>({
        npcDescription: '',
        relationshipType: 'Bạn bè',
        affinity: 50,
    });
    const [templateList, setTemplateList] = useState<{ label: string, value: string }[]>([]);
    const [customCurrencyName, setCustomCurrencyName] = useState('');
    const prevGenreAndSetting = useRef({ genre: formData.genre, setting: formData.setting });
    
    const [activeCoreStatTab, setActiveCoreStatTab] = useState('Tùy Chỉnh');
    const [isAddingAttribute, setIsAddingAttribute] = useState(false);
    const [newAttribute, setNewAttribute] = useState<Partial<Stat>>({ category: 'Thuộc tính', name: '', value: 10, description: '' });

    const isIdeaDriven = (formData.templateIdea || formData.idea).trim() !== '';
    const isGenreEmptyAndIdeaMissing = formData.genre === 'Trống' && !isIdeaDriven;
    
    const assetStat = useMemo(() => formData.stats.find(s => s.category === 'Tài sản'), [formData.stats]);
    
    const isCustomCurrency = useMemo(() => assetStat && !CURRENCY_UNITS.includes(assetStat.name), [assetStat]);
    const dropdownCurrencyValue = isCustomCurrency ? 'Tùy chỉnh...' : (assetStat?.name || '');

    useEffect(() => {
        if (isCustomCurrency) {
            setCustomCurrencyName(assetStat?.name || '');
        }
    }, [isCustomCurrency, assetStat?.name]);
    
    useEffect(() => {
        const genreOrSettingChanged = prevGenreAndSetting.current.genre !== formData.genre || prevGenreAndSetting.current.setting !== formData.setting;
        const expectedCurrencyName = getCurrencyName(formData.genre, formData.setting);
        const currentAssetStat = formData.stats.find(s => s.category === 'Tài sản');
    
        let shouldUpdateState = false;
        let newStats = [...formData.stats];
    
        if (!currentAssetStat) {
            // If asset stat doesn't exist, create it.
            newStats.push({
                id: generateUniqueId('stat-asset-default'),
                name: expectedCurrencyName,
                category: 'Tài sản',
                value: 1000,
                description: `Tiền tệ chính của thế giới: ${expectedCurrencyName}`
            });
            shouldUpdateState = true;
        } else {
            // It exists. Only update it if the genre/setting changed AND the current one is not a custom user-defined currency.
            const isStandardCurrency = CURRENCY_UNITS.includes(currentAssetStat.name);
            if (genreOrSettingChanged && isStandardCurrency) {
                const assetStatIndex = newStats.findIndex(s => s.id === currentAssetStat.id);
                if (assetStatIndex > -1) {
                    newStats[assetStatIndex] = { ...currentAssetStat, name: expectedCurrencyName };
                    shouldUpdateState = true;
                }
            }
        }
    
        if (shouldUpdateState) {
            setFormData(prev => ({ ...prev, stats: newStats }));
        }
    
        // Update ref for next render after checking for changes.
        prevGenreAndSetting.current = { genre: formData.genre, setting: formData.setting };
    
    }, [formData.genre, formData.setting, formData.stats, setFormData]);

    const handleAssetChange = (field: 'name' | 'value', value: string | number) => {
        setFormData(prev => {
            const stats = prev.stats || [];
            const assetStatIndex = stats.findIndex(s => s.category === 'Tài sản');
            
            if (assetStatIndex > -1) {
                const newStats = [...stats];
                newStats[assetStatIndex] = { ...newStats[assetStatIndex], [field]: value };
                return { ...prev, stats: newStats };
            }
            return prev;
        });
    };
    
    const handleCurrencyTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        if (value !== 'Tùy chỉnh...') {
            handleAssetChange('name', value);
        } else {
            handleAssetChange('name', customCurrencyName || (assetStat?.name || ''));
        }
    };

    const handleCustomCurrencyInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setCustomCurrencyName(value);
        handleAssetChange('name', value);
    };

    const groupedCreationCategories = useMemo(() => {
        const groups: Record<string, {value: string; label: string}[]> = {
            'Loại': [
                { value: 'Kỹ Năng', label: 'Kỹ Năng' },
                { value: 'Vật phẩm', label: 'Vật phẩm' },
            ]
        };
        return groups;
    }, []);
    
    useEffect(() => {
        const allAvailableValues = Object.values(groupedCreationCategories).flat().map(opt => opt.value);
        if (newStat.category && !allAvailableValues.includes(newStat.category)) {
            setNewStat(p => ({ ...p, category: 'Kỹ Năng' }));
        }
    }, [groupedCreationCategories, newStat.category]);


    const { coreAttributes, otherStatsGrouped } = useMemo(() => {
        const coreAttributes = (formData.stats || []).filter(s => s.category === 'Thuộc tính');
        const otherStats = (formData.stats || []).filter(s => s.category !== 'Thuộc tính' && s.category !== 'Nguyên liệu' && s.category !== 'Tài sản');
        
        const groups: { [key: string]: Stat[] } = {};
        otherStats.forEach(stat => {
            if (!groups[stat.category]) {
                groups[stat.category] = [];
            }
            groups[stat.category].push(stat);
        });
        return { coreAttributes, otherStatsGrouped: groups };
    }, [formData.stats]);

    const coreStatTabs = ['Tu Tiên', 'Võ Lâm', 'Dị Giới Fantasy', 'Hiện Đại', 'Mặc định', 'Tùy Chỉnh'];
    
    const calculateInitialMoney = (backstory: string): number => {
        // Nhân vật giàu có (quý tộc, thương nhân lớn, etc) - từ 5000 đến 50000
        const richKeywords = ['quý tộc', 'hoàng tử', 'công chúa', 'thương nhân', 'thiếu gia', 'tiểu thư', 'giàu có'];
        const richRegex = new RegExp(richKeywords.join('|'), 'i');
        if (richRegex.test(backstory)) {
            return Math.floor(Math.random() * 45000) + 5000;
        }

        // Nhân vật trung lưu - từ 1000 đến 5000
        const middleClassKeywords = ['thợ thủ công', 'nông dân', 'thương nhân nhỏ', 'lái buôn', 'thầy thuốc'];
        const middleClassRegex = new RegExp(middleClassKeywords.join('|'), 'i');
        if (middleClassRegex.test(backstory)) {
            return Math.floor(Math.random() * 4000) + 1000;
        }

        // Nhân vật nghèo - từ 100 đến 1000
        const poorKeywords = ['ăn xin', 'nô lệ', 'tù nhân', 'dân đen', 'nghèo'];
        const poorRegex = new RegExp(poorKeywords.join('|'), 'i');
        if (poorRegex.test(backstory)) {
            return Math.floor(Math.random() * 900) + 100;
        }

        // Mặc định - từ 500 đến 2000
        return Math.floor(Math.random() * 1500) + 500;
    };

    const handleCoreStatTabClick = (tabName: string) => {
        if (tabName === 'Tùy Chỉnh') {
            setActiveCoreStatTab('Tùy Chỉnh');
            return;
        }
        
        const newCoreStatsTemplate = GENRE_CORE_STATS[tabName] || GENRE_CORE_STATS.Default;
        setFormData(prev => {
            const nonAttributeStats = (prev.stats || []).filter(s => s.category !== 'Thuộc tính');
            const moneyStats = (prev.stats || []).find(s => s.category === 'Tài sản');

            // Nếu có backstory, tính tiền dựa trên backstory
            if (prev.backstory) {
                const initialMoney = calculateInitialMoney(prev.backstory);
                if (moneyStats) {
                    // Cập nhật số tiền cho asset hiện tại
                    const updatedMoneyStats = { ...moneyStats, value: initialMoney };
                    return {
                        ...prev,
                        stats: [...newCoreStatsTemplate, ...nonAttributeStats.filter(s => s.id !== moneyStats.id), updatedMoneyStats]
                    };
                } else {
                    // Tạo asset mới với số tiền tính được
                    const newMoneyStats: Stat = {
                        id: generateUniqueId('stat-money'),
                        name: getCurrencyName(prev.genre, prev.setting),
                        value: initialMoney,
                        category: 'Tài sản',
                        description: `Tiền tệ chính của thế giới: ${getCurrencyName(prev.genre, prev.setting)}`
                    };
                    return {
                        ...prev,
                        stats: [...newCoreStatsTemplate, ...nonAttributeStats, newMoneyStats]
                    };
                }
            }

            return {
                ...prev,
                stats: [...newCoreStatsTemplate, ...nonAttributeStats]
            };
        });
        setActiveCoreStatTab('Tùy Chỉnh');
    };

    const handleAttributeChange = (statId: string, field: 'name' | 'value' | 'description', value: string | number) => {
        setFormData(prev => ({
            ...prev,
            stats: prev.stats.map(s => {
                if (s.id === statId) {
                    const updatedStat = { ...s, [field]: value };
                    if (field === 'value' && typeof s.value === 'number') {
                        updatedStat.value = parseInt(String(value), 10) || 0;
                    }
                    return updatedStat;
                }
                return s;
            })
        }));
    };
    
    const handleAddAttribute = () => {
        if (!newAttribute.name?.trim()) {
            setError('Tên thuộc tính không được để trống.');
            return;
        }
        const statToAdd: Stat = {
            id: generateUniqueId('stat-custom-attr'),
            name: newAttribute.name.trim(),
            description: newAttribute.description?.trim() || 'Thuộc tính tùy chỉnh.',
            category: 'Thuộc tính',
            value: typeof newAttribute.value === 'string' ? (parseInt(newAttribute.value, 10) || 0) : newAttribute.value,
        };
        setFormData(prev => ({ ...prev, stats: [...(prev.stats || []), statToAdd] }));
        setNewAttribute({ category: 'Thuộc tính', name: '', value: 10, description: '' });
        setIsAddingAttribute(false);
        setError(null);
    };

    const handleDeleteAttribute = (statId: string) => {
        setFormData(prev => ({
            ...prev,
            stats: prev.stats.filter(s => s.id !== statId)
        }));
    };

    const handleAddStat = () => {
        if (!newStat.name?.trim() || !newStat.description?.trim()) {
            setError('Vui lòng nhập Tên và Mô tả.');
            return;
        }
        const statToAdd: Stat = {
            id: generateUniqueId('stat'),
            name: newStat.name.trim(),
            description: newStat.description.trim(),
            category: newStat.category || 'Kỹ Năng',
            value: newStat.value || undefined,
            evolutionDescription: newStat.evolutionDescription?.trim() || undefined,
            slot: newStat.category === 'Vật phẩm' ? newStat.slot : undefined,
        };
        setFormData(prev => ({
            ...prev,
            stats: [...(prev.stats || []), statToAdd],
        }));
        setNewStat({ category: newStat.category });
        setIsAddingStat(false);
        setError(null);
    };

    const handleDeleteStat = (idToDelete: string) => {
        setFormData(prev => ({
            ...prev,
            stats: prev.stats.filter(stat => stat.id !== idToDelete),
        }));
    };

    const handleAddRelationship = () => {
        if (!newRelationship.npcDescription.trim() || !newRelationship.relationshipType.trim()) {
            setError('Vui lòng nhập Mô tả và Loại quan hệ.');
            return;
        }
        const relToAdd: InitialRelationship = {
            id: generateUniqueId('init-rel'),
            ...newRelationship,
        };
        setFormData(prev => ({
            ...prev,
            initialRelationships: [...(prev.initialRelationships || []), relToAdd],
        }));
        setNewRelationship({ npcDescription: '', relationshipType: 'Bạn bè', affinity: 50 });
        setIsAddingRelationship(false);
        setError(null);
    };

    const handleDeleteRelationship = (idToDelete: string) => {
        setFormData(prev => ({
            ...prev,
            initialRelationships: (prev.initialRelationships || []).filter(rel => rel.id !== idToDelete),
        }));
    };
    
    useEffect(() => {
        const list = newStat.category === 'Vật phẩm'
            ? Object.keys(BASE_ITEM_TEMPLATES).map(key => ({ label: key, value: key }))
            : Object.keys(BASE_SKILL_TEMPLATES).map(key => ({ label: key, value: key }));
        list.sort((a, b) => a.label.localeCompare(b.label, 'vi'));
        setTemplateList(list);
    }, [newStat.category]);

    const handleTemplateSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const templateName = e.target.value;
        if (!templateName) return;

        const template = newStat.category === 'Vật phẩm'
            ? (BASE_ITEM_TEMPLATES as any)[templateName]
            : (BASE_SKILL_TEMPLATES as any)[templateName];

        if (template) {
            setNewStat(prev => ({
                ...prev,
                ...template,
                name: template.name || templateName,
                description: (template as any).baseDescription || template.description,
            }));
        }
        e.target.value = ''; // Reset dropdown after selection
    };

    const getAffinityStyle = (affinity: number) => {
        if (affinity < 0) return { color: 'var(--accent-danger)' };
        if (affinity > 0) return { color: 'var(--accent-success)' };
        return { color: 'var(--text-muted)' };
    };

    const activeRelationshipTypes = useMemo(() => {
        return GENRE_RELATIONSHIP_MAP[formData.genre] || GENRE_RELATIONSHIP_MAP['Default'];
    }, [formData.genre]);
    
    useEffect(() => {
        const allValidTypes = Object.values(activeRelationshipTypes).flat();
        if (!allValidTypes.includes(newRelationship.relationshipType)) {
            const firstCategory = Object.keys(activeRelationshipTypes)[0];
            const firstType = firstCategory ? activeRelationshipTypes[firstCategory][0] : 'Người lạ';
            setNewRelationship(prev => ({ ...prev, relationshipType: firstType }));
        }
    }, [activeRelationshipTypes, newRelationship.relationshipType]);

    return (
        <>
            <fieldset className="character-fieldset" disabled={formData.genre === 'Đồng nhân' && fanficCharOption === 'main'}>
                <FormField label="Danh Xưng/Tên" htmlFor="name"><input id="name" type="text" name="name" placeholder="VD: Diệp Phàm, Uzumaki Naruto..." value={formData.name} onChange={handleInputChange} /></FormField>
                <div className="field-row">
                     <FormField label="Tính Cách (Bề ngoài)" htmlFor="personalityOuter">
                        <select id="personalityOuter" name="personalityOuter" value={formData.personalityTraits?.[0]?.name || 'ai'} onChange={handleInputChange}>
                             {Object.entries(PERSONALITY_TRAITS).map(([group, traits]) => (
                                <optgroup label={group} key={group}>
                                    {(traits as string[]).map(trait => {
                                        const value = (trait === 'Để AI quyết định' || trait === 'ai') ? 'ai' : trait;
                                        const text = trait === 'ai' ? 'Để AI quyết định' : trait;
                                        return <option key={value} value={value}>{text}</option>;
                                    })}
                                </optgroup>
                            ))}
                        </select>
                    </FormField>
                </div>
                <FormField label="Giới Tính" htmlFor="gender">
                    <select id="gender" name="gender" value={formData.gender} onChange={handleInputChange}><option>Nam</option><option>Nữ</option></select>
                </FormField>
                {formData.genre === 'Tu Tiên' && (
                    <FormField label="Linh Căn (Để trống để AI sáng tạo)" htmlFor="linhCan">
                        <input
                            id="linhCan"
                            type="text"
                            name="linhCan"
                            placeholder="VD: Thiên Đạo Linh Căn, Ngũ Hành Tạp Linh Căn..."
                            value={formData.linhCan || ''}
                            onChange={handleInputChange}
                        />
                    </FormField>
                )}
                <FormField label="Sơ Lược Tiểu Sử" htmlFor="backstory"><textarea id="backstory" name="backstory" rows={3} placeholder="VD: Một phế vật mang huyết mạch thượng cổ..." value={formData.backstory} onChange={handleInputChange}></textarea></FormField>
                 <FormField label="Tài sản Khởi đầu" htmlFor="asset-value">
                    <div className="money-input-group">
                        <input
                            id="asset-value"
                            type="number"
                            value={typeof assetStat?.value === 'number' ? assetStat.value : 0}
                            onChange={(e) => handleAssetChange('value', parseInt(e.target.value, 10) || 0)}
                        />
                        <div className="select-wrapper">
                            <select
                                value={dropdownCurrencyValue}
                                onChange={handleCurrencyTypeChange}
                                aria-label="Đơn vị tiền tệ"
                            >
                                {CURRENCY_UNITS.map(unit => (
                                    <option key={unit} value={unit}>{unit}</option>
                                ))}
                            </select>
                        </div>
                        {dropdownCurrencyValue === 'Tùy chỉnh...' && (
                            <input
                                type="text"
                                value={customCurrencyName}
                                onChange={handleCustomCurrencyInputChange}
                                placeholder="Nhập đơn vị..."
                                className="custom-currency-input"
                            />
                        )}
                    </div>
                </FormField>
                
                 <fieldset className="skill-fieldset">
                    <legend>Bộ chỉ số Cốt lõi</legend>
                     <div className="core-stat-tabs">
                        {coreStatTabs.map(tabName => (
                            <button
                                type="button"
                                key={tabName}
                                className={`core-stat-tab-button ${activeCoreStatTab === tabName ? 'active' : ''}`}
                                onClick={() => handleCoreStatTabClick(tabName)}
                            >
                                {tabName}
                            </button>
                        ))}
                    </div>
                    {activeCoreStatTab === 'Tùy Chỉnh' && (
                         <div className="core-attributes-grid editable">
                            {coreAttributes.map(attr => (
                                <CoreAttributeEditor 
                                    key={attr.id} 
                                    attribute={attr} 
                                    onChange={handleAttributeChange} 
                                    onDelete={handleDeleteAttribute}
                                />
                            ))}
                             {!isAddingAttribute && (
                                <button type="button" className="add-attribute-button" onClick={() => setIsAddingAttribute(true)}>
                                    + Thêm Thuộc tính
                                </button>
                            )}
                            <AttributeEditorForm
                                isAdding={isAddingAttribute}
                                setIsAdding={setIsAddingAttribute}
                                attributeData={newAttribute}
                                setAttributeData={setNewAttribute}
                                onSave={handleAddAttribute}
                            />
                        </div>
                    )}
                </fieldset>
                
                 <div className="wc-creation-mode-toggle" style={{maxWidth: '100%', margin: '1rem 0'}}>
                    <ToggleSwitch
                        id="suggestPowerfulSkillsToggle"
                        label="Khởi Đầu Thuận Lợi"
                        description="Bật để AI tạo ra các kỹ năng và vật phẩm khởi đầu mạnh mẽ, vượt trội, giúp giai đoạn đầu game dễ dàng hơn."
                        name="suggestPowerfulSkills"
                        checked={formData.suggestPowerfulSkills || false}
                        onChange={handleInputChange}
                    />
                </div>

                <fieldset className="skill-fieldset">
                    <legend>Kỹ năng & Vật phẩm Khởi đầu</legend>
                    {!isAddingStat ? (
                         <button type="button" className="wc-button button-add-skill" onClick={() => setIsAddingStat(true)}>+ Thêm Mới</button>
                    ) : (
                        <div className="add-stat-form">
                            <div className="add-stat-form-row">
                                <FormField label="Loại" htmlFor="new-stat-category">
                                    <select
                                        id="new-stat-category"
                                        value={newStat.category}
                                        onChange={e => {
                                            const newCategory = e.target.value as Stat['category'];
                                            setNewStat(p => ({
                                                ...p,
                                                category: newCategory,
                                                slot: newCategory === 'Vật phẩm' ? (p.slot || 'Không có') : undefined,
                                            }));
                                        }}
                                    >
                                        {Object.entries(groupedCreationCategories).map(([groupName, options]) => (
                                            <optgroup label={groupName} key={groupName}>
                                                {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                            </optgroup>
                                        ))}
                                    </select>
                                </FormField>
                                <div className="name-template-group">
                                    <FormField label="Tên" htmlFor="new-stat-name">
                                        <input id="new-stat-name" type="text" value={newStat.name || ''} onChange={e => setNewStat(p => ({...p, name: e.target.value}))} placeholder="VD: La Hán Quyền" />
                                    </FormField>
                                    <FormField label="Hoặc chọn mẫu" htmlFor="stat-template-select">
                                        <div className="select-wrapper">
                                            <select id="stat-template-select" value="" onChange={handleTemplateSelect}>
                                                <option value="">-- Mẫu có sẵn --</option>
                                                {templateList.map(opt => (
                                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </FormField>
                                </div>
                                <FormField label="Giá trị/Cấp độ (Tùy chọn)" htmlFor="new-stat-value">
                                    <input id="new-stat-value" type="text" value={newStat.value || ''} onChange={e => setNewStat(p => ({...p, value: e.target.value}))} placeholder="VD: 1, Sơ cấp..." />
                                </FormField>
                            </div>
                            {newStat.category === 'Vật phẩm' && (
                                <FormField label="Loại Ô Trang Bị" htmlFor="new-stat-slot">
                                    <select 
                                        id="new-stat-slot" 
                                        value={newStat.slot || 'Không có'} 
                                        onChange={e => setNewStat(p => ({...p, slot: e.target.value}))}
                                    >
                                        {ITEM_SLOT_TYPES.map(slot => <option key={slot} value={slot}>{slot}</option>)}
                                    </select>
                                </FormField>
                            )}
                            <FormField label="Mô tả" htmlFor="new-stat-desc">
                                <textarea id="new-stat-desc" value={newStat.description || ''} onChange={e => setNewStat(p => ({...p, description: e.target.value}))} placeholder="Mô tả ngắn gọn cơ chế & hiệu ứng. VD: Gây sát thương Hỏa..." rows={2}></textarea>
                            </FormField>
                             <FormField label="Mô tả Tiềm năng Tiến hóa (Tùy chọn)" htmlFor="new-stat-evo">
                                <input id="new-stat-evo" type="text" value={newStat.evolutionDescription || ''} onChange={e => setNewStat(p => ({...p, evolutionDescription: e.target.value}))} placeholder="VD: Có thể tiến hóa thành 'Vô Ảnh Thân Pháp'..." />
                            </FormField>
                            <div className="add-stat-actions">
                                <button className="lore-button cancel" onClick={() => setIsAddingStat(false)}>Hủy</button>
                                <button className="lore-button save-apply" onClick={handleAddStat}>Lưu</button>
                            </div>
                        </div>
                    )}
                    {Object.keys(otherStatsGrouped).length > 0 && (
                        <div className="skill-list-container">
                            {Object.entries(otherStatsGrouped).map(([category, stats]) => (
                                <div key={category}>
                                    <h5 className="stat-category-title">{category}</h5>
                                    <ul className="skill-list">
                                        {stats.map(stat => (
                                            <li key={stat.id} className="skill-item" title={stat.evolutionDescription ? `Tiến hóa: ${stat.evolutionDescription}` : stat.description}>
                                                <span className="skill-name">{stat.name} {stat.value ? `(${stat.value})` : ''}</span>
                                                <button type="button" className="skill-delete-button" onClick={() => handleDeleteStat(stat.id!)} aria-label={`Xóa ${stat.name}`}>×</button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    )}
                </fieldset>

                <fieldset className="relationship-fieldset">
                    <legend>Mối quan hệ Ban đầu</legend>
                    {!isAddingRelationship ? (
                        <button type="button" className="wc-button button-add-skill" onClick={() => setIsAddingRelationship(true)}>+ Thêm Mối quan hệ</button>
                    ) : (
                        <div className="add-stat-form">
                             <FormField label="Mô tả NPC" htmlFor="new-rel-desc">
                                <textarea id="new-rel-desc" value={newRelationship.npcDescription} onChange={e => setNewRelationship(p => ({ ...p, npcDescription: e.target.value }))} rows={3} placeholder="Mô tả ngắn gọn về NPC này để AI tạo ra. VD: Sư phụ của tôi, một người đàn ông nghiêm khắc nhưng tốt bụng..."></textarea>
                            </FormField>
                             <div className="add-stat-form-row">
                                <FormField label="Loại quan hệ" htmlFor="new-rel-type">
                                    <div className="select-wrapper">
                                        <select
                                            id="new-rel-type"
                                            value={newRelationship.relationshipType}
                                            onChange={e => setNewRelationship(p => ({ ...p, relationshipType: e.target.value }))}
                                        >
                                            {Object.entries(activeRelationshipTypes).map(([group, types]) => (
                                                <optgroup label={group} key={group}>
                                                    {(types as string[]).map(type => (
                                                        <option key={type} value={type}>{type}</option>
                                                    ))}
                                                </optgroup>
                                            ))}
                                        </select>
                                    </div>
                                </FormField>
                                <FormField label={`Thân thiết: ${newRelationship.affinity}`} htmlFor="new-rel-affinity">
                                    <input id="new-rel-affinity" type="range" min="-100" max="100" value={newRelationship.affinity} onChange={e => setNewRelationship(p => ({ ...p, affinity: parseInt(e.target.value, 10) }))} />
                                </FormField>
                            </div>
                            <div className="add-stat-actions">
                                <button className="lore-button cancel" onClick={() => setIsAddingRelationship(false)}>Hủy</button>
                                <button className="lore-button save-apply" onClick={handleAddRelationship}>Lưu</button>
                            </div>
                        </div>
                    )}
                    {(formData.initialRelationships || []).length > 0 && (
                         <div className="relationship-list-container">
                             <h5 className="stat-category-title">Danh sách</h5>
                             <ul className="relationship-list">
                                {(formData.initialRelationships || []).map(rel => (
                                    <li key={rel.id} className="relationship-item detailed">
                                        <div className="relationship-info">
                                            <div className="relationship-info-header">
                                                <strong>{rel.relationshipType}</strong>
                                                <span className="affinity-display" style={getAffinityStyle(rel.affinity)}>
                                                    ({rel.affinity > 0 ? '+' : ''}{rel.affinity})
                                                </span>
                                            </div>
                                            <p className="relationship-description">{rel.npcDescription}</p>
                                        </div>
                                        <button type="button" className="skill-delete-button" onClick={() => handleDeleteRelationship(rel.id)} aria-label={`Xóa ${rel.relationshipType}`}>×</button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </fieldset>
            </fieldset>
            <button
                className="wc-button button-suggest-char"
                onClick={handleSuggestCharacter}
                disabled={isAiBusy || (formData.genre === 'Đồng nhân' && fanficCharOption === 'main') || isGenreEmptyAndIdeaMissing}
                aria-busy={isGeneratingChar}
                aria-label={isGeneratingChar ? 'AI đang gợi ý...' : 'AI Gợi Ý'}
                title={isGenreEmptyAndIdeaMissing ? "Vui lòng điền 'Ý Tưởng Của Bạn' hoặc chọn mẫu khi chọn thể loại 'Trống'." : "Chi phí: 1 Yêu cầu API. AI sẽ tự động tạo ra một nhân vật hoàn chỉnh, bao gồm tiểu sử, kỹ năng, vật phẩm và các mối quan hệ ban đầu."}
            >
                {isGeneratingChar ? (<><span className="spinner spinner-md"></span> Đang gợi ý... ({formatTime(charSuggestionTime)})</>) : 'AI Gợi Ý'}
            </button>
            <p className="field-hint" style={{textAlign: 'center', marginTop: 'var(--space-2)'}}>AI sẽ gợi ý Tiểu sử, Kỹ năng, Vật phẩm và Mối quan hệ ban đầu.</p>
        </>
    );
};