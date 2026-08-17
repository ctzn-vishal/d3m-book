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
  PathConnector,
  S,
  SvgText,
  T,
  Zone,
  centeredRow,
} from '@/components/Book/diagram';

/**
 * Conceptual visuals for §17.1 "The Agentic Turn" (reused in §17.6).
 *
 *   - WorkflowVsAgent  comparison   who holds the steering wheel
 *   - AgentAnatomy     nested       an augmented model inside a control loop
 *   - AutonomyLadder   layer stack  five rungs, and the one most teams land on
 *   - AdoptionGap      bar chart    experiment-to-scale (chart, not schematic)
 */

/* ------------------------------------------------------------------ */
/* §17.1 — WorkflowVsAgent                                              */
/* ------------------------------------------------------------------ */

const WORKFLOW_STEPS = ['Extract', 'Classify', 'Summarise', 'Route'];

/**
 * Two panels side by side, which is the shape of the claim: the same model,
 * two different places to put the control.
 *
 * The audit filed this as a quadrant. It isn't one — a quadrant needs two axes
 * to position things on, and there is only one distinction here. What it needs
 * is for the *shape* of each side to differ, so the difference is visible
 * before either label is read: a fixed left-to-right chain on one side, a
 * two-way loop on the other.
 */
export function WorkflowVsAgent() {
  const W = 792;
  const H = 260;
  const paneW = 372;
  const paneY = 24;
  const paneH = 188;
  const leftX = 16;
  const rightX = 404;

  const chipW = 76;
  const chipXs = centeredRow(leftX, paneW, WORKFLOW_STEPS.length, chipW, 12);
  const chipY = 108;

  return (
    <DiagramFrame
      eyebrow="Two ways to put a model to work"
      note={
        <>
          Anthropic draws the line here: a <strong>workflow</strong> orchestrates the model through
          predefined code paths; an <strong>agent</strong> lets the model direct its own process and
          tool use. Both are agentic systems — the difference is who holds the steering wheel, and
          therefore who is accountable when the path goes somewhere nobody planned.
        </>
      }
    >
      <DiagramSvg
        width={W}
        height={H}
        title="Workflow versus agent"
        desc="On the left, a workflow: the developer fixes four steps in code and the model fills in each one, so the path never changes. On the right, an agent: the model decides the next step, calls a tool, reads the result, and decides again until the goal is met, so the path is discovered at run time."
      >
        <Zone x={leftX} y={paneY} width={paneW} height={paneH} label="WORKFLOW" />
        <Zone x={rightX} y={paneY} width={paneW} height={paneH} label="AGENT" />

        <SvgText
          x={leftX + 16}
          y={paneY + 44}
          width={paneW - 32}
          variant="body"
          tone="subtle"
          textAnchor="start"
        >
          The developer fixes the steps in code. The model fills the blanks at each station.
        </SvgText>
        <SvgText
          x={rightX + 16}
          y={paneY + 44}
          width={paneW - 32}
          variant="body"
          tone="subtle"
          textAnchor="start"
        >
          The model chooses the next step, calls a tool, reads the result, and decides again.
        </SvgText>

        {/* Left: a fixed chain. Every step the same size, because none of them
            is a decision. */}
        {WORKFLOW_STEPS.slice(0, -1).map((s, i) => (
          <Connector
            key={s}
            from={[chipXs[i] + chipW, chipY + 18]}
            to={[chipXs[i + 1], chipY + 18]}
            route="straight"
          />
        ))}
        {WORKFLOW_STEPS.map((s, i) => (
          <Node key={s} x={chipXs[i]} y={chipY} width={chipW} height={36} label={s} />
        ))}
        <SvgText
          x={leftX + paneW / 2}
          y={chipY + 68}
          width={paneW - 32}
          variant="sub"
          tone="muted"
        >
          Predictable, testable, bounded. The path never changes.
        </SvgText>

        {/* Right: a two-way loop. The shape is the argument. */}
        {/* 68px of gutter between the two boxes, because OBSERVES needs 52
            for its mask and the labels must clear the box edges on both
            sides. The two runs are 36px apart so one label can sit above and
            the other below without either touching a stroke. */}
        <Connector
          from={[rightX + 156, chipY + 4]}
          to={[rightX + 224, chipY + 4]}
          route="straight"
          tone="accent"
          label="CALLS"
        />
        <Connector
          from={[rightX + 224, chipY + 40]}
          to={[rightX + 156, chipY + 40]}
          route="straight"
          label="OBSERVES"
          labelSide="below"
        />
        <Node
          x={rightX + 36}
          y={chipY - 8}
          width={120}
          height={56}
          variant="focal"
          label="Model decides"
        />
        <Node
          x={rightX + 224}
          y={chipY - 8}
          width={120}
          height={56}
          variant="external"
          label="Tool or environment"
        />
        <SvgText
          x={rightX + paneW / 2}
          // Lower than its opposite number, to clear the OBSERVES label that
          // hangs below the return edge.
          y={chipY + 80}
          width={paneW - 32}
          variant="sub"
          tone="muted"
        >
          Flexible and open-ended. The path is discovered at run time.
        </SvgText>
      </DiagramSvg>
    </DiagramFrame>
  );
}

