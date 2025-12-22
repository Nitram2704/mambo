import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getWeeklyStats } from '@/store/reportsStore';
import CalorieTrendChart from '@/components/CalorieTrendChart';
import MacroPieChart from '@/components/MacroPieChart';
import { exportAsImage } from '@/utils/exportUtils';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '@/hooks/use-app-theme';
import { Colors } from '@/constants/Colors';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { Card } from '@/components/ui/Card';

export default function WeeklyReportScreen() {
    const { t, i18n } = useTranslation();
    const { theme, isDark } = useAppTheme();
    const colors = Colors[theme];
    const router = useRouter();
    const [currentDate, setCurrentDate] = useState(new Date());
    const stats = getWeeklyStats(currentDate);

    const goToPreviousWeek = () => {
        const newDate = new Date(currentDate);
        newDate.setDate(currentDate.getDate() - 7);
        setCurrentDate(newDate);
    };

    const goToNextWeek = () => {
        const newDate = new Date(currentDate);
        newDate.setDate(currentDate.getDate() + 7);
        setCurrentDate(newDate);
    };

    const formatDateRange = () => {
        const locale = i18n.language === 'es' ? 'es-ES' : 'en-US';
        const start = stats.weekStart.toLocaleDateString(locale, { month: 'short', day: 'numeric' });
        const end = stats.weekEnd.toLocaleDateString(locale, { month: 'short', day: 'numeric' });
        return `${start} - ${end}`;
    };

    const viewRef = useRef(null);

    const handleShare = async () => {
        await exportAsImage(viewRef, `weekly-report-${stats.weekStart.toISOString().split('T')[0]}`);
    };

    return (
        <ScreenWrapper
            headerTitle={t('reports.weeklyTitle', 'Reporte Semanal')}
            scrollable
        >
            <View className="flex-row items-center justify-between p-4">
                <TouchableOpacity onPress={goToPreviousWeek} className="p-2">
                    <Ionicons name="chevron-back" size={24} color={colors.primary} />
                </TouchableOpacity>
                <Text className="text-lg font-bold" style={{ color: colors.text }}>{formatDateRange()}</Text>
                <TouchableOpacity onPress={goToNextWeek} className="p-2">
                    <Ionicons name="chevron-forward" size={24} color={colors.primary} />
                </TouchableOpacity>
            </View>

            <View className="flex-1 p-4">
                <View ref={viewRef} collapsable={false} style={{ backgroundColor: colors.background }}>
                    {/* Summary Cards */}
                    <View className="flex-row gap-4 mb-6">
                        <Card className="flex-1 p-4">
                            <View className="flex-row items-center mb-2">
                                <Ionicons name="flame" size={20} color={colors.accent} />
                                <Text className="text-sm ml-2" style={{ color: colors.textSecondary }}>{t('reports.caloriesPerDay')}</Text>
                            </View>
                            <Text className="text-2xl font-bold" style={{ color: colors.text }}>{stats.avgCaloriesPerDay}</Text>
                        </Card>
                        <Card className="flex-1 p-4">
                            <View className="flex-row items-center mb-2">
                                <Ionicons name="barbell" size={20} color={colors.success} />
                                <Text className="text-sm ml-2" style={{ color: colors.textSecondary }}>{t('reports.workouts')}</Text>
                            </View>
                            <Text className="text-2xl font-bold" style={{ color: colors.text }}>{stats.totalWorkouts}</Text>
                        </Card>
                    </View>

                    {/* Calorie Trend Chart */}
                    {stats.dailyData.length > 0 && (
                        <Card className="p-4 mb-6">
                            <Text className="font-bold text-lg mb-4" style={{ color: colors.text }}>{t('reports.calorieTrend')}</Text>
                            <CalorieTrendChart
                                dailyCalories={stats.dailyData.map(d => d.caloriesConsumed)}
                                labels={stats.dailyData.map(d => {
                                    const date = new Date(d.date);
                                    return date.toLocaleDateString(i18n.language === 'es' ? 'es-ES' : 'en-US', { weekday: 'short' });
                                })}
                            />
                        </Card>
                    )}

                    {/* Macro Pie Chart */}
                    {(stats.avgProteinPerDay > 0 || stats.avgCarbsPerDay > 0 || stats.avgFatsPerDay > 0) && (
                        <Card className="p-4 mb-6">
                            <Text className="font-bold text-lg mb-4" style={{ color: colors.text }}>{t('reports.macroDistribution')}</Text>
                            <MacroPieChart
                                protein={stats.avgProteinPerDay}
                                carbs={stats.avgCarbsPerDay}
                                fats={stats.avgFatsPerDay}
                            />
                        </Card>
                    )}

                    {/* Nutrition Breakdown */}
                    <Card className="p-4 mb-6">
                        <Text className="font-bold text-lg mb-4" style={{ color: colors.text }}>{t('reports.dailyAverage')}</Text>

                        <View className="mb-4">
                            <View className="flex-row justify-between mb-1">
                                <Text className="text-sm" style={{ color: colors.textSecondary }}>{t('nutrition.protein')}</Text>
                                <Text className="font-bold" style={{ color: colors.primary }}>{stats.avgProteinPerDay}g</Text>
                            </View>
                            <View className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: colors.surfaceHighlight }}>
                                <View className="h-full" style={{ width: '75%', backgroundColor: colors.primary }} />
                            </View>
                        </View>

                        <View className="mb-4">
                            <View className="flex-row justify-between mb-1">
                                <Text className="text-sm" style={{ color: colors.textSecondary }}>{t('nutrition.carbs')}</Text>
                                <Text className="font-bold" style={{ color: colors.success }}>{stats.avgCarbsPerDay}g</Text>
                            </View>
                            <View className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: colors.surfaceHighlight }}>
                                <View className="h-full" style={{ width: '80%', backgroundColor: colors.success }} />
                            </View>
                        </View>

                        <View>
                            <View className="flex-row justify-between mb-1">
                                <Text className="text-sm" style={{ color: colors.textSecondary }}>{t('nutrition.fats')}</Text>
                                <Text className="font-bold" style={{ color: colors.orange[500] }}>{stats.avgFatsPerDay}g</Text>
                            </View>
                            <View className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: colors.surfaceHighlight }}>
                                <View className="h-full" style={{ width: '65%', backgroundColor: colors.orange[500] }} />
                            </View>
                        </View>
                    </Card>

                    {/* Workout Summary */}
                    <Card className="p-4 mb-6">
                        <Text className="font-bold text-lg mb-4" style={{ color: colors.text }}>{t('reports.workouts')}</Text>
                        <View className="flex-row justify-between">
                            <View className="flex-1">
                                <Text className="text-sm" style={{ color: colors.textSecondary }}>{t('reports.totalMinutes')}</Text>
                                <Text className="text-xl font-bold" style={{ color: colors.text }}>{stats.totalWorkoutMinutes}</Text>
                            </View>
                            <View className="flex-1">
                                <Text className="text-sm" style={{ color: colors.textSecondary }}>{t('reports.avgPerDay')}</Text>
                                <Text className="text-xl font-bold" style={{ color: colors.text }}>{stats.avgWorkoutMinutesPerDay}min</Text>
                            </View>
                            <View className="flex-1">
                                <Text className="text-sm" style={{ color: colors.textSecondary }}>{t('reports.caloriesBurned')}</Text>
                                <Text className="text-xl font-bold" style={{ color: colors.text }}>{stats.totalCaloriesBurned}</Text>
                            </View>
                        </View>
                    </Card>

                    {/* Daily Breakdown */}
                    <Card className="p-4 mb-8">
                        <Text className="font-bold text-lg mb-4" style={{ color: colors.text }}>{t('reports.dailyBreakdown')}</Text>
                        {stats.dailyData.length === 0 ? (
                            <Text className="text-center py-4" style={{ color: colors.textMuted }}>{t('reports.noData')}</Text>
                        ) : (
                            stats.dailyData.map((day, index) => {
                                const date = new Date(day.date);
                                const dayName = date.toLocaleDateString(i18n.language === 'es' ? 'es-ES' : 'en-US', { weekday: 'short' });
                                const dayNum = date.getDate();

                                return (
                                    <View key={day.date} className="flex-row items-center justify-between py-3 border-b" style={{ borderBottomColor: colors.surfaceHighlight }}>
                                        <View className="flex-1">
                                            <Text className="font-bold capitalize" style={{ color: colors.text }}>{dayName}</Text>
                                            <Text className="text-xs" style={{ color: colors.textMuted }}>{dayNum}</Text>
                                        </View>
                                        <View className="flex-1">
                                            <Text className="font-bold" style={{ color: colors.orange[500] }}>{day.caloriesConsumed} cal</Text>
                                        </View>
                                        <View className="flex-1">
                                            <Text className="font-bold" style={{ color: colors.success }}>{day.workouts.length} {t('reports.workouts')}</Text>
                                        </View>
                                    </View>
                                );
                            })
                        )}
                    </Card>
                </View>
            </View>
        </ScreenWrapper>
    );
}
