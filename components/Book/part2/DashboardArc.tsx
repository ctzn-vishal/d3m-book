'use client';

import * as React from 'react';
import * as Plot from '@observablehq/plot';
import { PlotFigure } from '@/components/Book/charts/PlotFigure';
import { withBookTheme, CHART, CATEGORICAL } from '@/lib/chart-theme';

type PlotOptions = NonNullable<Parameters<typeof Plot.plot>[0]>;

/* -------------------------------------------------------------------------- */
/*  Illustrative Bean & Basket data — consistent with the article's numbers.  */
/*  Chain-wide revenue lands at $1.18M in Q1 2024, +0.7% vs Q4 2023, after    */
/*  eight quarters of 4–6% growth (the first non-growth quarter). The         */
/*  regional breakdown surfaces Suburban as the breakout (Chapter 2's lesson),*/
/*  which the drilldown explains as weekday-morning commuter traffic.         */
/* -------------------------------------------------------------------------- */

type Quarter = { period: string; index: number; revenue: number };

// Revenue in $M, quarter over quarter. The last point (Q1'24) is the flat one.
const TREND: Quarter[] = [
  { period: "Q1'22", index: 0, revenue: 0.92 },
  { period: "Q2'22", index: 1, revenue: 0.96 },
  { period: "Q3'22", index: 2, revenue: 1.01 },
  { period: "Q4'22", index: 3, revenue: 1.06 },
  { period: "Q1'23", index: 4, revenue: 1.10 },
  { period: "Q2'23", index: 5, revenue: 1.14 },
  { period: "Q3'23", index: 6, revenue: 1.155 },
  { period: "Q4'23", index: 7, revenue: 1.172 },
  { period: "Q1'24", index: 8, revenue: 1.18 },
];

const LAST = TREND[TREND.length - 1];

// Q-over-Q percent change, used to label the trend as "+0.7%, the flat one".
const QOQ = TREND.map((d, i) =>
  i === 0 ? null : (d.revenue / TREND[i - 1].revenue - 1) * 100,
);

type RegionRow = {
  region: string;
  revenue: number; // $M this quarter
  delta: number; // pct change vs prior quarter
};

// Revenue by store region, Q1 2024. Suburban is the lone grower — the breakout.
const BY_REGION: RegionRow[] = [
  { region: 'Suburban', revenue: 0.41, delta: 6.2 },
  { region: 'Downtown', revenue: 0.39, delta: -1.4 },
  { region: 'Campus', revenue: 0.22, delta: -2.1 },
  { region: 'Airport', revenue: 0.16, delta: -3.0 },
];

type DaypartRow = {
  region: string;
  daypart: string;
  revenue: number; // $K this quarter, weekday only
  weekday: boolean;
};

// Drilldown: revenue by region x daypart. Suburban's weekday morning is the
// engine — it towers over every other cell, which the recommendation acts on.
const DAYPARTS = ['Morning', 'Midday', 'Afternoon', 'Evening'];
const REGIONS_DRILL = ['Suburban', 'Downtown', 'Campus'];
const BY_DAYPART: DaypartRow[] = [
  // Suburban — weekday-morning commuter surge
  { region: 'Suburban', daypart: 'Morning', revenue: 168, weekday: true },
  { region: 'Suburban', daypart: 'Midday', revenue: 96, weekday: true },
  { region: 'Suburban', daypart: 'Afternoon', revenue: 84, weekday: true },
  { region: 'Suburban', daypart: 'Evening', revenue: 62, weekday: true },
  // Downtown — flat, lunch-led
  { region: 'Downtown', daypart: 'Morning', revenue: 104, weekday: true },
  { region: 'Downtown', daypart: 'Midday', revenue: 132, weekday: true },
  { region: 'Downtown', daypart: 'Afternoon', revenue: 88, weekday: true },
  { region: 'Downtown', daypart: 'Evening', revenue: 66, weekday: true },
  // Campus — comparable foot traffic, weaker morning conversion (the 11-pt gap)
  { region: 'Campus', daypart: 'Morning', revenue: 71, weekday: true },
  { region: 'Campus', daypart: 'Midday', revenue: 79, weekday: true },
  { region: 'Campus', daypart: 'Afternoon', revenue: 58, weekday: true },
  { region: 'Campus', daypart: 'Evening', revenue: 44, weekday: true },
];

