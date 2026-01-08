export const Colors = {
    light: {
        primary: '#2563eb', // Blue 600 - Stronger contrast
        secondary: '#7c3aed', // Violet 600
        accent: '#f43f5e', // Rose 500
        background: '#f8fafc', // Slate 50
        surface: '#ffffff', // White
        surfaceHighlight: '#f1f5f9', // Slate 100
        text: '#0f172a', // Slate 900
        textSecondary: '#475569', // Slate 600
        textMuted: '#94a3b8', // Slate 400
        success: '#16a34a', // Green 600
        warning: '#ca8a04', // Yellow 600
        error: '#dc2626', // Red 600
        info: '#0ea5e9', // Sky 500
        border: '#e2e8f0', // Slate 200
        tabIconSelected: '#2563eb',
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
        primary: '#60a5fa', // Lighter blue for better contrast on dark bg
        secondary: '#a78bfa', // Lighter purple
        accent: '#f43f5e',
        background: '#0f172a',
        surface: '#1e293b',
        surfaceHighlight: '#334155',
        text: '#f8fafc',
        textSecondary: '#cbd5e1', // Improved contrast (was #94a3b8)
        textMuted: '#94a3b8', // Improved contrast (was #64748b)
        success: '#22c55e',
        warning: '#eab308',
        error: '#ef4444',
        info: '#38bdf8', // Sky 400 (lighter for dark mode)
        border: '#334155',
        tabIconSelected: '#60a5fa',
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
        primary: ['#3b82f6', '#8b5cf6'] as const,
        success: ['#22c55e', '#10b981'] as const,
        fire: ['#f59e0b', '#ef4444'] as const,
        dark: ['#1e293b', '#0f172a'] as const,
        glass: ['rgba(30, 41, 59, 0.7)', 'rgba(15, 23, 42, 0.7)'] as const,
        orange: ['#f97316', '#ea580c'] as const,
        blue: ['#3b82f6', '#60a5fa'] as const,
    },
    glass: {
        background: 'rgba(30, 41, 59, 0.6)',
        border: 'rgba(255, 255, 255, 0.1)',
    },
};
