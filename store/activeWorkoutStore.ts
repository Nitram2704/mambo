import { create } from 'zustand';
import { SavedRoutine } from './savedRoutinesStore';
import { CompletedWorkout } from './workoutHistoryStore';

export type SetType = 'warmup' | 'normal' | 'dropset' | 'failure' | 'rest_pause';

export interface WorkoutSet {
    id: string;
    weight: number;
    reps: number;
    rir: number;
    type: SetType;
    completed: boolean;
    isEmpty: boolean; // true if set hasn't been filled with data yet
    note?: string; // Optional note for this specific set
}

export interface ExerciseSession {
    exerciseId: string;
    exerciseName: string;
    muscleGroup: string;
    sets: WorkoutSet[];
    note: string;
    restTime: number; // in seconds
    videoUrl?: string;
    supersetGroup?: string; // ID to group exercises as superset
}

interface ActiveWorkoutState {
    routine: SavedRoutine | null;
    exercises: ExerciseSession[];
    currentExerciseIndex: number;
    startTime: Date | null;

    activeRestTimer: {
        startTime: number | null;
        duration: number;
        isRunning: boolean;
    };
    isFocusMode: boolean;

    startWorkout: (routine: SavedRoutine) => void;
    addSet: (exerciseIndex: number, set: Omit<WorkoutSet, 'id'>) => void;
    updateSet: (exerciseIndex: number, setId: string, values: { weight: number; reps: number; rir: number }) => void;
    updateSetType: (exerciseIndex: number, setId: string, type: SetType) => void;
    addExtraSet: (exerciseIndex: number) => void;
    toggleSetCompletion: (exerciseIndex: number, setId: string) => void;
    updateExerciseNote: (exerciseIndex: number, note: string) => void;
    updateExerciseVideo: (exerciseIndex: number, videoUrl: string) => void;
    updateRestTime: (exerciseIndex: number, seconds: number) => void;
    startRestTimer: (duration: number) => void;
    stopRestTimer: () => void;
    toggleFocusMode: () => void;
    goToNextExercise: () => void;
    goToPreviousExercise: () => void;
    substituteExercise: (exerciseIndex: number, newExercise: any) => void;
    linkSuperset: (exerciseIndex1: number, exerciseIndex2: number) => void;
    unlinkSuperset: (exerciseIndex: number) => void;
    endWorkout: () => Promise<CompletedWorkout | null>;
}

