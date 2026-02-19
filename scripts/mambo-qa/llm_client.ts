import { AppContext } from './context_loader.js';
import { callLLM, createLLMClient } from './llm_mcp.js';
import { modelsOPenRouter } from './models.js';

/**
 * Interface for the structured response from the LLM.
 */
export interface MaestroTestPackage {
    yaml: string;
    testType: string;
    summary: string;
    explanation: string;
}

/**
 * Generates a Maestro test script and metadata using LLM via MCP.
 */
export async function generateMaestroTest(
    prompt: string,
    context: AppContext,
    errorFeedback?: string
): Promise<MaestroTestPackage> {
    const { client: llmClient } = await createLLMClient();

    const systemPrompt = `
    Eres un experto en QA Automation con Maestro. Tu objetivo es generar scripts YAML para Maestro que prueben una aplicación móvil React Native.
    
    Contexto de la aplicación:
    - TestIDs disponibles: ${context.testIDs.join(', ')}
    - Ejemplos de tests existentes:
    ${context.exampleTests}

    Instrucciones CRÍTICAS:
    1. Genera un objeto JSON válido. NO incluyas markdown.
    2. El campo "yaml" debe ser código Maestro puro (empezando con appId: com.mambo.app).
    3. EL YAML DEBE COINCIDIR EXACTAMENTE con la explicación proporcionada.
    4. El campo "explanation" debe ser una lista numerada con iconos que describa qué hace CADA sección del YAML.
    5. Estructura del JSON:
       {
         "yaml": "código maestro...",
         "testType": "Categoría (ej: 🔐 Autenticación)",
         "summary": "Resumen rápido",
         "explanation": "1️⃣ Paso uno... \n2️⃣ Paso dos..."
       }

    ${errorFeedback ? `\nERROR PREVIO: El test falló con este error:\n${errorFeedback}\nPor favor, genera una solución alternativa coherente.` : ''}
    `;

    const userPrompt = `Objetivo de la prueba: ${prompt}`;

    try {
        const rawContent = await callLLM(llmClient, modelsOPenRouter.claude, systemPrompt, userPrompt);

        // Extract JSON (search for the first { and last })
        const firstBrace = rawContent.indexOf('{');
        const lastBrace = rawContent.lastIndexOf('}');

        if (firstBrace === -1 || lastBrace === -1 || lastBrace < firstBrace) {
            console.error('❌ Raw LLM Response:', rawContent);
            throw new Error(`Could not find a valid JSON object in LLM response.`);
        }

        const jsonStr = rawContent.substring(firstBrace, lastBrace + 1);

        try {
            const testPackage = JSON.parse(jsonStr) as MaestroTestPackage;

            // Clean up YAML just in case
            testPackage.yaml = testPackage.yaml.replace(/^```yaml/i, '').replace(/^```/i, '').replace(/```$/i, '').trim();

            return testPackage;
        } catch (parseError: any) {
            console.error('❌ Failed to parse JSON:', jsonStr);
            console.error('❌ Error Detail:', parseError.message);
            throw new Error(`Invalid JSON format in LLM response.`);
        }
    } catch (error: any) {
        console.error('Error generating Maestro test package via MCP:', error);
        throw error;
    }
}
