import * as Plot from '@observablehq/plot';

type PlotOptions = NonNullable<Parameters<typeof Plot.plot>[0]>;

/**
 * Shared visual language for the book's Observable Plot charts, matching the
 * white reading theme (Inter body, JetBrains mono, sky/orange accents). Import
 * `withBookTheme` to wrap any Plot spec, and the color tokens for marks.
 */
export const CHART = {
  ink: '#1A1A1A',
  body: '#374151',
  muted: '#6C757D',
  faint: '#9CA3AF',
  grid: '#E9ECEF',
  border: '#DEE2E6',
  /** Fill for a choropleth region with no data (Plot's `color.unknown`). */
  unknown: '#F1F3F5',
  // Accents (match the per-part section palette + book brand)
  sky: '#0EA5E9',
  skyDark: '#0284C7',
  orange: '#F97316',
  emerald: '#059669',
  violet: '#7C3AED',
  indigo: '#4F46E5',
  rose: '#E11D48',
  amber: '#D97706',
  teal: '#0D9488',
  slate: '#475569',
} as const;

/** Default categorical sequence for multi-series marks. */
export const CATEGORICAL = [
  CHART.sky,
  CHART.orange,
  CHART.emerald,
  CHART.violet,
  CHART.amber,
  CHART.rose,
  CHART.teal,
  CHART.slate,
];

const FONT_SANS = 'var(--font-inter), Inter, system-ui, sans-serif';

/**
 * Merge a Plot spec with the book's default style. Pass a normal Plot options
 * object; this injects transparent background, ink text, the book font, and
 * visible overflow (so axis labels aren't clipped). Caller's `style` wins.
 */
export function withBookTheme({ style, ...opts }: PlotOptions): PlotOptions {
  return {
    style: {
      background: 'transparent',
      color: CHART.ink,
      fontFamily: FONT_SANS,
      fontSize: '12px',
      overflow: 'visible',
      ...(style as object),
    },
    ...opts,
  };
}
