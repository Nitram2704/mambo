import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, ScrollView, Switch, Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { Card } from '@/components/ui/Card';
import { useAppTheme } from '@/hooks/use-app-theme';
import { Colors } from '@/constants/Colors';
import { AccessibleText } from '@/components/ui/AccessibleText';
import * as LocalAuthentication from 'expo-local-authentication';
import { useUserProfileStore } from '@/store/userProfileStore';

export default function SecurityScreen() {
    const router = useRouter();
    const { t } = useTranslation();
    const { theme } = useAppTheme();
    const { profile, updateProfile } = useUserProfileStore();

    const [isBiometricSupported, setIsBiometricSupported] = useState(false);
    const [biometricType, setBiometricType] = useState<'FACE' | 'FINGERPRINT' | 'IRIS' | null>(null);

    useEffect(() => {
        checkBiometricSupport();
    }, []);

    const checkBiometricSupport = async () => {
        const compatible = await LocalAuthentication.hasHardwareAsync();
        setIsBiometricSupported(compatible);

        if (compatible) {
            const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
            if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
                setBiometricType('FACE');
            } else if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
                setBiometricType('FINGERPRINT');
            } else if (types.includes(LocalAuthentication.AuthenticationType.IRIS)) {
                setBiometricType('IRIS');
            }
        }
    };

    const toggleBiometric = async (value: boolean) => {
        if (value) {
            const result = await LocalAuthentication.authenticateAsync({
                promptMessage: t('security.biometric_prompt'),
                fallbackLabel: t('security.biometric_fallback'),
            });

            if (result.success) {
                updateProfile({ biometricEnabled: true });
            } else {
                Alert.alert(t('common.error'), t('security.biometric_failed'));
                updateProfile({ biometricEnabled: false });
            }
        } else {
            updateProfile({ biometricEnabled: false });
        }
    };

    // Mock login history
    const loginHistory = [
        { id: 1, device: 'iPhone 15 Pro', location: 'Madrid, ES', date: 'Hace 2 minutos', current: true },
        { id: 2, device: 'Chrome on Windows', location: 'Madrid, ES', date: 'Ayer, 10:30 AM', current: false },
        { id: 3, device: 'iPad Air', location: 'Barcelona, ES', date: '20 Dic, 18:45 PM', current: false },
    ];

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
                        {t('settings.privacy_labels.security')}
                    </AccessibleText>
                </View>

                <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>

                    {/* Biometrics */}
                    <AccessibleText weight="bold" className="text-text-secondary text-xs uppercase tracking-widest mb-2 mt-4 px-1">
                        {t('security.biometrics_title')}
                    </AccessibleText>
                    <Card variant="glass" className="p-0 px-4">
                        <View className="flex-row items-center justify-between py-4">
                            <View className="flex-row items-center flex-1">
                                <View className="w-10 h-10 rounded-xl items-center justify-center mr-4 bg-primary/10">
                                    <Ionicons
                                        name={biometricType === 'FACE' ? 'scan-outline' : 'finger-print-outline'}
                                        size={22}
                                        color={Colors[theme].primary}
                                    />
                                </View>
                                <View>
                                    <AccessibleText weight="medium" className="text-text text-base">
                                        {biometricType === 'FACE' ? 'Face ID' : biometricType === 'FINGERPRINT' ? 'Touch ID' : 'Biometría'}
                                    </AccessibleText>
                                    <AccessibleText className="text-text-secondary text-xs mt-0.5">
                                        {t('security.biometric_desc')}
                                    </AccessibleText>
                                </View>
                            </View>
                            <Switch
                                value={profile?.biometricEnabled || false}
                                onValueChange={toggleBiometric}
                                disabled={!isBiometricSupported}
                                trackColor={{ false: Colors[theme].border, true: Colors[theme].primary }}
                                thumbColor="#ffffff"
                            />
                        </View>
                    </Card>

                    {/* Password */}
                    <AccessibleText weight="bold" className="text-text-secondary text-xs uppercase tracking-widest mb-2 mt-6 px-1">
                        {t('security.access_title')}
                    </AccessibleText>
                    <Card variant="glass" className="p-0 px-4">
                        <TouchableOpacity
                            onPress={() => router.push('/forgot-password')}
                            className="flex-row items-center justify-between py-4"
                        >
                            <View className="flex-row items-center flex-1">
                                <View className="w-10 h-10 rounded-xl items-center justify-center mr-4 bg-white/5">
                                    <Ionicons name="key-outline" size={22} color={Colors[theme].text} />
                                </View>
                                <AccessibleText weight="medium" className="text-text text-base">
                                    {t('settings.account.changePassword')}
                                </AccessibleText>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color={Colors[theme].textMuted} />
                        </TouchableOpacity>
                    </Card>

                    {/* Login History */}
                    <AccessibleText weight="bold" className="text-text-secondary text-xs uppercase tracking-widest mb-2 mt-6 px-1">
                        {t('security.sessions_title')}
                    </AccessibleText>
                    <Card variant="glass" className="p-0 px-4">
                        {loginHistory.map((session, index) => (
                            <View
                                key={session.id}
                                className={`flex-row items-center justify-between py-4 ${index !== loginHistory.length - 1 ? 'border-b border-white/5' : ''}`}
                            >
                                <View className="flex-row items-center flex-1">
                                    <View className="w-10 h-10 rounded-xl items-center justify-center mr-4 bg-white/5">
                                        <Ionicons
                                            name={session.device.toLowerCase().includes('phone') ? 'phone-portrait-outline' : 'laptop-outline'}
                                            size={22}
                                            color={session.current ? Colors[theme].success : Colors[theme].textMuted}
                                        />
                                    </View>
                                    <View>
                                        <AccessibleText weight="medium" className="text-text text-sm">
                                            {session.device}
                                        </AccessibleText>
                                        <AccessibleText className="text-text-secondary text-xs mt-0.5">
                                            {session.location} • {session.date}
                                        </AccessibleText>
                                    </View>
                                </View>
                                {session.current && (
                                    <View className="bg-success/20 px-2 py-1 rounded-md">
                                        <AccessibleText className="text-success text-[10px] font-bold uppercase">
                                            {t('common.current')}
                                        </AccessibleText>
                                    </View>
                                )}
                            </View>
                        ))}
                    </Card>

                </ScrollView>
            </View>
        </ScreenWrapper>
    );
}
