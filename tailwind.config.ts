import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        che: {
          bg: '#EDF3EA',
          'bg-2': '#E1EBDC',
          paper: '#FBFCF9',
          ink: '#22301F',
          'ink-soft': '#5C6B57',
          coral: '#FF8B66',
          'coral-dark': '#E36A45',
          'coral-soft': '#FFE1D3',
          lav: '#B8A4E3',
          'lav-soft': '#EBE4F7',
          mustard: '#F2C14E',
          'mustard-soft': '#FBEDC9',
          line: '#C9D9C2',
          'line-2': '#D8E2D3',
        },
      },
      fontFamily: {
        display: ['Fraunces', 'serif'],
        sans: ['Space Grotesk', 'sans-serif'],
        hand: ['Caveat', 'cursive'],
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.3' },
        },
        cardIn: {
          from: { opacity: '0', transform: 'translateY(6px) scale(.96)' },
          to: { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
      },
      animation: {
        fadeIn: 'fadeIn .3s ease',
        blink: 'blink 1.6s infinite',
        cardIn: 'cardIn .35s ease forwards',
      },
      boxShadow: {
        'che-sm': '3px 3px 0 var(--tw-shadow-color)',
        'che-md': '4px 4px 0 var(--tw-shadow-color)',
        'che-lg': '6px 6px 0 var(--tw-shadow-color)',
        'che-xl': '7px 7px 0 var(--tw-shadow-color)',
        'che-2xl': '8px 8px 0 var(--tw-shadow-color)',
      },
    },
  },
  plugins: [],
} satisfies Config;