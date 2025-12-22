import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

export type Gender = 'male' | 'female';
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active';
export type Objective = 'weight_loss' | 'maintenance' | 'bulking' | 'aggressive_cut' | 'lean_bulk';
export type GoalVelocity = 'fast' | 'moderate' | 'slow';

export interface UserProfile {
    age: number;
    gender: Gender;
    height: number; // cm
    weight: number; // kg
    targetWeight: number; // kg
    goalVelocity: GoalVelocity;
    activityLevel: ActivityLevel;
    objective: Objective;
    bmr: number;
    tdee: number;
    calorieGoal: number;
    proteinGoal: number; // grams
    carbsGoal: number; // grams
    fatsGoal: number; // grams
    theme?: 'system' | 'light' | 'dark';
    notificationsEnabled?: boolean;

    // Onboarding fields
    name?: string;
    experienceLevel?: 'sedentary' | 'beginner' | 'intermediate' | 'advanced';
    fitnessGoal?: 'lose_fat' | 'gain_muscle' | 'improve_performance' | 'general_health';
    workoutDaysPerWeek?: number;
    minutesPerSession?: number;
    availableEquipment?: 'full_gym' | 'dumbbells' | 'bodyweight' | 'bands';
    physicalRestrictions?: string;
    dietaryPreferences?: 'omnivore' | 'vegetarian' | 'vegan' | 'other';
    foodRestrictions?: string;
    foodBudget?: 'low' | 'medium' | 'high';
    cookingSkill?: 'basic' | 'intermediate' | 'advanced';
    hasCompletedOnboarding?: boolean;
    language?: string;
}

interface UserProfileState {
    profile: UserProfile | null;
    loading: boolean;
    fetchProfile: () => Promise<void>;
    updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
    setProfile: (profile: UserProfile) => Promise<void>; // For backward compatibility
    clearProfile: () => void;
}

export const useUserProfileStore = create<UserProfileState>((set, get) => ({
    profile: null,
    loading: false,

    fetchProfile: async () => {
        set({ loading: true });
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                set({ profile: null, loading: false });
                return;
            }

            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (error && error.code !== 'PGRST116') { // PGRST116 is "Row not found"
                console.error('Error fetching profile:', error);
            }

            if (data) {
                set({
                    profile: {
                        age: data.age,
                        gender: data.gender,
                        height: data.height,
                        weight: data.weight,
                        targetWeight: data.target_weight,
                        goalVelocity: data.goal_velocity,
                        activityLevel: data.activity_level,
                        objective: data.objective,
                        bmr: data.bmr,
                        tdee: data.tdee,
                        calorieGoal: data.calorie_goal,
                        proteinGoal: data.protein_goal,
                        carbsGoal: data.carbs_goal,
                        fatsGoal: data.fats_goal,
                        hasCompletedOnboarding: data.has_completed_onboarding,
                        theme: data.theme || 'system',
                        name: data.name,
                        experienceLevel: data.experience_level,
                        fitnessGoal: data.fitness_goal,
                        workoutDaysPerWeek: data.workout_days_per_week,
                        minutesPerSession: data.minutes_per_session,
                        availableEquipment: data.available_equipment,
                        physicalRestrictions: data.physical_restrictions,
                        dietaryPreferences: data.dietary_preferences,
                        foodRestrictions: data.food_restrictions,
                        foodBudget: data.food_budget,
                        cookingSkill: data.cooking_skill,
                        language: data.language || 'es',
                    } as UserProfile
                });
            }
        } catch (e) {
            console.error(e);
        } finally {
            set({ loading: false });
        }
    },

    updateProfile: async (updates) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const currentProfile = get().profile || {} as UserProfile;
        const newProfile = { ...currentProfile, ...updates };

        // Optimistic update
        set({ profile: newProfile });

        const dbUpdates = {
            id: user.id,
            age: newProfile.age,
            gender: newProfile.gender,
            height: newProfile.height,
            weight: newProfile.weight,
            target_weight: newProfile.targetWeight,
            goal_velocity: newProfile.goalVelocity,
            activity_level: newProfile.activityLevel,
            objective: newProfile.objective,
            bmr: newProfile.bmr,
            tdee: newProfile.tdee,
            calorie_goal: newProfile.calorieGoal,
            protein_goal: newProfile.proteinGoal,
            carbs_goal: newProfile.carbsGoal,
            fats_goal: newProfile.fatsGoal,
            has_completed_onboarding: newProfile.hasCompletedOnboarding,
            theme: newProfile.theme,
            name: newProfile.name,
            experience_level: newProfile.experienceLevel,
            fitness_goal: newProfile.fitnessGoal,
            workout_days_per_week: newProfile.workoutDaysPerWeek,
            minutes_per_session: newProfile.minutesPerSession,
            available_equipment: newProfile.availableEquipment,
            physical_restrictions: newProfile.physicalRestrictions,
            dietary_preferences: newProfile.dietaryPreferences,
            food_restrictions: newProfile.foodRestrictions,
            food_budget: newProfile.foodBudget,
            cooking_skill: newProfile.cookingSkill,
            language: newProfile.language,
            updated_at: new Date(),
        };

        const { error } = await supabase
            .from('profiles')
            .upsert(dbUpdates);

        if (error) {
            console.error('Error updating profile:', error);
        }
    },

    setProfile: async (profile: UserProfile) => {
        await get().updateProfile(profile);
    },

    clearProfile: () => set({ profile: null }),
}));
