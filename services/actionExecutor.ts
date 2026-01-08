import { useRoutineStore } from '@/store/routineStore';
import { useSavedRoutinesStore } from '@/store/savedRoutinesStore';
import { useMealPlanStore, DailyMealPlan, Meal } from '@/store/mealPlanStore';
import { useWorkoutHistoryStore } from '@/store/workoutHistoryStore';
import { useUserProfileStore } from '@/store/userProfileStore';
import { useSleepStore } from '@/store/sleepStore';
import { useWeeklyScheduleStore } from '@/store/weeklyScheduleStore';
import { useNutritionStore } from '@/store/nutritionStore';
import { HealthService } from '@/utils/healthService';
import { EXERCISES } from '@/constants/exercises';
import { generateNutritionPlan } from '@/utils/planGenerator';

export class ActionExecutor {

    // Basic actions from utils/actionExecutor.ts
    static async scheduleWorkout(args: { routineName: string; date: string }) {
        try {
            const { addWorkoutToSchedule } = useWeeklyScheduleStore.getState();
            const { routines, addRoutine } = useSavedRoutinesStore.getState();

            // 1. Check if routine exists (fuzzy match)
            const searchName = args.routineName.toLowerCase();
            let routine = routines.find(r => r.name.toLowerCase() === searchName);

            if (!routine) {
                routine = routines.find(r =>
                    r.name.toLowerCase().includes(searchName) ||
                    searchName.includes(r.name.toLowerCase())
                );
            }

            let routineId = routine?.id;
            const finalRoutineName = routine?.name || args.routineName;

            // 2. If not, create it with REAL exercises
            if (!routineId) {
                const { processWorkoutExercises } = await import('@/utils/exerciseMapper');
                const query = args.routineName.toLowerCase();
                let filteredExercises = EXERCISES;
                if (query.includes('pecho')) filteredExercises = EXERCISES.filter(e => e.muscleGroup === 'chest');
                else if (query.includes('espalda')) filteredExercises = EXERCISES.filter(e => e.muscleGroup === 'back');
                else if (query.includes('pierna')) filteredExercises = EXERCISES.filter(e => e.muscleGroup === 'legs');
                else if (query.includes('hombro')) filteredExercises = EXERCISES.filter(e => e.muscleGroup === 'shoulders');

                const exercisesToMap = filteredExercises.slice(0, 5).map(e => ({
                    name: e.name,
                    sets: 3,
                    reps: '10-12',
                    rest: 90
                }));

                const mappedExercises = await processWorkoutExercises(exercisesToMap);

                if (mappedExercises.length === 0) {
                    throw new Error("No se pudieron encontrar ejercicios para esta rutina.");
                }

                const newRoutineId = await addRoutine(args.routineName, mappedExercises);
                if (newRoutineId) {
                    routineId = newRoutineId;
                }
            }

            if (!routineId) throw new Error("Failed to create or find routine");

            const cleanDate = args.date.split('T')[0];

            addWorkoutToSchedule({
                routineId,
                routineName: finalRoutineName,
                date: cleanDate
            });

            return `Entrenamiento "${finalRoutineName}" programado para el ${cleanDate}.`;
        } catch (e) {
            console.error(e);
            return "Error al programar el entrenamiento.";
        }
    }

    static async logFood(args: { foodName: string; calories: number; protein?: number; carbs?: number; fats?: number; mealType: string }) {
        try {
            const { logMeal } = useNutritionStore.getState();

            logMeal({
                name: args.foodName,
                calories: args.calories,
                protein: args.protein || 0,
                carbs: args.carbs || 0,
                fats: args.fats || 0,
                mealType: args.mealType as any
            });

            return `Registrado: ${args.foodName} (${args.calories} kcal) para ${args.mealType}.`;
        } catch (e) {
            console.error(e);
            return "Error al registrar el alimento.";
        }
    }

