/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { repairJsonWithAI } from './ai';

export const stripEntityTags = (text: string | null | undefined): string => {
    if (!text) return '';
    return text.replace(/\[[A-Z_]+:([^\]]+)\]/g, '$1');
};

export const cleanAndStripTags = (text: string | null | undefined): string => {
    if (!text) return '';
    return stripEntityTags(text).replace(/\[|\]/g, '');
};

export const removeAccents = (str: string | null | undefined): string => {
    if (!str) return '';
    return str
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .replace(/Đ/g, "D");
};

export const stripThinkingBlock = (text: string | null | undefined): string => {
    if (!text) {
        return '';
    }
    return text.replace(/<thinking>[\s\S]*?<\/thinking>/, '').trim();
};

export const extractJsonFromString = async (text: string | null | undefined): Promise<any> => {
    if (!text) {
        return null;
    }

    let jsonText = text.trim();

    const markdownMatch = jsonText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (markdownMatch && markdownMatch[1]) {
        jsonText = markdownMatch[1].trim();
    }

    const firstBrace = jsonText.indexOf('{');
    const firstBracket = jsonText.indexOf('[');
    
    let startIndex = -1;

    if (firstBrace === -1 && firstBracket === -1) {
        console.warn("No JSON object/array start found in text. Attempting AI repair.", { originalText: text });
        const repairedJson = await repairJsonWithAI(text);
        try {
            return JSON.parse(repairedJson);
        } catch (repairError) {
             console.error("AI JSON repair also failed.", { repairError });
             return null;
        }
    }
    
    if (firstBrace === -1) {
        startIndex = firstBracket;
    } else if (firstBracket === -1) {
        startIndex = firstBrace;
    } else {
        startIndex = Math.min(firstBrace, firstBracket);
    }
    
    const lastBrace = jsonText.lastIndexOf('}');
    const lastBracket = jsonText.lastIndexOf(']');
    const endIndex = Math.max(lastBrace, lastBracket);

    if (endIndex === -1 || endIndex < startIndex) {
        console.error("Could not find a valid JSON end character '}' or ']' after start. Original text:", text);
        return null;
    }

    const potentialJson = jsonText.substring(startIndex, endIndex + 1);

    try {
        return JSON.parse(potentialJson);
    } catch (e) {
        console.warn("Initial JSON parsing failed. Attempting AI repair.", { originalError: e, attemptedJson: potentialJson });
        const repairedJson = await repairJsonWithAI(potentialJson);
        try {
            return JSON.parse(repairedJson);
        } catch (repairError) {
             console.error("All JSON extraction methods failed. AI repair also failed.", { originalText: text, finalAttempt: repairedJson, repairError });
             return null;
        }
    }
};

export const sanitizeTextForImagePrompt = (text: string): string => {
  const SENSITIVE_WORDS = [
    // English
    'naked', 'nude', 'bare', 'nipples', 'aureola', 'pussy', 'vagina', 'penis', 'cock', 'dick',
    'sex', 'sexual', 'intercourse', 'fuck', 'fucking', 'cum', 'ejaculation', 'sperm',
    'blood', 'bloody', 'gore', 'gory', 'wound', 'injury', 'kill', 'murder', 'death', 'decapitated', 'guts', 'intestines',
    'violen', // for violent, violence
    'torture', 'agon', // for agony
    'hentai', 'porn', 'erotic', 'lewd',

    // Vietnamese
    'khỏa thân', 'trần truồng', 'nude', 'ngực trần', 'nhũ hoa', 'đầu ti',
    'lồn', 'âm hộ', 'bướm', 'cu', 'cặc', 'dương vật',
    'làm tình', 'quan hệ', 'giao cấu', 'giao hợp', 'chịch', 'đụ',
    'tinh dịch', 'xuất tinh', 'bắn tinh',
    'máu', 'máu me', 'chết', 'giết', 'chém', 'chém giết',
    'ruột', 'nội tạng', 'tra tấn', 'bạo lực',
    'dâm', 'dục', 'khiêu dâm',
    'bú', 'liếm',
  ];

  const regex = new RegExp(`\\b(${SENSITIVE_WORDS.join('|')})\\b`, 'gi');
  
  return text.replace(regex, '').replace(/\s+/g, ' ').trim();
};