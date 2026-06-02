"use client";

import * as React from 'react';

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
};

const REGION_ORDER = ['East', 'Midwest', 'South', 'West'];
const REGION_COLORS: Record<string, string> = {
  East: '#2563eb',
  Midwest: '#7c3aed',
  South: '#059669',
  West: '#dc2626',
};

const SEASON_COLORS: Record<string, string> = {
  Winter: '#1f3a5f',
  'Non-winter': '#c87c2a',
};

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));
const fmtPct = (value: number) => `${Math.round(value * 100)}%`;
const fmtPct1 = (value: number) => `${(value * 100).toFixed(1)}%`;
const fmtMoney = (value: number) => `$${value.toFixed(2)}`;
const fmtIndex = (value: number) => `${Math.round(value)}`;
const fmtCoef = (value: number) => value.toFixed(2);
const monthName = (month: number) => ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][month - 1] ?? String(month);

function extent<T>(items: T[], accessor: (item: T) => number): [number, number] {
  const values = items.map(accessor).filter(Number.isFinite);
  return [Math.min(...values), Math.max(...values)];
}

function paddedDomain([min, max]: [number, number], pad = 0.08): [number, number] {
  if (!Number.isFinite(min) || !Number.isFinite(max)) return [0, 1];
  if (min === max) return [min - 1, max + 1];
  const span = max - min;
  return [min - span * pad, max + span * pad];
}

function scaleLinear(domain: [number, number], range: [number, number]) {
  const [d0, d1] = domain;
  const [r0, r1] = range;
  const denom = d1 - d0 || 1;
  return (value: number) => r0 + ((value - d0) / denom) * (r1 - r0);
}

function linePath<T>(items: T[], x: (item: T) => number, y: (item: T) => number) {
  return items.map((item, index) => `${index === 0 ? 'M' : 'L'} ${x(item).toFixed(2)} ${y(item).toFixed(2)}`).join(' ');
}

function fittedTrendLine(group: string, points: ScatterPoint[]): TrendLine | undefined {
  if (points.length < 2) return undefined;
  const xMean = points.reduce((sum, point) => sum + point.log_price, 0) / points.length;
  const yMean = points.reduce((sum, point) => sum + point.log_volume, 0) / points.length;
  const denominator = points.reduce((sum, point) => sum + (point.log_price - xMean) ** 2, 0);
  if (!Number.isFinite(denominator) || denominator === 0) return undefined;
  const numerator = points.reduce((sum, point) => sum + (point.log_price - xMean) * (point.log_volume - yMean), 0);
  const slope = numerator / denominator;
  const intercept = yMean - slope * xMean;
  const [x1, x2] = extent(points, point => point.log_price);
  return {
    group,
    x1,
    y1: intercept + slope * x1,
    x2,
    y2: intercept + slope * x2,
    slope,
  };
}

