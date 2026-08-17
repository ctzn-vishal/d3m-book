'use client';

import * as React from 'react';

import {
  ArrowLabel,
  Cardinality,
  Connector,
  DiagramFrame,
  DiagramSvg,
  Entity,
  EyebrowLabel,
  Legend,
  Node,
  S,
  SvgText,
  T,
  TreeBus,
  Venn,
  Zone,
  centeredRow,
  entityHeight,
} from '@/components/Book/diagram';

/**
 * New conceptual diagrams for Part I, from §5c of the diagram audit.
 *
 * These are the figures the chapters were teaching without: seven articles on
 * grain, joins, reshaping, and metric contracts carried one conceptual diagram
 * between them, and the section headings said exactly which ones were missing —
 * "Four kinds of join" wanted a Venn, "Joins change the grain" wanted a fan-out,
 * "A metric is a contract" wanted a tree.
 */

/* ------------------------------------------------------------------ */
/* §5c.1 — JoinKindsVenn                                               */
/* ------------------------------------------------------------------ */

/**
 * The three joins a manager actually chooses between, on one pair of tables.
 *
 * A Venn is the right type here for a reason that is easy to miss: the three
 * joins are not three operations, they are three *selections from the same
 * three regions*. Inner takes the middle. Left takes the middle plus the left
 * crescent. Anti takes the left crescent alone. Once the regions exist, the
 * joins are obvious; without them, they are three definitions to memorise.
 */
export function JoinKindsVenn() {
  const W = 720;
  // Sized so the top set's two-line label clears the canvas edge and the
  // bottom set's clears the legend hairline. A Venn's labels live outside the
  // circles, so the circles are always smaller than the space suggests.
  const H = 400;
  const r = 128;
  const cx = W / 2;
  const cy = 184;

  return (
    <DiagramFrame
      eyebrow="Four kinds of join, three regions"
      note="A full outer join is the fourth: everything in the picture. The choice between them is a choice about which of the three regions you are willing to lose — and an inner join loses one silently, which is why a dashboard can quietly drop 5-15% of transactions every week."
    >
      <DiagramSvg
        width={W}
        height={H}
        title="Joins as selections from three regions"
        desc="Transactions and customers overlap in a middle region of matched rows. An inner join keeps only that middle; a left join keeps the middle plus the unmatched transactions; an anti-join keeps only the unmatched transactions, which is the data-quality check."
      >
        <Venn
          intersection={{ label: 'Matched', sublabel: 'both sides have a row' }}
          circles={[
            {
              cx: cx - 88,
              cy,
              r,
              label: 'Transactions',
              sublabel: 'the left table',
              labelAt: 'top',
            },
            {
              cx: cx + 88,
              cy,
              r,
              label: 'Customers',
              sublabel: 'the right table',
              labelAt: 'bottom',
            },
          ]}
        />

        <SvgText x={cx - 168} y={cy - 4} width={124} variant="nodeSm" tone="ink">
          Unmatched
        </SvgText>
        <SvgText x={cx - 168} y={cy + 12} width={124} variant="sub" tone="muted">
          a customer_id we have never seen
        </SvgText>
        <SvgText x={cx + 168} y={cy - 4} width={124} variant="nodeSm" tone="muted">
          Never bought
        </SvgText>
        <SvgText x={cx + 168} y={cy + 12} width={124} variant="sub" tone="muted">
          on file, no transaction
        </SvgText>

        <Legend
          y={H - 12}
          width={W}
          x={16}
          items={[
            { kind: 'focal', label: 'INNER — the middle only' },
            { kind: 'step', label: 'LEFT — middle plus left crescent' },
            { kind: 'neg', label: 'ANTI — left crescent only' },
          ]}
          pitch={200}
        />
      </DiagramSvg>
    </DiagramFrame>
  );
}

/* ------------------------------------------------------------------ */
/* §5c.2 — JoinFanOut                                                  */
/* ------------------------------------------------------------------ */

export interface JoinFanOutProps {
  /** Rows in the transactions table before any join. */
  transactionRows: number;
  /** Rows after joining campaign sends without aggregating first. */
  inflatedRows: number;
  /** The correct revenue total, computed at transaction grain. */
  truthfulTotal: number;
  /** What SUM returns after the fan-out. */
  inflatedTotal: number;
}

/**
 * The same SUM, run twice, on two tables that differ only by a join.
 *
 * This one is worth drawing rather than describing because the failure is
 * *arithmetically invisible*: the SQL is correct, the query succeeds, and the
 * number is wrong. What the figure shows is the row count changing — which is
 * the only observable that would have caught it.
 */
