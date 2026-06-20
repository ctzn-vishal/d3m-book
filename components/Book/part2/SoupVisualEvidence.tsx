'use client';

import * as React from 'react';
import * as Plot from '@observablehq/plot';
import { PlotFigure } from '@/components/Book/charts/PlotFigure';
import { ChoroplethMap } from '@/components/Book/charts/ChoroplethMap';
import { withBookTheme, CHART, CATEGORICAL } from '@/lib/chart-theme';

type PlotOptions = NonNullable<Parameters<typeof Plot.plot>[0]>;

// ---------------------------------------------------------------------------
// Shared types (unchanged shapes — the article JSON drives these)
// ---------------------------------------------------------------------------

type MonthPoint = {
  month: number;
  month_name: string;
  progresso_volume?: number;
  progresso_volume_index_jan?: number;
  progresso_price?: number;
  progresso_price_index_jan?: number;
  progresso_share?: number;
  progresso_share_index_jan?: number;
  campbell_price?: number;
  campbell_price_index_jan?: number;
  active_stores?: number;
};

type RegionMonthPoint = {
  region: string;
  month: number;
  month_name: string;
  progresso_price: number;
  progresso_share: number;
  progresso_volume?: number;
  total_volume?: number;
  active_stores: number;
};

type ScatterPoint = {
  region: string;
  season: string;
  log_price: number;
  log_volume: number;
};

type Coefficient = {
  group: string;
  model?: string;
  estimate: number;
  ci_low: number;
  ci_high: number;
  r2?: number;
  n?: number;
};

type TrendLine = {
  group: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  slope: number;
};

type IntervalPoint = {
  month?: number;
  month_name?: string;
  region?: string;
  season?: string;
  mean: number;
  ci_low: number;
  ci_high: number;
  n: number;
  stores?: number;
  active_stores?: number;
};

const REGION_ORDER = ['East', 'Midwest', 'South', 'West'];
const REGION_COLORS: Record<string, string> = {
  East: CHART.sky,
  Midwest: CHART.violet,
  South: CHART.emerald,
  West: CHART.rose,
};

const SEASON_COLORS: Record<string, string> = {
  Winter: CHART.skyDark,
  'Non-winter': CHART.orange,
};

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const monthName = (month: number) => MONTH_NAMES[month - 1] ?? String(month);

const fmtPct = (value: number) => `${Math.round(value * 100)}%`;
const fmtPct1 = (value: number) => `${(value * 100).toFixed(1)}%`;
const fmtMoney = (value: number) => `$${value.toFixed(2)}`;
const fmtCoef = (value: number) => value.toFixed(2);
const fmtCount = (value: number) =>
  value >= 1000 ? `${(value / 1000).toLocaleString(undefined, { maximumFractionDigits: 1 })}k` : value.toLocaleString();

/** Ordinary least squares slope of y on x. */
function olsSlope(points: Array<{ x: number; y: number }>): number | undefined {
  if (points.length < 2) return undefined;
  const xMean = points.reduce((s, p) => s + p.x, 0) / points.length;
  const yMean = points.reduce((s, p) => s + p.y, 0) / points.length;
  const denom = points.reduce((s, p) => s + (p.x - xMean) ** 2, 0);
  if (!Number.isFinite(denom) || denom === 0) return undefined;
  const num = points.reduce((s, p) => s + (p.x - xMean) * (p.y - yMean), 0);
  return num / denom;
}

function fittedTrendLine(group: string, points: ScatterPoint[]): TrendLine | undefined {
  const xy = points.map(p => ({ x: p.log_price, y: p.log_volume }));
  const slope = olsSlope(xy);
  if (slope === undefined) return undefined;
  const xMean = xy.reduce((s, p) => s + p.x, 0) / xy.length;
  const yMean = xy.reduce((s, p) => s + p.y, 0) / xy.length;
  const intercept = yMean - slope * xMean;
  const xs = points.map(p => p.log_price);
  const x1 = Math.min(...xs);
  const x2 = Math.max(...xs);
  return { group, x1, y1: intercept + slope * x1, x2, y2: intercept + slope * x2, slope };
}

// ---------------------------------------------------------------------------
// Small presentational helpers
// ---------------------------------------------------------------------------

function ChartFrame({
  title,
  subtitle,
  right,
  children,
}: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
          {subtitle && <p className="mt-1 text-xs leading-snug text-slate-500">{subtitle}</p>}
        </div>
        {right}
      </div>
      {children}
    </div>
  );
}

