import React, { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, Switch, Platform, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { AccessibleText } from '@/components/ui/AccessibleText';
import { Card } from '@/components/ui/Card';
import { useAppTheme } from '@/hooks/use-app-theme';
import { Colors } from '@/constants/Colors';
import { useAlarmStore, Alarm } from '@/store/alarmStore';
import { getWakeTimesFromBedtime, SleepCycle } from '@/utils/sleepCycleDetection';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { AlarmSettingsModal } from '@/components/sleep/AlarmSettingsModal';
import { PremiumButton } from '@/components/ui/PremiumButton';
import { useTranslation } from 'react-i18next';

const { width } = Dimensions.get('window');

export default function SmartAlarmScreen() {
    const { t } = useTranslation();
    const router = useRouter();
    const { theme } = useAppTheme();
    const colors = Colors[theme];
    const { alarms, addAlarm, toggleAlarm, deleteAlarm, updateAlarm } = useAlarmStore();

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingAlarm, setEditingAlarm] = useState<Alarm | null>(null);
    const [recommendedTimes, setRecommendedTimes] = useState<SleepCycle[]>([]);

    useEffect(() => {
        setRecommendedTimes(getWakeTimesFromBedtime());
    }, []);

    const handleAddPress = () => {
        setEditingAlarm(null);
        setIsModalVisible(true);
    };

    const handleEditPress = (alarm: Alarm) => {
        setEditingAlarm(alarm);
        setIsModalVisible(true);
    };

    const handleSaveAlarm = (updates: Partial<Alarm>) => {
        if (editingAlarm) {
            updateAlarm(editingAlarm.id, updates);
        } else {
            addAlarm({
                time: updates.time || '07:00',
                enabled: true,
                days: updates.days || [1, 2, 3, 4, 5],
                label: updates.label || t('sleep.smartAlarm.defaultLabel'),
                sound: updates.sound || 'default',
                smartWake: updates.smartWake ?? true,
                smartWakeWindow: updates.smartWakeWindow || 30,
                sunriseEffect: updates.sunriseEffect ?? true,
            });
        }
    };

    return (
        <ScreenWrapper safeArea={true}>
            {/* Header */}
            <View className="px-6 py-4 flex-row items-center justify-between">
                <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 rounded-full bg-surface-highlight items-center justify-center">
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <AccessibleText weight="bold" className="text-text text-xl">{t('sleep.smartAlarm.title')}</AccessibleText>
                <TouchableOpacity
                    onPress={handleAddPress}
                    className="w-10 h-10 rounded-full bg-primary items-center justify-center shadow-lg shadow-primary/30"
                >
                    <Ionicons name="add" size={24} color="#fff" />
                </TouchableOpacity>
            </View>

            <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
                {/* Active Alarms */}
                <View className="mt-6 mb-8">
                    <AccessibleText weight="bold" className="text-text-secondary text-xs uppercase tracking-widest mb-4">
                        {t('sleep.smartAlarm.yourAlarms')}
                    </AccessibleText>

                    {alarms.length === 0 ? (
                        <Card variant="glass" className="p-8 items-center justify-center border-dashed border-2 border-border/20">
                            <Ionicons name="alarm-outline" size={48} color={colors.textMuted} />
                            <AccessibleText className="text-text-muted mt-4 text-center">
                                {t('sleep.smartAlarm.noAlarms')}
                            </AccessibleText>
                        </Card>
                    ) : (
                        alarms.map((alarm, index) => (
                            <Animated.View key={alarm.id} entering={FadeInDown.delay(index * 100)}>
                                <TouchableOpacity
                                    onPress={() => handleEditPress(alarm)}
                                    activeOpacity={0.7}
                                >
                                    <Card variant="glass" className="p-5 mb-4">
                                        <View className="flex-row justify-between items-center">
                                            <View>
                                                <AccessibleText weight="bold" className="text-text text-4xl font-black">
                                                    {alarm.time}
                                                </AccessibleText>
                                                <View className="flex-row mt-2">
                                                    {['D', 'L', 'M', 'X', 'J', 'V', 'S'].map((d, i) => (
                                                        <AccessibleText
                                                            key={i}
                                                            className={`text-[10px] mr-2 ${alarm.days.includes(i) ? 'text-primary font-bold' : 'text-text-muted'}`}
                                                        >
                                                            {d}
                                                        </AccessibleText>
                                                    ))}
                                                </View>
                                            </View>
                                            <View className="flex-row items-center">
                                                <Switch
                                                    value={alarm.enabled}
                                                    onValueChange={() => toggleAlarm(alarm.id)}
                                                    trackColor={{ false: colors.surfaceHighlight, true: colors.primary }}
                                                    thumbColor="#fff"
                                                />
                                                <TouchableOpacity
                                                    onPress={() => deleteAlarm(alarm.id)}
                                                    className="ml-4 p-2"
                                                >
                                                    <Ionicons name="trash-outline" size={20} color={colors.error} />
                                                </TouchableOpacity>
                                            </View>
                                        </View>

                                        {(alarm.smartWake || alarm.sunriseEffect) && (
                                            <View className="mt-4 pt-4 border-t border-border/10 flex-row items-center flex-wrap gap-4">
                                                {alarm.smartWake && (
                                                    <View className="flex-row items-center">
                                                        <Ionicons name="sparkles" size={14} color={colors.primary} />
                                                        <AccessibleText className="text-text-secondary text-[10px] ml-2">
                                                            {t('sleep.smartAlarm.smartWake')} ({alarm.smartWakeWindow}m)
                                                        </AccessibleText>
                                                    </View>
                                                )}
                                                {alarm.sunriseEffect && (
                                                    <View className="flex-row items-center">
                                                        <Ionicons name="sunny" size={14} color={colors.warning} />
                                                        <AccessibleText className="text-text-secondary text-[10px] ml-2">
                                                            {t('sleep.smartAlarm.sunriseEffect')}
                                                        </AccessibleText>
                                                    </View>
                                                )}
                                            </View>
                                        )}
                                    </Card>
                                </TouchableOpacity>
                            </Animated.View>
                        ))
                    )}
                </View>

                {/* Sleep Cycle Recommendations */}
                <View className="mb-10">
                    <AccessibleText weight="bold" className="text-text-secondary text-xs uppercase tracking-widest mb-4">
                        {t('sleep.smartAlarm.recommendations')}
                    </AccessibleText>

                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-6 px-6">
                        {recommendedTimes.map((cycle, index) => (
                            <Animated.View key={index} entering={FadeInRight.delay(index * 100)}>
                                <TouchableOpacity className="mr-4">
                                    <Card variant="glass" className="p-4 items-center" style={{ width: 150 }}>
                                        <View className="bg-primary/10 p-2 rounded-full mb-3">
                                            <Ionicons name="moon" size={20} color={colors.primary} />
                                        </View>
                                        <AccessibleText weight="bold" className="text-text text-xl text-center">
                                            {cycle.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </AccessibleText>
                                        <AccessibleText className="text-text-secondary text-[10px] mt-1 text-center">
                                            {cycle.label}
                                        </AccessibleText>
                                    </Card>
                                </TouchableOpacity>
                            </Animated.View>
                        ))}
                    </ScrollView>

                    <AccessibleText className="text-text-muted text-[10px] mt-4 italic">
                        {t('sleep.smartAlarm.disclaimer')}
                    </AccessibleText>
                </View>

                {/* Features Info */}
                <Card variant="glass" className="p-6 mb-10 bg-primary/5 border-primary/20">
                    <View className="flex-row items-center mb-4">
                        <View className="bg-primary p-2 rounded-lg mr-3">
                            <Ionicons name="bulb" size={20} color="#fff" />
                        </View>
                        <AccessibleText weight="bold" className="text-text">{t('sleep.smartAlarm.howItWorks')}</AccessibleText>
                    </View>
                    <AccessibleText className="text-text-secondary text-sm leading-5">
                        {t('sleep.smartAlarm.howItWorksDesc')}
                    </AccessibleText>
                </Card>
            </ScrollView>

            <AlarmSettingsModal
                visible={isModalVisible}
                alarm={editingAlarm}
                onClose={() => setIsModalVisible(false)}
                onSave={handleSaveAlarm}
            />
        </ScreenWrapper>
    );
}
