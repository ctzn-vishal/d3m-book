"use client";

import * as React from 'react';
import * as Plot from '@observablehq/plot';
import { PlotFigure } from '@/components/Book/charts/PlotFigure';
import { withBookTheme, CHART } from '@/lib/chart-theme';

type PlotOptions = NonNullable<Parameters<typeof Plot.plot>[0]>;

type IndustryMetric = {
  industry: string;
  owner_entities: number;
  spend: number;
  leader: string;
  cr1: number;
  cr4: number;
  cr8: number;
  hhi: number;
  effective_entities: number;
  hhi_band: string;
};

type LevelComparison = {
  industry: string;
  owner_hhi: number;
  advertiser_hhi: number;
  brand_hhi: number;
  owner_cr4: number;
  advertiser_cr4: number;
  owner_entities: number;
  advertiser_entities: number;
};

type AnnualDelta = {
  industry: string;
  hhi_2018: number;
  hhi_2022: number;
  cr4_2018: number;
  cr4_2022: number;
  leader_2018: string;
  leader_2022: string;
  spend_2018: number;
  spend_2022: number;
  hhi_delta: number;
  cr4_delta: number;
  spend_delta: number;
};

type ThresholdSensitivity = {
  min_entity_spend: number;
  level: string;
  industry: string;
  all_entities: number;
  retained_entities: number;
  retained_spend: number;
  all_spend: number;
  retained_spend_share: number;
  leader: string;
  cr1: number;
  cr4: number;
  cr8: number;
  hhi: number;
  hhi_full_denominator: number;
  effective_entities: number;
  hhi_band: string;
};

type MarketDefinitionSensitivityRow = {
  field: string;
  markets: number;
  spend: number;
  high_markets: number;
  moderate_markets: number;
  unconcentrated_markets: number;
  high_spend_share: number;
  concentrated_spend_share: number;
  median_spend: number;
  median_hhi: number;
  p90_hhi: number;
  avg_hhi: number;
  median_cr4: number;
  median_entities: number;
};

type PharmaMarket = {
  field: string;
  market: string;
  owner_entities: number;
  spend: number;
  leader: string;
  cr1: number;
  cr4: number;
  hhi: number;
  effective_entities: number;
  hhi_band: string;
};

type TopOwner = {
  industry: string;
  rank: number;
  entity: string;
  spend: number;
  market_share: number;
};

type EntitySpendDistribution = {
  entity_industry_rows?: number;
  p10?: number;
  p25?: number;
  p50?: number;
  p75?: number;
  p90?: number;
  p99?: number;
  max_spend?: number;
} & Record<string, number>;

type MarketConcentrationData = {
  meta?: {
    defaultMarketField?: string;
  };
  overview: {
    row_count: number;
    spend: number;
    industry_groups: number;
    industries: number;
    majors: number;
    categories: number;
    subcategories: number;
    owner_entities: number;
    raw_parent_entities: number;
    advertisers: number;
    brands: number;
    products: number;
    parent_unknown_spend: number;
  };
  entitySpendDistribution: EntitySpendDistribution;
  bandCounts: Record<string, number>;
  industryMetrics: IndustryMetric[];
  marketDefinitionSensitivity: MarketDefinitionSensitivityRow[];
  levelComparison: LevelComparison[];
  annualDelta: AnnualDelta[];
  thresholdSensitivity: ThresholdSensitivity[];
  pharmaMarketDrilldown: PharmaMarket[];
  topOwners: TopOwner[];
};

// HHI band palette, expressed against the book's chart tokens so the figures
// stay on the light reading theme.
const BAND_COLORS: Record<string, string> = {
  "Highly concentrated": CHART.rose,
  "Moderately concentrated": CHART.amber,
  Unconcentrated: CHART.teal,
};

const BAND_LABELS = ["Highly concentrated", "Moderately concentrated", "Unconcentrated"];
const THRESHOLD_LABELS: Record<number, string> = {
  0: "All positive",
  10000: "$10k+",
  100000: "$100k+",
  1000000: "$1M+",
};
const THRESHOLDS = [0, 10000, 100000, 1000000];
const ENTITY_LEVELS = ["Owner proxy", "Advertiser", "Brand"];

const fmtMoney = (value: number) => {
  const abs = Math.abs(value);
  if (abs >= 1e9) return `$${(value / 1e9).toFixed(abs >= 10e9 ? 1 : 2)}B`;
  if (abs >= 1e6) return `$${(value / 1e6).toFixed(abs >= 10e6 ? 1 : 2)}M`;
  if (abs >= 1e3) return `$${(value / 1e3).toFixed(1)}k`;
  return `$${value.toFixed(0)}`;
};
const fmtInt = (value: number) => Math.round(value).toLocaleString();
const fmtPct = (value: number) => `${(value * 100).toFixed(1)}%`;
const shortLabel = (value: string, max = 27) => value.length > max ? `${value.slice(0, max - 1)}...` : value;
const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));
const SUBSTANTIAL_MARKET_SPEND = 500_000_000;

const fieldLabels: Record<string, string> = {
  Industry_Group: "Industry group",
  INDUSTRY: "Industry",
  MAJOR: "Major",
  CATEGORY: "Category",
  SUBCATEGORY: "Subcategory",
  MICROCATEGORY: "Microcategory",
};

