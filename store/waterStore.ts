import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface WaterLog {
    id: string;
    amount: number; // ml
    timestamp: Date;
}

export interface DailyWater {
    date: string; // YYYY-MM-DD
    totalAmount: number;
    logs: WaterLog[];
    goal: number; // default 2500ml
}

interface WaterState {
    dailyWater: Record<string, DailyWater>;
    defaultGoal: number;

    // Actions
    addWater: (amount: number) => void;
    removeWater: (id: string) => void;
    setGoal: (amount: number) => void;

    // Selectors
    getTodayWater: () => DailyWater;
    getWeeklyAverage: () => number;
}

import { getLocalDateString } from '@/utils/dateUtils';

const getTodayKey = () => {
    return getLocalDateString();
};

const createEmptyDay = (date: string, goal: number): DailyWater => ({
    date,
    totalAmount: 0,
    logs: [],
    goal,
});

export const useWaterStore = create<WaterState>()(
    persist(
        (set, get) => ({
            dailyWater: {},
            defaultGoal: 2500,

            addWater: (amount) => {
                set((state) => {
                    const today = getTodayKey();
                    const currentDay = state.dailyWater[today] || createEmptyDay(today, state.defaultGoal);

                    const newLog: WaterLog = {
                        id: Date.now().toString(),
                        amount,
                        timestamp: new Date(),
                    };

                    return {
                        dailyWater: {
                            ...state.dailyWater,
                            [today]: {
                                ...currentDay,
                                totalAmount: currentDay.totalAmount + amount,
                                logs: [...currentDay.logs, newLog],
                            },
                        },
                    };
                });
            },

            removeWater: (id) => {
                set((state) => {
                    const today = getTodayKey();
                    const currentDay = state.dailyWater[today];

                    if (!currentDay) return state;

                    let logToRemove: WaterLog | undefined;
                    let newLogs = [...currentDay.logs];

                    if (id === 'last') {
                        logToRemove = newLogs.pop();
                    } else {
                        const index = newLogs.findIndex(l => l.id === id);
                        if (index !== -1) {
                            logToRemove = newLogs[index];
                            newLogs.splice(index, 1);
                        }
                    }

                    if (!logToRemove) return state;

                    return {
                        dailyWater: {
                            ...state.dailyWater,
                            [today]: {
                                ...currentDay,
                                totalAmount: Math.max(0, currentDay.totalAmount - logToRemove.amount),
                                logs: newLogs,
                            },
                        },
                    };
                });
            },

            setGoal: (amount) => {
                set((state) => {
                    const today = getTodayKey();
                    const currentDay = state.dailyWater[today] || createEmptyDay(today, amount);

                    return {
                        defaultGoal: amount,
                        dailyWater: {
                            ...state.dailyWater,
                            [today]: {
                                ...currentDay,
                                goal: amount,
                            },
                        },
                    };
                });
            },

            getTodayWater: () => {
                const today = getTodayKey();
                const state = get();
                return state.dailyWater[today] || createEmptyDay(today, state.defaultGoal);
            },

            getWeeklyAverage: () => {
                const state = get();
                const today = new Date();
                let total = 0;
                let days = 0;

                for (let i = 0; i < 7; i++) {
                    const d = new Date(today);
                    d.setDate(d.getDate() - i);
                    const key = d.toISOString().split('T')[0];
                    const dayData = state.dailyWater[key];

                    if (dayData && dayData.totalAmount > 0) {
                        total += dayData.totalAmount;
                        days++;
                    }
                }

                return days > 0 ? Math.round(total / days) : 0;
            },
        }),
        {
            name: 'water-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
