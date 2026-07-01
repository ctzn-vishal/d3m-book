'use client';

import * as React from 'react';
import {
  BadgeDollarSign,
  Calculator,
  LineChart,
  Percent,
  Repeat2,
  ShoppingBasket,
  Users,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface MetricFormulaItem {
  id: string;
  metric: string;
  short_label: string;
  formula: string;
  numerator: string;
  denominator?: string;
  unit: string;
  window: string;
  decision: string;
  example_value: string;
  example_context: string;
  caution: string;
  owner: string;
}

export interface MetricFormulaLabProps {
  items: MetricFormulaItem[];
}

const ICONS: Record<string, LucideIcon> = {
  revenue: BadgeDollarSign,
  aov: ShoppingBasket,
  margin: Percent,
  conversion: Calculator,
  churn: Repeat2,
  repeat: Users,
  arpu: LineChart,
  clv: Users,
  share: Percent,
};

function iconFor(id: string): LucideIcon {
  return ICONS[id] ?? Calculator;
}

export function MetricFormulaLab({ items }: MetricFormulaLabProps) {
  const [activeId, setActiveId] = React.useState(items[0]?.id ?? '');
  const active = items.find((item) => item.id === activeId) ?? items[0];

  if (!active) {
    return null;
  }

  const ActiveIcon = iconFor(active.id);

  return (
    <div className="not-prose my-8 overflow-hidden rounded-md border border-border bg-white shadow-sm dark:bg-slate-900">
      <div className="grid gap-0 lg:grid-cols-[280px_1fr]">
        <div className="border-b border-border bg-card p-3 lg:border-b-0 lg:border-r">
          <div className="mb-3 px-1">
            <div className="text-[11px] font-semibold uppercase tracking-wide text-muted">
              Metric contract
            </div>
            <div className="mt-1 text-sm leading-snug text-subtle">
              Formula, unit, window, owner, and decision use.
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 lg:grid-cols-1">
            {items.map((item) => {
              const Icon = iconFor(item.id);
              const selected = item.id === active.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setActiveId(item.id)}
                  className={[
                    'flex min-h-12 items-center gap-2 rounded-md border px-3 py-2 text-left text-sm transition-colors',
                    selected
                      ? 'border-body bg-white text-body shadow-sm dark:bg-slate-800'
                      : 'border-transparent bg-transparent text-subtle hover:border-border hover:bg-white dark:hover:bg-slate-800',
                  ].join(' ')}
                >
                  <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span className="min-w-0">
                    <span className="block truncate font-medium">
                      {item.short_label}
                    </span>
                    <span className="block truncate text-xs text-muted">
                      {item.owner}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-4 md:p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-sky-50 text-sky-700 dark:bg-sky-950/30 dark:text-sky-100">
                  <ActiveIcon className="h-5 w-5" aria-hidden="true" />
                </span>
                <h3 className="text-xl font-semibold tracking-tight text-body">
                  {active.metric}
                </h3>
              </div>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-subtle">
                {active.decision}
              </p>
            </div>
            <div className="rounded-md border border-border bg-card px-3 py-2 text-sm">
              <div className="text-[11px] font-semibold uppercase tracking-wide text-muted">
                Example
              </div>
              <div className="mt-1 text-lg font-semibold tabular-nums text-body">
                {active.example_value}
              </div>
              <div className="max-w-xs text-xs leading-snug text-muted">
                {active.example_context}
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-md border border-border bg-white p-4 dark:bg-slate-900">
            <div className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-muted">
              Formula
            </div>
            <div className="grid gap-3 md:grid-cols-[1fr_auto_1fr] md:items-center">
              <div className="rounded-md border border-border bg-code-bg p-3">
                <div className="text-[11px] uppercase tracking-wide text-muted">
                  Numerator
                </div>
                <div className="mt-1 font-mono text-sm text-body">
                  {active.numerator}
                </div>
              </div>
              {active.denominator ? (
                <>
                  <div className="hidden text-2xl font-light text-muted md:block">
                    /
                  </div>
                  <div className="rounded-md border border-border bg-code-bg p-3">
                    <div className="text-[11px] uppercase tracking-wide text-muted">
                      Denominator
                    </div>
                    <div className="mt-1 font-mono text-sm text-body">
                      {active.denominator}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="hidden text-2xl font-light text-muted md:block">
                    =
                  </div>
                  <div className="rounded-md border border-border bg-code-bg p-3">
                    <div className="text-[11px] uppercase tracking-wide text-muted">
                      Aggregation
                    </div>
                    <div className="mt-1 font-mono text-sm text-body">
                      {active.formula}
                    </div>
                  </div>
                </>
              )}
            </div>
            {active.denominator && (
              <div className="mt-3 rounded-md bg-body px-3 py-2 font-mono text-sm text-surface">
                {active.formula}
              </div>
            )}
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <div className="rounded-md border border-border p-3">
              <div className="text-[11px] font-semibold uppercase tracking-wide text-muted">
                Unit
              </div>
              <div className="mt-1 text-sm leading-snug text-body">
                {active.unit}
              </div>
            </div>
            <div className="rounded-md border border-border p-3">
              <div className="text-[11px] font-semibold uppercase tracking-wide text-muted">
                Window
              </div>
              <div className="mt-1 text-sm leading-snug text-body">
                {active.window}
              </div>
            </div>
            <div className="rounded-md border border-border p-3">
              <div className="text-[11px] font-semibold uppercase tracking-wide text-muted">
                Risk
              </div>
              <div className="mt-1 text-sm leading-snug text-body">
                {active.caution}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MetricFormulaLab;
