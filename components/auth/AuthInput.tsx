import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, TextInputProps } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useAnimatedStyle, withTiming, interpolateColor } from 'react-native-reanimated';
import { AccessibleText } from '../ui/AccessibleText';
import { Colors } from '@/constants/Colors';
import { useAppTheme } from '@/hooks/use-app-theme';

interface AuthInputProps extends TextInputProps {
    icon: keyof typeof Ionicons.glyphMap;
    error?: string;
    isPassword?: boolean;
    onChangeText: (text: string) => void;
    value: string;
}

export function AuthInput({
    icon,
    error,
    isPassword = false,
    onChangeText,
    value,
    placeholder,
    ...props
}: AuthInputProps) {
    const [isFocused, setIsFocused] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const { theme } = useAppTheme();
    const colors = Colors[theme];

    const animatedBorderStyle = useAnimatedStyle(() => {
        const borderColor = interpolateColor(
            isFocused ? 1 : 0,
            [0, 1],
            [error ? colors.error : colors.border, error ? colors.error : colors.primary]
        );

        return {
            borderColor: withTiming(borderColor, { duration: 200 }),
        };
    });

    return (
        <View className="mb-4">
            <Animated.View
                style={animatedBorderStyle}
                className="flex-row items-center bg-surface/50 backdrop-blur-sm rounded-2xl px-4 h-14 border"
            >
                <Ionicons
                    name={icon}
                    size={20}
                    color={isFocused ? colors.primary : colors.textMuted}
                />
                <TextInput
                    className="flex-1 text-text text-base ml-3 font-medium"
                    placeholderTextColor={colors.textMuted}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    onChangeText={onChangeText}
                    value={value}
                    placeholder={placeholder}
                    secureTextEntry={isPassword && !showPassword}
                    {...props}
                />
                {isPassword && (
                    <TouchableOpacity
                        onPress={() => setShowPassword(!showPassword)}
                        className="p-2"
                    >
                        <Ionicons
                            name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                            size={20}
                            color={colors.textMuted}
                        />
                    </TouchableOpacity>
                )}
            </Animated.View>
            {error && (
                <View className="flex-row items-center mt-1 px-1">
                    <Ionicons name="alert-circle" size={14} color={colors.error} />
                    <AccessibleText className="text-error text-xs ml-1 font-medium">{error}</AccessibleText>
                </View>
            )}
        </View>
    );
}
