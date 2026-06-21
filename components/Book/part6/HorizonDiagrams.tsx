'use client';

import * as React from 'react';

/**
 * Visuals for §17.6 "The Horizon" — the grounded forward look.
 *
 *   - HorizonScorecard: the bull case next to the reality check, both sourced.
 *   - AnalystShift: how the analyst's job moves from doing to stewarding.
 *   - D3MAgentSynthesis: the whole-book D3M loop, now operated by agents with a
 *     human above the loop. The closing image of the part and the book.
 */

const C = {
  ink: '#172033',
  muted: '#64748b',
  grid: '#e2e8f0',
  blue: '#2563eb',
  blueLight: '#dbeafe',
  sky: '#0284c7',
  skyLight: '#e0f2fe',
  teal: '#0d9488',
  tealLight: '#ccfbf1',
  green: '#0f766e',
  greenLight: '#d1fae5',
  amber: '#d97706',
  amberLight: '#fef3c7',
  red: '#dc2626',
  redLight: '#fee2e2',
  violet: '#7c3aed',
  violetLight: '#ede9fe',
  slate100: '#f1f5f9',
  slate50: '#f8fafc',
};

function Card({ title, children, footer }: { title?: string; children: React.ReactNode; footer?: React.ReactNode }) {
  return (
    <div className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
      {title && <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</p>}
      {children}
      {footer && <div className="mt-3 text-[11px] leading-relaxed text-slate-500">{footer}</div>}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* §17.6 — HorizonScorecard                                             */
/* ------------------------------------------------------------------ */

export function HorizonScorecard() {
  const bull = [
    { value: '33%', label: 'of enterprise software will embed agentic AI by 2028 (from <1% in 2024)', src: 'Gartner' },
    { value: '15%', label: 'of day-to-day work decisions made autonomously by 2028 (from 0%)', src: 'Gartner' },
  ];
  const real = [
    { value: '~95%', label: 'of enterprise GenAI pilots show no measurable P&L impact', src: 'MIT NANDA' },
    { value: '42%', label: 'of firms abandoning most AI initiatives — up from 17% a year earlier', src: 'S&P Global' },
    { value: '>40%', label: 'of agentic-AI projects forecast to be canceled by end of 2027', src: 'Gartner' },
  ];
  return (
    <Card title="Two true stories at once">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-md border border-sky-200 bg-sky-50/50 p-3">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-sky-700">The bull case</p>
          <div className="space-y-2.5">
            {bull.map((b) => (
              <div key={b.label} className="flex gap-3">
                <span className="w-12 shrink-0 font-mono text-[18px] font-bold text-sky-700">{b.value}</span>
                <span className="text-[11.5px] leading-snug text-slate-600">{b.label} <span className="text-slate-400">· {b.src}</span></span>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-md border border-amber-200 bg-amber-50/50 p-3">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-amber-700">The reality check</p>
          <div className="space-y-2.5">
            {real.map((b) => (
              <div key={b.label} className="flex gap-3">
                <span className="w-12 shrink-0 font-mono text-[18px] font-bold text-amber-700">{b.value}</span>
                <span className="text-[11.5px] leading-snug text-slate-600">{b.label} <span className="text-slate-400">· {b.src}</span></span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <p className="mt-3 text-[11px] leading-relaxed text-slate-500">
        Both columns are well-sourced and both are true. The forecasts describe where the capability is heading; the failure rates describe
        what happens when firms deploy it without the discipline this book has been building. The winners will be the ones who treat agents
        as infrastructure to be governed, not magic to be bought.
      </p>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* §17.6 — AnalystShift                                                 */
/* ------------------------------------------------------------------ */

export function AnalystShift() {
  const from = ['Write the SQL by hand', 'Build the dashboard', 'Run the model', 'Format the deck'];
  const to = ['Own the semantic layer', 'Supervise the agents', 'Verify & approve outputs', 'Manage AI risk'];
  return (
    <Card title="The job moves up a level">
      <div className="grid items-center gap-3 sm:grid-cols-[1fr_auto_1fr]">
        <div className="rounded-md border border-slate-200 bg-slate-50/70 p-3">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">From — doing the task</p>
          <ul className="space-y-1.5">
            {from.map((t) => (
              <li key={t} className="flex gap-1.5 text-[12px] text-slate-600"><span className="text-slate-400">–</span>{t}</li>
            ))}
          </ul>
        </div>
        <div className="flex items-center justify-center">
          <span className="rounded-full border border-teal-300 bg-teal-50 px-3 py-1 text-[11px] font-semibold text-teal-700">becomes →</span>
        </div>
        <div className="rounded-md border border-teal-200 bg-teal-50/50 p-3">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-teal-700">To — steering the system</p>
          <ul className="space-y-1.5">
            {to.map((t) => (
              <li key={t} className="flex gap-1.5 text-[12px] text-slate-700"><span className="text-teal-500">+</span>{t}</li>
            ))}
          </ul>
        </div>
      </div>
      <p className="mt-3 text-[11px] leading-relaxed text-slate-500">
        Agents absorb the mechanical work; the human moves &ldquo;above the loop.&rdquo; The scarce skill becomes defining the question, curating
        the metric definitions the agents depend on, and judging whether an answer is trustworthy — exactly the judgment this book trains.
      </p>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* §17.6 — D3MAgentSynthesis                                            */
/* ------------------------------------------------------------------ */

export function D3MAgentSynthesis() {
  const W = 780;
  const H = 360;
  const cx = W / 2;
  const cy = 196;
  const rx = 280;
  const ry = 116;
  const stations = [
    { a: -90, label: 'Frame the question', sub: 'Part I', color: C.sky },
    { a: -34, label: 'Query the data', sub: 'text-to-SQL · §17.2', color: C.teal },
    { a: 22, label: 'Analyze & predict', sub: 'agentic workflows · §17.3', color: C.blue },
    { a: 90, label: 'Decide', sub: 'evidence → action', color: C.violet },
    { a: 158, label: 'Act & monitor', sub: 'loops · §17.3', color: C.amber },
    { a: 214, label: 'Learn', sub: 'feedback → next run', color: C.green },
  ];
  const pt = (a: number, r = 1) => {
    const rad = (a * Math.PI) / 180;
    return { x: cx + rx * r * Math.cos(rad), y: cy + ry * r * Math.sin(rad) };
  };
  return (
    <Card title="The D3M loop, operated by agents — with a human above it">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="The data-to-decision loop drawn as a ring of six stations operated by agents, with a human supervising from above.">
        {/* human above the loop */}
        <rect x={cx - 130} y={14} width={260} height={40} rx={20} fill={C.greenLight} stroke={C.green} strokeWidth={1.6} />
        <text x={cx} y={32} textAnchor="middle" className="text-[12px] font-semibold" fill={C.green}>Human — above the loop</text>
        <text x={cx} y={47} textAnchor="middle" className="text-[9px]" fill={C.muted}>sets the question · owns the metrics · approves the calls</text>
        <line x1={cx} y1={54} x2={cx} y2={cy - 34} stroke={C.green} strokeWidth={1.3} strokeDasharray="4 3" markerEnd="url(#syn-arrow-g)" />

        {/* orbit */}
        <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="none" stroke={C.grid} strokeWidth={1.4} strokeDasharray="4 4" />
        {/* center */}
        <circle cx={cx} cy={cy} r={30} fill={C.slate50} stroke={C.muted} strokeWidth={1.4} />
        <text x={cx} y={cy - 2} textAnchor="middle" className="text-[11px] font-bold" fill={C.ink}>D3M</text>
        <text x={cx} y={cy + 11} textAnchor="middle" className="text-[8px]" fill={C.muted}>agents</text>
        {/* stations */}
        {stations.map((s) => {
          const p = pt(s.a);
          return (
            <g key={s.label}>
              <rect x={p.x - 70} y={p.y - 22} width={140} height={44} rx={9} fill="white" stroke={s.color} strokeWidth={1.5} />
              <text x={p.x} y={p.y - 3} textAnchor="middle" className="text-[10.5px] font-semibold" fill={s.color}>{s.label}</text>
              <text x={p.x} y={p.y + 11} textAnchor="middle" className="text-[8.5px]" fill={C.muted}>{s.sub}</text>
            </g>
          );
        })}
        <defs>
          <marker id="syn-arrow-g" markerWidth="9" markerHeight="9" refX="7" refY="3" orient="auto" markerUnits="strokeWidth">
            <path d="M0,0 L0,6 L8,3 z" fill={C.green} />
          </marker>
        </defs>
      </svg>
      <p className="mt-1 text-[11px] leading-relaxed text-slate-500">
        This is the same data-to-decision loop the book opened with — only now an agent can turn each station&rsquo;s crank. The work that
        does not get automated is the work this book exists to teach: framing the question, owning the definitions, and judging the answer.
      </p>
    </Card>
  );
}
