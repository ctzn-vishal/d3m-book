/**
 * pnpm social-drafts — generate DRAFT social posts (X / LinkedIn / Instagram)
 * for a small batch of stories and queue them in the Turso `social_queue` table
 * for human review at /admin/social. Level-2 automation: the machine drafts,
 * the human approves, a scheduler posts (scripts/social-deliver.mjs).
 *
 *   pnpm social-drafts                    # pick BATCH stories, draft 3 posts each, queue as 'draft'
 *   BATCH=5 pnpm social-drafts            # bigger batch (default 3)
 *   ONLY=five-subway-stops pnpm ...       # draft for specific item id(s), ignoring the picker
 *   DRY=1 pnpm social-drafts              # generate + print + write JSON, but skip the DB insert
 *   SOCIAL_MODEL=claude-opus-4-8 ...      # default: claude-sonnet-5
 *
 * Candidate policy lives in scripts/social-pick.ts (new stories first, then
 * evergreen rotation, topic-diverse, 60-day cooldown). The voice/format rules
 * live in content/social-voice.md — edit THAT file to steer the drafts.
 * Needs ANTHROPIC_API_KEY + TURSO_* in book-template/.env.local (or CI secrets).
 */
import Anthropic from '@anthropic-ai/sdk';
import { createClient, type Client } from '@libsql/client';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { pickCandidates, type QueueRowLite } from './social-pick';
import type { RegistryItem } from '../lib/registry-types';

const BATCH = Number(process.env.BATCH || '3') || 3;
const COOLDOWN_DAYS = Number(process.env.COOLDOWN_DAYS || '60') || 60;
const ONLY = (process.env.ONLY || '').split(',').map(s => s.trim()).filter(Boolean);
const DRY = process.env.DRY === '1';
const MODEL = process.env.SOCIAL_MODEL || 'claude-sonnet-5';
const OUT_DIR = fileURLToPath(new URL('./.social/', import.meta.url));

const PLATFORMS = ['x', 'linkedin', 'instagram'] as const;
type Platform = (typeof PLATFORMS)[number];
/** Soft length ceilings surfaced as warnings (the human edits in /admin/social). */
const MAX_LEN: Record<Platform, number> = { x: 275, linkedin: 3000, instagram: 2200 };

// ── Turso connect (direct token, else mint a DB-scoped token — same as curate-new) ──
async function bearer(token: string, path: string, init?: RequestInit): Promise<any> {
  const r = await fetch(`https://api.turso.tech${path}`, { ...init, headers: { Authorization: `Bearer ${token}`, ...(init?.headers ?? {}) } });
  if (!r.ok) throw new Error(`platform API ${path} → ${r.status}`);
  return r.json();
}
async function mint(token: string, host: string): Promise<string> {
  const slug = (await bearer(token, '/v1/organizations'))[0]?.slug;
  const dbs = (await bearer(token, `/v1/organizations/${slug}/databases`)).databases ?? [];
  const m = dbs.find((d: any) => d.Hostname === host || d.hostname === host);
  const dbName = m?.Name ?? host.split('.')[0];
  const { jwt } = await bearer(token, `/v1/organizations/${slug}/databases/${dbName}/auth/tokens?authorization=full-access&expiration=1d`, { method: 'POST' });
  return jwt as string;
}
async function connect(): Promise<Client> {
  const url = process.env.TURSO_DATABASE_URL;
  if (!url) throw new Error('TURSO_DATABASE_URL missing');
  const token = process.env.TURSO_AUTH_TOKEN;
  const host = new URL(url.replace(/^libsql:/, 'https:')).host;
  if (token) { try { const c = createClient({ url, authToken: token }); await c.execute('SELECT 1'); return c; } catch { /* fall through to mint */ } }
  if (!token) throw new Error('TURSO_AUTH_TOKEN missing');
  const c = createClient({ url, authToken: await mint(token, host) });
  await c.execute('SELECT 1');
  return c;
}

