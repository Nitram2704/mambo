import React, { useMemo } from 'react';
import { View, Dimensions } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { useWorkoutHistoryStore } from '@/store/workoutHistoryStore';
import { useAppTheme } from '@/hooks/use-app-theme';
import { Colors } from '@/constants/Colors';
import { AccessibleText } from '@/components/ui/AccessibleText';

export const MuscleVolumeChart = () => {
    const { workouts } = useWorkoutHistoryStore();
    const { theme } = useAppTheme();
    const colors = Colors[theme];

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
            <View className="bg-surface p-4 rounded-xl items-center justify-center h-64 border border-border/10">
                <AccessibleText className="text-text-muted">No hay datos suficientes en los últimos 30 días</AccessibleText>
            </View>
        );
    }

    return (
        <View className="bg-surface p-4 rounded-xl mb-4 border border-border/10">
            <AccessibleText weight="bold" className="text-text text-lg mb-4">Volumen por Músculo (30 días)</AccessibleText>
            <BarChart
                data={chartData}
                width={Dimensions.get('window').width - 64}
                height={220}
                yAxisLabel=""
                yAxisSuffix="k"
                chartConfig={{
                    backgroundColor: colors.surface,
                    backgroundGradientFrom: colors.surface,
                    backgroundGradientTo: colors.surface,
                    decimalPlaces: 1,
                    color: (opacity = 1) => `rgba(96, 165, 250, ${opacity})`,
                    labelColor: (opacity = 1) => colors.textMuted,
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
            <AccessibleText className="text-text-muted text-[10px] text-center mt-2">* Volumen total en miles de kg (toneladas)</AccessibleText>
        </View>
    );
};
