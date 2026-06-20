'use client';

import * as React from 'react';
import * as Plot from '@observablehq/plot';
import { PlotFigure } from '@/components/Book/charts/PlotFigure';
import { withBookTheme, CHART } from '@/lib/chart-theme';

/* ------------------------------------------------------------------ *
 * Types mirroring data/decision-brief.json ("Soup visual decision
 * brief builder"). The MDX passes the parsed JSON down by prop so the
 * slug, the JSON, and the rendered studio finally describe one thing.
 * ------------------------------------------------------------------ */

export type BriefWorkflowStep = {
  id: string;
  label: string;
  question: string;
  artifact: string;
  red_flag: string;
};

export type BriefSection = {
  id: string;
  label: string;
  memo_text: string;
  evidence_standard: string;
  limit: string;
};

export type BriefRubricItem = {
  criterion: string;
  why_it_matters: string;
};

export type DecisionBrief = {
  metadata: { title: string; subtitle: string; kicker: string; case: string };
  workflow: BriefWorkflowStep[];
  sections: BriefSection[];
  rubric: BriefRubricItem[];
};

/* ------------------------------------------------------------------ *
 * Real Progresso soup seasonality, indexed to January = 100. These are
 * the same retail-scanner numbers the Part II chapters chart (see
 * ch04-baselines/data/soup-baselines.json); inlined here so the
 * storyboard composes genuine evidence rather than placeholder shapes.
 * ------------------------------------------------------------------ */

type MonthIndex = {
  month: number;
  name: string;
  vol: number;
  price: number;
  share: number;
  stores: number;
};

const SOUP_INDEX: MonthIndex[] = [
  { month: 1, name: 'Jan', vol: 100, price: 100, share: 100, stores: 1866 },
  { month: 2, name: 'Feb', vol: 78.1, price: 102.7, share: 96.6, stores: 1859 },
  { month: 3, name: 'Mar', vol: 58, price: 109.3, share: 82.3, stores: 1864 },
  { month: 4, name: 'Apr', vol: 27.8, price: 131.6, share: 56.4, stores: 1877 },
  { month: 5, name: 'May', vol: 20.8, price: 144.1, share: 49.5, stores: 1869 },
  { month: 6, name: 'Jun', vol: 17, price: 147.3, share: 45.6, stores: 1947 },
  { month: 7, name: 'Jul', vol: 19.7, price: 141.6, share: 47.9, stores: 1947 },
  { month: 8, name: 'Aug', vol: 26.1, price: 128.8, share: 52.9, stores: 1935 },
  { month: 9, name: 'Sep', vol: 63.1, price: 105.2, share: 81.8, stores: 1931 },
  { month: 10, name: 'Oct', vol: 96.6, price: 102.4, share: 94.6, stores: 1937 },
  { month: 11, name: 'Nov', vol: 84.9, price: 107, share: 83.6, stores: 1948 },
  { month: 12, name: 'Dec', vol: 86.2, price: 111.6, share: 80.1, stores: 1968 },
];

// Winter window used across the soup case: Oct, Nov, Dec, Jan, Feb.
const WINTER_MONTHS = new Set([10, 11, 12, 1, 2]);
const isWinter = (m: number) => WINTER_MONTHS.has(m);

type MetricKey = 'vol' | 'share' | 'price';

const METRICS: Record<
  MetricKey,
  { label: string; short: string; color: string; gloss: string }
> = {
  vol: {
    label: 'Volume index',
    short: 'Volume',
    color: CHART.skyDark,
    gloss: 'cases sold, indexed to January',
  },
  share: {
    label: 'Category share index',
    short: 'Share',
    color: CHART.emerald,
    gloss: 'Progresso share of soup volume, indexed to January',
  },
  price: {
    label: 'Average price index',
    short: 'Price',
    color: CHART.orange,
    gloss: 'average shelf price, indexed to January',
  },
};

const mean = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / (xs.length || 1);

/* ================================================================== *
 * 1. INTERACTIVE STORYBOARD
 *    A fillable executive-brief scaffold that composes two live Plot
 *    panels (an indexed seasonality line + a winter / non-winter
 *    comparison) from a metric the reader selects, then lets the reader
 *    type the one-sentence finding the panels support.
 * ================================================================== */

