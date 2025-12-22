import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FoodItem } from '@/data/foodDatabase';

export interface CustomFood extends Omit<FoodItem, 'id'> {
    id: string;
    isCustom: true;
    createdAt: Date;
}

interface CustomFoodsState {
    customFoods: CustomFood[];
    addCustomFood: (food: Omit<CustomFood, 'id' | 'isCustom' | 'createdAt'>) => void;
    updateCustomFood: (id: string, food: Partial<CustomFood>) => void;
    deleteCustomFood: (id: string) => void;
}

export const useCustomFoodsStore = create<CustomFoodsState>()(
    persist(
        (set) => ({
            customFoods: [],
            addCustomFood: (food) =>
                set((state) => ({
                    customFoods: [
                        ...state.customFoods,
                        {
                            ...food,
                            id: `custom-${Date.now()}`,
                            isCustom: true as const,
                            createdAt: new Date(),
                        },
                    ],
                })),
            updateCustomFood: (id, updates) =>
                set((state) => ({
                    customFoods: state.customFoods.map((food) =>
                        food.id === id ? { ...food, ...updates } : food
                    ),
                })),
            deleteCustomFood: (id) =>
                set((state) => ({
                    customFoods: state.customFoods.filter((food) => food.id !== id),
                })),
        }),
        {
            name: 'custom-foods-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
