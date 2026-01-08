const fs = require('fs');
const path = require('path');

const esPath = path.join(__dirname, 'locales', 'es.json');
const enPath = path.join(__dirname, 'locales', 'en.json');

const newTranslations = {
    history: {
        title: "Historial",
        subtitle: "Tu actividad",
        empty: "Sin actividad aún",
        emptyDesc: "Tus entrenamientos, comidas, sueño y agua aparecerán aquí",
        tabs: {
            all: "Todos",
            workouts: "Entrenamientos",
            meals: "Comidas",
            sleep: "Sueño",
            water: "Agua"
        },
        items: {
            duration: "Duración",
            volume: "Volumen",
            exercises: "Ejercicios",
            quality: "Calidad",
            amount: "Cantidad",
            cal: "Cal",
            prot: "Prot",
            carbs: "Carbs",
            fat: "Grasa"
        }
    },
    analytics: {
        advancedTitle: "Analytics Avanzados",
        mamboAi: "Predicciones Mambo AI",
        weeklyVolume: "Volumen Semanal (kg)",
        prProgression: "Progresión de PR (kg)",
        muscleBalance: "Balance Muscular",
        performanceInsights: "Insights de Rendimiento",
        weightEvolution: "Evolución de Peso (kg)",
        noData: "No hay datos de entrenamiento aún",
        registerMore: "Registra más sesiones de {{exercise}} para ver el progreso",
        prPrediction: "PREDICCIÓN DE 1RM",
        calculating: "Calculando...",
        everythingOk: "¡Todo en orden!",
        excellentBalance: "Tu balance y adherencia son excelentes.",
        recommendation: "Recomendación:",
        weightTrendDesc: "Entrena más para generar predicciones...",
        registerWeight: "Registra tu peso más seguido para ver la gráfica"
    },
    reports: {
        monthly: {
            title: "Reporte Mensual",
            totalCalories: "Total Calorías",
            workouts: "Entrenamientos",
            monthlyAvg: "Promedio Mensual",
            weeklyBreakdown: "Desglose Semanal",
            monthAchievements: "Logros del Mes",
            workoutsCompleted: "12+ Entrenamientos completados",
            nutritionActive: "Seguimiento nutricional activo",
            startLogging: "Comienza a registrar tus comidas y entrenamientos"
        },
        weekly: {
            title: "Reporte Semanal",
            caloriesPerDay: "Calorías/Día",
            workouts: "Entrenamientos",
            calorieTrend: "Tendencia de Calorías",
            macroDistribution: "Distribución de Macros",
            dailyAvg: "Promedio Diario",
            totalMinutes: "Total Minutos",
            avgPerDay: "Promedio/Día",
            caloriesBurned: "Calorías Quemadas",
            dailyBreakdown: "Desglose Diario",
            noData: "Sin datos para esta semana"
        }
    },
    sleep: {
        goals: {
            title: "Metas de Sueño",
            save: "Guardar",
            targetHours: "Horas Objetivo",
            recommended: "Recomendado: 7-9 horas para adultos",
            targetBedtime: "Hora de Dormir Objetivo",
            targetWakeTime: "Hora de Despertar Objetivo",
            tip: "Consejo",
            tipDesc: "Mantener un horario consistente de sueño ayuda a mejorar la calidad del descanso y tu salud general.",
            errorTitle: "Error",
            errorHours: "Ingresa un número válido de horas (1-24)",
            savedTitle: "¡Guardado!",
            savedDesc: "Tus metas de sueño han sido actualizadas"
        }
    }
};

const enTranslations = {
    history: {
        title: "History",
        subtitle: "Your activity",
        empty: "No activity yet",
        emptyDesc: "Your workouts, meals, sleep and water will appear here",
        tabs: {
            all: "All",
            workouts: "Workouts",
            meals: "Meals",
            sleep: "Sleep",
            water: "Water"
        },
        items: {
            duration: "Duration",
            volume: "Volume",
            exercises: "Exercises",
            quality: "Quality",
            amount: "Amount",
            cal: "Cal",
            prot: "Prot",
            carbs: "Carbs",
            fat: "Fat"
        }
    },
    analytics: {
        advancedTitle: "Advanced Analytics",
        mamboAi: "Mambo AI Predictions",
        weeklyVolume: "Weekly Volume (kg)",
        prProgression: "PR Progression (kg)",
        muscleBalance: "Muscle Balance",
        performanceInsights: "Performance Insights",
        weightEvolution: "Weight Evolution (kg)",
        noData: "No workout data yet",
        registerMore: "Register more sessions of {{exercise}} to see progress",
        prPrediction: "1RM PREDICTION",
        calculating: "Calculating...",
        everythingOk: "Everything in order!",
        excellentBalance: "Your balance and adherence are excellent.",
        recommendation: "Recommendation:",
        weightTrendDesc: "Train more to generate predictions...",
        registerWeight: "Register your weight more often to see the chart"
    },
    reports: {
        monthly: {
            title: "Monthly Report",
            totalCalories: "Total Calories",
            workouts: "Workouts",
            monthlyAvg: "Monthly Average",
            weeklyBreakdown: "Weekly Breakdown",
            monthAchievements: "Achievements of the Month",
            workoutsCompleted: "12+ Workouts completed",
            nutritionActive: "Active nutritional tracking",
            startLogging: "Start logging your meals and workouts"
        },
        weekly: {
            title: "Weekly Report",
            caloriesPerDay: "Calories/Day",
            workouts: "Workouts",
            calorieTrend: "Calorie Trend",
            macroDistribution: "Macro Distribution",
            dailyAvg: "Daily Average",
            totalMinutes: "Total Minutes",
            avgPerDay: "Average/Day",
            caloriesBurned: "Calories Burned",
            dailyBreakdown: "Daily Breakdown",
            noData: "No data for this week"
        }
    },
    sleep: {
        goals: {
            title: "Sleep Goals",
            save: "Save",
            targetHours: "Target Hours",
            recommended: "Recommended: 7-9 hours for adults",
            targetBedtime: "Target Bedtime",
            targetWakeTime: "Target Wake Time",
            tip: "Tip",
            tipDesc: "Maintaining a consistent sleep schedule helps improve rest quality and your overall health.",
            errorTitle: "Error",
            errorHours: "Enter a valid number of hours (1-24)",
            savedTitle: "Saved!",
            savedDesc: "Your sleep goals have been updated"
        }
    }
};

function updateFile(filePath, translations) {
    const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    // Merge translations
    content.history = translations.history;
    content.analytics = translations.analytics;
    content.reports = translations.reports;
    // Merge sleep.goals into existing sleep section
    if (!content.sleep) content.sleep = {};
    content.sleep.goals = translations.sleep.goals;

    fs.writeFileSync(filePath, JSON.stringify(content, null, 4), 'utf8');
    console.log(`Updated ${filePath}`);
}

updateFile(esPath, newTranslations);
updateFile(enPath, enTranslations);
