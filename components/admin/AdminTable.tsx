'use client';

import { useMemo, useState, useTransition } from 'react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Star, ArrowUpRight, Search, X } from 'lucide-react';
import type { RegistryType, RegistryStatus } from '@/lib/registry-types';
import { updateRow, reorder } from '@/app/admin/actions';
import {
  TYPE_OPTIONS,
  STATUS_OPTIONS,
  TOPIC_OPTIONS,
  type AdminRow,
  type RowPatch,
} from '@/app/admin/types';

const selectCls =
  'rounded-md border border-hub-line bg-hub-paper px-2 py-1 font-plex text-[11px] uppercase tracking-[0.04em] text-hub-ink focus:border-hub-teal focus:outline-none';

export function AdminTable({ initialRows }: { initialRows: AdminRow[] }) {
  const [rows, setRows] = useState<AdminRow[]>(initialRows);
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | RegistryType>('all');
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const q = query.trim().toLowerCase();
  const filtered = useMemo(
    () =>
      rows.filter(
        r =>
          (typeFilter === 'all' || r.type === typeFilter) &&
          (q === '' ||
            r.id.toLowerCase().includes(q) ||
            r.title.toLowerCase().includes(q) ||
            (r.topic ?? '').toLowerCase().includes(q) ||
            r.tags.some(t => t.toLowerCase().includes(q)))
      ),
    [rows, q, typeFilter]
  );
  // Reorder only makes sense over the full, unfiltered list.
  const dragEnabled = q === '' && typeFilter === 'all';

  function applyPatch(id: string, patch: RowPatch) {
    setError(null);
    // Capture the prior values of ONLY the patched fields, so a failed save
    // reverts those fields on the latest state (never clobbering a concurrent edit).
    const prevRow = rows.find(r => r.id === id);
    const inverse: RowPatch = {};
    for (const k of Object.keys(patch) as (keyof RowPatch)[]) (inverse as Record<string, unknown>)[k] = prevRow?.[k];
    setRows(rs => rs.map(r => (r.id === id ? { ...r, ...patch } : r)));
    startTransition(async () => {
      try {
        await updateRow(id, patch);
      } catch (e) {
        setRows(rs => rs.map(r => (r.id === id ? { ...r, ...inverse } : r)));
        setError(`Save failed: ${(e as Error).message}`);
      }
    });
  }

  function handleDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIndex = rows.findIndex(r => r.id === active.id);
    const newIndex = rows.findIndex(r => r.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    // Apply the move, then re-group featured-first — the SAME order the gallery
    // (sortItems) and the /admin reload (ORDER BY featured DESC, sort ASC) use — so
    // the optimistic UI matches what will be served and a cross-boundary drag can't
    // silently "snap back" only after reload. `sort` is then written over THIS order.
    const moved = arrayMove(rows, oldIndex, newIndex);
    const display = moved
      .map((r, i) => ({ r, i }))
      .sort((a, b) => Number(b.r.featured) - Number(a.r.featured) || a.i - b.i)
      .map(({ r }) => r);
    const prevOrder = rows.map(r => r.id);
    setRows(display);
    setError(null);
    const orderedIds = display.map(r => r.id);
    startTransition(async () => {
      try {
        await reorder(orderedIds);
      } catch (err) {
        // Revert order over the LATEST state (preserve any field edits) by sorting
        // current rows back into the pre-drag id order.
        setRows(rs => {
          const pos = new Map(prevOrder.map((id, i) => [id, i]));
          return [...rs].sort((a, b) => (pos.get(a.id) ?? 0) - (pos.get(b.id) ?? 0));
        });
        setError(`Reorder failed: ${(err as Error).message}`);
      }
    });
  }

  return (
    <div className="mt-5">
      {/* Toolbar */}
      <div className="sticky top-0 z-20 -mx-2 flex flex-wrap items-center gap-2 bg-hub-paper/95 px-2 py-2 backdrop-blur">
        <div className="relative min-w-[220px] flex-grow">
          <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-hub-ink-faint" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Filter by title, id, topic, tag…"
            className="w-full rounded-full border border-hub-line bg-hub-card py-2 pl-9 pr-8 text-[13px] text-hub-ink placeholder:text-hub-ink-faint focus:border-hub-teal focus:outline-none focus:ring-2 focus:ring-hub-teal/30"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              aria-label="Clear filter"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-hub-ink-faint hover:text-hub-ink"
            >
              <X size={14} />
            </button>
          )}
        </div>
        <select
          value={typeFilter}
          onChange={e => setTypeFilter(e.target.value as 'all' | RegistryType)}
          aria-label="Filter by type"
          className={selectCls}
        >
          <option value="all">All types</option>
          {TYPE_OPTIONS.map(t => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <span className="font-plex text-[11px] uppercase tracking-[0.06em] text-hub-ink-faint">
          {filtered.length}/{rows.length}
          {pending && <span className="ml-2 text-hub-teal">saving…</span>}
        </span>
      </div>

      {error && (
        <p className="mt-2 rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-[12.5px] text-red-700">{error}</p>
      )}
      {!dragEnabled && (
        <p className="mt-2 font-plex text-[11px] uppercase tracking-[0.05em] text-hub-ink-faint">
          Clear filters to drag-reorder.
        </p>
      )}

      <div className="mt-3">
        <DndContext id="admin-gallery-dnd" sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={filtered.map(r => r.id)} strategy={verticalListSortingStrategy}>
            <ul className="flex flex-col gap-2">
              {filtered.map(row => (
                <SortableRow key={row.id} row={row} dragEnabled={dragEnabled} onPatch={applyPatch} />
              ))}
            </ul>
          </SortableContext>
        </DndContext>
        {filtered.length === 0 && (
          <p className="rounded-2xl border border-dashed border-hub-line-strong bg-hub-card p-8 text-center text-[13px] text-hub-ink-soft">
            No rows match.
          </p>
        )}
      </div>
    </div>
  );
}

