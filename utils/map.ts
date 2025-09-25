/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { generateUniqueId } from './id';
import type { MapLocation, GameState, Stat } from '../types';

const LOCATION_TYPE_KEYWORDS: Record<string, string[]> = {
    // Specific buildings first
    Tavern: ['quán trọ', 'khách điếm', 'tửu lầu', 'quán rượu'],
    Shop: ['chợ', 'phường thị', 'cửa hàng', 'tiệm', 'cửa tiệm', 'gian hàng'],
    Academy: ['học viện', 'trường học', 'thư viện', 'tàng kinh các'],
    Mine: ['mỏ', 'hầm mỏ', 'quặng', 'linh mạch'],
    Gate: ['cổng thành', 'cổng'],
    Bridge: ['cầu'],
    Port: ['cảng', 'bến cảng', 'bến tàu'],
    Farm: ['nông trại', 'trang viên', 'ruộng'],
    Graveyard: ['nghĩa địa', 'nghĩa trang', 'mộ', 'lăng mộ'],
    Arena: ['đấu trường', 'sàn đấu', 'sân đấu', 'sân vận động', 'võ đài'],

    // Faction/Religion
    Sect: ['tông môn', 'môn phái', 'thánh địa', 'bang hội', 'trụ sở', 'tổng đàn', 'giáo'],
    Temple: ['đền', 'chùa', 'miếu', 'tự'],
    Church: ['thánh đường', 'nhà thờ'],

    // Large structures
    Capital: ['kinh thành', 'hoàng thành', 'đế đô'],
    Castle: ['lâu đài', 'cung điện', 'pháo đài', 'hoàng cung'],
    City: ['thành phố', 'thành', 'cố đô', 'đô thị'],
    Town: ['thị trấn', 'trấn'],
    Village: ['làng', 'thôn', 'trang'],
    Tower: ['tháp', 'ngọn tháp'],
    Ruin: ['tàn tích', 'phế tích', 'di tích', 'thành cổ'],

    // Natural locations
    Dungeon: ['hầm ngục', 'mê cung', 'bí cảnh', 'hang ổ'],
    Cave: ['hang động', 'động', 'địa đạo'],
    Mountain: ['núi', 'dãy núi', 'đỉnh núi', 'sơn mạch'],
    Forest: ['rừng', 'khu rừng', 'lâm', 'rừng rậm', 'thung lũng'],
    River: ['sông', 'hồ', 'suối', 'nguồn', 'dòng sông', 'thác'],
    Swamp: ['đầm lầy', 'bãi lầy'],
    Desert: ['sa mạc', 'hoang mạc'],
    Plain: ['đồng bằng', 'cánh đồng', 'thảo nguyên'],
    Sea: ['biển', 'đại dương', 'vịnh'],
};

const LOCATION_TYPE_ICONS: Record<string, string> = {
    Capital: '👑',
    City: '🏙️',
    Town: '🏘️',
    Village: '🏡',
    Castle: '🏰',
    Forest: '🌲',
    Mountain: '⛰️',
    Cave: '🦇',
    River: '💧',
    Ruin: '🏛️',
    Plain: '🌾',
    Swamp: '🐊',
    Desert: '🏜️',
    Temple: '⛩️',
    Church: '⛪',
    Tower: '🗼',
    Sea: '🌊',
    Arena: '🏟️',
    Shop: '🛒',
    Tavern: '🍻',
    Mine: '⛏️',
    Sect: '🚩',
    Dungeon: '💀',
    Bridge: '🌉',
    Port: '⚓',
    Farm: '🧑‍🌾',
    Academy: '🎓',
    Graveyard: '🪦',
    Gate: '🚪',
    Default: '📍',
};

const LOCATION_TYPE_SCALE: Record<string, number> = {
    Capital: 5,
    Castle: 5,
    City: 4,
    Sect: 4,
    Mountain: 4,
    Forest: 4,
    Sea: 4,
    Town: 3,
    Temple: 3,
    Church: 3,
    Tower: 3,
    Arena: 3,
    Shop: 3,
    Dungeon: 3,
    Port: 3,
    Academy: 3,
    Plain: 3,
    Village: 2,
    Ruin: 2,
    Cave: 2,
    Swamp: 2,
    Desert: 2,
    Tavern: 2,
    Mine: 2,
    Farm: 2,
    Graveyard: 2,
    Gate: 2,
    River: 2,
    Bridge: 1,
    Default: 1,
};

export const getLocationType = (name: string, description: string): string => {
    const textToSearch = `${name.toLowerCase()} ${description.toLowerCase()}`;
    for (const type in LOCATION_TYPE_KEYWORDS) {
        if (LOCATION_TYPE_KEYWORDS[type].some(keyword => textToSearch.includes(keyword))) {
            return type;
        }
    }
    return 'Default';
};

export const getScaleForLocationType = (type: string): number => {
    return LOCATION_TYPE_SCALE[type] || LOCATION_TYPE_SCALE.Default;
};