export const useActiveWorkoutStore = create<ActiveWorkoutState>((set, get) => ({
    routine: null,
    exercises: [],
    currentExerciseIndex: 0,
    startTime: null,
    activeRestTimer: {
        startTime: null,
        duration: 0,
        isRunning: false,
    },
    isFocusMode: false,

    startWorkout: (routine) => {
        console.log('Starting workout with routine:', routine);
        set({
            routine,
            startTime: new Date(),
            currentExerciseIndex: 0,
            exercises: routine.exercises.map((ex) => {
                // Pre-create empty sets based on plannedSets
                const plannedSetsCount = ex.plannedSets || 3; // Default to 3 sets if not specified
                const emptySets: WorkoutSet[] = Array.from({ length: plannedSetsCount }, (_, index) => ({
                    id: `${ex.id}-set-${index}-${Date.now()}`,
                    weight: 0,
                    reps: 0,
                    rir: 0,
                    type: (ex as any).plannedSetTypes?.[index] || 'normal',
                    completed: false,
                    isEmpty: true,
                }));

                return {
                    exerciseId: ex.id,
                    exerciseName: ex.name,
                    muscleGroup: ex.muscleGroup,
                    sets: emptySets,
                    note: '',
                    restTime: ex.restTime || 120, // Use saved rest time, default to 120
                    supersetGroup: ex.supersetGroup, // Preserve superset grouping from routine
                };
            }),
            activeRestTimer: { startTime: null, duration: 0, isRunning: false },
        });
    },

    addSet: (exerciseIndex, newSet) =>
        set((state) => {
            const exercises = [...state.exercises];
            const exercise = { ...exercises[exerciseIndex] };
            exercise.sets = [...exercise.sets, {
                ...newSet,
                id: Date.now().toString(),
            }];
            exercises[exerciseIndex] = exercise;
            return { exercises };
        }),

    updateSet: (exerciseIndex, setId, values) =>
        set((state) => {
            const exercises = [...state.exercises];
            const exercise = { ...exercises[exerciseIndex] };
            const setIndex = exercise.sets.findIndex((s) => s.id === setId);
            if (setIndex !== -1) {
                const newSets = [...exercise.sets];
                newSets[setIndex] = {
                    ...newSets[setIndex],
                    ...values,
                    // Clear isEmpty flag when user enters valid data
                    isEmpty: !(values.weight > 0 && values.reps > 0),
                };
                exercise.sets = newSets;
                exercises[exerciseIndex] = exercise;
            }
            return { exercises };
        }),

    updateSetType: (exerciseIndex, setId, type) =>
        set((state) => {
            const exercises = [...state.exercises];
            const exercise = { ...exercises[exerciseIndex] };
            const setIndex = exercise.sets.findIndex((s) => s.id === setId);
            if (setIndex !== -1) {
                const newSets = [...exercise.sets];
                newSets[setIndex] = {
                    ...newSets[setIndex],
                    type,
                };
                exercise.sets = newSets;
                exercises[exerciseIndex] = exercise;
            }
            return { exercises };
        }),

    addExtraSet: (exerciseIndex) =>
        set((state) => {
            const exercises = [...state.exercises];
            const exercise = { ...exercises[exerciseIndex] };

            // Get values from last completed set as defaults
            const lastCompletedSet = [...exercise.sets].reverse().find(s => s.completed && !s.isEmpty);

            const newSet: WorkoutSet = {
                id: `${exercise.exerciseId}-extra-${Date.now()}`,
                weight: lastCompletedSet?.weight || 0,
                reps: lastCompletedSet?.reps || 0,
                rir: lastCompletedSet?.rir || 0,
                type: lastCompletedSet?.type || 'normal',
                completed: false,
                isEmpty: true,
            };

            exercise.sets = [...exercise.sets, newSet];
            exercises[exerciseIndex] = exercise;

            return { exercises };
        }),

    toggleSetCompletion: (exerciseIndex, setId) => {
        const state = get();
        const exercises = [...state.exercises];
        const exercise = { ...exercises[exerciseIndex] };
        const setIndex = exercise.sets.findIndex((s) => s.id === setId);

        if (setIndex !== -1) {
            const currentSet = exercise.sets[setIndex];

            // Don't allow completing empty sets
            if (currentSet.isEmpty) {
                console.log('Cannot complete empty set');
                return;
            }

            const isCompleted = !currentSet.completed;

            // Immutable update
            const newSets = [...exercise.sets];
            newSets[setIndex] = {
                ...currentSet,
                completed: isCompleted
            };

            exercise.sets = newSets;
            exercises[exerciseIndex] = exercise;

            set({ exercises });

            // If marking as complete, start rest timer
            if (isCompleted) {
                const restTime = exercise.restTime || 120;
                get().startRestTimer(restTime);
            }
        }
    },

    updateExerciseNote: (exerciseIndex, note) =>
        set((state) => {
            const exercises = [...state.exercises];
            const exercise = { ...exercises[exerciseIndex] };
            exercise.note = note;
            exercises[exerciseIndex] = exercise;
            return { exercises };
        }),

    updateExerciseVideo: (exerciseIndex, videoUrl) =>
        set((state) => {
            const exercises = [...state.exercises];
            const exercise = { ...exercises[exerciseIndex] };
            exercise.videoUrl = videoUrl;
            exercises[exerciseIndex] = exercise;
            return { exercises };
        }),

    updateRestTime: (exerciseIndex, seconds) =>
        set((state) => {
            const exercises = [...state.exercises];
            const exercise = { ...exercises[exerciseIndex] };
            exercise.restTime = seconds;
            exercises[exerciseIndex] = exercise;
            return { exercises };
        }),

    startRestTimer: (duration) =>
        set({
            activeRestTimer: {
                startTime: Date.now(),
                duration,
                isRunning: true,
            },
        }),

    stopRestTimer: () =>
        set({
            activeRestTimer: {
                startTime: null,
                duration: 0,
                isRunning: false,
            },
        }),

    toggleFocusMode: () => set((state) => ({ isFocusMode: !state.isFocusMode })),

    goToNextExercise: () =>
        set((state) => ({
            currentExerciseIndex: Math.min(state.currentExerciseIndex + 1, state.exercises.length - 1),
        })),

    goToPreviousExercise: () =>
        set((state) => ({
            currentExerciseIndex: Math.max(state.currentExerciseIndex - 1, 0),
        })),

    substituteExercise: (exerciseIndex, newExercise) =>
        set((state) => {
            const exercises = [...state.exercises];
            const oldExercise = exercises[exerciseIndex];

            exercises[exerciseIndex] = {
                ...oldExercise,
                exerciseId: newExercise.id,
                exerciseName: newExercise.name,
                muscleGroup: newExercise.muscle_group || newExercise.muscleGroup,
                // Keep sets but reset them if needed or keep as is
                sets: oldExercise.sets.map(s => ({ ...s, completed: false, isEmpty: true, weight: 0, reps: 0 }))
            };

            return { exercises };
        }),

    linkSuperset: (exerciseIndex1, exerciseIndex2) =>
        set((state) => {
            const exercises = [...state.exercises];
            const supersetId = `superset-${Date.now()}`;

            // Get existing superset group or create new one
            const existingGroup = exercises[exerciseIndex1].supersetGroup ||
                exercises[exerciseIndex2].supersetGroup ||
                supersetId;

            exercises[exerciseIndex1] = { ...exercises[exerciseIndex1], supersetGroup: existingGroup };
            exercises[exerciseIndex2] = { ...exercises[exerciseIndex2], supersetGroup: existingGroup };

            return { exercises };
        }),

    unlinkSuperset: (exerciseIndex) =>
        set((state) => {
            const exercises = [...state.exercises];
            const supersetGroup = exercises[exerciseIndex].supersetGroup;

            if (!supersetGroup) return state;

            // Find all exercises in this superset and remove the group
            exercises.forEach((ex, idx) => {
                if (ex.supersetGroup === supersetGroup) {
                    exercises[idx] = { ...ex, supersetGroup: undefined };
                }
            });

            return { exercises };
        }),

    endWorkout: async () => {
        const state = get();
        if (!state.routine || !state.startTime) return null;

        const endTime = new Date();
        const durationSeconds = Math.floor((endTime.getTime() - state.startTime.getTime()) / 1000);

        // Calculate volume
        let volume = 0;
        state.exercises.forEach(ex => {
            ex.sets.forEach(s => {
                if (s.completed) {
                    volume += s.weight * s.reps;
                }
            });
        });

        const completedWorkout: CompletedWorkout = {
            id: Date.now().toString(),
            routineId: state.routine.id,
            routineName: state.routine.name,
            startTime: state.startTime,
            endTime,
            durationSeconds,
            volume,
            exercises: state.exercises,
        };

        set({
            routine: null,
            exercises: [],
            currentExerciseIndex: 0,
            startTime: null,
            activeRestTimer: { startTime: null, duration: 0, isRunning: false },
        });

        return completedWorkout;
    },
}));
