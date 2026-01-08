import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { cssInterop } from 'react-native-css-interop';
import { useAppTheme } from '@/hooks/use-app-theme';

// Allow Tailwind classes on Ionicons
cssInterop(Ionicons, {
    className: {
        target: 'style',
        nativeStyleToProp: {
            color: true,
            fontSize: 'size',
        },
    },
});

export type IconName = keyof typeof Ionicons.glyphMap;

interface IconProps {
    name: IconName;
    size?: number;
    color?: string;
    variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'text' | 'textSecondary' | 'textMuted';
    className?: string;
}

export const Icon = ({
    name,
    size = 24,
    color,
    variant,
    className,
}: IconProps) => {
    const { theme } = useAppTheme();
    let iconColor = color;

    if (variant && !color) {
        iconColor = Colors[theme][variant as keyof typeof Colors.light] as string;
    }

    return (
        <Ionicons
            name={name}
            size={size}
            color={iconColor || Colors[theme].text}
            className={className}
        />
    );
};
