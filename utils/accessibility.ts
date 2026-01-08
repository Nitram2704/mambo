import { AccessibilityRole, AccessibilityState } from 'react-native';

/**
 * Helper utilities for accessibility props
 * Usage: <TouchableOpacity {...a11y.button('Label', 'Hint')} />
 */
export const a11y = {
    /**
     * Props for accessible buttons
     */
    button: (label: string, hint?: string, state?: AccessibilityState) => ({
        accessible: true,
        accessibilityRole: 'button' as AccessibilityRole,
        accessibilityLabel: label,
        accessibilityHint: hint,
        accessibilityState: state,
    }),

    /**
     * Props for headers/titles
     */
    header: (label: string, level: 1 | 2 | 3 = 1) => ({
        accessible: true,
        accessibilityRole: 'header' as AccessibilityRole,
        accessibilityLabel: label,
        // @ts-ignore - accessibilityLevel exists but not in types
        accessibilityLevel: level,
    }),

    /**
     * Props for images
     */
    image: (description: string) => ({
        accessible: true,
        accessibilityRole: 'image' as AccessibilityRole,
        accessibilityLabel: description,
    }),

    /**
     * Props for text inputs
     */
    input: (label: string, hint?: string, value?: string) => ({
        accessible: true,
        accessibilityRole: 'text' as AccessibilityRole,
        accessibilityLabel: label,
        accessibilityHint: hint,
        accessibilityValue: value ? { text: value } : undefined,
    }),

    /**
     * Props for decorative elements (ignored by screen readers)
     */
    decorative: () => ({
        accessible: false,
        accessibilityElementsHidden: true,
        importantForAccessibility: 'no-hide-descendants' as const,
    }),

    /**
     * Props for switches/toggles
     */
    switch: (label: string, isOn: boolean) => ({
        accessible: true,
        accessibilityRole: 'switch' as AccessibilityRole,
        accessibilityLabel: label,
        accessibilityState: { checked: isOn },
    }),

    /**
     * Props for adjustable elements (sliders, pickers)
     */
    adjustable: (label: string, value: number, min: number, max: number) => ({
        accessible: true,
        accessibilityRole: 'adjustable' as AccessibilityRole,
        accessibilityLabel: label,
        accessibilityValue: {
            min,
            max,
            now: value,
        },
    }),
};
