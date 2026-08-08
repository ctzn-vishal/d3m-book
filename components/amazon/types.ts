/**
 * Shape of app/amazon/data/amazon-reviews.json, plus the formatting and palette
 * helpers every Amazon page shares. Regenerate the JSON with `pnpm fetch-amazon`
 * (scripts/fetch-amazon-aggregates.mjs).
 */

/** One point in a time series. Field names are terse because they repeat ~2,200×. */
export interface Cell {
  /** Time key: year, month (1–12), day of week (0=Mon), or hour (0–23 UTC). */
  t: number;
  /** Review count in this cell. */
  n: number;
  /** Mean star rating. */
  r: number;
  /** Mean review length in characters. */
  l: number;
  /** Share of reviews flagged verified purchase, 0–100. */
  v: number;
  /** Share at 1★…5★, 0–100. */
  d: number[];
}

export interface CategoryStat {
  key: string;
  label: string;
  n: number;
  r: number;
  l: number;
  v: number;
  d: number[];
  from: string;
  to: string;
}

export interface AmazonData {
  meta: {
    totalReviews: number;
    categoryCount: number;
    from: string;
    to: string;
    avgRating: number;
    avgLength: number;
    verifiedPct: number;
    dist: number[];
    source: string;
    bucket: string;
  };
  categories: CategoryStat[];
  monthNames: string[];
  dayNames: string[];
  series: {
    yearly: Record<string, Cell[]>;
    monthly: Record<string, Cell[]>;
    dayofweek: Record<string, Cell[]>;
    hourly: Record<string, Cell[]>;
  };
}

/** Sentinel key for the pooled all-categories series. */
export const ALL = 'ALL';

/**
 * Cells thinner than this are dropped from *rate* charts (mean rating,
 * verified share). The upstream aggregates happily report `rating_5_pct =
 * 100.0` for a category-year holding one review; 500 is where the noise stops
 * dominating. Volume charts keep every cell — a thin year is still a real
 * count.
 */
export const MIN_CELL = 500;

// ── Palette ────────────────────────────────────────────────────────────────
// Axis and label colours resolve through the hub's CSS variables so charts
// follow the light/dark toggle and sit inside the warm-paper editorial scope
// rather than the book's white reading theme.
export const INK = 'rgb(var(--hub-ink))';
export const SOFT = 'rgb(var(--hub-ink-soft))';
export const MUTED = 'rgb(var(--hub-ink-faint))';
export const GRID = 'rgb(var(--hub-line))';
export const SURFACE = 'rgb(var(--hub-paper))';

/** Accents track the hub tokens, so they invert with the theme for free. */
export const ACCENT = {
  blue: 'rgb(var(--hub-blue))',
  amber: 'rgb(var(--hub-amber))',
  teal: 'rgb(var(--hub-teal))',
  plum: 'rgb(var(--hub-plum))',
} as const;

/**
 * 1★ → 5★. Fixed mid-tones rather than hub vars — an ordered five-step ramp
 * needs five hues, and every one is chosen at roughly L* 45–65 so it holds
 * contrast on both the paper and the near-black surface.
 */
export const STARS = ['#C9524A', '#D4813F', '#C2A03A', '#78A05C', '#3E8C86'];

// ── Formatters ─────────────────────────────────────────────────────────────
export const int = (n: number) => n.toLocaleString('en-US');

/**
 * 67,409,944 → "67.4M". Used wherever a full count would crowd the layout —
 * leaderboard cells and chart axes. Trailing ".0" is dropped so an axis reads
 * "1M, 1.5M, 2M" rather than "1.0M, 1.5M, 2.0M".
 */
export function compact(n: number): string {
  const trim = (s: string) => s.replace(/\.0+$/, '');
  if (n >= 1e9) return `${trim((n / 1e9).toFixed(2))}B`;
  if (n >= 1e6) return `${trim((n / 1e6).toFixed(1))}M`;
  if (n >= 1e3) return `${trim((n / 1e3).toFixed(n >= 1e4 ? 0 : 1))}K`;
  return String(n);
}

export const pct = (n: number, d = 1) => `${n.toFixed(d)}%`;

/** Signed to two decimals — for differences where the sign carries the meaning. */
export const signed = (n: number, d = 2) => `${n >= 0 ? '+' : '−'}${Math.abs(n).toFixed(d)}`;

export function isoDate(s: string): string {
  return new Date(`${s}T00:00:00Z`).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

/** Count-weighted mean of `pick` over a set of cells. */
export function weightedMean(cells: Cell[], pick: (c: Cell) => number): number {
  const n = cells.reduce((s, c) => s + c.n, 0);
  return n === 0 ? 0 : cells.reduce((s, c) => s + c.n * pick(c), 0) / n;
}
