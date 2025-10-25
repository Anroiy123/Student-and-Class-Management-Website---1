import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        nb: {
          ink: '#111111',
          paper: '#F8F7F2',
          lemon: '#FFE76A',
          mint: '#B8FFCE',
          sky: '#9AD9FF',
          coral: '#FF9AA2',
          lilac: '#C7B9FF',
          tangerine: '#FFBE7B',
        },
      },
      boxShadow: {
        neo: '6px 6px 0 0 #111',
        'neo-sm': '4px 4px 0 0 #111',
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
