/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { useMemo, useState, useEffect, useCallback } from 'react';
import { useGameContext } from '../../contexts/GameContext';
import { useSettings } from '../../contexts/SettingsContext';
import { NoInfoPlaceholder } from '../../ui/NoInfoPlaceholder';
import { ApiKeyManager } from '../../../services/ApiKeyManager';
import { getApiErrorMessage } from '../../../utils/error';
import { extractJsonFromString, stripThinkingBlock } from '../../../utils/text';
import { generateUniqueId } from '../../../utils/id';
import { WORLD_SKILLS_GENERATION_SCHEMA } from '../../../constants/schemas';
import { CREATION_RULES_WORLD_SKILLS } from '../../../constants/aiConstants';
import type { Stat } from '../../../types';
import './WorldSkillsTab.css';

interface WorldSkillsTabProps {
    addToast: (message: string, type?: 'info' | 'success' | 'error' | 'warning', details?: any) => void;
    incrementApiRequestCount: () => void;
}

const SKILL_CATEGORIES = ['Kỹ Năng', 'Công Pháp', 'Chiêu Thức', 'Khí Công', 'Thuật'];

const categorizeSkill = (skill: Stat): string => {
    const tags = skill.tags || [];
    if (tags.includes('tấn công')) return 'Tấn công';
    if (tags.includes('phòng thủ')) return 'Phòng thủ';
    if (tags.includes('hỗ trợ')) return 'Hỗ trợ';
    if (tags.includes('bị động')) return 'Bị động';
    if (['Công Pháp', 'Chiêu Thức', 'Khí Công', 'Thuật'].includes(skill.category)) return 'Võ Học/Công Pháp';
    if (tags.includes('chế tác') || tags.includes('luyện đan') || tags.includes('rèn đúc')) return 'Chế tác';
    return 'Khác';
};

