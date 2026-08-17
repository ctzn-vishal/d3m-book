import * as React from 'react';

import {
  ArrowLabel,
  Cardinality,
  Connector,
  DiagramFrame,
  DiagramSvg,
  Entity,
  Legend,
  Node,
  S,
  SvgText,
  T,
  entityHeight,
} from '@/components/Book/diagram';

/**
 * Part I's visual layer — the conceptual diagrams for grain, structure,
 * variable types, query pipelines, joins, reshaping, and quality triage.
 *
 * These are the components the reader meets first, in the chapters that teach
 * the vocabulary everything later depends on.
 */

type GrainCase = {
  case: string;
  grain: string;
  rows: string;
  valid_question: string;
  invalid_question: string;
  next_move: string;
};

type StructureCase = {
  structure: string;
  case: string;
  grain: string;
  rows: string;
  manager_question: string;
  best_visual: string;
  limitation: string;
};

type VariableCase = {
  variable: string;
  case: string;
  example: string;
  type: string;
  sensible_use: string;
  bad_use: string;
};

type ZillowWideLongData = {
  metadata: {
    original_shape: string;
    teaching_shape: string;
    months: string[];
  };
  wideRows: Array<Record<string, string | number>>;
  longRows: Array<{ state: string; month: string; zhvi: number }>;
  series: Array<{ state: string; month: string; zhvi: number; index: number }>;
};

type QualityCheck = {
  check: string;
  case: string;
  finding: string;
  risk: string;
  response: string;
};

function valueExtent<T>(items: T[], accessor: (item: T) => number): [number, number] {
  const values = items.map(accessor).filter(Number.isFinite);
  return [Math.min(...values), Math.max(...values)];
}

function scale(domain: [number, number], range: [number, number]) {
  const [d0, d1] = domain;
  const [r0, r1] = range;
  const span = d1 - d0 || 1;
  return (value: number) => r0 + ((value - d0) / span) * (r1 - r0);
}

function dateValue(month: string) {
  const [year, mm] = month.split('-').map(Number);
  return year + ((mm ?? 1) - 1) / 12;
}

function groupBy<T>(items: T[], key: (item: T) => string): Record<string, T[]> {
  return items.reduce<Record<string, T[]>>((acc, item) => {
    const k = key(item);
    acc[k] = acc[k] ?? [];
    acc[k].push(item);
    return acc;
  }, {});
}

function formatMoney(value: number) {
  return `$${Math.round(value / 1000)}k`;
}

/* ------------------------------------------------------------------ */
/* GrainDecisionMap — what each row contract can and cannot support     */
/* ------------------------------------------------------------------ */

/**
 * The one place in Part I where the pos/neg pair genuinely earns its keep: the
 * whole content of this figure is *can support* against *cannot support*.
 * That's a valence, not a category, which is exactly the documented exception
 * to the focal rule.
 */
