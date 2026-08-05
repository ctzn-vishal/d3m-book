'use client';

import * as React from 'react';
import * as Plot from '@observablehq/plot';
import { PlotFigure } from '@/components/Book/charts/PlotFigure';
import { ChoroplethMap } from '@/components/Book/charts/ChoroplethMap';
import { withBookTheme, CHART, CATEGORICAL } from '@/lib/chart-theme';

/* ------------------------------------------------------------------ */
/* Types (unchanged public shape)                                      */
/* ------------------------------------------------------------------ */

type AtlasCard = {
  id: string;
  family: string;
  title: string;
  useWhen: string;
  managerQuestion: string;
  avoid: string;
  caseExample: string;
  finding: string;
  dataSource: string;
};

type AtlasData = {
  metadata: {
    soup_rows: number;
    soup_stores: number;
    soup_months: number;
    soup_date_range: string;
    county_rows: number;
    zillow_states: number;
    zillow_date_range: string;
  };
  sourceNotes: Array<{ case: string; role: string }>;
  cards: AtlasCard[];
  charts: Record<string, any>;
};

type PlotOptions = NonNullable<Parameters<typeof Plot.plot>[0]>;

/* ------------------------------------------------------------------ */
/* Theme tokens                                                        */
/* ------------------------------------------------------------------ */

const SOURCE_COLORS: Record<string, string> = {
  Soup: CHART.skyDark,
  County: CHART.violet,
  Zillow: CHART.teal,
  Teaching: CHART.amber,
};

const REGION_COLORS: Record<string, string> = {
  East: CHART.sky,
  Midwest: CHART.violet,
  South: CHART.rose,
  West: CHART.teal,
};

const FAMILY_NOTES: Record<string, string> = {
  Distribution: 'Shape, spread, outliers, and typical units.',
  Comparison: 'Rank or contrast a small set of categories.',
  Time: 'Order, timing, baselines, and growth paths.',
  Relationship: 'Two-variable patterns before model claims.',
  Geography: 'Spatial pattern only when place changes action.',
  Multivariate: 'Dense scans across two dimensions or many pairs.',
  Uncertainty: 'Estimates plus the range that should qualify them.',
  'Business Bridge': 'Managerial decomposition from components to action.',
};

const FAMILY_ORDER = [
  'Distribution',
  'Comparison',
  'Time',
  'Relationship',
  'Geography',
  'Multivariate',
  'Uncertainty',
  'Business Bridge',
];

/**
 * Cards whose form gets a full treatment elsewhere in Part II. The atlas is the
 * index; these links are the "read more" edges that turn it from a gallery into
 * a hub — §3.1 for baselines/indexes, §3.3 for faceting, §3.4 for the
 * statistical forms, §4.1–4.2 for the managerial bridges.
 */
const DEEP_DIVE: Record<string, { href: string; label: string }> = {
  line: { href: '/ch03-question-to-chart', label: 'Baselines and indexes → §3.1' },
  indexedLine: { href: '/ch03-question-to-chart', label: 'Baselines and indexes → §3.1' },
  smallMultiples: { href: '/ch03-small-multiples', label: 'When faceting earns its space → §3.3' },
  histogram: { href: '/ch03-uncertainty', label: 'Shape before summary → §3.4' },
  density: { href: '/ch03-uncertainty', label: 'Shape before summary → §3.4' },
  strip: { href: '/ch03-uncertainty', label: 'Shape before summary → §3.4' },
  scatter: { href: '/ch03-uncertainty', label: 'Reading a slope before the equation → §3.4' },
  interval: { href: '/ch03-uncertainty', label: 'What an interval is about → §3.4' },
  coefficient: { href: '/ch03-uncertainty', label: 'What an interval is about → §3.4' },
  pareto: { href: '/ch04-concentration-case', label: 'Concentration, measured properly → §4.2' },
  funnel: { href: '/ch04-dashboards', label: 'The dashboard arc → §4.1' },
  waterfall: { href: '/ch04-dashboards', label: 'The dashboard arc → §4.1' },
};

/**
 * Extra search vocabulary per form. The card copy is written for reading, not
 * for retrieval, so a reader searching the way §3.2 tells them to — by the
 * comparison ("ranking", "growth", "part-to-whole") rather than the chart name
 * — would otherwise miss forms whose prose happens to use different words.
 */
const SEARCH_TERMS: Record<string, string> = {
  histogram: 'distribution spread shape skew counts bins outliers tail',
  density: 'distribution spread shape smooth curve kernel',
  boxplot: 'distribution spread quartiles median compare groups outliers',
  strip: 'distribution spread every observation dots raw points jitter',
  bar: 'ranking rank compare categories largest biggest which',
  dot: 'ranking rank compare categories growth change many categories',
  lollipop: 'ranking rank compare categories growth change',
  stackedBar: 'composition part-to-whole share mix breakdown percentage',
  groupedBar: 'compare side by side categories within groups clustered',
  slopegraph: 'change between two periods before after growth movement direction',
  line: 'over time trend growth series history when changed',
  indexedLine: 'over time trend growth rebase baseline index percent change compare markets',
  area: 'over time magnitude composition total volume cumulative',
  smallMultiples: 'heterogeneity facet by group regions segments panels compare many series over time',
  scatter: 'relationship correlation two variables association slope clusters outliers',
  bubble: 'relationship correlation three variables size magnitude',
  tileMap: 'geography location where map spatial region state',
  choropleth: 'geography location where map spatial region state growth',
  correlation: 'many variables scan pairs correlation matrix relationships before modeling',
  heatmap: 'many cells scan grid two dimensions over time intensity',
  treemap: 'composition part-to-whole share many categories rank area',
  interval: 'uncertainty confidence error bars precision range significance',
  coefficient: 'uncertainty confidence error bars estimate regression forest effect size',
  pareto: 'concentration ranking eighty twenty cumulative share long tail revenue drivers',
  waterfall: 'bridge decomposition contribution from to build-up variance',
  funnel: 'drop-off conversion stages pipeline sequence attrition',
  pie: 'composition part-to-whole share anti-pattern avoid',
};

const CHART_H = 260;

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const usd = (v: number) => '$' + new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 0 }).format(v);
const usdFull = (v: number) => '$' + Math.round(v).toLocaleString('en-US');
const pct = (v: number) => `${v.toFixed(1)}%`;

/** Convert a "YYYY-MM" string into a Date for time scales. */
function toDate(ym: string): Date {
  const [y, m] = ym.split('-').map(Number);
  return new Date(y, (m ?? 1) - 1, 1);
}

/* ------------------------------------------------------------------ */
/* Illustrative datasets for the ADDED forms (small, typed consts)     */
/* ------------------------------------------------------------------ */

// Soup category sales by quarter — for stacked / 100%-stacked / grouped / area.
type SeasonRow = { quarter: string; category: string; units: number };
const SEASON_DATA: SeasonRow[] = [
  { quarter: 'Q1', category: 'Core soups', units: 480 },
  { quarter: 'Q1', category: 'Premium soups', units: 220 },
  { quarter: 'Q1', category: 'Broths', units: 140 },
  { quarter: 'Q2', category: 'Core soups', units: 300 },
  { quarter: 'Q2', category: 'Premium soups', units: 180 },
  { quarter: 'Q2', category: 'Broths', units: 90 },
  { quarter: 'Q3', category: 'Core soups', units: 260 },
  { quarter: 'Q3', category: 'Premium soups', units: 170 },
  { quarter: 'Q3', category: 'Broths', units: 80 },
  { quarter: 'Q4', category: 'Core soups', units: 540 },
  { quarter: 'Q4', category: 'Premium soups', units: 290 },
  { quarter: 'Q4', category: 'Broths', units: 165 },
];
const SEASON_CATS = ['Core soups', 'Premium soups', 'Broths'];

