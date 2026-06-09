import type { Config } from 'tailwindcss';

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Forest palette (primary)
        forest: {
          950: '#030d07',
          900: '#061610',
          800: '#0d2818',
          700: '#153d24',
          600: '#1e5530',
          500: '#276b3c',
          400: '#388f51',
          300: '#52b36a',
          200: '#7dd494',
          100: '#b8edca',
          50:  '#e8f8ed',
        },
        // Amber accent (warmth, positive actions)
        amber: {
          500: '#d97706',
          400: '#f59e0b',
          300: '#fcd34d',
          200: '#fde68a',
        },
        // Cream (primary text on dark)
        cream: {
          100: '#f5f0e8',
          200: '#ede6d6',
          300: '#d4c9b3',
          400: '#b5a890',
        },
        red: {
          500: '#ef4444',
          400: '#f87171',
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
