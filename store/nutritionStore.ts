import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getLocalDateString } from '@/utils/dateUtils';

export type MealType = 'breakfast' | 'mid_morning' | 'lunch' | 'snack' | 'dinner';

export interface MealLog {
    id: string;
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    timestamp: Date;
    photoUri?: string;
    mealType: MealType;
}

export interface WorkoutLog {
    id: string;
    duration: number; // minutes
    calories: number;
    timestamp: Date;
}

export interface DailyNutrition {
    date: string; // YYYY-MM-DD
    caloriesConsumed: number;
    caloriesBurned: number;
    proteinConsumed: number;
    carbsConsumed: number;
    fatsConsumed: number;
    meals: MealLog[];
    workouts: WorkoutLog[];
}

export interface MealTemplate {
    id: string;
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    createdAt: Date;
}

interface MealClipboard {
    mealType: MealType;
    meals: MealLog[];
    copiedDate: string;
}

interface NutritionState {
    dailyData: Record<string, DailyNutrition>;
    mealTemplates: MealTemplate[];
    clipboard: MealClipboard | null;
    singleMealClipboard: MealLog | null;
    getTodayData: () => DailyNutrition;
    getDataForDate: (dateKey: string) => DailyNutrition;
    logMeal: (meal: Omit<MealLog, 'id' | 'timestamp'>) => void;
    logWorkout: (workout: Omit<WorkoutLog, 'id' | 'timestamp'>) => void;
    clearToday: () => void;
    deleteMeal: (mealId: string) => void;
    copyMealSection: (dateKey: string, mealType: MealType) => void;
    pasteMealSection: (targetDateKey: string) => void;
    copySingleMeal: (meal: MealLog) => void;
    pasteSingleMeal: (targetDateKey: string, targetMealType: MealType) => void;
    clearClipboard: () => void;
    saveMealTemplate: (template: Omit<MealTemplate, 'id' | 'createdAt'>) => void;
    loadMealTemplate: (templateId: string) => void;
    deleteMealTemplate: (templateId: string) => void;
}

const getTodayKey = () => {
    return getLocalDateString();
};

const createEmptyDay = (): DailyNutrition => ({
    date: getTodayKey(),
    caloriesConsumed: 0,
    caloriesBurned: 0,
    proteinConsumed: 0,
    carbsConsumed: 0,
    fatsConsumed: 0,
    meals: [],
    workouts: [],
});

