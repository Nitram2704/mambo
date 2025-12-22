import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface MealTemplate {
    id: string;
    name: string;
    foods: {
        foodId: string;
        foodName: string;
        quantity: number;
    }[];
    totalCalories: number;
    totalProtein: number;
    totalCarbs: number;
    totalFats: number;
    createdAt: Date;
}

interface MealTemplateState {
    templates: MealTemplate[];
    addTemplate: (template: Omit<MealTemplate, 'id' | 'createdAt'>) => void;
    deleteTemplate: (id: string) => void;
    getTemplate: (id: string) => MealTemplate | undefined;
}

export const useMealTemplateStore = create<MealTemplateState>()(
    persist(
        (set, get) => ({
            templates: [],

            addTemplate: (template) => {
                const newTemplate: MealTemplate = {
                    ...template,
                    id: Date.now().toString(),
                    createdAt: new Date(),
                };
                set((state) => ({
                    templates: [...state.templates, newTemplate],
                }));
            },

            deleteTemplate: (id) => {
                set((state) => ({
                    templates: state.templates.filter((t) => t.id !== id),
                }));
            },

            getTemplate: (id) => {
                return get().templates.find((t) => t.id === id);
            },
        }),
        {
            name: 'meal-templates-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
