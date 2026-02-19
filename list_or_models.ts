import 'dotenv/config';

async function listModels() {
    const response = await fetch("https://openrouter.ai/api/v1/models");
    const data = await response.json();
    const freeModels = data.data.filter((m: any) => m.id.includes(':free') || m.pricing.prompt === '0');
    console.log('🆓 Free Models on OpenRouter:');
    freeModels.forEach((m: any) => console.log(`- ${m.id}`));
}

listModels().catch(console.error);
