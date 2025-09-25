/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import type { Stat } from '../../types';
// FIX: Added missing icons (LeafIcon, StarIcon, ScrollTextIcon) and replaced HerbIcon with LeafIcon.
import { 
    SwordIcon, GreatswordIcon, AxeIcon, HammerIcon, BowIcon, SpearIcon, StaffIcon, DaggerIcon, ShieldIcon, 
    ShirtIcon, CrownIcon, HandIcon, FootprintsIcon, RingIcon, GemIcon, WindIcon,
    FlaskConicalIcon, BookOpenCheckIcon, MapIcon, KeyIcon, LeafIcon, OreIcon, PackageIcon,
    FireIcon, SnowflakeIcon, ZapIcon, HeartPulseIcon, HeartHandshakeIcon, DnaIcon, CookingPotIcon, HexagonIcon, StarIcon, ScrollTextIcon
} from './Icons';
import { CRAFTING_TAGS } from '../../constants/tagConstants';

const getIconForItem = (item: Stat | undefined): React.ReactNode => {
    if (!item) return <PackageIcon />;

    const tags = item.tags?.map(t => t.toLowerCase()) || [];
    const name = (item.name || '').toLowerCase();
    const slot = (item.slot || '').toLowerCase();
    const category = (item.category || '').toLowerCase();
    const description = (item.description || '').toLowerCase();
    const combinedText = name + ' ' + description;

    // Priority 1: TAGS - Most specific and reliable
    const tagIconMap: { [key: string]: React.ReactNode } = {
        'kiếm': <SwordIcon />, 'đao': <GreatswordIcon />, 'rìu': <AxeIcon />, 'búa': <HammerIcon />,
        'cung': <BowIcon />, 'thương': <SpearIcon />, 'trượng': <StaffIcon />, 'dao': <DaggerIcon />,
        'khiên': <ShieldIcon />, 'giáp nặng': <ShieldIcon />, 'giáp nhẹ': <ShirtIcon />,
        'hỏa': <FireIcon />, 'băng': <SnowflakeIcon />, 'lôi': <ZapIcon />, 'phong': <WindIcon />,
        // FIX: StarIcon is now correctly imported.
        'thánh': <StarIcon />, 'ma đạo': <DnaIcon />, 'chữa thương': <HeartPulseIcon />, 'hồi phục': <HeartPulseIcon />,
        'hỗ trợ': <HeartHandshakeIcon />, 'tiêu hao': <FlaskConicalIcon />, 'sách': <BookOpenCheckIcon />,
        'bí kíp': <BookOpenCheckIcon />, 'bản đồ': <MapIcon />, 'chìa khóa': <KeyIcon />,
        // FIX: Replaced non-existent HerbIcon with LeafIcon.
        'nguyên liệu': <LeafIcon />, 'thảo dược': <LeafIcon />, 'khoáng sản': <OreIcon />, 'đá quý': <GemIcon />,
        'trang sức': <RingIcon />, 'nấu ăn': <CookingPotIcon />, 'rèn đúc': <HammerIcon />,
        'luyện đan': <FlaskConicalIcon />, 'trận pháp': <HexagonIcon />,
    };
    for (const tag of tags) {
        if (tagIconMap[tag]) return tagIconMap[tag];
    }
    if (tags.some(tag => tag.includes('vũ khí'))) return <SwordIcon />;

    // Priority 2: SLOT - For equipment without specific weapon tags
    if (slot) {
        if (slot.includes('vũ khí') || slot.includes('tay')) return <SwordIcon />;
        if (slot.includes('mũ')) return <CrownIcon />;
        if (slot.includes('thân')) return <ShirtIcon />;
        if (slot.includes('găng')) return <HandIcon />;
        if (slot.includes('giày')) return <FootprintsIcon />;
        if (slot.includes('nhẫn')) return <RingIcon />;
        if (slot.includes('cổ')) return <GemIcon />;
        if (slot.includes('áo choàng')) return <WindIcon />;
        if (slot.includes('lót')) return <ShirtIcon />;
    }

    // Priority 3: CATEGORY - For non-equipment items
    if (category) {
        // FIX: Replaced non-existent HerbIcon with LeafIcon.
        if (category.includes('nguyên liệu')) return <LeafIcon />;
        if (category.includes('sơ đồ chế tạo')) return <HammerIcon />;
        if (category.includes('công pháp') || category.includes('chiêu thức')) return <BookOpenCheckIcon />;
    }

    // Priority 4: KEYWORDS - Fallback search in name and description
    const keywordIconMap: { [key: string]: React.ReactNode } = {
        'kiếm': <SwordIcon />, 'đao': <GreatswordIcon />, 'rìu': <AxeIcon />, 'búa': <HammerIcon />,
        'cung': <BowIcon />, 'thương': <SpearIcon />, 'trượng': <StaffIcon />, 'dao': <DaggerIcon />,
        'khiên': <ShieldIcon />, 'giáp': <ShieldIcon />, 'mũ': <CrownIcon />, 'nón': <CrownIcon />,
        'găng': <HandIcon />, 'giày': <FootprintsIcon />, 'ủng': <FootprintsIcon />, 'hài': <FootprintsIcon />,
        'nhẫn': <RingIcon />, 'vòng': <GemIcon />, 'dây chuyền': <GemIcon />,
        'thuốc': <FlaskConicalIcon />, 'đan': <FlaskConicalIcon />, 'linh dược': <FlaskConicalIcon />,
        'sách': <BookOpenCheckIcon />, 'bí kíp': <BookOpenCheckIcon />, 
        // FIX: ScrollTextIcon is now correctly imported.
        'cuộn': <ScrollTextIcon />,
        'chìa': <KeyIcon />, 
        // FIX: Replaced non-existent HerbIcon with LeafIcon.
        'cỏ': <LeafIcon />, 'thảo': <LeafIcon />, 'dược': <LeafIcon />,
        'quặng': <OreIcon />, 'đá': <GemIcon />, 'ngọc': <GemIcon />,
        'lửa': <FireIcon />, 'hỏa': <FireIcon />, 'băng': <SnowflakeIcon />, 'tuyết': <SnowflakeIcon />,
        'sét': <ZapIcon />, 'lôi': <ZapIcon />, 'gió': <WindIcon />, 'phong': <WindIcon />,
        'hồi máu': <HeartPulseIcon />, 'chữa': <HeartPulseIcon />,
    };
    for (const keyword in keywordIconMap) {
        if (combinedText.includes(keyword)) return keywordIconMap[keyword];
    }
    
    // Priority 5: DEFAULT ICON
    return <PackageIcon />;
};


export const ItemIcon = ({ item }: { item: Stat }) => {
    return <>{getIconForItem(item)}</>;
};
