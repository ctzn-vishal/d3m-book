'use client';

import * as React from 'react';

import {
  Connector,
  DiagramFrame,
  DiagramSvg,
  Layers,
  Legend,
  Node,
  PathConnector,
  S,
  SvgText,
  T,
  centeredRow,
  ring,
  ringArc,
  spoke,
} from '@/components/Book/diagram';

/**
 * Visuals for §17.2 "Text to SQL" and §17.3 "The Predictive Loop".
 *
 *   - TextToSqlFlow        data flow    question -> governed SQL -> checked answer
 *   - SqlAccuracyChart     bar chart    benchmark accuracy (chart, not schematic)
 *   - SemanticLayerDiagram layer stack  the contract between language and SQL
 *   - PredictiveAgentLoop  loop         train, deploy, monitor, drift, decide
 *   - DsAgentScorecard     bar chart    agent performance by task shape
 *
 * The two charts stay charts: they compare quantities across categories, which
 * is not what a schematic is for. They pick up the theme tokens and the single
 * accent, and nothing else changes.
 */

/* ------------------------------------------------------------------ */
/* §17.2 — TextToSqlFlow                                                */
/* ------------------------------------------------------------------ */

const TTS_STEPS = [
  { label: 'Question', sub: 'revenue by city, last quarter', variant: 'input' as const },
  { label: 'Semantic layer', sub: 'tables, joins, certified metrics', variant: 'focal' as const },
  { label: 'Generate candidates', sub: 'decompose, several SQL drafts', variant: 'step' as const },
  { label: 'Execute and check', sub: 'run, read errors, validate', variant: 'step' as const },
  { label: 'Answer', sub: 'table, chart, explanation', variant: 'step' as const },
];

/**
 * A five-step data flow with one retry edge.
 *
 * The self-correction loop is the second-most important thing in the figure
 * and used to be drawn as a red Bézier swooping under the pipeline. It is now
 * an orthogonal path with the label at the visible end, because the claim it
 * carries — the database's own error message drives the revision — is easier
 * to trace when the line has corners you can follow.
 *
 * The semantic layer is focal. The accuracy gains of the last two years came
 * from that box, not from a better model, which is the section's argument.
 */
export function TextToSqlFlow() {
  const W = 792;
  const H = 232;
  const boxW = 136;
  const boxH = 88;
  const y = 32;
  const xs = centeredRow(0, W, TTS_STEPS.length, boxW, 24);

  return (
    <DiagramFrame
      eyebrow="How a text-to-SQL agent answers a question"
      note="The accuracy gains of the last two years come less from a smarter model than from this scaffolding: grounding the question in a governed semantic layer, generating several candidate queries, and letting the database's own error messages drive the correction."
    >
      <DiagramSvg
        width={W}
        height={H}
        title="A text-to-SQL agent's pipeline"
        desc="A natural-language question is grounded in a governed semantic layer, several candidate SQL queries are generated, each is executed and checked, and a verified answer is returned. When execution fails, the database error is fed back to the generation step and the query is revised."
      >
        {TTS_STEPS.slice(0, -1).map((step, i) => (
          <Connector
            key={step.label}
            from={[xs[i] + boxW, y + boxH / 2]}
            to={[xs[i + 1], y + boxH / 2]}
            route="straight"
          />
        ))}

        {/* Retry edge: down out of "execute", back along the bottom, up into
            "generate". Label at the visible end so it can't fall behind a box. */}
        <Connector
          from={[xs[3] + boxW / 2, y + boxH]}
          to={[xs[2] + boxW / 2, y + boxH]}
          route="vhv"
          mid={y + boxH + 40}
          tone="accent"
          dashed
          label="NO SUCH COLUMN"
        />

        {TTS_STEPS.map((step, i) => (
          <Node
            key={step.label}
            x={xs[i]}
            y={y}
            width={boxW}
            height={boxH}
            variant={step.variant}
            label={step.label}
            sublabel={step.sub}
          />
        ))}

        <SvgText x={xs[1] + boxW / 2} y={y - 12} variant="eyebrow" tone="accent">
          ENFORCES RBAC AND MASKING
        </SvgText>

        <Legend
          y={H - 12}
          width={W}
          x={16}
          items={[
            { kind: 'focal', label: 'Where the accuracy actually comes from' },
            { kind: 'arrow-accent-dashed', label: 'Self-correction: revise and retry' },
          ]}
          pitch={320}
        />
      </DiagramSvg>
    </DiagramFrame>
  );
}

