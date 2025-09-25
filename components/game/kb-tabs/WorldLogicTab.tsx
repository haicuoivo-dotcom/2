/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useMemo, useRef, useCallback } from 'react';
import { generateUniqueId } from '../../../utils/id';
import { ApiKeyManager } from '../../../services/ApiKeyManager';
import { getApiErrorMessage } from '../../../utils/error';
import { useAppContext } from '../../contexts/AppContext';
import { useGameContext } from '../../contexts/GameContext';
import { GENRE_RULE_MAP, DEFAULT_WORLD_LOGIC_SET, ADULT_RULE_PREFIXES } from '../../../constants/worldLogic';
import type { WorldLogicRule } from '../../../types';

interface WorldLogicTabProps {
    onUpdateWorldLogic: (newLogic: WorldLogicRule[]) => void;
}

export const WorldLogicTab = ({ onUpdateWorldLogic }: WorldLogicTabProps) => {
    const { gameState, worldSettings } = useGameContext();
    const [logicRules, setLogicRules] = useState<WorldLogicRule[]>(worldSettings.worldLogic || []);
    const { addToast, incrementApiRequestCount } = useAppContext();
    const [selectedRuleIds, setSelectedRuleIds] = useState<Set<string>>(new Set());
    const [isSuggestingRule, setIsSuggestingRule] = useState(false);
    const [expandedRuleIds, setExpandedRuleIds] = useState<Set<string>>(new Set());
    const importFileRef = useRef<HTMLInputElement>(null);
    const isMounted = useRef(true);

    const filteredWorldLogic = useMemo(() => {
        if (!logicRules) return [];
        const genre = worldSettings.genre;
        const allowedPrefixes = new Set(GENRE_RULE_MAP[genre] || []);
        const is18Plus = worldSettings.allow18Plus;

        return logicRules.filter(rule => {
            // Rule 1: Always include player-created rules (those not in the default master list).
            if (!DEFAULT_WORLD_LOGIC_SET.has(rule.text)) {
                return true;
            }

            // From here on, we are only dealing with default rules.

            // Rule 2: Check for 18+ rules. Only show them if the 18+ setting is enabled.
            const is18PlusRule = ADULT_RULE_PREFIXES.some(prefix => rule.text.startsWith(prefix));
            if (is18PlusRule) {
                return is18Plus;
            }
            
            // Rule 3: For all other default rules, check if they match the current genre's allowed prefixes.
            return Array.from(allowedPrefixes).some(prefix => rule.text.startsWith(prefix));
        });
    }, [logicRules, worldSettings.genre, worldSettings.allow18Plus]);

    const playerRules = useMemo(() => filteredWorldLogic.filter(rule => rule.author === 'player'), [filteredWorldLogic]);

    const handleRuleChange = (id: string, field: 'text' | 'isActive', value: string | boolean) => {
        setLogicRules(prev => prev.map(rule =>
            rule.id === id ? { ...rule, [field]: value } : rule
        ));
    };

    const handleAddRule = () => {
        const newRule: WorldLogicRule = { 
            id: generateUniqueId('wlr'), 
            text: '', 
            isActive: true, 
            author: 'player', 
            timestamp: new Date().toISOString() 
        };
        setLogicRules(prev => [newRule, ...prev]);
        setExpandedRuleIds(prev => new Set(prev).add(newRule.id));
    };

    const handleDeleteRule = (idToDelete: string) => {
        setLogicRules(prev => prev.filter(rule => rule.id !== idToDelete));
        setSelectedRuleIds(prev => {
            const newSet = new Set(prev);
            newSet.delete(idToDelete);
            return newSet;
        });
    };

    const handleRuleSelectionChange = (ruleId: string) => {
        setSelectedRuleIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(ruleId)) newSet.delete(ruleId);
            else newSet.add(ruleId);
            return newSet;
        });
    };

    const toggleRuleExpansion = (ruleId: string) => {
        setExpandedRuleIds(prev => {
            const newSet = new Set(prev);
            newSet.has(ruleId) ? newSet.delete(ruleId) : newSet.add(ruleId);
            return newSet;
        });
    };

    const handleSelectAllPlayerRules = () => {
        if (selectedRuleIds.size === playerRules.length && playerRules.length > 0) setSelectedRuleIds(new Set());
        else setSelectedRuleIds(new Set(playerRules.map(r => r.id)));
    };

    const handleDeleteSelectedRules = () => {
        if (selectedRuleIds.size === 0) return;
        setLogicRules(prev => prev.filter(rule => !selectedRuleIds.has(rule.id)));
        addToast(`Đã xóa ${selectedRuleIds.size} quy tắc đã chọn.`, 'success');
        setSelectedRuleIds(new Set());
    };

    const handleSuggestRule = useCallback(async () => {
        setIsSuggestingRule(true);
        try {
            const prompt = `**VAI TRÒ:** Bạn là một nhà biên kịch (World Builder) sáng tạo. **NHIỆM VỤ:** Dựa trên bối cảnh thế giới và các quy tắc logic đã có, hãy gợi ý MỘT (1) quy tắc logic mới, thú vị và chưa tồn tại để làm cho thế giới thêm phần độc đáo. **BỐI CẢNH THẾ GIỚI:** - Kiểu Thế Giới (Genre): ${worldSettings.genre} - Bối Cảnh (Setting): ${worldSettings.setting} - Tóm tắt thế giới (World Summary): ${gameState.worldSummary || 'Chưa có.'} **CÁC QUY TẮC LOGIC HIỆN CÓ:** ${(worldSettings.worldLogic || []).map(rule => `- ${rule.text}`).join('\n')} **YÊU CẦU:** 1.  **SÁNG TẠO & PHÙ HỢP:** Quy tắc gợi ý phải phù hợp với thể loại và bối cảnh, nhưng mang tính sáng tạo. 2.  **KHÔNG TRÙNG LẶP:** Quy tắc mới không được trùng lặp hoặc mâu thuẫn với các quy tắc đã có. 3.  **ĐỊNH DẠNG ĐẦU RA:** Chỉ trả về văn bản của quy tắc mới, không có lời dẫn hay giải thích. Ví dụ: "Trong thế giới này, tất cả Elf đều có khả năng nói chuyện với động vật."`;
            const response = await ApiKeyManager.generateContentWithRetry({ model: 'gemini-2.5-flash', contents: prompt }, addToast, incrementApiRequestCount, () => {});
            if (isMounted.current && response.text) {
                const newRuleText = response.text.trim();
                setLogicRules(prev => [...prev, { id: generateUniqueId('wlr-ai'), text: newRuleText, isActive: true, author: 'ai', timestamp: new Date().toISOString() }]);
                addToast("Đã thêm một quy tắc gợi ý từ AI.", 'success');
            }
        } catch (error) {
            const userFriendlyError = getApiErrorMessage(error, "gợi ý quy tắc logic");
            addToast(userFriendlyError, 'error');
        } finally { if (isMounted.current) setIsSuggestingRule(false); }
    }, [worldSettings, gameState.worldSummary, addToast, incrementApiRequestCount, setLogicRules]);

    const handleExportRules = useCallback(() => {
        try {
            const rulesToSave = logicRules.map(({ id, ...rest }) => rest);
            const jsonString = JSON.stringify(rulesToSave, null, 2);
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `world_logic_rules_${new Date().toISOString().slice(0, 10)}.json`;
            document.body.appendChild(a); a.click(); document.body.removeChild(a);
            URL.revokeObjectURL(url);
            addToast("Đã xuất tệp quy tắc thành công!", 'success');
        } catch (error) { addToast("Lỗi khi xuất tệp quy tắc.", "error"); }
    }, [logicRules, addToast]);

    const handleImportRulesClick = () => importFileRef.current?.click();

    const handleImportFileSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const content = e.target?.result;
                if (typeof content === 'string') {
                    const loadedRules = JSON.parse(content);
                    if (Array.isArray(loadedRules) && loadedRules.every(r => typeof r.text === 'string' && typeof r.isActive === 'boolean')) {
                        const rulesWithIds = loadedRules.map((rule: any) => ({ ...rule, id: generateUniqueId('wlr-imported'), author: rule.author || 'player', timestamp: rule.timestamp || new Date().toISOString() }));
                        setLogicRules(rulesWithIds);
                        addToast("Đã tải và thay thế các quy tắc thành công.", 'success');
                    } else throw new Error("Định dạng tệp không hợp lệ.");
                }
            } catch (error) {
                const message = error instanceof Error ? error.message : "Lỗi không xác định";
                addToast(`Nhập thất bại: ${message}`, "error");
            }
        };
        reader.readAsText(file);
        if (event.target) event.target.value = '';
    };

    const onSave = () => {
        onUpdateWorldLogic(logicRules);
    };

    return (
        <div className="world-logic-editor">
            <p className="world-logic-intro"><strong>Logic Thế Giới</strong> là tập hợp các quy tắc nền tảng mà AI sẽ tuân theo để duy trì sự nhất quán. Bạn có thể chỉnh sửa, thêm hoặc tắt các quy tắc để định hình thế giới theo ý muốn.</p>
            <div className="world-logic-toolbar">
                <div className="toolbar-actions-left">
                    <button className="toolbar-button" onClick={handleSelectAllPlayerRules} disabled={playerRules.length === 0}>
                        {selectedRuleIds.size === playerRules.length && playerRules.length > 0 ? 'Bỏ chọn Tất cả' : `Chọn tất cả (${playerRules.length})`}
                    </button>
                </div>
                {selectedRuleIds.size > 0 && (
                    <div className="toolbar-actions-right">
                        <button className="toolbar-button delete" onClick={handleDeleteSelectedRules}>Xóa ({selectedRuleIds.size}) mục đã chọn</button>
                    </div>
                )}
            </div>
            <div className="world-logic-list">
                {filteredWorldLogic.map(rule => {
                    const isExpanded = expandedRuleIds.has(rule.id);
                    return (
                        <div key={rule.id} className={`world-logic-item ${selectedRuleIds.has(rule.id) ? 'selected' : ''}`}>
                            <div className="world-logic-selection-area">
                                {rule.author === 'player' ? (
                                    <input type="checkbox" className="rule-selection-checkbox" checked={selectedRuleIds.has(rule.id)} onChange={() => handleRuleSelectionChange(rule.id)} aria-label={`Chọn quy tắc`} />
                                ) : (
                                    <div className="rule-selection-placeholder" title="Quy tắc do AI tạo không thể xóa">💡</div>
                                )}
                            </div>
                            <div className="world-logic-main-content">
                                {isExpanded ? (
                                    <textarea className="world-logic-textarea" value={rule.text} onChange={(e) => handleRuleChange(rule.id, 'text', e.target.value)} placeholder="Nhập nội dung quy tắc tại đây..." rows={rule.text.split('\n').length + 1} autoFocus />
                                ) : (
                                    <div className="world-logic-text-collapsed" onClick={() => toggleRuleExpansion(rule.id)}>
                                        {rule.text.split('\n')[0]}
                                        {rule.text.includes('\n') && <span className="expand-rule-indicator">... (nhấp để xem thêm)</span>}
                                    </div>
                                )}
                                <div className="world-logic-meta">
                                    <span className={rule.author === 'ai' ? 'author-ai' : 'author-player'}>{rule.author === 'ai' ? 'AI tạo' : 'Người chơi tạo'}</span>
                                    {rule.timestamp && (<span className="timestamp" title={new Date(rule.timestamp).toLocaleString('vi-VN')}>{new Date(rule.timestamp).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>)}
                                </div>
                            </div>
                            <div className="world-logic-item-controls">
                                <label className="world-logic-active-toggle">
                                    <input type="checkbox" checked={rule.isActive} onChange={(e) => handleRuleChange(rule.id, 'isActive', e.target.checked)} />
                                    <span>Hoạt động</span>
                                </label>
                                {rule.author === 'player' && (<button className="world-logic-button delete" onClick={() => handleDeleteRule(rule.id!)}>Xóa</button>)}
                            </div>
                        </div>
                    );
                })}
            </div>
            <div className="world-logic-actions">
                <button className="world-logic-button suggest" onClick={handleSuggestRule} disabled={isSuggestingRule} title="Chi phí: 1 Yêu cầu API">
                    {isSuggestingRule ? <><span className="spinner spinner-sm"></span> Đang gợi ý...</> : 'Gợi ý Quy tắc mới (AI)'}
                </button>
                <button className="world-logic-button add-new" onClick={handleAddRule}>+ Thêm Quy tắc Mới</button>
                <button className="world-logic-button file-action" onClick={handleExportRules}>Xuất Quy tắc (json)</button>
                <button className="world-logic-button file-action" onClick={handleImportRulesClick}>Nhập Quy tắc (json)</button>
                <input type="file" ref={importFileRef} onChange={handleImportFileSelected} style={{ display: 'none' }} accept=".json" />
            </div>
            <div className="world-logic-footer">
                <button className="lore-button save-apply" onClick={onSave}>Lưu Logic Thế Giới</button>
            </div>
        </div>
    );
};