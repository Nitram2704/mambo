import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
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
        >
            <View className="flex-row items-center justify-between p-4">
                <TouchableOpacity onPress={goToPreviousMonth} className="p-2">
                    <Ionicons name="chevron-back" size={24} color={colors.primary} />
                </TouchableOpacity>
                <Text className="text-lg font-bold capitalize" style={{ color: colors.text }}>{formatMonth()}</Text>
                <TouchableOpacity onPress={goToNextMonth} className="p-2">
                    <Ionicons name="chevron-forward" size={24} color={colors.primary} />
                </TouchableOpacity>
            </View>

            <View className="flex-1 p-4">
                {/* Summary Cards */}
                <View className="flex-row gap-4 mb-6">
                    <LinearGradient
                        colors={isDark ? ['#f97316', '#dc2626'] : [colors.orange[500], colors.accent]}
                        className="flex-1 rounded-xl p-4 border"
                        style={{ borderColor: isDark ? 'rgba(251, 146, 60, 0.4)' : 'transparent' }}
                    >
                        <Text className="text-white/80 text-sm mb-1">{t('reports.totalCalories')}</Text>
                        <Text className="text-white text-2xl font-bold">{stats.totalCaloriesConsumed}</Text>
                        <Text className="text-white/80 text-xs mt-1">~{stats.avgCaloriesPerDay}/{t('reports.day')}</Text>
                    </LinearGradient>
                    <LinearGradient
                        colors={isDark ? ['#22c55e', '#059669'] : [colors.success, colors.primary]}
                        className="flex-1 rounded-xl p-4 border"
                        style={{ borderColor: isDark ? 'rgba(34, 197, 94, 0.4)' : 'transparent' }}
                    >
                        <Text className="text-white/80 text-sm mb-1">{t('reports.workouts')}</Text>
                        <Text className="text-white text-2xl font-bold">{stats.totalWorkouts}</Text>
                        <Text className="text-white/80 text-xs mt-1">{stats.totalWorkoutMinutes} min</Text>
                    </LinearGradient>
                </View>

                {/* Monthly Macros */}
                <Card className="p-4 mb-6">
                    <Text className="font-bold text-lg mb-4" style={{ color: colors.text }}>{t('reports.monthlyAverage')}</Text>
                    <View className="flex-row justify-between">
                        <View className="flex-1 items-center">
                            <Text className="text-xs mb-1" style={{ color: colors.textSecondary }}>{t('nutrition.protein')}</Text>
                            <Text className="text-xl font-bold" style={{ color: colors.primary }}>{stats.avgProteinPerDay}g</Text>
                        </View>
                        <View className="flex-1 items-center">
                            <Text className="text-xs mb-1" style={{ color: colors.textSecondary }}>{t('nutrition.carbs')}</Text>
                            <Text className="text-xl font-bold" style={{ color: colors.success }}>{stats.avgCarbsPerDay}g</Text>
                        </View>
                        <View className="flex-1 items-center">
                            <Text className="text-xs mb-1" style={{ color: colors.textSecondary }}>{t('nutrition.fats')}</Text>
                            <Text className="text-xl font-bold" style={{ color: colors.orange[500] }}>{stats.avgFatsPerDay}g</Text>
                        </View>
                    </View>
                </Card>

                {/* Weekly Breakdown */}
                <Card className="p-4 mb-8">
                    <Text className="font-bold text-lg mb-4" style={{ color: colors.text }}>{t('reports.weeklyBreakdown')}</Text>
                    {stats.weeklyBreakdown.map((week, index) => {
                        const weekStart = week.weekStart.getDate();
                        const weekEnd = week.weekEnd.getDate();
                        const weekLabel = `${t('reports.week')} ${index + 1} (${weekStart}-${weekEnd})`;

                        return (
                            <View key={index} className="mb-4 last:mb-0">
                                <Text className="text-sm mb-2" style={{ color: colors.textSecondary }}>{weekLabel}</Text>
                                <View className="flex-row justify-between">
                                    <View className="flex-1">
                                        <Text className="font-bold" style={{ color: colors.orange[500] }}>
                                            {week.avgCaloriesPerDay} cal/{t('reports.day')}
                                        </Text>
                                    </View>
                                    <View className="flex-1">
                                        <Text className="font-bold" style={{ color: colors.success }}>
                                            {week.totalWorkouts} {t('reports.workouts')}
                                        </Text>
                                    </View>
                                    <View className="flex-1">
                                        <Text className="font-bold" style={{ color: colors.primary }}>
                                            {week.totalWorkoutMinutes} min
                                        </Text>
                                    </View>
                                </View>
                                {index < stats.weeklyBreakdown.length - 1 && (
                                    <View className="h-px mt-4" style={{ backgroundColor: colors.surfaceHighlight }} />
                                )}
                            </View>
                        );
                    })}
                </Card>

                {/* Achievements */}
                <LinearGradient
                    colors={isDark ? ['#8b5cf6', '#db2777'] : [colors.primary, colors.pink[500]]}
                    className="rounded-xl p-6 border mb-8"
                    style={{ borderColor: isDark ? 'rgba(139, 92, 246, 0.4)' : 'transparent' }}
                >
                    <View className="flex-row items-center mb-3">
                        <Ionicons name="trophy" size={32} color="white" />
                        <Text className="text-white text-xl font-bold ml-3">{t('reports.monthlyAchievements')}</Text>
                    </View>
                    <View className="space-y-2">
                        {stats.totalWorkouts >= 12 && (
                            <View className="flex-row items-center py-2">
                                <Ionicons name="checkmark-circle" size={20} color="white" />
                                <Text className="text-white ml-2">🏆 12+ {t('reports.workoutsCompleted')}</Text>
                            </View>
                        )}
                        {stats.totalCaloriesConsumed > 0 && (
                            <View className="flex-row items-center py-2">
                                <Ionicons name="checkmark-circle" size={20} color="white" />
                                <Text className="text-white ml-2">📊 {t('reports.activeNutritionTracking')}</Text>
                            </View>
                        )}
                        {stats.totalWorkouts === 0 && stats.totalCaloriesConsumed === 0 && (
                            <Text className="text-white/80">{t('reports.startTracking')}</Text>
                        )}
                    </View>
                </LinearGradient>
            </View>
        </ScreenWrapper>
    );
}
