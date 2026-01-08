import React, { useState } from 'react';
import { View, TouchableOpacity, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { AuthInput } from '@/components/auth/AuthInput';
import { PasswordStrengthIndicator } from '@/components/auth/PasswordStrengthIndicator';
import { validatePassword, validatePasswordConfirmation } from '@/utils/authValidation';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { AccessibleText } from '@/components/ui/AccessibleText';

export default function ResetPasswordScreen() {
    const { t } = useTranslation();
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [confirmPasswordError, setConfirmPasswordError] = useState('');

    const passwordValidation = validatePassword(password);

    const handlePasswordChange = (text: string) => {
        setPassword(text);
        if (passwordError) {
            const validation = validatePassword(text);
            setPasswordError(validation.valid ? '' : t('auth.validation.passwordTooShort'));
        }
    };

    const handleConfirmPasswordChange = (text: string) => {
        setConfirmPassword(text);
        if (confirmPasswordError) {
            const validation = validatePasswordConfirmation(password, text);
            setConfirmPasswordError(validation.error ? t('auth.validation.passwordsDontMatch') : '');
        }
    };

    const validateForm = (): boolean => {
        let isValid = true;

        const passwordValidation = validatePassword(password);
        if (!passwordValidation.valid) {
            setPasswordError(t('auth.validation.passwordTooShort'));
            isValid = false;
        }

        const confirmValidation = validatePasswordConfirmation(password, confirmPassword);
        if (!confirmValidation.valid) {
            setConfirmPasswordError(t('auth.validation.passwordsDontMatch'));
            isValid = false;
        }

        return isValid;
    };

    const handleResetPassword = async () => {
        if (!validateForm()) return;

        setLoading(true);

        try {
            const { error } = await supabase.auth.updateUser({
                password: password,
            });

            if (error) {
                Alert.alert(t('common.error'), error.message);
                return;
            }

            Alert.alert(
                t('auth.passwordResetSuccess'),
                t('auth.passwordResetSuccessDesc'),
                [
                    {
                        text: t('common.ok'),
                        onPress: () => router.replace('/auth')
                    }
                ]
            );
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
                        <View className="flex-1 px-6 justify-center">
                            <Animated.View entering={FadeInUp.delay(100).springify()}>
                                {/* Icon */}
                                <View className="items-center mb-8">
                                    <View className="w-20 h-20 bg-blue-500/20 rounded-full items-center justify-center mb-4">
                                        <Ionicons name="lock-closed" size={40} color="#60a5fa" />
                                    </View>
                                    <AccessibleText className="text-white text-3xl font-bold text-center">
                                        {t('auth.resetPassword')}
                                    </AccessibleText>
                                    <AccessibleText className="text-gray-400 text-center mt-3">
                                        {t('auth.resetSubtitle')}
                                    </AccessibleText>
                                </View>

                                {/* Form */}
                                <Animated.View entering={FadeInDown.delay(200).springify()}>
                                    <AuthInput
                                        icon="lock-closed-outline"
                                        placeholder={t('auth.passwordPlaceholder')}
                                        value={password}
                                        onChangeText={handlePasswordChange}
                                        error={passwordError}
                                        isPassword
                                        autoCapitalize="none"
                                    />

                                    <PasswordStrengthIndicator
                                        password={password}
                                        strength={passwordValidation.strength}
                                        score={passwordValidation.score}
                                    />

                                    <View className="mt-2">
                                        <AuthInput
                                            icon="lock-closed-outline"
                                            placeholder={t('auth.confirmPassword')}
                                            value={confirmPassword}
                                            onChangeText={handleConfirmPasswordChange}
                                            error={confirmPasswordError}
                                            isPassword
                                            autoCapitalize="none"
                                        />
                                    </View>

                                    <TouchableOpacity
                                        onPress={handleResetPassword}
                                        disabled={loading}
                                        className="mt-6"
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
                                                <AccessibleText className="text-white text-lg font-bold">{t('auth.resetPassword')}</AccessibleText>
                                            )}
                                        </LinearGradient>
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
