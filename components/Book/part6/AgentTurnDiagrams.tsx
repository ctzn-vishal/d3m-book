'use client';

import * as React from 'react';

/**
 * Conceptual visuals for §17.1 "The Agentic Turn" (and reused in §17.6).
 *
 *   - WorkflowVsAgent: predefined code paths vs. a model that directs its own loop.
 *   - AgentAnatomy: the augmented-LLM core + the plan/act/observe/reflect control loop.
 *   - AutonomyLadder: five rungs of autonomy, from suggest to supervise to act.
 *   - AdoptionGap: the experiment-vs-scale gap in enterprise agent adoption.
 *
 * Visual language matches the rest of the book (slate ink, sky/teal accents,
 * white card, small captions). All figures are decorative SVG/HTML — the load-
 * bearing claims and their citations live in the article prose.
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
      {title && (
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</p>
      )}
      {children}
      {footer && <div className="mt-3 text-[11px] leading-relaxed text-slate-500">{footer}</div>}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* §17.1 — WorkflowVsAgent                                              */
/* ------------------------------------------------------------------ */

export function WorkflowVsAgent() {
  return (
    <Card title="Two ways to put a model to work">
      <div className="grid gap-3 sm:grid-cols-2">
        {/* Workflow */}
        <div className="rounded-md border border-slate-200 bg-slate-50/70 p-3.5">
          <div className="mb-2 flex items-center gap-2">
            <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: C.muted }} />
            <span className="text-[12px] font-semibold uppercase tracking-wide text-slate-600">Workflow</span>
          </div>
          <p className="mb-3 text-[12.5px] leading-relaxed text-slate-600">
            The developer fixes the steps in code. The model fills the blanks at each station.
          </p>
          <div className="flex items-center gap-1.5">
            {['Extract', 'Classify', 'Summarize', 'Route'].map((s, i, a) => (
              <React.Fragment key={s}>
                <span className="rounded border border-slate-300 bg-white px-2 py-1 text-[10.5px] font-medium text-slate-700">{s}</span>
                {i < a.length - 1 && <span className="text-slate-400">→</span>}
              </React.Fragment>
            ))}
          </div>
          <p className="mt-3 text-[11px] italic text-slate-500">Predictable, testable, bounded. The path never changes.</p>
        </div>
        {/* Agent */}
        <div className="rounded-md border border-sky-200 bg-sky-50/60 p-3.5">
          <div className="mb-2 flex items-center gap-2">
            <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: C.sky }} />
            <span className="text-[12px] font-semibold uppercase tracking-wide text-sky-700">Agent</span>
          </div>
          <p className="mb-3 text-[12.5px] leading-relaxed text-slate-600">
            The model chooses the next step, calls a tool, reads the result, and decides again — until the goal is met.
          </p>
          <div className="relative flex items-center justify-center gap-1.5">
            <span className="rounded-md border border-sky-300 bg-white px-2.5 py-1 text-[10.5px] font-semibold text-sky-800">Model decides</span>
            <span className="text-sky-400">⇄</span>
            <span className="rounded border border-sky-300 bg-white px-2 py-1 text-[10.5px] font-medium text-slate-700">Tool / environment</span>
          </div>
          <p className="mt-3 text-[11px] italic text-slate-500">Flexible and open-ended. The path is discovered at run time.</p>
        </div>
      </div>
      <p className="mt-3 text-[11px] leading-relaxed text-slate-500">
        Anthropic draws the line here: a <strong>workflow</strong> orchestrates the model through predefined code paths; an
        <strong> agent</strong> lets the model dynamically direct its own process and tool use. Both are &ldquo;agentic systems&rdquo; — the
        difference is who holds the steering wheel.
      </p>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* §17.1 — AgentAnatomy                                                 */
/* ------------------------------------------------------------------ */

