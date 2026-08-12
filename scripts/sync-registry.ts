// Unified gallery registry sync. Builds every gallery row from the content
// sources, applies the App/Teaching/Blog/Dataset taxonomy + curation, then:
//   1. UPSERTs into the Turso `gallery` table — the editable curation surface.
//      Existing rows keep their CURATED columns (type/title/description/topic/
//      tags/teaching/featured/status/sort); only DERIVED columns (href/thumbnail/
//      domain/external/open_in_new_tab/accent) are refreshed from source. New
//      content is inserted; vanished content is logged (not auto-deleted).
//   2. Writes content/registry.snapshot.json — the committed fallback the app
//      reads when Turso is unreachable (so builds never depend on the DB).
// Run: pnpm sync-registry   (tsx, env from ../.env)
import { createClient } from '@libsql/client';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { CONTENT_BUCKET } from './pipeline-config.mjs';
import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { studios } from '../lib/studios';
import { domainToTopic } from '../lib/taxonomy';
import gallery from '../content/gallery.json';

type RegistryType = 'App' | 'Teaching' | 'Blog' | 'Dataset';
type RegistryItem = {
  id: string;
  type: RegistryType;
  title: string;
  description: string;
  domain?: string;
  topic?: string;
  tags: string[];
  teaching?: string;
  href: string;
  external: boolean;
  openInNewTab: boolean;
  thumbnail?: string;
  accent: string;
  featured: boolean;
  status: 'published' | 'hidden' | 'draft' | 'unlisted';
  sort: number;
  createdAt?: string;
  updatedAt?: string;
};

const CONTENT = (process.env.NEXT_PUBLIC_CONTENT_URL || 'https://content.vishalsingh.org').replace(/\/$/, '');

// Old granular type → new primary taxonomy (artifact class).
const OLD_TO_NEW: Record<string, RegistryType> = {
  studio: 'Teaching', dashboard: 'Teaching', case: 'Teaching',
  app: 'App', article: 'Blog', dataset: 'Dataset', presentation: 'App',
};

// ── Sources ──────────────────────────────────────────────────────────────
const s3 = new S3Client({
  region: process.env.AWS_REGION || 'auto',
  endpoint: process.env.TIGRIS_ENDPOINT,
  credentials: { accessKeyId: process.env.TIGRIS_CLIENT_ID!, secretAccessKey: process.env.TIGRIS_CLIENT_SECRET! },
  forcePathStyle: false,
});
async function bucketJson<T>(key: string): Promise<T | null> {
  try {
    const r = await s3.send(new GetObjectCommand({ Bucket: CONTENT_BUCKET, Key: key }));
    return JSON.parse(await r.Body!.transformToString()) as T;
  } catch (e) {
    const err = e as any;
    const status = err?.$metadata?.httpStatusCode;
    const missing = err?.name === 'NoSuchKey' || err?.Code === 'NoSuchKey' || status === 404;
    if (missing) { console.warn(`  ! vishal:${key} not found — treating as empty.`); return null; }
    // Any OTHER failure (network, 5xx, throttle, malformed JSON) is NOT "gone".
    // Throw so the sync aborts BEFORE the orphan sweep — otherwise a transient
    // Tigris hiccup would empty a source and auto-hide the whole catalog.
    throw new Error(`failed to read vishal:${key} — ${err?.message ?? err}`);
  }
}

const curate = (gallery as { curate?: Record<string, Partial<RegistryItem>> }).curate ?? {};
const appItems = (gallery as { items?: any[] }).items ?? [];

function basename(p: string): string {
  return p.split('/').pop() || p;
}

// Studios (lib/studios.ts) → Teaching, served from the bucket.
function fromStudios(): RegistryItem[] {
  return studios.map(s => ({
    id: s.slug,
    type: 'Teaching' as const,
    title: s.title,
    description: s.blurb,
    domain: s.domain,
    topic: domainToTopic(s.domain),
    tags: s.methodTags,
    teaching: s.relatedSlug,
    href: `${CONTENT}/studios/${s.slug}/index.html`,
    external: true,
    openInNewTab: true,
    thumbnail: `${CONTENT}/studios/${s.slug}/${basename(s.preview.src)}`,
    accent: s.accent,
    featured: false,
    status: 'published' as const,
    sort: 0,
  }));
}

