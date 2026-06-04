"use client";

import * as React from 'react';

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

type TopOwner = {
  industry: string;
  rank: number;
  entity: string;
  spend: number;
  market_share: number;
};

type MarketConcentrationData = {
  overview: {
    row_count: number;
    spend: number;
    industry_groups: number;
    owner_entities: number;
    raw_parent_entities: number;
    advertisers: number;
    brands: number;
    products: number;
    parent_unknown_spend: number;
  };
  entitySpendDistribution: Record<string, number>;
  bandCounts: Record<string, number>;
  industryMetrics: IndustryMetric[];
  levelComparison: LevelComparison[];
  annualDelta: AnnualDelta[];
  thresholdSensitivity: ThresholdSensitivity[];
  topOwners: TopOwner[];
};

const BAND_COLORS: Record<string, string> = {
  "Highly concentrated": "#9f3a38",
  "Moderately concentrated": "#c58a2e",
  Unconcentrated: "#2f6f77",
};

const BAND_LABELS = ["Highly concentrated", "Moderately concentrated", "Unconcentrated"];
const THRESHOLD_LABELS: Record<number, string> = {
  0: "All positive",
  10000: "$10k+",
  100000: "$100k+",
  1000000: "$1M+",
};

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

function scaleLinear(domain: [number, number], range: [number, number]) {
  const [d0, d1] = domain;
  const [r0, r1] = range;
  const denom = d1 - d0 || 1;
  return (value: number) => r0 + ((value - d0) / denom) * (r1 - r0);
}

function ChartCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-slate-950">{title}</h3>
        {subtitle && <p className="mt-1 text-xs leading-snug text-slate-500">{subtitle}</p>}
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

export function ConcentrationMetricCards({ data }: { data: MarketConcentrationData }) {
  const top = data.industryMetrics[0];
  const moderate = data.bandCounts["Moderately concentrated"] ?? 0;
  const high = data.bandCounts["Highly concentrated"] ?? 0;
  const unknownShare = data.overview.parent_unknown_spend / data.overview.spend;
  const cards = [
    {
      label: "Study window",
      value: `${data.overview.industry_groups} industries`,
      detail: `${fmtMoney(data.overview.spend)} in positive 2018-2022 ad spend`,
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
      label: "Top industry",
      value: fmtInt(top.hhi),
      detail: `${top.industry}; ${fmtPct(top.cr4)} CR4`,
    },
    {
      label: "Unknown-parent spend",
      value: fmtPct(unknownShare),
      detail: "Split to advertiser instead of treated as one firm",
    },
    {
      label: "Median entity spend",
      value: fmtMoney(data.entitySpendDistribution.p50),
      detail: `99th percentile: ${fmtMoney(data.entitySpendDistribution.p99)}`,
    },
  ];
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {cards.map(card => (
        <div key={card.label} className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">{card.label}</p>
          <p className="mt-2 text-2xl font-semibold tabular-nums text-slate-950">{card.value}</p>
          <p className="mt-1 text-xs leading-snug text-slate-500">{card.detail}</p>
        </div>
      ))}
    </div>
  );
}

export function HHIRankChart({ data }: { data: MarketConcentrationData }) {
  const rows = [...data.industryMetrics].sort((a, b) => b.hhi - a.hhi);
  const W = 940;
  const H = rows.length * 29 + 78;
  const m = { top: 28, right: 78, bottom: 34, left: 238 };
  const x = scaleLinear([0, Math.max(3600, Math.max(...rows.map(d => d.hhi)) * 1.05)], [m.left, W - m.right]);
  const yFor = (index: number) => m.top + index * 29;
  return (
    <ChartCard
      title="HHI by broad industry group"
      subtitle="Owner-proxy ad spend shares, 2018-2022 pooled; vertical lines mark 1,000 and 1,800 HHI reference thresholds."
    >
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="HHI by broad industry group.">
        {[1000, 1800].map(t => (
          <g key={t}>
            <line x1={x(t)} x2={x(t)} y1={m.top - 18} y2={H - m.bottom} stroke={t === 1800 ? "#9f3a38" : "#c58a2e"} strokeDasharray="5 5" />
            <text x={x(t)} y={m.top - 20} textAnchor="middle" className="fill-slate-500 text-[10px]">{t.toLocaleString()}</text>
          </g>
        ))}
        {[0, 1000, 1800, 3000].map(t => (
          <g key={`tick-${t}`}>
            <line x1={x(t)} x2={x(t)} y1={H - m.bottom} y2={H - m.bottom + 5} stroke="#94a3b8" />
            <text x={x(t)} y={H - 10} textAnchor="middle" className="fill-slate-500 text-[10px]">{t.toLocaleString()}</text>
          </g>
        ))}
        {rows.map((row, index) => {
          const y = yFor(index);
          return (
            <g key={row.industry}>
              <text x={m.left - 10} y={y + 13} textAnchor="end" className="fill-slate-700 text-[11px]">
                {shortLabel(row.industry, 34)}
              </text>
              <rect
                x={m.left}
                y={y}
                width={Math.max(1, x(row.hhi) - m.left)}
                height={17}
                fill={BAND_COLORS[row.hhi_band] ?? "#64748b"}
                opacity={0.9}
              />
              <text x={x(row.hhi) + 6} y={y + 13} className="fill-slate-700 text-[10px] tabular-nums">
                {fmtInt(row.hhi)}
              </text>
            </g>
          );
        })}
        <text x={(m.left + W - m.right) / 2} y={H - 1} textAnchor="middle" className="fill-slate-500 text-[10px]">Herfindahl-Hirschman Index</text>
      </svg>
      <Legend items={BAND_LABELS.map(label => ({ label, color: BAND_COLORS[label] }))} />
    </ChartCard>
  );
}

