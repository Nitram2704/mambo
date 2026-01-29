/** @type {import('tailwindcss').Config} */
module.exports = {
    // NOTE: Update this to include the paths to all of your component files.
    content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
    presets: [require("nativewind/preset")],
    theme: {
        extend: {
            colors: {
                primary: 'var(--color-primary)',
                secondary: 'var(--color-secondary)',
                accent: 'var(--color-accent)',
                background: 'var(--color-background)',
                surface: 'var(--color-surface)',
                'surface-highlight': 'var(--color-surface-highlight)',
                text: 'var(--color-text)',
                'text-secondary': 'var(--color-text-secondary)',
                'text-muted': 'var(--color-text-muted)',
                success: 'var(--color-success)',
                warning: 'var(--color-warning)',
                error: 'var(--color-error)',
                border: 'var(--color-border)',
            },
            spacing: {
                '4': '4px',
                '8': '8px',
                '12': '12px',
                '16': '16px',
                '20': '20px',
                '24': '24px',
                '32': '32px',
                '40': '40px',
                '48': '48px',
                '64': '64px',
                '80': '80px',
                '96': '96px',
                '128': '128px',
            },
            borderRadius: {
                'xl': '12px',
                '2xl': '16px',
                '3xl': '24px',
            },
            keyframes: {
                shine: {
                    '0%': { transform: 'translateX(-100%)' },
                    '100%': { transform: 'translateX(100%)' },
                },
                pulse: {
                    '0%, 100%': { opacity: 1, transform: 'scale(1)' },
                    '50%': { opacity: 0.8, transform: 'scale(1.05)' },
                },
                tilt: {
                    '0%, 100%': { transform: 'rotate(-3deg)' },
                    '50%': { transform: 'rotate(3deg)' },
                },
            },
            animation: {
                shine: 'shine 2s infinite',
                pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                tilt: 'tilt 2s ease-in-out infinite',
            },
            boxShadow: {
                'glow': '0 0 20px rgba(212, 255, 0, 0.3)',
                'glow-sm': '0 0 10px rgba(212, 255, 0, 0.2)',
            },
        },
    },
    plugins: [require("@midudev/tailwind-animations")],
}