// Slopegraph: region county vote share, two elections.
type SlopeRow = { region: string; year: string; value: number };
const SLOPE_DATA: SlopeRow[] = [
  { region: 'Midwest', year: '2016', value: 66.0 },
  { region: 'Midwest', year: '2020', value: 69.2 },
  { region: 'South', year: '2016', value: 64.8 },
  { region: 'South', year: '2020', value: 67.4 },
  { region: 'West', year: '2016', value: 60.1 },
  { region: 'West', year: '2020', value: 61.4 },
  { region: 'East', year: '2016', value: 52.9 },
  { region: 'East', year: '2020', value: 51.8 },
];

// Treemap: revenue share by product family (reuses the Pareto framing).
type TreeRow = { name: string; value: number };
const TREE_DATA: TreeRow[] = [
  { name: 'Core soups', value: 42 },
  { name: 'Premium soups', value: 24 },
  { name: 'Meal kits', value: 13 },
  { name: 'Broths', value: 9 },
  { name: 'Seasonal', value: 7 },
  { name: 'Other', value: 5 },
];

// True choropleth: state home-value growth since 2020 (FIPS-keyed).
type StateGeoRow = { id: string; value: number; label: string };
const STATE_GROWTH: StateGeoRow[] = [
  { id: '39', value: 56.2, label: 'Ohio' },
  { id: '26', value: 51.4, label: 'Michigan' },
  { id: '04', value: 49.7, label: 'Arizona' },
  { id: '12', value: 49.2, label: 'Florida' },
  { id: '36', value: 46.7, label: 'New York' },
  { id: '32', value: 43.7, label: 'Nevada' },
  { id: '06', value: 38.8, label: 'California' },
  { id: '48', value: 35.6, label: 'Texas' },
  { id: '17', value: 41.0, label: 'Illinois' },
  { id: '42', value: 44.5, label: 'Pennsylvania' },
  { id: '13', value: 47.8, label: 'Georgia' },
  { id: '37', value: 50.3, label: 'North Carolina' },
  { id: '53', value: 40.2, label: 'Washington' },
  { id: '08', value: 39.1, label: 'Colorado' },
  { id: '25', value: 45.9, label: 'Massachusetts' },
  { id: '47', value: 52.0, label: 'Tennessee' },
  { id: '18', value: 48.6, label: 'Indiana' },
  { id: '29', value: 49.0, label: 'Missouri' },
  { id: '55', value: 50.7, label: 'Wisconsin' },
  { id: '21', value: 48.1, label: 'Kentucky' },
];

// Strip / jitter: store-month volume sampled across four regions (distribution at scale).
type StripRow = { region: string; volume: number };
const STRIP_DATA: StripRow[] = (() => {
  // Deterministic pseudo-random sample so the chart is stable across renders.
  const rows: StripRow[] = [];
  const regions: Array<[string, number, number]> = [
    ['Northeast', 720, 1.0],
    ['Midwest', 980, 1.35],
    ['South', 880, 1.5],
    ['West', 1120, 1.7],
  ];
  let seed = 7;
  const rnd = () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  };
  for (const [region, base, spread] of regions) {
    for (let i = 0; i < 70; i++) {
      // log-normal-ish skew to echo the real store-month tail
      const u = rnd();
      const volume = Math.round(base * Math.exp(spread * (u - 0.45)));
      rows.push({ region, volume });
    }
  }
  return rows;
})();

// Funnel: pricing-decision pipeline (teaching data).
type FunnelRow = { stage: string; value: number };
const FUNNEL_DATA: FunnelRow[] = [
  { stage: 'Stores reviewed', value: 2042 },
  { stage: 'Price-eligible', value: 1480 },
  { stage: 'Test launched', value: 760 },
  { stage: 'Lift confirmed', value: 410 },
  { stage: 'Rolled out', value: 240 },
];

// Pie (bad-by-design Trap) — same revenue mix as the treemap.
const PIE_DATA = TREE_DATA;

/* ------------------------------------------------------------------ */
/* Card framing                                                        */
/* ------------------------------------------------------------------ */

function CardShell({
  id,
  family,
  title,
  source,
  finding,
  useWhen,
  managerQuestion,
  avoid,
  caseExample,
  badge,
  children,
}: {
  id: string;
  family: string;
  title: string;
  source: string;
  finding: string;
  useWhen: string;
  managerQuestion: string;
  avoid: string;
  caseExample: string;
  badge?: string;
  children: React.ReactNode;
}) {
  const accent = SOURCE_COLORS[source] ?? CHART.slate;
  const deepDive = DEEP_DIVE[id];
  return (
    <article
      id={`atlas-${id}`}
      className="flex h-full scroll-mt-24 flex-col overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800/40 dark:shadow-none"
    >
      <div className="border-b border-slate-100 bg-slate-50/80 p-4 dark:border-slate-700 dark:bg-slate-800/70">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{family}</p>
            <h3 className="mt-1 text-base font-semibold text-slate-950 dark:text-slate-100">{title}</h3>
          </div>
          <span className="shrink-0 rounded-full px-2 py-1 text-[10px] font-semibold text-white" style={{ background: accent }}>
            {badge ?? source}
          </span>
        </div>
      </div>
      {/* The Plot specs use fixed ink-on-transparent text (lib/chart-theme.ts),
          so the chart itself always sits on a light plate — in dark mode only
          the card chrome darkens, and the figure stays legible. */}
      <div className="m-3 rounded-md bg-white px-1 pb-1 pt-2 ring-1 ring-slate-100 dark:ring-slate-700">{children}</div>
      <div className="mx-4 rounded-md border border-slate-200 bg-slate-50 p-3 text-xs leading-relaxed text-slate-700 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-300">
        <span className="font-semibold text-slate-950 dark:text-slate-100">Finding in this data: </span>
        {finding}
      </div>
      <div className="mt-auto space-y-2 border-t border-slate-100 p-4 text-xs leading-relaxed dark:border-slate-700">
        <p>
          <span className="font-semibold text-slate-900 dark:text-slate-100">Use:</span>{' '}
          <span className="text-slate-600 dark:text-slate-400">{useWhen}</span>
        </p>
        <p>
          <span className="font-semibold text-slate-900 dark:text-slate-100">Question:</span>{' '}
          <span className="text-slate-600 dark:text-slate-400">{managerQuestion}</span>
        </p>
        <p>
          <span className="font-semibold text-slate-900 dark:text-slate-100">Trap:</span>{' '}
          <span className="text-slate-600 dark:text-slate-400">{avoid}</span>
        </p>
        <p className="border-l-2 pl-2 text-slate-700 dark:text-slate-300" style={{ borderColor: accent }}>
          {caseExample}
        </p>
        {deepDive && (
          <p className="pt-1">
            <a
              href={deepDive.href}
              className="font-medium text-sky-700 underline decoration-sky-300 underline-offset-2 hover:text-sky-900 dark:text-sky-300 dark:decoration-sky-700 dark:hover:text-sky-200"
            >
              {deepDive.label}
            </a>
          </p>
        )}
      </div>
    </article>
  );
}

