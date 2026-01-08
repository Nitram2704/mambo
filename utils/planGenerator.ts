import { GoogleGenerativeAI } from '@google/generative-ai';
import { UserProfile } from '@/store/userProfileStore';

const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(API_KEY);

const MAX_RETRIES = 3;
const BASE_DELAY = 1000; // 1 second

async function generateWithRetry(model: any, prompt: string, attempt = 1): Promise<any> {
    try {
        console.log(`🔄 Attempt ${attempt}: Generating content with Gemini...`);
        const result = await model.generateContent(prompt);
        console.log(`✅ Attempt ${attempt}: Content generated successfully`);
        return result;
    } catch (error: any) {
        // Only retry on 503 (overloaded) or 429 (rate limit) errors
        if ((error.status === 503 || error.status === 429) && attempt <= MAX_RETRIES) {
            const delay = BASE_DELAY * Math.pow(2, attempt - 1);
            console.warn(`⚠️ Attempt ${attempt} failed with ${error.status}. Retrying in ${delay}ms...`);
            console.warn(`Error details:`, {
                message: error.message,
                status: error.status,
                code: error.code,
                name: error.name
            });

            await new Promise(resolve => setTimeout(resolve, delay));
            return generateWithRetry(model, prompt, attempt + 1);
        }
        // If not retryable or max attempts reached, throw the error
        console.error(`❌ All ${MAX_RETRIES} attempts failed. Final error:`, error);
        throw error;
    }
}

export interface WorkoutDay {
    dayNumber: number;
    routineName: string; // Name of the routine to perform on this day
}

export interface RoutineExercise {
    name: string;
    sets: number;
    reps: string;
    rest: number;
    notes?: string;
    type?: string; // 'warmup', 'normal', etc.
}

export interface Routine {
    id?: string;
    name: string;
    exercises: RoutineExercise[];
}

export interface WorkoutPlan {
    name: string;
    description: string;
    duration: string;
    routines: Routine[];
    schedule: WorkoutDay[];
}

export interface Meal {
    type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
    name: string;
    ingredients: string[];
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    prepTime: string;
    instructions?: string;
}

export interface DailyMeals {
    dayOfWeek: string;
    meals: Meal[];
}

export interface NutritionPlan {
    weeklyCalories: number;
    dailyProtein: number;
    dailyCarbs: number;
    dailyFat: number;
    days: DailyMeals[];
}

/**
 * Genera un plan de entrenamiento personalizado usando Gemini AI
 */
