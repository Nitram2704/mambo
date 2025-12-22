import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useUserProfileStore } from '@/store/userProfileStore';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { Card } from '@/components/ui/Card';
import { useAppTheme } from '@/hooks/use-app-theme';
import { Colors } from '@/constants/Colors';

export default function ProgressScreen() {
    const router = useRouter();
    const { t } = useTranslation();
    const { theme } = useAppTheme();
    const { profile } = useUserProfileStore();

    if (!profile) {
        return (
            <ScreenWrapper safeArea={true}>
                <View className="flex-1 items-center justify-center p-8">
                    <Ionicons name="analytics-outline" size={80} color={Colors[theme].textMuted} />
                    <Text className="text-xl font-bold mt-4 mb-2" style={{ color: Colors[theme].text }}>{t('profile.progressScreen.noData')}</Text>
                    <Text className="text-center" style={{ color: Colors[theme].textSecondary }}>
                        {t('profile.noProfileSubtitle')}
                    </Text>
                </View>
            </ScreenWrapper>
        );
    }

    return (
        <ScreenWrapper safeArea={true}>
            {/* Header */}
            <View className="flex-row items-center p-4 border-b" style={{ borderColor: Colors[theme].border + '10' }}>
                <TouchableOpacity onPress={() => router.back()} className="mr-4">
                    <Ionicons name="arrow-back" size={24} color={Colors[theme].text} />
                </TouchableOpacity>
                <Text className="text-xl font-bold" style={{ color: Colors[theme].text }}>{t('profile.progressScreen.title')}</Text>
            </View>

            <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
                {/* Meta de Calorías Diarias */}
                <Card className="p-4 mb-4">
                    <View className="flex-row items-center mb-3">
                        <View className="p-2 rounded-lg mr-3" style={{ backgroundColor: Colors[theme].warning + '20' }}>
                            <Ionicons name="flame" size={24} color={Colors[theme].warning} />
                        </View>
                        <View>
                            <Text className="text-sm" style={{ color: Colors[theme].textSecondary }}>{t('profile.progressScreen.dailyCalorieGoal')}</Text>
                            <Text className="text-2xl font-bold" style={{ color: Colors[theme].text }}>
                                {t('profile.progressScreen.calories', { count: profile.calorieGoal })}
                            </Text>
                        </View>
                    </View>
                </Card>

                {/* Meta de Ejercicio */}
                <Card className="p-4 mb-4">
                    <View className="flex-row items-center mb-3">
                        <View className="p-2 rounded-lg mr-3" style={{ backgroundColor: Colors[theme].primary + '20' }}>
                            <Ionicons name="time" size={24} color={Colors[theme].primary} />
                        </View>
                        <View>
                            <Text className="text-sm" style={{ color: Colors[theme].textSecondary }}>{t('profile.progressScreen.exerciseGoal')}</Text>
                            <Text className="text-2xl font-bold" style={{ color: Colors[theme].text }}>
                                {t('profile.progressScreen.minutesPerDay', { count: 30 })}
                            </Text>
                        </View>
                    </View>
                </Card>

                {/* Racha Actual */}
                <Card className="p-4 mb-4">
                    <View className="flex-row items-center mb-3">
                        <View className="p-2 rounded-lg mr-3" style={{ backgroundColor: Colors[theme].success + '20' }}>
                            <Ionicons name="checkmark-circle" size={24} color={Colors[theme].success} />
                        </View>
                        <View>
                            <Text className="text-sm" style={{ color: Colors[theme].textSecondary }}>{t('profile.progressScreen.currentStreak')}</Text>
                            <Text className="text-2xl font-bold" style={{ color: Colors[theme].text }}>{t('profile.progressScreen.keepItUp')}</Text>
                        </View>
                    </View>
                </Card>

                {/* Configuración */}
                <Card className="p-4">
                    <View className="flex-row items-center">
                        <Ionicons name="settings-outline" size={24} color={Colors[theme].textMuted} />
                        <Text className="font-bold ml-3" style={{ color: Colors[theme].text }}>{t('profile.settings')}</Text>
                    </View>
                    <Text className="text-xs mt-2" style={{ color: Colors[theme].textMuted }}>Mambo Fitness v1.0</Text>
                </Card>
            </ScrollView>
        </ScreenWrapper>
    );
}
