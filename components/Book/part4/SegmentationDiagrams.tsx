'use client';

import * as React from 'react';

import {
  Connector,
  DiagramFrame,
  DiagramSvg,
  LEGACY_C,
  Node,
  SvgText,
  TreeBus,
  centeredRow,
} from '@/components/Book/diagram';

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

/**
 * Was twenty-one hardcoded light-mode hexes. Now the same names,
 * resolved through the theme — see components/Book/diagram/legacy.ts for
 * how the ten hues collapse onto ink, accent, pos, and neg.
 */
const C = LEGACY_C;

/**
 * Local card wrapper, now a thin pass-through to the shared frame so this
 * file's figures stop being white slabs on a dark page. `DiagramFrame` owns
 * the ground, the hairline, and the absence of a shadow.
 */
function Card({
  title,
  children,
  footer,
}: {
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <DiagramFrame eyebrow={title} note={footer}>
      {children}
    </DiagramFrame>
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
          <div key={s.name} className="rounded-md border border-border p-2.5">
            <div className="mb-1 flex items-center gap-2">
              <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: s.color }} />
              <span className="text-[12px] font-semibold text-body">{s.name}</span>
            </div>
            <ul className="space-y-1">
              {features.map((f, i) => (
                <li key={f} className="grid grid-cols-[72px_minmax(0,1fr)] items-center gap-1.5 text-[10.5px]">
                  <span className="text-muted">{f}</span>
                  <span className="block h-2 rounded bg-code-bg">
                    <span className="block h-2 rounded" style={{ width: `${s.scores[i] * 100}%`, background: s.color, opacity: 0.85 }} />
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <p className="mt-3 text-[11px] text-muted">
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
          <text x={colW / 2} y={0} textAnchor="middle" className="fill-body text-[11px] font-semibold">Scree</text>
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
                <text x={ox + 6 + 2 * (barW + 2)} y={oy - 4} textAnchor="middle" className="fill-accent-ink text-[10px] font-semibold">elbow</text>
                <text x={ox + innerW / 2} y={oy + innerH + 18} textAnchor="middle" className="fill-subtle text-[10px]">Component →</text>
                <text x={ox - 28} y={oy + innerH / 2} transform={`rotate(-90 ${ox - 28} ${oy + innerH / 2})`} textAnchor="middle" className="fill-subtle text-[10px]">Variance explained</text>
              </g>
            );
          })()}
        </g>
        {/* biplot */}
        <g transform={`translate(${left + colW + 30},20)`}>
          <text x={colW / 2} y={0} textAnchor="middle" className="fill-body text-[11px] font-semibold">Biplot</text>
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
                    <text x={xS(l.x) + (l.x >= 0 ? 4 : -4)} y={yS(l.y) - 4} textAnchor={l.x >= 0 ? 'start' : 'end'} className="fill-subtle text-[9px] italic">{l.name}</text>
                  </g>
                ))}
                {brands.map(b => (
                  <g key={b.name}>
                    <circle cx={xS(b.x)} cy={yS(b.y)} r={5} fill={b.color} />
                    <text x={xS(b.x) + 6} y={yS(b.y) + 3} className="fill-subtle text-[9px]">{b.name}</text>
                  </g>
                ))}
                <text x={cx + innerW / 2 - 6} y={cy - 6} textAnchor="end" className="fill-muted text-[9px]">PC1: value → premium</text>
                <text x={cx + 4} y={oy + 12} className="fill-muted text-[9px]">PC2: convenience → experience</text>
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
        <text x={m.left + 8} y={m.top + 16} className="fill-muted text-[10px] italic">familiar &amp; cheap</text>
        <text x={W - m.right - 8} y={m.top + 16} textAnchor="end" className="fill-muted text-[10px] italic">fresh &amp; premium</text>
        <text x={m.left + 8} y={H - m.bottom - 8} className="fill-muted text-[10px] italic">commodity</text>
        <text x={W - m.right - 8} y={H - m.bottom - 8} textAnchor="end" className="fill-muted text-[10px] italic">aspirational casual</text>
        {/* brands */}
        {brands.map(b => (
          <g key={b.name}>
            <circle cx={xS(b.x)} cy={yS(b.y)} r={5} fill={b.color} />
            <text x={xS(b.x) + 8} y={yS(b.y) + 3} className="fill-body text-[10px] font-medium">{b.name}</text>
          </g>
        ))}
        {/* axes */}
        <text x={cx + innerW / 2 - 4} y={cy - 6} textAnchor="end" className="fill-subtle text-[10px]">Factor 1: value → premium →</text>
        <text x={cx + 6} y={m.top + 12} className="fill-subtle text-[10px]">Factor 2: familiar → fresh ↑</text>
      </svg>
      <p className="mt-2 text-[11px] text-muted">
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
        <text x={ox + innerW / 2} y={20} textAnchor="middle" className="fill-body text-[11px] font-semibold">{title}</text>
        <text x={ox + innerW / 2} y={32} textAnchor="middle" className="fill-muted text-[10px]">{sub}</text>
        <rect x={ox} y={oy} width={innerW} height={innerH} fill={C.slate50} stroke={C.grid} />
        {showAxes && (
          <>
            <line x1={ox} y1={cy} x2={ox + innerW} y2={cy} stroke={C.muted} strokeWidth={1} strokeDasharray="2 3" />
            <line x1={cx} y1={oy} x2={cx} y2={oy + innerH} stroke={C.muted} strokeWidth={1} strokeDasharray="2 3" />
            <text x={ox + innerW - 6} y={cy - 4} textAnchor="end" className="fill-muted text-[9px]">PC1</text>
            <text x={cx + 4} y={oy + 12} className="fill-muted text-[9px]">PC2</text>
          </>
        )}
        {!showAxes && (
          <text x={ox + innerW - 6} y={oy + innerH - 6} textAnchor="end" className="fill-muted text-[9px] italic">axes have no business meaning</text>
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
      <p className="mt-2 text-[11px] text-muted">
        Don’t read distances or angles in a t-SNE/UMAP map literally. They are good for spotting groups, poor for explaining them.
      </p>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* 17.1 — TargetingTaxonomy                                              */
/* ------------------------------------------------------------------ */

const TARGETING_FAMILIES = [
  { name: 'Location', items: 'country · city · radius · resident vs. visitor' },
  { name: 'Demographic', items: 'age · gender · education · job title · life event' },
  { name: 'Interest', items: 'hobbies · entertainment · shopping · sport' },
  { name: 'Behavioural', items: 'past purchase · device · travel · site visit' },
  { name: 'Custom audience', items: 'site visitors · email list · app users · CRM upload' },
  { name: 'Lookalike', items: 'seed audience · similarity threshold · reach', focal: true },
];

/**
 * A tree, because the six families are not peers on a shelf — they are the ways
 * one audience gets narrowed, and layering them is the strategy the section is
 * teaching. Six coloured dots said "six categories"; a root that fans into six
 * says "six cuts of the same thing".
 *
 * Lookalike is focal: it is the only family that is *derived* from the others
 * rather than declared, which is why it behaves differently when you layer it.
 */
export function TargetingTaxonomy() {
  const W = 792;
  const rowH = 48;
  const pitch = 60;
  const top = 24;
  const famX = 264;
  const famW = 512;
  const H = top + pitch * (TARGETING_FAMILIES.length - 1) + rowH + 24;
  const centreY = top + (pitch * (TARGETING_FAMILIES.length - 1) + rowH) / 2;

  return (
    <DiagramFrame
      eyebrow="Ad-platform targeting"
      note="Layering families is the standard strategy. Layer too many and the audience disappears; too few and the audience is everyone. The only family you cannot describe in words up front is the lookalike — it is defined by a seed, not by a rule."
    >
      <DiagramSvg
        width={W}
        height={H}
        title="Six families of ad targeting"
        desc="One audience is narrowed by six families of criteria: location, demographics, interests, behaviour, custom audiences uploaded by the advertiser, and lookalike audiences derived from a seed."
      >
        <TreeBus
          orientation="horizontal"
          parentX={192}
          parentY={centreY}
          childXs={TARGETING_FAMILIES.map((_, i) => top + i * pitch + rowH / 2)}
          childY={famX}
        />
        <Node
          x={16}
          y={centreY - 32}
          width={176}
          height={64}
          variant="input"
          label="Everyone on the platform"
        />
        {TARGETING_FAMILIES.map((f, i) => (
          <Node
            key={f.name}
            x={famX}
            y={top + i * pitch}
            width={famW}
            height={rowH}
            align="start"
            variant={f.focal ? 'focal' : 'step'}
            label={f.name}
            sublabel={f.items}
          />
        ))}
      </DiagramSvg>
    </DiagramFrame>
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
          <text key={s} x={xS(s)} y={H - m.bottom + 14} textAnchor="middle" className="fill-muted text-[10px]">{s}%</text>
        ))}
        {[50, 60, 70, 80, 90].map(v => (
          <text key={v} x={m.left - 6} y={ySim(v) + 3} textAnchor="end" className="fill-muted text-[10px]">{v}%</text>
        ))}
        <text x={(m.left + W - m.right) / 2} y={H - 8} textAnchor="middle" className="fill-subtle text-[11px]">Audience size (% of population)</text>
        <text x={16} y={(m.top + H - m.bottom) / 2} transform={`rotate(-90 16 ${(m.top + H - m.bottom) / 2})`} textAnchor="middle" className="fill-subtle text-[11px]">Similarity to seed (%)</text>
        <text x={xS(2.5)} y={ySim(92)} className="fill-pos text-[10px] italic">precise but small</text>
        <text x={xS(8.5)} y={ySim(60)} className="fill-neg text-[10px] italic">broad but diluted</text>
      </svg>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* 17.1 — RetargetingFunnel                                              */
/* ------------------------------------------------------------------ */

const FUNNEL_STAGES = [
  { label: 'Impressions', value: 100 },
  { label: 'Clicks', value: 18, drop: 'the creative did not land' },
  { label: 'Site visits', value: 12, drop: 'the landing page did not match' },
  { label: 'Add-to-cart', value: 4, drop: 'price or shipping', focal: true },
  { label: 'Purchases', value: 1.4, drop: 'checkout friction' },
];

/**
 * A funnel with the *drops* named, which is the only part a manager can act on.
 * The bars alone say conversion falls; naming what falls out between each pair
 * says where to spend.
 *
 * Five bars in five hues implied the stages were categories. They are one
 * quantity shrinking, so they are one colour — except the leak where
 * retargeting actually pays.
 */
export function RetargetingFunnel() {
  const W = 792;
  const rowH = 44;
  const pitch = 56;
  const top = 24;
  const barX = 176;
  const barMax = 344;
  const H = top + pitch * (FUNNEL_STAGES.length - 1) + rowH + 24;
  const max = FUNNEL_STAGES[0].value;

  return (
    <DiagramFrame
      eyebrow="A simplified ad funnel"
      note="Retargeting re-engages the people who reached a stage and stopped. Which stage you retarget from is the decision — and the biggest absolute drop is not always the one worth buying back."
    >
      <DiagramSvg
        width={W}
        height={H}
        title="An advertising funnel and its leaks"
        desc="Of 100 impressions, 18 become clicks, 12 become site visits, 4 become add-to-cart, and 1.4 become purchases. Each step is labelled with what is lost there, since that is the part a budget can act on."
      >
        {FUNNEL_STAGES.map((stage, i) => {
          const y = top + i * pitch;
          const w = (stage.value / max) * barMax;
          return (
            <g key={stage.label}>
              <SvgText
                x={barX - 16}
                y={y + rowH / 2 + 4}
                width={barX - 32}
                anchorY="middle"
                variant="nodeSm"
                tone={stage.focal ? 'accent' : 'ink'}
                textAnchor="end"
              >
                {stage.label}
              </SvgText>
              <rect
                x={barX}
                y={y + 6}
                width={w}
                height={rowH - 12}
                rx={3}
                fill={stage.focal ? C.orangeLight : C.slate100}
                stroke={stage.focal ? C.orange : C.muted}
                strokeWidth={stage.focal ? 1.2 : 0.8}
              />
              <SvgText
                x={barX + w + 10}
                y={y + rowH / 2 + 4}
                variant="sub"
                tone={stage.focal ? 'accent' : 'muted'}
                textAnchor="start"
              >
                {stage.value + '%'}
              </SvgText>
              {stage.drop && (
                <SvgText
                  x={W - 16}
                  y={y + rowH / 2 + 4}
                  width={224}
                  anchorY="middle"
                  variant="sub"
                  tone="muted"
                  textAnchor="end"
                >
                  {'lost here: ' + stage.drop}
                </SvgText>
              )}
            </g>
          );
        })}
      </DiagramSvg>
    </DiagramFrame>
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
            <text x={n.x} y={n.y + 4} textAnchor="middle" className="fill-body text-[11px] font-semibold">{n.label}</text>
          </g>
        ))}
      </svg>
      <p className="mt-1 text-center text-[11px] text-muted">
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
      <div className="overflow-hidden rounded-md border border-border">
        <table className="w-full text-[12px]">
          <thead>
            <tr className="bg-code-bg text-[10px] uppercase tracking-wide text-muted">
              <th className="w-12 px-2 py-1.5 text-left">#</th>
              <th className="px-2 py-1.5 text-left">Add-on</th>
              <th className="w-24 px-2 py-1.5 text-right">Score</th>
              <th className="w-24 px-2 py-1.5 text-right">Show?</th>
            </tr>
          </thead>
          <tbody>
            {items.map(it => (
              <tr key={it.rank} className={it.act ? 'bg-pos/10' : ''}>
                <td className="px-2 py-1.5 font-mono text-muted">{it.rank}</td>
                <td className="px-2 py-1.5 text-body">{it.name}</td>
                <td className="px-2 py-1.5 text-right tabular-nums text-subtle">{it.score.toFixed(2)}</td>
                <td className="px-2 py-1.5 text-right">
                  {it.act ? (
                    <span className="rounded bg-pos/10 px-1.5 py-0.5 text-[10px] font-semibold text-pos">show</span>
                  ) : (
                    <span className="rounded bg-code-bg px-1.5 py-0.5 text-[10px] font-semibold text-muted">hide</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-[11px] text-muted">
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
          { kpi: 'KS — top feature', val: '0.07', delta:' +0.04', ok: false },
          { kpi: 'Coverage', val: '94%', delta: '−1%', ok: true },
        ].map(c => (
          <div key={c.kpi} className="rounded-md border border-border p-3">
            <div className="text-[10px] uppercase tracking-wide text-muted">{c.kpi}</div>
            <div className="mt-1 flex items-baseline gap-2">
              <div className="text-[20px] font-semibold tabular-nums text-body">{c.val}</div>
              <div className={`text-[11px] ${c.ok ? 'text-muted' : 'text-neg'}`}>{c.delta}</div>
            </div>
            <div className="mt-1 h-1.5 w-full rounded-full bg-code-bg">
              <div className={`h-1.5 rounded-full ${c.ok ? 'bg-pos/10' : 'bg-neg/10'}`} style={{ width: c.ok ? '78%' : '38%' }} />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3 rounded-md border border-accent/40 bg-accent/10 p-3 text-[11.5px] text-accent-ink">
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
          <text x={panelW / 2} y={-10} textAnchor="middle" className="fill-body text-[11px] font-semibold">Data drift</text>
          <text x={panelW / 2} y={4} textAnchor="middle" className="fill-muted text-[10px]">feature distribution moves</text>
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
                <text x={innerW * 0.35} y={oy + innerH + 14} textAnchor="middle" className="fill-subtle text-[10px]">training</text>
                <text x={innerW * 0.65} y={oy + innerH + 14} textAnchor="middle" className="fill-neg text-[10px]">live traffic</text>
              </g>
            );
          })()}
        </g>
        {/* Concept drift */}
        <g transform={`translate(${30 + panelW + 20},30)`}>
          <text x={panelW / 2} y={-10} textAnchor="middle" className="fill-body text-[11px] font-semibold">Concept drift</text>
          <text x={panelW / 2} y={4} textAnchor="middle" className="fill-muted text-[10px]">X → Y relationship changes</text>
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
                <text x={innerW - 24} y={oy + 30} textAnchor="end" className="fill-subtle text-[10px]">trained pattern</text>
                <text x={innerW - 24} y={oy + 80} textAnchor="end" className="fill-neg text-[10px]">today’s pattern</text>
                <text x={innerW / 2} y={oy + innerH + 14} textAnchor="middle" className="fill-muted text-[10px]">feature →</text>
              </g>
            );
          })()}
        </g>
      </svg>
      <p className="mt-2 text-[11px] text-muted">
        Data drift makes the input look unfamiliar. Concept drift makes the input mean something different. Both quietly degrade a model.
      </p>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* 17.4 — Capstone Summary                                               */
