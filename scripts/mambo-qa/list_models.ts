import { GoogleGenerativeAI } from '@google/generative-ai';
import 'dotenv/config';

// Handle Expo vs Standard env
const apiKey = process.env.GEMINI_API_KEY || process.env.EXPO_PUBLIC_GEMINI_API_KEY;

if (!apiKey) {
    console.error('❌ No API Key found');
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

async function listModels() {
    try {
        // Did not find a direct listModels method in specific SDK version docs quickly,
        // but it is usually under a ModelService or similar. 
        // However, usually we just try a model. 
        // Let's try to just print the error detail if I can't list.
        // Actually, the error message said: "Call ListModels to see the list".
        // The Node SDK might expose it via an admin or model manager, let's try to access it if possible.
        // If not readily available in the high level client, maybe we can fetch it via REST.

        console.log('Attempting to list models via REST API...');
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);

        if (!response.ok) {
            throw new Error(`HTTP ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log('✅ Available Models:');
        data.models.forEach((m: any) => {
            console.log(`- ${m.name}`);
        });

    } catch (e) {
        console.error('Failed to list models:', e);
    }
}

listModels();
