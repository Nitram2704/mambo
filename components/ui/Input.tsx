import React, { useState } from 'react';
import { TextInput, View, Text, TextInputProps, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { cssInterop } from 'react-native-css-interop';
import { a11y } from '@/utils/accessibility';
import { useAppTheme } from '@/hooks/use-app-theme';
import { Colors } from '@/constants/Colors';

interface InputProps extends TextInputProps {
    label?: string;
    error?: string;
    containerClassName?: string;
    icon?: keyof typeof Ionicons.glyphMap;
    onIconPress?: () => void;
    accessibilityHint?: string;
}

export const Input: React.FC<InputProps> = ({
    label,
    error,
    containerClassName,
    className,
    icon,
    onIconPress,
    secureTextEntry,
    accessibilityHint,
    ...props
}) => {
    const [isFocused, setIsFocused] = useState(false);
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const { theme } = useAppTheme();
    const colors = Colors[theme];

    const showPasswordToggle = secureTextEntry;
    const actualSecureTextEntry = secureTextEntry && !isPasswordVisible;

    return (
        <View
            className={`mb-4 ${containerClassName || ''}`}
            {...a11y.decorative()}
        >
            {label && (
                <Text
                    allowFontScaling={true}
                    className={`text-sm font-bold ml-1 mb-2 ${error ? 'text-error' : 'text-text'}`}
                >
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
                    <View className="pl-4" {...a11y.decorative()}>
                        <Ionicons name={icon} size={20} color={isFocused ? colors.primary : colors.textMuted} />
                    </View>
                )}
                <TextInput
                    placeholderTextColor={colors.textMuted}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    secureTextEntry={actualSecureTextEntry}
                    allowFontScaling={true}
                    className={`
                        flex-1 text-text p-4 text-base
                        ${className || ''}
                    `}
                    {...a11y.input(label || '', accessibilityHint, props.value)}
                    {...props}
                />
                {showPasswordToggle && (
                    <TouchableOpacity
                        onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                        className="pr-4"
                        {...a11y.button(
                            isPasswordVisible ? 'Ocultar contraseña' : 'Mostrar contraseña',
                            'Cambia la visibilidad del texto de la contraseña'
                        )}
                    >
                        <Ionicons
                            name={isPasswordVisible ? 'eye-off' : 'eye'}
                            size={20}
                            color={colors.textMuted}
                        />
                    </TouchableOpacity>
                )}
                {onIconPress && !showPasswordToggle && (
                    <TouchableOpacity
                        onPress={onIconPress}
                        className="pr-4"
                        {...a11y.button('Acción de icono', 'Ejecuta una acción relacionada con este campo')}
                    >
                        <Ionicons name={icon as any} size={20} color={colors.textMuted} />
                    </TouchableOpacity>
                )}
            </View>
            {error && (
                <Text
                    allowFontScaling={true}
                    className="text-error text-xs ml-1 mt-1 font-medium"
                    {...a11y.decorative()}
                >
                    {error}
                </Text>
            )}
        </View>
    );
};

cssInterop(Input, {
    className: {
        target: 'style',
    },
});