    static async createWeeklyPlan(args: { daysPerWeek: number; focus?: string }) {
        try {
            const { addWorkoutToSchedule, schedule } = useWeeklyScheduleStore.getState();
            const today = new Date();

            const splits: Record<string, string[]> = {
                'fuerza': ['Torso Fuerza', 'Pierna Fuerza', 'Full Body'],
                'hipertrofia': ['Pecho y Espalda', 'Pierna', 'Hombro y Brazo'],
                'perdida_peso': ['Full Body A', 'Cardio HIIT', 'Full Body B'],
                'general': ['Full Body A', 'Full Body B', 'Full Body C']
            };

            const selectedSplit = splits[args.focus?.toLowerCase() || 'general'] || splits['general'];

            let scheduledCount = 0;
            for (let i = 1; i <= 7; i++) {
                if (scheduledCount >= args.daysPerWeek) break;

                const date = new Date(today);
                date.setDate(today.getDate() + i);
                const dateString = date.toISOString().split('T')[0];

                const existing = schedule.find(w => w.date === dateString);
                if (!existing) {
                    const routineName = selectedSplit[scheduledCount % selectedSplit.length];
                    await this.scheduleWorkout({ routineName, date: dateString });
                    scheduledCount++;
                }
            }

            return `Plan semanal creado: ${args.daysPerWeek} días de entrenamiento con enfoque en ${args.focus || 'general'}.`;
        } catch (e) {
            console.error(e);
            return "Error al crear el plan semanal.";
        }
    }

    static async adjustWeeklyRoutine(params: { daysPerWeek?: number, durationMinutes?: number, focus?: string }) {
        console.log('Executing adjustWeeklyRoutine:', params);
        const { setName, addExercise, resetRoutine } = useRoutineStore.getState();

        resetRoutine();
        setName(`Rutina Sugerida (${params.daysPerWeek || 3} días)`);

        const focus = params.focus?.toLowerCase() || 'general';
        let filteredExercises = EXERCISES;
        if (focus.includes('fuerza') || focus.includes('hipertrofia')) {
            filteredExercises = EXERCISES.filter(e => ['chest', 'back', 'legs'].includes(e.muscleGroup));
        } else if (focus.includes('perdida') || focus.includes('cardio')) {
            filteredExercises = EXERCISES.filter(e => e.muscleGroup === 'cardio' || e.muscleGroup === 'abs');
        }

        const selectedExercises = filteredExercises.slice(0, 6);
        selectedExercises.forEach(ex => addExercise({
            ...ex,
            plannedSets: 3,
            restTime: 90
        }));

        return `He preparado una nueva rutina de ${params.daysPerWeek || 3} días con enfoque en ${params.focus || 'general'}. Revisa la pestaña de "Entrenos" para guardarla.`;
    }

    static async modifyTodaysMeals(params: { date?: string, addCalories?: number }) {
        console.log('Executing modifyTodaysMeals:', params);
        const { updateDayMeals, weeklyPlan } = useMealPlanStore.getState();
        const date = params.date ? new Date(params.date) : new Date();

        const existingPlan = weeklyPlan.find(p => p.date.toDateString() === date.toDateString());
        const currentMeals = existingPlan?.meals || [];

        if (params.addCalories) {
            const newSnack: Meal = {
                id: Date.now().toString(),
                type: 'snack',
                name: 'Snack Energético (IA)',
                calories: params.addCalories,
                protein: 10,
                carbs: 20,
                fat: 5,
                ingredients: ['Generado por IA'],
            };

            await updateDayMeals(date, [...currentMeals, newSnack]);
            return `He añadido un snack de ${params.addCalories} kcal a tu plan de hoy.`;
        }

        return "No se especificaron cambios claros para las comidas.";
    }