export function GrainDecisionMap({ data }: { data: { cases: GrainCase[] } }) {
  return (
    <div className="not-prose overflow-hidden rounded-md border border-border bg-card">
      <div className="border-b border-border bg-code-bg px-5 py-4">
        <p className="font-plex text-[10px] font-medium uppercase tracking-[0.16em] text-muted">
          Grain first
        </p>
        <h3 className="mt-1 text-lg font-semibold text-body">The row contract decides the claim.</h3>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted">
          A dataset can be rich and still answer the wrong question if the row does not match the
          decision unit.
        </p>
      </div>
      <div className="grid gap-4 p-4 lg:grid-cols-3">
        {data.cases.map(item => (
          <article key={item.case} className="rounded-md border border-border bg-surface p-4">
            <p className="text-sm font-semibold text-body">{item.case}</p>
            <p className="mt-1 font-plex text-[10px] uppercase tracking-[0.16em] text-muted">
              {item.rows} rows
            </p>
            <div className="mt-4 rounded-md border border-border bg-code-bg p-3 text-sm font-semibold text-body">
              {item.grain}
            </div>
            <dl className="mt-4 space-y-3 text-xs leading-relaxed">
              <div>
                <dt className="font-semibold text-pos">Can support</dt>
                <dd className="text-subtle">{item.valid_question}</dd>
              </div>
              <div>
                <dt className="font-semibold text-neg">Cannot support</dt>
                <dd className="text-subtle">{item.invalid_question}</dd>
              </div>
            </dl>
            <p className="mt-3 border-l-2 border-border-strong pl-3 text-xs leading-relaxed text-muted">
              {item.next_move}
            </p>
          </article>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* StructureCaseGrid — the three structures on real case data           */
/* ------------------------------------------------------------------ */

export function StructureCaseGrid({ data }: { data: { structures: StructureCase[] } }) {
  return (
    <div className="not-prose grid gap-4 md:grid-cols-2">
      {data.structures.map(item => (
        <article key={item.structure} className="rounded-md border border-border bg-card p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-plex text-[10px] font-medium uppercase tracking-[0.16em] text-muted">
                {item.structure}
              </p>
              <h3 className="mt-1 text-base font-semibold text-body">{item.case}</h3>
            </div>
            {/* The row count used to be a coloured pill keyed to the case —
                five cases, five hues, no hierarchy. It's a count; it reads as
                a count. */}
            <span className="rounded border border-border bg-code-bg px-2 py-1 font-plex text-[10px] text-muted">
              {item.rows}
            </span>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-md bg-code-bg p-3">
              <p className="font-plex text-[10px] font-medium uppercase tracking-[0.16em] text-muted">
                Grain
              </p>
              <p className="mt-1 text-sm text-subtle">{item.grain}</p>
            </div>
            <div className="rounded-md bg-code-bg p-3">
              <p className="font-plex text-[10px] font-medium uppercase tracking-[0.16em] text-muted">
                Default visual
              </p>
              <p className="mt-1 text-sm text-subtle">{item.best_visual}</p>
            </div>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-subtle">
            <span className="font-semibold text-body">Question: </span>
            {item.manager_question}
          </p>
          <p className="mt-3 border-l-2 border-accent pl-3 text-xs leading-relaxed text-muted">
            {item.limitation}
          </p>
        </article>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* VariableTypeCards — column, type, sensible use, bad use              */
/* ------------------------------------------------------------------ */

export function VariableTypeCards({ data }: { data: { variables: VariableCase[] } }) {
  return (
    <div className="not-prose overflow-hidden rounded-md border border-border bg-card">
      <div className="grid border-b border-border bg-code-bg px-4 py-3 font-plex text-[10px] font-medium uppercase tracking-[0.16em] text-muted md:grid-cols-[1fr_0.7fr_1fr_1.5fr_1.5fr]">
        <span>Column</span>
        <span>Case</span>
        <span>Type</span>
        <span>Sensible use</span>
        <span>Bad use</span>
      </div>
      {data.variables.map(item => (
        <div
          key={`${item.case}-${item.variable}`}
          className="grid gap-2 border-b border-border px-4 py-3 text-sm last:border-b-0 md:grid-cols-[1fr_0.7fr_1fr_1.5fr_1.5fr] md:items-start"
        >
          <div>
            <p className="font-plex text-xs font-semibold text-body">{item.variable}</p>
            <p className="mt-1 text-xs text-muted">{item.example}</p>
          </div>
          <p className="text-subtle">{item.case}</p>
          <p className="font-medium text-body">{item.type}</p>
          <p className="text-subtle">{item.sensible_use}</p>
          <p className="text-neg">{item.bad_use}</p>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* QueryPipelineDiagram — the five operations behind every query        */
/* ------------------------------------------------------------------ */

const PIPELINE = [
  { label: 'Filter', detail: 'keep 2025 rows' },
  { label: 'Calculate', detail: 'price x quantity' },
  { label: 'Group', detail: 'city x category' },
  { label: 'Summarize', detail: 'sum revenue' },
  { label: 'Sort', detail: 'largest first' },
];

/**
 * A data flow, five steps on one axis — so the connectors are plain straight
 * lines, which is the one case where a straight line is the *right* answer
 * rather than a dodged elbow.
 *
 * `Summarize` is the single focal step. It's where the grain changes, which is
 * the thing this chapter is actually teaching; the other four preserve it.
 */
export function QueryPipelineDiagram() {
  const W = 792;
  const H = 148;
  const boxW = 128;
  const gap = 38;
  const y = 44;
  const boxH = 56;
  const x0 = (W - (boxW * PIPELINE.length + gap * (PIPELINE.length - 1))) / 2;

  return (
    <DiagramFrame
      eyebrow="One query, five operations"
      note={
        <>
          <span className="font-semibold text-body">Excel:</span> filter, calculated column, pivot
          table, sort. <span className="font-semibold text-body">SQL:</span> WHERE, expression,
          GROUP BY, SUM, ORDER BY. Every step should stay visible and auditable.
        </>
      }
    >
      <DiagramSvg
        width={W}
        height={H}
        title="The five operations behind a query"
        desc="Filter, calculate, group, summarize, and sort applied in order to a transactions table. Grain is preserved through the first two steps and changes at summarize, which is the step that turns many rows into one per group."
      >
        {PIPELINE.map((step, i) => {
          const x = x0 + i * (boxW + gap);
          if (i === PIPELINE.length - 1) return null;
          return (
            <Connector
              key={step.label}
              from={[x + boxW, y + boxH / 2]}
              to={[x + boxW + gap, y + boxH / 2]}
              route="straight"
            />
          );
        })}

        {PIPELINE.map((step, i) => (
          <Node
            key={step.label}
            x={x0 + i * (boxW + gap)}
            y={y}
            width={boxW}
            height={boxH}
            variant={step.label === 'Summarize' ? 'focal' : 'step'}
            label={step.label}
            sublabel={step.detail}
          />
        ))}

        {/* Where the grain changes is the whole lesson, so it gets the
            annotation rather than a colour on every box. */}
        <ArrowLabel x={x0 + 2.5 * (boxW + gap) + boxW / 2} y={y + boxH + 4} side="below">
          GRAIN CHANGES HERE
        </ArrowLabel>
        <SvgText x={x0 + boxW / 2} y={y - 14} variant="eyebrow" tone="soft">
          ONE ROW PER SALE
        </SvgText>
        <SvgText
          x={x0 + 4 * (boxW + gap) + boxW / 2}
          y={y - 14}
          variant="eyebrow"
          tone="soft"
        >
          ONE ROW PER GROUP
        </SvgText>
      </DiagramSvg>
    </DiagramFrame>
  );
}

/* ------------------------------------------------------------------ */
/* JoinModelDiagram — the five tables, as an actual data model          */
/* ------------------------------------------------------------------ */

/**
 * Redrawn as an ER diagram, because the question the reader has is *which key
 * joins to which, and how many rows come back* — and the previous version,
 * five Bézier curves between five differently-coloured boxes, answered
 * neither.
 *
 * With cardinality markers the fan-out becomes visible rather than described:
 * three of the four relationships are 1→N *into* the fact table, which
 * preserves grain, and one is N per customer, which does not. That single
 * asymmetry is the chapter.
 */
export function JoinModelDiagram() {
  const W = 792;
  const H = 340;

  const colW = 176;
  const leftX = 24;
  const rightX = 592;

  // Campaign sends sits directly under Customers, because that's the
  // relationship it actually has. Putting it anywhere else forces its
  // connector to route behind another entity, and a line that disappears
  // under a box the reader has to ignore is a line the reader stops trusting.
  const customers = { x: leftX, y: 32, width: colW };
  const sends = { x: leftX, y: 188, width: colW };
  const transactions = { x: 296, y: 84, width: 200 };
  const stores = { x: rightX, y: 32, width: colW };
  const products = { x: rightX, y: 188, width: colW };

  const custH = entityHeight(3);
  const prodH = entityHeight(3);
  const txH = entityHeight(5);
  const storeH = entityHeight(3);
  const sendH = entityHeight(3);

  return (
    <DiagramFrame
      eyebrow="Bean & Basket — the joinable model"
      note="Three of the four relationships are one master row per transaction, so the join preserves the transaction grain. Campaign sends are many rows per customer: attach them directly and every transaction is counted once per send."
    >
      <DiagramSvg
        width={W}
        height={H}
        title="The Bean &amp; Basket data model"
        desc="Transactions sits at the centre as the fact table. Customers, products, and stores each contribute exactly one matching row per transaction, so joining them preserves the row grain. Campaign sends has many rows per customer, so joining it to transactions multiplies rows and inflates any revenue total computed afterwards."
      >
        {/* Relationship lines before entities, so the entity masks clip their
            ends. All undirected — cardinality carries the direction, which is
            the ER convention and saves seven arrowheads. */}
        <Connector
          from={[customers.x + colW, customers.y + custH / 2]}
          to={[transactions.x, transactions.y + 32]}
          route="hvh"
          mid={248}
          arrow="none"
        />
        <Connector
          from={[stores.x, stores.y + storeH / 2]}
          to={[transactions.x + 200, transactions.y + 32]}
          route="hvh"
          mid={544}
          arrow="none"
        />
        <Connector
          from={[products.x, products.y + prodH / 2]}
          to={[transactions.x + 200, transactions.y + txH - 24]}
          route="hvh"
          mid={528}
          arrow="none"
        />
        {/* Customers 1—N sends is an ordinary relationship. The accent is on
            what happens if you attach sends to transactions anyway: that edge
            is dashed because it is the join you should not make. */}
        <Connector
          from={[customers.x + colW / 2, customers.y + custH]}
          to={[customers.x + colW / 2, sends.y]}
          route="straight"
          arrow="none"
          label="1 CUSTOMER"
          labelSide="right"
        />
        <Connector
          from={[sends.x + colW, sends.y + sendH / 2]}
          to={[transactions.x + 96, transactions.y + txH]}
          route="hv"
          tone="accent"
          dashed
          arrow="none"
          label="N PER TX"
          labelOffset={-52}
        />

        <Cardinality x={customers.x + colW + 14} y={customers.y + custH / 2 - 6}>
          1
        </Cardinality>
        <Cardinality x={transactions.x - 14} y={transactions.y + 26}>
          N
        </Cardinality>
        <Cardinality x={stores.x - 14} y={stores.y + storeH / 2 - 6}>
          1
        </Cardinality>
        <Cardinality x={transactions.x + 214} y={transactions.y + 26}>
          N
        </Cardinality>
        <Cardinality x={products.x - 14} y={products.y + prodH / 2 - 6}>
          1
        </Cardinality>
        <Cardinality x={transactions.x + 214} y={transactions.y + txH - 30}>
          N
        </Cardinality>
        <Cardinality x={customers.x + colW / 2 - 14} y={sends.y - 10}>
          N
        </Cardinality>

        <Entity
          {...customers}
          name="Customers"
          tag="DIM"
          fields={[
            { name: 'customer_id', key: 'pk' },
            { name: 'name' },
            { name: 'loyalty_tier' },
          ]}
        />
        <Entity
          {...products}
          name="Products"
          tag="DIM"
          fields={[{ name: 'product_id', key: 'pk' }, { name: 'category' }, { name: 'margin' }]}
        />
        <Entity
          {...transactions}
          name="Transactions"
          tag="FACT"
          variant="focal"
          fields={[
            { name: 'transaction_id', key: 'pk' },
            { name: 'customer_id', key: 'fk' },
            { name: 'product_id', key: 'fk' },
            { name: 'store_id', key: 'fk' },
            { name: 'amount', note: 'one row = one sale' },
          ]}
        />
        <Entity
          {...stores}
          name="Stores"
          tag="DIM"
          fields={[{ name: 'store_id', key: 'pk' }, { name: 'region' }, { name: 'opened' }]}
        />
        <Entity
          {...sends}
          name="Campaign sends"
          tag="EVENT"
          fields={[
            { name: 'send_id', key: 'pk' },
            { name: 'customer_id', key: 'fk' },
            { name: 'sent_at', note: 'many per customer' },
          ]}
        />

        <Legend
          y={H - 12}
          width={W}
          x={24}
          items={[
            { kind: 'focal', label: 'Fact table — sets the grain' },
            { kind: 'arrow', label: 'One row per transaction' },
            { kind: 'arrow-accent', label: 'Many rows per transaction' },
          ]}
          pitch={216}
        />
      </DiagramSvg>
    </DiagramFrame>
  );
}

/* ------------------------------------------------------------------ */
/* ZillowWideLong — the same numbers in both shapes, then charted       */
/* ------------------------------------------------------------------ */

export function ZillowWideLong({ data }: { data: ZillowWideLongData }) {
  const months = data.metadata.months;
  const grouped = groupBy(data.series, d => d.state);
  const xDomain = valueExtent(data.series, d => dateValue(d.month));
  const yDomain = valueExtent(data.series, d => d.index);
  const x = scale(xDomain, [46, 500]);
  const y = scale([Math.min(90, yDomain[0]), Math.max(170, yDomain[1])], [230, 28]);
  const states = Object.keys(grouped);

  return (
    <div className="not-prose space-y-4">
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="overflow-hidden rounded-md border border-border bg-card">
          <div className="border-b border-border bg-code-bg p-3">
            <p className="text-sm font-semibold text-body">Wide extract</p>
            <p className="mt-1 font-plex text-[10px] text-muted">
              {data.metadata.original_shape}
            </p>
          </div>
          <div className="overflow-x-auto p-3">
            <table className="w-full border-collapse text-sm tabular-nums">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-2 py-2 text-left font-semibold text-body">State</th>
                  {months.map(month => (
                    <th key={month} className="px-2 py-2 text-right font-semibold text-body">
                      {month}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.wideRows.map(row => (
                  <tr key={String(row.state)} className="border-b border-border text-subtle">
                    <td className="px-2 py-2 text-left">{row.state}</td>
                    {months.map(month => (
                      <td key={month} className="px-2 py-2 text-right">
                        {formatMoney(Number(row[month]))}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="overflow-hidden rounded-md border border-border bg-card">
          <div className="border-b border-border bg-code-bg p-3">
            <p className="text-sm font-semibold text-body">Long extract</p>
            <p className="mt-1 font-plex text-[10px] text-muted">
              {data.metadata.teaching_shape}
            </p>
          </div>
          <div className="max-h-[270px] overflow-auto p-3">
            <table className="w-full border-collapse text-sm tabular-nums">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-2 py-2 text-left font-semibold text-body">State</th>
                  <th className="px-2 py-2 text-left font-semibold text-body">Month</th>
                  <th className="px-2 py-2 text-right font-semibold text-body">ZHVI</th>
                </tr>
              </thead>
              <tbody>
                {data.longRows.map(row => (
                  <tr
                    key={`${row.state}-${row.month}`}
                    className="border-b border-border text-subtle"
                  >
                    <td className="px-2 py-2 text-left">{row.state}</td>
                    <td className="px-2 py-2 text-left">{row.month}</td>
                    <td className="px-2 py-2 text-right">{formatMoney(row.zhvi)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <div className="rounded-md border border-border bg-card p-4">
        <p className="text-sm font-semibold text-body">
          Once long, the chart is direct: x = month, y = index, one line per state.
        </p>
        {/* A small multi-series line chart, so it keeps series colour — the
            one thing schematics give up. It reads the theme tokens all the
            same; only the four series hues are its own. */}
        <svg
          viewBox="0 0 560 270"
          className="mt-3 h-auto w-full"
          role="img"
          aria-label="Indexed Zillow home value lines after reshaping to long format, January 2020 = 100."
        >
          {[100, 120, 140, 160].map(t => (
            <g key={t}>
              <line x1="46" x2="500" y1={y(t)} y2={y(t)} stroke={T.rule} strokeWidth={S.thin} />
              <text x="38" y={y(t) + 4} textAnchor="end" className="fill-muted font-plex text-[9px]">
                {t}
              </text>
            </g>
          ))}
          <line
            x1="46"
            x2="500"
            y1={y(100)}
            y2={y(100)}
            stroke={T.ruleStrong}
            strokeDasharray="4 4"
          />
          {states.map((state, i) => {
            const rows = grouped[state];
            const sorted = [...rows].sort((a, b) => dateValue(a.month) - dateValue(b.month));
            const path = sorted
              .map(
                (row, j) =>
                  `${j === 0 ? 'M' : 'L'} ${x(dateValue(row.month)).toFixed(1)} ${y(row.index).toFixed(1)}`
              )
              .join(' ');
            const last = sorted[sorted.length - 1];
            // California is the reference case the prose walks through, so it
            // is the accented series; the rest are ink at descending weight.
            const focal = i === 0;
            return (
              <g key={state}>
                <path
                  d={path}
                  fill="none"
                  stroke={focal ? T.accent : T.muted}
                  strokeOpacity={focal ? 1 : 0.45 + 0.15 * i}
                  strokeWidth={focal ? 2.4 : 1.6}
                />
                <text
                  x="508"
                  y={y(last.index) + 4}
                  className={`font-plex text-[9px] ${focal ? 'fill-accent-ink' : 'fill-muted'}`}
                >
                  {state}
                </text>
              </g>
            );
          })}
          <text x="280" y="258" textAnchor="middle" className="fill-muted font-plex text-[9px]">
            January 2020 = 100
          </text>
        </svg>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* QualityTriageBoard — the triage decision path                        */
/* ------------------------------------------------------------------ */

/**
 * A flowchart, replacing the two-column card grid this used to be.
 *
 * The section it belongs to is called "Triage, don't bulk-clean", and the
 * argument is that four superficially similar bad rows want four different
 * responses. A card grid can list four responses; only a flowchart can show
 * that they're the *leaves of one decision*, which is the part a reader has to
 * internalise before they can triage a row they haven't seen before.
 *
 * Shape carries type — oval start, diamond decision, rectangle action — so the
 * whole chart works in one hue, and the accent is spent on the branch the
 * chapter keeps returning to: the bad row that turns out to be a real business
 * event.
 */
export function QualityTriageBoard() {
  const W = 792;
  const H = 424;

  const cx = 300;
  const dW = 200;
  const dH = 76;
  const aX = 528;
  const aW = 216;

  const rows = [
    {
      q: 'A real business event?',
      yes: 'Keep the row. Add a column that names the event.',
      sub: 'T05 — a return, not a negative sale',
    },
    {
      q: 'A possible value?',
      yes: 'Reject at the boundary and log the source.',
      sub: 'T04 — month 13 is an ingestion bug',
    },
    {
      q: 'A coding inconsistency?',
      yes: 'Normalize at ingestion; add a uniqueness check.',
      sub: 'T08 — store "a" and store "A"',
    },
  ];

  const startY = 16;
  const rowY = [76, 188, 300];
  const endY = 384;

  return (
    <DiagramFrame
      eyebrow="Triage, don't bulk-clean"
      note="Each branch keeps the business event visible in the schema rather than making the row go away. Only the last leaf — a value that is possible, correctly coded, and still wrong — leaves the pipeline for a human."
    >
      <DiagramSvg
        width={W}
        height={H}
        title="The data-quality triage path"
        desc="A failed check is tested in turn: is it a real business event, is the value possible, is it a coding inconsistency. Each yes routes to a different response — encode the event, reject at the boundary, normalize at ingestion — and only a row that passes all three tests is quarantined for a human to investigate."
      >
        {/* Spine: start down through the three diamonds to the terminal. */}
        <Connector
          from={[cx, startY + 36]}
          to={[cx, rowY[0]]}
          route="straight"
          label="FAILS A CHECK"
          labelSide="right"
        />
        {rows.map((r, i) => (
          <React.Fragment key={r.q}>
            {/* Yes exits right, per convention — and every branch is labelled. */}
            <Connector
              from={[cx + dW / 2, rowY[i] + dH / 2]}
              to={[aX, rowY[i] + dH / 2]}
              route="straight"
              tone={i === 0 ? 'accent' : 'default'}
              label="YES"
              labelSide="above"
            />
            <Connector
              from={[cx, rowY[i] + dH]}
              to={[cx, i === rows.length - 1 ? endY : rowY[i + 1]]}
              route="straight"
              label="NO"
              labelSide="right"
            />
          </React.Fragment>
        ))}

        <Node
          x={cx - 88}
          y={startY}
          width={176}
          height={36}
          shape="oval"
          variant="input"
          label="A row fails a check"
        />

        {rows.map((r, i) => (
          <React.Fragment key={r.q}>
            <Node
              x={cx - dW / 2}
              y={rowY[i]}
              width={dW}
              height={dH}
              shape="diamond"
              variant={i === 0 ? 'focal' : 'step'}
              label={r.q}
            />
            <Node
              x={aX}
              y={rowY[i] + 4}
              width={aW}
              height={dH - 8}
              variant={i === 0 ? 'focal' : 'step'}
              label={r.yes}
              sublabel={r.sub}
            />
          </React.Fragment>
        ))}

        <Node
          x={cx - 108}
          y={endY}
          width={216}
          height={36}
          shape="oval"
          variant="input"
          label="Quarantine and ask the source"
        />
      </DiagramSvg>
    </DiagramFrame>
  );
}

/* ------------------------------------------------------------------ */
/* QualityScanBoard — what the standing scan actually found             */
/* ------------------------------------------------------------------ */

/**
 * The four findings from the case-data scan. This is genuinely a table of
 * findings — four independent observations with no flow between them — so it
 * stays a card grid rather than being forced into a schematic.
 */
export function QualityScanBoard({ data }: { data: { checks: QualityCheck[] } }) {
  return (
    <div className="not-prose grid gap-4 md:grid-cols-2">
      {data.checks.map(item => (
        <article
          key={`${item.case}-${item.check}`}
          className="rounded-md border border-border bg-card p-4"
        >
          <p className="font-plex text-[10px] font-medium uppercase tracking-[0.16em] text-muted">
            {item.case}
          </p>
          <h3 className="mt-1 text-base font-semibold text-body">{item.check}</h3>
          <p className="mt-3 rounded-md bg-code-bg p-3 text-sm leading-relaxed text-subtle">
            {item.finding}
          </p>
          <p className="mt-3 text-xs leading-relaxed text-neg">
            <span className="font-semibold">Risk: </span>
            {item.risk}
          </p>
          <p className="mt-2 text-xs leading-relaxed text-muted">
            <span className="font-semibold text-body">Response: </span>
            {item.response}
          </p>
        </article>
      ))}
    </div>
  );
}
