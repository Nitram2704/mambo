import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/lib/supabase';
import { EXERCISES } from '@/constants/exercises';
import { SavedRoutine, Exercise } from '@/types/schema';
export type { SavedRoutine };

// Helper type for DB response
type RoutineDBResponse = {
    id: string;
    name: string;
    created_at: string;
    schedule_type?: 'specific_days' | 'interval' | null;
    schedule_days?: number[];
    schedule_interval?: number;
    schedule_start_date?: string;
    routine_exercises: {
        exercise_id: string;
        order: number;
        planned_sets: number;
        planned_set_types?: string[];
        rest_time: number;
        exercises: {
            name: string;
            muscle_group: string;
            equipment: string;
        } | null;
    }[];
};

interface SavedRoutinesState {
    routines: SavedRoutine[];
    loading: boolean;
    fetchRoutines: () => Promise<void>;
    addRoutine: (
        name: string,
        exercises: Exercise[],
        schedule?: {
            type: 'specific_days' | 'interval';
            days?: number[];
            interval?: number;
            startDate?: string;
        }
    ) => Promise<string | null>;
    deleteRoutine: (id: string) => Promise<void>;
    updateRoutine: (id: string, updates: Partial<SavedRoutine>) => Promise<void>;
    duplicateRoutine: (id: string) => Promise<void>;
    clearRoutines: () => void;
}