export function AgentAnatomy() {
  const W = 820;
  const H = 380;
  const cx = 250;
  const cy = 175;
  return (
    <Card title="Anatomy of a data agent — an augmented model inside a control loop">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="A reasoning model surrounded by tools, memory, retrieval and planning, running a plan-act-observe-reflect loop with a human checkpoint.">
        {/* augmentation ring chips */}
        {[
          { label: 'Tools', sub: 'SQL · search · code', x: cx, y: cy - 128, color: C.blue },
          { label: 'Memory', sub: 'context · state', x: cx + 168, y: cy - 36, color: C.violet },
          { label: 'Retrieval', sub: 'docs · semantic layer', x: cx + 168, y: cy + 60, color: C.teal },
          { label: 'Planning', sub: 'decompose · reflect', x: cx, y: cy + 128, color: C.amber },
        ].map((a) => (
          <g key={a.label}>
            <line x1={cx} y1={cy} x2={a.x} y2={a.y} stroke={C.grid} strokeWidth={1.5} />
            <rect x={a.x - 70} y={a.y - 20} width={140} height={40} rx={8} fill="white" stroke={a.color} strokeWidth={1.5} />
            <text x={a.x} y={a.y - 3} textAnchor="middle" className="text-[11px] font-semibold" style={{ fill: a.color }}>{a.label}</text>
            <text x={a.x} y={a.y + 12} textAnchor="middle" className="text-[9px]" fill={C.muted}>{a.sub}</text>
          </g>
        ))}
        {/* core */}
        <circle cx={cx} cy={cy} r={62} fill={C.skyLight} stroke={C.sky} strokeWidth={2} />
        <text x={cx} y={cy - 6} textAnchor="middle" className="text-[13px] font-semibold" fill={C.ink}>Reasoning</text>
        <text x={cx} y={cy + 11} textAnchor="middle" className="text-[13px] font-semibold" fill={C.ink}>model</text>
        <text x={cx} y={cy + 28} textAnchor="middle" className="text-[9px] italic" fill={C.muted}>LLM core</text>

        {/* loop on the right */}
        <g>
          <text x={640} y={36} textAnchor="middle" className="text-[10px] uppercase tracking-wide" fill={C.muted}>the loop, each turn</text>
          {[
            { label: '1 · Plan', y: 60, color: C.amber },
            { label: '2 · Act (call a tool)', y: 110, color: C.blue },
            { label: '3 · Observe result', y: 160, color: C.teal },
            { label: '4 · Reflect', y: 210, color: C.violet },
          ].map((s) => (
            <g key={s.label}>
              <rect x={540} y={s.y} width={200} height={36} rx={8} fill="white" stroke={s.color} strokeWidth={1.5} />
              <text x={640} y={s.y + 23} textAnchor="middle" className="text-[11.5px] font-medium" fill={C.ink}>{s.label}</text>
            </g>
          ))}
          {/* down arrows */}
          {[96, 146, 196].map((y) => (
            <line key={y} x1={640} y1={y} x2={640} y2={y + 14} stroke={C.muted} strokeWidth={1.4} markerEnd="url(#aa-arrow)" />
          ))}
          {/* loop-back */}
          <path d={`M 740 228 Q 790 228 790 150 Q 790 78 742 78`} fill="none" stroke={C.muted} strokeWidth={1.4} strokeDasharray="5 4" markerEnd="url(#aa-arrow)" />
          <text x={800} y={150} className="text-[9px] italic" fill={C.muted} transform="rotate(90 800 150)">repeat until done</text>
          {/* stop / human gate */}
          <rect x={540} y={262} width={200} height={40} rx={8} fill={C.greenLight} stroke={C.green} strokeWidth={1.6} />
          <text x={640} y={279} textAnchor="middle" className="text-[11px] font-semibold" fill={C.green}>Stop · answer · log</text>
          <text x={640} y={293} textAnchor="middle" className="text-[9px]" fill={C.muted}>or pause for a human checkpoint</text>
          <line x1={640} y1={246} x2={640} y2={260} stroke={C.muted} strokeWidth={1.4} markerEnd="url(#aa-arrow)" />
        </g>

        {/* connect core to loop */}
        <line x1={cx + 62} y1={cy} x2={540} y2={150} stroke={C.grid} strokeWidth={1.5} strokeDasharray="4 4" />
        <text x={420} y={140} textAnchor="middle" className="text-[9px] italic" fill={C.muted}>drives</text>

        <defs>
          <marker id="aa-arrow" markerWidth="9" markerHeight="9" refX="7" refY="3" orient="auto" markerUnits="strokeWidth">
            <path d="M0,0 L0,6 L8,3 z" fill={C.muted} />
          </marker>
        </defs>
      </svg>
      <p className="mt-1 text-[11px] leading-relaxed text-slate-500">
        The core is a language model <em>augmented</em> with tools, memory, retrieval, and planning. What makes it an agent is the loop:
        it acts on the world, reads the result back as ground truth, and decides what to do next — stopping when the goal is met or when a
        human is asked to approve.
      </p>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* §17.1 — AutonomyLadder                                               */
/* ------------------------------------------------------------------ */

export function AutonomyLadder() {
  const rungs = [
    { n: 1, label: 'Assist', who: 'Human does the work; model suggests', color: C.slate100, text: C.muted, fill: 0.2 },
    { n: 2, label: 'Draft', who: 'Model proposes; human edits and runs', color: C.skyLight, text: C.sky, fill: 0.4 },
    { n: 3, label: 'Act-with-approval', who: 'Model executes after a human gate', color: C.tealLight, text: C.teal, fill: 0.6 },
    { n: 4, label: 'Supervised autonomy', who: 'Model runs the loop; human monitors', color: C.amberLight, text: C.amber, fill: 0.8 },
    { n: 5, label: 'Delegated autonomy', who: 'Model owns the task end to end', color: C.redLight, text: C.red, fill: 1.0 },
  ];
  return (
    <Card title="Levels of autonomy — the dial a manager actually sets">
      <div className="space-y-1.5">
        {rungs.map((r) => (
          <div key={r.n} className="flex items-center gap-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[12px] font-bold" style={{ background: r.color, color: r.text }}>{r.n}</span>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-[13px] font-semibold text-slate-800">{r.label}</span>
                <span className="hidden text-[11px] text-slate-500 sm:inline">{r.who}</span>
              </div>
              <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full" style={{ width: `${r.fill * 100}%`, background: r.text }} />
              </div>
              <span className="mt-0.5 block text-[11px] text-slate-500 sm:hidden">{r.who}</span>
            </div>
          </div>
        ))}
      </div>
      <p className="mt-3 text-[11px] leading-relaxed text-slate-500">
        Autonomy is not a property of the model — it is a setting the deploying team chooses, co-determined by the model, the human
        oversight around it, and the product design. The same model can sit at rung 2 for a pricing change and rung 4 for a routine
        data refresh.
      </p>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* §17.1 / §17.6 — AdoptionGap                                          */
/* ------------------------------------------------------------------ */

export function AdoptionGap() {
  const bars = [
    { label: 'Using AI regularly', value: 88, color: C.teal, note: 'of organizations' },
    { label: 'At least experimenting with agents', value: 62, color: C.sky, note: 'of organizations' },
    { label: 'Scaling an agent in ≥1 function', value: 23, color: C.amber, note: 'of organizations' },
    { label: 'Scaling agents in any single function', value: 10, color: C.red, note: 'fewer than 10%' },
  ];
  return (
    <Card title="The experiment-to-scale gap (McKinsey, State of AI 2025)">
      <div className="space-y-2.5">
        {bars.map((b) => (
          <div key={b.label}>
            <div className="mb-1 flex items-baseline justify-between gap-2">
              <span className="text-[12px] text-slate-700">{b.label}</span>
              <span className="font-mono text-[12px] font-semibold" style={{ color: b.color }}>{b.value}%</span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-sm bg-slate-100">
              <div className="h-full rounded-sm" style={{ width: `${b.value}%`, background: b.color }} />
            </div>
          </div>
        ))}
      </div>
      <p className="mt-3 text-[11px] leading-relaxed text-slate-500">
        Almost everyone is trying agents; almost no one has them running the business yet. Gartner expects the same wave to thin out —
        more than 40% of agentic-AI projects are forecast to be canceled by the end of 2027 over cost, unclear value, and weak controls.
      </p>
    </Card>
  );
}