export function CRScatter({ data }: { data: MarketConcentrationData }) {
  const rows = data.industryMetrics;
  const W = 760;
  const H = 430;
  const m = { top: 26, right: 34, bottom: 48, left: 58 };
  const x = scaleLinear([0, 0.62], [m.left, W - m.right]);
  const y = scaleLinear([0, 0.82], [H - m.bottom, m.top]);
  const labelIndustries = new Set([
    "HH Supplies and Cleaners",
    "Energy",
    "Telecommunications",
    "Personal Care Products",
    "Local Services",
    "Pharmaceuticals",
  ]);
  return (
    <ChartCard
      title="CR1 and CR4 ask different concentration questions"
      subtitle="CR1 is the leader's share; CR4 is the combined top-four share. HHI adds how unequal the rest of the distribution is."
    >
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Scatterplot of CR1 and CR4 by industry.">
        {[0, 0.15, 0.30, 0.45, 0.60].map(t => (
          <g key={`x-${t}`}>
            <line x1={x(t)} x2={x(t)} y1={m.top} y2={H - m.bottom} stroke="#f1f5f9" />
            <text x={x(t)} y={H - 18} textAnchor="middle" className="fill-slate-500 text-[10px]">{fmtPct(t)}</text>
          </g>
        ))}
        {[0, 0.2, 0.4, 0.6, 0.8].map(t => (
          <g key={`y-${t}`}>
            <line x1={m.left} x2={W - m.right} y1={y(t)} y2={y(t)} stroke="#e2e8f0" />
            <text x={m.left - 8} y={y(t) + 4} textAnchor="end" className="fill-slate-500 text-[10px]">{fmtPct(t)}</text>
          </g>
        ))}
        {rows.map(row => {
          const radius = clamp(Math.sqrt(row.spend / 1e9) * 2.2, 4, 12);
          return (
            <g key={row.industry}>
              <circle
                cx={x(row.cr1)}
                cy={y(row.cr4)}
                r={radius}
                fill={BAND_COLORS[row.hhi_band] ?? "#64748b"}
                fillOpacity={0.78}
                stroke="#ffffff"
                strokeWidth={1.5}
              />
              {labelIndustries.has(row.industry) && (
                <text x={x(row.cr1) + radius + 5} y={y(row.cr4) + 3} className="fill-slate-700 text-[10px]">
                  {shortLabel(row.industry, 23)}
                </text>
              )}
            </g>
          );
        })}
        <text x={(m.left + W - m.right) / 2} y={H - 4} textAnchor="middle" className="fill-slate-500 text-[10px]">CR1: largest owner share</text>
        <text x={15} y={(m.top + H - m.bottom) / 2} transform={`rotate(-90 15 ${(m.top + H - m.bottom) / 2})`} textAnchor="middle" className="fill-slate-500 text-[10px]">CR4: top-four owner share</text>
      </svg>
      <Legend items={BAND_LABELS.map(label => ({ label, color: BAND_COLORS[label] }))} />
    </ChartCard>
  );
}

