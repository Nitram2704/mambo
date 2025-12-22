import React from 'react';
import { View, Text, TouchableOpacity, FlatList, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRecipesStore, Recipe } from '@/store/recipesStore';

export default function RecipesListScreen() {
    const router = useRouter();
    const { recipes } = useRecipesStore();

    const renderRecipeItem = ({ item }: { item: Recipe }) => (
        <TouchableOpacity
            onPress={() => router.push(`/nutrition/recipes/${item.id}`)}
            className="mb-4 rounded-3xl overflow-hidden bg-gray-800 border border-white/10"
        >
            <View className="h-40 bg-gray-700 relative">
                {item.image ? (
                    <Image source={{ uri: item.image }} className="w-full h-full" resizeMode="cover" />
                ) : (
                    <View className="w-full h-full items-center justify-center bg-gray-700">
                        <Ionicons name="restaurant" size={48} color="#4b5563" />
                    </View>
                )}
                <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.8)']}
                    className="absolute bottom-0 left-0 right-0 h-20 justify-end p-4"
                >
                    <Text className="text-white font-bold text-lg">{item.name}</Text>
                    <View className="flex-row items-center mt-1">
                        <Ionicons name="time-outline" size={14} color="#9ca3af" />
                        <Text className="text-gray-400 text-xs ml-1 mr-3">{item.prepTime} min</Text>
                        <Ionicons name="flame-outline" size={14} color="#f97316" />
                        <Text className="text-orange-400 text-xs ml-1">{item.calories} kcal</Text>
                    </View>
                </LinearGradient>
                {item.isAiGenerated && (
                    <View className="absolute top-3 right-3 bg-purple-600/90 px-2 py-1 rounded-lg flex-row items-center">
                        <Ionicons name="sparkles" size={12} color="white" />
                        <Text className="text-white text-[10px] font-bold ml-1">AI</Text>
                    </View>
                )}
            </View>
        </TouchableOpacity>
    );

    return (
        <View className="flex-1 bg-gray-900">
            <SafeAreaView className="flex-1">
                <View className="flex-row items-center justify-between p-4">
                    <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 items-center justify-center bg-gray-800 rounded-full">
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </TouchableOpacity>
                    <Text className="text-white text-xl font-bold">Mis Recetas</Text>
                    <TouchableOpacity
                        onPress={() => router.push('/nutrition/recipes/create')}
                        className="w-10 h-10 items-center justify-center bg-blue-600 rounded-full"
                    >
                        <Ionicons name="add" size={24} color="white" />
                    </TouchableOpacity>
                </View>

                <FlatList
                    data={recipes}
                    renderItem={renderRecipeItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={{ padding: 16 }}
                    ListEmptyComponent={() => (
                        <View className="items-center justify-center py-20">
                            <View className="w-20 h-20 bg-gray-800 rounded-full items-center justify-center mb-4">
                                <Ionicons name="book-outline" size={40} color="#6b7280" />
                            </View>
                            <Text className="text-white font-bold text-lg mb-2">Sin recetas aún</Text>
                            <Text className="text-gray-400 text-center px-10 mb-6">
                                Crea tus propias recetas o pídele a la IA que te sugiera algunas deliciosas.
                            </Text>
                            <TouchableOpacity
                                onPress={() => router.push('/nutrition/recipes/create')}
                                className="bg-blue-600 px-6 py-3 rounded-xl flex-row items-center"
                            >
                                <Ionicons name="sparkles" size={20} color="white" />
                                <Text className="text-white font-bold ml-2">Crear con IA</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                />
            </SafeAreaView>
        </View>
    );
}
