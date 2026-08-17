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
  TreeBus,
  Zone,
  centeredRow,
  ring,
  ringArc,
  spoke,
} from '@/components/Book/diagram';

/**
 * Part 0's visuals — the map of the book, and the operating system the book
 * assumes.
 *
 *   - LadderPosition   process strip   the seven-rung decision ladder
 *   - ArtefactFamilyTree  tree         Decision Question Card -> Decision Memo
 *   - EvidenceStackMap    layer stack  six evidence languages, one per Part
 *   - CasePortfolio       matrix       which case serves which method
 *   - DataGenerationMap   data flow    where business data comes from
 *   - StorageStackMap     medallion    the storage tiers and their jobs
 *   - UseCaseRouter       flowchart    business question -> evidence workflow
 *   - DataDecisionLoop    loop         data -> decision -> new data
 *
 * All eight render through components/Book/diagram. The twelve-copy `const C`
 * palette and the local `Card` are gone; see docs/DIAGRAMS.md.
 */

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
  { label: 'What happened?', lang: 'Description', part: 'I' },
  { label: 'Where and for whom?', lang: 'Visual comparison', part: 'II' },
  { label: 'What caused it?', lang: 'Causal designs', part: 'III' },
  { label: 'How much does X matter?', lang: 'Regression, elasticity', part: 'III' },
  { label: 'What is likely next?', lang: 'Prediction', part: 'IV' },
  { label: 'What does the text or image say?', lang: 'AI workflows', part: 'V' },
  { label: 'How do we operate this?', lang: 'System view', part: 'VI' },
];

/**
 * A process strip, not a chart. Seven stations on one rail, at most one of them
 * focal.
 *
 * The rungs used to carry seven different colours — one per Part — which made
 * the ladder look like a legend for something. It isn't: the Parts are ordered,
 * so their position on the rail already says which is which, and the only
 * question the reader actually has is *where am I now*. That's the one thing
 * colour is spent on.
 */
export function LadderPosition({ current, compact = false, caption }: LadderPositionProps) {
  const cellW = compact ? 104 : 112;
  const marginX = compact ? 32 : 28;
  const W = marginX * 2 + cellW * LADDER_RUNGS.length;
  const H = compact ? 88 : 184;
  const cy = compact ? 28 : 96;
  const r = compact ? 16 : 24;

  return (
    <DiagramFrame
      eyebrow={compact ? undefined : 'The decision ladder'}
      note={caption}
      bare={compact}
    >
      <DiagramSvg
        width={W}
        height={H}
        title="The decision ladder"
        desc={
          'Seven decision questions in ascending order, from "what happened?" through ' +
          '"what caused it?" and "what is likely next?" to "how do we operate this?", ' +
          'each paired with the evidence language and the Part of the book that teaches it' +
          (current === undefined ? '.' : `. The reader is at rung ${current + 1}.`)
        }
      >
        {/* Rail first, so the station circles paint over its ends. Endpoints
            share a y, which is the one case a straight line is legal. */}
        {LADDER_RUNGS.slice(0, -1).map((rung, i) => (
          <line
            key={rung.label}
            x1={marginX + cellW * i + cellW / 2 + r}
            y1={cy}
            x2={marginX + cellW * (i + 1) + cellW / 2 - r}
            y2={cy}
            stroke={T.ruleStrong}
            strokeWidth={S.base}
          />
        ))}

        {LADDER_RUNGS.map((rung, i) => {
          const cx = marginX + cellW * i + cellW / 2;
          const here = current === i;
          return (
            <g key={rung.label}>
              {!compact && (
                <SvgText
                  x={cx}
                  y={40}
                  width={cellW - 8}
                  anchorY="middle"
                  variant="nodeSm"
                  tone={here ? 'ink' : 'muted'}
                >
                  {rung.lang}
                </SvgText>
              )}
              <circle
                cx={cx}
                cy={cy}
                r={r}
                fill={here ? T.accentTint : T.paper}
                stroke={here ? T.accent : T.rule}
                strokeWidth={here ? S.strong : S.base}
              />
              <SvgText x={cx} y={cy + 4} variant="node" tone={here ? 'accent' : 'muted'}>
                {rung.part}
              </SvgText>
              <SvgText
                x={cx}
                y={compact ? cy + r + 16 : cy + r + 20}
                width={cellW - 8}
                variant="body"
                tone={here ? 'ink' : 'muted'}
              >
                {rung.label}
              </SvgText>
            </g>
          );
        })}
      </DiagramSvg>
    </DiagramFrame>
  );
}

