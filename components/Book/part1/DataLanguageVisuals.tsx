import * as React from 'react';

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

const SOURCE_COLORS: Record<string, string> = {
  Soup: '#1f3a5f',
  County: '#7c3aed',
  Zillow: '#0f766e',
  'Soup and county': '#2563eb',
};

const SERIES_COLORS = ['#1f3a5f', '#c87c2a', '#0f766e', '#7c3aed', '#dc2626'];

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

export function GrainDecisionMap({ data }: { data: { cases: GrainCase[] } }) {
  return (
    <div className="not-prose overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800/40 dark:shadow-none">
      <div className="border-b border-slate-200 bg-slate-950 p-5 text-white dark:border-slate-700">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-300">Grain first</p>
        <h3 className="mt-1 text-xl font-semibold">The row contract decides the claim.</h3>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-300">
          A dataset can be rich and still answer the wrong question if the row does not match the decision unit.
        </p>
      </div>
      <div className="grid gap-4 p-4 lg:grid-cols-3">
        {data.cases.map((item) => (
          <article key={item.case} className="rounded-md border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/60">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-950 dark:text-slate-100">{item.case}</p>
                <p className="mt-1 text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">{item.rows} rows</p>
              </div>
            </div>
            <div className="mt-4 rounded-md bg-white p-3 text-sm font-semibold text-slate-900 ring-1 ring-slate-200 dark:bg-slate-900/60 dark:text-slate-100 dark:ring-slate-700">
              {item.grain}
            </div>
            <div className="mt-4 space-y-3 text-xs leading-relaxed">
              <p><span className="font-semibold text-emerald-700 dark:text-emerald-300">Can support: </span><span className="text-slate-700 dark:text-slate-300">{item.valid_question}</span></p>
              <p><span className="font-semibold text-rose-700 dark:text-rose-300">Cannot support: </span><span className="text-slate-700 dark:text-slate-300">{item.invalid_question}</span></p>
              <p className="border-l-2 border-slate-300 pl-3 text-slate-600 dark:border-slate-600 dark:text-slate-400">{item.next_move}</p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

export function StructureCaseGrid({ data }: { data: { structures: StructureCase[] } }) {
  return (
    <div className="not-prose grid gap-4 md:grid-cols-2">
      {data.structures.map((item) => (
        <article key={item.structure} className="rounded-md border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800/40 dark:shadow-none">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{item.structure}</p>
              <h3 className="mt-1 text-lg font-semibold text-slate-950 dark:text-slate-100">{item.case}</h3>
            </div>
            <span className="rounded-full px-2 py-1 text-[10px] font-semibold text-white" style={{ background: SOURCE_COLORS[item.case] ?? '#475569' }}>
              {item.rows}
            </span>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-md bg-slate-50 p-3 dark:bg-slate-800/60">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Grain</p>
              <p className="mt-1 text-sm text-slate-800 dark:text-slate-200">{item.grain}</p>
            </div>
            <div className="rounded-md bg-slate-50 p-3 dark:bg-slate-800/60">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Default visual</p>
              <p className="mt-1 text-sm text-slate-800 dark:text-slate-200">{item.best_visual}</p>
            </div>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            <span className="font-semibold text-slate-950 dark:text-slate-100">Question: </span>{item.manager_question}
          </p>
          <p className="mt-3 border-l-2 border-amber-300 pl-3 text-xs leading-relaxed text-slate-600 dark:border-amber-700 dark:text-slate-400">
            {item.limitation}
          </p>
        </article>
      ))}
    </div>
  );
}

export function VariableTypeCards({ data }: { data: { variables: VariableCase[] } }) {
  return (
    <div className="not-prose overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800/40 dark:shadow-none">
      <div className="grid border-b border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 md:grid-cols-[1fr_1fr_1fr_1.5fr_1.5fr] dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-400">
        <span>Column</span>
        <span>Case</span>
        <span>Type</span>
        <span>Sensible use</span>
        <span>Bad use</span>
      </div>
      {data.variables.map((item) => (
        <div key={`${item.case}-${item.variable}`} className="grid gap-2 border-b border-slate-100 px-4 py-3 text-sm last:border-b-0 md:grid-cols-[1fr_1fr_1fr_1.5fr_1.5fr] md:items-start dark:border-slate-800">
          <div>
            <p className="font-mono text-xs font-semibold text-slate-950 dark:text-slate-100">{item.variable}</p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{item.example}</p>
          </div>
          <p className="text-slate-700 dark:text-slate-300">{item.case}</p>
          <p className="font-medium text-slate-950 dark:text-slate-100">{item.type}</p>
          <p className="text-slate-700 dark:text-slate-300">{item.sensible_use}</p>
          <p className="text-rose-700 dark:text-rose-300">{item.bad_use}</p>
        </div>
      ))}
    </div>
  );
}

export function QueryPipelineDiagram() {
  const steps = [
    ['Filter', 'Keep 2025 rows'],
    ['Calculate', 'revenue = price x quantity'],
    ['Group', 'city x category'],
    ['Summarize', 'sum revenue'],
    ['Sort', 'largest first'],
  ];

  return (
    <div className="not-prose rounded-md border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800/40 dark:shadow-none">
      <svg viewBox="0 0 900 190" className="h-auto w-full" role="img" aria-label="Filter, calculate, group, summarize, and sort query pipeline.">
        <rect x="0" y="0" width="900" height="190" rx="8" className="fill-slate-50 dark:fill-slate-900/60" />
        {steps.map(([label, detail], i) => {
          const x = 36 + i * 170;
          return (
            <g key={label}>
              {i > 0 && <path d={`M ${x - 54} 95 L ${x - 20} 95`} className="stroke-slate-400 dark:stroke-slate-500" strokeWidth="2" markerEnd="url(#arrow)" />}
              <rect x={x} y="46" width="120" height="98" rx="6" className="fill-white stroke-slate-300 dark:fill-slate-800 dark:stroke-slate-600" />
              <text x={x + 60} y="83" textAnchor="middle" className="fill-slate-950 text-[15px] font-semibold dark:fill-slate-100">{label}</text>
              <text x={x + 60} y="110" textAnchor="middle" className="fill-slate-600 text-[11px] dark:fill-slate-400">{detail}</text>
            </g>
          );
        })}
        <defs>
          <marker id="arrow" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto" markerUnits="strokeWidth">
            <path d="M0,0 L0,6 L9,3 z" className="fill-slate-400 dark:fill-slate-500" />
          </marker>
        </defs>
      </svg>
      <div className="mt-3 grid gap-3 text-xs leading-relaxed text-slate-600 md:grid-cols-3 dark:text-slate-400">
        <p><span className="font-semibold text-slate-900 dark:text-slate-100">Excel:</span> filter, calculated column, pivot table, sort.</p>
        <p><span className="font-semibold text-slate-900 dark:text-slate-100">SQL:</span> WHERE, expression, GROUP BY, SUM, ORDER BY.</p>
        <p><span className="font-semibold text-slate-900 dark:text-slate-100">Managerial check:</span> each step should be visible and auditable.</p>
      </div>
    </div>
  );
}

export function JoinModelDiagram() {
  return (
    <div className="not-prose grid gap-4 rounded-md border border-slate-200 bg-white p-4 shadow-sm lg:grid-cols-[1.15fr_1fr] dark:border-slate-700 dark:bg-slate-800/40 dark:shadow-none">
      <svg viewBox="0 0 520 300" className="h-auto w-full" role="img" aria-label="Join diagram for transactions, customers, products, stores, and campaigns.">
        <rect x="0" y="0" width="520" height="300" rx="8" className="fill-slate-50 dark:fill-slate-900/60" />
        {[
          ['Customers', 28, 36, '#1f3a5f'],
          ['Products', 28, 190, '#0f766e'],
          ['Transactions', 190, 112, '#c87c2a'],
          ['Stores', 360, 36, '#7c3aed'],
          ['Campaign sends', 350, 190, '#dc2626'],
        ].map(([label, x, y, color]) => (
          <g key={label as string}>
            <rect x={Number(x)} y={Number(y)} width="132" height="72" rx="6" className="fill-white dark:fill-slate-800" stroke={String(color)} strokeWidth="2" />
            <text x={Number(x) + 66} y={Number(y) + 33} textAnchor="middle" className="fill-slate-950 text-[14px] font-semibold dark:fill-slate-100">{label}</text>
            <text x={Number(x) + 66} y={Number(y) + 52} textAnchor="middle" className="fill-slate-500 text-[10px] dark:fill-slate-400">row grain matters</text>
          </g>
        ))}
        <path d="M 160 72 C 188 80, 188 120, 190 143" className="stroke-slate-500 dark:stroke-slate-400" strokeWidth="2" fill="none" />
        <path d="M 160 226 C 190 218, 184 176, 190 143" className="stroke-slate-500 dark:stroke-slate-400" strokeWidth="2" fill="none" />
        <path d="M 322 143 C 350 132, 350 84, 360 72" className="stroke-slate-500 dark:stroke-slate-400" strokeWidth="2" fill="none" />
        <path d="M 322 143 C 350 154, 340 218, 350 226" stroke="#dc2626" strokeWidth="2.5" fill="none" strokeDasharray="5 4" />
      </svg>
      <div className="space-y-3">
        <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-800/50 dark:bg-emerald-950/30">
          <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-100">Safe enrichment</p>
          <p className="mt-1 text-xs leading-relaxed text-emerald-900 dark:text-emerald-100">Transactions plus one matching customer, product, or store row keeps the result at transaction grain.</p>
        </div>
        <div className="rounded-md border border-amber-200 bg-amber-50 p-3 dark:border-amber-800/50 dark:bg-amber-950/30">
          <p className="text-sm font-semibold text-amber-900 dark:text-amber-100">Anti-join diagnostic</p>
          <p className="mt-1 text-xs leading-relaxed text-amber-900 dark:text-amber-100">Unmatched transaction IDs or customer IDs are a quality signal, not just missing text in a table.</p>
        </div>
        <div className="rounded-md border border-rose-200 bg-rose-50 p-3 dark:border-rose-800/50 dark:bg-rose-950/30">
          <p className="text-sm font-semibold text-rose-900 dark:text-rose-100">Duplicate explosion</p>
          <p className="mt-1 text-xs leading-relaxed text-rose-900 dark:text-rose-100">Campaign sends are often many rows per customer. Aggregate them before attaching them to transactions.</p>
        </div>
      </div>
    </div>
  );
}

export function ZillowWideLong({ data }: { data: ZillowWideLongData }) {
  const months = data.metadata.months;
  const grouped = groupBy(data.series, d => d.state);
  const xDomain = valueExtent(data.series, d => dateValue(d.month));
  const yDomain = valueExtent(data.series, d => d.index);
  const x = scale(xDomain, [46, 500]);
  const y = scale([Math.min(90, yDomain[0]), Math.max(170, yDomain[1])], [230, 28]);

  return (
    <div className="not-prose space-y-4">
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800/40 dark:shadow-none">
          <div className="border-b border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800/60">
            <p className="text-sm font-semibold text-slate-950 dark:text-slate-100">Wide extract</p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{data.metadata.original_shape}</p>
          </div>
          <div className="overflow-x-auto p-3">
            <table className="w-full border-collapse text-sm tabular-nums">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="px-2 py-2 text-left font-semibold dark:text-slate-200">State</th>
                  {months.map(month => <th key={month} className="px-2 py-2 text-right font-semibold dark:text-slate-200">{month}</th>)}
                </tr>
              </thead>
              <tbody>
                {data.wideRows.map(row => (
                  <tr key={String(row.state)} className="border-b border-slate-100 text-slate-700 dark:border-slate-800 dark:text-slate-300">
                    <td className="px-2 py-2 text-left">{row.state}</td>
                    {months.map(month => <td key={month} className="px-2 py-2 text-right">{formatMoney(Number(row[month]))}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800/40 dark:shadow-none">
          <div className="border-b border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800/60">
            <p className="text-sm font-semibold text-slate-950 dark:text-slate-100">Long extract</p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{data.metadata.teaching_shape}</p>
          </div>
          <div className="max-h-[270px] overflow-auto p-3">
            <table className="w-full border-collapse text-sm tabular-nums">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="px-2 py-2 text-left font-semibold dark:text-slate-200">State</th>
                  <th className="px-2 py-2 text-left font-semibold dark:text-slate-200">Month</th>
                  <th className="px-2 py-2 text-right font-semibold dark:text-slate-200">ZHVI</th>
                </tr>
              </thead>
              <tbody>
                {data.longRows.map(row => (
                  <tr key={`${row.state}-${row.month}`} className="border-b border-slate-100 text-slate-700 dark:border-slate-800 dark:text-slate-300">
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
      <div className="rounded-md border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800/40 dark:shadow-none">
        <p className="text-sm font-semibold text-slate-950 dark:text-slate-100">Once long, the chart is direct: x = month, y = index, color = state.</p>
        <svg viewBox="0 0 560 270" className="mt-3 h-auto w-full" role="img" aria-label="Indexed Zillow home value lines after reshaping to long format.">
          <rect x="0" y="0" width="560" height="270" rx="8" className="fill-slate-50 dark:fill-slate-900/60" />
          {[100, 120, 140, 160].map(t => (
            <g key={t}>
              <line x1="46" x2="500" y1={y(t)} y2={y(t)} className="stroke-slate-200 dark:stroke-slate-700" />
              <text x="38" y={y(t) + 4} textAnchor="end" className="fill-slate-500 text-[10px] dark:fill-slate-400">{t}</text>
            </g>
          ))}
          <line x1="46" x2="500" y1={y(100)} y2={y(100)} className="stroke-slate-400 dark:stroke-slate-500" strokeDasharray="4 4" />
          {Object.entries(grouped).map(([state, rows], i) => {
            const sorted = [...rows].sort((a, b) => dateValue(a.month) - dateValue(b.month));
            const path = sorted.map((row, j) => `${j === 0 ? 'M' : 'L'} ${x(dateValue(row.month)).toFixed(1)} ${y(row.index).toFixed(1)}`).join(' ');
            const last = sorted[sorted.length - 1];
            return (
              <g key={state}>
                <path d={path} fill="none" stroke={SERIES_COLORS[i % SERIES_COLORS.length]} strokeWidth="3" />
                <text x="508" y={y(last.index) + 4} className="fill-slate-700 text-[10px] dark:fill-slate-300">{state}</text>
              </g>
            );
          })}
          <text x="280" y="258" textAnchor="middle" className="fill-slate-500 text-[11px] dark:fill-slate-400">January 2020 = 100</text>
        </svg>
      </div>
    </div>
  );
}

export function QualityTriageBoard({ data }: { data: { checks: QualityCheck[] } }) {
  return (
    <div className="not-prose grid gap-4 md:grid-cols-2">
      {data.checks.map((item) => (
        <article key={`${item.case}-${item.check}`} className="rounded-md border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800/40 dark:shadow-none">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{item.case}</p>
              <h3 className="mt-1 text-base font-semibold text-slate-950 dark:text-slate-100">{item.check}</h3>
            </div>
          </div>
          <p className="mt-3 rounded-md bg-slate-50 p-3 text-sm leading-relaxed text-slate-800 dark:bg-slate-800/60 dark:text-slate-200">{item.finding}</p>
          <p className="mt-3 text-xs leading-relaxed text-rose-700 dark:text-rose-300"><span className="font-semibold">Risk: </span>{item.risk}</p>
          <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-400"><span className="font-semibold text-slate-900 dark:text-slate-100">Response: </span>{item.response}</p>
        </article>
      ))}
    </div>
  );
}