const fmtM = (v: number) => `$${v.toFixed(2)}M`;
const fmtK = (v: number) => `$${Math.round(v)}K`;
const fmtSignedPct = (v: number) => `${v >= 0 ? '+' : ''}${v.toFixed(1)}%`;

const REGION_COLOR: Record<string, string> = {
  Suburban: CHART.sky,
  Downtown: CHART.slate,
  Campus: CHART.amber,
  Airport: CHART.faint,
};

/* -------------------------------------------------------------------------- */
/*  Shared panel chrome — light theme card with a small question/answer head. */
/* -------------------------------------------------------------------------- */

function Panel({
  step,
  question,
  answer,
  children,
  tone = 'neutral',
}: {
  step?: number | string;
  question: string;
  answer?: string;
  children?: React.ReactNode;
  tone?: 'neutral' | 'accent';
}) {
  return (
    <div className="not-prose rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-start gap-3">
        {step != null && (
          <span
            className={[
              'mt-0.5 inline-flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs font-semibold tabular-nums text-white',
              tone === 'accent' ? 'bg-sky-500' : 'bg-slate-700',
            ].join(' ')}
          >
            {step}
          </span>
        )}
        <div className="min-w-0">
          <p className="text-sm font-semibold leading-snug text-slate-900">{question}</p>
          {answer && <p className="mt-0.5 text-xs leading-snug text-slate-500">{answer}</p>}
        </div>
      </div>
      {children}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Step 2 — the KPI tile.                                                     */
/* -------------------------------------------------------------------------- */

export function KpiTile() {
  return (
    <div className="not-prose">
      <Panel
        step={2}
        tone="accent"
        question="The headline number"
        answer="One number, large, with a comparison — the answer in two seconds."
      >
        <div className="flex flex-wrap items-baseline gap-3">
          <span className="text-5xl font-semibold leading-none tracking-tight tabular-nums text-slate-900">
            $1.18M
          </span>
          <span className="rounded-md bg-amber-50 px-2 py-0.5 text-sm font-medium tabular-nums text-amber-700">
            +0.7% vs Q4 2023
          </span>
        </div>
        <p className="mt-2 text-xs text-slate-500">
          Bean &amp; Basket chain-wide revenue, Q1 2024. The badge is the comparison
          that turns a label into a KPI.
        </p>
      </Panel>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Step 3 — the trend, with the most recent point flagged.                   */
/* -------------------------------------------------------------------------- */

export function TrendLine() {
  const options = React.useCallback(
    (width: number): PlotOptions =>
      withBookTheme({
        width,
        height: 260,
        marginLeft: 52,
        marginBottom: 36,
        x: { label: null, tickFormat: (i: number) => TREND[i]?.period ?? '', ticks: TREND.map(d => d.index) },
        y: {
          grid: true,
          label: 'Revenue ($M)',
          domain: [0.8, 1.25],
          tickFormat: (v: number) => `$${v.toFixed(2)}`,
        },
        marks: [
          Plot.ruleY([0.8]),
          Plot.lineY(TREND, {
            x: 'index',
            y: 'revenue',
            stroke: CHART.sky,
            strokeWidth: 2.5,
            curve: 'monotone-x',
          }),
          // Faint dots on every point with a QoQ tooltip.
          Plot.dot(TREND, {
            x: 'index',
            y: 'revenue',
            r: 3,
            fill: CHART.sky,
            tip: true,
            title: (d: Quarter) => {
              const i = d.index;
              const qoq = QOQ[i];
              return `${d.period}\n${fmtM(d.revenue)}${qoq == null ? '' : `\n${fmtSignedPct(qoq)} vs prior Q`}`;
            },
          }),
          // The flagged most-recent point — larger, ringed, labelled.
          Plot.dot([LAST], {
            x: 'index',
            y: 'revenue',
            r: 6,
            fill: CHART.orange,
            stroke: 'white',
            strokeWidth: 2,
          }),
          Plot.text([LAST], {
            x: 'index',
            y: 'revenue',
            text: () => 'Q1’24  +0.7%',
            dy: -16,
            dx: -4,
            textAnchor: 'end',
            fontWeight: 600,
            fill: CHART.orange,
          }),
        ],
      }),
    [],
  );

  return (
    <Panel
      step={3}
      question="Is +0.7% steady, or a break in the pattern?"
      answer="Eight quarters of 4–6% growth, then the line goes flat. The last point is flagged."
    >
      <PlotFigure
        ariaLabel="Bean & Basket chain-wide quarterly revenue, Q1 2022 through Q1 2024. The line climbs steadily then flattens at the final Q1 2024 point, which is flagged in orange at +0.7 percent."
        options={options}
      />
    </Panel>
  );
}

/* -------------------------------------------------------------------------- */
/*  Step 4 — the sorted-bar breakdown by region.                              */
/* -------------------------------------------------------------------------- */

export function RegionBreakdown() {
  const sorted = [...BY_REGION].sort((a, b) => b.revenue - a.revenue);
  const options = React.useCallback(
    (width: number): PlotOptions =>
      withBookTheme({
        width,
        height: 240,
        marginLeft: 86,
        marginRight: 64,
        x: { grid: true, label: 'Q1 2024 revenue ($M)', tickFormat: (v: number) => `$${v.toFixed(2)}` },
        y: { label: null },
        marks: [
          Plot.ruleX([0]),
          Plot.barX(sorted, {
            x: 'revenue',
            y: 'region',
            sort: { y: 'x', reverse: true },
            fill: (d: RegionRow) => REGION_COLOR[d.region] ?? CHART.slate,
            tip: true,
            title: (d: RegionRow) =>
              `${d.region}\n${fmtM(d.revenue)}\n${fmtSignedPct(d.delta)} vs prior Q`,
          }),
          // Delta label at the end of each bar — the comparison that explains the flat total.
          Plot.text(sorted, {
            x: 'revenue',
            y: 'region',
            text: (d: RegionRow) => fmtSignedPct(d.delta),
            dx: 8,
            textAnchor: 'start',
            fontWeight: 600,
            fill: (d: RegionRow) => (d.delta >= 0 ? CHART.emerald : CHART.rose),
          }),
        ],
      }),
    [sorted],
  );

  return (
    <Panel
      step={4}
      question="Where is the flat total coming from?"
      answer="Revenue by region. Suburban is the lone grower; every other region shrank — the trend is a mix shift."
    >
      <PlotFigure
        ariaLabel="Horizontal sorted bar chart of Q1 2024 revenue by store region. Suburban leads and is the only region growing at plus 6.2 percent, while Downtown, Campus, and Airport all declined."
        options={options}
      />
    </Panel>
  );
}

/* -------------------------------------------------------------------------- */
/*  Step 5 — the small-multiples drilldown into Suburban's daypart mix.       */
/* -------------------------------------------------------------------------- */

export function DaypartDrilldown() {
  const options = React.useCallback(
    (width: number): PlotOptions =>
      withBookTheme({
        width,
        height: 280,
        marginLeft: 44,
        marginBottom: 40,
        marginTop: 28,
        x: { label: null, tickRotate: 0, domain: DAYPARTS },
        y: { grid: true, label: 'Weekday revenue ($K)', domain: [0, 190] },
        fx: { label: null, domain: REGIONS_DRILL },
        marks: [
          Plot.ruleY([0]),
          Plot.barY(BY_DAYPART, {
            fx: 'region',
            x: 'daypart',
            y: 'revenue',
            fill: (d: DaypartRow) =>
              d.region === 'Suburban' && d.daypart === 'Morning' ? CHART.orange : CHART.sky,
            fillOpacity: (d: DaypartRow) =>
              d.region === 'Suburban' && d.daypart === 'Morning' ? 1 : 0.55,
            tip: true,
            title: (d: DaypartRow) => `${d.region} · ${d.daypart}\n${fmtK(d.revenue)} weekday`,
          }),
          Plot.text(
            BY_DAYPART.filter(d => d.region === 'Suburban' && d.daypart === 'Morning'),
            {
              fx: 'region',
              x: 'daypart',
              y: 'revenue',
              text: () => 'commuter\nsurge',
              dy: -12,
              lineHeight: 1.1,
              fontWeight: 600,
              fontSize: 10,
              fill: CHART.orange,
            },
          ),
        ],
      }),
    [],
  );

  return (
    <Panel
      step={5}
      question="What inside Suburban is growing?"
      answer="Small multiples by region × daypart. Suburban's weekday-morning commuter block towers over everything — Campus has comparable traffic but a weak morning."
    >
      <PlotFigure
        ariaLabel="Small-multiples bar charts of weekday revenue by daypart for Suburban, Downtown, and Campus stores. Suburban's morning bar is by far the tallest, highlighted in orange as the commuter surge, while Campus's morning bar lags."
        options={options}
      />
    </Panel>
  );
}

/* -------------------------------------------------------------------------- */
/*  Step 6 — the recommended action (the only non-chart panel).               */
/* -------------------------------------------------------------------------- */

export function RecommendedAction() {
  return (
    <Panel
      step={6}
      question="So what do we do about it?"
      answer="The only panel that is not a chart — it turns the four panels above into a decision."
    >
      <div className="rounded-md border-l-2 border-sky-500 bg-sky-50/60 px-3 py-2.5 text-sm leading-relaxed text-slate-700">
        Suburban grew on weekday-morning commuter traffic. Recommend doubling
        weekday-morning staffing and piloting a 7am promo at the Campus store,
        where commuter foot traffic is comparable but conversion lags by{' '}
        <span className="font-semibold text-slate-900">11 points</span>.
      </div>
    </Panel>
  );
}

/* -------------------------------------------------------------------------- */
/*  The full six-panel arc, stacked in narrative order.                       */
/* -------------------------------------------------------------------------- */

export function DashboardArc() {
  return (
    <div className="not-prose my-8">
      <div className="mb-3 rounded-md bg-slate-50 px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Step 1 — the executive question
        </p>
        <p className="mt-1 text-base font-semibold text-slate-900">
          Why did revenue flatten in Q1, after eight quarters of growth?
        </p>
        <p className="mt-1 text-xs text-slate-500">
          One sentence at the top. Everything below is the page answering it, in order.
        </p>
      </div>
      <div className="space-y-3">
        <KpiTile />
        <TrendLine />
        <RegionBreakdown />
        <DaypartDrilldown />
        <RecommendedAction />
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Optional demo — the same six panels as a "buffet" (shuffled, equal        */
/*  weight, no order) vs the "memo" (the arc). Toggle to feel the difference. */
/* -------------------------------------------------------------------------- */

type BuffetPanel = { key: string; label: string; node: React.ReactNode };

function MiniKpi() {
  return (
    <div>
      <div className="text-2xl font-semibold tabular-nums text-slate-900">$1.18M</div>
      <div className="text-[11px] text-slate-500">chain revenue · +0.7%</div>
    </div>
  );
}

function MiniTrend() {
  const options = React.useCallback(
    (width: number): PlotOptions =>
      withBookTheme({
        width,
        height: 90,
        marginLeft: 24,
        marginBottom: 16,
        marginTop: 6,
        x: { label: null, ticks: [] },
        y: { label: null, ticks: [], domain: [0.8, 1.25] },
        marks: [
          Plot.lineY(TREND, { x: 'index', y: 'revenue', stroke: CHART.sky, strokeWidth: 2, curve: 'monotone-x' }),
          Plot.dot([LAST], { x: 'index', y: 'revenue', r: 4, fill: CHART.orange, stroke: 'white', strokeWidth: 1.5 }),
        ],
      }),
    [],
  );
  return <PlotFigure ariaLabel="Sparkline of quarterly revenue, flat at the end." options={options} />;
}

function MiniBars() {
  const sorted = [...BY_REGION].sort((a, b) => b.revenue - a.revenue);
  const options = React.useCallback(
    (width: number): PlotOptions =>
      withBookTheme({
        width,
        height: 90,
        marginLeft: 56,
        marginBottom: 4,
        marginTop: 4,
        x: { label: null, ticks: [] },
        y: { label: null },
        marks: [
          Plot.barX(sorted, {
            x: 'revenue',
            y: 'region',
            sort: { y: 'x', reverse: true },
            fill: (d: RegionRow) => REGION_COLOR[d.region] ?? CHART.slate,
          }),
        ],
      }),
    [sorted],
  );
  return <PlotFigure ariaLabel="Mini sorted bars of revenue by region." options={options} />;
}

function MiniDrill() {
  const sub = BY_DAYPART.filter(d => d.region === 'Suburban');
  const options = React.useCallback(
    (width: number): PlotOptions =>
      withBookTheme({
        width,
        height: 90,
        marginLeft: 24,
        marginBottom: 16,
        marginTop: 4,
        x: { label: null, domain: DAYPARTS },
        y: { label: null, ticks: [] },
        marks: [
          Plot.barY(sub, {
            x: 'daypart',
            y: 'revenue',
            fill: (d: DaypartRow) => (d.daypart === 'Morning' ? CHART.orange : CHART.sky),
            fillOpacity: (d: DaypartRow) => (d.daypart === 'Morning' ? 1 : 0.5),
          }),
        ],
      }),
    [sub],
  );
  return <PlotFigure ariaLabel="Mini Suburban daypart bars, morning highlighted." options={options} />;
}

const PANELS: BuffetPanel[] = [
  { key: 'kpi', label: 'KPI · chain revenue', node: <MiniKpi /> },
  { key: 'trend', label: 'Trend · revenue by quarter', node: <MiniTrend /> },
  { key: 'bars', label: 'Breakdown · revenue by region', node: <MiniBars /> },
  { key: 'drill', label: 'Drilldown · Suburban by daypart', node: <MiniDrill /> },
];

// A fixed "shuffled" order for the buffet — deliberately not the arc order, so
// every panel reads as equally weighted and the eye has nowhere obvious to start.
const BUFFET_ORDER = ['bars', 'kpi', 'drill', 'trend'];
const MEMO_ORDER = ['kpi', 'trend', 'bars', 'drill'];

export function BuffetVsMemo() {
  const [mode, setMode] = React.useState<'buffet' | 'memo'>('buffet');
  const order = mode === 'buffet' ? BUFFET_ORDER : MEMO_ORDER;
  const ordered = order.map(k => PANELS.find(p => p.key === k)!).filter(Boolean);

  return (
    <div className="not-prose my-8 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-900">
            {mode === 'buffet' ? 'Buffet: same panels, no order' : 'Memo: the dashboard arc'}
          </p>
          <p className="mt-0.5 text-xs text-slate-500">
            {mode === 'buffet'
              ? 'Four equal tiles. Each is fine alone; together they make you do the prioritizing.'
              : 'The same four panels, ordered question → headline → context → breakdown → drilldown.'}
          </p>
        </div>
        <div className="inline-flex overflow-hidden rounded-md border border-slate-200 text-xs font-medium">
          <button
            type="button"
            onClick={() => setMode('buffet')}
            className={[
              'px-3 py-1.5 transition-colors',
              mode === 'buffet' ? 'bg-slate-700 text-white' : 'bg-white text-slate-600 hover:bg-slate-50',
            ].join(' ')}
            aria-pressed={mode === 'buffet'}
          >
            Buffet
          </button>
          <button
            type="button"
            onClick={() => setMode('memo')}
            className={[
              'px-3 py-1.5 transition-colors',
              mode === 'memo' ? 'bg-sky-500 text-white' : 'bg-white text-slate-600 hover:bg-slate-50',
            ].join(' ')}
            aria-pressed={mode === 'memo'}
          >
            Memo
          </button>
        </div>
      </div>

      {mode === 'buffet' ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {ordered.map(p => (
            <div key={p.key} className="rounded-md border border-slate-200 bg-slate-50/50 p-3">
              <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-slate-400">
                {p.label}
              </p>
              {p.node}
            </div>
          ))}
        </div>
      ) : (
        <ol className="space-y-3">
          {ordered.map((p, i) => (
            <li key={p.key} className="flex gap-3 rounded-md border border-slate-200 bg-white p-3">
              <span className="mt-0.5 inline-flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-sky-500 text-[11px] font-semibold text-white">
                {i + 1}
              </span>
              <div className="min-w-0 flex-1">
                <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-slate-500">
                  {p.label}
                </p>
                {p.node}
              </div>
            </li>
          ))}
        </ol>
      )}

      <p className="mt-4 text-xs leading-relaxed text-slate-500">
        Nothing about the data changed between the two views — only the order. The
        buffet asks you to find the story; the memo tells it to you, top to bottom.
      </p>
    </div>
  );
}

// Silence unused-import warnings for tokens kept available to callers/future marks.
void CATEGORICAL;
