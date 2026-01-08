import React, { useState } from 'react';
import { View, TouchableOpacity, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { AuthInput } from '@/components/auth/AuthInput';
import { validateEmail } from '@/utils/authValidation';
import { performSocialLogin } from '@/utils/authUtils';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { AccessibleText } from '@/components/ui/AccessibleText';

export default function LoginScreen() {
    const { t } = useTranslation();
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    // Form state
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);

    // Error state
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');

    const handleEmailChange = (text: string) => {
        setEmail(text);
        if (emailError) {
            const validation = validateEmail(text);
            setEmailError(validation.error ? t('auth.validation.emailInvalid') : '');
        }
    };

    const handlePasswordChange = (text: string) => {
        setPassword(text);
        if (passwordError) {
            setPasswordError('');
        }
    };

    const validateForm = (): boolean => {
        let isValid = true;

        const emailValidation = validateEmail(email);
        if (!emailValidation.valid) {
            setEmailError(t('auth.validation.emailInvalid'));
            isValid = false;
        }

        if (!password || password.trim() === '') {
            setPasswordError(t('auth.validation.passwordTooShort'));
            isValid = false;
        }

        return isValid;
    };

    const handleLogin = async () => {
        if (!validateForm()) return;

        setLoading(true);

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email: email.trim(),
                password: password,
            });

            if (error) {
                if (error.message.includes('Invalid login credentials')) {
                    Alert.alert(t('common.error'), t('auth.validation.emailInvalid'));
                } else if (error.message.includes('Email not confirmed')) {
                    Alert.alert(t('common.error'), t('auth.checkInbox'));
                } else {
                    Alert.alert(t('common.error'), error.message);
                }
                return;
            }

            // Login successful - navigation handled by auth state change
        } catch (error: any) {
            Alert.alert(t('common.error'), t('onboarding.generating.error'));
        } finally {
            setLoading(false);
        }
    };

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
                        <ScrollView
                            className="flex-1"
                            contentContainerStyle={{ flexGrow: 1 }}
                            showsVerticalScrollIndicator={false}
                            keyboardShouldPersistTaps="handled"
                        >
                            {/* Header */}
                            <Animated.View
                                entering={FadeInUp.delay(100).springify()}
                                className="items-center pt-16 pb-8"
                            >
                                <View className="w-20 h-20 bg-blue-500 rounded-3xl items-center justify-center mb-4">
                                    <Ionicons name="fitness" size={48} color="white" />
                                </View>
                                <AccessibleText className="text-white text-3xl font-bold">{t('auth.welcome')}</AccessibleText>
                                <AccessibleText className="text-gray-400 text-base mt-2">{t('auth.signIn')}</AccessibleText>
                            </Animated.View>

                            {/* Form */}
                            <View className="flex-1 px-6">
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

                                    <AuthInput
                                        icon="lock-closed-outline"
                                        placeholder={t('auth.passwordPlaceholder')}
                                        value={password}
                                        onChangeText={handlePasswordChange}
                                        error={passwordError}
                                        isPassword
                                        autoCapitalize="none"
                                    />

                                    {/* Remember Me & Forgot Password */}
                                    <View className="flex-row justify-between items-center mb-6">
                                        <TouchableOpacity
                                            onPress={() => setRememberMe(!rememberMe)}
                                            className="flex-row items-center"
                                        >
                                            <Ionicons
                                                name={rememberMe ? 'checkbox' : 'square-outline'}
                                                size={20}
                                                color={rememberMe ? '#60a5fa' : '#6B7280'}
                                            />
                                            <AccessibleText className="text-gray-400 text-sm ml-2">{t('profile.settings')}</AccessibleText>
                                        </TouchableOpacity>

                                        <TouchableOpacity onPress={() => router.push('/forgot-password')}>
                                            <AccessibleText className="text-blue-500 text-sm font-semibold">
                                                {t('auth.forgotPassword')}
                                            </AccessibleText>
                                        </TouchableOpacity>
                                    </View>

                                    {/* Login Button */}
                                    <TouchableOpacity
                                        onPress={handleLogin}
                                        disabled={loading}
                                        className="mb-6"
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
                                                <AccessibleText className="text-white text-lg font-bold">{t('auth.signIn')}</AccessibleText>
                                            )}
                                        </LinearGradient>
                                    </TouchableOpacity>

                                    {/* Divider */}
                                    <View className="flex-row items-center mb-6">
                                        <View className="flex-1 h-px bg-gray-700" />
                                        <AccessibleText className="text-gray-500 text-sm mx-4">{t('common.continue')}</AccessibleText>
                                        <View className="flex-1 h-px bg-gray-700" />
                                    </View>

                                    {/* Social Login */}
                                    <View className="flex-row justify-between gap-4 mb-6">
                                        <TouchableOpacity
                                            onPress={() => performSocialLogin('google')}
                                            className="flex-1 flex-row items-center justify-center bg-white/5 border border-white/10 rounded-2xl py-4"
                                        >
                                            <Ionicons name="logo-google" size={20} color="white" />
                                            <AccessibleText className="text-white font-semibold ml-2">{t('auth.continueWithGoogle')}</AccessibleText>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            onPress={() => performSocialLogin('apple')}
                                            className="flex-1 flex-row items-center justify-center bg-white/5 border border-white/10 rounded-2xl py-4"
                                        >
                                            <Ionicons name="logo-apple" size={20} color="white" />
                                            <AccessibleText className="text-white font-semibold ml-2">{t('auth.continueWithApple')}</AccessibleText>
                                        </TouchableOpacity>
                                    </View>
                                </Animated.View>
                            </View>

                            {/* Register Link */}
                            <Animated.View
                                entering={FadeInUp.delay(300).springify()}
                                className="items-center pb-8"
                            >
                                <TouchableOpacity onPress={() => router.push('/register')}>
                                    <AccessibleText className="text-gray-400">
                                        {t('auth.noAccount')}{' '}
                                        <AccessibleText className="text-blue-500 font-semibold">{t('auth.signUp')}</AccessibleText>
                                    </AccessibleText>
                                </TouchableOpacity>
                            </Animated.View>
                        </ScrollView>
                    </KeyboardAvoidingView>
                </SafeAreaView>
            </LinearGradient>
        </View>
    );
}
