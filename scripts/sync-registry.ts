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
  status: 'published' | 'hidden' | 'draft';
  sort: number;
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
    const r = await s3.send(new GetObjectCommand({ Bucket: 'vishal', Key: key }));
    return JSON.parse(await r.Body!.transformToString()) as T;
  } catch (e) {
    console.warn(`  ! could not read vishal:${key} — ${(e as Error).message}`);
    return null;
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
    tags: a.tags?.length ? a.tags : ['data story'],
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
    thumbnail: undefined,
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

const sources = [...fromStudios(), ...fromApps(), ...(await fromArticles()), ...(await fromDatasets())];
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

await db.execute(`CREATE TABLE IF NOT EXISTS gallery (
  id TEXT PRIMARY KEY, type TEXT NOT NULL, title TEXT NOT NULL, description TEXT,
  domain TEXT, topic TEXT, tags TEXT, teaching TEXT, href TEXT NOT NULL,
  external INTEGER NOT NULL DEFAULT 0, open_in_new_tab INTEGER NOT NULL DEFAULT 0,
  thumbnail TEXT, accent TEXT, featured INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'published', sort INTEGER NOT NULL DEFAULT 0
)`);

const existingRows = (await db.execute('SELECT * FROM gallery')).rows as any[];
const existing = new Map<string, any>(existingRows.map(r => [r.id as string, r]));

// CURATED columns (kept from Turso if the row exists) vs DERIVED (refreshed from source).
let inserted = 0, refreshed = 0;
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
  await db.execute({
    sql: `INSERT INTO gallery
      (id,type,title,description,domain,topic,tags,teaching,href,external,open_in_new_tab,thumbnail,accent,featured,status,sort)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
      ON CONFLICT(id) DO UPDATE SET
        type=excluded.type, title=excluded.title, description=excluded.description,
        domain=excluded.domain, topic=excluded.topic, tags=excluded.tags, teaching=excluded.teaching,
        href=excluded.href, external=excluded.external, open_in_new_tab=excluded.open_in_new_tab,
        thumbnail=excluded.thumbnail, accent=excluded.accent, featured=excluded.featured,
        status=excluded.status, sort=excluded.sort`,
    args: [
      merged.id, merged.type, merged.title, merged.description ?? '', merged.domain ?? null,
      merged.topic ?? null, JSON.stringify(merged.tags ?? []), merged.teaching ?? null, merged.href,
      merged.external ? 1 : 0, merged.openInNewTab ? 1 : 0, merged.thumbnail ?? null, merged.accent,
      merged.featured ? 1 : 0, merged.status, merged.sort ?? 0,
    ],
  });
  if (prev) refreshed++; else inserted++;
}
const orphans = existingRows.filter(r => !seen.has(r.id as string)).map(r => r.id);
console.log(`Turso: ${inserted} inserted, ${refreshed} refreshed${orphans.length ? `, ${orphans.length} orphan rows kept (not in sources): ${orphans.join(', ')}` : ''}.`);

// ── Read back Turso → write committed snapshot ─────────────────────────────
const rows = (await db.execute('SELECT * FROM gallery ORDER BY featured DESC, sort ASC, title ASC')).rows as any[];
const items: RegistryItem[] = rows.map(r => ({
  id: r.id, type: r.type, title: r.title, description: r.description ?? '',
  domain: r.domain ?? undefined, topic: r.topic ?? undefined,
  tags: r.tags ? JSON.parse(r.tags) : [], teaching: r.teaching ?? undefined,
  href: r.href, external: !!r.external, openInNewTab: !!r.open_in_new_tab,
  thumbnail: r.thumbnail ?? undefined, accent: r.accent ?? '#46688f',
  featured: !!r.featured, status: r.status, sort: r.sort ?? 0,
}));
const out = fileURLToPath(new URL('../content/registry.snapshot.json', import.meta.url));
await writeFile(out, JSON.stringify({
  _README: 'GENERATED by scripts/sync-registry.ts — do not hand-edit. Source of truth is the Turso `gallery` table; this is the committed fallback the app reads when Turso is unreachable. Re-generate: pnpm sync-registry.',
  generated: new Date().toISOString().slice(0, 10),
  count: items.length,
  items,
}, null, 2) + '\n', 'utf8');
console.log(`Snapshot written: ${items.length} items → content/registry.snapshot.json`);
process.exit(0);
