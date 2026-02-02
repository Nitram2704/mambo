import { GoogleGenerativeAI } from '@google/generative-ai';
import type { AppContext } from './context_loader.ts';

// IMPORTANT: Requires GEMINI_API_KEY in .env
const apiKey = process.env.GEMINI_API_KEY || process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(apiKey);

export async function generateMaestroTest(
    prompt: string,
    context: AppContext,
    previousError?: string
): Promise<string> {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });

    const availableIDs = context.testIDs.join(', ');

    // Construct System Prompt
    let systemInstruction = `
    You are an expert QA Automation Engineer for a React Native app called "Mambo".
    Your goal is to write a Maestro YAML test based on the user's request.
    
    CONTEXT:
    - Available testIDs in the app: [${availableIDs}]
    - The app uses Expo Router.
    - If you need to tap text, use "tapOn: 'Text'" but prefer "tapOn: { id: '...' }" if a matching testID exists.
    
    RULES:
    1. Output ONLY the raw YAML content. No markdown blocks, no explanations.
    2. Use the provided testIDs. Do not invent new ones unless strictly necessary (and warn about it).
    3. Keep it simple.
    
    mimic the style of these examples:
    ${context.exampleTests}
    `;

    // Add error context for self-correction
    if (previousError) {
        systemInstruction += `
        \n🚨 PREVIOUS EXECUTION FAILED:
        The last YAML you generated failed with this error:
        "${previousError}"
        
        Fix the YAML to resolve this specific error.
        `;
    }

    console.log(previousError ? '🤖 Analyzing error and re-planning...' : '🤖 Generating test plan...');

    const result = await model.generateContent([
        systemInstruction,
        `Task: "${prompt}"`
    ]);

    const response = result.response.text();

    // Cleanup markdown if existing
    return response.replace(/```yaml/g, '').replace(/```/g, '').trim();
}
