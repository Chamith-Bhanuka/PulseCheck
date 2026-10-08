/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        pulse: {
          bg: '#FBFBF9',
          surface: '#FFFFFF',
          subtle: '#F4F3EE',
          border: '#E6E3DA',
          text: '#1A1917',
          muted: '#6E6A63',
          brand: '#1E5E4B',
          accent: '#B85D36',
          'dark-bg': '#141413',
          'dark-surface': '#1C1C1B',
          'dark-subtle': '#242422',
          'dark-border': '#2E2D29',
          'dark-text': '#F2EFE9',
          'dark-muted': '#96938C',
          'dark-brand': '#2E8B6E',
          'dark-accent': '#C96E47',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        serif: ['Lora', 'Georgia', 'serif'],
        display: ['Lora', 'serif'],
      },
      boxShadow: {
        'soft': '0 2px 8px -2px rgba(28, 25, 23, 0.05), 0 4px 16px -4px rgba(28, 25, 23, 0.08)',
        'window': '0 10px 30px -5px rgba(28, 25, 23, 0.12), 0 0 1px rgba(28, 25, 23, 0.2)',
      },
      backgroundImage: {
        'grid-pattern': "radial-gradient(#D5CEBE 1px, transparent 1px)",
        'dark-grid-pattern': "radial-gradient(#3A3730 1px, transparent 1px)",
      }
    },
  },
  plugins: [],
}
