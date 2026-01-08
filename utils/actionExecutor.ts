import { useWeeklyScheduleStore } from '@/store/weeklyScheduleStore';
import { useNutritionStore, MealType } from '@/store/nutritionStore';
import { useSavedRoutinesStore } from '@/store/savedRoutinesStore';
import { EXERCISES, Exercise, MuscleGroup } from '@/constants/exercises';

export class ActionExecutor {
    private static getRandomExercises(count: number, muscleGroup?: MuscleGroup): Exercise[] {
        let pool = EXERCISES;
        if (muscleGroup) {
            pool = EXERCISES.filter(e => e.muscleGroup === muscleGroup);
        }

        // Shuffle and slice
        const shuffled = [...pool].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
    }

    private static mapKeywordToMuscleGroup(keyword: string): MuscleGroup | undefined {
        const lower = keyword.toLowerCase();
        if (lower.includes('pierna') || lower.includes('leg') || lower.includes('inferior')) return 'legs';
        if (lower.includes('pecho') || lower.includes('chest') || lower.includes('torso')) return 'chest';
        if (lower.includes('espalda') || lower.includes('back') || lower.includes('dorsal')) return 'back';
        if (lower.includes('hombro') || lower.includes('shoulder')) return 'shoulders';
        if (lower.includes('brazo') || lower.includes('arm') || lower.includes('biceps') || lower.includes('triceps')) return 'biceps';
        if (lower.includes('abdomen') || lower.includes('core') || lower.includes('abs')) return 'abs';
        if (lower.includes('cardio') || lower.includes('aerobico')) return 'cardio';
        return undefined;
    }

    static async scheduleWorkout(args: { routineName: string; date: string }) {
        try {
            const { addWorkoutToSchedule } = useWeeklyScheduleStore.getState();
            const { routines, addRoutine } = useSavedRoutinesStore.getState();

            // 1. Check if routine exists
            let routineId = routines.find(r => r.name.toLowerCase() === args.routineName.toLowerCase())?.id;

            // 2. If not, create it with REAL exercises
            if (!routineId) {
                const muscleGroup = this.mapKeywordToMuscleGroup(args.routineName);
                const exercises = this.getRandomExercises(5, muscleGroup);

                // Add default sets/reps/rest
                const exercisesWithDetails = exercises.map(e => ({
                    ...e,
                    plannedSets: 3,
                    restTime: 90
                }));

                const newRoutineId = await addRoutine(args.routineName, exercisesWithDetails);
                if (newRoutineId) {
                    routineId = newRoutineId;
                }
            }

            if (!routineId) throw new Error("Failed to create or find routine");

            addWorkoutToSchedule({
                routineId,
                routineName: args.routineName,
                date: args.date
            });

            return `Entrenamiento "${args.routineName}" programado para el ${args.date}.`;
        } catch (e) {
            console.error(e);
            return "Error al programar el entrenamiento.";
        }
    }

    static async logFood(args: { foodName: string; calories: number; protein?: number; carbs?: number; fats?: number; mealType: MealType }) {
        try {
            const { logMeal } = useNutritionStore.getState();

            logMeal({
                name: args.foodName,
                calories: args.calories,
                protein: args.protein || 0,
                carbs: args.carbs || 0,
                fats: args.fats || 0,
                mealType: args.mealType
            });

            return `Registrado: ${args.foodName} (${args.calories} kcal) para ${args.mealType}.`;
        } catch (e) {
            console.error(e);
            return "Error al registrar el alimento.";
        }
    }

    static async createWeeklyPlan(args: { daysPerWeek: number; focus: string }) {
        try {
            const { addWorkoutToSchedule, schedule } = useWeeklyScheduleStore.getState();
            const today = new Date();

            // Define a simple split based on focus
            const splits: Record<string, string[]> = {
                'fuerza': ['Torso Fuerza', 'Pierna Fuerza', 'Full Body'],
                'hipertrofia': ['Pecho y Espalda', 'Pierna', 'Hombro y Brazo', 'Pierna y Glúteo'],
                'perdida_peso': ['Full Body A', 'Cardio HIIT', 'Full Body B', 'Cardio LISS'],
                'general': ['Full Body A', 'Full Body B', 'Full Body C']
            };

            const selectedSplit = splits[args.focus.toLowerCase()] || splits['general'];

            let scheduledCount = 0;
            for (let i = 1; i <= 7; i++) {
                if (scheduledCount >= args.daysPerWeek) break;

                const date = new Date(today);
                date.setDate(today.getDate() + i);
                const dateString = date.toISOString().split('T')[0];

                // Skip if already scheduled
                const existing = schedule.find(w => w.date === dateString);
                if (!existing) {
                    const routineName = selectedSplit[scheduledCount % selectedSplit.length];

                    // Create routine if it doesn't exist (using same logic as scheduleWorkout)
                    await this.scheduleWorkout({ routineName, date: dateString });
                    scheduledCount++;
                }
            }

            return `Plan semanal creado: ${args.daysPerWeek} días de entrenamiento con enfoque en ${args.focus}. Revisa la pestaña 'Plan'.`;
        } catch (e) {
            console.error(e);
            return "Error al crear el plan semanal.";
        }
    }

    static async skipWorkout(args: { date: string }) {
        try {
            const { schedule, removeWorkoutFromSchedule } = useWeeklyScheduleStore.getState();
            const workouts = schedule.filter(w => w.date === args.date);

            if (workouts.length === 0) {
                return `No hay entrenamientos programados para el ${args.date} para saltar.`;
            }

            workouts.forEach(w => removeWorkoutFromSchedule(w.id));

            return `Entrenamientos del ${args.date} eliminados/saltados.`;
        } catch (e) {
            console.error(e);
            return "Error al saltar el entrenamiento.";
        }
    }
}