export async function generateWorkoutPlan(profile: UserProfile): Promise<WorkoutPlan> {
    try {
        if (!API_KEY) {
            throw new Error('Gemini API key not configured');
        }

        // Fetch available exercises from database
        const { supabase } = await import('@/lib/supabase');
        const { data: exercises, error: exercisesError } = await supabase
            .from('exercises')
            .select('id, name, muscle_group, equipment, category')
            .order('muscle_group', { ascending: true });

        if (exercisesError || !exercises || exercises.length === 0) {
            throw new Error('No exercises found in database');
        }

        console.log(`✅ Loaded ${exercises.length} exercises from database`);

        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

        const equipmentMap = {
            full_gym: 'gimnasio completo (barras, mancuernas, máquinas)',
            dumbbells: 'solo mancuernas',
            bodyweight: 'solo peso corporal',
            bands: 'bandas elásticas'
        };

        const goalMap = {
            lose_fat: 'pérdida de grasa',
            gain_muscle: 'ganancia muscular',
            improve_performance: 'mejorar rendimiento',
            general_health: 'salud general'
        };

        const levelMap = {
            sedentary: 'sedentario (sin experiencia)',
            beginner: 'principiante (menos de 6 meses)',
            intermediate: 'intermedio (6-24 meses)',
            advanced: 'avanzado (más de 2 años)'
        };

        // Filter exercises based on available equipment
        const userEquipment = profile.availableEquipment || 'bodyweight';
        const filteredExercises = exercises.filter(ex => {
            if (userEquipment === 'full_gym') return true;
            if (userEquipment === 'bodyweight') return ex.equipment === 'Bodyweight';
            if (userEquipment === 'dumbbells') return ['Bodyweight', 'Dumbbells'].includes(ex.equipment);
            if (userEquipment === 'bands') return ['Bodyweight', 'Bands'].includes(ex.equipment);
            return true;
        });

        const exerciseList = filteredExercises.map(e => e.name).join(', ');

        const splitRecommendation =
            profile.workoutDaysPerWeek === 1 || profile.workoutDaysPerWeek === 2 ? 'Full Body' :
                profile.workoutDaysPerWeek === 3 ? 'PPL (Push/Pull/Legs) o Full Body' :
                    profile.workoutDaysPerWeek === 4 ? 'Upper/Lower Split' :
                        profile.workoutDaysPerWeek === 5 ? 'PPL + Upper/Lower' :
                            'PPL x2 (Push/Pull/Legs dos veces)';

        const prompt = `Eres un entrenador personal certificado. Genera un plan de entrenamiento en formato JSON VÁLIDO.
        
RECOMENDACIÓN DE SPLIT: Para ${profile.workoutDaysPerWeek} días, usa un split de ${splitRecommendation}.

⚠️ REGLA CRÍTICA: SOLO puedes usar ejercicios de esta lista. NO inventes nombres nuevos. NO traduzcas. Copia EXACTAMENTE:

EJERCICIOS DISPONIBLES:
${exerciseList}

PERFIL DEL USUARIO:
- Nivel: ${levelMap[profile.experienceLevel || 'beginner']}
- Objetivo: ${goalMap[profile.fitnessGoal || 'general_health']}
- Días disponibles: ${profile.workoutDaysPerWeek || 3} días por semana
- Duración por sesión: ${profile.minutesPerSession || 60} minutos
- Equipo disponible: ${equipmentMap[userEquipment]}
- Restricciones físicas: ${profile.physicalRestrictions || 'ninguna'}

REQUISITOS:
1. Crea un MESOCICLO de 6-8 semanas.
2. Define RUTINAS REUTILIZABLES (ej: "Empuje", "Tracción", "Pierna").
3. Asigna esas rutinas a los días de la semana en un "schedule".
4. Incluye tipos de series (warmup, normal, dropset) cuando sea apropiado.
5. En español.
6. IMPORTANTE: dayNumber debe ser entre 1 (Lunes) y 6 (Sábado). NO programes domingos.
7. REGLA DE VOLUMEN: Cada rutina debe tener entre 6 y 8 ejercicios MÁXIMO.
8. REGLA DE SERIES: El total de series efectivas por rutina NO debe exceder las 20 series.

RESPONDE SOLO CON JSON (sin texto adicional, sin markdown):
{
  "name": "nombre del plan",
  "description": "breve descripción",
  "duration": "X semanas",
  "routines": [
    {
      "name": "Nombre de la rutina (ej: Empuje)",
      "exercises": [
        {
          "name": "nombre del ejercicio",
          "sets": número,
          "reps": "rango de reps (ej: 8-12)",
          "rest": segundos,
          "type": "normal",
          "notes": "notas opcionales"
        }
      ]
    }
  ],
  "schedule": [
    { "dayNumber": 1, "routineName": "Empuje" },
    { "dayNumber": 3, "routineName": "Tracción" }
  ]
}`;

        const result = await generateWithRetry(model, prompt);
        const responseText = result.response.text();

        let cleanedText = responseText.trim();
        if (cleanedText.startsWith('```json')) {
            cleanedText = cleanedText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
        } else if (cleanedText.startsWith('```')) {
            cleanedText = cleanedText.replace(/```\n?/g, '');
        }

        cleanedText = cleanedText.replace(/\/\/.*$/gm, '');
        cleanedText = cleanedText.replace(/\/\*[\s\S]*?\*\//g, '');

        const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('No se pudo extraer JSON de la respuesta de Gemini');
        }

        const plan = JSON.parse(jsonMatch[0]) as WorkoutPlan;
        return plan;

    } catch (error) {
        console.error('❌ Error generating workout plan:', error);
        const err = error as any;
        console.error('Error details:', {
            message: err.message,
            status: err.status,
            code: err.code,
            name: err.name
        });
        return getFallbackWorkoutPlan(profile);
    }
}

/**
 * Genera un plan nutricional personalizado usando Gemini AI
 */
export async function generateNutritionPlan(profile: UserProfile): Promise<NutritionPlan> {
    try {
        if (!API_KEY) {
            throw new Error('Gemini API key not configured');
        }

        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

        const dietMap = {
            omnivore: 'omnívora',
            vegetarian: 'vegetariana',
            vegan: 'vegana',
            other: 'con restricciones'
        };

        const budgetMap = {
            low: 'económico (ingredientes accesibles)',
            medium: 'moderado',
            high: 'premium'
        };

        const skillMap = {
            basic: 'básico (recetas simples)',
            intermediate: 'intermedio',
            advanced: 'avanzado'
        };

        const prompt = `Eres un nutriólogo certificado. Genera un plan de comidas mensual en formato JSON VÁLIDO.

PERFIL DEL USUARIO:
- Calorías objetivo: ${profile.calorieGoal || 2000} kcal/día
- Proteína: ${profile.proteinGoal || 150}g/día
- Carbohidratos: ${profile.carbsGoal || 200}g/día
- Grasas: ${profile.fatsGoal || 60}g/día
- Dieta: ${dietMap[profile.dietaryPreferences || 'omnivore']}
- Restricciones: ${profile.foodRestrictions || 'ninguna'}
- Presupuesto: ${budgetMap[profile.foodBudget || 'medium']}
- Habilidad cocina: ${skillMap[profile.cookingSkill || 'basic']}

REQUISITOS:
1. Plan de 28 días (4 semanas completas)
2. 3 comidas principales por día (desayuno, almuerzo, cena)
3. Recetas simples y prácticas
4. Ingredientes accesibles en México/LATAM con CANTIDADES ESPECÍFICAS (gramos, tazas, piezas)
5. Cumplir macros objetivo
6. Variedad suficiente para evitar monotonía
7. En español

RESPONDE SOLO CON JSON (sin texto adicional, sin markdown):
{
  "weeklyCalories": número,
  "dailyProtein": número,
  "dailyCarbs": número,
  "dailyFat": número,
  "days": [
    {
      "dayOfWeek": "Lunes",
      "meals": [
        {
          "type": "breakfast",
          "name": "nombre del platillo",
          "ingredients": ["cantidad y nombre (ej: 50g Avena)", "cantidad y nombre (ej: 2 Huevos)"],
          "calories": número,
          "protein": número,
          "carbs": número,
          "fat": número,
          "prepTime": "tiempo en minutos",
          "instructions": "pasos de preparación"
        }
      ]
    }
  ]
}`;

        const result = await generateWithRetry(model, prompt);
        const responseText = result.response.text();

        let cleanedText = responseText.trim();
        if (cleanedText.startsWith('```json')) {
            cleanedText = cleanedText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
        } else if (cleanedText.startsWith('```')) {
            cleanedText = cleanedText.replace(/```\n?/g, '');
        }

        const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('No se pudo extraer JSON de la respuesta de Gemini');
        }

        const plan = JSON.parse(jsonMatch[0]) as NutritionPlan;
        return plan;

    } catch (error) {
        console.error('❌ Error generating nutrition plan:', error);
        const err = error as any;
        console.error('Error details:', {
            message: err.message,
            status: err.status,
            code: err.code,
            name: err.name
        });
        return getFallbackNutritionPlan(profile);
    }
}

/**
 * Plan de entrenamiento de respaldo si falla Gemini
 */
function getFallbackWorkoutPlan(profile: UserProfile): WorkoutPlan {
    const days = profile.workoutDaysPerWeek || 3;

    return {
        name: 'Plan Básico de Inicio',
        description: 'Plan de entrenamiento de cuerpo completo para principiantes',
        duration: '4 semanas',
        routines: [
            {
                name: 'Cuerpo Completo A',
                exercises: [
                    { name: 'Sentadillas', sets: 3, reps: '10-12', rest: 90, notes: 'Mantén la espalda recta' },
                    { name: 'Flexiones', sets: 3, reps: '8-10', rest: 60, notes: 'Rodillas en el suelo si es necesario' },
                    { name: 'Remo con bandas', sets: 3, reps: '12-15', rest: 60 },
                    { name: 'Plancha', sets: 3, reps: '30 seg', rest: 60 }
                ]
            }
        ],
        schedule: [
            { dayNumber: 1, routineName: 'Cuerpo Completo A' },
            { dayNumber: 3, routineName: 'Cuerpo Completo A' },
            { dayNumber: 5, routineName: 'Cuerpo Completo A' }
        ].slice(0, days)
    };
}

/**
 * Plan nutricional de respaldo si falla Gemini
 */
function getFallbackNutritionPlan(profile: UserProfile): NutritionPlan {
    return {
        weeklyCalories: (profile.calorieGoal || 2000) * 7,
        dailyProtein: profile.proteinGoal || 150,
        dailyCarbs: profile.carbsGoal || 200,
        dailyFat: profile.fatsGoal || 60,
        days: [
            {
                dayOfWeek: 'Lunes',
                meals: [
                    {
                        type: 'breakfast',
                        name: 'Avena con proteína',
                        ingredients: ['50g Avena', '1 scoop Proteína en polvo', '1 pieza Plátano'],
                        calories: 400,
                        protein: 30,
                        carbs: 50,
                        fat: 10,
                        prepTime: '5 minutos'
                    },
                    {
                        type: 'lunch',
                        name: 'Pollo con arroz y verduras',
                        ingredients: ['150g Pechuga de pollo', '200g Arroz integral', '100g Brócoli'],
                        calories: 600,
                        protein: 50,
                        carbs: 70,
                        fat: 15,
                        prepTime: '20 minutos'
                    },
                    {
                        type: 'dinner',
                        name: 'Ensalada de atún',
                        ingredients: ['1 lata Atún en agua', '2 tazas Lechuga', '1 pieza Tomate', '1 cda Aceite de oliva'],
                        calories: 400,
                        protein: 40,
                        carbs: 20,
                        fat: 18,
                        prepTime: '10 minutos'
                    }
                ]
            }
        ]
    };
}