/** The review queue. `status` flows draft → approved → posted (or rejected).
 *  Rows are only ever inserted here and status-patched in /admin/social. */
const CREATE_QUEUE = `CREATE TABLE IF NOT EXISTS social_queue (
  id TEXT PRIMARY KEY,
  item_id TEXT NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('x','linkedin','instagram')),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','approved','posted','rejected')),
  text TEXT NOT NULL,
  link_url TEXT NOT NULL,
  image_url TEXT,
  hook TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  posted_at TEXT
)`;

function rowToItem(r: Record<string, any>): RegistryItem {
  return {
    id: String(r.id), type: r.type, title: String(r.title ?? ''), description: String(r.description ?? ''),
    topic: r.topic ?? undefined, tags: r.tags ? JSON.parse(r.tags) : [], href: String(r.href ?? ''),
    external: !!r.external, thumbnail: r.thumbnail ?? undefined, accent: r.accent ?? '#46688f',
    featured: !!r.featured, status: r.status, sort: r.sort ?? 0,
    createdAt: r.created_at ?? undefined, updatedAt: r.updated_at ?? undefined,
  };
}

async function fetchArticleText(href: string): Promise<string> {
  const res = await fetch(href, { headers: { 'user-agent': 'social-drafts/1.0' } });
  if (!res.ok) throw new Error(`fetch ${res.status}`);
  let html = await res.text();
  html = html.replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<aside data-vs-related[\s\S]*?<\/aside>/gi, ' '); // don't feed the injected footer back in
  const title = (html.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1] || '';
  const text = html.replace(/<[^>]+>/g, ' ').replace(/&[a-z#0-9]+;/gi, ' ').replace(/\s+/g, ' ').trim();
  return (title ? `TITLE: ${title}\n\n` : '') + text.slice(0, 12000);
}

function utm(href: string, platform: Platform, itemId: string): string {
  const sep = href.includes('?') ? '&' : '?';
  return `${href}${sep}utm_source=${platform}&utm_medium=social&utm_campaign=${encodeURIComponent(itemId)}`;
}

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const DRAFT_TOOL: Anthropic.Tool = {
  name: 'submit_drafts',
  description: 'Record the drafted social posts for this data story.',
  input_schema: {
    type: 'object',
    properties: {
      hook: { type: 'string', description: 'The single most striking finding, one sentence — the angle all three posts share.' },
      x: { type: 'string', description: 'The X post. ≤ 270 characters, no hashtags, no URL (the link is posted as a reply).' },
      linkedin: { type: 'string', description: 'The LinkedIn post. 700–1200 characters, short paragraphs separated by blank lines, no URL in the body, ≤3 hashtags at the very end or none.' },
      instagram: { type: 'string', description: 'The Instagram caption. ≤ 1500 characters; first line is a standalone hook; end with "Full interactive story — link in bio" and 3–5 specific hashtags.' },
    },
    required: ['hook', 'x', 'linkedin', 'instagram'],
  },
};

type Drafts = { hook: string; x: string; linkedin: string; instagram: string };

async function draft(item: RegistryItem, articleText: string, voice: string): Promise<Drafts> {
  const msg = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 1600,
    tools: [DRAFT_TOOL],
    tool_choice: { type: 'tool', name: 'submit_drafts' },
    messages: [{
      role: 'user',
      content: `Draft social posts for this data story, following the voice guide exactly.

${voice}

STORY METADATA
Title: ${item.title}
Description: ${item.description}
Topic: ${item.topic ?? '—'}
Tags: ${item.tags.join(', ') || '—'}

ARTICLE TEXT (numbers in your posts MUST come from here):
${articleText}

Call submit_drafts with one post per platform. Each post must center the same core finding (the hook) but be written natively for its platform — not the same text trimmed three ways.`,
    }],
  });
  const block = msg.content.find(b => b.type === 'tool_use');
  const out = (block && block.type === 'tool_use' ? block.input : {}) as Partial<Drafts>;
  if (!out.x || !out.linkedin || !out.instagram) throw new Error('model returned incomplete drafts');
  return { hook: out.hook ?? '', x: out.x, linkedin: out.linkedin, instagram: out.instagram };
}