export const getIconForLocationType = (type: string): string => {
    return LOCATION_TYPE_ICONS[type] || LOCATION_TYPE_ICONS.Default;
};

export const updateMapData = (
    storyText: string,
    currentState: GameState,
): GameState['map'] | null => {
    let mapChanged = false;
    const newMapState = JSON.parse(JSON.stringify(currentState.map));
    const allKnownLocations = currentState.knowledgeBase.locations;

    const occupiedCoords = new Set(newMapState.locations.map((loc: MapLocation) => `${loc.coordinates.x},${loc.coordinates.y}`));

    const locRegex = /\[LOC:([^\]]+)\]/g;

    let match;
    while ((match = locRegex.exec(storyText)) !== null) {
        const locName = match[1];
        const mapLocation = newMapState.locations.find((l: MapLocation) => l.name === locName);

        if (mapLocation) {
            // Location exists on map, check if it's discovered
            if (!mapLocation.discovered) {
                mapLocation.discovered = true;
                mapChanged = true;
            }
        } else {
            // Location not on map, need to add it
            const kbLoc = allKnownLocations.find(l => l.name === locName);
            if (kbLoc) {
                // Find an empty spot for the new location. Spiral search around player.
                let x = newMapState.playerPosition.x;
                let y = newMapState.playerPosition.y;
                let foundSpot = false;
                let radius = 1;

                while (!foundSpot) {
                    for (let i = -radius; i <= radius; i++) {
                        for (let j = -radius; j <= radius; j++) {
                            // Only check the perimeter of the square
                            if (Math.abs(i) !== radius && Math.abs(j) !== radius) continue;
                            
                            const newX = x + i;
                            const newY = y + j;
                            if (!occupiedCoords.has(`${newX},${newY}`)) {
                                x = newX;
                                y = newY;
                                foundSpot = true;
                                break;
                            }
                        }
                        if (foundSpot) break;
                    }
                    radius++;
                }
                
                const locationType = getLocationType(kbLoc.name, kbLoc.description);
                const newLocation: MapLocation = {
                    id: generateUniqueId('map-loc-story'),
                    name: kbLoc.name,
                    description: kbLoc.description,
                    type: locationType,
                    scale: getScaleForLocationType(locationType),
                    coordinates: { x, y },
                    discovered: true, // Revealed by story
                };
                newMapState.locations.push(newLocation);
                occupiedCoords.add(`${x},${y}`);
                mapChanged = true;
            }
        }
    }

    return mapChanged ? newMapState : null;
};

export const updateMapWithRevealedLocations = (
    mapItems: Stat[],
    currentMap: GameState['map'],
    knowledgeBase: GameState['knowledgeBase']
): GameState['map'] | null => {
    let mapChanged = false;
    const newMapState = JSON.parse(JSON.stringify(currentMap));
    const allKnownLocations = knowledgeBase.locations;

    const occupiedCoords = new Set(newMapState.locations.map((loc: MapLocation) => `${loc.coordinates.x},${loc.coordinates.y}`));

    const locRegex = /\[LOC:([^\]]+)\]/g;

    mapItems.forEach(item => {
        const description = item.description || '';
        let match;
        while ((match = locRegex.exec(description)) !== null) {
            const locName = match[1];
            const mapLocation = newMapState.locations.find((l: MapLocation) => l.name === locName);

            if (mapLocation) {
                // Location exists on map, check if it's discovered
                if (!mapLocation.discovered) {
                    mapLocation.discovered = true;
                    mapChanged = true;
                }
            } else {
                // Location not on map, need to add it
                const kbLoc = allKnownLocations.find(l => l.name === locName);
                if (kbLoc) {
                    // Find an empty spot for the new location. Spiral search around player.
                    let x = newMapState.playerPosition.x;
                    let y = newMapState.playerPosition.y;
                    let foundSpot = false;
                    let radius = 1;

                    while (!foundSpot) {
                        for (let i = -radius; i <= radius; i++) {
                            for (let j = -radius; j <= radius; j++) {
                                // Only check the perimeter of the square
                                if (Math.abs(i) !== radius && Math.abs(j) !== radius) continue;
                                
                                const newX = x + i;
                                const newY = y + j;
                                if (!occupiedCoords.has(`${newX},${newY}`)) {
                                    x = newX;
                                    y = newY;
                                    foundSpot = true;
                                    break;
                                }
                            }
                            if (foundSpot) break;
                        }
                        radius++;
                    }
                    
                    const locationType = getLocationType(kbLoc.name, kbLoc.description);
                    const newLocation: MapLocation = {
                        id: generateUniqueId('map-loc-item'),
                        name: kbLoc.name,
                        description: kbLoc.description,
                        type: locationType,
                        scale: getScaleForLocationType(locationType),
                        coordinates: { x, y },
                        discovered: true, // Revealed by map
                    };
                    newMapState.locations.push(newLocation);
                    occupiedCoords.add(`${x},${y}`);
                    mapChanged = true;
                }
            }
        }
    });

    return mapChanged ? newMapState : null;
};
