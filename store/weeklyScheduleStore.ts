import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getLocalDateString, parseLocalDate } from '@/utils/dateUtils';
import { SavedRoutine } from '@/types/schema';

export interface ScheduledWorkout {
    id: string;
    routineId: string;
    routineName: string;
    date: string; // YYYY-MM-DD
    completed: boolean;
}

interface WeeklyScheduleState {
    schedule: ScheduledWorkout[];
    addWorkoutToSchedule: (workout: Omit<ScheduledWorkout, 'id' | 'completed'>) => void;
    scheduleWorkout: (routineId: string, date: string, routineName?: string) => void;
    clearSchedule: () => void;
    removeWorkoutFromSchedule: (id: string) => void;
    toggleWorkoutCompletion: (id: string) => void;
    markWorkoutCompleted: (routineId: string, date?: string) => void;
    rescheduleWorkout: (id: string, newDate: string) => void;
    getWorkoutsForDate: (date: string) => ScheduledWorkout[];
    getWorkoutStreak: () => { days: number; weeks: number; isActive: boolean };
    getWeeklyProgress: () => { scheduled: number; completed: number; percentage: number };
    generateScheduledWorkouts: (routines: SavedRoutine[]) => void;
    exitCurrentPlan: () => void;
    removeFutureWorkoutsOfRoutine: (routineId: string) => void;
}