const bandFor = (hhi: number) =>
  hhi >= 1800 ? "Highly concentrated" : hhi >= 1000 ? "Moderately concentrated" : "Unconcentrated";

const substantialIndustryRows = (data: MarketConcentrationData) =>
  data.industryMetrics
    .filter(row => row.spend >= SUBSTANTIAL_MARKET_SPEND)
    .sort((a, b) => b.hhi - a.hhi);

// ---------------------------------------------------------------------------
// Shared layout primitives (light reading theme).
// ---------------------------------------------------------------------------

function ChartCard({
  title,
  subtitle,
  controls,
  children,
}: {
  title: string;
  subtitle?: string;
  controls?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-950">{title}</h3>
          {subtitle && <p className="mt-1 text-xs leading-snug text-slate-500">{subtitle}</p>}
        </div>
        {controls}
      </div>
      {children}
    </div>
  );
}

function Legend({ items }: { items: Array<{ label: string; color: string }> }) {
  return (
    <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600">
      {items.map(item => (
        <span key={item.label} className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: item.color }} />
          {item.label}
        </span>
      ))}
    </div>
  );
}

/** Segmented button group used for the live entity-level / threshold selectors. */
function Segmented<T extends string | number>({
  label,
  value,
  options,
  onChange,
  format,
}: {
  label: string;
  value: T;
  options: readonly T[];
  onChange: (next: T) => void;
  format?: (option: T) => string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">{label}</span>
      <div className="inline-flex flex-wrap rounded-md border border-slate-200 bg-slate-50 p-0.5">
        {options.map(option => {
          const active = option === value;
          return (
            <button
              key={String(option)}
              type="button"
              onClick={() => onChange(option)}
              aria-pressed={active}
              className={
                "rounded px-2.5 py-1 text-xs font-medium transition-colors " +
                (active
                  ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200"
                  : "text-slate-500 hover:text-slate-800")
              }
            >
              {format ? format(option) : String(option)}
            </button>
          );
        })}
      </div>
    </div>
  );
}

const BAND_THRESHOLDS: Array<{ value: number; color: string; label: string }> = [
  { value: 1000, color: CHART.amber, label: "1,000" },
  { value: 1800, color: CHART.rose, label: "1,800" },
];

/** The 1,000 / 1,800 HHI reference lines, drawn as vertical rules with labels. */
function hhiRefMarksX() {
  return [
    Plot.ruleX(BAND_THRESHOLDS, {
      x: "value",
      stroke: "color",
      strokeDasharray: "5 5",
      strokeWidth: 1.2,
    }),
    Plot.text(BAND_THRESHOLDS, {
      x: "value",
      text: "label",
      frameAnchor: "top",
      dy: -6,
      fill: d => d.color,
      fontSize: 10,
    }),
  ];
}

/** The 1,000 / 1,800 HHI reference lines drawn horizontally (for y = HHI). */
function hhiRefMarksY() {
  return [
    Plot.ruleY(BAND_THRESHOLDS, {
      y: "value",
      stroke: "color",
      strokeDasharray: "5 5",
      strokeWidth: 1.2,
    }),
    Plot.text(BAND_THRESHOLDS, {
      y: "value",
      text: d => `HHI ${d.label}`,
      frameAnchor: "right",
      dx: 4,
      fill: d => d.color,
      fontSize: 10,
    }),
  ];
}

// ---------------------------------------------------------------------------
// 1. Metric cards (text KPIs — no chart to convert).
// ---------------------------------------------------------------------------

