import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getLocalDateString } from '@/utils/dateUtils';

export type SleepQuality = 1 | 2 | 3 | 4 | 5;
export type SleepTag = 'restless' | 'dreams' | 'interrupted' | 'refreshed';

export interface SleepLog {
    id: string;
    date: string; // YYYY-MM-DD
    bedTime: Date;
    wakeTime: Date;
    duration: number; // minutes
    quality: SleepQuality;
    notes?: string;
    tags?: SleepTag[];
    dailyScore?: number; // 0-100
    noiseEvents?: number;
    createdAt: Date;
}

export interface SleepGoals {
    targetHours: number;
    targetBedtime: string; // HH:mm format
    targetWakeTime: string; // HH:mm format
}

export interface SleepStats {
    avgDuration: number;
    avgQuality: number;
    consistency: number; // 0-100%
    streak: number;
    chronotype?: 'Lion' | 'Bear' | 'Wolf' | 'Dolphin';
    sleepDebt: number; // minutes
}

interface SleepState {
    sleepLogs: Record<string, SleepLog>;
    sleepGoals: SleepGoals | null;
    chronotype: 'Bear' | 'Lion' | 'Wolf' | 'Dolphin';
    sleepDebt: number; // minutes
    logSleep: (sleepData: Omit<SleepLog, 'id' | 'createdAt' | 'duration'>) => void;
    updateSleep: (id: string, updates: Partial<SleepLog>) => void;
    deleteSleep: (id: string) => void;
    getTodaySleep: () => SleepLog | null;
    getLastNightSleep: () => SleepLog | null;
    getWeekSleep: () => SleepLog[];
    getWeeklyStats: () => SleepStats;
    setSleepGoals: (goals: SleepGoals) => void;
    calculateAndSaveScore: (date: string, noiseEvents?: number) => void;
    updateChronotype: () => void;
    calculateSleepDebt: () => void;
}

