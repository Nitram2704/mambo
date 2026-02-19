import fs from 'fs';
import { glob } from 'glob';
import path from 'path';

import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Basic caching to avoid re-scanning 1000s of files every run
const CACHE_FILE = path.join(__dirname, '.context_cache.json');

export interface AppContext {
    testIDs: string[];
    exampleTests: string;
    filesSummary: string[];
}

/**
 * Scans the codebase to extract available testIDs.
 * Uses a regex-based approach for speed (AST is better but overkill for v1).
 */
async function scanTestIDs(rootDir: string): Promise<string[]> {
    const files = await glob('**/*.tsx', {
        cwd: rootDir,
        ignore: ['node_modules/**', '**/__tests__/**']
    });

    const testIDs = new Set<string>();
    const regex = /testID=(?:['"]([^'"]+)['"]|\{['"]([^'"]+)['"]\})/g;

    for (const file of files) {
        const content = fs.readFileSync(path.join(rootDir, file), 'utf-8');
        let match;
        while ((match = regex.exec(content)) !== null) {
            // match[1] is "value" in testID="value"
            // match[2] is "value" in testID={'value'}
            const id = match[1] || match[2];
            if (id) testIDs.add(id);
        }
    }

    return Array.from(testIDs).sort();
}

/**
 * Reads existing Maestro YAMLs to use as Few-Shot examples.
 * Limits to a few key files to save context.
 */
function getExampleTests(rootDir: string): string {
    const maestroDir = path.join(rootDir, 'maestro');
    if (!fs.existsSync(maestroDir)) return '';

    const examples: string[] = [];
    const files = fs.readdirSync(maestroDir).filter(f => f.endsWith('.yaml'));

    // Pick first 2-3 small yamls as examples
    for (const file of files.slice(0, 3)) {
        const content = fs.readFileSync(path.join(maestroDir, file), 'utf-8');
        examples.push(`--- FILE: maestro/${file} ---\n${content}\n`);
    }

    return examples.join('\n');
}

export async function loadContext(rootDir: string): Promise<AppContext> {
    // In v1 we scan every time, later we can implement cache check
    const testIDs = await scanTestIDs(rootDir);
    const exampleTests = getExampleTests(rootDir);

    const context = {
        testIDs,
        exampleTests,
        filesSummary: [] // Future: list of key Screens
    };

    return context;
}
