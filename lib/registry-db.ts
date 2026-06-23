import 'server-only';
import { getDbClient, resetDbClient } from '@/lib/turso-admin';
import { snapshotItems, sortItems } from '@/lib/registry';
import type { RegistryItem, RegistryType } from '@/lib/registry-types';

/**
 * Live read of the Turso `gallery` registry, with the committed snapshot as a
 * fallback. Server-only — import ONLY from server components.
 *
 * The connection (lib/turso-admin.ts) self-heals a platform token into a
 * DB-scoped one, so curation edits show via ISR even when Vercel only has a
 * platform token. The whole read is time-bounded; on timeout / unreachable DB /
 * missing creds it returns the snapshot, so the gallery always renders.
 */
const READ_TIMEOUT_MS = 4000; // allows a cold-start mint; cached after first success

function mapRows(rows: Record<string, any>[]): RegistryItem[] {
  return rows.map(r => ({
    id: r.id,
    type: r.type as RegistryType,
    title: r.title,
    description: r.description ?? '',
    domain: r.domain ?? undefined,
    topic: r.topic ?? undefined,
    tags: r.tags ? JSON.parse(r.tags) : [],
    teaching: r.teaching ?? undefined,
    href: r.href,
    external: !!r.external,
    openInNewTab: !!r.open_in_new_tab,
    thumbnail: r.thumbnail ?? undefined,
    accent: r.accent ?? '#46688f',
    featured: !!r.featured,
    status: r.status,
    sort: r.sort ?? 0,
    createdAt: r.created_at ?? undefined,
    updatedAt: r.updated_at ?? undefined,
  }));
}

// Returns the live rows on success (possibly an EMPTY array — a valid state when
// everything is unpublished), or null when the DB is unreachable / times out / has
// no creds. Callers distinguish null (fall back to snapshot) from [] (serve empty).
async function readTurso(where: string): Promise<RegistryItem[] | null> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    const result = await Promise.race([
      (async () => {
        const db = await getDbClient();
        if (!db) return null;
        return db.execute(`SELECT * FROM gallery${where}`);
      })(),
      new Promise<null>(resolve => { timer = setTimeout(() => resolve(null), READ_TIMEOUT_MS); }),
    ]);
    if (!result) return null;
    return mapRows(result.rows as unknown as Record<string, any>[]);
  } catch (e) {
    // Self-heal a stale/expired token so the next request re-mints.
    if (/401|unauthor|expired|jwt|token/i.test((e as Error)?.message ?? '')) resetDbClient();
    return null; // turso-admin already logged the cause once
  } finally {
    if (timer) clearTimeout(timer);
  }
}

/** Full published registry: live Turso when reachable, else the committed snapshot. */
export async function getRegistry(): Promise<RegistryItem[]> {
  const live = await readTurso(" WHERE status = 'published'");
  return live ? sortItems(live) : snapshotItems();
}

/**
 * Whether the home gallery is currently reading LIVE Turso or the committed
 * SNAPSHOT — surfaced by /api/registry-source so you can tell at a glance whether
 * curation edits are reaching the site. 'live' iff the DB read succeeded (even if
 * it returned zero rows).
 */
export async function getRegistrySource(): Promise<'live' | 'snapshot'> {
  const live = await readTurso(' LIMIT 1');
  return live ? 'live' : 'snapshot';
}
