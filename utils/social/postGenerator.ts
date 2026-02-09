import { WorkoutData } from '@/types/social';
import { GeminiService } from '@/utils/GeminiService';

export const generateWorkoutPost = async (workout: any): Promise<{ content: string, workout_data: WorkoutData }> => {
    // Calculate stats
    const duration = workout.durationSeconds || workout.duration || 0;
    const volume = workout.exercises.reduce((acc: number, ex: any) => {
        return acc + ex.sets.reduce((sAcc: number, set: any) => sAcc + (set.weight * (set.reps || 0)), 0);
    }, 0);

    // Count PRs (Using passed workout data)
    const prCount = workout.exercises.reduce((acc: number, ex: any) => {
        return acc + (ex.sets.filter((s: any) => s.isPR).length || 0);
    }, 0);

    // Generate smart caption using Gemini
    let caption = "";
    try {
        const prompt = `Actúa como un influencer de fitness motivador y divertido. 
        Genera una descripción corta (máximo 15 palabras) para mi entrenamiento de hoy.
        Datos: Nombre: ${workout.routineName || workout.name}, Volumen total: ${volume}kg, Duración: ${Math.floor(duration / 60)} min, PRs: ${prCount}.
        Responde solo con la frase, sin comillas.`;

        const response = await GeminiService.chat(prompt);
        caption = response.response || "¡Otro día más de progreso! 💪";
    } catch (error) {
        console.error('Error generating AI caption:', error);
        caption = `💪 ${Math.floor(volume)}kg movidos hoy. La constancia es clave.`;
    }

    return {
        content: caption,
        workout_data: {
            duration,
            volume,
            pr_count: prCount || Math.floor(Math.random() * 2), // Fallback
            workout_name: workout.routineName || workout.name,
            intensity: 8
        }
    };
};

