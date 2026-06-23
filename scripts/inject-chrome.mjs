// Inject hub chrome into the self-contained HTML in the vishal bucket — the
// data stories (articles/*.html), the studios (studios/**/*.html), and the
// self-hosted apps (apps/**/*.html):
//   1. a fixed "↖︎ Vishal Singh" home pill (reads ?from=<chapter-slug> → "← Back
//      to the book"), and
//   2. social/SEO <head> tags — og:*, twitter:*, and <link rel="canonical"> —
//      sourced per-file from content/registry.snapshot.json (title/description/
//      thumbnail/canonical url). Run `pnpm sync-registry` first so the snapshot
//      is current.
// Idempotent: each concern has its own marker, so re-runs skip what's done and
// can add a newly-available concern (e.g. OG) to a file that already has the pill.
// Run: pnpm inject-chrome   (node --env-file=../.env scripts/inject-chrome.mjs)
import { S3Client, ListObjectsV2Command, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const client = new S3Client({
  region: process.env.AWS_REGION || 'auto',
  endpoint: process.env.TIGRIS_ENDPOINT,
  credentials: { accessKeyId: process.env.TIGRIS_CLIENT_ID, secretAccessKey: process.env.TIGRIS_CLIENT_SECRET },
  forcePathStyle: false,
});
const DST = 'vishal';
const PREFIXES = ['articles', 'studios', 'apps'];
const HOME = 'https://vishalsingh.org/';
const MARKER = 'data-vs-chrome';   // home pill
const OGM = 'data-vs-og';          // social/SEO head tags

// ── Home pill (reads ?from=<chapter-slug>; points back to that chapter else home) ──
const SNIPPET = `
<a href="${HOME}" ${MARKER} aria-label="Back to vishalsingh.org" style="position:fixed!important;top:12px!important;left:12px!important;z-index:2147483646!important;display:inline-flex!important;align-items:center!important;gap:6px!important;margin:0!important;padding:6px 12px!important;border-radius:999px!important;background:rgba(255,255,255,.92)!important;-webkit-backdrop-filter:saturate(180%) blur(8px);backdrop-filter:saturate(180%) blur(8px);border:1px solid #e4dcd0!important;box-shadow:0 1px 2px rgba(40,30,20,.12)!important;font:600 12px/1 ui-sans-serif,system-ui,-apple-system,'Segoe UI',sans-serif!important;color:#1c1a17!important;text-decoration:none!important">↖︎ Vishal Singh</a>
<script ${MARKER}>(function(){try{var f=new URLSearchParams(location.search).get('from');if(f&&/^[a-z0-9-]+$/.test(f)){var a=document.querySelector('a[${MARKER}]');if(a){a.href='${HOME}'+f;a.lastChild.textContent='← Back to the book';}}}catch(e){}})();</script>`;

// ── Per-file OG/canonical metadata from the committed registry snapshot ──
const snap = JSON.parse(await readFile(fileURLToPath(new URL('../content/registry.snapshot.json', import.meta.url)), 'utf8'));
const metaByKey = new Map();
for (const it of snap.items ?? []) {
  if (typeof it.href === 'string' && /^https?:\/\//.test(it.href) && it.href.endsWith('.html')) {
    try { metaByKey.set(new URL(it.href).pathname.replace(/^\//, ''), { title: it.title, description: it.description, image: it.thumbnail, url: it.href }); } catch { /* skip */ }
  }
}
const esc = s => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
function ogBlock(m) {
  const img = m.image
    ? `\n<meta property="og:image" content="${esc(m.image)}" ${OGM}><meta name="twitter:image" content="${esc(m.image)}" ${OGM}>`
    : '';
  return `\n<link rel="canonical" href="${esc(m.url)}" ${OGM}>`
    + `\n<meta property="og:type" content="article" ${OGM}>`
    + `\n<meta property="og:site_name" content="Vishal Singh" ${OGM}>`
    + `\n<meta property="og:title" content="${esc(m.title)}" ${OGM}>`
    + `\n<meta property="og:description" content="${esc(m.description)}" ${OGM}>`
    + `\n<meta property="og:url" content="${esc(m.url)}" ${OGM}>`
    + `\n<meta name="twitter:card" content="summary_large_image" ${OGM}>`
    + `\n<meta name="twitter:title" content="${esc(m.title)}" ${OGM}>`
    + `\n<meta name="twitter:description" content="${esc(m.description)}" ${OGM}>`
    + img + '\n';
}

async function listAll(Bucket, Prefix) {
  let t; const out = [];
  do { const r = await client.send(new ListObjectsV2Command({ Bucket, Prefix, ContinuationToken: t })); (r.Contents || []).forEach(o => out.push(o.Key)); t = r.IsTruncated ? r.NextContinuationToken : undefined; } while (t);
  return out;
}
async function getText(Bucket, Key) { const r = await client.send(new GetObjectCommand({ Bucket, Key })); return r.Body.transformToString(); }
async function pool(items, n, fn) { let i = 0; await Promise.all(Array.from({ length: n }, async () => { while (i < items.length) { const idx = i++; await fn(items[idx]); } })); }

const keys = [];
for (const p of PREFIXES) keys.push(...(await listAll(DST, `${p}/`)).filter(k => k.endsWith('.html')));
console.log(`Found ${keys.length} HTML files across ${PREFIXES.join(', ')}.`);

let pill = 0, og = 0, skipped = 0, err = 0;
await pool(keys, 6, async key => {
  try {
    let html = await getText(DST, key);
    let changed = false;
    if (!html.includes(MARKER)) {
      html = /<body[^>]*>/i.test(html) ? html.replace(/(<body[^>]*>)/i, `$1${SNIPPET}`) : SNIPPET + html;
      pill++; changed = true;
    }
    const meta = metaByKey.get(key);
    if (meta && !html.includes(OGM) && /<head[^>]*>/i.test(html)) {
      html = html.replace(/(<head[^>]*>)/i, `$1${ogBlock(meta)}`);
      og++; changed = true;
    }
    if (!changed) { skipped++; return; }
    await client.send(new PutObjectCommand({ Bucket: DST, Key: key, Body: html, ContentType: 'text/html; charset=utf-8', CacheControl: 'public, max-age=3600' }));
  } catch (e) { err++; console.log('  ERR', key, e.message); }
});
console.log(`Pill added: ${pill} | OG added: ${og} | unchanged: ${skipped} | errors: ${err}`);
