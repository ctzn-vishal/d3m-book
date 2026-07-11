import Link from 'next/link';
import { getDbClient } from '@/lib/turso-admin';
import { SocialQueue } from '@/components/admin/SocialQueue';
import type { SocialDraft, SocialPlatform, SocialStatus } from './types';

// Always read fresh — this is a review queue, not a cached page.
export const dynamic = 'force-dynamic';

function toDraft(r: Record<string, any>): SocialDraft {
  return {
    id: r.id,
    itemId: r.item_id,
    platform: r.platform as SocialPlatform,
    status: r.status as SocialStatus,
    text: r.text ?? '',
    linkUrl: r.link_url ?? '',
    imageUrl: r.image_url ?? null,
    hook: r.hook ?? null,
    createdAt: r.created_at ?? null,
    postedAt: r.posted_at ?? null,
    itemTitle: r.item_title ?? r.item_id,
    itemTopic: r.item_topic ?? null,
  };
}

export default async function SocialAdminPage() {
  const db = await getDbClient();
  let drafts: SocialDraft[] = [];
  let connected = false;
  let tableMissing = false;
  if (db) {
    try {
      const r = await db.execute(`
        SELECT q.*, g.title AS item_title, g.topic AS item_topic
        FROM social_queue q LEFT JOIN gallery g ON g.id = q.item_id
        ORDER BY q.created_at DESC, q.item_id ASC,
          CASE q.platform WHEN 'x' THEN 0 WHEN 'linkedin' THEN 1 ELSE 2 END`);
      drafts = (r.rows as unknown as Record<string, any>[]).map(toDraft);
      connected = true;
    } catch (e) {
      if (/no such table/i.test((e as Error).message ?? '')) {
        connected = true;
        tableMissing = true;
      }
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-5 py-8 sm:px-7">
      <header className="border-b border-hub-line pb-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/admin"
            className="font-plex text-[11px] uppercase tracking-[0.08em] text-hub-ink-soft hover:text-hub-teal"
          >
            ← Gallery CMS
          </Link>
          <form action="/api/admin/logout" method="post">
            <button
              type="submit"
              className="rounded-lg border border-hub-line bg-hub-card px-3.5 py-2 font-plex text-[11px] font-medium uppercase tracking-[0.08em] text-hub-ink-soft transition-colors hover:border-hub-line-strong hover:text-hub-ink"
            >
              Sign out
            </button>
          </form>
        </div>
        <h1 className="mt-3 font-serif text-3xl font-semibold tracking-tight text-hub-ink">
          Social queue
        </h1>
        <p className="mt-1.5 max-w-2xl text-[13.5px] leading-relaxed text-hub-ink-soft">
          Drafts are generated weekly (Mon) by the <code>social-drafts</code> pipeline — one X,
          LinkedIn, and Instagram post per story. Edit the text, then <strong>Approve</strong>.
          Approved X posts flow to Typefully automatically (if configured); LinkedIn and
          Instagram use <strong>Copy</strong> → paste into the platform, then mark posted.
        </p>
      </header>

      {!connected && (
        <p className="mt-4 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-[13px] text-red-700">
          <strong>Turso unreachable.</strong> The queue can&apos;t be loaded — check{' '}
          <code>TURSO_AUTH_TOKEN</code> and reload.
        </p>
      )}
      {tableMissing && (
        <p className="mt-4 rounded-lg border border-hub-line bg-hub-card px-4 py-3 text-[13px] text-hub-ink-soft">
          No queue yet — run <code>pnpm social-drafts</code> (or the &quot;Social drafts&quot;
          GitHub Action) to generate the first batch.
        </p>
      )}
      {connected && !tableMissing && <SocialQueue initialDrafts={drafts} />}
    </div>
  );
}
