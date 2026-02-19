import { exec } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';
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

    try {
        // 2. Run Maestro
        const { stdout, stderr } = await execAsync(`maestro test ${tempFile}`);

        return {
            success: true,
            output: stdout
        };

    } catch (e: any) {
        // Capture the full error message from Maestro
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
