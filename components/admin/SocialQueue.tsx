'use client';

import { useMemo, useState, useTransition } from 'react';
import { Check, Copy, ExternalLink, RotateCcw, Send, X as XIcon } from 'lucide-react';
import {
  PLATFORM_LABEL,
  PLATFORM_MAX,
  type SocialDraft,
  type SocialStatus,
} from '@/app/admin/social/types';
import { setDraftStatus, updateDraftText } from '@/app/admin/social/actions';

/**
 * Review queue for machine-drafted social posts. Grouped by story; per draft:
 * inline edit (Save appears when dirty), Approve / Reject / Mark posted, and
 * Copy (text + link) for the platforms that are posted manually.
 */

const STATUS_TONE: Record<SocialStatus, string> = {
  draft: 'border-hub-amber text-hub-amber',
  approved: 'border-emerald-600 text-emerald-600',
  posted: 'border-hub-line-strong text-hub-ink-faint',
  rejected: 'border-red-400 text-red-400',
};

const FILTERS: { key: SocialStatus | 'all'; label: string }[] = [
  { key: 'draft', label: 'To review' },
  { key: 'approved', label: 'Approved' },
  { key: 'posted', label: 'Posted' },
  { key: 'rejected', label: 'Rejected' },
  { key: 'all', label: 'All' },
];

function DraftCard({ draft }: { draft: SocialDraft }) {
  const [status, setStatus] = useState<SocialStatus>(draft.status);
  const [text, setText] = useState(draft.text);
  const [savedText, setSavedText] = useState(draft.text);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const dirty = text !== savedText;
  const max = PLATFORM_MAX[draft.platform];
  const over = text.length > max;

  const save = () =>
    startTransition(async () => {
      setError(null);
      const res = await updateDraftText(draft.id, text);
      if (res.ok) setSavedText(text);
      else setError(res.error);
    });

  const move = (next: SocialStatus) =>
    startTransition(async () => {
      setError(null);
      const prev = status;
      setStatus(next);
      const res = await setDraftStatus(draft.id, next);
      if (!res.ok) {
        setStatus(prev);
        setError(res.error);
      }
    });

  const copy = async () => {
    const body =
      draft.platform === 'instagram'
        ? text // link lives in bio; caption is the whole payload
        : `${text}\n\n${draft.linkUrl}`;
    try {
      await navigator.clipboard.writeText(body);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      setError('Clipboard unavailable — select and copy manually.');
    }
  };

  return (
    <div className="rounded-xl border border-hub-line bg-hub-card p-3.5">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-plex text-[11px] font-semibold uppercase tracking-[0.08em] text-hub-ink">
          {PLATFORM_LABEL[draft.platform]}
        </span>
        <span
          className={`rounded-full border px-2 py-0.5 font-plex text-[10px] uppercase tracking-[0.06em] ${STATUS_TONE[status]}`}
        >
          {status}
        </span>
        <span className={`ml-auto font-plex text-[11px] ${over ? 'text-red-500' : 'text-hub-ink-faint'}`}>
          {text.length}/{max}
        </span>
      </div>

      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        rows={Math.min(14, Math.max(3, Math.ceil(text.length / 70)))}
        className="mt-2.5 w-full resize-y rounded-lg border border-hub-line bg-hub-paper px-3 py-2 text-[13.5px] leading-relaxed text-hub-ink focus:border-hub-teal focus:outline-none"
      />

      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        {dirty && (
          <button
            type="button"
            disabled={pending}
            onClick={save}
            className="inline-flex items-center gap-1 rounded-full bg-hub-ink px-3 py-1.5 font-plex text-[11px] font-medium uppercase tracking-[0.06em] text-hub-paper disabled:opacity-50"
          >
            <Check size={12} strokeWidth={2.5} /> Save edit
          </button>
        )}
        {status === 'draft' && !dirty && (
          <>
            <button
              type="button"
              disabled={pending}
              onClick={() => move('approved')}
              className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-3 py-1.5 font-plex text-[11px] font-medium uppercase tracking-[0.06em] text-white disabled:opacity-50"
            >
              <Check size={12} strokeWidth={2.5} /> Approve
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={() => move('rejected')}
              className="inline-flex items-center gap-1 rounded-full border border-hub-line px-3 py-1.5 font-plex text-[11px] font-medium uppercase tracking-[0.06em] text-hub-ink-soft hover:border-red-400 hover:text-red-500 disabled:opacity-50"
            >
              <XIcon size={12} strokeWidth={2.5} /> Reject
            </button>
          </>
        )}
        {status === 'approved' && (
          <button
            type="button"
            disabled={pending}
            onClick={() => move('posted')}
            className="inline-flex items-center gap-1 rounded-full border border-emerald-600 px-3 py-1.5 font-plex text-[11px] font-medium uppercase tracking-[0.06em] text-emerald-700 disabled:opacity-50"
          >
            <Send size={12} strokeWidth={2.5} /> Mark posted
          </button>
        )}
        {(status === 'rejected' || status === 'posted') && (
          <button
            type="button"
            disabled={pending}
            onClick={() => move('draft')}
            className="inline-flex items-center gap-1 rounded-full border border-hub-line px-3 py-1.5 font-plex text-[11px] font-medium uppercase tracking-[0.06em] text-hub-ink-soft hover:text-hub-ink disabled:opacity-50"
          >
            <RotateCcw size={12} strokeWidth={2.5} /> Back to draft
          </button>
        )}
        <button
          type="button"
          onClick={copy}
          className="inline-flex items-center gap-1 rounded-full border border-hub-line px-3 py-1.5 font-plex text-[11px] font-medium uppercase tracking-[0.06em] text-hub-ink-soft hover:border-hub-line-strong hover:text-hub-ink"
        >
          <Copy size={12} strokeWidth={2.2} /> {copied ? 'Copied!' : draft.platform === 'instagram' ? 'Copy caption' : 'Copy + link'}
        </button>
      </div>
      {error && <p className="mt-2 text-[12px] text-red-600">{error}</p>}
    </div>
  );
}

