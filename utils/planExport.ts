import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { DailyMealPlan } from '@/store/mealPlanStore';
import { SavedRoutine } from '@/store/savedRoutinesStore';

/**
 * Exporta meal plan en formato JSON
 */
export async function exportMealPlanJSON(plan: DailyMealPlan[]): Promise<void> {
    try {
        const jsonString = JSON.stringify(plan, null, 2);
        const filename = `meal_plan_${new Date().toISOString().split('T')[0]}.json`;
        const fileUri = FileSystem.documentDirectory + filename;

        await FileSystem.writeAsStringAsync(fileUri, jsonString);
        await Sharing.shareAsync(fileUri, {
            mimeType: 'application/json',
            dialogTitle: 'Exportar Plan de Comidas'
        });

        console.log('✅ Meal plan exported:', filename);
    } catch (error) {
        console.error('Error exporting meal plan:', error);
        throw error;
    }
}

/**
 * Exporta rutina en formato JSON
 */
export async function exportRoutineJSON(routine: SavedRoutine): Promise<void> {
    try {
        const jsonString = JSON.stringify(routine, null, 2);
        const filename = `routine_${routine.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.json`;
        const fileUri = FileSystem.documentDirectory + filename;

        await FileSystem.writeAsStringAsync(fileUri, jsonString);
        await Sharing.shareAsync(fileUri, {
            mimeType: 'application/json',
            dialogTitle: 'Exportar Rutina'
        });

        console.log('✅ Routine exported:', filename);
    } catch (error) {
        console.error('Error exporting routine:', error);
        throw error;
    }
}

/**
 * Exporta meal plan en formato texto plano
 */
export async function exportMealPlanText(plan: DailyMealPlan[]): Promise<void> {
    try {
        let text = '📅 PLAN DE COMIDAS SEMANAL\n\n';

        plan.forEach((day, index) => {
            const dayName = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'][day.date.getDay()];
            text += `=== ${dayName} ${day.date.toLocaleDateString()} ===\n\n`;

            day.meals.forEach(meal => {
                text += `🍽️  ${meal.name}\n`;
                text += `   Tipo: ${meal.type}\n`;
                text += `   Calorías: ${meal.calories} kcal\n`;
                text += `   Macros: P${meal.protein}g / C${meal.carbs}g / G${meal.fat}g\n`;

                if (meal.ingredients?.length > 0) {
                    text += `   Ingredientes:\n`;
                    meal.ingredients.forEach(ing => {
                        text += `   - ${ing}\n`;
                    });
                }

                if (meal.prepTime) {
                    text += `   Tiempo: ${meal.prepTime}\n`;
                }

                text += '\n';
            });

            // Totales del día
            const totalCalories = day.meals.reduce((sum, m) => sum + m.calories, 0);
            const totalProtein = day.meals.reduce((sum, m) => sum + m.protein, 0);
            const totalCarbs = day.meals.reduce((sum, m) => sum + m.carbs, 0);
            const totalFat = day.meals.reduce((sum, m) => sum + m.fat, 0);

            text += `📊 TOTALES: ${totalCalories} kcal | P${totalProtein}g | C${totalCarbs}g | G${totalFat}g\n\n`;
        });

        const filename = `meal_plan_${new Date().toISOString().split('T')[0]}.txt`;
        const fileUri = FileSystem.documentDirectory + filename;

        await FileSystem.writeAsStringAsync(fileUri, text);
        await Sharing.shareAsync(fileUri, {
            mimeType: 'text/plain',
            dialogTitle: 'Exportar Plan de Comidas'
        });

        console.log('✅ Meal plan text exported:', filename);
    } catch (error) {
        console.error('Error exporting text:', error);
        throw error;
    }
}

/**
 * Exporta rutina en formato texto
 */
export async function exportRoutineText(routine: SavedRoutine): Promise<void> {
    try {
        let text = `💪 ${routine.name.toUpperCase()}\n\n`;

        if (routine.description) {
            text += `${routine.description}\n\n`;
        }

        text += `EJERCICIOS (${routine.exercises.length}):\n\n`;

        routine.exercises.forEach((exercise, index) => {
            text += `${index + 1}. ${exercise.name}\n`;
            text += `   Grupo: ${exercise.muscleGroup}\n`;
            text += `   Equipo: ${exercise.equipment}\n`;
            if (exercise.plannedSets) {
                text += `   Sets: ${exercise.plannedSets}\n`;
            }
            if (exercise.restTime) {
                text += `   Descanso: ${exercise.restTime}s\n`;
            }
            text += '\n';
        });

        const filename = `routine_${routine.name.replace(/\s+/g, '_')}.txt`;
        const fileUri = FileSystem.documentDirectory + filename;

        await FileSystem.writeAsStringAsync(fileUri, text);
        await Sharing.shareAsync(fileUri, {
            mimeType: 'text/plain',
            dialogTitle: 'Exportar Rutina'
        });

        console.log('✅ Routine text exported:', filename);
    } catch (error) {
        console.error('Error exporting routine text:', error);
        throw error;
    }
}

/**
 * Importa meal plan desde JSON
 */
export async function importMealPlanJSON(jsonString: string): Promise<DailyMealPlan[]> {
    try {
        const parsed = JSON.parse(jsonString);

        // Validar estructura básica
        if (!Array.isArray(parsed)) {
            throw new Error('Invalid format: expected array');
        }

        // Transform dates
        const plan: DailyMealPlan[] = parsed.map(day => ({
            ...day,
            date: new Date(day.date)
        }));

        return plan;
    } catch (error) {
        console.error('Error importing meal plan:', error);
        throw new Error('Formato de archivo inválido');
    }
}

/**
 * Importa rutina desde JSON
 */
export async function importRoutineJSON(jsonString: string): Promise<SavedRoutine> {
    try {
        const parsed = JSON.parse(jsonString);

        // Validar estructura
        if (!parsed.name || !parsed.exercises || !Array.isArray(parsed.exercises)) {
            throw new Error('Invalid routine format');
        }

        // Transform dates
        const routine: SavedRoutine = {
            ...parsed,
            createdAt: parsed.createdAt ? new Date(parsed.createdAt) : new Date()
        };

        return routine;
    } catch (error) {
        console.error('Error importing routine:', error);
        throw new Error('Formato de rutina inválido');
    }
}