export const WorldSkillsTab = ({ addToast, incrementApiRequestCount }: WorldSkillsTabProps) => {
    const { gameState, worldSettings, dispatch } = useGameContext();
    const { settings } = useSettings();

    const [isGenerating, setIsGenerating] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedSkillId, setExpandedSkillId] = useState<string | null>(null);

    const allUniqueSkills = useMemo(() => {
        const skillMap = new Map<string, Stat>();
        const allCharacters = [gameState.character, ...gameState.knowledgeBase.npcs];
        
        allCharacters.forEach(char => {
            if (!char || !char.stats) return;
            char.stats.forEach(stat => {
                if (SKILL_CATEGORIES.includes(stat.category) && !skillMap.has(stat.name)) {
                    skillMap.set(stat.name, stat);
                }
            });
        });

        (gameState.knowledgeBase.worldSkills || []).forEach(stat => {
            if (SKILL_CATEGORIES.includes(stat.category) && !skillMap.has(stat.name)) {
                skillMap.set(stat.name, stat);
            }
        });

        return Array.from(skillMap.values());
    }, [gameState]);

    const filteredAndCategorizedSkills = useMemo(() => {
        const lowerSearch = searchTerm.toLowerCase().trim();
        const filteredSkills = !lowerSearch 
            ? allUniqueSkills 
            : allUniqueSkills.filter(skill => 
                skill.name.toLowerCase().includes(lowerSearch) ||
                skill.description.toLowerCase().includes(lowerSearch)
            );

        const groups: Record<string, Stat[]> = {};
        filteredSkills.forEach(skill => {
            const category = categorizeSkill(skill);
            if (!groups[category]) {
                groups[category] = [];
            }
            groups[category].push(skill);
        });
        
        Object.values(groups).forEach(group => group.sort((a, b) => a.name.localeCompare(b.name)));
        return groups;
    }, [allUniqueSkills, searchTerm]);

    const orderedCategories = useMemo(() => {
        const order = ['Tấn công', 'Phòng thủ', 'Hỗ trợ', 'Bị động', 'Võ Học/Công Pháp', 'Chế tác', 'Khác'];
        return order.filter(cat => filteredAndCategorizedSkills[cat] && filteredAndCategorizedSkills[cat].length > 0);
    }, [filteredAndCategorizedSkills]);

    const [activeTab, setActiveTab] = useState(() => orderedCategories[0] || '');

    useEffect(() => {
        if (orderedCategories.length > 0 && !orderedCategories.includes(activeTab)) {
            setActiveTab(orderedCategories[0]);
        } else if (orderedCategories.length === 0) {
            setActiveTab('');
        }
    }, [orderedCategories, activeTab]);

    const handleSuggestSkills = useCallback(async () => {
        setIsGenerating(true);
        addToast("AI đang sáng tạo kỹ năng mới...", 'info');
        try {
            const existingSkillNames = allUniqueSkills.map(s => s.name).join(', ');
            const prompt = `
**Bối cảnh Thế giới:**
- Thể loại: ${worldSettings.genre}
- Bối cảnh: ${worldSettings.setting}
- Tóm tắt: ${gameState.worldSummary}

**Các kỹ năng đã có (để tránh trùng lặp):** ${existingSkillNames}

${CREATION_RULES_WORLD_SKILLS}`;

            const response = await ApiKeyManager.generateContentWithRetry({
                model: settings.textModel,
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: WORLD_SKILLS_GENERATION_SCHEMA
                }
            // FIX: Added a dummy function for the missing `setRetryMessage` argument.
            }, addToast, incrementApiRequestCount, () => {});

            // FIX: The `extractJsonFromString` function is async and must be awaited.
            const result = await extractJsonFromString(stripThinkingBlock(response.text));
            if (!result || !Array.isArray(result.skills)) {
                throw new Error("AI không trả về dữ liệu kỹ năng hợp lệ.");
            }

            const skillsWithIds = result.skills.map((skill: Omit<Stat, 'id'>) => ({
                ...skill,
                id: generateUniqueId('ws-ai')
            }));

            dispatch({ type: 'ADD_WORLD_SKILLS', payload: skillsWithIds });
            addToast(`AI đã tạo thành công ${skillsWithIds.length} kỹ năng mới!`, 'success');

        } catch (error) {
            const userFriendlyError = getApiErrorMessage(error, "gợi ý kỹ năng thế giới");
            addToast(userFriendlyError, 'error');
        } finally {
            setIsGenerating(false);
        }
    }, [worldSettings, gameState, allUniqueSkills, settings.textModel, addToast, dispatch, incrementApiRequestCount]);

    const renderSkillItem = (skill: Stat) => (
        <li key={skill.id} className="world-skill-item">
            <div className="world-skill-summary" onClick={() => setExpandedSkillId(p => p === skill.id ? null : skill.id)}>
                <span>{skill.name}</span>
                <span className={`collapsible-chevron ${expandedSkillId === skill.id ? 'open' : ''}`}>▼</span>
            </div>
            {expandedSkillId === skill.id && (
                <div className="world-skill-details">
                    <ul className="char-detail-list" style={{gap: 0}}>
                         <li style={{ padding: '0.5rem', border: 'none' }}>
                            <p>{skill.description}</p>
                         </li>
                    </ul>
                </div>
            )}
        </li>
    );

    return (
        <div className="kb-list-container full-height" style={{gap: '1rem'}}>
            <div className="kb-search-wrapper" style={{ borderBottom: 'none', paddingBottom: 0, flexDirection: 'column', alignItems: 'stretch' }}>
                <input
                    type="text"
                    className="kb-search-input"
                    placeholder="Tìm kiếm kỹ năng..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
                <button
                    className="lore-button suggest"
                    onClick={handleSuggestSkills}
                    disabled={isGenerating}
                >
                    {isGenerating ? <><span className="spinner spinner-sm"></span> Đang Sáng tạo...</> : '💡 AI Gợi ý Kỹ năng Thế giới'}
                </button>
            </div>
            
            <div className="world-skills-tabs">
                {orderedCategories.map(cat => (
                    <button
                        key={cat}
                        className={`world-skills-tab-button ${activeTab === cat ? 'active' : ''}`}
                        onClick={() => setActiveTab(cat)}
                    >
                        {cat} ({filteredAndCategorizedSkills[cat].length})
                    </button>
                ))}
            </div>

            <div className="kb-list-container" style={{ paddingTop: 0 }}>
                {orderedCategories.length > 0 ? (
                    <ul className="world-skills-list">
                        {(filteredAndCategorizedSkills[activeTab] || []).map(renderSkillItem)}
                    </ul>
                ) : (
                    <NoInfoPlaceholder text="Không có kỹ năng nào được tìm thấy." />
                )}
            </div>
        </div>
    );
};