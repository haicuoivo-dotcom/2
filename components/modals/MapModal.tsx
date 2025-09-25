/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useRef, useState, useMemo, useCallback, MouseEvent as ReactMouseEvent, WheelEvent as ReactWheelEvent, useEffect } from 'react';
import { useGameContext } from '../contexts/GameContext';
import { getIconForLocationType } from '../../utils/map';
import { generateUniqueId } from '../../utils/id';
import type { MapLocation, MapMarker, Character } from '../../types';
import './MapModal.css';
import { UsersIcon } from '../ui/Icons';

interface MapModalProps {
    onClose: () => void;
}

const MARKER_ICONS = ['📍', '📌', '⭐', '❤️', '⚔️', '🛡️', '💰', '❓', '❗', '🏠', '🌲', '⛰️', '🌊'];
const MAP_SCALE = 20; // 1 map unit = 20px
const MIN_ZOOM = 0.2;
const MAX_ZOOM = 3.0;

export const MapModal = ({ onClose }: MapModalProps) => {
    const { gameState, dispatch } = useGameContext();
    const { map, character, knowledgeBase } = gameState;

    const mapContainerRef = useRef<HTMLDivElement>(null);
    
    const [view, setView] = useState({ x: 0, y: 0, zoom: 1 });
    const [isPanning, setIsPanning] = useState(false);
    const panStart = useRef({ startX: 0, startY: 0, viewX: 0, viewY: 0 });

    const [isAddingMarker, setIsAddingMarker] = useState(false);
    const [selectedObject, setSelectedObject] = useState<{ type: 'location' | 'marker' | 'player' | 'npc', data: any } | null>(null);
    const [isNpcListOpen, setIsNpcListOpen] = useState(false);

    // Marker form state
    const [markerData, setMarkerData] = useState<{ label: string, note: string, icon: string, coords: { x: number, y: number } }>({ label: '', note: '', icon: MARKER_ICONS[0], coords: { x: 0, y: 0 }});
    
    // Search state
    const [searchTerm, setSearchTerm] = useState('');
    const searchResults = useMemo(() => {
        if (!searchTerm) return [];
        const lowercasedFilter = searchTerm.toLowerCase();
        const locations = map.locations.filter(loc => loc.discovered && loc.name.toLowerCase().includes(lowercasedFilter));
        const markers = (map.markers || []).filter(m => m.label.toLowerCase().includes(lowercasedFilter));
        return [...locations, ...markers];
    }, [searchTerm, map.locations, map.markers]);

    const locationOwners = useMemo(() => {
        const owners = new Map<string, string>();
        gameState.knowledgeBase.factions.forEach(faction => {
            faction.territories.forEach(territory => {
                owners.set(territory.locationName, faction.name);
            });
        });
        return owners;
    }, [gameState.knowledgeBase.factions]);

    const charactersOnMap = useMemo(() => {
        if (!map.locations || !knowledgeBase) return [];
        
        const allCharacters = [character, ...knowledgeBase.npcs];
        const locationMap = new Map(map.locations.map(loc => [loc.id, loc]));

        return allCharacters
            .map(char => {
                if (!char.locationId) return null;
                const location = locationMap.get(char.locationId);
                if (!location || !location.discovered) return null;
                
                return {
                    id: char.id,
                    isPlayer: char.id === character.id,
                    displayName: char.displayName,
                    coordinates: location.coordinates,
                    avatarUrl: char.avatarUrl,
                    type: char.id === character.id ? 'player' : 'npc',
                    data: char,
                };
            })
            .filter((c): c is NonNullable<typeof c> => c !== null);

    }, [character, knowledgeBase.npcs, map.locations]);
    
    const nearbyNpcs = useMemo(() => {
        if (!character.locationId || !knowledgeBase.npcs) {
            return [];
        }
        return knowledgeBase.npcs.filter(npc => npc.locationId === character.locationId);
    }, [character.locationId, knowledgeBase.npcs]);

    // Center view on player initially
    useEffect(() => {
        if (mapContainerRef.current) {
            const { clientWidth, clientHeight } = mapContainerRef.current;
            setView(prev => ({
                ...prev,
                x: (clientWidth / 2) / prev.zoom - (map.playerPosition.x * MAP_SCALE),
                y: (clientHeight / 2) / prev.zoom - (map.playerPosition.y * MAP_SCALE)
            }));
        }
    }, [map.playerPosition.x, map.playerPosition.y]);

    const focusOnCoordinates = useCallback((x: number, y: number) => {
        if (mapContainerRef.current) {
            const { clientWidth, clientHeight } = mapContainerRef.current;
            setView(prev => ({
                ...prev,
                x: (clientWidth / 2) / prev.zoom - (x * MAP_SCALE),
                y: (clientHeight / 2) / prev.zoom - (y * MAP_SCALE)
            }));
        }
    }, []);
    
    const handleNpcClick = useCallback((npc: Character) => {
        if (npc.locationId) {
            const location = map.locations.find(loc => loc.id === npc.locationId);
            if (location) {
                focusOnCoordinates(location.coordinates.x, location.coordinates.y);
                setSelectedObject({ type: 'npc', data: npc });
            }
        }
        setIsNpcListOpen(false);
    }, [map.locations, focusOnCoordinates]);

    const handleMouseDown = (e: ReactMouseEvent<HTMLDivElement>) => {
        e.preventDefault();
        panStart.current = { startX: e.clientX, startY: e.clientY, viewX: view.x, viewY: view.y };
        setIsPanning(true);
    };

    const handleMouseMove = (e: ReactMouseEvent<HTMLDivElement>) => {
        if (!isPanning) return;
        const dx = (e.clientX - panStart.current.startX) / view.zoom;
        const dy = (e.clientY - panStart.current.startY) / view.zoom;
        setView(prev => ({ ...prev, x: panStart.current.viewX + dx, y: panStart.current.viewY + dy }));
    };

    const handleMouseUp = () => setIsPanning(false);

    // FIX: Modified the event handler to accept a simpler object, allowing it to be called from button clicks without a full event object.
    // Zoom now centers on the view if no mouse position is provided.
    const handleWheel = (e: { deltaY: number; clientX?: number; clientY?: number; }) => {
        if (!mapContainerRef.current) return;
        const delta = e.deltaY * -0.005;
        const newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, view.zoom + delta));
        
        const rect = mapContainerRef.current.getBoundingClientRect();
        const mouseX = (e.clientX ?? (rect.left + rect.width / 2)) - rect.left;
        const mouseY = (e.clientY ?? (rect.top + rect.height / 2)) - rect.top;
        
        const newX = mouseX / newZoom - (mouseX / view.zoom - view.x);
        const newY = mouseY / newZoom - (mouseY / view.zoom - view.y);
        
        setView({ zoom: newZoom, x: newX, y: newY });
    };

    const handleMapClick = (e: ReactMouseEvent<HTMLDivElement>) => {
        if (!isAddingMarker) return;
        if (!mapContainerRef.current) return;

        const rect = mapContainerRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left) / view.zoom - view.x;
        const y = (e.clientY - rect.top) / view.zoom - view.y;

        const mapX = Math.round(x / MAP_SCALE);
        const mapY = Math.round(y / MAP_SCALE);

        setMarkerData({ label: '', note: '', icon: MARKER_ICONS[0], coords: { x: mapX, y: mapY }});
        setSelectedObject({ type: 'marker', data: { isNew: true } });
        setIsAddingMarker(false);
    };

    const handleMarkerSave = () => {
        if (!markerData.label) return;
        const marker: MapMarker = {
            id: generateUniqueId('marker'),
            coordinates: markerData.coords,
            label: markerData.label,
            note: markerData.note,
            icon: markerData.icon,
        };
        dispatch({ type: 'ADD_MAP_MARKER', payload: marker });
        setSelectedObject(null);
    };

    const handleMarkerDelete = (markerId: string) => {
        dispatch({ type: 'DELETE_MAP_MARKER', payload: markerId });
        setSelectedObject(null);
    };

    const getScaleMultiplier = (scale: number = 1): number => {
        switch(scale) {
            case 1: return 0.8;
            case 2: return 0.9;
            case 3: return 1.0;
            case 4: return 1.2;
            case 5: return 1.5;
            default: return 1.0;
        }
    };

    const renderInfoPanel = () => {
        if (!selectedObject) return null;
        const isNewMarker = selectedObject.type === 'marker' && (selectedObject.data as any).isNew;
        const data = selectedObject.data;
        const name = data.displayName || data.label || data.name;
        
        return (
            <div className="map-info-panel-2d">
                {isNewMarker ? (
                     <>
                        <h4>Tạo Đánh Dấu Mới tại ({markerData.coords.x}, {markerData.coords.y})</h4>
                        <div className="panel-body">
                            <input type="text" placeholder="Tên đánh dấu" value={markerData.label} onChange={(e) => setMarkerData(p => ({ ...p, label: e.target.value }))} className="map-search-input" />
                            <textarea placeholder="Ghi chú..." value={markerData.note} onChange={(e) => setMarkerData(p => ({ ...p, note: e.target.value }))} className="map-search-input" rows={4} />
                             <div className="icon-picker">
                                {MARKER_ICONS.map(icon => <button key={icon} className={`icon-option ${markerData.icon === icon ? 'selected' : ''}`} onClick={() => setMarkerData(p => ({ ...p, icon }))}>{icon}</button>)}
                            </div>
                        </div>
                        <div className="panel-footer">
                            <button className="lore-button cancel" onClick={() => setSelectedObject(null)}>Hủy</button>
                            <button className="lore-button save-apply" onClick={handleMarkerSave}>Lưu</button>
                        </div>
                    </>
                ) : (
                    <>
                        <h4>{name}</h4>
                        <div className="panel-body">
                            <p className="panel-description">{data.note || data.description || data.backstory}</p>
                            {selectedObject.type !== 'player' && data.coordinates && (
                                <div className="panel-coords">
                                    Tọa độ: ({data.coordinates.x}, {data.coordinates.y})
                                </div>
                            )}
                        </div>
                        {selectedObject.type === 'marker' && (
                            <div className="panel-footer">
                                <button className="lore-button delete" onClick={() => handleMarkerDelete(data.id)}>Xóa Đánh Dấu</button>
                            </div>
                        )}
                    </>
                )}
            </div>
        );
    };

    return (
        <div className="modal-overlay map-overlay" onClick={onClose}>
            <div className="modal-content fullscreen-modal-content map-modal-content" onClick={(e) => { e.stopPropagation(); if (e.target === e.currentTarget) { setSelectedObject(null); } }}>
                 <header className="modal-header">
                    <div className="modal-header-content">
                        <h3>Bản Đồ 2D</h3>
                        <div className="map-search-container">
                            <input type="text" className="map-search-input" placeholder="Tìm kiếm địa điểm..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                            {searchResults.length > 0 && (
                                <ul className="map-search-results">
                                    {searchResults.map((item: any) => (
                                        <li key={item.id} className="map-search-result-item" onClick={() => focusOnCoordinates(item.coordinates.x, item.coordinates.y)}>
                                            {item.label || item.name}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                    <button onClick={onClose} className="modal-close-button" aria-label="Đóng">×</button>
                </header>

                <div className="map-toolbar">
                    <div className="map-toolbar-group">
                        <button className="map-control-btn" title="Phóng to" onClick={() => handleWheel({ deltaY: -100 })}>+</button>
                        <button className="map-control-btn" title="Thu nhỏ" onClick={() => handleWheel({ deltaY: 100 })}>-</button>
                        <div className="toolbar-separator"></div>
                        <button className="map-control-btn" title="Về vị trí người chơi" onClick={() => focusOnCoordinates(map.playerPosition.x, map.playerPosition.y)}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><circle cx="12" cy="12" r="8"/><line x1="12" y1="2" x2="12" y2="4"/><line x1="12" y1="20" x2="12" y2="22"/><line x1="2" y1="12" x2="4" y2="12"/><line x1="20" y1="12" x2="22" y2="22"/></svg>
                        </button>
                        <button className={`map-control-btn ${isAddingMarker ? 'active' : ''}`} title="Thêm đánh dấu" onClick={() => setIsAddingMarker(p => !p)}>📌</button>
                        <div className="dropdown-container">
                            <button className="map-control-btn" onClick={() => setIsNpcListOpen(p => !p)} title="NPC Gần Đây">
                                <UsersIcon />
                                {nearbyNpcs.length > 0 && <span className="npc-count-badge">{nearbyNpcs.length}</span>}
                            </button>
                            {isNpcListOpen && (
                                <ul className="dropdown-menu">
                                    <li className="dropdown-header">NPCs tại địa điểm hiện tại</li>
                                    {nearbyNpcs.length > 0 ? (
                                        nearbyNpcs.map(npc => (
                                            <li key={npc.id} onClick={() => handleNpcClick(npc)} className="dropdown-item">
                                                {npc.displayName}
                                            </li>
                                        ))
                                    ) : (
                                        <li className="dropdown-empty">Không có NPC nào ở gần.</li>
                                    )}
                                </ul>
                            )}
                        </div>
                    </div>
                </div>
                
                <div 
                    ref={mapContainerRef} 
                    className={`map-view-2d ${isPanning ? 'panning' : ''} ${isAddingMarker ? 'is-adding-marker' : ''}`}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    onWheel={(e: ReactWheelEvent<HTMLDivElement>) => handleWheel(e)}
                    onClick={handleMapClick}
                >
                    <div className="map-plane-2d" style={{ transform: `scale(${view.zoom}) translate(${view.x}px, ${view.y}px)` }}>
                        {/* Render Locations */}
                        {map.locations.filter(loc => loc.discovered).map(loc => {
                            const owner = locationOwners.get(loc.name) || '???';
                            return (
                                <div key={loc.id} className="map-item location" style={{ left: loc.coordinates.x * MAP_SCALE, top: loc.coordinates.y * MAP_SCALE }} onClick={(e) => { e.stopPropagation(); setSelectedObject({ type: 'location', data: loc }); }}>
                                    <div className="map-item-label">
                                        <span className="location-name">{loc.name}</span>
                                        <span className="location-owner">Chủ sở hữu: {owner}</span>
                                    </div>
                                    <div className="map-item-icon" style={{ ['--icon-scale' as any]: getScaleMultiplier(loc.scale) }}>{getIconForLocationType(loc.type)}</div>
                                </div>
                            );
                        })}
                        {/* Render Markers */}
                        {(map.markers || []).map(marker => (
                             <div key={marker.id} className="map-item marker" style={{ left: marker.coordinates.x * MAP_SCALE, top: marker.coordinates.y * MAP_SCALE }} onClick={(e) => { e.stopPropagation(); setSelectedObject({ type: 'marker', data: marker }); }}>
                                <div className="map-item-label marker-label">
                                    <span className="location-name">{marker.label}</span>
                                </div>
                                <div className="map-item-icon">{marker.icon}</div>
                             </div>
                        ))}
                        {/* Render Characters */}
                        {charactersOnMap.map(char => (
                            <div 
                                key={char.id} 
                                className={`map-item character-pin ${char.isPlayer ? 'player' : 'npc'}`}
                                style={{ left: char.coordinates.x * MAP_SCALE, top: char.coordinates.y * MAP_SCALE }}
                                // FIX: Cast char.type to its more specific union type to satisfy TypeScript.
                                onClick={(e) => { e.stopPropagation(); setSelectedObject({ type: char.type as 'player' | 'npc', data: char.data }); }}
                            >
                                <div className="map-item-label character-label">{char.displayName}</div>
                                {char.isPlayer ? (
                                    <div className="player-icon">
                                        <div className="player-icon-dot"></div>
                                        <div className="player-icon-pulse"></div>
                                    </div>
                                ) : (
                                    <div className="character-avatar">
                                        {char.avatarUrl ? <img src={char.avatarUrl} alt={char.displayName} /> : <span>{char.displayName.charAt(0)}</span>}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
                
                {renderInfoPanel()}
            </div>
        </div>
    );
};