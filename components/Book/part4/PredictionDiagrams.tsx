'use client';

import * as React from 'react';

import { DiagramFrame, LEGACY_C } from '@/components/Book/diagram';

/**
 * Conceptual diagrams for Part IV Chapters 14–15.
 *
 * Static, illustrative SVGs that explain a single idea:
 *   - the algorithmic decision lifecycle,
 *   - the supervised setup,
 *   - train/test/leakage,
 *   - features as business knowledge,
 *   - probability scores and thresholds,
 *   - the threshold–profit curve,
 *   - calibration and lift,
 *   - actual-vs-predicted residual views,
 *   - a single decision-tree path and the ensemble committee,
 *   - feature importance with partial dependence,
 *   - a one-page model card.
 *
 * Style conventions mirror part3/ConceptDiagrams.tsx: inline <svg> with
 * viewBox, h-auto w-full, slate cards, no SVG font overrides.
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
/* 14.1 — AlgorithmicLifecycle                                          */
/* ------------------------------------------------------------------ */

/**
 * Seven-stage loop from business question to monitoring and back.
 * Sourced from the predictive-modeling lifecycle in
 * `case/part4/Topic3_SupervisedML_Predictive.Rmd`.
 */
export function AlgorithmicLifecycle() {
  const W = 760;
  const H = 240;
  const stages = [
    { label: 'Business\nUnderstanding', color: C.blue, group: 'Prep' },
    { label: 'Data\n& Cleaning', color: C.blue, group: 'Prep' },
    { label: 'Feature\nEngineering', color: C.blue, group: 'Prep' },
    { label: 'Train/Test\nSplit', color: C.purple, group: 'Model' },
    { label: 'Model\nTraining', color: C.purple, group: 'Model' },
    { label: 'Evaluation', color: C.green, group: 'Decide' },
    { label: 'Deploy &\nMonitor', color: C.green, group: 'Decide' },
  ];
  const cellW = (W - 60) / stages.length;
  const yMid = 120;
  return (
    <Card title="The predictive-modeling lifecycle">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Seven stages from business question to monitoring; a dashed feedback arrow returns to the first stage.">
        {/* group bands */}
        <rect x={30} y={50} width={cellW * 3} height={100} rx={8} fill={C.blueLight} opacity={0.35} />
        <rect x={30 + cellW * 3} y={50} width={cellW * 2} height={100} rx={8} fill={C.purpleLight} opacity={0.35} />
        <rect x={30 + cellW * 5} y={50} width={cellW * 2} height={100} rx={8} fill={C.greenLight} opacity={0.35} />
        <text x={30 + cellW * 1.5} y={42} textAnchor="middle" className="fill-subtle text-[10px] font-semibold uppercase tracking-wide">Preparation</text>
        <text x={30 + cellW * 4} y={42} textAnchor="middle" className="fill-subtle text-[10px] font-semibold uppercase tracking-wide">Modeling</text>
        <text x={30 + cellW * 6} y={42} textAnchor="middle" className="fill-pos text-[10px] font-semibold uppercase tracking-wide">Evaluation &amp; Operation</text>

        {stages.map((s, i) => {
          const x = 30 + cellW * (i + 0.5);
          const lines = s.label.split('\n');
          return (
            <g key={s.label}>
              <circle cx={x} cy={yMid} r={22} fill="white" stroke={s.color} strokeWidth={2} />
              <text x={x} y={yMid + 5} textAnchor="middle" className="fill-body text-[12px] font-semibold">{i + 1}</text>
              {lines.map((ln, li) => (
                <text key={li} x={x} y={yMid + 42 + li * 12} textAnchor="middle" className="fill-subtle text-[10px]">{ln}</text>
              ))}
              {i < stages.length - 1 && (
                <line x1={x + 22} y1={yMid} x2={x + cellW - 22} y2={yMid} stroke={C.muted} strokeWidth={1.5} markerEnd="url(#al-arrow)" />
              )}
            </g>
          );
        })}
        <defs>
          <marker id="al-arrow" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto" markerUnits="strokeWidth">
            <path d="M0,0 L0,6 L9,3 z" fill={C.muted} />
          </marker>
          <marker id="al-feedback" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto" markerUnits="strokeWidth">
            <path d="M0,0 L0,6 L9,3 z" fill={C.amber} />
          </marker>
        </defs>
        {/* feedback loop */}
        <path
          d={`M ${30 + cellW * (stages.length - 0.5)} ${yMid + 24}
              C ${30 + cellW * (stages.length - 0.5)} ${yMid + 70}
                ${30 + cellW * 0.5} ${yMid + 70}
                ${30 + cellW * 0.5} ${yMid + 24}`}
          fill="none"
          stroke={C.amber}
          strokeWidth={1.5}
          strokeDasharray="5 4"
          markerEnd="url(#al-feedback)"
        />
        <text x={W / 2} y={yMid + 88} textAnchor="middle" className="fill-accent-ink text-[10px] italic">Iterate — what we learn in production reshapes the next problem definition.</text>
      </svg>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* 14.2 — SupervisedTaskTaxonomy                                        */
/* ------------------------------------------------------------------ */

/**
 * Two-column grid: classification vs regression business examples.
 */
export function SupervisedTaskTaxonomy() {
  const rows = [
    { task: 'Churn', target: 'churned = yes/no', kind: 'class' },
    { task: 'Loan default', target: 'default = yes/no', kind: 'class' },
    { task: 'Lead conversion', target: 'converted = yes/no', kind: 'class' },
    { task: 'Listing price', target: 'price in $', kind: 'reg' },
    { task: 'Demand next month', target: 'units sold', kind: 'reg' },
    { task: 'Customer LTV', target: 'expected revenue', kind: 'reg' },
  ];
  return (
    <Card title="Same setup, two flavors of target">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {(['class', 'reg'] as const).map(kind => {
          const label = kind === 'class' ? 'Classification' : 'Regression';
          const sub = kind === 'class' ? 'discrete labels' : 'continuous numbers';
          const color = kind === 'class' ? C.blue : C.teal;
          const bg = kind === 'class' ? C.blueLight : C.tealLight;
          return (
            <div key={kind} className="rounded-md border border-border p-3">
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-semibold" style={{ color }}>{label}</span>
                <span className="text-[10px] uppercase tracking-wide text-muted">{sub}</span>
              </div>
              <ul className="mt-2 space-y-1.5">
                {rows.filter(r => r.kind === kind).map(r => (
                  <li key={r.task} className="flex items-center justify-between text-[12px]">
                    <span className="text-body">{r.task}</span>
                    <span className="rounded px-1.5 py-0.5 text-[10px] font-mono text-subtle" style={{ background: bg }}>{r.target}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
      <p className="mt-3 text-center text-[11px] text-muted">
        Choosing classification vs regression is a choice about <em>what action the answer must support</em>, not a property of the data.
      </p>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* 14.3a — TrainTestSplitDiagram                                        */
/* ------------------------------------------------------------------ */

export function TrainTestSplitDiagram() {
  const W = 720;
  const H = 200;
  return (
    <Card title="The test set is a rehearsal for the future">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Historical data is split into training and test; the model fits on training and is scored against held-out outcomes.">
        <rect x={30} y={30} width={200} height={50} rx={6} fill={C.amberLight} stroke={C.amber} strokeWidth={1.5} />
        <text x={130} y={52} textAnchor="middle" className="fill-body text-[12px] font-semibold">Historical labelled data</text>
        <text x={130} y={68} textAnchor="middle" className="fill-subtle text-[10px]">past customers, known outcomes</text>

        <line x1={230} y1={55} x2={270} y2={55} stroke={C.muted} strokeWidth={1.5} markerEnd="url(#tt-arrow)" />

        <rect x={280} y={20} width={170} height={30} rx={4} fill={C.blueLight} stroke={C.blue} strokeWidth={1.5} />
        <text x={365} y={40} textAnchor="middle" className="fill-subtle text-[12px] font-semibold">Training (≈70%)</text>

        <rect x={280} y={60} width={170} height={30} rx={4} fill={C.greenLight} stroke={C.green} strokeWidth={1.5} />
        <text x={365} y={80} textAnchor="middle" className="fill-pos text-[12px] font-semibold">Test (≈30%)</text>

        <line x1={450} y1={35} x2={520} y2={35} stroke={C.muted} strokeWidth={1.5} markerEnd="url(#tt-arrow)" />
        <line x1={450} y1={75} x2={520} y2={75} stroke={C.muted} strokeWidth={1.5} markerEnd="url(#tt-arrow)" />

        <rect x={520} y={20} width={170} height={30} rx={4} fill={C.purpleLight} stroke={C.purple} strokeWidth={1.5} />
        <text x={605} y={40} textAnchor="middle" className="fill-subtle text-[12px] font-semibold">Fit model</text>

        <rect x={520} y={60} width={170} height={30} rx={4} fill={C.purpleLight} stroke={C.purple} strokeWidth={1.5} />
        <text x={605} y={80} textAnchor="middle" className="fill-subtle text-[12px] font-semibold">Predict &amp; score</text>

        <line x1={605} y1={50} x2={605} y2={60} stroke={C.muted} strokeWidth={1.5} />

        <rect x={280} y={120} width={410} height={50} rx={6} fill={C.slate50} stroke={C.grid} strokeWidth={1} />
        <text x={485} y={142} textAnchor="middle" className="fill-body text-[12px] font-semibold">Compare predictions to known test outcomes</text>
        <text x={485} y={158} textAnchor="middle" className="fill-subtle text-[10px]">If performance collapses outside training, the model overfit.</text>

        <line x1={365} y1={90} x2={365} y2={120} stroke={C.muted} strokeWidth={1.5} markerEnd="url(#tt-arrow)" />
        <line x1={605} y1={90} x2={605} y2={120} stroke={C.muted} strokeWidth={1.5} markerEnd="url(#tt-arrow)" />

        <defs>
          <marker id="tt-arrow" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto" markerUnits="strokeWidth">
            <path d="M0,0 L0,6 L9,3 z" fill={C.muted} />
          </marker>
        </defs>
      </svg>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* 14.3b — LeakageMap                                                   */
/* ------------------------------------------------------------------ */

export function LeakageMap() {
  const rows = [
    { feature: 'cancellation_date', verdict: 'leak', why: 'only known after churn' },
    { feature: 'days_since_last_purchase', verdict: 'safe', why: 'computed at decision time' },
    { feature: 'support_tickets_last_30d', verdict: 'safe', why: 'past window only' },
    { feature: 'refund_amount_total', verdict: 'maybe', why: 'safe only if cut off before label window' },
    { feature: 'final_account_balance', verdict: 'leak', why: '"final" implies end of relationship' },
    { feature: 'discount_share', verdict: 'safe', why: 'historical behaviour' },
    { feature: 'churn_reason_code', verdict: 'leak', why: 'recorded at the time of churn' },
    { feature: 'loyalty_tier', verdict: 'safe', why: 'attribute at decision time' },
  ];
  const badge = (v: string) => {
    if (v === 'leak') return { bg: C.redLight, fg: '#7f1d1d', label: 'leak' };
    if (v === 'maybe') return { bg: C.amberLight, fg: '#7c2d12', label: 'maybe' };
    return { bg: C.greenLight, fg: '#064e3b', label: 'safe' };
  };
  return (
    <Card title="Feature leakage gallery — would this be known at decision time?">
      <ul className="grid grid-cols-1 gap-1.5 md:grid-cols-2">
        {rows.map(r => {
          const b = badge(r.verdict);
          return (
            <li key={r.feature} className="flex items-start gap-2 rounded border border-border px-2 py-1.5">
              <span
                className="mt-0.5 inline-block min-w-[44px] rounded px-1.5 py-0.5 text-center text-[10px] font-semibold uppercase tracking-wide"
                style={{ background: b.bg, color: b.fg }}
              >
                {b.label}
              </span>
              <div className="text-[12px]">
                <div className="font-mono text-body">{r.feature}</div>
                <div className="text-muted">{r.why}</div>
              </div>
            </li>
          );
        })}
      </ul>
      <p className="mt-3 text-[11px] text-muted">
        A feature is leaking whenever its value at training time is not knowable when the prediction needs to be made.
      </p>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* 14.4 — FeatureCatalogDiagram (RFM)                                   */
/* ------------------------------------------------------------------ */

export function FeatureCatalogDiagram() {
  const W = 720;
  const H = 280;
  const cols = [
    {
      label: 'Recency',
      sub: 'How recently?',
      color: C.blue,
      items: ['days_since_last_visit', 'days_since_last_purchase', 'weeks_since_signup'],
    },
    {
      label: 'Frequency',
      sub: 'How often?',
      color: C.green,
      items: ['visits_last_30d', 'orders_last_90d', 'app_opens_last_7d'],
    },
    {
      label: 'Monetary',
      sub: 'How much?',
      color: C.orange,
      items: ['avg_order_value', 'lifetime_revenue', 'discount_share'],
    },
    {
      label: 'Engagement',
      sub: 'How sticky?',
      color: C.purple,
      items: ['email_open_rate', 'loyalty_tier', 'support_tickets_last_30d'],
    },
  ];
  const colW = (W - 60) / cols.length;
  return (
    <Card title="A feature catalog for a Bean &amp; Basket churn model">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Four feature families — recency, frequency, monetary, engagement — feeding a single model.">
        {cols.map((c, i) => {
          const x = 30 + colW * i;
          return (
            <g key={c.label}>
              <rect x={x + 8} y={20} width={colW - 16} height={70} rx={6} fill="white" stroke={c.color} strokeWidth={1.6} />
              <text x={x + colW / 2} y={42} textAnchor="middle" className="fill-body text-[12px] font-semibold" style={{ fill: c.color }}>{c.label}</text>
              <text x={x + colW / 2} y={58} textAnchor="middle" className="fill-muted text-[10px] italic">{c.sub}</text>
              {c.items.map((it, ii) => (
                <text key={it} x={x + colW / 2} y={108 + ii * 18} textAnchor="middle" className="fill-subtle text-[10px] font-mono">{it}</text>
              ))}
              <line x1={x + colW / 2} y1={170} x2={W / 2} y2={220} stroke={C.muted} strokeWidth={1} strokeDasharray="2 3" />
            </g>
          );
        })}
        <rect x={W / 2 - 90} y={220} width={180} height={40} rx={6} fill={C.slate100} stroke={C.ink} strokeWidth={1.4} />
        <text x={W / 2} y={244} textAnchor="middle" className="fill-body text-[12px] font-semibold">Churn probability model</text>
      </svg>
      <p className="mt-1 text-center text-[11px] text-muted">
        Better features often matter more than fancier algorithms.
      </p>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* 15.1 — ProbabilityScoreToAction                                      */
/* ------------------------------------------------------------------ */

export function ProbabilityScoreToAction() {
  const W = 720;
  const H = 220;
  const m = { left: 40, right: 28, top: 30, bottom: 40 };
  const x = (p: number) => m.left + p * (W - m.left - m.right);
  const threshold = 0.5;

  // Two overlapping bell-ish distributions
  const bins = 26;
  const xs = Array.from({ length: bins }, (_, i) => i / (bins - 1));
  const non = xs.map(p => Math.exp(-Math.pow((p - 0.22) / 0.18, 2)));
  const ch = xs.map(p => Math.exp(-Math.pow((p - 0.68) / 0.2, 2)) * 0.85);
  const maxBar = Math.max(...non, ...ch);
  const barW = (W - m.left - m.right) / bins;
  const yBase = H - m.bottom;
  const maxH = 110;
  return (
    <Card title="From probability score to action — pick a threshold, sort, intervene">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Overlapping probability distributions for churners and non-churners with a decision threshold.">
        {/* shaded "act" zone */}
        <rect x={x(threshold)} y={m.top} width={x(1) - x(threshold)} height={H - m.bottom - m.top} fill={C.amberLight} opacity={0.4} />
        {/* bars */}
        {non.map((v, i) => (
          <rect key={`n${i}`} x={m.left + i * barW} y={yBase - (v / maxBar) * maxH} width={barW - 1} height={(v / maxBar) * maxH} fill={C.blue} opacity={0.7} />
        ))}
        {ch.map((v, i) => (
          <rect key={`c${i}`} x={m.left + i * barW} y={yBase - (v / maxBar) * maxH} width={barW - 1} height={(v / maxBar) * maxH} fill={C.red} opacity={0.7} />
        ))}
        {/* threshold */}
        <line x1={x(threshold)} y1={m.top} x2={x(threshold)} y2={yBase} stroke={C.amber} strokeWidth={2} strokeDasharray="4 3" />
        <text x={x(threshold)} y={m.top - 8} textAnchor="middle" className="fill-accent-ink text-[10px] font-semibold">threshold = 0.5</text>
        {/* axes */}
        <line x1={m.left} y1={yBase} x2={W - m.right} y2={yBase} stroke={C.ink} strokeWidth={1} />
        <text x={m.left} y={yBase + 18} className="fill-muted text-[10px]">0</text>
        <text x={x(0.5)} y={yBase + 18} textAnchor="middle" className="fill-muted text-[10px]">0.5</text>
        <text x={W - m.right} y={yBase + 18} textAnchor="end" className="fill-muted text-[10px]">1.0</text>
        <text x={(m.left + W - m.right) / 2} y={H - 6} textAnchor="middle" className="fill-subtle text-[10px]">Predicted churn probability</text>
      </svg>
      <div className="mt-2 flex flex-wrap items-center justify-center gap-4 text-[11px] text-subtle">
        <span className="inline-flex items-center gap-1.5"><span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: C.blue, opacity: 0.7 }} /> stayed (label = 0)</span>
        <span className="inline-flex items-center gap-1.5"><span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: C.red, opacity: 0.7 }} /> churned (label = 1)</span>
        <span className="inline-flex items-center gap-1.5"><span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: C.amberLight }} /> action zone</span>
      </div>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* 15.2a — ThresholdProfitChart                                         */
/* ------------------------------------------------------------------ */

/**
 * Stylised threshold-vs-profit curve. Net profit per customer rises
 * as we move from naive "treat everyone" to a sensible cut-off, then
 * decays as we miss real churners.
 */
export function ThresholdProfitChart() {
  const W = 720;
  const H = 240;
  const m = { left: 60, right: 30, top: 30, bottom: 44 };
  const x = (p: number) => m.left + p * (W - m.left - m.right);
  const innerH = H - m.top - m.bottom;
  const yBase = H - m.bottom;
  // crude shape: parabola peaking near 0.45
  const pts = Array.from({ length: 41 }, (_, i) => {
    const t = i / 40;
    const profit = -1.2 * Math.pow(t - 0.42, 2) + 0.18;
    return { t, profit };
  });
  const minY = -0.06;
  const maxY = 0.22;
  const yScale = (v: number) => m.top + innerH - ((v - minY) / (maxY - minY)) * innerH;
  const path = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${x(p.t)} ${yScale(p.profit)}`).join(' ');
  const peak = pts.reduce((a, b) => (b.profit > a.profit ? b : a), pts[0]);
  return (
    <Card title="Threshold–profit curve — the manager's lever">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Net profit per customer as a function of the action threshold.">
        {/* zero line */}
        <line x1={m.left} y1={yScale(0)} x2={W - m.right} y2={yScale(0)} stroke={C.muted} strokeWidth={1} strokeDasharray="3 3" />
        {/* axes */}
        <line x1={m.left} y1={m.top} x2={m.left} y2={yBase} stroke={C.ink} strokeWidth={1} />
        <line x1={m.left} y1={yBase} x2={W - m.right} y2={yBase} stroke={C.ink} strokeWidth={1} />
        {/* curve */}
        <path d={path} fill="none" stroke={C.teal} strokeWidth={2.4} />
        {/* peak marker */}
        <circle cx={x(peak.t)} cy={yScale(peak.profit)} r={5} fill={C.green} />
        <line x1={x(peak.t)} y1={yScale(peak.profit)} x2={x(peak.t)} y2={yBase} stroke={C.green} strokeWidth={1} strokeDasharray="3 3" />
        <text x={x(peak.t)} y={yScale(peak.profit) - 10} textAnchor="middle" className="fill-pos text-[10px] font-semibold">peak ≈ {peak.t.toFixed(2)}</text>
        {/* x labels */}
        {[0, 0.25, 0.5, 0.75, 1].map(t => (
          <text key={t} x={x(t)} y={yBase + 14} textAnchor="middle" className="fill-muted text-[10px]">{t.toFixed(2)}</text>
        ))}
        <text x={(m.left + W - m.right) / 2} y={H - 8} textAnchor="middle" className="fill-subtle text-[11px]">Probability threshold for intervention</text>
        {/* y labels */}
        {[-0.05, 0, 0.05, 0.1, 0.15, 0.2].map(v => (
          <text key={v} x={m.left - 8} y={yScale(v) + 3} textAnchor="end" className="fill-muted text-[10px]">{`$${v.toFixed(2)}`}</text>
        ))}
        <text x={14} y={(m.top + yBase) / 2} transform={`rotate(-90 14 ${(m.top + yBase) / 2})`} textAnchor="middle" className="fill-subtle text-[11px]">Expected profit per customer</text>
      </svg>
      <p className="mt-2 text-center text-[11px] text-muted">
        Treating everyone wastes offers; treating no one loses customers. The peak is the manager's threshold under current costs.
      </p>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* 15.2b — ConfusionMatrixDiagram                                       */
/* ------------------------------------------------------------------ */

export function ConfusionMatrixDiagram() {
  const cells = [
    { row: 0, col: 0, label: 'True Positive', sub: 'caught a churner', cost: 'retention spend justified', good: true },
    { row: 0, col: 1, label: 'False Positive', sub: 'wasted offer', cost: 'spend on someone who would have stayed', good: false },
    { row: 1, col: 0, label: 'False Negative', sub: 'missed churner', cost: 'lost customer revenue', good: false },
    { row: 1, col: 1, label: 'True Negative', sub: 'correctly left alone', cost: 'no unnecessary spend', good: true },
  ];
  return (
    <Card title="Confusion matrix — each cell has a business cost">
      <div className="grid grid-cols-[120px_repeat(2,minmax(0,1fr))] gap-1 text-[12px]">
        <div />
        <div className="text-center text-[10px] font-semibold uppercase tracking-wide text-muted">Actually churned</div>
        <div className="text-center text-[10px] font-semibold uppercase tracking-wide text-muted">Actually stayed</div>
        {[0, 1].map(row => (
          <React.Fragment key={row}>
            <div className="flex items-center justify-end text-[10px] font-semibold uppercase tracking-wide text-muted">
              {row === 0 ? 'Predicted churn' : 'Predicted stay'}
            </div>
            {[0, 1].map(col => {
              const c = cells.find(c => c.row === row && c.col === col)!;
              const bg = c.good ? C.greenLight : C.redLight;
              const border = c.good ? C.green : C.red;
              return (
                <div key={col} className="rounded-md border p-3" style={{ background: bg, borderColor: border }}>
                  <div className="font-semibold text-body">{c.label}</div>
                  <div className="text-subtle">{c.sub}</div>
                  <div className="mt-1 text-[11px] italic text-subtle">{c.cost}</div>
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* 15.2c — CalibrationLiftPlots                                         */
/* ------------------------------------------------------------------ */

export function CalibrationLiftPlots() {
  const W = 720;
  const H = 250;
  const panelW = (W - 60) / 2;
  return (
    <Card title="Two evaluation views that managers actually read">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Calibration plot on the left and a lift chart on the right.">
        {/* calibration */}
        <g transform="translate(30,20)">
          <text x={panelW / 2} y={0} textAnchor="middle" className="fill-body text-[11px] font-semibold">Calibration</text>
          <text x={panelW / 2} y={14} textAnchor="middle" className="fill-muted text-[10px]">Does 70% predicted = 70% observed?</text>
          {(() => {
            const innerW = panelW - 50;
            const innerH = 160;
            const ox = 40;
            const oy = 30;
            const ideal = [0, 1];
            const xS = (p: number) => ox + p * innerW;
            const yS = (p: number) => oy + (1 - p) * innerH;
            return (
              <g>
                {/* ideal diagonal */}
                <line x1={xS(0)} y1={yS(0)} x2={xS(1)} y2={yS(1)} stroke={C.muted} strokeWidth={1} strokeDasharray="3 3" />
                {/* decile points (slightly under-confident model) */}
                {Array.from({ length: 10 }, (_, i) => {
                  const pred = (i + 0.5) / 10;
                  const obs = pred * 0.9 + 0.03 + ((i % 3) - 1) * 0.015;
                  return <circle key={i} cx={xS(pred)} cy={yS(obs)} r={3.5} fill={C.blue} />;
                })}
                {/* axes */}
                <line x1={ox} y1={oy} x2={ox} y2={oy + innerH} stroke={C.ink} strokeWidth={1} />
                <line x1={ox} y1={oy + innerH} x2={ox + innerW} y2={oy + innerH} stroke={C.ink} strokeWidth={1} />
                <text x={ox - 6} y={oy + 4} textAnchor="end" className="fill-muted text-[10px]">1.0</text>
                <text x={ox - 6} y={oy + innerH + 3} textAnchor="end" className="fill-muted text-[10px]">0.0</text>
                <text x={ox + innerW / 2} y={oy + innerH + 18} textAnchor="middle" className="fill-subtle text-[10px]">Predicted probability</text>
                <text x={ox - 28} y={oy + innerH / 2} transform={`rotate(-90 ${ox - 28} ${oy + innerH / 2})`} textAnchor="middle" className="fill-subtle text-[10px]">Observed rate</text>
              </g>
            );
          })()}
        </g>
        {/* lift */}
        <g transform={`translate(${30 + panelW + 20},20)`}>
          <text x={panelW / 2} y={0} textAnchor="middle" className="fill-body text-[11px] font-semibold">Lift / Gains</text>
          <text x={panelW / 2} y={14} textAnchor="middle" className="fill-muted text-[10px]">Top-10% targets capture {`>`} 40% of churners.</text>
          {(() => {
            const innerW = panelW - 50;
            const innerH = 160;
            const ox = 40;
            const oy = 30;
            const xS = (p: number) => ox + p * innerW;
            const yS = (p: number) => oy + (1 - p) * innerH;
            const baseline = [0, 1];
            const model = [
              [0, 0], [0.1, 0.42], [0.2, 0.66], [0.3, 0.82], [0.5, 0.93], [0.7, 0.98], [1, 1],
            ] as [number, number][];
            return (
              <g>
                <line x1={xS(0)} y1={yS(0)} x2={xS(1)} y2={yS(1)} stroke={C.muted} strokeWidth={1} strokeDasharray="3 3" />
                <text x={xS(0.7)} y={yS(0.65)} className="fill-muted text-[10px]">random</text>
                <path
                  d={model.map((p, i) => `${i === 0 ? 'M' : 'L'} ${xS(p[0])} ${yS(p[1])}`).join(' ')}
                  fill="none"
                  stroke={C.green}
                  strokeWidth={2.4}
                />
                <line x1={ox} y1={oy} x2={ox} y2={oy + innerH} stroke={C.ink} strokeWidth={1} />
                <line x1={ox} y1={oy + innerH} x2={ox + innerW} y2={oy + innerH} stroke={C.ink} strokeWidth={1} />
                <text x={ox + innerW / 2} y={oy + innerH + 18} textAnchor="middle" className="fill-subtle text-[10px]">% customers targeted (sorted by score)</text>
                <text x={ox - 28} y={oy + innerH / 2} transform={`rotate(-90 ${ox - 28} ${oy + innerH / 2})`} textAnchor="middle" className="fill-subtle text-[10px]">% churners captured</text>
              </g>
            );
          })()}
        </g>
      </svg>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* 15.3 — ActualVsPredicted                                             */
/* ------------------------------------------------------------------ */

export function ActualVsPredicted() {
  const W = 720;
  const H = 260;
  const m = { left: 50, right: 24, top: 28, bottom: 40 };
  const innerW = W - m.left - m.right;
  const innerH = H - m.top - m.bottom;
  const xS = (v: number) => m.left + (v / 400) * innerW;
  const yS = (v: number) => m.top + innerH - (v / 400) * innerH;
  // pseudo-random points clustered around y=x with widening errors in tails
  const rng = (() => { let s = 11; return () => (s = (s * 1103515245 + 12345) % 2 ** 31, s / 2 ** 31); })();
  const pts = Array.from({ length: 80 }, () => {
    const a = 40 + rng() * 340;
    const sigma = 14 + Math.pow(Math.abs(a - 220) / 220, 1.4) * 60;
    const p = Math.max(0, a + (rng() - 0.5) * sigma * 2);
    return { a, p };
  });
  return (
    <Card title="Actual vs predicted — where does the model fall apart?">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Scatter of actual vs predicted listing price, with reference line and a high-error tail.">
        {/* 45° line */}
        <line x1={xS(0)} y1={yS(0)} x2={xS(400)} y2={yS(400)} stroke={C.muted} strokeWidth={1} strokeDasharray="3 3" />
        {/* axes */}
        <line x1={m.left} y1={m.top} x2={m.left} y2={H - m.bottom} stroke={C.ink} strokeWidth={1} />
        <line x1={m.left} y1={H - m.bottom} x2={W - m.right} y2={H - m.bottom} stroke={C.ink} strokeWidth={1} />
        {/* points */}
        {pts.map((p, i) => {
          const err = Math.abs(p.a - p.p);
          const color = err > 60 ? C.red : err > 30 ? C.amber : C.green;
          return <circle key={i} cx={xS(p.a)} cy={yS(p.p)} r={3.2} fill={color} opacity={0.8} />;
        })}
        {/* labels */}
        {[0, 100, 200, 300, 400].map(v => (
          <g key={v}>
            <text x={xS(v)} y={H - m.bottom + 14} textAnchor="middle" className="fill-muted text-[10px]">{`$${v}`}</text>
            <text x={m.left - 8} y={yS(v) + 3} textAnchor="end" className="fill-muted text-[10px]">{`$${v}`}</text>
          </g>
        ))}
        <text x={(m.left + W - m.right) / 2} y={H - 6} textAnchor="middle" className="fill-subtle text-[11px]">Actual nightly price</text>
        <text x={14} y={(m.top + H - m.bottom) / 2} transform={`rotate(-90 14 ${(m.top + H - m.bottom) / 2})`} textAnchor="middle" className="fill-subtle text-[11px]">Predicted price</text>
        <text x={xS(380)} y={yS(80)} textAnchor="end" className="fill-neg text-[10px] italic">large errors in luxury tail</text>
      </svg>
      <div className="mt-2 flex flex-wrap items-center justify-center gap-4 text-[11px] text-subtle">
        <span className="inline-flex items-center gap-1.5"><span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: C.green }} /> close (|error| ≤ $30)</span>
        <span className="inline-flex items-center gap-1.5"><span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: C.amber }} /> moderate ($30–$60)</span>
        <span className="inline-flex items-center gap-1.5"><span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: C.red }} /> high ({`>`} $60)</span>
      </div>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* 15.4a — DecisionTreeDiagram                                          */
/* ------------------------------------------------------------------ */

export function DecisionTreeDiagram() {
  const W = 720;
  const H = 320;
  const node = (cx: number, cy: number, label: string, sub?: string, color = C.blue) => (
    <g>
      <rect x={cx - 80} y={cy - 22} width={160} height={44} rx={6} fill="white" stroke={color} strokeWidth={1.8} />
      <text x={cx} y={cy - 3} textAnchor="middle" className="fill-body text-[11px] font-semibold">{label}</text>
      {sub && <text x={cx} y={cy + 13} textAnchor="middle" className="fill-muted text-[10px]">{sub}</text>}
    </g>
  );
  const leaf = (cx: number, cy: number, label: string, color: string) => (
    <g>
      <rect x={cx - 60} y={cy - 18} width={120} height={36} rx={6} fill={color === 'green' ? C.greenLight : C.redLight} stroke={color === 'green' ? C.green : C.red} strokeWidth={1.6} />
      <text x={cx} y={cy + 4} textAnchor="middle" className="fill-body text-[11px] font-semibold">{label}</text>
    </g>
  );
  const edge = (x1: number, y1: number, x2: number, y2: number, label: string) => (
    <g>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={C.muted} strokeWidth={1.5} />
      <text x={(x1 + x2) / 2} y={(y1 + y2) / 2 - 4} textAnchor="middle" className="fill-muted text-[10px]">{label}</text>
    </g>
  );
  return (
    <Card title="A decision tree reads like a manager's playbook">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="A decision tree for lead scoring; splits on pricing-page visit, company size, and webinar attendance.">
        {/* root */}
        {node(W / 2, 40, 'Visited pricing page?', 'split feature', C.blue)}
        {edge(W / 2 - 30, 64, W / 4, 110, 'yes')}
        {edge(W / 2 + 30, 64, (3 * W) / 4, 110, 'no')}
        {/* left mid */}
        {node(W / 4, 130, 'Company size > 500?', undefined, C.purple)}
        {edge(W / 4 - 30, 154, W / 8 + 20, 200, 'yes')}
        {edge(W / 4 + 30, 154, W / 4 + 100, 200, 'no')}
        {/* leaves left */}
        {leaf(W / 8 + 20, 220, 'High propensity', 'green')}
        {/* right mid (no path = low propensity directly) */}
        {node((3 * W) / 4, 130, 'Webinar attended?', undefined, C.purple)}
        {edge((3 * W) / 4 - 30, 154, (3 * W) / 4 - 80, 200, 'yes')}
        {edge((3 * W) / 4 + 30, 154, (3 * W) / 4 + 80, 200, 'no')}
        {leaf(W / 4 + 100, 220, 'Medium', 'green')}
        {leaf((3 * W) / 4 - 80, 220, 'Medium', 'green')}
        {leaf((3 * W) / 4 + 80, 220, 'Low propensity', 'red')}
        <text x={W / 2} y={H - 14} textAnchor="middle" className="fill-muted text-[10px] italic">
          Trees are easy to read because each split is a yes/no business question. They overfit when grown too deep.
        </text>
      </svg>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* 15.4b — EnsembleCommittee                                            */
/* ------------------------------------------------------------------ */

export function EnsembleCommittee() {
  const W = 720;
  const H = 230;
  const trees = 6;
  const cellW = (W - 80) / trees;
  return (
    <Card title="An ensemble is a committee of diverse trees">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Six small trees on the left feeding an average prediction on the right.">
        {Array.from({ length: trees }).map((_, i) => {
          const x = 30 + cellW * i;
          return (
            <g key={i}>
              {/* small fake tree */}
              <line x1={x + 30} y1={50} x2={x + 30 - 18} y2={80} stroke={C.muted} strokeWidth={1.5} />
              <line x1={x + 30} y1={50} x2={x + 30 + 18} y2={80} stroke={C.muted} strokeWidth={1.5} />
              <line x1={x + 12} y1={80} x2={x + 4} y2={110} stroke={C.muted} strokeWidth={1.5} />
              <line x1={x + 12} y1={80} x2={x + 20} y2={110} stroke={C.muted} strokeWidth={1.5} />
              <line x1={x + 48} y1={80} x2={x + 40} y2={110} stroke={C.muted} strokeWidth={1.5} />
              <line x1={x + 48} y1={80} x2={x + 56} y2={110} stroke={C.muted} strokeWidth={1.5} />
              <circle cx={x + 30} cy={50} r={6} fill={C.blue} />
              <circle cx={x + 12} cy={80} r={5} fill={C.blueLight} stroke={C.blue} />
              <circle cx={x + 48} cy={80} r={5} fill={C.blueLight} stroke={C.blue} />
              {[x + 4, x + 20, x + 40, x + 56].map((cx, k) => (
                <circle key={k} cx={cx} cy={110} r={4} fill={C.green} />
              ))}
              <text x={x + 30} y={130} textAnchor="middle" className="fill-muted text-[10px]">tree {i + 1}</text>
              {/* arrow to ensemble */}
              <line x1={x + 30} y1={140} x2={W - 100} y2={H / 2} stroke={C.muted} strokeWidth={1} strokeDasharray="2 3" />
            </g>
          );
        })}
        <rect x={W - 160} y={H / 2 - 30} width={140} height={60} rx={8} fill={C.purpleLight} stroke={C.purple} strokeWidth={1.8} />
        <text x={W - 90} y={H / 2 - 6} textAnchor="middle" className="fill-subtle text-[12px] font-semibold">Ensemble average</text>
        <text x={W - 90} y={H / 2 + 12} textAnchor="middle" className="fill-subtle text-[10px]">stable, harder to read</text>
      </svg>
      <p className="mt-2 text-center text-[11px] text-muted">
        One tree may overreact to a single clue. A committee of diverse trees — random forest — averages out idiosyncrasies.
      </p>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* 15.4c — BiasVarianceSchematic                                        */
/* ------------------------------------------------------------------ */

export function BiasVarianceSchematic() {
  const W = 640;
  const H = 240;
  const m = { left: 60, right: 24, top: 28, bottom: 40 };
  const innerW = W - m.left - m.right;
  const innerH = H - m.top - m.bottom;
  const xS = (v: number) => m.left + (v / 10) * innerW;
  const yS = (v: number) => m.top + innerH - (v / 1) * innerH;
  // train error decreases monotonically; validation error U-shaped
  const train = Array.from({ length: 11 }, (_, i) => {
    const c = i / 10;
    return { x: c * 10, y: 0.7 * Math.exp(-c * 2.2) };
  });
  const valid = Array.from({ length: 11 }, (_, i) => {
    const c = i / 10;
    return { x: c * 10, y: 0.4 + 0.3 * Math.pow(c - 0.45, 2) - 0.05 * c };
  });
  const sweet = valid.reduce((a, b) => (b.y < a.y ? b : a), valid[0]);
  const path = (pts: { x: number; y: number }[]) => pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${xS(p.x)} ${yS(p.y)}`).join(' ');
  return (
    <Card title="Bias–variance trade-off — the U-curve of validation error">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Train error falls with complexity; validation error is U-shaped.">
        <line x1={m.left} y1={m.top} x2={m.left} y2={H - m.bottom} stroke={C.ink} strokeWidth={1} />
        <line x1={m.left} y1={H - m.bottom} x2={W - m.right} y2={H - m.bottom} stroke={C.ink} strokeWidth={1} />
        <path d={path(train)} fill="none" stroke={C.blue} strokeWidth={2.2} />
        <path d={path(valid)} fill="none" stroke={C.red} strokeWidth={2.2} />
        <circle cx={xS(sweet.x)} cy={yS(sweet.y)} r={5} fill={C.green} />
        <line x1={xS(sweet.x)} y1={yS(sweet.y)} x2={xS(sweet.x)} y2={H - m.bottom} stroke={C.green} strokeWidth={1} strokeDasharray="3 3" />
        <text x={xS(sweet.x)} y={yS(sweet.y) - 8} textAnchor="middle" className="fill-pos text-[10px] font-semibold">sweet spot</text>
        <text x={xS(1.4)} y={yS(0.16)} className="fill-subtle text-[10px]">training error</text>
        <text x={xS(7.5)} y={yS(0.55)} className="fill-neg text-[10px]">validation error</text>
        <text x={xS(0.5)} y={H - m.bottom + 14} textAnchor="middle" className="fill-muted text-[10px]">simple</text>
        <text x={xS(9.5)} y={H - m.bottom + 14} textAnchor="middle" className="fill-muted text-[10px]">complex</text>
        <text x={(m.left + W - m.right) / 2} y={H - 8} textAnchor="middle" className="fill-subtle text-[11px]">Model complexity (e.g. tree depth) →</text>
        <text x={14} y={(m.top + H - m.bottom) / 2} transform={`rotate(-90 14 ${(m.top + H - m.bottom) / 2})`} textAnchor="middle" className="fill-subtle text-[11px]">Error</text>
      </svg>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* 15.5 — FeatureImportanceBars                                         */
/* ------------------------------------------------------------------ */

export function FeatureImportanceBars() {
  const rows = [
    { name: 'days_since_last_purchase', imp: 0.31 },
    { name: 'support_tickets_last_30d', imp: 0.22 },
    { name: 'email_open_rate', imp: 0.14 },
    { name: 'discount_share', imp: 0.10 },
    { name: 'orders_last_90d', imp: 0.08 },
    { name: 'loyalty_tier', imp: 0.06 },
    { name: 'avg_order_value', imp: 0.05 },
    { name: 'channel_mix', imp: 0.04 },
  ];
  const max = Math.max(...rows.map(r => r.imp));
  return (
    <Card title="Feature importance — what the model leaned on (not what caused it)">
      <ul className="space-y-1.5">
        {rows.map(r => (
          <li key={r.name} className="grid grid-cols-[200px_minmax(0,1fr)_40px] items-center gap-2 text-[12px]">
            <span className="font-mono text-subtle">{r.name}</span>
            <span className="block h-4 rounded" style={{ width: `${(r.imp / max) * 100}%`, background: C.blue, opacity: 0.85 }} />
            <span className="text-right tabular-nums text-subtle">{(r.imp * 100).toFixed(0)}%</span>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-[11px] text-muted">
        High importance means the model used the variable to sort customers. It does not prove the variable would change churn if you intervened on it.
      </p>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* 15.5 — ModelCard                                                     */
/* ------------------------------------------------------------------ */

export function ModelCard() {
  const rows = [
    { k: 'Model name', v: 'BB-Churn-2026Q2 (gradient boosting)' },
    { k: 'Intended use', v: 'Rank weekly active customers by 60-day churn risk for retention offers.' },
    { k: 'Target', v: 'Churn within 60 days, observed on 2024–2025 cohorts.' },
    { k: 'Features', v: 'RFM, support activity, email engagement, loyalty tier (12 features).' },
    { k: 'Training data', v: '180k customers, 6 store regions, Jan 2024 – Dec 2025.' },
    { k: 'Held-out AUC', v: '0.84 (PR-AUC 0.41).' },
    { k: 'Calibration', v: 'Well calibrated up to 0.5; slightly under-confident above.' },
    { k: 'Known failure modes', v: 'New customers (<30 days tenure), B2B accounts.' },
    { k: 'Fairness review', v: 'No disparate FNR across region; not audited for income proxies.' },
    { k: 'Refresh cadence', v: 'Retrain quarterly; monitor weekly KS drift on top-3 features.' },
    { k: 'Owner', v: 'Customer Analytics, Bean & Basket Coffee.' },
  ];
  return (
    <Card title="One-page model card">
      <div className="overflow-hidden rounded-md border border-border">
        <table className="w-full text-[12px]">
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.k} className={i % 2 === 0 ? 'bg-code-bg' : 'bg-surface'}>
                <th className="w-[160px] px-3 py-1.5 text-left align-top font-semibold text-subtle">{r.k}</th>
                <td className="px-3 py-1.5 text-subtle">{r.v}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-[11px] text-muted">
        The card is the artifact, not the spreadsheet. If a peer cannot reproduce the decision context from this single page, the model is not ready to ship.
      </p>
    </Card>
  );
}
