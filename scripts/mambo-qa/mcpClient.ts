import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import 'dotenv/config';
import { callLLM, createLLMClient } from './llm_mcp.js';
import { modelsOPenRouter } from './models.js';

async function agentLoop() {
  // 1. Conexiones a Herramientas
  const fileTransport = new StdioClientTransport({
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-filesystem", process.cwd()]
  });
  const shellTransport = new StdioClientTransport({
    command: "npx",
    args: ["-y", "mcp-shell-server"]
  });

  const fileClient = new Client({ name: "FileHandler", version: "1.0.0" }, { capabilities: {} });
  const shellClient = new Client({ name: "ShellHandler", version: "1.0.0" }, { capabilities: {} });

  await fileClient.connect(fileTransport);
  await shellClient.connect(shellTransport);
  console.log("✅ Agente QA conectado a FileSystem y Shell");

  // 2. Conexión a LLM vía MCP
  const { client: llmClient } = await createLLMClient();
  console.log("✅ Agente QA conectado a LLM vía MCP");

  const task = "Encuentra el archivo suma.js, crea un test unitario con Jest y ejecútalo hasta que pase.";
  let finished = false;
  let context = `Tarea: ${task}. Responde SIEMPRE con un JSON que tenga: pensamiento, herramienta y argumentos.`;

  while (!finished) {
    try {
      const systemPrompt = "Eres un experto en QA. Puedes usar herramientas de filesystem (read_file, write_file, list_directory) y de shell (execute_command).";
      const userPrompt = context;

      let rawContent = "";
      let modelUsed = "";

      // Usar lista de prioridad centralizada
      const { modelPriority } = await import('./models.js');

      for (const model of modelPriority) {
        // En este cliente (MCP), solo usamos los de OpenRouter por ahora
        if (!model.includes('/') && model !== 'openrouter/free') continue;

        try {
          console.log(`📡 Intentando con modelo: ${model}...`);
          rawContent = await callLLM(llmClient, model, systemPrompt, userPrompt);
          modelUsed = model;
          break;
        } catch (error: any) {
          console.error(`❌ Falló modelo ${model}: ${error.message}`);
          continue;
        }
      }

      if (!rawContent) {
        throw new Error("Todos los modelos fallaron. Revisa tu API Key o cuota.");
      }

      console.log(`✅ Respuesta obtenida de: ${modelUsed}`);
      const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        context += "\nError: No enviaste un JSON válido. Intenta de nuevo.";
        continue;
      }

      const aiResponse = JSON.parse(jsonMatch[0]);
      console.log(`🤖 IA piensa: ${aiResponse.pensamiento}`);

      let result;
      // LOGICA PARA ELEGIR EL CLIENTE CORRECTO
      if (aiResponse.herramienta === "execute_command") {
        result = await shellClient.callTool({ name: "execute_command", arguments: aiResponse.argumentos });
      } else if (aiResponse.herramienta === "finalizar") {
        finished = true;
        result = "Tarea finalizada.";
      } else {
        result = await fileClient.callTool({ name: aiResponse.herramienta, arguments: aiResponse.argumentos });
      }

      context += `\nResultado de ${aiResponse.herramienta}: ${JSON.stringify(result)}`;

    } catch (err: any) {
      console.error("Error en el bucle del agente:", err.message);
      context += `\nError: ${err.message}. Corrige y reintenta.`;
    }
  }
}

// INICIAR EL AGENTE
agentLoop().catch(console.error);