/* ------------------------------------------------------------------ */
/* §17.1 — AgentAnatomy                                                 */
/* ------------------------------------------------------------------ */

const AUGMENTATIONS = [
  { label: 'Tools', sub: 'SQL, search, code' },
  { label: 'Memory', sub: 'context, state' },
  { label: 'Retrieval', sub: 'docs, semantic layer' },
  { label: 'Planning', sub: 'decompose, reflect' },
];

const TURN_STEPS = [
  { n: '01', label: 'Plan' },
  { n: '02', label: 'Act — call a tool' },
  { n: '03', label: 'Observe the result' },
  { n: '04', label: 'Reflect' },
];

/**
 * Nested: the augmented model sits *inside* a boundary, and the loop runs
 * beside it.
 *
 * The old version drew four augmentation chips radiating diagonally from a
 * circle, plus a diagonal dashed line labelled "drives" reaching across to the
 * loop. Containment says the same thing without a single line: the tools,
 * memory, retrieval, and planning are what the model *is* here, not things it
 * connects to.
 */
export function AgentAnatomy() {
  const W = 792;
  const H = 356;
  const zoneX = 16;
  const zoneW = 384;
  const coreY = 132;
  const augW = 168;
  const augH = 52;
  const loopX = 464;
  const loopW = 264;
  const stepH = 44;
  const stepPitch = 56;
  const stepTop = 40;

  return (
    <DiagramFrame
      eyebrow="Anatomy of a data agent"
      note="The core is a language model augmented with tools, memory, retrieval, and planning. What makes it an agent is the loop: it acts on the world, reads the result back as ground truth, and decides what to do next — stopping when the goal is met, or when a human is asked to approve."
    >
      <DiagramSvg
        width={W}
        height={H}
        title="Anatomy of a data agent"
        desc="A reasoning model augmented with tools, memory, retrieval, and planning, running a four-step loop each turn: plan, call a tool, observe the result, reflect. The loop repeats until the goal is met or a human checkpoint is reached."
      >
        <Zone x={zoneX} y={24} width={zoneW} height={296} label="THE AUGMENTED MODEL" />

        <Node
          x={zoneX + (zoneW - 224) / 2}
          // Zones need >=16px between their eyebrow and the first enclosed
          // node; the eyebrow baseline sits at zone_y + 14.
          y={coreY - 76}
          width={224}
          height={64}
          variant="focal"
          label="Reasoning model"
          sublabel="the LLM core"
        />

        {AUGMENTATIONS.map((a, i) => (
          <Node
            key={a.label}
            x={zoneX + 20 + (i % 2) * (augW + 8)}
            y={coreY + 20 + Math.floor(i / 2) * (augH + 12)}
            width={augW}
            height={augH}
            variant="store"
            label={a.label}
            sublabel={a.sub}
          />
        ))}

        <EyebrowLabel x={zoneX + zoneW / 2} y={coreY + 8} anchor="middle" tone="soft">
          AUGMENTED WITH
        </EyebrowLabel>

        {/* One orthogonal line from the boundary to the loop — the model is
            what runs the loop, and that is the only relationship between the
            two halves. */}
        <Connector
          from={[zoneX + zoneW, 172]}
          to={[loopX, 172]}
          route="straight"
          tone="accent"
          label="RUNS"
        />

        <EyebrowLabel x={loopX + loopW / 2} y={26} anchor="middle" tone="soft" masked={false}>
          THE LOOP, EACH TURN
        </EyebrowLabel>

        {TURN_STEPS.slice(0, -1).map((s, i) => (
          <Connector
            key={s.label}
            from={[loopX + loopW / 2, stepTop + i * stepPitch + stepH]}
            to={[loopX + loopW / 2, stepTop + (i + 1) * stepPitch]}
            route="straight"
          />
        ))}
        {TURN_STEPS.map((s, i) => (
          <Node
            key={s.label}
            x={loopX}
            y={stepTop + i * stepPitch}
            width={loopW}
            height={stepH}
            label={s.label}
          />
        ))}

        {/* Reflect -> Plan, routed round the right edge. */}
        <PathConnector
          d={`M ${loopX + loopW},${stepTop + 3 * stepPitch + stepH / 2} H ${W - 24} V ${stepTop + stepH / 2 + 8} Q ${W - 24},${stepTop + stepH / 2} ${W - 32},${stepTop + stepH / 2} H ${loopX + loopW}`}
          dashed
        />
        <Node
          x={loopX}
          y={stepTop + 4 * stepPitch + 8}
          width={loopW}
          height={52}
          shape="oval"
          variant="boundary"
          label="Stop, answer, log"
          sublabel="or pause for a human checkpoint"
        />
        <Connector
          from={[loopX + loopW / 2, stepTop + 3 * stepPitch + stepH]}
          to={[loopX + loopW / 2, stepTop + 4 * stepPitch + 8]}
          route="straight"
        />

        <Legend
          y={H - 8}
          width={W}
          x={16}
          items={[
            { kind: 'focal', label: 'The model' },
            { kind: 'store', label: 'What augments it' },
            { kind: 'boundary', label: 'Where a human can intervene' },
          ]}
          pitch={216}
        />
      </DiagramSvg>
    </DiagramFrame>
  );
}

