'use client';

import * as React from 'react';

import { DiagramFrame, LEGACY_C } from '@/components/Book/diagram';

/**
 * Conceptual diagrams for Part V Chapters 18 and 19.1–19.2.
 *
 * Static, illustrative SVGs:
 *   - StructuredVsUnstructured: rows-table vs. review snippet side-by-side.
 *   - TextPipeline: raw → clean → tokens → features → model.
 *   - TfIdfBars: top TF-IDF terms by sentiment polarity.
 *   - TextConfusionMatrix: classification outcomes for a ticket router.
 *   - SentimentOverTime: weekly sentiment with event annotation.
 *   - AspectHeatmap: aspect × store-region sentiment grid.
 *   - TopicWordBars: top-words per topic, small multiples.
 *   - TopicTrendsChart: topic share over time.
 *   - ClassicalNlpFailureGallery: sarcasm, negation, polysemy examples.
 *   - EmbeddingScatter: vectors in 2D with nearest-neighbour panel.
 *   - KeywordVsSemanticSearch: side-by-side retrieval result comparison.
 *   - SurveyVsTextMap: the bridge from §16.2 perceptual maps to text embeddings.
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
/* 18.1 — StructuredVsUnstructured                                      */
/* ------------------------------------------------------------------ */

export function StructuredVsUnstructured() {
  const rows = [
    { id: 'C-204', orders: 14, lt: 18, last: 6 },
    { id: 'C-205', orders: 22, lt: 9, last: 1 },
    { id: 'C-206', orders: 7, lt: 24, last: 14 },
  ];
  const reviews = [
    '“My latte was perfect but the wait felt forever. App crashed at checkout — second time this month. Still love the staff.”',
    '“Cinnamon roll is incredible. Why is the music always so loud though?”',
    '“Honestly the app is killing me. Cold brew is fine.”',
  ];
  return (
    <Card title="Structured rows vs. unstructured reviews — same customer, two evidence languages">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div>
          <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted">Warehouse table</div>
          <div className="overflow-hidden rounded-md border border-border">
            <table className="w-full text-[11.5px]">
              <thead>
                <tr className="bg-code-bg text-[10px] uppercase tracking-wide text-muted">
                  <th className="px-2 py-1.5 text-left">customer_id</th>
                  <th className="px-2 py-1.5 text-right">orders_90d</th>
                  <th className="px-2 py-1.5 text-right">tenure_mo</th>
                  <th className="px-2 py-1.5 text-right">days_since</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={r.id} className={i % 2 === 0 ? 'bg-surface' : 'bg-code-bg/60'}>
                    <td className="px-2 py-1.5 font-mono text-body">{r.id}</td>
                    <td className="px-2 py-1.5 text-right tabular-nums">{r.orders}</td>
                    <td className="px-2 py-1.5 text-right tabular-nums">{r.lt}</td>
                    <td className="px-2 py-1.5 text-right tabular-nums">{r.last}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-[10.5px] text-muted">Three numbers per customer. Fast to model, easy to compare, no language signal.</p>
        </div>
        <div>
          <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted">Reviews (same customers)</div>
          <ul className="space-y-1.5">
            {reviews.map((r, i) => (
              <li key={i} className="rounded-md border border-border bg-code-bg/60 px-2.5 py-1.5 text-[11.5px] italic text-subtle">
                {r}
              </li>
            ))}
          </ul>
          <p className="mt-2 text-[10.5px] text-muted">Three paragraphs per customer. Slow to compare, but loaded with intent, complaint type, and emotional tone.</p>
        </div>
      </div>
      <p className="mt-3 text-center text-[11px] text-muted">
        Unstructured does not mean unusable. It means we need a representation layer.
      </p>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* 18.2 — TextPipeline                                                  */
/* ------------------------------------------------------------------ */

export function TextPipeline() {
  const W = 760;
  const H = 230;
  const stages = [
    { label: 'Raw text', sub: '"app crashed AGAIN! :("', color: C.amber },
    { label: 'Cleaned', sub: 'lower, normalize, dedupe', color: C.amber },
    { label: 'Tokens', sub: '[app, crash, again]', color: C.blue },
    { label: 'Features', sub: 'TF-IDF / embedding', color: C.purple },
    { label: 'Model', sub: 'classify / cluster / search', color: C.green },
    { label: 'Action', sub: 'route, alert, summarize', color: C.green },
  ];
  const cellW = (W - 60) / stages.length;
  const yMid = 120;
  return (
    <Card title="From raw text to a business action — the standard pipeline">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Six stages from raw text to business action.">
        {stages.map((s, i) => {
          const x = 30 + cellW * i;
          return (
            <g key={s.label}>
              <rect x={x + 6} y={yMid - 36} width={cellW - 12} height={72} rx={8} fill="white" stroke={s.color} strokeWidth={1.8} />
              <text x={x + cellW / 2} y={yMid - 12} textAnchor="middle" className="fill-body text-[12px] font-semibold" style={{ fill: s.color }}>{s.label}</text>
              <text x={x + cellW / 2} y={yMid + 8} textAnchor="middle" className="fill-subtle text-[10px]">{s.sub}</text>
              <text x={x + cellW / 2} y={yMid + 22} textAnchor="middle" className="fill-muted text-[10px] font-mono">{i + 1}</text>
              {i < stages.length - 1 && (
                <line x1={x + cellW - 6} y1={yMid} x2={x + cellW + 6} y2={yMid} stroke={C.muted} strokeWidth={1.5} markerEnd="url(#tp-arrow)" />
              )}
            </g>
          );
        })}
        <defs>
          <marker id="tp-arrow" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto" markerUnits="strokeWidth">
            <path d="M0,0 L0,6 L9,3 z" fill={C.muted} />
          </marker>
        </defs>
        <text x={W / 2} y={H - 14} textAnchor="middle" className="fill-muted text-[10px] italic">
          Each stage encodes choices — the representation is rarely neutral.
        </text>
      </svg>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* 18.3 — TfIdfBars                                                     */
/* ------------------------------------------------------------------ */

export function TfIdfBars() {
  const pos = [
    { w: 'smooth', s: 0.92 },
    { w: 'friendly', s: 0.85 },
    { w: 'cinnamon', s: 0.78 },
    { w: 'cozy', s: 0.72 },
    { w: 'fresh', s: 0.68 },
    { w: 'fast', s: 0.62 },
  ];
  const neg = [
    { w: 'crashed', s: 0.95 },
    { w: 'slow', s: 0.87 },
    { w: 'rude', s: 0.80 },
    { w: 'cold', s: 0.74 },
    { w: 'expensive', s: 0.69 },
    { w: 'wait', s: 0.65 },
  ];
  const Row = ({ items, color, label }: { items: { w: string; s: number }[]; color: string; label: string }) => (
    <div>
      <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide" style={{ color }}>
        {label}
      </div>
      <ul className="space-y-1">
        {items.map(it => (
          <li key={it.w} className="grid grid-cols-[110px_minmax(0,1fr)_30px] items-center gap-2 text-[12px]">
            <span className="font-mono text-subtle">{it.w}</span>
            <span className="block h-3 rounded" style={{ width: `${it.s * 100}%`, background: color, opacity: 0.85 }} />
            <span className="text-right tabular-nums text-muted">{it.s.toFixed(2)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
  return (
    <Card title="Top TF-IDF terms in positive vs. negative Bean &amp; Basket reviews">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Row items={pos} color={C.green} label="Positive reviews" />
        <Row items={neg} color={C.red} label="Negative reviews" />
      </div>
      <p className="mt-3 text-[11px] text-muted">
        TF-IDF tells us <em>which words appear</em> — not what they <em>mean</em> in context. "Cold" lands in the negative column even when a review says "cold brew is fine."
      </p>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* 18.4a — TextConfusionMatrix                                          */
/* ------------------------------------------------------------------ */

export function TextConfusionMatrix() {
  // 4x4 ticket-routing confusion matrix
  const labels = ['billing', 'delivery', 'app issue', 'quality'];
  const M = [
    [82, 4, 2, 6],
    [3, 71, 1, 5],
    [5, 3, 64, 4],
    [10, 12, 7, 76],
  ];
  const colMax = Math.max(...M.flat());
  return (
    <Card title="Confusion matrix for a support-ticket router (held-out, 360 tickets)">
      <div className="overflow-hidden rounded-md border border-border">
        <table className="w-full text-[11.5px]">
          <thead>
            <tr>
              <th className="px-2 py-1.5 text-left text-[10px] uppercase tracking-wide text-muted">predicted ↓ / actual →</th>
              {labels.map(l => (
                <th key={l} className="px-2 py-1.5 text-center text-[10px] font-semibold uppercase tracking-wide text-muted">{l}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {labels.map((row, i) => (
              <tr key={row}>
                <th className="px-2 py-1.5 text-left text-[10px] font-semibold uppercase tracking-wide text-muted">{row}</th>
                {M[i].map((v, j) => {
                  const isDiag = i === j;
                  const alpha = v / colMax;
                  return (
                    <td
                      key={j}
                      className="px-2 py-2 text-center font-mono"
                      style={{
                        background: isDiag ? `rgba(15,118,110,${0.15 + alpha * 0.45})` : `rgba(220,38,38,${alpha * 0.4})`,
                        color: isDiag ? '#064e3b' : '#7f1d1d',
                      }}
                    >
                      {v}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-[11px] text-muted">
        The diagonal is the model getting tickets right. The brightest off-diagonal cell — quality tickets misrouted to billing — is where retraining will pay the most.
      </p>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* 18.4b — SentimentOverTime                                            */
/* ------------------------------------------------------------------ */

export function SentimentOverTime() {
  const W = 720;
  const H = 240;
  const m = { left: 50, right: 28, top: 28, bottom: 40 };
  const innerW = W - m.left - m.right;
  const innerH = H - m.top - m.bottom;
  // 26 weeks of sentiment; dip around weeks 12–15
  const data = Array.from({ length: 26 }, (_, i) => {
    const base = 0.25 + 0.08 * Math.sin(i / 4);
    const dip = i >= 11 && i <= 15 ? -0.32 + (i - 13) * 0.05 : 0;
    const noise = Math.sin(i * 1.7) * 0.04;
    return { week: i + 1, s: base + dip + noise };
  });
  const xS = (i: number) => m.left + (i / (data.length - 1)) * innerW;
  const yS = (s: number) => m.top + innerH - ((s + 0.4) / 0.9) * innerH;
  const path = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${xS(i)} ${yS(d.s)}`).join(' ');
  const eventX = xS(12);
  return (
    <Card title="Average review sentiment, weekly — the app outage in week 13">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="A weekly sentiment line with a dip around an outage event.">
        {/* zero line */}
        <line x1={m.left} y1={yS(0)} x2={W - m.right} y2={yS(0)} stroke={C.muted} strokeWidth={1} strokeDasharray="3 3" />
        {/* event band */}
        <rect x={xS(11)} y={m.top} width={xS(15) - xS(11)} height={innerH} fill={C.amberLight} opacity={0.5} />
        {/* line */}
        <path d={path} fill="none" stroke={C.blue} strokeWidth={2.4} />
        {data.map((d, i) => (
          <circle key={i} cx={xS(i)} cy={yS(d.s)} r={2.6} fill={C.blue} />
        ))}
        {/* event label */}
        <line x1={eventX} y1={m.top} x2={eventX} y2={yS(data[12].s) - 8} stroke={C.amber} strokeWidth={1.4} strokeDasharray="4 3" />
        <text x={eventX} y={m.top - 6} textAnchor="middle" className="fill-accent-ink text-[10px] font-semibold">app outage</text>
        {/* axes */}
        <line x1={m.left} y1={m.top} x2={m.left} y2={H - m.bottom} stroke={C.ink} strokeWidth={1} />
        <line x1={m.left} y1={H - m.bottom} x2={W - m.right} y2={H - m.bottom} stroke={C.ink} strokeWidth={1} />
        {[-0.4, -0.2, 0, 0.2, 0.4].map(v => (
          <text key={v} x={m.left - 8} y={yS(v) + 3} textAnchor="end" className="fill-muted text-[10px]">{v.toFixed(1)}</text>
        ))}
        {[1, 7, 13, 19, 26].map(w => (
          <text key={w} x={xS(w - 1)} y={H - m.bottom + 14} textAnchor="middle" className="fill-muted text-[10px]">{`wk ${w}`}</text>
        ))}
        <text x={(m.left + W - m.right) / 2} y={H - 6} textAnchor="middle" className="fill-subtle text-[11px]">Calendar week</text>
        <text x={14} y={(m.top + H - m.bottom) / 2} transform={`rotate(-90 14 ${(m.top + H - m.bottom) / 2})`} textAnchor="middle" className="fill-subtle text-[11px]">Mean sentiment</text>
      </svg>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* 18.4c — AspectHeatmap                                                */
/* ------------------------------------------------------------------ */

export function AspectHeatmap() {
  const aspects = ['coffee', 'pastry', 'staff', 'wait time', 'app', 'value'];
  const regions = ['NE', 'SE', 'MW', 'SW', 'WC'];
  // sentiment from -1 to +1
  const M: number[][] = [
    [0.6, 0.55, 0.7, 0.5, 0.45], // coffee
    [0.5, 0.6, 0.45, 0.4, 0.55], // pastry
    [0.7, 0.4, 0.65, 0.55, 0.5], // staff
    [-0.3, -0.55, -0.1, -0.45, -0.6], // wait time
    [-0.5, -0.4, -0.45, -0.3, -0.55], // app
    [0.0, -0.15, 0.1, -0.2, -0.3], // value
  ];
  const color = (v: number) => {
    if (v > 0) {
      const a = Math.min(1, v) * 0.7;
      return `rgba(15,118,110,${0.15 + a})`;
    }
    const a = Math.min(1, -v) * 0.7;
    return `rgba(220,38,38,${0.15 + a})`;
  };
  return (
    <Card title="Aspect-based sentiment — Bean &amp; Basket, by store region">
      <div className="overflow-hidden rounded-md border border-border">
        <table className="w-full text-[11.5px]">
          <thead>
            <tr>
              <th className="px-2 py-1.5 text-left text-[10px] uppercase tracking-wide text-muted"> </th>
              {regions.map(r => (
                <th key={r} className="px-2 py-1.5 text-center text-[10px] font-semibold uppercase tracking-wide text-muted">{r}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {aspects.map((a, i) => (
              <tr key={a}>
                <th className="px-2 py-1.5 text-left text-[11px] font-semibold text-subtle">{a}</th>
                {M[i].map((v, j) => (
                  <td key={j} className="px-2 py-1.5 text-center font-mono text-body" style={{ background: color(v) }}>
                    {v > 0 ? `+${v.toFixed(2)}` : v.toFixed(2)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-2 flex items-center justify-center gap-4 text-[10.5px] text-subtle">
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-3 w-6 rounded" style={{ background: 'rgba(220,38,38,0.7)' }} /> negative
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-3 w-6 rounded" style={{ background: 'rgba(15,118,110,0.7)' }} /> positive
        </span>
      </div>
      <p className="mt-2 text-[11px] text-muted">
        Overall sentiment hides the picture — coffee and staff are loved everywhere, the app is hurting everywhere, and the South-East has a separate wait-time problem.
      </p>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* 18.5a — TopicWordBars                                                */
/* ------------------------------------------------------------------ */

export function TopicWordBars() {
  const topics = [
    {
      name: 'Mobile app issues',
      color: C.blue,
      words: [
        { w: 'app', p: 0.18 },
        { w: 'login', p: 0.12 },
        { w: 'crash', p: 0.10 },
        { w: 'password', p: 0.08 },
        { w: 'update', p: 0.07 },
        { w: 'screen', p: 0.06 },
      ],
    },
    {
      name: 'Wait time complaints',
      color: C.amber,
      words: [
        { w: 'wait', p: 0.21 },
        { w: 'slow', p: 0.14 },
        { w: 'long', p: 0.10 },
        { w: 'line', p: 0.09 },
        { w: 'minutes', p: 0.07 },
        { w: 'morning', p: 0.06 },
      ],
    },
    {
      name: 'Drink quality praise',
      color: C.green,
      words: [
        { w: 'latte', p: 0.16 },
        { w: 'smooth', p: 0.13 },
        { w: 'flavor', p: 0.11 },
        { w: 'rich', p: 0.09 },
        { w: 'fresh', p: 0.08 },
        { w: 'perfect', p: 0.07 },
      ],
    },
    {
      name: 'Store ambiance',
      color: C.purple,
      words: [
        { w: 'cozy', p: 0.15 },
        { w: 'music', p: 0.11 },
        { w: 'lighting', p: 0.09 },
        { w: 'clean', p: 0.08 },
        { w: 'seating', p: 0.07 },
        { w: 'window', p: 0.06 },
      ],
    },
  ];
  return (
    <Card title="Top words per topic — LDA on 20,000 Bean &amp; Basket reviews">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {topics.map(t => {
          const max = Math.max(...t.words.map(w => w.p));
          return (
            <div key={t.name} className="rounded-md border border-border p-3">
              <div className="mb-1 flex items-center gap-2">
                <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: t.color }} />
                <span className="text-[12px] font-semibold text-body">{t.name}</span>
              </div>
              <ul className="space-y-1">
                {t.words.map(w => (
                  <li key={w.w} className="grid grid-cols-[80px_minmax(0,1fr)_36px] items-center gap-2 text-[11.5px]">
                    <span className="font-mono text-subtle">{w.w}</span>
                    <span className="block h-2.5 rounded" style={{ width: `${(w.p / max) * 100}%`, background: t.color, opacity: 0.85 }} />
                    <span className="text-right tabular-nums text-muted">{w.p.toFixed(2)}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
      <p className="mt-3 text-[11px] text-muted">
        The algorithm produces word distributions. The names — "Mobile app issues", "Drink quality praise" — come from a human reading the words and a sample of documents.
      </p>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* 18.5b — TopicTrendsChart                                             */
/* ------------------------------------------------------------------ */

export function TopicTrendsChart() {
  const W = 720;
  const H = 260;
  const m = { left: 50, right: 110, top: 24, bottom: 40 };
  const innerW = W - m.left - m.right;
  const innerH = H - m.top - m.bottom;
  const series = [
    { name: 'Mobile app issues', color: C.blue, vals: [0.10, 0.11, 0.12, 0.14, 0.18, 0.24, 0.28, 0.31, 0.32, 0.30, 0.27, 0.25] },
    { name: 'Wait time complaints', color: C.amber, vals: [0.22, 0.20, 0.18, 0.20, 0.22, 0.24, 0.21, 0.19, 0.18, 0.17, 0.18, 0.20] },
    { name: 'Drink quality praise', color: C.green, vals: [0.32, 0.34, 0.36, 0.33, 0.30, 0.28, 0.27, 0.26, 0.25, 0.27, 0.29, 0.30] },
    { name: 'Store ambiance', color: C.purple, vals: [0.16, 0.17, 0.15, 0.14, 0.13, 0.12, 0.12, 0.12, 0.13, 0.14, 0.14, 0.15] },
  ];
  const xS = (i: number) => m.left + (i / 11) * innerW;
  const yS = (v: number) => m.top + innerH - (v / 0.4) * innerH;
  return (
    <Card title="Topic share over twelve months — the app issues topic is rising fast">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Topic share over time for four topics.">
        <line x1={m.left} y1={m.top} x2={m.left} y2={H - m.bottom} stroke={C.ink} strokeWidth={1} />
        <line x1={m.left} y1={H - m.bottom} x2={W - m.right} y2={H - m.bottom} stroke={C.ink} strokeWidth={1} />
        {[0, 0.1, 0.2, 0.3, 0.4].map(v => (
          <g key={v}>
            <line x1={m.left} y1={yS(v)} x2={W - m.right} y2={yS(v)} stroke={C.grid} strokeWidth={1} />
            <text x={m.left - 8} y={yS(v) + 3} textAnchor="end" className="fill-muted text-[10px]">{`${(v * 100).toFixed(0)}%`}</text>
          </g>
        ))}
        {series.map(s => {
          const path = s.vals.map((v, i) => `${i === 0 ? 'M' : 'L'} ${xS(i)} ${yS(v)}`).join(' ');
          return (
            <g key={s.name}>
              <path d={path} fill="none" stroke={s.color} strokeWidth={2.2} />
              {s.vals.map((v, i) => (
                <circle key={i} cx={xS(i)} cy={yS(v)} r={2.4} fill={s.color} />
              ))}
              <text x={W - m.right + 6} y={yS(s.vals[s.vals.length - 1]) + 3} className="text-[10px]" style={{ fill: s.color }}>{s.name}</text>
            </g>
          );
        })}
        {[0, 3, 6, 9, 11].map(i => (
          <text key={i} x={xS(i)} y={H - m.bottom + 14} textAnchor="middle" className="fill-muted text-[10px]">{`m${i + 1}`}</text>
        ))}
        <text x={(m.left + W - m.right) / 2} y={H - 6} textAnchor="middle" className="fill-subtle text-[11px]">Month</text>
      </svg>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* 18.6 — ClassicalNlpFailureGallery                                    */
/* ------------------------------------------------------------------ */

export function ClassicalNlpFailureGallery() {
  const rows = [
    { kind: 'Sarcasm', text: '"I just love waiting forty minutes for cold coffee."', surface: 'positive (love)', truth: 'strongly negative' },
    { kind: 'Negation', text: '"not bad — actually really good"', surface: 'mixed (bad / good)', truth: 'positive' },
    { kind: 'Polysemy', text: '"cold brew is amazing"', surface: 'negative (cold)', truth: 'positive (cold brew = product)' },
    { kind: 'Domain idiom', text: '"this app is killing me"', surface: 'extreme negative', truth: 'mild frustration' },
    { kind: 'Mixed sentiment', text: '"latte was perfect but the wait was awful"', surface: 'mixed', truth: 'positive on drink, negative on service' },
    { kind: 'Context shift', text: '"premium price" (luxury review)', surface: 'negative (price)', truth: 'positive — premium = quality' },
  ];
  return (
    <Card title="Where bag-of-words and dictionary sentiment quietly fail">
      <div className="overflow-hidden rounded-md border border-border">
        <table className="w-full text-[11.5px]">
          <thead>
            <tr className="bg-code-bg text-[10px] uppercase tracking-wide text-muted">
              <th className="px-2 py-1.5 text-left">Kind</th>
              <th className="px-2 py-1.5 text-left">Example</th>
              <th className="px-2 py-1.5 text-left">Surface read</th>
              <th className="px-2 py-1.5 text-left">What it really says</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.kind} className={i % 2 === 0 ? 'bg-surface' : 'bg-code-bg/60'}>
                <td className="px-2 py-1.5 font-semibold text-subtle">{r.kind}</td>
                <td className="px-2 py-1.5 italic text-subtle">{r.text}</td>
                <td className="px-2 py-1.5 text-neg">{r.surface}</td>
                <td className="px-2 py-1.5 text-pos">{r.truth}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-[11px] text-muted">
        Bag-of-words knows which words appear, not what they mean together. The fix is a representation that places similar meanings near each other.
      </p>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* 19.1 — EmbeddingScatter                                              */
/* ------------------------------------------------------------------ */

export function EmbeddingScatter() {
  const W = 720;
  const H = 320;
  const m = { left: 30, right: 220, top: 24, bottom: 30 };
  const innerW = W - m.left - m.right;
  const innerH = H - m.top - m.bottom;
  const cx = m.left + innerW / 2;
  const cy = m.top + innerH / 2;
  const xS = (v: number) => cx + v * (innerW / 2 - 12);
  const yS = (v: number) => cy - v * (innerH / 2 - 12);
  const groups = [
    { label: 'refund / cancel', color: C.red, pts: [
      { x: -0.55, y: 0.55, w: 'refund' },
      { x: -0.48, y: 0.42, w: 'return' },
      { x: -0.50, y: 0.6, w: 'money back' },
      { x: -0.40, y: 0.5, w: 'cancel order' },
    ]},
    { label: 'delivery delays', color: C.amber, pts: [
      { x: 0.55, y: 0.45, w: 'late delivery' },
      { x: 0.62, y: 0.32, w: 'driver delayed' },
      { x: 0.48, y: 0.5, w: 'arrived cold' },
      { x: 0.6, y: 0.55, w: 'took forever' },
    ]},
    { label: 'app technical', color: C.blue, pts: [
      { x: -0.45, y: -0.45, w: 'app crash' },
      { x: -0.55, y: -0.5, w: 'login broken' },
      { x: -0.38, y: -0.55, w: 'cant sign in' },
      { x: -0.5, y: -0.38, w: 'password reset' },
    ]},
    { label: 'product praise', color: C.green, pts: [
      { x: 0.45, y: -0.55, w: 'smooth latte' },
      { x: 0.55, y: -0.45, w: 'perfect espresso' },
      { x: 0.6, y: -0.6, w: 'rich flavor' },
      { x: 0.4, y: -0.4, w: 'fresh roast' },
    ]},
  ];
  const query = { x: -0.52, y: 0.50, w: 'unhappy with refund process' };
  return (
    <Card title="An embedding space — phrases near each other mean similar things">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="A 2D embedding scatter with four clusters and a query point.">
        <rect x={m.left} y={m.top} width={innerW} height={innerH} fill={C.slate50} stroke={C.grid} />
        <line x1={m.left} y1={cy} x2={m.left + innerW} y2={cy} stroke={C.muted} strokeWidth={1} strokeDasharray="2 3" />
        <line x1={cx} y1={m.top} x2={cx} y2={m.top + innerH} stroke={C.muted} strokeWidth={1} strokeDasharray="2 3" />
        {groups.map(g => (
          <g key={g.label}>
            {g.pts.map((p, i) => (
              <g key={i}>
                <circle cx={xS(p.x)} cy={yS(p.y)} r={4} fill={g.color} />
                <text x={xS(p.x) + 6} y={yS(p.y) + 3} className="text-[9.5px]" style={{ fill: g.color }}>{p.w}</text>
              </g>
            ))}
          </g>
        ))}
        {/* query point */}
        <circle cx={xS(query.x)} cy={yS(query.y)} r={6} fill="white" stroke={C.ink} strokeWidth={2} />
        <text x={xS(query.x) + 8} y={yS(query.y) - 6} className="fill-body text-[10px] font-semibold">query</text>
        <text x={xS(query.x) + 8} y={yS(query.y) + 7} className="fill-subtle text-[9px] italic">"unhappy with refund process"</text>
        {/* neighbour panel */}
        <g transform={`translate(${W - m.right + 10},${m.top + 8})`}>
          <rect x={0} y={0} width={195} height={innerH - 8} rx={6} fill="white" stroke={C.grid} />
          <text x={10} y={16} className="fill-body text-[11px] font-semibold">Nearest neighbours</text>
          {['refund', 'money back', 'return', 'cancel order', 'late delivery', 'arrived cold'].map((w, i) => (
            <g key={w}>
              <text x={10} y={36 + i * 16} className="fill-subtle text-[10.5px] font-mono">{i + 1}. {w}</text>
              <rect x={130} y={28 + i * 16} width={60 - i * 8} height={8} rx={2} fill={i < 4 ? C.red : C.amber} opacity={0.85} />
            </g>
          ))}
          <text x={10} y={36 + 6 * 16 + 6} className="fill-muted text-[9.5px] italic">distance ↑ as rank ↓</text>
        </g>
      </svg>
      <p className="mt-2 text-[11px] text-muted">
        The query never used the word "refund" outside the bracket. Yet "refund / money back / return / cancel order" surfaced — the embedding captured the <em>intent</em>, not the keywords.
      </p>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* 19.2 — KeywordVsSemanticSearch                                       */
/* ------------------------------------------------------------------ */

export function KeywordVsSemanticSearch() {
  const query = '"customers angry about delivery delays"';
  const keyword = [
    { text: '"Angry that my order took forever."', hit: true, why: 'matches "angry"' },
    { text: '"Driver was late again."', hit: false, why: 'no shared word' },
    { text: '"Delivery window was missed."', hit: true, why: 'matches "delivery"' },
    { text: '"Food arrived cold after a long wait."', hit: false, why: 'no shared word' },
  ];
  const semantic = [
    { text: '"Angry that my order took forever."', hit: true, why: 'semantic match — anger + delay' },
    { text: '"Driver was late again."', hit: true, why: 'semantic match — delivery + late' },
    { text: '"Delivery window was missed."', hit: true, why: 'semantic match — delivery problem' },
    { text: '"Food arrived cold after a long wait."', hit: true, why: 'semantic match — wait + frustration' },
  ];
  const Row = ({ items, label, color }: { items: typeof keyword; label: string; color: string }) => (
    <div className="rounded-md border border-border p-3">
      <div className="mb-2 text-[11.5px] font-semibold uppercase tracking-wide" style={{ color }}>{label}</div>
      <ul className="space-y-1.5">
        {items.map((r, i) => (
          <li key={i} className="flex items-start gap-2 text-[11.5px]">
            <span
              className={`mt-0.5 inline-block min-w-[28px] rounded px-1.5 py-0.5 text-center text-[10px] font-semibold uppercase tracking-wide ${
                r.hit ? 'bg-pos/10 text-pos' : 'bg-code-bg text-muted'
              }`}
            >
              {r.hit ? 'hit' : 'miss'}
            </span>
            <div>
              <div className="italic text-body">{r.text}</div>
              <div className="text-[10px] text-muted">{r.why}</div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
  return (
    <Card title={`Keyword vs. semantic search for the query ${query}`}>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <Row items={keyword} label="Keyword retrieval" color={C.amber} />
        <Row items={semantic} label="Semantic retrieval" color={C.green} />
      </div>
      <p className="mt-3 text-[11px] text-muted">
        Keyword search recovers only the documents that share words with the query. Semantic search recovers the documents that share <em>meaning</em>.
      </p>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* 19.2 — SurveyVsTextMap (bridge to §16.2)                              */
/* ------------------------------------------------------------------ */

export function SurveyVsTextMap() {
  const W = 720;
  const H = 320;
  const left = 30;
  const colW = (W - 60) / 2;
  const brands = [
    { name: 'Bean & Basket', surveyX: 0.4, surveyY: 0.45, textX: 0.45, textY: 0.5, color: C.green },
    { name: 'Starbucks', surveyX: 0.55, surveyY: 0.6, textX: 0.6, textY: 0.55, color: C.green },
    { name: 'Dunkin', surveyX: -0.5, surveyY: 0.2, textX: -0.45, textY: 0.25, color: C.blue },
    { name: 'Blue Bottle', surveyX: 0.75, surveyY: 0.3, textX: 0.72, textY: 0.35, color: C.purple },
    { name: 'local café', surveyX: 0.2, surveyY: -0.35, textX: 0.1, textY: -0.42, color: C.amber },
    { name: 'convenience', surveyX: -0.7, surveyY: -0.5, textX: -0.65, textY: -0.55, color: C.red },
  ];
  const panel = (offset: number, title: string, sub: string, xKey: 'surveyX' | 'textX', yKey: 'surveyY' | 'textY') => {
    const innerW = colW;
    const innerH = 220;
    const oy = 40;
    const cx = offset + innerW / 2;
    const cy = oy + innerH / 2;
    const xS = (v: number) => cx + v * (innerW / 2 - 14);
    const yS = (v: number) => cy - v * (innerH / 2 - 14);
    return (
      <g>
        <text x={offset + innerW / 2} y={22} textAnchor="middle" className="fill-body text-[11px] font-semibold">{title}</text>
        <text x={offset + innerW / 2} y={36} textAnchor="middle" className="fill-muted text-[10px]">{sub}</text>
        <rect x={offset} y={oy} width={innerW} height={innerH} fill={C.slate50} stroke={C.grid} />
        <line x1={offset} y1={cy} x2={offset + innerW} y2={cy} stroke={C.muted} strokeWidth={1} strokeDasharray="2 3" />
        <line x1={cx} y1={oy} x2={cx} y2={oy + innerH} stroke={C.muted} strokeWidth={1} strokeDasharray="2 3" />
        {brands.map(b => (
          <g key={b.name}>
            <circle cx={xS(b[xKey])} cy={yS(b[yKey])} r={5} fill={b.color} />
            <text x={xS(b[xKey]) + 7} y={yS(b[yKey]) + 3} className="text-[9.5px]" style={{ fill: b.color }}>{b.name}</text>
          </g>
        ))}
      </g>
    );
  };
  return (
    <Card title="Same brands, two evidence languages — survey PCA on the left, review embeddings on the right">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Two brand maps that show similar positioning from different evidence languages.">
        {panel(left, 'PCA on attribute ratings', 'survey data, fixed scales', 'surveyX', 'surveyY')}
        {panel(left + colW + 30, 'UMAP on review embeddings', 'free text, learned space', 'textX', 'textY')}
      </svg>
      <p className="mt-2 text-[11px] text-muted">
        The same competitive structure surfaces from two evidence languages. Embeddings let us read positioning from text the way PCA lets us read it from surveys.
      </p>
    </Card>
  );
}
