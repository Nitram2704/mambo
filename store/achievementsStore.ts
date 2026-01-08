import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ACHIEVEMENTS, Achievement } from '@/constants/achievements';
import { CompletedWorkout, WorkoutSet, ExerciseSession, UserProfile } from '@/types/schema';
import { DailyNutrition } from './nutritionStore';
import { isNutritionGoalHit, isCleanEatingHit, calculateNewStreak } from '@/utils/streakUtils';

// Definición de rangos de niveles
const LEVEL_RANGES = [
    { level: 1, title: 'Principiante', minXp: 0, maxXp: 100 },
    { level: 2, title: 'Novato', minXp: 101, maxXp: 300 },
    { level: 3, title: 'Intermedio', minXp: 301, maxXp: 700 },
    { level: 4, title: 'Avanzado', minXp: 701, maxXp: 1500 },
    { level: 5, title: 'Élite', minXp: 1501, maxXp: Infinity },
];

interface UnlockedAchievement {
    id: string;
    unlockedAt: Date;
}

export const getLevelFromXp = (xp: number): { level: number; title: string; nextLevelXp: number; currentLevelXp: number } => {
    const range = LEVEL_RANGES.find(r => xp >= r.minXp && xp <= r.maxXp) || LEVEL_RANGES[LEVEL_RANGES.length - 1];

    // Si es el último nivel (infinito), calculamos niveles adicionales virtuales si se desea, 
    // o simplemente lo dejamos en Élite. Por ahora, Élite es el tope definido.

    return {
        level: range.level,
        title: range.title,
        currentLevelXp: range.minXp,
        nextLevelXp: range.maxXp === Infinity ? range.minXp * 2 : range.maxXp + 1 // Fallback para barra de progreso
    };
};

interface AchievementsState {
    unlockedAchievements: UnlockedAchievement[];
    accumulatedXp: number; // XP acumulado por acciones + logros

    // Streaks
    nutritionStreak: number;
    cleanEatingStreak: number;
    lessonsCompleted: number;

    // Acciones para ganar XP
    addXp: (amount: number, source: string) => void;
    checkNutritionStreaks: (dailyNutrition: DailyNutrition, yesterdayNutrition: DailyNutrition | undefined, goals: UserProfile) => void;
    incrementLessonsCompleted: () => void;

    checkAchievements: (
        context: {
            lastWorkout?: CompletedWorkout;
            history?: CompletedWorkout[];
            userWeight?: number;
            nutritionStreak?: number;
            cleanEatingStreak?: number;
            lessonsCompleted?: number;
        }
    ) => UnlockedAchievement[];

    getUnlockedCount: () => number;
    getTotalXp: () => number;
    getCurrentLevel: () => { level: number; title: string; progress: number; currentLevelXp: number; nextLevelXp: number; totalXp: number };
    reset: () => void;
}