export const useNutritionStore = create<NutritionState>()(
    persist(
        (set, get) => ({
            dailyData: {},
            mealTemplates: [],
            clipboard: null,
            singleMealClipboard: null,
            getTodayData: () => {
                const today = getTodayKey();
                const state = get();

                console.log('=== GET TODAY DATA DEBUG ===');
                console.log('Today key:', today);
                console.log('All stored dates:', Object.keys(state.dailyData));
                console.log('Data for today:', state.dailyData[today]);

                return state.dailyData[today] || createEmptyDay();
            },
            getDataForDate: (dateKey: string) => {
                return get().dailyData[dateKey] || createEmptyDay();
            },
            logMeal: (meal) =>
                set((state) => {
                    const today = getTodayKey();
                    const currentDay = state.dailyData[today] || createEmptyDay();
                    const newMeal: MealLog = {
                        ...meal,
                        id: Date.now().toString(),
                        timestamp: new Date(),
                    };
                    return {
                        dailyData: {
                            ...state.dailyData,
                            [today]: {
                                ...currentDay,
                                caloriesConsumed: currentDay.caloriesConsumed + meal.calories,
                                proteinConsumed: currentDay.proteinConsumed + meal.protein,
                                carbsConsumed: currentDay.carbsConsumed + meal.carbs,
                                fatsConsumed: currentDay.fatsConsumed + meal.fats,
                                meals: [...currentDay.meals, newMeal],
                            },
                        },
                    };
                }),
            logWorkout: (workout) =>
                set((state) => {
                    const today = getTodayKey();
                    const currentDay = state.dailyData[today] || createEmptyDay();
                    const newWorkout: WorkoutLog = {
                        ...workout,
                        id: Date.now().toString(),
                        timestamp: new Date(),
                    };
                    return {
                        dailyData: {
                            ...state.dailyData,
                            [today]: {
                                ...currentDay,
                                caloriesBurned: currentDay.caloriesBurned + workout.calories,
                                workouts: [...currentDay.workouts, newWorkout],
                            },
                        },
                    };
                }),
            clearToday: () =>
                set((state) => {
                    const today = getTodayKey();
                    const newData = { ...state.dailyData };
                    delete newData[today];
                    return { dailyData: newData };
                }),
            deleteMeal: (mealId: string) =>
                set((state) => {
                    const today = getTodayKey();
                    const currentDay = state.dailyData[today];
                    if (!currentDay) return state;

                    const mealToDelete = currentDay.meals.find(m => m.id === mealId);
                    if (!mealToDelete) return state;

                    const updatedMeals = currentDay.meals.filter(m => m.id !== mealId);

                    return {
                        dailyData: {
                            ...state.dailyData,
                            [today]: {
                                ...currentDay,
                                caloriesConsumed: currentDay.caloriesConsumed - mealToDelete.calories,
                                proteinConsumed: currentDay.proteinConsumed - mealToDelete.protein,
                                carbsConsumed: currentDay.carbsConsumed - mealToDelete.carbs,
                                fatsConsumed: currentDay.fatsConsumed - mealToDelete.fats,
                                meals: updatedMeals,
                            },
                        },
                    };
                }),
            copyMealSection: (dateKey: string, mealType: MealType) =>
                set((state) => {
                    const dayData = state.dailyData[dateKey];
                    if (!dayData) return state;

                    const mealsOfType = dayData.meals.filter(m => m.mealType === mealType);

                    return {
                        clipboard: {
                            mealType,
                            meals: mealsOfType,
                            copiedDate: dateKey,
                        },
                    };
                }),
            pasteMealSection: (targetDateKey: string) =>
                set((state) => {
                    if (!state.clipboard) return state;

                    const currentDay = state.dailyData[targetDateKey] || createEmptyDay();
                    const { meals: copiedMeals, mealType } = state.clipboard;

                    // Create new meal logs with new IDs and timestamps
                    const newMeals = copiedMeals.map(meal => ({
                        ...meal,
                        id: `${Date.now()}-${Math.random()}`,
                        timestamp: new Date(),
                    }));

                    // Calculate totals from copied meals
                    const addedCalories = copiedMeals.reduce((sum, m) => sum + m.calories, 0);
                    const addedProtein = copiedMeals.reduce((sum, m) => sum + m.protein, 0);
                    const addedCarbs = copiedMeals.reduce((sum, m) => sum + m.carbs, 0);
                    const addedFats = copiedMeals.reduce((sum, m) => sum + m.fats, 0);

                    return {
                        dailyData: {
                            ...state.dailyData,
                            [targetDateKey]: {
                                ...currentDay,
                                caloriesConsumed: currentDay.caloriesConsumed + addedCalories,
                                proteinConsumed: currentDay.proteinConsumed + addedProtein,
                                carbsConsumed: currentDay.carbsConsumed + addedCarbs,
                                fatsConsumed: currentDay.fatsConsumed + addedFats,
                                meals: [...currentDay.meals, ...newMeals],
                            },
                        },
                    };
                }),
            copySingleMeal: (meal: MealLog) =>
                set(() => ({
                    singleMealClipboard: meal,
                })),
            pasteSingleMeal: (targetDateKey: string, targetMealType: MealType) =>
                set((state) => {
                    if (!state.singleMealClipboard) return state;

                    const currentDay = state.dailyData[targetDateKey] || createEmptyDay();
                    const copiedMeal = state.singleMealClipboard;

                    const newMeal: MealLog = {
                        ...copiedMeal,
                        id: `${Date.now()}-${Math.random()}`,
                        timestamp: new Date(),
                        mealType: targetMealType, // Use the target meal type
                    };

                    return {
                        dailyData: {
                            ...state.dailyData,
                            [targetDateKey]: {
                                ...currentDay,
                                caloriesConsumed: currentDay.caloriesConsumed + copiedMeal.calories,
                                proteinConsumed: currentDay.proteinConsumed + copiedMeal.protein,
                                carbsConsumed: currentDay.carbsConsumed + copiedMeal.carbs,
                                fatsConsumed: currentDay.fatsConsumed + copiedMeal.fats,
                                meals: [...currentDay.meals, newMeal],
                            },
                        },
                    };
                }),
            clearClipboard: () =>
                set(() => ({
                    clipboard: null,
                    singleMealClipboard: null,
                })),
            saveMealTemplate: (template) =>
                set((state) => {
                    const newTemplate: MealTemplate = {
                        ...template,
                        id: Date.now().toString(),
                        createdAt: new Date(),
                    };
                    return {
                        mealTemplates: [...state.mealTemplates, newTemplate],
                    };
                }),
            loadMealTemplate: (templateId) => {
                const template = get().mealTemplates.find((t) => t.id === templateId);
                if (template) {
                    get().logMeal({
                        name: template.name,
                        calories: template.calories,
                        protein: template.protein,
                        carbs: template.carbs,
                        fats: template.fats,
                        mealType: 'lunch', // Default to lunch for templates
                    });
                }
            },
            deleteMealTemplate: (templateId) =>
                set((state) => ({
                    mealTemplates: state.mealTemplates.filter((t) => t.id !== templateId),
                })),
        }),
        {
            name: 'nutrition-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
