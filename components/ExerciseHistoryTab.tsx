import React, { useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useWorkoutHistoryStore } from '@/store/workoutHistoryStore';
import Animated, { FadeInUp } from 'react-native-reanimated';

interface ExerciseHistoryTabProps {
    exerciseId: string;
    exerciseName: string;
}

interface ExerciseHistoryItem {
    date: string;
    workoutName: string;
    sets: Array<{
        weight: number;
        reps: number;
        completed: boolean;
    }>;
    volume: number; // total weight lifted
    maxWeight: number;
    totalReps: number;
}

export function ExerciseHistoryTab({ exerciseId, exerciseName }: ExerciseHistoryTabProps) {
    const { workouts } = useWorkoutHistoryStore();

    const exerciseHistory = useMemo(() => {
        const history: ExerciseHistoryItem[] = [];

        workouts.forEach(workout => {
            const exerciseSession = workout.exercises.find(ex => ex.exerciseId === exerciseId);
            if (exerciseSession && exerciseSession.sets.length > 0) {
                const completedSets = exerciseSession.sets.filter(set => set.completed);

                if (completedSets.length > 0) {
                    const volume = completedSets.reduce((sum, set) => sum + (set.weight * set.reps), 0);
                    const maxWeight = Math.max(...completedSets.map(set => set.weight));
                    const totalReps = completedSets.reduce((sum, set) => sum + set.reps, 0);

                    history.push({
                        date: workout.startTime.toISOString().split('T')[0],
                        workoutName: workout.routineName,
                        sets: completedSets,
                        volume,
                        maxWeight,
                        totalReps
                    });
                }
            }
        });

        // Sort by date (most recent first)
        return history.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [workouts, exerciseId]);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) {
            return 'Hoy';
        } else if (date.toDateString() === yesterday.toDateString()) {
            return 'Ayer';
        } else {
            return date.toLocaleDateString('es-ES', {
                day: 'numeric',
                month: 'short'
            });
        }
    };

    const formatWeight = (weight: number) => {
        return weight % 1 === 0 ? weight.toString() : weight.toFixed(1);
    };

    if (exerciseHistory.length === 0) {
        return (
            <View className="flex-1 items-center justify-center py-10">
                <Ionicons name="time-outline" size={48} color="#6b7280" />
                <Text className="text-gray-400 text-center mt-4 px-4">
                    No hay historial para este ejercicio aún.
                </Text>
                <Text className="text-gray-500 text-center mt-2 px-4 text-sm">
                    Completa entrenamientos con {exerciseName} para ver tu progreso aquí.
                </Text>
            </View>
        );
    }

    return (
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
            <View className="p-4">
                <Text className="text-white text-lg font-bold mb-4">
                    Historial de {exerciseName}
                </Text>

                {exerciseHistory.map((item, index) => (
                    <Animated.View
                        key={`${item.date}-${index}`}
                        entering={FadeInUp.delay(index * 100)}
                        className="bg-gray-800 rounded-xl p-4 mb-3">
                        {/* Header */}
                        <View className="flex-row items-center justify-between mb-3">
                            <View className="flex-row items-center">
                                <View className="w-10 h-10 bg-blue-600/20 rounded-full items-center justify-center mr-3">
                                    <Ionicons name="calendar-outline" size={20} color="#60a5fa" />
                                </View>
                                <View>
                                    <Text className="text-white font-bold">
                                        {formatDate(item.date)}
                                    </Text>
                                    <Text className="text-gray-400 text-sm">
                                        {item.workoutName}
                                    </Text>
                                </View>
                            </View>
                        </View>

                        {/* Sets */}
                        <View className="mb-3">
                            <Text className="text-gray-300 font-medium mb-2">Series realizadas:</Text>
                            <View className="space-y-1">
                                {item.sets.map((set, setIndex) => (
                                    <View key={setIndex} className="flex-row items-center justify-between bg-gray-700/50 rounded-lg px-3 py-2">
                                        <Text className="text-gray-300">
                                            Serie {setIndex + 1}
                                        </Text>
                                        <Text className="text-white font-bold">
                                            {formatWeight(set.weight)}kg × {set.reps} reps
                                        </Text>
                                    </View>
                                ))}
                            </View>
                        </View>

                        {/* Stats */}
                        <View className="flex-row justify-between pt-3 border-t border-gray-700">
                            <View className="items-center">
                                <Text className="text-gray-400 text-xs uppercase tracking-wider">Volumen</Text>
                                <Text className="text-blue-400 font-bold">
                                    {formatWeight(item.volume)}kg
                                </Text>
                            </View>
                            <View className="items-center">
                                <Text className="text-gray-400 text-xs uppercase tracking-wider">Peso Máx</Text>
                                <Text className="text-green-400 font-bold">
                                    {formatWeight(item.maxWeight)}kg
                                </Text>
                            </View>
                            <View className="items-center">
                                <Text className="text-gray-400 text-xs uppercase tracking-wider">Total Reps</Text>
                                <Text className="text-purple-400 font-bold">
                                    {item.totalReps}
                                </Text>
                            </View>
                        </View>
                    </Animated.View>
                ))}
            </View>
        </ScrollView>
    );
}
