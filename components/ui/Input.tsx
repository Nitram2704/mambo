import React, { useState } from 'react';
import { TextInput, View, Text, TextInputProps, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface InputProps extends TextInputProps {
    label?: string;
    error?: string;
    containerClassName?: string;
    icon?: keyof typeof Ionicons.glyphMap;
    onIconPress?: () => void;
}

export const Input: React.FC<InputProps> = ({
    label,
    error,
    containerClassName,
    className,
    icon,
    onIconPress,
    secureTextEntry,
    ...props
}) => {
    const [isFocused, setIsFocused] = useState(false);
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    const showPasswordToggle = secureTextEntry;
    const actualSecureTextEntry = secureTextEntry && !isPasswordVisible;

    return (
        <View className={`mb-4 ${containerClassName || ''}`}>
            {label && (
                <Text className={`text-sm font-bold ml-1 mb-2 ${error ? 'text-error' : 'text-text'}`}>
                    {label}
                </Text>
            )}
            <View
                className={`
                    flex-row items-center bg-surface-highlight/30 rounded-xl border
                    ${error ? 'border-error' : isFocused ? 'border-primary' : 'border-transparent'}
                `}
            >
                {icon && (
                    <View className="pl-4">
                        <Ionicons name={icon} size={20} color={isFocused ? '#3b82f6' : '#64748b'} />
                    </View>
                )}
                <TextInput
                    placeholderTextColor="#64748b"
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    secureTextEntry={actualSecureTextEntry}
                    className={`
                        flex-1 text-text p-4 text-base
                        ${className || ''}
                    `}
                    {...props}
                />
                {showPasswordToggle && (
                    <TouchableOpacity
                        onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                        className="pr-4"
                    >
                        <Ionicons
                            name={isPasswordVisible ? 'eye-off' : 'eye'}
                            size={20}
                            color="#64748b"
                        />
                    </TouchableOpacity>
                )}
                {onIconPress && !showPasswordToggle && (
                    <TouchableOpacity onPress={onIconPress} className="pr-4">
                        <Ionicons name={icon as any} size={20} color="#64748b" />
                    </TouchableOpacity>
                )}
            </View>
            {error && (
                <Text className="text-error text-xs ml-1 mt-1 font-medium">
                    {error}
                </Text>
            )}
        </View>
    );
};
