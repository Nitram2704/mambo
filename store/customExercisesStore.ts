import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Exercise } from '@/constants/exercises';

interface CustomExercisesState {
    customExercises: Exercise[];
    addCustomExercise: (exercise: Exercise) => void;
    removeCustomExercise: (id: string) => void;
    getExerciseById: (id: string) => Exercise | undefined;
}

export const useCustomExercisesStore = create<CustomExercisesState>()(
    persist(
        (set, get) => ({
            customExercises: [],
            addCustomExercise: (exercise) =>
                set((state) => ({
                    customExercises: [...state.customExercises, exercise],
                })),
            removeCustomExercise: (id) =>
                set((state) => ({
                    customExercises: state.customExercises.filter((ex) => ex.id !== id),
                })),
            getExerciseById: (id) => get().customExercises.find((ex) => ex.id === id),
        }),
        {
            name: 'custom-exercises-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
