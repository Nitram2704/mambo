import { SavedRoutine } from '@/store/savedRoutinesStore';

/**
 * Export a routine as a JSON string for sharing
 */
export function exportRoutineAsJSON(routine: SavedRoutine): string {
    const exportData = {
        name: routine.name,
        description: routine.description,
        exercises: routine.exercises.map(ex => ({
            exerciseId: ex.id,
            plannedSets: ex.plannedSets,
            plannedReps: ex.plannedReps,
            restTime: ex.restTime,
        })),
        version: '1.0',
        exportedAt: new Date().toISOString(),
    };
    return JSON.stringify(exportData, null, 2);
}

/**
 * Export routine as shareable text format
 */
export function exportRoutineAsText(routine: SavedRoutine): string {
    let text = `📋 Rutina: ${routine.name}\n`;
    if (routine.description) {
        text += `📝 ${routine.description}\n`;
    }
    text += `\n`;

    routine.exercises.forEach((ex, index) => {
        text += `${index + 1}. ${ex.name}\n`;
        text += `   • ${ex.plannedSets || 3} series x ${ex.plannedReps || 10} reps\n`;
        text += `   • Descanso: ${ex.restTime || 60}s\n`;
        text += `\n`;
    });

    text += `\n🏋️ Creado con Mambo Fitness`;
    return text;
}

/**
 * Import a routine from JSON data
 */
export function importRoutineFromJSON(jsonString: string): Omit<SavedRoutine, 'id' | 'createdAt'> | null {
    try {
        const data = JSON.parse(jsonString);

        if (!data.name || !data.exercises || !Array.isArray(data.exercises)) {
            return null;
        }

        return {
            name: data.name,
            description: data.description || '',
            exercises: data.exercises.map((ex: any) => ({
                id: ex.exerciseId,
                name: '', // Will need to be filled from exercise database
                muscleGroup: '',
                plannedSets: ex.plannedSets || 3,
                plannedReps: ex.plannedReps || 10,
                restTime: ex.restTime || 90,
            })),
        };
    } catch (error) {
        console.error('Error importing routine:', error);
        return null;
    }
}
