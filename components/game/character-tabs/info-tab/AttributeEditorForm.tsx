/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { FormField } from '../../../ui/FormField';
import type { Stat } from '../../../../types';

interface AttributeEditorFormProps {
    isAdding: boolean;
    setIsAdding: (isAdding: boolean) => void;
    attributeData: Partial<Stat>;
    setAttributeData: React.Dispatch<React.SetStateAction<Partial<Stat>>>;
    onSave: () => void;
}

export const AttributeEditorForm = ({ isAdding, setIsAdding, attributeData, setAttributeData, onSave }: AttributeEditorFormProps) => {
    if (!isAdding) return null;

    return (
        <div className="add-stat-form" style={{marginTop: '1rem'}}>
            <div className="add-stat-form-row">
                <FormField label="Tên Thuộc tính" htmlFor="new-attr-name">
                    <input id="new-attr-name" type="text" value={attributeData.name || ''} onChange={e => setAttributeData(p => ({...p, name: e.target.value}))} />
                </FormField>
                <FormField label="Giá trị" htmlFor="new-attr-value">
                    <input id="new-attr-value" type="text" value={String(attributeData.value) || ''} onChange={e => setAttributeData(p => ({...p, value: e.target.value}))} />
                </FormField>
            </div>
            <FormField label="Mô tả" htmlFor="new-attr-desc">
                <textarea id="new-attr-desc" value={attributeData.description || ''} onChange={e => setAttributeData(p => ({...p, description: e.target.value}))} rows={2}></textarea>
            </FormField>
            <div className="add-stat-actions">
                <button className="lore-button cancel" onClick={() => setIsAdding(false)}>Hủy</button>
                <button className="lore-button save-apply" onClick={onSave}>Lưu</button>
            </div>
        </div>
    );
};