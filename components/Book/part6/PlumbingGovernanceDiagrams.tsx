'use client';

import * as React from 'react';

import {
  Connector,
  DiagramFrame,
  DiagramSvg,
  EyebrowLabel,
  Layers,
  Legend,
  Node,
  S,
  SvgText,
  T,
  TreeBus,
  Venn,
} from '@/components/Book/diagram';

/**
 * Visuals for §17.4 "The Plumbing" and §17.5 "Governance".
 *
 *   - McpHub              architecture  one protocol instead of N x M connectors
 *   - AgentStack          layer stack   the five tiers under an agentic system
 *   - LethalTrifecta      venn          the three capabilities that must not meet
 *   - GovernanceQuadrants cards         the four questions a production agent answers
 *   - AgentTraceTree      tree          one run, as observability records it
 *   - EuAiActTimeline     timeline      when each obligation starts applying
 */

/* ------------------------------------------------------------------ */
/* §17.4 — McpHub                                                       */
/* ------------------------------------------------------------------ */

const MCP_SERVERS = ['Postgres', 'Snowflake', 'BigQuery', 'GitHub', 'Slack', 'Filesystem'];

/**
 * Drawn as a bus, not a starburst.
 *
 * A hub with six radial spokes is the obvious picture and the wrong one: it
 * says "this thing touches six systems", which was equally true *before* MCP.
 * What changed is that the six bespoke connectors collapsed into one protocol,
 * and a bus is the shape that shows a single line becoming many. The
 * `N x M -> N + M` claim in the note is the figure's whole argument, and the
 * starburst cannot make it.
 */
export function McpHub() {
  const W = 792;
  const rowH = 44;
  const pitch = 56;
  const top = 24;
  const serverX = 552;
  const serverW = 216;
  const H = top + pitch * (MCP_SERVERS.length - 1) + rowH + 24;
  const centreY = top + (pitch * (MCP_SERVERS.length - 1) + rowH) / 2;

  return (
    <DiagramFrame
      eyebrow="MCP — the USB-C port for AI"
      note={
        <>
          Before MCP, every assistant needed a bespoke connector for every system — an{' '}
          <span className="font-plex text-[11px]">N&nbsp;&times;&nbsp;M</span> problem. A tool built
          once for MCP works across any MCP-speaking client. Open-sourced by Anthropic in November
          2024, adopted by OpenAI, Google, and Microsoft within a year, and now under neutral
          foundation governance.
        </>
      }
    >
      <DiagramSvg
        width={W}
        height={H}
        title="MCP as a single protocol between an agent and its data"
        desc="An AI agent speaks one protocol, the Model Context Protocol, which fans out to six separate systems — Postgres, Snowflake, BigQuery, GitHub, Slack, and a filesystem — instead of the agent carrying a bespoke connector for each."
      >
        <Connector from={[192, centreY]} to={[288, centreY]} route="straight" arrow="none" />
        <TreeBus
          orientation="horizontal"
          parentX={432}
          parentY={centreY}
          childXs={MCP_SERVERS.map((_, i) => top + i * pitch + rowH / 2)}
          childY={serverX}
        />

        <Node
          x={16}
          y={centreY - 36}
          width={176}
          height={72}
          variant="focal"
          label="AI agent"
          sublabel="MCP client"
        />
        <Node
          x={288}
          y={centreY - 36}
          width={144}
          height={72}
          variant="boundary"
          tag="MCP"
          label="One protocol"
          sublabel="write the tool once"
        />

        {MCP_SERVERS.map((name, i) => (
          <Node
            key={name}
            x={serverX}
            y={top + i * pitch}
            width={serverW}
            height={rowH}
            variant="external"
            label={name}
          />
        ))}

        <EyebrowLabel x={serverX + serverW} y={top - 10} anchor="end" tone="soft" masked={false}>
          MCP SERVERS
        </EyebrowLabel>
      </DiagramSvg>
    </DiagramFrame>
  );
}

/* ------------------------------------------------------------------ */
/* §17.4 — AgentStack                                                   */
/* ------------------------------------------------------------------ */

