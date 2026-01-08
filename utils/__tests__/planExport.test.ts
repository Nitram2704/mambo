import { exportMealPlanJSON, exportRoutineJSON, importMealPlanJSON, importRoutineJSON, exportMealPlanText, exportRoutineText } from '../planExport';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { DailyMealPlan } from '@/store/mealPlanStore';
import { SavedRoutine } from '@/store/savedRoutinesStore';

jest.mock('expo-file-system/legacy', () => ({
    documentDirectory: 'file:///test/directory/',
    writeAsStringAsync: jest.fn(),
}));

jest.mock('expo-sharing', () => ({
    shareAsync: jest.fn(),
}));

describe('planExport', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    const mockMealPlan: DailyMealPlan[] = [
        {
            id: 'day-1',
            date: new Date('2024-01-01T00:00:00.000Z'),
            meals: [
                {
                    id: '1',
                    name: 'Breakfast',
                    type: 'breakfast',
                    calories: 500,
                    protein: 30,
                    carbs: 50,
                    fat: 20,
                    ingredients: ['Eggs', 'Toast']
                }
            ]
        }
    ];

    const mockRoutine: SavedRoutine = {
        id: 'routine-1',
        name: 'Test Routine',
        exercises: [
            {
                id: 'ex-1',
                name: 'Push Up',
                muscleGroup: 'chest',
                equipment: 'bodyweight',
                plannedSets: 3,
                restTime: 60
            }
        ],
        createdAt: '2024-01-01T00:00:00.000Z'
    };

    describe('exportMealPlanJSON', () => {
        it('should write file and share it', async () => {
            await exportMealPlanJSON(mockMealPlan);

            expect(FileSystem.writeAsStringAsync).toHaveBeenCalledWith(
                expect.stringContaining('meal_plan_'),
                expect.stringContaining('"name": "Breakfast"')
            );
            expect(Sharing.shareAsync).toHaveBeenCalledWith(
                expect.stringContaining('meal_plan_'),
                expect.objectContaining({ mimeType: 'application/json' })
            );
        });
    });

    describe('exportRoutineJSON', () => {
        it('should write file and share it', async () => {
            await exportRoutineJSON(mockRoutine);

            expect(FileSystem.writeAsStringAsync).toHaveBeenCalledWith(
                expect.stringContaining('routine_Test_Routine_'),
                expect.stringContaining('"name": "Test Routine"')
            );
            expect(Sharing.shareAsync).toHaveBeenCalledWith(
                expect.stringContaining('routine_Test_Routine_'),
                expect.objectContaining({ mimeType: 'application/json' })
            );
        });
    });

    describe('exportMealPlanText', () => {
        it('should write text file and share it', async () => {
            await exportMealPlanText(mockMealPlan);

            expect(FileSystem.writeAsStringAsync).toHaveBeenCalledWith(
                expect.stringContaining('meal_plan_'),
                expect.stringContaining('PLAN DE COMIDAS SEMANAL')
            );
            expect(Sharing.shareAsync).toHaveBeenCalledWith(
                expect.stringContaining('meal_plan_'),
                expect.objectContaining({ mimeType: 'text/plain' })
            );
        });
    });

    describe('exportRoutineText', () => {
        it('should write text file and share it', async () => {
            await exportRoutineText(mockRoutine);

            expect(FileSystem.writeAsStringAsync).toHaveBeenCalledWith(
                expect.stringContaining('routine_Test_Routine.txt'),
                expect.stringContaining('TEST ROUTINE')
            );
            expect(Sharing.shareAsync).toHaveBeenCalledWith(
                expect.stringContaining('routine_Test_Routine.txt'),
                expect.objectContaining({ mimeType: 'text/plain' })
            );
        });
    });

    describe('importMealPlanJSON', () => {
        it('should parse valid JSON and convert dates', async () => {
            const jsonString = JSON.stringify(mockMealPlan);
            const result = await importMealPlanJSON(jsonString);

            expect(result).toHaveLength(1);
            expect(result[0].date).toBeInstanceOf(Date);
            expect(result[0].meals[0].name).toBe('Breakfast');
        });

        it('should throw error for invalid JSON', async () => {
            await expect(importMealPlanJSON('invalid-json')).rejects.toThrow();
        });

        it('should throw error for invalid structure', async () => {
            await expect(importMealPlanJSON('{}')).rejects.toThrow('Formato de archivo inválido');
        });
    });

    describe('importRoutineJSON', () => {
        it('should parse valid JSON and convert dates', async () => {
            const jsonString = JSON.stringify(mockRoutine);
            const result = await importRoutineJSON(jsonString);

            expect(result.name).toBe('Test Routine');
            expect(result.createdAt).toBeInstanceOf(Date);
        });

        it('should throw error for invalid structure', async () => {
            await expect(importRoutineJSON('{}')).rejects.toThrow('Formato de rutina inválido');
        });
    });
});
