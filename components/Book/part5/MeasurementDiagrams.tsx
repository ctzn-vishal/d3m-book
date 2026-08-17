'use client';

import * as React from 'react';

import { DiagramFrame, LEGACY_C } from '@/components/Book/diagram';

/**
 * Conceptual diagrams for §19.3 (GPT-as-measurement) and §22 (AI eval & governance).
 *
 *   - ConstructVsSurfaceTable: VADER number vs measured constructs, side-by-side.
 *   - GabrielPrimitives: five-icon block (rate / classify / extract / discover / debias).
 *   - MeasurementCostChart: human vs gpt-5 vs gpt-5-mini vs gpt-5-nano cost bars.
 *   - ValidationLabSchematic: three methods × ground truth panel.
 *   - AIEvalRubric: eight evaluation dimensions card.
 *   - RiskControlMap: risk vs control strength heatmap.
 *   - AIWorkflowCard: one-page contract for a deployed AI workflow.
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
/* 19.3 — ConstructVsSurfaceTable                                       */
/* ------------------------------------------------------------------ */

export function ConstructVsSurfaceTable() {
  const tweet = '"Goose Island used to belong to us. Now it just belongs to the shelf."';
  const surface = [
    { name: 'VADER sentiment', val: -0.42, note: 'moderately negative' },
    { name: 'Stars (if rated)', val: 2.0, note: 'low' },
    { name: 'Neg-word count', val: 1, note: '"just"' },
  ];
  const constructs = [
    { name: 'Sense of betrayal', val: 0.78, note: 'language of broken promise' },
    { name: 'Nostalgia for independence', val: 0.92, note: '"used to belong to us"' },
    { name: 'Brand-loyalty transfer concern', val: 0.65, note: 'asks whether to keep buying' },
    { name: 'Anti-corporate sentiment', val: 0.55, note: 'implicit, not explicit' },
  ];
  return (
    <Card title="One tweet, two evidence languages">
      <div className="rounded-md border border-border bg-code-bg px-3 py-2 text-[12.5px] italic text-body">
        {tweet}
      </div>
      <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
        <div className="rounded-md border border-border p-3">
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-accent-ink">Surface features (classical)</div>
          <ul className="space-y-1.5">
            {surface.map(r => (
              <li key={r.name} className="grid grid-cols-[140px_minmax(0,1fr)_50px] items-center gap-2 text-[11.5px]">
                <span className="text-subtle">{r.name}</span>
                <span className="text-muted">{r.note}</span>
                <span className="text-right tabular-nums font-mono text-body">{r.val.toString()}</span>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-[10.5px] italic text-muted">Single number, ambiguous meaning. What do you do on Monday?</p>
        </div>
        <div className="rounded-md border border-border p-3">
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-pos">Measured constructs (LLM)</div>
          <ul className="space-y-1.5">
            {constructs.map(r => (
              <li key={r.name} className="grid grid-cols-[200px_minmax(0,1fr)_50px] items-center gap-2 text-[11.5px]">
                <span className="text-subtle">{r.name}</span>
                <span className="block h-2.5 rounded" style={{ width: `${r.val * 100}%`, background: C.green, opacity: 0.85 }} />
                <span className="text-right tabular-nums font-mono text-body">{r.val.toFixed(2)}</span>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-[10.5px] italic text-muted">Multiple constructs, each with a managerial implication.</p>
        </div>
      </div>
      <p className="mt-3 text-[11px] text-muted">
        VADER tells you the tweet is somewhat negative. The construct view tells you the customer feels <em>betrayed</em>, mourns the brand's independence, and is questioning loyalty. Those are different conversations.
      </p>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* 19.3 — GabrielPrimitives                                              */
/* ------------------------------------------------------------------ */

export function GabrielPrimitives() {
  const cells = [
    { name: 'rate', color: C.blue, sub: 'score 0–100 on attributes', ex: '"how savory?" → 78' },
    { name: 'classify', color: C.green, sub: 'assign labels', ex: 'billing / delivery / app' },
    { name: 'extract', color: C.purple, sub: 'pull structured fields', ex: 'CEO, year, country' },
    { name: 'discover', color: C.amber, sub: 'find what discriminates groups', ex: '5⋆ vs 1⋆ vocabulary' },
    { name: 'debias', color: C.red, sub: 'remove shortcut inference', ex: 'measure construct, strip cue' },
  ];
  return (
    <Card title="The measurement primitives — a vocabulary, not just a library">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-5">
        {cells.map(c => (
          <div key={c.name} className="rounded-md border border-border p-3">
            <div className="flex items-center gap-2">
              <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: c.color }} />
              <span className="font-mono text-[12px] font-semibold text-body">{c.name}</span>
            </div>
            <div className="mt-1 text-[11px] text-subtle">{c.sub}</div>
            <div className="mt-1.5 text-[10.5px] italic text-muted">{c.ex}</div>
          </div>
        ))}
      </div>
      <p className="mt-3 text-[11px] text-muted">
        The primitives are language for what an analyst would do after reading a stack of documents. The library is one implementation; the pattern travels.
      </p>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* 19.3 — MeasurementCostChart                                           */
/* ------------------------------------------------------------------ */

export function MeasurementCostChart() {
  const W = 720;
  const H = 240;
  const m = { left: 130, right: 60, top: 24, bottom: 40 };
  const innerW = W - m.left - m.right;
  const innerH = H - m.top - m.bottom;
  const rows = [
    { label: 'Human annotators', val: 2600, color: C.red },
    { label: 'GPT-5', val: 3.46, color: C.purple },
    { label: 'GPT-5-mini', val: 0.69, color: C.blue },
    { label: 'GPT-5-nano', val: 0.14, color: C.green },
  ];
  // log scale because 2600 vs 0.14 dwarfs the others
  const logMin = Math.log10(0.05);
  const logMax = Math.log10(3000);
  const xS = (v: number) => m.left + ((Math.log10(v) - logMin) / (logMax - logMin)) * innerW;
  const rowH = innerH / rows.length;
  return (
    <Card title="Cost of rating 240 documents on 10 attributes (log scale)">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Bar chart comparing measurement cost on a log scale.">
        <line x1={m.left} y1={m.top} x2={m.left} y2={H - m.bottom} stroke={C.ink} strokeWidth={1} />
        <line x1={m.left} y1={H - m.bottom} x2={W - m.right} y2={H - m.bottom} stroke={C.ink} strokeWidth={1} />
        {[0.1, 1, 10, 100, 1000].map(v => (
          <g key={v}>
            <line x1={xS(v)} y1={m.top} x2={xS(v)} y2={H - m.bottom} stroke={C.grid} strokeWidth={1} />
            <text x={xS(v)} y={H - m.bottom + 14} textAnchor="middle" className="fill-muted text-[10px]">{`$${v < 1 ? v : v.toString()}`}</text>
          </g>
        ))}
        {rows.map((r, i) => {
          const y = m.top + rowH * i + 6;
          const barX = xS(r.val);
          return (
            <g key={r.label}>
              <text x={m.left - 8} y={y + rowH / 2 + 4} textAnchor="end" className="fill-body text-[12px] font-medium">{r.label}</text>
              <rect x={m.left} y={y} width={barX - m.left} height={rowH - 12} rx={3} fill={r.color} opacity={0.85} />
              <text x={barX + 6} y={y + rowH / 2 + 4} className="fill-subtle text-[11px] tabular-nums">{`$${r.val.toLocaleString()}`}</text>
            </g>
          );
        })}
        <text x={(m.left + W - m.right) / 2} y={H - 6} textAnchor="middle" className="fill-subtle text-[11px]">Total cost (USD, log axis)</text>
      </svg>
      <p className="mt-2 text-[11px] text-muted">
        Source: Asirvatham, Mokski &amp; Shleifer (2026). Human annotation costs roughly 700–17,000× as much as a frontier LLM. Cheap measurement reshapes which research questions are answerable at all.
      </p>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* 22.1 — ValidationLabSchematic                                         */
/* ------------------------------------------------------------------ */

export function ValidationLabSchematic() {
  const methods = [
    { name: 'Dictionary (VADER)', color: C.amber, kind: 'rule-based', wins: 'transparent, cheap, fast', loses: 'sarcasm, negation, domain idiom' },
    { name: 'BERT classifier', color: C.blue, kind: 'fine-tuned model', wins: 'good on standard sentiment', loses: 'needs labelled data per task' },
    { name: 'GPT measurement', color: C.green, kind: 'LLM-as-measurer', wins: 'arbitrary constructs, zero-shot', loses: 'cost, hallucination, shortcut bias' },
  ];
  const cases = [
    { row: 'Plain positive review', d: 'P', b: 'P', g: 'P', truth: 'P' },
    { row: 'Sarcastic praise', d: 'P', b: 'N', g: 'N', truth: 'N' },
    { row: 'Mixed (food good, wait bad)', d: 'N', b: 'M', g: 'M', truth: 'M' },
    { row: 'Cold-brew (polysemy)', d: 'N', b: 'P', g: 'P', truth: 'P' },
    { row: 'Domain idiom ("killing me")', d: 'N', b: 'N', g: 'M', truth: 'M' },
    { row: 'Subtle disappointment', d: 'P', b: 'P', g: 'N', truth: 'N' },
  ];
  const cell = (v: string, truth: string) => {
    const correct = v === truth;
    return (
      <td
        className="px-2 py-1.5 text-center font-mono text-[11.5px]"
        style={{
          background: correct ? 'rgba(15,118,110,0.15)' : 'rgba(220,38,38,0.18)',
          color: correct ? '#065f46' : '#7f1d1d',
        }}
      >
        {v}
      </td>
    );
  };
  return (
    <Card title="Side-by-side validation — three methods, six tricky cases, one ground truth">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {methods.map(m => (
          <div key={m.name} className="rounded-md border border-border p-3">
            <div className="flex items-center gap-2">
              <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: m.color }} />
              <span className="text-[12px] font-semibold text-body">{m.name}</span>
            </div>
            <div className="mt-0.5 text-[10px] uppercase tracking-wide text-muted">{m.kind}</div>
            <div className="mt-1.5 text-[11px] text-pos"><strong>+</strong> {m.wins}</div>
            <div className="mt-0.5 text-[11px] text-neg"><strong>−</strong> {m.loses}</div>
          </div>
        ))}
      </div>
      <div className="mt-3 overflow-hidden rounded-md border border-border">
        <table className="w-full">
          <thead>
            <tr className="bg-code-bg text-[10px] uppercase tracking-wide text-muted">
              <th className="px-2 py-1.5 text-left">Case</th>
              <th className="px-2 py-1.5 text-center">VADER</th>
              <th className="px-2 py-1.5 text-center">BERT</th>
              <th className="px-2 py-1.5 text-center">GPT</th>
              <th className="px-2 py-1.5 text-center">Ground truth</th>
            </tr>
          </thead>
          <tbody>
            {cases.map((c, i) => (
              <tr key={c.row} className={i % 2 === 0 ? 'bg-surface' : 'bg-code-bg/40'}>
                <td className="px-2 py-1.5 text-[11.5px] italic text-subtle">{c.row}</td>
                {cell(c.d, c.truth)}
                {cell(c.b, c.truth)}
                {cell(c.g, c.truth)}
                <td className="px-2 py-1.5 text-center font-mono text-[11.5px] font-semibold text-body">{c.truth}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-[11px] text-muted">
        The point isn't that one method "wins" — it's that <em>error structures differ</em>. Knowing where each method fails is the most important thing for a manager choosing between them.
      </p>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* 22.1 — AIEvalRubric                                                   */
/* ------------------------------------------------------------------ */

export function AIEvalRubric() {
  const dims = [
    { name: 'Accuracy', q: 'Is the output correct on benchmarks we trust?', color: C.blue },
    { name: 'Grounding', q: 'Is each claim supported by a cited source?', color: C.green },
    { name: 'Relevance', q: 'Does it answer the question that was asked?', color: C.teal },
    { name: 'Consistency', q: 'Does it behave the same way on similar inputs?', color: C.purple },
    { name: 'Safety', q: 'Could the output cause harm if acted on?', color: C.red },
    { name: 'Bias', q: 'Are errors uneven across groups or contexts?', color: C.amber },
    { name: 'Privacy', q: 'Is sensitive data leaking in or out?', color: C.orange },
    { name: 'Business value', q: 'Does it improve a decision or reduce a cost?', color: C.green },
  ];
  return (
    <Card title="Eight evaluation dimensions every AI workflow review should cover">
      <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
        {dims.map(d => (
          <div key={d.name} className="rounded-md border border-border p-2.5">
            <div className="flex items-center gap-2">
              <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: d.color }} />
              <span className="text-[12px] font-semibold text-body">{d.name}</span>
            </div>
            <div className="mt-0.5 text-[11px] text-subtle">{d.q}</div>
          </div>
        ))}
      </div>
      <p className="mt-3 text-[11px] text-muted">
        Accuracy alone is incomplete. A workflow that answers correctly with no grounding, or correctly only for some users, is not yet shippable.
      </p>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* 22.1 — RiskControlMap                                                 */
/* ------------------------------------------------------------------ */

export function RiskControlMap() {
  const risks = [
    { name: 'Hallucination', likelihood: 0.7, severity: 0.6, control: 'RAG + citation-required prompts' },
    { name: 'Prompt injection', likelihood: 0.4, severity: 0.85, control: 'input filtering + tool allow-lists' },
    { name: 'PII leakage', likelihood: 0.3, severity: 0.95, control: 'redaction + retention policy' },
    { name: 'IP / copyright', likelihood: 0.5, severity: 0.7, control: 'source provenance + counsel review' },
    { name: 'Bias amplification', likelihood: 0.55, severity: 0.75, control: 'segment-level eval + holdouts' },
    { name: 'Over-automation', likelihood: 0.7, severity: 0.55, control: 'human-approval gates' },
    { name: 'Model drift', likelihood: 0.65, severity: 0.4, control: 'monitoring + retraining cadence' },
    { name: 'Eval gaps', likelihood: 0.6, severity: 0.6, control: 'red-team + golden sets' },
  ];
  const W = 720;
  const H = 320;
  const m = { left: 50, right: 220, top: 30, bottom: 40 };
  const innerW = W - m.left - m.right;
  const innerH = H - m.top - m.bottom;
  const xS = (v: number) => m.left + v * innerW;
  const yS = (v: number) => m.top + innerH - v * innerH;
  return (
    <Card title="Risk-control map — likelihood × severity, with the mitigating control">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Risk scatter with likelihood on x, severity on y, and a side panel listing controls.">
        {/* danger zone shading */}
        <rect x={xS(0.5)} y={m.top} width={xS(1) - xS(0.5)} height={yS(0.5) - m.top} fill={C.redLight} opacity={0.45} />
        <rect x={m.left} y={m.top} width={xS(0.5) - m.left} height={yS(0.5) - m.top} fill={C.amberLight} opacity={0.4} />
        <rect x={xS(0.5)} y={yS(0.5)} width={xS(1) - xS(0.5)} height={H - m.bottom - yS(0.5)} fill={C.amberLight} opacity={0.4} />
        <rect x={m.left} y={yS(0.5)} width={xS(0.5) - m.left} height={H - m.bottom - yS(0.5)} fill={C.greenLight} opacity={0.4} />
        {/* axes */}
        <line x1={m.left} y1={m.top} x2={m.left} y2={H - m.bottom} stroke={C.ink} strokeWidth={1} />
        <line x1={m.left} y1={H - m.bottom} x2={W - m.right} y2={H - m.bottom} stroke={C.ink} strokeWidth={1} />
        {risks.map(r => (
          <g key={r.name}>
            <circle cx={xS(r.likelihood)} cy={yS(r.severity)} r={6} fill={C.purple} opacity={0.85} />
            <text x={xS(r.likelihood) + 7} y={yS(r.severity) + 3} className="fill-subtle text-[9.5px]">{r.name}</text>
          </g>
        ))}
        {[0, 0.5, 1].map(v => (
          <g key={v}>
            <text x={xS(v)} y={H - m.bottom + 14} textAnchor="middle" className="fill-muted text-[10px]">{v === 0 ? 'rare' : v === 0.5 ? 'possible' : 'frequent'}</text>
            <text x={m.left - 8} y={yS(v) + 3} textAnchor="end" className="fill-muted text-[10px]">{v === 0 ? 'mild' : v === 0.5 ? 'serious' : 'catastrophic'}</text>
          </g>
        ))}
        <text x={(m.left + W - m.right) / 2} y={H - 6} textAnchor="middle" className="fill-subtle text-[11px]">Likelihood →</text>
        <text x={14} y={(m.top + H - m.bottom) / 2} transform={`rotate(-90 14 ${(m.top + H - m.bottom) / 2})`} textAnchor="middle" className="fill-subtle text-[11px]">Severity ↑</text>
        {/* control sidebar */}
        <g transform={`translate(${W - m.right + 10},${m.top - 4})`}>
          <rect x={0} y={0} width={195} height={innerH + 8} rx={6} fill="white" stroke={C.grid} />
          <text x={10} y={16} className="fill-body text-[10.5px] font-semibold uppercase tracking-wide">Mitigating controls</text>
          {risks.slice(0, 6).map((r, i) => (
            <g key={r.name}>
              <text x={10} y={32 + i * 22} className="fill-subtle text-[9.5px] font-semibold">{r.name}</text>
              <text x={10} y={42 + i * 22} className="fill-muted text-[9px]">{r.control}</text>
            </g>
          ))}
        </g>
      </svg>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* 22.1 — AIWorkflowCard                                                 */
/* ------------------------------------------------------------------ */

export function AIWorkflowCard() {
  const rows = [
    { k: 'Workflow name', v: 'BB-Voice-of-Customer-2026Q2' },
    { k: 'Intended use', v: 'Surface emerging complaint themes weekly; route urgent tickets; draft executive summary.' },
    { k: 'Inputs', v: 'App reviews, support tickets, social posts (last 7 days).' },
    { k: 'Components', v: 'Classification (§18.4) + topic model (§18.5) + embedding cluster (§19.2) + LLM summary (§21.3) + agent (§21.4).' },
    { k: 'Human-in-the-loop', v: 'Manager approves alerts before they post to Slack; quarterly red-team review.' },
    { k: 'Evaluation cadence', v: 'Weekly golden-set scoring; monthly drift check; quarterly side-by-side with human ground truth.' },
    { k: 'Known failure modes', v: 'Sarcasm in social posts; non-English reviews; competitor mentions misclassified as own brand.' },
    { k: 'Privacy', v: 'No raw customer PII passed to external LLM; redaction step before prompt assembly.' },
    { k: 'Escalation path', v: 'Workflow owner on-call; legal review for any external publication.' },
    { k: 'Owner', v: 'Customer Insights, Bean &amp; Basket Coffee.' },
  ];
  return (
    <Card title="The AI workflow card — one page, every shipped workflow">
      <div className="overflow-hidden rounded-md border border-border">
        <table className="w-full text-[12px]">
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.k} className={i % 2 === 0 ? 'bg-code-bg' : 'bg-surface'}>
                <th className="w-[170px] px-3 py-1.5 text-left align-top font-semibold text-subtle">{r.k}</th>
                <td className="px-3 py-1.5 text-subtle" dangerouslySetInnerHTML={{ __html: r.v }} />
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-[11px] text-muted">
        Without this card, the workflow is a research artefact. With it, it's infrastructure with an owner.
      </p>
    </Card>
  );
}
