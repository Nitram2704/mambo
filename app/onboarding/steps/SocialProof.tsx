import React, { useEffect } from 'react';
import { View, Image } from 'react-native';
import { AccessibleText } from '@/components/ui/AccessibleText';
import { useTranslation } from 'react-i18next';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/Colors';
import Animated, { FadeInUp, FadeInDown, useSharedValue, withSpring, useAnimatedStyle, withDelay } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/use-app-theme';

interface SocialProofProps {
    onNext: () => void;
}

export default function SocialProof({ onNext }: SocialProofProps) {
    const { t } = useTranslation();
    const { theme } = useAppTheme();
    const colors = Colors[theme];

    useEffect(() => {
        const timer = setTimeout(() => {
            onNext();
        }, 4000); // Auto-advance after 4 seconds

        return () => clearTimeout(timer);
    }, []);

    return (
        <View className="flex-1 justify-center items-center">
            <Animated.View entering={FadeInUp.duration(600).springify()} className="items-center mb-10">
                <View className="bg-primary/20 p-6 rounded-full mb-6">
                    <Ionicons name="people" size={48} color={colors.primary} />
                </View>
                <AccessibleText variant="h1" weight="bold" className="text-center text-3xl mb-2">
                    {t('onboarding.socialProof.title')}
                </AccessibleText>
                <AccessibleText className="text-text-secondary text-center text-lg px-4">
                    {t('onboarding.socialProof.subtitle')}
                </AccessibleText>
            </Animated.View>

            <View className="w-full px-6 gap-4">
                <StatCard
                    delay={200}
                    label={t('onboarding.socialProof.stat1')}
                    value={t('onboarding.socialProof.stat1Value')}
                    icon="person-add"
                    color={colors.primary}
                />
                <StatCard
                    delay={400}
                    label={t('onboarding.socialProof.stat2')}
                    value={t('onboarding.socialProof.stat2Value')}
                    icon="barbell"
                    color={colors.orange[500]}
                />
                <StatCard
                    delay={600}
                    label={t('onboarding.socialProof.stat3')}
                    value={t('onboarding.socialProof.stat3Value')}
                    icon="trophy"
                    color={colors.yellow[500]}
                />
            </View>

            <Animated.View
                entering={FadeInDown.delay(1000).springify()}
                className="mt-12 bg-surface-highlight/50 p-6 rounded-3xl mx-6 border border-border/10"
            >
                <AccessibleText className="text-text text-lg italic text-center mb-4">
                    {t('onboarding.socialProof.quote')}
                </AccessibleText>
                <View className="flex-row justify-center items-center">
                    <View className="w-8 h-8 bg-surface-highlight rounded-full mr-2" />
                    <AccessibleText weight="bold" className="text-text-secondary">
                        {t('onboarding.socialProof.author')}
                    </AccessibleText>
                </View>
            </Animated.View>
        </View>
    );
}

function StatCard({ delay, label, value, icon, color }: any) {
    return (
        <Animated.View
            entering={FadeInDown.delay(delay).springify()}
            className="flex-row items-center bg-surface-highlight/30 p-4 rounded-2xl border border-border/10"
        >
            <View
                className="w-12 h-12 rounded-xl items-center justify-center mr-4"
                style={{ backgroundColor: `${color}20` }}
            >
                <Ionicons name={icon} size={24} color={color} />
            </View>
            <View>
                <AccessibleText weight="bold" className="text-2xl text-text">
                    {value}
                </AccessibleText>
                <AccessibleText className="text-text-secondary text-sm">
                    {label}
                </AccessibleText>
            </View>
        </Animated.View>
    );
}
