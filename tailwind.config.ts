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
        // Hub editorial surfaces — warm-paper system (Fraunces/Plex) used by
        // the new hub pages (home, gallery, research, teaching cover). Kept in
        // its own namespace so the article reading theme above is untouched.
        // Channels live in globals.css (:root + .dark) so these flip with the
        // theme and still support Tailwind opacity modifiers (e.g. bg-hub-paper/85).
        hub: {
          paper: 'rgb(var(--hub-paper) / <alpha-value>)',
          paper2: 'rgb(var(--hub-paper2) / <alpha-value>)',
          card: 'rgb(var(--hub-card) / <alpha-value>)',
          ink: 'rgb(var(--hub-ink) / <alpha-value>)',
          'ink-soft': 'rgb(var(--hub-ink-soft) / <alpha-value>)',
          'ink-faint': 'rgb(var(--hub-ink-faint) / <alpha-value>)',
          line: 'rgb(var(--hub-line) / <alpha-value>)',
          'line-strong': 'rgb(var(--hub-line-strong) / <alpha-value>)',
          teal: 'rgb(var(--hub-teal) / <alpha-value>)',
          'teal-soft': 'rgb(var(--hub-teal-soft) / <alpha-value>)',
          amber: 'rgb(var(--hub-amber) / <alpha-value>)',
          'amber-soft': 'rgb(var(--hub-amber-soft) / <alpha-value>)',
          plum: 'rgb(var(--hub-plum) / <alpha-value>)',
          'plum-soft': 'rgb(var(--hub-plum-soft) / <alpha-value>)',
          blue: 'rgb(var(--hub-blue) / <alpha-value>)',
          'blue-soft': 'rgb(var(--hub-blue-soft) / <alpha-value>)',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'sans-serif'],
        display: ['var(--font-space-grotesk)', 'sans-serif'],
        mono: ['var(--font-jetbrains-mono)', 'monospace'],
        // Hub editorial type
        serif: ['var(--font-fraunces)', 'Georgia', 'serif'],
        plex: ['var(--font-plex-mono)', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        hub: '0 1px 2px rgba(40,30,20,.04), 0 8px 24px rgba(40,30,20,.06)',
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
