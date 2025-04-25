/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'navy-blue': '#0f2a4a',
        'gold': '#d4af37',
      },
      backgroundColor: {
        dark: '#0f2a4a',
      },
      textColor: {
        dark: '#ffffff',
      },
    },
  },
  plugins: [],
};