/** Small inline toggle pill group used inside cards. */
function Toggle<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: Array<{ value: T; label: string }>;
  onChange: (v: T) => void;
}) {
  return (
    <div className="mb-2 ml-1 inline-flex rounded-md border border-slate-200 bg-slate-50 p-0.5 text-[11px] font-medium">
      {options.map(opt => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`rounded px-2.5 py-1 transition-colors ${
            value === opt.value ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}
          aria-pressed={value === opt.value}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Chart builders — each returns a PlotFigure                          */
/* ------------------------------------------------------------------ */

/* === Distribution === */

function HistogramFigure({ charts }: { charts: AtlasData['charts'] }) {
  const bins: Array<{ x0: number; x1: number; count: number }> = charts.histogram.bins;
  return (
    <PlotFigure
      ariaLabel="Histogram of store-month volume"
      options={width =>
        withBookTheme({
          width,
          height: CHART_H,
          marginLeft: 52,
          marginBottom: 36,
          x: { label: 'store-month units →', tickFormat: '~s' },
          y: { grid: true, label: 'store-months' },
          marks: [
            Plot.rectY(bins, {
              x1: 'x0',
              x2: 'x1',
              y: 'count',
              fill: CHART.skyDark,
              fillOpacity: 0.85,
              tip: true,
              title: (d: any) => `${Math.round(d.x0)}–${Math.round(d.x1)} units\n${d.count.toLocaleString()} store-months`,
            }),
            Plot.ruleY([0]),
          ],
        })
      }
    />
  );
}

function DistributionToggleFigure({ charts }: { charts: AtlasData['charts'] }) {
  const [mode, setMode] = React.useState<'count' | 'density'>('count');
  const bins: Array<{ x0: number; x1: number; count: number }> = charts.histogram.bins;
  const density: Array<{ x: number; density: number }> = charts.density.points;
  return (
    <div>
      <Toggle
        value={mode}
        onChange={setMode}
        options={[
          { value: 'count', label: 'Counts' },
          { value: 'density', label: 'Density' },
        ]}
      />
      {mode === 'count' ? (
        <PlotFigure
          ariaLabel="Histogram counts of store-month volume"
          options={width =>
            withBookTheme({
              width,
              height: CHART_H - 28,
              marginLeft: 52,
              marginBottom: 32,
              x: { label: 'units →', tickFormat: '~s' },
              y: { grid: true, label: 'store-months' },
              marks: [
                Plot.rectY(bins, {
                  x1: 'x0',
                  x2: 'x1',
                  y: 'count',
                  fill: CHART.skyDark,
                  fillOpacity: 0.85,
                  tip: true,
                  title: (d: any) => `${Math.round(d.x0)}–${Math.round(d.x1)}\n${d.count.toLocaleString()} store-months`,
                }),
                Plot.ruleY([0]),
              ],
            })
          }
        />
      ) : (
        <PlotFigure
          ariaLabel="Smoothed density of the distribution"
          options={width =>
            withBookTheme({
              width,
              height: CHART_H - 28,
              marginLeft: 52,
              marginBottom: 32,
              x: { label: 'value →' },
              y: { grid: true, label: 'density', tickFormat: '.3f' },
              marks: [
                Plot.areaY(density, { x: 'x', y: 'density', fill: CHART.violet, fillOpacity: 0.16 }),
                Plot.lineY(density, {
                  x: 'x',
                  y: 'density',
                  stroke: CHART.violet,
                  strokeWidth: 2.4,
                  tip: true,
                  title: (d: any) => `value ${d.x.toFixed(1)}\ndensity ${d.density.toFixed(4)}`,
                }),
                Plot.ruleY([0]),
              ],
            })
          }
        />
      )}
    </div>
  );
}

function BoxplotFigure({ charts }: { charts: AtlasData['charts'] }) {
  const rows: Array<{ group: string; min: number; q1: number; median: number; q3: number; max: number; n: number }> =
    charts.boxplot.rows;
  return (
    <PlotFigure
      ariaLabel="Box plots of county vote share by region"
      options={width =>
        withBookTheme({
          width,
          height: CHART_H,
          marginLeft: 70,
          marginBottom: 32,
          x: { grid: true, label: 'county Trump vote share (%) →', domain: [20, 95] },
          y: { label: null },
          color: { domain: rows.map(r => r.group), range: rows.map(r => REGION_COLORS[r.group] ?? CHART.slate) },
          marks: [
            Plot.ruleY(rows, { y: 'group', x1: 'min', x2: 'max', stroke: CHART.faint }),
            Plot.barX(rows, {
              y: 'group',
              x1: 'q1',
              x2: 'q3',
              fill: 'group',
              fillOpacity: 0.25,
              stroke: 'group',
              tip: true,
              title: (d: any) =>
                `${d.group} (n=${d.n})\nmin ${d.min}  Q1 ${d.q1}\nmedian ${d.median}\nQ3 ${d.q3}  max ${d.max}`,
            }),
            Plot.tickX(rows, { y: 'group', x: 'median', stroke: 'group', strokeWidth: 2.5 }),
            Plot.dot(rows, { y: 'group', x: 'median', fill: 'group', r: 3 }),
          ],
        })
      }
    />
  );
}

function StripFigure() {
  const regions = ['Northeast', 'Midwest', 'South', 'West'];
  return (
    <PlotFigure
      ariaLabel="Strip plot of store-month volume by region"
      options={width =>
        withBookTheme({
          width,
          height: CHART_H,
          marginLeft: 78,
          marginBottom: 34,
          x: { grid: true, label: 'store-month units →' },
          fy: { label: null, domain: regions },
          marks: [
            Plot.dot(
              STRIP_DATA,
              Plot.dodgeY('middle', {
                x: 'volume',
                fy: 'region',
                fill: CHART.skyDark,
                fillOpacity: 0.5,
                r: 3,
                tip: true,
                title: (d: any) => `${d.region}\n${d.volume.toLocaleString()} units`,
              })
            ),
          ],
        })
      }
    />
  );
}

/* === Comparison === */

function BarFigure({ charts }: { charts: AtlasData['charts'] }) {
  const rows: Array<{ group: string; value: number; n: number }> = charts.bar.rows;
  return (
    <PlotFigure
      ariaLabel="Sorted bar chart of average county vote share by region"
      options={width =>
        withBookTheme({
          width,
          height: CHART_H,
          marginLeft: 72,
          marginBottom: 32,
          x: { grid: true, label: 'avg county Trump vote (%) →', domain: [0, 80] },
          y: { label: null, domain: [...rows].sort((a, b) => b.value - a.value).map(r => r.group) },
          marks: [
            Plot.barX(rows, {
              x: 'value',
              y: 'group',
              fill: CHART.teal,
              fillOpacity: 0.85,
              tip: true,
              title: (d: any) => `${d.group} (n=${d.n})\n${d.value}% avg`,
            }),
            Plot.text(rows, { x: 'value', y: 'group', text: (d: any) => `${d.value}%`, dx: 6, textAnchor: 'start', fill: CHART.body, fontSize: 11 }),
            Plot.ruleX([0]),
          ],
        })
      }
    />
  );
}

function LollipopFigure({ charts }: { charts: AtlasData['charts'] }) {
  const rows: Array<{ state: string; pct_change: number }> = charts.dot.rows;
  const sorted = [...rows].sort((a, b) => b.pct_change - a.pct_change);
  return (
    <PlotFigure
      ariaLabel="Lollipop chart of state home-value growth since 2020"
      options={width =>
        withBookTheme({
          width,
          height: CHART_H,
          marginLeft: 74,
          marginBottom: 32,
          x: { grid: true, label: 'home-value change since Jan 2020 (%) →', domain: [0, 65] },
          y: { label: null, domain: sorted.map(r => r.state) },
          marks: [
            Plot.ruleY(sorted, { y: 'state', x1: 0, x2: 'pct_change', stroke: CHART.border, strokeWidth: 2 }),
            Plot.dot(sorted, {
              y: 'state',
              x: 'pct_change',
              fill: CHART.orange,
              r: 5,
              tip: true,
              title: (d: any) => `${d.state}\n+${d.pct_change}% since Jan 2020`,
            }),
            Plot.text(sorted, { y: 'state', x: 'pct_change', text: (d: any) => `${d.pct_change}%`, dx: 10, textAnchor: 'start', fill: CHART.body, fontSize: 10 }),
          ],
        })
      }
    />
  );
}

function StackedBarFigure({ pct }: { pct: boolean }) {
  return (
    <PlotFigure
      ariaLabel={pct ? '100% stacked bar of category mix by quarter' : 'Stacked bar of units by quarter'}
      options={width =>
        withBookTheme({
          width,
          height: CHART_H,
          marginLeft: 48,
          marginBottom: 32,
          x: { label: null },
          y: { grid: true, label: pct ? 'share of quarter' : 'units', percent: pct, tickFormat: pct ? undefined : '~s' },
          color: { domain: SEASON_CATS, range: [CHART.skyDark, CHART.orange, CHART.teal], legend: true },
          marks: [
            Plot.barY(SEASON_DATA, {
              x: 'quarter',
              y: 'units',
              fill: 'category',
              offset: pct ? 'normalize' : undefined,
              order: SEASON_CATS,
              tip: true,
              title: (d: any) => `${d.quarter} · ${d.category}\n${d.units} units`,
            }),
            Plot.ruleY([0]),
          ],
        })
      }
    />
  );
}

function StackedBarToggleFigure() {
  const [mode, setMode] = React.useState<'absolute' | 'share'>('absolute');
  return (
    <div>
      <Toggle
        value={mode}
        onChange={setMode}
        options={[
          { value: 'absolute', label: 'Stacked (units)' },
          { value: 'share', label: '100% (share)' },
        ]}
      />
      <StackedBarFigure pct={mode === 'share'} />
    </div>
  );
}

function GroupedBarFigure() {
  return (
    <PlotFigure
      ariaLabel="Grouped bar of category units by quarter"
      options={width =>
        withBookTheme({
          width,
          height: CHART_H,
          marginLeft: 48,
          marginBottom: 32,
          x: { label: null, axis: null },
          fx: { label: null },
          y: { grid: true, label: 'units', tickFormat: '~s' },
          color: { domain: SEASON_CATS, range: [CHART.skyDark, CHART.orange, CHART.teal], legend: true },
          marks: [
            Plot.barY(SEASON_DATA, {
              fx: 'quarter',
              x: 'category',
              y: 'units',
              fill: 'category',
              tip: true,
              title: (d: any) => `${d.quarter} · ${d.category}\n${d.units} units`,
            }),
            Plot.ruleY([0]),
          ],
        })
      }
    />
  );
}

function SlopegraphFigure() {
  const colorFor = (r: string) => REGION_COLORS[r] ?? CHART.slate;
  return (
    <PlotFigure
      ariaLabel="Slopegraph of regional vote share across two elections"
      options={width =>
        withBookTheme({
          width,
          height: CHART_H,
          marginLeft: 36,
          marginRight: 64,
          marginBottom: 32,
          x: { label: null, domain: ['2016', '2020'], padding: 0.5, axis: 'top' as any },
          y: { label: 'avg county Trump vote (%)', grid: true },
          color: { domain: Object.keys(REGION_COLORS), range: Object.values(REGION_COLORS), legend: false },
          marks: [
            Plot.line(SLOPE_DATA, {
              x: 'year',
              y: 'value',
              z: 'region',
              stroke: 'region',
              strokeWidth: 2.2,
              tip: true,
              title: (d: any) => `${d.region} ${d.year}\n${d.value}%`,
            }),
            Plot.dot(SLOPE_DATA, { x: 'year', y: 'value', fill: 'region', r: 4 }),
            Plot.text(
              SLOPE_DATA.filter(d => d.year === '2020'),
              { x: 'year', y: 'value', text: (d: any) => `${d.region}`, dx: 8, textAnchor: 'start', fill: (d: any) => colorFor(d.region), fontSize: 10 }
            ),
          ],
        })
      }
    />
  );
}

/* === Time === */

function LineToggleFigure({ charts }: { charts: AtlasData['charts'] }) {
  const [mode, setMode] = React.useState<'raw' | 'index'>('raw');
  const raw: Array<{ state: string; date: string; value: number }> = charts.line.rows;
  const indexed: Array<{ state: string; date: string; index: number }> = charts.indexedLine.rows;
  const rawData = React.useMemo(() => raw.map(d => ({ ...d, dt: toDate(d.date) })), [raw]);
  const idxData = React.useMemo(() => indexed.map(d => ({ ...d, dt: toDate(d.date) })), [indexed]);
  const states = mode === 'raw' ? ['California', 'Texas', 'Florida', 'New York'] : ['California', 'Texas', 'Florida', 'New York', 'Arizona'];
  return (
    <div>
      <Toggle
        value={mode}
        onChange={setMode}
        options={[
          { value: 'raw', label: 'Dollars' },
          { value: 'index', label: 'Index = 100' },
        ]}
      />
      {mode === 'raw' ? (
        <PlotFigure
          ariaLabel="Line chart of state home values in dollars"
          options={width =>
            withBookTheme({
              width,
              height: CHART_H - 28,
              marginLeft: 54,
              marginBottom: 30,
              x: { label: null },
              y: { grid: true, label: 'home value', tickFormat: '~s' },
              color: { domain: states, range: CATEGORICAL, legend: true },
              marks: [
                Plot.lineY(rawData, {
                  x: 'dt',
                  y: 'value',
                  z: 'state',
                  stroke: 'state',
                  strokeWidth: 1.8,
                  tip: true,
                  title: (d: any) => `${d.state} · ${d.date}\n${usdFull(d.value)}`,
                }),
              ],
            })
          }
        />
      ) : (
        <PlotFigure
          ariaLabel="Indexed line chart, January 2020 equals 100"
          options={width =>
            withBookTheme({
              width,
              height: CHART_H - 28,
              marginLeft: 44,
              marginBottom: 30,
              x: { label: null },
              y: { grid: true, label: 'index (Jan 2020 = 100)' },
              color: { domain: states, range: CATEGORICAL, legend: true },
              marks: [
                Plot.ruleY([100], { stroke: CHART.faint, strokeDasharray: '4 4' }),
                Plot.lineY(idxData, {
                  x: 'dt',
                  y: 'index',
                  z: 'state',
                  stroke: 'state',
                  strokeWidth: 1.8,
                  tip: true,
                  title: (d: any) => `${d.state} · ${d.date}\nindex ${d.index}`,
                }),
              ],
            })
          }
        />
      )}
    </div>
  );
}

function AreaToggleFigure({ charts }: { charts: AtlasData['charts'] }) {
  const [mode, setMode] = React.useState<'single' | 'stacked'>('single');
  const raw: Array<{ state: string; date: string; value: number }> = charts.line.rows;
  const data = React.useMemo(() => raw.map(d => ({ ...d, dt: toDate(d.date) })), [raw]);
  const ca = React.useMemo(() => data.filter(d => d.state === 'California'), [data]);
  return (
    <div>
      <Toggle
        value={mode}
        onChange={setMode}
        options={[
          { value: 'single', label: 'Area (one)' },
          { value: 'stacked', label: 'Stacked area' },
        ]}
      />
      {mode === 'single' ? (
        <PlotFigure
          ariaLabel="Area chart of California home value over time"
          options={width =>
            withBookTheme({
              width,
              height: CHART_H - 28,
              marginLeft: 54,
              marginBottom: 30,
              x: { label: null },
              y: { grid: true, label: 'home value', tickFormat: '~s' },
              marks: [
                Plot.areaY(ca, { x: 'dt', y: 'value', fill: CHART.skyDark, fillOpacity: 0.18 }),
                Plot.lineY(ca, {
                  x: 'dt',
                  y: 'value',
                  stroke: CHART.skyDark,
                  strokeWidth: 2,
                  tip: true,
                  title: (d: any) => `California · ${d.date}\n${usdFull(d.value)}`,
                }),
                Plot.ruleY([0]),
              ],
            })
          }
        />
      ) : (
        <PlotFigure
          ariaLabel="Stacked area chart of state home values"
          options={width =>
            withBookTheme({
              width,
              height: CHART_H - 28,
              marginLeft: 54,
              marginBottom: 30,
              x: { label: null },
              y: { grid: true, label: 'stacked home value', tickFormat: '~s' },
              color: { domain: ['California', 'Texas', 'Florida', 'New York'], range: CATEGORICAL, legend: true },
              marks: [
                Plot.areaY(data, {
                  x: 'dt',
                  y: 'value',
                  z: 'state',
                  fill: 'state',
                  fillOpacity: 0.85,
                  order: ['New York', 'Florida', 'Texas', 'California'],
                  tip: true,
                  title: (d: any) => `${d.state} · ${d.date}\n${usdFull(d.value)}`,
                }),
                Plot.ruleY([0]),
              ],
            })
          }
        />
      )}
    </div>
  );
}

function SmallMultiplesFigure({ charts }: { charts: AtlasData['charts'] }) {
  const raw: Array<{ state: string; date: string; value: number }> = charts.smallMultiples.rows;
  const data = React.useMemo(() => raw.map(d => ({ ...d, dt: toDate(d.date) })), [raw]);
  return (
    <PlotFigure
      ariaLabel="Small multiples of state home-value paths"
      options={width =>
        withBookTheme({
          width,
          height: CHART_H + 20,
          marginLeft: 50,
          marginBottom: 28,
          x: { label: null, ticks: 3 },
          y: { grid: true, label: 'home value', tickFormat: '~s' },
          fx: { label: null },
          fy: { label: null },
          marks: [
            Plot.lineY(data, {
              x: 'dt',
              y: 'value',
              fx: 'state',
              stroke: CHART.skyDark,
              strokeWidth: 1.6,
              tip: true,
              title: (d: any) => `${d.state} · ${d.date}\n${usdFull(d.value)}`,
            }),
          ],
        })
      }
    />
  );
}

/* === Relationship === */

function ScatterFigure({ charts }: { charts: AtlasData['charts'] }) {
  const points: Array<{ x: number; y: number; group: string }> = charts.scatter.points;
  return (
    <PlotFigure
      ariaLabel="Scatterplot of college share versus county vote share"
      options={width =>
        withBookTheme({
          width,
          height: CHART_H,
          marginLeft: 48,
          marginBottom: 36,
          x: { grid: true, label: 'county college share (%) →' },
          y: { grid: true, label: 'Trump vote (%)' },
          color: { domain: Object.keys(REGION_COLORS), range: Object.values(REGION_COLORS), legend: true },
          marks: [
            Plot.dot(points, {
              x: 'x',
              y: 'y',
              fill: 'group',
              fillOpacity: 0.35,
              r: 2.4,
              tip: true,
              title: (d: any) => `${d.group}\ncollege ${d.x}% · vote ${d.y}%`,
            }),
            Plot.linearRegressionY(points, { x: 'x', y: 'y', stroke: CHART.ink, strokeWidth: 2 }),
          ],
        })
      }
    />
  );
}

function BubbleFigure({ charts }: { charts: AtlasData['charts'] }) {
  const points: Array<{ x: number; y: number; size: number; group: string }> = charts.bubble.points;
  return (
    <PlotFigure
      ariaLabel="Bubble plot of density, vote, and vote count"
      options={width =>
        withBookTheme({
          width,
          height: CHART_H,
          marginLeft: 48,
          marginBottom: 36,
          x: { grid: true, label: 'log population density →' },
          y: { grid: true, label: 'Trump vote (%)' },
          r: { range: [2, 16] },
          color: { domain: Object.keys(REGION_COLORS), range: Object.values(REGION_COLORS), legend: true },
          marks: [
            Plot.dot(points, {
              x: 'x',
              y: 'y',
              r: 'size',
              fill: 'group',
              fillOpacity: 0.35,
              stroke: 'group',
              strokeOpacity: 0.5,
              tip: true,
              title: (d: any) => `${d.group}\ndensity ${d.x} · vote ${d.y}%\nsize ${Math.round(d.size)}`,
            }),
          ],
        })
      }
    />
  );
}

/* === Geography === */

function ChoroplethFigure() {
  return (
    <div className="pb-1">
      <ChoroplethMap
        data={STATE_GROWTH}
        level="states"
        scheme="blues"
        valueLabel="Home-value growth since 2020"
        valueFormat={(v: number) => `${v.toFixed(1)}%`}
        ariaLabel="US choropleth of state home-value growth since 2020"
      />
    </div>
  );
}

/* === Multivariate === */

function CorrelationFigure({ charts }: { charts: AtlasData['charts'] }) {
  const labels: string[] = charts.correlation.labels;
  const cells: Array<{ row: string; col: string; value: number }> = charts.correlation.cells;
  return (
    <PlotFigure
      ariaLabel="Correlation matrix heatmap of county demographics"
      options={width =>
        withBookTheme({
          width,
          height: width,
          marginLeft: 92,
          marginTop: 88,
          marginBottom: 8,
          x: { domain: labels, label: null, tickRotate: -45, axis: 'top' as any },
          y: { domain: labels, label: null },
          color: {
            type: 'linear',
            scheme: 'rdbu',
            domain: [1, -1],
            legend: true,
            label: 'correlation',
          } as PlotOptions['color'],
          marks: [
            Plot.cell(cells, {
              x: 'col',
              y: 'row',
              fill: 'value',
              tip: true,
              title: (d: any) => `${d.row} × ${d.col}\nr = ${d.value.toFixed(2)}`,
            }),
            Plot.text(cells, {
              x: 'col',
              y: 'row',
              text: (d: any) => d.value.toFixed(1),
              fill: (d: any) => (Math.abs(d.value) > 0.6 ? '#fff' : CHART.body),
              fontSize: 9,
            }),
          ],
        })
      }
    />
  );
}

function HeatmapFigure({ charts }: { charts: AtlasData['charts'] }) {
  const states: string[] = charts.heatmap.states;
  const years: string[] = charts.heatmap.years;
  const cells: Array<{ state: string; year: string; change: number }> = charts.heatmap.cells;
  return (
    <PlotFigure
      ariaLabel="Heatmap of annual home-value change by state and year"
      options={width =>
        withBookTheme({
          width,
          height: CHART_H + 10,
          marginLeft: 78,
          marginTop: 28,
          marginBottom: 30,
          x: { domain: years, label: null, axis: 'top' as any },
          y: { domain: states, label: null },
          color: {
            type: 'linear',
            scheme: 'rdylbu',
            domain: [-30, 30],
            reverse: true,
            legend: true,
            label: 'annual change (%)',
          } as PlotOptions['color'],
          marks: [
            Plot.cell(cells, {
              x: 'year',
              y: 'state',
              fill: 'change',
              inset: 0.5,
              tip: true,
              title: (d: any) => `${d.state} ${d.year}\n${d.change > 0 ? '+' : ''}${d.change}%`,
            }),
          ],
        })
      }
    />
  );
}

/* === Uncertainty === */

function IntervalFigure({ charts }: { charts: AtlasData['charts'] }) {
  const rows: Array<{ group: string; mean: number; ci_low: number; ci_high: number; n: number }> = charts.interval.rows;
  return (
    <PlotFigure
      ariaLabel="Interval plot of mean vote share by density decile"
      options={width =>
        withBookTheme({
          width,
          height: CHART_H,
          marginLeft: 44,
          marginBottom: 34,
          x: { label: 'population-density decile →', domain: rows.map(r => r.group) },
          y: { grid: true, label: 'mean Trump vote (%)' },
          marks: [
            Plot.ruleX(rows, { x: 'group', y1: 'ci_low', y2: 'ci_high', stroke: CHART.skyDark, strokeWidth: 2 }),
            Plot.line(rows, { x: 'group', y: 'mean', stroke: CHART.faint, strokeWidth: 1 }),
            Plot.dot(rows, {
              x: 'group',
              y: 'mean',
              fill: CHART.skyDark,
              r: 4,
              tip: true,
              title: (d: any) => `${d.group} (n=${d.n})\nmean ${d.mean}%\n95% CI [${d.ci_low}, ${d.ci_high}]`,
            }),
          ],
        })
      }
    />
  );
}

function CoefficientFigure({ charts }: { charts: AtlasData['charts'] }) {
  const rows: Array<{ label: string; estimate: number; ci_low: number; ci_high: number }> = charts.coefficient.rows;
  const sorted = [...rows].sort((a, b) => a.estimate - b.estimate);
  return (
    <PlotFigure
      ariaLabel="Coefficient plot of standardized county predictors"
      options={width =>
        withBookTheme({
          width,
          height: CHART_H,
          marginLeft: 110,
          marginBottom: 32,
          x: { grid: true, label: 'standardized association (points) →' },
          y: { label: null, domain: sorted.map(r => r.label) },
          marks: [
            Plot.ruleX([0], { stroke: CHART.faint, strokeDasharray: '4 4' }),
            Plot.ruleY(sorted, {
              y: 'label',
              x1: 'ci_low',
              x2: 'ci_high',
              stroke: (d: any) => (d.estimate >= 0 ? CHART.rose : CHART.sky),
              strokeWidth: 2,
            }),
            Plot.dot(sorted, {
              y: 'label',
              x: 'estimate',
              fill: (d: any) => (d.estimate >= 0 ? CHART.rose : CHART.sky),
              r: 4,
              tip: true,
              title: (d: any) => `${d.label}\n${d.estimate >= 0 ? '+' : ''}${d.estimate}\n95% CI [${d.ci_low}, ${d.ci_high}]`,
            }),
          ],
        })
      }
    />
  );
}

/* === Business Bridge === */

function ParetoFigure({ charts }: { charts: AtlasData['charts'] }) {
  const rows: Array<{ category: string; value: number }> = charts.pareto.rows;
  const sorted = [...rows].sort((a, b) => b.value - a.value);
  const total = sorted.reduce((s, r) => s + r.value, 0);
  let running = 0;
  const withCum = sorted.map(r => {
    running += r.value;
    return { ...r, cum: (running / total) * 100 };
  });
  return (
    <PlotFigure
      ariaLabel="Pareto chart of revenue concentration by product family"
      options={width =>
        withBookTheme({
          width,
          height: CHART_H,
          marginLeft: 40,
          marginRight: 44,
          marginBottom: 50,
          x: { label: null, domain: sorted.map(r => r.category), tickRotate: -25 },
          y: { grid: true, label: 'share (%)', domain: [0, 100] },
          marks: [
            Plot.ruleY([80], { stroke: CHART.faint, strokeDasharray: '4 4' }),
            Plot.barY(withCum, {
              x: 'category',
              y: 'value',
              fill: CHART.teal,
              fillOpacity: 0.8,
              tip: true,
              title: (d: any) => `${d.category}\n${d.value}% of total`,
            }),
            Plot.line(withCum, { x: 'category', y: 'cum', stroke: CHART.orange, strokeWidth: 2.5, curve: 'catmull-rom' }),
            Plot.dot(withCum, {
              x: 'category',
              y: 'cum',
              fill: CHART.orange,
              r: 3.5,
              tip: true,
              title: (d: any) => `${d.category}\ncumulative ${d.cum.toFixed(0)}%`,
            }),
          ],
        })
      }
    />
  );
}

function WaterfallFigure({ charts }: { charts: AtlasData['charts'] }) {
  const rows: Array<{ label: string; value: number; kind: string }> = charts.waterfall.rows;
  let cursor = 0;
  const bars = rows.map(r => {
    if (r.kind === 'start') {
      cursor = r.value;
      return { ...r, y1: 0, y2: r.value };
    }
    if (r.kind === 'end') {
      return { ...r, y1: 0, y2: cursor };
    }
    const y1 = cursor;
    cursor += r.value;
    return { ...r, y1, y2: cursor };
  });
  const fillFor = (r: any) =>
    r.kind === 'start' || r.kind === 'end' ? CHART.slate : r.value >= 0 ? CHART.teal : CHART.rose;
  return (
    <PlotFigure
      ariaLabel="Waterfall chart from list price to net revenue"
      options={width =>
        withBookTheme({
          width,
          height: CHART_H,
          marginLeft: 40,
          marginBottom: 50,
          x: { label: null, domain: rows.map(r => r.label), tickRotate: -25 },
          y: { grid: true, label: 'index (list = 100)' },
          marks: [
            Plot.ruleY([0]),
            Plot.barY(bars, {
              x: 'label',
              y1: 'y1',
              y2: 'y2',
              fill: fillFor,
              fillOpacity: 0.85,
              tip: true,
              title: (d: any) =>
                `${d.label}\n${d.kind === 'start' || d.kind === 'end' ? `level ${Math.round(d.y2)}` : `${d.value > 0 ? '+' : ''}${d.value}`}`,
            }),
            Plot.text(bars, {
              x: 'label',
              y: (d: any) => Math.max(d.y1, d.y2),
              text: (d: any) => (d.kind === 'start' || d.kind === 'end' ? `${Math.round(d.y2)}` : `${d.value > 0 ? '+' : ''}${d.value}`),
              dy: -6,
              fontSize: 10,
              fill: CHART.body,
            }),
          ],
        })
      }
    />
  );
}

function TreemapFigure() {
  // Simple slice-and-dice treemap computed inline (Plot has no treemap mark).
  const total = TREE_DATA.reduce((s, r) => s + r.value, 0);
  const W = 100;
  const H = 62;
  // Row-based squarified-lite: pack into rows that fill the width.
  type Tile = { name: string; value: number; x1: number; y1: number; x2: number; y2: number };
  const tiles: Tile[] = [];
  const sorted = [...TREE_DATA].sort((a, b) => b.value - a.value);
  // Two-column layout: big tile left, remainder stacked right (legible at card size).
  const colSplit = 0.56;
  const leftItems = sorted.slice(0, 2);
  const rightItems = sorted.slice(2);
  const leftTotal = leftItems.reduce((s, r) => s + r.value, 0);
  const rightTotal = rightItems.reduce((s, r) => s + r.value, 0);
  let yc = 0;
  for (const it of leftItems) {
    const h = (it.value / leftTotal) * H;
    tiles.push({ name: it.name, value: it.value, x1: 0, y1: yc, x2: W * colSplit, y2: yc + h });
    yc += h;
  }
  yc = 0;
  for (const it of rightItems) {
    const h = (it.value / rightTotal) * H;
    tiles.push({ name: it.name, value: it.value, x1: W * colSplit, y1: yc, x2: W, y2: yc + h });
    yc += h;
  }
  const palette = [CHART.skyDark, CHART.violet, CHART.teal, CHART.orange, CHART.amber, CHART.slate];
  const colorByName = new Map(sorted.map((d, i) => [d.name, palette[i % palette.length]]));
  return (
    <PlotFigure
      ariaLabel="Treemap of revenue share by product family"
      options={width =>
        withBookTheme({
          width,
          height: CHART_H,
          marginLeft: 0,
          marginRight: 0,
          marginTop: 0,
          marginBottom: 0,
          x: { axis: null, domain: [0, W] },
          y: { axis: null, domain: [H, 0] },
          marks: [
            Plot.rect(tiles, {
              x1: 'x1',
              x2: 'x2',
              y1: 'y1',
              y2: 'y2',
              fill: (d: any) => colorByName.get(d.name),
              fillOpacity: 0.88,
              stroke: '#fff',
              strokeWidth: 1.5,
              tip: true,
              title: (d: any) => `${d.name}\n${d.value}% of revenue`,
            }),
            Plot.text(tiles, {
              x: (d: any) => (d.x1 + d.x2) / 2,
              y: (d: any) => (d.y1 + d.y2) / 2,
              text: (d: any) => `${d.name}\n${d.value}%`,
              fill: '#fff',
              fontSize: (d: any) => (d.value >= 13 ? 12 : 10),
              lineHeight: 1.1,
            }),
          ],
        })
      }
    />
  );
}

function FunnelFigure() {
  const top = FUNNEL_DATA[0].value;
  const bars = FUNNEL_DATA.map(d => ({ ...d, half: d.value / 2, share: (d.value / top) * 100 }));
  return (
    <PlotFigure
      ariaLabel="Funnel of the pricing-test pipeline"
      options={width =>
        withBookTheme({
          width,
          height: CHART_H,
          marginLeft: 96,
          marginBottom: 30,
          x: { label: 'stores →', domain: [-top, top], tickFormat: (d: number) => Math.abs(d).toLocaleString() },
          y: { label: null, domain: FUNNEL_DATA.map(d => d.stage) },
          marks: [
            Plot.barX(bars, {
              y: 'stage',
              x1: (d: any) => -d.half,
              x2: (d: any) => d.half,
              fill: CHART.skyDark,
              fillOpacity: 0.85,
              tip: true,
              title: (d: any) => `${d.stage}\n${d.value.toLocaleString()} stores (${d.share.toFixed(0)}% of top)`,
            }),
            Plot.text(bars, {
              y: 'stage',
              x: 0,
              text: (d: any) => `${d.value.toLocaleString()}`,
              fill: '#fff',
              fontSize: 11,
              fontWeight: 600,
            }),
          ],
        })
      }
    />
  );
}

function PieTrapFigure() {
  // Deliberately-bad pie chart, drawn with hand-computed arc paths to make the
  // "hard to compare slices" point. Rendered as inline SVG (not Plot) on purpose.
  const total = PIE_DATA.reduce((s, r) => s + r.value, 0);
  const palette = [CHART.skyDark, CHART.violet, CHART.teal, CHART.orange, CHART.amber, CHART.slate];
  const cx = 130;
  const cy = 130;
  const r = 110;
  let angle = -Math.PI / 2;
  const arcs = PIE_DATA.map((d, i) => {
    const frac = d.value / total;
    const start = angle;
    const end = angle + frac * Math.PI * 2;
    angle = end;
    const x1 = cx + r * Math.cos(start);
    const y1 = cy + r * Math.sin(start);
    const x2 = cx + r * Math.cos(end);
    const y2 = cy + r * Math.sin(end);
    const large = end - start > Math.PI ? 1 : 0;
    const mid = (start + end) / 2;
    const lx = cx + r * 0.62 * Math.cos(mid);
    const ly = cy + r * 0.62 * Math.sin(mid);
    return {
      path: `M ${cx} ${cy} L ${x1.toFixed(1)} ${y1.toFixed(1)} A ${r} ${r} 0 ${large} 1 ${x2.toFixed(1)} ${y2.toFixed(1)} Z`,
      fill: palette[i % palette.length],
      name: d.name,
      value: d.value,
      lx,
      ly,
      showLabel: frac > 0.08,
    };
  });
  return (
    <div>
      <svg viewBox="0 0 260 260" className="mx-auto h-auto w-full max-w-[260px]" role="img" aria-label="Pie chart (anti-pattern)">
        {arcs.map(a => (
          <g key={a.name}>
            <path d={a.path} fill={a.fill} fillOpacity={0.88} stroke="#fff" strokeWidth={1.5}>
              <title>{`${a.name}: ${a.value}%`}</title>
            </path>
            {a.showLabel && (
              <text x={a.lx} y={a.ly} textAnchor="middle" fontSize={11} fill="#fff" fontWeight={600}>
                {a.value}%
              </text>
            )}
          </g>
        ))}
      </svg>
      <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-slate-600">
        {PIE_DATA.map((d, i) => (
          <span key={d.name} className="inline-flex items-center gap-1">
            <span className="inline-block h-2 w-2 rounded-sm" style={{ background: palette[i % palette.length] }} />
            {d.name}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Card registry                                                       */
/* ------------------------------------------------------------------ */

type ExtraCard = AtlasCard & { badge?: string };

/** Render the visual for a card by id (existing ids reuse atlas data). */
function ChartVisual({ id, charts }: { id: string; charts: AtlasData['charts'] }) {
  switch (id) {
    // existing forms
    case 'histogram':
      return <HistogramFigure charts={charts} />;
    case 'density':
      return <DistributionToggleFigure charts={charts} />;
    case 'boxplot':
      return <BoxplotFigure charts={charts} />;
    case 'bar':
      return <BarFigure charts={charts} />;
    case 'dot':
      return <LollipopFigure charts={charts} />;
    case 'line':
      return <LineToggleFigure charts={charts} />;
    case 'indexedLine':
      return <LineToggleFigure charts={charts} />;
    case 'smallMultiples':
      return <SmallMultiplesFigure charts={charts} />;
    case 'scatter':
      return <ScatterFigure charts={charts} />;
    case 'bubble':
      return <BubbleFigure charts={charts} />;
    case 'tileMap':
      return <ChoroplethFigure />;
    case 'correlation':
      return <CorrelationFigure charts={charts} />;
    case 'heatmap':
      return <HeatmapFigure charts={charts} />;
    case 'interval':
      return <IntervalFigure charts={charts} />;
    case 'coefficient':
      return <CoefficientFigure charts={charts} />;
    case 'pareto':
      return <ParetoFigure charts={charts} />;
    case 'waterfall':
      return <WaterfallFigure charts={charts} />;
    // added forms
    case 'strip':
      return <StripFigure />;
    case 'lollipop':
      return <LollipopFigure charts={charts} />;
    case 'stackedBar':
      return <StackedBarToggleFigure />;
    case 'groupedBar':
      return <GroupedBarFigure />;
    case 'slopegraph':
      return <SlopegraphFigure />;
    case 'area':
      return <AreaToggleFigure charts={charts} />;
    case 'choropleth':
      return <ChoroplethFigure />;
    case 'treemap':
      return <TreemapFigure />;
    case 'funnel':
      return <FunnelFigure />;
    case 'pie':
      return <PieTrapFigure />;
    default:
      return null;
  }
}

/** Extra cards added to round out a complete viz reference. */
const EXTRA_CARDS: ExtraCard[] = [
  {
    id: 'strip',
    family: 'Distribution',
    title: 'Strip / Jitter Plot',
    useWhen: 'Show every observation when the distribution itself is the point and groups are few.',
    managerQuestion: 'How spread out are store-month volumes within each region, not just the average?',
    avoid: 'Do not jitter thousands of points into an ink-blob; sample or switch to a box plot at scale.',
    caseExample: 'Soup: a regional sample of store-month volume, one dot per store-month.',
    finding: 'Western store-months spread widest and carry the longest right tail; the Northeast is tighter.',
    dataSource: 'Soup',
    badge: 'Illustrative',
  },
  {
    id: 'stackedBar',
    family: 'Comparison',
    title: 'Stacked & 100% Bar',
    useWhen: 'Show part-to-whole composition across a few ordered groups.',
    managerQuestion: 'Does the soup category mix shift across quarters, in units or in share?',
    avoid: 'Do not stack many categories; only the bottom segment is easy to compare across bars.',
    caseExample: 'Soup: category units by quarter, toggled between absolute and 100% share.',
    finding: 'Core soups dominate every quarter, but premium and broth share rises noticeably in Q4.',
    dataSource: 'Soup',
    badge: 'Illustrative',
  },
  {
    id: 'groupedBar',
    family: 'Comparison',
    title: 'Grouped Bar Chart',
    useWhen: 'Compare a few categories within each group side by side.',
    managerQuestion: 'How do core, premium, and broth units compare within each quarter?',
    avoid: 'Do not group so many series that bars become too thin to read.',
    caseExample: 'Soup: the same quarterly category data shown as clustered bars instead of stacked.',
    finding: 'Side-by-side bars make Q4 the clear peak for every category, which stacking can hide.',
    dataSource: 'Soup',
    badge: 'Illustrative',
  },
  {
    id: 'slopegraph',
    family: 'Comparison',
    title: 'Slopegraph',
    useWhen: 'Compare two points in time across categories and emphasize who moved.',
    managerQuestion: 'Which regions shifted between the two elections, and in which direction?',
    avoid: 'Do not use it for more than two time points; it stops being a slope.',
    caseExample: 'County: average regional vote share in two elections, connected by a line per region.',
    finding: 'Most regions edged up, but the East slipped slightly — a divergence a bar chart buries.',
    dataSource: 'County',
    badge: 'Illustrative',
  },
  {
    id: 'area',
    family: 'Time',
    title: 'Area / Stacked Area',
    useWhen: 'Emphasize magnitude over time, or composition over time when totals matter.',
    managerQuestion: 'How large did each state market get, and how do they sum over time?',
    avoid: 'Do not stack area when readers need each series read precisely; only the bottom is honest.',
    caseExample: 'Zillow: California alone as a filled area, then four states stacked.',
    finding: 'The stacked view shows the combined four-state market roughly tripling since 2000.',
    dataSource: 'Zillow',
    badge: 'Illustrative',
  },
  {
    id: 'choropleth',
    family: 'Geography',
    title: 'True Choropleth Map',
    useWhen: 'Location is part of the decision and the geographic shape itself carries meaning.',
    managerQuestion: 'Where did home values grow fastest since 2020, on a real US map?',
    avoid: 'Do not map raw counts on a choropleth; area distorts them — map rates or changes.',
    caseExample: 'Zillow: state home-value growth since 2020 on an albers-usa projection.',
    finding: 'Growth concentrates across the Midwest and Southeast, not the highest-priced coasts.',
    dataSource: 'Zillow',
    badge: 'Illustrative',
  },
  {
    id: 'treemap',
    family: 'Multivariate',
    title: 'Treemap',
    useWhen: 'Show part-to-whole for many categories where rank and rough share matter.',
    managerQuestion: 'How is revenue split across product families at a glance?',
    avoid: 'Do not expect precise comparisons; area is read far less accurately than length.',
    caseExample: 'Teaching data: revenue share across six product families as nested rectangles.',
    finding: 'Core and premium soups fill two-thirds of the canvas; the long tail is visibly small.',
    dataSource: 'Teaching',
    badge: 'Illustrative',
  },
  {
    id: 'funnel',
    family: 'Business Bridge',
    title: 'Funnel Chart',
    useWhen: 'Show sequential drop-off through an ordered pipeline.',
    managerQuestion: 'Where does the pricing-test pipeline lose the most stores?',
    avoid: 'Do not use a funnel for non-sequential categories; the narrowing implies an order.',
    caseExample: 'Teaching data: stores moving from review to a confirmed price rollout.',
    finding: 'The biggest drop is from price-eligible to test-launched — roughly half are filtered out there.',
    dataSource: 'Teaching',
    badge: 'Illustrative',
  },
  {
    id: 'pie',
    family: 'Business Bridge',
    title: 'Pie Chart (Trap exemplar)',
    useWhen: 'Almost never for analysis; at most a single two-to-three slice part-to-whole.',
    managerQuestion: 'Which product family is biggest — and can you rank the rest by eye?',
    avoid: 'Do not ask readers to compare angles; rank and small differences are nearly unreadable.',
    caseExample: 'Teaching data: the same revenue mix as the treemap, shown as six pie slices.',
    finding: 'Try to order Broths, Seasonal, and Other by eye — the pie makes it a guess; a bar would not.',
    dataSource: 'Teaching',
    badge: 'Anti-pattern',
  },
];

/* ------------------------------------------------------------------ */
/* Main component (same export, same props)                            */
/* ------------------------------------------------------------------ */

export function ChartAtlas({ data }: { data: AtlasData }) {
  const allCards: ExtraCard[] = React.useMemo(() => [...data.cards, ...EXTRA_CARDS], [data.cards]);
  const families = FAMILY_ORDER.filter(f => allCards.some(c => c.family === f));

  const [activeFamily, setActiveFamily] = React.useState<string | null>(null);
  const [query, setQuery] = React.useState('');

  // Search across every field a reader might type: the chart name, the family,
  // and — most usefully — the manager question and the "use when" line, so
  // typing "over time" or "drop-off" lands on the right form. Matched
  // token-by-token rather than as one phrase, so word order and intervening
  // words ("composition over time") don't cost the reader a hit.
  const matches = React.useMemo(() => {
    const tokens = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
    return allCards.filter(card => {
      if (activeFamily && card.family !== activeFamily) return false;
      if (!tokens.length) return true;
      const haystack = [
        card.title,
        card.family,
        card.useWhen,
        card.managerQuestion,
        card.caseExample,
        card.avoid,
        card.finding,
        SEARCH_TERMS[card.id] ?? '',
      ]
        .join(' ')
        .toLowerCase();
      return tokens.every(t => haystack.includes(t));
    });
  }, [allCards, activeFamily, query]);

  const visibleFamilies = families.filter(f => matches.some(c => c.family === f));
  const isFiltered = Boolean(activeFamily) || query.trim().length > 0;

  const metrics = [
    {
      label: 'Soup panel',
      value: `${data.metadata.soup_rows.toLocaleString()} rows`,
      detail: `${data.metadata.soup_stores.toLocaleString()} stores, ${data.metadata.soup_date_range}`,
    },
    {
      label: 'County cross-section',
      value: `${data.metadata.county_rows.toLocaleString()} counties`,
      detail: 'Demographics, votes, density, region, and state geography',
    },
    {
      label: 'Zillow time series',
      value: `${data.metadata.zillow_states.toLocaleString()} states`,
      detail: data.metadata.zillow_date_range,
    },
    {
      label: 'Atlas scope',
      value: `${allCards.length} chart forms`,
      detail: `${families.length} evidence families, several interactive`,
    },
  ];

  return (
    <div className="space-y-8">
      <div className="rounded-md border border-slate-200 bg-slate-950 p-5 text-white shadow-sm dark:border-slate-700 dark:shadow-none">
        <div className="grid gap-4 lg:grid-cols-[1.3fr_2fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-300">How to read the atlas</p>
            <h3 className="mt-1 text-xl font-semibold">Start from the comparison, then choose the chart.</h3>
            <p className="mt-3 text-sm leading-relaxed text-slate-300">
              Each card moves from business question to visual form to misuse risk. Charts are live: hover for values,
              and where two forms answer the same question, toggle between them. Filter by family or search the
              questions below, and follow a card&rsquo;s link when a form gets a full treatment elsewhere in Part II.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {metrics.map(metric => (
              <div key={metric.label} className="rounded-md border border-white/10 bg-white/5 p-3">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{metric.label}</p>
                <p className="mt-1 text-base font-semibold text-white">{metric.value}</p>
                <p className="mt-1 text-xs leading-snug text-slate-300">{metric.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        {data.sourceNotes.map(note => (
          <div
            key={note.case}
            className="rounded-md border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800/40 dark:shadow-none"
          >
            <p className="text-sm font-semibold" style={{ color: SOURCE_COLORS[note.case] ?? CHART.ink }}>
              {note.case}
            </p>
            <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-400">{note.role}</p>
          </div>
        ))}
      </div>

      {/* Filter bar — the atlas is a reference, so it needs a way in other than
          scrolling 26 cards. Sticks under the reading header while browsing. */}
      <div className="sticky top-2 z-20 rounded-md border border-slate-200 bg-white/95 p-3 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-900/95 dark:shadow-none">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveFamily(null)}
            aria-pressed={activeFamily === null}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              activeFamily === null
                ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
            }`}
          >
            All forms
          </button>
          {families.map(family => (
            <button
              key={family}
              type="button"
              onClick={() => setActiveFamily(activeFamily === family ? null : family)}
              aria-pressed={activeFamily === family}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                activeFamily === family
                  ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
              }`}
            >
              {family}
            </button>
          ))}
          <div className="ml-auto flex items-center gap-2">
            <label htmlFor="atlas-search" className="sr-only">
              Search the atlas by chart name or business question
            </label>
            <input
              id="atlas-search"
              type="search"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search a question — “over time”, “drop-off”…"
              className="w-56 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-800 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:placeholder:text-slate-500"
            />
            <span className="whitespace-nowrap text-xs text-slate-500 dark:text-slate-400">
              {matches.length} of {allCards.length}
            </span>
          </div>
        </div>
      </div>

      {matches.length === 0 && (
        <p className="rounded-md border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
          No chart form matches “{query}”. Try the comparison instead of the chart name — “composition”, “ranking”,
          “growth”, “spread”.
        </p>
      )}

      {visibleFamilies.map(family => {
        const cards = matches.filter(c => c.family === family);
        return (
          <section key={family} id={`family-${family.toLowerCase().replace(/\s+/g, '-')}`} className="scroll-mt-24">
            <div className="mb-3 flex items-end justify-between gap-3 border-b border-slate-200 pb-2 dark:border-slate-700">
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-700 dark:text-slate-300">
                  {family}
                </h3>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{FAMILY_NOTES[family]}</p>
              </div>
              <p className="whitespace-nowrap text-xs text-slate-500 dark:text-slate-400">
                {cards.length} chart{cards.length === 1 ? '' : 's'}
                {isFiltered ? ' shown' : ''}
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {cards.map(card => (
                <CardShell
                  key={card.id}
                  id={card.id}
                  family={card.family}
                  title={card.title}
                  source={card.dataSource}
                  badge={card.badge}
                  finding={card.finding}
                  useWhen={card.useWhen}
                  managerQuestion={card.managerQuestion}
                  avoid={card.avoid}
                  caseExample={card.caseExample}
                >
                  <ChartVisual id={card.id} charts={data.charts} />
                </CardShell>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

export default ChartAtlas;
