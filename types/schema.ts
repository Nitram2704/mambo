import { z } from 'zod';

// --- User Profile ---
export const GenderSchema = z.enum(['male', 'female']);
export const ActivityLevelSchema = z.enum(['sedentary', 'light', 'moderate', 'active']);
export const ObjectiveSchema = z.enum(['weight_loss', 'maintenance', 'bulking', 'aggressive_cut', 'lean_bulk']);
export const GoalVelocitySchema = z.enum(['fast', 'moderate', 'slow']);

export const UserProfileSchema = z.object({
    age: z.number().min(1).max(120),
    gender: GenderSchema,
    height: z.number().positive(),
    weight: z.number().positive(),
    targetWeight: z.number().positive(),
    goalVelocity: GoalVelocitySchema,
    activityLevel: ActivityLevelSchema,
    objective: ObjectiveSchema,
    bmr: z.number().positive(),
    tdee: z.number().positive(),
    calorieGoal: z.number().positive(),
    proteinGoal: z.number().nonnegative(),
    carbsGoal: z.number().nonnegative(),
    fatsGoal: z.number().nonnegative(),
    theme: z.enum(['system', 'light', 'dark']).optional(),
    notificationsEnabled: z.boolean().optional(),
    name: z.string().optional(),
    experienceLevel: z.enum(['sedentary', 'beginner', 'intermediate', 'advanced']).optional(),
    fitnessGoal: z.enum(['lose_fat', 'gain_muscle', 'improve_performance', 'general_health']).optional(),
    workoutDaysPerWeek: z.number().min(1).max(7).optional(),
    minutesPerSession: z.number().positive().optional(),
    availableEquipment: z.enum(['full_gym', 'dumbbells', 'bodyweight', 'bands']).optional(),
    physicalRestrictions: z.string().optional(),
    dietaryPreferences: z.enum(['omnivore', 'vegetarian', 'vegan', 'other']).optional(),
    foodRestrictions: z.string().optional(),
    foodBudget: z.enum(['low', 'medium', 'high']).optional(),
    cookingSkill: z.enum(['basic', 'intermediate', 'advanced']).optional(),
    hasCompletedOnboarding: z.boolean().optional(),
    language: z.string().optional(),
    coachStyle: z.enum(['sargento', 'cientifico', 'amigo']).optional(),
});

export type UserProfile = z.infer<typeof UserProfileSchema>;

// --- Exercises & Workouts ---
export const MuscleGroupSchema = z.enum([
    'chest', 'back', 'shoulders', 'biceps', 'triceps', 'legs', 'abs', 'cardio', 'full_body', 'other'
]);

export const EquipmentSchema = z.enum([
    'dumbbell', 'barbell', 'machine', 'cable', 'bodyweight', 'band', 'kettlebell', 'other'
]);

export const SetTypeSchema = z.enum(['warmup', 'normal', 'dropset', 'failure', 'rest_pause']);

export const WorkoutSetSchema = z.object({
    id: z.string(),
    weight: z.number().nonnegative(),
    reps: z.number().nonnegative(),
    rir: z.number().nonnegative(),
    type: SetTypeSchema,
    completed: z.boolean(),
    isEmpty: z.boolean(),
    note: z.string().optional(),
    formCheckId: z.string().optional(),
});

export const ExerciseSessionSchema = z.object({
    exerciseId: z.string(),
    exerciseName: z.string(),
    muscleGroup: z.string(), // Can be stricter if we map all DB values
    sets: z.array(WorkoutSetSchema),
    note: z.string(),
    restTime: z.number().nonnegative(),
    videoUrl: z.string().optional(),
    supersetGroup: z.string().optional(),
});

export const CompletedWorkoutSchema = z.object({
    id: z.string(),
    routineId: z.string(),
    routineName: z.string(),
    startTime: z.date(),
    endTime: z.date(),
    durationSeconds: z.number().nonnegative(),
    volume: z.number().nonnegative(),
    exercises: z.array(ExerciseSessionSchema),
});

export type WorkoutSet = z.infer<typeof WorkoutSetSchema>;
export type ExerciseSession = z.infer<typeof ExerciseSessionSchema>;
export type CompletedWorkout = z.infer<typeof CompletedWorkoutSchema>;

// --- Saved Routines ---
export const ExerciseSchema = z.object({
    id: z.string(),
    name: z.string(),
    muscleGroup: MuscleGroupSchema,
    equipment: EquipmentSchema,
    videoUrl: z.string().optional(),
    instructions: z.array(z.string()).optional(),
    gifUrl: z.string().optional(),
    secondaryMuscles: z.array(MuscleGroupSchema).optional(),
    plannedSets: z.number().optional(),
    plannedSetTypes: z.array(SetTypeSchema).optional(),
    restTime: z.number().optional(),
    supersetGroup: z.string().optional(),
});

export const SavedRoutineSchema = z.object({
    id: z.string(),
    name: z.string(),
    description: z.string().optional(),
    exercises: z.array(ExerciseSchema),
    createdAt: z.string(), // ISO string for easier persistence
    scheduleType: z.enum(['specific_days', 'interval']).nullable().optional(),
    scheduleDays: z.array(z.number().min(0).max(6)).optional(),
    scheduleInterval: z.number().positive().optional(),
    scheduleStartDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(), // YYYY-MM-DD
});

export type Exercise = z.infer<typeof ExerciseSchema>;
export type SavedRoutine = z.infer<typeof SavedRoutineSchema>;

// --- Nutrition ---
export const MacronutrientsSchema = z.object({
    calories: z.number().nonnegative(),
    protein: z.number().nonnegative(),
    carbs: z.number().nonnegative(),
    fats: z.number().nonnegative(),
});

export const FoodItemSchema = z.object({
    id: z.string(),
    name: z.string(),
    brand: z.string().optional(),
    servingSize: z.number().positive(),
    servingUnit: z.string(),
    nutrients: MacronutrientsSchema,
});

export const MealLogSchema = z.object({
    id: z.string(),
    name: z.string(), // e.g., "Breakfast"
    items: z.array(z.object({
        foodId: z.string(),
        foodName: z.string(),
        servingSize: z.number().positive(),
        servingUnit: z.string(),
        nutrients: MacronutrientsSchema, // Calculated for the serving
    })),
    totalNutrients: MacronutrientsSchema,
    timestamp: z.date(),
});

export type Macronutrients = z.infer<typeof MacronutrientsSchema>;
export type FoodItem = z.infer<typeof FoodItemSchema>;
export type MealLog = z.infer<typeof MealLogSchema>;

// --- Subscriptions ---
export const SubscriptionTierSchema = z.enum(['STARTER', 'PRO', 'ELITE']);

export const UserSubscriptionSchema = z.object({
    id: z.string().uuid(),
    user_id: z.string().uuid(),
    tier_id: SubscriptionTierSchema,
    cv_credits_used_monthly: z.number().nonnegative(),
    chat_tokens_used_daily: z.number().nonnegative(),
    valid_until: z.date().optional().nullable(),
    created_at: z.date(),
    updated_at: z.date(),
});

export type SubscriptionTier = z.infer<typeof SubscriptionTierSchema>;
export type UserSubscription = z.infer<typeof UserSubscriptionSchema>;