export function JoinFanOut({
  transactionRows,
  inflatedRows,
  truthfulTotal,
  inflatedTotal,
}: JoinFanOutProps) {
  const W = 792;
  const H = 296;
  const boxW = 184;
  const boxH = 76;
  const laneY = [48, 176];
  const money = (n: number) =>
    `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <DiagramFrame
      eyebrow="The same SUM, two grains"
      note="Nothing here errors. The join is valid, the SUM is valid, and the total is wrong by the average number of campaign sends per customer. The row count is the only thing that changed visibly — which is why counting rows before and after every join is the habit that catches it."
    >
      <DiagramSvg
        width={W}
        height={H}
        title="Why a join inflates a revenue total"
        desc={
          `The same ${transactionRows} transactions summed twice. Aggregating campaign sends to one row ` +
          `per customer before joining preserves the grain and gives the correct total. Joining the raw ` +
          `sends multiplies the rows to ${inflatedRows} and the same SUM counts each sale once per send.`
        }
      >
        <Zone x={16} y={16} width={W - 32} height={112} label="AGGREGATE FIRST — GRAIN PRESERVED" />
        <Zone x={16} y={144} width={W - 32} height={112} label="JOIN THE RAW SENDS — GRAIN BROKEN" />

        {laneY.map((y, li) => (
          <React.Fragment key={li}>
            <Connector
              from={[48 + boxW, y + boxH / 2]}
              to={[304, y + boxH / 2]}
              route="straight"
              tone={li === 1 ? 'accent' : 'default'}
              label={li === 0 ? '1 PER TX' : 'N PER TX'}
            />
            <Connector
              from={[304 + boxW, y + boxH / 2]}
              to={[560, y + boxH / 2]}
              route="straight"
              tone={li === 1 ? 'accent' : 'default'}
              label="SUM"
            />
          </React.Fragment>
        ))}

        <Node
          x={48}
          y={laneY[0]}
          width={boxW}
          height={boxH}
          variant="input"
          label="Transactions"
          sublabel={`${transactionRows} rows`}
        />
        <Node
          x={304}
          y={laneY[0]}
          width={boxW}
          height={boxH}
          label="+ one flag per customer"
          sublabel={`still ${transactionRows} rows`}
        />
        <Node
          x={560}
          y={laneY[0]}
          width={boxW}
          height={boxH}
          variant="pos"
          label={money(truthfulTotal)}
          sublabel="the number that is true"
        />

        <Node
          x={48}
          y={laneY[1]}
          width={boxW}
          height={boxH}
          variant="input"
          label="Transactions"
          sublabel={`${transactionRows} rows`}
        />
        <Node
          x={304}
          y={laneY[1]}
          width={boxW}
          height={boxH}
          variant="focal"
          label="+ every campaign send"
          sublabel={`now ${inflatedRows} rows`}
        />
        <Node
          x={560}
          y={laneY[1]}
          width={boxW}
          height={boxH}
          variant="neg"
          label={money(inflatedTotal)}
          sublabel="the number in the board deck"
        />
      </DiagramSvg>
    </DiagramFrame>
  );
}

/* ------------------------------------------------------------------ */
/* §5c.3 — GrainErModel                                                */
/* ------------------------------------------------------------------ */

/**
 * "One row = what?" across the four case datasets, as a data model.
 *
 * The four cases are not related to each other — they are four separate files
 * from four separate sources — so this is deliberately an ER diagram *without
 * relationships*. What it compares is the row contract itself: the key columns
 * that define the grain, and how many rows that grain produces.
 */
const GRAIN_CASES = [
  {
    name: 'Soup panel',
    tag: '88,409',
    fields: [
      { name: 'store_id', key: 'pk' as const },
      { name: 'date', key: 'pk' as const },
      { name: 'price, volume, share' },
    ],
    grain: 'one store-month',
  },
  {
    name: 'County',
    tag: '3,111',
    fields: [
      { name: 'fips', key: 'pk' as const, note: '5 chars' },
      { name: 'demographics' },
      { name: 'vote share' },
    ],
    grain: 'one county, once',
  },
  {
    name: 'Zillow (as shipped)',
    tag: '51',
    fields: [
      { name: 'state', key: 'pk' as const },
      { name: '2000-01 … 2026-04', note: '316 cols' },
    ],
    grain: 'one state, months in columns',
    variant: 'neg' as const,
  },
  {
    name: 'Zillow (reshaped)',
    tag: '16,116',
    fields: [
      { name: 'state', key: 'pk' as const },
      { name: 'month', key: 'pk' as const },
      { name: 'zhvi' },
    ],
    grain: 'one state-month',
    variant: 'focal' as const,
  },
];

export function GrainErModel() {
  const W = 792;
  const colW = 176;
  const gap = 24;
  const top = 40;
  const xs = centeredRow(0, W, GRAIN_CASES.length, colW, gap);
  const maxFields = Math.max(...GRAIN_CASES.map(c => c.fields.length));
  const H = top + entityHeight(maxFields) + 56;

  return (
    <DiagramFrame
      eyebrow="One row = what?"
      note="The key columns are the grain. Two of these tables describe the same Zillow data; the difference between them is not a formatting preference but a different answer to what one row means — and only one of the two can be charted or joined without work."
    >
      <DiagramSvg
        width={W}
        height={H}
        title="The row contract of four case tables"
        desc="Four case tables with their key columns marked. The soup panel is keyed by store and date, the county file by FIPS code alone, and the Zillow file ships keyed by state with 316 month columns — which becomes a state-month key once reshaped, at which point it can be charted."
      >
        {GRAIN_CASES.map((c, i) => (
          <React.Fragment key={c.name}>
            <Entity
              x={xs[i]}
              y={top}
              width={colW}
              name={c.name}
              tag={c.tag}
              variant={c.variant ?? 'step'}
              fields={c.fields}
            />
            <SvgText
              x={xs[i] + colW / 2}
              y={top + entityHeight(maxFields) + 20}
              width={colW}
              variant="sub"
              tone={c.variant === 'focal' ? 'accent' : 'muted'}
            >
              {c.grain}
            </SvgText>
          </React.Fragment>
        ))}

        <EyebrowLabel x={16} y={24} anchor="start" tone="soft" masked={false}>
          # MARKS THE COLUMNS THAT DEFINE THE ROW
        </EyebrowLabel>

        <Connector
          from={[xs[2] + colW / 2, top + entityHeight(maxFields) + 30]}
          to={[xs[3] + colW / 2, top + entityHeight(maxFields) + 30]}
          route="straight"
          tone="accent"
          label="RESHAPE"
        />
      </DiagramSvg>
    </DiagramFrame>
  );
}

/* ------------------------------------------------------------------ */
/* §5c.4 — SqlExecutionOrder                                           */
/* ------------------------------------------------------------------ */

const SQL_WRITTEN = ['SELECT', 'FROM', 'WHERE', 'GROUP BY', 'HAVING', 'ORDER BY'];
const SQL_EXECUTED = [
  { clause: 'FROM', what: 'get the rows' },
  { clause: 'WHERE', what: 'drop rows' },
  { clause: 'GROUP BY', what: 'change the grain' },
  { clause: 'HAVING', what: 'drop groups' },
  { clause: 'SELECT', what: 'choose columns' },
  { clause: 'ORDER BY', what: 'sort what is left' },
];

/**
 * The gap between the order you write a query in and the order it runs in.
 *
 * This is the figure behind almost every "why doesn't my alias work in WHERE?"
 * and every misplaced `HAVING`. Both facts are simple; the *relationship*
 * between them is what needs a picture, and the crossing lines are the
 * relationship — so this is the one diagram in Part I where the connectors
 * genuinely have to cross.
 */
export function SqlExecutionOrder() {
  const W = 792;
  const rowH = 40;
  const pitch = 48;
  const top = 40;
  const leftX = 88;
  const rightX = 456;
  const colW = 248;
  const H = top + pitch * (SQL_WRITTEN.length - 1) + rowH + 32;

  const execIndexOf = (clause: string) => SQL_EXECUTED.findIndex(e => e.clause === clause);

  return (
    <DiagramFrame
      eyebrow="Written order against execution order"
      note="Every rule that feels arbitrary falls out of the right-hand column. A SELECT alias is unavailable in WHERE because WHERE has already run. HAVING filters groups because GROUP BY has already run. ORDER BY can use an alias because it runs last."
    >
      <DiagramSvg
        width={W}
        height={H}
        title="SQL's written order and its execution order"
        desc="A query is written SELECT, FROM, WHERE, GROUP BY, HAVING, ORDER BY, but executes FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY. SELECT runs fifth, not first, which is why an alias defined there cannot be used in WHERE."
      >
        <EyebrowLabel x={leftX} y={20} anchor="start" tone="soft" masked={false}>
          AS YOU WRITE IT
        </EyebrowLabel>
        <EyebrowLabel x={rightX} y={20} anchor="start" tone="soft" masked={false}>
          AS IT RUNS
        </EyebrowLabel>

        {/* One line per clause, from its written position to its executed one.
            They cross, and the crossings are the content. */}
        {SQL_WRITTEN.map((clause, i) => {
          const j = execIndexOf(clause);
          const focal = clause === 'SELECT';
          return (
            <Connector
              key={clause}
              from={[leftX + colW, top + i * pitch + rowH / 2]}
              to={[rightX, top + j * pitch + rowH / 2]}
              route="hvh"
              mid={368 + (i - 2.5) * 12}
              tone={focal ? 'accent' : 'soft'}
              arrow="none"
            />
          );
        })}

        {SQL_WRITTEN.map((clause, i) => (
          <Node
            key={clause}
            x={leftX}
            y={top + i * pitch}
            width={colW}
            height={rowH}
            align="start"
            variant={clause === 'SELECT' ? 'focal' : 'store'}
            label={clause}
          />
        ))}

        {SQL_EXECUTED.map((step, i) => (
          <React.Fragment key={step.clause}>
            <Node
              x={rightX}
              y={top + i * pitch}
              width={colW}
              height={rowH}
              align="start"
              variant={step.clause === 'SELECT' ? 'focal' : 'step'}
              label={step.clause}
              sublabel={step.what}
            />
            <SvgText
              x={rightX + colW + 16}
              y={top + i * pitch + rowH / 2 + 4}
              variant="eyebrow"
              tone="soft"
              textAnchor="start"
            >
              {`0${i + 1}`}
            </SvgText>
          </React.Fragment>
        ))}
      </DiagramSvg>
    </DiagramFrame>
  );
}

/* ------------------------------------------------------------------ */
/* §5c.6 — MetricCompositionTree                                       */
/* ------------------------------------------------------------------ */

/**
 * A metric decomposed until every leaf is a column someone actually collects.
 *
 * The tree is the argument: revenue is not measured, it is *derived*, and every
 * fork is a definitional choice someone made. When two dashboards disagree
 * about revenue, they disagree at one of these forks — and the tree is how you
 * find which one without re-reading two SQL files.
 */
export function MetricCompositionTree() {
  const W = 792;
  const H = 328;
  const rootW = 216;
  const rootH = 60;
  const midW = 176;
  const midH = 60;
  const leafW = 152;
  const leafH = 56;

  const rootY = 16;
  const midY = 124;
  const leafY = 236;

  const midXs = [188, 428];
  const leafXs = [24, 208, 392, 576];

  return (
    <DiagramFrame
      eyebrow="A metric is a contract"
      note="Nobody collects revenue. They collect line items, and someone decided that a refund subtracts, that a discount is not a separate transaction, and that an order placed at 23:58 belongs to today. Each of those decisions lives at a fork in this tree, and a metric card is the document that names them."
    >
      <DiagramSvg
        width={W}
        height={H}
        title="Net revenue, decomposed to its collected columns"
        desc="Net revenue is orders multiplied by average order value. Orders decomposes into completed checkouts minus cancellations; average order value into line-item total minus refunds and discounts, divided by orders. Only the four leaves are columns anyone actually records."
      >
        <TreeBus
          parentX={W / 2}
          parentY={rootY + rootH}
          childXs={midXs.map(x => x + midW / 2)}
          childY={midY}
        />
        <TreeBus
          parentX={midXs[0] + midW / 2}
          parentY={midY + midH}
          childXs={[leafXs[0] + leafW / 2, leafXs[1] + leafW / 2]}
          childY={leafY}
        />
        <TreeBus
          parentX={midXs[1] + midW / 2}
          parentY={midY + midH}
          childXs={[leafXs[2] + leafW / 2, leafXs[3] + leafW / 2]}
          childY={leafY}
        />

        <Node
          x={(W - rootW) / 2}
          y={rootY}
          width={rootW}
          height={rootH}
          variant="focal"
          label="Net revenue"
          sublabel="what the board is shown"
        />

        <Node
          x={midXs[0]}
          y={midY}
          width={midW}
          height={midH}
          label="Orders"
          sublabel="count, per window"
        />
        <Node
          x={midXs[1]}
          y={midY}
          width={midW}
          height={midH}
          label="Average order value"
          sublabel="a ratio, so a denominator"
        />

        <Node
          x={leafXs[0]}
          y={leafY}
          width={leafW}
          height={leafH}
          variant="store"
          label="Completed checkouts"
          sublabel="collected"
        />
        <Node
          x={leafXs[1]}
          y={leafY}
          width={leafW}
          height={leafH}
          variant="store"
          label="Cancellations"
          sublabel="collected"
        />
        <Node
          x={leafXs[2]}
          y={leafY}
          width={leafW}
          height={leafH}
          variant="store"
          label="Line-item total"
          sublabel="collected"
        />
        <Node
          x={leafXs[3]}
          y={leafY}
          width={leafW}
          height={leafH}
          variant="store"
          label="Refunds and discounts"
          sublabel="collected"
        />

        <ArrowLabel x={W / 2} y={midY - 30} side="above">
          x
        </ArrowLabel>
        <ArrowLabel x={midXs[0] + midW / 2} y={leafY - 30} side="above">
          MINUS
        </ArrowLabel>
        <ArrowLabel x={midXs[1] + midW / 2} y={leafY - 30} side="above">
          MINUS, OVER ORDERS
        </ArrowLabel>

        <Legend
          y={H - 12}
          width={W}
          x={16}
          items={[
            { kind: 'focal', label: 'Reported' },
            { kind: 'step', label: 'Derived — a definitional choice' },
            { kind: 'store', label: 'Actually collected' },
          ]}
          pitch={216}
        />
      </DiagramSvg>
    </DiagramFrame>
  );
}

/* ------------------------------------------------------------------ */
/* §5c.7 — WideLongConsumers                                           */
/* ------------------------------------------------------------------ */

const LONG_CONSUMERS = ['Charts', 'Models', 'Dashboard filters', 'Joins to other tables'];
const WIDE_CONSUMERS = ['A human reading a table', 'A spreadsheet', 'A printed report'];

/**
 * Long and wide, and — the part that actually settles arguments — *who wants
 * which*.
 *
 * The shapes are easy. What teams disagree about is which one the warehouse
 * should hold, and that question has an answer: store long, because every
 * downstream consumer except a human eye wants long, and wide is one pivot away
 * whereas long is not recoverable from wide once a month becomes a column name.
 */
export function WideLongConsumers() {
  const W = 792;
  const H = 264;
  const storeW = 200;
  const storeH = 80;
  const storeY = 88;
  const listW = 216;

  return (
    <DiagramFrame
      eyebrow="Store it long, display it wide"
      note="Wide is a presentation, not a storage decision. Pivoting long to wide is one line; recovering long from wide means parsing column names, and the month a dashboard broke is usually the month a new one arrived."
    >
      <DiagramSvg
        width={W}
        height={H}
        title="Which consumer wants which shape"
        desc="A long table, one row per state-month, is what charts, models, dashboard filters, and joins all want. A wide table, one column per month, is what a human reading a page wants. Storing long and pivoting to wide at the last step serves both; storing wide serves only the second."
      >
        <Zone x={288} y={16} width={248} height={H - 48} label="STORE THIS ONE" boundary />

        <Node
          x={336}
          y={storeY}
          width={storeW - 48}
          height={storeH}
          variant="focal"
          label="Long"
          sublabel="one row per state-month"
        />

        <Connector
          from={[288, storeY + storeH / 2]}
          to={[248, storeY + storeH / 2]}
          route="straight"
          label="PIVOT"
        />
        <Node
          x={40}
          y={storeY}
          width={storeW}
          height={storeH}
          variant="store"
          label="Wide"
          sublabel="one column per month"
        />

        <Connector
          from={[536, storeY + storeH / 2]}
          to={[576, storeY + storeH / 2]}
          route="straight"
          tone="accent"
          label="AS IS"
        />

        <EyebrowLabel x={40} y={40} anchor="start" tone="soft" masked={false}>
          WANTED BY
        </EyebrowLabel>
        {WIDE_CONSUMERS.map((c, i) => (
          <SvgText
            key={c}
            x={40}
            y={storeY + storeH + 28 + i * 16}
            width={listW}
            variant="sub"
            tone="muted"
            textAnchor="start"
          >
            {'· ' + c}
          </SvgText>
        ))}

        <EyebrowLabel x={576} y={40} anchor="start" tone="soft" masked={false}>
          WANTED BY
        </EyebrowLabel>
        {LONG_CONSUMERS.map((c, i) => (
          <SvgText
            key={c}
            x={576}
            y={storeY - 24 + i * 16}
            width={listW}
            variant="sub"
            tone="ink"
            textAnchor="start"
          >
            {'· ' + c}
          </SvgText>
        ))}

        <line
          x1={40}
          y1={storeY + storeH + 12}
          x2={40 + listW}
          y2={storeY + storeH + 12}
          stroke={T.rule}
          strokeWidth={S.thin}
        />
      </DiagramSvg>
    </DiagramFrame>
  );
}