/* ------------------------------------------------------------------ */
/* §17.2 — SqlAccuracyChart                                             */
/* ------------------------------------------------------------------ */

const SQL_BENCHMARKS = [
  { label: 'Spider 1.0 (sanitised academic DBs)', value: 91.2 },
  { label: 'BIRD — best system', value: 81.95 },
  { label: 'Spider 2.0 — best agent (enterprise DBs)', value: 21.3, focal: true },
  { label: 'Spider 2.0 — GPT-4o baseline', value: 10.1 },
];

/**
 * A chart, and left as one — it compares a quantity across categories, which is
 * the job of a bar chart and not of a schematic. Only the palette changes: four
 * bars used to carry four hues, which invited the reader to look for a
 * categorical meaning that isn't there. The accent now marks the one bar the
 * prose is about.
 */
export function SqlAccuracyChart() {
  const rows = SQL_BENCHMARKS;
  const human = 92.96;
  const W = 792;
  const rowH = 46;
  const top = 24;
  const left = 288;
  const right = 48;
  const plotW = W - left - right;
  const H = top + rows.length * rowH + 44;
  const x = (v: number) => left + (v / 100) * plotW;

  return (
    <DiagramFrame
      eyebrow="Execution accuracy: from solved benchmark to open problem"
      note="On clean academic schemas the problem looks nearly solved. On real enterprise databases — thousands of columns, vendor dialects, ambiguous business terms — the best agents still solve about a fifth of the tasks. The gap between those two bars is the whole story."
    >
      <DiagramSvg
        width={W}
        height={H}
        title="Text-to-SQL execution accuracy across benchmarks"
        desc="Four benchmark results against a human-expert baseline of 92.96 per cent. Accuracy is above 80 per cent on sanitised academic schemas but falls to roughly 21 per cent for the best agent on real enterprise databases."
      >
        {[0, 25, 50, 75, 100].map(g => (
          <g key={g}>
            <line
              x1={x(g)}
              y1={top}
              x2={x(g)}
              y2={top + rows.length * rowH}
              stroke={T.rule}
              strokeWidth={S.thin}
            />
            <SvgText
              x={x(g)}
              y={top + rows.length * rowH + 18}
              variant="sub"
              tone="soft"
            >{`${g}%`}</SvgText>
          </g>
        ))}

        {rows.map((r, i) => {
          const ry = top + i * rowH + 10;
          return (
            <g key={r.label}>
              <SvgText
                x={left - 16}
                y={ry + 16}
                width={left - 32}
                anchorY="middle"
                variant="body"
                tone={r.focal ? 'ink' : 'muted'}
                textAnchor="end"
              >
                {r.label}
              </SvgText>
              <rect
                x={left}
                y={ry}
                width={x(r.value) - left}
                height={22}
                rx={3}
                fill={r.focal ? T.accentTint : T.paperAlt}
                stroke={r.focal ? T.accent : T.muted}
                strokeWidth={r.focal ? S.strong : S.thin}
              />
              <SvgText
                x={x(r.value) + 8}
                y={ry + 16}
                variant="sub"
                tone={r.focal ? 'accent' : 'muted'}
                textAnchor="start"
              >
                {`${r.value}%`}
              </SvgText>
            </g>
          );
        })}

        <line
          x1={x(human)}
          y1={top - 6}
          x2={x(human)}
          y2={top + rows.length * rowH + 2}
          stroke={T.ink}
          strokeWidth={S.base}
          strokeDasharray="4 3"
        />
        <SvgText x={x(human)} y={top - 10} variant="sub" tone="ink">
          {`human expert ${human}%`}
        </SvgText>
      </DiagramSvg>
    </DiagramFrame>
  );
}

