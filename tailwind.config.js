/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                'sans': ['PT Sans', 'system-ui', 'Avenir', 'Helvetica', 'Arial', 'sans-serif'],
                'changa': ['Changa One', 'cursive'],
                'pt-sans': ['PT Sans', 'sans-serif'],
                'slabo': ['Slabo 27px', 'serif'],
                'tinos': ['Tinos', 'serif'],
            },
        },
    },
    plugins: [],
} 