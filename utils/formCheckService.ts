import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(API_KEY);

export interface FormCheckResult {
    score: number; // 0-100
    feedback: string[];
    analysis: {
        strengths: string[];
        issues: string[];
        corrections: string[];
    };
    keyPoints: {
        depth?: string;
        barPath?: string;
        kneeTracking?: string;
        hipHinge?: string;
        spineNeutral?: string;
    };
}

export const analyzeExerciseForm = async (
    videoBase64: string,
    exerciseName: string
): Promise<FormCheckResult> => {
    if (!API_KEY) {
        throw new Error('Gemini API Key not configured');
    }

    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

        const prompt = `
        Eres un entrenador personal experto en biomecánica y análisis de movimiento.
        Analiza este video de un ejercicio de ${exerciseName} y proporciona feedback técnico detallado.
        
        Debes devolver ÚNICAMENTE un objeto JSON con la siguiente estructura:
        {
            "score": 85,
            "feedback": ["Profundidad adecuada", "Rodillas alineadas correctamente"],
            "analysis": {
                "strengths": ["Buena profundidad", "Espalda neutral"],
                "issues": ["Rodillas se desplazan hacia adentro", "Bar path no vertical"],
                "corrections": ["Empuja las rodillas hacia afuera", "Mantén el peso en el centro del pie"]
            },
            "keyPoints": {
                "depth": "Profundidad completa alcanzada",
                "barPath": "Desviación leve hacia adelante",
                "kneeTracking": "Rodillas colapsan ligeramente",
                "hipHinge": "Bisagra de cadera correcta",
                "spineNeutral": "Columna neutral mantenida"
            }
        }

        Criterios de evaluación:
        - Score: 0-100 basado en la calidad técnica general
        - Feedback: Lista de observaciones clave (3-5 puntos)
        - Strengths: Aspectos bien ejecutados
        - Issues: Problemas técnicos identificados
        - Corrections: Correcciones específicas y accionables
        - KeyPoints: Evaluación de puntos técnicos específicos del ejercicio

        Para ${exerciseName}, enfócate en:
        ${getExerciseSpecificCriteria(exerciseName)}

        Responde SOLO el JSON, sin texto adicional ni formato markdown.
        `;

        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    data: videoBase64,
                    mimeType: 'video/mp4'
                }
            }
        ]);

        const response = await result.response;
        const text = response.text();

        // Clean up markdown if present
        const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(jsonStr);
    } catch (error) {
        console.error('Error analyzing exercise form:', error);
        throw error;
    }
};

function getExerciseSpecificCriteria(exerciseName: string): string {
    const criteria: Record<string, string> = {
        'Squat': `
        - Profundidad: Cadera por debajo de rodillas
        - Rodillas: Alineadas con pies, sin colapso interno
        - Espalda: Neutral, sin redondeo lumbar
        - Bar path: Vertical sobre el centro del pie
        `,
        'Deadlift': `
        - Setup: Barra sobre medio pie, caderas arriba de rodillas
        - Espalda: Neutral durante todo el movimiento
        - Bar path: Pegada a las piernas, vertical
        - Lockout: Caderas y rodillas extendidas simultáneamente
        `,
        'Bench Press': `
        - Arco: Arco natural en la espalda baja
        - Bar path: Línea recta vertical
        - Codos: Ángulo de 45-75 grados
        - Profundidad: Barra toca el pecho
        `,
        'Overhead Press': `
        - Bar path: Vertical, cerca de la cara
        - Core: Activado, sin hiperextensión lumbar
        - Lockout: Completo, barra sobre hombros
        - Cabeza: Se mueve hacia atrás para dejar pasar la barra
        `,
    };

    return criteria[exerciseName] || `
    - Técnica general del ejercicio
    - Rango de movimiento completo
    - Control del peso
    - Postura y alineación corporal
    `;
}
