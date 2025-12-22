import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface NutritionGoals {
    dailyCalories: number;
    dailyProtein: number;
    dailyCarbs: number;
    dailyFats: number;
    weeklyWorkouts: number;
    weeklyWorkoutMinutes: number;
}

interface GoalsState {
    goals: NutritionGoals | null;
    setGoals: (goals: NutritionGoals) => void;
    hasGoals: () => boolean;
}

export const useGoalsStore = create<GoalsState>()(
    persist(
        (set, get) => ({
            goals: null,
            setGoals: (goals) => set({ goals }),
            hasGoals: () => get().goals !== null,
        }),
        {
            name: 'goals-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);

// Helper function to calculate goal progress
export function calculateGoalProgress(
    actual: number,
    target: number
): { percentage: number; achieved: boolean } {
    const percentage = target > 0 ? Math.round((actual / target) * 100) : 0;
    const achieved = actual >= target;
    return { percentage, achieved };
}
