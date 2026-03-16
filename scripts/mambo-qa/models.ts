export const modelsOPenRouter = {
    "deepseek": "deepseek/deepseek-r1-0528:free",
    "gemini_3_pro": "google/gemini-3.1-pro-preview",
    "gemini_3_flash": "google/gemini-3-flash-preview",
    "gemini_2_5_flash": "google/gemini-2.0-flash",
    "claude": "openrouter/free", // Special auto-routing slug
    "meta": "meta-llama/llama-3.3-70b-instruct:free",
};

export const modelPriority = [
    modelsOPenRouter.deepseek,
    modelsOPenRouter.claude,
    modelsOPenRouter.gemini_3_flash,
    modelsOPenRouter.meta,
    modelsOPenRouter.gemini_3_pro,
    modelsOPenRouter.gemini_2_5_flash
];
