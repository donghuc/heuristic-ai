/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./src/ui/**/*.{js,ts,jsx,tsx}",
        "./src/ui/index.html"
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
            colors: {
                figma: {
                    // Static dark values — ensures the designed dark theme always renders correctly
                    // regardless of whether Figma's host is in light or dark mode.
                    bg: '#2C2C2C',
                    bgSecondary: '#1E1E1E',
                    bgTertiary: '#383838',
                    hover: '#383838',
                    border: '#444444',
                    text: '#FFFFFF',
                    textMuted: '#B3B3B3',
                    textDisabled: '#666666',
                    blue: '#18A0FB',
                    blueHover: '#007BE5',
                    critical: '#F24822',
                    warning: '#FFCD29',
                    success: '#1BC47D',
                },
                // Semantic severity colors — used by Badge and IssueItem
                severity: {
                    critical: '#EF4444',   // red-500
                    high: '#F97316',   // orange-500
                    medium: '#EAB308',   // yellow-500
                    low: '#71717A',   // zinc-500
                },
            },
            borderRadius: {
                DEFAULT: '6px',
            },
            fontSize: {
                label: ['11px', { lineHeight: '1.4' }],
                body: ['13px', { lineHeight: '1.5' }],
                heading: ['15px', { lineHeight: '1.3' }],
            },
        },
    },
    plugins: [],
}
