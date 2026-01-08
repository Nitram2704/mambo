import React, { useState } from 'react';
import { View, TouchableOpacity, ScrollView, Switch, Alert, Share } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { Card } from '@/components/ui/Card';
import { useAppTheme } from '@/hooks/use-app-theme';
import { Colors } from '@/constants/Colors';
import { AccessibleText } from '@/components/ui/AccessibleText';
import { useUserProfileStore } from '@/store/userProfileStore';
import { useWorkoutHistoryStore } from '@/store/workoutHistoryStore';
import { useNutritionStore } from '@/store/nutritionStore';

export default function PrivacyScreen() {
    const router = useRouter();
    const { t } = useTranslation();
    const { theme } = useAppTheme();
    const { profile, updateProfile } = useUserProfileStore();
    const { workouts } = useWorkoutHistoryStore();
    const { dailyData } = useNutritionStore();

    const [isExporting, setIsExporting] = useState(false);

    const handleExportData = async () => {
        setIsExporting(true);
        try {
            const data = {
                profile,
                workouts,
                nutrition: dailyData,
                exportDate: new Date().toISOString(),
                appVersion: '1.0.0'
            };

            const jsonString = JSON.stringify(data, null, 2);

            // In a real app, we would save to file system first
            // For now, we'll just share the text/file
            await Share.share({
                message: jsonString,
                title: 'MamboFitness_Data_Export.json'
            });

        } catch (error) {
            Alert.alert(t('common.error'), t('privacy.export_failed'));
        } finally {
            setIsExporting(false);
        }
    };

    const toggleSetting = (key: 'analyticsEnabled' | 'marketingEnabled') => {
        updateProfile({ [key]: !profile?.[key] });
    };

    return (
        <ScreenWrapper safeArea={true}>
            <View className="flex-1">
                {/* Header */}
                <View className="px-6 py-4 flex-row items-center">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="w-10 h-10 bg-white/5 rounded-full items-center justify-center mr-4"
                    >
                        <Ionicons name="arrow-back" size={24} color={Colors[theme].text} />
                    </TouchableOpacity>
                    <AccessibleText variant="h1" weight="bold" className="text-text text-2xl">
                        {t('settings.privacy_labels.data')}
                    </AccessibleText>
                </View>

                <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>

                    {/* Data Management */}
                    <AccessibleText weight="bold" className="text-text-secondary text-xs uppercase tracking-widest mb-2 mt-4 px-1">
                        {t('privacy.data_management_title')}
                    </AccessibleText>
                    <Card variant="glass" className="p-0 px-4">
                        <TouchableOpacity
                            onPress={handleExportData}
                            disabled={isExporting}
                            className="flex-row items-center justify-between py-4"
                        >
                            <View className="flex-row items-center flex-1">
                                <View className="w-10 h-10 rounded-xl items-center justify-center mr-4 bg-primary/10">
                                    <Ionicons name="download-outline" size={22} color={Colors[theme].primary} />
                                </View>
                                <View className="flex-1 pr-4">
                                    <AccessibleText weight="medium" className="text-text text-base">
                                        {isExporting ? t('common.loading') : t('privacy.export_data')}
                                    </AccessibleText>
                                    <AccessibleText className="text-text-secondary text-xs mt-0.5">
                                        {t('privacy.export_desc')}
                                    </AccessibleText>
                                </View>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color={Colors[theme].textMuted} />
                        </TouchableOpacity>
                    </Card>

                    {/* Preferences */}
                    <AccessibleText weight="bold" className="text-text-secondary text-xs uppercase tracking-widest mb-2 mt-6 px-1">
                        {t('privacy.preferences_title')}
                    </AccessibleText>
                    <Card variant="glass" className="p-0 px-4">
                        <View className="flex-row items-center justify-between py-4 border-b border-white/5">
                            <View className="flex-row items-center flex-1">
                                <View className="w-10 h-10 rounded-xl items-center justify-center mr-4 bg-white/5">
                                    <Ionicons name="analytics-outline" size={22} color={Colors[theme].text} />
                                </View>
                                <View className="flex-1 pr-4">
                                    <AccessibleText weight="medium" className="text-text text-base">
                                        {t('privacy.analytics')}
                                    </AccessibleText>
                                    <AccessibleText className="text-text-secondary text-xs mt-0.5">
                                        {t('privacy.analytics_desc')}
                                    </AccessibleText>
                                </View>
                            </View>
                            <Switch
                                value={profile?.analyticsEnabled ?? true}
                                onValueChange={() => toggleSetting('analyticsEnabled')}
                                trackColor={{ false: Colors[theme].border, true: Colors[theme].primary }}
                                thumbColor="#ffffff"
                            />
                        </View>

                        <View className="flex-row items-center justify-between py-4">
                            <View className="flex-row items-center flex-1">
                                <View className="w-10 h-10 rounded-xl items-center justify-center mr-4 bg-white/5">
                                    <Ionicons name="megaphone-outline" size={22} color={Colors[theme].text} />
                                </View>
                                <View className="flex-1 pr-4">
                                    <AccessibleText weight="medium" className="text-text text-base">
                                        {t('privacy.marketing')}
                                    </AccessibleText>
                                    <AccessibleText className="text-text-secondary text-xs mt-0.5">
                                        {t('privacy.marketing_desc')}
                                    </AccessibleText>
                                </View>
                            </View>
                            <Switch
                                value={profile?.marketingEnabled ?? false}
                                onValueChange={() => toggleSetting('marketingEnabled')}
                                trackColor={{ false: Colors[theme].border, true: Colors[theme].primary }}
                                thumbColor="#ffffff"
                            />
                        </View>
                    </Card>

                    {/* Danger Zone */}
                    <AccessibleText weight="bold" className="text-error text-xs uppercase tracking-widest mb-2 mt-8 px-1">
                        {t('common.danger_zone')}
                    </AccessibleText>
                    <Card variant="glass" className="p-0 px-4 border-error/30">
                        <TouchableOpacity
                            onPress={() => {
                                Alert.alert(
                                    t('settings.delete_account.title'),
                                    t('settings.delete_account.warning'),
                                    [
                                        { text: t('common.cancel'), style: 'cancel' },
                                        { text: t('settings.delete_account.confirm'), style: 'destructive', onPress: () => router.replace('/welcome') }
                                    ]
                                );
                            }}
                            className="flex-row items-center justify-between py-4"
                        >
                            <View className="flex-row items-center flex-1">
                                <View className="w-10 h-10 rounded-xl items-center justify-center mr-4 bg-error/10">
                                    <Ionicons name="trash-outline" size={22} color={Colors[theme].error} />
                                </View>
                                <AccessibleText weight="medium" className="text-error text-base">
                                    {t('settings.account.deleteAccount')}
                                </AccessibleText>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color={Colors[theme].error} />
                        </TouchableOpacity>
                    </Card>

                </ScrollView>
            </View>
        </ScreenWrapper>
    );
}