    static async generateMealPlan(params: { calories: number, dietType?: string }) {
        console.log('Executing generateMealPlan:', params);
        const { saveAsTemplate } = useMealPlanStore.getState();
        const { profile } = useUserProfileStore.getState();

        if (!profile) return "No se encontró el perfil del usuario.";

        const plan = await generateNutritionPlan({
            ...profile,
            calorieGoal: params.calories,
            dietaryPreferences: params.dietType as any || profile.dietaryPreferences
        });

        if (!plan || !plan.days) return "Hubo un error generando el plan.";

        const days: DailyMealPlan[] = [];
        const today = new Date();

        plan.days.forEach((day, index) => {
            const date = new Date(today);
            date.setDate(date.getDate() + index);

            days.push({
                id: `gen-${Date.now()}-${index}`,
                date: date,
                meals: day.meals.map((m, mIndex) => ({
                    id: `m-${Date.now()}-${index}-${mIndex}`,
                    type: m.type,
                    name: m.name,
                    calories: m.calories,
                    protein: m.protein,
                    carbs: m.carbs,
                    fat: m.fat,
                    ingredients: m.ingredients,
                    instructions: m.instructions,
                    prepTime: m.prepTime
                }))
            });
        });

        await saveAsTemplate(days);
        return `He generado un nuevo plan de comidas mensual de ${params.calories} kcal (28 días) que se repetirá cada mes.`;
    }

    static async skipWorkout(params: { date?: string }) {
        console.log('Executing skipWorkout:', params);
        const { addWorkout } = useWorkoutHistoryStore.getState();

        await addWorkout({
            id: '',
            routineId: 'rest-day',
            routineName: 'Día de Descanso',
            startTime: new Date(),
            endTime: new Date(),
            durationSeconds: 0,
            volume: 0,
            exercises: []
        });

        return "He registrado el día de hoy como descanso. ¡Recupérate bien!";
    }

    static async adjustIntensity(params: { routineId?: string, factor: number }) {
        console.log('Executing adjustIntensity:', params);
        const { routines, updateRoutine } = useSavedRoutinesStore.getState();

        if (!params.routineId) {
            if (routines.length === 0) return "No tienes rutinas guardadas para ajustar.";
            params.routineId = routines[0].id;
        }

        const routine = routines.find(r => r.id === params.routineId);
        if (!routine) return "No encontré la rutina especificada.";

        const newExercises = routine.exercises.map(ex => ({
            ...ex,
            plannedSets: Math.max(1, Math.round((ex.plannedSets || 3) * params.factor))
        }));

        await updateRoutine(routine.id, { exercises: newExercises });

        const direction = params.factor > 1 ? "aumentado" : "reducido";
        return `He ${direction} el volumen (series) de la rutina "${routine.name}".`;
    }

    static async analyzeRecovery(params: {}) {
        console.log('Executing analyzeRecovery');
        const { sleepLogs } = useSleepStore.getState();
        const { workouts } = useWorkoutHistoryStore.getState();
        const healthData = await HealthService.getTodayData();

        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const dateKey = yesterday.toISOString().split('T')[0];

        const lastSleep = sleepLogs[dateKey];
        const recentWorkouts = workouts.filter(w => {
            const wDate = new Date(w.endTime);
            return (today.getTime() - wDate.getTime()) < (48 * 60 * 60 * 1000);
        });

        let advice = "Tu recuperación parece normal.";
        let intensity = "media";

        const sleepDuration = Math.max(lastSleep?.duration || 0, healthData.sleepMinutes);

        if (sleepDuration < 360) {
            advice = `Has dormido poco (${Math.round(sleepDuration / 60)}h). Te recomiendo reducir la intensidad hoy.`;
            intensity = "baja";
        } else if (healthData.steps > 15000) {
            advice = "Has caminado muchísimo hoy. Tus piernas pueden estar fatigadas. Considera una sesión de tren superior.";
            intensity = "media-baja";
        } else if (recentWorkouts.length > 1) {
            advice = "Has entrenado bastante recientemente. Considera una sesión ligera o descanso activo.";
            intensity = "media-baja";
        } else if (lastSleep && lastSleep.quality === 5) {
            advice = "¡Tu descanso ha sido excelente! Hoy puedes darle duro.";
            intensity = "alta";
        }

        return `Análisis de Recuperación: ${advice} (Pasos hoy: ${healthData.steps}, Sueño: ${Math.round(sleepDuration / 60)}h). Intensidad recomendada: ${intensity}`;
    }

