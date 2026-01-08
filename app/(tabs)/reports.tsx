import React from 'react';
import { View, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { Card } from '@/components/ui/Card';
import { MuscleVolumeChart } from '@/components/MuscleVolumeChart';
import { OneRMChart } from '@/components/OneRMChart';
import { useWorkoutHistoryStore } from '@/store/workoutHistoryStore';
import { AccessibleText } from '@/components/ui/AccessibleText';
import { useAppTheme } from '@/hooks/use-app-theme';
import { Colors } from '@/constants/Colors';

export default function ReportsScreen() {
    const router = useRouter();
    const { t } = useTranslation();
    const { theme } = useAppTheme();
    const colors = Colors[theme];
    const { workouts } = useWorkoutHistoryStore();

    // Calculate stats
    const thisWeekWorkouts = workouts.filter(w => {
        const workoutDate = new Date(w.startTime);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return workoutDate >= weekAgo;
    });

    const weeklyVolume = thisWeekWorkouts.reduce((sum, w) => sum + w.volume, 0);
    const totalWorkouts = thisWeekWorkouts.length;

    return (
        <ScreenWrapper bg="bg-background" safeArea={true}>
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                <View className="p-4">
                    {/* Header */}
                    <View className="mb-6 mt-2">
                        <AccessibleText weight="bold" className="text-text-secondary text-xs uppercase tracking-widest">
                            {t('reports.analysis')}
                        </AccessibleText>
                        <AccessibleText weight="bold" className="text-text text-4xl mt-1">{t('reports.title')}</AccessibleText>
                    </View>

                    {/* Quick Stats */}
                    <Card variant="glass" className="mb-6 border-border/10">
                        <AccessibleText weight="bold" className="text-text text-lg mb-4">{t('reports.thisWeek')}</AccessibleText>
                        <View className="flex-row justify-between">
                            <View className="items-center flex-1">
                                <View className="w-12 h-12 rounded-2xl bg-warning/20 items-center justify-center mb-2">
                                    <Ionicons name="flame" size={24} color={colors.warning} />
                                </View>
                                <AccessibleText weight="bold" className="text-text-secondary text-[10px] uppercase tracking-widest">{t('reports.volume')}</AccessibleText>
                                <AccessibleText weight="bold" className="text-text text-lg mt-1">
                                    {weeklyVolume > 0 ? `${weeklyVolume.toLocaleString()}kg` : '-'}
                                </AccessibleText>
                            </View>
                            <View className="items-center flex-1">
                                <View className="w-12 h-12 rounded-2xl bg-success/20 items-center justify-center mb-2">
                                    <Ionicons name="barbell" size={24} color={colors.success} />
                                </View>
                                <AccessibleText weight="bold" className="text-text-secondary text-[10px] uppercase tracking-widest">{t('reports.workouts')}</AccessibleText>
                                <AccessibleText weight="bold" className="text-text font-black text-lg mt-1">{totalWorkouts}</AccessibleText>
                            </View>
                            <View className="items-center flex-1">
                                <View className="w-12 h-12 rounded-2xl bg-primary/20 items-center justify-center mb-2">
                                    <Ionicons name="trophy" size={24} color={colors.primary} />
                                </View>
                                <AccessibleText weight="bold" className="text-text-secondary text-[10px] uppercase tracking-widest">{t('reports.streak')}</AccessibleText>
                                <AccessibleText weight="bold" className="text-text text-lg mt-1">0</AccessibleText>
                            </View>
                        </View>
                    </Card>

                    {/* Weekly Report Card */}
                    <TouchableOpacity
                        onPress={() => router.push('/reports/weekly')}
                        className="mb-4"
                        activeOpacity={0.7}
                    >
                        <Card variant="glass" className="border-warning/30 p-6">
                            <View className="flex-row items-center justify-between mb-3">
                                <View className="bg-warning/20 p-3 rounded-2xl">
                                    <Ionicons name="calendar-outline" size={28} color={colors.warning} />
                                </View>
                                <Ionicons name="chevron-forward" size={24} color={colors.warning} />
                            </View>
                            <AccessibleText weight="bold" className="text-text text-2xl mb-2">{t('reports.weeklyReport')}</AccessibleText>
                            <AccessibleText className="text-text-secondary text-sm">{t('reports.weeklyReportDesc')}</AccessibleText>
                        </Card>
                    </TouchableOpacity>

                    {/* Monthly Report Card */}
                    <TouchableOpacity
                        onPress={() => router.push('/reports/monthly')}
                        className="mb-4"
                        activeOpacity={0.7}
                    >
                        <Card variant="glass" className="border-primary/30 p-6">
                            <View className="flex-row items-center justify-between mb-3">
                                <View className="bg-primary/20 p-3 rounded-2xl">
                                    <Ionicons name="bar-chart-outline" size={28} color={colors.primary} />
                                </View>
                                <Ionicons name="chevron-forward" size={24} color={colors.primary} />
                            </View>
                            <AccessibleText weight="bold" className="text-text text-2xl mb-2">{t('reports.monthlyReport')}</AccessibleText>
                            <AccessibleText className="text-text-secondary text-sm">{t('reports.monthlyReportDesc')}</AccessibleText>
                        </Card>
                    </TouchableOpacity>

                    {/* Advanced Analytics Card */}
                    <TouchableOpacity
                        onPress={() => router.push('/analytics/advanced')}
                        className="mb-4"
                        activeOpacity={0.7}
                    >
                        <Card variant="glass" className="border-success/30 p-6">
                            <View className="flex-row items-center justify-between mb-3">
                                <View className="bg-success/20 p-3 rounded-2xl">
                                    <Ionicons name="sparkles-outline" size={28} color={colors.success} />
                                </View>
                                <View className="bg-success/20 px-2 py-1 rounded-full">
                                    <AccessibleText weight="bold" className="text-success text-[10px] uppercase tracking-widest">{t('common.new')}</AccessibleText>
                                </View>
                                <Ionicons name="chevron-forward" size={24} color={colors.success} />
                            </View>
                            <AccessibleText weight="bold" className="text-text text-2xl mb-2">{t('reports.advancedAnalytics')}</AccessibleText>
                            <AccessibleText className="text-text-secondary text-sm">{t('reports.advancedAnalyticsDesc')}</AccessibleText>
                        </Card>
                    </TouchableOpacity>

                    {/* Explorar Card - Commented out until /explore route is created
                    <TouchableOpacity
                        onPress={() => router.push('/(tabs)/profile')}
                        className="mb-4"
                        activeOpacity={0.7}
                    >
                        <Card variant="glass" className="border-primary/30 p-6">
                            <View className="flex-row items-center justify-between mb-3">
                                <View className="bg-primary/20 p-3 rounded-2xl">
                                    <Ionicons name="compass-outline" size={28} color={colors.primary} />
                                </View>
                                <Ionicons name="chevron-forward" size={24} color={colors.primary} />
                            </View>
                            <AccessibleText weight="bold" className="text-text text-2xl mb-2">{t('reports.exploreAcademy')}</AccessibleText>
                            <AccessibleText className="text-text-secondary text-sm">{t('reports.exploreAcademyDesc')}</AccessibleText>
                        </Card>
                    </TouchableOpacity>
                    */}

                    {/* Full History Card */}
                    <TouchableOpacity
                        onPress={() => router.push('/history')}
                        className="mb-6"
                        activeOpacity={0.7}
                    >
                        <Card variant="glass" className="border-secondary/30 p-6">
                            <View className="flex-row items-center justify-between mb-3">
                                <View className="bg-secondary/20 p-3 rounded-2xl">
                                    <Ionicons name="time-outline" size={28} color={colors.secondary} />
                                </View>
                                <Ionicons name="chevron-forward" size={24} color={colors.secondary} />
                            </View>
                            <AccessibleText weight="bold" className="text-text text-2xl mb-2">{t('reports.fullHistory')}</AccessibleText>
                            <AccessibleText className="text-text-secondary text-sm">{t('reports.fullHistoryDesc')}</AccessibleText>
                        </Card>
                    </TouchableOpacity>

                    {/* Advanced Analytics */}
                    <View className="mb-4">
                        <MuscleVolumeChart />
                    </View>

                    <View className="mb-8">
                        <OneRMChart />
                    </View>
                </View>
            </ScrollView>
        </ScreenWrapper>
    );
}