export const useSleepStore = create<SleepState>()(
    persist(
        (set, get) => ({
            sleepLogs: {},
            sleepGoals: {
                targetHours: 8,
                targetBedtime: '23:00',
                targetWakeTime: '07:00',
            },
            chronotype: 'Bear',
            sleepDebt: 0,

            logSleep: (sleepData) => {
                // Calculate duration in minutes
                const bedTime = new Date(sleepData.bedTime);
                const wakeTime = new Date(sleepData.wakeTime);
                let duration = (wakeTime.getTime() - bedTime.getTime()) / (1000 * 60);

                // Handle cross-midnight sleep
                if (duration < 0) {
                    duration += 24 * 60; // Add 24 hours
                }

                const newLog: SleepLog = {
                    ...sleepData,
                    id: `sleep-${Date.now()}`,
                    duration: Math.round(duration),
                    createdAt: new Date(),
                };

                set((state) => ({
                    sleepLogs: {
                        ...state.sleepLogs,
                        [sleepData.date]: newLog,
                    },
                }));
            },

            updateSleep: (id, updates) => {
                set((state) => {
                    const updatedLogs = { ...state.sleepLogs };
                    const logEntry = Object.values(updatedLogs).find((log) => log.id === id);

                    if (logEntry) {
                        const date = logEntry.date;
                        updatedLogs[date] = { ...logEntry, ...updates };

                        // Recalculate duration if times changed
                        if (updates.bedTime || updates.wakeTime) {
                            const bedTime = new Date(updates.bedTime || logEntry.bedTime);
                            const wakeTime = new Date(updates.wakeTime || logEntry.wakeTime);
                            let duration = (wakeTime.getTime() - bedTime.getTime()) / (1000 * 60);
                            if (duration < 0) duration += 24 * 60;
                            updatedLogs[date].duration = Math.round(duration);
                        }
                    }

                    return { sleepLogs: updatedLogs };
                });
            },

            deleteSleep: (id) => {
                set((state) => {
                    const updatedLogs = { ...state.sleepLogs };
                    const dateToDelete = Object.keys(updatedLogs).find(
                        (date) => updatedLogs[date].id === id
                    );
                    if (dateToDelete) {
                        delete updatedLogs[dateToDelete];
                    }
                    return { sleepLogs: updatedLogs };
                });
            },

            getTodaySleep: () => {
                const today = getLocalDateString();
                return get().sleepLogs[today] || null;
            },

            getLastNightSleep: () => {
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                const yesterdayStr = getLocalDateString(yesterday);
                return get().sleepLogs[yesterdayStr] || null;
            },

            getWeekSleep: () => {
                const logs: SleepLog[] = [];
                const today = new Date();

                for (let i = 6; i >= 0; i--) {
                    const date = new Date(today);
                    date.setDate(today.getDate() - i);
                    const dateStr = getLocalDateString(date);
                    const log = get().sleepLogs[dateStr];
                    if (log) {
                        logs.push(log);
                    }
                }

                return logs;
            },

            getWeeklyStats: () => {
                const logs = get().getWeekSleep();
                if (logs.length === 0) {
                    return {
                        avgDuration: 0,
                        avgQuality: 0,
                        consistency: 0,
                        streak: 0,
                        sleepDebt: 0,
                    };
                }

                const avgDuration = logs.reduce((sum, log) => sum + log.duration, 0) / logs.length;
                const avgQuality = logs.reduce((sum, log) => sum + log.quality, 0) / logs.length;
                const targetHours = get().sleepGoals?.targetHours || 8;
                const sleepDebt = logs.reduce((debt, log) => debt + Math.max(0, (targetHours * 60) - log.duration), 0);

                // Calculate consistency (how close to target hours)
                const consistency = logs.reduce((sum, log) => {
                    const diff = Math.abs(log.duration - (targetHours * 60));
                    return sum + Math.max(0, 100 - (diff / (targetHours * 60)) * 100);
                }, 0) / logs.length;

                return {
                    avgDuration: Math.round(avgDuration),
                    avgQuality: Math.round(avgQuality * 10) / 10,
                    consistency: Math.round(consistency),
                    streak: 0, // TODO: Implement streak calculation
                    sleepDebt: Math.round(sleepDebt),
                };
            },

            setSleepGoals: (goals) => set({ sleepGoals: goals }),

            calculateAndSaveScore: (date, noiseEvents = 0) => {
                const { calculateSleepScore } = require('@/utils/sleepScoring');
                const state = get();
                const log = state.sleepLogs[date];
                if (!log) return;

                const score = calculateSleepScore(log, state.sleepGoals, noiseEvents);

                set((state) => ({
                    sleepLogs: {
                        ...state.sleepLogs,
                        [date]: {
                            ...log,
                            dailyScore: score,
                            noiseEvents: noiseEvents,
                        },
                    },
                }));
            },

            updateChronotype: () => {
                const { getChronotype } = require('@/utils/sleepScoring');
                const logs = Object.values(get().sleepLogs);
                if (logs.length < 3) return;

                const avgBedtimeMins = logs.reduce((sum, log) => {
                    const bedTime = new Date(log.bedTime);
                    let mins = bedTime.getHours() * 60 + bedTime.getMinutes();
                    // Handle times after midnight (0-4 AM) as late night
                    if (mins < 300) mins += 1440;
                    return sum + mins;
                }, 0) / logs.length;

                const chronotype = getChronotype(avgBedtimeMins % 1440);
                set({ chronotype });
            },

            calculateSleepDebt: () => {
                const logs = get().getWeekSleep();
                const targetHours = get().sleepGoals?.targetHours || 8;
                const targetMinutes = targetHours * 60;

                const debt = logs.reduce((acc, log) => {
                    return acc + (targetMinutes - log.duration);
                }, 0);

                set({ sleepDebt: Math.max(0, debt) });
            },
        }),
        {
            name: 'sleep-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);

// Helper function to format duration
export function formatSleepDuration(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

// Helper function to get quality label
export function getSleepQualityLabel(quality: SleepQuality): string {
    const labels = {
        1: 'Muy Malo',
        2: 'Malo',
        3: 'Regular',
        4: 'Bueno',
        5: 'Excelente',
    };
    return labels[quality];
}
