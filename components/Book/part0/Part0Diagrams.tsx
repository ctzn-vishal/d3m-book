'use client';

import * as React from 'react';

/**
 * Shared visuals for Part 0 (and reused across the book).
 *
 *   - LadderPosition: 7-step decision ladder strip; supports a "current" highlight.
 *   - ArtefactFamilyTree: the chain from Decision Question Card → Decision Memo.
 *   - EvidenceStackMap: the six evidence languages and what each one buys.
 *   - CasePortfolio: through-line + standalone cases with the methods each one serves.
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
/* LadderPosition — the book's spine, with a "current" rung highlight   */
/* ------------------------------------------------------------------ */

export interface LadderPositionProps {
  /** Highlight one rung as the current position. Zero-indexed (0..6). Omit to show the full ladder. */
  current?: number;
  /** Compact mode for use atop each Part's first article. */
  compact?: boolean;
  /** Optional caption below the ladder. */
  caption?: string;
}

const LADDER_RUNGS = [
  { label: 'What happened?', lang: 'Description', color: '#475569', part: 'I' },
  { label: 'Where & for whom?', lang: 'Visual comparison', color: C.blue, part: 'II' },
  { label: 'What caused it?', lang: 'Causal designs', color: C.green, part: 'III' },
  { label: 'How much does X matter?', lang: 'Regression / elasticity', color: C.teal, part: 'III' },
  { label: 'What is likely next?', lang: 'Prediction', color: C.purple, part: 'IV' },
  { label: 'What does the text/image say?', lang: 'AI workflows', color: C.amber, part: 'V' },
  { label: 'How do we operate this?', lang: 'System view', color: C.red, part: 'VI' },
];

