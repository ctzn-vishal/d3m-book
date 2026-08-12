'use client';

import * as React from 'react';
import { LayoutGrid, Rows3, ListOrdered } from 'lucide-react';
import { AdminTable } from '@/components/admin/AdminTable';
import { AdminDataTable } from '@/components/admin/AdminDataTable';
import { TopicOrder } from '@/components/admin/TopicOrder';
import type { AdminRow } from '@/app/admin/types';

const KEY = 'admin:view';
type View = 'cards' | 'table' | 'topics';
const VIEWS: View[] = ['cards', 'table', 'topics'];

/**
 * Switches between the curation surfaces.
 *
 * Cards keep drag-to-reorder — ordering is a spatial judgement and a dense
 * table is a poor place to make it. The table is for everything else: sorting,
 * faceting, and multi-row edits. Topics orders the shelves themselves, which is
 * a different question from ordering items within one. None replaces another,
 * so all three stay.
 *
 * The choice persists in localStorage; read in an effect rather than during
 * render so the server and first client render agree.
 */
export function AdminViews({ rows, topicOrder }: { rows: AdminRow[]; topicOrder: string[] }) {
  const [view, setView] = React.useState<View>('table');

  React.useEffect(() => {
    const saved = window.localStorage.getItem(KEY);
    if (saved && (VIEWS as string[]).includes(saved)) setView(saved as View);
  }, []);

  const pick = (v: View) => {
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
            { id: 'topics', label: 'Topics', Icon: ListOrdered },
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

      {view === 'table' && <AdminDataTable initialRows={rows} />}
      {view === 'cards' && <AdminTable initialRows={rows} />}
      {view === 'topics' && <TopicOrder rows={rows} initialOrder={topicOrder} />}
    </>
  );
}
