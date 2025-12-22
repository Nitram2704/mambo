import { create } from 'zustand';
import { useWorkoutHistoryStore, CompletedWorkout } from './workoutHistoryStore';
import { useNutritionStore, DailyNutrition } from './nutritionStore';
import { useWeightStore, WeightLog } from './weightStore';
import { useUserProfileStore } from './userProfileStore';
import { subDays, format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from 'date-fns';

interface VolumeData {
    labels: string[];
    data: number[];
}

interface MuscleVolume {
    muscle: string;
    volume: number;
    percentage: number;
}

interface AnalyticsState {
    getWeeklyVolume: () => VolumeData;
    getPRHistory: (exerciseName: string) => { labels: string[], data: number[] };
    getNutritionalAdherence: (days: number) => number;
    getMuscleBalance: () => MuscleVolume[];
    getBodyCompTimeline: () => { labels: string[], weight: number[], target?: number };
}

export const useAnalyticsStore = create<AnalyticsState>((set, get) => ({
    getWeeklyVolume: () => {
        const { workouts } = useWorkoutHistoryStore.getState();
        const last7Days = Array.from({ length: 7 }, (_, i) => {
            const d = subDays(new Date(), 6 - i);
            return format(d, 'yyyy-MM-dd');
        });

        const data = last7Days.map(dateStr => {
            const dayWorkouts = workouts.filter(w => format(new Date(w.startTime), 'yyyy-MM-dd') === dateStr);
            return dayWorkouts.reduce((sum, w) => sum + (w.volume || 0), 0);
        });

        return {
            labels: last7Days.map(d => format(new Date(d), 'EEE')),
            data
        };
    },

    getPRHistory: (exerciseName: string) => {
        const { workouts } = useWorkoutHistoryStore.getState();
        const prs: { date: Date, weight: number }[] = [];

        workouts.forEach(w => {
            w.exercises.forEach(ex => {
                if (ex.exerciseName.toLowerCase() === exerciseName.toLowerCase()) {
                    const maxWeight = Math.max(...ex.sets.map(s => s.weight || 0));
                    if (maxWeight > 0) {
                        prs.push({ date: w.startTime, weight: maxWeight });
                    }
                }
            });
        });

        // Sort by date and take last 7 unique dates
        const sortedPrs = prs.sort((a, b) => a.date.getTime() - b.date.getTime());
        const uniquePrs = sortedPrs.filter((pr, index, self) =>
            index === self.findIndex(t => format(t.date, 'yyyy-MM-dd') === format(pr.date, 'yyyy-MM-dd'))
        ).slice(-7);

        return {
            labels: uniquePrs.map(pr => format(pr.date, 'dd/MM')),
            data: uniquePrs.map(pr => pr.weight)
        };
    },

    getNutritionalAdherence: (days: number) => {
        const { dailyData } = useNutritionStore.getState();
        const { profile } = useUserProfileStore.getState();
        if (!profile) return 0;

        const lastNDays = Array.from({ length: days }, (_, i) => {
            const d = subDays(new Date(), i);
            return format(d, 'yyyy-MM-dd');
        });

        let adherentDays = 0;
        lastNDays.forEach(dateKey => {
            const data = dailyData[dateKey];
            if (data && data.caloriesConsumed > 0) {
                const calDiff = Math.abs(data.caloriesConsumed - profile.calorieGoal);
                const isAdherent = calDiff / profile.calorieGoal <= 0.1; // 10% margin
                if (isAdherent) adherentDays++;
            }
        });

        return (adherentDays / days) * 100;
    },

    getMuscleBalance: () => {
        const { workouts } = useWorkoutHistoryStore.getState();
        const last30Days = subDays(new Date(), 30);
        const recentWorkouts = workouts.filter(w => new Date(w.startTime) >= last30Days);

        const muscleVolumes: Record<string, number> = {};
        let totalVolume = 0;

        recentWorkouts.forEach(w => {
            w.exercises.forEach(ex => {
                const exVolume = ex.sets.reduce((sum, s) => sum + (s.weight * s.reps), 0);
                const muscle = ex.muscleGroup || 'Otros';
                muscleVolumes[muscle] = (muscleVolumes[muscle] || 0) + exVolume;
                totalVolume += exVolume;
            });
        });

        if (totalVolume === 0) return [];

        return Object.entries(muscleVolumes).map(([muscle, volume]) => ({
            muscle,
            volume,
            percentage: (volume / totalVolume) * 100
        })).sort((a, b) => b.volume - a.volume);
    },

    getBodyCompTimeline: () => {
        const { logs } = useWeightStore.getState();
        const { profile } = useUserProfileStore.getState();

        const last7Logs = logs.slice(0, 7).reverse();

        return {
            labels: last7Logs.map(l => format(new Date(l.date), 'dd/MM')),
            weight: last7Logs.map(l => l.weight),
            target: profile?.targetWeight
        };
    }
}));
