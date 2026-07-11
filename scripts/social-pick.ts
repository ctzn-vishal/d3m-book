import type { RegistryItem } from '../lib/registry-types';

/**
 * Candidate picker for the social-drafts pipeline — pure and deterministic so it
 * can be unit-tested against the committed snapshot.
 *
 * Eligibility: published Blog stories hosted on the content bucket with a
 * thumbnail (the chart image IS the post — no image, no post).
 *
 * Priority: never-promoted stories first (newest createdAt first — ride the
 * "New" window), then evergreen rotation (longest since last promotion).
 * Excluded: items with a pending draft/approved entry, and items promoted
 * within the cooldown. Topic diversity: at most one pick per topic per batch
 * (two for un-curated items with no topic yet); relaxed only if the batch
 * can't otherwise fill.
 */

export type QueueRowLite = {
  item_id: string;
  status: string; // draft | approved | posted | rejected
  created_at: string | null; // 'YYYY-MM-DD HH:MM:SS' (UTC)
  posted_at: string | null;
};

export type PickOptions = {
  batch?: number;
  cooldownDays?: number;
  now?: Date;
};

const DAY_MS = 86_400_000;

function parseTs(ts: string | null | undefined): number {
  if (!ts) return 0;
  const t = Date.parse(ts.replace(' ', 'T') + 'Z');
  return Number.isFinite(t) ? t : 0;
}

export function pickCandidates(
  items: RegistryItem[],
  queue: QueueRowLite[],
  { batch = 3, cooldownDays = 60, now = new Date() }: PickOptions = {}
): RegistryItem[] {
  const pending = new Set(
    queue.filter(q => q.status === 'draft' || q.status === 'approved').map(q => q.item_id)
  );
  const lastPromoted = new Map<string, number>();
  for (const q of queue) {
    if (q.status !== 'posted') continue;
    const t = parseTs(q.posted_at ?? q.created_at);
    lastPromoted.set(q.item_id, Math.max(lastPromoted.get(q.item_id) ?? 0, t));
  }

  const cooldownMs = cooldownDays * DAY_MS;
  const eligible = items.filter(
    i =>
      i.status === 'published' &&
      i.type === 'Blog' &&
      /^https?:\/\/.+\.html?$/i.test(i.href) &&
      !!i.thumbnail &&
      !pending.has(i.id) &&
      (!lastPromoted.has(i.id) || now.getTime() - lastPromoted.get(i.id)! >= cooldownMs)
  );

  const fresh = eligible
    .filter(i => !lastPromoted.has(i.id))
    .sort((a, b) => parseTs(b.createdAt) - parseTs(a.createdAt));
  const evergreen = eligible
    .filter(i => lastPromoted.has(i.id))
    .sort((a, b) => lastPromoted.get(a.id)! - lastPromoted.get(b.id)!);
  const ranked = [...fresh, ...evergreen];

  const picks: RegistryItem[] = [];
  const perTopic = new Map<string, number>();
  for (const item of ranked) {
    if (picks.length >= batch) break;
    const key = item.topic ?? '(none)';
    const cap = item.topic ? 1 : 2;
    if ((perTopic.get(key) ?? 0) >= cap) continue;
    perTopic.set(key, (perTopic.get(key) ?? 0) + 1);
    picks.push(item);
  }
  // Relax diversity if the ranked pool couldn't fill the batch under the caps.
  for (const item of ranked) {
    if (picks.length >= batch) break;
    if (!picks.includes(item)) picks.push(item);
  }
  return picks;
}