/* ------------------------------------------------------------------ */

const CI_STAGES = [
  { label: 'Score', sub: 'churn risk' },
  { label: 'Segment', sub: 'who they look like' },
  { label: 'Target', sub: 'lookalikes, custom audiences' },
  { label: 'Act', sub: 'offer, message, channel' },
  { label: 'Monitor', sub: 'drift, lift, fairness', focal: true },
];

export function CustomerIntelligenceFlow() {
  const W = 792;
  const H = 208;
  const boxW = 136;
  const boxH = 76;
  const y = 28;
  const xs = centeredRow(0, W, CI_STAGES.length, boxW, 24);

  return (
    <DiagramFrame
      eyebrow="The Part IV decision loop, end to end"
      note="Monitoring is not the last stage; it is the stage that rewrites the score. A loop whose last step reports to a dashboard nobody reads is a pipeline with a decoration on the end."
    >
      <DiagramSvg
        width={W}
        height={H}
        title="The customer intelligence loop"
        desc="Customers are scored for churn risk, segmented, targeted with lookalike and custom audiences, acted on with an offer through a channel, and monitored for drift, lift, and fairness — and what monitoring finds feeds the next scoring run."
      >
        {CI_STAGES.slice(0, -1).map((c, i) => (
          <Connector
            key={c.label}
            from={[xs[i] + boxW, y + boxH / 2]}
            to={[xs[i + 1], y + boxH / 2]}
            route="straight"
          />
        ))}
        <Connector
          from={[xs[4] + boxW / 2, y + boxH]}
          to={[xs[0] + boxW / 2, y + boxH]}
          route="vhv"
          mid={y + boxH + 44}
          tone="accent"
          dashed
          label="RESCORE"
        />
        {CI_STAGES.map((c, i) => (
          <Node
            key={c.label}
            x={xs[i]}
            y={y}
            width={boxW}
            height={boxH}
            variant={c.focal ? 'focal' : 'step'}
            label={c.label}
            sublabel={c.sub}
          />
        ))}
      </DiagramSvg>
    </DiagramFrame>
  );
}
