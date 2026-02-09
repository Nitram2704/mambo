import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import { ActionExecutor } from '@/services/actionExecutor';
import { Platform } from 'react-native';
import { SubscriptionTier } from '@/constants/SubscriptionConfig';

// Google Speech-to-Text API
const SPEECH_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_SPEECH_API_KEY || '';

// Initialize Gemini API
const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(API_KEY);

export interface UserContext {
    name?: string;
    weight?: number;
    height?: number;
    goal?: string;
    calories?: number;
    macros?: {
        protein: number;
        carbs: number;
        fats: number;
    };
    currentScreen?: string;
    tier?: SubscriptionTier;
    coachStyle?: 'sargento' | 'cientifico' | 'amigo';
    userFacts?: string[];
}

// Define Tools
const tools: any[] = [
    {
        functionDeclarations: [
            {
                name: "schedule_workout",
                description: "Programa una rutina de entrenamiento para un día específico.",
                parameters: {
                    type: SchemaType.OBJECT,
                    properties: {
                        routineName: { type: SchemaType.STRING, description: "Nombre de la rutina (ej: 'Full Body', 'Torso', 'Pierna')" },
                        date: { type: SchemaType.STRING, description: "Fecha en formato YYYY-MM-DD" },
                    },
                    required: ["routineName", "date"]
                }
            },
            {
                name: "log_food",
                description: "Registra un alimento en el diario de nutrición de hoy.",
                parameters: {
                    type: SchemaType.OBJECT,
                    properties: {
                        foodName: { type: SchemaType.STRING, description: "Nombre del alimento (ej: 'Manzana', 'Pollo')" },
                        calories: { type: SchemaType.NUMBER, description: "Calorías estimadas" },
                        protein: { type: SchemaType.NUMBER, description: "Proteínas en gramos (opcional)" },
                        carbs: { type: SchemaType.NUMBER, description: "Carbohidratos en gramos (opcional)" },
                        fats: { type: SchemaType.NUMBER, description: "Grasas en gramos (opcional)" },
                        mealType: {
                            type: SchemaType.STRING,
                            description: "Tipo de comida.",
                            enum: ["breakfast", "mid_morning", "lunch", "snack", "dinner"]
                        }
                    },
                    required: ["foodName", "calories", "mealType"]
                }
            },
            {
                name: "create_weekly_plan",
                description: "Crea un plan semanal completo asignando rutinas a días.",
                parameters: {
                    type: SchemaType.OBJECT,
                    properties: {
                        daysPerWeek: { type: SchemaType.NUMBER, description: "Días de entrenamiento (3-6)" },
                        focus: { type: SchemaType.STRING, description: "Enfoque (Fuerza, Hipertrofia, Pérdida de peso)" }
                    },
                    required: ["daysPerWeek"]
                }
            },
            {
                name: "skip_workout",
                description: "Marca el entrenamiento de una fecha como saltado/descanso.",
                parameters: {
                    type: SchemaType.OBJECT,
                    properties: {
                        date: { type: SchemaType.STRING, description: "Fecha en formato YYYY-MM-DD" }
                    },
                    required: ["date"]
                }
            },
            {
                name: "adjust_weekly_routine",
                description: "Ajusta la rutina semanal cambiando días de entrenamiento o enfoque.",
                parameters: {
                    type: SchemaType.OBJECT,
                    properties: {
                        daysPerWeek: { type: SchemaType.NUMBER, description: "Nuevos días de entrenamiento por semana (opcional)" },
                        durationMinutes: { type: SchemaType.NUMBER, description: "Nueva duración en minutos por sesión (opcional)" },
                        focus: { type: SchemaType.STRING, description: "Nuevo enfoque del entrenamiento (opcional)" }
                    },
                    required: []
                }
            },
            {
                name: "modify_todays_meals",
                description: "Modifica el plan de comidas del día añadiendo calorías o cambiando comidas.",
                parameters: {
                    type: SchemaType.OBJECT,
                    properties: {
                        date: { type: SchemaType.STRING, description: "Fecha en formato YYYY-MM-DD (opcional, por defecto hoy)" },
                        addCalories: { type: SchemaType.NUMBER, description: "Calorías adicionales a añadir (opcional)" }
                    },
                    required: []
                }
            },
            {
                name: "generate_meal_plan",
                description: "Genera un nuevo plan nutricional mensual completo (28 días).",
                parameters: {
                    type: SchemaType.OBJECT,
                    properties: {
                        calories: { type: SchemaType.NUMBER, description: "Calorías diarias objetivo" },
                        dietType: { type: SchemaType.STRING, description: "Tipo de dieta (opcional)" }
                    },
                    required: ["calories"]
                }
            },
            {
                name: "adjust_intensity",
                description: "Ajusta la intensidad de una rutina cambiando series o pesos.",
                parameters: {
                    type: SchemaType.OBJECT,
                    properties: {
                        routineId: { type: SchemaType.STRING, description: "ID de la rutina a ajustar (opcional)" },
                        factor: { type: SchemaType.NUMBER, description: "Factor de ajuste (ej: 1.2 para aumentar 20%, 0.8 para reducir 20%)" }
                    },
                    required: ["factor"]
                }
            },
            {
                name: "analyze_recovery",
                description: "Analiza el estado de recuperación basado en sueño y entrenamientos recientes.",
                parameters: {
                    type: SchemaType.OBJECT,
                    properties: {},
                    required: []
                }
            },
            {
                name: "substitute_exercise",
                description: "Sustituye un ejercicio por otro en una rutina específica.",
                parameters: {
                    type: SchemaType.OBJECT,
                    properties: {
                        routineId: { type: SchemaType.STRING, description: "ID de la rutina (opcional)" },
                        oldExerciseName: { type: SchemaType.STRING, description: "Nombre del ejercicio a reemplazar" },
                        newExerciseName: { type: SchemaType.STRING, description: "Nombre del nuevo ejercicio" }
                    },
                    required: ["oldExerciseName", "newExerciseName"]
                }
            },
            {
                name: "add_exercise_to_routine",
                description: "Añade un ejercicio a una rutina existente.",
                parameters: {
                    type: SchemaType.OBJECT,
                    properties: {
                        routineId: { type: SchemaType.STRING, description: "ID de la rutina (opcional)" },
                        routineName: { type: SchemaType.STRING, description: "Nombre de la rutina (ej: 'Full Body')" },
                        exerciseName: { type: SchemaType.STRING, description: "Nombre del ejercicio a añadir" }
                    },
                    required: ["exerciseName"]
                }
            },
            {
                name: "remove_exercise_from_routine",
                description: "Elimina un ejercicio de una rutina existente.",
                parameters: {
                    type: SchemaType.OBJECT,
                    properties: {
                        routineId: { type: SchemaType.STRING, description: "ID de la rutina (opcional)" },
                        routineName: { type: SchemaType.STRING, description: "Nombre de la rutina (ej: 'Full Body')" },
                        exerciseName: { type: SchemaType.STRING, description: "Nombre del ejercicio a eliminar" }
                    },
                    required: ["exerciseName"]
                }
            }
        ]
    }
];