export const useSavedRoutinesStore = create<SavedRoutinesState>()(
    persist(
        (set, get) => ({
            routines: [],
            loading: false,

            fetchRoutines: async () => {
                set({ loading: true });
                try {
                    const { data: { user } } = await supabase.auth.getUser();
                    if (!user) {
                        set({ routines: [], loading: false });
                        return;
                    }

                    const { data, error } = await supabase
                        .from('routines')
                        .select(`
                    *,
                    routine_exercises (
                        exercise_id,
                        "order",
                        planned_sets,
                        planned_set_types,
                        rest_time,
                        exercises:exercises (
                            name,
                            muscle_group,
                            equipment
                        )
                    )
                `)
                        .order('created_at', { ascending: false });

                    if (error) throw error;

                    if (data) {
                        const formattedRoutines: SavedRoutine[] = (data as any[]).map((r: any) => {
                            // Sort exercises by order
                            const sortedExercises = (r.routine_exercises || []).sort((a: any, b: any) => a.order - b.order);

                            // Map to Exercise objects using DB data
                            const exercises = sortedExercises.map((re: any) => {
                                const dbEx = re.exercises;
                                if (!dbEx) {
                                    // Fallback to local constant if not in DB (for legacy or dev data)
                                    const localEx = EXERCISES.find(e => e.id === re.exercise_id);
                                    if (localEx) {
                                        return {
                                            id: localEx.id,
                                            name: localEx.name,
                                            muscleGroup: localEx.muscleGroup,
                                            equipment: localEx.equipment as any,
                                            plannedSets: re.planned_sets,
                                            plannedSetTypes: re.planned_set_types || Array(re.planned_sets).fill('normal'),
                                            restTime: re.rest_time
                                        } as Exercise;
                                    }
                                    return null;
                                }

                                return {
                                    id: re.exercise_id,
                                    name: dbEx.name,
                                    muscleGroup: dbEx.muscle_group as any,
                                    equipment: dbEx.equipment as any,
                                    plannedSets: re.planned_sets,
                                    plannedSetTypes: re.planned_set_types || Array(re.planned_sets).fill('normal'),
                                    restTime: re.rest_time
                                } as Exercise;
                            }).filter(Boolean) as Exercise[];

                            return {
                                id: r.id,
                                name: r.name,
                                createdAt: r.created_at, // Use string directly
                                exercises,
                                scheduleType: r.schedule_type,
                                scheduleDays: r.schedule_days,
                                scheduleInterval: r.schedule_interval,
                                scheduleStartDate: r.schedule_start_date
                            };
                        });

                        set({ routines: formattedRoutines });
                    }
                } catch (e) {
                    console.error('Error fetching routines:', e);
                } finally {
                    set({ loading: false });
                }
            },

            addRoutine: async (name, exercises, schedule) => {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return null;

                try {
                    // 1. Create Routine
                    const { data: routineData, error: routineError } = await supabase
                        .from('routines')
                        .insert({
                            user_id: user.id,
                            name,
                            schedule_type: schedule?.type,
                            schedule_days: schedule?.days,
                            schedule_interval: schedule?.interval,
                            schedule_start_date: schedule?.startDate
                        })
                        .select()
                        .single();

                    if (routineError) throw routineError;

                    // 2. Create Routine Exercises
                    // Map exercises to DB IDs if they are not already UUIDs
                    const { processWorkoutExercises } = await import('@/utils/exerciseMapper');
                    const exercisesToMap = exercises.map(ex => ({
                        name: ex.name,
                        sets: ex.plannedSets || 3,
                        reps: '10', // Default
                        rest: ex.restTime || 120
                    }));

                    const mappedExercises = await processWorkoutExercises(exercisesToMap, user.id);

                    console.log(`📊 Mapping results: ${mappedExercises.length}/${exercises.length} exercises mapped`);

                    // Use mapped exercises if available, otherwise throw error
                    if (mappedExercises.length === 0) {
                        throw new Error('No se pudieron identificar los ejercicios en la base de datos. Por favor, verifica los nombres.');
                    }

                    const finalExercises = mappedExercises;

                    const routineExercises = finalExercises.map((ex, index) => ({
                        routine_id: routineData.id,
                        exercise_id: ex.id,
                        order: index,
                        planned_sets: ex.plannedSets || 3,
                        planned_set_types: (ex as any).plannedSetTypes || Array(ex.plannedSets || 3).fill('normal'),
                        rest_time: ex.restTime || 120
                    }));

                    const { error: exercisesError } = await supabase
                        .from('routine_exercises')
                        .insert(routineExercises);

                    if (exercisesError) throw exercisesError;

                    // Refresh routines
                    await get().fetchRoutines();

                    // Trigger schedule generation
                    const { generateScheduledWorkouts } = require('./weeklyScheduleStore').useWeeklyScheduleStore.getState();
                    generateScheduledWorkouts(get().routines);

                    return routineData.id;

                } catch (e) {
                    console.error('Error adding routine:', e);
                    return null;
                }
            },

            deleteRoutine: async (id) => {
                // Optimistic
                set(state => ({ routines: state.routines.filter(r => r.id !== id) }));

                const { error } = await supabase
                    .from('routines')
                    .delete()
                    .eq('id', id);

                if (error) {
                    console.error('Error deleting routine:', error);
                    get().fetchRoutines(); // Revert on error
                }
            },

            updateRoutine: async (id, updates) => {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;

                try {
                    // Update Schedule fields
                    const scheduleUpdates: any = {};
                    if (updates.scheduleType !== undefined) scheduleUpdates.schedule_type = updates.scheduleType;
                    if (updates.scheduleDays !== undefined) scheduleUpdates.schedule_days = updates.scheduleDays;
                    if (updates.scheduleInterval !== undefined) scheduleUpdates.schedule_interval = updates.scheduleInterval;
                    if (updates.scheduleStartDate !== undefined) scheduleUpdates.schedule_start_date = updates.scheduleStartDate;

                    if (Object.keys(scheduleUpdates).length > 0) {
                        await supabase.from('routines').update(scheduleUpdates).eq('id', id);
                    }

                    if (updates.name) {
                        await supabase.from('routines').update({ name: updates.name }).eq('id', id);
                    }

                    if (updates.exercises) {
                        // Delete existing exercises
                        await supabase.from('routine_exercises').delete().eq('routine_id', id);

                        // Map exercises to DB IDs
                        const { processWorkoutExercises } = await import('@/utils/exerciseMapper');
                        const exercisesToMap = updates.exercises.map(ex => ({
                            name: ex.name,
                            sets: ex.plannedSets || 3,
                            reps: '10', // Default
                            rest: ex.restTime || 120
                        }));

                        const mappedExercises = await processWorkoutExercises(exercisesToMap, user.id);
                        const finalExercises = mappedExercises.length > 0 ? mappedExercises : updates.exercises;

                        // Insert new ones
                        const routineExercises = finalExercises.map((ex, index) => ({
                            routine_id: id,
                            exercise_id: ex.id,
                            order: index,
                            planned_sets: ex.plannedSets || 3,
                            planned_set_types: (ex as any).plannedSetTypes || Array(ex.plannedSets || 3).fill('normal'),
                            rest_time: ex.restTime || 120
                        }));

                        await supabase.from('routine_exercises').insert(routineExercises);
                    }

                    // Refresh routines and regenerate schedule
                    await get().fetchRoutines();
                    const { generateScheduledWorkouts } = require('./weeklyScheduleStore').useWeeklyScheduleStore.getState();
                    generateScheduledWorkouts(get().routines);

                } catch (e) {
                    console.error('Error updating routine:', e);
                }
            },

            duplicateRoutine: async (id) => {
                const routineToCopy = get().routines.find(r => r.id === id);
                if (!routineToCopy) return;

                await get().addRoutine(
                    `${routineToCopy.name} (Copia)`,
                    routineToCopy.exercises,
                    routineToCopy.scheduleType ? {
                        type: routineToCopy.scheduleType,
                        days: routineToCopy.scheduleDays,
                        interval: routineToCopy.scheduleInterval,
                        startDate: routineToCopy.scheduleStartDate
                    } : undefined
                );
            },

            clearRoutines: () => set({ routines: [], loading: false }),
        }),
        {
            name: 'saved-routines-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
