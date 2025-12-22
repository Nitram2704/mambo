import { useWeeklyScheduleStore } from '@/store/weeklyScheduleStore';
import { useWorkoutHistoryStore } from '@/store/workoutHistoryStore';
import { useSavedRoutinesStore } from '@/store/savedRoutinesStore';

export interface WellnessData {
    stressLevel: number; // 1-5
    energyLevel: number; // 1-5
    mood: number; // 1-5
    domsLevel: number; // 1-5 (Delayed Onset Muscle Soreness)
    sleepHours: number; // Hours of sleep from last night
}

export type RecommendationType =
    | 'maintain'
    | 'increase_intensity'
    | 'increase_rir'
    | 'deload'
    | 'active_recovery';

export interface AnalysisResult {
    completionRate: number;
    progressionRate: number;
    wellnessFactor: {
        stress: number;
        energy: number;
        mood: number;
        doms: number;
        sleep: number;
        average: number;
    };
    recommendation: RecommendationType;
    suggestedRirAdjustment?: number; // +1, +2, etc.
    message: string;
    isDeloadWeek: boolean;
}

/**
 * Analyzes weekly performance and wellness to provide adaptive recommendations
 */
export async function analyzeWeeklyProgress(
    wellnessData: WellnessData,
    isDeloadWeek: boolean = false
): Promise<AnalysisResult> {
    // Get stores
    const { schedule, getWorkoutsForDate } = useWeeklyScheduleStore.getState();
    const { workouts } = useWorkoutHistoryStore.getState();

    // Calculate date range (last 7 days)
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);

    // Get scheduled workouts for the week
    const scheduledWorkouts = schedule.filter(w => {
        const workoutDate = new Date(w.date);
        return workoutDate >= sevenDaysAgo && workoutDate <= today;
    });

    // Get completed workouts for the week
    const completedWorkouts = workouts.filter(w => {
        const workoutDate = new Date(w.startTime);
        return workoutDate >= sevenDaysAgo && workoutDate <= today;
    });

    // Calculate completion rate
    const completionRate = scheduledWorkouts.length > 0
        ? completedWorkouts.length / scheduledWorkouts.length
        : 0;

    // Calculate progression rate (volume change)
    // Compare this week's average volume to previous week
    const thisWeekVolume = completedWorkouts.reduce((sum, w) => sum + w.volume, 0) / Math.max(completedWorkouts.length, 1);

    const twoWeeksAgo = new Date(sevenDaysAgo);
    twoWeeksAgo.setDate(sevenDaysAgo.getDate() - 7);

    const previousWeekWorkouts = workouts.filter(w => {
        const workoutDate = new Date(w.startTime);
        return workoutDate >= twoWeeksAgo && workoutDate < sevenDaysAgo;
    });

    const previousWeekVolume = previousWeekWorkouts.reduce((sum, w) => sum + w.volume, 0) / Math.max(previousWeekWorkouts.length, 1);

    const progressionRate = previousWeekVolume > 0
        ? thisWeekVolume / previousWeekVolume
        : 1;

    // Calculate wellness factor
    const wellnessFactor = {
        stress: wellnessData.stressLevel,
        energy: wellnessData.energyLevel,
        mood: wellnessData.mood,
        doms: wellnessData.domsLevel,
        sleep: wellnessData.sleepHours,
        average: (wellnessData.stressLevel + wellnessData.energyLevel + wellnessData.mood) / 3
    };

    // Determine recommendation based on holistic analysis
    let recommendation: RecommendationType = 'maintain';
    let suggestedRirAdjustment: number | undefined;
    let message = '';

    if (isDeloadWeek) {
        // During deload week, always suggest active recovery
        recommendation = 'active_recovery';
        message = '📅 Estás en semana de descarga. Enfócate en recuperación activa y técnica. No te preocupes por el volumen bajo.';
    } else {
        // Recovery-based rules (highest priority)
        const poorSleep = wellnessData.sleepHours < 6;
        const highDoms = wellnessData.domsLevel >= 4;
        const goodRecovery = wellnessData.sleepHours >= 8 && wellnessData.domsLevel <= 2;

        // Holistic Logic
        const highStress = wellnessData.stressLevel >= 4;
        const extremeStress = wellnessData.stressLevel === 5;
        const lowEnergy = wellnessData.energyLevel <= 2;
        const extremeLowEnergy = wellnessData.energyLevel === 1;
        const goodWellness = wellnessData.stressLevel <= 2 && wellnessData.energyLevel >= 4;

        // Priority 1: Poor recovery (sleep + DOMS)
        if (poorSleep && highDoms) {
            recommendation = 'active_recovery';
            message = '😴💪 Tu cuerpo necesita recuperación. Dormiste poco y tienes mucho dolor muscular. Hoy: movilidad, estiramientos o descanso completo.';
        }
        // Priority 2: Extreme cases - force deload
        else if (extremeStress || extremeLowEnergy) {
            recommendation = 'deload';
            message = '⚠️ Tu nivel de estrés/energía está crítico. Te recomiendo reducir el volumen esta semana o tomar un descanso completo.';
        }
        // Priority 3: High stress but not extreme - increase RIR
        else if (highStress || lowEnergy) {
            recommendation = 'increase_rir';
            suggestedRirAdjustment = highStress ? 2 : 1;
            message = `🧠 Detecté estrés elevado. Sube tu RIR a ${suggestedRirAdjustment + 2}-${suggestedRirAdjustment + 3} para reducir fatiga sin perder volumen.`;
        }
        // Priority 4: Low completion rate - suggest maintenance
        else if (completionRate < 0.7) {
            recommendation = 'maintain';
            message = `📊 Completaste ${Math.round(completionRate * 100)}% de tus entrenamientos. Mantén la carga actual y enfócate en la consistencia.`;
        }
        // Priority 5: High performance + good recovery - push harder
        else if (goodRecovery && goodWellness && completionRate >= 0.9 && progressionRate >= 1.1) {
            recommendation = 'increase_intensity';
            message = '🔥 ¡Estás arrasando! Dormiste bien, sin dolor, y cumpliste todo. Tu cuerpo está listo para más. Considera subir pesos o bajar RIR.';
        }
        // Default - maintain
        else {
            recommendation = 'maintain';
            message = `✅ Vas bien. Completaste ${Math.round(completionRate * 100)}% de tus entrenamientos. Sigue así.`;
        }
    }

    return {
        completionRate,
        progressionRate,
        wellnessFactor,
        recommendation,
        suggestedRirAdjustment,
        message,
        isDeloadWeek
    };
}

