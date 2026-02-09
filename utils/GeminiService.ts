import { GoogleGenerativeAI } from '@google/generative-ai';
import { UserContext } from './aiService';

const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(API_KEY);

export interface WorkoutState {
    exerciseName: string;
    currentSet: number;
    totalSets: number;
    lastWeight?: number;
    lastReps?: number;
    targetReps?: number;
    rpe?: number;
}

export const GeminiService = {
    getWorkoutCue: async (state: WorkoutState, context: UserContext): Promise<string> => {
        if (!API_KEY) return '';

        try {
            const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

            const style = context.coachStyle || 'amigo';
            const stylePrompt = {
                sargento: "Eres un sargento de hierro. Sé duro, directo y no aceptes excusas. Usa frases cortas.",
                cientifico: "Eres un científico del deporte. Enfócate en la técnica, la biomecánica y la optimización.",
                amigo: "Eres un amigo motivador. Sé empático, cercano y anima con entusiasmo."
            }[style];

            const prompt = `
            ${stylePrompt}
            
            Contexto del entrenamiento:
            - Ejercicio: ${state.exerciseName}
            - Serie actual: ${state.currentSet} de ${state.totalSets}
            - Último rendimiento: ${state.lastWeight}kg x ${state.lastReps} reps
            - Objetivo: ${state.targetReps} reps
            
            Genera un "cue" o consejo corto (máximo 15 palabras) para decir por voz justo antes de empezar la serie.
            Si es la primera serie, da un consejo técnico.
            Si es la última serie, da un mensaje de motivación máxima.
            Si la serie anterior fue difícil (RPE alto), sugiere ajustar o mantener el foco.
            
            Responde SOLO con el texto del consejo en español.
            `;

            const result = await model.generateContent(prompt);
            return result.response.text().trim();
        } catch (error) {
            console.error('GeminiService.getWorkoutCue error:', error);
            return '';
        }
    },

    chat: async (prompt: string): Promise<{ response: string }> => {
        try {
            const genAI = new GoogleGenerativeAI(process.env.EXPO_PUBLIC_GEMINI_API_KEY || '');
            const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
            const result = await model.generateContent(prompt);
            return { response: result.response.text() };
        } catch (error) {
            console.error('Gemini Chat Error:', error);
            return { response: "¡A darle con todo! 💪" };
        }
    }
};
