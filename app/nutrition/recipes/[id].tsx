import React from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRecipesStore } from '@/store/recipesStore';
import { useNutritionStore } from '@/store/nutritionStore';

export default function RecipeDetailsScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const { getRecipeById, deleteRecipe } = useRecipesStore();
    const { logMeal } = useNutritionStore();

    const recipe = getRecipeById(id!);

    if (!recipe) {
        return (
            <View className="flex-1 bg-gray-900 justify-center items-center">
                <Text className="text-white">Receta no encontrada</Text>
                <TouchableOpacity onPress={() => router.back()} className="mt-4">
                    <Text className="text-blue-400">Volver</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const handleDelete = () => {
        Alert.alert(
            "Eliminar Receta",
            "¿Estás seguro de que quieres eliminar esta receta?",
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Eliminar",
                    style: "destructive",
                    onPress: () => {
                        deleteRecipe(recipe.id);
                        router.back();
                    }
                }
            ]
        );
    };

    const handleLogMeal = () => {
        Alert.alert(
            "Registrar Comida",
            `¿Quieres registrar "${recipe.name}" en tu diario?`,
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Registrar",
                    onPress: () => {
                        logMeal({
                            name: recipe.name,
                            calories: recipe.calories,
                            protein: recipe.protein,
                            carbs: recipe.carbs,
                            fats: recipe.fats,
                            mealType: 'lunch', // Default, user can change later if we add a selector
                            photoUri: recipe.image
                        });
                        Alert.alert("¡Registrado!", "La comida se ha agregado a tu diario.");
                        router.navigate('/(tabs)/nutricion');
                    }
                }
            ]
        );
    };

    return (
        <View className="flex-1 bg-gray-900">
            <ScrollView className="flex-1">
                {/* Image Header */}
                <View className="h-72 relative">
                    {recipe.image ? (
                        <Image source={{ uri: recipe.image }} className="w-full h-full" resizeMode="cover" />
                    ) : (
                        <View className="w-full h-full bg-gray-800 items-center justify-center">
                            <Ionicons name="restaurant" size={64} color="#4b5563" />
                        </View>
                    )}
                    <LinearGradient
                        colors={['rgba(0,0,0,0.6)', 'transparent', 'rgba(0,0,0,0.8)']}
                        className="absolute inset-0 justify-between p-4 pt-12"
                    >
                        <TouchableOpacity
                            onPress={() => router.back()}
                            className="w-10 h-10 items-center justify-center bg-black/30 rounded-full backdrop-blur-md"
                        >
                            <Ionicons name="arrow-back" size={24} color="white" />
                        </TouchableOpacity>

                        <View>
                            {recipe.isAiGenerated && (
                                <View className="self-start bg-purple-600/90 px-3 py-1 rounded-full flex-row items-center mb-2">
                                    <Ionicons name="sparkles" size={12} color="white" />
                                    <Text className="text-white text-xs font-bold ml-1">Generada por IA</Text>
                                </View>
                            )}
                            <Text className="text-white text-3xl font-bold">{recipe.name}</Text>
                        </View>
                    </LinearGradient>
                </View>

                <View className="p-6 -mt-6 bg-gray-900 rounded-t-3xl">
                    {/* Stats */}
                    <View className="flex-row justify-between mb-8 bg-gray-800 p-4 rounded-2xl border border-white/5">
                        <View className="items-center flex-1 border-r border-white/10">
                            <Ionicons name="flame" size={20} color="#f97316" />
                            <Text className="text-white font-bold text-lg mt-1">{recipe.calories}</Text>
                            <Text className="text-gray-400 text-xs">Kcal</Text>
                        </View>
                        <View className="items-center flex-1 border-r border-white/10">
                            <Ionicons name="time" size={20} color="#3b82f6" />
                            <Text className="text-white font-bold text-lg mt-1">{recipe.prepTime}</Text>
                            <Text className="text-gray-400 text-xs">Min</Text>
                        </View>
                        <View className="items-center flex-1">
                            <Ionicons name="people" size={20} color="#10b981" />
                            <Text className="text-white font-bold text-lg mt-1">{recipe.servings}</Text>
                            <Text className="text-gray-400 text-xs">Porciones</Text>
                        </View>
                    </View>

                    {/* Macros */}
                    <Text className="text-white text-lg font-bold mb-4">Macronutrientes</Text>
                    <View className="flex-row gap-3 mb-8">
                        <View className="flex-1 bg-red-500/10 p-3 rounded-xl border border-red-500/20 items-center">
                            <Text className="text-red-400 font-bold text-lg">{recipe.protein}g</Text>
                            <Text className="text-red-400/70 text-xs">Proteína</Text>
                        </View>
                        <View className="flex-1 bg-yellow-500/10 p-3 rounded-xl border border-yellow-500/20 items-center">
                            <Text className="text-yellow-400 font-bold text-lg">{recipe.carbs}g</Text>
                            <Text className="text-yellow-400/70 text-xs">Carbs</Text>
                        </View>
                        <View className="flex-1 bg-blue-500/10 p-3 rounded-xl border border-blue-500/20 items-center">
                            <Text className="text-blue-400 font-bold text-lg">{recipe.fats}g</Text>
                            <Text className="text-blue-400/70 text-xs">Grasas</Text>
                        </View>
                    </View>

                    {/* Ingredients */}
                    <Text className="text-white text-lg font-bold mb-4">Ingredientes</Text>
                    <View className="bg-gray-800 rounded-2xl p-4 mb-8 border border-white/5">
                        {recipe.ingredients.map((ing, index) => (
                            <View key={index} className="flex-row justify-between py-2 border-b border-white/5 last:border-0">
                                <Text className="text-gray-300 flex-1">{ing.name}</Text>
                                <Text className="text-white font-bold">{ing.amount}</Text>
                            </View>
                        ))}
                    </View>

                    {/* Instructions */}
                    <Text className="text-white text-lg font-bold mb-4">Preparación</Text>
                    <View className="gap-4 mb-8">
                        {recipe.instructions.map((step, index) => (
                            <View key={index} className="flex-row gap-4">
                                <View className="w-8 h-8 bg-blue-600/20 rounded-full items-center justify-center border border-blue-500/30">
                                    <Text className="text-blue-400 font-bold">{index + 1}</Text>
                                </View>
                                <Text className="text-gray-300 flex-1 leading-6 pt-1">{step}</Text>
                            </View>
                        ))}
                    </View>

                    {/* Actions */}
                    <TouchableOpacity
                        onPress={handleLogMeal}
                        className="bg-blue-600 py-4 rounded-2xl items-center mb-4 shadow-lg shadow-blue-900/50"
                    >
                        <Text className="text-white font-bold text-lg">Registrar en Diario</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={handleDelete}
                        className="bg-red-500/10 py-4 rounded-2xl items-center border border-red-500/20"
                    >
                        <Text className="text-red-400 font-bold">Eliminar Receta</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
}
