import React from 'react';
import { View, ViewProps } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { cssInterop } from 'react-native-css-interop';
import { useAppTheme } from '@/hooks/use-app-theme';
import { Colors } from '@/constants/Colors';

interface CardProps extends ViewProps {
    variant?: 'solid' | 'glass' | 'outline';
    padding?: 'none' | 'sm' | 'md' | 'lg';
    className?: string;
    children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
    variant = 'solid',
    padding = 'md',
    className,
    children,
    ...props
}) => {
    const { theme } = useAppTheme();
    const getPaddingStyles = () => {
        switch (padding) {
            case 'none': return '';
            case 'sm': return 'p-3';
            case 'lg': return 'p-8';
            default: return 'p-5';
        }
    };

    if (variant === 'glass') {
        const glassColors = theme === 'dark'
            ? Colors.gradients.glass
            : ['rgba(255, 255, 255, 0.8)', 'rgba(241, 245, 249, 0.8)'] as const;

        const borderColor = theme === 'dark' ? 'border-white/10' : 'border-slate-200';

        return (
            <View
                className={`rounded-3xl overflow-hidden border ${borderColor} ${className || ''}`}
                {...props}
            >
                <LinearGradient
                    colors={glassColors}
                    className={getPaddingStyles()}
                >
                    {children}
                </LinearGradient>
            </View>
        );
    }

    const getVariantStyles = () => {
        switch (variant) {
            case 'outline':
                return {
                    backgroundColor: 'transparent',
                    borderColor: Colors[theme].surfaceHighlight,
                    borderWidth: 1
                };
            default:
                return {
                    backgroundColor: Colors[theme].surface,
                    borderColor: 'transparent',
                    borderWidth: 1
                };
        }
    };

    const variantStyles = getVariantStyles();

    return (
        <View
            className={`
                rounded-3xl
                ${getPaddingStyles()}
                ${className || ''}
            `}
            style={[variantStyles, props.style]}
            {...props}
        >
            {children}
        </View>
    );
};

cssInterop(Card, {
    className: {
        target: 'style',
    },
});
