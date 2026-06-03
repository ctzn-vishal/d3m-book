'use client';

import * as React from 'react';

type ModelMetric = {
  model: string;
  auc: number;
  average_precision: number;
  accuracy: number;
  precision: number;
  recall: number;
  f1: number;
  top_decile_hot_rate: number;
  top_decile_lift: number;
};

type RocCurve = {
  model: string;
  points: Array<{ fpr: number; tpr: number }>;
};

type ClusterSummary = {
  cluster: number;
  listings: number;
  hot_rate: number;
  median_price: number;
  mean_score: number;
  latitude: number;
  longitude: number;
  segment: string;
  label: string;
  share: number;
};

type MapPoint = {
  id: number;
  latitude: number;
  longitude: number;
  cluster: number;
  segment: string;
  actual_hot: number;
  score: number;
  price: number;
};

type AmenitySignal = {
  amenity: string;
  prevalence: number;
  hot_rate_with: number;
  hot_rate_without: number;
  lift_pp: number;
  chi2: number;
};

type PriceBand = {
  price_band: string;
  listings: number;
  hot_rate: number;
  median_score: number;
  share: number;
};

type FeatureImportance = {
  feature: string;
  family: string;
  importance: number;
};

type FeatureFamilyImportance = {
  family: string;
  importance: number;
};

type ScoreDecile = {
  rank: number;
  label: string;
  listings: number;
  mean_score: number;
  hot_rate: number;
  lift: number;
  captured_hot: number;
  cumulative_capture: number;
};

type TopListing = {
  rank: number;
  id: number;
  street_address: string;
  segment: string;
  segment_label: string;
  price: number;
  bedrooms: string;
  bathrooms: string;
  score: number;
  'Hot Apartments': string;
};

type SegmentMix = {
  segment: string;
  label: string;
  listings: number;
  hot_rate: number;
  median_price: number;
};

export type RentHopCaseData = {
  metadata: {
    rows: number;
    columns: number;
    hot_count: number;
    not_hot_count: number;
    hot_rate: number;
    train_rows: number;
    test_rows: number;
    split: string;
    clusters: number;
    amenity_features: number;
    best_model: string;
  };
  modelMetrics: ModelMetric[];
  rocCurves: RocCurve[];
  clusterSummary: ClusterSummary[];
  mapSample: MapPoint[];
  amenitySignals: AmenitySignal[];
  priceBands: PriceBand[];
  featureImportance: FeatureImportance[];
  featureFamilyImportance: FeatureFamilyImportance[];
  scoreDeciles: ScoreDecile[];
  top50Summary: {
    listings: number;
    actual_hot_rate: number;
    median_price: number;
    mean_score: number;
    baseline_hot_rate: number;
  };
  top50SegmentMix: SegmentMix[];
  topListings: TopListing[];
};

const COLORS = {
  ink: '#172033',
  muted: '#64748b',
  grid: '#e2e8f0',
  panel: '#f8fafc',
  navy: '#1f3a5f',
  blue: '#2563eb',
  blueLight: '#dbeafe',
  orange: '#c87c2a',
  orangeLight: '#fed7aa',
  green: '#0f766e',
  greenLight: '#ccfbf1',
  purple: '#7c3aed',
  rose: '#be123c',
  slate: '#475569',
};

const MODEL_COLORS: Record<string, string> = {
  'Logistic regression': COLORS.blue,
  'Decision tree': COLORS.orange,
  'Random forest': COLORS.green,
};

const FAMILY_COLORS: Record<string, string> = {
  Price: COLORS.navy,
  Location: COLORS.orange,
  Amenities: COLORS.green,
  'Unit mix': COLORS.purple,
  Other: COLORS.slate,
};

const fmtCompact = new Intl.NumberFormat('en-US', {
  notation: 'compact',
  maximumFractionDigits: 1,
});

const fmtMoney = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

function pct(value: number, digits = 0) {
  return `${(value * 100).toFixed(digits)}%`;
}

