// Rebuild vishal:articles/manifest.json from whatever HTML is in vishal/articles/.
// THIS is the going-forward refresh tool: drop new <slug>.html (+ <slug>/_thumb.webp)
// into the bucket, run this, and the gallery picks them up (ISR / /api/revalidate).
// Curation in the existing manifest (title/description/topic/tags/featured/status)
// is PRESERVED; only brand-new files get auto-extracted metadata.
// Run: pnpm rebuild-manifest   (node --env-file=../.env scripts/rebuild-manifest.mjs)
import { S3Client, ListObjectsV2Command, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';

const client = new S3Client({
  region: process.env.AWS_REGION || 'auto',
  endpoint: process.env.TIGRIS_ENDPOINT,
  credentials: { accessKeyId: process.env.TIGRIS_CLIENT_ID, secretAccessKey: process.env.TIGRIS_CLIENT_SECRET },
  forcePathStyle: false,
});
const DST = 'vishal';
const PREFIX = 'articles';

// Topic is no longer guessed from the slug (the old keyword heuristic only knew a
// few of the canonical topics and mis-filed pieces). New articles are created with
// NO topic; set it once in /admin (it's a curated column, so it sticks). See
// lib/taxonomy.ts for the controlled vocabulary.
function titleCase(slug) { return slug.replace(/[-_]+/g, ' ').replace(/\b\w/g, c => c.toUpperCase()); }
function decodeEntities(s) {
  return s
    .replace(/&#39;|&#x27;|&rsquo;|&#8217;/g, '’').replace(/&lsquo;|&#8216;/g, '‘')
    .replace(/&quot;|&#34;|&ldquo;|&#8220;/g, '“').replace(/&rdquo;|&#8221;/g, '”')
    .replace(/&mdash;|&#8212;/g, '—').replace(/&ndash;|&#8211;/g, '–').replace(/&hellip;|&#8230;/g, '…')
    .replace(/&nbsp;/g, ' ').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&#(\d+);/g, (_, n) => { try { return String.fromCodePoint(+n); } catch { return _; } })
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => { try { return String.fromCodePoint(parseInt(n, 16)); } catch { return _; } })
    .replace(/&amp;/g, '&');
}
function extractMeta(html, slug) {
  let title = (html.match(/<title[^>]*>([^<]*)<\/title>/i) || [])[1]?.trim() || titleCase(slug);
  let desc =
    (html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i) || [])[1]?.trim() ||
    (html.match(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']*)["']/i) || [])[1]?.trim();
  if (!desc) {
    const body = html.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<style[\s\S]*?<\/style>/gi, '');
    for (const m of body.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)) {
      const txt = m[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
      if (txt.length > 60) { desc = txt; break; }
    }
  }
  title = decodeEntities(title); desc = decodeEntities(desc || '');
  if (desc.length > 240) desc = desc.slice(0, 237).trimEnd() + '…';
  return { title, description: desc };
}
async function listAll(Bucket, Prefix) {
  let t; const out = [];
  do { const r = await client.send(new ListObjectsV2Command({ Bucket, Prefix, ContinuationToken: t })); (r.Contents || []).forEach(o => out.push(o.Key)); t = r.IsTruncated ? r.NextContinuationToken : undefined; } while (t);
  return out;
}
async function getText(Bucket, Key) { const r = await client.send(new GetObjectCommand({ Bucket, Key })); return r.Body.transformToString(); }

const keys = await listAll(DST, `${PREFIX}/`);
const allHtmlSlugs = keys.filter(k => new RegExp(`^${PREFIX}/[^/]+\\.html$`).test(k)).map(k => k.slice(PREFIX.length + 1, -5)).sort();
const thumbSlugs = new Set(keys.filter(k => k.endsWith('/_thumb.webp')).map(k => k.slice(PREFIX.length + 1).replace(/\/_thumb\.webp$/, '')));

// ── Slug / filename validation (catches the ways a mis-named upload breaks the gallery) ──
// 1. Skip reserved filenames (index.html, manifest.html) — they aren't stories.
const RESERVED = new Set(['index', 'manifest']);
const reserved = allHtmlSlugs.filter(s => RESERVED.has(s.toLowerCase()));
const htmlSlugs = allHtmlSlugs.filter(s => !RESERVED.has(s.toLowerCase()));
if (reserved.length) console.warn(`  ! skipped reserved filename(s): ${reserved.map(s => `${PREFIX}/${s}.html`).join(', ')}`);
// 2. Warn on non-kebab slugs (underscores / uppercase drift from the URL convention).
const nonKebab = htmlSlugs.filter(s => /[^a-z0-9-]/.test(s));
if (nonKebab.length) console.warn(`  ! non-kebab slug(s) (rename to lowercase-kebab): ${nonKebab.join(', ')}`);

let existing = {};
try { const m = JSON.parse(await getText(DST, `${PREFIX}/manifest.json`)); (m.items || []).forEach(it => { existing[it.id] = it; }); } catch { /* first run */ }
// 3. Existing title → id, to flag a brand-new file that duplicates an existing title
//    (the signature of a mis-named re-upload of content that's already in the gallery).
const titleToId = new Map();
for (const it of Object.values(existing)) if (it.title) titleToId.set(String(it.title).trim().toLowerCase(), it.id);

const items = []; let added = 0; const needTopic = [];
for (const slug of htmlSlugs) {
  const thumb = thumbSlugs.has(slug) ? `${PREFIX}/${slug}/_thumb.webp` : null;
  if (existing[slug]) {
    items.push({ ...existing[slug], file: `${PREFIX}/${slug}.html`, thumb }); // preserve curation; refresh file/thumb
  } else {
    added++;
    let meta; try { meta = extractMeta(await getText(DST, `${PREFIX}/${slug}.html`), slug); } catch { meta = { title: titleCase(slug), description: '' }; }
    const norm = meta.title.trim().toLowerCase();
    const dupOf = titleToId.get(norm);
    if (dupOf && dupOf !== slug) console.warn(`  ! "${slug}" has the same <title> as "${dupOf}" — possible mis-named re-upload?`);
    if (norm) titleToId.set(norm, slug); // so a later new file with the same title is flagged against this one too
    needTopic.push(slug);
    items.push({ id: slug, type: 'article', title: meta.title, description: meta.description, tags: ['data story'], file: `${PREFIX}/${slug}.html`, thumb, accent: '#46688f', featured: false, status: 'published' });
  }
}
const removed = Object.keys(existing).filter(id => !htmlSlugs.includes(id));
if (needTopic.length) console.warn(`  · ${needTopic.length} new article(s) created with no topic — set it in /admin: ${needTopic.join(', ')}`);

const manifest = { _README: existing.__readme || 'Article registry for the vishalsingh.org gallery. Edit to curate (status: published|hidden, featured, topic, tags, title, description). Hub reads via ISR; paths relative to the content base URL.', generated: new Date().toISOString().slice(0, 10), count: items.length, items };
await client.send(new PutObjectCommand({ Bucket: DST, Key: `${PREFIX}/manifest.json`, Body: JSON.stringify(manifest, null, 2), ContentType: 'application/json', CacheControl: 'public, max-age=60' }));
console.log(`Manifest rebuilt: ${items.length} items (${added} new, ${removed.length} removed${removed.length ? ': ' + removed.join(', ') : ''}).`);
