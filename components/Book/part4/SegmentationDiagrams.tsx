'use client';

import * as React from 'react';

/**
 * Conceptual diagrams for Part IV Chapters 16–17.
 *
 *   - ClusterSmallMultiples: segment profiles as small radar/bar grids.
 *   - PCABiplotScree: scree plot + biplot pair for PCA intuition.
 *   - PerceptualMap: brand positioning map.
 *   - TsneVsPca: side-by-side caution diagram.
 *   - TargetingTaxonomy: ad-platform targeting categories.
 *   - ReachSimilarityCurve: lookalike audience tradeoff.
 *   - RetargetingFunnel: digital marketing funnel.
 *   - CoPurchaseNetwork: market-basket co-purchase mini-network.
 *   - RankedListMock: ranked recommendation list with action cutoff.
 *   - MonitoringDashboardMock: model-in-production KPI mock.
 *   - DriftSchematic: data drift vs concept drift.
 *
 * Style conventions match PredictionDiagrams.tsx / part3 ConceptDiagrams.
 */

const C = {
  ink: '#172033',
  muted: '#64748b',
  grid: '#e2e8f0',
  blue: '#2563eb',
  blueLight: '#dbeafe',
  navy: '#1f3a5f',
  orange: '#c87c2a',
  orangeLight: '#fed7aa',
  green: '#0f766e',
  greenLight: '#ccfbf1',
  red: '#dc2626',
  redLight: '#fee2e2',
  purple: '#7c3aed',
  purpleLight: '#ede9fe',
  amber: '#d97706',
  amberLight: '#fef3c7',
  teal: '#0d9488',
  tealLight: '#a7f3d0',
  pink: '#db2777',
  pinkLight: '#fce7f3',
  slate100: '#f1f5f9',
  slate50: '#f8fafc',
};

