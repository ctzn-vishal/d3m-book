'use client';

import * as React from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const COLORS = {
  android: '#b91c1c',
  iphone: '#2563eb',
  acquisition: '#d97706',
  positive: '#0f766e',
  negative: '#be123c',
  neutral: '#64748b',
  amber: '#f59e0b',
  purple: '#7c3aed',
  grid: '#e2e8f0',
  ink: '#172033',
  muted: '#64748b',
  paper: '#ffffff',
  wash: '#f8fafc',
};

type AnyRecord = Record<string, any>;

function pct(value: number | null | undefined, digits = 0) {
  if (value === null || value === undefined || Number.isNaN(value)) return 'n/a';
  return `${(value * 100).toFixed(digits)}%`;
}

function num(value: number | null | undefined, digits = 0) {
  if (value === null || value === undefined || Number.isNaN(value)) return 'n/a';
  return value.toLocaleString(undefined, {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  });
}

function shortDate(value: string) {
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function ChartShell({
  title,
  note,
  children,
}: {
  title: string;
  note?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-md border border-slate-200 bg-slate-50/70 p-4 shadow-sm">
      <div className="mb-3 flex flex-col gap-1 md:flex-row md:items-end md:justify-between">
        <h3 className="text-sm font-semibold text-slate-950">{title}</h3>
        {note && <div className="text-xs leading-snug text-slate-500 md:max-w-sm md:text-right">{note}</div>}
      </div>
      {children}
    </div>
  );
}

function MetricCard({ label, value, note, color = COLORS.ink }: { label: string; value: string; note: string; color?: string }) {
  return (
    <div className="rounded-md border border-slate-200 bg-white p-3">
      <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-1 text-2xl font-semibold tabular-nums text-slate-950" style={{ color }}>
        {value}
      </div>
      <div className="mt-1 text-xs leading-snug text-slate-500">{note}</div>
    </div>
  );
}

function Segmented({
  options,
  active,
  onChange,
}: {
  options: Array<{ id: string; label: string }>;
  active: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="inline-flex flex-wrap gap-1 rounded-md border border-slate-200 bg-white p-1">
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          onClick={() => onChange(option.id)}
          className={[
            'rounded px-2.5 py-1.5 text-xs font-semibold transition',
            active === option.id ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100',
          ].join(' ')}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

function MetricComparisonRow({
  label,
  leftLabel,
  rightLabel,
  left,
  right,
  colorLeft,
  colorRight,
  format,
}: {
  label: string;
  leftLabel: string;
  rightLabel: string;
  left: number;
  right: number;
  colorLeft: string;
  colorRight: string;
  format: (value: number) => string;
}) {
  const max = Math.max(left, right, 0.0001);
  return (
    <div className="rounded-md border border-slate-200 bg-white p-3">
      <div className="mb-2 text-sm font-semibold text-slate-900">{label}</div>
      <div className="grid gap-2">
        <div className="grid grid-cols-[80px_1fr_64px] items-center gap-2 text-xs">
          <span className="font-medium text-slate-600">{leftLabel}</span>
          <div className="h-2 rounded bg-slate-100">
            <div className="h-2 rounded" style={{ width: `${(left / max) * 100}%`, backgroundColor: colorLeft }} />
          </div>
          <span className="text-right font-mono text-slate-700">{format(left)}</span>
        </div>
        <div className="grid grid-cols-[80px_1fr_64px] items-center gap-2 text-xs">
          <span className="font-medium text-slate-600">{rightLabel}</span>
          <div className="h-2 rounded bg-slate-100">
            <div className="h-2 rounded" style={{ width: `${(right / max) * 100}%`, backgroundColor: colorRight }} />
          </div>
          <span className="text-right font-mono text-slate-700">{format(right)}</span>
        </div>
      </div>
    </div>
  );
}

function formatSignal(metric: AnyRecord) {
  if (metric.unit === 'share') return (value: number) => pct(value, 0);
  if (metric.unit === 'words') return (value: number) => value.toFixed(1);
  return (value: number) => value.toFixed(2);
}

export function TrumpSourceOverview({ data }: { data: AnyRecord }) {
  const campaignAndroid = data.campaignSummary.find((row: AnyRecord) => row.device === 'Android');
  const campaignIphone = data.campaignSummary.find((row: AnyRecord) => row.device === 'iPhone');

  return (
    <ChartShell title="Device labels define two different communication streams" note={data.metadata.note}>
      <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
        <div className="h-[330px] min-w-0 rounded-md border border-slate-200 bg-white p-3">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.monthly} margin={{ top: 8, right: 8, bottom: 6, left: 0 }}>
              <CartesianGrid stroke={COLORS.grid} vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} interval={1} />
              <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={46} />
              <Tooltip formatter={(value: number, name: string) => [value.toLocaleString(), name]} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="Android" stackId="source" fill={COLORS.android} />
              <Bar dataKey="iPhone" stackId="source" fill={COLORS.iphone} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-1">
          <MetricCard label="Full corpus" value={data.metadata.rows.toLocaleString()} note={`${data.metadata.startDate} to ${data.metadata.endDate}`} />
          <MetricCard
            label="Campaign window"
            value={data.metadata.campaignRows.toLocaleString()}
            note="The classifier uses this pre-election slice."
          />
          <MetricCard
            label="Android share"
            value={pct((campaignAndroid?.n ?? 0) / ((campaignAndroid?.n ?? 0) + (campaignIphone?.n ?? 0)), 0)}
            note="In the January-November 2016 campaign window."
            color={COLORS.android}
          />
        </div>
      </div>
    </ChartShell>
  );
}

export function TrumpSignalExplorer({ data }: { data: AnyRecord }) {
  const [active, setActive] = React.useState<string>(data.signalGroups[0]?.id ?? 'tone');
  const group = data.signalGroups.find((row: AnyRecord) => row.id === active) ?? data.signalGroups[0];

  return (
    <ChartShell title="The fingerprint is strongest when text and posting routine are read together" note={group.description}>
      <div className="mb-4">
        <Segmented
          active={active}
          onChange={setActive}
          options={data.signalGroups.map((row: AnyRecord) => ({ id: row.id, label: row.label }))}
        />
      </div>
      <div className="grid gap-3 lg:grid-cols-3">
        {group.metrics.map((metric: AnyRecord) => (
          <MetricComparisonRow
            key={metric.metric}
            label={metric.metric}
            leftLabel="Android"
            rightLabel="iPhone"
            left={metric.Android}
            right={metric.iPhone}
            colorLeft={COLORS.android}
            colorRight={COLORS.iphone}
            format={formatSignal(metric)}
          />
        ))}
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {(['Android', 'iPhone'] as const).map((device) => (
          <div key={device} className="rounded-md border border-slate-200 bg-white p-3">
            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">{device}-label examples</div>
            <div className="space-y-2">
              {data.examples[device].map((row: AnyRecord) => (
                <blockquote key={`${row.date}-${row.tweet}`} className="border-l-2 pl-3 text-xs leading-snug text-slate-700" style={{ borderColor: device === 'Android' ? COLORS.android : COLORS.iphone }}>
                  <span className="mb-1 block font-mono text-[11px] text-slate-500">{row.date}</span>
                  {row.tweet}
                </blockquote>
              ))}
            </div>
          </div>
        ))}
      </div>
    </ChartShell>
  );
}

function ConfusionMatrix({ classifier }: { classifier: AnyRecord }) {
  const labels: string[] = classifier.labels;
  const lookup = new Map<string, number>();
  classifier.confusion.forEach((row: AnyRecord) => lookup.set(`${row.actual}-${row.predicted}`, row.count));
  const max = Math.max(...classifier.confusion.map((row: AnyRecord) => row.count));

  return (
    <div className="overflow-hidden rounded-md border border-slate-200 bg-white">
      <div className="grid grid-cols-[100px_repeat(2,1fr)] border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
        <div className="px-3 py-2">Actual</div>
        {labels.map((label) => (
          <div key={label} className="px-3 py-2 text-center">Predicted {label}</div>
        ))}
      </div>
      {labels.map((actual) => (
        <div key={actual} className="grid grid-cols-[100px_repeat(2,1fr)] border-b border-slate-100 last:border-0">
          <div className="px-3 py-4 text-xs font-semibold text-slate-700">{actual}</div>
          {labels.map((predicted) => {
            const count = lookup.get(`${actual}-${predicted}`) ?? 0;
            const strength = count / max;
            const correct = actual === predicted;
            return (
              <div
                key={predicted}
                className="px-3 py-4 text-center font-mono text-sm font-semibold"
                style={{
                  backgroundColor: correct ? `rgba(15, 118, 110, ${0.12 + strength * 0.24})` : `rgba(190, 18, 60, ${0.08 + strength * 0.18})`,
                  color: correct ? '#115e59' : '#9f1239',
                }}
              >
                {count.toLocaleString()}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

function TermLadder({ rows, device }: { rows: AnyRecord[]; device: 'Android' | 'iPhone' }) {
  const color = device === 'Android' ? COLORS.android : COLORS.iphone;
  const sorted = [...rows].sort((a, b) => Math.abs(b.gap) - Math.abs(a.gap)).slice(0, 10);
  const max = Math.max(...sorted.map((row) => Math.max(row.androidRate, row.iphoneRate)), 0.001);
  return (
    <div className="grid gap-2">
      {sorted.map((row) => (
        <div key={row.term} className="grid grid-cols-[120px_1fr_70px] items-center gap-2 text-xs">
          <div className="truncate font-mono text-slate-700">{row.term}</div>
          <div className="h-2 rounded bg-slate-100">
            <div
              className="h-2 rounded"
              style={{ width: `${((device === 'Android' ? row.androidRate : row.iphoneRate) / max) * 100}%`, backgroundColor: color }}
            />
          </div>
          <div className="text-right font-mono text-slate-500">
            {num((device === 'Android' ? row.androidRate : row.iphoneRate) * 100, 1)}/100
          </div>
        </div>
      ))}
    </div>
  );
}

export function TrumpClassifierPanel({ data }: { data: AnyRecord }) {
  const [device, setDevice] = React.useState<'Android' | 'iPhone'>('Android');
  const classifier = data.classifier;

  return (
    <ChartShell title="A transparent baseline can recover the source label, but it is not an authorship oracle">
      <div className="grid gap-4 lg:grid-cols-[300px_1fr]">
        <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-1">
          <MetricCard label="Held-out accuracy" value={pct(classifier.accuracy, 0)} note={`${classifier.testRows.toLocaleString()} held-out tweets`} color={COLORS.positive} />
          <MetricCard label="Majority baseline" value={pct(classifier.baselineAccuracy, 0)} note="Always predict the larger class." />
          <MetricCard label="Vocabulary" value={classifier.vocabTerms.toLocaleString()} note="Unigrams and bigrams after basic cleaning." />
        </div>
        <ConfusionMatrix classifier={classifier} />
      </div>
      <div className="mt-4 rounded-md border border-slate-200 bg-white p-4">
        <div className="mb-3 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h4 className="text-sm font-semibold text-slate-950">Reader-facing cue terms</h4>
            <p className="text-xs text-slate-500">Counts are shown as term hits per 100 campaign-window tweets in the selected source.</p>
          </div>
          <Segmented
            active={device}
            onChange={(id) => setDevice(id as 'Android' | 'iPhone')}
            options={[
              { id: 'Android', label: 'Android cues' },
              { id: 'iPhone', label: 'iPhone cues' },
            ]}
          />
        </div>
        <TermLadder rows={data.selectedTerms[device]} device={device} />
      </div>
    </ChartShell>
  );
}

export function BeerAcquisitionOverview({ data }: { data: AnyRecord }) {
  const peakDay = data.daily.reduce((best: AnyRecord, row: AnyRecord) => (row.n > best.n ? row : best), data.daily[0]);
  const acquisition = data.periods.find((row: AnyRecord) => row.period === 'Acquisition');
  const post = data.periods.find((row: AnyRecord) => row.period === 'Post');

  return (
    <ChartShell title="The acquisition first shows up as a chatter spike, not a clean sentiment series" note={data.metadata.periodNote}>
      <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
        <div className="h-[310px] rounded-md border border-slate-200 bg-white p-3">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.periods} margin={{ top: 8, right: 8, bottom: 6, left: 0 }}>
              <CartesianGrid stroke={COLORS.grid} vertical={false} />
              <XAxis dataKey="period" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
              <YAxis yAxisId="left" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={56} />
              <YAxis yAxisId="right" orientation="right" tickFormatter={(value: number) => pct(value, 0)} domain={[0, 1]} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={46} />
              <Tooltip formatter={(value: number, name: string) => (name.includes('Share') ? [pct(value, 1), name] : [value.toLocaleString(), name])} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar yAxisId="left" dataKey="n" name="Tweets" fill={COLORS.neutral} />
              <Bar yAxisId="right" dataKey="positiveShare" name="Positive share" fill={COLORS.positive} />
              <Bar yAxisId="right" dataKey="negativeShare" name="Negative share" fill={COLORS.negative} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-1">
          <MetricCard label="Corpus" value={data.metadata.rows.toLocaleString()} note={`${data.metadata.startDate} to ${data.metadata.endDate}`} />
          <MetricCard label="Peak day" value={peakDay.n.toLocaleString()} note={`${shortDate(peakDay.date)} tweets in one day.`} color={COLORS.acquisition} />
          <MetricCard label="Event cue share" value={pct(acquisition.acquisitionCueShare, 0)} note="Acquisition-window tweets mentioning acquisition cues." color={COLORS.acquisition} />
          <MetricCard label="Post-event cue share" value={pct(post.acquisitionCueShare, 0)} note="The acquisition vocabulary fades but does not vanish." />
        </div>
      </div>
    </ChartShell>
  );
}

export function BeerAcquisitionTimeline({ data }: { data: AnyRecord }) {
  const [view, setView] = React.useState('volume');
  const options = [
    { id: 'volume', label: 'Volume' },
    { id: 'sentiment', label: 'Sentiment' },
    { id: 'noise', label: 'Noise' },
  ];

  return (
    <ChartShell title="The event study needs separate lines for volume, tone, and measurement noise">
      <div className="mb-4">
        <Segmented options={options} active={view} onChange={setView} />
      </div>
      <div className="h-[360px] rounded-md border border-slate-200 bg-white p-3">
        {view === 'volume' && (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data.daily} margin={{ top: 8, right: 16, bottom: 6, left: 0 }}>
              <CartesianGrid stroke={COLORS.grid} vertical={false} />
              <XAxis dataKey="date" tickFormatter={shortDate} minTickGap={28} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis yAxisId="left" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={56} />
              <YAxis yAxisId="right" orientation="right" tickFormatter={(value: number) => pct(value, 0)} domain={[0, 1]} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={46} />
              <Tooltip formatter={(value: number, name: string) => (name === 'Acquisition cue share' ? [pct(value, 1), name] : [value.toLocaleString(), name])} labelFormatter={shortDate} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <ReferenceLine yAxisId="left" x="2011-03-30" stroke={COLORS.acquisition} strokeDasharray="4 4" label={{ value: 'Mar 30', fontSize: 11, fill: COLORS.acquisition }} />
              <Bar yAxisId="left" dataKey="n" name="Tweets" fill="#cbd5e1" />
              <Line yAxisId="right" type="monotone" dataKey="acquisitionCueShare" name="Acquisition cue share" stroke={COLORS.acquisition} strokeWidth={3} dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        )}
        {view === 'sentiment' && (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.daily} margin={{ top: 8, right: 16, bottom: 6, left: 0 }}>
              <CartesianGrid stroke={COLORS.grid} vertical={false} />
              <XAxis dataKey="date" tickFormatter={shortDate} minTickGap={28} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis tickFormatter={(value: number) => pct(value, 0)} domain={[0, 0.5]} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={46} />
              <Tooltip formatter={(value: number, name: string) => [pct(value, 1), name]} labelFormatter={shortDate} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <ReferenceLine x="2011-03-30" stroke={COLORS.acquisition} strokeDasharray="4 4" />
              <Line type="monotone" dataKey="positiveShare" name="Positive share" stroke={COLORS.positive} strokeWidth={3} dot={false} />
              <Line type="monotone" dataKey="negativeShare" name="Negative share" stroke={COLORS.negative} strokeWidth={3} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        )}
        {view === 'noise' && (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.daily} margin={{ top: 8, right: 16, bottom: 6, left: 0 }}>
              <CartesianGrid stroke={COLORS.grid} vertical={false} />
              <XAxis dataKey="date" tickFormatter={shortDate} minTickGap={28} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis tickFormatter={(value: number) => pct(value, 0)} domain={[0, 1]} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={46} />
              <Tooltip formatter={(value: number, name: string) => [pct(value, 1), name]} labelFormatter={shortDate} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <ReferenceLine x="2011-03-30" stroke={COLORS.acquisition} strokeDasharray="4 4" />
              <Line type="monotone" dataKey="urlShare" name="URL share" stroke={COLORS.purple} strokeWidth={3} dot={false} />
              <Line type="monotone" dataKey="acquisitionCueShare" name="Acquisition cue share" stroke={COLORS.acquisition} strokeWidth={3} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </ChartShell>
  );
}

function SourceMix({ rows, period }: { rows: AnyRecord[]; period: string }) {
  return (
    <div className="grid gap-2">
      {rows.map((row) => (
        <div key={row.sourceGroup} className="grid grid-cols-[150px_1fr_52px] items-center gap-2 text-xs">
          <div className="truncate text-slate-700">{row.sourceGroup}</div>
          <div className="h-2 rounded bg-slate-100">
            <div className="h-2 rounded bg-slate-600" style={{ width: `${row[period] * 100}%` }} />
          </div>
          <div className="text-right font-mono text-slate-500">{pct(row[period], 0)}</div>
        </div>
      ))}
    </div>
  );
}

function PeriodTerms({ rows, period }: { rows: AnyRecord[]; period: string }) {
  const sorted = [...rows].sort((a, b) => b[`${period}Rate`] - a[`${period}Rate`]).slice(0, 12);
  const max = Math.max(...sorted.map((row) => row[`${period}Rate`]), 0.001);
  return (
    <div className="grid gap-2">
      {sorted.map((row) => (
        <div key={row.term} className="grid grid-cols-[110px_1fr_58px] items-center gap-2 text-xs">
          <div className="truncate font-mono text-slate-700">{row.term}</div>
          <div className="h-2 rounded bg-slate-100">
            <div
              className="h-2 rounded"
              style={{ width: `${(row[`${period}Rate`] / max) * 100}%`, backgroundColor: period === 'Acquisition' ? COLORS.acquisition : COLORS.positive }}
            />
          </div>
          <div className="text-right font-mono text-slate-500">{num(row[`${period}Rate`] * 100, 1)}/100</div>
        </div>
      ))}
    </div>
  );
}

export function BeerPeriodExplorer({ data }: { data: AnyRecord }) {
  const [period, setPeriod] = React.useState('Acquisition');
  const active = data.periods.find((row: AnyRecord) => row.period === period) ?? data.periods[0];
  const examples = data.examples[period] ?? [];

  return (
    <ChartShell title="A sentiment readout is only useful after separating event talk from product talk">
      <div className="mb-4">
        <Segmented
          active={period}
          onChange={setPeriod}
          options={data.periods.map((row: AnyRecord) => ({ id: row.period, label: row.period }))}
        />
      </div>
      <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
        <div className="grid gap-2">
          <MetricCard label={`${period} tweets`} value={active.n.toLocaleString()} note={`${active.startDate} to ${active.endDate}`} color={period === 'Acquisition' ? COLORS.acquisition : COLORS.ink} />
          <MetricCard label="Positive / negative" value={`${pct(active.positiveShare, 0)} / ${pct(active.negativeShare, 0)}`} note="Lexicon-coded shares, not human labels." />
          <MetricCard label="URL share" value={pct(active.urlShare, 0)} note="High link share warns against reading volume as opinion." />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-md border border-slate-200 bg-white p-4">
            <div className="mb-3 text-sm font-semibold text-slate-950">Cue terms in this period</div>
            <PeriodTerms rows={data.periodCueTerms} period={period} />
          </div>
          <div className="rounded-md border border-slate-200 bg-white p-4">
            <div className="mb-3 text-sm font-semibold text-slate-950">Source mix</div>
            <SourceMix rows={data.sourceGroups} period={period} />
          </div>
        </div>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {examples.map((row: AnyRecord) => (
          <blockquote key={`${row.date}-${row.text}`} className="rounded-md border border-slate-200 bg-white p-3 text-xs leading-snug text-slate-700">
            <span className="mb-1 block font-mono text-[11px] text-slate-500">{row.date} - {row.source}</span>
            {row.text}
          </blockquote>
        ))}
      </div>
    </ChartShell>
  );
}