export function VisualBriefStoryboard() {
  const [metric, setMetric] = React.useState<MetricKey>('vol');
  const [note, setNote] = React.useState('');

  const cfg = METRICS[metric];
  const value = (d: MonthIndex) => d[metric];

  const winterMean = mean(SOUP_INDEX.filter(d => isWinter(d.month)).map(value));
  const nonWinterMean = mean(SOUP_INDEX.filter(d => !isWinter(d.month)).map(value));
  const gap = Math.round(winterMean - nonWinterMean);

  // Line: indexed seasonality across the 12-month cycle.
  const lineOptions = React.useCallback(
    (width: number) =>
      withBookTheme({
        width,
        height: 260,
        marginLeft: 46,
        marginBottom: 36,
        x: {
          label: null,
          domain: SOUP_INDEX.map(d => d.name),
        },
        y: {
          grid: true,
          label: `${cfg.short}, Jan = 100`,
          domain: [0, 160],
        },
        marks: [
          Plot.ruleY([100], { stroke: CHART.faint, strokeDasharray: '4 4' }),
          // Shade the winter window so the reader sees the season the brief turns on.
          Plot.rectX(
            SOUP_INDEX.filter(d => isWinter(d.month)),
            { x: 'name', y1: 0, y2: 160, fill: CHART.grid, fillOpacity: 0.5 },
          ),
          Plot.line(SOUP_INDEX, {
            x: 'name',
            y: value,
            stroke: cfg.color,
            strokeWidth: 2.5,
            curve: 'catmull-rom',
          }),
          Plot.dot(SOUP_INDEX, {
            x: 'name',
            y: value,
            fill: cfg.color,
            r: 3.5,
            tip: true,
            title: d => `${d.name}: ${cfg.short} index ${value(d)}`,
          }),
        ],
      }),
    [metric, cfg, value],
  );

  // Bar: the named comparison the brief must make — winter vs non-winter.
  const compareData = [
    { season: 'Winter', value: Math.round(winterMean) },
    { season: 'Non-winter', value: Math.round(nonWinterMean) },
  ];
  const barOptions = React.useCallback(
    (width: number) =>
      withBookTheme({
        width,
        height: 260,
        marginLeft: 46,
        marginBottom: 36,
        x: { label: null },
        y: { grid: true, label: `Mean ${cfg.short.toLowerCase()} index`, domain: [0, 160] },
        marks: [
          Plot.ruleY([100], { stroke: CHART.faint, strokeDasharray: '4 4' }),
          Plot.barY(compareData, {
            x: 'season',
            y: 'value',
            fill: d => (d.season === 'Winter' ? cfg.color : CHART.faint),
            tip: true,
            title: d => `${d.season}: mean ${cfg.short} index ${d.value}`,
          }),
          Plot.text(compareData, {
            x: 'season',
            y: 'value',
            text: d => String(d.value),
            dy: -8,
            fill: CHART.body,
            fontSize: 13,
          }),
        ],
      }),
    [metric, cfg],
  );

  const autoFinding = `Progresso ${cfg.short.toLowerCase()} runs about ${Math.abs(
    gap,
  )} index points ${gap >= 0 ? 'higher' : 'lower'} in winter (Oct–Feb) than out of season; ${cfg.gloss}.`;

  return (
    <div className="not-prose my-6 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-sky-600">
            Storyboard panel · fill the metric and the finding
          </p>
          <h3 className="mt-1 text-base font-semibold text-slate-900">
            Which metric carries the seasonal argument?
          </h3>
        </div>
        <div
          role="group"
          aria-label="Choose the metric to chart"
          className="inline-flex overflow-hidden rounded-md border border-slate-300 text-sm"
        >
          {(Object.keys(METRICS) as MetricKey[]).map(key => (
            <button
              key={key}
              type="button"
              onClick={() => setMetric(key)}
              aria-pressed={metric === key}
              className={
                'px-3 py-1.5 transition-colors ' +
                (metric === key
                  ? 'bg-sky-600 font-medium text-white'
                  : 'bg-white text-slate-600 hover:bg-slate-50')
              }
            >
              {METRICS[key].short}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <figure className="m-0">
          <figcaption className="mb-1 text-xs font-medium text-slate-600">
            Panel A · {cfg.label} across the year
          </figcaption>
          <PlotFigure
            ariaLabel={`${cfg.label} for Progresso soup across twelve months, indexed to January equals one hundred. The winter months October through February are shaded.`}
            options={lineOptions}
          />
        </figure>
        <figure className="m-0">
          <figcaption className="mb-1 text-xs font-medium text-slate-600">
            Panel B · winter vs non-winter mean
          </figcaption>
          <PlotFigure
            ariaLabel={`Mean ${cfg.label} compared between winter and non-winter months.`}
            options={barOptions}
          />
        </figure>
      </div>

      <div className="mt-5 rounded-md bg-slate-50 p-4">
        <label
          htmlFor="brief-finding"
          className="block text-xs font-semibold uppercase tracking-wide text-slate-500"
        >
          The descriptive finding these panels support
        </label>
        <textarea
          id="brief-finding"
          value={note}
          onChange={e => setNote(e.target.value)}
          placeholder="Write one sentence: which metric, which season, which comparison. Keep it descriptive — no cause yet."
          rows={2}
          className="mt-2 w-full resize-none rounded-md border border-slate-300 bg-white p-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
        />
        <button
          type="button"
          onClick={() => setNote(autoFinding)}
          className="mt-2 rounded-md border border-slate-300 bg-white px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
        >
          Use the computed comparison
        </button>
        <p className="mt-3 border-l-2 border-amber-400 pl-3 text-xs leading-relaxed text-slate-600">
          Limit to keep next to this panel: a {cfg.short.toLowerCase()} index gap is{' '}
          <em>descriptive</em>. It shows the seasonal pattern; it does not prove that price{' '}
          <em>caused</em> the volume move. That claim needs the pricing test named in the brief.
        </p>
      </div>
    </div>
  );
}

/* ================================================================== *
 * 2. WORKFLOW + SECTIONS + RUBRIC
 *    Renders decision-brief.json: the six-step build sequence, the
 *    paragraph each step contributes to the executive note, and the
 *    grading rubric.
 * ================================================================== */

export function VisualBriefWorkflow({ brief }: { brief: DecisionBrief }) {
  const sectionById = React.useMemo(
    () => Object.fromEntries(brief.sections.map(s => [s.id, s])),
    [brief.sections],
  );
  const [openId, setOpenId] = React.useState<string>(brief.workflow[0]?.id ?? '');

  return (
    <div className="not-prose my-6 space-y-5">
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {brief.workflow.map((step, i) => {
          const open = step.id === openId;
          return (
            <button
              key={step.id}
              type="button"
              onClick={() => setOpenId(step.id)}
              aria-pressed={open}
              className={
                'rounded-lg border p-4 text-left transition-colors ' +
                (open
                  ? 'border-sky-500 bg-sky-50 shadow-sm'
                  : 'border-slate-200 bg-white hover:border-slate-300')
              }
            >
              <div className="flex items-center gap-2">
                <span
                  className={
                    'inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ' +
                    (open ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-600')
                  }
                >
                  {i + 1}
                </span>
                <span className="text-sm font-semibold text-slate-900">{step.label}</span>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-slate-600">{step.question}</p>
            </button>
          );
        })}
      </div>

      {openId && sectionById[openId] && (
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          {(() => {
            const step = brief.workflow.find(s => s.id === openId)!;
            const section = sectionById[openId];
            return (
              <>
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="text-base font-semibold text-slate-900">{step.label}</h3>
                  <span className="text-xs font-medium uppercase tracking-wide text-sky-600">
                    Deliverable
                  </span>
                </div>
                <p className="mt-1 text-sm leading-relaxed text-slate-700">{section.memo_text}</p>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-md bg-slate-50 p-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Artifact to produce
                    </p>
                    <p className="mt-1 text-sm text-slate-700">{step.artifact}</p>
                  </div>
                  <div className="rounded-md bg-slate-50 p-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Evidence standard
                    </p>
                    <p className="mt-1 text-sm text-slate-700">{section.evidence_standard}</p>
                  </div>
                </div>

                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <p className="rounded-md border-l-2 border-rose-400 bg-rose-50/60 px-3 py-2 text-xs leading-relaxed text-rose-900">
                    <span className="font-semibold">Red flag:</span> {step.red_flag}
                  </p>
                  <p className="rounded-md border-l-2 border-amber-400 bg-amber-50/60 px-3 py-2 text-xs leading-relaxed text-amber-900">
                    <span className="font-semibold">Limit to name:</span> {section.limit}
                  </p>
                </div>
              </>
            );
          })()}
        </div>
      )}

      <div className="rounded-lg border border-slate-200 bg-slate-50 p-5">
        <h3 className="text-sm font-semibold text-slate-900">How the brief is graded</h3>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {brief.rubric.map(item => (
            <div key={item.criterion} className="rounded-md bg-white p-3 shadow-sm">
              <p className="text-sm font-semibold text-slate-800">{item.criterion}</p>
              <p className="mt-1 text-xs leading-relaxed text-slate-600">{item.why_it_matters}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
