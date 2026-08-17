'use client';

import * as React from 'react';

import { DiagramFrame, LEGACY_C, T } from '@/components/Book/diagram';

type Segment = {
  id: string;
  label: string;
  shortLabel: string;
  color: string;
  description: string;
  zips: number;
  share: number;
  medianPopulation: number;
  medianIncome: number;
  povertyRate: number;
  collegeShare: number;
  blackShare: number;
  hispanicShare: number;
  salesPerCapita: number;
  retailersPer10k: number;
  instantShare: number;
  quickdrawShare: number;
  dailyShare: number;
  jackpotShare: number;
  routineCheckout: number;
  incidentalShare: number;
  barShare: number;
  convenienceShare: number;
  groceryShare: number;
  addonRate: number;
  portfolioEntropy: number;
  habitIndex: number;
  pc1: number;
  pc2: number;
};

type Point = {
  zip: string;
  region: string;
  segment: string;
  pc1: number;
  pc2: number;
  sales_per_capita: number;
  total_pop: number;
  median_income: number | null;
  pre_daily_share: number;
  pre_instant_share: number;
  pre_quickdraw_share: number;
};

type GroupProfile = {
  label: string;
  zips: number;
  medianPopulation: number;
  medianIncome: number | null;
  povertyRate: number | null;
  salesPerCapita: number;
  retailersPer10k: number;
  instantShare: number;
  dailyShare: number;
  jackpotShare: number;
  quickdrawShare: number;
  portfolioEntropy: number;
  habitIndex: number;
};

type InteractionRow = {
  population: string;
  hispanic: string;
  zips: number;
  dailyShare: number;
  habitIndex: number;
  salesPerCapita: number;
  instantShare: number;
  portfolioEntropy: number;
};

type ControlledModel = {
  outcome: string;
  n: number;
  r2: number;
  coefficients: Array<{ term: string; label: string; coefficient: number }>;
};

type LotteryCaseData = {
  metadata: {
    sourceRows: number;
    activeRows: number;
    excludedRows: number;
    behaviorFeatureCount: number;
    selectedK: number;
  };
  segments: Segment[];
  pca: {
    explainedVariance: Array<{ component: string; share: number; cumulative: number }>;
    loadings: Array<{
      component: string;
      name: string;
      positive: Array<{ label: string; loading: number }>;
      negative: Array<{ label: string; loading: number }>;
    }>;
    points: Point[];
  };
  groups: {
    region: GroupProfile[];
    incomeQuartile: GroupProfile[];
    hispanicQuartile: GroupProfile[];
    blackQuartile: GroupProfile[];
    populationHispanicInteraction: InteractionRow[];
  };
  associations: {
    controlledModels: ControlledModel[];
  };
  salesConcentration: {
    rows: Array<{ label: string; zips: number; salesShare: number }>;
    regionSalesShare: Array<{ label: string; share: number }>;
  };
};

/**
 * Was twenty-one hardcoded light-mode hexes. Now the same names,
 * resolved through the theme — see components/Book/diagram/legacy.ts for
 * how the ten hues collapse onto ink, accent, pos, and neg.
 */
const C = {
  ...LEGACY_C,
  panel: T.paperAlt,
  brown: T.ruleStrong,
};

const fmtCompact = new Intl.NumberFormat('en-US', {
  notation: 'compact',
  maximumFractionDigits: 1,
});

const fmtMoney = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

function pct(value: number | null | undefined, digits = 0) {
  if (value == null || !Number.isFinite(value)) return 'n/a';
  return `${(value * 100).toFixed(digits)}%`;
}

function num(value: number | null | undefined, digits = 1) {
  if (value == null || !Number.isFinite(value)) return 'n/a';
  return value.toFixed(digits);
}