function score(value: number) {
  return value.toFixed(3);
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function extent<T>(items: T[], accessor: (item: T) => number): [number, number] {
  const values = items.map(accessor).filter(Number.isFinite);
  return [Math.min(...values), Math.max(...values)];
}

function padded([min, max]: [number, number], pad = 0.05): [number, number] {
  if (!Number.isFinite(min) || !Number.isFinite(max)) return [0, 1];
  if (min === max) return [min - 1, max + 1];
  const span = max - min;
  return [min - span * pad, max + span * pad];
}

function scale(domain: [number, number], range: [number, number]) {
  const [d0, d1] = domain;
  const [r0, r1] = range;
  const denom = d1 - d0 || 1;
  return (value: number) => r0 + ((value - d0) / denom) * (r1 - r0);
}

function interpolateColor(low: string, high: string, value: number) {
  const parse = (hex: string) => [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16));
  const [r0, g0, b0] = parse(low);
  const [r1, g1, b1] = parse(high);
  const t = clamp(value, 0, 1);
  const channel = (a: number, b: number) => Math.round(a + (b - a) * t).toString(16).padStart(2, '0');
  return `#${channel(r0, r1)}${channel(g0, g1)}${channel(b0, b1)}`;
}

function hotRateColor(value: number, min = 0.2, max = 0.72) {
  return interpolateColor('#dbeafe', '#c87c2a', (value - min) / (max - min));
}

function pathFromPoints(points: Array<{ x: number; y: number }>) {
  return points.map((point, i) => `${i === 0 ? 'M' : 'L'} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`).join(' ');
}

