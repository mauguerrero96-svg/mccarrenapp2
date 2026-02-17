import type { Config } from 'tailwindcss'

const config: Config = {
    content: [
        './app/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
        './utils/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                'tennis-green': {
                    50: '#f0fdf4',
                    100: '#dcfce7',
                    500: '#22c55e',
                    600: '#16a34a',
                    700: '#15803d',
                    800: '#166534',
                    900: '#14532d',
                },
                'tennis-navy': {
                    50: '#f0f9ff',
                    700: '#0369a1',
                    800: '#075985',
                    900: '#0c4a6e',
                },
                'court-clay': '#c2410c',
                'tennis-accent': '#84cc16', // Limon styling
                'tennis-accent-dark': '#65a30d',
            },
        },
    },
    plugins: [],
}
export default config
