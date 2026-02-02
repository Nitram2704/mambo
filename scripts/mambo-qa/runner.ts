import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';
import util from 'util';

const execAsync = util.promisify(exec);

export type RunResult = {
    success: boolean;
    output: string;
    error?: string;
};

/**
 * Executes a generated YAML content using Maestro.
 */
export async function runMaestroTest(yamlContent: string): Promise<RunResult> {
    // 1. Write to temp file
    const tempFile = path.join(os.tmpdir(), `temp_mambo_test_${Date.now()}.yaml`);
    fs.writeFileSync(tempFile, yamlContent);

    console.log(`🚀 Executing Generated Test: ${tempFile}`);

    try {
        // 2. Run Maestro
        // Assumes env is ready. We pipe stdout/stderr to capture verification results.
        const { stdout, stderr } = await execAsync(`maestro test ${tempFile}`);

        console.log('✅ Test Passed!');
        return {
            success: true,
            output: stdout
        };

    } catch (e: any) {
        console.log('❌ Test Failed!');

        // Capture the full error message from Maestro (which contains the failure reason)
        const errorMessage = e.stderr || e.stdout || e.message;

        return {
            success: false,
            output: e.stdout,
            error: errorMessage
        };
    } finally {
        // Optional: Clean up temp file
        // fs.unlinkSync(tempFile); 
    }
}
