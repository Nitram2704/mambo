import React, { useMemo } from 'react';
import { View, Text, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { LinearGradient } from 'expo-linear-gradient';
import { useWorkoutHistoryStore } from '@/store/workoutHistoryStore';

interface ExerciseProgressChartProps {
    exerciseId?: string;
    exerciseName?: string;
    data?: {
        date: string;
        weight: number;
    }[];
}

export function ExerciseProgressChart({ exerciseId, exerciseName: propName, data: propData }: ExerciseProgressChartProps) {
    const screenWidth = Dimensions.get('window').width - 32; // padding
    const { workouts } = useWorkoutHistoryStore();

    const { chartData, exerciseName, currentWeight, maxWeight } = useMemo(() => {
        let dataToUse = propData || [];
        let nameToUse = propName || '';

        if (exerciseId && workouts.length > 0) {
            // Filter workouts that contain this exercise
            const relevantWorkouts = workouts
                .filter(w => w.exercises.some(e => e.exerciseId === exerciseId))
                .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
                .slice(-7); // Last 7 sessions

            if (relevantWorkouts.length > 0) {
                dataToUse = relevantWorkouts.map(w => {
                    const exercise = w.exercises.find(e => e.exerciseId === exerciseId);
                    // Find max weight for this session
                    const maxSetWeight = exercise?.sets.reduce((max, set) => Math.max(max, set.weight), 0) || 0;

                    if (!nameToUse && exercise) nameToUse = exercise.exerciseName;

                    return {
                        date: w.startTime.toString(),
                        weight: maxSetWeight
                    };
                });
            }
        }

        if (dataToUse.length === 0) {
            return { chartData: null, exerciseName: nameToUse, currentWeight: 0, maxWeight: 0 };
        }

        const labels = dataToUse.map(d => {
            const date = new Date(d.date);
            return `${date.getDate()}/${date.getMonth() + 1}`;
        });

        const weights = dataToUse.map(d => d.weight);
        const current = weights[weights.length - 1];
        const max = Math.max(...weights);

        return {
            chartData: {
                labels,
                datasets: [
                    {
                        data: weights,
                        color: (opacity = 1) => `rgba(96, 165, 250, ${opacity})`,
                        strokeWidth: 3,
                    },
                ],
            },
            exerciseName: nameToUse,
            currentWeight: current,
            maxWeight: max
        };
    }, [exerciseId, workouts, propData, propName]);

    const chartConfig = {
        backgroundColor: 'transparent',
        backgroundGradientFrom: 'rgba(30, 41, 59, 0.7)',
        backgroundGradientTo: 'rgba(15, 23, 42, 0.8)',
        decimalPlaces: 1,
        color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
        labelColor: (opacity = 1) => `rgba(156, 163, 175, ${opacity})`,
        style: {
            borderRadius: 16,
        },
        propsForDots: {
            r: '5',
            strokeWidth: '2',
            stroke: '#60a5fa',
        },
        propsForBackgroundLines: {
            strokeDasharray: '',
            stroke: 'rgba(255, 255, 255, 0.1)',
        },
    };

    if (!chartData) {
        return (
            <LinearGradient
                colors={['rgba(30, 41, 59, 0.7)', 'rgba(15, 23, 42, 0.8)']}
                className="rounded-2xl p-5 border border-white/10"
            >
                {exerciseName ? <Text className="text-white font-bold text-lg mb-2">{exerciseName}</Text> : null}
                <Text className="text-gray-400 text-center py-8">
                    No hay datos de progreso aún
                </Text>
            </LinearGradient>
        );
    }

    return (
        <LinearGradient
            colors={['rgba(30, 41, 59, 0.7)', 'rgba(15, 23, 42, 0.8)']}
            className="rounded-2xl p-5 border border-white/10 mb-4"
        >
            {exerciseName ? <Text className="text-white font-bold text-lg mb-3">{exerciseName}</Text> : null}
            <Text className="text-gray-400 text-sm mb-4">Progresión de Peso (kg)</Text>

            <LineChart
                data={chartData}
                width={screenWidth - 64} // Adjusted width for padding
                height={200}
                chartConfig={chartConfig}
                bezier
                style={{
                    marginVertical: 8,
                    borderRadius: 16,
                }}
                withInnerLines={true}
                withOuterLines={false}
                withVerticalLabels={true}
                withHorizontalLabels={true}
            />

            <View className="flex-row justify-between mt-3 pt-3 border-t border-white/5">
                <View>
                    <Text className="text-gray-400 text-xs">Mejor Peso</Text>
                    <Text className="text-white font-bold text-lg">
                        {maxWeight.toFixed(1)} kg
                    </Text>
                </View>
                <View className="items-end">
                    <Text className="text-gray-400 text-xs">Último Registro</Text>
                    <Text className="text-white font-bold text-lg">
                        {currentWeight.toFixed(1)} kg
                    </Text>
                </View>
            </View>
        </LinearGradient>
    );
}
