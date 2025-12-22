import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

export interface Meal {
    id: string;
    type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    ingredients: string[];
    instructions?: string;
    prepTime?: string;
}

export interface DailyMealPlan {
    id: string;
    date: Date;
    meals: Meal[];
    isTemplate?: boolean;
    dayOfWeek?: number;
}

interface MealPlanState {
    weeklyPlan: DailyMealPlan[];
    weeklyTemplates: DailyMealPlan[];
    loading: boolean;
    fetchWeeklyPlan: (startDate?: Date) => Promise<void>;
    saveMealPlan: (plans: DailyMealPlan[]) => Promise<void>;
    saveAsTemplate: (plans: DailyMealPlan[]) => Promise<void>;
    updateDayMeals: (date: Date, meals: Meal[]) => Promise<void>;
    clearMealPlan: () => void;
}

const getLocalDateKey = (date: Date) => {
    return date.getFullYear() + '-' +
        String(date.getMonth() + 1).padStart(2, '0') + '-' +
        String(date.getDate()).padStart(2, '0');
};

export const useMealPlanStore = create<MealPlanState>((set, get) => ({
    weeklyPlan: [],
    weeklyTemplates: [],
    loading: false,

    fetchWeeklyPlan: async (startDate?: Date) => {
        set({ loading: true });
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                set({ weeklyPlan: [], loading: false });
                return;
            }

            // Fetch meal plans for the week
            const start = startDate || new Date();
            const end = new Date(start);
            end.setDate(end.getDate() + 7);

            const { data: mealPlansData, error: mealPlansError } = await supabase
                .from('meal_plans')
                .select('id, user_id, date, day_of_week, created_at, updated_at, meals(*)')
                .eq('user_id', user.id)
                .gte('date', getLocalDateKey(start))
                .lte('date', getLocalDateKey(end))
                .order('date');

            if (mealPlansError) {
                console.error('Error fetching meal plans:', mealPlansError);
                set({ loading: false });
                return;
            }

            // Transform to DailyMealPlan format
            const allPlans: DailyMealPlan[] = (mealPlansData || []).map(plan => ({
                id: plan.id,
                date: new Date(plan.date),
                isTemplate: !!plan.day_of_week,
                dayOfWeek: plan.day_of_week,
                meals: (plan.meals || []).map((meal: any) => ({
                    id: meal.id,
                    type: meal.type,
                    name: meal.name,
                    calories: meal.calories,
                    protein: meal.protein,
                    carbs: meal.carbs,
                    fat: meal.fat,
                    ingredients: meal.ingredients || [],
                    instructions: meal.instructions,
                    prepTime: meal.prep_time,
                }))
            }));

            const weeklyPlan = allPlans.filter(p => !p.isTemplate);
            const weeklyTemplates = allPlans.filter(p => p.isTemplate);

            set({ weeklyPlan, weeklyTemplates, loading: false });
        } catch (error) {
            console.error('Error fetching weekly plan:', error);
            set({ loading: false });
        }
    },

    saveMealPlan: async (plans: DailyMealPlan[]) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        try {
            // Save each day's plan
            for (const dayPlan of plans) {
                const dateStr = getLocalDateKey(dayPlan.date);

                // 1. Create or update meal_plan
                const { data: mealPlanData, error: mealPlanError } = await supabase
                    .from('meal_plans')
                    .upsert({
                        user_id: user.id,
                        date: dateStr,
                    }, {
                        onConflict: 'user_id,date'
                    })
                    .select()
                    .single();

                if (mealPlanError) {
                    console.error('Error creating meal plan:', mealPlanError);
                    continue;
                }

                // 2. Delete existing meals for this plan
                await supabase
                    .from('meals')
                    .delete()
                    .eq('meal_plan_id', mealPlanData.id);

                // 3. Insert new meals
                const mealsToInsert = dayPlan.meals.map(meal => ({
                    meal_plan_id: mealPlanData.id,
                    type: meal.type,
                    name: meal.name,
                    calories: meal.calories,
                    protein: meal.protein,
                    carbs: meal.carbs,
                    fat: meal.fat,
                    ingredients: meal.ingredients,
                    instructions: meal.instructions,
                    prep_time: meal.prepTime,
                }));

                const { error: mealsError } = await supabase
                    .from('meals')
                    .insert(mealsToInsert);

                if (mealsError) {
                    console.error('Error inserting meals:', mealsError);
                }
            }

            // Refresh the weekly plan
            await get().fetchWeeklyPlan(plans[0]?.date);

        } catch (error) {
            console.error('Error saving meal plan:', error);
        }
    },

    saveAsTemplate: async (plans: DailyMealPlan[]) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        try {
            for (const dayPlan of plans) {
                // Use day of week from the date
                const dayOfWeek = dayPlan.date.getDay();

                // 1. Create or update meal_plan template
                const { data: mealPlanData, error: mealPlanError } = await supabase
                    .from('meal_plans')
                    .upsert({
                        user_id: user.id,
                        is_template: true,
                        day_of_week: dayOfWeek,
                    }, {
                        onConflict: 'user_id,day_of_week'
                    })
                    .select()
                    .single();

                if (mealPlanError) {
                    console.error('Error creating meal plan template:', mealPlanError);
                    continue;
                }

                // 2. Delete existing meals for this template
                await supabase
                    .from('meals')
                    .delete()
                    .eq('meal_plan_id', mealPlanData.id);

                // 3. Insert new meals
                const mealsToInsert = dayPlan.meals.map(meal => ({
                    meal_plan_id: mealPlanData.id,
                    type: meal.type,
                    name: meal.name,
                    calories: meal.calories,
                    protein: meal.protein,
                    carbs: meal.carbs,
                    fat: meal.fat,
                    ingredients: meal.ingredients,
                    instructions: meal.instructions,
                    prep_time: meal.prepTime,
                }));

                await supabase.from('meals').insert(mealsToInsert);
            }

            await get().fetchWeeklyPlan(plans[0]?.date);
        } catch (error) {
            console.error('Error saving meal plan template:', error);
        }
    },

    updateDayMeals: async (date: Date, meals: Meal[]) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        try {
            const dateStr = getLocalDateKey(date);

            // Get or create meal plan for this date
            const { data: mealPlanData, error: mealPlanError } = await supabase
                .from('meal_plans')
                .upsert({
                    user_id: user.id,
                    date: dateStr,
                }, {
                    onConflict: 'user_id,date'
                })
                .select()
                .single();

            if (mealPlanError) {
                console.error('Error updating meal plan:', mealPlanError);
                return;
            }

            // Delete existing meals
            await supabase
                .from('meals')
                .delete()
                .eq('meal_plan_id', mealPlanData.id);

            // Insert new meals
            const mealsToInsert = meals.map(meal => ({
                meal_plan_id: mealPlanData.id,
                type: meal.type,
                name: meal.name,
                calories: meal.calories,
                protein: meal.protein,
                carbs: meal.carbs,
                fat: meal.fat,
                ingredients: meal.ingredients,
                instructions: meal.instructions,
                prep_time: meal.prepTime,
            }));

            await supabase
                .from('meals')
                .insert(mealsToInsert);

            // Refresh
            await get().fetchWeeklyPlan();

        } catch (error) {
            console.error('Error updating day meals:', error);
        }
    },

    clearMealPlan: () => set({ weeklyPlan: [] }),
}));
