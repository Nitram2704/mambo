import React, { useMemo } from 'react';
import { View, Text, Dimensions } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { useWorkoutHistoryStore } from '@/store/workoutHistoryStore';

export const MuscleVolumeChart = () => {
    const { workouts } = useWorkoutHistoryStore();

    const chartData = useMemo(() => {
        const volumeByMuscle: Record<string, number> = {};
        const last30Days = new Date();
        last30Days.setDate(last30Days.getDate() - 30);

        workouts.forEach(workout => {
            const workoutDate = new Date(workout.endTime);
            if (workoutDate >= last30Days) {
                workout.exercises.forEach(exercise => {
                    // Calculate volume for this exercise
                    const volume = exercise.sets.reduce((acc, set) => {
                        if (set.completed && set.weight && set.reps) {
                            return acc + (set.weight * set.reps);
                        }
                        return acc;
                    }, 0);

                    // Add to muscle group
                    const muscle = exercise.muscleGroup || 'Otros';
                    volumeByMuscle[muscle] = (volumeByMuscle[muscle] || 0) + volume;
                });
            }
        });

        // Sort by volume and take top 5
        const sortedMuscles = Object.entries(volumeByMuscle)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5);

        return {
            labels: sortedMuscles.map(([muscle]) => muscle),
            datasets: [{
                data: sortedMuscles.map(([, volume]) => volume / 1000) // Convert to tons for readability if large, or keep kg
            }]
        };
    }, [workouts]);

    if (chartData.labels.length === 0) {
        return (
            <View className="bg-gray-800 p-4 rounded-xl items-center justify-center h-64">
                <Text className="text-gray-400">No hay datos suficientes en los últimos 30 días</Text>
            </View>
        );
    }

    return (
        <View className="bg-gray-800 p-4 rounded-xl mb-4 border border-gray-700">
            <Text className="text-white text-lg font-bold mb-4">Volumen por Músculo (30 días)</Text>
            <BarChart
                data={chartData}
                width={Dimensions.get('window').width - 64}
                height={220}
                yAxisLabel=""
                yAxisSuffix="k"
                chartConfig={{
                    backgroundColor: '#1f2937',
                    backgroundGradientFrom: '#1f2937',
                    backgroundGradientTo: '#1f2937',
                    decimalPlaces: 1,
                    color: (opacity = 1) => `rgba(96, 165, 250, ${opacity})`,
                    labelColor: (opacity = 1) => `rgba(156, 163, 175, ${opacity})`,
                    style: {
                        borderRadius: 16
                    },
                    barPercentage: 0.7,
                }}
                style={{
                    marginVertical: 8,
                    borderRadius: 16
                }}
                showValuesOnTopOfBars
            />
            <Text className="text-gray-500 text-xs text-center mt-2">* Volumen total en miles de kg (toneladas)</Text>
        </View>
    );
};