    static async substituteExercise(params: { routineId?: string, oldExerciseName: string, newExerciseName: string }) {
        console.log('Executing substituteExercise:', params);
        const { routines, updateRoutine } = useSavedRoutinesStore.getState();

        if (!params.routineId && routines.length > 0) params.routineId = routines[0].id;
        const routine = routines.find(r => r.id === params.routineId);

        if (!routine) return "No encontré la rutina.";

        const oldExIndex = routine.exercises.findIndex(e =>
            e.name.toLowerCase().includes(params.oldExerciseName.toLowerCase()) ||
            params.oldExerciseName.toLowerCase().includes(e.name.toLowerCase())
        );

        if (oldExIndex === -1) return `No encontré el ejercicio "${params.oldExerciseName}" en la rutina "${routine.name}".`;

        const { processWorkoutExercises } = await import('@/utils/exerciseMapper');
        const mapped = await processWorkoutExercises([{
            name: params.newExerciseName,
            sets: routine.exercises[oldExIndex].plannedSets || 3,
            reps: '10-12',
            rest: routine.exercises[oldExIndex].restTime || 90
        }]);

        if (mapped.length === 0) return `No encontré el ejercicio "${params.newExerciseName}" en la base de datos.`;
        const newEx = mapped[0];

        const newExercises = [...routine.exercises];
        newExercises[oldExIndex] = {
            ...newEx,
            plannedSets: routine.exercises[oldExIndex].plannedSets,
            restTime: routine.exercises[oldExIndex].restTime,
            plannedSetTypes: routine.exercises[oldExIndex].plannedSetTypes as any
        };

        await updateRoutine(routine.id, { exercises: newExercises });

        return `He cambiado "${routine.exercises[oldExIndex].name}" por "${newEx.name}" en la rutina "${routine.name}". (Si estás entrenando ahora, reinicia la sesión para ver cambios)`;
    }

    static async addExerciseToRoutine(params: { routineId?: string, routineName?: string, exerciseName: string }) {
        console.log('Executing addExerciseToRoutine:', params);
        const { routines, updateRoutine } = useSavedRoutinesStore.getState();

        let routine;
        if (params.routineId) {
            routine = routines.find(r => r.id === params.routineId);
        } else if (params.routineName) {
            const rName = params.routineName;
            routine = routines.find(r => r.name.toLowerCase().includes(rName.toLowerCase()));
        } else if (routines.length > 0) {
            routine = routines[0];
        }

        if (!routine) return "No encontré la rutina especificada.";

        const { processWorkoutExercises } = await import('@/utils/exerciseMapper');
        const mapped = await processWorkoutExercises([{
            name: params.exerciseName,
            sets: 3,
            reps: '10-12',
            rest: 90
        }]);

        if (mapped.length === 0) return `No encontré el ejercicio "${params.exerciseName}" en la base de datos.`;
        const newEx = mapped[0];

        const newExercises = [...routine.exercises, {
            ...newEx,
            plannedSets: 3,
            restTime: 90,
            plannedSetTypes: ['normal', 'normal', 'normal'] as any
        }];
        await updateRoutine(routine.id, { exercises: newExercises });

        return `He añadido "${newEx.name}" a la rutina "${routine.name}".`;
    }

    static async removeExerciseFromRoutine(params: { routineId?: string, routineName?: string, exerciseName: string }) {
        console.log('Executing removeExerciseFromRoutine:', params);
        const { routines, updateRoutine } = useSavedRoutinesStore.getState();

        let routine;
        if (params.routineId) {
            routine = routines.find(r => r.id === params.routineId);
        } else if (params.routineName) {
            const rName = params.routineName;
            routine = routines.find(r => r.name.toLowerCase().includes(rName.toLowerCase()));
        } else if (routines.length > 0) {
            routine = routines[0];
        }

        if (!routine) return "No encontré la rutina especificada.";

        const exIndex = routine.exercises.findIndex(e => e.name.toLowerCase().includes(params.exerciseName.toLowerCase()));
        if (exIndex === -1) return `No encontré el ejercicio "${params.exerciseName}" en la rutina "${routine.name}".`;

        const removedName = routine.exercises[exIndex].name;
        const newExercises = routine.exercises.filter((_, i) => i !== exIndex);
        await updateRoutine(routine.id, { exercises: newExercises });

        return `He eliminado "${removedName}" de la rutina "${routine.name}".`;
    }
}
