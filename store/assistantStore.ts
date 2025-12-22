import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    toolCall?: { name: string; args: any };
    toolResponse?: { name: string; result: any };
}

interface AssistantState {
    messages: Message[];
    isLoading: boolean;
    isVisible: boolean;
    addMessage: (content: string, role: 'user' | 'assistant', toolCall?: any, toolResponse?: any) => void;
    setLoading: (loading: boolean) => void;
    setVisible: (visible: boolean) => void;
    clearHistory: () => void;
}

export const useAssistantStore = create<AssistantState>()(
    persist(
        (set) => ({
            messages: [],
            isLoading: false,
            isVisible: false,
            addMessage: (content, role, toolCall, toolResponse) =>
                set((state) => ({
                    messages: [
                        ...state.messages,
                        {
                            id: Date.now().toString(),
                            role,
                            content,
                            timestamp: new Date(),
                            toolCall,
                            toolResponse,
                        },
                    ],
                })),
            setLoading: (isLoading) => set({ isLoading }),
            setVisible: (isVisible) => set({ isVisible }),
            clearHistory: () => set({ messages: [] }),
        }),
        {
            name: 'assistant-storage',
            storage: createJSONStorage(() => AsyncStorage),
            partialize: (state) => ({ messages: state.messages }), // Only persist messages
        }
    )
);
