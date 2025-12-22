import { GoogleGenerativeAI } from '@google/generative-ai';
// Use legacy API to fix deprecation warning
import * as FileSystem from 'expo-file-system/legacy';

const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(API_KEY);

export interface FoodAnalysisResult {
    foodName: string;
    description: string;
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    portionSize: string;
    confidence: number; // 0-1
}

/**
 * Converts image URI to base64
 */
async function imageToBase64(uri: string): Promise<string> {
    try {
        const base64 = await FileSystem.readAsStringAsync(uri, {
            encoding: FileSystem.EncodingType.Base64,
        });
        return base64;
    } catch (error) {
        console.error('Error converting image to base64:', error);
        throw error;
    }
}

/**
 * Analyzes a food image using Gemini Vision API
 */
export async function analyzeFoodImage(imageUri: string): Promise<FoodAnalysisResult> {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

        // Convert image to base64
        const base64Image = await imageToBase64(imageUri);

        const prompt = `Analiza esta imagen de comida y proporciona estimaciones nutricionales precisas.

IMPORTANTE: Responde SOLO con JSON válido, sin texto adicional, sin markdown, sin comentarios.

Formato de respuesta:
{
  "foodName": "nombre del platillo principal",
  "description": "descripción breve de los alimentos visibles",
  "calories": número estimado de calorías totales,
  "protein": gramos de proteína,
  "carbs": gramos de carbohidratos,
  "fats": gramos de grasas,
  "portionSize": "descripción del tamaño de porción (ej: '1 plato mediano', '200g')",
  "confidence": número entre 0 y 1 indicando tu nivel de confianza en la estimación
}

Considera:
- Tamaño de las porciones visibles
- Densidad calórica de cada alimento
- Proporciones de macronutrientes típicas
- Si no estás seguro, indica menor confianza`;

        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    mimeType: 'image/jpeg',
                    data: base64Image,
                },
            },
        ]);

        const responseText = result.response.text();

        // Limpiar respuesta
        let cleanedText = responseText.trim();

        // Remover markdown
        if (cleanedText.startsWith('```json')) {
            cleanedText = cleanedText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
        } else if (cleanedText.startsWith('```')) {
            cleanedText = cleanedText.replace(/```\n?/g, '');
        }

        // Remover comentarios
        cleanedText = cleanedText.replace(/\/\/.*$/gm, '');
        cleanedText = cleanedText.replace(/\/\*[\s\S]*?\*\//g, '');

        // Extraer JSON
        const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            console.error('Raw response:', responseText);
            throw new Error('No se pudo extraer JSON de la respuesta');
        }

        const analysis = JSON.parse(jsonMatch[0]) as FoodAnalysisResult;

        console.log('✅ Food analysis complete:', analysis);
        return analysis;

    } catch (error) {
        console.error('Error analyzing food image:', error);
        throw error;
    }
}

/**
 * Submits user feedback to improve AI accuracy
 */
export async function submitFoodFeedback(
    imageUri: string,
    aiEstimate: FoodAnalysisResult,
    userCorrection: {
        calories: number;
        protein: number;
        carbs: number;
        fats: number;
    }
): Promise<void> {
    try {
        const { supabase } = await import('@/lib/supabase');
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            console.log('No user logged in, skipping feedback');
            return;
        }

        // Calculate difference percentage
        const caloriesDiff = Math.abs(aiEstimate.calories - userCorrection.calories) / aiEstimate.calories;

        // Only submit if difference is significant (>15%)
        if (caloriesDiff < 0.15) {
            console.log('Difference too small, skipping feedback');
            return;
        }

        // Store feedback
        const { error } = await supabase
            .from('food_analysis_feedback')
            .insert({
                user_id: user.id,
                image_url: imageUri, // In production, upload to Supabase Storage first
                ai_estimate: aiEstimate,
                user_correction: userCorrection,
                food_description: aiEstimate.foodName,
            });

        if (error) {
            console.error('Error submitting feedback:', error);
        } else {
            console.log('✅ Feedback submitted successfully');
        }
    } catch (error) {
        console.error('Error submitting feedback:', error);
    }
}