function money(value: number | null | undefined) {
  if (value == null || !Number.isFinite(value)) return 'n/a';
  return fmtMoney.format(value);
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function extent<T>(items: T[], accessor: (item: T) => number): [number, number] {
  const values = items.map(accessor).filter(Number.isFinite);
  return [Math.min(...values), Math.max(...values)];
}

function padded([min, max]: [number, number], pad = 0.08): [number, number] {
  if (!Number.isFinite(min) || !Number.isFinite(max)) return [-1, 1];
  const span = max - min || 1;
  return [min - span * pad, max + span * pad];
}

function scale(domain: [number, number], range: [number, number]) {
  const [d0, d1] = domain;
  const [r0, r1] = range;
  const denom = d1 - d0 || 1;
  return (value: number) => r0 + ((value - d0) / denom) * (r1 - r0);
}

/**
 * Local card wrapper, now a thin pass-through to the shared frame so this
 * file's figures stop being white slabs on a dark page. `DiagramFrame` owns
 * the ground, the hairline, and the absence of a shadow.
 */
function Card({
  title,
  children,
  footer,
}: {
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <DiagramFrame eyebrow={title} note={footer}>
      {children}
    </DiagramFrame>
  );
}

function segmentMap(data: LotteryCaseData) {
  return new Map(data.segments.map(segment => [segment.id, segment]));
}

function Bar({
  value,
  max = 1,
  color,
}: {
  value: number;
  max?: number;
  color: string;
}) {
  const width = `${clamp(value / max, 0, 1) * 100}%`;
  return (
    <span className="block h-2 rounded bg-code-bg">
      <span className="block h-2 rounded" style={{ width, background: color }} />
    </span>
  );
}

function MiniMetric({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="rounded-md border border-border bg-code-bg p-3">
      <div className="text-[11px] font-semibold uppercase tracking-wide text-muted">
        {label}
      </div>
      <div className="mt-1 text-2xl font-semibold tabular-nums text-body">{value}</div>
      {note && <div className="mt-1 text-[11px] leading-snug text-muted">{note}</div>}
    </div>
  );
}

export function LotteryCaseOverview({ data }: { data: LotteryCaseData }) {
  const top10 = data.salesConcentration.rows.find(row => row.label.includes('10'));
  const top20 = data.salesConcentration.rows.find(row => row.label.includes('20'));
  const nycShare = data.salesConcentration.regionSalesShare.find(row => row.label === 'NYC');

  return (
    <Card title="Statewide ZIP baseline">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MiniMetric
          label="Source rows"
          value={fmtCompact.format(data.metadata.sourceRows)}
          note={`${fmtCompact.format(data.metadata.activeRows)} active ZIPs used`}
        />
        <MiniMetric
          label="Behavior features"
          value={String(data.metadata.behaviorFeatureCount)}
          note="Product mix, channel, timing, access"
        />
        <MiniMetric
          label="Top 10% ZIPs"
          value={pct(top10?.salesShare, 1)}
          note="Share of recorded lottery volume"
        />
        <MiniMetric
          label="NYC sales share"
          value={pct(nycShare?.share, 1)}
          note="Against 13.1% of active ZIP rows"
        />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <p className="mb-2 text-[12px] font-semibold uppercase tracking-wide text-muted">
            Sales concentration
          </p>
          <div className="space-y-2">
            {data.salesConcentration.rows.map(row => (
              <div key={row.label} className="grid grid-cols-[145px_1fr_52px] items-center gap-2 text-xs">
                <span className="text-subtle">{row.label}</span>
                <Bar value={row.salesShare} max={0.75} color={C.blue} />
                <span className="text-right font-semibold tabular-nums text-body">
                  {pct(row.salesShare, 1)}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-2 text-[12px] font-semibold uppercase tracking-wide text-muted">
            Region share of volume
          </p>
          <div className="space-y-2">
            {data.salesConcentration.regionSalesShare.slice(0, 5).map((row, i) => (
              <div key={row.label} className="grid grid-cols-[145px_1fr_52px] items-center gap-2 text-xs">
                <span className="truncate text-subtle">{row.label}</span>
                <Bar
                  value={row.share}
                  max={0.45}
                  color={[C.blue, C.teal, C.amber, C.brown, C.red][i] ?? C.muted}
                />
                <span className="text-right font-semibold tabular-nums text-body">
                  {pct(row.share, 1)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}

export function LotteryPcaMap({ data }: { data: LotteryCaseData }) {
  const W = 760;
  const H = 455;
  const m = { left: 52, right: 26, top: 26, bottom: 46 };
  const innerW = W - m.left - m.right;
  const innerH = H - m.top - m.bottom;
  const xDomain = padded(extent(data.pca.points, p => p.pc1), 0.05);
  const yDomain = padded(extent(data.pca.points, p => p.pc2), 0.05);
  const x = scale(xDomain, [m.left, m.left + innerW]);
  const y = scale(yDomain, [m.top + innerH, m.top]);
  const segments = segmentMap(data);
  const pc1 = data.pca.explainedVariance[0];
  const pc2 = data.pca.explainedVariance[1];
  const pc1Load = data.pca.loadings[0];
  const pc2Load = data.pca.loadings[1];

  return (
    <Card
      title="PCA score space"
      footer={`PC1 explains ${pct(pc1.share, 1)} of standardized behavioral variance; PC2 explains ${pct(pc2.share, 1)}. Points are ZIPs, colored by k-means segment.`}
    >
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_250px]">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="h-auto w-full"
          role="img"
          aria-label="PCA map of New York lottery ZIP behavior colored by segment."
        >
          <rect x={m.left} y={m.top} width={innerW} height={innerH} fill={C.panel} stroke={C.grid} />
          {[0.25, 0.5, 0.75].map(t => (
            <React.Fragment key={t}>
              <line
                x1={m.left + innerW * t}
                y1={m.top}
                x2={m.left + innerW * t}
                y2={m.top + innerH}
                stroke={C.grid}
              />
              <line
                x1={m.left}
                y1={m.top + innerH * t}
                x2={m.left + innerW}
                y2={m.top + innerH * t}
                stroke={C.grid}
              />
            </React.Fragment>
          ))}
          <line x1={x(0)} y1={m.top} x2={x(0)} y2={m.top + innerH} stroke={C.muted} strokeDasharray="4 4" />
          <line x1={m.left} y1={y(0)} x2={m.left + innerW} y2={y(0)} stroke={C.muted} strokeDasharray="4 4" />
          {data.pca.points.map(point => {
            const segment = segments.get(point.segment);
            return (
              <circle
                key={point.zip}
                cx={x(point.pc1)}
                cy={y(point.pc2)}
                r={point.total_pop > 40000 ? 3.4 : point.total_pop > 10000 ? 2.8 : 2.2}
                fill={segment?.color ?? C.muted}
                opacity={0.58}
              />
            );
          })}
          <text x={m.left + innerW / 2} y={H - 10} textAnchor="middle" className="fill-subtle text-[12px]">
            PC1: portfolio breadth and daily routine →
          </text>
          <text
            x={16}
            y={m.top + innerH / 2}
            transform={`rotate(-90 16 ${m.top + innerH / 2})`}
            textAnchor="middle"
            className="fill-subtle text-[12px]"
          >
            PC2: checkout scratch retail →
          </text>
        </svg>

        <div className="space-y-4">
          <div className="space-y-2">
            {data.segments.map(segment => (
              <div key={segment.id} className="flex items-center gap-2 text-xs">
                <span className="h-2.5 w-2.5 rounded-sm" style={{ background: segment.color }} />
                <span className="font-medium text-body">{segment.shortLabel}</span>
                <span className="ml-auto tabular-nums text-muted">{segment.zips}</span>
              </div>
            ))}
          </div>
          {[pc1Load, pc2Load].map(load => (
            <div key={load.component} className="rounded-md border border-border bg-code-bg p-3">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">
                {load.component} loadings
              </p>
              <p className="mt-1 text-[12px] font-medium leading-snug text-body">{load.name}</p>
              <div className="mt-2 grid grid-cols-2 gap-2 text-[11px] leading-tight">
                <div>
                  <p className="mb-1 font-semibold text-muted">Positive</p>
                  {load.positive.slice(0, 4).map(item => (
                    <p key={item.label} className="truncate text-subtle">
                      {item.label}
                    </p>
                  ))}
                </div>
                <div>
                  <p className="mb-1 font-semibold text-muted">Negative</p>
                  {load.negative.slice(0, 4).map(item => (
                    <p key={item.label} className="truncate text-subtle">
                      {item.label}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

export function LotterySegmentProfiles({ data }: { data: LotteryCaseData }) {
  const maxSales = Math.max(...data.segments.map(s => s.salesPerCapita));
  const maxHabit = Math.max(...data.segments.map(s => s.habitIndex));
  return (
    <Card title="Four behavioral segments">
      <div className="grid gap-3 md:grid-cols-2">
        {data.segments.map(segment => (
          <div key={segment.id} className="rounded-md border border-border p-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-sm" style={{ background: segment.color }} />
                  <h3 className="text-sm font-semibold leading-tight text-body">{segment.label}</h3>
                </div>
                <p className="mt-1 text-[11px] leading-snug text-muted">{segment.description}</p>
              </div>
              <div className="text-right text-xs tabular-nums text-muted">
                <div className="font-semibold text-body">{segment.zips}</div>
                <div>{pct(segment.share, 1)}</div>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5 text-[11px]">
              {[
                ['Instant', segment.instantShare, 1],
                ['Daily', segment.dailyShare, 0.35],
                ['Quick Draw', segment.quickdrawShare, 1],
                ['Jackpot', segment.jackpotShare, 0.12],
                ['Habit', segment.habitIndex, maxHabit],
                ['Sales/resident', segment.salesPerCapita, maxSales],
              ].map(([label, value, max]) => (
                <div key={String(label)}>
                  <div className="mb-0.5 flex items-center justify-between gap-2">
                    <span className="text-muted">{label}</span>
                    <span className="font-semibold tabular-nums text-body">
                      {String(label) === 'Habit' || String(label) === 'Sales/resident'
                        ? num(Number(value), 1)
                        : pct(Number(value), 0)}
                    </span>
                  </div>
                  <Bar value={Number(value)} max={Number(max)} color={segment.color} />
                </div>
              ))}
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 rounded bg-code-bg p-2 text-[11px]">
              <div>
                <p className="text-muted">Median income</p>
                <p className="font-semibold text-body">{money(segment.medianIncome)}</p>
              </div>
              <div>
                <p className="text-muted">Hispanic</p>
                <p className="font-semibold text-body">{pct(segment.hispanicShare, 1)}</p>
              </div>
              <div>
                <p className="text-muted">Black</p>
                <p className="font-semibold text-body">{pct(segment.blackShare, 1)}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function GroupBars({
  title,
  rows,
  color,
  metric,
}: {
  title: string;
  rows: GroupProfile[];
  color: string;
  metric: keyof GroupProfile;
}) {
  const max = Math.max(...rows.map(row => Number(row[metric] ?? 0)));
  return (
    <div>
      <p className="mb-2 text-[12px] font-semibold uppercase tracking-wide text-muted">{title}</p>
      <div className="space-y-2">
        {rows.map(row => (
          <div key={row.label} className="grid grid-cols-[150px_1fr_58px] items-center gap-2 text-xs">
            <span className="truncate text-subtle">{row.label}</span>
            <Bar value={Number(row[metric] ?? 0)} max={max} color={color} />
            <span className="text-right font-semibold tabular-nums text-body">
              {metric === 'habitIndex' || metric === 'salesPerCapita'
                ? num(Number(row[metric]), 1)
                : pct(Number(row[metric]), 1)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function LotteryDemographicGradients({ data }: { data: LotteryCaseData }) {
  return (
    <Card
      title="Demographic gradients"
      footer="Quartiles are ZIP-level groups. They describe neighborhood composition, not individual player behavior."
    >
      <div className="grid gap-5 lg:grid-cols-2">
        <GroupBars
          title="Income quartile: jackpot share"
          rows={data.groups.incomeQuartile}
          color={C.purple}
          metric="jackpotShare"
        />
        <GroupBars
          title="Income quartile: habit index"
          rows={data.groups.incomeQuartile}
          color={C.blue}
          metric="habitIndex"
        />
        <GroupBars
          title="Hispanic-share quartile: Daily Numbers"
          rows={data.groups.hispanicQuartile}
          color={C.teal}
          metric="dailyShare"
        />
        <GroupBars
          title="Black-share quartile: habit index"
          rows={data.groups.blackQuartile}
          color={C.red}
          metric="habitIndex"
        />
      </div>
    </Card>
  );
}

export function LotteryInteractionGrid({ data }: { data: LotteryCaseData }) {
  const rows = ['Low population', 'Middle population', 'High population'];
  const cols = ['Lower Hispanic share', 'Middle Hispanic share', 'Higher Hispanic share'];
  const lookup = new Map(
    data.groups.populationHispanicInteraction.map(row => [`${row.population}|${row.hispanic}`, row])
  );
  const max = Math.max(...data.groups.populationHispanicInteraction.map(row => row.dailyShare));
  const min = Math.min(...data.groups.populationHispanicInteraction.map(row => row.dailyShare));
  const color = (value: number) => {
    const t = (value - min) / (max - min || 1);
    const r = Math.round(239 - 158 * t);
    const g = Math.round(246 - 72 * t);
    const b = Math.round(255 - 80 * t);
    return `rgb(${r}, ${g}, ${b})`;
  };

  return (
    <Card
      title="Population x Hispanic-share interaction"
      footer="Cells show median Daily Numbers share. The gradient is strongest where high population and high Hispanic-share ZIPs overlap."
    >
      <div className="overflow-x-auto">
        <div className="min-w-[620px]">
          <div className="grid grid-cols-[145px_repeat(3,1fr)] gap-2">
            <div />
            {cols.map(col => (
              <div key={col} className="text-center text-[11px] font-semibold uppercase tracking-wide text-muted">
                {col}
              </div>
            ))}
            {rows.map(row => (
              <React.Fragment key={row}>
                <div className="flex items-center text-[12px] font-semibold text-subtle">{row}</div>
                {cols.map(col => {
                  const cell = lookup.get(`${row}|${col}`);
                  const value = cell?.dailyShare ?? 0;
                  return (
                    <div
                      key={`${row}-${col}`}
                      className="rounded-md border border-border p-3 text-center"
                      style={{ background: color(value) }}
                    >
                      <div className="text-lg font-semibold tabular-nums text-body">
                        {pct(value, 1)}
                      </div>
                      <div className="mt-0.5 text-[11px] text-subtle">
                        habit {num(cell?.habitIndex, 1)} | n={cell?.zips ?? 0}
                      </div>
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}

export function LotteryControlledAssociations({ data }: { data: LotteryCaseData }) {
  const outcomes = ['Daily Numbers share', 'Habit index', 'Log sales per resident', 'Jackpot share'];
  const rows = data.associations.controlledModels.filter(model => outcomes.includes(model.outcome));
  const keep = new Set([
    'Population',
    'Income',
    'Poverty',
    'College+',
    'Black share',
    'Hispanic share',
    'Retailer density',
    'Region: NYC',
    'Region: Central/Southern Tier',
    'Region: Downstate suburbs',
  ]);
  const values = rows.flatMap(row =>
    row.coefficients.filter(coef => keep.has(coef.label)).map(coef => Math.abs(coef.coefficient))
  );
  const max = Math.max(...values, 0.1);

  return (
    <Card
      title="Controlled descriptive associations"
      footer="Bars are standardized ridge coefficients with region indicators and demographic/access controls. They are descriptive adjustments, not causal estimates."
    >
      <div className="grid gap-4 lg:grid-cols-2">
        {rows.map(model => (
          <div key={model.outcome} className="rounded-md border border-border p-3">
            <div className="mb-2 flex items-center justify-between gap-2">
              <p className="text-sm font-semibold text-body">{model.outcome}</p>
              <span className="text-[11px] tabular-nums text-muted">R2 {model.r2.toFixed(2)}</span>
            </div>
            <div className="space-y-1.5">
              {model.coefficients
                .filter(coef => keep.has(coef.label))
                .slice(0, 6)
                .map(coef => (
                  <div key={`${model.outcome}-${coef.label}`} className="grid grid-cols-[128px_1fr_42px] items-center gap-2 text-[11px]">
                    <span className="truncate text-subtle">{coef.label}</span>
                    <span className="relative block h-3 rounded bg-code-bg">
                      <span
                        className="absolute top-0 block h-3 rounded"
                        style={{
                          width: `${(Math.abs(coef.coefficient) / max) * 100}%`,
                          left: coef.coefficient < 0 ? 'auto' : '50%',
                          right: coef.coefficient < 0 ? '50%' : 'auto',
                          background: coef.coefficient < 0 ? C.red : C.blue,
                          maxWidth: '50%',
                        }}
                      />
                      <span className="absolute left-1/2 top-[-2px] h-4 w-px bg-card-hover" />
                    </span>
                    <span className="text-right font-semibold tabular-nums text-body">
                      {coef.coefficient > 0 ?' +' : ''}
                      {coef.coefficient.toFixed(2)}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
