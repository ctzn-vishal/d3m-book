import * as React from 'react';

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

const SOURCE_COLORS: Record<string, string> = {
  Soup: '#1f3a5f',
  County: '#7c3aed',
  Zillow: '#0f766e',
  Teaching: '#c87c2a',
};

const SERIES_COLORS = ['#1f3a5f', '#c87c2a', '#0f766e', '#7c3aed', '#dc2626', '#2563eb', '#b45309', '#475569'];
const REGION_COLORS: Record<string, string> = {
  East: '#2563eb',
  Midwest: '#7c3aed',
  South: '#dc2626',
  West: '#0f766e',
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

function extent<T>(items: T[], accessor: (item: T) => number): [number, number] {
  const values = items.map(accessor).filter(Number.isFinite);
  return [Math.min(...values), Math.max(...values)];
}

function padded([min, max]: [number, number], pad = 0.08): [number, number] {
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

function dateValue(date: string) {
  const [year, month] = date.split('-').map(Number);
  return year + ((month ?? 1) - 1) / 12;
}

function groupBy<T>(items: T[], key: (item: T) => string): Record<string, T[]> {
  return items.reduce<Record<string, T[]>>((acc, item) => {
    const value = key(item);
    acc[value] = acc[value] ?? [];
    acc[value].push(item);
    return acc;
  }, {});
}

function interpolateColor(low: string, high: string, value: number) {
  const parse = (hex: string) => [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16));
  const [r0, g0, b0] = parse(low);
  const [r1, g1, b1] = parse(high);
  const t = Math.max(0, Math.min(1, value));
  const channel = (a: number, b: number) => Math.round(a + (b - a) * t).toString(16).padStart(2, '0');
  return `#${channel(r0, r1)}${channel(g0, g1)}${channel(b0, b1)}`;
}

function divergingColor(value: number, min: number, max: number, negative = '#2563eb', neutral = '#f8fafc', positive = '#dc2626') {
  const bound = Math.max(Math.abs(min), Math.abs(max), 1);
  if (value < 0) return interpolateColor(negative, neutral, (value + bound) / bound);
  return interpolateColor(neutral, positive, value / bound);
}

function compactNumber(value: number) {
  return new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(value);
}

function fitLine(rows: Array<{ x: number; y: number }>) {
  if (rows.length < 2) return null;
  const xMean = rows.reduce((sum, row) => sum + row.x, 0) / rows.length;
  const yMean = rows.reduce((sum, row) => sum + row.y, 0) / rows.length;
  const denom = rows.reduce((sum, row) => sum + (row.x - xMean) ** 2, 0);
  if (!Number.isFinite(denom) || denom === 0) return null;
  const slope = rows.reduce((sum, row) => sum + (row.x - xMean) * (row.y - yMean), 0) / denom;
  const intercept = yMean - slope * xMean;
  const [x1, x2] = extent(rows, row => row.x);
  return { x1, y1: intercept + slope * x1, x2, y2: intercept + slope * x2 };
}

function MiniFrame({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <svg viewBox="0 0 300 180" className="h-auto w-full" role="img" aria-label={label}>
      <rect x="0" y="0" width="300" height="180" rx="6" fill="#f8fafc" />
      {children}
    </svg>
  );
}

function HistogramChart({ rows }: { rows: Array<{ x0: number; x1: number; count: number }> }) {
  const W = 300; const H = 180; const m = { top: 24, right: 18, bottom: 28, left: 34 };
  const x = scale([rows[0].x0, rows[rows.length - 1].x1], [m.left, W - m.right]);
  const maxCount = Math.max(...rows.map(d => d.count));
  const y = scale([0, maxCount], [H - m.bottom, m.top]);
  return (
    <MiniFrame label="Histogram">
      {[0, maxCount / 2, maxCount].map(t => (
        <g key={t}>
          <line x1={m.left} x2={W - m.right} y1={y(t)} y2={y(t)} stroke="#e2e8f0" />
          <text x={m.left - 6} y={y(t) + 3} textAnchor="end" className="fill-slate-400 text-[8px]">{compactNumber(t)}</text>
        </g>
      ))}
      {rows.map(d => (
        <rect key={`${d.x0}-${d.x1}`} x={x(d.x0) + 1} y={y(d.count)} width={Math.max(1, x(d.x1) - x(d.x0) - 2)} height={H - m.bottom - y(d.count)} fill="#1f3a5f" opacity="0.82" />
      ))}
      <text x="150" y="166" textAnchor="middle" className="fill-slate-500 text-[10px]">store-month volume bins</text>
    </MiniFrame>
  );
}

function DensityChart({ rows }: { rows: Array<{ x: number; density: number }> }) {
  const W = 300; const H = 180; const m = { top: 24, right: 20, bottom: 28, left: 34 };
  const x = scale(extent(rows, d => d.x), [m.left, W - m.right]);
  const y = scale([0, Math.max(...rows.map(d => d.density))], [H - m.bottom, m.top]);
  const line = rows.map((d, i) => `${i === 0 ? 'M' : 'L'} ${x(d.x).toFixed(1)} ${y(d.density).toFixed(1)}`).join(' ');
  const area = `${line} L ${x(rows[rows.length - 1].x).toFixed(1)} ${H - m.bottom} L ${x(rows[0].x).toFixed(1)} ${H - m.bottom} Z`;
  return (
    <MiniFrame label="Density curve">
      <path d={area} fill="#7c3aed" opacity="0.18" />
      <path d={line} fill="none" stroke="#7c3aed" strokeWidth="3" />
      <line x1={m.left} x2={W - m.right} y1={H - m.bottom} y2={H - m.bottom} stroke="#cbd5e1" />
      {[0, 50, 100].map(t => (
        <text key={t} x={x(t)} y="166" textAnchor="middle" className="fill-slate-500 text-[9px]">{t}</text>
      ))}
    </MiniFrame>
  );
}

function BoxPlotChart({ rows }: { rows: Array<{ group: string; min: number; q1: number; median: number; q3: number; max: number }> }) {
  const W = 300; const H = 180; const m = { top: 24, right: 18, bottom: 26, left: 70 };
  const x = scale([0, 100], [m.left, W - m.right]);
  const rowGap = (H - m.top - m.bottom) / rows.length;
  return (
    <MiniFrame label="Box plots">
      {rows.map((row, i) => {
        const y = m.top + rowGap * i + rowGap / 2;
        return (
          <g key={row.group}>
            <text x={m.left - 8} y={y + 3} textAnchor="end" className="fill-slate-600 text-[9px]">{row.group}</text>
            <line x1={x(row.min)} x2={x(row.max)} y1={y} y2={y} stroke="#475569" strokeWidth="1.5" />
            <rect x={x(row.q1)} y={y - 8} width={x(row.q3) - x(row.q1)} height="16" fill="#ede9fe" stroke="#7c3aed" />
            <line x1={x(row.median)} x2={x(row.median)} y1={y - 10} y2={y + 10} stroke="#7c3aed" strokeWidth="2" />
          </g>
        );
      })}
    </MiniFrame>
  );
}

function BarChart({ rows }: { rows: Array<{ group: string; value: number }> }) {
  const W = 300; const H = 180; const m = { top: 24, right: 28, bottom: 22, left: 74 };
  const x = scale([0, 100], [m.left, W - m.right]);
  const rowGap = (H - m.top - m.bottom) / rows.length;
  return (
    <MiniFrame label="Sorted bar chart">
      {[50, 100].map(t => (
        <g key={t}>
          <line x1={x(t)} x2={x(t)} y1={m.top - 4} y2={H - m.bottom + 2} stroke="#e2e8f0" />
          <text x={x(t)} y="166" textAnchor="middle" className="fill-slate-400 text-[8px]">{t}%</text>
        </g>
      ))}
      {rows.map((row, i) => {
        const y = m.top + i * rowGap + 6;
        return (
          <g key={row.group}>
            <text x={m.left - 8} y={y + 11} textAnchor="end" className="fill-slate-600 text-[10px]">{row.group}</text>
            <rect x={m.left} y={y} width={x(row.value) - m.left} height="18" fill="#0f766e" opacity="0.82" />
            <text x={x(row.value) + 4} y={y + 12} className="fill-slate-600 text-[9px]">{row.value}%</text>
          </g>
        );
      })}
    </MiniFrame>
  );
}

function DotPlot({ rows }: { rows: Array<{ state: string; pct_change: number }> }) {
  const W = 300; const H = 180; const m = { top: 18, right: 28, bottom: 26, left: 74 };
  const x = scale(padded(extent(rows, d => d.pct_change), 0.02), [m.left, W - m.right]);
  const rowGap = (H - m.top - m.bottom) / rows.length;
  return (
    <MiniFrame label="Dot plot">
      {rows.map((row, i) => {
        const y = m.top + i * rowGap + rowGap / 2;
        return (
          <g key={row.state}>
            <text x={m.left - 8} y={y + 3} textAnchor="end" className="fill-slate-600 text-[8.5px]">{row.state}</text>
            <line x1={m.left} x2={x(row.pct_change)} y1={y} y2={y} stroke="#cbd5e1" strokeWidth="1.5" />
            <circle cx={x(row.pct_change)} cy={y} r="4" fill="#c87c2a" />
            <text x={x(row.pct_change) + 7} y={y + 3} className="fill-slate-600 text-[8px]">{row.pct_change}%</text>
          </g>
        );
      })}
    </MiniFrame>
  );
}

function MultiLineChart({ rows, valueKey, indexed = false }: { rows: Array<{ state: string; date: string; value?: number; index?: number }>; valueKey: 'value' | 'index'; indexed?: boolean }) {
  const W = 300; const H = 180; const m = { top: 20, right: 58, bottom: 28, left: 42 };
  const groups = groupBy(rows, d => d.state);
  const xDomain = extent(rows, d => dateValue(d.date));
  const yDomain = padded(extent(rows, d => Number(d[valueKey])), 0.05);
  const x = scale(xDomain, [m.left, W - m.right]);
  const y = scale(yDomain, [H - m.bottom, m.top]);
  return (
    <MiniFrame label={indexed ? 'Indexed time series' : 'Line chart'}>
      {Object.entries(groups).map(([state, points], i) => {
        const sorted = [...points].sort((a, b) => dateValue(a.date) - dateValue(b.date));
        const path = sorted.map((d, j) => `${j === 0 ? 'M' : 'L'} ${x(dateValue(d.date)).toFixed(1)} ${y(Number(d[valueKey])).toFixed(1)}`).join(' ');
        const last = sorted[sorted.length - 1];
        return (
          <g key={state}>
            <path d={path} fill="none" stroke={SERIES_COLORS[i % SERIES_COLORS.length]} strokeWidth="2.2" opacity="0.9" />
            <text x={W - m.right + 5} y={y(Number(last[valueKey])) + 3} className="fill-slate-600 text-[7.5px]">{state}</text>
          </g>
        );
      })}
      {indexed && <line x1={m.left} x2={W - m.right} y1={y(100)} y2={y(100)} stroke="#94a3b8" strokeDasharray="4 4" />}
      <text x="150" y="166" textAnchor="middle" className="fill-slate-500 text-[10px]">{indexed ? 'Jan 2020 = 100' : 'time'}</text>
    </MiniFrame>
  );
}

function SmallMultiples({ rows }: { rows: Array<{ state: string; date: string; value: number }> }) {
  const W = 300; const H = 180;
  const groups = Object.entries(groupBy(rows, d => d.state)).slice(0, 4);
  const yDomain = padded(extent(rows, d => d.value), 0.04);
  const xDomain = extent(rows, d => dateValue(d.date));
  return (
    <MiniFrame label="Small multiples">
      {groups.map(([state, points], i) => {
        const col = i % 2; const row = Math.floor(i / 2);
        const ox = 20 + col * 140; const oy = 18 + row * 78;
        const x = scale(xDomain, [ox + 14, ox + 126]);
        const y = scale(yDomain, [oy + 56, oy + 10]);
        const sorted = [...points].sort((a, b) => dateValue(a.date) - dateValue(b.date));
        const path = sorted.map((d, j) => `${j === 0 ? 'M' : 'L'} ${x(dateValue(d.date)).toFixed(1)} ${y(d.value).toFixed(1)}`).join(' ');
        return (
          <g key={state}>
            <text x={ox + 14} y={oy + 9} className="fill-slate-600 text-[9px]">{state}</text>
            <rect x={ox + 14} y={oy + 12} width="112" height="46" fill="#ffffff" stroke="#e2e8f0" />
            <path d={path} fill="none" stroke={SERIES_COLORS[i]} strokeWidth="2" />
          </g>
        );
      })}
    </MiniFrame>
  );
}

function ScatterChart({ rows, bubble = false }: { rows: Array<{ x: number; y: number; size?: number; group: string }>; bubble?: boolean }) {
  const W = 300; const H = 180; const m = { top: 20, right: 18, bottom: 30, left: 38 };
  const xDomain = padded(extent(rows, d => d.x), 0.05);
  const yDomain = padded(extent(rows, d => d.y), 0.05);
  const x = scale(xDomain, [m.left, W - m.right]);
  const y = scale(yDomain, [H - m.bottom, m.top]);
  const trend = fitLine(rows);
  return (
    <MiniFrame label={bubble ? 'Bubble plot' : 'Scatterplot'}>
      {[xDomain[0], (xDomain[0] + xDomain[1]) / 2, xDomain[1]].map(t => (
        <line key={`x-${t}`} x1={x(t)} x2={x(t)} y1={m.top} y2={H - m.bottom} stroke="#eef2f7" />
      ))}
      {[yDomain[0], (yDomain[0] + yDomain[1]) / 2, yDomain[1]].map(t => (
        <line key={`y-${t}`} x1={m.left} x2={W - m.right} y1={y(t)} y2={y(t)} stroke="#e2e8f0" />
      ))}
      {rows.map((row, i) => (
        <circle
          key={i}
          cx={x(row.x)}
          cy={y(row.y)}
          r={bubble ? Math.max(2, Math.min(12, row.size ?? 4)) : 2.1}
          fill={REGION_COLORS[row.group] ?? '#1f3a5f'}
          opacity={bubble ? 0.35 : 0.32}
        />
      ))}
      {trend && !bubble && <line x1={x(trend.x1)} x2={x(trend.x2)} y1={y(trend.y1)} y2={y(trend.y2)} stroke="#0f172a" strokeWidth="2.2" opacity="0.75" />}
      <text x="150" y="166" textAnchor="middle" className="fill-slate-500 text-[10px]">{bubble ? 'x-y plus size' : 'x-y relationship'}</text>
    </MiniFrame>
  );
}

function TileMap({ tiles }: { tiles: Array<{ abbr: string; row: number; col: number; value: number }> }) {
  const values = extent(tiles, d => d.value);
  const color = scale(values, [0, 1]);
  return (
    <MiniFrame label="Tile map">
      {tiles.map(tile => {
        const x = 18 + tile.col * 22;
        const y = 14 + tile.row * 18;
        return (
          <g key={tile.abbr}>
            <rect x={x} y={y} width="19" height="15" rx="2" fill={interpolateColor('#2563eb', '#dc2626', color(tile.value))} />
            <text x={x + 9.5} y={y + 10.5} textAnchor="middle" className="fill-white text-[7px] font-semibold">{tile.abbr}</text>
          </g>
        );
      })}
    </MiniFrame>
  );
}

function MatrixChart({ labels, cells }: { labels: string[]; cells: Array<{ row: string; col: string; value: number }> }) {
  const W = 300; const H = 180; const cell = 13.2; const x0 = 96; const y0 = 22;
  return (
    <MiniFrame label="Correlation matrix">
      {labels.map((label, i) => (
        <React.Fragment key={label}>
          <text x={x0 - 6} y={y0 + i * cell + 9} textAnchor="end" className="fill-slate-600 text-[7px]">{label}</text>
          <text x={x0 + i * cell + 6} y={y0 - 5} textAnchor="middle" className="fill-slate-600 text-[7px]" transform={`rotate(-45 ${x0 + i * cell + 6} ${y0 - 5})`}>{label}</text>
        </React.Fragment>
      ))}
      {cells.map(cellData => {
        const row = labels.indexOf(cellData.row);
        const col = labels.indexOf(cellData.col);
        return (
          <rect
            key={`${cellData.row}-${cellData.col}`}
            x={x0 + col * cell}
            y={y0 + row * cell}
            width={cell - 1}
            height={cell - 1}
            fill={divergingColor(cellData.value, -1, 1)}
          />
        );
      })}
      <text x={x0} y="166" className="fill-slate-500 text-[8px]">-1</text>
      <text x={x0 + labels.length * cell - 2} y="166" textAnchor="end" className="fill-slate-500 text-[8px]">+1</text>
    </MiniFrame>
  );
}

function HeatmapChart({ states, years, cells }: { states: string[]; years: string[]; cells: Array<{ state: string; year: string; change: number }> }) {
  const cellW = 21; const cellH = 13; const x0 = 84; const y0 = 24;
  const domain = extent(cells, d => d.change);
  return (
    <MiniFrame label="Heatmap">
      {states.map((state, i) => <text key={state} x={x0 - 6} y={y0 + i * cellH + 9} textAnchor="end" className="fill-slate-600 text-[7px]">{state}</text>)}
      {years.map((year, i) => <text key={year} x={x0 + i * cellW + 10} y={y0 - 6} textAnchor="middle" className="fill-slate-600 text-[7px]">{year.slice(2)}</text>)}
      {cells.map(d => {
        const row = states.indexOf(d.state);
        const col = years.indexOf(d.year);
        return <rect key={`${d.state}-${d.year}`} x={x0 + col * cellW} y={y0 + row * cellH} width={cellW - 1} height={cellH - 1} fill={divergingColor(d.change, domain[0], domain[1], '#2563eb', '#f8fafc', '#f97316')} />;
      })}
      <text x={x0} y="166" className="fill-slate-500 text-[8px]">cool</text>
      <text x={x0 + years.length * cellW} y="166" textAnchor="end" className="fill-slate-500 text-[8px]">hot</text>
    </MiniFrame>
  );
}

function IntervalChart({ rows }: { rows: Array<{ group: string; mean: number; ci_low: number; ci_high: number }> }) {
  const W = 300; const H = 180; const m = { top: 20, right: 18, bottom: 34, left: 38 };
  const yDomain = padded([Math.min(...rows.map(d => d.ci_low)), Math.max(...rows.map(d => d.ci_high))], 0.05);
  const y = scale(yDomain, [H - m.bottom, m.top]);
  const x = scale([0, rows.length - 1], [m.left, W - m.right]);
  const meanPath = rows.map((row, i) => `${i === 0 ? 'M' : 'L'} ${x(i).toFixed(1)} ${y(row.mean).toFixed(1)}`).join(' ');
  return (
    <MiniFrame label="Interval plot">
      {[50, 60, 70, 80].filter(t => t >= yDomain[0] && t <= yDomain[1]).map(t => (
        <g key={t}>
          <line x1={m.left} x2={W - m.right} y1={y(t)} y2={y(t)} stroke="#e2e8f0" />
          <text x={m.left - 6} y={y(t) + 3} textAnchor="end" className="fill-slate-400 text-[8px]">{t}</text>
        </g>
      ))}
      <path d={meanPath} fill="none" stroke="#94a3b8" strokeWidth="1.5" />
      {rows.map((row, i) => (
        <g key={row.group}>
          <line x1={x(i)} x2={x(i)} y1={y(row.ci_low)} y2={y(row.ci_high)} stroke="#1f3a5f" strokeWidth="2" />
          <circle cx={x(i)} cy={y(row.mean)} r="4" fill="#1f3a5f" />
          <text x={x(i)} y="162" textAnchor="middle" className="fill-slate-500 text-[8px]">{row.group}</text>
        </g>
      ))}
    </MiniFrame>
  );
}

function CoefficientChart({ rows }: { rows: Array<{ label: string; estimate: number; ci_low: number; ci_high: number }> }) {
  const W = 300; const H = 180; const m = { top: 18, right: 20, bottom: 24, left: 98 };
  const x = scale(padded([Math.min(...rows.map(d => d.ci_low), 0), Math.max(...rows.map(d => d.ci_high), 0)], 0.06), [m.left, W - m.right]);
  const rowGap = (H - m.top - m.bottom) / rows.length;
  return (
    <MiniFrame label="Coefficient plot">
      <line x1={x(0)} x2={x(0)} y1={m.top} y2={H - m.bottom} stroke="#94a3b8" strokeDasharray="4 4" />
      {rows.map((row, i) => {
        const y = m.top + i * rowGap + rowGap / 2;
        return (
          <g key={row.label}>
            <text x={m.left - 7} y={y + 3} textAnchor="end" className="fill-slate-600 text-[7.5px]">{row.label}</text>
            <line x1={x(row.ci_low)} x2={x(row.ci_high)} y1={y} y2={y} stroke={row.estimate >= 0 ? '#dc2626' : '#2563eb'} strokeWidth="2" />
            <circle cx={x(row.estimate)} cy={y} r="3.5" fill={row.estimate >= 0 ? '#dc2626' : '#2563eb'} />
          </g>
        );
      })}
    </MiniFrame>
  );
}

function ParetoChart({ rows }: { rows: Array<{ category: string; value: number }> }) {
  const W = 300; const H = 180; const m = { top: 20, right: 28, bottom: 36, left: 34 };
  const sorted = [...rows].sort((a, b) => b.value - a.value);
  const total = sorted.reduce((sum, row) => sum + row.value, 0);
  let running = 0;
  const x = scale([0, sorted.length], [m.left, W - m.right]);
  const yBar = scale([0, Math.max(...sorted.map(d => d.value))], [H - m.bottom, m.top]);
  const yCum = scale([0, 100], [H - m.bottom, m.top]);
  const points = sorted.map((row, i) => {
    running += row.value;
    return { x: x(i + 0.5), y: yCum((running / total) * 100) };
  });
  return (
    <MiniFrame label="Pareto chart">
      <line x1={m.left} x2={W - m.right} y1={yCum(80)} y2={yCum(80)} stroke="#94a3b8" strokeDasharray="4 4" />
      <text x={W - m.right} y={yCum(80) - 4} textAnchor="end" className="fill-slate-500 text-[8px]">80%</text>
      {sorted.map((row, i) => (
        <rect key={row.category} x={x(i) + 2} y={yBar(row.value)} width={Math.max(2, x(i + 1) - x(i) - 4)} height={H - m.bottom - yBar(row.value)} fill="#0f766e" opacity="0.75" />
      ))}
      <path d={points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ')} fill="none" stroke="#c87c2a" strokeWidth="3" />
      {points.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r="3" fill="#c87c2a" />)}
    </MiniFrame>
  );
}

function WaterfallChart({ rows }: { rows: Array<{ label: string; value: number; kind: string }> }) {
  const W = 300; const H = 180; const m = { top: 22, right: 18, bottom: 34, left: 34 };
  let cursor = 0;
  const spans = rows.map(row => {
    if (row.kind === 'start') {
      cursor = row.value;
      return { ...row, y0: 0, y1: row.value };
    }
    if (row.kind === 'end') return { ...row, y0: 0, y1: cursor };
    const y0 = cursor;
    cursor += row.value;
    return { ...row, y0, y1: cursor };
  });
  const y = scale(padded([Math.min(...spans.map(d => Math.min(d.y0, d.y1))), Math.max(...spans.map(d => Math.max(d.y0, d.y1)))], 0.05), [H - m.bottom, m.top]);
  const x = scale([0, rows.length], [m.left, W - m.right]);
  return (
    <MiniFrame label="Waterfall chart">
      {spans.map((row, i) => {
        const top = y(Math.max(row.y0, row.y1));
        const bottom = y(Math.min(row.y0, row.y1));
        const color = row.kind === 'start' || row.kind === 'end' ? '#1f3a5f' : row.value >= 0 ? '#0f766e' : '#dc2626';
        return (
          <g key={row.label}>
            <rect x={x(i) + 4} y={top} width={Math.max(4, x(i + 1) - x(i) - 8)} height={Math.max(2, bottom - top)} fill={color} opacity="0.82" />
            {(row.kind === 'start' || row.kind === 'end') && <text x={x(i + 0.5)} y={top - 5} textAnchor="middle" className="fill-slate-600 text-[8px]">{Math.round(row.y1)}</text>}
          </g>
        );
      })}
      <line x1={m.left} x2={W - m.right} y1={y(0)} y2={y(0)} stroke="#94a3b8" />
    </MiniFrame>
  );
}

function ChartVisual({ id, charts }: { id: string; charts: AtlasData['charts'] }) {
  switch (id) {
    case 'histogram': return <HistogramChart rows={charts.histogram.bins} />;
    case 'density': return <DensityChart rows={charts.density.points} />;
    case 'boxplot': return <BoxPlotChart rows={charts.boxplot.rows} />;
    case 'bar': return <BarChart rows={charts.bar.rows} />;
    case 'dot': return <DotPlot rows={charts.dot.rows} />;
    case 'line': return <MultiLineChart rows={charts.line.rows} valueKey="value" />;
    case 'indexedLine': return <MultiLineChart rows={charts.indexedLine.rows} valueKey="index" indexed />;
    case 'smallMultiples': return <SmallMultiples rows={charts.smallMultiples.rows} />;
    case 'scatter': return <ScatterChart rows={charts.scatter.points} />;
    case 'bubble': return <ScatterChart rows={charts.bubble.points} bubble />;
    case 'tileMap': return <TileMap tiles={charts.tileMap.tiles} />;
    case 'correlation': return <MatrixChart labels={charts.correlation.labels} cells={charts.correlation.cells} />;
    case 'heatmap': return <HeatmapChart states={charts.heatmap.states} years={charts.heatmap.years} cells={charts.heatmap.cells} />;
    case 'interval': return <IntervalChart rows={charts.interval.rows} />;
    case 'coefficient': return <CoefficientChart rows={charts.coefficient.rows} />;
    case 'pareto': return <ParetoChart rows={charts.pareto.rows} />;
    case 'waterfall': return <WaterfallChart rows={charts.waterfall.rows} />;
    default: return null;
  }
}

function AtlasCardView({ card, charts }: { card: AtlasCard; charts: AtlasData['charts'] }) {
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 bg-slate-50/80 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{card.family}</p>
            <h3 className="mt-1 text-base font-semibold text-slate-950">{card.title}</h3>
          </div>
          <span className="rounded-full px-2 py-1 text-[10px] font-semibold text-white" style={{ background: SOURCE_COLORS[card.dataSource] ?? '#475569' }}>
            {card.dataSource}
          </span>
        </div>
      </div>
      <div className="p-3">
        <ChartVisual id={card.id} charts={charts} />
      </div>
      <div className="mx-4 rounded-md border border-slate-200 bg-slate-50 p-3 text-xs leading-relaxed text-slate-700">
        <span className="font-semibold text-slate-950">Finding in this data: </span>{card.finding}
      </div>
      <div className="mt-auto space-y-2 border-t border-slate-100 p-4 text-xs leading-relaxed">
        <p><span className="font-semibold text-slate-900">Use:</span> <span className="text-slate-600">{card.useWhen}</span></p>
        <p><span className="font-semibold text-slate-900">Question:</span> <span className="text-slate-600">{card.managerQuestion}</span></p>
        <p><span className="font-semibold text-slate-900">Trap:</span> <span className="text-slate-600">{card.avoid}</span></p>
        <p className="border-l-2 pl-2 text-slate-700" style={{ borderColor: SOURCE_COLORS[card.dataSource] ?? '#cbd5e1' }}>{card.caseExample}</p>
      </div>
    </article>
  );
}