// Standalone apps/publications (content/gallery.json items).
function fromApps(): RegistryItem[] {
  return appItems.map(it => ({
    id: it.id,
    type: OLD_TO_NEW[it.type] ?? 'App',
    title: it.title,
    description: it.description ?? '',
    domain: it.domain,
    topic: it.topic,
    tags: it.tags ?? [],
    teaching: it.teaching,
    href: it.href,
    external: it.external ?? true,
    openInNewTab: it.openInNewTab ?? true,
    thumbnail: it.thumbnail,
    accent: it.accent ?? '#46688f',
    featured: !!it.featured,
    status: (it.status ?? 'published') as RegistryItem['status'],
    sort: it.sort ?? 0,
  }));
}

async function fromArticles(): Promise<RegistryItem[]> {
  const m = await bucketJson<{ items?: any[] }>('articles/manifest.json');
  return (m?.items ?? []).map(a => ({
    id: a.id,
    type: 'Blog' as const,
    title: a.title,
    description: a.description ?? '',
    topic: a.topic,
    tags: a.tags ?? [],
    href: `${CONTENT}/${a.file}`,
    external: true,
    openInNewTab: true,
    thumbnail: a.thumb ? `${CONTENT}/${a.thumb}` : undefined,
    accent: a.accent ?? '#46688f',
    featured: !!a.featured,
    status: (a.status ?? 'published') as RegistryItem['status'],
    sort: 0,
  }));
}

async function fromDatasets(): Promise<RegistryItem[]> {
  const m = await bucketJson<{ items?: any[] }>('datasets/manifest.json');
  return (m?.items ?? []).map(d => ({
    id: d.id,
    type: 'Dataset' as const,
    title: d.title,
    description: d.description ?? '',
    topic: d.topic,
    tags: d.tags?.length ? d.tags : ['dataset'],
    href: `/datasets/${d.id}`,
    external: false,
    openInNewTab: false,
    // Datasets have no preview image → a generated branded card (next/og).
    thumbnail: d.thumbnail ?? `/api/card/${d.id}`,
    accent: d.accent ?? '#46688f',
    featured: !!d.featured,
    status: (d.status ?? 'published') as RegistryItem['status'],
    sort: 0,
  }));
}

// ── Build derived set (sources + gallery.json curate as initial seed) ──────
function applyCurate(it: RegistryItem): RegistryItem {
  const c = curate[it.id];
  return c ? { ...it, ...c, tags: c.tags ?? it.tags } : it;
}

let sources: RegistryItem[];
try {
  sources = [...fromStudios(), ...fromApps(), ...(await fromArticles()), ...(await fromDatasets())];
} catch (e) {
  console.error(`Aborting sync — a content source failed to load (NOT treating as deletions): ${(e as Error).message}`);
  process.exit(1);
}
const seen = new Set<string>();
const derived: RegistryItem[] = [];
for (const it of sources) {
  if (seen.has(it.id)) { console.warn(`  ! duplicate id skipped: ${it.id}`); continue; }
  seen.add(it.id);
  derived.push(applyCurate(it));
}
console.log(`Derived ${derived.length} items: ` +
  (['Teaching', 'Blog', 'App', 'Dataset'] as RegistryType[]).map(t => `${t}=${derived.filter(d => d.type === t).length}`).join(' '));