/* ------------------------------------------------------------------ */
/* §17.1 — AutonomyLadder                                               */
/* ------------------------------------------------------------------ */

const AUTONOMY = [
  { tag: '1', name: 'Assist', sub: 'Human does the work; the model suggests', note: 'no gate needed' },
  { tag: '2', name: 'Draft', sub: 'Model proposes; a human edits and runs', note: 'review before use' },
  {
    tag: '3',
    name: 'Act with approval',
    sub: 'Model executes after a human gate',
    note: 'where most teams should start',
    focal: true,
  },
  {
    tag: '4',
    name: 'Supervised autonomy',
    sub: 'Model runs the loop; a human monitors',
    note: 'needs tracing and alerts',
  },
  {
    tag: '5',
    name: 'Delegated autonomy',
    sub: 'Model owns the task end to end',
    note: 'needs an audit trail and an owner',
  },
];

/**
 * A layer stack, not a set of progress bars.
 *
 * The bars were the problem: a half-filled bar invites the reader to read "50%
 * autonomous", which is not a quantity anyone can measure. The rungs are
 * ordinal — the order is the whole content — and a stack says ordinal without
 * implying a scale.
 *
 * Rung 3 is focal because it is the setting the section argues most teams
 * should default to, not because it is the middle one.
 */
export function AutonomyLadder() {
  const W = 792;
  const rowH = 60;
  const H = rowH * AUTONOMY.length + 40;

  return (
    <DiagramFrame
      eyebrow="Levels of autonomy — the dial a manager actually sets"
      note="Autonomy is not a property of the model. It is a setting the deploying team chooses, co-determined by the model, the human oversight around it, and the product design. The same model can sit at rung 2 for a pricing change and rung 4 for a routine data refresh."
    >
      <DiagramSvg
        width={W}
        height={H}
        title="Five levels of agent autonomy"
        desc="A ladder from assist, where a human does the work and the model suggests, through draft, act-with-approval, supervised autonomy, and finally delegated autonomy, where the model owns the task end to end. Each rung requires more oversight machinery than the one below it."
      >
        <Layers
          x={48}
          y={16}
          width={W - 72}
          rowHeight={rowH}
          layers={AUTONOMY}
          direction="autonomy"
          directionDown
        />
      </DiagramSvg>
    </DiagramFrame>
  );
}

/* ------------------------------------------------------------------ */
/* §17.1 / §17.6 — AdoptionGap                                          */
/* ------------------------------------------------------------------ */

const ADOPTION = [
  { label: 'Using AI regularly', value: 88 },
  { label: 'At least experimenting with agents', value: 62 },
  { label: 'Scaling an agent in one or more functions', value: 23 },
  { label: 'Scaling agents in any single function', value: 10, focal: true },
];

/**
 * A bar chart, left as one. The four hues are gone; the accent marks the bar
 * the paragraph is about.
 */
export function AdoptionGap() {
  return (
    <DiagramFrame
      eyebrow="The experiment-to-scale gap (McKinsey, State of AI 2025)"
      note="Almost everyone is trying agents; almost no one has them running the business yet. Gartner expects the same wave to thin out — more than 40% of agentic-AI projects are forecast to be cancelled by the end of 2027 over cost, unclear value, and weak controls."
      bare
    >
      <div className="space-y-2.5">
        {ADOPTION.map(b => (
          <div key={b.label}>
            <div className="mb-1 flex items-baseline justify-between gap-2">
              <span className={`text-[12px] ${b.focal ? 'text-body' : 'text-subtle'}`}>
                {b.label}
              </span>
              <span
                className={`font-plex text-[12px] font-semibold tabular-nums ${
                  b.focal ? 'text-accent-ink' : 'text-muted'
                }`}
              >
                {b.value}%
              </span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-sm bg-code-bg">
              <div
                className={`h-full rounded-sm ${b.focal ? 'bg-accent' : 'bg-muted/45'}`}
                style={{ width: `${b.value}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </DiagramFrame>
  );
}
