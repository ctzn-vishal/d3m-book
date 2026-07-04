'use client';

import * as React from 'react';

type Estimate = {
  model?: string;
  metric?: string;
  kind?: string;
  estimate: number;
  ci_low: number;
  ci_high: number;
  treatment_mean?: number;
  control_mean?: number;
  r2?: number;
  n?: number;
};

type MilkData = {
  metadata: {
    rows: number;
    treatment: string;
    control: string;
  };
  balance: Estimate[];
  hte: Array<Estimate & { income_group: string; income_group_full: string }>;
  incomeDietCorrelation: number;
  summary: {
    overall_whole_share_effect_pp: number;
    low_income_effect_pp: number;
    diet_soda_placebo_pp: number;
    equal_price_stores: number;
    whole_expensive_stores: number;
  };
};

type ZillowData = {
  metadata: {
    rows: number;
    pre_months: number;
    post_months: number;
    treatment_start: string;
  };
  series: Array<{
    month: string;
    year: number;
    period: string;
    actual: number;
    synthetic: number;
    gap_pct: number;
  }>;
  annual: Array<{
    year: number;
    period: string;
    actual: number;
    synthetic: number;
    gap_pct: number;
  }>;
  weights: Array<{ state: string; weight: number }>;
  summary: {
    pre_rmse_log: number;
    avg_post_gap_pct: number;
    last_gap_pct: number;
    top_donor: string;
  };
};

type SoupData = {
  metadata: {
    rows: number;
    stores: number;
    start: string;
    end: string;
  };
  regressionLadder: Array<Estimate & { model: string; std_error: number; r2: number; n: number }>;
  linearModel?: {
    formula: string;
    coefficients: {
      intercept: number;
      price_progresso: number;
      price_campbell: number;
      price_pl: number;
    };
    r2: number;
    n: number;
    actual_vs_predicted_correlation: number;
    scenarios: Array<{
      label: string;
      price_progresso: number;
      price_campbell: number;
      price_pl: number;
      month: string;
      region: string;
      predicted_volume: number;
    }>;
  };
  crossPrice: Array<{
    region: string;
    own: number;
    campbell: number;
    private_label: number;
    r2: number;
    n: number;
  }>;
  seasonElasticity: Array<Estimate & { season: string; model: string }>;
  scatter: Array<{
    region: string;
    season: string;
    log_price: number;
    log_volume: number;
  }>;
  trendLines: Array<{
    group: string;
    x1: number;
    x2: number;
    y1: number;
    y2: number;
    slope: number;
  }>;
  pricing: {
    marginal_cost: number;
    baseline_price: number;
    baseline_volume: number;
    preferred_elasticity: number;
    optimal_price: number;
    raw_elasticity: number;
    raw_optimal_price: number;
    store_fe_optimal_price: number;
    seasonal?: {
      non_winter: { elasticity: number; optimal_price: number };
      winter: { elasticity: number; optimal_price: number };
    };
  };
};

type SouthwestData = {
  metadata: {
    rows: number;
    unit: string;
    source: string;
    title: string;
  };
  ladder: Array<Estimate & { model: string; std_error: number; r2: number; n: number }>;
  logModel: Estimate & { model: string; std_error: number; r2: number; n: number; pct_effect: number };
  scatter: Array<{ distance: number; fare: number; southwest: number }>;
};

type Part3Data = {
  articlePlan: Array<{
    number: string;
    slug: string;
    case: string;
    artifact: string;
  }>;
  milk: MilkData;
  zillow: ZillowData;
  soup: SoupData;
  southwest: SouthwestData;
};

const palette = {
  ink: '#172033',
  muted: '#64748b',
  grid: '#e2e8f0',
  blue: '#2563eb',
  navy: '#1f3a5f',
  orange: '#c87c2a',
  green: '#0f766e',
  red: '#dc2626',
  purple: '#7c3aed',
  amber: '#d97706',
};

const regionColors: Record<string, string> = {
  East: palette.blue,
  MidWest: palette.purple,
  South: palette.green,
  West: palette.red,
};

function fmtPct(value: number, digits = 0) {
  return `${(value * 100).toFixed(digits)}%`;
}

function fmtPctPoint(value: number, digits = 1) {
  return `${(value * 100).toFixed(digits)} pp`;
}

function fmtMoney(value: number, digits = 2) {
  return `$${value.toFixed(digits)}`;
}

function fmtNumber(value: number, digits = 2) {
  return value.toFixed(digits);
}

function scaleLinear(domain: [number, number], range: [number, number]) {
  const [d0, d1] = domain;
  const [r0, r1] = range;
  const denom = d1 - d0 || 1;
  return (value: number) => r0 + ((value - d0) / denom) * (r1 - r0);
}

function extent<T>(items: T[], accessor: (item: T) => number): [number, number] {
  const values = items.map(accessor).filter(Number.isFinite);
  return [Math.min(...values), Math.max(...values)];
}

function padded([min, max]: [number, number], pad = 0.08): [number, number] {
  const span = max - min || 1;
  return [min - span * pad, max + span * pad];
}

function xDate(month: string) {
  const [year, mm] = month.split('-').map(Number);
  return year + ((mm ?? 1) - 1) / 12;
}

