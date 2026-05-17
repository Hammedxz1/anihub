/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#fdf4ff',
          100: '#fae8ff',
          200: '#f5d0fe',
          300: '#f0abfc',
          400: '#e879f9',
          500: '#d946ef',
          600: '#c026d3',
          700: '#a21caf',
          800: '#86198f',
          900: '#701a75',
          950: '#4a044e',
        },
        accent: {
          cyan:   '#22d3ee',
          pink:   '#ec4899',
          violet: '#8b5cf6',
          amber:  '#f59e0b',
        },
        surface: {
          DEFAULT: '#07070d',
          card:    '#11111a',
          hover:   '#1a1a26',
          border:  '#23232f',
          muted:   '#9ca3af',
        },
      },
      fontFamily: {
        sans:    ['"Noto Sans JP"', 'Inter', 'system-ui', 'sans-serif'],
        display: ['"Bebas Neue"', 'Impact', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
      },
      boxShadow: {
        'glow-primary': '0 0 24px rgba(192, 38, 211, 0.45)',
        'glow-cyan':    '0 0 24px rgba(34, 211, 238, 0.45)',
        'glow-pink':    '0 0 24px rgba(236, 72, 153, 0.45)',
      },
      keyframes: {
        'fade-in':  { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        'slide-up': {
          '0%':   { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in':  'fade-in 180ms ease-out',
        'slide-up': 'slide-up 220ms ease-out',
      },
    },
  },
  plugins: [],
}
