import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, TextInputProps } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useAnimatedStyle, withTiming, interpolateColor } from 'react-native-reanimated';
import { AccessibleText } from '../ui/AccessibleText';

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

    const animatedBorderStyle = useAnimatedStyle(() => {
        const borderColor = interpolateColor(
            isFocused ? 1 : 0,
            [0, 1],
            [error ? '#ef4444' : '#374151', error ? '#ef4444' : '#60a5fa']
        );

        return {
            borderColor: withTiming(borderColor, { duration: 200 }),
        };
    });

    return (
        <View className="mb-4">
            <Animated.View
                style={animatedBorderStyle}
                className="flex-row items-center bg-gray-800 rounded-xl px-4 h-14 border-2"
            >
                <Ionicons
                    name={icon}
                    size={20}
                    color={isFocused ? '#60a5fa' : '#6B7280'}
                />
                <TextInput
                    className="flex-1 text-white text-base ml-3"
                    placeholderTextColor="#9CA3AF"
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
                            color="#9CA3AF"
                        />
                    </TouchableOpacity>
                )}
            </Animated.View>
            {error && (
                <View className="flex-row items-center mt-1 px-1">
                    <Ionicons name="alert-circle" size={14} color="#ef4444" />
                    <AccessibleText className="text-red-500 text-xs ml-1">{error}</AccessibleText>
                </View>
            )}
        </View>
    );
}
