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
  rectSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  GripVertical,
  Star,
  ArrowUpRight,
  Search,
  X,
  ArrowUpToLine,
  ArrowDownToLine,
  Pencil,
  Sparkles,
} from 'lucide-react';
import type { RegistryType, RegistryStatus } from '@/lib/registry-types';
import { curationGaps } from '@/lib/curation';
import { updateRow, reorder } from '@/app/admin/actions';
import {
  TYPE_OPTIONS,
  STATUS_OPTIONS,
  TOPIC_OPTIONS,
  TEACHING_OPTIONS,
  type AdminRow,
  type RowPatch,
} from '@/app/admin/types';

type OrderMode = 'saved' | 'added' | 'featured' | 'az' | 'updated' | 'type';
const ORDER_LABELS: Record<OrderMode, string> = {
  saved: 'Saved order (drag)',
  added: 'Recently added',
  featured: 'Featured first',
  az: 'A–Z',
  updated: 'Recently edited',
  type: 'By type',
};

const selectCls =
  'rounded-md border border-hub-line bg-hub-paper px-2 py-1 font-plex text-[11px] uppercase tracking-[0.04em] text-hub-ink focus:border-hub-teal focus:outline-none';

/** "3d ago" / "2w ago" — enough to spot an ingest batch without reading timestamps. */
function relativeDays(ts: string | null): string | null {
  if (!ts) return null;
  // Turso writes 'YYYY-MM-DD HH:MM:SS' in UTC; make that explicit for Date.parse.
  const ms = Date.parse(ts.replace(' ', 'T') + (/[Zz]|[+-]\d\d:?\d\d$/.test(ts) ? '' : 'Z'));
  if (Number.isNaN(ms)) return null;
  const days = Math.floor((Date.now() - ms) / 86_400_000);
  if (days <= 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 14) return `${days}d ago`;
  if (days < 60) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

/** Splice a reordered VISIBLE subset back into the full saved order: non-visible
 *  rows keep their slots; visible rows fill the visible slots in their new order. */
function spliceVisibleOrder(full: AdminRow[], newVisibleIds: string[]): AdminRow[] {
  const visible = new Set(newVisibleIds);
  const byId = new Map(full.map(r => [r.id, r]));
  let qi = 0;
  return full.map(r => (visible.has(r.id) ? byId.get(newVisibleIds[qi++])! : r));
}

export function AdminTable({ initialRows }: { initialRows: AdminRow[] }) {
  const [rows, setRows] = useState<AdminRow[]>(initialRows);
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | RegistryType>('all');
  const [orderMode, setOrderMode] = useState<OrderMode>('saved');
  const [needsOnly, setNeedsOnly] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Rows still missing a topic or carrying only generic tags — the same set
  // `pnpm curate-new` would pick up (lib/curation.ts).
  const needingCuration = useMemo(() => rows.filter(r => curationGaps(r).length > 0), [rows]);

  const q = query.trim().toLowerCase();
  const filtered = useMemo(
    () =>
      rows.filter(
        r =>
          (typeFilter === 'all' || r.type === typeFilter) &&
          (!needsOnly || curationGaps(r).length > 0) &&
          (q === '' ||
            r.id.toLowerCase().includes(q) ||
            r.title.toLowerCase().includes(q) ||
            (r.topic ?? '').toLowerCase().includes(q) ||
            r.tags.some(t => t.toLowerCase().includes(q)))
      ),
    [rows, q, typeFilter, needsOnly]
  );

  // `saved` keeps the canonical order (drag maps to it); other modes are view-only.
  const displayed = useMemo(() => {
    switch (orderMode) {
      case 'added':
        return [...filtered].sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? ''));
      case 'featured':
        return [...filtered].sort((a, b) => Number(b.featured) - Number(a.featured));
      case 'az':
        return [...filtered].sort((a, b) => a.title.localeCompare(b.title));
      case 'updated':
        return [...filtered].sort((a, b) => (b.updatedAt ?? '').localeCompare(a.updatedAt ?? ''));
      case 'type':
        return [...filtered].sort((a, b) => a.type.localeCompare(b.type) || a.title.localeCompare(b.title));
      default:
        return filtered;
    }
  }, [filtered, orderMode]);

  /** Open the curation queue: uncurated rows only, newest ingest first. */
  function openCurationQueue() {
    setNeedsOnly(true);
    setOrderMode('added');
    setTypeFilter('all');
    setQuery('');
  }

  const dragEnabled = orderMode === 'saved';

  function applyPatch(id: string, patch: RowPatch) {
    setError(null);
    const prevRow = rows.find(r => r.id === id);
    const inverse: RowPatch = {};
    for (const k of Object.keys(patch) as (keyof RowPatch)[]) (inverse as Record<string, unknown>)[k] = prevRow?.[k];
    setRows(rs => rs.map(r => (r.id === id ? { ...r, ...patch } : r)));
    startTransition(async () => {
      try {
        const result = await updateRow(id, patch);
        if (!result.ok) {
          setRows(rs => rs.map(r => (r.id === id ? { ...r, ...inverse } : r)));
          setError(`Save failed: ${result.error}`);
        }
      } catch (e) {
        setRows(rs => rs.map(r => (r.id === id ? { ...r, ...inverse } : r)));
        setError(`Save failed: ${(e as Error).message}`);
      }
    });
  }

  // Persist a new order for the VISIBLE subset (splice into the full saved order).
  function commitOrder(newVisibleIds: string[]) {
    const prevOrder = rows.map(r => r.id);
    const newFull = spliceVisibleOrder(rows, newVisibleIds);
    setRows(newFull);
    setError(null);
    const orderedIds = newFull.map(r => r.id);
    startTransition(async () => {
      const revert = (message: string) => {
        // Revert order over the latest state (keep any concurrent field edits).
        setRows(rs => {
          const pos = new Map(prevOrder.map((id, i) => [id, i]));
          return [...rs].sort((a, b) => (pos.get(a.id) ?? 0) - (pos.get(b.id) ?? 0));
        });
        setError(`Reorder failed: ${message}`);
      };
      try {
        const result = await reorder(orderedIds);
        if (!result.ok) revert(result.error);
      } catch (e) {
        revert((e as Error).message);
      }
    });
  }

  function handleDragEnd(e: DragEndEvent) {
    if (!dragEnabled) return;
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const ids = displayed.map(r => r.id);
    const oldIndex = ids.indexOf(active.id as string);
    const newIndex = ids.indexOf(over.id as string);
    if (oldIndex < 0 || newIndex < 0) return;
    commitOrder(arrayMove(ids, oldIndex, newIndex));
  }

  function moveTo(id: string, where: 'top' | 'bottom') {
    const ids = displayed.map(r => r.id);
    const rest = ids.filter(x => x !== id);
    commitOrder(where === 'top' ? [id, ...rest] : [...rest, id]);
  }

  return (
    <div className="mt-5">
      {/* Curation queue banner — the fastest path to "what did I just ingest
          that still has no topic?", which is otherwise buried in 178 cards. */}
      {needingCuration.length > 0 && !needsOnly && (
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-hub-amber/40 bg-hub-amber/10 px-4 py-3">
          <p className="flex items-center gap-2 text-[13px] text-hub-ink">
            <Sparkles size={15} className="shrink-0 text-hub-amber" />
            <span>
              <strong>{needingCuration.length}</strong>{' '}
              {needingCuration.length === 1 ? 'item needs' : 'items need'} a topic or real tags
              {needingCuration.some(r => r.createdAt) && (
                <span className="text-hub-ink-soft">
                  {' '}
                  · newest added{' '}
                  {relativeDays(
                    needingCuration.reduce<string | null>(
                      (max, r) => ((r.createdAt ?? '') > (max ?? '') ? r.createdAt : max),
                      null
                    )
                  )}
                </span>
              )}
            </span>
          </p>
          <button
            type="button"
            onClick={openCurationQueue}
            className="shrink-0 rounded-lg border border-hub-amber/50 bg-hub-card px-3.5 py-1.5 font-plex text-[11px] font-medium uppercase tracking-[0.08em] text-hub-ink transition-colors hover:border-hub-amber"
          >
            Curate them →
          </button>
        </div>
      )}

      {/* Toolbar */}
      <div className="sticky top-0 z-20 -mx-2 flex flex-wrap items-center gap-2 bg-hub-paper/95 px-2 py-2 backdrop-blur">
        <div className="relative min-w-[200px] flex-grow">
          <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-hub-ink-faint" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Filter by title, id, topic, tag…"
            className="w-full rounded-full border border-hub-line bg-hub-card py-2 pl-9 pr-8 text-[13px] text-hub-ink placeholder:text-hub-ink-faint focus:border-hub-teal focus:outline-none focus:ring-2 focus:ring-hub-teal/30"
          />
          {query && (
            <button type="button" onClick={() => setQuery('')} aria-label="Clear filter" className="absolute right-3 top-1/2 -translate-y-1/2 text-hub-ink-faint hover:text-hub-ink">
              <X size={14} />
            </button>
          )}
        </div>
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value as 'all' | RegistryType)} aria-label="Filter by type" className={selectCls}>
          <option value="all">All types</option>
          {TYPE_OPTIONS.map(t => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => setNeedsOnly(v => !v)}
          aria-pressed={needsOnly}
          title="Show only rows missing a topic or carrying only generic tags"
          className={`rounded-md border px-2.5 py-1 font-plex text-[11px] uppercase tracking-[0.04em] transition-colors ${
            needsOnly
              ? 'border-hub-amber bg-hub-amber/15 text-hub-ink'
              : 'border-hub-line bg-hub-paper text-hub-ink-soft hover:border-hub-line-strong hover:text-hub-ink'
          }`}
        >
          Needs curation ({needingCuration.length})
        </button>
        <label className="flex items-center gap-1.5 font-plex text-[10px] uppercase tracking-[0.06em] text-hub-ink-faint">
          Order
          <select value={orderMode} onChange={e => setOrderMode(e.target.value as OrderMode)} aria-label="Order by" className={selectCls}>
            {(Object.keys(ORDER_LABELS) as OrderMode[]).map(m => (
              <option key={m} value={m}>{ORDER_LABELS[m]}</option>
            ))}
          </select>
        </label>
        <span className="font-plex text-[11px] uppercase tracking-[0.06em] text-hub-ink-faint">
          {displayed.length}/{rows.length}
          {pending && <span className="ml-2 text-hub-teal">saving…</span>}
        </span>
      </div>

      {error && (
        <p className="mt-2 rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-[12.5px] text-red-700">{error}</p>
      )}
      <p className="mt-2 font-plex text-[11px] uppercase tracking-[0.05em] text-hub-ink-faint">
        {dragEnabled
          ? '⭐ floats to the top of the live gallery · drag or use ⤒/⤓ to set order (works inside a filter)'
          : `View-only order — switch to “${ORDER_LABELS.saved}” to drag/reorder`}
      </p>

      <div className="mt-3">
        <DndContext id="admin-gallery-dnd" sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={displayed.map(r => r.id)} strategy={rectSortingStrategy}>
            <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {displayed.map(row => (
                <SortableCard key={row.id} row={row} dragEnabled={dragEnabled} onPatch={applyPatch} onMove={moveTo} />
              ))}
            </ul>
          </SortableContext>
        </DndContext>
        {displayed.length === 0 && (
          <p className="rounded-2xl border border-dashed border-hub-line-strong bg-hub-card p-8 text-center text-[13px] text-hub-ink-soft">
            No rows match.
          </p>
        )}
      </div>
    </div>
  );
}

