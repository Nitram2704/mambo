import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useGoalsStore, NutritionGoals } from '@/store/goalsStore';
import { useUserProfileStore } from '@/store/userProfileStore';

export default function GoalsScreen() {
    const router = useRouter();
    const { goals, setGoals } = useGoalsStore();
    const { profile } = useUserProfileStore();

    // Initialize with current goals or profile data
    const [dailyCalories, setDailyCalories] = useState((goals?.dailyCalories || profile?.calorieGoal || 2500).toString());
    const [dailyProtein, setDailyProtein] = useState((goals?.dailyProtein || profile?.proteinGoal || 150).toString());
    const [dailyCarbs, setDailyCarbs] = useState((goals?.dailyCarbs || profile?.carbsGoal || 250).toString());
    const [dailyFats, setDailyFats] = useState((goals?.dailyFats || profile?.fatsGoal || 80).toString());
    const [weeklyWorkouts, setWeeklyWorkouts] = useState((goals?.weeklyWorkouts || 4).toString());
    const [weeklyWorkoutMinutes, setWeeklyWorkoutMinutes] = useState((goals?.weeklyWorkoutMinutes || 180).toString());

    const handleSave = () => {
        const newGoals: NutritionGoals = {
            dailyCalories: parseInt(dailyCalories) || 0,
            dailyProtein: parseFloat(dailyProtein) || 0,
            dailyCarbs: parseFloat(dailyCarbs) || 0,
            dailyFats: parseFloat(dailyFats) || 0,
            weeklyWorkouts: parseInt(weeklyWorkouts) || 0,
            weeklyWorkoutMinutes: parseInt(weeklyWorkoutMinutes) || 0,
        };

        setGoals(newGoals);
        Alert.alert('¡Guardado!', 'Tus metas han sido actualizadas', [
            { text: 'OK', onPress: () => router.back() }
        ]);
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-900">
            {/* Header */}
            <View className="flex-row items-center justify-between p-4 border-b border-gray-800">
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <Text className="text-white text-xl font-bold">Establecer Metas</Text>
                <TouchableOpacity onPress={handleSave}>
                    <Text className="text-orange-500 text-lg font-bold">Guardar</Text>
                </TouchableOpacity>
            </View>

            <ScrollView className="flex-1 p-4">
                {/* Nutrition Goals */}
                <View className="bg-gray-800 rounded-xl p-4 mb-6 border border-gray-700">
                    <View className="flex-row items-center mb-4">
                        <Ionicons name="nutrition" size={24} color="#ea580c" />
                        <Text className="text-white text-lg font-bold ml-2">Metas Nutricionales (Diarias)</Text>
                    </View>

                    <View className="mb-4">
                        <Text className="text-gray-400 text-sm mb-2">Calorías</Text>
                        <TextInput
                            className="bg-gray-700 text-white p-3 rounded-lg text-lg border border-gray-600"
                            placeholder="2500"
                            placeholderTextColor="#6b7280"
                            keyboardType="number-pad"
                            value={dailyCalories}
                            onChangeText={setDailyCalories}
                        />
                    </View>

                    <View className="mb-4">
                        <Text className="text-gray-400 text-sm mb-2">Proteína (g)</Text>
                        <TextInput
                            className="bg-gray-700 text-white p-3 rounded-lg text-lg border border-gray-600"
                            placeholder="150"
                            placeholderTextColor="#6b7280"
                            keyboardType="decimal-pad"
                            value={dailyProtein}
                            onChangeText={setDailyProtein}
                        />
                    </View>

                    <View className="mb-4">
                        <Text className="text-gray-400 text-sm mb-2">Carbohidratos (g)</Text>
                        <TextInput
                            className="bg-gray-700 text-white p-3 rounded-lg text-lg border border-gray-600"
                            placeholder="250"
                            placeholderTextColor="#6b7280"
                            keyboardType="decimal-pad"
                            value={dailyCarbs}
                            onChangeText={setDailyCarbs}
                        />
                    </View>

                    <View>
                        <Text className="text-gray-400 text-sm mb-2">Grasas (g)</Text>
                        <TextInput
                            className="bg-gray-700 text-white p-3 rounded-lg text-lg border border-gray-600"
                            placeholder="80"
                            placeholderTextColor="#6b7280"
                            keyboardType="decimal-pad"
                            value={dailyFats}
                            onChangeText={setDailyFats}
                        />
                    </View>
                </View>

                {/* Workout Goals */}
                <View className="bg-gray-800 rounded-xl p-4 mb-6 border border-gray-700">
                    <View className="flex-row items-center mb-4">
                        <Ionicons name="barbell" size={24} color="#22c55e" />
                        <Text className="text-white text-lg font-bold ml-2">Metas de Entrenamiento (Semanales)</Text>
                    </View>

                    <View className="mb-4">
                        <Text className="text-gray-400 text-sm mb-2">Número de Entrenamientos</Text>
                        <TextInput
                            className="bg-gray-700 text-white p-3 rounded-lg text-lg border border-gray-600"
                            placeholder="4"
                            placeholderTextColor="#6b7280"
                            keyboardType="number-pad"
                            value={weeklyWorkouts}
                            onChangeText={setWeeklyWorkouts}
                        />
                    </View>

                    <View>
                        <Text className="text-gray-400 text-sm mb-2">Minutos Totales</Text>
                        <TextInput
                            className="bg-gray-700 text-white p-3 rounded-lg text-lg border border-gray-600"
                            placeholder="180"
                            placeholderTextColor="#6b7280"
                            keyboardType="number-pad"
                            value={weeklyWorkoutMinutes}
                            onChangeText={setWeeklyWorkoutMinutes}
                        />
                    </View>
                </View>

                {/* Tips */}
                <View className="bg-blue-900/20 rounded-xl p-4 border border-blue-700">
                    <View className="flex-row items-center mb-2">
                        <Ionicons name="information-circle" size={20} color="#3b82f6" />
                        <Text className="text-blue-400 font-bold ml-2">Consejo</Text>
                    </View>
                    <Text className="text-blue-300 text-sm">
                        Establece metas realistas y alcanzables. Puedes ajustarlas en cualquier momento según tu progreso.
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