export function LadderPosition({ current, compact = false, caption }: LadderPositionProps) {
  const W = compact ? 760 : 840;
  const H = compact ? 90 : 220;
  const cellW = (W - 60) / LADDER_RUNGS.length;
  const yMid = compact ? 50 : 110;
  return (
    <Card title={compact ? undefined : 'The decision ladder'}>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="The seven-rung decision ladder used throughout the book.">
        {LADDER_RUNGS.map((r, i) => {
          const x = 30 + cellW * i;
          const isCurrent = current === i;
          const ringStroke = isCurrent ? r.color : C.grid;
          const ringFill = isCurrent ? 'white' : '#fff';
          return (
            <g key={r.label}>
              <circle cx={x + cellW / 2} cy={yMid} r={compact ? 18 : 22} fill={ringFill} stroke={ringStroke} strokeWidth={isCurrent ? 3 : 1.5} />
              <text x={x + cellW / 2} y={yMid + 5} textAnchor="middle" className="fill-slate-700 text-[11px] font-semibold" style={{ fill: isCurrent ? r.color : C.muted }}>
                {r.part}
              </text>
              {!compact && (
                <>
                  <text x={x + cellW / 2} y={yMid - 38} textAnchor="middle" className="fill-slate-700 text-[10px] font-semibold">{r.lang}</text>
                  <foreignObject x={x + 4} y={yMid + 30} width={cellW - 8} height={60}>
                    <div style={{ fontSize: 10, color: '#475569', textAlign: 'center', lineHeight: 1.3 }}>
                      {r.label}
                    </div>
                  </foreignObject>
                </>
              )}
              {compact && (
                <foreignObject x={x + 2} y={yMid + 24} width={cellW - 4} height={36}>
                  <div style={{ fontSize: 9.5, color: isCurrent ? '#172033' : '#64748b', textAlign: 'center', lineHeight: 1.2, fontWeight: isCurrent ? 600 : 400 }}>
                    {r.label}
                  </div>
                </foreignObject>
              )}
              {i < LADDER_RUNGS.length - 1 && (
                <line
                  x1={x + cellW / 2 + (compact ? 18 : 22)}
                  y1={yMid}
                  x2={x + cellW + cellW / 2 - (compact ? 18 : 22)}
                  y2={yMid}
                  stroke={C.muted}
                  strokeWidth={1.2}
                />
              )}
            </g>
          );
        })}
      </svg>
      {caption && <p className="mt-1 text-center text-[10.5px] italic text-slate-500">{caption}</p>}
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* ArtefactFamilyTree — the chain of one-page artefacts                  */
/* ------------------------------------------------------------------ */

const ARTEFACTS = [
  { name: 'Decision Question Card', section: '§9.1', purpose: 'What action, on what unit, with what counterfactual?', color: C.blue },
  { name: 'Predictive Task Contract', section: '§14.2', purpose: 'What target, for what unit, on what horizon, with what features?', color: C.purple },
  { name: 'Model Card', section: '§15.5', purpose: 'What does this model do, where does it fail, who owns it?', color: C.amber },
  { name: 'AI Workflow Card', section: '§22.1', purpose: 'What does this workflow do, what governs it, who responds?', color: C.green },
  { name: 'Decision Memo', section: '§24.1', purpose: 'What is the recommendation, what evidence supports it, what next?', color: C.red },
];

export function ArtefactFamilyTree() {
  return (
    <Card title="The artefact family — five one-page documents that survive the work">
      <div className="space-y-2">
        {ARTEFACTS.map((a, i) => (
          <React.Fragment key={a.name}>
            <div className="grid grid-cols-[140px_minmax(0,1fr)_70px] items-center gap-3 rounded-md border border-slate-200 p-2.5">
              <div className="flex items-center gap-2">
                <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: a.color }} />
                <span className="text-[12px] font-semibold" style={{ color: a.color }}>{a.name}</span>
              </div>
              <div className="text-[11.5px] italic text-slate-700">{a.purpose}</div>
              <div className="text-right font-mono text-[10.5px] text-slate-500">{a.section}</div>
            </div>
            {i < ARTEFACTS.length - 1 && (
              <div className="flex items-center justify-center text-slate-300">
                <span className="text-[18px]">↓</span>
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
      <p className="mt-3 text-[11px] text-slate-500">
        Each artefact extends the discipline of the one above. The card you write at §9.1 grows into the memo you sign at §24.1.
      </p>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* EvidenceStackMap — six evidence languages, what each buys             */
/* ------------------------------------------------------------------ */

export function EvidenceStackMap() {
  const rows = [
    { q: 'What happened?', lang: 'Description, metrics', part: 'I', studio: 'Data Language Studio (§4.1)', color: '#475569' },
    { q: 'What should the eye see first?', lang: 'Visual evidence', part: 'II', studio: 'Visual Decision Brief (§8.2)', color: C.blue },
    { q: 'What caused it?', lang: 'Causal designs', part: 'III', studio: 'Pricing & Promotion (§13.4)', color: C.green },
    { q: 'What is likely next?', lang: 'Prediction & segmentation', part: 'IV', studio: 'Customer Intelligence (§17.4)', color: C.purple },
    { q: 'What does the text or image say?', lang: 'AI workflows', part: 'V', studio: 'Customer Voice Intelligence (§22.2)', color: C.amber },
    { q: 'How do we operate this?', lang: 'System view', part: 'VI', studio: 'Final Integrative Case (§25.1)', color: C.red },
  ];
  return (
    <Card title="Six evidence languages, one per Part">
      <div className="overflow-hidden rounded-md border border-slate-200">
        <table className="w-full text-[12px]">
          <thead>
            <tr className="bg-slate-50 text-[10px] uppercase tracking-wide text-slate-500">
              <th className="px-2 py-1.5 text-left">Decision question</th>
              <th className="px-2 py-1.5 text-left">Evidence language</th>
              <th className="px-2 py-1.5 text-center">Part</th>
              <th className="px-2 py-1.5 text-left">Studio</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.q} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'}>
                <td className="px-2 py-1.5 text-slate-800">{r.q}</td>
                <td className="px-2 py-1.5">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: r.color }} />
                    <span className="text-slate-700">{r.lang}</span>
                  </span>
                </td>
                <td className="px-2 py-1.5 text-center font-mono text-slate-500">{r.part}</td>
                <td className="px-2 py-1.5 italic text-slate-600">{r.studio}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-[11px] text-slate-500">
        Each Part teaches one evidence language and ends with a Studio that ships its capstone artefact.
      </p>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* CasePortfolio — through-line + standalone cases with their methods    */
/* ------------------------------------------------------------------ */

export function CasePortfolio() {
  const through = {
    name: 'Bean & Basket Coffee',
    sub: 'The continuous through-line',
    note: 'A multi-store specialty coffee chain with reviews, tickets, transactions, panel data, campaigns, products, stores, and an internal knowledge base. Appears in every Part.',
    color: C.green,
  };
  const standalone = [
    { name: 'Progresso Soup', parts: ['II', 'III'], note: 'Visual evidence, fixed effects, elasticity', color: C.amber },
    { name: 'Milk Field Data', parts: ['III'], note: 'Quasi-experiment, heterogeneous effects', color: C.blue },
    { name: 'Zillow Colorado', parts: ['III'], note: 'Difference-in-differences, synthetic control', color: C.teal },
    { name: 'BAV Fast Food', parts: ['IV'], note: 'PCA, perceptual maps', color: C.purple },
    { name: 'Airbnb (illustrative)', parts: ['IV'], note: 'Numeric prediction, residuals', color: C.pink },
    { name: 'Yelp Reviews', parts: ['V'], note: 'Sentiment, topics, GPT measurement', color: C.amber },
    { name: 'Goose Island Twitter', parts: ['V'], note: 'Emotion vs. sentiment', color: C.red },
    { name: 'Earnings Calls', parts: ['V'], note: 'Evasiveness measurement', color: C.blue },
    { name: 'Job Postings', parts: ['V'], note: 'Construct measurement', color: C.purple },
  ];
  return (
    <Card title="The case portfolio">
      {/* through-line */}
      <div className="mb-3 rounded-md border-2 border-emerald-300 bg-emerald-50/40 p-3">
        <div className="flex items-center gap-2">
          <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: through.color }} />
          <span className="text-[12.5px] font-semibold text-emerald-900">{through.name}</span>
          <span className="text-[10.5px] uppercase tracking-wide text-emerald-700">{through.sub}</span>
        </div>
        <p className="mt-1.5 text-[11.5px] italic text-slate-700">{through.note}</p>
      </div>
      <div className="mb-1.5 text-[10.5px] font-semibold uppercase tracking-wide text-slate-500">Standalone case studies</div>
      <div className="grid grid-cols-1 gap-1.5 md:grid-cols-2 lg:grid-cols-3">
        {standalone.map(s => (
          <div key={s.name} className="rounded-md border border-slate-200 p-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="inline-block h-2 w-2 rounded-sm" style={{ background: s.color }} />
                <span className="text-[12px] font-semibold text-slate-800">{s.name}</span>
              </div>
              <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-mono text-slate-600">
                {s.parts.map(p => `Pt ${p}`).join(', ')}
              </span>
            </div>
            <div className="mt-1 text-[10.5px] italic text-slate-600">{s.note}</div>
          </div>
        ))}
      </div>
      <p className="mt-3 text-[11px] text-slate-500">
        Standalone cases are appended outside chapter prose. They give the methods a second testing ground beyond the Bean &amp; Basket through-line.
      </p>
    </Card>
  );
}
