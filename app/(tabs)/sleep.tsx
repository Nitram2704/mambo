import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
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

const { width } = Dimensions.get('window');

export default function SleepScreen() {
    const { t } = useTranslation();
    const { theme } = useAppTheme();
    const isDark = theme === 'dark';
    const { sleepLogs, getWeeklyStats } = useSleepStore();
    const [isModalVisible, setIsModalVisible] = useState(false);

    const lastNightSleep = useMemo(() => {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = getLocalDateString(yesterday);
        return sleepLogs[yesterdayStr] || null;
    }, [sleepLogs]);

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
                    <Text className="text-4xl font-black" style={{ color: Colors[theme].text }}>{t('sleep.title')}</Text>
                </View>

                {/* Last Night Summary */}
                <Card className="p-6 mb-6 overflow-hidden">
                    <LinearGradient
                        colors={isDark ? ['rgba(59, 130, 246, 0.1)', 'transparent'] : ['rgba(59, 130, 246, 0.05)', 'transparent']}
                        className="absolute inset-0"
                    />
                    <View className="flex-row justify-between items-start mb-6">
                        <View>
                            <Text className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: Colors[theme].textSecondary }}>
                                {t('sleep.lastNight')}
                            </Text>
                            {lastNightSleep ? (
                                <Text className="text-4xl font-black" style={{ color: Colors[theme].text }}>
                                    {formatSleepDuration(lastNightSleep.duration)}
                                </Text>
                            ) : (
                                <Text className="text-2xl font-bold" style={{ color: Colors[theme].textMuted }}>
                                    {t('sleep.noLogs')}
                                </Text>
                            )}
                        </View>
                        <View className="bg-blue-500/10 p-3 rounded-2xl">
                            <Ionicons name="moon" size={32} color="#3b82f6" />
                        </View>
                    </View>

                    {lastNightSleep && (
                        <View className="flex-row gap-4">
                            <View className="flex-1 bg-blue-500/5 p-3 rounded-xl border" style={{ borderColor: 'rgba(59, 130, 246, 0.1)' }}>
                                <Text className="text-[10px] font-bold uppercase mb-1" style={{ color: Colors[theme].textMuted }}>{t('sleep.quality')}</Text>
                                <Text className="font-bold" style={{ color: Colors[theme].text }}>{lastNightSleep.quality}/10</Text>
                            </View>
                            <View className="flex-1 bg-blue-500/5 p-3 rounded-xl border" style={{ borderColor: 'rgba(59, 130, 246, 0.1)' }}>
                                <Text className="text-[10px] font-bold uppercase mb-1" style={{ color: Colors[theme].textMuted }}>{t('sleep.lastSession')}</Text>
                                <Text className="font-bold" style={{ color: Colors[theme].text }}>{new Date(lastNightSleep.bedTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                            </View>
                        </View>
                    )}

                    {!lastNightSleep && (
                        <TouchableOpacity
                            onPress={() => setIsModalVisible(true)}
                            className="bg-blue-600 py-4 rounded-2xl items-center"
                        >
                            <Text className="text-white font-bold">{t('sleep.register')}</Text>
                        </TouchableOpacity>
                    )}
                </Card>

                {/* Weekly Activity */}
                <View className="mb-8">
                    <View className="flex-row justify-between items-end mb-4">
                        <Text className="text-xl font-bold" style={{ color: Colors[theme].text }}>{t('sleep.thisWeek')}</Text>
                        <Text className="text-xs font-bold" style={{ color: Colors[theme].textSecondary }}>
                            {t('sleep.average')}: {formatSleepDuration(weeklyStats.avgDuration)}
                        </Text>
                    </View>

                    <Card className="p-4 flex-row justify-between items-end h-40">
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
                                                backgroundColor: isToday ? '#3b82f6' : 'rgba(59, 130, 246, 0.3)',
                                                minHeight: day.log ? 4 : 0
                                            }}
                                        />
                                    </View>
                                    <Text className="text-[10px] font-bold" style={{ color: isToday ? '#3b82f6' : Colors[theme].textMuted }}>
                                        {day.dayName}
                                    </Text>
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
                        <Card className="p-5 items-center">
                            <View className="bg-blue-500/10 p-3 rounded-full mb-3">
                                <Ionicons name="add" size={24} color="#3b82f6" />
                            </View>
                            <Text className="font-bold text-sm" style={{ color: Colors[theme].text }}>{t('sleep.register')}</Text>
                        </Card>
                    </TouchableOpacity>

                    <TouchableOpacity className="flex-1">
                        <Card className="p-5 items-center">
                            <View className="bg-indigo-500/10 p-3 rounded-full mb-3">
                                <Ionicons name="stats-chart" size={24} color="#6366f1" />
                            </View>
                            <Text className="font-bold text-sm" style={{ color: Colors[theme].text }}>{t('sleep.reports')}</Text>
                        </Card>
                    </TouchableOpacity>

                    <TouchableOpacity className="flex-1">
                        <Card className="p-5 items-center">
                            <View className="bg-purple-500/10 p-3 rounded-full mb-3">
                                <Ionicons name="trophy" size={24} color="#a855f7" />
                            </View>
                            <Text className="font-bold text-sm" style={{ color: Colors[theme].text }}>{t('sleep.goals.title')}</Text>
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