export const useWeeklyScheduleStore = create<WeeklyScheduleState>()(
    persist(
        (set, get) => ({
            schedule: [],
            addWorkoutToSchedule: (workout) =>
                set((state) => ({
                    schedule: [
                        ...state.schedule,
                        { ...workout, id: Date.now().toString(), completed: false },
                    ],
                })),
            scheduleWorkout: (routineId, date, routineName = 'Workout') =>
                set((state) => ({
                    schedule: [
                        ...state.schedule,
                        {
                            id: Date.now().toString() + Math.random(),
                            routineId,
                            routineName,
                            date: date.split('T')[0], // Extract YYYY-MM-DD
                            completed: false,
                        },
                    ],
                })),
            clearSchedule: () =>
                set({ schedule: [] }),
            removeWorkoutFromSchedule: (id) =>
                set((state) => ({
                    schedule: state.schedule.filter((w) => w.id !== id),
                })),
            toggleWorkoutCompletion: (id) =>
                set((state) => ({
                    schedule: state.schedule.map((w) =>
                        w.id === id ? { ...w, completed: !w.completed } : w
                    ),
                })),
            markWorkoutCompleted: (routineId, date) => {
                const today = date || getLocalDateString();
                set((state) => ({
                    schedule: state.schedule.map((w) =>
                        w.routineId === routineId && w.date === today
                            ? { ...w, completed: true }
                            : w
                    ),
                }));
            },
            rescheduleWorkout: (id, newDate) => {
                set((state) => ({
                    schedule: state.schedule.map((w) =>
                        w.id === id
                            ? { ...w, date: newDate.split('T')[0] }
                            : w
                    ),
                }));
            },
            getWorkoutsForDate: (date) =>
                get().schedule.filter((w) => w.date === date),
            getWorkoutStreak: () => {
                const schedule = get().schedule;
                const completedDates = schedule
                    .filter(w => w.completed)
                    .map(w => w.date)
                    .sort((a, b) => b.localeCompare(a)); // Most recent first

                if (completedDates.length === 0) {
                    return { days: 0, weeks: 0, isActive: false };
                }

                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const yesterday = new Date(today);
                yesterday.setDate(yesterday.getDate() - 1);

                const todayStr = getLocalDateString(today);
                const yesterdayStr = getLocalDateString(yesterday);

                // Check if most recent workout is today or yesterday
                const lastWorkoutDate = completedDates[0];
                const isActive = lastWorkoutDate === todayStr || lastWorkoutDate === yesterdayStr;

                if (!isActive) {
                    return { days: 0, weeks: 0, isActive: false };
                }

                // Count consecutive days with completed workouts
                const uniqueDates = [...new Set(completedDates)];
                let streakDays = 0;
                let currentDate = new Date(uniqueDates[0]);

                for (const dateStr of uniqueDates) {
                    const expectedDate = new Date(currentDate);
                    expectedDate.setDate(expectedDate.getDate() - streakDays);
                    const expectedStr = getLocalDateString(expectedDate);

                    if (dateStr === expectedStr ||
                        // Allow 1-2 day gap within same week
                        streakDays === 0) {
                        streakDays++;
                        currentDate = new Date(dateStr);
                    } else {
                        break;
                    }
                }

                const weeks = Math.floor(streakDays / 7);

                return { days: streakDays, weeks, isActive };
            },
            getWeeklyProgress: () => {
                const schedule = get().schedule;
                const today = new Date();
                const dayOfWeek = today.getDay();
                const monday = new Date(today);
                monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
                monday.setHours(0, 0, 0, 0);

                const sunday = new Date(monday);
                sunday.setDate(monday.getDate() + 6);
                sunday.setHours(23, 59, 59, 999);

                const weekWorkouts = schedule.filter(w => {
                    const workoutDate = parseLocalDate(w.date);
                    return workoutDate >= monday && workoutDate <= sunday;
                });

                const scheduled = weekWorkouts.length;
                const completed = weekWorkouts.filter(w => w.completed).length;
                const percentage = scheduled > 0 ? Math.round((completed / scheduled) * 100) : 0;

                return { scheduled, completed, percentage };
            },
            exitCurrentPlan: () => {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const todayStr = getLocalDateString(today);

                set((state) => ({
                    schedule: state.schedule.filter((w) => {
                        if (w.completed) return true;
                        return w.date < todayStr;
                    }),
                }));
            },
            removeFutureWorkoutsOfRoutine: (routineId: string) => {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const todayStr = getLocalDateString(today);

                set((state) => ({
                    schedule: state.schedule.filter((w) => {
                        // Keep if not this routine
                        if (w.routineId !== routineId) return true;
                        // Keep if completed
                        if (w.completed) return true;
                        // Keep if in the past
                        if (w.date < todayStr) return true;

                        return false;
                    }),
                }));
            },
            generateScheduledWorkouts: (routines) => {
                const schedule = get().schedule;
                const newSchedule = [...schedule];
                const today = new Date();
                today.setHours(0, 0, 0, 0);

                // Generate for next 4 weeks
                const endDate = new Date(today);
                endDate.setDate(today.getDate() + 28);

                routines.forEach(routine => {
                    if (!routine.scheduleType) return;

                    let currentDate = new Date(today);

                    // If interval, start from scheduleStartDate or today
                    if (routine.scheduleType === 'interval' && routine.scheduleStartDate) {
                        const startDate = parseLocalDate(routine.scheduleStartDate);
                        if (startDate > currentDate) {
                            currentDate = startDate;
                        } else {
                            // Calculate next occurrence if start date is in past
                            const diffTime = Math.abs(currentDate.getTime() - startDate.getTime());
                            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                            const daysToNext = (routine.scheduleInterval || 1) - (diffDays % (routine.scheduleInterval || 1));
                            currentDate.setDate(currentDate.getDate() + (daysToNext === (routine.scheduleInterval || 1) ? 0 : daysToNext));
                        }
                    }

                    while (currentDate <= endDate) {
                        const dateStr = getLocalDateString(currentDate);
                        const dayOfWeek = currentDate.getDay(); // 0 = Sunday

                        let shouldSchedule = false;

                        if (routine.scheduleType === 'specific_days' && routine.scheduleDays) {
                            if (routine.scheduleDays.includes(dayOfWeek)) {
                                shouldSchedule = true;
                            }
                        } else if (routine.scheduleType === 'interval' && routine.scheduleInterval) {
                            shouldSchedule = true;
                        }

                        if (shouldSchedule) {
                            // Check if already scheduled
                            const exists = newSchedule.some(w =>
                                w.routineId === routine.id && w.date === dateStr
                            );

                            if (!exists) {
                                newSchedule.push({
                                    id: Date.now().toString() + Math.random(),
                                    routineId: routine.id,
                                    routineName: routine.name,
                                    date: dateStr,
                                    completed: false
                                });
                            }
                        }

                        // Advance date
                        if (routine.scheduleType === 'interval') {
                            currentDate.setDate(currentDate.getDate() + (routine.scheduleInterval || 1));
                        } else {
                            currentDate.setDate(currentDate.getDate() + 1);
                        }
                    }
                });

                set({ schedule: newSchedule });
            },
        }),
        {
            name: 'weekly-schedule-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
