import 'dotenv/config';
import { loadContext } from './mambo-qa/context_loader.ts';
import { generateMaestroTest } from './mambo-qa/llm_client.ts';
import { runMaestroTest } from './mambo-qa/runner.ts';
import path from 'path';
import { fileURLToPath } from 'url';

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
        console.error('Loaded from: ' + path.resolve(process.cwd(), '.env'));
        process.exit(1);
    } else {
        console.log('🔑 API Key found (ends with ' + apiKey.slice(-4) + ')');
    }

    if (!prompt || prompt === '--dry-run') {
        console.error('❌ Please provide a prompt in quotes. Example: npm run test:ai -- "Check login flow" --dry-run');
        process.exit(1);
    }

    console.log(`🎯 Goal: "${prompt}"`);
    if (isDryRun) {
        console.log('🧪 DRY-RUN MODE: Will generate YAML but skip execution\n');
    }

    // 2. Load Context (RAG)
    const rootDir = path.resolve(__dirname, '..');
    const context = await loadContext(rootDir);

    let currentError: string | undefined = undefined;
    const MAX_RETRIES = isDryRun ? 1 : 3;

    // 3. The Autonomous Loop
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        console.log(`\n🔄 Attempt ${attempt}/${MAX_RETRIES}`);

        // A. Generate
        const yaml = await generateMaestroTest(prompt, context, currentError);
        console.log('📝 Generated YAML:\n');
        console.log('─'.repeat(50));
        console.log(yaml);
        console.log('─'.repeat(50));

        if (isDryRun) {
            console.log('\n✅ DRY-RUN: YAML generated successfully. Skipping execution.');
            console.log('💡 To run for real, remove --dry-run flag and ensure Maestro is installed.');
            process.exit(0);
        }

        // B. Execute
        const result = await runMaestroTest(yaml);

        // C. Check Result
        if (result.success) {
            console.log('\n🎉 SUCCESS! The test passed.');
            process.exit(0);
        } else {
            console.error(`\n⚠️ Attempt ${attempt} failed.`);
            console.error(`Error: ${result.error?.slice(0, 300)}...`); // Log first 300 chars of error

            // Feed error back to loop
            currentError = result.error;
        }
    }

    console.error('\n💥 strictMaxRetriesExceeded: Could not fix the test after multiple attempts.');
    process.exit(1);
}

main().catch(e => console.error(e));
