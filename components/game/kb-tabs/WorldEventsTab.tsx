/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState } from 'react';
import { useGameContext } from '../../contexts/GameContext';
import { generateUniqueId } from '../../../utils/id';
import type { WorldEvent } from '../../../types';

interface WorldEventsTabProps {
    onUpdateWorldEvents: (newEvents: WorldEvent[]) => void;
}

export const WorldEventsTab = ({ onUpdateWorldEvents }: WorldEventsTabProps) => {
    const { worldSettings } = useGameContext();
    const [events, setEvents] = useState<WorldEvent[]>(worldSettings.worldEvents || []);

    const handleEventChange = (id: string, field: keyof WorldEvent, value: string | boolean | number) => {
        setEvents(prev => prev.map(event =>
            event.id === id ? { ...event, [field]: value } : event
        ));
    };

    const handleAddEvent = () => {
        setEvents(prev => [...prev, { 
            id: generateUniqueId('wle'), 
            name: 'Sự kiện Mới',
            description: '',
            startMonth: 1,
            startDay: 1,
            durationDays: 1,
            frequency: 'Hàng năm',
            isActive: true,
        }]);
    };

    const handleDeleteEvent = (idToDelete: string) => {
        setEvents(prev => prev.filter(event => event.id !== idToDelete));
    };

    const onSave = () => {
        onUpdateWorldEvents(events);
    };

    return (
        <div className="world-logic-editor">
            <p className="world-logic-intro">
                <strong>Sự Kiện Thế Giới</strong> là các sự kiện định kỳ hoặc một lần xảy ra trong thế giới của bạn. AI sẽ tự động lồng ghép các sự kiện đang hoạt động vào diễn biến câu chuyện.
            </p>
            <div className="world-logic-list">
                {(events || []).map(event => (
                    <div key={event.id} className="world-logic-item world-event-item">
                        <div className="world-logic-main-content">
                            <div className="world-event-form">
                                <div className="form-row">
                                    <label>Tên sự kiện:</label>
                                    <input type="text" value={event.name} onChange={e => handleEventChange(event.id, 'name', e.target.value)} />
                                </div>
                                <div className="form-row">
                                    <label>Mô tả:</label>
                                    <textarea value={event.description} onChange={e => handleEventChange(event.id, 'description', e.target.value)} rows={3} />
                                </div>
                                <div className="form-row-group">
                                    <div className="form-row">
                                        <label>Bắt đầu:</label>
                                        <span>Ngày <input type="number" min="1" max="30" value={event.startDay} onChange={e => handleEventChange(event.id, 'startDay', parseInt(e.target.value, 10))} /></span>
                                        <span>Tháng <input type="number" min="1" max="12" value={event.startMonth} onChange={e => handleEventChange(event.id, 'startMonth', parseInt(e.target.value, 10))} /></span>
                                    </div>
                                    <div className="form-row">
                                        <label>Kéo dài:</label>
                                        <span><input type="number" min="1" value={event.durationDays} onChange={e => handleEventChange(event.id, 'durationDays', parseInt(e.target.value, 10))} /> ngày</span>
                                    </div>
                                    <div className="form-row">
                                        <label>Tần suất:</label>
                                        <select value={event.frequency} onChange={e => handleEventChange(event.id, 'frequency', e.target.value)}>
                                            <option value="Hàng năm">Hàng năm</option>
                                            <option value="Mỗi 5 năm">Mỗi 5 năm</option>
                                            <option value="Mỗi 10 năm">Mỗi 10 năm</option>
                                            <option value="Chỉ một lần">Chỉ một lần</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="world-logic-item-controls">
                            <label className="world-logic-active-toggle">
                                <input type="checkbox" checked={event.isActive} onChange={e => handleEventChange(event.id, 'isActive', e.target.checked)} />
                                <span>Hoạt động</span>
                            </label>
                            <button className="world-logic-button delete" onClick={() => handleDeleteEvent(event.id)}>Xóa</button>
                        </div>
                    </div>
                ))}
            </div>
            <div className="world-logic-footer">
                 <button className="world-logic-button add-new" onClick={handleAddEvent}>+ Thêm Sự kiện Mới</button>
                <button className="lore-button save-apply" onClick={onSave}>Lưu Thay Đổi</button>
            </div>
        </div>
    );
};