async function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function retryWithBackoff<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000
): Promise<T> {
    let lastError: any;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error: any) {
            lastError = error;

            // Don't retry on certain errors
            if (error.message?.includes('400') || error.message?.includes('401') || error.message?.includes('403')) {
                throw error;
            }

            if (attempt < maxRetries) {
                const delay = baseDelay * Math.pow(2, attempt); // Exponential backoff
                console.log(`Attempt ${attempt + 1} failed, retrying in ${delay}ms...`);
                await sleep(delay);
            }
        }
    }

    throw lastError;
}

// Transcribe audio to text using Google Speech-to-Text API
async function transcribeAudio(audioBase64: string): Promise<string> {
    if (!SPEECH_API_KEY) {
        console.warn('Google Speech API key not configured, skipping transcription');
        return '[Audio no transcrito - configura EXPO_PUBLIC_GOOGLE_SPEECH_API_KEY]';
    }

    try {
        console.log('Starting audio transcription...');

        const requestBody = {
            config: {
                encoding: Platform.OS === 'ios' ? 'AAC' : 'MP3', // Match Expo AV recording format
                sampleRateHertz: 44100, // HIGH_QUALITY preset sample rate
                languageCode: 'es-ES', // Spanish (Spain) - adjust as needed
                enableAutomaticPunctuation: true,
                model: 'latest_long', // Better for longer audio
            },
            audio: {
                content: audioBase64
            }
        };

        const response = await fetch(`https://speech.googleapis.com/v1/speech:recognize?key=${SPEECH_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            throw new Error(`Speech API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Transcription response:', data);

        if (data.results && data.results.length > 0) {
            const transcription = data.results
                .map((result: any) => result.alternatives[0].transcript)
                .join(' ');
            console.log('Transcription successful:', transcription);
            return transcription;
        } else {
            console.warn('No transcription results');
            return '[No se pudo transcribir el audio]';
        }

    } catch (error) {
        console.error('Transcription error:', error);
        return '[Error en transcripción de voz]';
    }
}

function getSystemPrompt(tier: SubscriptionTier = 'STARTER', context: UserContext): string {
    const style = context.coachStyle || 'amigo';

    let stylePrompt = '';
    switch (style) {
        case 'sargento':
            stylePrompt = `TU ESTILO ES "SARGENTO" 🪖:
- Eres directo, exigente y motivador de forma dura.
- No aceptas excusas.
- Usa frases cortas y contundentes.
- Tu objetivo es que el usuario no se rinda y dé el 100%.`;
            break;
        case 'cientifico':
            stylePrompt = `TU ESTILO ES "CIENTÍFICO" 🧪:
- Eres analítico, detallado y te basas en la ciencia del deporte.
- Explica el "por qué" de las cosas (biomecánica, fisiología).
- Usa terminología técnica pero asegúrate de que se entienda.
- Tu objetivo es la optimización máxima basada en datos.`;
            break;
        case 'amigo':
        default:
            stylePrompt = `TU ESTILO ES "AMIGO" 🤝:
- Eres empático, cercano y relajado.
- Usa un lenguaje coloquial y motivador.
- Celebra los pequeños logros como si fueran tuyos.
- Tu objetivo es que el usuario disfrute el proceso y se sienta apoyado.`;
            break;
    }

    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const dayOfWeek = now.toLocaleDateString('es-ES', { weekday: 'long' });

    const basePrompt = `Eres Mambo Coach 💪, tu compa de fitness.
Hoy es ${dayOfWeek}, ${dateStr}.
Contexto del usuario:
${JSON.stringify(context)}

${context.userFacts && context.userFacts.length > 0 ? `HECHOS SOBRE EL USUARIO (RAG Memory):
${context.userFacts.map(f => `- ${f}`).join('\n')}` : ''}

${stylePrompt}

REGLAS GENERALES:
- BALANCEADO: Respuestas de 3-5 líneas.
- AMIGABLE: Usa emojis.
- PRÁCTICO: Si puedes hacer algo por el usuario (ajustar rutina, plan, etc.), USA LAS HERRAMIENTAS.
- Si usas una herramienta, NO digas "voy a hacerlo", solo hazlo (llama a la función).
- Después de llamar a la función, confirma lo que hiciste.

INSTRUCCIÓN ESPECIAL:
- Si el mensaje del usuario empieza con [NUDGE_TRIGGER: ...], significa que el sistema ha detectado un evento importante. 
- Tu tarea es convertir esa información técnica en un mensaje motivador y cercano siguiendo tu ESTILO asignado.
- NO menciones que es un "trigger" o un "nudge", simplemente actúa como si te hubieras dado cuenta tú mismo.`;

    switch (tier) {
        case 'ELITE':
            return `${basePrompt}
- Eres el Mambo Coach de Élite 🥇. Tu objetivo es el éxito total del usuario a largo plazo.
- No solo respondas, ANTICIPA. Si ves que el usuario está progresando, sugiere retos. Si ves que falla, crea un plan de rescate.
- Usa un tono de mentor experto y cercano.
- Analiza tendencias de semanas anteriores si están disponibles en el contexto.
- Tienes permiso para ser muy detallado en tus explicaciones científicas si el usuario lo requiere.`;

        case 'PRO':
            return `${basePrompt}
- Eres un entrenador personal optimizador 🥈.
- Analiza el contexto del usuario (peso, macros, volumen).
- Si detectas que el usuario no está llegando a sus objetivos, sugiérele usar las herramientas para ajustar su plan.
- Sé motivador y enfócate en la eficiencia del entrenamiento.`;

        case 'STARTER':
        default:
            return `${basePrompt}
- Eres un asistente de fitness básico 🥉.
- Responde de forma concisa y directa.
- No sugieras cambios proactivos en la rutina a menos que te lo pidan explícitamente.
- Limítate a responder dudas sobre ejercicios o nutrición básica de forma reactiva.`;
    }
}

export async function askAssistant(
    question: string,
    context: UserContext,
    history: any[] = [],
    audioBase64?: string,
    imageBase64?: string
): Promise<{ response: string; transcription?: string }> {
    try {
        if (!API_KEY) {
            return { response: "Por favor configura tu API Key de Gemini en el archivo .env (EXPO_PUBLIC_GEMINI_API_KEY)" };
        }

        // Handle voice input: transcribe audio to text first
        let finalQuestion = question;
        if (audioBase64) {
            console.log('Voice input detected, transcribing audio...');
            const transcription = await transcribeAudio(audioBase64);
            console.log('Transcription result:', transcription);

            finalQuestion = transcription;
            if (question && question.trim()) {
                finalQuestion = `${transcription} (${question})`; // Combine if both exist
            }
        }

        return await retryWithBackoff(async () => {
            const model = genAI.getGenerativeModel({
                model: 'gemini-2.5-flash',
                tools: tools
            });

            const systemPrompt = getSystemPrompt(context.tier, context);

            const userParts: any[] = [];
            // Now we send transcribed text instead of raw audio
            userParts.push({ text: finalQuestion });

            if (imageBase64) {
                userParts.push({
                    inlineData: {
                        data: imageBase64,
                        mimeType: 'image/jpeg'
                    }
                });
            }

            const chat = model.startChat({
                history: [
                    { role: 'user', parts: [{ text: systemPrompt }] },
                    { role: 'model', parts: [{ text: "Entendido, soy Mambo Coach. ¿En qué te ayudo?" }] },
                    ...history.map(msg => ({
                        role: msg.role === 'assistant' ? 'model' : 'user',
                        parts: [{ text: msg.content }] // Note: History currently only stores text. Multimodal history would require storing base64 or file URIs which is heavy. We'll stick to text history for now.
                    }))
                ]
            });

            const result = await chat.sendMessage(userParts);
            const response = await result.response;

            // Handle Function Calls
            const functionCalls = response.functionCalls();
            if (functionCalls && functionCalls.length > 0) {
                let toolResponseText = "";

                for (const call of functionCalls) {
                    const fnName = call.name;
                    const fnArgs = call.args;

                    let functionResult = "";

                    try {
                        switch (fnName) {
                            case 'schedule_workout':
                                functionResult = await ActionExecutor.scheduleWorkout(fnArgs as any);
                                break;
                            case 'log_food':
                                functionResult = await ActionExecutor.logFood(fnArgs as any);
                                break;
                            case 'create_weekly_plan':
                                functionResult = await ActionExecutor.createWeeklyPlan(fnArgs as any);
                                break;
                            case 'skip_workout':
                                functionResult = await ActionExecutor.skipWorkout(fnArgs as any);
                                break;
                            case 'adjust_weekly_routine':
                                functionResult = await ActionExecutor.adjustWeeklyRoutine(fnArgs as any);
                                break;
                            case 'modify_todays_meals':
                                functionResult = await ActionExecutor.modifyTodaysMeals(fnArgs as any);
                                break;
                            case 'generate_meal_plan':
                                functionResult = await ActionExecutor.generateMealPlan(fnArgs as any);
                                break;
                            case 'adjust_intensity':
                                functionResult = await ActionExecutor.adjustIntensity(fnArgs as any);
                                break;
                            case 'analyze_recovery':
                                functionResult = await ActionExecutor.analyzeRecovery(fnArgs as any);
                                break;
                            case 'substitute_exercise':
                                functionResult = await ActionExecutor.substituteExercise(fnArgs as any);
                                break;
                            case 'add_exercise_to_routine':
                                functionResult = await ActionExecutor.addExerciseToRoutine(fnArgs as any);
                                break;
                            case 'remove_exercise_from_routine':
                                functionResult = await ActionExecutor.removeExerciseFromRoutine(fnArgs as any);
                                break;
                            default:
                                functionResult = "Función no encontrada.";
                        }
                    } catch (e) {
                        functionResult = `Error ejecutando acción: ${e}`;
                    }

                    toolResponseText += functionResult + "\n";

                    // Send result back to model to get final natural language response
                    // For simplicity in this turn-based stateless wrapper, we might just return the tool result
                    // OR send it back. The proper way is to send it back.

                    // However, since `askAssistant` is currently designed as a single-turn wrapper (mostly),
                    // we need to be careful. The `chat` object maintains session.
                    // We should send the function response back.

                    const result2 = await chat.sendMessage([
                        {
                            functionResponse: {
                                name: fnName,
                                response: { result: functionResult }
                            }
                        }
                    ]);

                    const finalResponse = result2.response.text();
                    if (!finalResponse) {
                        return { response: functionResult, transcription: audioBase64 ? finalQuestion : undefined }; // Fallback to the tool output if model is silent
                    }
                    return { response: finalResponse, transcription: audioBase64 ? finalQuestion : undefined };
                }

                return { response: toolResponseText, transcription: audioBase64 ? finalQuestion : undefined }; // Fallback
            }

            return { response: response.text(), transcription: audioBase64 ? finalQuestion : undefined };
        });

    } catch (error: any) {
        console.error("Error calling Gemini after retries:", error);

        // Enhanced error handling
        if (error.message?.includes('429') || error.toString().includes('429')) {
            return { response: "⚠️ La IA está muy ocupada ahora (límite de cuota excedido). He intentado varias veces, pero sigue fallando. Por favor, espera 5-10 minutos y vuelve a intentarlo." };
        }
        if (error.message?.includes('500') || error.message?.includes('502') || error.message?.includes('503')) {
            return { response: "🔧 Hay un problema temporal con el servidor de IA. He intentado reconectar automáticamente, pero sigue fallando. Inténtalo de nuevo en unos minutos." };
        }
        if (error.message?.includes('network') || error.code === 'NETWORK_ERROR') {
            return { response: "📶 Problema de conexión a internet. Verifica tu conexión y vuelve a intentarlo." };
        }
        if (error.message?.includes('audio') || error.message?.includes('multimodal') || error.message?.includes('unsupported')) {
            return { response: "🎤 Lo siento, actualmente no puedo procesar audio directamente. Por favor, escribe tu mensaje en texto para que pueda ayudarte mejor." };
        }

        return { response: "Lo siento, tuve un problema técnico después de varios intentos. ¿Podrías repetirlo?" };
    }
}

export async function generateRecipe(prompt: string): Promise<any> {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const systemPrompt = `
        You are an expert nutritionist and chef. Create a recipe based on the user's request.
        Return ONLY a valid JSON object with this structure:
        {
            "name": "Recipe Name",
            "description": "Short appetizing description",
            "calories": 500,
            "protein": 30,
            "carbs": 40,
            "fats": 20,
            "prepTime": 20,
            "servings": 1,
            "difficulty": "easy",
            "ingredients": [
                { "name": "Ingredient 1", "amount": "100g" },
                { "name": "Ingredient 2", "amount": "1 cup" }
            ],
            "instructions": [
                "Step 1",
                "Step 2"
            ],
            "tags": ["high-protein", "lunch"]
        }
        Do not include markdown formatting or explanations. Just the JSON.
        `;

        const result = await model.generateContent([systemPrompt, prompt]);
        const response = result.response;
        const text = response.text();

        // Clean up markdown if present
        const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(jsonStr);
    } catch (error) {
        console.error('Error generating recipe:', error);
        throw error;
    }
}

