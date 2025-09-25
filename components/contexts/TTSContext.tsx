/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { createContext, useState, useContext, useEffect, useCallback, useRef, ReactNode } from 'react';
import { useSettings } from './SettingsContext';
import { stripThinkingBlock } from '../../utils/text';

interface TTSContextType {
    isSpeaking: boolean;
    isPaused: boolean;
    voices: SpeechSynthesisVoice[];
    speak: (text: string) => void;
    pause: () => void;
    resume: () => void;
    cancel: () => void;
}

const TTSContext = createContext<TTSContextType | undefined>(undefined);

export const TTSProvider = ({ children }: { children: ReactNode }) => {
    const { settings } = useSettings();
    const { enableTTS, ttsVoiceURI, ttsRate, ttsPitch } = settings;

    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
    
    const utteranceQueue = useRef<SpeechSynthesisUtterance[]>([]);
    const currentUtterance = useRef<SpeechSynthesisUtterance | null>(null);

    const populateVoiceList = useCallback(() => {
        const newVoices = window.speechSynthesis.getVoices();
        setVoices(newVoices);
    }, []);

    useEffect(() => {
        populateVoiceList();
        if (window.speechSynthesis.onvoiceschanged !== undefined) {
            window.speechSynthesis.onvoiceschanged = populateVoiceList;
        }
    }, [populateVoiceList]);

    const selectVoice = useCallback((preference: string): SpeechSynthesisVoice | null => {
        const allVoices = window.speechSynthesis.getVoices();
        if (allVoices.length === 0) return null;

        // Handle specific voice URI
        if (!preference.startsWith('auto-')) {
            return allVoices.find(v => v.voiceURI === preference) || null;
        }

        const viVoices = allVoices.filter(v => v.lang.startsWith('vi'));
        if (viVoices.length === 0) {
            // Fallback to any English voice if no Vietnamese voice is available
            const enVoices = allVoices.filter(v => v.lang.startsWith('en'));
            return enVoices[0] || allVoices[0];
        }

        if (preference === 'auto-female') {
            const femaleVoice = viVoices.find(v => v.name.toLowerCase().includes('nữ')) || 
                                viVoices.find(v => v.name.toLowerCase().includes('female')) ||
                                viVoices.find(v => ['linh', 'my', 'mai'].some(name => v.name.toLowerCase().includes(name)));
            return femaleVoice || viVoices[0];
        }

        if (preference === 'auto-male') {
            const maleVoice = viVoices.find(v => v.name.toLowerCase().includes('nam')) ||
                              viVoices.find(v => v.name.toLowerCase().includes('male'));
            return maleVoice || viVoices[0];
        }

        // Default for 'auto-best' or any other 'auto-'
        return viVoices[0];
    }, []);

    const playNextInQueue = useCallback(() => {
        if (utteranceQueue.current.length === 0 || window.speechSynthesis.speaking) {
            if(utteranceQueue.current.length === 0) {
                setIsSpeaking(false);
                currentUtterance.current = null;
            }
            return;
        }

        const utterance = utteranceQueue.current.shift();
        if (!utterance) return;
        
        currentUtterance.current = utterance;
        
        const selectedVoice = selectVoice(ttsVoiceURI);
        utterance.voice = selectedVoice;
        utterance.rate = ttsRate;
        utterance.pitch = ttsPitch;

        utterance.onstart = () => {
            setIsSpeaking(true);
            setIsPaused(false);
        };

        utterance.onend = () => {
            playNextInQueue();
        };

        utterance.onerror = (event: SpeechSynthesisErrorEvent) => {
            // FIX: Improved error logging to be more descriptive than '[object Object]'.
            console.error(`SpeechSynthesisUtterance.onerror: ${event.error}`, event);
            setIsSpeaking(false);
            currentUtterance.current = null;
            playNextInQueue(); // Try next item
        };
        
        window.speechSynthesis.speak(utterance);

    }, [ttsVoiceURI, ttsRate, ttsPitch, selectVoice]);
    
    const cancel = useCallback(() => {
        utteranceQueue.current = [];
        currentUtterance.current = null;
        setIsSpeaking(false);
        setIsPaused(false);
        window.speechSynthesis.cancel();
    }, []);

    useEffect(() => {
        if (!enableTTS) {
            cancel();
        }
    }, [enableTTS, cancel]);

    const speak = useCallback((text: string) => {
        if (!enableTTS || !text.trim()) return;

        cancel(); // Cancel any current speech to start the new one immediately

        const cleanedText = stripThinkingBlock(text.replace(/\[.*?\]/g, ''));
        const sentences = cleanedText.match(/[^.!?]+[.!?]+/g) || [cleanedText];

        sentences.forEach(sentence => {
            const utterance = new SpeechSynthesisUtterance(sentence);
            utteranceQueue.current.push(utterance);
        });
        
        // FIX: Add a small delay to work around a browser bug where speak() fails if called immediately after cancel().
        setTimeout(() => playNextInQueue(), 100);
    }, [enableTTS, playNextInQueue, cancel]);

    const pause = useCallback(() => {
        if (isSpeaking) {
            window.speechSynthesis.pause();
            setIsPaused(true);
            setIsSpeaking(false);
        }
    }, [isSpeaking]);
    
    const resume = useCallback(() => {
        if (isPaused) {
            window.speechSynthesis.resume();
            setIsPaused(false);
            setIsSpeaking(true);
        }
    }, [isPaused]);


    const value = {
        isSpeaking,
        isPaused,
        voices,
        speak,
        pause,
        resume,
        cancel,
    };

    return <TTSContext.Provider value={value}>{children}</TTSContext.Provider>;
};

export const useTTS = () => {
    const context = useContext(TTSContext);
    if (context === undefined) {
        throw new Error('useTTS must be used within a TTSProvider');
    }
    return context;
};