export const useAchievementsStore = create<AchievementsState>()(
    persist(
        (set, get) => ({
            unlockedAchievements: [],
            accumulatedXp: 0,
            nutritionStreak: 0,
            cleanEatingStreak: 0,
            lessonsCompleted: 0,

            addXp: (amount, source) => {
                set((state) => ({
                    accumulatedXp: state.accumulatedXp + amount
                }));
                console.log(`[XP] Gained ${amount} XP from ${source}. Total: ${get().accumulatedXp}`);
            },

            checkAchievements: (context) => {
                const state = get();
                const newUnlocks: UnlockedAchievement[] = [];
                const now = new Date();
                const { lastWorkout, history, userWeight, nutritionStreak, cleanEatingStreak, lessonsCompleted } = context;

                ACHIEVEMENTS.forEach((achievement) => {
                    // Skip if already unlocked
                    if (state.unlockedAchievements.some((ua) => ua.id === achievement.id)) {
                        return;
                    }

                    let isUnlocked = false;

                    switch (achievement.conditionType) {
                        case 'COUNT_WORKOUTS':
                            if (history && history.length >= achievement.targetValue) isUnlocked = true;
                            break;

                        case 'TOTAL_VOLUME':
                            if (history) {
                                const totalVolume = history.reduce((sum: number, w: CompletedWorkout) => sum + w.volume, 0);
                                if (totalVolume >= achievement.targetValue) isUnlocked = true;
                            }
                            break;

                        case 'TOTAL_SETS':
                            if (history) {
                                const totalSets = history.reduce((sum: number, w: CompletedWorkout) => {
                                    return sum + w.exercises.reduce((exSum: number, ex: ExerciseSession) => exSum + ex.sets.length, 0);
                                }, 0);
                                if (totalSets >= achievement.targetValue) isUnlocked = true;
                            }
                            break;

                        case 'STREAK':
                            if (history && history.length >= achievement.targetValue) {
                                const sortedHistory = [...history].sort((a, b) => new Date(b.endTime).getTime() - new Date(a.endTime).getTime());
                                let streak = 1;
                                for (let i = 0; i < sortedHistory.length - 1; i++) {
                                    const current = new Date(sortedHistory[i].endTime);
                                    const next = new Date(sortedHistory[i + 1].endTime);
                                    const diffTime = Math.abs(current.setHours(0, 0, 0, 0) - next.setHours(0, 0, 0, 0));
                                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                                    if (diffDays === 1) streak++;
                                    else if (diffDays === 0) continue;
                                    else break;
                                }
                                if (streak >= achievement.targetValue) isUnlocked = true;
                            }
                            break;

                        case 'EARLY_BIRD':
                            if (lastWorkout) {
                                const hour = new Date(lastWorkout.startTime).getHours();
                                if (hour < 8) isUnlocked = true;
                            }
                            break;

                        case 'NIGHT_OWL':
                            if (lastWorkout) {
                                const nightHour = new Date(lastWorkout.startTime).getHours();
                                if (nightHour >= 22) isUnlocked = true;
                            }
                            break;

                        case 'SESSION_VOLUME':
                            if (lastWorkout && lastWorkout.volume >= achievement.targetValue) isUnlocked = true;
                            break;

                        case 'PERFECT_WEEK':
                            if (history) {
                                const weekAgo = new Date();
                                weekAgo.setDate(weekAgo.getDate() - 7);
                                const workoutsThisWeek = history.filter(w => new Date(w.endTime) >= weekAgo);
                                const uniqueDays = new Set(workoutsThisWeek.map(w => {
                                    const date = new Date(w.endTime);
                                    return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
                                }));
                                if (uniqueDays.size >= achievement.targetValue) isUnlocked = true;
                            }
                            break;

                        case 'SPECIFIC_EXERCISE':
                            if (history) {
                                const exerciseNames = {
                                    'squat_master': ['sentadilla', 'squat', 'sentadillas'],
                                    'bench_press_pro': ['press de banca', 'bench press', 'press banca'],
                                    'deadlift_beast': ['peso muerto', 'deadlift'],
                                    'first_pullup': ['dominada', 'pull up', 'pull-up', 'chin up']
                                };
                                const targetExercises = exerciseNames[achievement.id as keyof typeof exerciseNames] || [];
                                if (targetExercises.length > 0) {
                                    let totalSets = 0;
                                    history.forEach((workout: CompletedWorkout) => {
                                        workout.exercises.forEach((exercise: ExerciseSession) => {
                                            const exerciseName = exercise.exerciseName.toLowerCase();
                                            if (targetExercises.some(name => exerciseName.includes(name.toLowerCase()))) {
                                                totalSets += exercise.sets.length;
                                            }
                                        });
                                    });
                                    if (totalSets >= achievement.targetValue) isUnlocked = true;
                                }
                            }
                            break;

                        case 'STRENGTH_RELATIVE':
                            if (lastWorkout && userWeight) {
                                if (achievement.id === 'squat_1_5_bw') {
                                    const squatKeywords = ['sentadilla', 'squat'];
                                    const squatExercises = lastWorkout.exercises.filter((ex: ExerciseSession) =>
                                        squatKeywords.some(k => ex.exerciseName.toLowerCase().includes(k))
                                    );

                                    const maxWeight = squatExercises.reduce((max: number, ex: ExerciseSession) => {
                                        const exMax = ex.sets.reduce((sMax: number, set: WorkoutSet) => Math.max(sMax, set.weight), 0);
                                        return Math.max(max, exMax);
                                    }, 0);

                                    if (maxWeight >= userWeight * achievement.targetValue) {
                                        isUnlocked = true;
                                    }
                                }
                            }
                            break;

                        case 'MACROS_STREAK':
                            if (nutritionStreak !== undefined && nutritionStreak >= achievement.targetValue) {
                                isUnlocked = true;
                            }
                            break;

                        case 'NO_EXCESS_STREAK':
                            if (cleanEatingStreak !== undefined && cleanEatingStreak >= achievement.targetValue) {
                                isUnlocked = true;
                            }
                            break;

                        case 'LESSONS_COMPLETED':
                            if (lessonsCompleted !== undefined && lessonsCompleted >= achievement.targetValue) {
                                isUnlocked = true;
                            }
                            break;
                    }

                    if (isUnlocked) {
                        newUnlocks.push({
                            id: achievement.id,
                            unlockedAt: now,
                        });
                        get().addXp(achievement.xpReward, `Achievement: ${achievement.title}`);
                    }
                });

                if (newUnlocks.length > 0) {
                    set((state) => ({
                        unlockedAchievements: [...state.unlockedAchievements, ...newUnlocks],
                    }));
                }

                return newUnlocks;
            },

            getUnlockedCount: () => get().unlockedAchievements.length,

            getTotalXp: () => get().accumulatedXp,

            getCurrentLevel: () => {
                const state = get();
                const totalXp = state.accumulatedXp;
                const levelInfo = getLevelFromXp(totalXp);

                const progress = Math.min(
                    (totalXp - levelInfo.currentLevelXp) / (levelInfo.nextLevelXp - levelInfo.currentLevelXp),
                    1
                );

                return {
                    level: levelInfo.level,
                    title: levelInfo.title,
                    progress: isNaN(progress) ? 1 : progress,
                    currentLevelXp: levelInfo.currentLevelXp,
                    nextLevelXp: levelInfo.nextLevelXp,
                    totalXp
                };
            },

            checkNutritionStreaks: (dailyNutrition, yesterdayNutrition, goals) => {
                const macrosHit = isNutritionGoalHit(dailyNutrition, goals);
                const cleanEating = isCleanEatingHit(dailyNutrition, goals);

                const yesterdayMacrosHit = yesterdayNutrition && isNutritionGoalHit(yesterdayNutrition, goals);
                const yesterdayClean = yesterdayNutrition && isCleanEatingHit(yesterdayNutrition, goals);

                set((state) => ({
                    nutritionStreak: calculateNewStreak(macrosHit, !!yesterdayMacrosHit, state.nutritionStreak),
                    cleanEatingStreak: calculateNewStreak(cleanEating, !!yesterdayClean, state.cleanEatingStreak)
                }));

                if (macrosHit) {
                    get().addXp(5, 'Hit daily macros');
                }
            },

            incrementLessonsCompleted: () => {
                set((state) => ({ lessonsCompleted: state.lessonsCompleted + 1 }));
                get().addXp(15, 'Completed lesson');
            },

            reset: () =>
                set({
                    unlockedAchievements: [],
                    accumulatedXp: 0,
                    nutritionStreak: 0,
                    cleanEatingStreak: 0,
                    lessonsCompleted: 0,
                }),
        }),
        {
            name: 'achievements-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
