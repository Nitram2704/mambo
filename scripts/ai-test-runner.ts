import 'dotenv/config';
import path from 'path';
import { fileURLToPath } from 'url';
import { loadContext } from './mambo-qa/context_loader.js';
import { generateMaestroTest, MaestroTestPackage } from './mambo-qa/llm_client.js';
import { runMaestroTest } from './mambo-qa/runner.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
    // 1. Parse arguments
    const args = process.argv.slice(2);
    const isDryRun = args.includes('--dry-run');
    const prompt = args.filter(arg => arg !== '--dry-run')[0];

    // Debug: Check API Key
    const apiKey = process.env.GEMINI_API_KEY || process.env.EXPO_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) {
        console.error('❌ Error: GEMINI_API_KEY (or EXPO_PUBLIC_GEMINI_API_KEY) is missing from process.env');
        process.exit(1);
    }

    if (!prompt || prompt === '--dry-run') {
        console.error('❌ Please provide a prompt in quotes. Example: npm run test:ai -- "Check login flow" --dry-run');
        process.exit(1);
    }

    console.log('\x1b[36m%s\x1b[0m', '══════════════════════════════════════════════════');
    console.log('\x1b[36m%s\x1b[0m', '🚀  MAMBO AI TEST RUNNER');
    console.log('\x1b[36m%s\x1b[0m', '══════════════════════════════════════════════════\n');

    console.log(`🎯 \x1b[1mObjetivo:\x1b[0m "${prompt}"`);
    if (isDryRun) {
        console.log('🧪 \x1b[33mMODO DRY-RUN ACTIVADO\x1b[0m');
    }
    console.log('');

    // 2. Load Context (RAG)
    console.log('🔍 \x1b[90mEscaneando contexto de la aplicación...\x1b[0m');
    const rootDir = path.resolve(__dirname, '..');
    const context = await loadContext(rootDir);
    console.log('✅ \x1b[32mContexto cargado correctamente.\x1b[0m\n');

    let currentError: string | undefined = undefined;
    const MAX_RETRIES = isDryRun ? 1 : 3;

    // 3. The Autonomous Loop
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        console.log(`\n\x1b[35m🔄 INTENTO ${attempt}/${MAX_RETRIES}\x1b[0m`);
        console.log('─'.repeat(30));

        try {
            // A. Generate
            console.log('🤖 \x1b[90mGenerando script con IA...\x1b[0m');
            const testPackage: MaestroTestPackage = await generateMaestroTest(prompt, context, currentError);

            const explanationStr = Array.isArray(testPackage.explanation)
                ? testPackage.explanation.join('\n')
                : String(testPackage.explanation);

            console.log('\n\x1b[1m\x1b[34m📋 PLAN DE PRUEBA GENERADO\x1b[0m');
            console.log(`\x1b[34m🆔 Categoría:\x1b[0m ${testPackage.testType}`);
            console.log(`\x1b[34m📝 Resumen:\x1b[0m   ${testPackage.summary}`);
            console.log(`\x1b[34m💡 Pasos a seguir:\x1b[0m\n   ${explanationStr.replace(/\n/g, '\n   ')}\n`);

            if (isDryRun) {
                console.log('\x1b[32m📄 SCRIPT MAESTRO (YAML):\x1b[0m');
                console.log('\x1b[90m' + '─'.repeat(50) + '\x1b[0m');
                console.log('\x1b[37m' + testPackage.yaml + '\x1b[0m');
                console.log('\x1b[90m' + '─'.repeat(50) + '\x1b[0m');
                console.log('\n✅ \x1b[1m\x1b[32mDRY-RUN COMPLETADO CON ÉXITO\x1b[0m');
                process.exit(0);
            }

            // C. Execute
            console.log('🚀 \x1b[1mEJECUTANDO EN DISPOSITIVO...\x1b[0m\n');
            const result = await runMaestroTest(testPackage.yaml);

            // D. Check Result
            if (result.success) {
                console.log('\n' + '═'.repeat(50));
                console.log('\x1b[1m\x1b[32m   ✅  PRUEBA SUPERADA CON ÉXITO\x1b[0m');
                console.log('═'.repeat(50));
                console.log(`\x1b[32mLa suite "${testPackage.testType}" ha finalizado correctamente.\x1b[0m\n`);
                process.exit(0);
            } else {
                console.log('\n' + '─'.repeat(50));
                console.log('\x1b[1m\x1b[31m   ❌  LA PRUEBA HA FALLADO\x1b[0m');
                console.log('─'.repeat(50));
                console.log(`\n\x1b[31mMotivo del fallo:\x1b[0m\n${result.error?.slice(0, 500)}...\n`);

                if (attempt < MAX_RETRIES) {
                    console.log('\x1b[33m🔄 Re-intentando ajuste inteligente del script...\x1b[0m');
                }
                currentError = result.error;
            }
        } catch (error: any) {
            console.error(`\n❌ \x1b[31mError fatal en el intento ${attempt}:\x1b[0m`, error.message);
            if (attempt === MAX_RETRIES) throw error;
        }
    }

    console.log('\n\x1b[41m\x1b[37m 💥 LÍMITE DE INTENTOS ALCANZADO \x1b[0m');
    console.log('No se pudo generar un test funcional después de múltiples intentos.');
    process.exit(1);
}

main().catch(e => {
    console.error('\n\x1b[31m🔴 Proceso abortado inesperadamente:\x1b[0m');
    console.error(e.message);
});