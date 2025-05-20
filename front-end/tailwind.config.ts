import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                blanka: ["Blanka", "sans-serif"],
                sans: ["Inter", "system-ui", "sans-serif"],
            },
            backgroundImage: {
                "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
                "gradient-conic":
                    "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
                "grid-pattern": "linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px)",
            },
            colors: {
                blue: {
                    950: '#070E27',
                },
                primary: {
                    50: '#eaf5ff',
                    100: '#d9ebff',
                    200: '#b5d8ff',
                    300: '#8cbdff',
                    400: '#5c98ff',
                    500: '#3898FF', // Primary color
                    600: '#2564eb',
                    700: '#1d4ed8',
                    800: '#1e40af',
                    900: '#1e3a8a',
                },
                secondary: {
                    50: '#e0f7fa',
                    100: '#b2ebf2',
                    200: '#80deea',
                    300: '#4dd0e1',
                    400: '#26c6da',
                    500: '#0891B2', // Secondary color
                    600: '#00838f',
                    700: '#0e7490',
                    800: '#005662',
                    900: '#01579b',
                },
                accent: {
                    300: '#a5b4fc',
                    400: '#818cf8',
                    500: '#6366f1',
                    600: '#4f46e5', // Accent color
                    700: '#4338ca',
                },
                dark: {
                    400: '#4b5563',
                    500: '#374151',
                    600: '#1f2937',
                    700: '#111827',
                    800: '#0f172a',
                    900: '#0A0E1F', // Darkest blue-black background
                },
            },
            animation: {
                "gradient-x": "gradient-x 10s ease infinite",
                "float": "float 6s ease-in-out infinite",
                "float-slow": "float 12s ease-in-out infinite",
                "pulse-slow": "pulse 6s cubic-bezier(0.4, 0, 0.6, 1) infinite",
                "shimmer": "shimmer 3s infinite",
                "spin-slow": "spin 8s linear infinite",
                "bounce-slow": "bounce 3s infinite",
            },
            keyframes: {
                "gradient-x": {
                    "0%, 100%": {
                        "background-size": "200% 200%",
                        "background-position": "left center",
                    },
                    "50%": {
                        "background-size": "200% 200%",
                        "background-position": "right center",
                    },
                },
                "float": {
                    "0%, 100%": {
                        transform: "translateY(0)",
                    },
                    "50%": {
                        transform: "translateY(-10px)",
                    },
                },
                "shimmer": {
                    "0%": { transform: "translateX(-100%)" },
                    "100%": { transform: "translateX(100%)" },
                },
            },
            borderRadius: {
                'xl': '1rem',
                '2xl': '1.5rem',
                '3xl': '2rem',
            },
            boxShadow: {
                'glow': '0 0 20px rgba(56, 152, 255, 0.3)',
                'glow-lg': '0 0 30px rgba(56, 152, 255, 0.5)',
                'inner-glow': 'inset 0 0 10px rgba(56, 152, 255, 0.2)',
            },
            backdropBlur: {
                xs: '2px',
            },
            spacing: {
                '72': '18rem',
                '84': '21rem',
                '96': '24rem',
                '128': '32rem',
            },
            transitionDuration: {
                '2000': '2000ms',
            },
        },
    },
    plugins: [
        require('@tailwindcss/aspect-ratio'),
    ],
};
export default config; 