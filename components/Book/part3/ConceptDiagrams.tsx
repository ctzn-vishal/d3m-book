'use client';

import * as React from 'react';

import { DiagramFrame, LEGACY_C } from '@/components/Book/diagram';

/**
 * Conceptual diagrams for Part III articles.
 *
 * These are not data visualizations — they are small SVG illustrations
 * that explain a single idea: random assignment balance, confounding DAGs,
 * within-unit demeaning, elasticity zones, etc.
 *
 * Style conventions:
 *  - inline <svg> with viewBox, h-auto w-full
 *  - colors drawn from the shared palette
 *  - each diagram wrapped in a slate card with a tiny caption
 *  - all text uses the page font (no SVG text-family override)
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

/**
 * RandomAssignmentBalance — two pre-treatment distributions of a covariate
 * (e.g. customer spend). Random assignment splits each distribution roughly
 * evenly into A and B, so the two arms look statistically identical at
 * baseline. The "without randomization" panel shows what self-selection
 * produces: imbalanced arms even before any treatment.
 */
export function RandomAssignmentBalance() {
  const W = 720;
  const H = 230;
  const m = { top: 28, right: 20, bottom: 28, left: 20 };
  const panelW = (W - m.left - m.right - 20) / 2;
  const left = m.left;
  const right = m.left + panelW + 20;

  // Generate two overlapping "histograms" (fake distributions) drawn as bars.
  const bins = 14;
  const xs = Array.from({ length: bins }, (_, i) => i);
  // A skewed distribution centered around bin 5
  const distA = xs.map(i => Math.exp(-Math.pow(i - 5, 2) / 6));
  // Total per bin (same for both panels — same underlying population)
  const total = distA.map(d => d * 80);

  // Left panel: randomized — each bin split roughly 50/50 with tiny noise
  const rng = (() => { let s = 7; return () => (s = (s * 1103515245 + 12345) % 2 ** 31, s / 2 ** 31); })();
  const randA = total.map(t => Math.round(t * (0.48 + rng() * 0.04)));
  const randB = total.map((t, i) => Math.round(t) - randA[i]);

  // Right panel: self-selected — high-spend bins skew toward "treated"
  const selectedA = total.map((t, i) => Math.round(t * (0.2 + (i / (bins - 1)) * 0.7)));
  const selectedB = total.map((t, i) => Math.round(t) - selectedA[i]);

  const maxH = 90;
  const maxBar = Math.max(...total);
  const drawPanel = (x0: number, top: string[], bot: string[], title: string, subtitle: string, dataA: number[], dataB: number[]) => {
    const baseY = m.top + maxH + 30;
    const binW = panelW / bins;
    return (
      <g key={title}>
        <rect x={x0} y={m.top - 6} width={panelW} height={maxH + 80} rx={4} fill={C.slate50} stroke={C.grid} />
        <text x={x0 + panelW / 2} y={m.top + 8} textAnchor="middle" className="fill-body text-[11px] font-semibold">
          {title}
        </text>
        <text x={x0 + panelW / 2} y={m.top + 22} textAnchor="middle" className="fill-muted text-[10px]">
          {subtitle}
        </text>
        {dataA.map((v, i) => {
          const total = v + dataB[i];
          const ha = (v / maxBar) * maxH;
          const hb = (dataB[i] / maxBar) * maxH;
          const xb = x0 + 8 + i * (binW - 1);
          return (
            <g key={i}>
              <rect x={xb} y={baseY - ha} width={binW - 4} height={ha} fill={C.blue} opacity={0.85} />
              <rect x={xb} y={baseY - ha - hb} width={binW - 4} height={hb} fill={C.orange} opacity={0.85} />
            </g>
          );
        })}
        <line x1={x0 + 6} y1={baseY} x2={x0 + panelW - 6} y2={baseY} stroke={C.ink} strokeWidth={1} />
        <text x={x0 + panelW / 2} y={baseY + 18} textAnchor="middle" className="fill-muted text-[10px]">
          Pre-treatment covariate (e.g. baseline spend) →
        </text>
      </g>
    );
  };

  return (
    <Card title="Random assignment makes arms comparable; self-selection does not">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Two panels showing balanced vs. imbalanced treatment arms.">
        {drawPanel(left, [], [], 'Randomized assignment', 'Each bin split ~50/50 — arms balanced at baseline.', randA, randB)}
        {drawPanel(right, [], [], 'Self-selected adoption', 'High-spend customers opt in — arms differ before any treatment.', selectedA, selectedB)}
      </svg>
      <div className="mt-2 flex items-center justify-center gap-4 text-[11px] text-subtle">
        <span className="inline-flex items-center gap-1.5"><span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: C.blue }} /> Arm A (treatment)</span>
        <span className="inline-flex items-center gap-1.5"><span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: C.orange }} /> Arm B (control)</span>
      </div>
    </Card>
  );
}

