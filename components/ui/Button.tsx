import React from 'react';
import { Text, TouchableOpacity, ActivityIndicator, TouchableOpacityProps, View, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

interface ButtonProps extends TouchableOpacityProps {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    label: string;
    loading?: boolean;
    icon?: React.ReactNode;
    iconPosition?: 'left' | 'right';
    className?: string;
    textClassName?: string;
}

export const Button: React.FC<ButtonProps> = ({
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
    ...props
}) => {
    const handlePress = (e: any) => {
        if (Platform.OS !== 'web') {
            Haptics.selectionAsync();
        }
        onPress?.(e);
    };

    const getVariantStyles = () => {
        switch (variant) {
            case 'primary':
                return 'bg-primary border-transparent';
            case 'secondary':
                return 'bg-surface-highlight border-transparent';
            case 'outline':
                return 'bg-transparent border-2 border-primary';
            case 'ghost':
                return 'bg-transparent border-transparent';
            case 'danger':
                return 'bg-error border-transparent';
            default:
                return 'bg-primary border-transparent';
        }
    };

    const getTextVariantStyles = () => {
        switch (variant) {
            case 'outline':
            case 'ghost':
                return 'text-primary';
            default:
                return 'text-white';
        }
    };

    const getSizeStyles = () => {
        switch (size) {
            case 'sm':
                return 'h-10 px-4';
            case 'lg':
                return 'h-14 px-8';
            default:
                return 'h-12 px-6';
        }
    };

    const getTextSizeStyles = () => {
        switch (size) {
            case 'sm':
                return 'text-sm';
            case 'lg':
                return 'text-lg';
            default:
                return 'text-base';
        }
    };

    return (
        <TouchableOpacity
            onPress={handlePress}
            disabled={disabled || loading}
            activeOpacity={0.7}
            className={`
                flex-row items-center justify-center rounded-xl
                ${getVariantStyles()}
                ${getSizeStyles()}
                ${disabled ? 'opacity-50' : ''}
                ${className || ''}
            `}
            {...props}
        >
            {loading ? (
                <ActivityIndicator color={variant === 'outline' || variant === 'ghost' ? '#3b82f6' : '#ffffff'} />
            ) : (
                <>
                    {icon && iconPosition === 'left' && (
                        <View className="mr-2">{icon}</View>
                    )}
                    <Text
                        className={`
                            font-bold text-center
                            ${getTextVariantStyles()}
                            ${getTextSizeStyles()}
                            ${textClassName || ''}
                        `}
                    >
                        {label}
                    </Text>
                    {icon && iconPosition === 'right' && (
                        <View className="ml-2">{icon}</View>
                    )}
                </>
            )}
        </TouchableOpacity>
    );
};
