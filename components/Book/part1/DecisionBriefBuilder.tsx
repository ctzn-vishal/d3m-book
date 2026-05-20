'use client';

import * as React from 'react';
import {
  ClipboardList,
  FileText,
  Gauge,
  GitMerge,
  ShieldAlert,
  Target,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface BriefWorkflowStep {
  id: string;
  label: string;
  question: string;
  artifact: string;
  red_flag: string;
}

export interface BriefSection {
  id: string;
  label: string;
  memo_text: string;
  evidence_standard: string;
  limit: string;
}

export interface BriefRubricItem {
  criterion: string;
  why_it_matters: string;
}

export interface DecisionBriefData {
  metadata?: {
    kicker?: string;
    title?: string;
  };
  workflow: BriefWorkflowStep[];
  sections: BriefSection[];
  rubric: BriefRubricItem[];
}

export interface DecisionBriefBuilderProps {
  data: DecisionBriefData;
}

const ICONS: Record<string, LucideIcon> = {
  question: Target,
  grain: ClipboardList,
  metrics: Gauge,
  joins: GitMerge,
  quality: ShieldAlert,
  memo: FileText,
};

function iconFor(id: string): LucideIcon {
  return ICONS[id] ?? FileText;
}

export function DecisionBriefBuilder({ data }: DecisionBriefBuilderProps) {
  const [activeId, setActiveId] = React.useState(data.workflow[0]?.id ?? '');
  const active =
    data.workflow.find((step) => step.id === activeId) ?? data.workflow[0];
  const activeSection =
    data.sections.find((section) => section.id === activeId) ??
    data.sections[0];

  if (!active || !activeSection) {
    return null;
  }

  const ActiveIcon = iconFor(active.id);

  return (
    <div className="not-prose my-8 overflow-hidden rounded-md border border-border bg-white shadow-sm">
      <div className="grid lg:grid-cols-[300px_1fr]">
        <div className="border-b border-border bg-card p-4 lg:border-b-0 lg:border-r">
          <div className="mb-4">
            <div className="text-[11px] font-semibold uppercase tracking-wide text-muted">
              {data.metadata?.kicker ?? 'Evidence operating habit'}
            </div>
            <h3 className="mt-1 text-lg font-semibold tracking-tight text-body">
              {data.metadata?.title ?? 'Read the data before making the slide.'}
            </h3>
          </div>
          <div className="space-y-2">
            {data.workflow.map((step, index) => {
              const Icon = iconFor(step.id);
              const selected = step.id === active.id;
              return (
                <button
                  key={step.id}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setActiveId(step.id)}
                  className={[
                    'flex w-full gap-3 rounded-md border px-3 py-3 text-left transition-colors',
                    selected
                      ? 'border-body bg-white text-body shadow-sm'
                      : 'border-transparent text-subtle hover:border-border hover:bg-white',
                  ].join(' ')}
                >
                  <span className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-white text-xs font-semibold tabular-nums text-body ring-1 ring-border">
                    {index + 1}
                  </span>
                  <span className="min-w-0">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                      {step.label}
                    </span>
                    <span className="mt-1 block text-xs leading-snug text-muted">
                      {step.artifact}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-4 md:p-6">
          <div className="flex items-start gap-3">
            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-orange-50 text-orange-700">
              <ActiveIcon className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wide text-muted">
                Working question
              </div>
              <h3 className="mt-1 text-xl font-semibold tracking-tight text-body">
                {active.question}
              </h3>
            </div>
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_240px]">
            <div className="rounded-md border border-border bg-code-bg p-4">
              <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted">
                Memo language
              </div>
              <p className="text-sm leading-relaxed text-subtle">
                {activeSection.memo_text}
              </p>
            </div>
            <div className="space-y-3">
              <div className="rounded-md border border-border p-3">
                <div className="text-[11px] font-semibold uppercase tracking-wide text-muted">
                  Evidence standard
                </div>
                <p className="mt-1 text-sm leading-snug text-body">
                  {activeSection.evidence_standard}
                </p>
              </div>
              <div className="rounded-md border border-amber-200 bg-amber-50 p-3">
                <div className="text-[11px] font-semibold uppercase tracking-wide text-amber-800">
                  Red flag
                </div>
                <p className="mt-1 text-sm leading-snug text-amber-900">
                  {active.red_flag}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-5 rounded-md border border-border bg-white p-4">
            <div className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-muted">
              Done means
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              {data.rubric.slice(0, 3).map((item) => (
                <div key={item.criterion} className="text-sm leading-snug">
                  <div className="font-semibold text-body">{item.criterion}</div>
                  <div className="mt-1 text-muted">{item.why_it_matters}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DecisionBriefBuilder;