/**
 * LiftWithCI — illustrates the visual difference between a precise null,
 * an imprecise estimate, and a decisive lift. Three horizontal interval
 * plots stacked, with the zero line and a threshold line marked.
 */
export function LiftWithCI() {
  const W = 720;
  const H = 220;
  const m = { top: 28, right: 28, bottom: 36, left: 130 };
  const minX = -2;
  const maxX = 8;
  const x = (v: number) => m.left + ((v - minX) / (maxX - minX)) * (W - m.left - m.right);

  const rows = [
    { label: 'Underpowered test', est: 2.4, lo: -1.5, hi: 6.4, color: C.muted, hint: 'wide CI crosses zero — undecided' },
    { label: 'Precise null', est: 0.2, lo: -0.6, hi: 1.0, color: C.muted, hint: 'tight CI around zero — confident no effect' },
    { label: 'Decisive lift', est: 4.1, lo: 2.9, hi: 5.4, color: C.green, hint: 'CI well above zero and threshold' },
  ];

  const threshold = 1.5;
  const yFor = (i: number) => m.top + 18 + i * 56;

  return (
    <Card title="Why the interval matters more than the point">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Three interval plots: undecided, null, decisive.">
        {/* shaded "below threshold" region */}
        <rect x={x(0)} y={m.top} width={x(threshold) - x(0)} height={H - m.bottom - m.top} fill={C.amberLight} opacity={0.45} />
        {/* zero line */}
        <line x1={x(0)} y1={m.top} x2={x(0)} y2={H - m.bottom} stroke={C.ink} strokeWidth={1.4} />
        <text x={x(0)} y={H - 16} textAnchor="middle" className="fill-subtle text-[10px]">0 = no effect</text>
        {/* threshold line */}
        <line x1={x(threshold)} y1={m.top} x2={x(threshold)} y2={H - m.bottom} stroke={C.amber} strokeDasharray="4 4" strokeWidth={1.4} />
        <text x={x(threshold)} y={H - 16} textAnchor="middle" className="fill-accent-ink text-[10px]">decision threshold</text>

        {rows.map((r, i) => {
          const y = yFor(i);
          return (
            <g key={r.label}>
              <text x={m.left - 12} y={y + 4} textAnchor="end" className="fill-body text-[12px] font-medium">{r.label}</text>
              <line x1={x(r.lo)} y1={y} x2={x(r.hi)} y2={y} stroke={r.color} strokeWidth={3} />
              <circle cx={x(r.est)} cy={y} r={5} fill={r.color} />
              <text x={x(r.hi) + 8} y={y + 4} className="fill-muted text-[10px]">{r.hint}</text>
            </g>
          );
        })}
      </svg>
    </Card>
  );
}

/**
 * ConfounderDAG — a directed acyclic graph showing the classic
 * backdoor path: confounder Z drives both treatment D and outcome Y,
 * inducing a non-causal correlation between D and Y.
 */
