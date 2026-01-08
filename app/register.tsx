import React, { useState } from 'react';
import { View, TouchableOpacity, ScrollView, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { AuthInput } from '@/components/auth/AuthInput';
import { PasswordStrengthIndicator } from '@/components/auth/PasswordStrengthIndicator';
import { validateEmail, validateName, validatePassword, validatePasswordConfirmation } from '@/utils/authValidation';
import { performSocialLogin } from '@/utils/authUtils';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { AccessibleText } from '@/components/ui/AccessibleText';

export default function RegisterScreen() {
    const { t } = useTranslation();
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    // Form state
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [showTermsModal, setShowTermsModal] = useState(false);

    // Error state
    const [nameError, setNameError] = useState('');
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [confirmPasswordError, setConfirmPasswordError] = useState('');

    // Password strength
    const passwordValidation = validatePassword(password);

    const handleNameChange = (text: string) => {
        setName(text);
        if (nameError) {
            const validation = validateName(text);
            setNameError(validation.error ? t('auth.validation.nameRequired') : '');
        }
    };

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

        const nameValidation = validateName(name);
        if (!nameValidation.valid) {
            setNameError(t('auth.validation.nameRequired'));
            isValid = false;
        }

        const emailValidation = validateEmail(email);
        if (!emailValidation.valid) {
            setEmailError(t('auth.validation.emailInvalid'));
            isValid = false;
        }

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

        if (!termsAccepted) {
            Alert.alert(t('auth.termsRequired'), t('auth.acceptTerms'));
            isValid = false;
        }

        return isValid;
    };

    const handleRegister = async () => {
        if (!validateForm()) return;

        setLoading(true);

        try {
            const { data, error } = await supabase.auth.signUp({
                email: email.trim(),
                password: password,
                options: {
                    data: {
                        full_name: name.trim(),
                    }
                }
            });

            if (error) {
                if (error.message.includes('already registered')) {
                    Alert.alert(t('common.error'), t('auth.hasAccount'), [
                        { text: t('common.cancel'), style: 'cancel' },
                        { text: t('auth.signIn'), onPress: () => router.push('/auth') }
                    ]);
                } else {
                    Alert.alert(t('common.error'), error.message);
                }
                return;
            }

            if (!data.session) {
                Alert.alert(
                    t('auth.registerSuccess'),
                    t('auth.checkInbox')
                );
            }
            // Navigation will be handled automatically by _layout.tsx
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
                        {/* Header */}
                        <View className="flex-row items-center px-6 py-4">
                            <TouchableOpacity
                                onPress={() => router.back()}
                                className="mr-4"
                            >
                                <Ionicons name="arrow-back" size={24} color="white" />
                            </TouchableOpacity>
                            <View>
                                <AccessibleText className="text-white text-2xl font-bold">{t('auth.registerTitle')}</AccessibleText>
                                <AccessibleText className="text-gray-400 text-sm">{t('auth.registerSubtitle')}</AccessibleText>
                            </View>
                        </View>

                        <ScrollView
                            className="flex-1 px-6"
                            showsVerticalScrollIndicator={false}
                            keyboardShouldPersistTaps="handled"
                        >
                            {/* Form */}
                            <Animated.View entering={FadeInDown.delay(100).springify()}>
                                <AuthInput
                                    icon="person-outline"
                                    placeholder={t('auth.fullName')}
                                    value={name}
                                    onChangeText={handleNameChange}
                                    error={nameError}
                                    autoCapitalize="words"
                                />

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

                                {/* Terms & Conditions */}
                                <View className="flex-row items-start mt-4">
                                    <TouchableOpacity
                                        onPress={() => setTermsAccepted(!termsAccepted)}
                                        className="mt-0.5"
                                    >
                                        <Ionicons
                                            name={termsAccepted ? 'checkbox' : 'square-outline'}
                                            size={24}
                                            color={termsAccepted ? '#60a5fa' : '#6B7280'}
                                        />
                                    </TouchableOpacity>
                                    <View className="ml-3 flex-1">
                                        <AccessibleText className="text-gray-400 text-sm">
                                            {t('auth.accept')}
                                            <AccessibleText
                                                onPress={() => setShowTermsModal(true)}
                                                className="text-blue-500 font-semibold"
                                            >
                                                {t('auth.termsAndConditions')}
                                            </AccessibleText>
                                        </AccessibleText>
                                    </View>
                                </View>

                                {/* Register Button */}
                                <TouchableOpacity
                                    onPress={handleRegister}
                                    disabled={loading}
                                    className="mt-8 mb-4"
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
                                            <AccessibleText className="text-white text-lg font-bold">{t('auth.signUp')}</AccessibleText>
                                        )}
                                    </LinearGradient>
                                </TouchableOpacity>

                                {/* Divider */}
                                <View className="flex-row items-center mb-6">
                                    <View className="flex-1 h-px bg-gray-700" />
                                    <AccessibleText className="text-gray-500 text-sm mx-4">{t('auth.social.or')}</AccessibleText>
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

                                {/* Login Link */}
                                <TouchableOpacity
                                    onPress={() => router.push('/auth')}
                                    className="items-center py-4 mb-8"
                                >
                                    <AccessibleText className="text-gray-400">
                                        {t('auth.hasAccount')}{' '}
                                        <AccessibleText className="text-blue-500 font-semibold">{t('auth.signIn')}</AccessibleText>
                                    </AccessibleText>
                                </TouchableOpacity>
                            </Animated.View>
                        </ScrollView>
                    </KeyboardAvoidingView>
                </SafeAreaView>
            </LinearGradient>

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
                                {t('auth.modal.title')}
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
                                    {t('auth.modal.content')}
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
    );
}