/**
 * Applies the recommended adjustment to user's routines
 */
export async function applyAdjustment(
    recommendation: RecommendationType,
    rirAdjustment?: number
): Promise<string> {
    const { routines, updateRoutine } = useSavedRoutinesStore.getState();

    switch (recommendation) {
        case 'deload':
            // Reduce sets by 1 for all exercises in all routines
            for (const routine of routines) {
                const updatedExercises = routine.exercises.map(ex => ({
                    ...ex,
                    plannedSets: Math.max(1, (ex.plannedSets || 3) - 1)
                }));
                await updateRoutine(routine.id, { exercises: updatedExercises });
            }
            return 'Se redujo 1 serie a todos los ejercicios de tus rutinas.';

        case 'increase_rir':
            // This is more of a notification/reminder, not a structural change
            return `Recuerda: Entrena con RIR ${rirAdjustment ? rirAdjustment + 2 : 3}-${rirAdjustment ? rirAdjustment + 3 : 4} esta semana.`;

        case 'increase_intensity':
            return 'Considera subir 2.5-5kg en tus ejercicios principales o bajar RIR a 0-1.';

        case 'active_recovery':
            return 'Enfócate en movilidad, técnica y recuperación activa esta semana.';

        default:
            return 'Mantén tu plan actual.';
    }
}
