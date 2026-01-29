import React, { useState, useMemo } from 'react';
import { View, Dimensions, TouchableOpacity, ScrollView } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { useWorkoutHistoryStore } from '@/store/workoutHistoryStore';
import { useAppTheme } from '@/hooks/use-app-theme';
import { Colors } from '@/constants/Colors';
import { useTranslation } from 'react-i18next';
import { AccessibleText } from '@/components/ui/AccessibleText';

const TRACKED_EXERCISES = ['Squat', 'Bench Press', 'Deadlift', 'Overhead Press'];

export const OneRMChart = () => {
    const { workouts } = useWorkoutHistoryStore();
    const [selectedExercise, setSelectedExercise] = useState('Bench Press');
    const { theme } = useAppTheme();
    const { t } = useTranslation();
    const colors = Colors[theme];

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
        <View className="bg-surface p-4 rounded-xl mb-4 border border-border/10">
            <View className="flex-row justify-between items-center mb-4">
                <AccessibleText weight="bold" className="text-text text-lg">{t('reports.oneRMTitle')}</AccessibleText>
            </View>

            {/* Exercise Selector */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
                {TRACKED_EXERCISES.map(ex => (
                    <TouchableOpacity
                        key={ex}
                        onPress={() => setSelectedExercise(ex)}
                        className={`px-4 py-2 rounded-full mr-2 ${selectedExercise === ex ? 'bg-primary' : 'bg-surface-highlight'
                            }`}
                    >
                        <AccessibleText weight="bold" className={selectedExercise === ex ? 'text-white' : 'text-text-secondary'}>
                            {ex}
                        </AccessibleText>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {chartData.length < 2 ? (
                <View className="h-48 items-center justify-center">
                    <AccessibleText className="text-text-muted text-center">
                        {t('reports.noOneRMData', { exercise: selectedExercise })}
                    </AccessibleText>
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
                        backgroundColor: colors.surface,
                        backgroundGradientFrom: colors.surface,
                        backgroundGradientTo: colors.surface,
                        decimalPlaces: 0,
                        color: (opacity = 1) => `rgba(34, 197, 94, ${opacity})`, // Green
                        labelColor: (opacity = 1) => colors.textMuted,
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
