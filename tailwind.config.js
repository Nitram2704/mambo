/** @type {import('tailwindcss').Config} */
module.exports = {
    // NOTE: Update this to include the paths to all of your component files.
    content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
    presets: [require("nativewind/preset")],
    theme: {
        extend: {
            colors: {
                primary: '#3b82f6',
                secondary: '#8b5cf6',
                accent: '#f43f5e',
                background: '#0f172a',
                surface: '#1e293b',
                'surface-highlight': '#334155',
                text: '#f8fafc',
                'text-secondary': '#94a3b8',
                'text-muted': '#64748b',
                success: '#22c55e',
                warning: '#eab308',
                error: '#ef4444',
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
        },
    },
    plugins: [],
}
