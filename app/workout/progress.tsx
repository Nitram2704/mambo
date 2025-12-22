import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useWorkoutHistoryStore } from '@/store/workoutHistoryStore';
import WorkoutVolumeChart from '@/components/WorkoutVolumeChart';

export default function WorkoutProgressScreen() {
    const router = useRouter();
    const { workouts } = useWorkoutHistoryStore();

    // Calculate weekly volumes for last 7 weeks
    const getWeeklyVolumes = () => {
        const weeklyData: { weekStart: Date; volume: number; label: string }[] = [];
        const today = new Date();

        for (let i = 6; i >= 0; i--) {
            const weekStart = new Date(today);
            weekStart.setDate(today.getDate() - (i * 7 + today.getDay()));
            weekStart.setHours(0, 0, 0, 0);

            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekStart.getDate() + 6);
            weekEnd.setHours(23, 59, 59, 999);

            const weekWorkouts = workouts.filter(w => {
                const workoutDate = new Date(w.startTime);
                return workoutDate >= weekStart && workoutDate <= weekEnd;
            });

            const totalVolume = weekWorkouts.reduce((sum, w) => sum + w.volume, 0);

            const label = `${weekStart.getDate()}/${weekStart.getMonth() + 1}`;

            weeklyData.push({ weekStart, volume: totalVolume, label });
        }

        return weeklyData;
    };

    // Get top exercises by total volume
    const getTopExercises = () => {
        const exerciseVolumes: Record<string, number> = {};

        workouts.forEach(workout => {
            workout.exercises.forEach(exercise => {
                const volume = exercise.sets.reduce((sum, set) =>
                    sum + (set.weight * set.reps), 0
                );

                if (exerciseVolumes[exercise.exerciseName]) {
                    exerciseVolumes[exercise.exerciseName] += volume;
                } else {
                    exerciseVolumes[exercise.exerciseName] = volume;
                }
            });
        });

        return Object.entries(exerciseVolumes)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .map(([name, volume]) => ({ name, volume }));
    };

    const weeklyData = getWeeklyVolumes();
    const topExercises = getTopExercises();

    const totalWorkouts = workouts.length;
    const totalVolume = workouts.reduce((sum, w) => sum + w.volume, 0);
    const avgVolume = totalWorkouts > 0 ? Math.round(totalVolume / totalWorkouts) : 0;

    return (
        <SafeAreaView className="flex-1 bg-gray-900">
            {/* Header */}
            <View className="flex-row items-center justify-between p-4 border-b border-gray-800">
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <Text className="text-white text-xl font-bold">Progreso de Entrenamientos</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView className="flex-1 p-4">
                {/* Stats Cards */}
                <View className="flex-row gap-4 mb-6">
                    <View className="flex-1 bg-gray-800 rounded-xl p-4 border border-gray-700">
                        <Text className="text-gray-400 text-xs mb-1">Total Entrenos</Text>
                        <Text className="text-white text-2xl font-bold">{totalWorkouts}</Text>
                    </View>
                    <View className="flex-1 bg-gray-800 rounded-xl p-4 border border-gray-700">
                        <Text className="text-gray-400 text-xs mb-1">Volumen Total</Text>
                        <Text className="text-white text-2xl font-bold">{totalVolume.toLocaleString()}</Text>
                        <Text className="text-gray-500 text-xs">kg</Text>
                    </View>
                    <View className="flex-1 bg-gray-800 rounded-xl p-4 border border-gray-700">
                        <Text className="text-gray-400 text-xs mb-1">Promedio</Text>
                        <Text className="text-white text-2xl font-bold">{avgVolume}</Text>
                        <Text className="text-gray-500 text-xs">kg/sesión</Text>
                    </View>
                </View>

                {/* Volume Chart */}
                <View className="bg-gray-800 rounded-xl p-4 mb-6 border border-gray-700">
                    <Text className="text-white font-bold text-lg mb-2">Volumen Semanal</Text>
                    <Text className="text-gray-400 text-sm mb-4">Últimas 7 semanas</Text>
                    {weeklyData.some(w => w.volume > 0) ? (
                        <WorkoutVolumeChart
                            weeklyVolumes={weeklyData.map(w => w.volume)}
                            labels={weeklyData.map(w => w.label)}
                        />
                    ) : (
                        <View className="py-8 items-center">
                            <Ionicons name="barbell-outline" size={48} color="#4b5563" />
                            <Text className="text-gray-500 mt-4">Completa entrenamientos para ver tu progreso</Text>
                        </View>
                    )}
                </View>

                {/* Top Exercises */}
                <View className="bg-gray-800 rounded-xl p-4 mb-8 border border-gray-700">
                    <Text className="text-white font-bold text-lg mb-4">Top Ejercicios por Volumen</Text>
                    {topExercises.length > 0 ? (
                        topExercises.map((exercise, index) => (
                            <View key={exercise.name} className="flex-row items-center justify-between py-3 border-b border-gray-700 last:border-b-0">
                                <View className="flex-row items-center flex-1">
                                    <View className="w-8 h-8 rounded-full bg-orange-500/20 items-center justify-center mr-3">
                                        <Text className="text-orange-400 font-bold">{index + 1}</Text>
                                    </View>
                                    <Text className="text-white font-medium flex-1">{exercise.name}</Text>
                                </View>
                                <Text className="text-orange-400 font-bold">{exercise.volume.toLocaleString()} kg</Text>
                            </View>
                        ))
                    ) : (
                        <Text className="text-gray-500 text-center py-4">Sin datos aún</Text>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
