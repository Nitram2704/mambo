import React, { useState } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { AccessibleText } from '@/components/ui/AccessibleText';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getMonthlyStats } from '@/store/reportsStore';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '@/hooks/use-app-theme';
import { Colors } from '@/constants/Colors';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { Card } from '@/components/ui/Card';
import { LinearGradient } from 'expo-linear-gradient';

export default function MonthlyReportScreen() {
    const { t, i18n } = useTranslation();
    const { theme, isDark } = useAppTheme();
    const colors = Colors[theme];
    const router = useRouter();
    const [currentDate, setCurrentDate] = useState(new Date());
    const stats = getMonthlyStats(currentDate);

    const goToPreviousMonth = () => {
        const newDate = new Date(currentDate);
        newDate.setMonth(currentDate.getMonth() - 1);
        setCurrentDate(newDate);
    };

    const goToNextMonth = () => {
        const newDate = new Date(currentDate);
        newDate.setMonth(currentDate.getMonth() + 1);
        setCurrentDate(newDate);
    };

    const formatMonth = () => {
        return stats.monthStart.toLocaleDateString(i18n.language === 'es' ? 'es-ES' : 'en-US', { month: 'long', year: 'numeric' });
    };

    return (
        <ScreenWrapper
            headerTitle={t('reports.monthlyTitle', 'Reporte Mensual')}
            scrollable
            bg="bg-background"
        >
            <View className="flex-row items-center justify-between p-4">
                <TouchableOpacity
                    onPress={goToPreviousMonth}
                    className="w-10 h-10 rounded-2xl bg-primary/20 items-center justify-center"
                >
                    <Ionicons name="chevron-back" size={24} color={colors.primary} />
                </TouchableOpacity>
                <AccessibleText weight="bold" className="text-lg text-text capitalize">{formatMonth()}</AccessibleText>
                <TouchableOpacity
                    onPress={goToNextMonth}
                    className="w-10 h-10 rounded-2xl bg-primary/20 items-center justify-center"
                >
                    <Ionicons name="chevron-forward" size={24} color={colors.primary} />
                </TouchableOpacity>
            </View>

            <View className="flex-1 p-4">
                {/* Summary Cards */}
                <View className="flex-row gap-4 mb-6">
                    <Card variant="glass" className="flex-1 p-0 overflow-hidden border-warning/20">
                        <LinearGradient
                            colors={isDark ? ['rgba(249, 115, 22, 0.2)', 'rgba(220, 38, 38, 0.2)'] : ['rgba(249, 115, 22, 0.1)', 'rgba(249, 115, 22, 0.2)']}
                            className="p-4"
                        >
                            <AccessibleText weight="bold" className="text-text-secondary text-[10px] uppercase tracking-widest mb-1">{t('reports.totalCalories')}</AccessibleText>
                            <AccessibleText weight="bold" className="text-text text-2xl">{stats.totalCaloriesConsumed}</AccessibleText>
                            <AccessibleText className="text-text-muted text-[10px] mt-1 uppercase tracking-tighter">~{stats.avgCaloriesPerDay}/{t('reports.day')}</AccessibleText>
                        </LinearGradient>
                    </Card>
                    <Card variant="glass" className="flex-1 p-0 overflow-hidden border-success/20">
                        <LinearGradient
                            colors={isDark ? ['rgba(34, 197, 94, 0.2)', 'rgba(5, 150, 105, 0.2)'] : ['rgba(34, 197, 94, 0.1)', 'rgba(34, 197, 94, 0.2)']}
                            className="p-4"
                        >
                            <AccessibleText weight="bold" className="text-text-secondary text-[10px] uppercase tracking-widest mb-1">{t('reports.workouts')}</AccessibleText>
                            <AccessibleText weight="bold" className="text-text text-2xl">{stats.totalWorkouts}</AccessibleText>
                            <AccessibleText className="text-text-muted text-[10px] mt-1 uppercase tracking-tighter">{stats.totalWorkoutMinutes} min</AccessibleText>
                        </LinearGradient>
                    </Card>
                </View>

                {/* Monthly Macros */}
                <Card variant="glass" className="p-4 mb-6 border-border/10">
                    <AccessibleText weight="bold" className="text-lg mb-4 text-text">{t('reports.monthlyAverage')}</AccessibleText>
                    <View className="flex-row justify-between">
                        <View className="flex-1 items-center">
                            <AccessibleText weight="bold" className="text-[10px] text-text-secondary uppercase tracking-widest mb-1">{t('nutrition.protein')}</AccessibleText>
                            <AccessibleText weight="bold" className="text-xl text-primary">{stats.avgProteinPerDay}g</AccessibleText>
                        </View>
                        <View className="flex-1 items-center">
                            <AccessibleText weight="bold" className="text-[10px] text-text-secondary uppercase tracking-widest mb-1">{t('nutrition.carbs')}</AccessibleText>
                            <AccessibleText weight="bold" className="text-xl text-success">{stats.avgCarbsPerDay}g</AccessibleText>
                        </View>
                        <View className="flex-1 items-center">
                            <AccessibleText weight="bold" className="text-[10px] text-text-secondary uppercase tracking-widest mb-1">{t('nutrition.fats')}</AccessibleText>
                            <AccessibleText weight="bold" className="text-xl text-warning">{stats.avgFatsPerDay}g</AccessibleText>
                        </View>
                    </View>
                </Card>

                {/* Weekly Breakdown */}
                <Card variant="glass" className="p-4 mb-8 border-border/10">
                    <AccessibleText weight="bold" className="text-lg mb-4 text-text">{t('reports.weeklyBreakdown')}</AccessibleText>
                    {stats.weeklyBreakdown.map((week, index) => {
                        const weekStart = week.weekStart.getDate();
                        const weekEnd = week.weekEnd.getDate();
                        const weekLabel = `${t('reports.week')} ${index + 1} (${weekStart}-${weekEnd})`;

                        return (
                            <View key={index} className="mb-4 last:mb-0">
                                <AccessibleText weight="bold" className="text-xs text-text-secondary uppercase tracking-widest mb-2">{weekLabel}</AccessibleText>
                                <View className="flex-row justify-between">
                                    <View className="flex-1">
                                        <AccessibleText weight="bold" className="text-warning text-sm">
                                            {week.avgCaloriesPerDay} cal/{t('reports.day')}
                                        </AccessibleText>
                                    </View>
                                    <View className="flex-1">
                                        <AccessibleText weight="bold" className="text-success text-sm">
                                            {week.totalWorkouts} {t('reports.workouts')}
                                        </AccessibleText>
                                    </View>
                                    <View className="flex-1 items-end">
                                        <AccessibleText weight="bold" className="text-primary text-sm">
                                            {week.totalWorkoutMinutes} min
                                        </AccessibleText>
                                    </View>
                                </View>
                                {index < stats.weeklyBreakdown.length - 1 && (
                                    <View className="h-px mt-4 bg-border/10" />
                                )}
                            </View>
                        );
                    })}
                </Card>

                {/* Achievements */}
                <Card variant="glass" className="p-0 overflow-hidden border-primary/20 mb-8">
                    <LinearGradient
                        colors={isDark ? ['rgba(139, 92, 246, 0.2)', 'rgba(219, 39, 119, 0.2)'] : [colors.primary, colors.pink[500]]}
                        className="p-6"
                    >
                        <View className="flex-row items-center mb-4">
                            <View className="w-12 h-12 rounded-2xl bg-white/20 items-center justify-center">
                                <Ionicons name="trophy" size={28} color="white" />
                            </View>
                            <AccessibleText weight="bold" className="text-white text-xl ml-3">{t('reports.monthlyAchievements')}</AccessibleText>
                        </View>
                        <View className="gap-3">
                            {stats.totalWorkouts >= 12 && (
                                <View className="flex-row items-center bg-white/10 p-3 rounded-xl">
                                    <Ionicons name="checkmark-circle" size={20} color="white" />
                                    <AccessibleText weight="bold" className="text-white ml-2 text-sm">12+ {t('reports.workoutsCompleted')}</AccessibleText>
                                </View>
                            )}
                            {stats.totalCaloriesConsumed > 0 && (
                                <View className="flex-row items-center bg-white/10 p-3 rounded-xl">
                                    <Ionicons name="checkmark-circle" size={20} color="white" />
                                    <AccessibleText weight="bold" className="text-white ml-2 text-sm">{t('reports.activeNutritionTracking')}</AccessibleText>
                                </View>
                            )}
                            {stats.totalWorkouts === 0 && stats.totalCaloriesConsumed === 0 && (
                                <AccessibleText className="text-white/80 italic">{t('reports.startTracking')}</AccessibleText>
                            )}
                        </View>
                    </LinearGradient>
                </Card>
            </View>
        </ScreenWrapper>
    );
}
