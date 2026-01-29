import { WorkoutData } from '@/types/social';

export const generateWorkoutPost = (workout: any): { content: string, workout_data: WorkoutData } => {
    // Calculate stats
    const duration = workout.duration || 0;
    const volume = workout.exercises.reduce((acc: number, ex: any) => {
        return acc + ex.sets.reduce((sAcc: number, set: any) => sAcc + (set.weight * set.reps), 0);
    }, 0);

    // Count PRs (mock logic for now, would need history comparison)
    const prCount = Math.floor(Math.random() * 3); // Placeholder

    // Generate engaging caption
    const captions = [
        `🔥 Acabo de destruir ${workout.name}!`,
        `💪 ${Math.floor(volume)}kg movidos hoy. La constancia es clave.`,
        `🚀 Otro día, otra victoria. ${workout.name} completado.`,
        `⚡ Mambo Mode activado. Gran sesión de ${workout.name}.`
    ];

    const randomCaption = captions[Math.floor(Math.random() * captions.length)];

    return {
        content: randomCaption,
        workout_data: {
            duration,
            volume,
            pr_count: prCount,
            workout_name: workout.name,
            intensity: 8 // Placeholder
        }
    };
};
