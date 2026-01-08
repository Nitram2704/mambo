import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AccessibilityState {
    // User preferences
    fontSize: 'small' | 'medium' | 'large' | 'xlarge';
    highContrast: boolean;
    reduceMotion: boolean;

    // Actions
    setFontSize: (size: 'small' | 'medium' | 'large' | 'xlarge') => void;
    toggleHighContrast: () => void;
    toggleReduceMotion: () => void;
    reset: () => void;
}

export const useAccessibilityStore = create<AccessibilityState>()(
    persist(
        (set) => ({
            // Default values
            fontSize: 'medium',
            highContrast: false,
            reduceMotion: false,

            // Actions
            setFontSize: (size) => set({ fontSize: size }),

            toggleHighContrast: () => set((state) => ({
                highContrast: !state.highContrast
            })),

            toggleReduceMotion: () => set((state) => ({
                reduceMotion: !state.reduceMotion
            })),

            reset: () => set({
                fontSize: 'medium',
                highContrast: false,
                reduceMotion: false
            }),
        }),
        {
            name: 'accessibility-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
