import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';
import { useAccessibilityStore } from '@/store/accessibilityStore';
import { cssInterop } from 'react-native-css-interop';
import { useAppTheme } from '@/hooks/use-app-theme';
import { Colors } from '@/constants/Colors';

interface AccessibleTextProps extends TextProps {
    variant?: 'h1' | 'h2' | 'h3' | 'body' | 'caption' | 'label';
    weight?: 'normal' | 'medium' | 'semibold' | 'bold';
    color?: string;
}

/**
 * A Text component that respects the user's font size preferences
 * and provides consistent typography variants.
 */
export const AccessibleText: React.FC<AccessibleTextProps> = ({
    variant = 'body',
    weight = 'normal',
    color,
    style,
    children,
    ...props
}) => {
    const { fontSize: userFontSize } = useAccessibilityStore();
    const { theme } = useAppTheme();

    // Multipliers based on user preference
    const multiplier = {
        small: 0.875,
        medium: 1,
        large: 1.125,
        xlarge: 1.25,
    }[userFontSize];

    // Base sizes for each variant
    const baseSizes = {
        h1: 28,
        h2: 22,
        h3: 18,
        body: 16,
        label: 14,
        caption: 12,
    };

    // Map weights to font weights
    const fontWeights: Record<string, any> = {
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
    };

    const dynamicStyles = {
        fontSize: baseSizes[variant] * multiplier,
        fontWeight: fontWeights[weight],
        color: color || Colors[theme].text,
    };

    return (
        <Text
            style={[dynamicStyles, style]}
            allowFontScaling={true}
            accessibilityRole={variant.startsWith('h') ? 'header' : 'text'}
            {...props}
        >
            {children}
        </Text>
    );
};

// Enable Tailwind support for AccessibleText
cssInterop(AccessibleText, {
    className: {
        target: 'style',
    },
});
