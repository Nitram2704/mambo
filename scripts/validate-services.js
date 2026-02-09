const { createClient } = require('@supabase/supabase-js');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
const geminiApiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

async function validateGemini() {
    console.log('\n--- Validando Gemini AI ---');
    if (!geminiApiKey) {
        console.error('❌ Error: EXPO_PUBLIC_GEMINI_API_KEY no encontrada');
        return false;
    }

    const modelsToTry = [
        "gemini-2.5-flash",
        "gemini-2.0-flash",
        "gemini-2.0-flash-exp",
        "gemini-1.5-flash-latest"
    ];

    const genAI = new GoogleGenerativeAI(geminiApiKey);

    for (const modelName of modelsToTry) {
        try {
            console.log(`Probando modelo: ${modelName}...`);
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent("Responde con 'OK'");
            const text = (await result.response).text();

            if (text) {
                console.log(`✅ Conexión con ${modelName} exitosa!`);
                return modelName;
            }
        } catch (err) {
            console.log(`❌ ${modelName} falló: ${err.message.split('\n')[0]}`);
        }
    }

    return null;
}

async function run() {
    const modelOk = await validateGemini();
    if (modelOk) {
        console.log(`\n🎉 El mejor modelo disponible es: ${modelOk}`);
    } else {
        console.log('\n❌ No se pudo conectar con ningún modelo de Gemini.');
    }
    process.exit(0);
}

run();
