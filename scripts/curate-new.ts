/**
 * pnpm curate-new — auto-curate gallery rows that are missing a topic or still
 * carry empty/generic tags. Reads each item's published HTML, asks Claude to
 * propose a topic (from lib/taxonomy TOPICS) + tags (from lib/tag-vocabulary)
 * constrained to those controlled vocabularies, and writes a review file. With
 * APPLY=1 it writes the (reviewed) proposals to Turso.
 *
 *   pnpm curate-new                       # DRY: propose → scripts/.curate/proposals.json + table
 *   APPLY=1 pnpm curate-new               # write the reviewed proposals to Turso
 *   ONLY=a,b pnpm curate-new              # only these ids (ignores the needs-curation filter)
 *   LIMIT=10 pnpm curate-new              # cap how many items to propose
 *   CURATE_MODEL=claude-opus-4-8 pnpm curate-new   # default: claude-sonnet-4-6
 *
 * Needs ANTHROPIC_API_KEY in book-template/.env.local. After APPLY, run
 * `pnpm sync-registry` to refresh the committed snapshot.
 */
import Anthropic from '@anthropic-ai/sdk';
import { createClient, type Client } from '@libsql/client';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { TOPICS } from '../lib/taxonomy';
import { TAG_VOCABULARY } from '../lib/tag-vocabulary';
import { needsCuration } from '../lib/curation';

const APPLY = process.env.APPLY === '1';
const ONLY = (process.env.ONLY || '').split(',').map(s => s.trim()).filter(Boolean);
const LIMIT = Number(process.env.LIMIT || '0') || Infinity;
const MODEL = process.env.CURATE_MODEL || 'claude-haiku-4-5-20251001';
const PROPOSALS = fileURLToPath(new URL('./.curate/proposals.json', import.meta.url));

const ALL_TAGS = TAG_VOCABULARY.map(t => t.tag);
const TAG_SET = new Set<string>(ALL_TAGS);
const TOPIC_SET = new Set<string>(TOPICS);

interface Row { id: string; type: string; title: string; topic: string | null; tags: string[]; href: string }
interface Proposal {
  id: string; title: string; href: string;
  currentTopic: string | null; currentTags: string[];
  topic: string; tags: string[]; confidence: string; rationale: string; newTopicSuggestion?: string;
}

function parseTags(raw: unknown): string[] {
  if (Array.isArray(raw)) return raw.map(String);
  if (typeof raw === 'string') { try { const a = JSON.parse(raw); return Array.isArray(a) ? a.map(String) : []; } catch { return []; } }
  return [];
}

// ── Turso connect (direct token, else mint a DB-scoped token) ──────────────
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

async function fetchArticleText(href: string): Promise<string> {
  const res = await fetch(href, { headers: { 'user-agent': 'curate-new/1.0' } });
  if (!res.ok) throw new Error(`fetch ${res.status}`);
  let html = await res.text();
  html = html.replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ');
  const title = (html.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1] || '';
  const text = html.replace(/<[^>]+>/g, ' ').replace(/&[a-z#0-9]+;/gi, ' ').replace(/\s+/g, ' ').trim();
  return (title ? `TITLE: ${title}\n\n` : '') + text.slice(0, 12000);
}

const TAG_LIST_TEXT = (['method', 'chart', 'data'] as const)
  .map(f => `${f.toUpperCase()}: ${TAG_VOCABULARY.filter(t => t.facet === f).map(t => t.tag).join(', ')}`)
  .join('\n');

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const CURATION_TOOL: Anthropic.Tool = {
  name: 'propose_curation',
  description: 'Record the proposed subject topic and tags for the gallery item.',
  input_schema: {
    type: 'object',
    properties: {
      topic: { type: 'string', enum: [...TOPICS], description: 'The single best-fit subject.' },
      tags: { type: 'array', items: { type: 'string', enum: ALL_TAGS }, description: '3–6 tags from the vocabulary, most distinctive first, spanning method/chart/data. Do NOT restate the subject.' },
      confidence: { type: 'string', enum: ['high', 'medium', 'low'] },
      rationale: { type: 'string', description: 'One sentence, grounded in the text.' },
      newTopicSuggestion: { type: 'string', description: 'If NONE of the listed topics fit well, a short proposed NEW subject topic (1–3 words). Omit when an existing topic fits.' },
    },
    required: ['topic', 'tags', 'confidence', 'rationale'],
  },
};

async function propose(row: Row, text: string): Promise<Proposal> {
  const msg = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 700,
    tools: [CURATION_TOOL],
    tool_choice: { type: 'tool', name: 'propose_curation' },
    messages: [{
      role: 'user',
      content: `Classify this data-visualization gallery item so its topic and tags are useful filters.

ITEM TITLE: ${row.title}

SUBJECT TOPICS — pick exactly ONE: ${TOPICS.join(', ')}
(If none truly fit, still pick the closest AND set newTopicSuggestion to a short proposed new subject — the topic list is meant to grow.)

TAG VOCABULARY — pick 3–6, exactly as written, spanning facets (do NOT restate the subject as a tag):
${TAG_LIST_TEXT}

ARTICLE TEXT:
${text}

Call propose_curation with the single best-fit topic and the tags.`,
    }],
  });
  const block = msg.content.find(b => b.type === 'tool_use');
  const out = (block && block.type === 'tool_use' ? block.input : {}) as { topic?: string; tags?: string[]; confidence?: string; rationale?: string; newTopicSuggestion?: string };
  const topic = out.topic && TOPIC_SET.has(out.topic) ? out.topic : 'Other';
  const tags = (out.tags ?? []).filter(t => TAG_SET.has(t)).slice(0, 6);
  return { id: row.id, title: row.title, href: row.href, currentTopic: row.topic, currentTags: row.tags, topic, tags, confidence: out.confidence ?? 'low', rationale: out.rationale ?? '', newTopicSuggestion: out.newTopicSuggestion };
}