function AxisLabels({ x, y, xLabel, yLabel }: { x: number; y: number; xLabel?: string; yLabel?: string }) {
  return (
    <>
      {xLabel && <text x={x} y={y} textAnchor="middle" className="fill-slate-500 text-[10px]">{xLabel}</text>}
      {yLabel && (
        <text x={14} y={110} textAnchor="middle" transform="rotate(-90 14 110)" className="fill-slate-500 text-[10px]">
          {yLabel}
        </text>
      )}
    </>
  );
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
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
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

export function SoupBaselineChart({ data }: { data: { monthSeasonality: MonthPoint[]; seasonSummary: Array<Record<string, number | string>> } }) {
  const months = [...data.monthSeasonality].sort((a, b) => a.month - b.month);
  const W = 760;
  const H = 300;
  const m = { top: 20, right: 74, bottom: 42, left: 48 };
  const x = scaleLinear([1, 12], [m.left, W - m.right]);
  const yIndex = scaleLinear([0, 150], [H - m.bottom, m.top]);
  const volumePath = linePath(months, d => x(d.month), d => yIndex(d.progresso_volume_index_jan ?? 0));
  const sharePath = linePath(months, d => x(d.month), d => yIndex(d.progresso_share_index_jan ?? 0));
  const pricePath = linePath(months, d => x(d.month), d => yIndex(d.progresso_price_index_jan ?? 0));

  return (
    <div className="space-y-4">
      <ChartFrame
        title="Demand falls before price does"
        subtitle="Indexed views make the countercyclical pattern visible: volume and share sink in summer while price rises."
      >
        <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Indexed Progresso volume and share fall in summer while price rises.">
          <rect x={x(6) - 18} y={m.top - 8} width={x(8) - x(6) + 36} height={H - m.bottom - m.top + 16} fill="#f8fafc" />
          <text x={(x(6) + x(8)) / 2} y={m.top + 9} textAnchor="middle" className="fill-slate-500 text-[10px]">summer trough</text>
          {[50, 100, 150].map(t => (
            <g key={t}>
              <line x1={m.left} x2={W - m.right} y1={yIndex(t)} y2={yIndex(t)} stroke="#e2e8f0" />
              <text x={m.left - 8} y={yIndex(t) + 4} textAnchor="end" className="fill-slate-500 text-[10px]">{t}</text>
            </g>
          ))}
          {months.map(d => (
            <text key={d.month} x={x(d.month)} y={H - 18} textAnchor="middle" className="fill-slate-500 text-[10px]">
              {d.month_name}
            </text>
          ))}
          <line x1={m.left} x2={W - m.right} y1={yIndex(100)} y2={yIndex(100)} stroke="#94a3b8" strokeDasharray="4 4" />
          <path d={volumePath} fill="none" stroke="#1f3a5f" strokeWidth={3} />
          <path d={sharePath} fill="none" stroke="#2563eb" strokeWidth={3} />
          <path d={pricePath} fill="none" stroke="#c87c2a" strokeWidth={3} />
          {months.map(d => (
            <g key={`dots-${d.month}`}>
              <circle cx={x(d.month)} cy={yIndex(d.progresso_volume_index_jan ?? 0)} r={3.5} fill="#1f3a5f" />
              <circle cx={x(d.month)} cy={yIndex(d.progresso_share_index_jan ?? 0)} r={3.5} fill="#2563eb" />
              <circle cx={x(d.month)} cy={yIndex(d.progresso_price_index_jan ?? 0)} r={3.5} fill="#c87c2a" />
            </g>
          ))}
          <text x={W - m.right + 10} y={yIndex(months[11].progresso_volume_index_jan ?? 0) + 4} className="fill-[#1f3a5f] text-[11px]">volume index</text>
          <text x={W - m.right + 10} y={yIndex(months[11].progresso_share_index_jan ?? 0) + 4} className="fill-[#2563eb] text-[11px]">share index</text>
          <text x={W - m.right + 10} y={yIndex(months[11].progresso_price_index_jan ?? 0) + 4} className="fill-[#c87c2a] text-[11px]">price index</text>
          <AxisLabels x={W / 2} y={H - 4} xLabel="Month of year" yLabel="Index, Jan = 100" />
        </svg>
        <Legend
          items={[
            { label: 'Progresso volume index', color: '#1f3a5f' },
            { label: 'Progresso share index', color: '#2563eb' },
            { label: 'Progresso price index', color: '#c87c2a' },
          ]}
        />
      </ChartFrame>
      <div className="grid gap-3 sm:grid-cols-2">
        {data.seasonSummary.map(season => (
          <div key={String(season.soup_season)} className="rounded-md border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">{season.soup_season}</p>
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

function SparkLine({
  points,
  field,
  color,
  domain,
  formatter,
}: {
  points: RegionMonthPoint[];
  field: 'progresso_price' | 'progresso_share';
  color: string;
  domain: [number, number];
  formatter: (value: number) => string;
}) {
  const W = 250;
  const H = 124;
  const m = { top: 14, right: 14, bottom: 22, left: 32 };
  const x = scaleLinear([1, 12], [m.left, W - m.right]);
  const y = scaleLinear(domain, [H - m.bottom, m.top]);
  const path = linePath(points, d => x(d.month), d => y(Number(d[field])));
  const minPoint = points.reduce((a, b) => Number(b[field]) < Number(a[field]) ? b : a, points[0]);
  const maxPoint = points.reduce((a, b) => Number(b[field]) > Number(a[field]) ? b : a, points[0]);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full">
      {[domain[0], (domain[0] + domain[1]) / 2, domain[1]].map(t => (
        <g key={t}>
          <line x1={m.left} x2={W - m.right} y1={y(t)} y2={y(t)} stroke="#e2e8f0" />
          <text x={m.left - 6} y={y(t) + 3} textAnchor="end" className="fill-slate-400 text-[9px]">{formatter(t)}</text>
        </g>
      ))}
      {[1, 6, 12].map(month => (
        <text key={month} x={x(month)} y={H - 5} textAnchor="middle" className="fill-slate-400 text-[9px]">{monthName(month)}</text>
      ))}
      <path d={path} fill="none" stroke={color} strokeWidth={2.5} />
      {[minPoint, maxPoint].map(point => (
        <g key={`${point.month}-${Number(point[field])}`}>
          <circle cx={x(point.month)} cy={y(Number(point[field]))} r={3.5} fill={color} />
          <text x={x(point.month)} y={y(Number(point[field])) - 7} textAnchor="middle" className="fill-slate-700 text-[9px]">
            {formatter(Number(point[field]))}
          </text>
        </g>
      ))}
    </svg>
  );
}

export function SoupRegionSmallMultiples({ data }: { data: { regionMonth: RegionMonthPoint[] } }) {
  const rows = data.regionMonth;
  const priceDomain = paddedDomain(extent(rows, d => d.progresso_price), 0.04);
  const shareDomain = paddedDomain(extent(rows, d => d.progresso_share), 0.06);

  return (
    <div className="mx-auto grid max-w-4xl gap-4 md:grid-cols-2">
      {REGION_ORDER.map(region => {
        const regionRows = rows.filter(d => d.region === region).sort((a, b) => a.month - b.month);
        const color = REGION_COLORS[region];
        return (
          <ChartFrame key={region} title={region} subtitle="Same-scale panels make regional differences comparable.">
            <div className="grid gap-2 sm:grid-cols-2">
              <div>
                <p className="mb-1 text-xs font-medium text-slate-600">Progresso price</p>
                <SparkLine points={regionRows} field="progresso_price" color={color} domain={priceDomain} formatter={fmtMoney} />
              </div>
              <div>
                <p className="mb-1 text-xs font-medium text-slate-600">Progresso share</p>
                <SparkLine points={regionRows} field="progresso_share" color={color} domain={shareDomain} formatter={fmtPct} />
              </div>
            </div>
          </ChartFrame>
        );
      })}
    </div>
  );
}

export function SoupElasticityScatter({
  data,
  groupBy = 'region',
}: {
  data: { scatterSample: ScatterPoint[]; trendLines?: TrendLine[]; regionCoefficients?: Coefficient[]; seasonCoefficients?: Coefficient[] };
  groupBy?: 'region' | 'season';
}) {
  const groups = groupBy === 'region' ? REGION_ORDER : ['Winter', 'Non-winter'];
  const points = data.scatterSample ?? [];
  const xDomain = paddedDomain(extent(points, d => d.log_price), 0.05);
  const yDomain = paddedDomain(extent(points, d => d.log_volume), 0.05);
  const W = 320;
  const H = 250;
  const m = { top: 18, right: 18, bottom: 36, left: 42 };
  const x = scaleLinear(xDomain, [m.left, W - m.right]);
  const y = scaleLinear(yDomain, [H - m.bottom, m.top]);
  const coefs = groupBy === 'region' ? data.regionCoefficients ?? [] : data.seasonCoefficients ?? [];

  return (
    <div className="mx-auto grid max-w-4xl gap-4 md:grid-cols-2">
      {groups.map(group => {
        const groupPoints = points.filter(d => groupBy === 'region' ? d.region === group : d.season === group);
        const line = data.trendLines?.find(d => d.group === group) ?? fittedTrendLine(group, groupPoints);
        const coef = coefs.find(d => d.group === group);
        const color = groupBy === 'region' ? REGION_COLORS[group] : SEASON_COLORS[group];
        return (
          <ChartFrame
            key={group}
            title={group}
            subtitle={coef ? `Descriptive log-log slope: ${fmtCoef(coef.estimate)} (${fmtCoef(coef.ci_low)} to ${fmtCoef(coef.ci_high)})` : undefined}
          >
            <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label={`Log price by log volume scatter for ${group}.`}>
              {[xDomain[0], (xDomain[0] + xDomain[1]) / 2, xDomain[1]].map(t => (
                <g key={`x-${t}`}>
                  <line x1={x(t)} x2={x(t)} y1={m.top} y2={H - m.bottom} stroke="#f1f5f9" />
                  <text x={x(t)} y={H - 13} textAnchor="middle" className="fill-slate-400 text-[9px]">{t.toFixed(1)}</text>
                </g>
              ))}
              {[yDomain[0], (yDomain[0] + yDomain[1]) / 2, yDomain[1]].map(t => (
                <g key={`y-${t}`}>
                  <line x1={m.left} x2={W - m.right} y1={y(t)} y2={y(t)} stroke="#e2e8f0" />
                  <text x={m.left - 6} y={y(t) + 3} textAnchor="end" className="fill-slate-400 text-[9px]">{t.toFixed(1)}</text>
                </g>
              ))}
              {groupPoints.map((point, i) => (
                <circle
                  key={i}
                  cx={x(point.log_price)}
                  cy={y(point.log_volume)}
                  r={2.2}
                  fill={color}
                  opacity={groupBy === 'season' ? 0.28 : 0.32}
                />
              ))}
              {line && (
                <line
                  x1={x(line.x1)}
                  y1={y(line.y1)}
                  x2={x(line.x2)}
                  y2={y(line.y2)}
                  stroke={color}
                  strokeWidth={3}
                />
              )}
              <AxisLabels x={W / 2} y={H - 1} xLabel="log price" yLabel="log volume" />
            </svg>
          </ChartFrame>
        );
      })}
    </div>
  );
}

export function SoupUncertaintyIntervals({
  data,
}: {
  data: { monthlyShareIntervals: IntervalPoint[]; regionSeasonIntervals: IntervalPoint[]; coverage: Array<{ ym: string; active_stores: number }> };
}) {
  const months = [...data.monthlyShareIntervals].sort((a, b) => Number(a.month) - Number(b.month));
  const W = 760;
  const H = 260;
  const m = { top: 18, right: 24, bottom: 40, left: 52 };
  const yDomain = paddedDomain([Math.min(...months.map(d => d.ci_low)), Math.max(...months.map(d => d.ci_high))], 0.1);
  const x = scaleLinear([1, 12], [m.left, W - m.right]);
  const y = scaleLinear(yDomain, [H - m.bottom, m.top]);
  const coverageExtent = extent(data.coverage, d => d.active_stores);

  return (
    <div className="space-y-4">
      <ChartFrame
        title="Seasonal share intervals are narrow, but they are not causal proof"
        subtitle={`Active stores vary from ${coverageExtent[0].toLocaleString()} to ${coverageExtent[1].toLocaleString()} by month in the raw panel.`}
      >
        <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Monthly Progresso share with confidence intervals.">
          {[0.1, 0.2, 0.3, 0.4].map(t => (
            <g key={t}>
              <line x1={m.left} x2={W - m.right} y1={y(t)} y2={y(t)} stroke="#e2e8f0" />
              <text x={m.left - 8} y={y(t) + 4} textAnchor="end" className="fill-slate-500 text-[10px]">{fmtPct(t)}</text>
            </g>
          ))}
          {months.map(d => (
            <g key={d.month_name}>
              <line x1={x(Number(d.month))} x2={x(Number(d.month))} y1={y(d.ci_low)} y2={y(d.ci_high)} stroke="#1f3a5f" strokeWidth={2} />
              <circle cx={x(Number(d.month))} cy={y(d.mean)} r={4} fill="#1f3a5f" />
              <text x={x(Number(d.month))} y={H - 16} textAnchor="middle" className="fill-slate-500 text-[10px]">{d.month_name}</text>
            </g>
          ))}
          <AxisLabels x={W / 2} y={H - 2} xLabel="Month of year" yLabel="Mean store-month share" />
        </svg>
      </ChartFrame>
      <div className="grid gap-3 md:grid-cols-4">
        {REGION_ORDER.map(region => {
          const rows = data.regionSeasonIntervals.filter(d => d.region === region);
          return (
            <div key={region} className="rounded-md border border-slate-200 bg-white p-4">
              <p className="text-sm font-semibold text-slate-900">{region}</p>
              <div className="mt-3 space-y-3">
                {rows.map(row => (
                  <div key={row.season}>
                    <div className="mb-1 flex items-center justify-between text-xs text-slate-500">
                      <span>{row.season}</span>
                      <span>{fmtPct1(row.mean)}</span>
                    </div>
                    <div className="relative h-2 rounded-full bg-slate-100">
                      <div
                        className="absolute top-0 h-2 rounded-full"
                        style={{
                          left: `${clamp(row.ci_low * 100, 0, 60)}%`,
                          width: `${Math.max(2, (row.ci_high - row.ci_low) * 100)}%`,
                          background: row.season === 'Winter' ? '#1f3a5f' : '#c87c2a',
                        }}
                      />
                    </div>
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

function Histogram({ rows, label }: { rows: Array<{ x0: number; x1: number; count: number; label: string }>; label: string }) {
  const data = rows.filter(d => d.label === label);
  const W = 360;
  const H = 210;
  const m = { top: 18, right: 12, bottom: 34, left: 44 };
  const xDomain: [number, number] = [data[0].x0, data[data.length - 1].x1];
  const yDomain: [number, number] = [0, Math.max(...data.map(d => d.count))];
  const x = scaleLinear(xDomain, [m.left, W - m.right]);
  const y = scaleLinear(yDomain, [H - m.bottom, m.top]);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full">
      {[0, yDomain[1] / 2, yDomain[1]].map(t => (
        <g key={t}>
          <line x1={m.left} x2={W - m.right} y1={y(t)} y2={y(t)} stroke="#e2e8f0" />
          <text x={m.left - 6} y={y(t) + 3} textAnchor="end" className="fill-slate-400 text-[9px]">{Math.round(t / 1000)}k</text>
        </g>
      ))}
      {data.map(d => (
        <rect
          key={`${d.x0}-${d.x1}`}
          x={x(d.x0) + 1}
          y={y(d.count)}
          width={Math.max(1, x(d.x1) - x(d.x0) - 2)}
          height={H - m.bottom - y(d.count)}
          fill={label === 'Raw volume' ? '#1f3a5f' : '#2563eb'}
          opacity={0.82}
        />
      ))}
      <text x={W / 2} y={H - 8} textAnchor="middle" className="fill-slate-500 text-[10px]">{label === 'Raw volume' ? 'Progresso volume' : 'log(Progresso volume)'}</text>
    </svg>
  );
}

function CoefficientPlot({ rows, title }: { rows: Coefficient[]; title: string }) {
  const W = 720;
  const H = Math.max(170, rows.length * 34 + 54);
  const m = { top: 20, right: 28, bottom: 28, left: 160 };
  const domain = paddedDomain([Math.min(...rows.map(d => d.ci_low), -1), Math.max(...rows.map(d => d.ci_high), 0)], 0.04);
  const x = scaleLinear(domain, [m.left, W - m.right]);
  const yFor = (index: number) => m.top + 18 + index * 34;
  return (
    <ChartFrame title={title} subtitle="Intervals preview elasticity intuition; later pricing chapters handle identification.">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label={`${title} coefficient interval plot. `}>
        {[domain[0], -3, -2, -1, 0].filter(t => t >= domain[0] && t <= domain[1]).map(t => (
          <g key={t}>
            <line x1={x(t)} x2={x(t)} y1={m.top} y2={H - m.bottom} stroke={t === 0 ? '#94a3b8' : '#e2e8f0'} strokeDasharray={t === 0 ? '4 4' : undefined} />
            <text x={x(t)} y={H - 8} textAnchor="middle" className="fill-slate-500 text-[10px]">{t}</text>
          </g>
        ))}
        {rows.map((row, index) => {
          const y = yFor(index);
          const color = REGION_COLORS[row.group] ?? SEASON_COLORS[row.group] ?? '#1f3a5f';
          return (
            <g key={`${row.group}-${row.model ?? ''}`}>
              <text x={m.left - 10} y={y + 4} textAnchor="end" className="fill-slate-700 text-[11px]">
                {row.model ? `${row.group} · ${row.model.replace(' preview', '')}` : row.group}
              </text>
              <line x1={x(row.ci_low)} x2={x(row.ci_high)} y1={y} y2={y} stroke={color} strokeWidth={2.5} />
              <circle cx={x(row.estimate)} cy={y} r={4.5} fill={color} />
              <text x={x(row.estimate) + 8} y={y + 4} className="fill-slate-600 text-[10px]">{fmtCoef(row.estimate)}</text>
            </g>
          );
        })}
        <text x={(m.left + W - m.right) / 2} y={H - 8} textAnchor="middle" className="fill-slate-500 text-[10px]">log-log slope</text>
      </svg>
    </ChartFrame>
  );
}

export function SoupDistributionAndCoefficients({
  data,
}: {
  data: { histograms: Array<{ x0: number; x1: number; count: number; label: string }>; modelComparison: Coefficient[]; regionCoefficients: Coefficient[]; seasonCoefficients: Coefficient[] };
}) {
  const monthAdjustedRegions = data.regionCoefficients.filter(d => d.model === 'Month-adjusted preview');
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <ChartFrame title="Raw volume is a long-tail chart" subtitle="Most store-months are modest, but a few stores move a lot of soup.">
          <Histogram rows={data.histograms} label="Raw volume" />
        </ChartFrame>
        <ChartFrame title="The log transform makes comparison readable" subtitle="The same data becomes closer to a symmetric comparison space.">
          <Histogram rows={data.histograms} label="Log volume" />
        </ChartFrame>
      </div>
      <CoefficientPlot rows={data.modelComparison} title="National trend changes when seasonality enters the visual argument" />
      <CoefficientPlot rows={[...monthAdjustedRegions, ...data.seasonCoefficients]} title="Region and season views tell different pricing stories" />
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
  return (
    <div className="space-y-5">
      <div className="grid gap-3 md:grid-cols-2">
        {data.currentDashboard.map(panel => (
          <div key={panel.panel} className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-sm font-semibold text-slate-900">{panel.panel}</h3>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-600">{panel.mode}</span>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-slate-600">{panel.current_job}</p>
            <p className="mt-3 border-l-2 border-[#1f3a5f] pl-3 text-xs leading-relaxed text-slate-700">{panel.upgrade}</p>
          </div>
        ))}
      </div>
      <div className="rounded-md border border-slate-200 bg-slate-950 p-4 text-white shadow-sm">
        <h3 className="text-sm font-semibold">Redesigned dashboard sequence</h3>
        <div className="mt-4 grid gap-3 lg:grid-cols-3">
          {data.redesignedSequence.map(step => (
            <div key={step.step} className="rounded-md border border-white/10 bg-white/5 p-3">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-300">Step {step.step}</p>
              <h4 className="mt-1 text-sm font-semibold">{step.title}</h4>
              <p className="mt-2 text-xs leading-relaxed text-slate-300">{step.question}</p>
              <p className="mt-2 text-xs leading-relaxed text-slate-100">{step.visual}</p>
              <p className="mt-2 text-xs leading-relaxed text-[#f8d7a6]">{step.decision}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {data.dashboardRules.map(rule => (
          <div key={rule} className="rounded-md bg-slate-50 px-3 py-2 text-xs text-slate-700">{rule}</div>
        ))}
      </div>
    </div>
  );
}