/* ------------------------------------------------------------------ */
/* ArtefactFamilyTree — the five one-page documents, in order          */
/* ------------------------------------------------------------------ */

const ARTEFACTS = [
  {
    name: 'Decision Question Card',
    section: '§9.1',
    purpose: 'What action, on what unit, with what counterfactual?',
  },
  {
    name: 'Predictive Task Contract',
    section: '§14.2',
    purpose: 'What target, for what unit, on what horizon, with what features?',
  },
  {
    name: 'Model Card',
    section: '§15.5',
    purpose: 'What does this model do, where does it fail, who owns it?',
  },
  {
    name: 'AI Workflow Card',
    section: '§22.1',
    purpose: 'What does this workflow do, what governs it, who responds?',
  },
  {
    name: 'Decision Memo',
    section: '§24.1',
    purpose: 'What is the recommendation, what evidence supports it, what next?',
  },
];

/**
 * A chain, drawn as a rail with five stations — **not** a tree, despite the
 * name it has carried since Part 0 was written.
 *
 * The audit filed this under "tree", and the name invites it, but the content
 * is strictly linear: five artefacts, each extending the discipline of the one
 * above, in ascending section order. Drawing it as a tree would need a branch
 * that isn't there, and a five-deep tree is over the depth budget anyway. A
 * rail says "one after another, and each one carries the last forward", which
 * is the actual claim.
 *
 * The Decision Memo is the single focal station: it is the artefact you sign,
 * and the one the other four exist to make defensible.
 */
export function ArtefactFamilyTree() {
  const W = 792;
  const rowH = 64;
  const pitch = 76;
  const top = 24;
  const railX = 44;
  const cardX = 84;
  const cardW = 684;
  const H = top + pitch * (ARTEFACTS.length - 1) + rowH + 24;

  return (
    <DiagramFrame
      eyebrow="The artefact family"
      note="Each artefact extends the discipline of the one above. The card you write at §9.1 grows into the memo you sign at §24.1 — and if the memo is ever questioned, the chain is what you produce."
    >
      <DiagramSvg
        width={W}
        height={H}
        title="The artefact family"
        desc="Five one-page documents in ascending order: a Decision Question Card, a Predictive Task Contract, a Model Card, an AI Workflow Card, and finally a Decision Memo. Each states a question the next one depends on having answered."
      >
        {/* One continuous rail rather than four separate arrows: the sequence
            is one movement, and four arrowheads would break it into four. */}
        <line
          x1={railX}
          y1={top + rowH / 2}
          x2={railX}
          y2={top + pitch * (ARTEFACTS.length - 1) + rowH / 2}
          stroke={T.ruleStrong}
          strokeWidth={S.base}
        />
        {ARTEFACTS.map((a, i) => {
          const y = top + i * pitch;
          const cy = y + rowH / 2;
          const last = i === ARTEFACTS.length - 1;
          return (
            <g key={a.name}>
              <circle
                cx={railX}
                cy={cy}
                r={6}
                fill={last ? T.accent : T.ground}
                stroke={last ? T.accent : T.ruleStrong}
                strokeWidth={S.base}
              />
              <line
                x1={railX + 8}
                y1={cy}
                x2={cardX}
                y2={cy}
                stroke={T.rule}
                strokeWidth={S.thin}
              />
              <Node
                x={cardX}
                y={y}
                width={cardW}
                height={rowH}
                align="start"
                variant={last ? 'focal' : 'step'}
                label={a.name}
                sublabel={a.purpose}
              />
              <SvgText
                x={cardX + cardW - 16}
                y={y + 22}
                variant="sub"
                tone="soft"
                textAnchor="end"
              >
                {a.section}
              </SvgText>
            </g>
          );
        })}
      </DiagramSvg>
    </DiagramFrame>
  );
}

/* ------------------------------------------------------------------ */
/* EvidenceStackMap — six evidence languages, one per Part             */
/* ------------------------------------------------------------------ */

