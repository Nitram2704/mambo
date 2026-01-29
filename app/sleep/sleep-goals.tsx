import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useSleepStore } from '@/store/sleepStore';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '@/hooks/use-app-theme';
import { Colors } from '@/constants/Colors';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { Card } from '@/components/ui/Card';
import { HealthSyncCard } from '@/components/sleep/HealthSyncCard';
import { PremiumButton } from '@/components/ui/PremiumButton';

export default function SleepGoalsScreen() {
    const { t, i18n } = useTranslation();
    const { theme, isDark } = useAppTheme();
    const colors = Colors[theme];
    const router = useRouter();
    const { sleepGoals, setSleepGoals } = useSleepStore();

    const [targetHours, setTargetHours] = useState((sleepGoals?.targetHours || 8).toString());
    const [bedTime, setBedTime] = useState(() => {
        if (sleepGoals?.targetBedtime) {
            const [hours, minutes] = sleepGoals.targetBedtime.split(':').map(Number);
            const date = new Date();
            date.setHours(hours, minutes, 0);
            return date;
        }
        const date = new Date();
        date.setHours(23, 0, 0);
        return date;
    });
    const [wakeTime, setWakeTime] = useState(() => {
        if (sleepGoals?.targetWakeTime) {
            const [hours, minutes] = sleepGoals.targetWakeTime.split(':').map(Number);
            const date = new Date();
            date.setHours(hours, minutes, 0);
            return date;
        }
        const date = new Date();
        date.setHours(7, 0, 0);
        return date;
    });

    const [showBedTimePicker, setShowBedTimePicker] = useState(false);
    const [showWakeTimePicker, setShowWakeTimePicker] = useState(false);

    const handleSave = () => {
        const hours = parseFloat(targetHours);
        if (!hours || hours <= 0 || hours > 24) {
            Alert.alert(t('common.error'), t('sleep.goals.errorHours'));
            return;
        }

        const bedTimeStr = `${bedTime.getHours().toString().padStart(2, '0')}:${bedTime.getMinutes().toString().padStart(2, '0')}`;
        const wakeTimeStr = `${wakeTime.getHours().toString().padStart(2, '0')}:${wakeTime.getMinutes().toString().padStart(2, '0')}`;

        setSleepGoals({
            targetHours: hours,
            targetBedtime: bedTimeStr,
            targetWakeTime: wakeTimeStr,
        });

        Alert.alert(t('common.success'), t('sleep.goals.savedDesc'), [
            { text: 'OK', onPress: () => router.back() }
        ]);
    };

    return (
        <ScreenWrapper
            headerTitle={t('sleep.goals.title', 'Metas de Sueño')}
            scrollable
        >
            <View className="p-4">
                {/* Health Sync Card */}
                <HealthSyncCard />

                {/* Target Hours */}
                <Card variant="glass" className="p-4 mb-4">
                    <View className="flex-row items-center mb-3">
                        <Ionicons name="time" size={24} color={colors.primary} />
                        <Text className="text-text font-bold text-lg ml-2">{t('sleep.goals.targetHours')}</Text>
                    </View>
                    <TextInput
                        className="p-4 rounded-lg text-lg border text-center bg-surface-highlight text-text border-border"
                        placeholder="8"
                        placeholderTextColor={colors.textMuted}
                        keyboardType="decimal-pad"
                        value={targetHours}
                        onChangeText={setTargetHours}
                    />
                    <Text className="text-text-secondary text-sm mt-2 text-center">
                        {t('sleep.goals.recommended')}
                    </Text>
                </Card>

                {/* Target Bedtime */}
                <Card variant="glass" className="p-4 mb-4">
                    <View className="flex-row items-center mb-3">
                        <Ionicons name="moon" size={24} color={colors.primary} />
                        <Text className="text-text font-bold text-lg ml-2">{t('sleep.goals.targetBedtime')}</Text>
                    </View>
                    <TouchableOpacity
                        onPress={() => setShowBedTimePicker(true)}
                        className="p-4 rounded-lg border bg-surface-highlight border-border"
                    >
                        <Text className="text-text text-center text-2xl font-bold">
                            {bedTime.toLocaleTimeString(i18n.language === 'es' ? 'es-ES' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
                        </Text>
                    </TouchableOpacity>
                    {showBedTimePicker && (
                        <DateTimePicker
                            value={bedTime}
                            mode="time"
                            display="default"
                            onChange={(event, selectedTime) => {
                                setShowBedTimePicker(Platform.OS === 'ios');
                                if (selectedTime) setBedTime(selectedTime);
                            }}
                        />
                    )}
                </Card>

                {/* Target Wake Time */}
                <Card variant="glass" className="p-4 mb-6">
                    <View className="flex-row items-center mb-3">
                        <Ionicons name="sunny" size={24} color={colors.yellow[500]} />
                        <Text className="text-text font-bold text-lg ml-2">{t('sleep.goals.targetWakeTime')}</Text>
                    </View>
                    <TouchableOpacity
                        onPress={() => setShowWakeTimePicker(true)}
                        className="p-4 rounded-lg border bg-surface-highlight border-border"
                    >
                        <Text className="text-text text-center text-2xl font-bold">
                            {wakeTime.toLocaleTimeString(i18n.language === 'es' ? 'es-ES' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
                        </Text>
                    </TouchableOpacity>
                    {showWakeTimePicker && (
                        <DateTimePicker
                            value={wakeTime}
                            mode="time"
                            display="default"
                            onChange={(event, selectedTime) => {
                                setShowWakeTimePicker(Platform.OS === 'ios');
                                if (selectedTime) setWakeTime(selectedTime);
                            }}
                        />
                    )}
                </Card>

                {/* Info Card */}
                <Card variant="glass" className="p-4 border-primary/30 bg-primary/10">
                    <View className="flex-row items-center mb-2">
                        <Ionicons name="information-circle" size={20} color={colors.primary} />
                        <Text className="text-primary font-bold ml-2">{t('common.tip')}</Text>
                    </View>
                    <Text className="text-text-secondary text-sm">
                        {t('sleep.goals.tipDesc')}
                    </Text>
                </Card>

                <PremiumButton
                    label={t('common.save')}
                    onPress={handleSave}
                    className="mt-8"
                />
            </View>
        </ScreenWrapper>
    );
}
