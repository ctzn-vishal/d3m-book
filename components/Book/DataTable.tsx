'use client';

import * as React from 'react';

export interface DataTableColumn<R> {
  /** Key into each row object. Also used as the React key. */
  key: string;
  /** Header label rendered in the <thead>. */
  label: React.ReactNode;
  /** Text alignment of the column. Default "left" for first column, "right" for others. */
  align?: 'left' | 'right' | 'center';
  /** Optional formatter for the cell value. Default: String(row[key]). */
  format?: (row: R) => React.ReactNode;
}

export interface DataTableProps<R extends Record<string, unknown>> {
  /**
   * Caption rendered above the table, styled like a figcaption (italic,
   * sm, gray-600). Should state a finding, not describe the table.
   *
   *   ✓ "Table 1. Republican support fell on 5 of 7 abortion items between 1977 and 2024."
   *   ✗ "Table 1. Abortion items by party."
   */
  caption: string;
  columns: DataTableColumn<R>[];
  rows: R[];
  /**
   * Index of the row to render in bold. Use to highlight the row that
   * carries the section's claim. Default: none.
   */
  highlightRow?: number;
  /**
   * Optional callback for conditional cell coloring. Return a Tailwind
   * class string for the cell's `<td>`. Use red for "moved against
   * expectation," green for "moved with expectation," neutral otherwise.
   * Color in tables must always carry meaning — never decorative.
   */
  cellClass?: (row: R, column: DataTableColumn<R>, rowIndex: number) => string;
}

function defaultAlign(index: number): 'left' | 'right' {
  return index === 0 ? 'left' : 'right';
}

const ALIGN_CLASS: Record<'left' | 'right' | 'center', string> = {
  left: 'text-left',
  right: 'text-right',
  center: 'text-center',
};

/**
 * DataTable — small editorial table. Tabular numerals so columns align,
 * selective row bolding, conditional cell coloring callback. Use for 3–8
 * rows of comparable values where the *pattern across rows* is the
 * finding.
 *
 * NOT for: long data dumps (link to source), single comparisons (just say
 * it in prose), or tables where every cell is bold or every cell is
 * colored (defeats the contrast).
 */
export function DataTable<R extends Record<string, unknown>>({
  caption,
  columns,
  rows,
  highlightRow,
  cellClass,
}: DataTableProps<R>) {
  return (
    <figure className="not-prose my-9">
      <figcaption className="mb-2 text-[13px] italic leading-snug text-subtle">
        {caption}
      </figcaption>
      <div className="overflow-x-auto rounded-md border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800/40 dark:shadow-none">
        <table className="w-full border-collapse text-sm tabular-nums">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/60">
              {columns.map((col, ci) => {
                const align = col.align ?? defaultAlign(ci);
                return (
                  <th
                    key={col.key}
                    scope="col"
                    className={[
                      'px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400',
                      ALIGN_CLASS[align],
                    ].join(' ')}
                  >
                    {col.label}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => {
              const isHighlight = ri === highlightRow;
              return (
                <tr
                  key={ri}
                  className={[
                    'border-b border-slate-100 last:border-b-0 hover:bg-slate-50/80 dark:border-slate-800 dark:hover:bg-slate-700/40',
                    isHighlight ? 'font-semibold text-slate-950 dark:text-slate-50' : 'text-slate-700 dark:text-slate-300',
                  ].join(' ')}
                >
                  {columns.map((col, ci) => {
                    const align = col.align ?? defaultAlign(ci);
                    const extra = cellClass?.(row, col, ri) ?? '';
                    const value = col.format
                      ? col.format(row)
                      : (row[col.key] as React.ReactNode);
                    return (
                      <td
                        key={col.key}
                        className={[
                          'px-3 py-2.5',
                          ALIGN_CLASS[align],
                          extra,
                        ].join(' ')}
                      >
                        {value as React.ReactNode}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </figure>
  );
}

/**
 * DeltaCell — small helper for rendering a signed change with a directional
 * arrow. Use as the format function on a "Δ" column:
 *
 *   { key: 'delta', label: 'Δ', format: (r) => <DeltaCell value={r.delta} /> }
 */
export function DeltaCell({ value, suffix = '' }: { value: number; suffix?: string }) {
  if (value === 0) {
    return <span className="text-muted tabular-nums">0{suffix}</span>;
  }
  const sign = value > 0 ? '+' : '−';
  const abs = Math.abs(value);
  const arrow = value > 0 ? '↑' : '↓';
  const color = value > 0 ? 'text-gray-900 dark:text-gray-100' : 'text-gray-900 dark:text-gray-100';
  // Direction-of-change color is the caller's job (via cellClass), since
  // "up" doesn't always mean "good." Here we just render the arrow + sign.
  return (
    <span className={`tabular-nums ${color}`}>
      {arrow} {sign}
      {abs}
      {suffix}
    </span>
  );
}
