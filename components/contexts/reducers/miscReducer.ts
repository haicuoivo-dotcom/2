/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import type { Draft } from 'immer';
import { generateUniqueId } from '../../../utils/id';
// FIX: getCurrencyName is exported from utils/hydration, not utils/game.
import { gameTimeToMinutes, getCurrencyName } from '../../../utils/game';
import type { State, Action } from '../GameContext';
import type { Character, AuctionItem, AuctionState, Stat, GameState, WorldSettings } from '../../../types';

const selectPotentialBidders = (gameState: Draft<GameState>, worldSettings: WorldSettings, itemForAuction: Stat): string[] => {
    const currencyName = getCurrencyName(worldSettings.genre, worldSettings.setting);
    const potentialNpcs = gameState.knowledgeBase.npcs.filter(npc => {
        // Rule 1: Must be alive
        if (npc.stats?.some(s => s.name === 'Trạng thái Tử vong')) {
            return false;
        }

        // Rule 2: Must have enough money (at least starting price)
        const moneyStat = npc.stats?.find(s => s.name === currencyName);
        const npcMoney = typeof moneyStat?.value === 'number' ? moneyStat.value : 0;
        if (npcMoney < (itemForAuction.price || 100)) {
            return false;
        }

        // Rule 3: Must have a "need" for the item (simplified logic)
        const npcClass = npc.stats?.find(s => s.name === 'Chức nghiệp')?.value;
        const itemTags = itemForAuction.tags || [];
        const itemSlot = itemForAuction.slot;

        if (itemSlot?.includes('Vũ khí') || itemTags.includes('Kiếm') || itemTags.includes('Đao')) {
            if (npcClass === 'Kiếm sĩ' || npcClass === 'Chiến binh') return true;
        }
        if (itemSlot?.includes('Giáp') || itemTags.includes('Giáp')) {
             if (npcClass === 'Kiếm sĩ' || npcClass === 'Chiến binh' || npcClass === 'Kỵ sĩ') return true;
        }
        if (itemSlot?.includes('Trượng') || itemTags.includes('Phép thuật')) {
            if (npcClass === 'Pháp sư' || npcClass === 'Tu sĩ') return true;
        }
        
        // Default: If no specific need is found, give a 30% chance to be interested anyway (e.g., for resale)
        return Math.random() < 0.3;
    });

    // Shuffle and pick 10-15
    const shuffled = potentialNpcs.sort(() => 0.5 - Math.random());
    const count = Math.floor(Math.random() * 6) + 10; // 10 to 15
    return shuffled.slice(0, count).map(npc => npc.name);
};