export function ConfounderDAG() {
  const W = 560;
  const H = 220;
  const nodeR = 28;
  const nodes = {
    Z: { x: 280, y: 50, label: 'Z', sub: 'Confounder (e.g. season)' },
    D: { x: 140, y: 160, label: 'D', sub: 'Treatment (e.g. promo)' },
    Y: { x: 420, y: 160, label: 'Y', sub: 'Outcome (e.g. sales)' },
  };
  return (
    <Card title="Confounding: a backdoor path from D to Y through Z">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="A confounder Z creates a non-causal path between D and Y.">
        <defs>
          <marker id="cdg-arrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
            <path d="M0,0 L0,6 L9,3 z" fill={C.muted} />
          </marker>
          <marker id="cdg-arrow-causal" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
            <path d="M0,0 L0,6 L9,3 z" fill={C.green} />
          </marker>
        </defs>
        {/* Z -> D */}
        <line x1={nodes.Z.x - 26} y1={nodes.Z.y + 18} x2={nodes.D.x + 22} y2={nodes.D.y - 16} stroke={C.muted} strokeWidth={2} markerEnd="url(#cdg-arrow)" />
        {/* Z -> Y */}
        <line x1={nodes.Z.x + 26} y1={nodes.Z.y + 18} x2={nodes.Y.x - 22} y2={nodes.Y.y - 16} stroke={C.muted} strokeWidth={2} markerEnd="url(#cdg-arrow)" />
        {/* D -> Y (causal — what we want) */}
        <line x1={nodes.D.x + nodeR} y1={nodes.D.y} x2={nodes.Y.x - nodeR - 2} y2={nodes.Y.y} stroke={C.green} strokeWidth={2.5} markerEnd="url(#cdg-arrow-causal)" />
        <text x={(nodes.D.x + nodes.Y.x) / 2} y={nodes.D.y - 8} textAnchor="middle" className="fill-pos text-[11px] font-semibold">causal effect (what we want)</text>
        <text x={(nodes.D.x + nodes.Z.x) / 2 - 22} y={(nodes.D.y + nodes.Z.y) / 2 + 10} textAnchor="end" className="fill-muted text-[10px]">backdoor path</text>

        {(['Z','D','Y'] as const).map(k => {
          const n = nodes[k];
          const fill = k === 'D' ? C.blueLight : k === 'Y' ? C.greenLight : C.amberLight;
          const stroke = k === 'D' ? C.blue : k === 'Y' ? C.green : C.amber;
          return (
            <g key={k}>
              <circle cx={n.x} cy={n.y} r={nodeR} fill={fill} stroke={stroke} strokeWidth={2} />
              <text x={n.x} y={n.y + 6} textAnchor="middle" className="fill-body text-[16px] font-bold">{n.label}</text>
              <text x={n.x} y={n.y + nodeR + 16} textAnchor="middle" className="fill-subtle text-[10px]">{n.sub}</text>
            </g>
          );
        })}
      </svg>
      <p className="mt-1 text-center text-[11px] text-muted">
        Comparing treated and untreated units without controlling for Z mixes the causal D → Y arrow with the spurious D ← Z → Y path.
      </p>
    </Card>
  );
}

/**
 * ReverseCausalityDiagram — shows the difference between D → Y and Y → D,
 * the classic "ad spend follows sales" trap.
 */
export function ReverseCausalityDiagram() {
  const W = 560;
  const H = 170;
  const r = 26;
  const panel = (x0: number, label: string, sub: string, arrow: 'forward' | 'back', good: boolean) => {
    const D = { x: x0 + 60, y: 80 };
    const Y = { x: x0 + 220, y: 80 };
    return (
      <g key={label}>
        <rect x={x0} y={20} width={280} height={H - 30} rx={6} fill={good ? C.greenLight : C.redLight} opacity={0.25} stroke={good ? C.green : C.red} strokeWidth={1.2} />
        <text x={x0 + 140} y={38} textAnchor="middle" className="fill-body text-[11px] font-semibold">{label}</text>
        <text x={x0 + 140} y={H - 18} textAnchor="middle" className="fill-muted text-[10px]">{sub}</text>
        <circle cx={D.x} cy={D.y} r={r} fill={C.blueLight} stroke={C.blue} strokeWidth={2} />
        <text x={D.x} y={D.y + 5} textAnchor="middle" className="fill-body text-[14px] font-bold">D</text>
        <circle cx={Y.x} cy={Y.y} r={r} fill={C.greenLight} stroke={C.green} strokeWidth={2} />
        <text x={Y.x} y={Y.y + 5} textAnchor="middle" className="fill-body text-[14px] font-bold">Y</text>
        {arrow === 'forward' ? (
          <line x1={D.x + r} y1={D.y} x2={Y.x - r - 2} y2={Y.y} stroke={C.ink} strokeWidth={2.5} markerEnd="url(#rcd-arrow)" />
        ) : (
          <line x1={Y.x - r} y1={Y.y} x2={D.x + r + 2} y2={D.y} stroke={C.red} strokeWidth={2.5} markerEnd="url(#rcd-arrow-red)" />
        )}
      </g>
    );
  };

  return (
    <Card title="Forward causation vs. reverse causation">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Two panels contrasting D causes Y with Y causes D.">
        <defs>
          <marker id="rcd-arrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
            <path d="M0,0 L0,6 L9,3 z" fill={C.ink} />
          </marker>
          <marker id="rcd-arrow-red" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
            <path d="M0,0 L0,6 L9,3 z" fill={C.red} />
          </marker>
        </defs>
        {panel(10, 'What we assume: D → Y', 'Ad spend causes sales', 'forward', true)}
        {panel(290, 'What actually happens: Y → D', 'Sales drive next month’s ad budget', 'back', false)}
      </svg>
    </Card>
  );
}

/**
 * FrischWaughResidualization — illustrates regression's "hold X constant"
 * intuition as two stages: residualize Y on X, residualize D on X, then
 * regress residuals on residuals.
 */
