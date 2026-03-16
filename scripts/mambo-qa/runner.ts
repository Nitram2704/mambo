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
        const isWindows = process.platform === 'win32';
        const maestroPath = isWindows ? 'C:\\Users\\marti\\maestro\\maestro\\bin\\maestro' : 'maestro';

        // Ensure Android SDK is in path for Maestro and fix Java 25 warnings
        const env = {
            ...process.env,
            ANDROID_HOME: 'C:\\Users\\marti\\AppData\\Local\\Android\\Sdk',
            PATH: `${process.env.PATH}${isWindows ? ';' : ':'}C:\\Users\\marti\\AppData\\Local\\Android\\Sdk\\platform-tools`,
            JAVA_OPTS: '--enable-native-access=ALL-UNNAMED --add-opens java.base/java.lang=ALL-UNNAMED -Dorg.fusesource.jansi.Ansi.disable=true'
        };

        const { stdout, stderr } = await execAsync(`${maestroPath} test ${tempFile}`, { env });

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