/* ------------------------------------------------------------------ */
/* §17.2 — SemanticLayerDiagram                                         */
/* ------------------------------------------------------------------ */

const SEMANTIC_LAYERS = [
  {
    tag: 'ASKS',
    name: 'AI agent, dashboard, analyst in chat',
    sub: 'three consumers, one vocabulary',
    note: 'natural language and BI queries',
  },
  {
    tag: 'MEANS',
    name: 'Semantic layer',
    sub: 'certified metric definitions, join paths, access rules',
    note: 'net_revenue · active_user · churn_rate',
    focal: true,
  },
  {
    tag: 'STORES',
    name: 'Warehouse',
    sub: 'raw columns, row and column security',
    note: 'tables the consumers never name directly',
  },
];

/**
 * Three layers, because the middle one is a genuine level of abstraction and
 * not a step in a pipeline. Draw it left-to-right as an architecture and it
 * reads as "the query passes through here"; draw it as a stack and it reads as
 * "this is what the layer above is allowed to mean", which is the contract the
 * section is describing.
 */
export function SemanticLayerDiagram() {
  const W = 792;
  const rowH = 68;
  const H = rowH * SEMANTIC_LAYERS.length + 40;

  return (
    <DiagramFrame
      eyebrow="The semantic layer — the contract between language and SQL"
      note={
        <>
          Routed through a semantic model, one vendor&rsquo;s text-to-SQL jumped from{' '}
          <strong>51%</strong> on bare tables to <strong>over 90%</strong> on real BI questions. The
          model didn&rsquo;t change — the context did.
        </>
      }
    >
      <DiagramSvg
        width={W}
        height={H}
        title="The semantic layer between consumers and the warehouse"
        desc="Agents, dashboards, and analysts all ask questions in business language. A semantic layer holds the certified metric definitions, join paths, and access rules that translate those questions into warehouse SQL, so that revenue means one thing regardless of who asked."
      >
        <Layers
          x={48}
          y={16}
          width={W - 72}
          rowHeight={rowH}
          layers={SEMANTIC_LAYERS}
          direction="business meaning"
        />
      </DiagramSvg>
    </DiagramFrame>
  );
}

/* ------------------------------------------------------------------ */
/* §17.3 — PredictiveAgentLoop                                          */
/* ------------------------------------------------------------------ */

const PREDICTIVE_STATIONS = [
  { name: 'Train', sub: 'fit or refit' },
  { name: 'Deploy', sub: 'canary rollout' },
  { name: 'Monitor', sub: 'live metrics' },
  { name: 'Detect drift', sub: 'KS and PSI tests' },
  { name: 'Decide', sub: 'retrain? alert?', focal: true },
];