export async function predict1RM(exerciseName: string, history: { date: string, weight: number, reps: number }[]): Promise<string> {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const prompt = `
        Basado en este historial de entrenamiento para ${exerciseName}:
        ${JSON.stringify(history)}
        
        Predice el 1RM (una repetición máxima) estimado para dentro de 8 semanas si el usuario mantiene una progresión constante.
        Responde en una sola frase corta y motivadora en español, incluyendo el peso estimado.
        Ejemplo: "Si sigues así, tu 1RM estimado en 8 semanas será de 120kg. ¡A por ello!"
        `;

        const result = await model.generateContent(prompt);
        return result.response.text();
    } catch (error) {
        console.error('Error predicting 1RM:', error);
        return "No pude calcular la predicción en este momento.";
    }
}

export async function predictWeightTrend(currentWeight: number, targetWeight: number, adherence: number): Promise<string> {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const prompt = `
        Usuario actual: ${currentWeight}kg. Objetivo: ${targetWeight}kg.
        Adherencia nutricional actual: ${adherence}%.
        
        Predice cuánto tiempo le tomará llegar a su objetivo o cuál será su peso en 12 semanas.
        Responde en una sola frase corta y realista en español.
        Ejemplo: "Manteniendo tu adherencia del ${adherence}%, alcanzarás los ${targetWeight}kg en aproximadamente 10 semanas."
        `;

        const result = await model.generateContent(prompt);
        return result.response.text();
    } catch (error) {
        console.error('Error predicting weight trend:', error);
        return "No pude calcular la predicción de peso.";
    }
}