const AGENT_LAYERS = [
  {
    tag: 'L5',
    name: 'Durable execution',
    sub: 'survives crashes, runs for days',
    note: 'Temporal · Inngest · Vercel Workflow',
  },
  {
    tag: 'L4',
    name: 'Orchestration',
    sub: 'coordinates multi-step, multi-agent work',
    note: 'LangGraph · OpenAI Agents SDK · ADK',
  },
  {
    tag: 'L3',
    name: 'Agent-to-agent (A2A)',
    sub: 'agents discover and delegate to each other',
    note: 'A2A protocol (Linux Foundation)',
  },
  {
    tag: 'L2',
    name: 'Model Context Protocol',
    sub: 'governed access to tools and data',
    note: 'MCP servers (Postgres, Snowflake…)',
    focal: true,
  },
  {
    tag: 'L1',
    name: 'Tool use / function calling',
    sub: 'the model emits a structured call',
    note: 'JSON-schema tool definitions',
  },
];

export function AgentStack() {
  const W = 792;
  const rowH = 60;
  const H = rowH * AGENT_LAYERS.length + 40;

  return (
    <DiagramFrame
      eyebrow="The connection stack under an agentic analytics system"
      note="Read bottom-up: a tool call is the atom; MCP standardises how the agent reaches governed data; A2A lets agents collaborate; orchestration sequences the work; and durable execution makes the whole thing survive the real world. Only one of these five layers is where governance can actually be enforced."
    >
      <DiagramSvg
        width={W}
        height={H}
        title="The agent connection stack"
        desc="Five layers from tool calling at the bottom through the Model Context Protocol, agent-to-agent delegation, orchestration, and durable execution at the top. MCP is the layer where access to data is governed."
      >
        <Layers
          x={48}
          y={16}
          width={W - 72}
          rowHeight={rowH}
          layers={AGENT_LAYERS}
          direction="abstraction"
        />
      </DiagramSvg>
    </DiagramFrame>
  );
}

/* ------------------------------------------------------------------ */
/* §17.5 — LethalTrifecta                                               */
/* ------------------------------------------------------------------ */

/**
 * The one figure in the book where the intersection *is* the content, and the
 * one the old palette hurt most: three circles at 55% opacity in three hues
 * made the triple overlap the muddiest region on the canvas. The thing the
 * reader was supposed to look at was the thing hardest to see.
 *
 * Now the three sets are colourless washes and the overlap is drawn
 * explicitly, in `neg` — because this intersection is a failure mode, not a
 * goal. That is the documented semantic-hue exception doing exactly what it
 * exists for.
 */
export function LethalTrifecta() {
  const W = 640;
  const H = 400;
  // Tightened from the original spread: with the circles further apart the
  // triple region was ~40px wide, which is not enough to put the label — the
  // one thing the figure exists to name — inside the region it names.
  const r = 112;
  const cx = W / 2;

  return (
    <DiagramFrame
      eyebrow="The lethal trifecta"
      note="Simon Willison's formulation: any one circle is fine; all three together let an attacker hide an instruction in data the agent reads, then have the agent fetch private records and ship them out. The defence is architectural — break one of the three circles — because guardrails alone do not reliably hold. Microsoft's 2025 EchoLeak flaw (CVSS 9.3) was exactly this pattern."
    >
      <DiagramSvg
        width={W}
        height={H}
        title="The lethal trifecta"
        desc="Three overlapping capabilities — access to private data, exposure to untrusted content, and the ability to send data outward. Any one is safe. Where all three overlap, an attacker can plant an instruction in content the agent reads and have it exfiltrate private records."
      >
        <Venn
          intersectionTone="neg"
          intersection={{ label: 'Data exfiltration' }}
          circles={[
            {
              cx,
              cy: 160,
              r,
              label: 'Access to private data',
              sublabel: 'the warehouse, the inbox',
              labelAt: 'top',
            },
            {
              cx: cx - 68,
              cy: 252,
              r,
              label: 'Untrusted content',
              sublabel: 'tickets, web pages, PDFs',
              labelAt: 'bottom',
            },
            {
              cx: cx + 68,
              cy: 252,
              r,
              label: 'Can send data out',
              sublabel: 'email, HTTP, webhooks',
              labelAt: 'bottom',
            },
          ]}
        />
      </DiagramSvg>
    </DiagramFrame>
  );
}

/* ------------------------------------------------------------------ */
/* §17.5 — GovernanceQuadrants                                          */
/* ------------------------------------------------------------------ */

