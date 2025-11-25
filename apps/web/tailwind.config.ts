import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        nb: {
          background: '#FEEED5',
          ink: '#111111',
          paper: '#F8F7F2',
          lemon: '#FFE76A',
          mint: '#8AC186',
          sky: '#9AD9FF',
          coral: '#FFACC8',
          lilac: '#7868D8',
          tangerine: '#FFBE7B',
          // Dark theme colors
          'dark-bg': '#393947',
          'dark-section': '#393947',
          'dark-text': '#e5e5e5',
          'dark-text-dim': '#a0a0a0',
          'dark-text-strong': '#f5f5f5',
          'dark-border': '#4a4a4a',
          'dark-shadow': '#00000',
          gold: '#D4AF37',
          'gold-hover': '#e5c350',
        },
      },
      boxShadow: {
        neo: '6px 6px 0 0 #111',
        'neo-sm': '4px 4px 0 0 #111',
        'neo-dark': '6px 6px 0 0 #1F2227',
        'neo-sm-dark': '4px 4px 0 0 #1F2227',
      },
      borderWidth: {
        3: '3px',
      },
      fontFamily: {
        display: ['Space Grotesk', 'Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
