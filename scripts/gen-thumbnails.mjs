// Auto-generate gallery thumbnails for bucket-hosted chart pages (Blog stories +
// self-hosted apps) that have no preview image: load the page headless, find the
// first real chart (svg/canvas/figure), screenshot it, normalize to a clean 16:10
// card, and (with UPLOAD=1) upload to where the pipeline already looks
// (articles/<slug>/_thumb.webp, apps/<slug>/preview.jpg).
//
// Workflow:
//   pnpm gen-thumbnails              # DRY: writes scripts/.thumbs/<slug>.png for review
//   UPLOAD=1 pnpm gen-thumbnails     # upload all
//   UPLOAD=1 ONLY=a,b pnpm gen-thumbnails   # upload only these slugs
// Then (Blog) pnpm rebuild-manifest && pnpm sync-registry ; (app) edit gallery.json thumbnail + sync.
import { chromium } from 'playwright';
import sharp from 'sharp';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { CONTENT_BUCKET } from './pipeline-config.mjs';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const UPLOAD = process.env.UPLOAD === '1';
const ONLY = (process.env.ONLY || '').split(',').map(s => s.trim()).filter(Boolean);
const OUT = fileURLToPath(new URL('./.thumbs/', import.meta.url));
const W = 1000, H = 625; // 16:10

// Targets = Blog/App items with a bucket-hosted .html href and no thumbnail.
const snap = JSON.parse(await readFile(fileURLToPath(new URL('../content/registry.snapshot.json', import.meta.url)), 'utf8'));
const CONTENT = (process.env.NEXT_PUBLIC_CONTENT_URL || 'https://content.vishalsingh.org').replace(/\/$/, '');
let targets = (snap.items ?? []).filter(
  i => (i.type === 'Blog' || i.type === 'App') && typeof i.href === 'string' && i.href.startsWith(CONTENT + '/') && i.href.endsWith('.html') && !i.thumbnail
);
if (ONLY.length) targets = targets.filter(t => ONLY.includes(t.id));
if (!targets.length) { console.log('No targets (all have thumbnails, or ONLY matched none).'); process.exit(0); }

await mkdir(OUT, { recursive: true });
const s3 = new S3Client({
  region: process.env.AWS_REGION || 'auto',
  endpoint: process.env.TIGRIS_ENDPOINT,
  credentials: { accessKeyId: process.env.TIGRIS_CLIENT_ID, secretAccessKey: process.env.TIGRIS_CLIENT_SECRET },
  forcePathStyle: false,
});

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 960 }, deviceScaleFactor: 2 });

function bucketKey(item) {
  if (item.type === 'App') return { key: `apps/${item.id}/preview.jpg`, format: 'jpeg' };
  // Blog: derive from the href path so sub-folder stories (articles/HF/<slug>.html)
  // get their thumb where rebuild-manifest looks: articles/HF/<slug>/_thumb.webp.
  const path = new URL(item.href).pathname.replace(/^\//, '').replace(/\.html$/, '');
  return { key: `${path}/_thumb.webp`, format: 'webp' };
}

const results = [];
for (const item of targets) {
  const page = await ctx.newPage();
  let how = 'fallback';
  try {
    await page.goto(item.href, { waitUntil: 'load', timeout: 60000 });
    await page.addStyleTag({ content: 'a[data-vs-chrome],[data-vs-chrome]{display:none!important}' }).catch(() => {});
    // Wait (best-effort) for a chart to render.
    await page.waitForFunction(
      () => [...document.querySelectorAll('svg,canvas')].some(el => { const r = el.getBoundingClientRect(); return r.width > 320 && r.height > 180; }),
      { timeout: 18000 }
    ).catch(() => {});
    await page.waitForTimeout(1500); // settle animations/transitions

    const handle = await page.evaluateHandle(() => {
      const cands = [...document.querySelectorAll('svg,canvas,figure')];
      for (const el of cands) { const r = el.getBoundingClientRect(); if (r.width > 320 && r.height > 180 && r.top < 3000) return el; }
      return null;
    });
    const el = handle.asElement();
    let raw;
    if (el) {
      await el.scrollIntoViewIfNeeded().catch(() => {});
      await page.waitForTimeout(300);
      raw = await el.screenshot({ type: 'png' });
      how = 'chart';
    } else {
      raw = await page.screenshot({ clip: { x: 96, y: 92, width: 1248, height: 780 } });
    }

    const png = await sharp(raw).flatten({ background: '#ffffff' }).resize(W, H, { fit: 'contain', background: '#ffffff' }).png().toBuffer();
    await writeFile(OUT + `${item.id}.png`, png);
    results.push({ id: item.id, type: item.type, how, ok: true });

    if (UPLOAD) {
      const { key, format } = bucketKey(item);
      const body = format === 'webp'
        ? await sharp(png).webp({ quality: 82 }).toBuffer()
        : await sharp(png).jpeg({ quality: 86 }).toBuffer();
      await s3.send(new PutObjectCommand({ Bucket: CONTENT_BUCKET, Key: key, Body: body, ContentType: `image/${format}`, CacheControl: 'public, max-age=3600' }));
      results[results.length - 1].uploaded = key;
    }
  } catch (e) {
    results.push({ id: item.id, type: item.type, ok: false, error: e.message });
  } finally {
    await page.close();
  }
}
await browser.close();

console.log(`\n${UPLOAD ? 'UPLOADED' : 'DRY (local only)'} — ${OUT}`);
for (const r of results) {
  console.log(`  ${r.ok ? '✓' : '✗'} ${r.id.padEnd(34)} [${r.type}] ${r.how || ''}${r.uploaded ? ' → ' + r.uploaded : ''}${r.error ? '  ERR ' + r.error : ''}`);
}
if (!UPLOAD) console.log('\nReview scripts/.thumbs/*.png, then: UPLOAD=1 pnpm gen-thumbnails  (or ONLY=slug,slug to pick).');
process.exit(0);