async function applyProposals(db: Client): Promise<void> {
  let proposals: Proposal[];
  try { proposals = JSON.parse(await readFile(PROPOSALS, 'utf8')); }
  catch { console.error(`No reviewed proposals at scripts/.curate/proposals.json — run \`pnpm curate-new\` (DRY) first.`); process.exitCode = 1; return; }
  let n = 0;
  for (const p of proposals) {
    const badTopic = !TOPIC_SET.has(p.topic);
    const badTags = !p.tags?.length || p.tags.some(t => !TAG_SET.has(t));
    if (badTopic || badTags) { console.warn(`  skip ${p.id}: ${badTopic ? 'topic not in vocabulary' : ''}${badTags ? ' tags empty/not in vocabulary' : ''}`); continue; }
    const res = await db.execute({ sql: "UPDATE gallery SET topic = ?, tags = ?, updated_at = datetime('now') WHERE id = ?", args: [p.topic, JSON.stringify(p.tags), p.id] });
    if (res.rowsAffected) n++;
  }
  console.log(`\n✓ Applied ${n}/${proposals.length} curations to Turso. Now run:  pnpm sync-registry`);
}

async function dryRun(db: Client): Promise<void> {
  const rs = await db.execute({ sql: 'SELECT id, type, title, topic, tags, href FROM gallery WHERE status = ?', args: ['published'] });
  let rows: Row[] = rs.rows.map(r => ({
    id: String(r.id), type: String(r.type), title: String(r.title ?? ''),
    topic: r.topic == null ? null : String(r.topic), tags: parseTags(r.tags), href: String(r.href ?? ''),
  }));
  rows = rows.filter(r => /^https?:\/\/.*\.html?$/i.test(r.href)); // fetchable article/studio/app HTML
  const targets = (ONLY.length ? rows.filter(r => ONLY.includes(r.id)) : rows.filter(needsCuration)).slice(0, LIMIT);

  console.log(`${targets.length} item(s) to curate${ONLY.length ? ' (ONLY)' : ' — missing topic or generic tags'}:`);
  for (const t of targets) console.log(`  · ${t.id}  [topic: ${t.topic ?? '—'} | tags: ${t.tags.join(', ') || '—'}]`);
  if (!targets.length) { console.log('Nothing to curate.'); return; }

  if (!process.env.ANTHROPIC_API_KEY) {
    console.log('\nAdd ANTHROPIC_API_KEY to book-template/.env.local to generate topic/tag proposals.');
    return;
  }
  console.log(`\nProposing via ${MODEL}…\n`);
  const proposals: Proposal[] = [];
  for (const row of targets) {
    try {
      const text = await fetchArticleText(row.href);
      const p = await propose(row, text);
      proposals.push(p);
      console.log(`• ${p.id}\n    topic: ${p.currentTopic ?? '—'} → ${p.topic}${p.newTopicSuggestion ? `   (✦ suggests new topic: ${p.newTopicSuggestion})` : ''}\n    tags:  ${p.tags.join(' · ')}   [${p.confidence}]`);
    } catch (e) { console.warn(`  ! ${row.id}: ${(e as Error).message}`); }
  }
  await mkdir(fileURLToPath(new URL('./.curate/', import.meta.url)), { recursive: true });
  await writeFile(PROPOSALS, JSON.stringify(proposals, null, 2));
  console.log(`\nWrote ${proposals.length} proposal(s) → scripts/.curate/proposals.json`);
  console.log('Review/edit that file, then:  APPLY=1 pnpm curate-new   (then pnpm sync-registry)');
}

const db = await connect();
if (APPLY) await applyProposals(db);
else await dryRun(db);
