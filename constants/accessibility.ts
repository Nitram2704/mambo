/**
 * Accessibility constants following WCAG 2.1 guidelines
 */
export const ACCESSIBILITY_CONSTANTS = {
    /**
     * Minimum touch target size (iOS: 44pt, Android: 48dp)
     * Using 44 as minimum for both platforms
     */
    MIN_TOUCH_TARGET: 44,

    /**
     * WCAG 2.1 contrast ratios
     */
    CONTRAST_RATIO_AA_NORMAL: 4.5,  // Normal text (< 18pt)
    CONTRAST_RATIO_AA_LARGE: 3,     // Large text (>= 18pt)
    CONTRAST_RATIO_AAA_NORMAL: 7,   // Enhanced contrast

    /**
     * Font size multipliers for user preferences
     */
    FONT_SIZES: {
        small: 14,
        medium: 16,
        large: 18,
        xlarge: 20,
    },

    /**
     * Common accessibility hints in Spanish
     */
    HINTS: {
        doubleTapToActivate: 'Toca dos veces para activar',
        swipeToNavigate: 'Desliza para navegar',
        longPressForOptions: 'Mantén presionado para ver opciones',
        swipeUpOrDown: 'Desliza arriba o abajo para ajustar',
    },
};
