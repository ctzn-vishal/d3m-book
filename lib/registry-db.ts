import 'server-only';
import { createClient } from '@libsql/client';
import { snapshotItems, sortItems } from '@/lib/registry';
import type { RegistryItem, RegistryType } from '@/lib/registry-types';

/**
 * Live read of the Turso `gallery` registry, with the committed snapshot as a
 * fallback. Server-only (imports @libsql) — import ONLY from server components.
 *
 * Returns the snapshot when TURSO creds are absent (e.g. Vercel without a
 * DB-scoped TURSO_AUTH_TOKEN) or the DB is unreachable, so the gallery always
 * renders. With a DB-scoped token set, curation edits in Turso show via ISR.
 */
let warned = false;

async function readTurso(): Promise<RegistryItem[] | null> {
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;
  if (!url || !authToken) return null;
  try {
    const db = createClient({ url, authToken });
    // Bound the read so a slow/unreachable DB (DNS stall, hung TLS, partition)
    // fast-fails to the snapshot instead of hanging the build/ISR render — the
    // libsql HTTP transport has no default per-request timeout.
    const result = await Promise.race([
      db.execute("SELECT * FROM gallery WHERE status = 'published'"),
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error('Turso read timed out')), 2500)),
    ]);
    const rows = result.rows as unknown as Record<string, any>[];
    if (!rows.length) return null;
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
    }));
  } catch (e) {
    if (!warned) {
      warned = true;
      console.warn(`[registry] Turso unreachable — serving committed snapshot. (${(e as Error).message})`);
    }
    return null;
  }
}

/** Full published registry: live Turso when available, else the committed snapshot. */
export async function getRegistry(): Promise<RegistryItem[]> {
  const live = await readTurso();
  return live ? sortItems(live) : snapshotItems();
}