export function FrischWaughResidualization() {
  const W = 720;
  const H = 220;
  const box = (x0: number, y0: number, w: number, h: number, title: string, sub: string, fill: string, stroke: string) => (
    <g key={title + x0}>
      <rect x={x0} y={y0} width={w} height={h} rx={6} fill={fill} stroke={stroke} strokeWidth={1.4} />
      <text x={x0 + w / 2} y={y0 + 24} textAnchor="middle" className="fill-body text-[12px] font-semibold">{title}</text>
      <text x={x0 + w / 2} y={y0 + 42} textAnchor="middle" className="fill-subtle text-[10px]">{sub}</text>
    </g>
  );

  return (
    <Card title="Regression as residualization (Frisch–Waugh)">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Two-stage residualization illustration.">
        <defs>
          <marker id="frw-arrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
            <path d="M0,0 L0,6 L9,3 z" fill={C.muted} />
          </marker>
        </defs>
        {box(20, 30, 170, 60, 'Outcome Y', 'with all variation', C.greenLight, C.green)}
        {box(20, 130, 170, 60, 'Treatment D', 'with all variation', C.blueLight, C.blue)}

        {box(260, 30, 200, 60, 'Y ⟂ X  (residual)', 'variation in Y not explained by controls', C.slate50, C.muted)}
        {box(260, 130, 200, 60, 'D ⟂ X  (residual)', 'variation in D not explained by controls', C.slate50, C.muted)}

        {box(520, 80, 180, 60, 'Coefficient on D', 'slope of Y-residual on D-residual', C.amberLight, C.amber)}

        <line x1={190} y1={60} x2={258} y2={60} stroke={C.muted} strokeWidth={1.8} markerEnd="url(#frw-arrow)" />
        <text x={224} y={52} textAnchor="middle" className="fill-muted text-[10px]">partial out X</text>
        <line x1={190} y1={160} x2={258} y2={160} stroke={C.muted} strokeWidth={1.8} markerEnd="url(#frw-arrow)" />
        <text x={224} y={152} textAnchor="middle" className="fill-muted text-[10px]">partial out X</text>

        <line x1={460} y1={60} x2={518} y2={100} stroke={C.muted} strokeWidth={1.8} markerEnd="url(#frw-arrow)" />
        <line x1={460} y1={160} x2={518} y2={120} stroke={C.muted} strokeWidth={1.8} markerEnd="url(#frw-arrow)" />
      </svg>
      <p className="mt-1 text-center text-[11px] text-muted">
        The regression coefficient on D <em>after</em> adjusting for controls X equals the simple regression of Y's residuals on D's residuals.
      </p>
    </Card>
  );
}

/**
 * WithinUnitVariation — shows that fixed effects use only the variation
 * within each unit, demeaning away level differences across units.
 */
export function WithinUnitVariation() {
  const W = 720;
  const H = 240;
  const m = { top: 30, right: 30, bottom: 36, left: 50 };
  const innerW = W - m.left - m.right;
  const innerH = H - m.top - m.bottom;
  // 3 units, each with their own intercept; the slopes (within variation) are similar
  const units = [
    { name: 'Store A', intercept: 70, color: C.blue, points: [10, 30, 25, 45, 38, 60] },
    { name: 'Store B', intercept: 130, color: C.green, points: [12, 35, 28, 42, 40, 55] },
    { name: 'Store C', intercept: 30, color: C.orange, points: [8, 28, 22, 40, 36, 52] },
  ];
  const xVals = [1, 2, 3, 4, 5, 6];
  const xScale = (v: number) => m.left + ((v - 0.5) / 6.5) * innerW;
  const yScale = (v: number) => H - m.bottom - (v / 220) * innerH;

  return (
    <Card title="Fixed effects use the variation within each unit, not across">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Three stores with different intercepts but similar within-store slopes.">
        {/* axes */}
        <line x1={m.left} y1={H - m.bottom} x2={W - m.right} y2={H - m.bottom} stroke={C.ink} />
        <line x1={m.left} y1={m.top} x2={m.left} y2={H - m.bottom} stroke={C.ink} />
        <text x={W - m.right} y={H - 14} textAnchor="end" className="fill-muted text-[10px]">time →</text>
        <text x={m.left + 6} y={m.top - 12} textAnchor="start" className="fill-muted text-[10px]">outcome</text>

        {/* unit-level lines & points */}
        {units.map(u => {
          const pathD = xVals
            .map((x, i) => `${i === 0 ? 'M' : 'L'}${xScale(x)},${yScale(u.intercept + u.points[i])}`)
            .join(' ');
          return (
            <g key={u.name}>
              <path d={pathD} stroke={u.color} strokeWidth={2.5} fill="none" opacity={0.85} />
              {xVals.map((x, i) => (
                <circle key={i} cx={xScale(x)} cy={yScale(u.intercept + u.points[i])} r={3} fill={u.color} />
              ))}
              {/* unit mean line (dashed) */}
              <line
                x1={m.left + 4}
                y1={yScale(u.intercept + u.points.reduce((a, b) => a + b, 0) / u.points.length)}
                x2={W - m.right - 4}
                y2={yScale(u.intercept + u.points.reduce((a, b) => a + b, 0) / u.points.length)}
                stroke={u.color}
                strokeDasharray="3 5"
                opacity={0.5}
              />
              <text
                x={W - m.right + 4}
                y={yScale(u.intercept + u.points[u.points.length - 1]) + 4}
                className="fill-subtle text-[11px]"
                style={{ fill: u.color }}
              >
                {u.name}
              </text>
            </g>
          );
        })}
      </svg>
      <p className="mt-1 text-center text-[11px] text-muted">
        Cross-store comparison mixes level differences (intercepts) with the lever's effect. Store fixed effects subtract each store's own mean (dashed) and identify the slope from <em>within-store</em> wiggles only.
      </p>
    </Card>
  );
}

