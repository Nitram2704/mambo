# Mambo Fitness

Una aplicación integral de fitness basada en IA para gestionar entrenamientos, nutrición y recuperación.

## 🚀 Inicio Rápido

1. **Instalar dependencias:**
   ```bash
   npm install
   ```

2. **Configurar entorno:**
   Asegúrate de configurar las variables de entorno necesarias (claves de Supabase y Google GenAI).

3. **Iniciar la aplicación:**
   ```bash
   npx expo start
   ```

## ✨ Características Principales

- **Registro de Entrenamientos:** Crea rutinas, registra series (Peso, Reps, RIR/RPE) y controla los tiempos de descanso.
- **Asistente Inteligente (IA):** Integración con Google GenAI para análisis de progreso y sugerencias.
- **Módulo de Nutrición:** Registro diario y seguimiento de calorías y macronutrientes.
- **Módulo de Recuperación:** Monitoreo avanzado de calidad y cantidad de sueño.
- **Modo Offline-First:** Caché local robusta impulsada por Zustand para gimnasios sin buena conexión.

## 🛠️ Stack Tecnológico

- **Frontend:** React Native, Expo, Tailwind CSS (NativeWind)
- **Backend & DB:** Supabase (PostgreSQL)
- **Estado Local:** Zustand
- **Inteligencia Artificial:** Google GenAI, Model Context Protocol (MCP)

---
*Para detalles profundos sobre el esquema de base de datos y decisiones de arquitectura, revisa el archivo `technical_spec.md` en la raíz del proyecto.*
