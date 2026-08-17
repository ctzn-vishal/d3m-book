'use client';

import * as React from 'react';

import {
  Connector,
  DiagramFrame,
  DiagramSvg,
  Node,
  PathConnector,
  ring,
  ringArc,
  spoke,
} from '@/components/Book/diagram';

/**
 * Visuals for §17.6 "The Horizon" — the grounded forward look.
 *
 *   - HorizonScorecard   the bull case beside the reality check, both sourced
 *   - AnalystShift       what the analyst's job becomes
 *   - D3MAgentSynthesis  loop  the book's own loop, now operated by agents
 */

/* ------------------------------------------------------------------ */
/* §17.6 — HorizonScorecard                                             */
/* ------------------------------------------------------------------ */

const BULL = [
  {
    value: '33%',
    label: 'of enterprise software will embed agentic AI by 2028, from under 1% in 2024',
    src: 'Gartner',
  },
  {
    value: '15%',
    label: 'of day-to-day work decisions made autonomously by 2028, from 0%',
    src: 'Gartner',
  },
];

const REAL = [
  { value: '~95%', label: 'of enterprise GenAI pilots show no measurable P&L impact', src: 'MIT NANDA' },
  {
    value: '42%',
    label: 'of firms abandoning most AI initiatives — up from 17% a year earlier',
    src: 'S&P Global',
  },
  {
    value: '>40%',
    label: 'of agentic-AI projects forecast to be cancelled by end of 2027',
    src: 'Gartner',
  },
];

/**
 * The book's other legitimate use of the pos/neg pair. Two columns of sourced
 * numbers that are *both true*, one optimistic and one not — a valence, which
 * is the documented exception, and the only honest way to colour this figure.
 */
