/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { FANTASY_RANK_DATA } from '../constants/gameConstants';
import type { GameTime } from '../types';

const MODERN_GENRES_INTERNAL = ['Đô Thị Hiện Đại', 'Đô Thị Hiện Đại 100% bình thường', 'Đô Thị Dị Biến', 'Hậu Tận Thế'];

export const getCurrencyName = (genre: string, setting: string): string => {
    if (MODERN_GENRES_INTERNAL.includes(genre)) {
        switch (setting) {
            case 'Trung Quốc': return 'Nhân Dân Tệ';
            case 'Nhật Bản': return 'Yên';
            case 'Hàn Quốc': return 'Won';
            case 'Fantasy phương Tây': return 'Đô la';
            default: return 'Tiền'; // Fallback for modern settings like 'Tự Do'
        }
    }

    switch (genre) {
        case 'Tu Tiên':
        case 'Huyền Huyễn Truyền Thuyết':
            return 'Linh Thạch';
        case 'Võ Lâm':
        case 'Thời Chiến (Trung Hoa/Nhật Bản)':
            return 'Lượng Bạc';
        case 'Dị Giới Fantasy':
        case 'Thế Giới Giả Tưởng (Game/Tiểu Thuyết)':
            return 'Đồng';
        default:
            return 'Tiền';
    }
};

export const formatCurrency = (amount: number, genre: string, setting: string): string => {
    if (typeof amount !== 'number' || isNaN(amount)) {
        amount = 0;
    }

    const isFantasy = ['Dị Giới Fantasy', 'Thế Giới Giả Tưởng (Game/Tiểu Thuyết)'].includes(genre);

    if (isFantasy) {
        const gold = Math.floor(amount / 100);
        const silver = Math.floor((amount % 100) / 10);
        const copper = amount % 10;

        const parts: string[] = [];
        if (gold > 0) parts.push(`${gold} Vàng`);
        if (silver > 0) parts.push(`${silver} Bạc`);
        if (copper > 0 || amount === 0) parts.push(`${copper} Đồng`);

        return parts.join(', ');
    }
    
    const currencyName = getCurrencyName(genre, setting);
    return `${amount.toLocaleString('vi-VN')} ${currencyName}`;
};

export const formatBytes = (bytes: number, decimals = 2) => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

export const getBase64ImageSize = (base64String: string): number => {
    if (!base64String) return 0;
    const pureBase64 = base64String.split(',').pop() || '';
    if (!pureBase64) return 0;
    const padding = (pureBase64.match(/(=*)$/) || [])[1]?.length || 0;
    return (pureBase64.length * 3 / 4) - padding;
};

export const formatFantasyRank = (rankValue: string | null | undefined): string => {
    if (!rankValue) return '';

    const rankStr = rankValue.trim().toLowerCase();
    
    // Check if it's already in the correct format like "S (Orichalcum)"
    const formattedMatch = rankValue.match(/^([A-Z]+)\s\((.+)\)$/i);
    if (formattedMatch) {
        const [, short, long] = formattedMatch;
        const found = FANTASY_RANK_DATA.find(r => r.short.toLowerCase() === short.toLowerCase() && r.long.toLowerCase() === long.toLowerCase());
        if (found) {
            return rankValue; // It's already correctly formatted
        }
    }

    // Find a match based on short or long name
    for (const rank of FANTASY_RANK_DATA) {
        if (rank.short.toLowerCase() === rankStr || rank.long.toLowerCase() === rankStr) {
            return `${rank.short} (${rank.long})`;
        }
    }

    // Fallback: return the original value if no match is found
    return rankValue;
};

export const formatRemainingTime = (totalMinutes: number): string => {
    if (totalMinutes <= 0) return 'Hết hạn';
    const days = Math.floor(totalMinutes / 1440);
    const hours = Math.floor((totalMinutes % 1440) / 60);
    const minutes = Math.round(totalMinutes % 60);
    let result = '';
    if (days > 0) result += `${days} ngày `;
    if (hours > 0) result += `${hours} giờ `;
    if (minutes > 0) result += `${minutes} phút`;
    return result.trim() || 'Dưới 1 phút';
};

export const getRarityClass = (rarity: string | undefined): string => {
    if (!rarity) return 'rarity--pho-thong';
    // Convert Vietnamese string to a url-friendly, css-class-friendly format
    return `rarity--${rarity
        .toLowerCase()
        .replace(/\s+/g, '-') // Replace spaces with -
        .replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a")
        .replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e")
        .replace(/ì|í|ị|ỉ|ĩ/g, "i")
        .replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o")
        .replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u")
        .replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y")
        .replace(/đ/g, "d")
    }`;
};
