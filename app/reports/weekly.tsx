import React, { useState, useRef } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { AccessibleText } from '@/components/ui/AccessibleText';
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
            bg="bg-background"
        >
            <View className="flex-row items-center justify-between p-4">
                <TouchableOpacity
                    onPress={goToPreviousWeek}
                    className="w-10 h-10 rounded-2xl bg-primary/20 items-center justify-center"
                >
                    <Ionicons name="chevron-back" size={24} color={colors.primary} />
                </TouchableOpacity>
                <AccessibleText weight="bold" className="text-lg text-text">{formatDateRange()}</AccessibleText>
                <TouchableOpacity
                    onPress={goToNextWeek}
                    className="w-10 h-10 rounded-2xl bg-primary/20 items-center justify-center"
                >
                    <Ionicons name="chevron-forward" size={24} color={colors.primary} />
                </TouchableOpacity>
            </View>

            <View className="flex-1 p-4">
                <View ref={viewRef} collapsable={false} style={{ backgroundColor: 'transparent' }}>
                    {/* Summary Cards */}
                    <View className="flex-row gap-4 mb-6">
                        <Card variant="glass" className="flex-1 p-4 border-warning/20">
                            <View className="flex-row items-center mb-2">
                                <View className="w-8 h-8 rounded-xl bg-warning/20 items-center justify-center">
                                    <Ionicons name="flame" size={18} color={colors.warning} />
                                </View>
                                <AccessibleText weight="bold" className="text-[10px] ml-2 text-text-secondary uppercase tracking-widest">{t('reports.caloriesPerDay')}</AccessibleText>
                            </View>
                            <AccessibleText weight="bold" className="text-2xl text-text">{stats.avgCaloriesPerDay}</AccessibleText>
                        </Card>
                        <Card variant="glass" className="flex-1 p-4 border-success/20">
                            <View className="flex-row items-center mb-2">
                                <View className="w-8 h-8 rounded-xl bg-success/20 items-center justify-center">
                                    <Ionicons name="barbell" size={18} color={colors.success} />
                                </View>
                                <AccessibleText weight="bold" className="text-[10px] ml-2 text-text-secondary uppercase tracking-widest">{t('reports.workouts')}</AccessibleText>
                            </View>
                            <AccessibleText weight="bold" className="text-2xl text-text">{stats.totalWorkouts}</AccessibleText>
                        </Card>
                    </View>

                    {/* Calorie Trend Chart */}
                    {stats.dailyData.length > 0 && (
                        <Card variant="glass" className="p-4 mb-6 border-primary/20">
                            <AccessibleText weight="bold" className="text-lg mb-4 text-text">{t('reports.calorieTrend')}</AccessibleText>
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
                        <Card variant="glass" className="p-4 mb-6 border-secondary/20">
                            <AccessibleText weight="bold" className="text-lg mb-4 text-text">{t('reports.macroDistribution')}</AccessibleText>
                            <MacroPieChart
                                protein={stats.avgProteinPerDay}
                                carbs={stats.avgCarbsPerDay}
                                fats={stats.avgFatsPerDay}
                            />
                        </Card>
                    )}

                    {/* Nutrition Breakdown */}
                    <Card variant="glass" className="p-4 mb-6 border-border/10">
                        <AccessibleText weight="bold" className="text-lg mb-4 text-text">{t('reports.dailyAverage')}</AccessibleText>

                        <View className="mb-4">
                            <View className="flex-row justify-between mb-1">
                                <AccessibleText weight="bold" className="text-xs text-text-secondary uppercase tracking-widest">{t('nutrition.protein')}</AccessibleText>
                                <AccessibleText weight="bold" className="text-primary">{stats.avgProteinPerDay}g</AccessibleText>
                            </View>
                            <View className="h-2 bg-surface-highlight/50 rounded-full overflow-hidden border border-border/5">
                                <View className="h-full bg-primary" style={{ width: '75%' }} />
                            </View>
                        </View>

                        <View className="mb-4">
                            <View className="flex-row justify-between mb-1">
                                <AccessibleText weight="bold" className="text-xs text-text-secondary uppercase tracking-widest">{t('nutrition.carbs')}</AccessibleText>
                                <AccessibleText weight="bold" className="text-success">{stats.avgCarbsPerDay}g</AccessibleText>
                            </View>
                            <View className="h-2 bg-surface-highlight/50 rounded-full overflow-hidden border border-border/5">
                                <View className="h-full bg-success" style={{ width: '80%' }} />
                            </View>
                        </View>

                        <View>
                            <View className="flex-row justify-between mb-1">
                                <AccessibleText weight="bold" className="text-xs text-text-secondary uppercase tracking-widest">{t('nutrition.fats')}</AccessibleText>
                                <AccessibleText weight="bold" className="text-warning">{stats.avgFatsPerDay}g</AccessibleText>
                            </View>
                            <View className="h-2 bg-surface-highlight/50 rounded-full overflow-hidden border border-border/5">
                                <View className="h-full bg-warning" style={{ width: '65%' }} />
                            </View>
                        </View>
                    </Card>

                    {/* Workout Summary */}
                    <Card variant="glass" className="p-4 mb-6 border-info/20">
                        <AccessibleText weight="bold" className="text-lg mb-4 text-text">{t('reports.workouts')}</AccessibleText>
                        <View className="flex-row justify-between">
                            <View className="flex-1">
                                <AccessibleText weight="bold" className="text-[10px] text-text-secondary uppercase tracking-widest">{t('reports.totalMinutes')}</AccessibleText>
                                <AccessibleText weight="bold" className="text-xl text-text">{stats.totalWorkoutMinutes}</AccessibleText>
                            </View>
                            <View className="flex-1">
                                <AccessibleText weight="bold" className="text-[10px] text-text-secondary uppercase tracking-widest">{t('reports.avgPerDay')}</AccessibleText>
                                <AccessibleText weight="bold" className="text-xl text-text">{stats.avgWorkoutMinutesPerDay}min</AccessibleText>
                            </View>
                            <View className="flex-1">
                                <AccessibleText weight="bold" className="text-[10px] text-text-secondary uppercase tracking-widest">{t('reports.caloriesBurned')}</AccessibleText>
                                <AccessibleText weight="bold" className="text-xl text-text">{stats.totalCaloriesBurned}</AccessibleText>
                            </View>
                        </View>
                    </Card>

                    {/* Daily Breakdown */}
                    <Card variant="glass" className="p-4 mb-8 border-border/10">
                        <AccessibleText weight="bold" className="text-lg mb-4 text-text">{t('reports.dailyBreakdown')}</AccessibleText>
                        {stats.dailyData.length === 0 ? (
                            <AccessibleText className="text-center py-4 text-text-muted">{t('reports.noData')}</AccessibleText>
                        ) : (
                            stats.dailyData.map((day, index) => {
                                const date = new Date(day.date);
                                const dayName = date.toLocaleDateString(i18n.language === 'es' ? 'es-ES' : 'en-US', { weekday: 'short' });
                                const dayNum = date.getDate();

                                return (
                                    <View key={day.date} className="flex-row items-center justify-between py-3 border-b border-border/10">
                                        <View className="flex-1">
                                            <AccessibleText weight="bold" className="capitalize text-text">{dayName}</AccessibleText>
                                            <AccessibleText className="text-xs text-text-muted">{dayNum}</AccessibleText>
                                        </View>
                                        <View className="flex-1">
                                            <AccessibleText weight="bold" className="text-warning">{day.caloriesConsumed} cal</AccessibleText>
                                        </View>
                                        <View className="flex-1 items-end">
                                            <View className="bg-success/20 px-2 py-1 rounded-lg">
                                                <AccessibleText weight="bold" className="text-success text-xs">{day.workouts.length} {t('reports.workouts')}</AccessibleText>
                                            </View>
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
