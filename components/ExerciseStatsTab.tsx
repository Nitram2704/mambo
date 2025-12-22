import React, { useMemo } from 'react';
import { View, Text, ScrollView, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LineChart } from 'react-native-chart-kit';
import { useWorkoutHistoryStore } from '@/store/workoutHistoryStore';
import Animated, { FadeInUp } from 'react-native-reanimated';

const screenWidth = Dimensions.get('window').width;

interface ExerciseStatsTabProps {
    exerciseId: string;
    exerciseName: string;
}

interface PersonalRecord {
    type: string;
    value: number;
    unit: string;
    date: string;
    workoutName: string;
}

export function ExerciseStatsTab({ exerciseId, exerciseName }: ExerciseStatsTabProps) {
    const { workouts } = useWorkoutHistoryStore();

    const stats = useMemo(() => {
        const exerciseSessions: Array<{
            date: string;
            maxWeight: number;
            volume: number;
            totalReps: number;
            sets: number;
        }> = [];

        workouts.forEach(workout => {
            const exerciseSession = workout.exercises.find(ex => ex.exerciseId === exerciseId);
            if (exerciseSession && exerciseSession.sets.length > 0) {
                const completedSets = exerciseSession.sets.filter(set => set.completed);

                if (completedSets.length > 0) {
                    const maxWeight = Math.max(...completedSets.map(set => set.weight));
                    const volume = completedSets.reduce((sum, set) => sum + (set.weight * set.reps), 0);
                    const totalReps = completedSets.reduce((sum, set) => sum + set.reps, 0);

                    exerciseSessions.push({
                        date: workout.startTime.toISOString().split('T')[0],
                        maxWeight,
                        volume,
                        totalReps,
                        sets: completedSets.length
                    });
                }
            }
        });

        // Sort by date
        exerciseSessions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        // Calculate personal records
        const personalRecords: PersonalRecord[] = [];

        if (exerciseSessions.length > 0) {
            const maxWeightPR = exerciseSessions.reduce((max, session) =>
                session.maxWeight > max.value ? {
                    type: 'Peso Máximo',
                    value: session.maxWeight,
                    unit: 'kg',
                    date: session.date,
                    workoutName: 'Record Personal'
                } : max,
                { type: 'Peso Máximo', value: 0, unit: 'kg', date: '', workoutName: '' }
            );

            const maxVolumePR = exerciseSessions.reduce((max, session) =>
                session.volume > max.value ? {
                    type: 'Volumen Máximo',
                    value: session.volume,
                    unit: 'kg',
                    date: session.date,
                    workoutName: 'Record Personal'
                } : max,
                { type: 'Volumen Máximo', value: 0, unit: 'kg', date: '', workoutName: '' }
            );

            const bestSetPR = exerciseSessions.reduce((best, session) => {
                // For now, use max weight as best set (simplified)
                return session.maxWeight > best.value ? {
                    type: 'Mejor Serie',
                    value: session.maxWeight,
                    unit: 'kg',
                    date: session.date,
                    workoutName: 'Record Personal'
                } : best;
            }, { type: 'Mejor Serie', value: 0, unit: 'kg', date: '', workoutName: '' });

            if (maxWeightPR.value > 0) personalRecords.push(maxWeightPR);
            if (maxVolumePR.value > 0) personalRecords.push(maxVolumePR);
            if (bestSetPR.value > 0) personalRecords.push(bestSetPR);
        }

        return {
            sessions: exerciseSessions,
            personalRecords
        };
    }, [workouts, exerciseId]);

    const chartData = useMemo(() => {
        if (stats.sessions.length === 0) return null;

        const labels = stats.sessions.map(session => {
            const date = new Date(session.date);
            return date.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' });
        });

        const data = stats.sessions.map(session => session.maxWeight);

        return {
            labels,
            datasets: [{
                data,
                color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
                strokeWidth: 2
            }]
        };
    }, [stats.sessions]);

    const formatWeight = (weight: number) => {
        return weight % 1 === 0 ? weight.toString() : weight.toFixed(1);
    };

    const chartConfig = {
        backgroundColor: '#111827',
        backgroundGradientFrom: '#111827',
        backgroundGradientTo: '#111827',
        decimalPlaces: 1,
        color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
        labelColor: (opacity = 1) => `rgba(156, 163, 175, ${opacity})`,
        style: {
            borderRadius: 16
        },
        propsForDots: {
            r: '4',
            strokeWidth: '2',
            stroke: '#3b82f6'
        }
    };

    if (stats.sessions.length === 0) {
        return (
            <View className="flex-1 items-center justify-center py-10">
                <Ionicons name="stats-chart-outline" size={48} color="#6b7280" />
                <Text className="text-gray-400 text-center mt-4 px-4">
                    No hay estadísticas disponibles aún.
                </Text>
                <Text className="text-gray-500 text-center mt-2 px-4 text-sm">
                    Completa más entrenamientos con {exerciseName} para ver tus estadísticas.
                </Text>
            </View>
        );
    }

    return (
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
            <View className="p-4">
                <Text className="text-white text-lg font-bold mb-4">
                    Estadísticas de {exerciseName}
                </Text>

                {/* Chart */}
                <Animated.View
                    entering={FadeInUp.delay(200)}
                    className="mb-6">
                    <Text className="text-white font-bold mb-3">Progreso de Peso Máximo</Text>
                    {chartData && (
                        <View className="bg-gray-800 rounded-xl p-4">
                            <LineChart
                                data={chartData}
                                width={screenWidth - 32}
                                height={220}
                                chartConfig={chartConfig}
                                bezier
                                style={{
                                    marginVertical: 8,
                                    borderRadius: 16
                                }}
                                withInnerLines={false}
                                withOuterLines={false}
                                withDots={true}
                                withShadow={false}
                            />
                        </View>
                    )}
                </Animated.View>

                {/* Personal Records */}
                <Animated.View entering={FadeInUp.delay(400)}>
                    <Text className="text-white font-bold mb-3">Records Personales</Text>
                    <View className="space-y-3">
                        {stats.personalRecords.map((record, index) => (
                            <View key={index} className="bg-gray-800 rounded-xl p-4">
                                <View className="flex-row items-center justify-between">
                                    <View className="flex-row items-center">
                                        <View className="w-10 h-10 bg-yellow-500/20 rounded-full items-center justify-center mr-3">
                                            <Ionicons name="trophy-outline" size={20} color="#eab308" />
                                        </View>
                                        <View>
                                            <Text className="text-white font-bold">{record.type}</Text>
                                            <Text className="text-gray-400 text-sm">
                                                {new Date(record.date).toLocaleDateString('es-ES')}
                                            </Text>
                                        </View>
                                    </View>
                                    <View className="items-end">
                                        <Text className="text-yellow-400 text-xl font-bold">
                                            {formatWeight(record.value)}{record.unit}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        ))}
                    </View>
                </Animated.View>

                {/* Summary Stats */}
                <Animated.View entering={FadeInUp.delay(600)} className="mt-6">
                    <Text className="text-white font-bold mb-3">Resumen General</Text>
                    <View className="bg-gray-800 rounded-xl p-4">
                        <View className="flex-row justify-between mb-3">
                            <View className="items-center">
                                <Text className="text-gray-400 text-xs uppercase tracking-wider">Sesiones</Text>
                                <Text className="text-blue-400 text-xl font-bold">{stats.sessions.length}</Text>
                            </View>
                            <View className="items-center">
                                <Text className="text-gray-400 text-xs uppercase tracking-wider">Peso Máx</Text>
                                <Text className="text-green-400 text-xl font-bold">
                                    {formatWeight(Math.max(...stats.sessions.map(s => s.maxWeight)))}kg
                                </Text>
                            </View>
                            <View className="items-center">
                                <Text className="text-gray-400 text-xs uppercase tracking-wider">Volumen Total</Text>
                                <Text className="text-purple-400 text-xl font-bold">
                                    {formatWeight(stats.sessions.reduce((sum, s) => sum + s.volume, 0))}kg
                                </Text>
                            </View>
                        </View>
                    </View>
                </Animated.View>
            </View>
        </ScrollView>
    );
}
