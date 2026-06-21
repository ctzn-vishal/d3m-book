'use client';

import * as React from 'react';

/**
 * Visuals for §17.4 (MCP, tools, orchestration) and §17.5 (trust, evaluation,
 * governance).
 *
 *   - McpHub: one agent, many governed connections — the "USB-C for AI" picture.
 *   - AgentStack: the layered connection stack from tool use up to durable execution.
 *   - LethalTrifecta: the three-circle condition that makes a data agent unsafe.
 *   - GovernanceQuadrants: evaluate / observe / secure / govern, with real tools.
 *   - AgentTraceTree: an OpenTelemetry-style span tree for one agent run.
 *   - EuAiActTimeline: the phased EU AI Act rollout.
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
/* §17.4 — McpHub                                                       */
/* ------------------------------------------------------------------ */

export function McpHub() {
  const W = 760;
  const H = 320;
  const cx = W / 2;
  const cy = H / 2;
  const servers = [
    { label: 'Postgres', a: -150 },
    { label: 'Snowflake', a: -90 },
    { label: 'BigQuery', a: -30 },
    { label: 'GitHub', a: 30 },
    { label: 'Slack', a: 90 },
    { label: 'Filesystem', a: 150 },
  ];
  const R = 120;
  const pt = (a: number, r: number) => {
    const rad = (a * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  };
  return (
    <Card title="One protocol, many connections — MCP as the &ldquo;USB-C port for AI&rdquo;">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="An AI agent at the center connected through MCP to six servers: Postgres, Snowflake, BigQuery, GitHub, Slack, and a filesystem.">
        {servers.map((s) => {
          const outer = pt(s.a, R);
          const inner = pt(s.a, 52);
          return (
            <g key={s.label}>
              <line x1={inner.x} y1={inner.y} x2={outer.x} y2={outer.y} stroke={C.teal} strokeWidth={1.6} />
              <circle cx={(inner.x + outer.x) / 2} cy={(inner.y + outer.y) / 2} r={9} fill="white" stroke={C.teal} strokeWidth={1.2} />
              <text x={(inner.x + outer.x) / 2} y={(inner.y + outer.y) / 2 + 3} textAnchor="middle" className="text-[8px] font-semibold" fill={C.teal}>MCP</text>
              <rect x={outer.x - 50} y={outer.y - 16} width={100} height={32} rx={7} fill={C.slate50} stroke={C.slate100} strokeWidth={1.2} />
              <text x={outer.x} y={outer.y + 4} textAnchor="middle" className="text-[10.5px] font-medium" fill={C.ink}>{s.label}</text>
            </g>
          );
        })}
        {/* central agent */}
        <circle cx={cx} cy={cy} r={50} fill={C.skyLight} stroke={C.sky} strokeWidth={2} />
        <text x={cx} y={cy - 4} textAnchor="middle" className="text-[12px] font-semibold" fill={C.ink}>AI agent</text>
        <text x={cx} y={cy + 12} textAnchor="middle" className="text-[9px] italic" fill={C.muted}>MCP client</text>
      </svg>
      <p className="mt-1 text-[11px] leading-relaxed text-slate-500">
        Before MCP, every assistant needed a bespoke connector for every system — an <span className="font-mono text-[10px]">N×M</span> problem.
        A tool built once for MCP works across any MCP-speaking client. Open-sourced by Anthropic in November 2024, it was adopted by
        OpenAI, Google, and Microsoft within a year and moved under neutral foundation governance.
      </p>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* §17.4 — AgentStack                                                   */
/* ------------------------------------------------------------------ */

export function AgentStack() {
  const layers = [
    { label: 'Durable execution', sub: 'survives crashes, runs for days', eg: 'Temporal · Inngest · Vercel Workflow', color: C.violet },
    { label: 'Orchestration', sub: 'coordinates multi-step, multi-agent work', eg: 'LangGraph · OpenAI Agents SDK · ADK', color: C.blue },
    { label: 'Agent-to-agent (A2A)', sub: 'agents discover and delegate to each other', eg: 'A2A protocol (Linux Foundation)', color: C.teal },
    { label: 'Model Context Protocol (MCP)', sub: 'governed access to tools & data', eg: 'MCP servers (Postgres, Snowflake…)', color: C.green },
    { label: 'Tool use / function calling', sub: 'the model emits a structured call', eg: 'JSON-schema tool definitions', color: C.amber },
  ];
  return (
    <Card title="The connection stack under an agentic analytics system">
      <div className="space-y-1.5">
        {layers.map((l) => (
          <div key={l.label} className="flex items-stretch overflow-hidden rounded-md border border-slate-200">
            <div className="w-1.5 shrink-0" style={{ background: l.color }} />
            <div className="flex min-w-0 flex-1 flex-col justify-center bg-white px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <span className="text-[12.5px] font-semibold text-slate-800">{l.label}</span>
                <span className="ml-2 text-[11px] text-slate-500">{l.sub}</span>
              </div>
              <span className="mt-0.5 shrink-0 font-mono text-[10px] text-slate-400 sm:mt-0 sm:ml-3">{l.eg}</span>
            </div>
          </div>
        ))}
      </div>
      <p className="mt-3 text-[11px] leading-relaxed text-slate-500">
        Read bottom-up: a tool call is the atom; MCP standardizes how the agent reaches governed data; A2A lets agents collaborate;
        an orchestration framework sequences the work; and a durable-execution engine makes the whole thing survive the real world.
      </p>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* §17.5 — LethalTrifecta                                               */
/* ------------------------------------------------------------------ */

export function LethalTrifecta() {
  const W = 620;
  const H = 360;
  const r = 108;
  const cx = W / 2;
  const top = { x: cx, y: 132 };
  const left = { x: cx - 96, y: 230 };
  const right = { x: cx + 96, y: 230 };
  return (
    <Card title="The &ldquo;lethal trifecta&rdquo; — when a data agent is unsafe to run unsupervised">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Three overlapping circles: access to private data, exposure to untrusted content, and the ability to communicate externally. Their intersection is data exfiltration.">
        <circle cx={top.x} cy={top.y} r={r} fill={C.blueLight} stroke={C.blue} strokeWidth={1.6} opacity={0.55} />
        <circle cx={left.x} cy={left.y} r={r} fill={C.amberLight} stroke={C.amber} strokeWidth={1.6} opacity={0.55} />
        <circle cx={right.x} cy={right.y} r={r} fill={C.redLight} stroke={C.red} strokeWidth={1.6} opacity={0.55} />
        <text x={top.x} y={70} textAnchor="middle" className="text-[11.5px] font-semibold" fill={C.blue}>Access to private data</text>
        <text x={left.x - 30} y={H - 14} textAnchor="middle" className="text-[11.5px] font-semibold" fill={C.amber}>Untrusted content</text>
        <text x={right.x + 30} y={H - 14} textAnchor="middle" className="text-[11.5px] font-semibold" fill={C.red}>Can send data out</text>
        {/* center */}
        <text x={cx} y={196} textAnchor="middle" className="text-[11px] font-bold" fill={C.ink}>data</text>
        <text x={cx} y={210} textAnchor="middle" className="text-[11px] font-bold" fill={C.ink}>exfiltration</text>
      </svg>
      <p className="mt-1 text-[11px] leading-relaxed text-slate-500">
        Simon Willison&rsquo;s formulation: any one circle is fine; all three together let an attacker hide an instruction in data the agent
        reads, then have the agent fetch private records and ship them out. The defense is architectural — break one of the three circles —
        because guardrails alone do not reliably hold. Microsoft&rsquo;s 2025 &ldquo;EchoLeak&rdquo; flaw (CVSS 9.3) was exactly this pattern.
      </p>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* §17.5 — GovernanceQuadrants                                          */
/* ------------------------------------------------------------------ */

export function GovernanceQuadrants() {
  const cells = [
    { label: 'Evaluate', q: 'Does it do the job?', items: ['Outcome vs. trajectory evals', 'LLM-as-judge + human gold set', 'Eval-driven development (eval = CI)'], color: C.blue, bg: C.blueLight },
    { label: 'Observe', q: 'What did it actually do?', items: ['Trace every tool call & step', 'OpenTelemetry GenAI spans', 'LangSmith · Arize Phoenix'], color: C.teal, bg: C.tealLight },
    { label: 'Secure', q: 'Can it be turned against us?', items: ['Break the lethal trifecta', 'Input/output guardrails', 'OWASP LLM Top 10 · prompt injection'], color: C.red, bg: C.redLight },
    { label: 'Govern', q: 'Who is accountable?', items: ['Human approval gates', 'Audit trails & ownership', 'NIST AI RMF · EU AI Act · ISO 42001'], color: C.amber, bg: C.amberLight },
  ];
  return (
    <Card title="Four questions every production data agent must answer">
      <div className="grid gap-2.5 sm:grid-cols-2">
        {cells.map((c) => (
          <div key={c.label} className="rounded-md border border-slate-200 p-3" style={{ background: `${c.bg}55` }}>
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-[13px] font-bold" style={{ color: c.color }}>{c.label}</span>
              <span className="text-[10.5px] italic text-slate-500">{c.q}</span>
            </div>
            <ul className="mt-2 space-y-1">
              {c.items.map((it) => (
                <li key={it} className="flex gap-1.5 text-[11px] leading-snug text-slate-600">
                  <span style={{ color: c.color }}>•</span>
                  <span>{it}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* §17.5 — AgentTraceTree                                               */
/* ------------------------------------------------------------------ */

export function AgentTraceTree() {
  const rows = [
    { depth: 0, kind: 'invoke_agent', label: 'answer "why did margin fall in the NE region?"', meta: '4 tool calls · 38.2k tokens · 11.4s', color: C.violet },
    { depth: 1, kind: 'chat', label: 'plan the analysis', meta: 'model · 2.1k tok', color: C.blue },
    { depth: 1, kind: 'execute_tool', label: 'run_sql · revenue & cost by region', meta: 'ok · 0.4s', color: C.teal },
    { depth: 1, kind: 'chat', label: 'reflect: drill into product mix', meta: 'model · 1.8k tok', color: C.blue },
    { depth: 1, kind: 'execute_tool', label: 'run_sql · margin by product', meta: 'error → retry → ok', color: C.amber },
    { depth: 1, kind: 'chat', label: 'compose answer + chart', meta: 'model · 3.0k tok', color: C.blue },
  ];
  return (
    <Card title="One agent run as a trace — what observability captures">
      <div className="overflow-hidden rounded-md border border-slate-200 bg-slate-50/50 font-mono">
        {rows.map((r, i) => (
          <div key={i} className={`flex items-center justify-between gap-3 px-3 py-1.5 ${i > 0 ? 'border-t border-slate-100' : ''}`} style={{ paddingLeft: 12 + r.depth * 22 }}>
            <div className="flex min-w-0 items-center gap-2">
              {r.depth > 0 && <span className="text-slate-300">└</span>}
              <span className="rounded px-1.5 py-0.5 text-[9.5px] font-semibold" style={{ background: 'white', color: r.color, border: `1px solid ${r.color}` }}>{r.kind}</span>
              <span className="truncate text-[11px] text-slate-700">{r.label}</span>
            </div>
            <span className="shrink-0 text-[9.5px] text-slate-400">{r.meta}</span>
          </div>
        ))}
      </div>
      <p className="mt-3 text-[11px] leading-relaxed text-slate-500">
        OpenTelemetry&rsquo;s GenAI conventions give every run a standard shape: a top-level <span className="font-mono text-[10px]">invoke_agent</span> span
        with child <span className="font-mono text-[10px]">chat</span> (model calls) and <span className="font-mono text-[10px]">execute_tool</span> spans.
        This is how you catch the run that <em>said</em> it booked the flight but never wrote the row.
      </p>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* §17.5 — EuAiActTimeline                                              */
/* ------------------------------------------------------------------ */

export function EuAiActTimeline() {
  const W = 760;
  const H = 150;
  const y = 70;
  const marks = [
    { t: 'Aug 2024', label: 'In force', color: C.muted },
    { t: 'Feb 2025', label: 'Bans + AI literacy', color: C.sky },
    { t: 'Aug 2025', label: 'GPAI rules + penalties', color: C.teal },
    { t: 'Aug 2026', label: 'High-risk rules', color: C.amber },
    { t: 'Aug 2027', label: 'Pre-existing GPAI', color: C.red },
  ];
  const left = 50;
  const right = 50;
  const step = (W - left - right) / (marks.length - 1);
  return (
    <Card title="The EU AI Act arrives in phases">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="EU AI Act timeline from August 2024 to August 2027 with five phased milestones.">
        <line x1={left} y1={y} x2={W - right} y2={y} stroke={C.grid} strokeWidth={2} />
        {marks.map((m, i) => {
          const x = left + i * step;
          const above = i % 2 === 0;
          return (
            <g key={m.t}>
              <circle cx={x} cy={y} r={6} fill="white" stroke={m.color} strokeWidth={2.2} />
              <line x1={x} y1={above ? y - 4 : y + 4} x2={x} y2={above ? y - 24 : y + 24} stroke={m.color} strokeWidth={1.2} />
              <text x={x} y={above ? y - 30 : y + 38} textAnchor="middle" className="text-[10.5px] font-semibold" fill={m.color}>{m.t}</text>
              <text x={x} y={above ? y - 18 : y + 50} textAnchor="middle" className="text-[9.5px]" fill={C.muted}>{m.label}</text>
            </g>
          );
        })}
      </svg>
      <p className="mt-1 text-[11px] leading-relaxed text-slate-500">
        Obligations for general-purpose AI models began applying in August 2025; most high-risk rules follow in 2026. Alongside the
        voluntary NIST AI Risk Management Framework and the certifiable ISO/IEC 42001 standard, this is the compliance backdrop any
        production data agent now operates under.
      </p>
    </Card>
  );
}
