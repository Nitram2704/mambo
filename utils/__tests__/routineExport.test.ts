import { exportRoutineAsJSON, exportRoutineAsText, importRoutineFromJSON } from '../routineExport';



describe('routineExport', () => {
    const mockRoutine = {
        id: '1',
        name: 'My Routine',
        description: 'A test routine',
        exercises: [
            {
                id: 'ex1',
                name: 'Push Ups',
                muscleGroup: 'chest',
                plannedSets: 3,
                plannedReps: 10,
                restTime: 60,
                sets: [],
            },
        ],
        createdAt: new Date().toISOString(),
    };

    describe('exportRoutineAsJSON', () => {
        it('should export routine to valid JSON', () => {
            const json = exportRoutineAsJSON(mockRoutine as any);
            const data = JSON.parse(json);
            expect(data.name).toBe('My Routine');
            expect(data.exercises).toHaveLength(1);
            expect(data.exercises[0].exerciseId).toBe('ex1');
        });
    });

    describe('exportRoutineAsText', () => {
        it('should export routine to formatted text', () => {
            const text = exportRoutineAsText(mockRoutine as any);
            expect(text).toContain('📋 Rutina: My Routine');
            expect(text).toContain('Push Ups');
            expect(text).toContain('3 series x 10 reps');
        });
    });

    describe('importRoutineFromJSON', () => {
        it('should import valid routine JSON', () => {
            const json = JSON.stringify({
                name: 'Imported Routine',
                exercises: [
                    {
                        exerciseId: 'ex2',
                        plannedSets: 4,
                        plannedReps: 12,
                        restTime: 90,
                    },
                ],
            });

            const routine = importRoutineFromJSON(json);
            expect(routine).not.toBeNull();
            expect(routine?.name).toBe('Imported Routine');
            expect(routine?.exercises).toHaveLength(1);
            expect(routine?.exercises[0].plannedSets).toBe(4);
        });

        it('should return null for invalid JSON', () => {
            const routine = importRoutineFromJSON('invalid-json');
            expect(routine).toBeNull();
        });

        it('should return null for missing required fields', () => {
            const routine = importRoutineFromJSON('{}');
            expect(routine).toBeNull();
        });
    });
});
