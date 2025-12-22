import React, { useState, useMemo } from 'react';
import { View, Text, Dimensions, TouchableOpacity, ScrollView } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { useWorkoutHistoryStore } from '@/store/workoutHistoryStore';

const TRACKED_EXERCISES = ['Squat', 'Bench Press', 'Deadlift', 'Overhead Press'];

export const OneRMChart = () => {
    const { workouts } = useWorkoutHistoryStore();
    const [selectedExercise, setSelectedExercise] = useState('Bench Press');

    const chartData = useMemo(() => {
        const dataPoints: { date: string; oneRM: number }[] = [];

        // Sort workouts by date ascending
        const sortedWorkouts = [...workouts].sort((a, b) =>
            new Date(a.endTime).getTime() - new Date(b.endTime).getTime()
        );

        sortedWorkouts.forEach(workout => {
            const exercise = workout.exercises.find(e =>
                e.exerciseName.toLowerCase().includes(selectedExercise.toLowerCase())
            );

            if (exercise) {
                // Calculate max 1RM for this session
                let maxOneRM = 0;
                exercise.sets.forEach(set => {
                    if (set.completed && set.weight && set.reps) {
                        // Epley Formula: Weight * (1 + Reps/30)
                        const oneRM = set.weight * (1 + set.reps / 30);
                        if (oneRM > maxOneRM) maxOneRM = oneRM;
                    }
                });

                if (maxOneRM > 0) {
                    const date = new Date(workout.endTime);
                    dataPoints.push({
                        date: `${date.getDate()}/${date.getMonth() + 1}`,
                        oneRM: maxOneRM
                    });
                }
            }
        });

        // Take last 6 points to avoid overcrowding
        return dataPoints.slice(-6);
    }, [workouts, selectedExercise]);

    return (
        <View className="bg-gray-800 p-4 rounded-xl mb-4 border border-gray-700">
            <View className="flex-row justify-between items-center mb-4">
                <Text className="text-white text-lg font-bold">Progreso 1RM Estimado</Text>
            </View>

            {/* Exercise Selector */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
                {TRACKED_EXERCISES.map(ex => (
                    <TouchableOpacity
                        key={ex}
                        onPress={() => setSelectedExercise(ex)}
                        className={`px-4 py-2 rounded-full mr-2 ${selectedExercise === ex ? 'bg-blue-600' : 'bg-gray-700'
                            }`}
                    >
                        <Text className={`font-bold ${selectedExercise === ex ? 'text-white' : 'text-gray-300'
                            }`}>
                            {ex}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {chartData.length < 2 ? (
                <View className="h-48 items-center justify-center">
                    <Text className="text-gray-500 text-center">
                        No hay suficientes datos para {selectedExercise}
                    </Text>
                </View>
            ) : (
                <LineChart
                    data={{
                        labels: chartData.map(d => d.date),
                        datasets: [{
                            data: chartData.map(d => d.oneRM)
                        }]
                    }}
                    width={Dimensions.get('window').width - 64}
                    height={220}
                    yAxisLabel=""
                    yAxisSuffix="kg"
                    chartConfig={{
                        backgroundColor: '#1f2937',
                        backgroundGradientFrom: '#1f2937',
                        backgroundGradientTo: '#1f2937',
                        decimalPlaces: 0,
                        color: (opacity = 1) => `rgba(34, 197, 94, ${opacity})`, // Green
                        labelColor: (opacity = 1) => `rgba(156, 163, 175, ${opacity})`,
                        style: {
                            borderRadius: 16
                        },
                        propsForDots: {
                            r: "6",
                            strokeWidth: "2",
                            stroke: "#22c55e"
                        }
                    }}
                    bezier
                    style={{
                        marginVertical: 8,
                        borderRadius: 16
                    }}
                />
            )}
        </View>
    );
};
