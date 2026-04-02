import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Professional Student Management System Color Palette
        edu: {
          // Core backgrounds - Clean, professional
          background: '#F8FAFC', // Cool gray-white
          surface: '#FFFFFF', // Pure white cards
          muted: '#F1F5F9', // Subtle gray for sections
          
          // Primary - Deep scholarly blue
          primary: '#1E3A5F', // Navy blue - trust & authority
          'primary-light': '#2D5A8C', // Lighter navy
          'primary-hover': '#15294A', // Darker navy
          
          // Accent - Institutional teal
          accent: '#0D9488', // Teal - growth & education
          'accent-light': '#14B8A6',
          'accent-hover': '#0F766E',
          
          // Secondary - Warm professional
          secondary: '#6366F1', // Indigo - knowledge
          'secondary-light': '#818CF8',
          
          // Text colors
          ink: '#0F172A', // Deep slate for main text
          'ink-light': '#475569', // Secondary text
          'ink-muted': '#94A3B8', // Placeholder, hints
          
          // Semantic colors - Professional variants
          success: '#059669', // Emerald
          'success-light': '#D1FAE5',
          warning: '#D97706', // Amber
          'warning-light': '#FEF3C7',
          error: '#DC2626', // Red
          'error-light': '#FEE2E2',
          info: '#0284C7', // Sky blue
          'info-light': '#E0F2FE',
          
          // Borders
          border: '#E2E8F0',
          'border-dark': '#CBD5E1',
          
          // Dark theme - Sophisticated dark mode
          'dark-bg': '#0C1222', // Deep blue-black
          'dark-surface': '#1A2332', // Elevated surface
          'dark-muted': '#243042', // Muted sections
          'dark-text': '#F1F5F9', // Light text
          'dark-text-dim': '#94A3B8', // Dimmed text
          'dark-border': '#334155', // Border
          'dark-primary': '#60A5FA', // Light blue accent
          'dark-accent': '#2DD4BF', // Teal accent
        },
      },
      boxShadow: {
        // Professional, subtle shadows
        'card': '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        'card-hover': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        'elevated': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
        'inner-soft': 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
        // Focus shadows
        'focus-ring': '0 0 0 3px rgba(30, 58, 95, 0.2)',
        'focus-ring-accent': '0 0 0 3px rgba(13, 148, 136, 0.2)',
      },
      borderWidth: {
        '0.5': '0.5px',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.25rem',
      },
      fontFamily: {
        // Clean, professional typography
        display: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1.5' }],
        'sm': ['0.875rem', { lineHeight: '1.5' }],
        'base': ['1rem', { lineHeight: '1.6' }],
        'lg': ['1.125rem', { lineHeight: '1.5' }],
        'xl': ['1.25rem', { lineHeight: '1.4' }],
        '2xl': ['1.5rem', { lineHeight: '1.35' }],
        '3xl': ['1.875rem', { lineHeight: '1.25' }],
        '4xl': ['2.25rem', { lineHeight: '1.2' }],
        '5xl': ['3rem', { lineHeight: '1.1' }],
      },
      spacing: {
        'touch': '44px',
        '18': '4.5rem',
        '88': '22rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.25s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'pulse-subtle': 'pulseSubtle 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(-8px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #1E3A5F 0%, #2D5A8C 100%)',
        'gradient-accent': 'linear-gradient(135deg, #0D9488 0%, #14B8A6 100%)',
        'gradient-subtle': 'linear-gradient(180deg, #F8FAFC 0%, #F1F5F9 100%)',
        'gradient-dark': 'linear-gradient(180deg, #1A2332 0%, #0C1222 100%)',
      },
    },
  },
  plugins: [],
};

export default config;
