export const Colors = {
    light: {
        primary: '#65a30d', // Lime 600
        secondary: '#4f46e5', // Indigo 600
        accent: '#e11d48', // Rose 600
        background: '#ffffff', // White
        surface: '#f4f4f5', // Zinc 100
        surfaceHighlight: '#e4e4e7', // Zinc 200
        text: '#18181b', // Zinc 900
        textSecondary: '#52525b', // Zinc 600
        textMuted: '#a1a1aa', // Zinc 400
        success: '#16a34a', // Green 600
        warning: '#ca8a04', // Yellow 600
        error: '#dc2626', // Red 600
        info: '#0ea5e9', // Sky 500
        border: '#e4e4e7', // Zinc 200
        tabIconSelected: '#65a30d',
        orange: {
            400: '#fb923c',
            500: '#f97316',
            600: '#ea580c',
        },
        yellow: {
            400: '#facc15',
            500: '#eab308',
            600: '#ca8a04',
        },
        green: {
            400: '#4ade80',
            500: '#22c55e',
            600: '#16a34a',
        },
        blue: {
            400: '#60a5fa',
            500: '#3b82f6',
            600: '#2563eb',
        },
        purple: {
            500: '#8b5cf6',
        },
        pink: {
            500: '#ec4899',
        },
    },
    dark: {
        primary: '#d4ff00', // Electric Lime
        secondary: '#6366f1', // Indigo 500
        accent: '#ff0055', // Rose 500
        background: '#09090b', // Zinc 950
        surface: '#18181b', // Zinc 900
        surfaceHighlight: '#27272a', // Zinc 800
        text: '#fafafa', // Zinc 50
        textSecondary: '#a1a1aa', // Zinc 400
        textMuted: '#52525b', // Zinc 600
        success: '#22c55e', // Green 500
        warning: '#eab308', // Yellow 500
        error: '#ef4444', // Red 500
        info: '#38bdf8', // Sky 400
        border: '#3f3f46', // Zinc 700
        tabIconSelected: '#d4ff00',
        orange: {
            400: '#fb923c',
            500: '#f97316',
            600: '#ea580c',
        },
        yellow: {
            400: '#facc15',
            500: '#eab308',
            600: '#ca8a04',
        },
        green: {
            400: '#4ade80',
            500: '#22c55e',
            600: '#16a34a',
        },
        blue: {
            400: '#60a5fa',
            500: '#3b82f6',
            600: '#2563eb',
        },
        purple: {
            500: '#a78bfa',
        },
        pink: {
            500: '#f472b6',
        },
    },
    // Common/Shared
    gradients: {
        primary: ['#d4ff00', '#a3e635'] as const, // Lime to Lime-400
        success: ['#22c55e', '#10b981'] as const,
        fire: ['#f59e0b', '#ef4444'] as const,
        dark: ['#18181b', '#09090b'] as const, // Zinc 900 to Zinc 950
        glass: ['rgba(24, 24, 27, 0.8)', 'rgba(9, 9, 11, 0.8)'] as const,
        orange: ['#f97316', '#ea580c'] as const,
        blue: ['#3b82f6', '#60a5fa'] as const,
    },
    glass: {
        background: 'rgba(24, 24, 27, 0.6)',
        border: 'rgba(255, 255, 255, 0.1)',
    },
};
