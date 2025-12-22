import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { ExerciseSession, WorkoutSet } from './activeWorkoutStore';

export interface CompletedWorkout {
    id: string;
    routineId: string | null;
    routineName: string;
    startTime: Date;
    endTime: Date;
    durationSeconds: number;
    volume: number;
    exercises: ExerciseSession[];
}

interface WorkoutHistoryState {
    workouts: CompletedWorkout[];
    loading: boolean;
    fetchWorkouts: () => Promise<void>;
    addWorkout: (workout: CompletedWorkout) => Promise<string | null>; // FIXED: Return Supabase ID
    clearHistory: () => void;
}

export const useWorkoutHistoryStore = create<WorkoutHistoryState>((set, get) => ({
    workouts: [],
    loading: false,

    fetchWorkouts: async () => {
        set({ loading: true });
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                set({ workouts: [], loading: false });
                return;
            }

            const { data, error } = await supabase
                .from('workouts')
                .select(`
                    *,
                    workout_exercises (
                        id,
                        exercise_id,
                        exercise_name,
                        muscle_group,
                        note,
                        rest_time,
                        workout_sets (
                            id,
                            weight,
                            reps,
                            rir,
                            completed
                        )
                    )
                `)
                .order('start_time', { ascending: false });

            if (error) throw error;

            if (data) {
                const formattedWorkouts: CompletedWorkout[] = data.map((w: any) => {
                    const exercises: ExerciseSession[] = w.workout_exercises.map((we: any) => {
                        const sets: WorkoutSet[] = we.workout_sets.map((ws: any) => ({
                            id: ws.id,
                            weight: ws.weight,
                            reps: ws.reps,
                            rir: ws.rir,
                            type: ws.set_type || 'normal',
                            completed: ws.completed,
                            isEmpty: false // History sets are never empty
                        }));

                        return {
                            exerciseId: we.exercise_id,
                            exerciseName: we.exercise_name,
                            muscleGroup: we.muscle_group,
                            note: we.note || '',
                            restTime: we.rest_time || 120,
                            sets
                        };
                    });

                    return {
                        id: w.id,
                        routineId: w.routine_id,
                        routineName: w.routine_name,
                        startTime: new Date(w.start_time),
                        endTime: new Date(w.end_time),
                        durationSeconds: w.duration_seconds,
                        volume: w.volume,
                        exercises
                    };
                });

                set({ workouts: formattedWorkouts });
            }
        } catch (e) {
            console.error('Error fetching history:', e);
        } finally {
            set({ loading: false });
        }
    },

    addWorkout: async (workout) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return null;

        try {
            // 1. Create Workout
            const { data: workoutData, error: workoutError } = await supabase
                .from('workouts')
                .insert({
                    user_id: user.id,
                    routine_id: workout.routineId,
                    routine_name: workout.routineName,
                    start_time: workout.startTime,
                    end_time: workout.endTime,
                    duration_seconds: workout.durationSeconds,
                    volume: workout.volume
                })
                .select()
                .single();

            if (workoutError) throw workoutError;

            // FIXED: Store Supabase ID to return later
            const supabaseWorkoutId = workoutData.id;

            // 2. Create Exercises and Sets
            // We need to do this sequentially or carefully to get IDs
            for (const ex of workout.exercises) {
                const { data: exerciseData, error: exerciseError } = await supabase
                    .from('workout_exercises')
                    .insert({
                        workout_id: workoutData.id,
                        exercise_id: ex.exerciseId,
                        exercise_name: ex.exerciseName,
                        muscle_group: ex.muscleGroup,
                        note: ex.note,
                        rest_time: ex.restTime,
                        video_url: ex.videoUrl
                    })
                    .select()
                    .single();

                if (exerciseError) throw exerciseError;

                const setsToInsert = ex.sets.map(s => ({
                    workout_exercise_id: exerciseData.id,
                    weight: s.weight,
                    reps: s.reps,
                    rir: s.rir,
                    set_type: s.type || 'normal',
                    completed: s.completed
                }));

                const { error: setsError } = await supabase
                    .from('workout_sets')
                    .insert(setsToInsert);

                if (setsError) throw setsError;
            }

            // Refresh history and wait for it
            await get().fetchWorkouts();

            // FIXED: Return the Supabase-generated ID
            return supabaseWorkoutId;

        } catch (e) {
            console.error('Error saving workout:', e);
            return null;
        }
    },

    clearHistory: () => set({ workouts: [] }),
}));