function Card({ title, children, footer }: { title?: string; children: React.ReactNode; footer?: React.ReactNode }) {
  return (
    <div className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
      {title && (
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
          {title}
        </p>
      )}
      {children}
      {footer && <div className="mt-2 text-[11px] text-slate-500">{footer}</div>}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 16.1 — ClusterSmallMultiples (segment profile cards)                  */
/* ------------------------------------------------------------------ */

export function ClusterSmallMultiples() {
  const features = ['Recency', 'Frequency', 'Spend', 'Discounts', 'Premium'];
  const segments = [
    { name: 'Morning Loyalists', color: C.blue, scores: [0.85, 0.9, 0.55, 0.2, 0.35] },
    { name: 'Weekend Treat Seekers', color: C.amber, scores: [0.5, 0.4, 0.75, 0.3, 0.85] },
    { name: 'Price-Sensitive Switchers', color: C.red, scores: [0.6, 0.55, 0.4, 0.95, 0.15] },
    { name: 'Premium Explorers', color: C.purple, scores: [0.45, 0.35, 0.9, 0.2, 0.95] },
    { name: 'Low-Engagement Occasionals', color: C.muted, scores: [0.2, 0.15, 0.25, 0.3, 0.2] },
  ];
  return (
    <Card title="Five Bean &amp; Basket segments, profiled against five features">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {segments.map(s => (
          <div key={s.name} className="rounded-md border border-slate-200 p-2.5">
            <div className="mb-1 flex items-center gap-2">
              <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: s.color }} />
              <span className="text-[12px] font-semibold text-slate-800">{s.name}</span>
            </div>
            <ul className="space-y-1">
              {features.map((f, i) => (
                <li key={f} className="grid grid-cols-[72px_minmax(0,1fr)] items-center gap-1.5 text-[10.5px]">
                  <span className="text-slate-500">{f}</span>
                  <span className="block h-2 rounded bg-slate-100">
                    <span className="block h-2 rounded" style={{ width: `${s.scores[i] * 100}%`, background: s.color, opacity: 0.85 }} />
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <p className="mt-3 text-[11px] text-slate-500">
        The clusters are a lens, not a truth. Names come from the analyst after looking at the bars — the algorithm only sees similarity.
      </p>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* 16.2a — PCABiplotScree                                                */
/* ------------------------------------------------------------------ */

export function PCABiplotScree() {
  const W = 720;
  const H = 280;
  const left = 30;
  const colW = (W - 60) / 2;
  // scree data
  const variance = [0.42, 0.28, 0.11, 0.07, 0.05, 0.03, 0.02, 0.015, 0.01];
  // biplot: brands + variable loadings
  const brands = [
    { name: 'Bean & Basket', x: 0.45, y: 0.55, color: C.green },
    { name: 'Starbucks', x: 0.65, y: 0.7, color: C.green },
    { name: 'Dunkin', x: -0.4, y: 0.15, color: C.blue },
    { name: 'Blue Bottle', x: 0.75, y: 0.2, color: C.purple },
    { name: 'local café', x: 0.2, y: -0.4, color: C.amber },
    { name: 'convenience', x: -0.7, y: -0.55, color: C.red },
  ];
  const loadings = [
    { name: 'premium', x: 0.85, y: 0.45 },
    { name: 'affordable', x: -0.85, y: 0.05 },
    { name: 'cozy', x: 0.35, y: -0.7 },
    { name: 'convenient', x: -0.55, y: 0.6 },
    { name: 'innovative', x: 0.6, y: 0.55 },
  ];
  return (
    <Card title="Scree plot + biplot — variance and meaning together">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Scree plot showing variance per component and a biplot with brand scores and variable loadings.">
        {/* scree */}
        <g transform={`translate(${left},20)`}>
          <text x={colW / 2} y={0} textAnchor="middle" className="fill-slate-800 text-[11px] font-semibold">Scree</text>
          {(() => {
            const innerW = colW - 50;
            const innerH = 190;
            const ox = 40;
            const oy = 24;
            const barW = innerW / variance.length - 2;
            return (
              <g>
                <line x1={ox} y1={oy} x2={ox} y2={oy + innerH} stroke={C.ink} strokeWidth={1} />
                <line x1={ox} y1={oy + innerH} x2={ox + innerW} y2={oy + innerH} stroke={C.ink} strokeWidth={1} />
                {variance.map((v, i) => {
                  const h = v * innerH * 1.6;
                  return <rect key={i} x={ox + 6 + i * (barW + 2)} y={oy + innerH - h} width={barW} height={h} fill={i < 2 ? C.blue : C.muted} opacity={0.85} />;
                })}
                {/* elbow line at 2 */}
                <line x1={ox + 6 + 2 * (barW + 2)} y1={oy} x2={ox + 6 + 2 * (barW + 2)} y2={oy + innerH} stroke={C.amber} strokeWidth={1.4} strokeDasharray="4 3" />
                <text x={ox + 6 + 2 * (barW + 2)} y={oy - 4} textAnchor="middle" className="fill-amber-700 text-[10px] font-semibold">elbow</text>
                <text x={ox + innerW / 2} y={oy + innerH + 18} textAnchor="middle" className="fill-slate-600 text-[10px]">Component →</text>
                <text x={ox - 28} y={oy + innerH / 2} transform={`rotate(-90 ${ox - 28} ${oy + innerH / 2})`} textAnchor="middle" className="fill-slate-600 text-[10px]">Variance explained</text>
              </g>
            );
          })()}
        </g>
        {/* biplot */}
        <g transform={`translate(${left + colW + 30},20)`}>
          <text x={colW / 2} y={0} textAnchor="middle" className="fill-slate-800 text-[11px] font-semibold">Biplot</text>
          {(() => {
            const innerW = colW - 50;
            const innerH = 190;
            const ox = 40;
            const oy = 24;
            const cx = ox + innerW / 2;
            const cy = oy + innerH / 2;
            const xS = (v: number) => cx + v * (innerW / 2 - 8);
            const yS = (v: number) => cy - v * (innerH / 2 - 8);
            return (
              <g>
                <rect x={ox} y={oy} width={innerW} height={innerH} fill={C.slate50} stroke={C.grid} />
                <line x1={ox} y1={cy} x2={ox + innerW} y2={cy} stroke={C.muted} strokeWidth={1} strokeDasharray="2 3" />
                <line x1={cx} y1={oy} x2={cx} y2={oy + innerH} stroke={C.muted} strokeWidth={1} strokeDasharray="2 3" />
                {loadings.map(l => (
                  <g key={l.name}>
                    <line x1={cx} y1={cy} x2={xS(l.x)} y2={yS(l.y)} stroke={C.purple} strokeWidth={1.4} markerEnd="url(#biplot-arrow)" />
                    <text x={xS(l.x) + (l.x >= 0 ? 4 : -4)} y={yS(l.y) - 4} textAnchor={l.x >= 0 ? 'start' : 'end'} className="fill-purple-700 text-[9px] italic">{l.name}</text>
                  </g>
                ))}
                {brands.map(b => (
                  <g key={b.name}>
                    <circle cx={xS(b.x)} cy={yS(b.y)} r={5} fill={b.color} />
                    <text x={xS(b.x) + 6} y={yS(b.y) + 3} className="fill-slate-700 text-[9px]">{b.name}</text>
                  </g>
                ))}
                <text x={cx + innerW / 2 - 6} y={cy - 6} textAnchor="end" className="fill-slate-500 text-[9px]">PC1: value → premium</text>
                <text x={cx + 4} y={oy + 12} className="fill-slate-500 text-[9px]">PC2: convenience → experience</text>
              </g>
            );
          })()}
        </g>
        <defs>
          <marker id="biplot-arrow" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto" markerUnits="strokeWidth">
            <path d="M0,0 L0,6 L7,3 z" fill={C.purple} />
          </marker>
        </defs>
      </svg>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* 16.2b — PerceptualMap                                                 */
/* ------------------------------------------------------------------ */

export function PerceptualMap() {
  const W = 640;
  const H = 360;
  const m = { left: 40, right: 30, top: 30, bottom: 40 };
  const innerW = W - m.left - m.right;
  const innerH = H - m.top - m.bottom;
  const cx = m.left + innerW / 2;
  const cy = m.top + innerH / 2;
  const xS = (v: number) => cx + v * (innerW / 2 - 12);
  const yS = (v: number) => cy - v * (innerH / 2 - 12);
  const brands = [
    { name: "McDonald's", x: -0.65, y: 0.55, color: C.red },
    { name: 'KFC', x: -0.45, y: 0.4, color: C.red },
    { name: 'Burger King', x: -0.55, y: 0.25, color: C.amber },
    { name: 'Subway', x: 0.05, y: 0.05, color: C.green },
    { name: 'Chipotle', x: 0.55, y: 0.2, color: C.green },
    { name: 'Panera', x: 0.7, y: 0.5, color: C.purple },
    { name: 'Sweetgreen', x: 0.8, y: 0.7, color: C.purple },
    { name: 'Wendy’s', x: -0.35, y: 0.35, color: C.amber },
    { name: 'Domino’s', x: -0.55, y: -0.3, color: C.muted },
    { name: 'Taco Bell', x: -0.7, y: -0.1, color: C.muted },
  ];
  return (
    <Card title="Fast-food perceptual map (illustrative)">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="A perceptual map placing fast-food brands along a value-to-premium axis and a familiar-to-fresh axis.">
        <rect x={m.left} y={m.top} width={innerW} height={innerH} fill={C.slate50} stroke={C.grid} />
        <line x1={m.left} y1={cy} x2={W - m.right} y2={cy} stroke={C.muted} strokeWidth={1.2} />
        <line x1={cx} y1={m.top} x2={cx} y2={H - m.bottom} stroke={C.muted} strokeWidth={1.2} />
        {/* quadrant labels */}
        <text x={m.left + 8} y={m.top + 16} className="fill-slate-400 text-[10px] italic">familiar &amp; cheap</text>
        <text x={W - m.right - 8} y={m.top + 16} textAnchor="end" className="fill-slate-400 text-[10px] italic">fresh &amp; premium</text>
        <text x={m.left + 8} y={H - m.bottom - 8} className="fill-slate-400 text-[10px] italic">commodity</text>
        <text x={W - m.right - 8} y={H - m.bottom - 8} textAnchor="end" className="fill-slate-400 text-[10px] italic">aspirational casual</text>
        {/* brands */}
        {brands.map(b => (
          <g key={b.name}>
            <circle cx={xS(b.x)} cy={yS(b.y)} r={5} fill={b.color} />
            <text x={xS(b.x) + 8} y={yS(b.y) + 3} className="fill-slate-800 text-[10px] font-medium">{b.name}</text>
          </g>
        ))}
        {/* axes */}
        <text x={cx + innerW / 2 - 4} y={cy - 6} textAnchor="end" className="fill-slate-600 text-[10px]">Factor 1: value → premium →</text>
        <text x={cx + 6} y={m.top + 12} className="fill-slate-600 text-[10px]">Factor 2: familiar → fresh ↑</text>
      </svg>
      <p className="mt-2 text-[11px] text-slate-500">
        Distances on the map measure perceived similarity. White space — quadrants without brands — suggests positioning opportunities.
      </p>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* 16.3 — TsneVsPca                                                      */
/* ------------------------------------------------------------------ */

export function TsneVsPca() {
  const W = 720;
  const H = 260;
  const panelW = (W - 80) / 2;
  // deterministic point generator
  const rng = (() => { let s = 23; return () => (s = (s * 1103515245 + 12345) % 2 ** 31, s / 2 ** 31); })();
  const groups = [
    { color: C.blue, label: 'A' },
    { color: C.orange, label: 'B' },
    { color: C.green, label: 'C' },
    { color: C.purple, label: 'D' },
  ];
  // PCA-like: linearly separable along x
  const pcaPts = groups.flatMap((g, gi) => Array.from({ length: 28 }, () => ({
    x: (gi - 1.5) * 0.5 + (rng() - 0.5) * 0.3,
    y: (rng() - 0.5) * 1.4,
    c: g.color,
  })));
  // tSNE-like: tight neighborhoods, scrambled positions
  const tsnePts = groups.flatMap((g, gi) => {
    const center = [
      [-0.55, 0.5],
      [0.55, 0.6],
      [-0.45, -0.55],
      [0.5, -0.5],
    ][gi];
    return Array.from({ length: 28 }, () => ({
      x: center[0] + (rng() - 0.5) * 0.3,
      y: center[1] + (rng() - 0.5) * 0.3,
      c: g.color,
    }));
  });
  const panel = (offset: number, title: string, sub: string, pts: { x: number; y: number; c: string }[], showAxes: boolean) => {
    const innerW = panelW;
    const innerH = 180;
    const ox = offset;
    const oy = 36;
    const cx = ox + innerW / 2;
    const cy = oy + innerH / 2;
    const xS = (v: number) => cx + v * (innerW / 2 - 8);
    const yS = (v: number) => cy - v * (innerH / 2 - 8);
    return (
      <g>
        <text x={ox + innerW / 2} y={20} textAnchor="middle" className="fill-slate-800 text-[11px] font-semibold">{title}</text>
        <text x={ox + innerW / 2} y={32} textAnchor="middle" className="fill-slate-500 text-[10px]">{sub}</text>
        <rect x={ox} y={oy} width={innerW} height={innerH} fill={C.slate50} stroke={C.grid} />
        {showAxes && (
          <>
            <line x1={ox} y1={cy} x2={ox + innerW} y2={cy} stroke={C.muted} strokeWidth={1} strokeDasharray="2 3" />
            <line x1={cx} y1={oy} x2={cx} y2={oy + innerH} stroke={C.muted} strokeWidth={1} strokeDasharray="2 3" />
            <text x={ox + innerW - 6} y={cy - 4} textAnchor="end" className="fill-slate-500 text-[9px]">PC1</text>
            <text x={cx + 4} y={oy + 12} className="fill-slate-500 text-[9px]">PC2</text>
          </>
        )}
        {!showAxes && (
          <text x={ox + innerW - 6} y={oy + innerH - 6} textAnchor="end" className="fill-slate-400 text-[9px] italic">axes have no business meaning</text>
        )}
        {pts.map((p, i) => (
          <circle key={i} cx={xS(p.x)} cy={yS(p.y)} r={2.6} fill={p.c} opacity={0.85} />
        ))}
      </g>
    );
  };
  return (
    <Card title="PCA: axes you can read. t-SNE / UMAP: neighborhoods you can see.">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Side by side: PCA gives interpretable axes; t-SNE gives tight neighborhoods.">
        {panel(30, 'PCA', 'linear axes carry meaning', pcaPts, true)}
        {panel(30 + panelW + 20, 't-SNE / UMAP', 'tight neighborhoods, no axis meaning', tsnePts, false)}
      </svg>
      <p className="mt-2 text-[11px] text-slate-500">
        Don’t read distances or angles in a t-SNE/UMAP map literally. They are good for spotting groups, poor for explaining them.
      </p>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* 17.1 — TargetingTaxonomy                                              */
/* ------------------------------------------------------------------ */

export function TargetingTaxonomy() {
  const groups = [
    { name: 'Location', color: C.green, items: ['country', 'city / zip', 'radius', 'residents vs. visitors'] },
    { name: 'Demographic', color: C.amber, items: ['age', 'gender', 'education', 'job title', 'life events'] },
    { name: 'Interest', color: C.purple, items: ['hobbies', 'entertainment', 'shopping', 'sports', 'cuisine'] },
    { name: 'Behavioral', color: C.orange, items: ['past purchases', 'device usage', 'travel', 'site visits'] },
    { name: 'Custom Audiences', color: C.teal, items: ['site visitors', 'email list', 'app users', 'CRM upload'] },
    { name: 'Lookalike', color: C.blue, items: ['seed audience', 'similarity threshold', 'reach setting'] },
  ];
  return (
    <Card title="Ad-platform targeting — six families layered to find a customer">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {groups.map(g => (
          <div key={g.name} className="rounded-md border border-slate-200 p-3">
            <div className="mb-1.5 flex items-center gap-2">
              <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: g.color }} />
              <span className="text-[12px] font-semibold text-slate-800">{g.name}</span>
            </div>
            <ul className="space-y-0.5 text-[11px] text-slate-700">
              {g.items.map(it => (
                <li key={it} className="font-mono">· {it}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <p className="mt-3 text-[11px] text-slate-500">
        Layering families is the standard targeting strategy. Layer too many and the audience disappears; too few and the audience is everyone.
      </p>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* 17.1 — ReachSimilarityCurve                                           */
/* ------------------------------------------------------------------ */

export function ReachSimilarityCurve() {
  const W = 640;
  const H = 240;
  const m = { left: 60, right: 30, top: 28, bottom: 40 };
  const innerW = W - m.left - m.right;
  const innerH = H - m.top - m.bottom;
  // x = audience size percentile (1% best match → 10% widest)
  const pts = [
    { size: 1, sim: 95, reach: 10 },
    { size: 2, sim: 90, reach: 25 },
    { size: 3, sim: 85, reach: 50 },
    { size: 4, sim: 80, reach: 80 },
    { size: 5, sim: 75, reach: 120 },
    { size: 6, sim: 70, reach: 180 },
    { size: 7, sim: 65, reach: 250 },
    { size: 8, sim: 60, reach: 350 },
    { size: 9, sim: 55, reach: 500 },
    { size: 10, sim: 50, reach: 700 },
  ];
  const xS = (v: number) => m.left + ((v - 1) / 9) * innerW;
  const ySim = (v: number) => m.top + innerH - ((v - 40) / 60) * innerH;
  const path = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${xS(p.size)} ${ySim(p.sim)}`).join(' ');
  return (
    <Card title="Reach vs. similarity — the lookalike dial">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="A curve showing how lookalike similarity falls as the audience expands.">
        <line x1={m.left} y1={m.top} x2={m.left} y2={H - m.bottom} stroke={C.ink} strokeWidth={1} />
        <line x1={m.left} y1={H - m.bottom} x2={W - m.right} y2={H - m.bottom} stroke={C.ink} strokeWidth={1} />
        <path d={path} fill="none" stroke={C.blue} strokeWidth={2.4} />
        {pts.map(p => (
          <circle key={p.size} cx={xS(p.size)} cy={ySim(p.sim)} r={3.2} fill={C.blue} />
        ))}
        {[1, 3, 5, 7, 9].map(s => (
          <text key={s} x={xS(s)} y={H - m.bottom + 14} textAnchor="middle" className="fill-slate-500 text-[10px]">{s}%</text>
        ))}
        {[50, 60, 70, 80, 90].map(v => (
          <text key={v} x={m.left - 6} y={ySim(v) + 3} textAnchor="end" className="fill-slate-500 text-[10px]">{v}%</text>
        ))}
        <text x={(m.left + W - m.right) / 2} y={H - 8} textAnchor="middle" className="fill-slate-700 text-[11px]">Audience size (% of population)</text>
        <text x={16} y={(m.top + H - m.bottom) / 2} transform={`rotate(-90 16 ${(m.top + H - m.bottom) / 2})`} textAnchor="middle" className="fill-slate-700 text-[11px]">Similarity to seed (%)</text>
        <text x={xS(2.5)} y={ySim(92)} className="fill-emerald-700 text-[10px] italic">precise but small</text>
        <text x={xS(8.5)} y={ySim(60)} className="fill-rose-700 text-[10px] italic">broad but diluted</text>
      </svg>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* 17.1 — RetargetingFunnel                                              */
/* ------------------------------------------------------------------ */

export function RetargetingFunnel() {
  const stages = [
    { label: 'Impressions', value: 100, color: C.blue },
    { label: 'Clicks', value: 18, color: C.purple },
    { label: 'Site visits', value: 12, color: C.teal },
    { label: 'Add-to-cart', value: 4, color: C.amber },
    { label: 'Purchases', value: 1.4, color: C.green },
  ];
  const W = 640;
  const H = 220;
  const stageH = (H - 40) / stages.length;
  const max = stages[0].value;
  return (
    <Card title="A simplified ad funnel — retargeting layers nudge each stage">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="A simple funnel from impressions to purchases.">
        {stages.map((s, i) => {
          const ratio = s.value / max;
          const barW = ratio * (W - 200);
          const y = 20 + i * stageH;
          return (
            <g key={s.label}>
              <text x={W / 2 - 110} y={y + stageH / 2 + 4} textAnchor="end" className="fill-slate-800 text-[12px] font-semibold">{s.label}</text>
              <rect x={W / 2 - 100} y={y + 4} width={barW} height={stageH - 8} rx={3} fill={s.color} opacity={0.85} />
              <text x={W / 2 - 100 + barW + 8} y={y + stageH / 2 + 4} className="fill-slate-700 text-[11px] tabular-nums">{s.value}%</text>
            </g>
          );
        })}
      </svg>
      <p className="mt-1 text-center text-[11px] text-slate-500">
        Retargeting custom audiences re-engages users who reached a particular stage but didn’t convert.
      </p>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* 17.2 — CoPurchaseNetwork                                              */
/* ------------------------------------------------------------------ */

export function CoPurchaseNetwork() {
  const W = 640;
  const H = 320;
  const nodes = [
    { id: 'latte', x: 320, y: 130, r: 28, color: C.blue, label: 'Latte' },
    { id: 'croissant', x: 180, y: 60, r: 22, color: C.amber, label: 'Croissant' },
    { id: 'cappuccino', x: 460, y: 70, r: 22, color: C.blue, label: 'Cappuccino' },
    { id: 'muffin', x: 90, y: 180, r: 18, color: C.amber, label: 'Muffin' },
    { id: 'cold-brew', x: 540, y: 200, r: 22, color: C.teal, label: 'Cold brew' },
    { id: 'sandwich', x: 240, y: 250, r: 20, color: C.green, label: 'Sandwich' },
    { id: 'cookie', x: 420, y: 260, r: 18, color: C.amber, label: 'Cookie' },
  ];
  const edges = [
    ['latte', 'croissant', 0.9],
    ['latte', 'muffin', 0.6],
    ['latte', 'cookie', 0.5],
    ['cappuccino', 'croissant', 0.7],
    ['cappuccino', 'cold-brew', 0.4],
    ['cold-brew', 'sandwich', 0.55],
    ['sandwich', 'cookie', 0.45],
    ['latte', 'cold-brew', 0.35],
    ['latte', 'sandwich', 0.5],
  ] as const;
  const getNode = (id: string) => nodes.find(n => n.id === id)!;
  return (
    <Card title="Co-purchase network — pastries pair with espresso, sandwiches with cold brew">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="A small market-basket network with latte at the center.">
        {edges.map(([a, b, w]) => {
          const A = getNode(a);
          const B = getNode(b);
          return <line key={`${a}-${b}`} x1={A.x} y1={A.y} x2={B.x} y2={B.y} stroke={C.muted} strokeWidth={1 + w * 3} opacity={0.45} />;
        })}
        {nodes.map(n => (
          <g key={n.id}>
            <circle cx={n.x} cy={n.y} r={n.r} fill="white" stroke={n.color} strokeWidth={2.2} />
            <text x={n.x} y={n.y + 4} textAnchor="middle" className="fill-slate-800 text-[11px] font-semibold">{n.label}</text>
          </g>
        ))}
      </svg>
      <p className="mt-1 text-center text-[11px] text-slate-500">
        Edge thickness ≈ lift × support. Use these pairings as the seed for add-on recommendations.
      </p>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* 17.2 — RankedListMock                                                 */
/* ------------------------------------------------------------------ */

export function RankedListMock() {
  const items = [
    { rank: 1, name: 'Cinnamon roll', score: 0.92, act: true },
    { rank: 2, name: 'Almond croissant', score: 0.84, act: true },
    { rank: 3, name: 'Banana bread', score: 0.76, act: true },
    { rank: 4, name: 'Cold brew float', score: 0.68, act: true },
    { rank: 5, name: 'Chocolate chip cookie', score: 0.55, act: false },
    { rank: 6, name: 'Iced matcha', score: 0.41, act: false },
    { rank: 7, name: 'Avocado toast', score: 0.32, act: false },
  ];
  return (
    <Card title="Ranked recommendation for one customer at 8:14 AM">
      <div className="overflow-hidden rounded-md border border-slate-200">
        <table className="w-full text-[12px]">
          <thead>
            <tr className="bg-slate-50 text-[10px] uppercase tracking-wide text-slate-500">
              <th className="w-12 px-2 py-1.5 text-left">#</th>
              <th className="px-2 py-1.5 text-left">Add-on</th>
              <th className="w-24 px-2 py-1.5 text-right">Score</th>
              <th className="w-24 px-2 py-1.5 text-right">Show?</th>
            </tr>
          </thead>
          <tbody>
            {items.map(it => (
              <tr key={it.rank} className={it.act ? 'bg-emerald-50/60' : ''}>
                <td className="px-2 py-1.5 font-mono text-slate-500">{it.rank}</td>
                <td className="px-2 py-1.5 text-slate-800">{it.name}</td>
                <td className="px-2 py-1.5 text-right tabular-nums text-slate-700">{it.score.toFixed(2)}</td>
                <td className="px-2 py-1.5 text-right">
                  {it.act ? (
                    <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-800">show</span>
                  ) : (
                    <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500">hide</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-[11px] text-slate-500">
        The cut-off (here, top 4) is a business choice: how many recommendations does the surface support without becoming clutter?
      </p>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* 17.3 — MonitoringDashboardMock                                        */
/* ------------------------------------------------------------------ */

export function MonitoringDashboardMock() {
  return (
    <Card title="Model-in-production dashboard mock">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { kpi: 'AUC (rolling 7d)', val: '0.82', delta: '−0.02', ok: true },
          { kpi: 'Top-decile lift', val: '3.8×', delta: '−0.4×', ok: false },
          { kpi: 'KS — top feature', val: '0.07', delta: '+0.04', ok: false },
          { kpi: 'Coverage', val: '94%', delta: '−1%', ok: true },
        ].map(c => (
          <div key={c.kpi} className="rounded-md border border-slate-200 p-3">
            <div className="text-[10px] uppercase tracking-wide text-slate-500">{c.kpi}</div>
            <div className="mt-1 flex items-baseline gap-2">
              <div className="text-[20px] font-semibold tabular-nums text-slate-900">{c.val}</div>
              <div className={`text-[11px] ${c.ok ? 'text-slate-500' : 'text-rose-700'}`}>{c.delta}</div>
            </div>
            <div className="mt-1 h-1.5 w-full rounded-full bg-slate-100">
              <div className={`h-1.5 rounded-full ${c.ok ? 'bg-emerald-500/80' : 'bg-rose-500/80'}`} style={{ width: c.ok ? '78%' : '38%' }} />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3 rounded-md border border-amber-200 bg-amber-50 p-3 text-[11.5px] text-amber-900">
        <div className="font-semibold">Alert · drift on <span className="font-mono">days_since_last_purchase</span></div>
        Distribution shift detected at 14:02. Top-decile lift slipping for 3 days. Owner notified; retraining queued for next sprint.
      </div>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* 17.3 — DriftSchematic                                                 */
/* ------------------------------------------------------------------ */

export function DriftSchematic() {
  const W = 720;
  const H = 220;
  const panelW = (W - 80) / 2;
  return (
    <Card title="Data drift vs. concept drift">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Left panel: data drift shifts feature distribution. Right panel: concept drift changes the relationship between features and outcome.">
        {/* Data drift */}
        <g transform="translate(30,30)">
          <text x={panelW / 2} y={-10} textAnchor="middle" className="fill-slate-800 text-[11px] font-semibold">Data drift</text>
          <text x={panelW / 2} y={4} textAnchor="middle" className="fill-slate-500 text-[10px]">feature distribution moves</text>
          {(() => {
            const innerW = panelW;
            const innerH = 140;
            const oy = 20;
            const bell = (cx: number, scale: number, color: string, opacity: number) => {
              const pts = Array.from({ length: 30 }, (_, i) => {
                const t = i / 29;
                const x = t * innerW;
                const y = oy + innerH - Math.exp(-Math.pow((x - cx) / scale, 2)) * (innerH - 8);
                return [x, y];
              });
              return <path d={pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0]} ${p[1]}`).join(' ')} fill="none" stroke={color} strokeWidth={2} opacity={opacity} />;
            };
            return (
              <g>
                <line x1={0} y1={oy + innerH} x2={innerW} y2={oy + innerH} stroke={C.ink} strokeWidth={1} />
                {bell(innerW * 0.35, 40, C.blue, 0.85)}
                {bell(innerW * 0.65, 40, C.red, 0.85)}
                <text x={innerW * 0.35} y={oy + innerH + 14} textAnchor="middle" className="fill-blue-800 text-[10px]">training</text>
                <text x={innerW * 0.65} y={oy + innerH + 14} textAnchor="middle" className="fill-rose-800 text-[10px]">live traffic</text>
              </g>
            );
          })()}
        </g>
        {/* Concept drift */}
        <g transform={`translate(${30 + panelW + 20},30)`}>
          <text x={panelW / 2} y={-10} textAnchor="middle" className="fill-slate-800 text-[11px] font-semibold">Concept drift</text>
          <text x={panelW / 2} y={4} textAnchor="middle" className="fill-slate-500 text-[10px]">X → Y relationship changes</text>
          {(() => {
            const innerW = panelW;
            const innerH = 140;
            const oy = 20;
            return (
              <g>
                <line x1={0} y1={oy + innerH} x2={innerW} y2={oy + innerH} stroke={C.ink} strokeWidth={1} />
                <line x1={0} y1={oy} x2={0} y2={oy + innerH} stroke={C.ink} strokeWidth={1} />
                {/* original line */}
                <line x1={10} y1={oy + innerH - 10} x2={innerW - 10} y2={oy + 20} stroke={C.blue} strokeWidth={2.4} />
                {/* drifted line */}
                <line x1={10} y1={oy + innerH - 40} x2={innerW - 10} y2={oy + 70} stroke={C.red} strokeWidth={2.4} strokeDasharray="4 3" />
                <text x={innerW - 24} y={oy + 30} textAnchor="end" className="fill-blue-800 text-[10px]">trained pattern</text>
                <text x={innerW - 24} y={oy + 80} textAnchor="end" className="fill-rose-800 text-[10px]">today’s pattern</text>
                <text x={innerW / 2} y={oy + innerH + 14} textAnchor="middle" className="fill-slate-500 text-[10px]">feature →</text>
              </g>
            );
          })()}
        </g>
      </svg>
      <p className="mt-2 text-[11px] text-slate-500">
        Data drift makes the input look unfamiliar. Concept drift makes the input mean something different. Both quietly degrade a model.
      </p>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* 17.4 — Capstone Summary                                               */
/* ------------------------------------------------------------------ */

export function CustomerIntelligenceFlow() {
  const W = 760;
  const H = 200;
  const cells = [
    { label: 'Score', sub: 'churn risk', color: C.blue },
    { label: 'Segment', sub: 'who they look like', color: C.purple },
    { label: 'Target', sub: 'lookalikes + custom audiences', color: C.teal },
    { label: 'Act', sub: 'offer / message / channel', color: C.amber },
    { label: 'Monitor', sub: 'drift, lift, fairness', color: C.green },
  ];
  const cellW = (W - 60) / cells.length;
  return (
    <Card title="The Part IV decision loop, end to end">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Five stages of the customer intelligence loop from scoring to monitoring.">
        {cells.map((c, i) => {
          const x = 30 + cellW * i;
          return (
            <g key={c.label}>
              <rect x={x + 10} y={50} width={cellW - 20} height={70} rx={8} fill="white" stroke={c.color} strokeWidth={1.8} />
              <text x={x + cellW / 2} y={78} textAnchor="middle" className="fill-slate-900 text-[13px] font-semibold" style={{ fill: c.color }}>{c.label}</text>
              <text x={x + cellW / 2} y={98} textAnchor="middle" className="fill-slate-500 text-[10px]">{c.sub}</text>
              {i < cells.length - 1 && (
                <line x1={x + cellW - 10} y1={85} x2={x + cellW + 10} y2={85} stroke={C.muted} strokeWidth={1.5} markerEnd="url(#cif-arrow)" />
              )}
            </g>
          );
        })}
        <defs>
          <marker id="cif-arrow" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto" markerUnits="strokeWidth">
            <path d="M0,0 L0,6 L9,3 z" fill={C.muted} />
          </marker>
          <marker id="cif-feedback" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto" markerUnits="strokeWidth">
            <path d="M0,0 L0,6 L9,3 z" fill={C.amber} />
          </marker>
        </defs>
        <path
          d={`M ${30 + cellW * (cells.length - 0.5)} 130
              C ${30 + cellW * (cells.length - 0.5)} 170
                ${30 + cellW * 0.5} 170
                ${30 + cellW * 0.5} 130`}
          fill="none"
          stroke={C.amber}
          strokeWidth={1.5}
          strokeDasharray="5 4"
          markerEnd="url(#cif-feedback)"
        />
        <text x={W / 2} y={184} textAnchor="middle" className="fill-amber-700 text-[10px] italic">Monitoring shapes the next problem definition.</text>
      </svg>
    </Card>
  );
}