function SegmentedControl<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label?: string;
  value: T;
  options: Array<{ value: T; label: string }>;
  onChange: (value: T) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {label && <span className="text-[11px] font-medium uppercase tracking-wide text-slate-400">{label}</span>}
      <div className="inline-flex rounded-md border border-slate-200 bg-slate-50 p-0.5">
        {options.map(option => {
          const active = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              aria-pressed={active}
              className={`rounded px-2.5 py-1 text-xs font-medium transition-colors ${
                active ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ===========================================================================
// 1. SoupBaselineChart — re-indexable baseline + absolute-level companion
// ===========================================================================

type BaselineKey = 'jan' | 'jun' | 'prior' | 'campbell';

const BASELINE_OPTIONS: Array<{ value: BaselineKey; label: string }> = [
  { value: 'jan', label: 'January' },
  { value: 'jun', label: 'June' },
  { value: 'prior', label: 'Annual avg' },
  { value: 'campbell', label: 'vs Campbell' },
];

const BASELINE_HINT: Record<BaselineKey, string> = {
  jan: 'January = 100. How far does the year move away from the winter level?',
  jun: 'June = 100. Emphasizes the recovery out of the summer trough.',
  prior: 'Annual average = 100. Shows each month relative to the typical month.',
  campbell: 'Progresso price ÷ Campbell price, indexed to January. Does Progresso move differently from its rival?',
};

export function SoupBaselineChart({
  data,
}: {
  data: { monthSeasonality: MonthPoint[]; seasonSummary: Array<Record<string, number | string>> };
}) {
  const [baseline, setBaseline] = React.useState<BaselineKey>('jan');

  const months = React.useMemo(
    () => [...data.monthSeasonality].sort((a, b) => a.month - b.month),
    [data.monthSeasonality],
  );

  // Re-index every series against the chosen baseline. "campbell" re-indexes the
  // Progresso/Campbell price RATIO so it answers a competitive question.
  const indexed = React.useMemo(() => {
    const baseRow =
      baseline === 'jun' ? months.find(m => m.month === 6) : months.find(m => m.month === 1);

    const series: Array<{ key: 'volume' | 'share' | 'price'; field: keyof MonthPoint; label: string }> = [
      { key: 'volume', field: 'progresso_volume', label: 'Volume' },
      { key: 'share', field: 'progresso_share', label: 'Share' },
      { key: 'price', field: 'progresso_price', label: 'Price' },
    ];

    const rows: Array<{ month: number; month_name: string; series: string; index: number; raw: number; unit: string }> = [];

    if (baseline === 'campbell') {
      // Single competitive series: Progresso price relative to Campbell price.
      const ratio = (m: MonthPoint) => (m.progresso_price ?? 0) / (m.campbell_price ?? 1);
      const base = ratio(months.find(r => r.month === 1) ?? months[0]) || 1;
      for (const m of months) {
        rows.push({
          month: m.month,
          month_name: m.month_name,
          series: 'Price vs Campbell',
          index: (ratio(m) / base) * 100,
          raw: ratio(m),
          unit: 'ratio',
        });
      }
      return rows;
    }

    for (const s of series) {
      const denom =
        baseline === 'prior'
          ? months.reduce((sum, m) => sum + Number(m[s.field] ?? 0), 0) / months.length
          : Number((baseRow ?? months[0])[s.field] ?? 1);
      const base = denom || 1;
      for (const m of months) {
        const raw = Number(m[s.field] ?? 0);
        rows.push({
          month: m.month,
          month_name: m.month_name,
          series: s.label,
          index: (raw / base) * 100,
          raw,
          unit: s.key === 'price' ? 'usd' : s.key === 'share' ? 'pct' : 'vol',
        });
      }
    }
    return rows;
  }, [months, baseline]);

  const seriesNames = React.useMemo(
    () => Array.from(new Set(indexed.map(d => d.series))),
    [indexed],
  );

  const colorRange = baseline === 'campbell' ? [CHART.orange] : [CHART.skyDark, CHART.sky, CHART.orange];

  const indexOptions = React.useCallback(
    (width: number): PlotOptions =>
      withBookTheme({
        width,
        height: 300,
        marginLeft: 48,
        marginRight: 90,
        marginBottom: 36,
        x: { domain: MONTH_NAMES, label: null, tickSize: 0 },
        y: {
          grid: true,
          label: baseline === 'campbell' ? 'Price ratio, Jan = 100' : `Index, ${baseline === 'jun' ? 'Jun' : baseline === 'prior' ? 'avg' : 'Jan'} = 100`,
        },
        color: { domain: seriesNames, range: colorRange, legend: true },
        marks: [
          Plot.ruleY([100], { stroke: CHART.faint, strokeDasharray: '4 4' }),
          Plot.lineY(indexed, {
            x: d => monthName(d.month),
            y: 'index',
            z: 'series',
            stroke: 'series',
            strokeWidth: 2.5,
            curve: 'catmull-rom',
          }),
          Plot.dot(indexed, {
            x: d => monthName(d.month),
            y: 'index',
            fill: 'series',
            r: 3.2,
            tip: true,
            title: d => {
              const rawStr =
                d.unit === 'usd'
                  ? fmtMoney(d.raw)
                  : d.unit === 'pct'
                    ? fmtPct1(d.raw)
                    : d.unit === 'ratio'
                      ? d.raw.toFixed(3)
                      : d.raw.toLocaleString(undefined, { maximumFractionDigits: 0 });
              return `${d.month_name} · ${d.series}\nindex ${Math.round(d.index)}\nlevel ${rawStr}`;
            },
          }),
          Plot.text(
            indexed.filter(d => d.month === 12),
            {
              x: () => monthName(12),
              y: 'index',
              text: 'series',
              fill: 'series',
              dx: 10,
              textAnchor: 'start',
              fontSize: 11,
              fontWeight: 600,
            },
          ),
        ],
      }),
    [indexed, seriesNames, baseline, colorRange],
  );

  // Companion ABSOLUTE-LEVEL panel — the article preaches pairing an index with
  // real levels so a small mover is not mistaken for a large one. Two y-axes are
  // avoided by showing the two volume series Progresso owns in real units (share
  // %, and volume in millions of units) as a faceted small panel.
  const absRows = React.useMemo(
    () =>
      months.flatMap(m => [
        { month: m.month, month_name: m.month_name, metric: 'Volume (M units)', value: (m.progresso_volume ?? 0) / 1e6, fmt: 'vol' as const },
        { month: m.month, month_name: m.month_name, metric: 'Share', value: m.progresso_share ?? 0, fmt: 'pct' as const },
        { month: m.month, month_name: m.month_name, metric: 'Price (USD)', value: m.progresso_price ?? 0, fmt: 'usd' as const },
      ]),
    [months],
  );

  const absOptions = React.useCallback(
    (width: number): PlotOptions =>
      withBookTheme({
        width,
        height: 230,
        marginLeft: 44,
        marginBottom: 28,
        fx: { label: null },
        x: { domain: MONTH_NAMES, label: null, ticks: ['Jan', 'Apr', 'Jul', 'Oct'], tickSize: 0 },
        y: { grid: true, label: null },
        marks: [
          Plot.barY(absRows, {
            fx: 'metric',
            x: d => monthName(d.month),
            y: 'value',
            fill: d => (d.metric === 'Price (USD)' ? CHART.orange : d.metric === 'Share' ? CHART.sky : CHART.skyDark),
            tip: true,
            title: d =>
              `${d.month_name} · ${d.metric}\n${
                d.fmt === 'usd' ? fmtMoney(d.value) : d.fmt === 'pct' ? fmtPct1(d.value) : `${d.value.toFixed(1)}M units`
              }`,
          }),
        ],
      }),
    [absRows],
  );

  return (
    <div className="space-y-4">
      <ChartFrame
        title="Demand falls before price does"
        subtitle={BASELINE_HINT[baseline]}
        right={<SegmentedControl label="Baseline" value={baseline} options={BASELINE_OPTIONS} onChange={setBaseline} />}
      >
        <PlotFigure
          ariaLabel="Indexed Progresso volume, share, and price across the year against a selectable baseline."
          options={indexOptions}
        />
      </ChartFrame>

      <ChartFrame
        title="Pair the index with absolute levels"
        subtitle="The index above flattens scale on purpose. These bars keep the real units so a small mover is not mistaken for a large one."
      >
        <PlotFigure
          ariaLabel="Absolute monthly Progresso volume, share, and price in real units."
          options={absOptions}
        />
      </ChartFrame>

      <div className="grid gap-3 sm:grid-cols-2">
        {data.seasonSummary.map(season => (
          <div key={String(season.soup_season)} className="rounded-md border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">{String(season.soup_season)}</p>
            <div className="mt-2 grid grid-cols-3 gap-3 text-sm">
              <div>
                <p className="text-lg font-semibold text-slate-900">{fmtMoney(Number(season.progresso_price))}</p>
                <p className="text-xs text-slate-500">avg price</p>
              </div>
              <div>
                <p className="text-lg font-semibold text-slate-900">{fmtPct(Number(season.progresso_share))}</p>
                <p className="text-xs text-slate-500">share</p>
              </div>
              <div>
                <p className="text-lg font-semibold text-slate-900">{Number(season.stores).toLocaleString()}</p>
                <p className="text-xs text-slate-500">stores</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ===========================================================================
// 2. SoupRegionSmallMultiples — Plot faceting on a shared scale
// ===========================================================================

type SmallMultMetric = 'progresso_share' | 'progresso_price';

export function SoupRegionSmallMultiples({ data }: { data: { regionMonth: RegionMonthPoint[] } }) {
  const [metric, setMetric] = React.useState<SmallMultMetric>('progresso_share');

  const rows = React.useMemo(
    () => [...data.regionMonth].sort((a, b) => a.month - b.month),
    [data.regionMonth],
  );

  // Fit one slope per region (metric vs month) so each panel can print it. A
  // positive share slope means the region builds share through the year.
  const slopes = React.useMemo(() => {
    const out: Record<string, number> = {};
    for (const region of REGION_ORDER) {
      const regionRows = rows.filter(d => d.region === region);
      const s = olsSlope(regionRows.map(d => ({ x: d.month, y: Number(d[metric]) })));
      if (s !== undefined) out[region] = s;
    }
    return out;
  }, [rows, metric]);

  const slopeLabels = React.useMemo(
    () =>
      REGION_ORDER.filter(r => slopes[r] !== undefined).map(region => ({
        region,
        text:
          metric === 'progresso_price'
            ? `slope ${slopes[region] >= 0 ? '+' : ''}${(slopes[region] * 100).toFixed(1)}¢/mo`
            : `slope ${slopes[region] >= 0 ? '+' : ''}${(slopes[region] * 100).toFixed(2)} pp/mo`,
      })),
    [slopes, metric],
  );

  const valueLabel = metric === 'progresso_price' ? 'Progresso price' : 'Progresso share';
  const fmt = metric === 'progresso_price' ? fmtMoney : fmtPct1;

  const options = React.useCallback(
    (width: number): PlotOptions =>
      withBookTheme({
        width,
        height: 360,
        marginLeft: 48,
        marginBottom: 34,
        // Faceting → clean small multiples on a SHARED y-scale (the article's
        // whole point: only the data varies across panels).
        fx: { label: null },
        fy: { label: null },
        x: { domain: MONTH_NAMES, label: null, ticks: ['Jan', 'Apr', 'Jul', 'Oct'], tickSize: 0 },
        y: { grid: true, label: valueLabel, tickFormat: metric === 'progresso_price' ? (d: number) => `$${d.toFixed(1)}` : (d: number) => fmtPct(d) },
        marks: [
          Plot.frame({ stroke: CHART.grid }),
          Plot.areaY(rows, {
            fx: 'region',
            x: d => monthName(d.month),
            y: metric,
            fill: d => REGION_COLORS[d.region],
            fillOpacity: 0.1,
            curve: 'catmull-rom',
          }),
          Plot.lineY(rows, {
            fx: 'region',
            x: d => monthName(d.month),
            y: metric,
            stroke: d => REGION_COLORS[d.region],
            strokeWidth: 2.5,
            curve: 'catmull-rom',
          }),
          Plot.dot(rows, {
            fx: 'region',
            x: d => monthName(d.month),
            y: metric,
            fill: d => REGION_COLORS[d.region],
            r: 2.5,
            tip: true,
            title: d => `${d.region} · ${d.month_name}\n${valueLabel}: ${fmt(Number(d[metric]))}\nactive stores: ${d.active_stores.toLocaleString()}`,
          }),
          // Fitted slope printed on each panel face.
          Plot.text(slopeLabels, {
            fx: 'region',
            frameAnchor: 'top-left',
            dx: 6,
            dy: 6,
            text: 'text',
            fill: CHART.body,
            fontSize: 10,
            fontWeight: 600,
          }),
        ],
      }),
    [rows, metric, valueLabel, fmt, slopeLabels],
  );

  return (
    <ChartFrame
      title="Same-scale small multiples make regional levels comparable"
      subtitle={
        metric === 'progresso_share'
          ? 'Metric-major layout: every panel shares one share axis, so the East’s much higher Progresso share is obvious — a level difference a national average would hide.'
          : 'Every panel shares one price axis. The countercyclical price rise is broad, but the West prices highest.'
      }
      right={
        <SegmentedControl
          label="Metric"
          value={metric}
          options={[
            { value: 'progresso_share', label: 'Share' },
            { value: 'progresso_price', label: 'Price' },
          ]}
          onChange={setMetric}
        />
      }
    >
      <PlotFigure
        ariaLabel={`Faceted ${valueLabel} by census region across the year on a shared scale.`}
        options={options}
      />
    </ChartFrame>
  );
}

// ===========================================================================
// 3. SoupElasticityScatter — scatter + OLS line + slope on the panel face
// ===========================================================================

export function SoupElasticityScatter({
  data,
  groupBy = 'region',
}: {
  data: {
    scatterSample: ScatterPoint[];
    trendLines?: TrendLine[];
    regionCoefficients?: Coefficient[];
    seasonCoefficients?: Coefficient[];
  };
  groupBy?: 'region' | 'season';
}) {
  const groups = groupBy === 'region' ? REGION_ORDER : ['Winter', 'Non-winter'];
  const points = React.useMemo(() => data.scatterSample ?? [], [data.scatterSample]);
  const colorOf = (g: string) => (groupBy === 'region' ? REGION_COLORS[g] : SEASON_COLORS[g]);

  const groupKey = (d: ScatterPoint) => (groupBy === 'region' ? d.region : d.season);

  const coefs = React.useMemo(
    () => (groupBy === 'region' ? data.regionCoefficients ?? [] : data.seasonCoefficients ?? []),
    [groupBy, data.regionCoefficients, data.seasonCoefficients],
  );

  // One OLS trend line per facet. Prefer the precomputed trendLines (which match
  // the published month-adjusted slopes) and fall back to a fresh fit.
  const trendLines = React.useMemo(() => {
    return groups
      .map(g => {
        const fromData = data.trendLines?.find(t => t.group === g);
        if (fromData) return fromData;
        return fittedTrendLine(g, points.filter(p => groupKey(p) === g));
      })
      .filter((t): t is TrendLine => Boolean(t));
  }, [groups, points, data.trendLines, groupBy]);

  const slopeLabels = React.useMemo(
    () =>
      groups
        .map(g => {
          const coef = coefs.find(c => c.group === g);
          const tl = trendLines.find(t => t.group === g);
          const slope = coef?.estimate ?? tl?.slope;
          if (slope === undefined) return null;
          return { group: g, text: `slope ${fmtCoef(slope)}` };
        })
        .filter((d): d is { group: string; text: string } => Boolean(d)),
    [groups, coefs, trendLines],
  );

  const options = React.useCallback(
    (width: number): PlotOptions =>
      withBookTheme({
        width,
        height: 340,
        marginLeft: 48,
        marginBottom: 38,
        fx: { label: null, domain: groups },
        x: { grid: true, label: 'log Progresso price', labelAnchor: 'center' },
        y: { grid: true, label: 'log Progresso volume' },
        marks: [
          Plot.frame({ stroke: CHART.grid }),
          // Reduce overplotting: low-opacity small dots with hover tips.
          Plot.dot(points, {
            fx: groupKey,
            x: 'log_price',
            y: 'log_volume',
            fill: d => colorOf(groupKey(d)),
            r: 1.8,
            fillOpacity: 0.18,
            tip: true,
            title: d => `${groupKey(d)}\nlog price ${d.log_price.toFixed(2)} · log vol ${d.log_volume.toFixed(2)}`,
          }),
          // OLS trend line drawn per facet.
          Plot.link(trendLines, {
            fx: 'group',
            x1: 'x1',
            y1: 'y1',
            x2: 'x2',
            y2: 'y2',
            stroke: d => colorOf(d.group),
            strokeWidth: 2.5,
          }),
          // Slope labeled on the panel face.
          Plot.text(slopeLabels, {
            fx: 'group',
            frameAnchor: 'top-right',
            dx: -8,
            dy: 8,
            text: 'text',
            fill: d => colorOf(d.group),
            fontSize: 11,
            fontWeight: 600,
          }),
        ],
      }),
    [points, groups, trendLines, slopeLabels, groupBy],
  );

  return (
    <ChartFrame
      title={groupBy === 'region' ? 'Log price–volume slope by region' : 'Log price–volume slope by season'}
      subtitle="A downward log-log slope previews price elasticity. The fitted line and slope are descriptive, not yet causal."
    >
      <PlotFigure
        ariaLabel={`Faceted log price versus log volume scatter with OLS trend lines, grouped by ${groupBy}.`}
        options={options}
      />
    </ChartFrame>
  );
}

// ===========================================================================
// 4. SoupUncertaintyIntervals — dot-and-whisker, dot SIZED by coverage
// ===========================================================================

export function SoupUncertaintyIntervals({
  data,
}: {
  data: {
    monthlyShareIntervals: IntervalPoint[];
    regionSeasonIntervals: IntervalPoint[];
    coverage: Array<{ ym: string; active_stores: number }>;
  };
}) {
  const months = React.useMemo(
    () => [...data.monthlyShareIntervals].sort((a, b) => Number(a.month) - Number(b.month)),
    [data.monthlyShareIntervals],
  );

  // Each monthly point carries its store count (coverage). The article's whole
  // point: size the mean dot by active stores so the reader sees that a December
  // estimate rests on more coverage than a thin summer month.
  const coverageOf = React.useCallback(
    (month?: number) => {
      const row = months.find(m => m.month === month);
      return row?.n ?? row?.stores ?? row?.active_stores ?? 0;
    },
    [months],
  );

  const coverageExtent: [number, number] = React.useMemo(() => {
    const counts = months.map(m => coverageOf(m.month));
    return [Math.min(...counts), Math.max(...counts)];
  }, [months, coverageOf]);

  const monthlyOptions = React.useCallback(
    (width: number): PlotOptions =>
      withBookTheme({
        width,
        height: 280,
        marginLeft: 52,
        marginBottom: 36,
        x: { domain: MONTH_NAMES, label: null, tickSize: 0 },
        y: { grid: true, label: 'Mean store-month Progresso share', tickFormat: (d: number) => fmtPct(d), zero: false },
        r: { range: [3, 11] },
        marks: [
          Plot.ruleX(months, {
            x: d => monthName(Number(d.month)),
            y1: 'ci_low',
            y2: 'ci_high',
            stroke: CHART.skyDark,
            strokeWidth: 1.6,
          }),
          Plot.dot(months, {
            x: d => monthName(Number(d.month)),
            y: 'mean',
            // Coverage encoded as the dot AREA.
            r: d => coverageOf(Number(d.month)),
            fill: CHART.skyDark,
            stroke: 'white',
            strokeWidth: 1,
            tip: true,
            title: d =>
              `${d.month_name}\nmean share ${fmtPct1(d.mean)}\n95% CI ${fmtPct1(d.ci_low)}–${fmtPct1(d.ci_high)}\nactive stores ${coverageOf(Number(d.month)).toLocaleString()}`,
          }),
        ],
      }),
    [months, coverageOf],
  );

  // Replace the CSS clamp(...) bars with a real shared-axis interval plot:
  // region × season means as dot-and-whisker on one share axis.
  const regionSeason = React.useMemo(
    () =>
      data.regionSeasonIntervals.map(d => ({
        ...d,
        rowKey: `${d.region} · ${d.season}`,
      })),
    [data.regionSeasonIntervals],
  );

  const regionRowOrder = React.useMemo(
    () =>
      REGION_ORDER.flatMap(region =>
        ['Winter', 'Non-winter'].map(season => `${region} · ${season}`),
      ).filter(key => regionSeason.some(r => r.rowKey === key)),
    [regionSeason],
  );

  const intervalOptions = React.useCallback(
    (width: number): PlotOptions =>
      withBookTheme({
        width,
        height: 300,
        marginLeft: 130,
        marginBottom: 34,
        x: { grid: true, label: 'Mean Progresso share (95% CI)', tickFormat: (d: number) => fmtPct(d) },
        y: { domain: regionRowOrder, label: null },
        marks: [
          Plot.ruleX([0.2], { stroke: CHART.faint, strokeDasharray: '3 3' }),
          Plot.ruleY(regionSeason, {
            y: 'rowKey',
            x1: 'ci_low',
            x2: 'ci_high',
            stroke: d => SEASON_COLORS[d.season ?? 'Winter'],
            strokeWidth: 2,
          }),
          Plot.dot(regionSeason, {
            y: 'rowKey',
            x: 'mean',
            fill: d => SEASON_COLORS[d.season ?? 'Winter'],
            r: 4.5,
            stroke: 'white',
            strokeWidth: 1,
            tip: true,
            title: d =>
              `${d.region} · ${d.season}\nmean ${fmtPct1(d.mean)}\n95% CI ${fmtPct1(d.ci_low)}–${fmtPct1(d.ci_high)}\nn = ${d.n.toLocaleString()}`,
          }),
        ],
      }),
    [regionSeason, regionRowOrder],
  );

  return (
    <div className="space-y-4">
      <ChartFrame
        title="Seasonal share intervals are narrow — but narrow is not causal"
        subtitle={`Dot area encodes coverage: active store-months range from ${coverageExtent[0].toLocaleString()} to ${coverageExtent[1].toLocaleString()}. A precise mean built on thin coverage still deserves a second look.`}
      >
        <PlotFigure
          ariaLabel="Monthly mean Progresso share with 95% confidence whiskers; each mean dot is sized by the number of store-months behind it."
          options={monthlyOptions}
        />
      </ChartFrame>

      <ChartFrame
        title="Region × season on one shared axis"
        subtitle="A real dot-and-whisker on a single share axis. Winter share sits above non-winter in every region, but the East operates at a different level entirely."
      >
        <PlotFigure
          ariaLabel="Region by season mean Progresso share with 95% confidence intervals on a shared axis."
          options={intervalOptions}
        />
      </ChartFrame>
    </div>
  );
}

// ===========================================================================
// 5. SoupDistributionAndCoefficients — shared-axis histograms + forest plot
// ===========================================================================

type HistRow = { bin?: number; x0: number; x1: number; count: number; label: string };

export function SoupDistributionAndCoefficients({
  data,
}: {
  data: {
    histograms: HistRow[];
    modelComparison: Coefficient[];
    regionCoefficients: Coefficient[];
    seasonCoefficients: Coefficient[];
  };
}) {
  const [scale, setScale] = React.useState<'raw' | 'log'>('raw');

  const rawRows = React.useMemo(() => data.histograms.filter(d => d.label === 'Raw volume'), [data.histograms]);
  const logRows = React.useMemo(() => data.histograms.filter(d => d.label !== 'Raw volume'), [data.histograms]);

  const active = scale === 'raw' ? rawRows : logRows;

  // FIX: the old code printed Math.round(count/1000)+"k" for BOTH panels, which
  // rendered "0k", "5k", "10k" on the log panel (max count ~9.6k). Use a single
  // formatter that only abbreviates at/above 1000 and shows plain counts below.
  const histOptions = React.useCallback(
    (width: number): PlotOptions =>
      withBookTheme({
        width,
        height: 260,
        marginLeft: 52,
        marginBottom: 38,
        x: {
          label: scale === 'raw' ? 'Progresso volume (units per store-month)' : 'log(Progresso volume)',
          labelAnchor: 'center',
          tickFormat: scale === 'raw' ? (d: number) => fmtCount(d) : undefined,
        },
        // Shared, clearly labeled COUNT axis.
        y: { grid: true, label: 'Store-months (count)', tickFormat: (d: number) => fmtCount(d) },
        marks: [
          Plot.rectY(active, {
            x1: 'x0',
            x2: 'x1',
            y: 'count',
            fill: scale === 'raw' ? CHART.skyDark : CHART.sky,
            fillOpacity: 0.85,
            inset: 0.5,
            tip: true,
            title: d =>
              scale === 'raw'
                ? `${fmtCount(d.x0)}–${fmtCount(d.x1)} units\n${d.count.toLocaleString()} store-months`
                : `log ${d.x0.toFixed(2)}–${d.x1.toFixed(2)}\n${d.count.toLocaleString()} store-months`,
          }),
          Plot.ruleY([0], { stroke: CHART.border }),
        ],
      }),
    [active, scale],
  );

  // Forest / coefficient plot — Plot intervals with a dashed zero rule and 95%
  // bars. Combine the national model comparison (naive vs month-adjusted),
  // region month-adjusted previews, and the season slopes into one ordered chart.
  const monthAdjustedRegions = React.useMemo(
    () => data.regionCoefficients.filter(d => d.model === 'Month-adjusted preview' || !d.model),
    [data.regionCoefficients],
  );

  const forestRows = React.useMemo(() => {
    const tag = (c: Coefficient, panel: string) => ({
      ...c,
      panel,
      rowKey: c.model && panel === 'National'
        ? `${c.model.replace(' preview', '')}`
        : c.group,
      color:
        REGION_COLORS[c.group] ??
        SEASON_COLORS[c.group] ??
        (c.model?.includes('Month') ? CHART.emerald : CHART.slate),
    });
    return [
      ...data.modelComparison.map(c => tag(c, 'National')),
      ...monthAdjustedRegions.map(c => tag(c, 'By region')),
      ...data.seasonCoefficients.map(c => tag(c, 'By season')),
    ];
  }, [data.modelComparison, monthAdjustedRegions, data.seasonCoefficients]);

  // Single shared y-band (no faceting, so there are no empty rows). Each row's
  // key carries its panel so panels stay grouped top-to-bottom; the y tick shows
  // just the readable label. A left-margin tag names each panel at its first row.
  const forestOrder = React.useMemo(() => forestRows.map(r => `${r.panel}::${r.rowKey}`), [forestRows]);

  const panelLabels = React.useMemo(() => {
    const seen = new Set<string>();
    return forestRows
      .filter(r => {
        if (seen.has(r.panel)) return false;
        seen.add(r.panel);
        return true;
      })
      .map(r => ({ key: `${r.panel}::${r.rowKey}`, panel: r.panel }));
  }, [forestRows]);

  const forestOptions = React.useCallback(
    (width: number): PlotOptions =>
      withBookTheme({
        width,
        height: Math.max(220, forestRows.length * 34 + 60),
        marginLeft: 150,
        marginBottom: 38,
        x: { grid: true, label: 'log-log slope (a 1% price change → x% volume change)', labelAnchor: 'center' },
        y: { domain: forestOrder, label: null, tickFormat: (d: string) => d.split('::')[1] },
        marks: [
          // Dashed zero rule (the no-relationship baseline).
          Plot.ruleX([0], { stroke: CHART.muted, strokeDasharray: '4 4' }),
          Plot.ruleY(forestRows, {
            y: d => `${d.panel}::${d.rowKey}`,
            x1: 'ci_low',
            x2: 'ci_high',
            stroke: d => d.color,
            strokeWidth: 2.5,
          }),
          Plot.dot(forestRows, {
            y: d => `${d.panel}::${d.rowKey}`,
            x: 'estimate',
            fill: d => d.color,
            r: 5,
            stroke: 'white',
            strokeWidth: 1,
            tip: true,
            title: d =>
              `${d.rowKey}${d.model ? ` · ${d.model.replace(' preview', '')}` : ''}\nslope ${fmtCoef(d.estimate)}\n95% CI ${fmtCoef(d.ci_low)} to ${fmtCoef(d.ci_high)}${d.r2 != null ? `\nR² ${d.r2.toFixed(2)}` : ''}`,
          }),
          Plot.text(forestRows, {
            y: d => `${d.panel}::${d.rowKey}`,
            x: 'estimate',
            text: d => fmtCoef(d.estimate),
            dy: -10,
            fontSize: 10,
            fill: CHART.body,
          }),
          // Panel group tag in the left margin at the first row of each group.
          Plot.text(panelLabels, {
            y: 'key',
            x: 0,
            frameAnchor: 'left',
            dx: -144,
            dy: -14,
            text: d => d.panel.toUpperCase(),
            textAnchor: 'start',
            fontSize: 9,
            fontWeight: 700,
            fill: CHART.faint,
          }),
        ],
      }),
    [forestRows, forestOrder, panelLabels],
  );

  return (
    <div className="space-y-4">
      <ChartFrame
        title={scale === 'raw' ? 'Raw volume is a long-tail distribution' : 'The log transform makes comparison readable'}
        subtitle={
          scale === 'raw'
            ? 'Most store-months are modest; a few stores move enormous volume. The count axis is shared with the log view so the shape change is the only difference.'
            : 'The same data, logged: a near-symmetric comparison space. Same count axis as the raw view — only the x-axis changed.'
        }
        right={
          <SegmentedControl
            label="x-axis"
            value={scale}
            options={[
              { value: 'raw', label: 'Raw' },
              { value: 'log', label: 'log()' },
            ]}
            onChange={setScale}
          />
        }
      >
        <PlotFigure
          ariaLabel={`Histogram of ${scale === 'raw' ? 'raw' : 'log'} Progresso store-month volume on a shared count axis.`}
          options={histOptions}
        />
      </ChartFrame>

      <ChartFrame
        title="Slopes change once seasonality enters the picture"
        subtitle="A forest plot: each estimate is a center, a 95% interval, and a comparison to zero. The dashed line is the no-relationship baseline; later pricing chapters handle identification."
      >
        <PlotFigure
          ariaLabel="Forest plot of log-log slope estimates with 95% intervals for national, regional, and seasonal models, with a dashed zero rule."
          options={forestOptions}
        />
      </ChartFrame>
    </div>
  );
}

// ===========================================================================
// 6. SoupDashboardCritique — real composed mini-dashboard
// ===========================================================================

type DashboardMode = 'Monitor' | 'Diagnose' | 'Decide';

// Illustrative figures pulled from the soup case (the same numbers the other
// Chapter 4 articles quote) so the mini-dashboard renders real evidence, not
// placeholder cards. Inlined as typed consts per the substrate rules.
const DASH_MONTHLY: Array<{ month: number; total_volume: number; progresso_share: number; active_stores: number }> = [
  { month: 1, total_volume: 58.4, progresso_share: 0.3142, active_stores: 1866 },
  { month: 2, total_volume: 47.2, progresso_share: 0.3034, active_stores: 1859 },
  { month: 3, total_volume: 41.2, progresso_share: 0.2586, active_stores: 1864 },
  { month: 4, total_volume: 28.8, progresso_share: 0.1773, active_stores: 1877 },
  { month: 5, total_volume: 24.5, progresso_share: 0.1555, active_stores: 1869 },
  { month: 6, total_volume: 21.7, progresso_share: 0.1433, active_stores: 1947 },
  { month: 7, total_volume: 24.0, progresso_share: 0.1506, active_stores: 1947 },
  { month: 8, total_volume: 28.9, progresso_share: 0.1663, active_stores: 1935 },
  { month: 9, total_volume: 45.1, progresso_share: 0.2569, active_stores: 1931 },
  { month: 10, total_volume: 59.7, progresso_share: 0.2971, active_stores: 1937 },
  { month: 11, total_volume: 59.3, progresso_share: 0.2628, active_stores: 1948 },
  { month: 12, total_volume: 62.9, progresso_share: 0.2517, active_stores: 1968 },
];

// Region share levels (winter / non-winter) for the small-multiple + interval tiles.
const DASH_REGION = [
  { region: 'East', winter: 0.343, nonwinter: 0.286, fips: '36' },
  { region: 'Midwest', winter: 0.18, nonwinter: 0.137, fips: '17' },
  { region: 'South', winter: 0.165, nonwinter: 0.118, fips: '48' },
  { region: 'West', winter: 0.236, nonwinter: 0.176, fips: '06' },
];

// A coarse census-region → representative state FIPS map so the dashboard can
// render a real albers-usa map shaded by Progresso winter share. Every state is
// assigned its census region's winter share (a binned regional map).
const STATE_REGION: Record<string, string> = {
  // East / Northeast
  '09': 'East', '23': 'East', '25': 'East', '33': 'East', '34': 'East', '36': 'East', '42': 'East', '44': 'East', '50': 'East',
  '10': 'East', '11': 'East', '24': 'East', '37': 'East', '45': 'East', '51': 'East', '54': 'East',
  // Midwest
  '17': 'Midwest', '18': 'Midwest', '19': 'Midwest', '20': 'Midwest', '26': 'Midwest', '27': 'Midwest', '29': 'Midwest', '31': 'Midwest', '38': 'Midwest', '39': 'Midwest', '46': 'Midwest', '55': 'Midwest',
  // South
  '01': 'South', '05': 'South', '12': 'South', '13': 'South', '21': 'South', '22': 'South', '28': 'South', '40': 'South', '47': 'South', '48': 'South',
  // West
  '02': 'West', '04': 'West', '06': 'West', '08': 'West', '15': 'West', '16': 'West', '30': 'West', '32': 'West', '35': 'West', '41': 'West', '49': 'West', '53': 'West', '56': 'West',
};

const MODE_BADGE: Record<DashboardMode, string> = {
  Monitor: 'bg-sky-50 text-sky-700 ring-sky-200',
  Diagnose: 'bg-amber-50 text-amber-700 ring-amber-200',
  Decide: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
};

function ModeBadge({ mode }: { mode: string }) {
  const cls = MODE_BADGE[mode as DashboardMode] ?? 'bg-slate-100 text-slate-600 ring-slate-200';
  return (
    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ring-1 ring-inset ${cls}`}>
      {mode}
    </span>
  );
}

function KpiTile({ label, value, sub, mode }: { label: string; value: string; sub: string; mode: DashboardMode }) {
  return (
    <div className="rounded-md border border-slate-200 bg-white p-3 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-[11px] uppercase tracking-wide text-slate-400">{label}</p>
        <ModeBadge mode={mode} />
      </div>
      <p className="mt-1 text-2xl font-semibold text-slate-900">{value}</p>
      <p className="mt-0.5 text-xs text-slate-500">{sub}</p>
    </div>
  );
}

export function SoupDashboardCritique({
  data,
}: {
  data: {
    currentDashboard: Array<{ panel: string; current_job: string; upgrade: string; mode: string }>;
    redesignedSequence: Array<{ step: number; title: string; question: string; visual: string; decision: string }>;
    dashboardRules: string[];
  };
}) {
  // ----- Composed dashboard plots --------------------------------------------
  const trendOptions = React.useCallback(
    (width: number): PlotOptions =>
      withBookTheme({
        width,
        height: 170,
        marginLeft: 40,
        marginBottom: 26,
        x: { domain: MONTH_NAMES, label: null, ticks: ['Jan', 'Apr', 'Jul', 'Oct'], tickSize: 0 },
        y: { grid: true, label: null, tickFormat: (d: number) => `${d}M` },
        marks: [
          Plot.areaY(DASH_MONTHLY, { x: d => monthName(d.month), y: 'total_volume', fill: CHART.sky, fillOpacity: 0.12, curve: 'catmull-rom' }),
          Plot.lineY(DASH_MONTHLY, { x: d => monthName(d.month), y: 'total_volume', stroke: CHART.skyDark, strokeWidth: 2.5, curve: 'catmull-rom' }),
          Plot.dot(DASH_MONTHLY, {
            x: d => monthName(d.month),
            y: 'total_volume',
            fill: CHART.skyDark,
            r: 2.5,
            tip: true,
            title: d => `${monthName(d.month)}\ncategory volume ${d.total_volume.toFixed(1)}M\nactive stores ${d.active_stores.toLocaleString()}`,
          }),
        ],
      }),
    [],
  );

  const regionSmallMultOptions = React.useCallback(
    (width: number): PlotOptions => {
      const rows = DASH_REGION.flatMap(r => [
        { region: r.region, season: 'Winter', share: r.winter },
        { region: r.region, season: 'Non-winter', share: r.nonwinter },
      ]);
      return withBookTheme({
        width,
        height: 170,
        marginLeft: 40,
        marginBottom: 40,
        fx: { label: null, domain: REGION_ORDER },
        x: { label: null, domain: ['Winter', 'Non-winter'], tickSize: 0 },
        y: { grid: true, label: null, tickFormat: (d: number) => fmtPct(d), domain: [0, 0.36] },
        marks: [
          Plot.barY(rows, {
            fx: 'region',
            x: 'season',
            y: 'share',
            fill: d => SEASON_COLORS[d.season],
            tip: true,
            title: d => `${d.region} · ${d.season}\nshare ${fmtPct1(d.share)}`,
          }),
        ],
      });
    },
    [],
  );

  const intervalTileOptions = React.useCallback(
    (width: number): PlotOptions => {
      // Winter share point + an illustrative +/- band per region on a shared axis.
      const rows = DASH_REGION.map(r => ({
        region: r.region,
        mean: r.winter,
        ci_low: r.winter - 0.012,
        ci_high: r.winter + 0.012,
      }));
      return withBookTheme({
        width,
        height: 170,
        marginLeft: 64,
        marginBottom: 26,
        x: { grid: true, label: null, tickFormat: (d: number) => fmtPct(d) },
        y: { domain: REGION_ORDER, label: null },
        marks: [
          Plot.ruleY(rows, { y: 'region', x1: 'ci_low', x2: 'ci_high', stroke: d => REGION_COLORS[d.region], strokeWidth: 2 }),
          Plot.dot(rows, {
            y: 'region',
            x: 'mean',
            fill: d => REGION_COLORS[d.region],
            r: 4.5,
            stroke: 'white',
            strokeWidth: 1,
            tip: true,
            title: d => `${d.region}\nwinter share ${fmtPct1(d.mean)}\n~95% band ${fmtPct1(d.ci_low)}–${fmtPct1(d.ci_high)}`,
          }),
        ],
      });
    },
    [],
  );

  // Region map: shade every state by its census region's winter Progresso share.
  const mapData = React.useMemo(() => {
    const shareByRegion = Object.fromEntries(DASH_REGION.map(r => [r.region, r.winter]));
    return Object.entries(STATE_REGION).map(([fips, region]) => ({
      id: fips,
      value: shareByRegion[region] ?? null,
      label: `${region} region`,
    }));
  }, []);

  return (
    <div className="space-y-5">
      {/* ---- The live mini-dashboard ---- */}
      <div className="rounded-lg border border-slate-200 bg-slate-50/60 p-4 shadow-sm">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Progresso soup decision dashboard</h3>
            <p className="text-xs text-slate-500">One screen, three modes: monitor the cycle, diagnose the heterogeneity, decide the next test.</p>
          </div>
          <div className="flex gap-1.5">
            <ModeBadge mode="Monitor" />
            <ModeBadge mode="Diagnose" />
            <ModeBadge mode="Decide" />
          </div>
        </div>

        {/* KPI tiles */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <KpiTile label="Summer trough" value="-54%" sub="Jun category volume vs Jan" mode="Monitor" />
          <KpiTile label="Price into weakness" value="+47%" sub="Jun Progresso price index (Jan=100)" mode="Monitor" />
          <KpiTile label="Share spread" value="34% vs 12%" sub="East vs South winter share" mode="Diagnose" />
          <KpiTile label="Month-adj. slope" value="-2.46" sub="national log-log price→volume" mode="Decide" />
        </div>

        {/* Charts row */}
        <div className="mt-3 grid gap-3 lg:grid-cols-2">
          <div className="rounded-md border border-slate-200 bg-white p-3 shadow-sm">
            <div className="mb-1 flex items-center justify-between">
              <p className="text-xs font-semibold text-slate-700">Category volume by month</p>
              <ModeBadge mode="Monitor" />
            </div>
            <PlotFigure ariaLabel="Monthly soup category volume trend." options={trendOptions} />
          </div>
          <div className="rounded-md border border-slate-200 bg-white p-3 shadow-sm">
            <div className="mb-1 flex items-center justify-between">
              <p className="text-xs font-semibold text-slate-700">Winter vs non-winter share by region</p>
              <ModeBadge mode="Diagnose" />
            </div>
            <PlotFigure ariaLabel="Region small-multiple of winter and non-winter Progresso share." options={regionSmallMultOptions} />
          </div>
          <div className="rounded-md border border-slate-200 bg-white p-3 shadow-sm">
            <div className="mb-1 flex items-center justify-between">
              <p className="text-xs font-semibold text-slate-700">Winter share with uncertainty band</p>
              <ModeBadge mode="Diagnose" />
            </div>
            <PlotFigure ariaLabel="Winter Progresso share by region with an uncertainty band on a shared axis." options={intervalTileOptions} />
          </div>
          <div className="rounded-md border border-slate-200 bg-white p-3 shadow-sm">
            <div className="mb-1 flex items-center justify-between">
              <p className="text-xs font-semibold text-slate-700">Where Progresso is strong (winter share)</p>
              <ModeBadge mode="Diagnose" />
            </div>
            <ChoroplethMap
              data={mapData}
              level="states"
              scheme="blues"
              valueLabel="Winter Progresso share"
              valueFormat={v => fmtPct1(v)}
              ariaLabel="US map shaded by census-region winter Progresso share."
            />
            <p className="mt-1 text-[10px] leading-snug text-slate-400">
              Binned by census region — an approximation. Map approximations are a caveat that belongs next to the chart.
            </p>
          </div>
        </div>

        <div className="mt-3 rounded-md border border-emerald-200 bg-emerald-50/70 p-3">
          <div className="flex items-center gap-2">
            <ModeBadge mode="Decide" />
            <p className="text-xs font-semibold text-emerald-900">Next test, not a verdict</p>
          </div>
          <p className="mt-1 text-xs leading-relaxed text-emerald-900/90">
            The dashboard shows countercyclical pricing that varies by region. It cannot prove price caused the volume drop.
            The decision it earns is the next one: estimate elasticity with a design that separates price from seasonal demand,
            and run it region by region where the share levels differ most.
          </p>
        </div>
      </div>

      {/* ---- Critique narrative: each current panel gets a job + upgrade ---- */}
      <div>
        <h3 className="mb-2 text-sm font-semibold text-slate-900">Critique: each panel gets a job, each job gets an upgrade</h3>
        <div className="grid gap-3 md:grid-cols-2">
          {data.currentDashboard.map(panel => (
            <div key={panel.panel} className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <h4 className="text-sm font-semibold text-slate-900">{panel.panel}</h4>
                <ModeBadge mode={panel.mode} />
              </div>
              <p className="mt-2 text-xs leading-relaxed text-slate-600">{panel.current_job}</p>
              <p className="mt-3 border-l-2 border-sky-400 pl-3 text-xs leading-relaxed text-slate-700">{panel.upgrade}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ---- Redesigned monitor→diagnose→decide sequence ---- */}
      <div className="rounded-md border border-slate-800 bg-slate-900 p-4 text-white shadow-sm">
        <h3 className="text-sm font-semibold">Redesigned dashboard sequence</h3>
        <div className="mt-4 grid gap-3 lg:grid-cols-3">
          {data.redesignedSequence.map(step => (
            <div key={step.step} className="rounded-md border border-white/10 bg-white/5 p-3">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-300">Step {step.step}</p>
              <h4 className="mt-1 text-sm font-semibold">{step.title}</h4>
              <p className="mt-2 text-xs leading-relaxed text-slate-300">{step.question}</p>
              <p className="mt-2 text-xs leading-relaxed text-slate-100">{step.visual}</p>
              <p className="mt-2 text-xs leading-relaxed text-amber-200">{step.decision}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ---- Reusable rules ---- */}
      <div className="grid gap-2 sm:grid-cols-2">
        {data.dashboardRules.map(rule => (
          <div key={rule} className="rounded-md bg-slate-50 px-3 py-2 text-xs text-slate-700">{rule}</div>
        ))}
      </div>
    </div>
  );
}
