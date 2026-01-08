import React, { useEffect } from 'react';
import { View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useAnimatedStyle, withSpring, useSharedValue } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { AccessibleText } from '../ui/AccessibleText';

interface PasswordStrengthIndicatorProps {
    password: string;
    strength: 'weak' | 'medium' | 'strong';
    score: number;
}

export function PasswordStrengthIndicator({ password, strength, score }: PasswordStrengthIndicatorProps) {
    const { t } = useTranslation();
    const animatedScore = useSharedValue(0);

    useEffect(() => {
        animatedScore.value = score;
    }, [score]);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            width: `${withSpring(animatedScore.value, {
                damping: 15,
                stiffness: 100,
            })}%`,
        };
    });

    const getStrengthColor = (): readonly [string, string, ...string[]] => {
        switch (strength) {
            case 'weak':
                return ['#ef4444', '#dc2626']; // Red
            case 'medium':
                return ['#f59e0b', '#d97706']; // Yellow/Orange
            case 'strong':
                return ['#22c55e', '#16a34a']; // Green
            default:
                return ['#ef4444', '#dc2626'];
        }
    };

    const getStrengthLabel = () => {
        switch (strength) {
            case 'weak':
                return t('auth.strength.weak');
            case 'medium':
                return t('auth.strength.fair');
            case 'strong':
                return t('auth.strength.strong');
            default:
                return t('auth.strength.weak');
        }
    };

    if (!password) return null;

    return (
        <View className="mt-2">
            <View className="flex-row justify-between items-center mb-1">
                <AccessibleText className="text-xs text-gray-400">
                    {t('auth.passwordStrength')}
                </AccessibleText>
                <AccessibleText className={`text-xs font-bold ${strength === 'weak' ? 'text-red-500' :
                    strength === 'medium' ? 'text-yellow-500' :
                        'text-green-500'
                    }`}>
                    {getStrengthLabel()}
                </AccessibleText>
            </View>
            <View className="h-2 bg-gray-700 rounded-full overflow-hidden">
                <Animated.View style={[animatedStyle, { height: '100%' }]}>
                    <LinearGradient
                        colors={getStrengthColor()}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={{ height: '100%', borderRadius: 9999 }}
                    />
                </Animated.View>
            </View>
        </View>
    );
}
