// Inject a fixed "back to vishalsingh.org" home pill into the article HTML files
// in the vishal bucket (articles/*.html). Idempotent: skips files already done.
// Dependency-free, inline styles, very high z-index, !important on layout props so
// it can't be overridden by a story's own CSS, and a marker attribute for re-runs.
// Run: pnpm inject-chrome   (node --env-file=../.env scripts/inject-chrome.mjs)
import { S3Client, ListObjectsV2Command, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';

const client = new S3Client({
  region: process.env.AWS_REGION || 'auto',
  endpoint: process.env.TIGRIS_ENDPOINT,
  credentials: { accessKeyId: process.env.TIGRIS_CLIENT_ID, secretAccessKey: process.env.TIGRIS_CLIENT_SECRET },
  forcePathStyle: false,
});
const DST = 'vishal';
const PREFIX = 'articles';
const HOME = 'https://vishalsingh.org/';
const MARKER = 'data-vs-chrome';

// Reads an optional ?from=<chapter-slug> and points the pill back at that chapter
// when present (so a story opened from the book returns to its chapter), else home.
const SNIPPET = `
<a href="${HOME}" ${MARKER} aria-label="Back to vishalsingh.org" style="position:fixed!important;top:12px!important;left:12px!important;z-index:2147483646!important;display:inline-flex!important;align-items:center!important;gap:6px!important;margin:0!important;padding:6px 12px!important;border-radius:999px!important;background:rgba(255,255,255,.92)!important;-webkit-backdrop-filter:saturate(180%) blur(8px);backdrop-filter:saturate(180%) blur(8px);border:1px solid #e4dcd0!important;box-shadow:0 1px 2px rgba(40,30,20,.12)!important;font:600 12px/1 ui-sans-serif,system-ui,-apple-system,'Segoe UI',sans-serif!important;color:#1c1a17!important;text-decoration:none!important">↖︎ Vishal Singh</a>
<script ${MARKER}>(function(){try{var f=new URLSearchParams(location.search).get('from');if(f&&/^[a-z0-9-]+$/.test(f)){var a=document.querySelector('a[${MARKER}]');if(a){a.href='${HOME}'+f;a.lastChild.textContent='← Back to the book';}}}catch(e){}})();</script>`;

async function listAll(Bucket, Prefix) {
  let t; const out = [];
  do { const r = await client.send(new ListObjectsV2Command({ Bucket, Prefix, ContinuationToken: t })); (r.Contents || []).forEach(o => out.push(o.Key)); t = r.IsTruncated ? r.NextContinuationToken : undefined; } while (t);
  return out;
}
async function getText(Bucket, Key) { const r = await client.send(new GetObjectCommand({ Bucket, Key })); return r.Body.transformToString(); }
async function pool(items, n, fn) { let i = 0; await Promise.all(Array.from({ length: n }, async () => { while (i < items.length) { const idx = i++; await fn(items[idx]); } })); }

const keys = (await listAll(DST, `${PREFIX}/`)).filter(k => k.endsWith('.html'));
console.log(`Found ${keys.length} article HTML files.`);
let injected = 0, skipped = 0, err = 0;
await pool(keys, 6, async key => {
  try {
    const html = await getText(DST, key);
    if (html.includes(MARKER)) { skipped++; return; }
    const out = /<body[^>]*>/i.test(html) ? html.replace(/(<body[^>]*>)/i, `$1${SNIPPET}`) : SNIPPET + html;
    await client.send(new PutObjectCommand({ Bucket: DST, Key: key, Body: out, ContentType: 'text/html; charset=utf-8', CacheControl: 'public, max-age=3600' }));
    injected++;
  } catch (e) { err++; console.log('  ERR', key, e.message); }
});
console.log(`Chrome injected: ${injected} | already had it: ${skipped} | errors: ${err}`);