function CardFrame({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3">
        <h3 className="text-sm font-semibold text-slate-950">{title}</h3>
        {subtitle && <p className="mt-1 text-xs leading-snug text-slate-500">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

function Legend({ items }: { items: Array<{ label: string; color: string }> }) {
  return (
    <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600">
      {items.map(item => (
        <span key={item.label} className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: item.color }} />
          {item.label}
        </span>
      ))}
    </div>
  );
}

export function Part3EvidencePlan({ data }: { data: Part3Data }) {
  const groups = [
    { chapter: '5', title: 'Counterfactuals and Experiments', range: ['5.1', '5.4'] },
    { chapter: '6', title: 'Regression and Identification', range: ['6.1', '6.4'] },
    { chapter: '7', title: 'Field Designs', range: ['7.1', '7.3'] },
    { chapter: '8', title: 'Pricing Strategy', range: ['8.1', '8.5'] },
  ];
  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-3">
        <div className="rounded-md border border-slate-200 bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Milk</p>
          <p className="mt-2 text-2xl font-semibold text-slate-950">{data.milk.summary.overall_whole_share_effect_pp} pp</p>
          <p className="mt-1 text-xs leading-snug text-slate-600">higher whole-milk share when milk fat levels are equally priced.</p>
        </div>
        <div className="rounded-md border border-slate-200 bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Zillow</p>
          <p className="mt-2 text-2xl font-semibold text-slate-950">{fmtPct(data.zillow.summary.avg_post_gap_pct, 1)}</p>
          <p className="mt-1 text-xs leading-snug text-slate-600">average post-2014 Colorado gap versus the synthetic comparison.</p>
        </div>
        <div className="rounded-md border border-slate-200 bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Soup</p>
          <p className="mt-2 text-2xl font-semibold text-slate-950">{fmtNumber(data.soup.pricing.preferred_elasticity, 2)}</p>
          <p className="mt-1 text-xs leading-snug text-slate-600">store fixed-effect own-price elasticity for Progresso volume.</p>
        </div>
      </div>
      <div className="grid gap-4 lg:grid-cols-5">
        {groups.map(group => {
          const articles = data.articlePlan.filter(item => {
            const n = Number(item.number);
            return n >= Number(group.range[0]) && n <= Number(group.range[1]);
          });
          return (
            <div key={group.chapter} className="rounded-md border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Chapter {group.chapter}</p>
              <h3 className="mt-1 text-sm font-semibold text-slate-950">{group.title}</h3>
              <div className="mt-3 space-y-2">
                {articles.map(item => (
                  <div key={item.slug} className="rounded-md bg-white p-2 ring-1 ring-slate-200">
                    <p className="text-xs font-semibold text-slate-900">{item.number}</p>
                    <p className="mt-1 text-[11px] leading-snug text-slate-600">{item.case}</p>
                    <p className="mt-1 text-[11px] leading-snug text-[#8a4b16]">{item.artifact}</p>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function CounterfactualWorlds() {
  const nodes = [
    { x: 60, y: 56, label: 'Same store, same month', fill: '#f8fafc' },
    { x: 270, y: 28, label: 'Observed: action taken', fill: '#eff6ff' },
    { x: 270, y: 126, label: 'Missing: action not taken', fill: '#fff7ed' },
    { x: 502, y: 28, label: 'Observed outcome', fill: '#dbeafe' },
    { x: 502, y: 126, label: 'Counterfactual outcome', fill: '#fed7aa' },
  ];
  return (
    <div className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
      <svg viewBox="0 0 720 230" className="h-auto w-full" role="img" aria-label="Observed and counterfactual worlds diagram.">
        <defs>
          <marker id="part3-arrow" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto" markerUnits="strokeWidth">
            <path d="M0,0 L0,6 L9,3 z" fill="#64748b" />
          </marker>
        </defs>
        <rect width="720" height="230" rx="8" fill="#ffffff" />
        <path d="M 220 86 C 250 62, 250 58, 270 58" stroke="#64748b" strokeWidth="2" fill="none" markerEnd="url(#part3-arrow)" />
        <path d="M 220 116 C 250 140, 250 156, 270 156" stroke="#c87c2a" strokeWidth="2" fill="none" strokeDasharray="5 4" markerEnd="url(#part3-arrow)" />
        <path d="M 438 58 L 502 58" stroke="#64748b" strokeWidth="2" markerEnd="url(#part3-arrow)" />
        <path d="M 438 156 L 502 156" stroke="#c87c2a" strokeWidth="2" strokeDasharray="5 4" markerEnd="url(#part3-arrow)" />
        {nodes.map(node => (
          <g key={node.label}>
            <rect x={node.x} y={node.y} width="168" height="62" rx="6" fill={node.fill} stroke="#cbd5e1" />
            <text x={node.x + 84} y={node.y + 28} textAnchor="middle" className="fill-slate-950 text-[13px] font-semibold">
              {node.label}
            </text>
            <text x={node.x + 84} y={node.y + 45} textAnchor="middle" className="fill-slate-500 text-[10px]">
              {node.label.includes('Missing') ? 'must be estimated' : 'seen in the data'}
            </text>
          </g>
        ))}
        <path d="M 586 92 C 600 110, 600 124, 586 126" stroke="#172033" strokeWidth="2" fill="none" />
        <text x="622" y="111" textAnchor="middle" className="fill-slate-950 text-[13px] font-semibold">effect</text>
      </svg>
    </div>
  );
}

export function MilkQuasiExperimentFigure({ data }: { data: MilkData }) {
  const rows = data.balance.filter(row => row.metric !== 'ZIP income');
  const incomeRow = data.balance.find(row => row.metric === 'ZIP income');
  const W = 760;
  const H = 240;
  const m = { top: 26, right: 34, bottom: 34, left: 190 };
  const x = scaleLinear([-0.03, 0.1], [m.left, W - m.right]);
  const yFor = (index: number) => m.top + 38 + index * 54;

  return (
    <div className="space-y-4">
      <CardFrame
        title="The placebo is quiet; the milk outcome moves"
        subtitle={`${data.metadata.rows.toLocaleString()} stores. Differences are equal-price stores minus whole-milk-expensive stores.`}
      >
        <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Milk balance, placebo, and outcome differences.">
          {[-0.02, 0, 0.04, 0.08].map(t => (
            <g key={t}>
              <line x1={x(t)} x2={x(t)} y1={m.top} y2={H - m.bottom} stroke={t === 0 ? '#94a3b8' : palette.grid} strokeDasharray={t === 0 ? '4 4' : undefined} />
              <text x={x(t)} y={H - 12} textAnchor="middle" className="fill-slate-500 text-[10px]">
                {t === 0 ? '0' : fmtPctPoint(t, 0)}
              </text>
            </g>
          ))}
          {rows.map((row, index) => {
            const y = yFor(index);
            const color = row.kind === 'outcome' ? palette.green : row.kind === 'placebo' ? palette.orange : palette.blue;
            return (
              <g key={row.metric}>
                <text x={m.left - 12} y={y + 4} textAnchor="end" className="fill-slate-700 text-[12px] font-medium">
                  {row.metric}
                </text>
                <line x1={x(row.ci_low)} x2={x(row.ci_high)} y1={y} y2={y} stroke={color} strokeWidth={3} />
                <circle cx={x(row.estimate)} cy={y} r={5} fill={color} />
                <text x={x(row.estimate) + 9} y={y + 4} className="fill-slate-600 text-[11px]">
                  {fmtPctPoint(row.estimate, 1)}
                </text>
              </g>
            );
          })}
        </svg>
        <Legend
          items={[
            { label: 'Balance check', color: palette.blue },
            { label: 'Placebo outcome', color: palette.orange },
            { label: 'Milk outcome', color: palette.green },
          ]}
        />
      </CardFrame>
      <div className="grid gap-3 md:grid-cols-3">
        <div className="rounded-md bg-slate-50 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Stores</p>
          <p className="mt-1 text-lg font-semibold text-slate-950">{data.summary.equal_price_stores.toLocaleString()} equal-price</p>
        </div>
        <div className="rounded-md bg-slate-50 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">ZIP income gap</p>
          <p className="mt-1 text-lg font-semibold text-slate-950">{incomeRow ? `$${Math.round(incomeRow.estimate)}` : '$0'}</p>
        </div>
        <div className="rounded-md bg-slate-50 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Diet-income correlation</p>
          <p className="mt-1 text-lg font-semibold text-slate-950">{fmtNumber(data.incomeDietCorrelation, 2)}</p>
        </div>
      </div>
    </div>
  );
}

export function MilkStudySummary({ data }: { data: MilkData }) {
  return (
    <div className="grid gap-3 md:grid-cols-3">
      <div className="rounded-md border border-slate-200 bg-white p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Equal-price stores</p>
        <p className="mt-2 text-2xl font-semibold text-slate-950">{data.summary.equal_price_stores.toLocaleString()}</p>
        <p className="mt-1 text-xs text-slate-600">compared with {data.summary.whole_expensive_stores.toLocaleString()} stores where whole milk is more expensive.</p>
      </div>
      <div className="rounded-md border border-slate-200 bg-white p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Whole-milk share</p>
        <p className="mt-2 text-2xl font-semibold text-slate-950">+{data.summary.overall_whole_share_effect_pp} pp</p>
        <p className="mt-1 text-xs text-slate-600">the main behavioral difference in the quasi-experimental comparison.</p>
      </div>
      <div className="rounded-md border border-slate-200 bg-white p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Diet-soda placebo</p>
        <p className="mt-2 text-2xl font-semibold text-slate-950">+{data.summary.diet_soda_placebo_pp} pp</p>
        <p className="mt-1 text-xs text-slate-600">a small difference on an outcome the milk price structure should not move.</p>
      </div>
    </div>
  );
}

export function MilkHeterogeneityFigure({ data }: { data: MilkData }) {
  const rows = data.hte;
  const W = 780;
  const H = 300;
  const m = { top: 24, right: 38, bottom: 36, left: 170 };
  const x = scaleLinear([0, 0.16], [m.left, W - m.right]);
  const yFor = (index: number) => m.top + 28 + index * 45;
  return (
    <CardFrame
      title="The price-structure effect is largest in lower-income ZIP codes"
      subtitle="Each interval is the equal-price minus whole-milk-expensive difference in whole-milk share."
    >
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Whole milk share effect by ZIP income group.">
        {[0, 0.04, 0.08, 0.12, 0.16].map(t => (
          <g key={t}>
            <line x1={x(t)} x2={x(t)} y1={m.top} y2={H - m.bottom} stroke={t === 0 ? '#94a3b8' : palette.grid} />
            <text x={x(t)} y={H - 12} textAnchor="middle" className="fill-slate-500 text-[10px]">{fmtPctPoint(t, 0)}</text>
          </g>
        ))}
        {rows.map((row, index) => {
          const y = yFor(index);
          const color = index === 0 ? palette.green : palette.blue;
          return (
            <g key={row.income_group}>
              <text x={m.left - 12} y={y + 4} textAnchor="end" className="fill-slate-700 text-[12px]">
                {row.income_group}
              </text>
              <line x1={x(Math.max(0, row.ci_low))} x2={x(row.ci_high)} y1={y} y2={y} stroke={color} strokeWidth={3} />
              <circle cx={x(row.estimate)} cy={y} r={5} fill={color} />
              <text x={x(row.estimate) + 9} y={y + 4} className="fill-slate-600 text-[11px]">{fmtPctPoint(row.estimate, 1)}</text>
            </g>
          );
        })}
      </svg>
    </CardFrame>
  );
}

export function ZillowSyntheticControl({ data, show = 'paths' }: { data: ZillowData; show?: 'paths' | 'gap' | 'weights' }) {
  if (show === 'weights') {
    const max = Math.max(...data.weights.map(d => d.weight));
    return (
      <CardFrame
        title="The synthetic Colorado is mostly Kansas, Massachusetts, Utah, and Michigan"
        subtitle="Weights are constrained to be nonnegative and sum to one."
      >
        <div className="space-y-3">
          {data.weights.map(row => (
            <div key={row.state}>
              <div className="mb-1 flex items-center justify-between text-xs text-slate-600">
                <span>{row.state}</span>
                <span>{fmtPct(row.weight, 1)}</span>
              </div>
              <div className="h-2 rounded-full bg-slate-100">
                <div className="h-2 rounded-full bg-[#2563eb]" style={{ width: `${(row.weight / max) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      </CardFrame>
    );
  }

  const points = data.series;
  const W = 820;
  const H = show === 'paths' ? 330 : 270;
  const m = { top: 20, right: 90, bottom: 38, left: 62 };
  const xDomain = extent(points, d => xDate(d.month));
  const yDomain = show === 'paths'
    ? padded([Math.min(...points.map(d => Math.min(d.actual, d.synthetic))), Math.max(...points.map(d => Math.max(d.actual, d.synthetic)))], 0.06)
    : padded(extent(points, d => d.gap_pct), 0.12);
  const x = scaleLinear(xDomain, [m.left, W - m.right]);
  const y = scaleLinear(yDomain, [H - m.bottom, m.top]);
  const pathFor = (field: 'actual' | 'synthetic' | 'gap_pct') =>
    points.map((d, i) => `${i === 0 ? 'M' : 'L'} ${x(xDate(d.month)).toFixed(2)} ${y(d[field]).toFixed(2)}`).join(' ');
  const eventX = x(2014);

  return (
    <CardFrame
      title={show === 'paths' ? 'Colorado separates from its synthetic comparison after 2014' : 'The post-2014 housing gap stays positive'}
      subtitle={show === 'paths' ? `Pre-period fit uses ${data.metadata.pre_months} months before ${data.metadata.treatment_start}.` : `Average post-period gap: ${fmtPct(data.summary.avg_post_gap_pct, 1)}.`}
    >
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Colorado actual versus synthetic control.">
        {[1996, 2002, 2008, 2014, 2020].map(t => (
          <g key={t}>
            <line x1={x(t)} x2={x(t)} y1={m.top} y2={H - m.bottom} stroke={palette.grid} />
            <text x={x(t)} y={H - 12} textAnchor="middle" className="fill-slate-500 text-[10px]">{t}</text>
          </g>
        ))}
        {(show === 'paths' ? [100000, 200000, 300000, 400000] : [-0.1, 0, 0.1, 0.2, 0.3]).map(t => (
          <g key={t}>
            <line x1={m.left} x2={W - m.right} y1={y(t)} y2={y(t)} stroke={t === 0 ? '#94a3b8' : palette.grid} strokeDasharray={t === 0 ? '4 4' : undefined} />
            <text x={m.left - 8} y={y(t) + 4} textAnchor="end" className="fill-slate-500 text-[10px]">{show === 'paths' ? `$${Math.round(t / 1000)}k` : fmtPct(t, 0)}</text>
          </g>
        ))}
        <rect x={eventX} y={m.top} width={W - m.right - eventX} height={H - m.bottom - m.top} fill="#f8fafc" />
        <line x1={eventX} x2={eventX} y1={m.top} y2={H - m.bottom} stroke={palette.orange} strokeWidth={2} strokeDasharray="5 4" />
        <text x={eventX + 6} y={m.top + 12} className="fill-[#8a4b16] text-[10px]">2014</text>
        {show === 'paths' ? (
          <>
            <path d={pathFor('synthetic')} fill="none" stroke={palette.orange} strokeWidth={3} />
            <path d={pathFor('actual')} fill="none" stroke={palette.blue} strokeWidth={3} />
            <text x={W - m.right + 10} y={y(points[points.length - 1].actual) + 4} className="fill-[#2563eb] text-[11px]">Colorado</text>
            <text x={W - m.right + 10} y={y(points[points.length - 1].synthetic) + 4} className="fill-[#c87c2a] text-[11px]">synthetic</text>
          </>
        ) : (
          <>
            <path d={pathFor('gap_pct')} fill="none" stroke={palette.green} strokeWidth={3} />
            {points.filter(d => d.year >= 2014 && d.year % 2 === 0).map(d => (
              <circle key={d.month} cx={x(xDate(d.month))} cy={y(d.gap_pct)} r={3} fill={palette.green} />
            ))}
          </>
        )}
      </svg>
    </CardFrame>
  );
}

export function SoupRegressionLadder({ data }: { data: SoupData }) {
  const rows = data.regressionLadder;
  const W = 820;
  const H = 340;
  const m = { top: 22, right: 90, bottom: 42, left: 185 };
  const x = scaleLinear([-3.45, -2.05], [m.left, W - m.right]);
  const yFor = (index: number) => m.top + 34 + index * 52;
  return (
    <CardFrame
      title="The elasticity estimate changes as the comparison gets cleaner"
      subtitle={`${data.metadata.rows.toLocaleString()} store-months across ${data.metadata.stores.toLocaleString()} stores. Coefficient is on log(Progresso price).`}
    >
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Soup regression coefficient ladder.">
        {[-3.4, -3.0, -2.6, -2.2].map(t => (
          <g key={t}>
            <line x1={x(t)} x2={x(t)} y1={m.top} y2={H - m.bottom} stroke={palette.grid} />
            <text x={x(t)} y={H - 14} textAnchor="middle" className="fill-slate-500 text-[10px]">{t.toFixed(1)}</text>
          </g>
        ))}
        {rows.map((row, index) => {
          const y = yFor(index);
          const color = index === rows.length - 1 ? palette.green : [palette.blue, palette.orange, palette.purple, palette.red][index] ?? palette.blue;
          return (
            <g key={row.model}>
              <text x={m.left - 12} y={y + 4} textAnchor="end" className="fill-slate-700 text-[12px]">
                {row.model}
              </text>
              <line x1={x(row.ci_low)} x2={x(row.ci_high)} y1={y} y2={y} stroke={color} strokeWidth={3} />
              <circle cx={x(row.estimate)} cy={y} r={5} fill={color} />
              <text x={x(row.estimate) + 9} y={y + 4} className="fill-slate-600 text-[11px]">{fmtNumber(row.estimate, 2)}</text>
              <text x={W - m.right + 8} y={y + 4} className="fill-slate-500 text-[10px]">R2 {fmtNumber(row.r2, 2)}</text>
            </g>
          );
        })}
        <text x={(m.left + W - m.right) / 2} y={H - 4} textAnchor="middle" className="fill-slate-500 text-[10px]">Elasticity-style coefficient</text>
      </svg>
    </CardFrame>
  );
}

export function SouthwestRegressionLadder({ data }: { data: SouthwestData }) {
  const rows = data.ladder;
  const W = 820;
  const H = 260;
  const m = { top: 22, right: 90, bottom: 42, left: 185 };
  const rawDomain = extent(
    rows.flatMap(row => [row.ci_low, row.ci_high]),
    value => value
  );
  const [dMin, dMax] = padded(rawDomain, 0.12);
  const gridStart = Math.floor(dMin / 20) * 20;
  const gridEnd = Math.ceil(dMax / 20) * 20;
  const gridSteps: number[] = [];
  for (let t = gridStart; t <= gridEnd; t += 20) gridSteps.push(t);
  const x = scaleLinear([dMin, dMax], [m.left, W - m.right]);
  const yFor = (index: number) => m.top + 34 + index * 52;
  return (
    <CardFrame
      title="The Southwest effect shrinks once distance and competition are held constant"
      subtitle={`${data.metadata.rows.toLocaleString()} ${data.metadata.unit} pairs. Coefficient is the fare gap associated with a Southwest-served route.`}
    >
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Southwest Airlines regression coefficient ladder.">
        {gridSteps.map(t => (
          <g key={t}>
            <line x1={x(t)} x2={x(t)} y1={m.top} y2={H - m.bottom} stroke={t === 0 ? '#94a3b8' : palette.grid} strokeDasharray={t === 0 ? '4 4' : undefined} />
            <text x={x(t)} y={H - 14} textAnchor="middle" className="fill-slate-500 text-[10px]">{fmtMoney(t, 0)}</text>
          </g>
        ))}
        {rows.map((row, index) => {
          const y = yFor(index);
          const color = index === rows.length - 1 ? palette.green : [palette.blue, palette.orange, palette.purple, palette.red][index] ?? palette.blue;
          return (
            <g key={row.model}>
              <text x={m.left - 12} y={y + 4} textAnchor="end" className="fill-slate-700 text-[12px]">
                {row.model}
              </text>
              <line x1={x(row.ci_low)} x2={x(row.ci_high)} y1={y} y2={y} stroke={color} strokeWidth={3} />
              <circle cx={x(row.estimate)} cy={y} r={5} fill={color} />
              <text x={x(row.estimate) + 9} y={y + 4} className="fill-slate-600 text-[11px]">{fmtMoney(row.estimate, 0)}</text>
              <text x={W - m.right + 8} y={y + 4} className="fill-slate-500 text-[10px]">R2 {fmtNumber(row.r2, 2)}</text>
            </g>
          );
        })}
        <text x={(m.left + W - m.right) / 2} y={H - 4} textAnchor="middle" className="fill-slate-500 text-[10px]">Fare gap versus routes without Southwest</text>
      </svg>
    </CardFrame>
  );
}

export function SoupSeasonScatter({ data, groupBy = 'season' }: { data: SoupData; groupBy?: 'season' | 'region' }) {
  const groups = groupBy === 'season' ? ['Winter', 'Non-winter'] : ['East', 'MidWest', 'South', 'West'];
  const W = 360;
  const H = 260;
  const m = { top: 18, right: 18, bottom: 36, left: 42 };
  const xDomain = padded(extent(data.scatter, d => d.log_price), 0.05);
  const yDomain = padded(extent(data.scatter, d => d.log_volume), 0.05);
  const x = scaleLinear(xDomain, [m.left, W - m.right]);
  const y = scaleLinear(yDomain, [H - m.bottom, m.top]);
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {groups.map(group => {
        const points = data.scatter.filter(d => groupBy === 'season' ? d.season === group : d.region === group);
        const line = data.trendLines.find(d => d.group === group);
        const color = groupBy === 'season'
          ? group === 'Winter' ? palette.navy : palette.orange
          : regionColors[group] ?? palette.blue;
        return (
          <CardFrame key={group} title={group} subtitle={line ? `Sample trend slope ${fmtNumber(line.slope, 2)}` : undefined}>
            <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label={`Log price and log volume scatter for ${group}.`}>
              {[xDomain[0], (xDomain[0] + xDomain[1]) / 2, xDomain[1]].map(t => (
                <g key={`x-${t}`}>
                  <line x1={x(t)} x2={x(t)} y1={m.top} y2={H - m.bottom} stroke="#f1f5f9" />
                  <text x={x(t)} y={H - 13} textAnchor="middle" className="fill-slate-400 text-[9px]">{t.toFixed(1)}</text>
                </g>
              ))}
              {[yDomain[0], (yDomain[0] + yDomain[1]) / 2, yDomain[1]].map(t => (
                <g key={`y-${t}`}>
                  <line x1={m.left} x2={W - m.right} y1={y(t)} y2={y(t)} stroke={palette.grid} />
                  <text x={m.left - 6} y={y(t) + 3} textAnchor="end" className="fill-slate-400 text-[9px]">{t.toFixed(1)}</text>
                </g>
              ))}
              {points.map((point, i) => (
                <circle key={i} cx={x(point.log_price)} cy={y(point.log_volume)} r={2.2} fill={color} opacity={0.3} />
              ))}
              {line && (
                <line x1={x(line.x1)} y1={y(line.y1)} x2={x(line.x2)} y2={y(line.y2)} stroke={color} strokeWidth={3} />
              )}
              <text x={W / 2} y={H - 2} textAnchor="middle" className="fill-slate-500 text-[10px]">log price</text>
              <text x={14} y={120} textAnchor="middle" transform="rotate(-90 14 120)" className="fill-slate-500 text-[10px]">log volume</text>
            </svg>
          </CardFrame>
        );
      })}
    </div>
  );
}

export function SoupCrossPriceHeatmap({ data }: { data: SoupData }) {
  const rows = data.crossPrice;
  const columns = [
    { key: 'own', label: 'Progresso price' },
    { key: 'campbell', label: 'Campbell price' },
    { key: 'private_label', label: 'Private label price' },
  ] as const;
  const colorFor = (value: number) => {
    if (value < 0) return '#dbeafe';
    if (value > 1.5) return '#dcfce7';
    if (value > 0.5) return '#fef3c7';
    return '#f8fafc';
  };
  return (
    <div className="overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 bg-slate-50 p-4">
        <h3 className="text-sm font-semibold text-slate-950">Substitution differs sharply by region</h3>
        <p className="mt-1 text-xs text-slate-500">Positive cross-price elasticity means Progresso gains volume when a rival price rises.</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm tabular-nums">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="px-3 py-2 text-left font-semibold">Region</th>
              {columns.map(col => <th key={col.key} className="px-3 py-2 text-right font-semibold">{col.label}</th>)}
            </tr>
          </thead>
          <tbody>
            {rows.map(row => (
              <tr key={row.region} className="border-b border-slate-100">
                <td className="px-3 py-2 font-medium text-slate-900">{row.region}</td>
                {columns.map(col => {
                  const value = row[col.key];
                  return (
                    <td key={col.key} className="px-3 py-2 text-right" style={{ background: colorFor(value) }}>
                      {fmtNumber(value, 2)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function PricingOptimizer({ data }: { data: SoupData }) {
  const [elasticity, setElasticity] = React.useState(data.pricing.preferred_elasticity);
  const [cost, setCost] = React.useState(data.pricing.marginal_cost);
  const currentPrice = data.pricing.baseline_price;
  const currentVolume = data.pricing.baseline_volume;
  const optimal = elasticity < -1 ? cost / (1 + 1 / elasticity) : Number.NaN;
  const prices = Array.from({ length: 44 }, (_, i) => 0.85 + i * 0.045);
  const curve = prices.map(price => {
    const quantity = currentVolume * (price / currentPrice) ** elasticity;
    return {
      price,
      quantity,
      revenue: price * quantity,
      profit: (price - cost) * quantity,
    };
  });
  const W = 760;
  const H = 320;
  const m = { top: 18, right: 52, bottom: 42, left: 58 };
  const x = scaleLinear(extent(curve, d => d.price), [m.left, W - m.right]);
  const y = scaleLinear(padded(extent(curve, d => d.profit), 0.08), [H - m.bottom, m.top]);
  const path = curve.map((d, i) => `${i === 0 ? 'M' : 'L'} ${x(d.price).toFixed(2)} ${y(d.profit).toFixed(2)}`).join(' ');
  const optY = Number.isFinite(optimal)
    ? y((optimal - cost) * currentVolume * (optimal / currentPrice) ** elasticity)
    : 0;

  return (
    <div className="space-y-4 rounded-md border border-slate-200 bg-white p-4 shadow-sm">
      <div className="grid gap-4 lg:grid-cols-[1fr_270px]">
        <div>
          <h3 className="text-sm font-semibold text-slate-950">Optimal price under constant elasticity</h3>
          <p className="mt-1 text-xs leading-snug text-slate-500">
            Move elasticity and marginal cost to see why the same formula is a decision aid, not a policy by itself.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-md bg-slate-50 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Optimal price</p>
            <p className="mt-1 text-xl font-semibold text-slate-950">{Number.isFinite(optimal) ? fmtMoney(optimal) : 'n/a'}</p>
          </div>
          <div className="rounded-md bg-slate-50 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Current avg.</p>
            <p className="mt-1 text-xl font-semibold text-slate-950">{fmtMoney(currentPrice)}</p>
          </div>
        </div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Profit curve under constant elasticity pricing.">
        {[1.0, 1.4, 1.8, 2.2, 2.6].map(t => (
          <g key={t}>
            <line x1={x(t)} x2={x(t)} y1={m.top} y2={H - m.bottom} stroke="#f1f5f9" />
            <text x={x(t)} y={H - 13} textAnchor="middle" className="fill-slate-500 text-[10px]">{fmtMoney(t, 1)}</text>
          </g>
        ))}
        <path d={path} fill="none" stroke={palette.green} strokeWidth={3} />
        <line x1={x(currentPrice)} x2={x(currentPrice)} y1={m.top} y2={H - m.bottom} stroke={palette.orange} strokeDasharray="5 4" />
        <text x={x(currentPrice) + 5} y={m.top + 12} className="fill-[#8a4b16] text-[10px]">current</text>
        {Number.isFinite(optimal) && (
          <>
            <line x1={x(optimal)} x2={x(optimal)} y1={m.top} y2={H - m.bottom} stroke={palette.green} strokeDasharray="5 4" />
            <circle cx={x(optimal)} cy={optY} r={5} fill={palette.green} />
            <text x={x(optimal) + 6} y={optY - 8} className="fill-[#0f766e] text-[10px]">formula optimum</text>
          </>
        )}
        <text x={W / 2} y={H - 4} textAnchor="middle" className="fill-slate-500 text-[10px]">Price</text>
        <text x={16} y={H / 2} textAnchor="middle" transform={`rotate(-90 16 ${H / 2})`} className="fill-slate-500 text-[10px]">Relative profit</text>
      </svg>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="text-xs font-medium text-slate-700">
          Elasticity: <span className="font-semibold text-slate-950">{fmtNumber(elasticity, 2)}</span>
          <input
            className="mt-2 w-full accent-[#0f766e]"
            type="range"
            min="-4.5"
            max="-1.1"
            step="0.05"
            value={elasticity}
            onChange={event => setElasticity(Number(event.target.value))}
          />
        </label>
        <label className="text-xs font-medium text-slate-700">
          Marginal cost: <span className="font-semibold text-slate-950">{fmtMoney(cost)}</span>
          <input
            className="mt-2 w-full accent-[#c87c2a]"
            type="range"
            min="0.65"
            max="1.35"
            step="0.01"
            value={cost}
            onChange={event => setCost(Number(event.target.value))}
          />
        </label>
      </div>
    </div>
  );
}

export function SeasonalOptimalPriceCompare({ data }: { data: SoupData }) {
  const seasonal = data.pricing.seasonal;
  if (!seasonal) return null;
  const higherPriceSeason = seasonal.winter.optimal_price >= seasonal.non_winter.optimal_price ? 'Winter' : 'Non-winter';
  const lessElasticSeason = Math.abs(seasonal.winter.elasticity) <= Math.abs(seasonal.non_winter.elasticity) ? 'Winter' : 'Non-winter';
  return (
    <div className="space-y-3">
      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-md border border-slate-200 bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Non-winter</p>
          <p className="mt-2 text-2xl font-semibold text-slate-950">{fmtMoney(seasonal.non_winter.optimal_price)}</p>
          <p className="mt-1 text-xs text-slate-600">optimal price at an elasticity of {fmtNumber(seasonal.non_winter.elasticity, 2)}.</p>
        </div>
        <div className="rounded-md border border-slate-200 bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Winter</p>
          <p className="mt-2 text-2xl font-semibold text-slate-950">{fmtMoney(seasonal.winter.optimal_price)}</p>
          <p className="mt-1 text-xs text-slate-600">optimal price at an elasticity of {fmtNumber(seasonal.winter.elasticity, 2)}.</p>
        </div>
      </div>
      <p className="text-xs leading-snug text-slate-500">
        {higherPriceSeason} carries the higher optimal price: demand is less elastic in {lessElasticSeason.toLowerCase()} ({fmtNumber(seasonal[lessElasticSeason === 'Winter' ? 'winter' : 'non_winter'].elasticity, 2)} vs. {fmtNumber(seasonal[lessElasticSeason === 'Winter' ? 'non_winter' : 'winter'].elasticity, 2)}), so a bigger markup still clears at a similar quantity.
      </p>
    </div>
  );
}

export function IdentificationMemoCard({
  title,
  rows,
}: {
  title: string;
  rows: Array<{ label: string; value: string }>;
}) {
  return (
    <div className="overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 bg-slate-950 p-4 text-white">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-300">Identification memo</p>
        <h3 className="mt-1 text-base font-semibold">{title}</h3>
      </div>
      <div className="divide-y divide-slate-100">
        {rows.map(row => (
          <div key={row.label} className="grid gap-2 px-4 py-3 text-sm md:grid-cols-[160px_1fr]">
            <p className="font-semibold text-slate-900">{row.label}</p>
            <p className="leading-relaxed text-slate-600">{row.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function CausalDesignSelector() {
  const designs = [
    {
      design: 'Experiment',
      comparison: 'Random assignment creates treatment and control groups.',
      use: 'Best for coupons, page design, product messages, and staged tests.',
      risk: 'Spillovers, short-run metrics, and underpowered segments.',
      color: palette.blue,
    },
    {
      design: 'Difference-in-differences',
      comparison: 'Compare the change for treated units with the change for control units.',
      use: 'Useful for rollouts, policy shocks, or market launches.',
      risk: 'Parallel trends may fail.',
      color: palette.orange,
    },
    {
      design: 'Synthetic control',
      comparison: 'Build a weighted business twin when one unit is treated.',
      use: 'Useful for one-city launches, state policy changes, or unique shocks.',
      risk: 'Poor pre-period fit weakens the counterfactual.',
      color: palette.green,
    },
    {
      design: 'Fixed effects',
      comparison: 'Compare each unit to itself over time after common shocks.',
      use: 'Useful for store, product, market, and week panels.',
      risk: 'Time-varying confounders can remain.',
      color: palette.purple,
    },
  ];
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {designs.map(item => (
        <article key={item.design} className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full" style={{ background: item.color }} />
            <h3 className="text-sm font-semibold text-slate-950">{item.design}</h3>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-slate-700">{item.comparison}</p>
          <p className="mt-3 text-xs leading-relaxed text-slate-600"><span className="font-semibold text-slate-950">Use when: </span>{item.use}</p>
          <p className="mt-2 text-xs leading-relaxed text-amber-800"><span className="font-semibold">Watch: </span>{item.risk}</p>
        </article>
      ))}
    </div>
  );
}

export function Part3CapstoneBrief({ data }: { data: Part3Data }) {
  const items = [
    {
      title: 'Milk field data',
      finding: `Equal pricing is associated with ${data.milk.summary.overall_whole_share_effect_pp} percentage points higher whole-milk share.`,
      action: 'Use price structure as a quasi-experimental lesson, then ask whether the same nudge should be tested in Bean & Basket categories.',
      caution: 'The design depends on price structure being independent of local demand conditions.',
    },
    {
      title: 'Zillow counterfactual',
      finding: `Colorado is ${fmtPct(data.zillow.summary.avg_post_gap_pct, 1)} above the synthetic path after 2014 on average.`,
      action: 'Use synthetic control to separate a treated market from national housing movement before making a policy or launch claim.',
      caution: 'The treated unit may differ in post-period shocks not captured by donor weights.',
    },
    {
      title: 'Soup pricing panel',
      finding: `The preferred Progresso elasticity is ${fmtNumber(data.soup.pricing.preferred_elasticity, 2)}, implying an illustrative price near ${fmtMoney(data.soup.pricing.optimal_price)} when marginal cost is $1.`,
      action: 'Use the elasticity as a pricing hypothesis, then validate with a controlled or staggered field test.',
      caution: 'Historical prices can still reflect expected demand, promotions, or local competitive moves.',
    },
  ];
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {items.map(item => (
        <article key={item.title} className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-950">{item.title}</h3>
          <p className="mt-3 text-sm leading-relaxed text-slate-800">{item.finding}</p>
          <p className="mt-3 border-l-2 border-[#0f766e] pl-3 text-xs leading-relaxed text-slate-700">{item.action}</p>
          <p className="mt-3 text-xs leading-relaxed text-amber-800">{item.caution}</p>
        </article>
      ))}
    </div>
  );
}

export function PanelFixedEffectsVisual() {
  const [centered, setCentered] = React.useState(false);

  const storeA = [
    { p: 2.1, v: 8.5, label: 'Store A (Suburban) - Week 1' },
    { p: 2.2, v: 8.3, label: 'Store A (Suburban) - Week 2' },
    { p: 2.3, v: 8.2, label: 'Store A (Suburban) - Week 3' },
    { p: 2.4, v: 8.0, label: 'Store A (Suburban) - Week 4' },
    { p: 2.5, v: 7.8, label: 'Store A (Suburban) - Week 5' },
  ];

  const storeB = [
    { p: 1.3, v: 6.2, label: 'Store B (Urban) - Week 1' },
    { p: 1.4, v: 6.0, label: 'Store B (Urban) - Week 2' },
    { p: 1.5, v: 5.9, label: 'Store B (Urban) - Week 3' },
    { p: 1.6, v: 5.7, label: 'Store B (Urban) - Week 4' },
    { p: 1.7, v: 5.5, label: 'Store B (Urban) - Week 5' },
  ];

  const meanA = { p: 2.3, v: 8.16 };
  const meanB = { p: 1.5, v: 5.86 };

  // Dimensions
  const W = 640;
  const H = 320;
  const m = { top: 30, right: 120, bottom: 45, left: 60 };

  // Scales for Pooled
  const xPool = scaleLinear([1.0, 2.8], [m.left, W - m.right]);
  const yPool = scaleLinear([5.0, 9.2], [H - m.bottom, m.top]);

  // Scales for Centered
  const xCent = scaleLinear([-0.8, 0.8], [m.left, W - m.right]);
  const yCent = scaleLinear([-1.2, 1.2], [H - m.bottom, m.top]);

  return (
    <CardFrame
      title="How Store Fixed Effects Isolate Within-Store Price Sensitivity"
      subtitle={centered ? "Within-Store centered (Each store's demographic mean is subtracted, exposing clean negative slope)" : "Pooled raw comparisons (Confounded by neighborhood demographics, creating a false positive slope)"}
    >
      <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex gap-2">
          <button
            onClick={() => setCentered(false)}
            className={`rounded px-3 py-1.5 text-xs font-semibold transition-all ${
              !centered
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            1. Pooled Data (Naive)
          </button>
          <button
            onClick={() => setCentered(true)}
            className={`rounded px-3 py-1.5 text-xs font-semibold transition-all ${
              centered
                ? 'bg-[#0f766e] text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            2. Centered Data (Fixed Effects)
          </button>
        </div>
        <div className="flex gap-4 text-xs font-medium">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-blue-600" /> Store A (Suburban)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-purple-600" /> Store B (Urban)
          </span>
        </div>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Pooled vs Centered panel data comparison.">
        {/* Draw Axes & Labels */}
        {!centered ? (
          <>
            {/* Pooled Gridlines */}
            {[1.2, 1.6, 2.0, 2.4].map(p => (
              <g key={`p-${p}`}>
                <line x1={xPool(p)} x2={xPool(p)} y1={m.top} y2={H - m.bottom} stroke={palette.grid} strokeDasharray="3 3" />
                <text x={xPool(p)} y={H - 12} textAnchor="middle" className="fill-slate-500 text-[10px]">${p.toFixed(2)}</text>
              </g>
            ))}
            {[6.0, 7.0, 8.0, 9.0].map(v => (
              <g key={`v-${v}`}>
                <line x1={m.left} x2={W - m.right} y1={yPool(v)} y2={yPool(v)} stroke={palette.grid} strokeDasharray="3 3" />
                <text x={m.left - 8} y={yPool(v) + 3} textAnchor="end" className="fill-slate-500 text-[10px]">{v.toFixed(0)}k</text>
              </g>
            ))}
            {/* Axes titles */}
            <text x={(m.left + W - m.right) / 2} y={H - 4} textAnchor="middle" className="fill-slate-700 text-[11px] font-bold">Latte Price ($)</text>
            <text x={16} y={(m.top + H - m.bottom) / 2} textAnchor="middle" transform={`rotate(-90 16 ${(m.top + H - m.bottom) / 2})`} className="fill-slate-700 text-[11px] font-bold">Latte Sales (Weekly Volume)</text>

            {/* Mean centers */}
            <circle cx={xPool(meanA.p)} cy={yPool(meanA.v)} r={6} fill="none" stroke="blue" strokeWidth={2} strokeDasharray="2 2" />
            <text x={xPool(meanA.p) + 8} y={yPool(meanA.v) - 6} className="fill-blue-800 text-[10px] font-semibold">Store A Avg</text>

            <circle cx={xPool(meanB.p)} cy={yPool(meanB.v)} r={6} fill="none" stroke="purple" strokeWidth={2} strokeDasharray="2 2" />
            <text x={xPool(meanB.p) + 8} y={yPool(meanB.v) + 12} className="fill-purple-800 text-[10px] font-semibold">Store B Avg</text>

            {/* Confounded Pooled Regression Line (Positive Slope) */}
            <line x1={xPool(1.1)} y1={yPool(5.4)} x2={xPool(2.7)} y2={yPool(8.8)} stroke="#64748b" strokeWidth={2.5} strokeDasharray="4 4" />
            <text x={xPool(2.2)} y={yPool(7.8) - 15} transform={`rotate(-18 ${xPool(2.2)} ${yPool(7.8)})`} className="fill-slate-600 text-[11px] font-bold italic">Pooled OLS Slope (+2.88)</text>
          </>
        ) : (
          <>
            {/* Centered Gridlines */}
            {[-0.6, -0.3, 0, 0.3, 0.6].map(p => (
              <g key={`cp-${p}`}>
                <line x1={xCent(p)} x2={xCent(p)} y1={m.top} y2={H - m.bottom} stroke={palette.grid} strokeDasharray="3 3" />
                <text x={xCent(p)} y={H - 12} textAnchor="middle" className="fill-slate-500 text-[10px]">{p > 0 ? `+${p.toFixed(1)}` : p.toFixed(1)}</text>
              </g>
            ))}
            {[-0.8, -0.4, 0, 0.4, 0.8].map(v => (
              <g key={`cv-${v}`}>
                <line x1={m.left} x2={W - m.right} y1={yCent(v)} y2={yCent(v)} stroke={palette.grid} strokeDasharray="3 3" />
                <text x={m.left - 8} y={yCent(v) + 3} textAnchor="end" className="fill-slate-500 text-[10px]">{v > 0 ? `+${v.toFixed(1)}` : v.toFixed(1)}</text>
              </g>
            ))}
            {/* Axes titles */}
            <text x={(m.left + W - m.right) / 2} y={H - 4} textAnchor="middle" className="fill-slate-700 text-[11px] font-bold">Centered Price (Deviations from Store Mean)</text>
            <text x={16} y={(m.top + H - m.bottom) / 2} textAnchor="middle" transform={`rotate(-90 16 ${(m.top + H - m.bottom) / 2})`} className="fill-slate-700 text-[11px] font-bold">Centered Sales (Deviations from Store Mean)</text>

            {/* Zero axes */}
            <line x1={m.left} x2={W - m.right} y1={yCent(0)} y2={yCent(0)} stroke="#94a3b8" strokeWidth={1} />
            <line x1={xCent(0)} x2={xCent(0)} y1={m.top} y2={H - m.bottom} stroke="#94a3b8" strokeWidth={1} />

            {/* Causal Fixed Effects regression line (Negative slope) */}
            <line x1={xCent(-0.5)} y1={yCent(0.85)} x2={xCent(0.5)} y2={yCent(-0.85)} stroke="#0f766e" strokeWidth={3} />
            <text x={xCent(0.25)} y={yCent(-0.45) - 10} transform={`rotate(-28 ${xCent(0.25)} ${yCent(-0.45)})`} className="fill-[#0f766e] text-[11px] font-bold">Store Fixed-Effects Slope (-1.75)</text>
          </>
        )}

        {/* Data points for Store A */}
        {storeA.map((d, i) => {
          const cx = !centered ? xPool(d.p) : xCent(d.p - meanA.p);
          const cy = !centered ? yPool(d.v) : yCent(d.v - meanA.v);
          return (
            <g key={`A-${i}`} className="transition-all duration-700 ease-in-out">
              <circle cx={cx} cy={cy} r={6.5} fill="#2563eb" fillOpacity={0.85} stroke="#1d4ed8" strokeWidth={1.5} />
              {!centered && (
                <text x={cx + 9} y={cy + 3} className="fill-blue-900 text-[8px]">W{i+1}</text>
              )}
            </g>
          );
        })}

        {/* Data points for Store B */}
        {storeB.map((d, i) => {
          const cx = !centered ? xPool(d.p) : xCent(d.p - meanB.p);
          const cy = !centered ? yPool(d.v) : yCent(d.v - meanB.v);
          return (
            <g key={`B-${i}`} className="transition-all duration-700 ease-in-out">
              <circle cx={cx} cy={cy} r={6.5} fill="#9333ea" fillOpacity={0.85} stroke="#7e22ce" strokeWidth={1.5} />
              {!centered && (
                <text x={cx + 9} y={cy + 3} className="fill-purple-900 text-[8px]">W{i+1}</text>
              )}
            </g>
          );
        })}
      </svg>

      <div className="mt-4 rounded bg-slate-50 p-3 text-[11px] leading-relaxed text-slate-600">
        {!centered ? (
          <p>
            <strong>What to notice:</strong> Suburban Store A operates in a high-income area with high baseline demand ($V_A = 8.16k$) and has higher average pricing ($P_A = $2.30$). Urban Store B operates in a lower-income area with lower demand ($V_B = 5.86k$) and lower average prices ($P_B = $1.50$). If we naively pool them, the regression compares across stores, producing a false positive slope (+2.88) which suggests that raising prices increases demand.
          </p>
        ) : (
          <p>
            <strong>What to notice:</strong> By subtracting each store's own mean price and mean sales volume (demeaning), we translate all points to the origin $(0,0)$. The stable demographic differences are absorbed, and the data points overlap perfectly. This exposes the true *within-store* elasticity of -1.75, showing that when any single store changes its price relative to its baseline, sales respond negatively.
          </p>
        )}
      </div>
    </CardFrame>
  );
}

export function DiDParallelTrendsVisual() {
  const [view, setView] = React.useState<'naive_time' | 'naive_space' | 'did'>('did');

  // Coordinates
  // Left side (Pre): X = 120
  // Right side (Post): X = 480
  const xPre = 120;
  const xPost = 480;

  // Treated points: Before = 100k (Y=200), After = 130k (Y=110)
  const yTreatedPre = 200;
  const yTreatedPost = 110;

  // Control points: Before = 90k (Y=230), After = 100k (Y=200)
  const yControlPre = 230;
  const yControlPost = 200;

  // Counterfactual Treated: Before = 100k (Y=200), After = 110k (Y=170)
  const yCounterfactual = 170;

  return (
    <CardFrame
      title="Difference-in-Differences vs. Naive Causal Comparisons"
      subtitle={
        view === 'naive_time'
          ? "Naive Before vs. After (Compares treated stores to their own history, capturing seasonal spikes as false lift (+30))"
          : view === 'naive_space'
          ? "Naive Treated vs. Control (Compares post-period cross-section, capturing permanent region differences as false lift (+30))"
          : "Difference-in-Differences (Subtracts the control group's trend to isolate the true causal app lift of +20)"
      }
    >
      <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex gap-2">
          <button
            onClick={() => setView('naive_time')}
            className={`rounded px-3 py-1.5 text-xs font-semibold transition-all ${
              view === 'naive_time'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            1. Naive Before/After
          </button>
          <button
            onClick={() => setView('naive_space')}
            className={`rounded px-3 py-1.5 text-xs font-semibold transition-all ${
              view === 'naive_space'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            2. Naive Treated vs. Control
          </button>
          <button
            onClick={() => setView('did')}
            className={`rounded px-3 py-1.5 text-xs font-semibold transition-all ${
              view === 'did'
                ? 'bg-[#0f766e] text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            3. Difference-in-Differences
          </button>
        </div>
        <div className="flex gap-4 text-xs font-medium">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#0f766e]" /> Treated Stores (West)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-slate-400" /> Control Stores (East)
          </span>
        </div>
      </div>

      <svg viewBox="0 0 600 300" className="h-auto w-full" role="img" aria-label="Difference-in-Differences parallel trends graph.">
        {/* Gridlines */}
        <line x1={xPre} x2={xPre} y1={40} y2={260} stroke="#cbd5e1" strokeWidth={2} />
        <line x1={xPost} x2={xPost} y1={40} y2={260} stroke="#cbd5e1" strokeWidth={2} />

        <text x={xPre} y={278} textAnchor="middle" className="fill-slate-800 text-[11px] font-bold">PRE-TREATMENT (Months 1-3)</text>
        <text x={xPost} y={278} textAnchor="middle" className="fill-slate-800 text-[11px] font-bold">POST-TREATMENT (Months 4-6)</text>

        {/* Control Group Trend Line */}
        <line x1={xPre} y1={yControlPre} x2={xPost} y2={yControlPost} stroke="#94a3b8" strokeWidth={2.5} />
        <circle cx={xPre} cy={yControlPre} r={5} fill="#94a3b8" />
        <circle cx={xPost} cy={yControlPost} r={5} fill="#94a3b8" />
        <text x={xPre - 12} y={yControlPre + 4} textAnchor="end" className="fill-slate-500 text-[10px] font-medium">90k</text>
        <text x={xPost + 12} y={yControlPost + 4} className="fill-slate-500 text-[10px] font-medium">100k (Control)</text>
        <text x={(xPre+xPost)/2} y={(yControlPre+yControlPost)/2 + 15} textAnchor="middle" className="fill-slate-500 text-[10px] font-semibold">General Shock (+10k)</text>

        {/* Treated Group Trend Line (Before to Actual After) */}
        <line x1={xPre} y1={yTreatedPre} x2={xPost} y2={yTreatedPost} stroke="#0f766e" strokeWidth={3} />
        <circle cx={xPre} cy={yTreatedPre} r={6} fill="#0f766e" />
        <circle cx={xPost} cy={yTreatedPost} r={6} fill="#0f766e" />
        <text x={xPre - 12} y={yTreatedPre + 4} textAnchor="end" className="fill-slate-900 text-[11px] font-bold">100k (Treated)</text>
        <text x={xPost + 12} y={yTreatedPost + 4} className="fill-[#0f766e] text-[11px] font-bold">130k (Actual)</text>

        {/* View 1: Naive Time Before/After */}
        {view === 'naive_time' && (
          <>
            {/* Draw a horizontal projection to show before-after difference */}
            <line x1={xPre} x2={xPost} y1={yTreatedPre} y2={yTreatedPre} stroke="#dc2626" strokeWidth={1.5} strokeDasharray="3 3" />
            <path d={`M ${xPost + 40} ${yTreatedPre} L ${xPost + 40} ${yTreatedPost}`} stroke="#dc2626" strokeWidth={2} markerEnd="url(#fwl-arrow)" />
            <text x={xPost + 48} y={(yTreatedPre + yTreatedPost)/2 + 4} className="fill-red-600 text-[10px] font-bold">Naive Before/After Lift (+30k)</text>
            <text x={(xPre+xPost)/2} y={yTreatedPre - 8} textAnchor="middle" className="fill-red-600 text-[9px] font-semibold">Assumes environment is static!</text>
          </>
        )}

        {/* View 2: Naive Cross Section Treated/Control */}
        {view === 'naive_space' && (
          <>
            {/* Draw vertical line from Treated Post to Control Post */}
            <path d={`M ${xPost - 30} ${yControlPost} L ${xPost - 30} ${yTreatedPost}`} stroke="#dc2626" strokeWidth={2} markerEnd="url(#fwl-arrow)" />
            <text x={xPost - 38} y={(yControlPost + yTreatedPost)/2 + 4} textAnchor="end" className="fill-red-600 text-[10px] font-bold">Naive Cross-Section (+30k)</text>
            <text x={xPost - 38} y={(yControlPost + yTreatedPost)/2 + 16} textAnchor="end" className="fill-red-500 text-[8px] italic">Ignores baseline West Coast preference</text>
          </>
        )}

        {/* View 3: Difference-in-Differences */}
        {view === 'did' && (
          <>
            {/* Parallel trend projection */}
            <line x1={xPre} y1={yTreatedPre} x2={xPost} y2={yCounterfactual} stroke="#0f766e" strokeWidth={2} strokeDasharray="4 4" opacity={0.7} />
            <circle cx={xPost} cy={yCounterfactual} r={4.5} fill="#0f766e" fillOpacity={0.5} stroke="#0f766e" />
            <text x={xPost + 12} y={yCounterfactual + 4} className="fill-slate-500 text-[10px] italic">110k (Counterfactual)</text>

            {/* Bracket showing general shock +10 */}
            <path d={`M ${xPost - 15} ${yTreatedPre} L ${xPost - 15} ${yCounterfactual}`} stroke="#94a3b8" strokeWidth={1.5} />
            <text x={xPost - 22} y={(yTreatedPre + yCounterfactual)/2 + 4} textAnchor="end" className="fill-slate-500 text-[9px] font-semibold">General Trend (+10k)</text>

            {/* Bracket showing DiD causal effect +20 */}
            <path d={`M ${xPost - 15} ${yCounterfactual} L ${xPost - 15} ${yTreatedPost}`} stroke="#0f766e" strokeWidth={2.5} />
            <text x={xPost - 22} y={(yCounterfactual + yTreatedPost)/2 + 4} textAnchor="end" className="fill-[#0f766e] text-[11px] font-black">Causal DiD Lift (+20k)</text>
          </>
        )}
      </svg>

      <div className="mt-4 rounded bg-slate-50 p-3 text-[11px] leading-relaxed text-slate-600">
        <p>
          <strong>The Math:</strong>{' '}
          {'$$\\text{DiD Effect} = (130\\text{k} - 100\\text{k}) - (100\\text{k} - 90\\text{k}) = 30\\text{k} - 10\\text{k} = 20\\text{k}$$'}
          By subtracting the general seasonal trend of +$10k$ (captured by the untreated East Coast control stores) from the total observed sales growth of +$30k$ in the treated West Coast stores, we isolate the true, unconfounded impact of the loyalty program rollout.
        </p>
      </div>
    </CardFrame>
  );
}