// ── Turso connection ───────────────────────────────────────────────────────
// TURSO_AUTH_TOKEN may be a DB-scoped token (works directly) OR an org/platform
// API token (rejected by the DB endpoint with 401). In the latter case we mint a
// short-lived DB token via the Turso Platform API using the same token as Bearer.
async function bearer(platformToken: string, path: string, init?: RequestInit) {
  const r = await fetch(`https://api.turso.tech${path}`, { ...init, headers: { Authorization: `Bearer ${platformToken}`, ...(init?.headers ?? {}) } });
  if (!r.ok) throw new Error(`platform API ${path} → ${r.status}`);
  return r.json();
}
async function mintDbToken(platformToken: string, host: string): Promise<string> {
  const slug = (await bearer(platformToken, '/v1/organizations'))[0]?.slug;
  if (!slug) throw new Error('no organization slug from platform API');
  // The hostname is <db-name>-<org-slug>.<region>.turso.io, so resolve the real
  // DB name by matching the connection host against the org's database list.
  const dbs = (await bearer(platformToken, `/v1/organizations/${slug}/databases`)).databases ?? [];
  const match = dbs.find((d: any) => d.Hostname === host || d.hostname === host);
  const dbName = match?.Name ?? host.split('.')[0];
  const { jwt } = await bearer(platformToken, `/v1/organizations/${slug}/databases/${dbName}/auth/tokens?authorization=full-access&expiration=1d`, { method: 'POST' });
  return jwt as string;
}
async function connectTurso(url: string, token?: string) {
  const host = new URL(url.replace(/^libsql:/, 'https:')).host;
  if (token) {
    try { const c = createClient({ url, authToken: token }); await c.execute('SELECT 1'); return c; }
    catch { console.log('  · provided TURSO_AUTH_TOKEN rejected by DB — minting a DB-scoped token via the platform API…'); }
  }
  if (!token) throw new Error('TURSO_AUTH_TOKEN missing');
  const dbToken = await mintDbToken(token, host);
  const c = createClient({ url, authToken: dbToken });
  await c.execute('SELECT 1');
  console.log('  · minted DB token OK.');
  return c;
}

const url = process.env.TURSO_DATABASE_URL;
if (!url) { console.error('TURSO_DATABASE_URL missing — aborting.'); process.exit(1); }
const db = await connectTurso(url, process.env.TURSO_AUTH_TOKEN);

// CHECK constraints keep the table CMS-safe (only valid types/status/flags). An
// existing table is upgraded to these constraints by `pnpm migrate-gallery`.
await db.execute(`CREATE TABLE IF NOT EXISTS gallery (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('App','Teaching','Blog','Dataset')),
  title TEXT NOT NULL, description TEXT,
  domain TEXT, topic TEXT, tags TEXT, teaching TEXT, href TEXT NOT NULL,
  collection TEXT, part INTEGER,
  external INTEGER NOT NULL DEFAULT 0 CHECK (external IN (0,1)),
  open_in_new_tab INTEGER NOT NULL DEFAULT 0 CHECK (open_in_new_tab IN (0,1)),
  thumbnail TEXT, accent TEXT,
  featured INTEGER NOT NULL DEFAULT 0 CHECK (featured IN (0,1)),
  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('published','hidden','draft','unlisted')),
  sort INTEGER NOT NULL DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
)`);
// Older tables predate the timestamp columns — add them if missing (mirrors
// `pnpm migrate-timestamps`; SQLite ADD COLUMN can't take a non-constant default,
// so add nullable then backfill).
const cols = new Set((await db.execute('PRAGMA table_info(gallery)')).rows.map((r: any) => r.name));
for (const col of ['created_at', 'updated_at']) {
  if (!cols.has(col)) await db.execute(`ALTER TABLE gallery ADD COLUMN ${col} TEXT`);
}
// Collection membership (lib/collections.ts). Nullable and curated — never
// derived from source — so an existing table just gains two empty columns and
// nothing changes until rows are filed in /admin.
if (!cols.has('collection')) await db.execute('ALTER TABLE gallery ADD COLUMN collection TEXT');
if (!cols.has('part')) await db.execute('ALTER TABLE gallery ADD COLUMN part INTEGER');
// Home-page shelf order, curated by drag in /admin. Its own table because shelf
// order is a property of the topic, not of any row — including topics that have
// no rows yet. Created here as well as by the /admin write so the read path
// finds a table on a fresh database.
await db.execute(`CREATE TABLE IF NOT EXISTS topic_order (
  topic TEXT PRIMARY KEY,
  sort INTEGER NOT NULL
)`);
// A single timestamp for this run, in the DB's datetime('now') format (UTC,
// 'YYYY-MM-DD HH:MM:SS') so JS-set and SQL-default values are consistent.
const NOW = (await db.execute("SELECT datetime('now') AS now")).rows[0].now as string;

