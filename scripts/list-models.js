const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env') });
const geminiApiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

async function listModels() {
    if (!geminiApiKey) {
        console.error('❌ No API Key found');
        return;
    }
    try {
        const genAI = new GoogleGenerativeAI(geminiApiKey);
        // Note: The library doesn't easily expose listModels in a simple way sometimes, 
        // but let's try calling another method or checking the version.
        console.log('API Key length:', geminiApiKey.length);
        console.log('Testing with gemini-2.0-flash-exp (the latest available)...');

        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
        const result = await model.generateContent("Test");
        console.log('✅ Gemini 2.0 Flash Exp works!');
    } catch (err) {
        console.error('❌ Error with Gemini 2.0:', err.message);

        try {
            console.log('Testing with gemini-pro...');
            const model = genAI.getGenerativeModel({ model: "gemini-pro" });
            const result = await model.generateContent("Test");
            console.log('✅ Gemini Pro works!');
        } catch (err2) {
            console.error('❌ Error with Gemini Pro:', err2.message);
        }
    }
}

listModels();
