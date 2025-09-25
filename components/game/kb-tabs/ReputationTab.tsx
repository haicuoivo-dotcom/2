/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useMemo } from 'react';
import { useGameContext } from '../../contexts/GameContext';
import { NoInfoPlaceholder } from '../../ui/NoInfoPlaceholder';
// FIX: Import GENRE_RANK_SYSTEMS from statConstants where it is now defined.
import { GENRE_RANK_SYSTEMS } from '../../../constants/statConstants';
import { getRankInfo } from '../../../utils/character';
import type { Stat, Faction } from '../../../types';
import './ReputationTab.css';

const ReputationBar = ({ label, value, rankData }: { label: string, value: number, rankData: ReturnType<typeof getRankInfo> }) => (
    <div className="reputation-meter">
        <div className="reputation-header">
            <h4>{label}</h4>
            <span className="reputation-rank">{rankData.name}</span>
        </div>
        <div className="reputation-progress-bar-container">
            <div className="reputation-progress-bar" style={{ width: `${rankData.progress}%` }}></div>
        </div>
        <div className="reputation-progress-text">
            <span>{value.toLocaleString('vi-VN')}</span>
            {rankData.nextThreshold !== Infinity && <span>/ {rankData.nextThreshold.toLocaleString('vi-VN')}</span>}
        </div>
    </div>
);

const FactionReputationBar = ({ faction }: { faction: Faction }) => {
    const rep = faction.playerReputation ?? 0;
    const progress = (rep + 100) / 2; // Scale from -100..100 to 0..100%
    let colorClass = 'neutral';
    if (rep >= 50) colorClass = 'ally';
    else if (rep >= 20) colorClass = 'friendly';
    else if (rep <= -50) colorClass = 'enemy';
    else if (rep <= -20) colorClass = 'hostile';
    
    return (
        <div className="faction-rep-item">
            <div className="faction-rep-header">
                <span className="faction-rep-name">{faction.name}</span>
                <span className={`faction-rep-status ${colorClass}`}>{faction.reputationStatus ?? 'Trung lập'} ({rep})</span>
            </div>
            <div className="faction-rep-bar-container">
                <div className={`faction-rep-bar ${colorClass}`} style={{ width: `${progress}%` }}></div>
            </div>
        </div>
    );
};

export const ReputationTab = () => {
    const { gameState, worldSettings } = useGameContext();
    const { character, knowledgeBase } = gameState;
    const { genre } = worldSettings;

    const { fameValue, infamyValue } = useMemo(() => {
        const fameStat = character.stats?.find(s => s.name === 'Danh Vọng');
        const infamyStat = character.stats?.find(s => s.name === 'Tai tiếng');
        
        const getStatValue = (stat: Stat | undefined) => {
            if (!stat) return 0;
            if (typeof stat.value === 'number') return stat.value;
            if (typeof stat.value === 'string') return parseInt(stat.value, 10) || 0;
            return 0;
        };
        
        return { fameValue: getStatValue(fameStat), infamyValue: getStatValue(infamyStat) };
    }, [character.stats]);
    
    const { fameRankData, infamyRankData } = useMemo(() => {
        const fameSystem = GENRE_RANK_SYSTEMS[genre]?.fame || GENRE_RANK_SYSTEMS['Default'].fame;
        const infamySystem = GENRE_RANK_SYSTEMS[genre]?.infamy || GENRE_RANK_SYSTEMS['Default'].infamy;
        return {
            fameRankData: getRankInfo(fameValue, fameSystem),
            infamyRankData: getRankInfo(infamyValue, infamySystem)
        };
    }, [genre, fameValue, infamyValue]);


    const rumors = useMemo(() => {
        const allRumors = character.stats?.filter(s => s.name.startsWith('Tin đồn:')) || [];
        const positive: Stat[] = [];
        const negative: Stat[] = [];

        allRumors.forEach(rumor => {
            if (rumor.tags?.includes('negative')) negative.push(rumor);
            else positive.push(rumor);
        });
        return { positive, negative };
    }, [character.stats]);
    
    const renderRumorList = (rumorList: Stat[], type: 'positive' | 'negative') => {
        if (rumorList.length === 0) {
            return <NoInfoPlaceholder text={`Không có tin đồn ${type === 'positive' ? 'tốt' : 'xấu'} nào.`} />;
        }
        return (
            <ul className="rumor-list">
                {rumorList.map(rumor => (
                    <li key={rumor.id} className={`rumor-item ${type}`}>
                        <p>{rumor.description}</p>
                    </li>
                ))}
            </ul>
        );
    };

    return (
        <div className="reputation-tab-container">
            <div className="reputation-grid">
                <ReputationBar label="Danh Vọng" value={fameValue} rankData={fameRankData} />
                <ReputationBar label="Tai tiếng" value={infamyValue} rankData={infamyRankData} />
            </div>

            <div className="faction-reputation-panel">
                <h4>Danh vọng Phe phái</h4>
                {knowledgeBase.factions && knowledgeBase.factions.length > 0 ? (
                    <div className="faction-rep-list">
                        {knowledgeBase.factions.map(faction => (
                            <FactionReputationBar key={faction.id} faction={faction} />
                        ))}
                    </div>
                ) : (
                    <NoInfoPlaceholder text="Bạn chưa gặp gỡ phe phái nào." />
                )}
            </div>

            <div className="rumors-panel">
                <div className="rumor-column">
                    <h4>Tin đồn Tốt</h4>
                    {renderRumorList(rumors.positive, 'positive')}
                </div>
                <div className="rumor-column">
                    <h4>Tin đồn Xấu</h4>
                     {renderRumorList(rumors.negative, 'negative')}
                </div>
            </div>
        </div>
    );
};
