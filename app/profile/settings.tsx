import React from 'react';
import { View, TouchableOpacity, ScrollView, Switch, Alert, Platform, Linking, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { Card } from '@/components/ui/Card';
import { useUserProfileStore, UserProfile } from '@/store/userProfileStore';
import { useAppTheme } from '@/hooks/use-app-theme';
import { Colors } from '@/constants/Colors';
import { AccessibleText } from '@/components/ui/AccessibleText';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '@/lib/supabase';

export default function SettingsScreen() {
    const router = useRouter();
    const { t, i18n } = useTranslation();
    const { theme } = useAppTheme();
    const colors = Colors[theme];
    const { profile, updateProfile, clearProfile } = useUserProfileStore();
    const [showTermsModal, setShowTermsModal] = React.useState(false);
    const [modalTitle, setModalTitle] = React.useState('');
    const [modalContent, setModalContent] = React.useState('');

    const handleLogout = async () => {
        Alert.alert(
            t('profile.logout'),
            t('profile.logoutConfirm'),
            [
                { text: t('common.cancel'), style: 'cancel' },
                {
                    text: t('profile.logout'),
                    style: 'destructive',
                    onPress: async () => {
                        await supabase.auth.signOut();
                        clearProfile();
                        router.replace('/welcome');
                    }
                }
            ]
        );
    };

    const toggleNotification = (key: keyof NonNullable<UserProfile['notifications_settings']>) => {
        const current = profile?.notifications_settings || {
            water: true,
            workout: true,
            meal: true,
            general: true
        };
        updateProfile({
            notifications_settings: {
                ...current,
                [key]: !current[key as keyof typeof current]
            }
        });
    };

    const SettingItem = ({
        icon,
        label,
        value,
        onPress,
        type = 'navigation',
        iconColor = colors.primary
    }: {
        icon: keyof typeof Ionicons.glyphMap,
        label: string,
        value?: string | boolean,
        onPress?: () => void,
        type?: 'navigation' | 'switch' | 'action',
        iconColor?: string
    }) => (
        <TouchableOpacity
            onPress={onPress}
            disabled={type === 'switch'}
            className="flex-row items-center justify-between py-4 border-b border-white/5"
        >
            <View className="flex-row items-center flex-1">
                <View className="w-10 h-10 rounded-xl items-center justify-center mr-4" style={{ backgroundColor: iconColor + '15' }}>
                    <Ionicons name={icon} size={22} color={iconColor} />
                </View>
                <AccessibleText weight="bold" className="text-text text-base flex-1">{label}</AccessibleText>
            </View>

            {type === 'navigation' && (
                <View className="flex-row items-center">
                    {value && <AccessibleText className="text-text-secondary mr-2 text-sm">{value}</AccessibleText>}
                    <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
                </View>
            )}

            {type === 'switch' && (
                <Switch
                    value={value as boolean}
                    onValueChange={onPress}
                    trackColor={{ false: colors.border, true: colors.primary }}
                    thumbColor="#ffffff"
                />
            )}

            {type === 'action' && (
                <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
            )}
        </TouchableOpacity>
    );

    const SectionHeader = ({ title }: { title: string }) => (
        <AccessibleText weight="bold" className="text-text-secondary text-xs uppercase tracking-widest mb-2 mt-6 px-1">
            {title}
        </AccessibleText>
    );

    return (
        <ScreenWrapper safeArea={true}>
            <View className="flex-1">
                {/* Custom Header */}
                <View className="px-6 py-4 flex-row items-center">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="w-10 h-10 bg-surface/50 rounded-full items-center justify-center mr-4 border border-white/10"
                    >
                        <Ionicons name="arrow-back" size={24} color={colors.text} />
                    </TouchableOpacity>
                    <AccessibleText variant="h1" weight="black" className="text-text text-2xl uppercase tracking-tight">
                        {t('settings.title')}
                    </AccessibleText>
                </View>

                <ScrollView
                    className="flex-1 px-6"
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 40 }}
                >
                    {/* Notifications */}
                    <SectionHeader title={t('settings.sections.notifications')} />
                    <Card variant="glass" className="p-0 px-4">
                        <SettingItem
                            icon="water-outline"
                            label={t('settings.notifications.water')}
                            value={profile?.notifications_settings?.water}
                            type="switch"
                            onPress={() => toggleNotification('water')}
                        />
                        <SettingItem
                            icon="fitness-outline"
                            label={t('settings.notifications.workout')}
                            value={profile?.notifications_settings?.workout}
                            type="switch"
                            onPress={() => toggleNotification('workout')}
                        />
                        <SettingItem
                            icon="restaurant-outline"
                            label={t('settings.notifications.meal')}
                            value={profile?.notifications_settings?.meal}
                            type="switch"
                            onPress={() => toggleNotification('meal')}
                        />
                        <SettingItem
                            icon="notifications-outline"
                            label={t('settings.notifications.general')}
                            value={profile?.notifications_settings?.general}
                            type="switch"
                            onPress={() => toggleNotification('general')}
                        />
                    </Card>

                    {/* Language & Region */}
                    <SectionHeader title={t('settings.sections.language')} />
                    <Card variant="glass" className="p-0 px-4">
                        <SettingItem
                            icon="language-outline"
                            label={t('profile.language')}
                            value={profile?.language?.toUpperCase()}
                            onPress={() => {
                                Alert.alert(
                                    t('profile.language'),
                                    '',
                                    ['es', 'en', 'fr', 'pt'].map(lang => ({
                                        text: lang.toUpperCase(),
                                        onPress: () => {
                                            updateProfile({ language: lang });
                                            i18n.changeLanguage(lang);
                                        }
                                    }))
                                );
                            }}
                        />
                        <SettingItem
                            icon="globe-outline"
                            label={t('settings.sections.language')}
                            value={profile?.region || t('settings.regions.spain')}
                            onPress={() => {
                                const regions = ['spain', 'mexico', 'argentina', 'colombia', 'chile', 'usa', 'other'];
                                Alert.alert(
                                    t('settings.sections.language'),
                                    '',
                                    regions.map(reg => ({
                                        text: t(`settings.regions.${reg}`),
                                        onPress: () => updateProfile({ region: t(`settings.regions.${reg}`) })
                                    }))
                                );
                            }}
                        />
                    </Card>

                    {/* Appearance */}
                    <SectionHeader title={t('settings.sections.theme')} />
                    <Card variant="glass" className="p-0 px-4">
                        <SettingItem
                            icon="color-palette-outline"
                            label={t('profile.theme')}
                            value={t(`settings.theme.${theme}`)}
                            onPress={() => {
                                Alert.alert(
                                    t('profile.theme'),
                                    '',
                                    [
                                        { text: t('settings.theme.light'), onPress: () => updateProfile({ theme: 'light' }) },
                                        { text: t('settings.theme.dark'), onPress: () => updateProfile({ theme: 'dark' }) },
                                        { text: t('settings.theme.system'), onPress: () => updateProfile({ theme: 'system' }) },
                                    ]
                                );
                            }}
                        />
                        <SettingItem
                            icon="fitness-outline"
                            label={t('profile.coachStyle')}
                            value={t(`profile.${profile?.coachStyle || 'amigo'}`)}
                            onPress={() => {
                                Alert.alert(
                                    t('profile.coachStyle'),
                                    '',
                                    ['amigo', 'cientifico', 'sargento'].map(style => ({
                                        text: t(`profile.${style}`),
                                        onPress: () => updateProfile({ coachStyle: style as any })
                                    }))
                                );
                            }}
                        />
                        <SettingItem
                            icon="resize-outline"
                            label={t('settings.sections.units')}
                            value={t(`settings.units.${profile?.units || 'metric'}`)}
                            onPress={() => {
                                Alert.alert(
                                    t('settings.sections.units'),
                                    '',
                                    [
                                        { text: t('settings.units.metric'), onPress: () => updateProfile({ units: 'metric' }) },
                                        { text: t('settings.units.imperial'), onPress: () => updateProfile({ units: 'imperial' }) },
                                    ]
                                );
                            }}
                        />
                    </Card>

                    {/* Account */}
                    <SectionHeader title={t('settings.sections.account')} />
                    <Card variant="glass" className="p-0 px-4">
                        <SettingItem
                            icon="person-outline"
                            label={t('settings.account.editProfile')}
                            onPress={() => router.push('/profile/configure')}
                        />
                        <SettingItem
                            icon="gift-outline"
                            label={t('profile.referral.title', 'Invita a un Amigo')}
                            onPress={() => router.push('/profile/referral')}
                        />
                        <SettingItem
                            icon="lock-closed-outline"
                            label={t('settings.account.changePassword')}
                            onPress={() => router.push('/forgot-password')}
                        />
                        <SettingItem
                            icon="trash-outline"
                            label={t('settings.account.deleteAccount')}
                            iconColor={colors.error}
                            onPress={() => {
                                Alert.alert(
                                    t('settings.delete_account.title'),
                                    t('settings.delete_account.warning'),
                                    [
                                        { text: t('common.cancel'), style: 'cancel' },
                                        {
                                            text: t('settings.delete_account.confirm'),
                                            style: 'destructive',
                                            onPress: async () => {
                                                // In a real app, we would delete the user data here
                                                // For now, we'll just sign out and show a message
                                                await supabase.auth.signOut();
                                                clearProfile();
                                                router.replace('/welcome');
                                                Alert.alert(t('common.success'), t('settings.delete_account.title'));
                                            }
                                        }
                                    ]
                                );
                            }}
                        />
                    </Card>

                    {/* Privacy & Security */}
                    <SectionHeader title={t('settings.sections.privacy')} />
                    <Card variant="glass" className="p-0 px-4">
                        <SettingItem
                            icon="shield-checkmark-outline"
                            label={t('settings.privacy_labels.security')}
                            onPress={() => router.push('/profile/security')}
                        />
                        <SettingItem
                            icon="eye-off-outline"
                            label={t('settings.privacy_labels.data')}
                            onPress={() => router.push('/profile/privacy')}
                        />
                    </Card>

                    {/* About */}
                    <SectionHeader title={t('settings.sections.about')} />
                    <Card variant="glass" className="p-0 px-4">
                        <SettingItem
                            icon="information-circle-outline"
                            label={t('settings.about.terms')}
                            onPress={() => {
                                setModalTitle(t('auth.modal.title'));
                                setModalContent(t('auth.modal.content'));
                                setShowTermsModal(true);
                            }}
                        />
                        <SettingItem
                            icon="document-text-outline"
                            label={t('settings.about.privacy')}
                            onPress={() => {
                                setModalTitle(t('settings.about.privacy'));
                                setModalContent(t('settings.about.privacy_content'));
                                setShowTermsModal(true);
                            }}
                        />
                        <SettingItem
                            icon="mail-outline"
                            label={t('settings.about.contact')}
                            onPress={() => Linking.openURL('mailto:contacto@mambofitness.app')}
                        />
                        <View className="py-4 items-center">
                            <AccessibleText className="text-text-secondary text-xs">
                                {t('settings.about.version')} 1.0.0 (Build 42)
                            </AccessibleText>
                        </View>
                    </Card>

                    {/* Logout Button */}
                    <TouchableOpacity
                        onPress={handleLogout}
                        className="mt-8 mb-12"
                    >
                        <LinearGradient
                            colors={[colors.error + '20', colors.error + '10']}
                            className="rounded-2xl py-4 items-center border border-red-500/20"
                        >
                            <AccessibleText weight="black" className="text-red-500 text-lg uppercase tracking-widest">
                                {t('settings.account.logout')}
                            </AccessibleText>
                        </LinearGradient>
                    </TouchableOpacity>
                </ScrollView>

                <Modal
                    visible={showTermsModal}
                    animationType="slide"
                    transparent={true}
                    onRequestClose={() => setShowTermsModal(false)}
                >
                    <View className="flex-1 justify-end bg-black/60">
                        <View className="bg-[#1a1a2e] rounded-t-[40px] h-[85%] p-8 border-t border-blue-500/20">
                            <View className="flex-row justify-between items-center mb-6">
                                <AccessibleText className="text-white text-2xl font-bold">
                                    {modalTitle}
                                </AccessibleText>
                                <TouchableOpacity
                                    onPress={() => setShowTermsModal(false)}
                                    className="w-10 h-10 bg-white/10 rounded-full items-center justify-center"
                                >
                                    <Ionicons name="close" size={24} color="white" />
                                </TouchableOpacity>
                            </View>

                            <ScrollView
                                showsVerticalScrollIndicator={false}
                                className="flex-1"
                            >
                                <View className="bg-white/5 p-6 rounded-3xl border border-white/10">
                                    <AccessibleText className="text-gray-300 leading-7 text-base">
                                        {modalContent}
                                    </AccessibleText>
                                </View>
                            </ScrollView>

                            <TouchableOpacity
                                onPress={() => setShowTermsModal(false)}
                                className="mt-8"
                            >
                                <LinearGradient
                                    colors={['#3b82f6', '#60a5fa']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    className="rounded-2xl py-4 items-center shadow-lg shadow-blue-500/30"
                                >
                                    <AccessibleText className="text-white text-lg font-bold">
                                        {t('common.ok')}
                                    </AccessibleText>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            </View>
        </ScreenWrapper>
    );
}
