'use client';

import * as React from 'react';
import {
  BarChart3,
  ClipboardCheck,
  Search,
  Target,
  TrendingUp,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

export interface DashboardStage {
  id: string;
  label: string;
  question: string;
  takeaway: string;
}

export interface DashboardStoryboardData {
  stages: DashboardStage[];
  kpi: {
    value: string;
    label: string;
    change: string;
    note: string;
  };
  trend: Array<{
    month: string;
    revenue: number;
    target: number;
  }>;
  stores: Array<{
    store: string;
    revenue: number;
    yoy_change: number;
  }>;
  categories: Array<{
    category: string;
    revenue: number;
    margin_rate: number;
  }>;
  actions: string[];
}

export interface DashboardStoryboardProps {
  data: DashboardStoryboardData;
}

const STAGE_ICONS: Record<string, LucideIcon> = {
  headline: Target,
  trend: TrendingUp,
  breakdown: BarChart3,
  drilldown: Search,
  action: ClipboardCheck,
};

const STORE_COLORS = ['#2563eb', '#f97316', '#0f766e', '#7c3aed'];
const CATEGORY_COLORS = ['#0f766e', '#f97316', '#2563eb', '#a16207'];

function iconFor(id: string): LucideIcon {
  return STAGE_ICONS[id] ?? Target;
}

function formatK(value: string | number): string {
  return `$${Number(value).toFixed(0)}k`;
}

function renderPanel(data: DashboardStoryboardData, stageId: string) {
  if (stageId === 'headline') {
    return (
      <div className="grid min-h-[280px] gap-4 md:grid-cols-[1fr_1.2fr] md:items-center">
        <div className="rounded-md border border-border bg-white p-5 dark:bg-slate-800/40">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-muted">
            Headline KPI
          </div>
          <div className="mt-3 flex items-end gap-2">
            <span className="text-5xl font-semibold tracking-tight text-body">
              {data.kpi.value}
            </span>
            <span className="mb-1 rounded-md bg-green-50 px-2 py-1 text-sm font-medium text-green-700 dark:bg-green-950/30 dark:text-green-100">
              {data.kpi.change}
            </span>
          </div>
          <div className="mt-2 text-sm leading-snug text-subtle">
            {data.kpi.label}
          </div>
        </div>
        <div className="rounded-md border border-border bg-code-bg p-5 text-sm leading-relaxed text-subtle">
          {data.kpi.note}
        </div>
      </div>
    );
  }

  if (stageId === 'trend') {
    return (
      <div className="h-[300px] rounded-md border border-border bg-white p-4 dark:bg-slate-800/40">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data.trend} margin={{ top: 10, right: 18, bottom: 8, left: 0 }}>
            <CartesianGrid stroke="#E5E7EB" strokeDasharray="3 3" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
            <YAxis tickFormatter={formatK} tick={{ fontSize: 12 }} tickLine={false} axisLine={false} width={52} />
            <Tooltip />
            <Line type="monotone" dataKey="target" stroke="#9CA3AF" strokeWidth={2} dot={false} strokeDasharray="4 4" name="Target" />
            <Line type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} name="Revenue" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  }

  if (stageId === 'breakdown') {
    return (
      <div className="h-[300px] rounded-md border border-border bg-white p-4 dark:bg-slate-800/40">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data.stores} margin={{ top: 10, right: 18, bottom: 8, left: 0 }}>
            <CartesianGrid stroke="#E5E7EB" vertical={false} />
            <XAxis dataKey="store" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
            <YAxis tickFormatter={formatK} tick={{ fontSize: 12 }} tickLine={false} axisLine={false} width={52} />
            <Tooltip />
            <Bar dataKey="revenue" name="Revenue" radius={[4, 4, 0, 0]}>
              {data.stores.map((entry, index) => (
                <Cell key={entry.store} fill={STORE_COLORS[index % STORE_COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  if (stageId === 'drilldown') {
    return (
      <div className="h-[300px] rounded-md border border-border bg-white p-4 dark:bg-slate-800/40">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data.categories} margin={{ top: 10, right: 18, bottom: 8, left: 0 }}>
            <CartesianGrid stroke="#E5E7EB" vertical={false} />
            <XAxis dataKey="category" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
            <YAxis tickFormatter={formatK} tick={{ fontSize: 12 }} tickLine={false} axisLine={false} width={52} />
            <Tooltip />
            <Bar dataKey="revenue" name="Revenue" radius={[4, 4, 0, 0]}>
              {data.categories.map((entry, index) => (
                <Cell key={entry.category} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  return (
    <div className="grid min-h-[280px] gap-3 md:grid-cols-3">
      {data.actions.map((action, index) => (
        <div key={action} className="rounded-md border border-border bg-white p-4 dark:bg-slate-800/40">
          <div className="mb-3 inline-flex h-7 w-7 items-center justify-center rounded-md bg-emerald-50 text-sm font-semibold tabular-nums text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-100">
            {index + 1}
          </div>
          <p className="text-sm leading-relaxed text-subtle">{action}</p>
        </div>
      ))}
    </div>
  );
}

export function DashboardStoryboard({ data }: DashboardStoryboardProps) {
  const [activeId, setActiveId] = React.useState(data.stages[0]?.id ?? '');
  const active = data.stages.find((stage) => stage.id === activeId) ?? data.stages[0];

  if (!active) {
    return null;
  }

  return (
    <div className="not-prose my-8 overflow-hidden rounded-md border border-border bg-card shadow-sm">
      <div className="border-b border-border bg-white p-4 dark:bg-slate-800/40 md:p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wide text-muted">
              Dashboard storyboard
            </div>
            <h3 className="mt-1 text-xl font-semibold tracking-tight text-body">
              One page, five questions, one decision path.
            </h3>
          </div>
          <div className="max-w-md text-sm leading-snug text-subtle">
            {active.question}
          </div>
        </div>
      </div>

      <div className="grid border-b border-border bg-white dark:bg-slate-800/40 md:grid-cols-5">
        {data.stages.map((stage) => {
          const Icon = iconFor(stage.id);
          const selected = stage.id === active.id;
          return (
            <button
              key={stage.id}
              type="button"
              aria-pressed={selected}
              onClick={() => setActiveId(stage.id)}
              className={[
                'flex min-h-16 items-center gap-2 border-b border-border px-3 py-3 text-left text-sm transition-colors md:border-b-0 md:border-r last:md:border-r-0',
                selected
                  ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                  : 'bg-white text-subtle hover:bg-code-bg dark:bg-slate-800/40',
              ].join(' ')}
            >
              <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span className="font-medium">{stage.label}</span>
            </button>
          );
        })}
      </div>

      <div className="p-4 md:p-6">
        {renderPanel(data, active.id)}
        <div className="mt-4 rounded-md border border-border bg-white p-4 text-sm leading-relaxed text-subtle dark:bg-slate-800/40">
          <span className="font-semibold text-body">What the viewer should notice: </span>
          {active.takeaway}
        </div>
      </div>
    </div>
  );
}

export default DashboardStoryboard;
