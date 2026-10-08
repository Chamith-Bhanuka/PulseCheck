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
        claude: {
          bg: '#FAF8F5',
          surface: '#FFFFFF',
          subtle: '#F3EFE6',
          border: '#E5E0D5',
          text: '#1F1E1B',
          muted: '#68655E',
          terracotta: '#C25E3E',
          accent: '#C25E3E',
          'dark-bg': '#151413',
          'dark-surface': '#1E1D1A',
          'dark-subtle': '#262521',
          'dark-border': '#33312B',
          'dark-text': '#F0ECE1',
          'dark-muted': '#9B978D',
          'dark-accent': '#D87754',
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