const EVIDENCE_LAYERS = [
  {
    tag: 'I',
    name: 'What happened?',
    sub: 'Description, metrics',
    note: 'Data Language Studio §4.1',
  },
  {
    tag: 'II',
    name: 'What should the eye see first?',
    sub: 'Visual evidence',
    note: 'Visual Decision Brief §8.2',
  },
  {
    tag: 'III',
    name: 'What caused it?',
    sub: 'Causal designs',
    note: 'Pricing & Promotion §13.4',
  },
  {
    tag: 'IV',
    name: 'What is likely next?',
    sub: 'Prediction & segmentation',
    note: 'Customer Intelligence §17.4',
  },
  {
    tag: 'V',
    name: 'What does the text or image say?',
    sub: 'AI workflows',
    note: 'Customer Voice Intelligence §22.2',
  },
  {
    tag: 'VI',
    name: 'How do we operate this?',
    sub: 'System view',
    note: 'Final Integrative Case §25.1',
  },
];

/**
 * A layer stack — the one type where equal-width, equal-height bands are the
 * whole message. Six evidence languages, each strictly above the last in what
 * it lets you claim.
 *
 * No focal layer. Every band is a peer at a different level and the reader is
 * standing outside all six; accenting one would answer a question Part 0 has
 * not asked yet.
 */
export function EvidenceStackMap() {
  const W = 792;
  const rowH = 56;
  const H = rowH * EVIDENCE_LAYERS.length + 48;

  return (
    <DiagramFrame
      eyebrow="Six evidence languages, one per Part"
      note="Each Part teaches one evidence language and ends with a Studio that ships its capstone artefact. The order matters: a claim at any level assumes the levels below it were done honestly."
    >
      <DiagramSvg
        width={W}
        height={H}
        title="Six evidence languages"
        desc="A stack of six decision questions in ascending order of what they let you claim — what happened, what the eye should see, what caused it, what is likely next, what the text says, and how to operate it — each paired with its evidence language and the Studio that ends that Part."
      >
        <Layers
          x={48}
          y={16}
          width={W - 72}
          rowHeight={rowH}
          layers={EVIDENCE_LAYERS}
          // Part I sits at the top and Part VI at the bottom, so the claims
          // get stronger going *down* — the arrow has to agree with the order
          // on the page, not with the usual "up is more abstract" reflex.
          direction="what you can claim"
          directionDown
        />
      </DiagramSvg>
    </DiagramFrame>
  );
}

/* ------------------------------------------------------------------ */
/* StorageStackMap — the storage stack as a division of labour         */
/* ------------------------------------------------------------------ */

const TRANSACTIONAL = [
  { name: 'Operational SQL', question: 'Can the business record the next transaction correctly?' },
  { name: 'NoSQL and search', question: 'Can the app retrieve the right object quickly?' },
];

const ANALYTICAL = [
  { name: 'Lake and files', question: 'Can the firm preserve data before every use is known?' },
  {
    name: 'Warehouse or lakehouse',
    question: 'Can managers scan history across customers, products, and time?',
    focal: true,
  },
  { name: 'Local analytics', question: 'Can a small team investigate without waiting on production?' },
  {
    name: 'Vector and graph stores',
    question: 'Can the workflow retrieve related ideas, documents, or entities?',
  },
];

/**
 * Six storage systems, grouped by the only distinction that matters to a
 * manager: does this system *record the next event*, or does it *scan many
 * past events*?
 *
 * The previous version was a six-row table with a colour chip per row — six
 * hues for six systems, which said "these are six different things" when the
 * chapter's actual claim is that they fall into two camps. Two zones say it
 * instead, and cost no colour at all.
 *
 * The warehouse is the single focal node: it is where a manager's questions
 * get answered, and the tier the rest of the stack exists to feed.
 */