/**
 * DiDTwoByTwo — the 2×2 grid representation of a difference-in-differences
 * comparison, with the cells, the two simple differences, and the
 * difference-of-differences highlighted.
 */
export function DiDTwoByTwo() {
  const W = 560;
  const H = 240;
  const cellW = 130;
  const cellH = 70;
  const x0 = 130;
  const y0 = 50;

  const cells = [
    { row: 0, col: 0, label: 'Control · Pre', value: 'Y₀₀', fill: C.slate50 },
    { row: 0, col: 1, label: 'Control · Post', value: 'Y₀₁', fill: C.slate50 },
    { row: 1, col: 0, label: 'Treated · Pre', value: 'Y₁₀', fill: C.blueLight },
    { row: 1, col: 1, label: 'Treated · Post', value: 'Y₁₁', fill: C.greenLight },
  ];

  return (
    <Card title="Difference-in-differences as a 2×2 comparison">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="A 2x2 grid showing the four cells of a difference-in-differences design.">
        {/* column headers */}
        <text x={x0 + cellW / 2} y={y0 - 14} textAnchor="middle" className="fill-subtle text-[11px] font-semibold">Pre</text>
        <text x={x0 + cellW + cellW / 2} y={y0 - 14} textAnchor="middle" className="fill-subtle text-[11px] font-semibold">Post</text>
        {/* row headers */}
        <text x={x0 - 14} y={y0 + cellH / 2 + 4} textAnchor="end" className="fill-subtle text-[11px] font-semibold">Control</text>
        <text x={x0 - 14} y={y0 + cellH + cellH / 2 + 4} textAnchor="end" className="fill-subtle text-[11px] font-semibold">Treated</text>

        {cells.map((c, i) => (
          <g key={i}>
            <rect x={x0 + c.col * cellW} y={y0 + c.row * cellH} width={cellW} height={cellH} fill={c.fill} stroke={C.muted} strokeWidth={1.2} />
            <text x={x0 + c.col * cellW + cellW / 2} y={y0 + c.row * cellH + cellH / 2 - 4} textAnchor="middle" className="fill-body text-[14px] font-bold">{c.value}</text>
            <text x={x0 + c.col * cellW + cellW / 2} y={y0 + c.row * cellH + cellH / 2 + 14} textAnchor="middle" className="fill-subtle text-[10px]">{c.label}</text>
          </g>
        ))}

        {/* row-wise differences (post - pre) */}
        <text x={x0 + 2 * cellW + 10} y={y0 + cellH / 2 + 4} className="fill-subtle text-[11px]">ΔControl = Y₀₁ − Y₀₀</text>
        <text x={x0 + 2 * cellW + 10} y={y0 + cellH + cellH / 2 + 4} className="fill-subtle text-[11px]">ΔTreated = Y₁₁ − Y₁₀</text>

        {/* DiD line */}
        <line x1={x0 + 2 * cellW + 8} y1={y0 + cellH / 2 + 12} x2={x0 + 2 * cellW + 8} y2={y0 + cellH + cellH / 2 - 6} stroke={C.amber} strokeWidth={2} />
        <text x={x0 + 2 * cellW + 18} y={y0 + cellH + 8} className="fill-accent-ink text-[11px] font-semibold">
          DiD = ΔTreated − ΔControl
        </text>
      </svg>
    </Card>
  );
}

/**
 * SyntheticControlBuilder — schematic of how donor units get weighted
 * to construct a synthetic counterfactual.
 */
