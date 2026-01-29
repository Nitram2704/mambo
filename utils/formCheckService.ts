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
        - Profundidad: Cadera por debajo de la línea de las rodillas.
        - Rodillas: Alineadas con la punta de los pies, sin colapso interno (valgo).
        - Espalda: Mantener columna neutral, evitar el "butt wink" o redondeo lumbar.
        - Apoyo: Peso distribuido en todo el pie, talones pegados al suelo.
        `,
        'Deadlift': `
        - Setup: Barra sobre la mitad del pie, espinillas cerca de la barra.
        - Espalda: Columna neutral desde el inicio hasta el bloqueo.
        - Bar path: La barra debe subir pegada a las piernas en línea vertical.
        - Extensión: Caderas y rodillas se extienden al unísono.
        `,
        'Bench Press': `
        - Apoyo: Pies firmes en el suelo, glúteos y escápulas en el banco.
        - Bar path: Descenso controlado hacia el esternón, subida en ligero arco.
        - Codos: Ángulo de 45-75 grados respecto al torso.
        - Rango: La barra debe tocar el pecho sin rebotar.
        `,
        'Overhead Press': `
        - Bar path: Vertical, pasando lo más cerca posible de la cara.
        - Core: Glúteos y abdomen contraídos para evitar hiperextensión lumbar.
        - Lockout: Brazos totalmente extendidos sobre la vertical de los hombros.
        - Estabilidad: Sin impulso de piernas (a menos que sea Push Press).
        `,
        'Lunge': `
        - Estabilidad: Torso erguido, evitar inclinación lateral.
        - Rodilla delantera: Alineada con el pie, no colapsa hacia adentro.
        - Profundidad: La rodilla trasera casi toca el suelo, ángulo de 90° en ambas piernas.
        - Paso: Longitud suficiente para mantener el equilibrio.
        `,
        'Row': `
        - Espalda: Paralela o casi paralela al suelo, columna neutral.
        - Tracción: Llevar la barra/mancuerna hacia la cadera, no hacia el pecho.
        - Escápulas: Retracción completa al final del movimiento.
        - Control: Evitar el balanceo excesivo del torso.
        `,
        'Pull-up': `
        - Rango: Iniciar desde extensión completa, barbilla sobre la barra.
        - Control: Evitar el "kipping" o balanceo excesivo.
        - Hombros: Mantener escápulas deprimidas y activas.
        - Core: Cuerpo en posición de "hollow body", piernas juntas.
        `,
        'Bicep Curl': `
        - Codos: Pegados al torso, sin desplazarse hacia adelante o atrás.
        - Rango: Extensión completa abajo, contracción máxima arriba.
        - Postura: Torso inmóvil, evitar usar el impulso de la espalda.
        - Muñecas: Neutras, sin flexión excesiva.
        `,
    };

    return criteria[exerciseName] || `
    - Técnica general del ejercicio
    - Rango de movimiento completo
    - Control del peso
    - Postura y alineación corporal
    `;
}