export function SocialQueue({ initialDrafts }: { initialDrafts: SocialDraft[] }) {
  const [filter, setFilter] = useState<SocialStatus | 'all'>('draft');

  const counts = useMemo(() => {
    const c = new Map<string, number>();
    for (const d of initialDrafts) c.set(d.status, (c.get(d.status) ?? 0) + 1);
    return c;
  }, [initialDrafts]);

  // Group by story, preserving query order (newest batch first). A group is
  // shown if ANY of its drafts matches the filter; non-matching siblings stay
  // visible so the story is reviewed as a unit.
  const groups = useMemo(() => {
    const byItem = new Map<string, SocialDraft[]>();
    for (const d of initialDrafts) {
      if (!byItem.has(d.itemId)) byItem.set(d.itemId, []);
      byItem.get(d.itemId)!.push(d);
    }
    return [...byItem.values()].filter(g => filter === 'all' || g.some(d => d.status === filter));
  }, [initialDrafts, filter]);

  return (
    <div>
      <div className="mt-5 flex flex-wrap gap-1.5">
        {FILTERS.map(f => (
          <button
            key={f.key}
            type="button"
            onClick={() => setFilter(f.key)}
            className={`rounded-full border px-3 py-1.5 font-plex text-[11.5px] uppercase tracking-[0.06em] transition-colors ${
              filter === f.key
                ? 'border-hub-ink bg-hub-ink text-hub-paper'
                : 'border-hub-line bg-hub-card text-hub-ink-soft hover:border-hub-line-strong hover:text-hub-ink'
            }`}
          >
            {f.label}
            {f.key !== 'all' && ` · ${counts.get(f.key) ?? 0}`}
          </button>
        ))}
      </div>

      {groups.length === 0 ? (
        <p className="mt-8 rounded-2xl border border-dashed border-hub-line-strong bg-hub-card p-10 text-center text-hub-ink-soft">
          Nothing in this view.
        </p>
      ) : (
        <div className="mt-6 space-y-8">
          {groups.map(group => {
            const head = group[0];
            return (
              <section key={head.itemId}>
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <h2 className="font-serif text-[19px] font-semibold leading-snug text-hub-ink">
                    {head.itemTitle}
                  </h2>
                  <a
                    href={head.linkUrl}
                    target="_blank"
                    rel="noopener"
                    className="inline-flex items-center gap-1 font-plex text-[11px] uppercase tracking-[0.06em] text-hub-teal hover:underline"
                  >
                    open story <ExternalLink size={11} strokeWidth={2.5} />
                  </a>
                  {head.itemTopic && (
                    <span className="font-plex text-[11px] uppercase tracking-[0.06em] text-hub-ink-faint">
                      {head.itemTopic}
                    </span>
                  )}
                </div>
                {head.hook && (
                  <p className="mt-1 text-[13px] italic leading-relaxed text-hub-ink-soft">
                    Hook: {head.hook}
                  </p>
                )}
                <div className="mt-3 grid gap-3">
                  {group.map(d => (
                    <DraftCard key={d.id} draft={d} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
