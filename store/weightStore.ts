import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface WeightLog {
    id: string;
    date: string; // YYYY-MM-DD
    weight: number; // kg
    photoUri?: string;
    note?: string;
    createdAt: Date;
}

interface WeightState {
    logs: WeightLog[];

    // Actions
    logWeight: (entry: Omit<WeightLog, 'id' | 'createdAt'>) => void;
    deleteLog: (id: string) => void;

    // Selectors
    getLatestWeight: () => number | null;
    getWeightHistory: () => WeightLog[];
    getProgressPhotos: () => WeightLog[];
}

export const useWeightStore = create<WeightState>()(
    persist(
        (set, get) => ({
            logs: [],

            logWeight: (entry) => {
                set((state) => {
                    const newLog: WeightLog = {
                        ...entry,
                        id: Date.now().toString(),
                        createdAt: new Date(),
                    };

                    // Add new log and sort by date descending
                    const updatedLogs = [...state.logs, newLog].sort((a, b) =>
                        new Date(b.date).getTime() - new Date(a.date).getTime()
                    );

                    return { logs: updatedLogs };
                });
            },

            deleteLog: (id) => {
                set((state) => ({
                    logs: state.logs.filter(l => l.id !== id),
                }));
            },

            getLatestWeight: () => {
                const { logs } = get();
                return logs.length > 0 ? logs[0].weight : null;
            },

            getWeightHistory: () => {
                return get().logs;
            },

            getProgressPhotos: () => {
                return get().logs.filter(log => log.photoUri);
            },
        }),
        {
            name: 'weight-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
