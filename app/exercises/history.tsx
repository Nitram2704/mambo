import React, { useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useWorkoutHistoryStore } from '@/store/workoutHistoryStore';
import ExerciseProgressChart from '@/components/ExerciseProgressChart';

export default function ExerciseHistoryScreen() {
    const router = useRouter();
    const { exerciseId, exerciseName } = useLocalSearchParams<{
        exerciseId: string;
        exerciseName: string;
    }>();

    const { workouts } = useWorkoutHistoryStore();

    // Extract exercise data from workout history
    const exerciseData = useMemo(() => {
        const data: { date: string; weight: number }[] = [];

        workouts.forEach(workout => {
            workout.exercises.forEach(ex => {
                if (ex.exerciseId === exerciseId) {
                    // Find max weight used in this workout
                    const maxWeight = Math.max(...ex.sets.map(s => s.weight));
                    if (maxWeight > 0) {
                        data.push({
                            date: workout.startTime.toISOString(),
                            weight: maxWeight,
                        });
                    }
                }
            });
        });

        // Sort by date
        return data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }, [workouts, exerciseId]);

    // Get last 5 sessions
    const recentSessions = useMemo(() => {
        return workouts
            .filter(w => w.exercises.some(e => e.exerciseId === exerciseId))
            .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
            .slice(0, 5);
    }, [workouts, exerciseId]);

    return (
        <View className="flex-1 bg-gray-900">
            <LinearGradient
                colors={['#0f172a', '#1e293b']}
                style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
            />
            <SafeAreaView className="flex-1">
                {/* Header */}
                <View className="flex-row items-center justify-between p-4 border-b border-white/10">
                    <TouchableOpacity onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </TouchableOpacity>
                    <Text className="text-white text-lg font-bold flex-1 text-center">
                        Historial de Ejercicio
                    </Text>
                    <View style={{ width: 24 }} />
                </View>

                <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
                    {/* Progress Chart */}
                    <ExerciseProgressChart
                        exerciseName={exerciseName || 'Ejercicio'}
                        data={exerciseData}
                    />

                    {/* Recent Sessions */}
                    <LinearGradient
                        colors={['rgba(30, 41, 59, 0.7)', 'rgba(15, 23, 42, 0.8)']}
                        className="rounded-2xl p-5 border border-white/10 mt-4"
                    >
                        <Text className="text-white font-bold text-lg mb-4">
                            Últimas 5 Sesiones
                        </Text>
                        {recentSessions.length > 0 ? (
                            recentSessions.map((workout, index) => {
                                const exercise = workout.exercises.find(e => e.exerciseId === exerciseId);
                                if (!exercise) return null;

                                const date = new Date(workout.startTime);
                                const dateStr = date.toLocaleDateString('es-ES', {
                                    day: 'numeric',
                                    month: 'short',
                                });

                                return (
                                    <View
                                        key={workout.id}
                                        className={`py-3 ${index < recentSessions.length - 1 ? 'border-b border-white/5' : ''
                                            }`}
                                    >
                                        <Text className="text-gray-400 text-sm mb-2">{dateStr}</Text>
                                        <View className="flex-row flex-wrap gap-2">
                                            {exercise.sets.map((set, setIndex) => (
                                                <View
                                                    key={setIndex}
                                                    className="bg-blue-500/20 px-3 py-2 rounded-lg border border-blue-500/30"
                                                >
                                                    <Text className="text-blue-200 text-xs font-medium">
                                                        {set.weight}kg × {set.reps}
                                                    </Text>
                                                </View>
                                            ))}
                                        </View>
                                    </View>
                                );

                            })
                        ) : (
                            <Text className="text-gray-400 text-center py-4">
                                No hay sesiones registradas aún
                            </Text>
                        )}
                    </LinearGradient>
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}