export function ChartAtlas({ data }: { data: AtlasData }) {
  const families = Array.from(new Set(data.cards.map(card => card.family)));
  const metrics = [
    { label: 'Soup panel', value: `${data.metadata.soup_rows.toLocaleString()} rows`, detail: `${data.metadata.soup_stores.toLocaleString()} stores, ${data.metadata.soup_date_range}` },
    { label: 'County cross-section', value: `${data.metadata.county_rows.toLocaleString()} counties`, detail: 'Demographics, votes, density, region, and state geography' },
    { label: 'Zillow time series', value: `${data.metadata.zillow_states.toLocaleString()} states`, detail: data.metadata.zillow_date_range },
    { label: 'Atlas scope', value: `${data.cards.length} chart forms`, detail: `${families.length} evidence families` },
  ];

  return (
    <div className="space-y-8">
      <div className="rounded-md border border-slate-200 bg-slate-950 p-5 text-white shadow-sm">
        <div className="grid gap-4 lg:grid-cols-[1.3fr_2fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-300">How to read the atlas</p>
            <h3 className="mt-1 text-xl font-semibold">Start from the comparison, then choose the chart.</h3>
            <p className="mt-3 text-sm leading-relaxed text-slate-300">
              Each card moves from business question to visual form to misuse risk. The miniature chart is evidence from the teaching data, not filler art.
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
          <div key={note.case} className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-sm font-semibold" style={{ color: SOURCE_COLORS[note.case] ?? '#0f172a' }}>{note.case}</p>
            <p className="mt-1 text-xs leading-relaxed text-slate-600">{note.role}</p>
          </div>
        ))}
      </div>
      {families.map(family => (
        <section key={family}>
          <div className="mb-3 flex items-end justify-between gap-3 border-b border-slate-200 pb-2">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-700">{family}</h3>
              <p className="mt-1 text-xs text-slate-500">{FAMILY_NOTES[family]}</p>
            </div>
            <p className="text-xs text-slate-500">
              {data.cards.filter(card => card.family === family).length} chart{data.cards.filter(card => card.family === family).length === 1 ? '' : 's'}
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {data.cards.filter(card => card.family === family).map(card => (
              <AtlasCardView key={card.id} card={card} charts={data.charts} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

export default ChartAtlas;
