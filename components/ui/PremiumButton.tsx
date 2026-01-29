import React from 'react';
import { TouchableOpacity, ActivityIndicator, TouchableOpacityProps, View, Platform, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { triggerHaptic } from '@/utils/haptics';
import * as Haptics from 'expo-haptics';
import { cssInterop } from 'react-native-css-interop';
import { a11y } from '@/utils/accessibility';
import { AccessibleText } from './AccessibleText';
import { useAppTheme } from '@/hooks/use-app-theme';
import { Colors } from '@/constants/Colors';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';

interface PremiumButtonProps extends TouchableOpacityProps {
    variant?: 'primary' | 'secondary' | 'glass' | 'danger' | 'success';
    size?: 'sm' | 'md' | 'lg';
    label: string;
    loading?: boolean;
    icon?: React.ReactNode;
    iconPosition?: 'left' | 'right';
    className?: string;
    textClassName?: string;
    accessibilityHint?: string;
}

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

export const PremiumButton: React.FC<PremiumButtonProps> = ({
    variant = 'primary',
    size = 'md',
    label,
    loading = false,
    icon,
    iconPosition = 'left',
    className,
    textClassName,
    onPress,
    disabled,
    accessibilityHint,
    ...props
}) => {
    const { theme } = useAppTheme();
    const colors = Colors[theme];
    const scale = useSharedValue(1);

    const handlePressIn = () => {
        scale.value = withSpring(0.96);
    };

    const handlePressOut = () => {
        scale.value = withSpring(1);
    };

    const handlePress = (e: any) => {
        triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
        onPress?.(e);
    };

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }]
    }));

    const getGradientColors = () => {
        switch (variant) {
            case 'primary':
                return [colors.primary, '#3b82f6'] as const;
            case 'secondary':
                return theme === 'dark'
                    ? ['#334155', '#1e293b'] as const
                    : ['#f1f5f9', '#e2e8f0'] as const;
            case 'glass':
                return theme === 'dark'
                    ? ['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)'] as const
                    : ['rgba(0, 0, 0, 0.05)', 'rgba(0, 0, 0, 0.02)'] as const;
            case 'danger':
                return ['#ef4444', '#dc2626'] as const;
            case 'success':
                return ['#22c55e', '#16a34a'] as const;
            default:
                return [colors.primary, '#3b82f6'] as const;
        }
    };

    const getTextColor = () => {
        if (variant === 'secondary' && theme !== 'dark') return colors.text;
        if (variant === 'glass') return colors.text;
        return '#ffffff';
    };

    const getSizeStyles = () => {
        switch (size) {
            case 'sm': return 'h-10 px-4 rounded-xl';
            case 'lg': return 'h-16 px-8 rounded-2xl';
            default: return 'h-14 px-6 rounded-2xl';
        }
    };

    const getTextSizeStyles = () => {
        switch (size) {
            case 'sm': return 'text-sm';
            case 'lg': return 'text-lg';
            default: return 'text-base';
        }
    };

    return (
        <AnimatedTouchableOpacity
            onPress={handlePress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            disabled={disabled || loading}
            activeOpacity={1}
            style={[animatedStyle, props.style]}
            className={`overflow-hidden ${className || ''}`}
            {...a11y.button(label, accessibilityHint, { disabled: disabled || loading, busy: loading })}
            {...props}
        >
            <LinearGradient
                colors={getGradientColors()}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className={`flex-row items-center justify-center ${getSizeStyles()}`}
                style={variant === 'glass' ? styles.glassBorder : null}
            >
                {loading ? (
                    <ActivityIndicator color={getTextColor()} />
                ) : (
                    <>
                        {icon && iconPosition === 'left' && (
                            <View className="mr-2">{icon}</View>
                        )}
                        <AccessibleText
                            weight="bold"
                            style={{ color: getTextColor() }}
                            className={`text-center ${getTextSizeStyles()} ${textClassName || ''}`}
                        >
                            {label}
                        </AccessibleText>
                        {icon && iconPosition === 'right' && (
                            <View className="ml-2">{icon}</View>
                        )}
                    </>
                )}
            </LinearGradient>
        </AnimatedTouchableOpacity>
    );
};

const styles = StyleSheet.create({
    glassBorder: {
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    }
});

cssInterop(PremiumButton, {
    className: {
        target: 'style',
    },
});