export function SyntheticControlBuilder() {
  const W = 720;
  const H = 230;
  const donors = [
    { label: 'Donor A', w: 0.42, color: C.blue },
    { label: 'Donor B', w: 0.31, color: C.green },
    { label: 'Donor C', w: 0.18, color: C.amber },
    { label: 'Donor D', w: 0.09, color: C.purple },
    { label: 'Donor E', w: 0.00, color: C.muted },
    { label: 'Donor F', w: 0.00, color: C.muted },
  ];

  const xCol1 = 30;
  const colW = 160;
  const xCol2 = xCol1 + colW + 100;
  const xCol3 = xCol2 + colW + 90;
  const yStart = 50;

  return (
    <Card title="Synthetic control: a weighted combination of donor units">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Donor units weighted to form a synthetic counterfactual.">
        <defs>
          <marker id="scb-arrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
            <path d="M0,0 L0,6 L9,3 z" fill={C.muted} />
          </marker>
        </defs>

        {/* Column 1: donor pool */}
        <text x={xCol1 + colW / 2} y={28} textAnchor="middle" className="fill-subtle text-[11px] font-semibold">Donor pool</text>
        {donors.map((d, i) => (
          <g key={d.label}>
            <rect x={xCol1} y={yStart + i * 26} width={colW} height={22} rx={4} fill={C.slate50} stroke={d.w > 0 ? d.color : C.grid} strokeWidth={1.2} />
            <text x={xCol1 + 10} y={yStart + i * 26 + 15} className="fill-subtle text-[11px]">{d.label}</text>
            <text x={xCol1 + colW - 10} y={yStart + i * 26 + 15} textAnchor="end" className="fill-muted text-[10px]">
              {d.w > 0 ? `w = ${d.w.toFixed(2)}` : 'w = 0'}
            </text>
          </g>
        ))}

        {/* Arrows to weights bar */}
        <line x1={xCol1 + colW + 6} y1={H / 2} x2={xCol2 - 6} y2={H / 2} stroke={C.muted} strokeWidth={1.5} markerEnd="url(#scb-arrow)" />
        <text x={(xCol1 + colW + xCol2) / 2} y={H / 2 - 10} textAnchor="middle" className="fill-muted text-[10px]">
          fit pre-treatment trend
        </text>

        {/* Column 2: stacked weights bar */}
        <text x={xCol2 + colW / 2} y={28} textAnchor="middle" className="fill-subtle text-[11px] font-semibold">Weights sum to 1</text>
        {(() => {
          let acc = 0;
          const barH = 140;
          const barX = xCol2 + 30;
          const barY = 50;
          const barW = colW - 60;
          return donors.map((d, i) => {
            const h = d.w * barH;
            const y = barY + acc * barH;
            acc += d.w;
            if (d.w === 0) return null;
            return (
              <g key={d.label}>
                <rect x={barX} y={y} width={barW} height={h} fill={d.color} opacity={0.85} />
                <text x={barX + barW / 2} y={y + h / 2 + 4} textAnchor="middle" className="fill-surface text-[11px] font-semibold">
                  {(d.w * 100).toFixed(0)}%
                </text>
              </g>
            );
          });
        })()}

        {/* Arrow to synthetic */}
        <line x1={xCol2 + colW + 6} y1={H / 2} x2={xCol3 - 6} y2={H / 2} stroke={C.muted} strokeWidth={1.5} markerEnd="url(#scb-arrow)" />
        <text x={(xCol2 + colW + xCol3) / 2} y={H / 2 - 10} textAnchor="middle" className="fill-muted text-[10px]">
          weighted mix
        </text>

        {/* Column 3: synthetic */}
        <rect x={xCol3} y={70} width={colW - 30} height={100} rx={8} fill={C.orangeLight} stroke={C.orange} strokeWidth={1.6} />
        <text x={xCol3 + (colW - 30) / 2} y={110} textAnchor="middle" className="fill-accent-ink text-[12px] font-semibold">Synthetic</text>
        <text x={xCol3 + (colW - 30) / 2} y={128} textAnchor="middle" className="fill-accent-ink text-[12px] font-semibold">Counterfactual</text>
        <text x={xCol3 + (colW - 30) / 2} y={148} textAnchor="middle" className="fill-accent-ink text-[10px]">tracks treated</text>
        <text x={xCol3 + (colW - 30) / 2} y={162} textAnchor="middle" className="fill-accent-ink text-[10px]">unit pre-treatment</text>
      </svg>
    </Card>
  );
}

/**
 * ElasticityZones — a generic demand curve with three colored zones
 * (inelastic, unit-elastic, elastic) and arrows showing what happens
 * to revenue and profit as price rises through each zone.
 */
