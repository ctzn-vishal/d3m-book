'use client';

import * as React from 'react';
import { LayoutGrid, Rows3 } from 'lucide-react';
import { AdminTable } from '@/components/admin/AdminTable';
import { AdminDataTable } from '@/components/admin/AdminDataTable';
import type { AdminRow } from '@/app/admin/types';

const KEY = 'admin:view';

/**
 * Switches between the two curation surfaces.
 *
 * Cards keep drag-to-reorder — ordering is a spatial judgement and a dense
 * table is a poor place to make it. The table is for everything else: sorting,
 * faceting, and multi-row edits. Neither replaces the other, so both stay.
 *
 * The choice persists in localStorage; read in an effect rather than during
 * render so the server and first client render agree.
 */
export function AdminViews({ rows }: { rows: AdminRow[] }) {
  const [view, setView] = React.useState<'cards' | 'table'>('table');

  React.useEffect(() => {
    const saved = window.localStorage.getItem(KEY);
    if (saved === 'cards' || saved === 'table') setView(saved);
  }, []);

  const pick = (v: 'cards' | 'table') => {
    setView(v);
    try {
      window.localStorage.setItem(KEY, v);
    } catch {
      // Private-mode storage failures shouldn't break the toggle.
    }
  };

  return (
    <>
      <div className="mt-4 inline-flex rounded-lg border border-hub-line bg-hub-card p-0.5">
        {(
          [
            { id: 'table', label: 'Table', Icon: Rows3 },
            { id: 'cards', label: 'Cards', Icon: LayoutGrid },
          ] as const
        ).map(({ id, label, Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => pick(id)}
            aria-pressed={view === id}
            className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 font-plex text-[11px] uppercase tracking-[0.08em] transition-colors ${
              view === id ? 'bg-hub-ink text-hub-paper' : 'text-hub-ink-faint hover:text-hub-ink'
            }`}
          >
            <Icon size={12} strokeWidth={2.2} />
            {label}
          </button>
        ))}
      </div>

      {view === 'table' ? <AdminDataTable initialRows={rows} /> : <AdminTable initialRows={rows} />}
    </>
  );
}
