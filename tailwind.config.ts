import type { Config } from 'tailwindcss';
import typography from '@tailwindcss/typography';

const config: Config = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './viz/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: '#FFFFFF',
          card: '#F8F9FA',
          cardHover: '#E9ECEF',
          border: '#DEE2E6',
          primary: '#0EA5E9',
          secondary: '#F97316',
          text: '#1A1A1A',
          muted: '#6C757D',
          subtle: '#F1F3F5',
        },
        // Article design tokens — alias to brand palette so the
        // Distill-style components ("bg-surface", "text-body", etc.)
        // inherit the brand without per-component rewrites.
        surface: '#FFFFFF',
        card: '#F8F9FA',
        'code-bg': '#F1F3F5',
        body: '#1A1A1A',
        subtle: '#374151',
        muted: '#6C757D',
        link: '#0EA5E9',
        'link-hover': '#0284C7',
        border: {
          DEFAULT: '#DEE2E6',
          strong: '#9CA3AF',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'sans-serif'],
        display: ['var(--font-space-grotesk)', 'sans-serif'],
        mono: ['var(--font-jetbrains-mono)', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      transitionTimingFunction: {
        spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      },
    },
  },
  plugins: [typography],
};

export default config;