const GOVERNANCE = [
  {
    label: 'Evaluate',
    q: 'Does it do the job?',
    items: ['Outcome vs. trajectory evals', 'LLM-as-judge + human gold set', 'Eval-driven development'],
  },
  {
    label: 'Observe',
    q: 'What did it actually do?',
    items: ['Trace every tool call and step', 'OpenTelemetry GenAI spans', 'LangSmith · Arize Phoenix'],
  },
  {
    label: 'Secure',
    q: 'Can it be turned against us?',
    items: ['Break the lethal trifecta', 'Input and output guardrails', 'OWASP LLM Top 10'],
  },
  {
    label: 'Govern',
    q: 'Who is accountable?',
    items: ['Human approval gates', 'Audit trails and ownership', 'NIST AI RMF · EU AI Act · ISO 42001'],
  },
];

/**
 * Four independent checklists, which is a card grid and not a quadrant — there
 * are no two axes to position them on. Left as cards, moved onto the tokens.
 */
export function GovernanceQuadrants() {
  return (
    <DiagramFrame eyebrow="Four questions every production data agent must answer" bare>
      <div className="grid gap-3 sm:grid-cols-2">
        {GOVERNANCE.map(c => (
          <div key={c.label} className="rounded-md border border-border bg-card p-3">
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-[13px] font-semibold text-body">{c.label}</span>
              <span className="text-[11px] italic text-muted">{c.q}</span>
            </div>
            <ul className="mt-2 space-y-1">
              {c.items.map(it => (
                <li key={it} className="flex gap-1.5 text-[11px] leading-snug text-subtle">
                  <span className="text-muted">·</span>
                  <span>{it}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </DiagramFrame>
  );
}

/* ------------------------------------------------------------------ */
/* §17.5 — AgentTraceTree                                               */
/* ------------------------------------------------------------------ */

const TRACE = [
  { kind: 'chat', label: 'Plan the analysis', meta: 'model · 2.1k tok' },
  { kind: 'execute_tool', label: 'run_sql — revenue and cost by region', meta: 'ok · 0.4s' },
  { kind: 'chat', label: 'Reflect: drill into product mix', meta: 'model · 1.8k tok' },
  {
    kind: 'execute_tool',
    label: 'run_sql — margin by product',
    meta: 'error → retry → ok',
    flagged: true,
  },
  { kind: 'chat', label: 'Compose answer and chart', meta: 'model · 3.0k tok' },
];

/**
 * A tree, drawn as one — root span at the top, a spine, one child span per
 * step, in time order down the page.
 *
 * The previous version was an indented HTML list with a coloured chip per span
 * kind, which is how a trace viewer's UI looks but not what the figure needs to
 * say. Here the tree structure is the claim: every child span hangs off one
 * root, so a run that *said* it did something but produced no child span is
 * visibly missing a branch.
 */
export function AgentTraceTree() {
  const W = 792;
  const rowH = 40;
  const pitch = 48;
  const rootY = 16;
  const rootH = 48;
  const childTop = 96;
  const childX = 88;
  const childW = 496;
  const H = childTop + pitch * (TRACE.length - 1) + rowH + 24;

  return (
    <DiagramFrame
      eyebrow="One agent run as a trace"
      note={
        <>
          OpenTelemetry&rsquo;s GenAI conventions give every run a standard shape: a top-level{' '}
          <span className="font-plex text-[11px]">invoke_agent</span> span with child{' '}
          <span className="font-plex text-[11px]">chat</span> and{' '}
          <span className="font-plex text-[11px]">execute_tool</span> spans. This is how you catch
          the run that <em>said</em> it booked the flight but never wrote the row.
        </>
      }
    >
      <DiagramSvg
        width={W}
        height={H}
        title="One agent run as a trace tree"
        desc="A root span for the whole request, with five child spans beneath it in time order: plan, run a query, reflect, run a second query that errors and retries, and compose the answer. Each child records its own duration and token cost."
      >
        <TreeBus
          orientation="horizontal"
          parentX={56}
          parentY={rootY + rootH}
          childXs={TRACE.map((_, i) => childTop + i * pitch + rowH / 2)}
          childY={childX}
          r={6}
        />

        <Node
          x={16}
          y={rootY}
          width={568}
          height={rootH}
          align="start"
          variant="focal"
          tag="INVOKE_AGENT"
          label="Why did margin fall in the NE region?"
        />
        <SvgText x={W - 16} y={rootY + 30} variant="sub" tone="muted" textAnchor="end">
          4 tool calls · 38.2k tokens · 11.4s
        </SvgText>

        {TRACE.map((row, i) => {
          const y = childTop + i * pitch;
          return (
            <g key={row.label}>
              <Node
                x={childX}
                y={y}
                width={childW}
                height={rowH}
                align="start"
                variant={row.flagged ? 'optional' : 'step'}
                label={row.label}
              />
              <SvgText
                x={childX + childW - 12}
                y={y + rowH / 2 + 3}
                variant="sub"
                tone="soft"
                textAnchor="end"
              >
                {row.kind}
              </SvgText>
              <SvgText
                x={W - 16}
                y={y + rowH / 2 + 3}
                variant="sub"
                tone="muted"
                textAnchor="end"
              >
                {row.meta}
              </SvgText>
            </g>
          );
        })}
      </DiagramSvg>
    </DiagramFrame>
  );
}

/* ------------------------------------------------------------------ */
/* §17.5 — EuAiActTimeline                                              */
/* ------------------------------------------------------------------ */

const AI_ACT = [
  { t: 'Aug 2024', label: 'In force' },
  { t: 'Feb 2025', label: 'Bans and AI literacy' },
  { t: 'Aug 2025', label: 'GPAI rules and penalties' },
  { t: 'Aug 2026', label: 'High-risk rules', focal: true },
  { t: 'Aug 2027', label: 'Pre-existing GPAI' },
];

/**
 * A timeline with one accented milestone rather than five coloured ones.
 *
 * Five dates in five hues implies the colours rank them, which invites the
 * reader to work out a scale that isn't there. August 2026 is accented because
 * it is the date that decides whether a given data agent is in scope at all.
 */
export function EuAiActTimeline() {
  const W = 792;
  const H = 176;
  const y = 88;
  const left = 72;
  const step = (W - left * 2) / (AI_ACT.length - 1);

  return (
    <DiagramFrame
      eyebrow="The EU AI Act arrives in phases"
      note="Obligations for general-purpose AI models began applying in August 2025; most high-risk rules follow in August 2026. Alongside the voluntary NIST AI Risk Management Framework and the certifiable ISO/IEC 42001 standard, this is the compliance backdrop any production data agent now operates under."
    >
      <DiagramSvg
        width={W}
        height={H}
        title="EU AI Act phase-in dates"
        desc="Five milestones between August 2024 and August 2027: the Act enters into force, prohibitions and AI-literacy duties begin, general-purpose AI rules and penalties begin, high-risk system rules begin in August 2026, and pre-existing general-purpose models come into scope in 2027."
      >
        <line x1={left} y1={y} x2={W - left} y2={y} stroke={T.ruleStrong} strokeWidth={S.base} />
        {AI_ACT.map((m, i) => {
          const x = left + i * step;
          const above = i % 2 === 0;
          const tone = m.focal ? 'accent' : 'muted';
          return (
            <g key={m.t}>
              <line
                x1={x}
                y1={above ? y - 6 : y + 6}
                x2={x}
                y2={above ? y - 26 : y + 26}
                stroke={m.focal ? T.accent : T.rule}
                strokeWidth={S.base}
              />
              <circle
                cx={x}
                cy={y}
                r={m.focal ? 7 : 5}
                fill={m.focal ? T.accentTint : T.paper}
                stroke={m.focal ? T.accent : T.ruleStrong}
                strokeWidth={m.focal ? S.strong : S.base}
              />
              <SvgText
                x={x}
                y={above ? y - 44 : y + 44}
                variant="nodeSm"
                tone={m.focal ? 'accent' : 'ink'}
              >
                {m.t}
              </SvgText>
              <SvgText
                x={x}
                y={above ? y - 32 : y + 56}
                width={Math.floor(step) - 8}
                variant="sub"
                tone={tone}
              >
                {m.label}
              </SvgText>
            </g>
          );
        })}
        <Legend
          y={H - 8}
          width={W}
          x={16}
          items={[{ kind: 'focal', label: 'The date that decides whether an agent is in scope' }]}
        />
      </DiagramSvg>
    </DiagramFrame>
  );
}
