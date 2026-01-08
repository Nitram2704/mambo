# Accessibility Documentation

## Overview
Mambo Fitness is committed to providing an accessible experience for all users. This document outlines the accessibility standards and implementation details for the application.

## Standards
- **WCAG 2.1 Level AA**: We aim to meet or exceed WCAG 2.1 Level AA standards.
- **Screen Readers**: All interactive elements must have clear `accessibilityLabel` and `accessibilityRole`.
- **Contrast**: Text and interactive elements must maintain a minimum contrast ratio of 4.5:1 against their background.
- **Dynamic Type**: The application respects system font size settings via the `AccessibleText` component.

## Implementation Details

### AccessibleText Component
The `AccessibleText` component is a wrapper around React Native's `Text` that:
- Respects system font scaling.
- Provides consistent typography variants (`h1`, `h2`, `h3`, `body`, `caption`, `label`).
- Automatically applies theme-aware colors.

### Theme Awareness
The application uses a dynamic theming system based on `useAppTheme` and `Colors[theme]`. 
- **Tailwind CSS**: Theme-aware colors are also available via Tailwind classes (e.g., `text-text`, `bg-background`).
- **CSS Variables**: CSS variables are used to bridge the gap between Tailwind and React Native styles.

### Icons
Icons from `@expo/vector-icons` (Ionicons) are used throughout the app.
- **Color**: Icons must use theme-aware colors from `Colors[theme]`.
- **Labels**: Interactive icons must have an `accessibilityLabel` if they don't have accompanying text.

## Recent Improvements
- **Visual Regression Fixes**: Replaced hardcoded colors with theme-aware styles in Workout, Nutrition, Sleep, and Profile screens.
- **Accessibility Audit**: Verified screen reader compatibility and contrast ratios across major flows.
- **Zen Mode**: Improved the active workout experience by minimizing distractions while maintaining accessibility.
