import type { Config } from 'tailwindcss';

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        green: {
          50:  '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#052e16',
        },
        sage: {
          50:  '#f0f7f2',
          100: '#e4f0e8',
          200: '#c8e1d1',
          300: '#9dc8ad',
          400: '#6aa882',
          500: '#4a8a61',
          600: '#3a6e4d',
          700: '#2d5a3d',
          800: '#1e3d29',
          900: '#0f2419',
        },
        amber: {
          50:  '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
        },
        cream: {
          50: '#fefce8',
          100: '#fef9ee',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '24px',
        '4xl': '32px',
      },
      backdropBlur: {
        xs: '4px',
      },
    },
  },
  plugins: [],
} satisfies Config;
