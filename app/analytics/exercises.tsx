import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';
import { BarChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';

interface ExerciseStats {
    name: string;
    timesUsed: number;
    avgSets: number;
    totalVolume: number;
}

interface MuscleGroupDist {
    group: string;
    count: number;
    percentage: number;
}

export default function ExerciseAnalyticsScreen() {
    const [loading, setLoading] = useState(true);
    const [topExercises, setTopExercises] = useState<ExerciseStats[]>([]);
    const [muscleDistribution, setMuscleDistribution] = useState<MuscleGroupDist[]>([]);
    const [totalExercises, setTotalExercises] = useState(0);
    const [userCreated, setUserCreated] = useState(0);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // 1. Ejercicios más usados
            const { data: exerciseUsage } = await supabase.rpc('get_exercise_usage', {
                p_user_id: user.id
            });

            if (exerciseUsage) {
                setTopExercises(exerciseUsage.slice(0, 10));
            }

            // 2. Distribución por grupo muscular
            const { data: exercises } = await supabase
                .from('exercises')
                .select('muscle_group');

            if (exercises) {
                const distribution: Record<string, number> = {};
                exercises.forEach(ex => {
                    const group = ex.muscle_group || 'Other';
                    distribution[group] = (distribution[group] || 0) + 1;
                });

                const total = exercises.length;
                const dist = Object.entries(distribution).map(([group, count]) => ({
                    group,
                    count,
                    percentage: (count / total) * 100
                })).sort((a, b) => b.count - a.count);

                setMuscleDistribution(dist);
                setTotalExercises(total);
            }

            // 3. Ejercicios creados por el usuario
            const { count } = await supabase
                .from('exercises')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', user.id);

            setUserCreated(count || 0);

        } catch (error) {
            console.error('Error fetching analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    const getMuscleGroupIcon = (group: string) => {
        const icons: Record<string, any> = {
            'Chest': 'body',
            'Back': 'git-pull-request',
            'Legs': 'walk',
            'Shoulders': 'fitness',
            'Arms': 'hand-right',
            'Core': 'layers',
            'Cardio': 'heart',
        };
        return icons[group] || 'barbell';
    };

    const getMuscleGroupColor = (group: string) => {
        const colors: Record<string, string> = {
            'Chest': '#ef4444',
            'Back': '#3b82f6',
            'Legs': '#10b981',
            'Shoulders': '#f59e0b',
            'Arms': '#8b5cf6',
            'Core': '#ec4899',
            'Cardio': '#06b6d4',
        };
        return colors[group] || '#6b7280';
    };

    if (loading) {
        return (
            <View className="flex-1 bg-gray-950 justify-center items-center">
                <Stack.Screen options={{ title: 'Analytics de Ejercicios' }} />
                <ActivityIndicator size="large" color="#3b82f6" />
            </View>
        );
    }

    return (
        <View className="flex-1 bg-gray-950">
            <Stack.Screen options={{ title: 'Analytics de Ejercicios' }} />

            <ScrollView className="flex-1">
                <View className="p-4">
                    {/* Stats Cards */}
                    <View className="flex-row gap-3 mb-6">
                        <View className="flex-1 bg-gray-800 rounded-xl p-4">
                            <Ionicons name="barbell" size={24} color="#3b82f6" />
                            <Text className="text-white text-2xl font-bold mt-2">
                                {totalExercises}
                            </Text>
                            <Text className="text-gray-400 text-sm">Total Ejercicios</Text>
                        </View>

                        <View className="flex-1 bg-gray-800 rounded-xl p-4">
                            <Ionicons name="add-circle" size={24} color="#10b981" />
                            <Text className="text-white text-2xl font-bold mt-2">
                                {userCreated}
                            </Text>
                            <Text className="text-gray-400 text-sm">Creados por Ti</Text>
                        </View>
                    </View>

                    {/* Muscle Group Distribution */}
                    <Text className="text-white text-xl font-bold mb-3">
                        Distribución por Grupo Muscular
                    </Text>

                    <View className="bg-gray-800 rounded-xl p-4 mb-6">
                        {muscleDistribution.map((item, index) => (
                            <View key={index} className="mb-4">
                                <View className="flex-row items-center justify-between mb-2">
                                    <View className="flex-row items-center">
                                        <Ionicons
                                            name={getMuscleGroupIcon(item.group) as any}
                                            size={20}
                                            color={getMuscleGroupColor(item.group)}
                                        />
                                        <Text className="text-white ml-2 font-semibold">
                                            {item.group}
                                        </Text>
                                    </View>
                                    <Text className="text-gray-400">
                                        {item.count} ({item.percentage.toFixed(0)}%)
                                    </Text>
                                </View>

                                {/* Progress bar */}
                                <View className="h-2 bg-gray-700 rounded-full overflow-hidden">
                                    <View
                                        className="h-full rounded-full"
                                        style={{
                                            width: `${item.percentage}%`,
                                            backgroundColor: getMuscleGroupColor(item.group)
                                        }}
                                    />
                                </View>
                            </View>
                        ))}
                    </View>

                    {/* Top Exercises */}
                    {topExercises.length > 0 && (
                        <>
                            <Text className="text-white text-xl font-bold mb-3">
                                Ejercicios Más Usados
                            </Text>

                            <View className="bg-gray-800 rounded-xl overflow-hidden mb-6">
                                {topExercises.map((exercise, index) => (
                                    <View
                                        key={index}
                                        className={`p-4 flex-row items-center justify-between ${index !== topExercises.length - 1 ? 'border-b border-gray-700' : ''
                                            }`}
                                    >
                                        <View className="flex-row items-center flex-1">
                                            <View className="bg-blue-500/20 w-8 h-8 rounded-full items-center justify-center mr-3">
                                                <Text className="text-blue-400 font-bold">
                                                    {index + 1}
                                                </Text>
                                            </View>
                                            <Text className="text-white font-semibold flex-1">
                                                {exercise.name}
                                            </Text>
                                        </View>

                                        <View className="items-end">
                                            <Text className="text-blue-400 font-bold">
                                                {exercise.timesUsed}x
                                            </Text>
                                            <Text className="text-gray-500 text-xs">
                                                {exercise.avgSets.toFixed(1)} sets
                                            </Text>
                                        </View>
                                    </View>
                                ))}
                            </View>
                        </>
                    )}

                    {/* Refresh Button */}
                    <TouchableOpacity
                        onPress={fetchAnalytics}
                        className="bg-blue-500 py-3 rounded-xl flex-row items-center justify-center"
                    >
                        <Ionicons name="refresh" size={20} color="#fff" />
                        <Text className="text-white font-semibold ml-2">
                            Actualizar Analytics
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
}
