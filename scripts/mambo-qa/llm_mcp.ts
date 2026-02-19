import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import 'dotenv/config';
import { modelsOPenRouter } from './models.js';

/**
 * Helper to create and connect an MCP client for LLM services.
 */
export async function createLLMClient() {
    const isWindows = process.platform === 'win32';

    // Create a comma-separated list of allowed models from modelsOPenRouter
    const allowedModels = Object.values(modelsOPenRouter).join(',');

    const transport = new StdioClientTransport({
        command: isWindows ? "npx.cmd" : "npx",
        args: ["-y", "openrouter-mcp"],
        env: {
            ...process.env,
            OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY,
            OPENROUTER_ALLOWED_MODELS: allowedModels
        } as any
    });

    const client = new Client({
        name: "mambo-llm-client",
        version: "1.0.0"
    }, {
        capabilities: {}
    });

    await client.connect(transport);
    return { client, transport };
}

/**
 * Common tool call for LLM generation via MCP.
 */
export async function callLLM(client: Client, model: string, systemPrompt: string, userPrompt: string) {
    const toolName = "ask_model";

    try {
        const result = await client.callTool({
            name: toolName,
            arguments: {
                model: model,
                message: `${systemPrompt}\n\n${userPrompt}`,
                append_files: [""]
            }
        }) as any;

        if (result.isError) {
            const errorMsg = result.content?.[0]?.text || JSON.stringify(result);
            throw new Error(`OpenRouter Error: ${errorMsg}`);
        }

        if (!result.content || !result.content[0]) {
            throw new Error(`Invalid MCP response: ${JSON.stringify(result)}`);
        }

        const textContent = result.content.find((c: any) => c.type === 'text')?.text;
        if (textContent) return textContent;

        return result.content[0].text;
    } catch (e: any) {
        throw e;
    }
}
