import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { Card } from '@/components/ui/Card';
import { useSleepStore, formatSleepDuration } from '@/store/sleepStore';
import { Colors } from '@/constants/Colors';
import { getLocalDateString } from '@/utils/dateUtils';
import SleepLogModal from '@/components/SleepLogModal';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '@/hooks/use-app-theme';
import { AccessibleText } from '@/components/ui/AccessibleText';

const { width } = Dimensions.get('window');

export default function SleepScreen() {
    const { t } = useTranslation();
    const { theme } = useAppTheme();
    const router = useRouter();
    const isDark = theme === 'dark';
    const { sleepLogs, getWeeklyStats, getLastNightSleep, fetchSleepLogs } = useSleepStore();
    const [isModalVisible, setIsModalVisible] = useState(false);

    React.useEffect(() => {
        fetchSleepLogs();
    }, []);

    const lastNightSleep = useMemo(() => getLastNightSleep(), [sleepLogs, getLastNightSleep]);

    const weeklyStats = useMemo(() => getWeeklyStats(), [getWeeklyStats]);

    const weekDays = useMemo(() => {
        const days = [];
        const today = new Date();
        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            const dateStr = getLocalDateString(date);
            days.push({
                dayName: date.toLocaleDateString('es-ES', { weekday: 'short' }).charAt(0),
                dateStr,
                log: sleepLogs[dateStr]
            });
        }
        return days;
    }, [sleepLogs]);

    return (
        <ScreenWrapper safeArea={true}>
            <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View className="mb-8 mt-2">
                    <AccessibleText variant="h1" weight="bold" className="text-text text-4xl font-black">{t('sleep.title')}</AccessibleText>
                </View>

                {/* Last Night Summary */}
                <Card variant="glass" className="p-6 mb-6 overflow-hidden">
                    <View className="flex-row justify-between items-start mb-6">
                        <View>
                            <AccessibleText weight="bold" className="text-text-secondary text-xs uppercase tracking-widest mb-1">
                                {t('sleep.lastNight')}
                            </AccessibleText>
                            {lastNightSleep ? (
                                <AccessibleText weight="bold" className="text-text text-4xl font-black">
                                    {formatSleepDuration(lastNightSleep.duration)}
                                </AccessibleText>
                            ) : (
                                <AccessibleText weight="bold" className="text-text-muted text-2xl font-bold">
                                    {t('sleep.noLogs')}
                                </AccessibleText>
                            )}
                        </View>
                        <View className="bg-primary/10 p-3 rounded-2xl">
                            <Ionicons name="moon" size={32} color={Colors[theme].primary} />
                        </View>
                    </View>

                    {lastNightSleep && (
                        <View className="flex-row gap-4">
                            <View className="flex-1 bg-primary/5 p-3 rounded-xl border border-primary/20">
                                <AccessibleText weight="bold" className="text-text-muted text-[10px] uppercase mb-1">{t('sleep.quality')}</AccessibleText>
                                <AccessibleText weight="bold" className="text-text font-bold">{lastNightSleep.quality}/10</AccessibleText>
                            </View>
                            <View className="flex-1 bg-primary/5 p-3 rounded-xl border border-primary/20">
                                <AccessibleText weight="bold" className="text-text-muted text-[10px] uppercase mb-1">{t('sleep.lastSession')}</AccessibleText>
                                <AccessibleText weight="bold" className="text-text font-bold">{new Date(lastNightSleep.bedTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</AccessibleText>
                            </View>
                        </View>
                    )}

                    {!lastNightSleep && (
                        <TouchableOpacity
                            onPress={() => setIsModalVisible(true)}
                            className="bg-blue-600 py-4 rounded-2xl items-center"
                            style={{ backgroundColor: Colors[theme].primary }}
                        >
                            <AccessibleText weight="bold" className="text-white font-bold">{t('sleep.register')}</AccessibleText>
                        </TouchableOpacity>
                    )}
                </Card>

                {/* Weekly Activity */}
                <View className="mb-8">
                    <View className="flex-row justify-between items-end mb-4">
                        <AccessibleText weight="bold" className="text-text text-xl font-bold">{t('sleep.thisWeek')}</AccessibleText>
                        <AccessibleText weight="bold" className="text-text-secondary text-xs font-bold">
                            {t('sleep.average')}: {formatSleepDuration(weeklyStats.avgDuration)}
                        </AccessibleText>
                    </View>

                    <Card variant="glass" className="p-4 flex-row justify-between items-end h-40">
                        {weekDays.map((day, index) => {
                            const height = day.log ? Math.min((day.log.duration / 600) * 100, 100) : 0;
                            const isToday = index === 6;

                            return (
                                <View key={day.dateStr} className="items-center flex-1">
                                    <View className="w-full px-1 flex-1 justify-end mb-2">
                                        <View
                                            className="w-full rounded-t-lg"
                                            style={{
                                                height: `${height}%`,
                                                backgroundColor: isToday ? Colors[theme].primary : Colors[theme].primary + '50',
                                                minHeight: day.log ? 4 : 0
                                            }}
                                        />
                                    </View>
                                    <AccessibleText weight="bold" className="text-[10px]" style={{ color: isToday ? Colors[theme].primary : Colors[theme].textMuted }}>
                                        {day.dayName}
                                    </AccessibleText>
                                </View>
                            );
                        })}
                    </Card>
                </View>

                {/* Quick Actions */}
                <View className="flex-row gap-4 mb-8">
                    <TouchableOpacity
                        onPress={() => setIsModalVisible(true)}
                        className="flex-1"
                    >
                        <Card variant="glass" className="p-5 items-center">
                            <View className="bg-primary/10 p-3 rounded-full mb-3">
                                <Ionicons name="add" size={24} color={Colors[theme].primary} />
                            </View>
                            <AccessibleText weight="bold" className="text-text font-bold text-sm">{t('sleep.register')}</AccessibleText>
                        </Card>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => router.push('/sleep/sleep-report')}
                        className="flex-1"
                    >
                        <Card variant="glass" className="p-5 items-center">
                            <View className="bg-secondary/10 p-3 rounded-full mb-3">
                                <Ionicons name="stats-chart" size={24} color={Colors[theme].secondary} />
                            </View>
                            <AccessibleText weight="bold" className="text-text font-bold text-sm">{t('sleep.reports')}</AccessibleText>
                        </Card>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => router.push('/sleep/sleep-goals')}
                        className="flex-1"
                    >
                        <Card variant="glass" className="p-5 items-center">
                            <View className="bg-warning/10 p-3 rounded-full mb-3">
                                <Ionicons name="trophy" size={24} color={Colors[theme].warning} />
                            </View>
                            <AccessibleText weight="bold" className="text-text font-bold text-sm">{t('sleep.goals.title')}</AccessibleText>
                        </Card>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            <SleepLogModal
                visible={isModalVisible}
                onClose={() => setIsModalVisible(false)}
            />
        </ScreenWrapper>
    );
}