function ChartFrame({
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

function Metric({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="border-l border-white/15 pl-4">
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-300">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums text-white">{value}</p>
      <p className="mt-1 text-xs leading-snug text-slate-300">{detail}</p>
    </div>
  );
}

export function RentHopCaseOverview({ data }: { data: RentHopCaseData }) {
  const best = data.modelMetrics.find(model => model.model === data.metadata.best_model) ?? data.modelMetrics[0];
  return (
    <div className="rounded-md border border-slate-800 bg-slate-950 p-5 text-white shadow-sm">
      <div className="grid gap-6 lg:grid-cols-[1.2fr_2fr]">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">Case evidence</p>
          <h3 className="mt-2 text-2xl font-semibold leading-tight">A listing-level score for marketplace attention</h3>
          <p className="mt-3 text-sm leading-relaxed text-slate-300">
            The unit is the apartment listing. The target is whether the listing was marked Hot. The action is a ranked queue for featuring,
            premium placement, or landlord coaching.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Metric
            label="Listings"
            value={fmtCompact.format(data.metadata.rows)}
            detail={`${data.metadata.columns} original columns in the CSV`}
          />
          <Metric
            label="Base rate"
            value={pct(data.metadata.hot_rate, 1)}
            detail={`${fmtCompact.format(data.metadata.hot_count)} labelled Hot listings`}
          />
          <Metric
            label="Feature work"
            value={`${data.metadata.clusters} + ${data.metadata.amenity_features}`}
            detail="location segments plus parsed amenity flags"
          />
          <Metric
            label="Held-out lift"
            value={`${best.top_decile_lift.toFixed(1)}x`}
            detail={`${pct(best.top_decile_hot_rate, 1)} Hot rate in the top score decile`}
          />
        </div>
      </div>
    </div>
  );
}

export function RentHopSegmentMap({ data }: { data: RentHopCaseData }) {
  const W = 760;
  const H = 500;
  const margin = { top: 24, right: 24, bottom: 28, left: 24 };
  const xDomain = padded(extent(data.mapSample, d => d.longitude), 0.03);
  const yDomain = padded(extent(data.mapSample, d => d.latitude), 0.04);
  const x = scale(xDomain, [margin.left, W - margin.right]);
  const y = scale(yDomain, [H - margin.bottom, margin.top]);
  const clusterById = new Map(data.clusterSummary.map(row => [row.cluster, row]));
  const labelled = data.clusterSummary
    .filter(row => row.listings >= 400 || row.hot_rate >= 0.49)
    .sort((a, b) => b.hot_rate - a.hot_rate)
    .slice(0, 8);

  return (
    <div className="grid gap-4 lg:grid-cols-[1.65fr_1fr]">
      <ChartFrame
        title="Location segments expose the market structure"
        subtitle="Points are a stratified sample of listings; larger labeled markers are K-means segment centers colored by observed Hot rate."
      >
        <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Map-like coordinate scatter of RentHop listing segments across New York City.">
          <rect x={0} y={0} width={W} height={H} rx={6} fill="#f8fafc" />
          {[0.25, 0.5, 0.75].map(t => (
            <React.Fragment key={t}>
              <line x1={margin.left} x2={W - margin.right} y1={margin.top + t * (H - margin.top - margin.bottom)} y2={margin.top + t * (H - margin.top - margin.bottom)} stroke="#e2e8f0" />
              <line x1={margin.left + t * (W - margin.left - margin.right)} x2={margin.left + t * (W - margin.left - margin.right)} y1={margin.top} y2={H - margin.bottom} stroke="#e2e8f0" />
            </React.Fragment>
          ))}
          {data.mapSample.map(point => {
            const cluster = clusterById.get(point.cluster);
            return (
              <circle
                key={point.id}
                cx={x(point.longitude)}
                cy={y(point.latitude)}
                r={point.actual_hot ? 3.1 : 2.2}
                fill={point.actual_hot ? COLORS.orange : COLORS.navy}
                opacity={point.actual_hot ? 0.42 : 0.14}
                stroke={cluster ? hotRateColor(cluster.hot_rate) : 'none'}
                strokeWidth={point.actual_hot ? 0.35 : 0}
              />
            );
          })}
          {labelled.map(row => {
            const cx = x(row.longitude);
            const cy = y(row.latitude);
            const fill = hotRateColor(row.hot_rate);
            const labelX = clamp(cx + 10, 52, W - 130);
            const labelY = clamp(cy - 10, 30, H - 20);
            return (
              <g key={row.cluster}>
                <circle cx={cx} cy={cy} r={9} fill={fill} stroke="#172033" strokeWidth={1.3} />
                <line x1={cx + 8} x2={labelX - 4} y1={cy - 4} y2={labelY + 4} stroke="#64748b" strokeWidth={0.8} />
                <text x={labelX} y={labelY} className="fill-slate-950 text-[10px] font-semibold">
                  {row.segment.replace('Segment ', 'S')}
                </text>
                <text x={labelX} y={labelY + 12} className="fill-slate-600 text-[9px]">
                  {pct(row.hot_rate, 0)} Hot
                </text>
              </g>
            );
          })}
          <text x={margin.left} y={H - 8} className="fill-slate-500 text-[10px]">
            Longitude mapped left-right; latitude mapped bottom-top. Segment labels are approximate, derived from cluster centroids.
          </text>
        </svg>
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600">
          <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-[#c87c2a]" /> Hot listing</span>
          <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-[#1f3a5f] opacity-60" /> Not Hot listing</span>
          <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full border border-slate-900 bg-[#fed7aa]" /> Segment center</span>
        </div>
      </ChartFrame>
      <ChartFrame
        title="Highest-rate segments are value-heavy"
        subtitle="Small segments can be real leads but need monitoring before becoming rules."
      >
        <div className="space-y-3">
          {data.clusterSummary.slice(0, 8).map(row => (
            <div key={row.cluster}>
              <div className="flex items-start justify-between gap-3 text-xs">
                <div>
                  <p className="font-semibold text-slate-900">{row.segment}: {row.label}</p>
                  <p className="text-slate-500">{row.listings.toLocaleString()} listings, median {fmtMoney.format(row.median_price)}</p>
                </div>
                <span className="tabular-nums font-semibold text-slate-900">{pct(row.hot_rate, 1)}</span>
              </div>
              <div className="mt-1 h-2 rounded-full bg-slate-100">
                <div
                  className="h-2 rounded-full"
                  style={{
                    width: `${clamp(row.hot_rate * 100, 4, 100)}%`,
                    background: hotRateColor(row.hot_rate),
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </ChartFrame>
    </div>
  );
}

function AmenityDivergingChart({ rows, baseline }: { rows: AmenitySignal[]; baseline: number }) {
  const W = 720;
  const H = 330;
  const margin = { top: 20, right: 82, bottom: 26, left: 150 };
  const values = rows.map(row => row.lift_pp);
  const bound = Math.max(Math.abs(Math.min(...values)), Math.abs(Math.max(...values)), 1);
  const x = scale([-bound, bound], [margin.left, W - margin.right]);
  const rowGap = (H - margin.top - margin.bottom) / rows.length;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Amenity signals ranked by association with Hot listings.">
      <line x1={x(0)} x2={x(0)} y1={margin.top - 4} y2={H - margin.bottom + 4} stroke="#94a3b8" strokeDasharray="4 4" />
      {[-10, -5, 0, 5, 10].filter(t => Math.abs(t) <= bound).map(t => (
        <g key={t}>
          <line x1={x(t)} x2={x(t)} y1={margin.top} y2={H - margin.bottom} stroke={t === 0 ? '#94a3b8' : '#e2e8f0'} />
          <text x={x(t)} y={H - 7} textAnchor="middle" className="fill-slate-500 text-[10px]">{t > 0 ? `+${t}` : t}</text>
        </g>
      ))}
      {rows.map((row, index) => {
        const y = margin.top + index * rowGap + rowGap / 2;
        const start = x(Math.min(0, row.lift_pp));
        const width = Math.abs(x(row.lift_pp) - x(0));
        const positive = row.lift_pp >= 0;
        return (
          <g key={row.amenity}>
            <text x={margin.left - 10} y={y + 4} textAnchor="end" className="fill-slate-700 text-[11px]">{row.amenity}</text>
            <rect
              x={start}
              y={y - 8}
              width={Math.max(2, width)}
              height={16}
              rx={3}
              fill={positive ? COLORS.orange : COLORS.blue}
              opacity={0.86}
            />
            <text x={positive ? start + width + 6 : start - 6} y={y + 4} textAnchor={positive ? 'start' : 'end'} className="fill-slate-600 text-[10px] tabular-nums">
              {row.lift_pp > 0 ? '+' : ''}{row.lift_pp.toFixed(1)} pp
            </text>
          </g>
        );
      })}
      <text x={(margin.left + W - margin.right) / 2} y={H - 1} textAnchor="middle" className="fill-slate-500 text-[10px]">
        Difference from {pct(baseline, 1)} overall Hot rate
      </text>
    </svg>
  );
}

function PriceBandChart({ rows, baseline }: { rows: PriceBand[]; baseline: number }) {
  const W = 600;
  const H = 280;
  const margin = { top: 20, right: 22, bottom: 42, left: 48 };
  const x = scale([0, rows.length], [margin.left, W - margin.right]);
  const y = scale([0, Math.max(0.75, ...rows.map(row => row.hot_rate))], [H - margin.bottom, margin.top]);
  const barWidth = (W - margin.left - margin.right) / rows.length - 12;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Hot listing rate by monthly rent band.">
      {[0, 0.25, 0.5, 0.75].map(t => (
        <g key={t}>
          <line x1={margin.left} x2={W - margin.right} y1={y(t)} y2={y(t)} stroke="#e2e8f0" />
          <text x={margin.left - 8} y={y(t) + 4} textAnchor="end" className="fill-slate-500 text-[10px]">{pct(t)}</text>
        </g>
      ))}
      <line x1={margin.left} x2={W - margin.right} y1={y(baseline)} y2={y(baseline)} stroke={COLORS.slate} strokeDasharray="4 4" />
      <text x={W - margin.right - 4} y={y(baseline) - 6} textAnchor="end" className="fill-slate-500 text-[10px]">overall</text>
      {rows.map((row, index) => {
        const x0 = x(index) + 6;
        return (
          <g key={row.price_band}>
            <rect
              x={x0}
              y={y(row.hot_rate)}
              width={barWidth}
              height={H - margin.bottom - y(row.hot_rate)}
              rx={4}
              fill={hotRateColor(row.hot_rate)}
            />
            <text x={x0 + barWidth / 2} y={y(row.hot_rate) - 6} textAnchor="middle" className="fill-slate-700 text-[10px] font-semibold">
              {pct(row.hot_rate)}
            </text>
            <text x={x0 + barWidth / 2} y={H - 22} textAnchor="middle" className="fill-slate-600 text-[10px]">{row.price_band}</text>
            <text x={x0 + barWidth / 2} y={H - 8} textAnchor="middle" className="fill-slate-400 text-[9px]">{fmtCompact.format(row.listings)}</text>
          </g>
        );
      })}
    </svg>
  );
}

export function RentHopFeatureSignals({ data }: { data: RentHopCaseData }) {
  return (
    <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
      <ChartFrame
        title="Amenities become model-ready signals"
        subtitle="The bars show percentage-point difference from the overall Hot rate, not a causal effect of adding the amenity."
      >
        <AmenityDivergingChart rows={data.amenitySignals} baseline={data.metadata.hot_rate} />
      </ChartFrame>
      <ChartFrame
        title="The hottest queue is not the luxury tail"
        subtitle="Demand classification favors value in the observed labels; expensive listings are numerous, but not the strongest Hot segment."
      >
        <PriceBandChart rows={data.priceBands} baseline={data.metadata.hot_rate} />
      </ChartFrame>
    </div>
  );
}

function ModelBars({ rows }: { rows: ModelMetric[] }) {
  const W = 580;
  const H = 250;
  const margin = { top: 18, right: 64, bottom: 30, left: 138 };
  const rowGap = (H - margin.top - margin.bottom) / rows.length;
  const x = scale([0.5, 0.85], [margin.left, W - margin.right]);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Model comparison by AUC and average precision.">
      {[0.5, 0.6, 0.7, 0.8].map(t => (
        <g key={t}>
          <line x1={x(t)} x2={x(t)} y1={margin.top} y2={H - margin.bottom} stroke="#e2e8f0" />
          <text x={x(t)} y={H - 8} textAnchor="middle" className="fill-slate-500 text-[10px]">{t.toFixed(1)}</text>
        </g>
      ))}
      {rows.map((row, index) => {
        const y0 = margin.top + index * rowGap + 15;
        return (
          <g key={row.model}>
            <text x={margin.left - 10} y={y0 + 15} textAnchor="end" className="fill-slate-700 text-[11px] font-semibold">{row.model}</text>
            <rect x={x(0.5)} y={y0} width={x(row.auc) - x(0.5)} height={13} rx={3} fill={MODEL_COLORS[row.model] ?? COLORS.blue} />
            <rect x={x(0.5)} y={y0 + 18} width={x(row.average_precision) - x(0.5)} height={13} rx={3} fill={MODEL_COLORS[row.model] ?? COLORS.blue} opacity={0.45} />
            <text x={x(row.auc) + 5} y={y0 + 10} className="fill-slate-600 text-[10px] tabular-nums">AUC {row.auc.toFixed(3)}</text>
            <text x={x(row.average_precision) + 5} y={y0 + 28} className="fill-slate-500 text-[10px] tabular-nums">AP {row.average_precision.toFixed(3)}</text>
          </g>
        );
      })}
      <text x={(margin.left + W - margin.right) / 2} y={H - 1} textAnchor="middle" className="fill-slate-500 text-[10px]">
        Held-out ranking metrics
      </text>
    </svg>
  );
}

function RocChart({ curves }: { curves: RocCurve[] }) {
  const W = 520;
  const H = 300;
  const margin = { top: 20, right: 22, bottom: 42, left: 48 };
  const x = scale([0, 1], [margin.left, W - margin.right]);
  const y = scale([0, 1], [H - margin.bottom, margin.top]);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="ROC curves for RentHop classifiers.">
      {[0, 0.25, 0.5, 0.75, 1].map(t => (
        <g key={t}>
          <line x1={x(t)} x2={x(t)} y1={margin.top} y2={H - margin.bottom} stroke="#eef2f7" />
          <line x1={margin.left} x2={W - margin.right} y1={y(t)} y2={y(t)} stroke="#e2e8f0" />
          <text x={x(t)} y={H - 20} textAnchor="middle" className="fill-slate-500 text-[9px]">{t.toFixed(2)}</text>
          <text x={margin.left - 8} y={y(t) + 3} textAnchor="end" className="fill-slate-500 text-[9px]">{t.toFixed(2)}</text>
        </g>
      ))}
      <line x1={x(0)} x2={x(1)} y1={y(0)} y2={y(1)} stroke="#94a3b8" strokeDasharray="4 4" />
      {curves.map(curve => {
        const points = curve.points.map(point => ({ x: x(point.fpr), y: y(point.tpr) }));
        return (
          <path
            key={curve.model}
            d={pathFromPoints(points)}
            fill="none"
            stroke={MODEL_COLORS[curve.model] ?? COLORS.blue}
            strokeWidth={2.4}
          />
        );
      })}
      <text x={(margin.left + W - margin.right) / 2} y={H - 2} textAnchor="middle" className="fill-slate-500 text-[10px]">False positive rate</text>
      <text x={14} y={(margin.top + H - margin.bottom) / 2} transform={`rotate(-90 14 ${(margin.top + H - margin.bottom) / 2})`} textAnchor="middle" className="fill-slate-500 text-[10px]">True positive rate</text>
    </svg>
  );
}

function ScoreDecileChart({ rows, baseline }: { rows: ScoreDecile[]; baseline: number }) {
  const W = 920;
  const H = 300;
  const margin = { top: 22, right: 70, bottom: 42, left: 52 };
  const x = scale([0, rows.length], [margin.left, W - margin.right]);
  const y = scale([0, 0.8], [H - margin.bottom, margin.top]);
  const barWidth = (W - margin.left - margin.right) / rows.length - 10;
  const capturePoints = rows.map((row, index) => ({
    x: x(index) + 5 + barWidth / 2,
    y: y(row.cumulative_capture),
  }));
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Hot rate by model score decile and cumulative capture.">
      {[0, 0.25, 0.5, 0.75].map(t => (
        <g key={t}>
          <line x1={margin.left} x2={W - margin.right} y1={y(t)} y2={y(t)} stroke="#e2e8f0" />
          <text x={margin.left - 8} y={y(t) + 4} textAnchor="end" className="fill-slate-500 text-[10px]">{pct(t)}</text>
        </g>
      ))}
      <line x1={margin.left} x2={W - margin.right} y1={y(baseline)} y2={y(baseline)} stroke={COLORS.slate} strokeDasharray="4 4" />
      <text x={W - margin.right + 8} y={y(baseline) + 3} className="fill-slate-500 text-[10px]">base</text>
      {rows.map((row, index) => {
        const x0 = x(index) + 5;
        return (
          <g key={row.rank}>
            <rect
              x={x0}
              y={y(row.hot_rate)}
              width={barWidth}
              height={H - margin.bottom - y(row.hot_rate)}
              rx={4}
              fill={hotRateColor(row.hot_rate)}
            />
            <text x={x0 + barWidth / 2} y={y(row.hot_rate) - 6} textAnchor="middle" className="fill-slate-700 text-[10px] font-semibold">
              {pct(row.hot_rate)}
            </text>
            <text x={x0 + barWidth / 2} y={H - 20} textAnchor="middle" className="fill-slate-600 text-[10px]">
              {row.rank === 1 ? 'Top 10' : `${row.rank}0s`}
            </text>
          </g>
        );
      })}
      <path d={pathFromPoints(capturePoints)} fill="none" stroke={COLORS.navy} strokeWidth={2.5} />
      {capturePoints.map((point, index) => (
        <circle key={index} cx={point.x} cy={point.y} r={3.5} fill={COLORS.navy} />
      ))}
      <text x={W - margin.right + 8} y={capturePoints[2].y + 4} className="fill-[#1f3a5f] text-[10px]">cumulative capture</text>
      <text x={(margin.left + W - margin.right) / 2} y={H - 3} textAnchor="middle" className="fill-slate-500 text-[10px]">Score deciles, highest probability at left</text>
    </svg>
  );
}

export function RentHopModelComparison({ data }: { data: RentHopCaseData }) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-2">
        <ChartFrame
          title="The forest wins, but the baseline is close"
          subtitle="Feature engineering carries much of the lift; algorithm choice adds a narrower gain."
        >
          <ModelBars rows={data.modelMetrics} />
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600">
            {data.modelMetrics.map(row => (
              <span key={row.model} className="inline-flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: MODEL_COLORS[row.model] }} />
                {row.model}
              </span>
            ))}
          </div>
        </ChartFrame>
        <ChartFrame
          title="ROC shows ranking quality, not the business threshold"
          subtitle="The operating question is still which slice of listings RentHop should feature."
        >
          <RocChart curves={data.rocCurves} />
        </ChartFrame>
      </div>
      <ChartFrame
        title="The score creates an operating queue"
        subtitle="On the held-out set, the top decile is more than twice as Hot as the average listing."
      >
        <ScoreDecileChart rows={data.scoreDeciles} baseline={data.metadata.hot_rate} />
      </ChartFrame>
    </div>
  );
}

function FeatureImportanceBars({
  rows,
  familyRows,
}: {
  rows: FeatureImportance[];
  familyRows: FeatureFamilyImportance[];
}) {
  const max = Math.max(...rows.map(row => row.importance));
  return (
    <div className="grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
      <div className="space-y-2">
        {rows.map(row => (
          <div key={row.feature} className="grid grid-cols-[145px_minmax(0,1fr)_48px] items-center gap-2 text-xs">
            <span className="truncate text-slate-700">{row.feature}</span>
            <span className="h-3.5 rounded-sm" style={{ width: `${(row.importance / max) * 100}%`, background: FAMILY_COLORS[row.family] ?? COLORS.slate }} />
            <span className="text-right tabular-nums text-slate-500">{(row.importance * 100).toFixed(1)}%</span>
          </div>
        ))}
      </div>
      <div className="space-y-2">
        {familyRows.map(row => (
          <div key={row.family} className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-800">{row.family}</span>
              <span className="tabular-nums text-slate-600">{pct(row.importance, 1)}</span>
            </div>
            <div className="mt-1 h-1.5 rounded-full bg-white">
              <div className="h-1.5 rounded-full" style={{ width: `${row.importance * 100}%`, background: FAMILY_COLORS[row.family] ?? COLORS.slate }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function RentHopActionQueue({ data }: { data: RentHopCaseData }) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-[0.85fr_1.15fr]">
        <ChartFrame
          title="Top 50 held-out prospects"
          subtitle="This is the deployable artifact: a ranked list with probabilities, not a model score in isolation."
        >
          <div className="grid grid-cols-3 gap-3">
            <div>
              <p className="text-2xl font-semibold tabular-nums text-slate-950">{pct(data.top50Summary.actual_hot_rate, 0)}</p>
              <p className="text-xs text-slate-500">actually Hot</p>
            </div>
            <div>
              <p className="text-2xl font-semibold tabular-nums text-slate-950">{fmtMoney.format(data.top50Summary.median_price)}</p>
              <p className="text-xs text-slate-500">median rent</p>
            </div>
            <div>
              <p className="text-2xl font-semibold tabular-nums text-slate-950">{score(data.top50Summary.mean_score)}</p>
              <p className="text-xs text-slate-500">mean score</p>
            </div>
          </div>
          <p className="mt-4 border-l-2 border-[#c87c2a] pl-3 text-sm leading-relaxed text-slate-700">
            The top 50 are not luxury trophy listings. They are mostly lower-rent, one- and two-bedroom listings in high-rate value segments.
          </p>
        </ChartFrame>
        <ChartFrame
          title="The queue concentrates in a few segments"
          subtitle="Segment concentration is useful for operations and risky for over-generalization."
        >
          <div className="space-y-3">
            {data.top50SegmentMix.slice(0, 6).map(row => (
              <div key={row.segment}>
                <div className="flex items-center justify-between gap-3 text-xs">
                  <span className="font-semibold text-slate-800">{row.segment}: {row.label}</span>
                  <span className="tabular-nums text-slate-600">{row.listings} listings</span>
                </div>
                <div className="mt-1 h-2 rounded-full bg-slate-100">
                  <div
                    className="h-2 rounded-full bg-[#1f3a5f]"
                    style={{ width: `${(row.listings / data.top50Summary.listings) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </ChartFrame>
      </div>
      <div className="overflow-x-auto rounded-md border border-slate-200 bg-white shadow-sm">
        <table className="w-full min-w-[860px] border-collapse text-sm tabular-nums">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              {['Rank', 'Listing', 'Segment', 'Rent', 'Beds', 'Baths', 'Score', 'Actual'].map(header => (
                <th key={header} className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.topListings.map(row => (
              <tr key={row.id} className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50/80">
                <td className="px-3 py-2.5 font-semibold text-slate-900">{row.rank}</td>
                <td className="max-w-[260px] px-3 py-2.5 text-slate-700">
                  <span className="line-clamp-2">{row.street_address}</span>
                </td>
                <td className="px-3 py-2.5 text-slate-700">
                  <span className="font-semibold">{row.segment}</span>
                  <span className="block text-xs text-slate-500">{row.segment_label}</span>
                </td>
                <td className="px-3 py-2.5 text-slate-700">{fmtMoney.format(row.price)}</td>
                <td className="px-3 py-2.5 text-slate-700">{row.bedrooms}</td>
                <td className="px-3 py-2.5 text-slate-700">{row.bathrooms}</td>
                <td className="px-3 py-2.5 font-semibold text-slate-900">{score(row.score)}</td>
                <td className="px-3 py-2.5">
                  <span className={row['Hot Apartments'] === 'Hot' ? 'font-semibold text-[#0f766e]' : 'font-semibold text-slate-500'}>
                    {row['Hot Apartments']}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function RentHopFeatureImportance({ data }: { data: RentHopCaseData }) {
  return (
    <ChartFrame
      title="What the winning model leaned on"
      subtitle="Importance is an inspection tool: it tells us what sorted listings, not what would happen if RentHop changed a feature."
    >
      <FeatureImportanceBars rows={data.featureImportance} familyRows={data.featureFamilyImportance} />
    </ChartFrame>
  );
}