export function StorageStackMap() {
  const W = 792;
  const H = 320;
  const nodeW = 176;
  const nodeH = 88;
  const rowY = [72, 176];

  const leftZone = { x: 16, y: 40, width: 224, height: 224 };
  const rightZone = { x: 344, y: 40, width: 432, height: 224 };
  const leftX = leftZone.x + (leftZone.width - nodeW) / 2;
  const rightXs = [rightZone.x + 24, rightZone.x + 232];

  return (
    <DiagramFrame
      eyebrow="The storage stack is a division of labour"
      note="The practical distinction is transactional versus analytical: one system records the next event; another scans many past events to support a decision. The vendor names and file formats are detail beneath that line."
    >
      <DiagramSvg
        width={W}
        height={H}
        title="The storage stack"
        desc="Six storage systems in two groups. Operational SQL and NoSQL record the next event; lakes, warehouses, local analytics, and vector stores scan many past events. Data is ingested from the first group into the second, where the warehouse is the tier managers actually query."
      >
        <Zone {...leftZone} label="RECORD THE NEXT EVENT" />
        <Zone {...rightZone} label="SCAN MANY PAST EVENTS" />

        <Connector
          from={[leftZone.x + leftZone.width, 152]}
          to={[rightZone.x, 152]}
          route="straight"
          tone="accent"
          label="INGEST"
        />

        {TRANSACTIONAL.map((s, i) => (
          <Node
            key={s.name}
            x={leftX}
            y={rowY[i]}
            width={nodeW}
            height={nodeH}
            variant="store"
            label={s.name}
            sublabel={s.question}
          />
        ))}
        {ANALYTICAL.map((s, i) => (
          <Node
            key={s.name}
            x={rightXs[i % 2]}
            y={rowY[Math.floor(i / 2)]}
            width={nodeW}
            height={nodeH}
            variant={s.focal ? 'focal' : 'store'}
            label={s.name}
            sublabel={s.question}
          />
        ))}

        <Legend
          y={H - 12}
          width={W}
          x={16}
          items={[
            { kind: 'focal', label: 'Where managerial questions get answered' },
            { kind: 'store', label: 'Holds state' },
          ]}
          pitch={352}
        />
      </DiagramSvg>
    </DiagramFrame>
  );
}

/* ------------------------------------------------------------------ */
/* DataGenerationMap — where business data comes from                  */
/* ------------------------------------------------------------------ */

const DATA_SOURCES = [
  {
    title: 'Customer behaviour',
    examples: 'Purchases, clicks, searches, visits, returns, ratings, reviews',
    decision: 'Demand, loyalty, churn, product-market fit',
  },
  {
    title: 'Business operations',
    examples: 'Inventory, invoices, CRM records, shipments, staffing, contracts',
    decision: 'Margin, service quality, capacity, working capital',
  },
  {
    title: 'Digital systems',
    examples: 'App events, web logs, ad auctions, recommendation impressions',
    decision: 'Funnels, personalisation, attribution, experimentation',
  },
  {
    title: 'Physical world',
    examples: 'Sensors, location, cameras, store traffic, delivery scans',
    decision: 'Utilisation, loss prevention, routing, field execution',
  },
  {
    title: 'Human language',
    examples: 'Support tickets, chats, call transcripts, emails, documents',
    decision: 'Customer voice, compliance, knowledge retrieval, workflow routing',
  },
  {
    title: 'AI workflows',
    examples: 'Prompts, responses, citations, tool calls, evals, human review',
    decision: 'Automation quality, risk controls, continuous improvement',
  },
];

/**
 * A three-stage flow above a catalogue.
 *
 * The six sources are a table — source, examples, business use — and the
 * skill's first rule is that if a three-column table communicates the same
 * thing, pick the table. What a table cannot say is the *mechanism*, which is
 * the chapter's actual point: data is a by-product. Something happened, a
 * system wrote part of it down, and only afterwards did anyone ask a question
 * of what was written.
 *
 * So: a schematic for the mechanism, a table for the catalogue. The focal node
 * is the trace, because that is the thing readers mistake for the reality.
 */