export function PredictiveAgentLoop() {
  const W = 792;
  // Tall enough that the approval gate clears the two bottom stations. The
  // ring puts them at cy + r*sin(54 deg), which is further down than it looks
  // when you are reading the radius off the top of the diagram.
  const H = 520;
  const cx = W / 2;
  const cy = 224;
  const radius = 192;
  const stationW = 148;
  const stationH = 60;
  const hubW = 208;
  const hubH = 88;

  const points = ring(cx, cy, radius, PREDICTIVE_STATIONS.length);

  return (
    <DiagramFrame
      eyebrow="The predictive loop, now agent-driven"
      note="The loop itself is the one Part IV deployed by hand. What is new is that an agent can turn every station — watch the metrics, run the drift tests, retrain, stage a canary — while a human stays above the loop and approves the promotions that matter."
    >
      <DiagramSvg
        width={W}
        height={H}
        title="The agent-driven predictive loop"
        desc="Five stations run clockwise — train, deploy, monitor, detect drift, decide — around an agent on a durable-execution substrate that survives crashes and resumes. The step from decide back to train passes through a human approval gate before any new model goes live."
      >
        {PREDICTIVE_STATIONS.map((s, i) => (
          <PathConnector
            key={`arc-${s.name}`}
            d={ringArc(cx, cy, radius, PREDICTIVE_STATIONS.length, i, 0.26)}
            // The return leg is where the human sits, so it reads as a gated
            // hand-back rather than another automatic step.
            tone={i === PREDICTIVE_STATIONS.length - 1 ? 'accent' : 'default'}
            dashed={i === PREDICTIVE_STATIONS.length - 1}
          />
        ))}
        {PREDICTIVE_STATIONS.map((s, i) => (
          <PathConnector
            key={`spoke-${s.name}`}
            d={spoke(points[i], [cx, cy], stationH / 2 + 8, hubH / 2 + 10)}
            dashed
            arrow="none"
          />
        ))}

        <Node
          x={cx - hubW / 2}
          y={cy - hubH / 2}
          width={hubW}
          height={hubH}
          variant="store"
          label="Agent + durable execution"
          sublabel="survives crashes, runs for days, resumes"
        />

        {PREDICTIVE_STATIONS.map((s, i) => (
          <Node
            key={s.name}
            x={points[i][0] - stationW / 2}
            y={points[i][1] - stationH / 2}
            width={stationW}
            height={stationH}
            variant={s.focal ? 'focal' : 'step'}
            label={s.name}
            sublabel={s.sub}
          />
        ))}

        <Node
          x={cx - 168}
          y={H - 88}
          width={336}
          height={40}
          shape="oval"
          variant="boundary"
          label="A human approves the promotion"
        />

        <Legend
          y={H - 8}
          width={W}
          x={16}
          items={[{ kind: 'arrow-dashed', label: 'Writes back to the shared run record' }]}
        />
      </DiagramSvg>
    </DiagramFrame>
  );
}

/* ------------------------------------------------------------------ */
/* §17.3 — DsAgentScorecard                                             */
/* ------------------------------------------------------------------ */

const DS_BENCHMARKS = [
  { bench: 'MLE-bench', task: 'Win a Kaggle medal (best agent, 1 try)', value: 16.9 },
  { bench: 'MLE-bench', task: 'Win a Kaggle medal (8 tries)', value: 34.1 },
  { bench: 'DSBench', task: 'Solve a realistic data-analysis task', value: 34.1 },
  { bench: 'BixBench', task: 'Open-answer bioinformatics analysis', value: 17 },
  { bench: 'InfiAgent-DABench', task: 'Closed-form analysis question', value: 74.6, focal: true },
  { bench: 'GDPval', task: 'Match or beat an expert on real knowledge work', value: 47.6 },
];

/**
 * Also a chart, also left as one. Six bars used to carry four hues keyed to
 * nothing the reader could look up. The accent now marks the closed-form row —
 * the outlier that makes the pattern legible, since it is the only task shape
 * where agents are genuinely strong.
 */
export function DsAgentScorecard() {
  return (
    <DiagramFrame
      eyebrow="How far are data-science agents from experts?"
      note="These benchmarks measure different things, so the bars are not directly comparable — but the pattern is. On narrow, closed-form questions agents are strong; on open-ended, end-to-end modelling work they still trail experts by a wide margin. A benchmark win is not production reliability."
      bare
    >
      <div className="space-y-2">
        {DS_BENCHMARKS.map(r => (
          <div key={`${r.bench}-${r.task}`} className="flex items-center gap-3">
            <span
              className={`w-12 shrink-0 text-right font-plex text-[13px] font-semibold tabular-nums ${
                r.focal ? 'text-accent-ink' : 'text-muted'
              }`}
            >
              {r.value}%
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-2">
                <span className={`truncate text-[12px] ${r.focal ? 'text-body' : 'text-subtle'}`}>
                  {r.task}
                </span>
                <span className="hidden shrink-0 font-plex text-[10px] text-muted sm:inline">
                  {r.bench}
                </span>
              </div>
              <div className="mt-1 h-2 w-full overflow-hidden rounded-sm bg-code-bg">
                <div
                  className={`h-full rounded-sm ${r.focal ? 'bg-accent' : 'bg-muted/50'}`}
                  style={{ width: `${r.value}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </DiagramFrame>
  );
}