// ── Main ────────────────────────────────────────────────────────────────────
if (!process.env.ANTHROPIC_API_KEY) {
  console.error('ANTHROPIC_API_KEY missing — add it to book-template/.env.local (or the repo Actions secrets).');
  process.exit(1);
}

const db = await connect();
await db.execute(CREATE_QUEUE);

const galleryRows = (await db.execute('SELECT * FROM gallery')).rows as unknown as Record<string, any>[];
const items = galleryRows.map(rowToItem);
const queueRows = (await db.execute('SELECT item_id, status, created_at, posted_at FROM social_queue')).rows as unknown as QueueRowLite[];

const picks = ONLY.length
  ? items.filter(i => ONLY.includes(i.id))
  : pickCandidates(items, queueRows, { batch: BATCH, cooldownDays: COOLDOWN_DAYS });

if (!picks.length) { console.log('No candidates to draft (all pending, cooling down, or ineligible).'); process.exit(0); }
console.log(`Drafting ${picks.length} stor${picks.length === 1 ? 'y' : 'ies'} × ${PLATFORMS.length} platforms via ${MODEL}:`);
for (const p of picks) console.log(`  · ${p.id}  [${p.topic ?? 'no topic'}]`);

const voice = await readFile(fileURLToPath(new URL('../content/social-voice.md', import.meta.url)), 'utf8');
const day = new Date().toISOString().slice(0, 10);
const stamp = day.replace(/-/g, '');

type QueueInsert = { id: string; item_id: string; platform: Platform; text: string; link_url: string; image_url: string | null; hook: string };
const inserts: QueueInsert[] = [];
let failed = 0;

for (const item of picks) {
  try {
    const text = await fetchArticleText(item.href);
    const d = await draft(item, text, voice);
    for (const platform of PLATFORMS) {
      const body = d[platform];
      if (body.length > MAX_LEN[platform]) {
        console.warn(`  ! ${item.id}/${platform}: ${body.length} chars exceeds ${MAX_LEN[platform]} — edit before approving.`);
      }
      inserts.push({
        id: `${item.id}:${platform}:${stamp}`,
        item_id: item.id,
        platform,
        text: body,
        link_url: utm(item.href, platform, item.id),
        image_url: item.thumbnail ?? null,
        hook: d.hook,
      });
    }
    console.log(`  ✓ ${item.id} — "${d.hook.slice(0, 90)}"`);
  } catch (e) {
    failed++;
    console.warn(`  ! ${item.id}: ${(e as Error).message}`);
  }
}

if (!inserts.length) { console.error('No drafts generated.'); process.exit(1); }

await mkdir(OUT_DIR, { recursive: true });
await writeFile(`${OUT_DIR}drafts-${day}.json`, JSON.stringify(inserts, null, 2));

if (DRY) {
  console.log(`\nDRY — ${inserts.length} draft(s) written to scripts/.social/drafts-${day}.json only (no DB insert).`);
} else {
  let queued = 0;
  for (const q of inserts) {
    const res = await db.execute({
      sql: `INSERT INTO social_queue (id, item_id, platform, text, link_url, image_url, hook)
            VALUES (?,?,?,?,?,?,?) ON CONFLICT(id) DO NOTHING`,
      args: [q.id, q.item_id, q.platform, q.text, q.link_url, q.image_url, q.hook],
    });
    if (res.rowsAffected) queued++;
  }
  console.log(`\n✓ Queued ${queued}/${inserts.length} draft(s)${failed ? ` (${failed} stor${failed === 1 ? 'y' : 'ies'} failed)` : ''} → review at vishalsingh.org/admin/social`);
}
process.exit(0);