export function HorizonScorecard() {
  return (
    <DiagramFrame
      eyebrow="Two true stories at once"
      note="Both columns are well sourced and both are true. The forecasts describe where the capability is heading; the failure rates describe what happens when firms deploy it without the discipline this book has been building. The winners treat agents as infrastructure to be governed, not magic to be bought."
    >
      <div className="grid gap-4 sm:grid-cols-2">
        {[
          { title: 'The bull case', rows: BULL, tone: 'pos' as const },
          { title: 'The reality check', rows: REAL, tone: 'neg' as const },
        ].map(col => (
          <div
            key={col.title}
            className={`rounded-md border p-3 ${
              col.tone === 'pos' ? 'border-pos/40 bg-pos/5' : 'border-neg/40 bg-neg/5'
            }`}
          >
            <p
              className={`mb-3 font-plex text-[10px] font-medium uppercase tracking-[0.16em] ${
                col.tone === 'pos' ? 'text-pos' : 'text-neg'
              }`}
            >
              {col.title}
            </p>
            <div className="space-y-3">
              {col.rows.map(r => (
                <div key={r.label} className="flex gap-3">
                  <span
                    className={`w-14 shrink-0 font-plex text-[16px] font-semibold tabular-nums ${
                      col.tone === 'pos' ? 'text-pos' : 'text-neg'
                    }`}
                  >
                    {r.value}
                  </span>
                  <span className="text-[11.5px] leading-snug text-subtle">
                    {r.label} <span className="text-muted">· {r.src}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </DiagramFrame>
  );
}

/* ------------------------------------------------------------------ */
/* §17.6 — AnalystShift                                                 */
/* ------------------------------------------------------------------ */

const SHIFT_FROM = ['Write the SQL by hand', 'Build the dashboard', 'Run the model', 'Format the deck'];
const SHIFT_TO = [
  'Own the semantic layer',
  'Supervise the agents',
  'Verify and approve outputs',
  'Manage AI risk',
];

export function AnalystShift() {
  const W = 792;
  const H = 208;
  const paneW = 336;
  const paneH = 160;
  const y = 16;
  const rowPitch = 26;

  return (
    <DiagramFrame
      eyebrow="The job moves up a level"
      note="Agents absorb the mechanical work and the human moves above the loop. The scarce skill becomes defining the question, curating the metric definitions the agents depend on, and judging whether an answer is trustworthy — exactly the judgment this book trains."
    >
      <DiagramSvg
        width={W}
        height={H}
        title="How the analyst's job changes"
        desc="Four tasks move off the analyst's desk — writing SQL by hand, building dashboards, running models, formatting decks — and four take their place: owning the semantic layer, supervising the agents, verifying and approving outputs, and managing AI risk."
      >
        <Connector
          from={[16 + paneW, y + paneH / 2]}
          to={[W - 16 - paneW, y + paneH / 2]}
          route="straight"
          tone="accent"
          label="BECOMES"
        />

        <Node
          x={16}
          y={y}
          width={paneW}
          height={paneH}
          variant="store"
          align="start"
          label="Doing the task"
          labelDy={-((SHIFT_FROM.length * rowPitch) / 2)}
        >
          {SHIFT_FROM.map((t, i) => (
            <text
              key={t}
              x={16 + 16}
              y={y + 64 + i * rowPitch}
              className="fill-muted font-sans text-[11px]"
            >
              {t}
            </text>
          ))}
        </Node>

        <Node
          x={W - 16 - paneW}
          y={y}
          width={paneW}
          height={paneH}
          variant="focal"
          align="start"
          label="Steering the system"
          labelDy={-((SHIFT_TO.length * rowPitch) / 2)}
        >
          {SHIFT_TO.map((t, i) => (
            <text
              key={t}
              x={W - 16 - paneW + 16}
              y={y + 64 + i * rowPitch}
              className="fill-subtle font-sans text-[11px]"
            >
              {t}
            </text>
          ))}
        </Node>
      </DiagramSvg>
    </DiagramFrame>
  );
}

/* ------------------------------------------------------------------ */
/* §17.6 — D3MAgentSynthesis                                            */
/* ------------------------------------------------------------------ */

const SYNTHESIS_STATIONS = [
  { name: 'Frame the question', sub: 'Part I' },
  { name: 'Query the data', sub: 'text-to-SQL · §17.2' },
  { name: 'Analyse and predict', sub: 'agentic workflows · §17.3' },
  { name: 'Decide', sub: 'evidence becomes action' },
  { name: 'Act and monitor', sub: 'loops · §17.3' },
  { name: 'Learn', sub: 'feedback into the next run' },
];

/**
 * The closing image of the book: the same loop Part 0 opened with, with a
 * human placed deliberately outside the ring.
 *
 * That placement is the argument. Inside the ring the human is one more
 * station and the loop can route around them; above it, every pass has to come
 * back through a person who owns the question and the definitions. The dashed
 * line down into the hub is the only connection that crosses the boundary.
 */
export function D3MAgentSynthesis() {
  const W = 792;
  const H = 568;
  const cx = W / 2;
  const cy = 320;
  const radius = 196;
  const stationW = 156;
  const stationH = 60;
  const hubW = 176;
  const hubH = 72;

  const points = ring(cx, cy, radius, SYNTHESIS_STATIONS.length);

  return (
    <DiagramFrame
      eyebrow="The D3M loop, operated by agents"
      note="This is the same data-to-decision loop the book opened with — only now an agent can turn each station's crank. The work that does not get automated is the work this book exists to teach: framing the question, owning the definitions, and judging the answer."
    >
      <DiagramSvg
        width={W}
        height={H}
        title="The D3M loop, operated by agents"
        desc="Six stations run clockwise around a ring of agents: frame the question, query the data, analyse and predict, decide, act and monitor, learn. A human sits above the ring rather than in it, setting the question, owning the metric definitions, and approving the calls."
      >
        <Node
          x={cx - 176}
          y={8}
          width={352}
          height={56}
          shape="oval"
          variant="focal"
          label="A human, above the loop"
          sublabel="sets the question · owns the metrics · approves the calls"
        />
        {/* Out to the right of the ring, down the clear gutter between the
            two right-hand stations, and back into the hub. Straight down the
            middle would have passed behind "Frame the question", and a
            governance line that disappears under a station is the one line in
            this figure that must not. */}
        <Connector
          from={[cx + 176, 36]}
          to={[cx + hubW / 2, cy]}
          route="hvh"
          mid={700}
          tone="accent"
          dashed
          label="GOVERNS"
          labelSide="right"
        />

        {SYNTHESIS_STATIONS.map((s, i) => (
          <PathConnector
            key={`arc-${s.name}`}
            d={ringArc(cx, cy, radius, SYNTHESIS_STATIONS.length, i, 0.24)}
          />
        ))}
        {SYNTHESIS_STATIONS.map((s, i) => (
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
          label="D3M agents"
          sublabel="one shared record"
        />

        {SYNTHESIS_STATIONS.map((s, i) => (
          <Node
            key={s.name}
            x={points[i][0] - stationW / 2}
            y={points[i][1] - stationH / 2}
            width={stationW}
            height={stationH}
            label={s.name}
            sublabel={s.sub}
          />
        ))}
      </DiagramSvg>
    </DiagramFrame>
  );
}