export function HierarchySensitivity({ data }: { data: MarketConcentrationData }) {
  const selected = data.levelComparison.slice(0, 8);
  const W = 900;
  const H = selected.length * 58 + 56;
  const m = { top: 18, right: 58, bottom: 34, left: 230 };
  const max = Math.max(...selected.flatMap(row => [row.owner_hhi, row.advertiser_hhi, row.brand_hhi])) * 1.08;
  const x = scaleLinear([0, max], [m.left, W - m.right]);
  const yFor = (index: number) => m.top + index * 58;
  const series = [
    { key: "owner_hhi" as const, label: "Owner proxy", color: "#214e78" },
    { key: "advertiser_hhi" as const, label: "Advertiser", color: "#c58a2e" },
    { key: "brand_hhi" as const, label: "Brand", color: "#8b5d78" },
  ];
  return (
    <ChartCard
      title="The unit of analysis can change the apparent market structure"
      subtitle="Same rows, same industry denominator, three entity definitions. Owner proxy aggregates corporate families; advertiser and brand split them."
    >
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="HHI sensitivity by entity hierarchy.">
        {[1000, 1800].map(t => (
          <line key={t} x1={x(t)} x2={x(t)} y1={m.top - 10} y2={H - m.bottom} stroke="#cbd5e1" strokeDasharray="4 5" />
        ))}
        {selected.map((row, index) => {
          const y = yFor(index);
          return (
            <g key={row.industry}>
              <text x={m.left - 10} y={y + 25} textAnchor="end" className="fill-slate-700 text-[11px]">
                {shortLabel(row.industry, 31)}
              </text>
              {series.map((s, si) => {
                const value = row[s.key];
                return (
                  <g key={s.key}>
                    <rect
                      x={m.left}
                      y={y + si * 15}
                      width={Math.max(1, x(value) - m.left)}
                      height={10}
                      fill={s.color}
                      opacity={0.88}
                    />
                    {si === 0 && (
                      <text x={x(value) + 5} y={y + si * 15 + 9} className="fill-slate-600 text-[9px] tabular-nums">
                        {fmtInt(value)}
                      </text>
                    )}
                  </g>
                );
              })}
            </g>
          );
        })}
        {[0, 1000, 1800, 3000].map(t => (
          <text key={t} x={x(t)} y={H - 10} textAnchor="middle" className="fill-slate-500 text-[10px]">{fmtInt(t)}</text>
        ))}
      </svg>
      <Legend items={series.map(s => ({ label: s.label, color: s.color }))} />
    </ChartCard>
  );
}

export function ThresholdSensitivityChart({ data }: { data: MarketConcentrationData }) {
  const selectedIndustries = [
    "HH Supplies and Cleaners",
    "Telecommunications",
    "Pharmaceuticals",
    "Medical Services and Equipment",
    "Local Services",
  ];
  const colors: Record<string, string> = {
    "HH Supplies and Cleaners": "#9f3a38",
    Telecommunications: "#214e78",
    Pharmaceuticals: "#6f5aa8",
    "Medical Services and Equipment": "#2f6f77",
    "Local Services": "#c58a2e",
  };
  const rows = data.thresholdSensitivity.filter(row => row.level === "Owner proxy" && selectedIndustries.includes(row.industry));
  const thresholds = [0, 10000, 100000, 1000000];
  const W = 800;
  const H = 410;
  const m = { top: 24, right: 174, bottom: 58, left: 58 };
  const x = scaleLinear([0, thresholds.length - 1], [m.left, W - m.right]);
  const maxHhi = Math.max(...rows.map(row => row.hhi)) * 1.08;
  const y = scaleLinear([0, maxHhi], [H - m.bottom, m.top]);
  const pathFor = (industry: string) => thresholds.map((threshold, index) => {
    const row = rows.find(item => item.industry === industry && item.min_entity_spend === threshold);
    return `${index === 0 ? "M" : "L"} ${x(index).toFixed(2)} ${y(row?.hhi ?? 0).toFixed(2)}`;
  }).join(" ");

  return (
    <ChartCard
      title="Minimum-spend thresholds are a sensitivity check, not the main definition"
      subtitle="HHI is recomputed after retaining only entities above each total-spend cutoff; labels below show how much spend remains."
    >
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="HHI sensitivity to minimum entity spend thresholds.">
        {[1000, 1800, 3000].map(t => (
          <g key={t}>
            <line x1={m.left} x2={W - m.right} y1={y(t)} y2={y(t)} stroke={t === 1800 ? "#e5c5c2" : "#e2e8f0"} strokeDasharray={t === 1800 ? "5 5" : undefined} />
            <text x={m.left - 8} y={y(t) + 4} textAnchor="end" className="fill-slate-500 text-[10px]">{fmtInt(t)}</text>
          </g>
        ))}
        {thresholds.map((threshold, index) => (
          <g key={threshold}>
            <line x1={x(index)} x2={x(index)} y1={m.top} y2={H - m.bottom} stroke="#f1f5f9" />
            <text x={x(index)} y={H - 28} textAnchor="middle" className="fill-slate-700 text-[10px]">{THRESHOLD_LABELS[threshold]}</text>
            <text x={x(index)} y={H - 12} textAnchor="middle" className="fill-slate-400 text-[9px]">min spend</text>
          </g>
        ))}
        {selectedIndustries.map(industry => (
          <g key={industry}>
            <path d={pathFor(industry)} fill="none" stroke={colors[industry]} strokeWidth={2.5} />
            {thresholds.map((threshold, index) => {
              const row = rows.find(item => item.industry === industry && item.min_entity_spend === threshold);
              if (!row) return null;
              return (
                <circle key={threshold} cx={x(index)} cy={y(row.hhi)} r={4} fill={colors[industry]} stroke="#fff" strokeWidth={1.2} />
              );
            })}
            {(() => {
              const last = rows.find(item => item.industry === industry && item.min_entity_spend === 1000000);
              if (!last) return null;
              return (
                <text x={W - m.right + 10} y={y(last.hhi) + 4} className="fill-slate-700 text-[10px]">
                  {shortLabel(industry, 27)} ({fmtPct(last.retained_spend_share)})
                </text>
              );
            })()}
          </g>
        ))}
        <text x={16} y={(m.top + H - m.bottom) / 2} transform={`rotate(-90 16 ${(m.top + H - m.bottom) / 2})`} textAnchor="middle" className="fill-slate-500 text-[10px]">Renormalized HHI among retained entities</text>
      </svg>
      <p className="mt-2 text-xs leading-relaxed text-slate-500">
        Parenthetical labels at the $1M cutoff show retained spend. A threshold that keeps little spend is a stress test, not a replacement denominator.
      </p>
    </ChartCard>
  );
}

