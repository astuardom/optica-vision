/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./App.tsx",
        "./index.tsx",
        "./components/**/*.{js,ts,jsx,tsx}",
        "./pages/**/*.{js,ts,jsx,tsx}",
    ],

    darkMode: "class",
    theme: {
        extend: {
            colors: {
                primary: "#137fec",
                "primary-hover": "#0f6acc",
                "background-light": "#f6f7f8",
                "background-dark": "#101922",
                "text-main": "#111418",
                "text-sub": "#617589"
            },
            fontFamily: {
                sans: ["Inter", "sans-serif"]
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { transform: 'translateY(20px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                zoomIn: {
                    '0%': { transform: 'scale(0.95)', opacity: '0' },
                    '100%': { transform: 'scale(1)', opacity: '1' },
                }
            },
            animation: {
                'fade-in': 'fadeIn 0.6s ease-out forwards',
                'slide-up': 'slideUp 0.6s ease-out forwards',
                'zoom-in': 'zoomIn 0.5s ease-out forwards',
            }
        }
    },
    plugins: [],
}