export function ConcentrationMetricCards({ data }: { data: MarketConcentrationData }) {
  const top = substantialIndustryRows(data)[0] ?? data.industryMetrics[0];
  const moderate = data.bandCounts["Moderately concentrated"] ?? 0;
  const high = data.bandCounts["Highly concentrated"] ?? 0;
  const unknownShare = data.overview.parent_unknown_spend / data.overview.spend;
  const marketField = data.meta?.defaultMarketField ?? "INDUSTRY";
  const cards = [
    {
      label: "Study window",
      value: `${data.overview.industries} ${marketField} markets`,
      detail: `${data.overview.industry_groups} broad groups; ${fmtMoney(data.overview.spend)} in positive 2018-2022 ad spend`,
    },
    {
      label: "Owner proxy entities",
      value: fmtInt(data.overview.owner_entities),
      detail: "PARENT when known, otherwise ADVERTISER",
    },
    {
      label: "HHI bands",
      value: `${high} high / ${moderate} moderate`,
      detail: "DOJ/FTC-style thresholds used as visual reference lines",
    },
    {
      label: "Top large industry",
      value: fmtInt(top.hhi),
      detail: `${top.industry}; ${fmtPct(top.cr4)} CR4; ${fmtMoney(top.spend)} spend`,
    },
    {
      label: "Unknown-parent spend",
      value: fmtPct(unknownShare),
      detail: "Split to advertiser instead of treated as one firm",
    },
    {
      label: "Median entity spend",
      value: fmtMoney(data.entitySpendDistribution.p50 ?? 0),
      detail: `99th percentile: ${fmtMoney(data.entitySpendDistribution.p99 ?? 0)}`,
    },
  ];
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {cards.map(card => (
        <div key={card.label} className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-[10px] font-semibold uppercase text-slate-500">{card.label}</p>
          <p className="mt-2 text-2xl font-semibold tabular-nums text-slate-950">{card.value}</p>
          <p className="mt-1 text-xs leading-snug text-slate-500">{card.detail}</p>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// 2. Entity-spend distribution (NEW): the right-skewed tail the text describes.
//     Plots the percentile ladder as a log-scaled strip with p50/p99 markers.
// ---------------------------------------------------------------------------

export function EntitySpendDistribution({ data }: { data: MarketConcentrationData }) {
  const dist = data.entitySpendDistribution;
  const points = [
    { pct: "p10", label: "10th", value: dist.p10 ?? 0 },
    { pct: "p25", label: "25th", value: dist.p25 ?? 0 },
    { pct: "p50", label: "Median", value: dist.p50 ?? 0 },
    { pct: "p75", label: "75th", value: dist.p75 ?? 0 },
    { pct: "p90", label: "90th", value: dist.p90 ?? 0 },
    { pct: "p99", label: "99th", value: dist.p99 ?? 0 },
    { pct: "max", label: "Max", value: dist.max_spend ?? 0 },
  ].filter(d => d.value > 0);

  const highlight = new Set(["Median", "99th"]);
  const rows = Number(dist.entity_industry_rows ?? 0);

  return (
    <ChartCard
      title="Entity spend is extremely right-skewed"
      subtitle={`Owner-by-INDUSTRY total 2018-2022 spend across ${fmtInt(rows)} entity rows. Note the log axis: the median entity spends about ${fmtMoney(dist.p50 ?? 0)}, while the 99th percentile spends about ${fmtMoney(dist.p99 ?? 0)}.`}
    >
      <PlotFigure
        ariaLabel="Percentile ladder of entity spend on a log scale."
        options={(width) =>
          withBookTheme({
            width,
            height: 230,
            marginLeft: 70,
            marginBottom: 38,
            x: {
              type: "log",
              label: "Total 2018-2022 spend per entity (log scale)",
              grid: true,
              tickFormat: (d: number) => fmtMoney(d),
            },
            y: { label: null, domain: points.map(d => d.label) },
            color: { legend: false },
            marks: [
              // Stem from the smallest percentile so the skew reads as a ramp.
              Plot.ruleY(points, {
                y: "label",
                x1: () => Math.max(1, points[0].value),
                x2: "value",
                stroke: CHART.border,
                strokeWidth: 2,
              }),
              Plot.dot(points, {
                x: "value",
                y: "label",
                r: d => (highlight.has(d.label) ? 7 : 5),
                fill: d => (highlight.has(d.label) ? CHART.rose : CHART.sky),
                stroke: "white",
                strokeWidth: 1.5,
                tip: true,
                title: d => `${d.label} percentile\n${fmtMoney(d.value)} per entity`,
              }),
              Plot.text(points, {
                x: "value",
                y: "label",
                text: d => fmtMoney(d.value),
                dx: 10,
                textAnchor: "start",
                fontSize: 10,
                fill: CHART.body,
              }),
            ],
          }) as PlotOptions
        }
      />
      <p className="mt-2 text-xs leading-relaxed text-slate-500">
        The long upper tail is why a minimum-spend threshold is tempting and why it must be reported as a sensitivity check: dropping the
        bottom percentiles and renormalizing the survivors mechanically raises HHI.
      </p>
    </ChartCard>
  );
}

// ---------------------------------------------------------------------------
// 3. HHI ranking — lollipop / dot-plot (replaces the old solid bar grammar).
// ---------------------------------------------------------------------------

export function HHIRankChart({ data }: { data: MarketConcentrationData }) {
  const rows = substantialIndustryRows(data).slice(0, 24);
  return (
    <ChartCard
      title="HHI by substantial source-defined industry"
      subtitle={`Owner-proxy ad spend shares, 2018-2022 pooled; shown for INDUSTRY markets with at least ${fmtMoney(SUBSTANTIAL_MARKET_SPEND)} spend. Each row is a lollipop: stem length and dot color encode HHI.`}
    >
      <PlotFigure
        ariaLabel="Lollipop ranking of HHI by source-defined industry."
        options={(width) =>
          withBookTheme({
            width,
            height: rows.length * 26 + 56,
            marginLeft: 196,
            marginRight: 46,
            marginTop: 24,
            x: {
              label: "Herfindahl-Hirschman Index",
              grid: true,
              domain: [0, Math.max(5200, Math.max(...rows.map(d => d.hhi)) * 1.05)],
            },
            y: { label: null, domain: rows.map(d => d.industry), tickFormat: (d: string) => shortLabel(d, 30) },
            marks: [
              ...hhiRefMarksX(),
              Plot.ruleY(rows, { y: "industry", x1: 0, x2: "hhi", stroke: CHART.border, strokeWidth: 1.5 }),
              Plot.dot(rows, {
                x: "hhi",
                y: "industry",
                r: 5.5,
                fill: d => BAND_COLORS[d.hhi_band] ?? CHART.slate,
                stroke: "white",
                strokeWidth: 1,
                tip: true,
                title: d =>
                  `${d.industry}\nHHI ${fmtInt(d.hhi)} (${d.hhi_band})\nCR1 ${fmtPct(d.cr1)} | CR4 ${fmtPct(d.cr4)}\nLeader: ${d.leader}\nSpend ${fmtMoney(d.spend)}`,
              }),
              Plot.text(rows, {
                x: "hhi",
                y: "industry",
                text: d => fmtInt(d.hhi),
                dx: 11,
                textAnchor: "start",
                fontSize: 10,
                fill: CHART.body,
              }),
            ],
          }) as PlotOptions
        }
      />
      <Legend items={BAND_LABELS.map(label => ({ label, color: BAND_COLORS[label] }))} />
    </ChartCard>
  );
}

// ---------------------------------------------------------------------------
// 4. Market-definition sensitivity — band-count stacked bars + median HHI dots.
// ---------------------------------------------------------------------------

export function MarketDefinitionSensitivity({ data }: { data: MarketConcentrationData }) {
  const fieldOrder = ["Industry_Group", "INDUSTRY", "MAJOR", "CATEGORY", "SUBCATEGORY"];
  const rows = fieldOrder
    .map(field => data.marketDefinitionSensitivity.find(row => row.field === field))
    .filter((row): row is MarketDefinitionSensitivityRow => Boolean(row));

  // Long-form share-of-markets-in-band, for a 100% stacked bar per level.
  const stacked = rows.flatMap(row => {
    const total = row.markets || 1;
    return [
      { field: row.field, band: "Highly concentrated", share: row.high_markets / total, count: row.high_markets },
      { field: row.field, band: "Moderately concentrated", share: row.moderate_markets / total, count: row.moderate_markets },
      { field: row.field, band: "Unconcentrated", share: row.unconcentrated_markets / total, count: row.unconcentrated_markets },
    ];
  });
  const labelFor = (field: string) => fieldLabels[field] ?? field;

  return (
    <ChartCard
      title="Market definition changes the empirical result"
      subtitle="The same owner-proxy spend shares are recomputed at progressively narrower source hierarchy levels. Bars show the share of markets in each HHI band; dots mark the median HHI."
    >
      <div className="grid gap-4 lg:grid-cols-2">
        <PlotFigure
          ariaLabel="Share of markets by HHI band across hierarchy levels."
          options={(width) =>
            withBookTheme({
              width,
              height: 230,
              marginLeft: 96,
              marginBottom: 38,
              x: { label: "Share of markets in band", percent: true, grid: true },
              y: { label: null, domain: fieldOrder, tickFormat: labelFor },
              color: {
                domain: BAND_LABELS,
                range: BAND_LABELS.map(b => BAND_COLORS[b]),
              },
              marks: [
                Plot.barX(stacked, {
                  x: "share",
                  y: "field",
                  fill: "band",
                  order: BAND_LABELS,
                  tip: true,
                  title: d => `${labelFor(d.field)}\n${d.band}: ${fmtInt(d.count)} markets (${fmtPct(d.share)})`,
                }),
              ],
            }) as PlotOptions
          }
        />
        <PlotFigure
          ariaLabel="Median HHI across hierarchy levels."
          options={(width) =>
            withBookTheme({
              width,
              height: 230,
              marginLeft: 96,
              marginRight: 46,
              marginBottom: 38,
              marginTop: 22,
              x: {
                label: "Median HHI",
                grid: true,
                domain: [0, Math.max(2200, Math.max(...rows.map(r => r.median_hhi)) * 1.1)],
              },
              y: { label: null, domain: fieldOrder, tickFormat: labelFor },
              marks: [
                ...hhiRefMarksX(),
                Plot.ruleY(rows, { y: "field", x1: 0, x2: "median_hhi", stroke: CHART.border, strokeWidth: 1.5 }),
                Plot.dot(rows, {
                  x: "median_hhi",
                  y: "field",
                  r: 6,
                  fill: d => BAND_COLORS[bandFor(d.median_hhi)] ?? CHART.slate,
                  stroke: "white",
                  strokeWidth: 1,
                  tip: true,
                  title: d =>
                    `${labelFor(d.field)}\n${fmtInt(d.markets)} markets; median ${fmtInt(d.median_entities)} entities\nMedian HHI ${fmtInt(d.median_hhi)}\n${fmtPct(d.concentrated_spend_share)} of spend in HHI >= 1,000 markets`,
                }),
                Plot.text(rows, {
                  x: "median_hhi",
                  y: "field",
                  text: d => fmtInt(d.median_hhi),
                  dx: 11,
                  textAnchor: "start",
                  fontSize: 10,
                  fill: CHART.body,
                }),
              ],
            }) as PlotOptions
          }
        />
      </div>
      <Legend items={BAND_LABELS.map(label => ({ label, color: BAND_COLORS[label] }))} />
    </ChartCard>
  );
}

// ---------------------------------------------------------------------------
// 5. Pharma drilldown — horizontal HHI bars with band fill + threshold lines.
// ---------------------------------------------------------------------------

export function PharmaMarketDrilldown({ data }: { data: MarketConcentrationData }) {
  const broadRows = data.pharmaMarketDrilldown
    .filter(row => row.field === "INDUSTRY")
    .sort((a, b) => b.spend - a.spend);
  const subcategoryRows = data.pharmaMarketDrilldown
    .filter(row => row.field === "SUBCATEGORY")
    .sort((a, b) => b.spend - a.spend)
    .slice(0, 10);
  const rows = [...broadRows, ...subcategoryRows].map(row => ({
    ...row,
    key: `${fieldLabels[row.field] ?? row.field} - ${shortLabel(row.market, 30)}`,
  }));
  const order = rows.map(r => r.key);

  return (
    <ChartCard
      title="Pharma concentration appears after narrowing the market"
      subtitle="Industry_Group is fixed to Pharmaceuticals; rows compare the source INDUSTRY level with high-spend prescription subcategories."
    >
      <PlotFigure
        ariaLabel="HHI for pharma INDUSTRY rows and prescription subcategories."
        options={(width) =>
          withBookTheme({
            width,
            height: rows.length * 28 + 56,
            marginLeft: 220,
            marginRight: 46,
            marginTop: 24,
            x: {
              label: "Herfindahl-Hirschman Index",
              grid: true,
              domain: [0, Math.max(6500, Math.max(...rows.map(r => r.hhi)) * 1.05)],
            },
            y: { label: null, domain: order },
            marks: [
              ...hhiRefMarksX(),
              Plot.barX(rows, {
                x: "hhi",
                y: "key",
                fill: d => BAND_COLORS[d.hhi_band] ?? CHART.slate,
                fillOpacity: 0.9,
                tip: true,
                title: d =>
                  `${d.market}\n${fieldLabels[d.field] ?? d.field} level\nHHI ${fmtInt(d.hhi)} (${d.hhi_band})\nCR1 ${fmtPct(d.cr1)} | CR4 ${fmtPct(d.cr4)}\nLeader: ${d.leader}\nSpend ${fmtMoney(d.spend)}`,
              }),
              Plot.text(rows, {
                x: "hhi",
                y: "key",
                text: d => fmtInt(d.hhi),
                dx: 6,
                textAnchor: "start",
                fontSize: 10,
                fill: CHART.body,
              }),
            ],
          }) as PlotOptions
        }
      />
      <Legend items={BAND_LABELS.map(label => ({ label, color: BAND_COLORS[label] }))} />
    </ChartCard>
  );
}

// ---------------------------------------------------------------------------
// 6. CR1 vs CR4 scatter — Plot dot plot, bubble size = spend.
// ---------------------------------------------------------------------------

export function CRScatter({ data }: { data: MarketConcentrationData }) {
  const rows = substantialIndustryRows(data);
  const labelIndustries = new Set([
    "Household Soaps, Cleansers & Polishes",
    "Discount Department & Variety Stores",
    "Communications",
    "Medicines & Proprietary Remedies",
    "Business & Technology NEC",
    "Misc Services & Amusements",
  ]);
  const labelled = rows.filter(r => labelIndustries.has(r.industry));

  return (
    <ChartCard
      title="CR1 and CR4 ask different concentration questions"
      subtitle="Substantial INDUSTRY markets only; bubble size is total ad spend. CR1 is leader share and CR4 is combined top-four share."
    >
      <PlotFigure
        ariaLabel="Scatterplot of CR1 and CR4 by industry, sized by spend."
        options={(width) =>
          withBookTheme({
            width,
            height: 430,
            marginLeft: 52,
            marginBottom: 44,
            x: { label: "CR1: largest owner share", percent: true, grid: true, domain: [0, 0.75] },
            y: { label: "CR4: top-four owner share", percent: true, grid: true, domain: [0, 1.02] },
            r: { range: [3, 14] },
            marks: [
              Plot.dot(rows, {
                x: "cr1",
                y: "cr4",
                r: "spend",
                fill: d => BAND_COLORS[d.hhi_band] ?? CHART.slate,
                fillOpacity: 0.75,
                stroke: "white",
                strokeWidth: 1.2,
                tip: true,
                title: d =>
                  `${d.industry}\nCR1 ${fmtPct(d.cr1)} | CR4 ${fmtPct(d.cr4)}\nHHI ${fmtInt(d.hhi)} (${d.hhi_band})\nSpend ${fmtMoney(d.spend)}`,
              }),
              Plot.text(labelled, {
                x: "cr1",
                y: "cr4",
                text: d => shortLabel(d.industry, 23),
                dx: 12,
                dy: -2,
                textAnchor: "start",
                fontSize: 10,
                fill: CHART.body,
              }),
            ],
          }) as PlotOptions
        }
      />
      <Legend items={BAND_LABELS.map(label => ({ label, color: BAND_COLORS[label] }))} />
    </ChartCard>
  );
}

// ---------------------------------------------------------------------------
// 7. Hierarchy sensitivity — grouped bars across three entity definitions.
// ---------------------------------------------------------------------------

export function HierarchySensitivity({ data }: { data: MarketConcentrationData }) {
  const selectedNames = [
    "Household Soaps, Cleansers & Polishes",
    "Discount Department & Variety Stores",
    "Communications",
    "Business & Technology NEC",
    "Government, Politics & Organizations",
    "Medicines & Proprietary Remedies",
    "Misc Services & Amusements",
  ];
  const selected = selectedNames
    .map(name => data.levelComparison.find(row => row.industry === name))
    .filter((row): row is LevelComparison => Boolean(row));

  const seriesMeta = [
    { key: "owner_hhi" as const, label: "Owner proxy", color: CHART.indigo },
    { key: "advertiser_hhi" as const, label: "Advertiser", color: CHART.amber },
    { key: "brand_hhi" as const, label: "Brand", color: CHART.violet },
  ];
  const long = selected.flatMap(row =>
    seriesMeta.map(s => ({
      industry: row.industry,
      level: s.label,
      hhi: row[s.key],
    }))
  );

  return (
    <ChartCard
      title="The unit of analysis can change the apparent market structure"
      subtitle="Same rows, same INDUSTRY denominator, three entity definitions. Owner proxy aggregates corporate families; advertiser and brand split them."
    >
      <PlotFigure
        ariaLabel="Grouped HHI bars by entity hierarchy level."
        options={(width) =>
          withBookTheme({
            width,
            height: selected.length * 64 + 44,
            marginLeft: 196,
            marginRight: 46,
            x: {
              label: "Herfindahl-Hirschman Index",
              grid: true,
              domain: [0, Math.max(...long.map(d => d.hhi)) * 1.08],
            },
            y: { label: null, domain: selectedNames.filter(n => selected.some(s => s.industry === n)), tickFormat: (d: string) => shortLabel(d, 30) },
            fy: { label: null, domain: seriesMeta.map(s => s.label), axis: null },
            color: {
              domain: seriesMeta.map(s => s.label),
              range: seriesMeta.map(s => s.color),
            },
            marks: [
              ...hhiRefMarksX(),
              Plot.barX(long, {
                x: "hhi",
                y: "industry",
                fy: "level",
                fill: "level",
                tip: true,
                title: d => `${d.industry}\n${d.level}: HHI ${fmtInt(d.hhi)} (${bandFor(d.hhi)})`,
              }),
            ],
          }) as PlotOptions
        }
      />
      <Legend items={seriesMeta.map(s => ({ label: s.label, color: s.color }))} />
    </ChartCard>
  );
}

// ---------------------------------------------------------------------------
// 8. LIVE concentration explorer — embedded in the threshold-sensitivity figure.
//     Selectors for entity level + min-spend threshold recompute HHI / CR1 /
//     CR4 / effective entities straight from the thresholdSensitivity grid.
// ---------------------------------------------------------------------------

export function ThresholdSensitivityChart({ data }: { data: MarketConcentrationData }) {
  const defaultIndustries = [
    "Household Soaps, Cleansers & Polishes",
    "Business & Technology NEC",
    "Government, Politics & Organizations",
    "Medicines & Proprietary Remedies",
    "Misc Services & Amusements",
  ];

  // Restrict the live control to industries that have the full grid (every
  // level x threshold) so a selection never produces an empty trace.
  const grid = data.thresholdSensitivity;
  const availableIndustries = React.useMemo(() => {
    const counts = new Map<string, number>();
    for (const row of grid) counts.set(row.industry, (counts.get(row.industry) ?? 0) + 1);
    const full = [...counts.entries()].filter(([, c]) => c >= ENTITY_LEVELS.length * THRESHOLDS.length).map(([k]) => k);
    // Prefer the default narrative industries, then fill alphabetically.
    const inDefaults = defaultIndustries.filter(n => full.includes(n));
    const rest = full.filter(n => !inDefaults.includes(n)).sort();
    return [...inDefaults, ...rest];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [grid]);

  const [level, setLevel] = React.useState<string>("Owner proxy");
  const [industry, setIndustry] = React.useState<string>(
    () => availableIndustries.find(n => defaultIndustries.includes(n)) ?? availableIndustries[0]
  );

  const lineIndustries = defaultIndustries.filter(n => availableIndustries.includes(n));
  const palette = [CHART.rose, CHART.indigo, CHART.amber, CHART.violet, CHART.teal];
  const colorOf = (name: string) => palette[lineIndustries.indexOf(name) % palette.length] ?? CHART.slate;

  // Long-form trajectory rows for the selected entity level.
  const traces = React.useMemo(
    () =>
      lineIndustries.flatMap(name =>
        THRESHOLDS.map(threshold => {
          const row = grid.find(r => r.industry === name && r.level === level && r.min_entity_spend === threshold);
          return row
            ? {
                industry: name,
                threshold,
                thresholdLabel: THRESHOLD_LABELS[threshold],
                hhi: row.hhi,
                retained: row.retained_spend_share,
                cr1: row.cr1,
                cr4: row.cr4,
              }
            : null;
        }).filter((d): d is NonNullable<typeof d> => Boolean(d))
      ),
    [grid, level, lineIndustries]
  );

  // The live recompute panel for the single selected industry.
  const selectedRows = React.useMemo(
    () =>
      THRESHOLDS.map(threshold => grid.find(r => r.industry === industry && r.level === level && r.min_entity_spend === threshold))
        .filter((r): r is ThresholdSensitivity => Boolean(r)),
    [grid, industry, level]
  );
  const baseline = selectedRows.find(r => r.min_entity_spend === 0);

  const xLabels = THRESHOLDS.map(t => THRESHOLD_LABELS[t]);

  return (
    <ChartCard
      title="Minimum-spend thresholds are a sensitivity check, not the main definition"
      subtitle="HHI is recomputed after retaining only entities above each total-spend cutoff. Switch the entity definition to see how the same cutoff lands differently on owners, advertisers, and brands."
      controls={
        <div className="flex flex-col gap-2">
          <Segmented label="Entity level" value={level} options={ENTITY_LEVELS} onChange={setLevel} />
        </div>
      }
    >
      <PlotFigure
        ariaLabel="HHI trajectory across minimum-spend thresholds for the selected entity level."
        options={(width) =>
          withBookTheme({
            width,
            height: 380,
            marginLeft: 56,
            marginRight: 176,
            marginBottom: 56,
            x: { label: "Minimum entity spend", domain: xLabels, grid: true },
            y: {
              label: "Renormalized HHI among retained entities",
              grid: true,
              domain: [0, Math.max(2000, Math.max(...traces.map(d => d.hhi), 0) * 1.08)],
            },
            color: {
              domain: lineIndustries,
              range: lineIndustries.map(colorOf),
            },
            marks: [
              ...hhiRefMarksY(),
              Plot.line(traces, {
                x: "thresholdLabel",
                y: "hhi",
                z: "industry",
                stroke: "industry",
                strokeWidth: 2.5,
                curve: "catmull-rom",
              }),
              Plot.dot(traces, {
                x: "thresholdLabel",
                y: "hhi",
                fill: "industry",
                r: 4,
                stroke: "white",
                strokeWidth: 1.2,
                tip: true,
                title: d =>
                  `${d.industry}\n${level} | ${d.thresholdLabel}\nHHI ${fmtInt(d.hhi)} (${bandFor(d.hhi)})\nCR1 ${fmtPct(d.cr1)} | CR4 ${fmtPct(d.cr4)}\nRetained spend ${fmtPct(d.retained)}`,
              }),
              Plot.text(
                traces.filter(d => d.threshold === 1000000),
                {
                  x: "thresholdLabel",
                  y: "hhi",
                  text: d => `${shortLabel(d.industry, 22)} (${fmtPct(d.retained)})`,
                  dx: 10,
                  textAnchor: "start",
                  fontSize: 10,
                  fill: d => colorOf(d.industry),
                }
              ),
            ],
          }) as PlotOptions
        }
      />

      {/* Live recompute readout for one selected industry. */}
      <div className="mt-4 rounded-md border border-slate-200 bg-slate-50/60 p-3">
        <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-semibold uppercase tracking-wide text-slate-500" htmlFor="conc-industry">
              Recompute one industry
            </label>
            <select
              id="conc-industry"
              value={industry}
              onChange={e => setIndustry(e.target.value)}
              className="w-full max-w-xs rounded-md border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-800 shadow-sm sm:w-72"
            >
              {availableIndustries.map(name => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>
          <p className="text-xs text-slate-500">
            Entity level: <span className="font-semibold text-slate-700">{level}</span>
            {baseline && (
              <>
                {" "}- leader <span className="font-semibold text-slate-700">{baseline.leader}</span>
              </>
            )}
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[480px] border-collapse text-xs">
            <thead>
              <tr className="text-left text-[10px] uppercase text-slate-500">
                <th className="py-1 pr-3 font-semibold">Min spend</th>
                <th className="py-1 pr-3 text-right font-semibold">HHI</th>
                <th className="py-1 pr-3 text-right font-semibold">Band</th>
                <th className="py-1 pr-3 text-right font-semibold">CR1</th>
                <th className="py-1 pr-3 text-right font-semibold">CR4</th>
                <th className="py-1 pr-3 text-right font-semibold">Eff. entities</th>
                <th className="py-1 text-right font-semibold">Retained spend</th>
              </tr>
            </thead>
            <tbody className="tabular-nums text-slate-700">
              {selectedRows.map(row => (
                <tr key={row.min_entity_spend} className="border-t border-slate-200">
                  <td className="py-1.5 pr-3 font-medium text-slate-800">{THRESHOLD_LABELS[row.min_entity_spend]}</td>
                  <td className="py-1.5 pr-3 text-right">{fmtInt(row.hhi)}</td>
                  <td className="py-1.5 pr-3 text-right">
                    <span
                      className="inline-block rounded-sm px-1.5 py-0.5 text-[10px] font-medium text-white"
                      style={{ backgroundColor: BAND_COLORS[row.hhi_band] ?? CHART.slate }}
                    >
                      {row.hhi_band.split(" ")[0]}
                    </span>
                  </td>
                  <td className="py-1.5 pr-3 text-right">{fmtPct(row.cr1)}</td>
                  <td className="py-1.5 pr-3 text-right">{fmtPct(row.cr4)}</td>
                  <td className="py-1.5 pr-3 text-right">{row.effective_entities.toFixed(1)}</td>
                  <td className="py-1.5 text-right">{fmtPct(row.retained_spend_share)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <p className="mt-3 text-xs leading-relaxed text-slate-500">
        Parenthetical labels at the $1M cutoff show retained spend. A threshold that keeps little spend is a stress test, not a replacement
        denominator. Switching the entity level recomputes HHI, CR1, CR4, and effective entities from the same source rows.
      </p>
    </ChartCard>
  );
}

// ---------------------------------------------------------------------------
// 9. Annual change — diverging lollipop (2022 minus 2018 HHI).
// ---------------------------------------------------------------------------

export function AnnualConcentrationChange({ data }: { data: MarketConcentrationData }) {
  const substantial = data.annualDelta.filter(row => Math.max(row.spend_2018, row.spend_2022) >= SUBSTANTIAL_MARKET_SPEND);
  const increases = [...substantial].sort((a, b) => b.hhi_delta - a.hhi_delta).slice(0, 5);
  const decreases = [...substantial].sort((a, b) => a.hhi_delta - b.hhi_delta).slice(0, 5);
  const rows = [...increases, ...decreases].sort((a, b) => b.hhi_delta - a.hhi_delta);
  const bound = Math.max(100, ...rows.map(d => Math.abs(d.hhi_delta))) * 1.12;

  return (
    <ChartCard
      title="Concentration changed unevenly from 2018 to 2022"
      subtitle={`Largest increases and decreases in owner-proxy HHI among INDUSTRY markets with at least ${fmtMoney(SUBSTANTIAL_MARKET_SPEND)} in either endpoint year.`}
    >
      <PlotFigure
        ariaLabel="Diverging lollipop of HHI change from 2018 to 2022."
        options={(width) =>
          withBookTheme({
            width,
            height: rows.length * 32 + 56,
            marginLeft: 196,
            marginRight: 88,
            marginTop: 20,
            x: { label: "HHI change, 2022 minus 2018", grid: true, domain: [-bound, bound] },
            y: { label: null, domain: rows.map(d => d.industry), tickFormat: (d: string) => shortLabel(d, 30) },
            marks: [
              Plot.ruleX([0], { stroke: CHART.faint }),
              Plot.ruleY(rows, {
                y: "industry",
                x1: 0,
                x2: "hhi_delta",
                stroke: d => (d.hhi_delta >= 0 ? CHART.rose : CHART.teal),
                strokeWidth: 1.5,
              }),
              Plot.dot(rows, {
                x: "hhi_delta",
                y: "industry",
                r: 5.5,
                fill: d => (d.hhi_delta >= 0 ? CHART.rose : CHART.teal),
                stroke: "white",
                strokeWidth: 1,
                tip: true,
                title: d =>
                  `${d.industry}\nHHI ${fmtInt(d.hhi_2018)} -> ${fmtInt(d.hhi_2022)} (${d.hhi_delta > 0 ? "+" : ""}${fmtInt(d.hhi_delta)})\nSpend ${d.spend_delta > 0 ? "+" : ""}${(d.spend_delta * 100).toFixed(0)}%\nLeader ${d.leader_2018} -> ${d.leader_2022}`,
              }),
              Plot.text(rows.filter(d => d.hhi_delta >= 0), {
                x: "hhi_delta",
                y: "industry",
                text: d => `+${fmtInt(d.hhi_delta)}`,
                dx: 10,
                textAnchor: "start",
                fontSize: 10,
                fill: CHART.body,
              }),
              Plot.text(rows.filter(d => d.hhi_delta < 0), {
                x: "hhi_delta",
                y: "industry",
                text: d => fmtInt(d.hhi_delta),
                dx: -10,
                textAnchor: "end",
                fontSize: 10,
                fill: CHART.body,
              }),
              Plot.text(rows, {
                x: () => bound,
                y: "industry",
                text: d => `spend ${d.spend_delta > 0 ? "+" : ""}${(d.spend_delta * 100).toFixed(0)}%`,
                dx: 8,
                textAnchor: "start",
                fontSize: 10,
                fill: CHART.muted,
              }),
            ],
          }) as PlotOptions
        }
      />
    </ChartCard>
  );
}

// ---------------------------------------------------------------------------
// 10. Top-owner small multiples — compact share table (kept as table grammar).
// ---------------------------------------------------------------------------

export function TopOwnerTable({ data, industries }: { data: MarketConcentrationData; industries: string[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {industries.map(industry => {
        const rows = data.topOwners.filter(row => row.industry === industry).slice(0, 4);
        const metric = data.industryMetrics.find(row => row.industry === industry);
        return (
          <div key={industry} className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-3">
              <h3 className="text-sm font-semibold text-slate-950">{industry}</h3>
              {metric && <p className="mt-1 text-xs text-slate-500">HHI {fmtInt(metric.hhi)}; CR4 {fmtPct(metric.cr4)}</p>}
            </div>
            <div className="space-y-2">
              {rows.map(row => (
                <div key={row.entity} className="grid grid-cols-[1fr_auto] items-center gap-3 text-xs">
                  <div>
                    <p className="font-medium text-slate-800">{shortLabel(row.entity, 34)}</p>
                    <div className="mt-1 h-2 rounded-full bg-slate-100">
                      <div className="h-2 rounded-full" style={{ width: `${clamp(row.market_share * 100, 2, 100)}%`, backgroundColor: CHART.indigo }} />
                    </div>
                  </div>
                  <span className="font-mono text-slate-700">{fmtPct(row.market_share)}</span>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
