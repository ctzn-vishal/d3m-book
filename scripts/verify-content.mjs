// Read-only health check for the Tigris → gallery content pipeline. Catches the
// ways an upload can silently break the gallery:
//   1. UN-INJECTED: a bucket HTML file missing the nav pill (data-vs-chrome),
//      OG/canonical (data-vs-og), or — articles only — the Article JSON-LD
//      (data-vs-ld) / related-stories footer (data-vs-related). Happens when a
//      file is re-uploaded raw and `inject-chrome` wasn't re-run.
//   2. UNREGISTERED: a bucket story/studio HTML not present in the committed
//      snapshot — `rebuild-manifest` + `sync-registry` weren't run after upload.
//   3. DANGLING: a published registry row whose bucket HTML no longer exists
//      (e.g. a renamed/deleted file left an orphan row pointing at a 404).
//   4. HYGIENE (warn): reserved filenames (index.html) registered as stories, and
//      non-kebab-case slugs (underscores) that drift from the URL convention.
// Exits 1 if any hard problem (1-3) is found, else 0 — safe for CI / pre-deploy.
// Run: pnpm verify-content   (node --env-file=../.env scripts/verify-content.mjs)
import { S3Client, ListObjectsV2Command, GetObjectCommand } from '@aws-sdk/client-s3';
import { CONTENT_BUCKET, LEGACY_NONKEBAB_SLUGS } from './pipeline-config.mjs';
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

async function listAll(Prefix) {
  let t; const out = [];
  do { const r = await client.send(new ListObjectsV2Command({ Bucket: DST, Prefix, ContinuationToken: t })); (r.Contents || []).forEach(o => out.push(o.Key)); t = r.IsTruncated ? r.NextContinuationToken : undefined; } while (t);
  return out;
}
async function getText(Key) { const r = await client.send(new GetObjectCommand({ Bucket: DST, Key })); return r.Body.transformToString(); }
async function pool(items, n, fn) { let i = 0; await Promise.all(Array.from({ length: n }, async () => { while (i < items.length) { const idx = i++; await fn(items[idx]); } })); }

// Bucket HTML (data stories + studios). apps/<slug>/v<N>/… is a versioned DATA
// prefix (the data-app pattern) — its files are payloads, not renderable pages,
// so they're outside the inject/register contract.
const isVersionedData = k => /^apps\/[^/]+\/v\d+\//.test(k);
const keys = [];
for (const p of PREFIXES) keys.push(...(await listAll(`${p}/`)).filter(k => k.endsWith('.html') && !isVersionedData(k)));

// Committed snapshot = what the gallery/inject/sitemap consider published
const snap = JSON.parse(await readFile(fileURLToPath(new URL('../content/registry.snapshot.json', import.meta.url)), 'utf8'));
const snapKeys = new Set(); // bucket keys referenced by the snapshot
for (const it of snap.items ?? []) {
  if (typeof it.href === 'string' && it.href.startsWith(CONTENT + '/') && it.href.endsWith('.html')) {
    snapKeys.add(it.href.slice(CONTENT.length + 1));
  }
}

const unInjected = [], unregistered = [], reserved = [], nonKebab = [];
await pool(keys, 8, async (key) => {
  const html = await getText(key);
  const base = key.split('/').pop();
  // articles/**/index.html is navigation chrome (e.g. articles/HF/index.html, the
  // landing page of a sub-collection), not a story — rebuild-manifest skips it by
  // design, so its absence from the snapshot (and hence from the snapshot-driven
  // OG/JSON-LD/related injection) is expected. It still gets the nav pill, so
  // require only that. Hygiene warn, not a fail.
  const reservedIndex = base === 'index.html' && key.startsWith('articles/');
  const required = ['data-vs-chrome'];
  if (!reservedIndex) {
    required.push('data-vs-og');
    if (key.startsWith('articles/')) required.push('data-vs-ld', 'data-vs-related');
  }
  const missing = required.filter(m => !html.includes(m));
  if (missing.length) {
    unInjected.push(`${key}  [missing: ${missing.join(', ')}]`);
  }
  if (!snapKeys.has(key) && !reservedIndex) unregistered.push(key);
  if (reservedIndex) reserved.push(key);
  const slug = key.startsWith('articles/') ? key.slice('articles/'.length, -5) : key.split('/')[1];
  if (/_/.test(slug) && !LEGACY_NONKEBAB_SLUGS.has(slug)) nonKebab.push(slug);
});

// Dangling: snapshot rows whose bucket file is gone
const bucketSet = new Set(keys);
const dangling = [...snapKeys].filter(k => !bucketSet.has(k));

const report = (label, arr) => { console.log(`\n${arr.length ? '✗' : '✓'} ${label}: ${arr.length}`); arr.slice(0, 50).forEach(x => console.log(`    ${x}`)); };
console.log(`Tigris ${DST} — ${keys.length} HTML files | snapshot — ${snapKeys.size} bucket-hosted items (generated ${snap.generated})`);
report('UN-INJECTED (run: pnpm inject-chrome)', unInjected);
report('UNREGISTERED in snapshot (run: pnpm rebuild-manifest && pnpm sync-registry)', unregistered);
report('DANGLING registry rows — file missing (delete row / re-upload)', dangling);
report('HYGIENE · reserved filename as story (warn)', reserved);
report('HYGIENE · non-kebab slug (warn)', [...new Set(nonKebab)]);

const hardProblems = unInjected.length + unregistered.length + dangling.length;
console.log(`\n${hardProblems ? `FAIL — ${hardProblems} problem(s) to fix.` : 'OK — content pipeline is consistent.'}`);
process.exit(hardProblems ? 1 : 0);
