/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { FormField } from '../../../ui/FormField';
import type { Stat, StatEffect } from '../../../../types';

interface StatusEditorFormProps {
    formState: { mode: 'add' | 'edit', data: Partial<Stat> };
    setFormState: React.Dispatch<React.SetStateAction<{ mode: 'add' | 'edit', data: Partial<Stat> } | null>>;
    onSave: () => void;
}

export const StatusEditorForm = ({ formState, setFormState, onSave }: StatusEditorFormProps) => {
    const { mode, data } = formState;

    const handleDataChange = (field: keyof Stat, value: any) => {
        setFormState(prev => prev ? { ...prev, data: { ...prev.data, [field]: value } } : null);
    };

    const handleEffectChange = (index: number, field: keyof StatEffect, value: string) => {
        setFormState(prev => {
            if (!prev) return null;
            const newEffects = [...(prev.data.effects || [])];
            (newEffects[index] as any)[field] = value;
            return { ...prev, data: { ...prev.data, effects: newEffects } };
        });
    };

    const addEffectField = () => {
        setFormState(prev => {
            if (!prev) return null;
            return { ...prev, data: { ...prev.data, effects: [...(prev.data.effects || []), { targetStat: '', modifier: '' }] } };
        });
    };

    const removeEffectField = (indexToRemove: number) => {
        setFormState(prev => {
            if (!prev) return null;
            return { ...prev, data: { ...prev.data, effects: (prev.data.effects || []).filter((_, index) => index !== indexToRemove) } };
        });
    };

    return (
        <div className="add-stat-form">
            <h5>{mode === 'add' ? 'Thêm Trạng thái' : 'Sửa Trạng thái'}</h5>
            <FormField label="Tên Trạng thái" htmlFor="status-name">
                <input id="status-name" type="text" value={data.name || ''} onChange={e => handleDataChange('name', e.target.value)} />
            </FormField>
            {mode === 'edit' && (
                <FormField label="Số lượng (Stack)" htmlFor="status-value">
                    <input
                        id="status-value" type="number" min="1"
                        value={typeof data.value === 'number' ? data.value : 1}
                        onChange={e => handleDataChange('value', parseInt(e.target.value, 10) || 1)}
                    />
                </FormField>
            )}
            <FormField label="Mô tả" htmlFor="status-desc">
                <textarea id="status-desc" value={data.description || ''} onChange={e => handleDataChange('description', e.target.value)} rows={2}></textarea>
            </FormField>
            <div className="add-stat-form-row">
                <FormField label="Thời gian (phút)" htmlFor="status-duration">
                    <input id="status-duration" type="number" value={data.durationMinutes || 0} onChange={e => handleDataChange('durationMinutes', parseInt(e.target.value, 10) || 0)} disabled={data.isPermanent} />
                </FormField>
                <div className="is-item-toggle">
                    <label>
                        <input type="checkbox" checked={data.isPermanent || false} onChange={e => handleDataChange('isPermanent', e.target.checked)} />
                        Vĩnh viễn
                    </label>
                </div>
            </div>
            <FormField label="Hiệu ứng" htmlFor="status-effects">
                <div className="status-effects-editor">
                    {(data.effects || []).map((effect, index) => (
                        <div key={index} className="status-effect-row">
                            <input type="text" placeholder="Thuộc tính (VD: Tấn Công)" value={effect.targetStat} onChange={e => handleEffectChange(index, 'targetStat', e.target.value)} />
                            <input type="text" placeholder="Giá trị (VD: +10, +5%)" value={effect.modifier} onChange={e => handleEffectChange(index, 'modifier', e.target.value)} />
                            <button className="remove-effect-button" onClick={() => removeEffectField(index)} title="Xóa hiệu ứng">×</button>
                        </div>
                    ))}
                    <button className="add-effect-button" onClick={addEffectField}>+ Thêm Hiệu ứng</button>
                </div>
            </FormField>
            <div className="add-stat-actions">
                <button className="lore-button cancel" onClick={() => setFormState(null)}>Hủy</button>
                <button className="lore-button save-apply" onClick={onSave}>Lưu</button>
            </div>
        </div>
    );
};
