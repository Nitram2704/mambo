import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(API_KEY);

export interface BodyScanResult {
    metrics: {
        vTaper: number; // 0-100 score
        symmetry: number; // 0-100 score
        muscleMass: number; // 0-100 score
        definition: number; // Estimated body fat percentage
        potential: number; // 0-100 score
    };
    insights: {
        strongPoints: string[];
        weakPoints: string[];
        generalAdvice: string;
    };
    naturalProbability: number; // 0-100 percentage
}

export const analyzePhysique = async (imageBase64: string): Promise<BodyScanResult> => {
    if (!API_KEY) {
        throw new Error('Gemini API Key not configured');
    }

    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

        const prompt = `
        Analiza esta foto de físico y proporciona una evaluación detallada. 
        Eres un experto en culturismo y estética.
        
        Debes devolver ÚNICAMENTE un objeto JSON con la siguiente estructura:
        {
            "metrics": {
                "vTaper": 85,
                "symmetry": 90,
                "muscleMass": 75,
                "definition": 12.5,
                "potential": 80
            },
            "insights": {
                "strongPoints": ["Hombros anchos", "Cintura estrecha"],
                "weakPoints": ["Falta de pico en el bíceps", "Gemelos"],
                "generalAdvice": "Enfócate en el entrenamiento de pierna para mejorar la simetría general."
            },
            "naturalProbability": 99
        }

        Notas para las métricas:
        - vTaper: Relación hombros-cintura (0-100).
        - symmetry: Balance entre lados y grupos musculares (0-100).
        - muscleMass: Estimación de masa muscular para tu peso/altura (0-100).
        - definition: Estimación visual del porcentaje de grasa corporal (ej: 15.0).
        - potential: Análisis de inserciones y estructura ósea (0-100).
        - naturalProbability: Probabilidad de que el físico sea natural (0-100).

        Responde SOLO el JSON, sin texto adicional ni formato markdown.
        `;

        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    data: imageBase64,
                    mimeType: 'image/jpeg'
                }
            }
        ]);

        const response = await result.response;
        const text = response.text();

        // Clean up markdown if present
        const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(jsonStr);
    } catch (error) {
        console.error('Error analyzing physique:', error);
        throw error;
    }
};
