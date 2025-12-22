import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useMealPlanStore } from './mealPlanStore';

export interface ShoppingItem {
    id: string;
    name: string;
    category: 'protein' | 'carbs' | 'fats' | 'vegetables' | 'dairy' | 'fruits' | 'pantry' | 'other';
    checked: boolean;
    quantity?: string; // e.g., "500g", "2 units" - hard to aggregate perfectly without structured data
}

interface ShoppingListState {
    items: ShoppingItem[];
    generateFromMealPlan: () => void;
    toggleItem: (id: string) => void;
    addItem: (name: string, category?: ShoppingItem['category']) => void;
    deleteItem: (id: string) => void;
    clearChecked: () => void;
    clearAll: () => void;
}

// Helper to categorize ingredients (simple keyword matching)
const categorizeIngredient = (name: string): ShoppingItem['category'] => {
    const lower = name.toLowerCase();
    if (lower.match(/pollo|carne|res|cerdo|pescado|atun|huevo|pavo|salmon|tilapia/)) return 'protein';
    if (lower.match(/arroz|pasta|pan|avena|papa|yuca|platano|maiz|quinoa/)) return 'carbs';
    if (lower.match(/aceite|aguacate|mani|almendra|nuez|chia|mantequilla/)) return 'fats';
    if (lower.match(/leche|yogur|queso|suero/)) return 'dairy';
    if (lower.match(/manzana|banano|fresa|uva|piña|mango|papaya/)) return 'fruits';
    if (lower.match(/tomate|cebolla|lechuga|espinaca|brocoli|zanahoria|pepino/)) return 'vegetables';
    if (lower.match(/sal|pimienta|azucar|harina|salsa|condimento/)) return 'pantry';
    return 'other';
};

export const useShoppingListStore = create<ShoppingListState>()(
    persist(
        (set, get) => ({
            items: [],

            generateFromMealPlan: () => {
                const { weeklyPlan } = useMealPlanStore.getState();
                const newItems: ShoppingItem[] = [];
                const existingNames = new Set<string>();

                // Iterate through all meals in the plan
                weeklyPlan.forEach(day => {
                    day.meals.forEach(meal => {
                        if (meal.ingredients) {
                            meal.ingredients.forEach(ing => {
                                // Simple normalization: lowercase and trim
                                const normalizedName = ing.toLowerCase().trim();

                                if (!existingNames.has(normalizedName)) {
                                    existingNames.add(normalizedName);
                                    newItems.push({
                                        id: `item-${Date.now()}-${Math.random()}`,
                                        name: ing, // Keep original casing for display
                                        category: categorizeIngredient(ing),
                                        checked: false,
                                    });
                                }
                            });
                        }
                    });
                });

                // Merge with existing items (keep existing checked state if possible, or just append?)
                // Strategy: Replace list but warn user? Or just append unique new ones?
                // Let's append unique new ones to avoid deleting user's manual items.

                const currentItems = get().items;
                const currentNames = new Set(currentItems.map(i => i.name.toLowerCase().trim()));

                const itemsToAdd = newItems.filter(i => !currentNames.has(i.name.toLowerCase().trim()));

                if (itemsToAdd.length === 0) return;

                set({ items: [...currentItems, ...itemsToAdd] });
            },

            toggleItem: (id) =>
                set((state) => ({
                    items: state.items.map((item) =>
                        item.id === id ? { ...item, checked: !item.checked } : item
                    ),
                })),

            addItem: (name, category = 'other') =>
                set((state) => ({
                    items: [
                        ...state.items,
                        {
                            id: `manual-${Date.now()}`,
                            name,
                            category: category === 'other' ? categorizeIngredient(name) : category,
                            checked: false,
                        },
                    ],
                })),

            deleteItem: (id) =>
                set((state) => ({
                    items: state.items.filter((item) => item.id !== id),
                })),

            clearChecked: () =>
                set((state) => ({
                    items: state.items.filter((item) => !item.checked),
                })),

            clearAll: () => set({ items: [] }),
        }),
        {
            name: 'shopping-list-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