export function ElasticityZones() {
  const W = 720;
  const H = 260;
  const m = { top: 30, right: 30, bottom: 60, left: 60 };
  const innerW = W - m.left - m.right;
  const innerH = H - m.top - m.bottom;
  // Smooth curve y = A * x^-1 — constant elasticity (here visually generic)
  const xs = Array.from({ length: 100 }, (_, i) => 1 + (i / 99) * 6);
  const ys = xs.map(x => 60 / x);
  const xScale = (v: number) => m.left + ((v - 1) / 6) * innerW;
  const yScale = (v: number) => H - m.bottom - (v / 65) * innerH;
  const path = xs.map((x, i) => `${i === 0 ? 'M' : 'L'}${xScale(x)},${yScale(ys[i])}`).join(' ');

  // Zone boundaries on the price axis
  const inelasticEnd = xScale(2.4);
  const elasticStart = xScale(4.0);

  return (
    <Card title="Three pricing zones on a constant-elasticity demand curve">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="A demand curve segmented into inelastic, unit, and elastic zones.">
        {/* zone backgrounds */}
        <rect x={m.left} y={m.top} width={inelasticEnd - m.left} height={innerH} fill={C.greenLight} opacity={0.35} />
        <rect x={inelasticEnd} y={m.top} width={elasticStart - inelasticEnd} height={innerH} fill={C.amberLight} opacity={0.35} />
        <rect x={elasticStart} y={m.top} width={(W - m.right) - elasticStart} height={innerH} fill={C.redLight} opacity={0.35} />

        {/* axes */}
        <line x1={m.left} y1={H - m.bottom} x2={W - m.right} y2={H - m.bottom} stroke={C.ink} />
        <line x1={m.left} y1={m.top} x2={m.left} y2={H - m.bottom} stroke={C.ink} />
        <text x={W - m.right} y={H - 36} textAnchor="end" className="fill-muted text-[10px]">price →</text>
        <text x={m.left + 6} y={m.top - 12} className="fill-muted text-[10px]">quantity</text>

        {/* demand curve */}
        <path d={path} fill="none" stroke={C.navy} strokeWidth={2.5} />

        {/* zone labels */}
        <text x={(m.left + inelasticEnd) / 2} y={m.top + 18} textAnchor="middle" className="fill-pos text-[11px] font-semibold">Inelastic</text>
        <text x={(m.left + inelasticEnd) / 2} y={m.top + 32} textAnchor="middle" className="fill-pos text-[10px]">|ε| &lt; 1 · price ↑ → revenue ↑</text>

        <text x={(inelasticEnd + elasticStart) / 2} y={m.top + 18} textAnchor="middle" className="fill-accent-ink text-[11px] font-semibold">Unit</text>
        <text x={(inelasticEnd + elasticStart) / 2} y={m.top + 32} textAnchor="middle" className="fill-accent-ink text-[10px]">|ε| = 1 · revenue flat</text>

        <text x={(elasticStart + (W - m.right)) / 2} y={m.top + 18} textAnchor="middle" className="fill-neg text-[11px] font-semibold">Elastic</text>
        <text x={(elasticStart + (W - m.right)) / 2} y={m.top + 32} textAnchor="middle" className="fill-neg text-[10px]">|ε| &gt; 1 · price ↑ → revenue ↓</text>

        {/* zone boundary lines */}
        <line x1={inelasticEnd} y1={m.top} x2={inelasticEnd} y2={H - m.bottom} stroke={C.muted} strokeDasharray="3 4" />
        <line x1={elasticStart} y1={m.top} x2={elasticStart} y2={H - m.bottom} stroke={C.muted} strokeDasharray="3 4" />

        {/* bottom strategic-rule strip */}
        <text x={m.left} y={H - 10} className="fill-subtle text-[10px]">
          Strategy: harvest margin in the green zone · revenue-max in the amber · cut price or stop raising in red.
        </text>
      </svg>
    </Card>
  );
}

/**
 * SubstitutesComplements — a small 2×2 conceptual diagram for the sign
 * of cross-price elasticity.
 */