export function DataGenerationMap() {
  const W = 792;
  const H = 120;
  const nodeW = 200;
  const nodeH = 72;
  // 3 x 200 + 2 x 80 = 760, inside a 792 viewBox. Worth checking the sum by
  // hand: centeredRow will happily return a negative start and let the last
  // node run off the canvas.
  const xs = centeredRow(0, W, 3, nodeW, 80);
  const y = 16;

  return (
    <DiagramFrame
      eyebrow="Where business data comes from"
      note="Data is usually a trace of work that already happened. The trace can be useful, but it is never the whole reality — and the gap between the two is where most analytical mistakes live."
    >
      <DiagramSvg
        width={W}
        height={H}
        title="How business data comes to exist"
        desc="An activity happens, a system records a trace of it, and a question is asked of the trace later. The trace is the only part anyone can analyse, and it is always narrower than the activity that produced it."
      >
        <Connector
          from={[xs[0] + nodeW, y + nodeH / 2]}
          to={[xs[1], y + nodeH / 2]}
          route="straight"
          label="RECORDED BY"
        />
        <Connector
          from={[xs[1] + nodeW, y + nodeH / 2]}
          to={[xs[2], y + nodeH / 2]}
          route="straight"
          label="READ AS"
        />
        <Node
          x={xs[0]}
          y={y}
          width={nodeW}
          height={nodeH}
          variant="input"
          label="Something happens"
          sublabel="a customer acts, a process runs"
        />
        <Node
          x={xs[1]}
          y={y}
          width={nodeW}
          height={nodeH}
          variant="focal"
          label="A trace is written"
          sublabel="a row, a log line, a document"
        />
        <Node
          x={xs[2]}
          y={y}
          width={nodeW}
          height={nodeH}
          variant="step"
          label="A question is asked"
          sublabel="months later, by someone else"
        />
      </DiagramSvg>

      <table className="mt-4 w-full border-collapse text-left">
        <thead>
          <tr className="border-b border-border">
            <th className="py-2 pr-3 font-plex text-[10px] font-medium uppercase tracking-[0.16em] text-muted">
              Where the trace comes from
            </th>
            <th className="py-2 pr-3 font-plex text-[10px] font-medium uppercase tracking-[0.16em] text-muted">
              What gets written down
            </th>
            <th className="py-2 font-plex text-[10px] font-medium uppercase tracking-[0.16em] text-muted">
              What it is read for
            </th>
          </tr>
        </thead>
        <tbody>
          {DATA_SOURCES.map(source => (
            <tr key={source.title} className="border-b border-border last:border-b-0">
              <td className="py-2 pr-3 align-top text-[12px] font-semibold text-body">
                {source.title}
              </td>
              <td className="py-2 pr-3 align-top text-[12px] leading-snug text-subtle">
                {source.examples}
              </td>
              <td className="py-2 align-top text-[12px] leading-snug text-muted">
                {source.decision}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </DiagramFrame>
  );
}

/* ------------------------------------------------------------------ */
/* UseCaseRouter — business question to evidence workflow              */
/* ------------------------------------------------------------------ */

const ROUTES = [
  {
    question: 'What is happening?',
    workflow: 'Monitoring and KPI dashboards',
    asset: 'Metric card, alert, scorecard',
    home: 'I–II',
  },
  {
    question: 'Where and for whom?',
    workflow: 'Segmentation, cohorts, drilldowns',
    asset: 'Segment profile, cohort view',
    home: 'II–IV',
  },
  {
    question: 'Did our action cause it?',
    workflow: 'Experiments and causal designs',
    asset: 'Identification memo, effect estimate',
    home: 'III',
  },
  {
    question: 'What is likely next?',
    workflow: 'Prediction, forecasting, risk scoring',
    asset: 'Predictive task contract, model card',
    home: 'IV',
  },
  {
    question: 'What should we show first?',
    workflow: 'Ranking and recommendation',
    asset: 'Ranked list, threshold rule',
    home: 'IV',
  },
  {
    question: 'What does the document say?',
    workflow: 'Extraction, search, RAG, AI workflows',
    asset: 'AI workflow card, review queue',
    home: 'V',
  },
];

/**
 * A router: one entry, six destinations, drawn as a bus.
 *
 * Six separate elbows out of one node's right edge cannot be routed without
 * crossings — six parallel vertical runs 12px apart need 72px of clear gutter,
 * and there is never that much between two columns. A bus solves it the way
 * every wiring diagram does: one line out, one spine, one branch per
 * destination.
 *
 * The focal element is the entry, not any destination. The chapter's claim is
 * that routing the question happens *before* choosing a method, so the thing
 * to look at first is the question itself.
 */
export function UseCaseRouter() {
  const W = 792;
  const rowH = 56;
  const pitch = 68;
  const top = 20;
  const destX = 272;
  const destW = 320;
  const H = top + pitch * (ROUTES.length - 1) + rowH + 20;
  const centreY = top + (pitch * (ROUTES.length - 1) + rowH) / 2;

  return (
    <DiagramFrame
      eyebrow="Use-case router"
      note="The same source data can support several of these workflows. The manager's first job is to route the question, before anyone chooses a method — pick the workflow first and the question quietly changes to fit it."
    >
      <DiagramSvg
        width={W}
        height={H}
        title="Routing a business question to an evidence workflow"
        desc="One business question enters and is routed to one of six evidence workflows — monitoring, segmentation, causal design, prediction, ranking, or document AI — each of which produces a different artefact and is taught in a different Part of the book."
      >
        <TreeBus
          orientation="horizontal"
          parentX={192}
          parentY={centreY}
          childXs={ROUTES.map((_, i) => top + i * pitch + rowH / 2)}
          childY={destX}
        />

        <Node
          x={16}
          y={centreY - 40}
          width={176}
          height={80}
          shape="oval"
          variant="focal"
          label="A business question"
          sublabel="before any method"
        />

        {ROUTES.map((route, i) => {
          const y = top + i * pitch;
          return (
            <g key={route.question}>
              <Node
                x={destX}
                y={y}
                width={destW}
                height={rowH}
                align="start"
                variant="step"
                label={route.question}
                sublabel={route.workflow}
              />
              {/* Where this lives in the book, as a corner chip rather than a
                  fourth column — a right-hand column of Part numerals collided
                  with the artefact text at every width that fit the artefact. */}
              <EyebrowLabel
                x={destX + destW - 12}
                y={y + 18}
                anchor="end"
                tone="soft"
                masked={false}
              >
                {`PART ${route.home}`}
              </EyebrowLabel>
              <SvgText
                x={destX + destW + 20}
                y={y + rowH / 2 + 4}
                width={W - destX - destW - 40}
                anchorY="middle"
                variant="body"
                tone="muted"
                textAnchor="start"
              >
                {route.asset}
              </SvgText>
            </g>
          );
        })}
      </DiagramSvg>
    </DiagramFrame>
  );
}

/* ------------------------------------------------------------------ */
/* DataDecisionLoop — data to decision, and back                       */
/* ------------------------------------------------------------------ */

const LOOP_STATIONS = [
  { name: 'Activity', sub: 'a customer acts, a model responds' },
  { name: 'Source record', sub: 'transaction, log, ticket, prompt' },
  { name: 'Storage', sub: 'warehouse, feature table, index' },
  { name: 'Evidence asset', sub: 'metric, chart, estimate, prediction' },
  { name: 'Decision', sub: 'a price or policy changes', focal: true },
  { name: 'Feedback', sub: 'the action is monitored' },
];

/**
 * A loop, with spokes — the type's defining feature and the reason this isn't
 * just a circular process.
 *
 * Six stations advance clockwise; each also writes back to one shared centre.
 * Take the spokes away and the figure says "these six steps repeat", which is
 * the weaker half of the claim. With them it says what Part 0 actually
 * argues: every pass changes the business, and the changed business is what
 * generates the next round of data.
 *
 * The focal station is the decision. It is the only station in the ring where
 * a human is accountable, and the only one the rest of the loop exists for.
 */
export function DataDecisionLoop() {
  const W = 792;
  const H = 512;
  const cx = W / 2;
  const cy = 248;
  const radius = 216;
  const stationW = 152;
  const stationH = 64;
  const hubW = 200;
  const hubH = 88;

  const points = ring(cx, cy, radius, LOOP_STATIONS.length);

  return (
    <DiagramFrame
      eyebrow="The data-to-decision loop"
      note="The loop is circular, not linear. Every decision changes the business, and that changed business generates the next round of data — which is why the dashed spokes matter more than the ring: they are what makes the next pass different from the last."
    >
      <DiagramSvg
        width={W}
        height={H}
        title="The data-to-decision loop"
        desc="Six stations run clockwise — an activity happens, a record is written, it is stored and transformed, an evidence asset is produced, a decision is taken, and the result is monitored — and each station also writes back to the shared business record at the centre, so the next pass around the loop starts from a changed business."
      >
        {/* Arcs and spokes before stations, so the station masks clip them. */}
        {LOOP_STATIONS.map((s, i) => (
          <PathConnector
            key={`arc-${s.name}`}
            // Trimmed just enough that the arc clears the station's
            // corners. Trim harder and six arcs read as six stray arrows
            // rather than one ring.
            d={ringArc(cx, cy, radius, LOOP_STATIONS.length, i, 0.24)}
          />
        ))}
        {LOOP_STATIONS.map((s, i) => (
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
          label="The business itself"
          sublabel="changed by every pass"
        />

        {LOOP_STATIONS.map((s, i) => (
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

      </DiagramSvg>
    </DiagramFrame>
  );
}

/* ------------------------------------------------------------------ */
/* CasePortfolio — which case serves which method                      */
/* ------------------------------------------------------------------ */

const PARTS = ['I', 'II', 'III', 'IV', 'V', 'VI'];

const PORTFOLIO = [
  {
    name: 'Bean & Basket Coffee',
    parts: PARTS,
    note: 'Reviews, tickets, transactions, panel data, campaigns, products, stores, and a knowledge base',
    through: true,
  },
  { name: 'Progresso Soup', parts: ['II', 'III'], note: 'Visual evidence, fixed effects, elasticity' },
  { name: 'Milk Field Data', parts: ['III'], note: 'Quasi-experiment, heterogeneous effects' },
  { name: 'Zillow Colorado', parts: ['III'], note: 'Difference-in-differences, synthetic control' },
  { name: 'BAV Fast Food', parts: ['IV'], note: 'PCA, perceptual maps' },
  { name: 'Airbnb (illustrative)', parts: ['IV'], note: 'Numeric prediction, residuals' },
  { name: 'Yelp Reviews', parts: ['V'], note: 'Sentiment, topics, GPT measurement' },
  { name: 'Goose Island Twitter', parts: ['V'], note: 'Emotion vs. sentiment' },
  { name: 'Earnings Calls', parts: ['V'], note: 'Evasiveness measurement' },
  { name: 'Job Postings', parts: ['V'], note: 'Construct measurement' },
];

/**
 * A coverage matrix: cases down, Parts across.
 *
 * The previous version gave each of ten cases its own colour, which is ten
 * hues encoding nothing — the reader cannot look up "which case will I meet in
 * Part III?" from a colour key. A matrix answers that question by construction,
 * and it also makes the shape of the portfolio visible: Bean & Basket is the
 * only row that spans every column, and Part V is where the standalone cases
 * cluster.
 */
export function CasePortfolio() {
  const W = 792;
  const labelW = 196;
  const colW = 40;
  const gridX = 220;
  const noteX = gridX + PARTS.length * colW + 24;
  const headerY = 32;
  const rowH = 28;
  const top = 44;
  const H = top + PORTFOLIO.length * rowH + 24;

  return (
    <DiagramFrame
      eyebrow="The case portfolio"
      note="Bean & Basket is the through-line and appears in every Part. The standalone cases are appended outside chapter prose; they give each method a second testing ground, and they cluster in Part V because unstructured data is where one case is never enough."
    >
      <DiagramSvg
        width={W}
        height={H}
        title="Which case appears in which Part"
        desc="A coverage matrix of ten case datasets against the book's six Parts. Bean & Basket runs through every Part as the continuous through-line; the nine standalone cases each appear in one or two Parts, concentrated in Part V."
      >
        {PARTS.map((part, i) => (
          <SvgText
            key={part}
            x={gridX + i * colW + colW / 2}
            y={headerY}
            variant="eyebrow"
            tone="soft"
          >
            {part}
          </SvgText>
        ))}
        <SvgText x={gridX - 12} y={headerY} variant="eyebrow" tone="soft" textAnchor="end">
          PART
        </SvgText>

        {PORTFOLIO.map((row, r) => {
          const y = top + r * rowH;
          return (
            <g key={row.name}>
              {r > 0 && (
                <line x1={16} y1={y} x2={W - 16} y2={y} stroke={T.rule} strokeWidth={S.thin} />
              )}
              <SvgText
                x={16}
                y={y + rowH / 2 + 4}
                width={labelW}
                anchorY="middle"
                variant={row.through ? 'node' : 'body'}
                tone={row.through ? 'accent' : 'ink'}
                textAnchor="start"
              >
                {row.name}
              </SvgText>
              {PARTS.map((part, c) => {
                const hit = row.parts.includes(part);
                if (!hit) {
                  return (
                    <circle
                      key={part}
                      cx={gridX + c * colW + colW / 2}
                      cy={y + rowH / 2}
                      r={2}
                      fill={T.rule}
                    />
                  );
                }
                return (
                  <rect
                    key={part}
                    x={gridX + c * colW + colW / 2 - 10}
                    y={y + rowH / 2 - 6}
                    width={20}
                    height={12}
                    rx={3}
                    fill={row.through ? T.accentTint : T.paperAlt}
                    stroke={row.through ? T.accent : T.muted}
                    strokeWidth={S.thin}
                  />
                );
              })}
              <SvgText
                x={noteX}
                y={y + rowH / 2 + 4}
                width={W - noteX - 16}
                anchorY="middle"
                variant="sub"
                tone="muted"
                textAnchor="start"
              >
                {row.note}
              </SvgText>
            </g>
          );
        })}
      </DiagramSvg>
    </DiagramFrame>
  );
}
