import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface FavoriteFoodsState {
    favoriteFoodIds: string[];
    toggleFavorite: (foodId: string) => void;
    isFavorite: (foodId: string) => boolean;
}

export const useFavoriteFoodsStore = create<FavoriteFoodsState>()(
    persist(
        (set, get) => ({
            favoriteFoodIds: [],
            toggleFavorite: (foodId) =>
                set((state) => ({
                    favoriteFoodIds: state.favoriteFoodIds.includes(foodId)
                        ? state.favoriteFoodIds.filter((id) => id !== foodId)
                        : [...state.favoriteFoodIds, foodId],
                })),
            isFavorite: (foodId) => get().favoriteFoodIds.includes(foodId),
        }),
        {
            name: 'favorite-foods-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
