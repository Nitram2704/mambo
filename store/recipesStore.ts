import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Ingredient {
    name: string;
    amount: string; // e.g., "100g", "1 cup"
}

export interface Recipe {
    id: string;
    name: string;
    description?: string;
    ingredients: Ingredient[];
    instructions: string[];
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    prepTime: number; // minutes
    servings: number;
    difficulty: 'easy' | 'medium' | 'hard';
    tags: string[]; // e.g., "keto", "vegan", "breakfast"
    image?: string;
    isAiGenerated?: boolean;
    createdAt: Date;
}

interface RecipesState {
    recipes: Recipe[];
    addRecipe: (recipe: Omit<Recipe, 'id' | 'createdAt'>) => void;
    updateRecipe: (id: string, updates: Partial<Recipe>) => void;
    deleteRecipe: (id: string) => void;
    getRecipeById: (id: string) => Recipe | undefined;
}

export const useRecipesStore = create<RecipesState>()(
    persist(
        (set, get) => ({
            recipes: [],

            addRecipe: (recipe) =>
                set((state) => ({
                    recipes: [
                        {
                            ...recipe,
                            id: `recipe-${Date.now()}`,
                            createdAt: new Date(),
                        },
                        ...state.recipes,
                    ],
                })),

            updateRecipe: (id, updates) =>
                set((state) => ({
                    recipes: state.recipes.map((r) =>
                        r.id === id ? { ...r, ...updates } : r
                    ),
                })),

            deleteRecipe: (id) =>
                set((state) => ({
                    recipes: state.recipes.filter((r) => r.id !== id),
                })),

            getRecipeById: (id) => get().recipes.find((r) => r.id === id),
        }),
        {
            name: 'recipes-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
