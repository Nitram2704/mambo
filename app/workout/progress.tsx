import React from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useWorkoutHistoryStore } from '@/store/workoutHistoryStore';
import WorkoutVolumeChart from '@/components/WorkoutVolumeChart';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { AccessibleText } from '@/components/ui/AccessibleText';
import { Card } from '@/components/ui/Card';
import { Colors } from '@/constants/Colors';
import { useAppTheme } from '@/hooks/use-app-theme';
import { a11y } from '@/utils/accessibility';
import { useTranslation } from 'react-i18next';

export default function WorkoutProgressScreen() {
    const router = useRouter();
    const { t } = useTranslation();
    const { theme } = useAppTheme();
    const colors = Colors[theme];
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
        <ScreenWrapper
            headerTitle={t('workout.progress.title', 'Progreso de Entrenamientos')}
            scrollable={true}
        >
            <View className="p-4">
                {/* Stats Cards */}
                <View className="flex-row gap-4 mb-6">
                    <Card className="flex-1 p-4 border-white/5">
                        <AccessibleText variant="caption" className="text-text-muted mb-1">{t('workout.progress.totalWorkouts', 'Total Entrenos')}</AccessibleText>
                        <AccessibleText variant="h2" weight="bold" className="text-text">{totalWorkouts}</AccessibleText>
                    </Card>
                    <Card className="flex-1 p-4 border-white/5">
                        <AccessibleText variant="caption" className="text-text-muted mb-1">{t('workout.progress.totalVolume', 'Volumen Total')}</AccessibleText>
                        <AccessibleText variant="h2" weight="bold" className="text-text">{totalVolume.toLocaleString()}</AccessibleText>
                        <AccessibleText variant="caption" className="text-text-muted">kg</AccessibleText>
                    </Card>
                    <Card className="flex-1 p-4 border-white/5">
                        <AccessibleText variant="caption" className="text-text-muted mb-1">{t('workout.progress.average', 'Promedio')}</AccessibleText>
                        <AccessibleText variant="h2" weight="bold" className="text-text">{avgVolume}</AccessibleText>
                        <AccessibleText variant="caption" className="text-text-muted">kg/sesión</AccessibleText>
                    </Card>
                </View>

                {/* Volume Chart */}
                <Card className="p-4 mb-6 border-white/5">
                    <AccessibleText variant="h3" weight="bold" className="text-text mb-2">{t('workout.progress.weeklyVolume', 'Volumen Semanal')}</AccessibleText>
                    <AccessibleText variant="caption" className="text-text-secondary mb-4">{t('workout.progress.last7Weeks', 'Últimas 7 semanas')}</AccessibleText>
                    {weeklyData.some(w => w.volume > 0) ? (
                        <WorkoutVolumeChart
                            weeklyVolumes={weeklyData.map(w => w.volume)}
                            labels={weeklyData.map(w => w.label)}
                        />
                    ) : (
                        <View className="py-8 items-center">
                            <Ionicons name="barbell-outline" size={48} color={colors.textMuted} />
                            <AccessibleText className="text-text-muted mt-4 text-center">{t('workout.progress.noData', 'Completa entrenamientos para ver tu progreso')}</AccessibleText>
                        </View>
                    )}
                </Card>

                {/* Top Exercises */}
                <Card className="p-4 mb-8 border-white/5">
                    <AccessibleText variant="h3" weight="bold" className="text-text mb-4">{t('workout.progress.topExercises', 'Top Ejercicios por Volumen')}</AccessibleText>
                    {topExercises.length > 0 ? (
                        topExercises.map((exercise, index) => (
                            <View key={exercise.name} className="flex-row items-center justify-between py-3 border-b border-white/5 last:border-b-0">
                                <View className="flex-row items-center flex-1">
                                    <View className="w-8 h-8 rounded-full bg-orange-500/20 items-center justify-center mr-3">
                                        <AccessibleText weight="bold" className="text-orange-400">{index + 1}</AccessibleText>
                                    </View>
                                    <AccessibleText weight="medium" className="text-text flex-1">{exercise.name}</AccessibleText>
                                </View>
                                <AccessibleText weight="bold" className="text-orange-400">{exercise.volume.toLocaleString()} kg</AccessibleText>
                            </View>
                        ))
                    ) : (
                        <AccessibleText className="text-text-muted text-center py-4">{t('common.noData', 'Sin datos aún')}</AccessibleText>
                    )}
                </Card>
            </View>
        </ScreenWrapper>
    );
}