const existingRows = (await db.execute('SELECT * FROM gallery')).rows as any[];
const existing = new Map<string, any>(existingRows.map(r => [r.id as string, r]));
await db.execute("UPDATE gallery SET created_at = datetime('now') WHERE created_at IS NULL");
await db.execute("UPDATE gallery SET updated_at = datetime('now') WHERE updated_at IS NULL");

// CURATED columns (kept from Turso if the row exists) vs DERIVED (refreshed from source).
// `updated_at` only bumps when a persisted column actually changes, so it stays a
// meaningful "last content change" rather than "last sync".
//
// `collection` and `part` are curated by omission: they appear in neither the
// INSERT column list nor the ON CONFLICT SET list below, so a sync can't clear
// them and a new row simply starts NULL. Do NOT add them to that statement —
// collection membership has no source-of-truth outside Turso/admin.
const norm = (v: any) => (v === undefined ? null : v);
function rowChanged(prev: any, m: RegistryItem): boolean {
  return (
    prev.type !== m.type ||
    prev.title !== m.title ||
    (prev.description ?? '') !== (m.description ?? '') ||
    norm(prev.domain) !== norm(m.domain ?? null) ||
    norm(prev.topic) !== norm(m.topic ?? null) ||
    (prev.tags ?? '[]') !== JSON.stringify(m.tags ?? []) ||
    norm(prev.teaching) !== norm(m.teaching ?? null) ||
    prev.href !== m.href ||
    (prev.external ? 1 : 0) !== (m.external ? 1 : 0) ||
    (prev.open_in_new_tab ? 1 : 0) !== (m.openInNewTab ? 1 : 0) ||
    norm(prev.thumbnail) !== norm(m.thumbnail ?? null) ||
    norm(prev.accent) !== norm(m.accent ?? null) ||
    (prev.featured ? 1 : 0) !== (m.featured ? 1 : 0) ||
    prev.status !== m.status ||
    (prev.sort ?? 0) !== (m.sort ?? 0)
  );
}

let inserted = 0, refreshed = 0, touched = 0;
for (const d of derived) {
  const prev = existing.get(d.id);
  const merged: RegistryItem = prev
    ? {
        ...d,
        type: (prev.type as RegistryType) ?? d.type,
        title: prev.title ?? d.title,
        description: prev.description ?? d.description,
        topic: prev.topic ?? d.topic,
        tags: prev.tags ? JSON.parse(prev.tags) : d.tags,
        teaching: prev.teaching ?? d.teaching,
        featured: prev.featured != null ? !!prev.featured : d.featured,
        status: (prev.status as RegistryItem['status']) ?? d.status,
        sort: prev.sort ?? d.sort,
      }
    : d;
  const changed = !prev || rowChanged(prev, merged);
  const createdAt = prev?.created_at ?? NOW;
  const updatedAt = changed ? NOW : (prev?.updated_at ?? NOW);
  await db.execute({
    sql: `INSERT INTO gallery
      (id,type,title,description,domain,topic,tags,teaching,href,external,open_in_new_tab,thumbnail,accent,featured,status,sort,created_at,updated_at)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
      ON CONFLICT(id) DO UPDATE SET
        type=excluded.type, title=excluded.title, description=excluded.description,
        domain=excluded.domain, topic=excluded.topic, tags=excluded.tags, teaching=excluded.teaching,
        href=excluded.href, external=excluded.external, open_in_new_tab=excluded.open_in_new_tab,
        thumbnail=excluded.thumbnail, accent=excluded.accent, featured=excluded.featured,
        status=excluded.status, sort=excluded.sort,
        created_at=excluded.created_at, updated_at=excluded.updated_at`,
    args: [
      merged.id, merged.type, merged.title, merged.description ?? '', merged.domain ?? null,
      merged.topic ?? null, JSON.stringify(merged.tags ?? []), merged.teaching ?? null, merged.href,
      merged.external ? 1 : 0, merged.openInNewTab ? 1 : 0, merged.thumbnail ?? null, merged.accent,
      merged.featured ? 1 : 0, merged.status, merged.sort ?? 0, createdAt, updatedAt,
    ],
  });
  if (prev) { refreshed++; if (changed) touched++; } else inserted++;
}

