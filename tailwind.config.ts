import type { Config } from 'tailwindcss';
import typography from '@tailwindcss/typography';

const config: Config = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
    './viz/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: 'rgb(var(--book-surface) / <alpha-value>)',
          card: 'rgb(var(--book-card) / <alpha-value>)',
          cardHover: 'rgb(var(--book-card-hover) / <alpha-value>)',
          border: 'rgb(var(--book-border) / <alpha-value>)',
          primary: '#0EA5E9',
          secondary: '#F97316',
          text: 'rgb(var(--book-body) / <alpha-value>)',
          muted: 'rgb(var(--book-muted) / <alpha-value>)',
          subtle: 'rgb(var(--book-code-bg) / <alpha-value>)',
        },
        // Article design tokens — theme-aware via CSS vars in globals.css
        // (:root + .dark), same pattern as the hub tokens below, so
        // "bg-surface", "text-body", etc. flip with the theme and still
        // support opacity modifiers (e.g. bg-card/60). brand-primary and
        // brand-secondary stay constant hex — they're filled-button/accent
        // colors, not surface/text colors, so they don't need to invert.
        surface: 'rgb(var(--book-surface) / <alpha-value>)',
        card: 'rgb(var(--book-card) / <alpha-value>)',
        'code-bg': 'rgb(var(--book-code-bg) / <alpha-value>)',
        body: 'rgb(var(--book-body) / <alpha-value>)',
        subtle: 'rgb(var(--book-subtle) / <alpha-value>)',
        muted: 'rgb(var(--book-muted) / <alpha-value>)',
        link: 'rgb(var(--book-link) / <alpha-value>)',
        'link-hover': 'rgb(var(--book-link-hover) / <alpha-value>)',
        // Diagram semantics (docs/DIAGRAMS.md): one focal accent plus the
        // two surviving semantic hues. Kept theme-aware like the rest.
        accent: 'rgb(var(--book-accent) / <alpha-value>)',
        'accent-ink': 'rgb(var(--book-accent-ink) / <alpha-value>)',
        pos: 'rgb(var(--book-pos) / <alpha-value>)',
        neg: 'rgb(var(--book-neg) / <alpha-value>)',
        border: {
          DEFAULT: 'rgb(var(--book-border) / <alpha-value>)',
          strong: 'rgb(var(--book-border-strong) / <alpha-value>)',
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