export function SubstitutesComplements() {
  const W = 560;
  const H = 200;
  const cellW = 240;
  const cellH = 70;
  const x0 = 50;
  const y0 = 40;

  const cells = [
    { row: 0, col: 0, fill: C.greenLight, stroke: C.green, title: 'Substitutes', sign: 'ε(A,B) > 0', sub: 'Raise B → demand for A rises' },
    { row: 0, col: 1, fill: C.blueLight, stroke: C.blue, title: 'Complements', sign: 'ε(A,B) < 0', sub: 'Raise B → demand for A falls' },
  ];
  return (
    <Card title="Cross-price elasticity tells you whether two products compete or pair">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Substitutes vs complements 2-up diagram.">
        {cells.map((c, i) => (
          <g key={i}>
            <rect x={x0 + c.col * (cellW + 10)} y={y0} width={cellW} height={cellH + 60} rx={8} fill={c.fill} stroke={c.stroke} strokeWidth={1.4} opacity={0.6} />
            <text x={x0 + c.col * (cellW + 10) + cellW / 2} y={y0 + 26} textAnchor="middle" className="fill-body text-[14px] font-semibold">{c.title}</text>
            <text x={x0 + c.col * (cellW + 10) + cellW / 2} y={y0 + 50} textAnchor="middle" className="fill-subtle text-[12px] font-mono">{c.sign}</text>
            <text x={x0 + c.col * (cellW + 10) + cellW / 2} y={y0 + 90} textAnchor="middle" className="fill-subtle text-[11px]">{c.sub}</text>
          </g>
        ))}
        <text x={W / 2} y={H - 10} textAnchor="middle" className="fill-muted text-[10px]">
          Sign of the cross-price coefficient → competitive relationship between the two products.
        </text>
      </svg>
    </Card>
  );
}

/**
 * OptimalMarkupDiagram — visualizes the Lerner / inverse-elasticity
 * markup rule: as |ε| falls, the optimal markup rises.
 */
export function OptimalMarkupDiagram() {
  const W = 720;
  const H = 240;
  const m = { top: 30, right: 30, bottom: 50, left: 60 };
  const innerW = W - m.left - m.right;
  const innerH = H - m.top - m.bottom;
  // markup% = 1 / (|ε| - 1) — defined for |ε| > 1
  const xs = Array.from({ length: 80 }, (_, i) => 1.1 + (i / 79) * 4.9);
  const ys = xs.map(x => 100 / (x - 1));
  const xScale = (v: number) => m.left + ((v - 1) / 5) * innerW;
  const yScale = (v: number) => H - m.bottom - Math.min(v, 220) / 220 * innerH;
  const path = xs.map((x, i) => `${i === 0 ? 'M' : 'L'}${xScale(x)},${yScale(ys[i])}`).join(' ');

  const markers = [
    { eps: 1.5, color: C.red, label: 'less elastic → bigger markup' },
    { eps: 2.5, color: C.amber, label: '' },
    { eps: 4.0, color: C.green, label: 'highly elastic → thin markup' },
  ];

  return (
    <Card title="The inverse-elasticity rule: optimal markup falls with |ε|">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Optimal markup curve as a function of elasticity.">
        <line x1={m.left} y1={H - m.bottom} x2={W - m.right} y2={H - m.bottom} stroke={C.ink} />
        <line x1={m.left} y1={m.top} x2={m.left} y2={H - m.bottom} stroke={C.ink} />
        <text x={W - m.right} y={H - 26} textAnchor="end" className="fill-muted text-[10px]">|ε| (own-price elasticity, absolute value) →</text>
        <text x={m.left + 6} y={m.top - 12} className="fill-muted text-[10px]">optimal markup over MC (%)</text>

        {/* x grid */}
        {[1, 2, 3, 4, 5, 6].map(v => (
          <g key={v}>
            <line x1={xScale(v)} y1={m.top} x2={xScale(v)} y2={H - m.bottom} stroke={C.grid} />
            <text x={xScale(v)} y={H - m.bottom + 14} textAnchor="middle" className="fill-muted text-[10px]">{v}</text>
          </g>
        ))}
        {/* y grid */}
        {[0, 50, 100, 150, 200].map(v => (
          <g key={v}>
            <line x1={m.left} y1={yScale(v)} x2={W - m.right} y2={yScale(v)} stroke={C.grid} />
            <text x={m.left - 6} y={yScale(v) + 3} textAnchor="end" className="fill-muted text-[10px]">{v}%</text>
          </g>
        ))}

        <path d={path} fill="none" stroke={C.navy} strokeWidth={2.5} />

        {markers.map((mk, i) => (
          <g key={i}>
            <circle cx={xScale(mk.eps)} cy={yScale(100 / (mk.eps - 1))} r={6} fill={mk.color} />
            {mk.label && (
              <text x={xScale(mk.eps) + 10} y={yScale(100 / (mk.eps - 1)) - 8} className="fill-subtle text-[10px]" style={{ fill: mk.color }}>
                {mk.label}
              </text>
            )}
          </g>
        ))}
      </svg>
    </Card>
  );
}
