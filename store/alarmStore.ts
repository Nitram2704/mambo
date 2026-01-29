import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';

export interface Alarm {
    id: string;
    time: string; // HH:mm
    enabled: boolean;
    days: number[]; // 0-6 (Sunday-Saturday)
    label: string;
    sound: string;
    smartWake: boolean;
    smartWakeWindow: number; // minutes
    sunriseEffect: boolean;
}

interface AlarmState {
    alarms: Alarm[];
    addAlarm: (alarm: Omit<Alarm, 'id'>) => void;
    updateAlarm: (id: string, updates: Partial<Alarm>) => void;
    deleteAlarm: (id: string) => void;
    toggleAlarm: (id: string) => void;
    scheduleAlarms: () => Promise<void>;
}

export const useAlarmStore = create<AlarmState>()(
    persist(
        (set, get) => ({
            alarms: [],

            addAlarm: (alarm) => {
                const newAlarm = {
                    ...alarm,
                    id: Math.random().toString(36).substring(7),
                };
                set((state) => ({ alarms: [...state.alarms, newAlarm] }));
                get().scheduleAlarms();
            },

            updateAlarm: (id, updates) => {
                set((state) => ({
                    alarms: state.alarms.map((a) => (a.id === id ? { ...a, ...updates } : a)),
                }));
                get().scheduleAlarms();
            },

            deleteAlarm: (id) => {
                set((state) => ({
                    alarms: state.alarms.filter((a) => a.id !== id),
                }));
                get().scheduleAlarms();
            },

            toggleAlarm: (id) => {
                set((state) => ({
                    alarms: state.alarms.map((a) => (a.id === id ? { ...a, enabled: !a.enabled } : a)),
                }));
                get().scheduleAlarms();
            },

            scheduleAlarms: async () => {
                // Cancel all existing notifications first
                await Notifications.cancelAllScheduledNotificationsAsync();

                const { alarms } = get();
                const enabledAlarms = alarms.filter((a) => a.enabled);

                for (const alarm of enabledAlarms) {
                    const [hours, minutes] = alarm.time.split(':').map(Number);

                    // Schedule for each selected day
                    for (const day of alarm.days) {
                        // Expo Notifications weekday is 1-7 (Sunday is 1)
                        // Our days are 0-6 (Sunday is 0)
                        const weekday = day + 1;

                        await Notifications.scheduleNotificationAsync({
                            content: {
                                title: alarm.label || '¡Buenos días!',
                                body: 'Es hora de despertar y conquistar el día.',
                                sound: alarm.sound === 'default' ? true : alarm.sound,
                                data: { alarmId: alarm.id },
                            },
                            trigger: {
                                hour: hours,
                                minute: minutes,
                                repeats: true,
                                weekday: weekday,
                            } as any,
                        });

                        // If sunrise effect is enabled, schedule a gradual light notification 15 mins before
                        if (alarm.sunriseEffect) {
                            let sunriseMinutes = minutes - 15;
                            let sunriseHours = hours;
                            if (sunriseMinutes < 0) {
                                sunriseMinutes += 60;
                                sunriseHours -= 1;
                                if (sunriseHours < 0) sunriseHours += 24;
                            }

                            await Notifications.scheduleNotificationAsync({
                                content: {
                                    title: 'Efecto Amanecer',
                                    body: 'Tu cuerpo se está preparando para despertar...',
                                    sound: false,
                                    data: { alarmId: alarm.id, type: 'sunrise' },
                                },
                                trigger: {
                                    hour: sunriseHours,
                                    minute: sunriseMinutes,
                                    repeats: true,
                                    weekday: weekday,
                                } as any,
                            });
                        }
                    }
                }
            },
        }),
        {
            name: 'alarm-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