function SortableCard({
  row,
  dragEnabled,
  onPatch,
  onMove,
}: {
  row: AdminRow;
  dragEnabled: boolean;
  onPatch: (id: string, patch: RowPatch) => void;
  onMove: (id: string, where: 'top' | 'bottom') => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: row.id,
    disabled: !dragEnabled,
  });
  // Rows that still need curation open with their editors already showing —
  // the point of finding them is to fill them in.
  const [expanded, setExpanded] = useState(() => curationGaps(row).length > 0);
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
    zIndex: isDragging ? 10 : undefined,
  };
  const dimmed = row.status !== 'published';
  const gaps = curationGaps(row);
  const added = relativeDays(row.createdAt);

  return (
    <li
      ref={setNodeRef}
      style={style}
      data-id={row.id}
      className={`flex flex-col overflow-hidden rounded-xl border bg-hub-card shadow-hub ${
        gaps.length ? 'border-hub-amber/50' : 'border-hub-line'
      } ${dimmed ? 'opacity-60' : ''}`}
    >
      {/* Thumbnail strip with drag handle + featured toggle */}
      <div className="relative aspect-[16/8] bg-hub-paper2">
        {row.thumbnail ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={row.thumbnail} alt="" loading="lazy" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center font-plex text-[11px] uppercase tracking-[0.08em] text-hub-ink-faint">
            {row.type}
          </div>
        )}
        <span className="absolute inset-x-0 top-0 h-1" style={{ backgroundColor: row.accent ?? '#46688f' }} />
        <button
          type="button"
          aria-label="Drag to reorder"
          {...attributes}
          {...(dragEnabled ? listeners : {})}
          className={`absolute left-1.5 top-1.5 rounded bg-hub-card/90 p-1 shadow-hub backdrop-blur ${
            dragEnabled ? 'cursor-grab text-hub-ink-soft hover:text-hub-ink active:cursor-grabbing' : 'cursor-not-allowed text-hub-ink-faint opacity-50'
          }`}
        >
          <GripVertical size={14} />
        </button>
        <button
          type="button"
          aria-label={row.featured ? 'Unfeature' : 'Feature'}
          aria-pressed={row.featured}
          onClick={() => onPatch(row.id, { featured: !row.featured })}
          className={`absolute right-1.5 top-1.5 rounded bg-hub-card/90 p-1 shadow-hub backdrop-blur transition-colors ${
            row.featured ? 'text-hub-amber' : 'text-hub-ink-faint hover:text-hub-ink'
          }`}
        >
          <Star size={14} fill={row.featured ? 'currentColor' : 'none'} />
        </button>
      </div>

      {/* Body */}
      <div className="flex flex-grow flex-col gap-2 p-3">
        <input
          key={`title-${row.title}`}
          defaultValue={row.title}
          onBlur={e => {
            const v = e.target.value.trim();
            if (!v) e.target.value = row.title;
            else if (v !== row.title) onPatch(row.id, { title: v });
          }}
          aria-label="Title"
          className="w-full rounded-md border border-transparent bg-transparent px-1 py-0.5 font-serif text-[15px] font-semibold leading-snug text-hub-ink hover:border-hub-line focus:border-hub-teal focus:bg-hub-paper focus:outline-none"
        />

        {(gaps.length > 0 || added) && (
          <div className="flex flex-wrap items-center gap-1.5">
            {gaps.length > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-hub-amber/15 px-2 py-0.5 font-plex text-[10px] uppercase tracking-[0.05em] text-hub-ink">
                <Sparkles size={10} className="text-hub-amber" />
                needs {gaps.join(' + ')}
              </span>
            )}
            {added && (
              <span
                className="font-plex text-[10px] uppercase tracking-[0.05em] text-hub-ink-faint"
                title={row.createdAt ? `added ${row.createdAt} UTC` : undefined}
              >
                added {added}
              </span>
            )}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-1.5">
          <select value={row.type} onChange={e => onPatch(row.id, { type: e.target.value as RegistryType })} aria-label="Type" className={selectCls}>
            {TYPE_OPTIONS.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <select value={row.status} onChange={e => onPatch(row.id, { status: e.target.value as RegistryStatus })} aria-label="Status" className={selectCls}>
            {STATUS_OPTIONS.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <select
          value={row.topic ?? ''}
          onChange={e => onPatch(row.id, { topic: e.target.value || null })}
          aria-label="Topic"
          className={`${selectCls} w-full ${gaps.includes('topic') ? 'border-hub-amber' : ''}`}
        >
          <option value="">— topic —</option>
          {TOPIC_OPTIONS.map(t => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>

        {/* Expandable text editing (keeps cards compact) */}
        <button
          type="button"
          onClick={() => setExpanded(v => !v)}
          className="flex items-center gap-1 self-start font-plex text-[10px] uppercase tracking-[0.06em] text-hub-ink-faint hover:text-hub-ink"
        >
          <Pencil size={11} /> {expanded ? 'hide text' : 'edit text'}
        </button>
        {expanded && (
          <div className="flex flex-col gap-2">
            <input
              key={`tags-${row.tags.join(',')}`}
              defaultValue={row.tags.join(', ')}
              onBlur={e => {
                const arr = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                if (JSON.stringify(arr) !== JSON.stringify(row.tags)) onPatch(row.id, { tags: arr });
              }}
              placeholder="tags, comma, separated"
              aria-label="Tags"
              className={`w-full rounded-md border bg-hub-paper px-2 py-1 font-plex text-[11px] text-hub-ink-soft focus:border-hub-teal focus:outline-none ${
                gaps.includes('tags') ? 'border-hub-amber' : 'border-hub-line'
              }`}
            />
            <select
              value={row.teaching ?? ''}
              onChange={e => onPatch(row.id, { teaching: e.target.value || null })}
              aria-label="Paired book section"
              className={`${selectCls} w-full normal-case tracking-normal`}
            >
              <option value="">— pairs with no chapter —</option>
              {TEACHING_OPTIONS.map(o => (
                <option key={o.slug} value={o.slug}>{o.label}</option>
              ))}
            </select>
            <textarea
              key={`desc-${row.description}`}
              defaultValue={row.description}
              onBlur={e => {
                if (e.target.value !== row.description) onPatch(row.id, { description: e.target.value });
              }}
              rows={3}
              aria-label="Description"
              className="w-full resize-y rounded-md border border-hub-line bg-hub-paper px-2 py-1.5 text-[12.5px] leading-relaxed text-hub-ink-soft focus:border-hub-teal focus:outline-none"
            />
          </div>
        )}

        {/* Footer */}
        <div className="mt-auto flex items-center justify-between gap-2 pt-1">
          <div className="flex items-center gap-1">
            {dragEnabled && (
              <>
                <button type="button" aria-label="Move to top" title="Move to top of this view" onClick={() => onMove(row.id, 'top')} className="rounded border border-hub-line p-1 text-hub-ink-faint hover:border-hub-line-strong hover:text-hub-ink">
                  <ArrowUpToLine size={13} />
                </button>
                <button type="button" aria-label="Move to bottom" title="Move to bottom of this view" onClick={() => onMove(row.id, 'bottom')} className="rounded border border-hub-line p-1 text-hub-ink-faint hover:border-hub-line-strong hover:text-hub-ink">
                  <ArrowDownToLine size={13} />
                </button>
              </>
            )}
            {row.href && (
              <a href={row.href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 rounded border border-hub-line px-1.5 py-1 font-plex text-[10px] uppercase tracking-[0.05em] text-hub-ink-soft hover:border-hub-line-strong hover:text-hub-ink">
                View <ArrowUpRight size={11} />
              </a>
            )}
          </div>
          <span className="truncate font-plex text-[9.5px] uppercase tracking-[0.04em] text-hub-ink-faint" title={`${row.id}${row.updatedAt ? ` · updated ${row.updatedAt}` : ''}`}>
            {row.id}
          </span>
        </div>
      </div>
    </li>
  );
}
