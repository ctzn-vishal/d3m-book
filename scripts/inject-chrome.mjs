// Inject hub chrome into the self-contained HTML in the vishal bucket — the
// data stories (articles/*.html), the studios (studios/**/*.html), and the
// self-hosted apps (apps/**/*.html):
//   1. a fixed "↖︎ Vishal Singh" home pill (reads ?from=<chapter-slug> → "← Back
//      to the book"),
//   2. social/SEO <head> tags — og:*, twitter:*, and <link rel="canonical"> —
//      sourced per-file from content/registry.snapshot.json,
//   3. (articles only) a schema.org Article JSON-LD block — headline, dates,
//      author — for rich results and correct authorship attribution, and
//   4. (articles only) a "Related stories" footer computed from the registry's
//      topic/tags — the internal-link graph between bucket stories.
// Run `pnpm sync-registry` first so the snapshot is current.
//
// Idempotence & refresh: the pill is inject-once (marker data-vs-chrome). The
// OG/LD/related blocks are UPSERTED — each run strips the previously injected
// block (by its marker attribute) and regenerates from the current registry, so
// curated titles/descriptions, late-arriving thumbnails, and a growing catalog
// all propagate. A file is only rewritten (PUT) when its bytes actually change.
// The transformations live in scripts/chrome-blocks.mjs (pure, testable).
// Run: pnpm inject-chrome   (node --env-file=.env.local scripts/inject-chrome.mjs)
import { S3Client, ListObjectsV2Command, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { CONTENT_BUCKET } from './pipeline-config.mjs';
import { applyChrome } from './chrome-blocks.mjs';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const client = new S3Client({
  region: process.env.AWS_REGION || 'auto',
  endpoint: process.env.TIGRIS_ENDPOINT,
  credentials: { accessKeyId: process.env.TIGRIS_CLIENT_ID, secretAccessKey: process.env.TIGRIS_CLIENT_SECRET },
  forcePathStyle: false,
});
const DST = CONTENT_BUCKET;
const PREFIXES = ['articles', 'studios', 'apps'];
const CONTENT = (process.env.NEXT_PUBLIC_CONTENT_URL || 'https://content.vishalsingh.org').replace(/\/$/, '');

// ── Registry snapshot: per-file metadata + the related-links candidate pool ──
const snap = JSON.parse(await readFile(fileURLToPath(new URL('../content/registry.snapshot.json', import.meta.url)), 'utf8'));
const metaByKey = new Map();
for (const it of snap.items ?? []) {
  if (typeof it.href === 'string' && it.href.startsWith(CONTENT + '/') && it.href.endsWith('.html')) {
    try { metaByKey.set(new URL(it.href).pathname.replace(/^\//, ''), it); } catch { /* skip */ }
  }
}
// Related candidates: published, bucket-hosted stories/studios/apps (no datasets —
// those live on the hub and read as downloads, not follow-on reading).
const candidates = [...metaByKey.values()].filter(it => it.status === 'published' && it.type !== 'Dataset');

async function listAll(Bucket, Prefix) {
  let t; const out = [];
  do { const r = await client.send(new ListObjectsV2Command({ Bucket, Prefix, ContinuationToken: t })); (r.Contents || []).forEach(o => out.push(o.Key)); t = r.IsTruncated ? r.NextContinuationToken : undefined; } while (t);
  return out;
}
async function getText(Bucket, Key) { const r = await client.send(new GetObjectCommand({ Bucket, Key })); return r.Body.transformToString(); }
async function pool(items, n, fn) { let i = 0; await Promise.all(Array.from({ length: n }, async () => { while (i < items.length) { const idx = i++; await fn(items[idx]); } })); }

const keys = [];
for (const p of PREFIXES) keys.push(...(await listAll(DST, `${p}/`)).filter(k => k.endsWith('.html')));
console.log(`Found ${keys.length} HTML files across ${PREFIXES.join(', ')} (registry meta for ${metaByKey.size}, ${candidates.length} related-link candidates).`);

let pill = 0, og = 0, ld = 0, rel = 0, changed = 0, skipped = 0, err = 0;
await pool(keys, 6, async key => {
  try {
    const html = await getText(DST, key);
    const { html: out, did } = applyChrome(html, { key, meta: metaByKey.get(key), candidates });
    if (did.pill) pill++;
    if (did.og) og++;
    if (did.ld) ld++;
    if (did.rel) rel++;
    if (out === html) { skipped++; return; }
    changed++;
    await client.send(new PutObjectCommand({ Bucket: DST, Key: key, Body: out, ContentType: 'text/html; charset=utf-8', CacheControl: 'public, max-age=3600' }));
  } catch (e) { err++; console.log('  ERR', key, e.message); }
});
console.log(`Rewrote ${changed} file(s) — pill +${pill}, og ±${og}, json-ld ±${ld}, related ±${rel} | unchanged: ${skipped} | errors: ${err}`);
