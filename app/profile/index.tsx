import React, { useState } from 'react';
import { View, TouchableOpacity, ScrollView, Switch, Alert, Dimensions } from 'react-native';
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
} from '@/utils/notifications';
import { useAchievementsStore } from '@/store/achievementsStore';
import { LevelProgressBar } from '@/components/LevelProgressBar';
import { ConsistencyCalendar } from '@/components/ConsistencyCalendar';
import { XPProgressChart } from '@/components/XPProgressChart';
import { WhyTooltip } from '@/components/WhyTooltip';
import { useAppTheme } from '@/hooks/use-app-theme';
import { Colors } from '@/constants/Colors';
import { useSubscriptionStore } from '@/store/subscriptionStore';
import { SUBSCRIPTION_TIERS } from '@/constants/SubscriptionConfig';
import { useRevenueCat } from '@/hooks/useRevenueCat';
import { AccessibleText } from '@/components/ui/AccessibleText';

export default function ProfileScreen() {
    const router = useRouter();
    const { t, i18n } = useTranslation();
    const { theme } = useAppTheme();
    const colors = Colors[theme];
    const isDark = theme === 'dark';

    const { profile, updateProfile } = useUserProfileStore();
    const { getCurrentLevel } = useAchievementsStore();
    const levelData = getCurrentLevel();

    const [showDevMenu, setShowDevMenu] = useState(false);

    // Subscription Store
    const { subscription, setTier, resetUsage } = useSubscriptionStore();
    const { restorePurchases, customerInfo, loading: rcLoading } = useRevenueCat();

    const activeEntitlement = customerInfo?.entitlements.active['pro_features'] || customerInfo?.entitlements.active['elite_features'];
    const expirationDate = activeEntitlement?.expirationDate;


    if (!profile) {
        return (
            <ScreenWrapper safeArea={true}>
                <View className="mb-8 p-4">
                    <AccessibleText weight="bold" className="text-text-secondary text-xs font-black uppercase tracking-widest">
                        {t('profile.personalInfo')}
                    </AccessibleText>
                    <AccessibleText variant="h1" weight="bold" className="text-text text-4xl font-black mt-1">{t('profile.title')}</AccessibleText>
                </View>

                <View className="flex-1 items-center justify-center p-8">
                    <Card className="items-center p-8 w-full">
                        <View className="bg-primary/20 p-6 rounded-2xl mb-6 shadow-glow">
                            <Ionicons name="person" size={60} color={colors.primary} />
                        </View>
                        <AccessibleText variant="h2" weight="bold" className="text-text text-2xl font-black mb-2 text-center">{t('profile.noProfileTitle')}</AccessibleText>
                        <AccessibleText className="text-text-secondary text-center mb-8 leading-6">
                            {t('profile.noProfileSubtitle')}
                        </AccessibleText>
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
                    <View className="flex-row items-center justify-between mb-6 mt-2 animate-roll-in">
                        <View>
                            <AccessibleText
                                variant="h1"
                                weight="bold"
                                className="text-text text-4xl font-black"
                                numberOfLines={1}
                                adjustsFontSizeToFit
                            >
                                {t('profile.title')}
                            </AccessibleText>
                            <AccessibleText weight="medium" className="text-text-secondary text-sm font-medium">{t('profile.subtitle')}</AccessibleText>
                        </View>
                        <View className="flex-row gap-3">
                            <TouchableOpacity
                                onPress={() => router.push('/profile/settings')}
                                className="p-2 rounded-2xl border bg-surface/50 border-white/10"
                                accessibilityRole="button"
                                accessibilityLabel={t('settings.title')}
                            >
                                <Ionicons name="settings-outline" size={24} color={colors.text} />
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={async () => {
                                    await updateProfile({ hasCompletedOnboarding: false });
                                    router.replace('/onboarding');
                                }}
                                className="p-2 rounded-2xl border bg-surface/50 border-white/10"
                                accessibilityRole="button"
                                accessibilityLabel={t('profile.regeneratePlan')}
                            >
                                <Ionicons name="refresh-outline" size={24} color={colors.text} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Level Progress */}
                    <View className="animate-fade-in-up animate-delay-100">
                        <LevelProgressBar
                            level={levelData.level}
                            title={levelData.title}
                            progress={levelData.progress}
                            currentXp={levelData.currentLevelXp}
                            nextLevelXp={levelData.nextLevelXp}
                        />
                    </View>

                    {/* Consistency Calendar */}
                    <View className="mb-6 animate-fade-in-up animate-delay-200">
                        <ConsistencyCalendar />
                    </View>

                    {/* XP Progress Chart */}
                    <View className="mb-6 animate-fade-in-up animate-delay-300">
                        <XPProgressChart />
                    </View>

                    {/* Quick Stats Grid */}
                    <View className="flex-row gap-3 mb-6">
                        <TouchableOpacity
                            onPress={() => router.push('/profile/achievements')}
                            className="flex-1 animate-pop animate-delay-400"
                            activeOpacity={0.7}
                        >
                            <Card variant="glass" className="items-center p-4 border-secondary/30">
                                <View className="bg-secondary/20 p-3 rounded-2xl mb-3">
                                    <Ionicons name="medal" size={28} color={colors.secondary} />
                                </View>
                                <AccessibleText weight="bold" className="text-text text-base font-black">{t('profile.achievements')}</AccessibleText>
                                <AccessibleText weight="medium" className="text-text-secondary text-xs mt-1 font-medium">{t('profile.achievementsDesc')}</AccessibleText>
                            </Card>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => router.push('/profile/body-scan')}
                            className="flex-1 animate-pop animate-delay-500"
                            activeOpacity={0.7}
                        >
                            <Card variant="glass" className="items-center p-4 border-primary/30">
                                <View className="bg-primary/20 p-3 rounded-2xl mb-3">
                                    <Ionicons name="scan" size={28} color={colors.primary} />
                                </View>
                                <AccessibleText weight="bold" className="text-text text-base font-black">Body Scan</AccessibleText>
                                <AccessibleText weight="medium" className="text-text-secondary text-xs mt-1 font-medium">Análisis con IA</AccessibleText>
                            </Card>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                        onPress={() => router.push('/profile/progress')}
                        className="mb-6 animate-fade-in-up animate-delay-600"
                        activeOpacity={0.7}
                    >
                        <Card variant="glass" className="flex-row items-center p-4 border-warning/30">
                            <View className="bg-warning/20 p-3 rounded-2xl mr-4">
                                <Ionicons name="trending-up" size={28} color={colors.warning} />
                            </View>
                            <View className="flex-1">
                                <AccessibleText weight="bold" className="text-text text-base font-black">{t('profile.progress')}</AccessibleText>
                                <AccessibleText weight="medium" className="text-text-secondary text-xs mt-1 font-medium">{t('profile.progressDesc')}</AccessibleText>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
                        </Card>
                    </TouchableOpacity>

                    {/* Información Personal */}
                    <Card variant="glass" className="mb-6 animate-fade-in-up animate-delay-700">
                        <AccessibleText
                            variant="h2"
                            weight="bold"
                            className="text-text text-lg font-bold mb-4"
                            numberOfLines={1}
                            adjustsFontSizeToFit
                        >
                            {t('profile.personalInfo')}
                        </AccessibleText>

                        <View className="flex-row justify-between py-3 border-b border-border/10" accessibilityLabel={`${t('profile.age')}: ${profile.age} ${t('profile.years')}`}>
                            <AccessibleText className="text-text-secondary">{t('profile.age')}</AccessibleText>
                            <AccessibleText weight="bold" className="text-text font-bold">{profile.age} {t('profile.years')}</AccessibleText>
                        </View>

                        <View className="flex-row justify-between py-3 border-b border-border/10" accessibilityLabel={`${t('profile.gender')}: ${profile.gender === 'male' ? t('profile.male') : t('profile.female')}`}>
                            <AccessibleText className="text-text-secondary">{t('profile.gender')}</AccessibleText>
                            <AccessibleText weight="bold" className="text-text font-bold">
                                {profile.gender === 'male' ? t('profile.male') : t('profile.female')}
                            </AccessibleText>
                        </View>

                        <View className="flex-row justify-between py-3 border-b border-border/10" accessibilityLabel={`${t('profile.height')}: ${profile.height.toFixed(2)} cm`}>
                            <AccessibleText className="text-text-secondary">{t('profile.height')}</AccessibleText>
                            <AccessibleText weight="bold" className="text-text font-bold">{profile.height.toFixed(2)} cm</AccessibleText>
                        </View>

                        <View className="flex-row justify-between py-3 border-b border-border/10" accessibilityLabel={`${t('profile.weight')}: ${profile.weight.toFixed(2)} kg`}>
                            <AccessibleText className="text-text-secondary">{t('profile.weight')}</AccessibleText>
                            <AccessibleText weight="bold" className="text-text font-bold">{profile.weight.toFixed(2)} kg</AccessibleText>
                        </View>

                        <View className="flex-row justify-between py-3 border-b border-border/10" accessibilityLabel={`${t('profile.activity')}: ${getActivityLevelDisplayName(profile.activityLevel)}`}>
                            <AccessibleText className="text-text-secondary">{t('profile.activity')}</AccessibleText>
                            <AccessibleText weight="bold" className="text-text font-bold">
                                {getActivityLevelDisplayName(profile.activityLevel)}
                            </AccessibleText>
                        </View>

                        <View className="flex-row justify-between py-3" accessibilityLabel={`${t('profile.objective')}: ${getObjectiveDisplayName(profile.objective)}`}>
                            <AccessibleText className="text-text-secondary">{t('profile.objective')}</AccessibleText>
                            <AccessibleText weight="bold" className="text-warning font-bold">
                                {getObjectiveDisplayName(profile.objective)}
                            </AccessibleText>
                        </View>
                    </Card>

                    {/* Nutritional Goals */}
                    <Card variant="glass" className="mb-6 animate-fade-in-up animate-delay-800">
                        <View className="flex-row justify-between items-center mb-5">
                            <AccessibleText
                                variant="h2"
                                weight="bold"
                                className="text-text text-lg font-bold"
                                numberOfLines={1}
                                adjustsFontSizeToFit
                            >
                                {t('profile.nutritionalGoals')}
                            </AccessibleText>
                            <TouchableOpacity
                                onPress={() => router.push('/profile/edit-goals')}
                                accessibilityRole="button"
                                accessibilityLabel={t('profile.edit')}
                            >
                                <AccessibleText weight="bold" className="font-bold text-sm" style={{ color: colors.primary }}>{t('profile.edit')}</AccessibleText>
                            </TouchableOpacity>
                        </View>

                        <View className="flex-row justify-between mb-5">
                            <View className="items-center flex-1" accessibilityLabel={`${t('profile.calories')}: ${profile.calorieGoal}`}>
                                <View className="flex-row items-center">
                                    <AccessibleText weight="bold" className="text-text-secondary text-[10px] font-black uppercase tracking-widest mb-1">{t('profile.calories')}</AccessibleText>
                                    <WhyTooltip
                                        title={t('profile.tooltips.calories.title')}
                                        explanation={t('profile.tooltips.calories.explanation')}
                                        examples={t('profile.tooltips.calories.examples', { returnObjects: true }) as string[]}
                                        scientific={t('profile.tooltips.calories.scientific')}
                                    />
                                </View>
                                <AccessibleText weight="bold" className="text-text font-bold text-lg">{profile.calorieGoal}</AccessibleText>
                            </View>
                            <View className="w-[1px] h-8" style={{ backgroundColor: colors.border + '20' }} />
                            <View className="items-center flex-1" accessibilityLabel={`${t('profile.protein')}: ${profile.proteinGoal}g`}>
                                <View className="flex-row items-center">
                                    <AccessibleText weight="bold" className="text-text-secondary text-[10px] font-black uppercase tracking-widest mb-1">{t('profile.protein')}</AccessibleText>
                                    <WhyTooltip
                                        title={t('profile.tooltips.protein.title')}
                                        explanation={t('profile.tooltips.protein.explanation')}
                                        examples={t('profile.tooltips.protein.examples', { returnObjects: true }) as string[]}
                                        scientific={t('profile.tooltips.protein.scientific')}
                                    />
                                </View>
                                <AccessibleText weight="bold" className="text-text font-bold text-lg">{profile.proteinGoal}g</AccessibleText>
                            </View>
                            <View className="w-[1px] h-8" style={{ backgroundColor: colors.border + '20' }} />
                            <View className="items-center flex-1" accessibilityLabel={`${t('profile.carbs')}: ${profile.carbsGoal}g`}>
                                <View className="flex-row items-center">
                                    <AccessibleText weight="bold" className="text-text-secondary text-[10px] font-black uppercase tracking-widest mb-1">{t('profile.carbs')}</AccessibleText>
                                    <WhyTooltip
                                        title={t('profile.tooltips.carbs.title')}
                                        explanation={t('profile.tooltips.carbs.explanation')}
                                        examples={t('profile.tooltips.carbs.examples', { returnObjects: true }) as string[]}
                                        scientific={t('profile.tooltips.carbs.scientific')}
                                    />
                                </View>
                                <AccessibleText weight="bold" className="text-text font-bold text-lg">{profile.carbsGoal}g</AccessibleText>
                            </View>
                            <View className="w-[1px] h-8" style={{ backgroundColor: colors.border + '20' }} />
                            <View className="items-center flex-1" accessibilityLabel={`${t('profile.fats')}: ${profile.fatsGoal}g`}>
                                <View className="flex-row items-center">
                                    <AccessibleText weight="bold" className="text-text-secondary text-[10px] font-black uppercase tracking-widest mb-1">{t('profile.fats')}</AccessibleText>
                                    <WhyTooltip
                                        title={t('profile.tooltips.fats.title')}
                                        explanation={t('profile.tooltips.fats.explanation')}
                                        examples={t('profile.tooltips.fats.examples', { returnObjects: true }) as string[]}
                                        scientific={t('profile.tooltips.fats.scientific')}
                                    />
                                </View>
                                <AccessibleText weight="bold" className="text-text font-bold text-lg">{profile.fatsGoal}g</AccessibleText>
                            </View>
                        </View>

                        <View className="flex-row justify-between py-2 border-t pt-3" style={{ borderColor: colors.border + '10' }}>
                            <AccessibleText className="text-xs" style={{ color: colors.textMuted }}>BMR: {Math.round(profile.bmr)}</AccessibleText>
                            <AccessibleText className="text-xs" style={{ color: colors.textMuted }}>TDEE: {Math.round(profile.tdee)}</AccessibleText>
                        </View>
                    </Card>


                    {/* Developer Menu (Hidden by default) */}
                    {__DEV__ && (
                        <Card className="mb-8" style={{ borderColor: Colors[theme].warning + '50' }}>
                            <TouchableOpacity
                                onPress={() => setShowDevMenu(!showDevMenu)}
                                className="flex-row justify-between items-center mb-4"
                            >
                                <AccessibleText weight="bold" className="text-lg font-bold" style={{ color: Colors[theme].warning }}>
                                    🔧 Developer Menu
                                </AccessibleText>
                                <Ionicons
                                    name={showDevMenu ? 'chevron-up' : 'chevron-down'}
                                    size={20}
                                    color={Colors[theme].warning}
                                />
                            </TouchableOpacity>

                            {showDevMenu && (
                                <View>
                                    <AccessibleText className="text-xs mb-4" style={{ color: Colors[theme].textMuted }}>
                                        Current Tier: {subscription?.tier_id || 'STARTER'}
                                    </AccessibleText>
                                    <AccessibleText className="text-xs mb-4" style={{ color: Colors[theme].textMuted }}>
                                        CV Credits Used: {subscription?.cv_credits_used_monthly || 0}
                                    </AccessibleText>
                                    <AccessibleText className="text-xs mb-4" style={{ color: Colors[theme].textMuted }}>
                                        Chat Tokens Used: {subscription?.chat_tokens_used_daily || 0}
                                    </AccessibleText>

                                    <View className="gap-3">
                                        <Button
                                            label="Set STARTER"
                                            variant="secondary"
                                            onPress={async () => {
                                                await setTier('STARTER');
                                                Alert.alert("Dev Menu", "Tier cambiado a STARTER");
                                            }}
                                        />
                                        <Button
                                            label="Set PRO"
                                            variant="secondary"
                                            onPress={async () => {
                                                await setTier('PRO');
                                                Alert.alert("Dev Menu", "Tier cambiado a PRO");
                                            }}
                                        />
                                        <Button
                                            label="Set ELITE"
                                            variant="secondary"
                                            onPress={async () => {
                                                await setTier('ELITE');
                                                Alert.alert("Dev Menu", "Tier cambiado a ELITE");
                                            }}
                                        />
                                        <Button
                                            label="Reset Usage"
                                            variant="danger"
                                            onPress={async () => {
                                                await resetUsage();
                                                Alert.alert("Dev Menu", "Uso reseteado");
                                            }}
                                        />
                                    </View>
                                </View>
                            )}
                        </Card>
                    )}
                </View>
            </ScrollView>
        </ScreenWrapper>
    );
}