export function AnnualConcentrationChange({ data }: { data: MarketConcentrationData }) {
  const increases = [...data.annualDelta].sort((a, b) => b.hhi_delta - a.hhi_delta).slice(0, 5);
  const decreases = [...data.annualDelta].sort((a, b) => a.hhi_delta - b.hhi_delta).slice(0, 5);
  const rows = [...increases, ...decreases].sort((a, b) => b.hhi_delta - a.hhi_delta);
  const W = 850;
  const H = rows.length * 34 + 68;
  const m = { top: 18, right: 84, bottom: 36, left: 238 };
  const min = Math.min(...rows.map(d => d.hhi_delta), -100);
  const max = Math.max(...rows.map(d => d.hhi_delta), 100);
  const x = scaleLinear([min, max], [m.left, W - m.right]);
  const yFor = (index: number) => m.top + index * 34;
  return (
    <ChartCard
      title="Concentration changed unevenly from 2018 to 2022"
      subtitle="Largest increases and decreases in owner-proxy HHI; spend changes are shown beside the bars."
    >
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Change in HHI from 2018 to 2022.">
        <line x1={x(0)} x2={x(0)} y1={m.top - 8} y2={H - m.bottom} stroke="#94a3b8" />
        {rows.map((row, index) => {
          const y = yFor(index);
          const positive = row.hhi_delta >= 0;
          return (
            <g key={row.industry}>
              <text x={m.left - 10} y={y + 15} textAnchor="end" className="fill-slate-700 text-[11px]">
                {shortLabel(row.industry, 32)}
              </text>
              <rect
                x={positive ? x(0) : x(row.hhi_delta)}
                y={y}
                width={Math.abs(x(row.hhi_delta) - x(0))}
                height={18}
                fill={positive ? "#9f3a38" : "#2f6f77"}
                opacity={0.9}
              />
              <text
                x={positive ? x(row.hhi_delta) + 6 : x(row.hhi_delta) - 6}
                y={y + 14}
                textAnchor={positive ? "start" : "end"}
                className="fill-slate-700 text-[10px] tabular-nums"
              >
                {row.hhi_delta > 0 ? "+" : ""}{fmtInt(row.hhi_delta)}
              </text>
              <text x={W - m.right + 18} y={y + 14} className="fill-slate-500 text-[10px] tabular-nums">
                spend {row.spend_delta > 0 ? "+" : ""}{(row.spend_delta * 100).toFixed(0)}%
              </text>
            </g>
          );
        })}
        <text x={(m.left + W - m.right) / 2} y={H - 8} textAnchor="middle" className="fill-slate-500 text-[10px]">HHI change, 2022 minus 2018</text>
      </svg>
    </ChartCard>
  );
}

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
                      <div className="h-2 rounded-full bg-[#214e78]" style={{ width: `${clamp(row.market_share * 100, 2, 100)}%` }} />
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
