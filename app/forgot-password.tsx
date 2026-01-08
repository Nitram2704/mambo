import React, { useState } from 'react';
import { View, TouchableOpacity, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { AuthInput } from '@/components/auth/AuthInput';
import { validateEmail } from '@/utils/authValidation';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { AccessibleText } from '@/components/ui/AccessibleText';

export default function ForgotPasswordScreen() {
    const { t } = useTranslation();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [emailError, setEmailError] = useState('');
    const [emailSent, setEmailSent] = useState(false);

    const handleEmailChange = (text: string) => {
        setEmail(text);
        if (emailError) {
            const validation = validateEmail(text);
            setEmailError(validation.error ? t('auth.validation.emailInvalid') : '');
        }
    };

    const handleSendResetLink = async () => {
        const emailValidation = validateEmail(email);
        if (!emailValidation.valid) {
            setEmailError(t('auth.validation.emailInvalid'));
            return;
        }

        setLoading(true);

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
                redirectTo: 'mambo://reset-password',
            });

            if (error) {
                Alert.alert(t('common.error'), error.message);
                return;
            }

            setEmailSent(true);
        } catch (error: any) {
            Alert.alert(t('common.error'), t('onboarding.generating.error'));
        } finally {
            setLoading(false);
        }
    };

    if (emailSent) {
        return (
            <View className="flex-1">
                <Stack.Screen options={{ headerShown: false }} />

                <LinearGradient
                    colors={['#1a1a2e', '#16213e', '#0f3460']}
                    className="flex-1"
                >
                    <SafeAreaView className="flex-1 px-6 justify-center">
                        <Animated.View
                            entering={FadeInUp.springify()}
                            className="items-center"
                        >
                            <View className="w-24 h-24 bg-green-500/20 rounded-full items-center justify-center mb-6">
                                <Ionicons name="mail-open" size={48} color="#22c55e" />
                            </View>

                            <AccessibleText className="text-white text-2xl font-bold text-center mb-3">
                                {t('auth.emailSent')}
                            </AccessibleText>

                            <AccessibleText className="text-gray-400 text-center mb-8">
                                {t('auth.checkInbox')}
                                <AccessibleText className="text-white font-semibold">{email}</AccessibleText>
                            </AccessibleText>

                            <TouchableOpacity
                                onPress={() => router.push('/auth')}
                                className="w-full"
                            >
                                <LinearGradient
                                    colors={['#3b82f6', '#60a5fa']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    className="rounded-2xl py-4 items-center"
                                >
                                    <AccessibleText className="text-white text-lg font-bold">{t('auth.signIn')}</AccessibleText>
                                </LinearGradient>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => setEmailSent(false)}
                                className="mt-4"
                            >
                                <AccessibleText className="text-blue-500 font-semibold">
                                    {t('auth.didntReceiveEmail')}
                                </AccessibleText>
                            </TouchableOpacity>
                        </Animated.View>
                    </SafeAreaView>
                </LinearGradient>
            </View>
        );
    }

    return (
        <View className="flex-1">
            <Stack.Screen options={{ headerShown: false }} />

            <LinearGradient
                colors={['#1a1a2e', '#16213e', '#0f3460']}
                className="flex-1"
            >
                <SafeAreaView className="flex-1">
                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                        className="flex-1"
                    >
                        {/* Header */}
                        <View className="flex-row items-center px-6 py-4">
                            <TouchableOpacity
                                onPress={() => router.back()}
                                className="mr-4"
                            >
                                <Ionicons name="arrow-back" size={24} color="white" />
                            </TouchableOpacity>
                        </View>

                        <View className="flex-1 px-6 justify-center">
                            <Animated.View entering={FadeInUp.delay(100).springify()}>
                                {/* Icon */}
                                <View className="items-center mb-8">
                                    <View className="w-20 h-20 bg-blue-500/20 rounded-full items-center justify-center mb-4">
                                        <Ionicons name="key" size={40} color="#60a5fa" />
                                    </View>
                                    <AccessibleText className="text-white text-3xl font-bold text-center">
                                        {t('auth.forgotPasswordTitle')}
                                    </AccessibleText>
                                    <AccessibleText className="text-gray-400 text-center mt-3">
                                        {t('auth.forgotPasswordDesc')}
                                    </AccessibleText>
                                </View>

                                {/* Form */}
                                <Animated.View entering={FadeInDown.delay(200).springify()}>
                                    <AuthInput
                                        icon="mail-outline"
                                        placeholder={t('auth.emailPlaceholder')}
                                        value={email}
                                        onChangeText={handleEmailChange}
                                        error={emailError}
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                    />

                                    <TouchableOpacity
                                        onPress={handleSendResetLink}
                                        disabled={loading}
                                        className="mt-4"
                                    >
                                        <LinearGradient
                                            colors={loading ? ['#6B7280', '#4B5563'] : ['#3b82f6', '#60a5fa']}
                                            start={{ x: 0, y: 0 }}
                                            end={{ x: 1, y: 0 }}
                                            className="rounded-2xl py-4 items-center"
                                        >
                                            {loading ? (
                                                <ActivityIndicator color="white" />
                                            ) : (
                                                <AccessibleText className="text-white text-lg font-bold">{t('auth.sendLink')}</AccessibleText>
                                            )}
                                        </LinearGradient>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        onPress={() => router.back()}
                                        className="items-center mt-6"
                                    >
                                        <AccessibleText className="text-gray-400">
                                            <Ionicons name="arrow-back" size={14} />{' '}
                                            {t('auth.signIn')}
                                        </AccessibleText>
                                    </TouchableOpacity>
                                </Animated.View>
                            </Animated.View>
                        </View>
                    </KeyboardAvoidingView>
                </SafeAreaView>
            </LinearGradient>
        </View>
    );
}