// ── Auto-hide orphans (source file gone) so a deleted item can't leave a 404
// card. Soft-delete (status='hidden') preserves the row + its curation; restore
// by re-adding the source or flipping status back in /admin.
const orphanRows = existingRows.filter(r => !seen.has(r.id as string));
const orphans = orphanRows.map(r => r.id);
// Safety valve: refuse to auto-hide an implausibly large batch in one run — a
// belt-and-suspenders guard in case a source silently returned nothing despite
// the abort above. A real deletion touches one or two rows.
const MASS_HIDE_LIMIT = Math.max(5, Math.ceil(existingRows.length * 0.25));
let hidden = 0;
if (orphans.length > MASS_HIDE_LIMIT) {
  console.warn(`  ! REFUSING to auto-hide ${orphans.length} orphan(s) (limit ${MASS_HIDE_LIMIT}) — a content source likely failed to load. Nothing hidden. Orphans: ${orphans.join(', ')}`);
} else {
  for (const r of orphanRows) {
    if (r.status !== 'hidden') {
      await db.execute({ sql: "UPDATE gallery SET status='hidden', updated_at=datetime('now') WHERE id=?", args: [r.id] });
      hidden++;
    }
  }
}
console.log(`Turso: ${inserted} inserted, ${refreshed} refreshed (${touched} content-changed)${orphans.length ? `, ${orphans.length} orphan row(s) [${hidden} newly hidden]: ${orphans.join(', ')}` : ''}.`);

// ── Read back Turso → write committed snapshot ─────────────────────────────
const rows = (await db.execute('SELECT * FROM gallery ORDER BY featured DESC, sort ASC, title ASC')).rows as any[];
const items: RegistryItem[] = rows.map(r => ({
  id: r.id, type: r.type, title: r.title, description: r.description ?? '',
  domain: r.domain ?? undefined, topic: r.topic ?? undefined,
  tags: r.tags ? JSON.parse(r.tags) : [], teaching: r.teaching ?? undefined,
  // Collection membership is curated-only (never derived), but it still has to
  // reach the snapshot: scripts/inject-chrome.mjs reads the snapshot — not the
  // DB — to build the series navigation, so omitting these here silently means
  // no strip is ever injected.
  collection: r.collection ?? undefined,
  part: r.part == null ? undefined : Number(r.part),
  href: r.href, external: !!r.external, openInNewTab: !!r.open_in_new_tab,
  thumbnail: r.thumbnail ?? undefined, accent: r.accent ?? '#46688f',
  featured: !!r.featured, status: r.status, sort: r.sort ?? 0,
  createdAt: r.created_at ?? undefined, updatedAt: r.updated_at ?? undefined,
}));
// Shelf order travels with the items: without it a Turso outage would serve the
// gallery in vocabulary order, quietly undoing the curation for the duration.
const topicOrder = (await db.execute('SELECT topic FROM topic_order ORDER BY sort ASC')).rows.map(
  (r: any) => r.topic as string
);
const out = fileURLToPath(new URL('../content/registry.snapshot.json', import.meta.url));
await writeFile(out, JSON.stringify({
  _README: 'GENERATED by scripts/sync-registry.ts — do not hand-edit. Source of truth is the Turso `gallery` and `topic_order` tables; this is the committed fallback the app reads when Turso is unreachable. Re-generate: pnpm sync-registry.',
  generated: new Date().toISOString().slice(0, 10),
  count: items.length,
  topicOrder,
  items,
}, null, 2) + '\n', 'utf8');
console.log(`Snapshot written: ${items.length} items, ${topicOrder.length} ordered topics → content/registry.snapshot.json`);
process.exit(0);
