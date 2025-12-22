import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Switch, Alert, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useUserProfileStore } from '@/store/userProfileStore';
import {
    getActivityLevelDisplayName,
    getObjectiveDisplayName,
} from '@/utils/nutrition';
import {
    registerForPushNotificationsAsync,
    scheduleWaterReminder,
    scheduleWorkoutReminder
} from '@/utils/notifications';
import { useAchievementsStore } from '@/store/achievementsStore';
import { LevelProgressBar } from '@/components/LevelProgressBar';
import { ConsistencyCalendar } from '@/components/ConsistencyCalendar';
import { XPProgressChart } from '@/components/XPProgressChart';
import { WhyTooltip } from '@/components/WhyTooltip';
import { useAppTheme } from '@/hooks/use-app-theme';
import { Colors } from '@/constants/Colors';

export default function ProfileScreen() {
    const router = useRouter();
    const { t, i18n } = useTranslation();
    const { theme } = useAppTheme();
    const isDark = theme === 'dark';

    const { profile, updateProfile } = useUserProfileStore();
    const { getCurrentLevel } = useAchievementsStore();
    const levelData = getCurrentLevel();

    const [waterNotif, setWaterNotif] = useState(false);
    const [workoutNotif, setWorkoutNotif] = useState(false);

    const toggleWaterNotif = async (value: boolean) => {
        if (value) {
            const permission = await registerForPushNotificationsAsync();
            if (permission === 'granted') {
                await scheduleWaterReminder();
                setWaterNotif(true);
            } else {
                setWaterNotif(false);
            }
        } else {
            setWaterNotif(false);
            Alert.alert(t('profile.settings'), t('profile.waterReminder') + ' desactivado');
        }
    };

    const toggleWorkoutNotif = async (value: boolean) => {
        if (value) {
            const permission = await registerForPushNotificationsAsync();
            if (permission === 'granted') {
                await scheduleWorkoutReminder(18, 0); // Default 6 PM
                setWorkoutNotif(true);
            } else {
                setWorkoutNotif(false);
            }
        } else {
            setWorkoutNotif(false);
            Alert.alert(t('profile.settings'), t('profile.workoutReminder') + ' desactivado');
        }
    };

    const handleResetProfile = () => {
        Alert.alert(
            t('profile.resetTitle'),
            t('profile.resetMessage'),
            [
                { text: t('common.cancel'), style: "cancel" },
                {
                    text: t('profile.resetConfirm'),
                    style: "destructive",
                    onPress: () => {
                        router.push('/onboarding');
                    }
                }
            ]
        );
    };

    const toggleTheme = async (isDark: boolean) => {
        const newTheme = isDark ? 'dark' : 'light';
        await updateProfile({ theme: newTheme });
    };

    const handleLanguageChange = async (lang: string) => {
        await updateProfile({ language: lang });
        i18n.changeLanguage(lang);
    };

    if (!profile) {
        return (
            <ScreenWrapper safeArea={true}>
                <View className="mb-8 p-4">
                    <Text className="text-xs font-black uppercase tracking-widest" style={{ color: Colors[theme].textSecondary }}>
                        {t('profile.personalInfo')}
                    </Text>
                    <Text className="text-4xl font-black mt-1" style={{ color: Colors[theme].text }}>{t('profile.title')}</Text>
                </View>

                <View className="flex-1 items-center justify-center p-8">
                    <Card className="items-center p-8 w-full">
                        <View className="bg-primary/10 p-6 rounded-2xl mb-6">
                            <Ionicons name="person" size={60} color={Colors[theme].primary} />
                        </View>
                        <Text className="text-2xl font-black mb-2 text-center" style={{ color: Colors[theme].text }}>{t('profile.noProfileTitle')}</Text>
                        <Text className="text-center mb-8 leading-6" style={{ color: Colors[theme].textSecondary }}>
                            {t('profile.noProfileSubtitle')}
                        </Text>
                        <Button
                            onPress={() => router.push('/profile/configure')}
                            variant="primary"
                            className="w-full"
                            label={t('profile.configureButton')}
                        />
                    </Card>
                </View>
            </ScreenWrapper>
        );
    }

    return (
        <ScreenWrapper safeArea={true}>
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                <View className="p-4">
                    {/* Header */}
                    <View className="flex-row items-center justify-between mb-6 mt-2">
                        <View>
                            <Text
                                className="text-4xl font-black"
                                style={{ color: Colors[theme].text }}
                                numberOfLines={1}
                                adjustsFontSizeToFit
                            >
                                {t('profile.title')}
                            </Text>
                            <Text className="text-sm font-medium" style={{ color: Colors[theme].textSecondary }}>{t('profile.subtitle')}</Text>
                        </View>
                        <View className="flex-row gap-3">
                            <TouchableOpacity
                                onPress={handleResetProfile}
                                className="p-2 rounded-2xl border"
                                style={{ backgroundColor: Colors[theme].error + '20', borderColor: Colors[theme].error + '30' }}
                            >
                                <Ionicons name="refresh-outline" size={24} color={Colors[theme].error} />
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => router.push('/profile/configure')}
                                className="p-2 rounded-2xl border"
                                style={{ backgroundColor: Colors[theme].surfaceHighlight + '50', borderColor: Colors[theme].border + '10' }}
                            >
                                <Ionicons name="create-outline" size={24} color={Colors[theme].text} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Level Progress */}
                    <LevelProgressBar
                        level={levelData.level}
                        title={levelData.title}
                        progress={levelData.progress}
                        currentXp={levelData.currentLevelXp}
                        nextLevelXp={levelData.nextLevelXp}
                    />

                    {/* Consistency Calendar */}
                    <View className="mb-6">
                        <ConsistencyCalendar />
                    </View>

                    {/* XP Progress Chart */}
                    <View className="mb-6">
                        <XPProgressChart />
                    </View>

                    {/* Quick Stats Grid */}
                    <View className="flex-row gap-3 mb-6">
                        <TouchableOpacity
                            onPress={() => router.push('/profile/achievements')}
                            className="flex-1"
                            activeOpacity={0.7}
                        >
                            <Card className="items-center p-4" style={{ borderColor: Colors[theme].secondary + '30' }}>
                                <View className="p-3 rounded-2xl mb-3" style={{ backgroundColor: Colors[theme].secondary + '20' }}>
                                    <Ionicons name="medal" size={28} color={Colors[theme].secondary} />
                                </View>
                                <Text className="text-base font-black" style={{ color: Colors[theme].text }}>{t('profile.achievements')}</Text>
                                <Text className="text-xs mt-1 font-medium" style={{ color: Colors[theme].textSecondary }}>{t('profile.achievementsDesc')}</Text>
                            </Card>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => router.push('/profile/progress')}
                            className="flex-1"
                            activeOpacity={0.7}
                        >
                            <Card className="items-center p-4" style={{ borderColor: Colors[theme].warning + '30' }}>
                                <View className="p-3 rounded-2xl mb-3" style={{ backgroundColor: Colors[theme].warning + '20' }}>
                                    <Ionicons name="trending-up" size={28} color={Colors[theme].warning} />
                                </View>
                                <Text className="text-base font-black" style={{ color: Colors[theme].text }}>{t('profile.progress')}</Text>
                                <Text className="text-xs mt-1 font-medium" style={{ color: Colors[theme].textSecondary }}>{t('profile.progressDesc')}</Text>
                            </Card>
                        </TouchableOpacity>
                    </View>

                    {/* Información Personal */}
                    <Card className="mb-6">
                        <Text
                            className="text-lg font-bold mb-4"
                            style={{ color: Colors[theme].text }}
                            numberOfLines={1}
                            adjustsFontSizeToFit
                        >
                            {t('profile.personalInfo')}
                        </Text>

                        <View className="flex-row justify-between py-3 border-b" style={{ borderColor: Colors[theme].border + '20' }}>
                            <Text style={{ color: Colors[theme].textSecondary }}>{t('profile.age')}</Text>
                            <Text className="font-bold" style={{ color: Colors[theme].text }}>{profile.age} {t('profile.years')}</Text>
                        </View>

                        <View className="flex-row justify-between py-3 border-b" style={{ borderColor: Colors[theme].border + '20' }}>
                            <Text style={{ color: Colors[theme].textSecondary }}>{t('profile.gender')}</Text>
                            <Text className="font-bold" style={{ color: Colors[theme].text }}>
                                {profile.gender === 'male' ? t('profile.male') : t('profile.female')}
                            </Text>
                        </View>

                        <View className="flex-row justify-between py-3 border-b" style={{ borderColor: Colors[theme].border + '20' }}>
                            <Text style={{ color: Colors[theme].textSecondary }}>{t('profile.height')}</Text>
                            <Text className="font-bold" style={{ color: Colors[theme].text }}>{profile.height.toFixed(2)} cm</Text>
                        </View>

                        <View className="flex-row justify-between py-3 border-b" style={{ borderColor: Colors[theme].border + '20' }}>
                            <Text style={{ color: Colors[theme].textSecondary }}>{t('profile.weight')}</Text>
                            <Text className="font-bold" style={{ color: Colors[theme].text }}>{profile.weight.toFixed(2)} kg</Text>
                        </View>

                        <View className="flex-row justify-between py-3 border-b" style={{ borderColor: Colors[theme].border + '20' }}>
                            <Text style={{ color: Colors[theme].textSecondary }}>{t('profile.activity')}</Text>
                            <Text className="font-bold" style={{ color: Colors[theme].text }}>
                                {getActivityLevelDisplayName(profile.activityLevel)}
                            </Text>
                        </View>

                        <View className="flex-row justify-between py-3">
                            <Text style={{ color: Colors[theme].textSecondary }}>{t('profile.objective')}</Text>
                            <Text className="font-bold" style={{ color: Colors[theme].warning }}>
                                {getObjectiveDisplayName(profile.objective)}
                            </Text>
                        </View>
                    </Card>

                    {/* Nutritional Goals */}
                    <Card className="mb-6">
                        <View className="flex-row justify-between items-center mb-5">
                            <Text
                                className="text-lg font-bold"
                                style={{ color: Colors[theme].text }}
                                numberOfLines={1}
                                adjustsFontSizeToFit
                            >
                                {t('profile.nutritionalGoals')}
                            </Text>
                            <TouchableOpacity onPress={() => router.push('/profile/edit-goals')}>
                                <Text className="font-bold text-sm" style={{ color: Colors[theme].primary }}>{t('profile.edit')}</Text>
                            </TouchableOpacity>
                        </View>

                        <View className="flex-row justify-between mb-5">
                            <View className="items-center flex-1">
                                <View className="flex-row items-center">
                                    <Text className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: Colors[theme].textSecondary }}>{t('profile.calories')}</Text>
                                    <WhyTooltip
                                        title={t('profile.tooltips.calories.title')}
                                        explanation={t('profile.tooltips.calories.explanation')}
                                        examples={t('profile.tooltips.calories.examples', { returnObjects: true }) as string[]}
                                        scientific={t('profile.tooltips.calories.scientific')}
                                    />
                                </View>
                                <Text className="font-bold text-lg" style={{ color: Colors[theme].text }}>{profile.calorieGoal}</Text>
                            </View>
                            <View className="w-[1px] h-8" style={{ backgroundColor: Colors[theme].border + '20' }} />
                            <View className="items-center flex-1">
                                <View className="flex-row items-center">
                                    <Text className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: Colors[theme].textSecondary }}>{t('profile.protein')}</Text>
                                    <WhyTooltip
                                        title={t('profile.tooltips.protein.title')}
                                        explanation={t('profile.tooltips.protein.explanation')}
                                        examples={t('profile.tooltips.protein.examples', { returnObjects: true }) as string[]}
                                        scientific={t('profile.tooltips.protein.scientific')}
                                    />
                                </View>
                                <Text className="font-bold text-lg" style={{ color: Colors[theme].text }}>{profile.proteinGoal}g</Text>
                            </View>
                            <View className="w-[1px] h-8" style={{ backgroundColor: Colors[theme].border + '20' }} />
                            <View className="items-center flex-1">
                                <View className="flex-row items-center">
                                    <Text className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: Colors[theme].textSecondary }}>{t('profile.carbs')}</Text>
                                    <WhyTooltip
                                        title={t('profile.tooltips.carbs.title')}
                                        explanation={t('profile.tooltips.carbs.explanation')}
                                        examples={t('profile.tooltips.carbs.examples', { returnObjects: true }) as string[]}
                                        scientific={t('profile.tooltips.carbs.scientific')}
                                    />
                                </View>
                                <Text className="font-bold text-lg" style={{ color: Colors[theme].text }}>{profile.carbsGoal}g</Text>
                            </View>
                            <View className="w-[1px] h-8" style={{ backgroundColor: Colors[theme].border + '20' }} />
                            <View className="items-center flex-1">
                                <View className="flex-row items-center">
                                    <Text className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: Colors[theme].textSecondary }}>{t('profile.fats')}</Text>
                                    <WhyTooltip
                                        title={t('profile.tooltips.fats.title')}
                                        explanation={t('profile.tooltips.fats.explanation')}
                                        examples={t('profile.tooltips.fats.examples', { returnObjects: true }) as string[]}
                                        scientific={t('profile.tooltips.fats.scientific')}
                                    />
                                </View>
                                <Text className="font-bold text-lg" style={{ color: Colors[theme].text }}>{profile.fatsGoal}g</Text>
                            </View>
                        </View>

                        <View className="flex-row justify-between py-2 border-t pt-3" style={{ borderColor: Colors[theme].border + '10' }}>
                            <Text className="text-xs" style={{ color: Colors[theme].textMuted }}>BMR: {Math.round(profile.bmr)}</Text>
                            <Text className="text-xs" style={{ color: Colors[theme].textMuted }}>TDEE: {Math.round(profile.tdee)}</Text>
                        </View>
                    </Card>

                    {/* Settings */}
                    <Card className="mb-8">
                        <Text
                            className="text-lg font-bold mb-4"
                            style={{ color: Colors[theme].text }}
                            numberOfLines={1}
                            adjustsFontSizeToFit
                        >
                            {t('profile.settings')}
                        </Text>

                        {/* Theme Switch */}
                        <View className="flex-row justify-between items-center mb-4">
                            <View className="flex-row items-center">
                                <View className="p-2 rounded-xl mr-3" style={{ backgroundColor: Colors[theme].surfaceHighlight + '50' }}>
                                    <Ionicons name="moon" size={20} color={Colors[theme].textMuted} />
                                </View>
                                <Text className="font-bold" style={{ color: Colors[theme].text }}>{t('profile.darkMode')}</Text>
                            </View>
                            <Switch
                                value={profile.theme === 'dark'}
                                onValueChange={toggleTheme}
                                trackColor={{ false: Colors[theme].border, true: Colors[theme].primary }}
                                thumbColor={'#ffffff'}
                            />
                        </View>

                        {/* Language Selector */}
                        <View className="mb-6">
                            <View className="flex-row items-center mb-3">
                                <View className="p-2 rounded-xl mr-3" style={{ backgroundColor: Colors[theme].secondary + '20' }}>
                                    <Ionicons name="language" size={20} color={Colors[theme].secondary} />
                                </View>
                                <Text className="font-bold" style={{ color: Colors[theme].text }}>{t('profile.language')}</Text>
                            </View>
                            <View className="flex-row gap-2">
                                {['es', 'en', 'fr', 'pt'].map((lang) => (
                                    <TouchableOpacity
                                        key={lang}
                                        onPress={() => handleLanguageChange(lang)}
                                        className={`flex-1 py-2 rounded-xl border ${profile.language === lang ? 'border-primary' : 'border-transparent'
                                            }`}
                                        style={{ backgroundColor: profile.language === lang ? Colors[theme].primary + '20' : Colors[theme].surfaceHighlight + '30' }}
                                    >
                                        <Text className={`text-center font-bold uppercase ${profile.language === lang ? 'text-primary' : ''
                                            }`} style={{ color: profile.language === lang ? Colors[theme].primary : Colors[theme].textSecondary }}>
                                            {lang}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        <View className="flex-row justify-between items-center mb-4">
                            <View className="flex-row items-center">
                                <View className="p-2 rounded-xl mr-3" style={{ backgroundColor: Colors[theme].primary + '20' }}>
                                    <Ionicons name="water" size={20} color={Colors[theme].primary} />
                                </View>
                                <Text className="font-bold" style={{ color: Colors[theme].text }}>{t('profile.waterReminder')}</Text>
                            </View>
                            <Switch
                                value={waterNotif}
                                onValueChange={toggleWaterNotif}
                                trackColor={{ false: Colors[theme].border, true: Colors[theme].primary }}
                                thumbColor={waterNotif ? '#ffffff' : Colors[theme].textMuted}
                            />
                        </View>

                        <View className="flex-row justify-between items-center">
                            <View className="flex-row items-center">
                                <View className="p-2 rounded-xl mr-3" style={{ backgroundColor: Colors[theme].warning + '20' }}>
                                    <Ionicons name="notifications" size={20} color={Colors[theme].warning} />
                                </View>
                                <Text className="font-bold" style={{ color: Colors[theme].text }}>{t('profile.workoutReminder')}</Text>
                            </View>
                            <Switch
                                value={workoutNotif}
                                onValueChange={toggleWorkoutNotif}
                                trackColor={{ false: Colors[theme].border, true: Colors[theme].warning }}
                                thumbColor={workoutNotif ? '#ffffff' : Colors[theme].textMuted}
                            />
                        </View>

                        <View className="mt-4 pt-4 border-t" style={{ borderColor: Colors[theme].border + '10' }}>
                            <TouchableOpacity
                                onPress={() => {
                                    Alert.alert(
                                        t('profile.exitPlanTitle'),
                                        t('profile.exitPlanMessage'),
                                        [
                                            { text: t('common.cancel'), style: "cancel" },
                                            {
                                                text: t('profile.exitPlanConfirm'),
                                                style: "destructive",
                                                onPress: () => {
                                                    const { exitCurrentPlan } = require('@/store/weeklyScheduleStore').useWeeklyScheduleStore.getState();
                                                    exitCurrentPlan();
                                                    Alert.alert(t('profile.settings'), t('profile.exitPlanSuccess'));
                                                }
                                            }
                                        ]
                                    );
                                }}
                                className="flex-row items-center justify-between"
                            >
                                <View className="flex-row items-center">
                                    <View className="p-2 rounded-xl mr-3" style={{ backgroundColor: Colors[theme].error + '20' }}>
                                        <Ionicons name="log-out-outline" size={20} color={Colors[theme].error} />
                                    </View>
                                    <Text className="font-bold" style={{ color: Colors[theme].error }}>{t('profile.exitPlan')}</Text>
                                </View>
                                <Ionicons name="chevron-forward" size={20} color={Colors[theme].error} />
                            </TouchableOpacity>
                        </View>
                    </Card>
                </View>
            </ScrollView>
        </ScreenWrapper>
    );
}
