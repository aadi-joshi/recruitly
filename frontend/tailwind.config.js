/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eef2ff',
          100: '#d8e0ff',
          200: '#b6c6ff',
          300: '#93a8ff',
          400: '#6b80fe',
          500: '#4f5cf9',
          600: '#3b3aed',
          700: '#312dd2',
          800: '#2c28aa',
          900: '#282985',
        },
      },
    },
  },
  plugins: [],
}
