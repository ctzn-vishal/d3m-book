import { getDbClient } from '@/lib/turso-admin';
import { AdminTable } from '@/components/admin/AdminTable';
import type { AdminRow } from './types';
import type { RegistryType, RegistryStatus } from '@/lib/registry-types';

// Always read fresh on each request — this is a curation surface, not a cached page.
export const dynamic = 'force-dynamic';

function toAdminRow(r: Record<string, any>): AdminRow {
  return {
    id: r.id,
    type: r.type as RegistryType,
    title: r.title ?? '',
    description: r.description ?? '',
    topic: r.topic ?? null,
    tags: r.tags ? JSON.parse(r.tags) : [],
    teaching: r.teaching ?? null,
    status: r.status as RegistryStatus,
    featured: !!r.featured,
    sort: r.sort ?? 0,
    href: r.href ?? '',
    thumbnail: r.thumbnail ?? null,
    accent: r.accent ?? null,
    domain: r.domain ?? null,
    external: !!r.external,
    createdAt: r.created_at ?? null,
    updatedAt: r.updated_at ?? null,
  };
}

export default async function AdminPage() {
  const db = await getDbClient();
  let rows: AdminRow[] = [];
  let connected = false;
  if (db) {
    try {
      const r = await db.execute('SELECT * FROM gallery ORDER BY sort ASC, title ASC');
      rows = (r.rows as unknown as Record<string, any>[]).map(toAdminRow);
      connected = true;
    } catch {
      connected = false;
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-5 py-8 sm:px-7">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-hub-line pb-5">
        <div>
          <div className="font-plex text-[11px] uppercase tracking-[0.16em] text-hub-amber">
            Gallery registry · CMS
          </div>
          <h1 className="mt-1.5 font-serif text-3xl font-semibold tracking-tight text-hub-ink">
            Curate the gallery
          </h1>
          <p className="mt-1.5 max-w-2xl text-[13.5px] leading-relaxed text-hub-ink-soft">
            Just ingested something? <strong>Needs curation</strong> filters to the rows still
            missing a topic or real tags — the same set <code>pnpm curate-new</code> picks up — and
            <strong> Recently added</strong> orders by ingest date so a new batch sits at the top.
            Drag cards (or use ⤒/⤓) to set order — works inside a filter too. ⭐ floats an item to
            the top of the live gallery. Edit type / status / topic / tags / paired chapter / text
            inline. Changes write to <strong>live Turso</strong> and show within seconds; the
            committed snapshot syncs nightly.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <a
            href="/admin/social"
            className="rounded-lg border border-hub-line bg-hub-card px-3.5 py-2 font-plex text-[11px] font-medium uppercase tracking-[0.08em] text-hub-ink-soft transition-colors hover:border-hub-line-strong hover:text-hub-ink"
          >
            Social queue →
          </a>
          <form action="/api/admin/logout" method="post">
            <button
              type="submit"
              className="rounded-lg border border-hub-line bg-hub-card px-3.5 py-2 font-plex text-[11px] font-medium uppercase tracking-[0.08em] text-hub-ink-soft transition-colors hover:border-hub-line-strong hover:text-hub-ink"
            >
              Sign out
            </button>
          </form>
        </div>
      </header>

      {connected ? (
        <p className="mt-4 inline-flex items-center gap-2 rounded-full border border-hub-line bg-hub-card px-3 py-1 font-plex text-[11px] uppercase tracking-[0.06em] text-hub-ink-soft">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Live Turso · {rows.length} rows
        </p>
      ) : (
        <p className="mt-4 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-[13px] text-red-700">
          <strong>Turso unreachable.</strong> Edits can&apos;t be saved. Set a valid{' '}
          <code>TURSO_AUTH_TOKEN</code> (run <code>pnpm mint-db-token</code>) and reload.
        </p>
      )}

      {connected ? <AdminTable initialRows={rows} /> : null}
    </div>
  );
}
