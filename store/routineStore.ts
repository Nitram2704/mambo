import { create } from 'zustand';
import { Exercise } from '@/constants/exercises';

interface RoutineState {
    name: string;
    exercises: Exercise[];
    setName: (name: string) => void;
    addExercise: (exercise: Exercise) => void;
    removeExercise: (exerciseId: string) => void;
    updateRestTime: (exerciseId: string, restTime: number) => void;
    addSet: (exerciseId: string) => void;
    removeSet: (exerciseId: string) => void;
    linkSuperset: (exerciseId1: string, exerciseId2: string) => void;
    unlinkSuperset: (exerciseId: string) => void;
    loadRoutine: (name: string, exercises: Exercise[]) => void;
    resetRoutine: () => void;
}

export const useRoutineStore = create<RoutineState>((set) => ({
    name: '',
    exercises: [],
    setName: (name) => set({ name }),
    addExercise: (exercise) =>
        set((state) => ({
            exercises: [...state.exercises, { ...exercise, restTime: 120, plannedSets: 1 }]
        })),
    removeExercise: (exerciseId) =>
        set((state) => ({
            exercises: state.exercises.filter((ex) => ex.id !== exerciseId),
        })),
    updateRestTime: (exerciseId, restTime) =>
        set((state) => ({
            exercises: state.exercises.map((ex) =>
                ex.id === exerciseId ? { ...ex, restTime } : ex
            ),
        })),
    addSet: (exerciseId) =>
        set((state) => ({
            exercises: state.exercises.map((ex) =>
                ex.id === exerciseId ? { ...ex, plannedSets: (ex.plannedSets || 1) + 1 } : ex
            ),
        })),
    removeSet: (exerciseId) =>
        set((state) => ({
            exercises: state.exercises.map((ex) =>
                ex.id === exerciseId && (ex.plannedSets || 1) > 1
                    ? { ...ex, plannedSets: (ex.plannedSets || 1) - 1 }
                    : ex
            ),
        })),
    linkSuperset: (exerciseId1, exerciseId2) =>
        set((state) => {
            const supersetId = `superset-${Date.now()}`;
            // Get existing superset group or create new one
            const ex1 = state.exercises.find(ex => ex.id === exerciseId1);
            const ex2 = state.exercises.find(ex => ex.id === exerciseId2);
            const existingGroup = ex1?.supersetGroup || ex2?.supersetGroup || supersetId;

            return {
                exercises: state.exercises.map((ex) =>
                    ex.id === exerciseId1 || ex.id === exerciseId2
                        ? { ...ex, supersetGroup: existingGroup }
                        : ex
                ),
            };
        }),
    unlinkSuperset: (exerciseId) =>
        set((state) => {
            const exercise = state.exercises.find(ex => ex.id === exerciseId);
            const supersetGroup = exercise?.supersetGroup;

            if (!supersetGroup) return state;

            // Remove superset group from all exercises with this group
            return {
                exercises: state.exercises.map((ex) =>
                    ex.supersetGroup === supersetGroup
                        ? { ...ex, supersetGroup: undefined }
                        : ex
                ),
            };
        }),
    loadRoutine: (name, exercises) => set({ name, exercises }),
    resetRoutine: () => set({ name: '', exercises: [] }),
}));