export const miscReducer = (draft: Draft<State>, action: Action): void => {
    const { gameState } = draft;
    
    if (!gameState) {
        // Handle error or return early if gameState is null
        console.error('Cannot process action - gameState is null');
        return;
    }

    switch (action.type) {
        case 'PAUSE_GAME':
            gameState.isPaused = true;
            return;
        case 'RESUME_GAME':
            gameState.isPaused = false;
            return;
        case 'UPDATE_SAVE_ID':
            gameState.saveId = action.payload;
            return;
        case 'PROCESS_AUCTIONS': {
            const { currentTime } = action.payload;
            const ongoingAuctions: AuctionItem[] = [];
            const finishedAuctions: AuctionItem[] = [];
            gameState.auctionHouse.forEach(auction => {
                if (gameTimeToMinutes(auction.auctionEndTime) <= gameTimeToMinutes(currentTime)) {
                    finishedAuctions.push(auction);
                } else {
                    ongoingAuctions.push(auction);
                }
            });

            if (finishedAuctions.length === 0) return;

            const currencyName = getCurrencyName(draft.worldSettings.genre, draft.worldSettings.setting);
            const findAndMutateCharacter = (name: string, callback: (char: Character) => void) => {
                if (gameState.character.name === name) {
                    callback(gameState.character); return;
                }
                const npc = gameState.knowledgeBase.npcs.find((n: Character) => n.name === name);
                if (npc) callback(npc);
            };

            finishedAuctions.forEach(auction => {
                const { sellerName, highestBidder, currentBid, item } = auction;
                if (highestBidder !== 'Chưa có' && highestBidder !== sellerName) {
                    findAndMutateCharacter(highestBidder, buyer => {
                        if (!buyer.stats.some(s => s.id === item.id)) buyer.stats.push(item);
                        const moneyStat = buyer.stats.find(s => s.name === currencyName);
                        if (moneyStat && typeof moneyStat.value === 'number') moneyStat.value -= currentBid;
                    });
                    findAndMutateCharacter(sellerName, seller => {
                        const moneyStat = seller.stats.find(s => s.name === currencyName);
                        if (moneyStat && typeof moneyStat.value === 'number') moneyStat.value += currentBid;
                    });
                } else { 
                    findAndMutateCharacter(sellerName, seller => {
                        if (!seller.stats.some(s => s.id === item.id)) seller.stats.push(item);
                    });
                }
            });
            
            gameState.auctionHouse = ongoingAuctions;
            return;
        }
        case 'PLACE_BID': {
            const { auctionId, bidAmount, bidderName } = action.payload;
            if (gameState.auctionState?.isActive) {
                const auction = gameState.auctionState;
                auction.bidLog.push({ bidder: bidderName, amount: bidAmount, timestamp: Date.now() });
                if (auction.endTime - Date.now() < 15000) auction.endTime = Date.now() + 15000;
                auction.currentBid = bidAmount;
                auction.highestBidder = bidderName;
                return;
            }
            const auctionIndex = gameState.auctionHouse.findIndex(a => a.id === auctionId);
            if (auctionIndex > -1) {
                const auction = gameState.auctionHouse[auctionIndex];
                auction.currentBid = bidAmount;
                auction.highestBidder = bidderName;
                if (!auction.bidLog) {
                    auction.bidLog = [];
                }
                auction.bidLog.push({ bidder: bidderName, amount: bidAmount, timestamp: Date.now() });
            }
            return;
        }
        case 'START_AUCTION': {
            const { itemId } = action.payload;
            const itemToSell = gameState.character.stats.find(s => s.id === itemId);
            if (!itemToSell) return;
            const potentialBidders = selectPotentialBidders(gameState, draft.worldSettings, itemToSell);
            const newAuctionState: AuctionState = {
                isActive: true, item: itemToSell, sellerName: gameState.character.name, startTime: Date.now(), endTime: Date.now() + 5 * 60 * 1000, startingBid: itemToSell.price || 100, currentBid: itemToSell.price || 100, highestBidder: 'Chưa có', bidLog: [], potentialBidders,
            };
            gameState.character.stats = gameState.character.stats.filter(s => s.id !== itemId);
            gameState.auctionState = newAuctionState;
            return;
        }
        case 'END_AUCTION': {
            const { auctionState, character, knowledgeBase } = gameState;
            if (!auctionState || !auctionState.isActive) return;
            const { item, highestBidder, currentBid, sellerName } = auctionState;
            const currencyName = getCurrencyName(draft.worldSettings.genre, draft.worldSettings.setting);

            const findAndMutateCharacter = (name: string, callback: (char: Character) => void) => {
                if (character.name === name) { callback(character); return; }
                const npc = knowledgeBase.npcs.find(n => n.name === name);
                if (npc) callback(npc);
            };

            if (highestBidder !== 'Chưa có' && highestBidder !== sellerName) {
                // Someone won
                findAndMutateCharacter(highestBidder, winner => {
                    if (!winner.stats) winner.stats = [];
                     // Deduct money
                    const moneyStat = winner.stats.find(s => s.name === currencyName);
                    if (moneyStat && typeof moneyStat.value === 'number') {
                        moneyStat.value -= currentBid;
                    }
                     // Add item
                    if (!winner.stats.some(s => s.id === item.id)) {
                        winner.stats.push(item);
                    }
                });
                findAndMutateCharacter(sellerName, seller => {
                    if (!seller.stats) seller.stats = [];
                     // Add money
                    const moneyStat = seller.stats.find(s => s.name === currencyName);
                    if (moneyStat && typeof moneyStat.value === 'number') {
                        moneyStat.value += currentBid;
                    } else if (moneyStat) {
                        moneyStat.value = currentBid;
                    } else {
                        seller.stats.push({ id: generateUniqueId('stat-money'), name: currencyName, value: currentBid, category: 'Tài sản', description: 'Tiền tệ' });
                    }
                });
            } else {
                // No one bought it, return to seller
                findAndMutateCharacter(sellerName, seller => {
                    if (!seller.stats.some(s => s.id === item.id)) {
                        seller.stats.push(item);
                    }
                });
            }
            
            gameState.auctionState = undefined;
            return;
        }
        case 'START_TEST_AUCTION': {
            const testItem: Stat = {
                id: generateUniqueId('item-test-auction'),
                name: "Thánh Kiếm Quang Minh",
                description: "Một thanh kiếm huyền thoại tỏa ra ánh sáng thánh khiết, có khả năng tiêu diệt mọi thế lực hắc ám.",
                category: "Vật phẩm",
                slot: "Vũ khí (Tay Phải)",
                tags: ["1-tay", "Kiếm", "Thánh"],
                effects: [
                    { targetStat: "Tấn Công", modifier: "+150" },
                    { targetStat: "Sát thương Ám", modifier: "+50%" }
                ],
                rarity: "Huyền thoại",
                price: 50000,
            };

            const availableNpcs = gameState.knowledgeBase.npcs;
            const seller = availableNpcs.length > 0
                ? availableNpcs[Math.floor(Math.random() * availableNpcs.length)]
                : { name: "Nhà Đấu Giá Hoàng Gia", displayName: "Nhà Đấu Giá Hoàng Gia" };
            
            const potentialBidders = selectPotentialBidders(gameState, draft.worldSettings, testItem);

            const newAuctionState: AuctionState = {
                isActive: true,
                item: testItem,
                sellerName: seller.name,
                startTime: Date.now(),
                endTime: Date.now() + 5 * 60 * 1000, // 5 minutes from now
                startingBid: testItem.price || 50000,
                currentBid: testItem.price || 50000,
                highestBidder: 'Chưa có',
                bidLog: [],
                potentialBidders: potentialBidders,
            };

            gameState.auctionState = newAuctionState;
            return;
        }
    }
};