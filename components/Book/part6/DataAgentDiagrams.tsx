'use client';

import * as React from 'react';

/**
 * Visuals for §17.2 (Text-to-SQL & the semantic layer) and §17.3 (automated
 * predictive workflows).
 *
 *   - TextToSqlFlow: NL question -> semantic layer -> candidate SQL -> execute -> self-correct.
 *   - SqlAccuracyChart: execution accuracy across Spider/BIRD/Spider 2.0 vs the human baseline.
 *   - SemanticLayerDiagram: the semantic layer as the contract between agents/BI and the warehouse.
 *   - PredictiveAgentLoop: the monitor -> drift -> retrain -> approve -> deploy loop.
 *   - DsAgentScorecard: how far data-science agents are from experts, by benchmark.
 *
 * All numbers shown are sourced and cited in the article prose; the components
 * are illustrative.
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
/* §17.2 — TextToSqlFlow                                                */
/* ------------------------------------------------------------------ */

export function TextToSqlFlow() {
  const W = 820;
  const H = 300;
  const steps = [
    { x: 24, label: 'Question', sub: '"revenue by city,\nlast quarter"', color: C.slate100, textColor: C.ink },
    { x: 186, label: 'Schema + semantic layer', sub: 'tables, joins,\ncertified metrics', color: C.tealLight, textColor: C.teal },
    { x: 360, label: 'Generate candidates', sub: 'decompose · multiple\nSQL drafts', color: C.skyLight, textColor: C.sky },
    { x: 534, label: 'Execute & check', sub: 'run · read errors ·\nvalidate', color: C.amberLight, textColor: C.amber },
    { x: 708, label: 'Answer', sub: 'table · chart ·\nexplanation', color: C.greenLight, textColor: C.green },
  ];
  return (
    <Card title="How a text-to-SQL agent actually answers a question">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="A pipeline from a natural-language question through the semantic layer, candidate SQL generation, execution and self-correction, to a verified answer.">
        {steps.map((s, i) => (
          <g key={s.label}>
            <rect x={s.x} y={90} width={112} height={84} rx={10} fill={s.color} stroke={s.textColor} strokeWidth={1.4} />
            <text x={s.x + 56} y={116} textAnchor="middle" className="text-[11px] font-semibold" fill={s.textColor}>
              {s.label.length > 16 ? s.label.split(' ').slice(0, 2).join(' ') : s.label}
            </text>
            {s.label.length > 16 && (
              <text x={s.x + 56} y={130} textAnchor="middle" className="text-[11px] font-semibold" fill={s.textColor}>{s.label.split(' ').slice(2).join(' ')}</text>
            )}
            {s.sub.split('\n').map((line, k) => (
              <text key={k} x={s.x + 56} y={(s.label.length > 16 ? 148 : 138) + k * 12} textAnchor="middle" className="text-[8.5px]" fill={C.muted}>{line}</text>
            ))}
            {i < steps.length - 1 && (
              <line x1={s.x + 112} y1={132} x2={steps[i + 1].x} y2={132} stroke={C.muted} strokeWidth={1.5} markerEnd="url(#tts-arrow)" />
            )}
          </g>
        ))}
        {/* self-correction loop from execute back to generate */}
        <path d={`M 590 174 Q 590 235 460 235 Q 416 235 416 176`} fill="none" stroke={C.red} strokeWidth={1.4} strokeDasharray="5 4" markerEnd="url(#tts-arrow-red)" />
        <text x={503} y={252} textAnchor="middle" className="text-[10px] italic" fill={C.red}>self-correct: &ldquo;no such column&rdquo; → revise and retry</text>
        {/* governance note under semantic layer */}
        <text x={242} y={210} textAnchor="middle" className="text-[9px]" fill={C.teal}>↑ enforces RBAC, masking, and the firm&rsquo;s metric definitions</text>
        <defs>
          <marker id="tts-arrow" markerWidth="9" markerHeight="9" refX="7" refY="3" orient="auto" markerUnits="strokeWidth">
            <path d="M0,0 L0,6 L8,3 z" fill={C.muted} />
          </marker>
          <marker id="tts-arrow-red" markerWidth="9" markerHeight="9" refX="7" refY="3" orient="auto" markerUnits="strokeWidth">
            <path d="M0,0 L0,6 L8,3 z" fill={C.red} />
          </marker>
        </defs>
      </svg>
      <p className="mt-1 text-[11px] leading-relaxed text-slate-500">
        The accuracy gains of the last two years come less from a smarter model than from this scaffolding: grounding the question in a
        governed semantic layer, generating several candidate queries, and letting the database&rsquo;s own error messages drive correction.
      </p>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* §17.2 — SqlAccuracyChart                                             */
/* ------------------------------------------------------------------ */

export function SqlAccuracyChart() {
  const rows = [
    { label: 'Spider 1.0 (sanitized academic DBs)', value: 91.2, color: C.teal },
    { label: 'BIRD — best system', value: 81.95, color: C.sky },
    { label: 'Spider 2.0 — best agent (enterprise DBs)', value: 21.3, color: C.amber },
    { label: 'Spider 2.0 — GPT-4o baseline', value: 10.1, color: C.red },
  ];
  const human = 92.96;
  const W = 760;
  const rowH = 46;
  const top = 18;
  const left = 250;
  const right = 40;
  const plotW = W - left - right;
  const H = top + rows.length * rowH + 46;
  const x = (v: number) => left + (v / 100) * plotW;
  return (
    <Card title="Execution accuracy: from solved benchmark to open problem">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Bar chart of text-to-SQL execution accuracy across benchmarks, with a dashed human-expert baseline at 92.96 percent.">
        {/* gridlines */}
        {[0, 25, 50, 75, 100].map((g) => (
          <g key={g}>
            <line x1={x(g)} y1={top} x2={x(g)} y2={top + rows.length * rowH} stroke={C.grid} strokeWidth={1} />
            <text x={x(g)} y={top + rows.length * rowH + 16} textAnchor="middle" className="text-[9px]" fill={C.muted}>{g}%</text>
          </g>
        ))}
        {/* bars */}
        {rows.map((r, i) => {
          const y = top + i * rowH + 8;
          return (
            <g key={r.label}>
              <text x={left - 10} y={y + 16} textAnchor="end" className="text-[10.5px]" fill={C.ink}>{r.label}</text>
              <rect x={left} y={y} width={x(r.value) - left} height={22} rx={3} fill={r.color} />
              <text x={x(r.value) + 6} y={y + 16} className="text-[10.5px] font-semibold" fill={r.color}>{r.value}%</text>
            </g>
          );
        })}
        {/* human baseline */}
        <line x1={x(human)} y1={top - 4} x2={x(human)} y2={top + rows.length * rowH + 2} stroke={C.ink} strokeWidth={1.5} strokeDasharray="4 3" />
        <text x={x(human)} y={top - 8} textAnchor="middle" className="text-[9.5px] font-semibold" fill={C.ink}>human expert {human}%</text>
      </svg>
      <p className="mt-2 text-[11px] leading-relaxed text-slate-500">
        On clean academic schemas the problem looks nearly solved. On <em>real</em> enterprise databases — thousands of columns, vendor
        dialects, ambiguous business terms — the best agents still solve only about a fifth of the tasks. The gap between these two bars is
        the whole story.
      </p>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* §17.2 — SemanticLayerDiagram                                         */
/* ------------------------------------------------------------------ */

export function SemanticLayerDiagram() {
  return (
    <Card title="The semantic layer — the contract between language and SQL">
      <div className="grid items-stretch gap-3 sm:grid-cols-[1fr_auto_1.1fr_auto_1fr]">
        {/* consumers */}
        <div className="flex flex-col justify-center gap-2 rounded-md border border-slate-200 bg-slate-50/70 p-3">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Who asks</p>
          {['AI data agent', 'BI dashboard', 'Analyst in chat'].map((t) => (
            <span key={t} className="rounded border border-slate-300 bg-white px-2 py-1 text-[11px] text-slate-700">{t}</span>
          ))}
        </div>
        <div className="hidden items-center justify-center text-slate-400 sm:flex">→</div>
        {/* semantic layer */}
        <div className="flex flex-col justify-center rounded-md border-2 border-teal-300 bg-teal-50/60 p-3">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-teal-700">Semantic layer</p>
          <p className="mt-1 text-[11.5px] leading-snug text-slate-700">
            Certified <strong>metric definitions</strong>, join paths, and access rules. One place where &ldquo;revenue&rdquo; means one thing.
          </p>
          <div className="mt-2 flex flex-wrap gap-1">
            {['net_revenue', 'active_user', 'churn_rate'].map((m) => (
              <span key={m} className="rounded bg-white px-1.5 py-0.5 font-mono text-[9.5px] text-teal-800 ring-1 ring-inset ring-teal-200">{m}</span>
            ))}
          </div>
        </div>
        <div className="hidden items-center justify-center text-slate-400 sm:flex">→</div>
        {/* warehouse */}
        <div className="flex flex-col justify-center gap-2 rounded-md border border-slate-200 bg-slate-50/70 p-3">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Where data lives</p>
          {['Warehouse tables', 'Raw columns', 'Row/column security'].map((t) => (
            <span key={t} className="rounded border border-slate-300 bg-white px-2 py-1 text-[11px] text-slate-700">{t}</span>
          ))}
        </div>
      </div>
      <div className="mt-3 rounded-md border border-sky-200 bg-sky-50/60 px-3 py-2 text-[11.5px] text-sky-900">
        Routed through a semantic model, one vendor&rsquo;s text-to-SQL jumped from <strong>51%</strong> (a raw model on bare tables) to
        <strong> 90%+</strong> accuracy on real BI questions. The model didn&rsquo;t change — the context did.
      </div>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* §17.3 — PredictiveAgentLoop                                          */
/* ------------------------------------------------------------------ */

export function PredictiveAgentLoop() {
  const W = 760;
  const H = 300;
  const cx = W / 2;
  const cy = 142;
  const rx = 250;
  const ry = 96;
  const nodes = [
    { a: -90, label: 'Train', sub: 'fit / refit', color: C.blue },
    { a: -18, label: 'Deploy', sub: 'canary rollout', color: C.teal },
    { a: 54, label: 'Monitor', sub: 'live metrics', color: C.green },
    { a: 126, label: 'Detect drift', sub: 'KS · PSI tests', color: C.amber },
    { a: 198, label: 'Decide', sub: 'retrain? alert?', color: C.red },
  ];
  const pt = (a: number) => {
    const rad = (a * Math.PI) / 180;
    return { x: cx + rx * Math.cos(rad), y: cy + ry * Math.sin(rad) };
  };
  return (
    <Card title="The predictive loop, now agent-driven">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="A closed loop: train, deploy, monitor, detect drift, decide, with a human approval gate before retraining, on a durable-execution substrate.">
        {/* orbit */}
        <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="none" stroke={C.grid} strokeWidth={1.4} strokeDasharray="4 4" />
        {/* directional arrows along orbit */}
        {nodes.map((n, i) => {
          const next = nodes[(i + 1) % nodes.length];
          const mid = pt((n.a + (((next.a - n.a + 360) % 360) / 2)) % 360);
          return <circle key={`d${i}`} cx={mid.x} cy={mid.y} r={2.4} fill={C.muted} />;
        })}
        {/* center */}
        <rect x={cx - 92} y={cy - 26} width={184} height={52} rx={10} fill={C.slate50} stroke={C.violet} strokeWidth={1.5} />
        <text x={cx} y={cy - 5} textAnchor="middle" className="text-[11.5px] font-semibold" fill={C.violet}>Agent + durable execution</text>
        <text x={cx} y={cy + 12} textAnchor="middle" className="text-[9px]" fill={C.muted}>survives crashes · runs for days · resumes</text>
        {/* nodes */}
        {nodes.map((n) => {
          const p = pt(n.a);
          return (
            <g key={n.label}>
              <rect x={p.x - 52} y={p.y - 20} width={104} height={40} rx={8} fill="white" stroke={n.color} strokeWidth={1.5} />
              <text x={p.x} y={p.y - 2} textAnchor="middle" className="text-[11px] font-semibold" fill={n.color}>{n.label}</text>
              <text x={p.x} y={p.y + 12} textAnchor="middle" className="text-[8.5px]" fill={C.muted}>{n.sub}</text>
            </g>
          );
        })}
        {/* human gate badge on Decide -> Train edge */}
        <g>
          <rect x={cx - 150} y={H - 34} width={300} height={26} rx={13} fill={C.amberLight} stroke={C.amber} strokeWidth={1.3} />
          <text x={cx} y={H - 17} textAnchor="middle" className="text-[10.5px] font-medium" fill={C.amber}>human approves promotion before a new model goes live</text>
        </g>
      </svg>
      <p className="mt-1 text-[11px] leading-relaxed text-slate-500">
        The loop itself is the same one Part IV deployed by hand. What is new is that an agent can run every station — watch the metrics,
        run the drift tests, retrain, and stage a canary — while a human stays &ldquo;above the loop,&rdquo; approving the promotions that matter.
      </p>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* §17.3 — DsAgentScorecard                                             */
/* ------------------------------------------------------------------ */

export function DsAgentScorecard() {
  const rows = [
    { bench: 'MLE-bench', task: 'Win a Kaggle medal (best agent, 1 try)', value: 16.9, best: 'o1-preview + AIDE', color: C.red },
    { bench: 'MLE-bench', task: 'Win a Kaggle medal (8 tries)', value: 34.1, best: 'o1-preview + AIDE', color: C.amber },
    { bench: 'DSBench', task: 'Solve a realistic data-analysis task', value: 34.1, best: 'best agent', color: C.amber },
    { bench: 'BixBench', task: 'Open-answer bioinformatics analysis', value: 17, best: 'Claude 3.5 Sonnet', color: C.red },
    { bench: 'InfiAgent-DABench', task: 'Closed-form analysis question', value: 74.6, best: 'GPT-4', color: C.teal },
    { bench: 'GDPval', task: 'Match/beat an expert on real knowledge work', value: 47.6, best: 'Claude Opus 4.1', color: C.sky },
  ];
  return (
    <Card title="How far are data-science agents from experts? It depends on the task">
      <div className="space-y-2">
        {rows.map((r, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-[44px] shrink-0 text-right">
              <span className="font-mono text-[13px] font-bold" style={{ color: r.color }}>{r.value}%</span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-2">
                <span className="truncate text-[12px] text-slate-700">{r.task}</span>
                <span className="hidden shrink-0 font-mono text-[10px] text-slate-400 sm:inline">{r.bench}</span>
              </div>
              <div className="mt-1 h-2 w-full overflow-hidden rounded-sm bg-slate-100">
                <div className="h-full rounded-sm" style={{ width: `${r.value}%`, background: r.color }} />
              </div>
            </div>
          </div>
        ))}
      </div>
      <p className="mt-3 text-[11px] leading-relaxed text-slate-500">
        These benchmarks measure different things, so the bars are not directly comparable — but the pattern is clear. On narrow,
        closed-form questions, agents are strong; on open-ended, end-to-end modeling work, they still trail experts by a wide margin.
        Benchmark wins are not the same as production reliability.
      </p>
    </Card>
  );
}
