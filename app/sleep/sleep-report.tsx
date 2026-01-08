import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSleepStore, formatSleepDuration } from '@/store/sleepStore';
import { calculateSleepStats } from '@/utils/sleepAnalytics';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '@/hooks/use-app-theme';
import { Colors } from '@/constants/Colors';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { Card } from '@/components/ui/Card';

export default function SleepReportScreen() {
    const { t, i18n } = useTranslation();
    const { theme, isDark } = useAppTheme();
    const router = useRouter();
    const { getWeekSleep, sleepGoals } = useSleepStore();

    const weekSleep = getWeekSleep();
    const stats = calculateSleepStats(weekSleep, sleepGoals);

    return (
        <ScreenWrapper safeArea={true}>
            {/* Header */}
            <View className="flex-row items-center justify-between p-4 border-b border-border">
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color={Colors[theme].text} />
                </TouchableOpacity>
                <Text className="text-text text-xl font-bold">{t('sleep.report.title')}</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
                {/* Summary Cards */}
                <View className="flex-row gap-4 mb-6">
                    <Card variant="glass" className="flex-1 p-5 overflow-hidden">
                        <Ionicons name="moon" size={28} color="#a855f7" />
                        <Text className="text-text-secondary text-sm mt-3 font-medium">{t('sleep.report.average')}</Text>
                        <Text className="text-text text-2xl font-bold mt-1">
                            {formatSleepDuration(stats.avgDuration)}
                        </Text>
                    </Card>
                    <Card variant="glass" className="flex-1 p-5 overflow-hidden">
                        <Ionicons name="star" size={28} color="#fbbf24" />
                        <Text className="text-text-secondary text-sm mt-3 font-medium">{t('sleep.report.quality')}</Text>
                        <Text className="text-text text-2xl font-bold mt-1">{stats.avgQuality.toFixed(1)}/5</Text>
                    </Card>
                </View>

                {/* Stats */}
                <Card variant="glass" className="p-5 mb-6">
                    <Text className="text-text font-bold text-lg mb-4">{t('sleep.report.stats')}</Text>

                    <View className="mb-4">
                        <View className="flex-row justify-between mb-2">
                            <Text className="text-text-secondary font-medium">{t('sleep.report.consistency')}</Text>
                            <Text className="text-text font-bold">{stats.consistency}%</Text>
                        </View>
                        <View className="h-2 rounded-full overflow-hidden bg-surface-highlight">
                            <LinearGradient
                                colors={['#a855f7', '#9333ea']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={{ width: `${stats.consistency}%`, height: '100%' }}
                            />
                        </View>
                    </View>

                    <View className="flex-row justify-between py-3 border-t border-border">
                        <Text className="text-text-secondary">{t('sleep.report.streak')}</Text>
                        <View className="flex-row items-center">
                            <Ionicons name="flame" size={16} color="#ea580c" />
                            <Text className="text-text font-bold ml-1">{stats.streak} {t('sleep.report.days')}</Text>
                        </View>
                    </View>

                    <View className="flex-row justify-between py-3 border-t border-border">
                        <Text className="text-text-secondary">{t('sleep.report.sleepDebt')}</Text>
                        <Text className={`font-bold ${stats.sleepDebt > 0 ? 'text-error' : 'text-success'}`}>
                            {stats.sleepDebt > 0 ? '+' : ''}{formatSleepDuration(Math.abs(stats.sleepDebt))}
                        </Text>
                    </View>
                </Card>

                {/* Weekly Breakdown */}
                <Card variant="glass" className="p-5 mb-6">
                    <Text className="text-text font-bold text-lg mb-4">{t('sleep.report.weeklyBreakdown')}</Text>
                    {weekSleep.length > 0 ? (
                        weekSleep.map((sleep, idx) => {
                            const date = new Date(sleep.date);
                            const dayName = date.toLocaleDateString(i18n.language === 'es' ? 'es-ES' : 'en-US', { weekday: 'long' });
                            const dayNum = date.getDate();

                            const targetMinutes = sleepGoals ? sleepGoals.targetHours * 60 : 480;
                            const meetsGoal = sleep.duration >= targetMinutes && sleep.quality >= 3;

                            return (
                                <View key={sleep.id} className={`py-3 ${idx !== weekSleep.length - 1 ? 'border-b border-border' : ''}`}>
                                    <View className="flex-row justify-between items-center mb-2">
                                        <View className="flex-row items-center flex-1">
                                            {meetsGoal && <Ionicons name="checkmark-circle" size={16} color="#22c55e" />}
                                            <Text className="text-text capitalize ml-2 font-medium">{dayName} {dayNum}</Text>
                                        </View>
                                        <Text className="text-text font-bold">{formatSleepDuration(sleep.duration)}</Text>
                                    </View>
                                    <View className="flex-row items-center">
                                        <Text className="text-text-muted text-sm mr-2">{t('sleep.quality')}</Text>
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <Ionicons
                                                key={star}
                                                name={sleep.quality >= star ? 'star' : 'star-outline'}
                                                size={12}
                                                color={sleep.quality >= star ? '#fbbf24' : Colors[theme].textMuted}
                                            />
                                        ))}
                                    </View>
                                    {sleep.tags && sleep.tags.length > 0 && (
                                        <View className="flex-row flex-wrap gap-1 mt-2">
                                            {sleep.tags.map((tag) => (
                                                <View key={tag} className="bg-secondary/10 px-2 py-1 rounded-md border border-secondary/20">
                                                    <Text className="text-secondary text-xs">{t(`sleep.tags.${tag}`)}</Text>
                                                </View>
                                            ))}
                                        </View>
                                    )}
                                </View>
                            );
                        })
                    ) : (
                        <Text className="text-text-muted text-center py-4">
                            {t('sleep.report.noLogs')}
                        </Text>
                    )}
                </Card>

                {/* Recommendations */}
                {stats.avgDuration < (sleepGoals?.targetHours || 8) * 60 && (
                    <Card variant="glass" className="p-5 mb-6 border-warning/30 bg-warning/10">
                        <View className="flex-row items-center mb-2">
                            <Ionicons name="warning" size={20} color="#fbbf24" />
                            <Text className="text-warning font-bold ml-2">{t('sleep.report.recommendation')}</Text>
                        </View>
                        <Text className="text-text text-sm leading-5">
                            {t('sleep.report.recommendationNote', { hours: sleepGoals?.targetHours || 8 })}
                        </Text>
                    </Card>
                )}
            </ScrollView>
        </ScreenWrapper>
    );
}