function SortableRow({
  row,
  dragEnabled,
  onPatch,
}: {
  row: AdminRow;
  dragEnabled: boolean;
  onPatch: (id: string, patch: RowPatch) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: row.id,
    disabled: !dragEnabled,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
    zIndex: isDragging ? 10 : undefined,
  };
  const dimmed = row.status !== 'published';

  return (
    <li
      ref={setNodeRef}
      style={style}
      data-id={row.id}
      className={`rounded-xl border border-hub-line bg-hub-card p-3 shadow-hub ${dimmed ? 'opacity-60' : ''}`}
    >
      <div className="flex items-start gap-2">
        {/* Drag handle */}
        <button
          type="button"
          aria-label="Drag to reorder"
          {...attributes}
          {...(dragEnabled ? listeners : {})}
          className={`mt-1 shrink-0 rounded p-1 text-hub-ink-faint ${
            dragEnabled ? 'cursor-grab hover:text-hub-ink active:cursor-grabbing' : 'cursor-not-allowed opacity-40'
          }`}
        >
          <GripVertical size={16} />
        </button>

        {/* Featured */}
        <button
          type="button"
          aria-label={row.featured ? 'Unfeature' : 'Feature'}
          aria-pressed={row.featured}
          onClick={() => onPatch(row.id, { featured: !row.featured })}
          className={`mt-1 shrink-0 rounded p-1 transition-colors ${
            row.featured ? 'text-hub-amber' : 'text-hub-ink-faint hover:text-hub-ink'
          }`}
        >
          <Star size={16} fill={row.featured ? 'currentColor' : 'none'} />
        </button>

        {/* Main editable block */}
        <div className="min-w-0 flex-grow">
          {/* Title + selects + view */}
          <div className="flex flex-wrap items-center gap-2">
            <input
              key={`title-${row.title}`}
              defaultValue={row.title}
              onBlur={e => {
                const v = e.target.value.trim();
                if (!v) e.target.value = row.title;
                else if (v !== row.title) onPatch(row.id, { title: v });
              }}
              aria-label="Title"
              className="min-w-[200px] flex-grow rounded-md border border-transparent bg-transparent px-1.5 py-1 font-serif text-[16px] font-semibold text-hub-ink hover:border-hub-line focus:border-hub-teal focus:bg-hub-paper focus:outline-none"
            />
            <select
              value={row.type}
              onChange={e => onPatch(row.id, { type: e.target.value as RegistryType })}
              aria-label="Type"
              className={selectCls}
            >
              {TYPE_OPTIONS.map(t => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <select
              value={row.status}
              onChange={e => onPatch(row.id, { status: e.target.value as RegistryStatus })}
              aria-label="Status"
              className={selectCls}
            >
              {STATUS_OPTIONS.map(s => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            {row.href && (
              <a
                href={row.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded-md border border-hub-line px-2 py-1 font-plex text-[10px] uppercase tracking-[0.06em] text-hub-ink-soft hover:border-hub-line-strong hover:text-hub-ink"
              >
                View <ArrowUpRight size={11} />
              </a>
            )}
          </div>

          {/* Topic + tags */}
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <select
              value={row.topic ?? ''}
              onChange={e => onPatch(row.id, { topic: e.target.value || null })}
              aria-label="Topic"
              className={selectCls}
            >
              <option value="">— topic —</option>
              {TOPIC_OPTIONS.map(t => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <input
              key={`tags-${row.tags.join(',')}`}
              defaultValue={row.tags.join(', ')}
              onBlur={e => {
                const arr = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                if (JSON.stringify(arr) !== JSON.stringify(row.tags)) onPatch(row.id, { tags: arr });
              }}
              placeholder="tags, comma, separated"
              aria-label="Tags"
              className="min-w-[180px] flex-grow rounded-md border border-hub-line bg-hub-paper px-2 py-1 font-plex text-[11px] text-hub-ink-soft focus:border-hub-teal focus:outline-none"
            />
          </div>

          {/* Description */}
          <textarea
            key={`desc-${row.description}`}
            defaultValue={row.description}
            onBlur={e => {
              if (e.target.value !== row.description) onPatch(row.id, { description: e.target.value });
            }}
            rows={2}
            aria-label="Description"
            className="mt-2 w-full resize-y rounded-md border border-hub-line bg-hub-paper px-2 py-1.5 text-[12.5px] leading-relaxed text-hub-ink-soft focus:border-hub-teal focus:outline-none"
          />

          {/* Footer meta */}
          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 font-plex text-[10px] uppercase tracking-[0.05em] text-hub-ink-faint">
            <span>{row.id}</span>
            {row.updatedAt && <span>updated {row.updatedAt}</span>}
          </div>
        </div>
      </div>
    </li>
  );
}
