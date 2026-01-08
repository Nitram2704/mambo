import React, { useEffect, useState } from 'react';
import { View, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useMealPlanStore, Meal } from '@/store/mealPlanStore';
import EditMealModal from '@/components/EditMealModal';
import { AccessibleText } from '@/components/ui/AccessibleText';

export default function MealPlanScreen() {
    const { weeklyPlan, loading, fetchWeeklyPlan, updateDayMeals } = useMealPlanStore();
    const [editingMeal, setEditingMeal] = useState<{ meal: Meal; dayDate: Date } | null>(null);

    useEffect(() => {
        fetchWeeklyPlan();
    }, []);

    const handleEditMeal = (meal: Meal, dayDate: Date) => {
        setEditingMeal({ meal, dayDate });
    };

    const handleSaveMeal = async (updatedMeal: Meal) => {
        if (!editingMeal) return;

        // Find day and update meals
        const day = weeklyPlan.find(d =>
            d.date.toDateString() === editingMeal.dayDate.toDateString()
        );

        if (day) {
            const updatedMeals = day.meals.map(m =>
                m.id === updatedMeal.id ? updatedMeal : m
            );
            await updateDayMeals(editingMeal.dayDate, updatedMeals);
        }

        setEditingMeal(null);
    };

    const handleDeleteMeal = async () => {
        if (!editingMeal) return;

        // Find day and remove meal
        const day = weeklyPlan.find(d =>
            d.date.toDateString() === editingMeal.dayDate.toDateString()
        );

        if (day) {
            const updatedMeals = day.meals.filter(m => m.id !== editingMeal.meal.id);
            await updateDayMeals(editingMeal.dayDate, updatedMeals);
        }

        setEditingMeal(null);
    };

    const getDayName = (date: Date) => {
        const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        return days[date.getDay()];
    };

    const getMealIcon = (type: string) => {
        switch (type) {
            case 'breakfast': return 'cafe';
            case 'lunch': return 'restaurant';
            case 'dinner': return 'moon';
            case 'snack': return 'nutrition';
            default: return 'fast-food';
        }
    };

    const getMealTypeLabel = (type: string) => {
        switch (type) {
            case 'breakfast': return 'Desayuno';
            case 'lunch': return 'Almuerzo';
            case 'dinner': return 'Cena';
            case 'snack': return 'Snack';
            default: return type;
        }
    };

    if (loading) {
        return (
            <View className="flex-1 bg-gray-950 justify-center items-center">
                <Stack.Screen options={{ title: 'Plan de Comidas' }} />
                <ActivityIndicator size="large" color="#3b82f6" />
                <AccessibleText className="text-gray-400 mt-4">Cargando plan...</AccessibleText>
            </View>
        );
    }

    if (weeklyPlan.length === 0) {
        return (
            <View className="flex-1 bg-gray-950 justify-center items-center px-6">
                <Stack.Screen options={{ title: 'Plan de Comidas' }} />
                <Ionicons name="calendar-outline" size={64} color="#6b7280" />
                <AccessibleText variant="h2" weight="bold" className="text-white text-xl font-bold mt-4 text-center">
                    No tienes un plan de comidas
                </AccessibleText>
                <AccessibleText className="text-gray-400 text-center mt-2">
                    Completa el onboarding o crea un plan personalizado
                </AccessibleText>
                <TouchableOpacity
                    onPress={() => fetchWeeklyPlan()}
                    className="bg-blue-500 px-6 py-3 rounded-xl mt-6"
                    accessibilityRole="button"
                    accessibilityLabel="Recargar plan de comidas"
                >
                    <AccessibleText weight="bold" className="text-white font-semibold">Recargar</AccessibleText>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-gray-950">
            <Stack.Screen options={{ title: 'Plan de Comidas Semanal' }} />

            <ScrollView className="flex-1">
                <View className="p-4">
                    <AccessibleText className="text-gray-400 text-sm mb-4">
                        Tu plan personalizado de 7 días
                    </AccessibleText>

                    {weeklyPlan.map((day) => (
                        <View key={day.id} className="mb-6">
                            {/* Día Header */}
                            <View className="flex-row items-center mb-3" accessibilityRole="header">
                                <Ionicons name="calendar" size={20} color="#3b82f6" />
                                <AccessibleText variant="h3" weight="bold" className="text-white text-lg font-bold ml-2">
                                    {getDayName(day.date)}
                                </AccessibleText>
                                <AccessibleText className="text-gray-500 text-sm ml-2">
                                    {day.date.toLocaleDateString('es-ES', {
                                        day: 'numeric',
                                        month: 'short'
                                    })}
                                </AccessibleText>
                            </View>

                            {/* Meals */}
                            <View className="bg-gray-900 rounded-2xl overflow-hidden">
                                {day.meals.map((meal, mealIndex) => {
                                    const isLast = mealIndex === day.meals.length - 1;

                                    return (
                                        <View
                                            key={meal.id}
                                            className={`p-4 ${!isLast ? 'border-b border-gray-800' : ''}`}
                                            accessibilityLabel={`${getMealTypeLabel(meal.type)}: ${meal.name}, ${meal.calories} calorías`}
                                        >
                                            {/* Meal Header */}
                                            <View className="flex-row items-center justify-between mb-2">
                                                <View className="flex-row items-center flex-1">
                                                    <Ionicons
                                                        name={getMealIcon(meal.type) as any}
                                                        size={20}
                                                        color="#9ca3af"
                                                    />
                                                    <AccessibleText weight="semibold" className="text-gray-400 text-sm ml-2 font-semibold">
                                                        {getMealTypeLabel(meal.type)}
                                                    </AccessibleText>
                                                </View>
                                                <View className="flex-row items-center gap-3">
                                                    <AccessibleText weight="bold" className="text-blue-400 text-sm font-bold">
                                                        {meal.calories} kcal
                                                    </AccessibleText>
                                                    <TouchableOpacity
                                                        onPress={() => handleEditMeal(meal, day.date)}
                                                        className="p-1"
                                                        accessibilityRole="button"
                                                        accessibilityLabel={`Editar ${getMealTypeLabel(meal.type)}`}
                                                    >
                                                        <Ionicons name="pencil" size={18} color="#9ca3af" />
                                                    </TouchableOpacity>
                                                </View>
                                            </View>

                                            {/* Meal Name */}
                                            <AccessibleText weight="semibold" className="text-white text-base font-semibold mb-2">
                                                {meal.name}
                                            </AccessibleText>

                                            {/* Macros */}
                                            <View className="flex-row gap-3">
                                                <View className="bg-green-500/20 px-3 py-1 rounded-lg" accessibilityLabel={`Proteína: ${meal.protein} gramos`}>
                                                    <AccessibleText weight="semibold" className="text-green-400 text-xs font-semibold">
                                                        P: {meal.protein}g
                                                    </AccessibleText>
                                                </View>
                                                <View className="bg-blue-500/20 px-3 py-1 rounded-lg" accessibilityLabel={`Carbohidratos: ${meal.carbs} gramos`}>
                                                    <AccessibleText weight="semibold" className="text-blue-400 text-xs font-semibold">
                                                        C: {meal.carbs}g
                                                    </AccessibleText>
                                                </View>
                                                <View className="bg-orange-500/20 px-3 py-1 rounded-lg" accessibilityLabel={`Grasas: ${meal.fat} gramos`}>
                                                    <AccessibleText weight="semibold" className="text-orange-400 text-xs font-semibold">
                                                        G: {meal.fat}g
                                                    </AccessibleText>
                                                </View>
                                            </View>

                                            {/* Prep Time */}
                                            {meal.prepTime && (
                                                <View className="flex-row items-center mt-2" accessibilityLabel={`Tiempo de preparación: ${meal.prepTime}`}>
                                                    <Ionicons name="time-outline" size={14} color="#6b7280" />
                                                    <AccessibleText className="text-gray-500 text-xs ml-1">
                                                        {meal.prepTime}
                                                    </AccessibleText>
                                                </View>
                                            )}

                                            {/* Ingredients (collapsed) */}
                                            {meal.ingredients && meal.ingredients.length > 0 && (
                                                <View className="mt-2" accessibilityLabel={`Ingredientes: ${meal.ingredients.join(', ')}`}>
                                                    <AccessibleText className="text-gray-500 text-xs">
                                                        {meal.ingredients.slice(0, 3).join(', ')}
                                                        {meal.ingredients.length > 3 && '...'}
                                                    </AccessibleText>
                                                </View>
                                            )}
                                        </View>
                                    );
                                })}
                            </View>

                            {/* Daily Totals */}
                            <View className="bg-gray-800/50 rounded-xl p-3 mt-2" accessibilityLabel="Totales diarios">
                                <View className="flex-row justify-around">
                                    <View className="items-center" accessibilityLabel={`Total calorías: ${day.meals.reduce((sum, m) => sum + m.calories, 0)}`}>
                                        <AccessibleText className="text-gray-400 text-xs">Total</AccessibleText>
                                        <AccessibleText weight="bold" className="text-white text-sm font-bold">
                                            {day.meals.reduce((sum, m) => sum + m.calories, 0)} kcal
                                        </AccessibleText>
                                    </View>
                                    <View className="items-center" accessibilityLabel={`Total proteína: ${day.meals.reduce((sum, m) => sum + m.protein, 0)} gramos`}>
                                        <AccessibleText className="text-gray-400 text-xs">Proteína</AccessibleText>
                                        <AccessibleText weight="bold" className="text-green-400 text-sm font-bold">
                                            {day.meals.reduce((sum, m) => sum + m.protein, 0)}g
                                        </AccessibleText>
                                    </View>
                                    <View className="items-center" accessibilityLabel={`Total carbohidratos: ${day.meals.reduce((sum, m) => sum + m.carbs, 0)} gramos`}>
                                        <AccessibleText className="text-gray-400 text-xs">Carbos</AccessibleText>
                                        <AccessibleText weight="bold" className="text-blue-400 text-sm font-bold">
                                            {day.meals.reduce((sum, m) => sum + m.carbs, 0)}g
                                        </AccessibleText>
                                    </View>
                                    <View className="items-center" accessibilityLabel={`Total grasas: ${day.meals.reduce((sum, m) => sum + m.fat, 0)} gramos`}>
                                        <AccessibleText className="text-gray-400 text-xs">Grasas</AccessibleText>
                                        <AccessibleText weight="bold" className="text-orange-400 text-sm font-bold">
                                            {day.meals.reduce((sum, m) => sum + m.fat, 0)}g
                                        </AccessibleText>
                                    </View>
                                </View>
                            </View>
                        </View>
                    ))}
                </View>
            </ScrollView>

            {/* Edit Modal */}
            <EditMealModal
                visible={!!editingMeal}
                meal={editingMeal?.meal || null}
                onSave={handleSaveMeal}
                onDelete={handleDeleteMeal}
                onClose={() => setEditingMeal(null)}
            />
        </View>
    );
}
