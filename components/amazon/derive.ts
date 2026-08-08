/**
 * Statistics derived from the published Phase 1 aggregates — no new data
 * collection required. Kept separate from the chart components so the numbers
 * quoted in prose and the numbers plotted always come from one place.
 *
 * Everything here is pure and cheap; pages call it at module scope and the
 * results are baked into the static build.
 */

import type { AmazonData, Cell, CategoryStat } from './types';

/** Share of each cell in a series, as a fraction summing to 1. */
export function shares(cells: Cell[]): number[] {
  const total = cells.reduce((s, c) => s + c.n, 0) || 1;
  return cells.map(c => c.n / total);
}

/**
 * Coefficient of variation — SD over mean. The scale-free way to ask "how
 * uneven is this profile", which is what lets a 12-point monthly profile and a
 * 24-point hourly profile be compared on one axis.
 */
export function cv(values: number[]): number {
  const m = values.reduce((s, v) => s + v, 0) / values.length;
  if (m === 0) return 0;
  const varc = values.reduce((s, v) => s + (v - m) ** 2, 0) / values.length;
  return Math.sqrt(varc) / m;
}

export function pearson(x: number[], y: number[]): number {
  const n = x.length;
  const mx = x.reduce((s, v) => s + v, 0) / n;
  const my = y.reduce((s, v) => s + v, 0) / n;
  let sxy = 0;
  let sxx = 0;
  let syy = 0;
  for (let i = 0; i < n; i++) {
    sxy += (x[i] - mx) * (y[i] - my);
    sxx += (x[i] - mx) ** 2;
    syy += (y[i] - my) ** 2;
  }
  return sxy / Math.sqrt(sxx * syy);
}

/** Ascending ranks, 1-based. Ties get sequential ranks — fine at this precision. */
function ranks(values: number[]): number[] {
  const order = values.map((v, i) => [v, i] as const).sort((a, b) => a[0] - b[0]);
  const out: number[] = [];
  order.forEach(([, i], k) => (out[i] = k + 1));
  return out;
}

/**
 * Spearman is the headline statistic for every cross-category relationship on
 * these pages. With 33 points and one category routinely an order of magnitude
 * out on the x-axis, Pearson measures that category's leverage as much as the
 * relationship.
 */
export function spearman(x: number[], y: number[]): number {
  return pearson(ranks(x), ranks(y));
}

export interface RhythmRow {
  key: string;
  label: string;
  n: number;
  /** Coefficient of variation of the 12 monthly shares. */
  monthCV: number;
  /** Coefficient of variation of the 7 weekday shares. */
  weekCV: number;
  /** Coefficient of variation of the 24 hourly shares. */
  hourCV: number;
  /** January's share divided by the average month's share. 1.0 = no lift. */
  janLift: number;
  /** Index of the busiest month, 1–12. */
  peakMonth: number;
  /** Index of the quietest month, 1–12. */
  troughMonth: number;
  /** Mean rating in January minus mean rating in December. */
  janMinusDec: number;
  /** Share of the category's reviews posted 02:00–07:59 UTC (US late evening). */
  nightShare: number;
  /** Circular mean of the hourly profile, in UTC hours. */
  meanHour: number;
  /** Monthly shares as an index where 100 = the category's own average month. */
  monthIndex: number[];
}

/** Per-category rhythm profile — the backbone of the seasonality analysis. */
export function rhythmRows(data: AmazonData): RhythmRow[] {
  return data.categories.map(c => {
    const m = data.series.monthly[c.key];
    const w = data.series.dayofweek[c.key];
    const h = data.series.hourly[c.key];
    const ms = shares(m);
    const hs = shares(h);

    // Circular mean: hours wrap, so averaging 23 and 1 arithmetically gives 12.
    let X = 0;
    let Y = 0;
    hs.forEach((p, i) => {
      X += p * Math.cos((2 * Math.PI * i) / 24);
      Y += p * Math.sin((2 * Math.PI * i) / 24);
    });
    const meanHour = ((Math.atan2(Y, X) * 24) / (2 * Math.PI) + 24) % 24;

    return {
      key: c.key,
      label: c.label,
      n: c.n,
      monthCV: cv(ms),
      weekCV: cv(shares(w)),
      hourCV: cv(hs),
      janLift: ms[0] * 12,
      peakMonth: ms.indexOf(Math.max(...ms)) + 1,
      troughMonth: ms.indexOf(Math.min(...ms)) + 1,
      janMinusDec: m[0].r - m[11].r,
      nightShare: hs.slice(2, 8).reduce((s, v) => s + v, 0) * 100,
      meanHour,
      monthIndex: ms.map(v => v * 12 * 100),
    };
  });
}

/**
 * The gift-season relationship: categories whose volume spikes hardest in
 * January also show the largest December→January jump in mean rating.
 *
 * Reported with the outlier sensitivity attached, because Gift Cards sits so
 * far out on the x-axis that it alone moves Pearson by 0.17.
 */
export function giftGradient(rows: RhythmRow[]) {
  const x = rows.map(r => r.janLift);
  const y = rows.map(r => r.janMinusDec);
  const trimmed = [...rows].sort((a, b) => b.janLift - a.janLift).slice(2);
  return {
    pearson: pearson(x, y),
    spearman: spearman(x, y),
    pearsonExTop2: pearson(trimmed.map(r => r.janLift), trimmed.map(r => r.janMinusDec)),
    spearmanExTop2: spearman(trimmed.map(r => r.janLift), trimmed.map(r => r.janMinusDec)),
  };
}

/** Era shares — the fact that reframes every pooled statistic on the site. */
export function eras(data: AmazonData) {
  const y = data.series.yearly.ALL;
  const total = y.reduce((s, c) => s + c.n, 0);
  const span = (lo: number, hi: number) =>
    y.filter(c => c.t >= lo && c.t <= hi).reduce((s, c) => s + c.n, 0);
  const bands = [
    { label: '1996–2012', lo: 1996, hi: 2012 },
    { label: '2013–2016', lo: 2013, hi: 2016 },
    { label: '2017–2023', lo: 2017, hi: 2023 },
  ];
  return bands.map(b => {
    const n = span(b.lo, b.hi);
    return { ...b, n, share: (n / total) * 100, years: b.hi - b.lo + 1 };
  });
}

/** Categories sorted by volume, largest first. */
export function byVolume(cats: CategoryStat[]): CategoryStat[] {
  return [...cats].sort((a, b) => b.n - a.n);
}
