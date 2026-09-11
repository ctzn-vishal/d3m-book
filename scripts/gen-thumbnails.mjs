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
// Then pnpm rebuild-manifest && pnpm sync-registry discovers the generated images.
import { chromium } from 'playwright';
import sharp from 'sharp';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { CONTENT_BUCKET } from './pipeline-config.mjs';
import { thumbnailTarget, bucketObjectExists, missingThumbnails } from './thumbnail-utils.mjs';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const UPLOAD = process.env.UPLOAD === '1' || process.argv.includes('--upload');
const CHECK = process.argv.includes('--check');
const ONLY = (process.env.ONLY || '').split(',').map(s => s.trim()).filter(Boolean);
const OUT = fileURLToPath(new URL('./.thumbs/', import.meta.url));
const W = 1000, H = 625; // 16:10

// Targets = public bucket-hosted HTML whose thumbnail object is missing.
const snap = JSON.parse(await readFile(fileURLToPath(new URL('../content/registry.snapshot.json', import.meta.url)), 'utf8'));
const s3 = new S3Client({
  region: process.env.AWS_REGION || 'auto',
  endpoint: process.env.TIGRIS_ENDPOINT,
  credentials: { accessKeyId: process.env.TIGRIS_CLIENT_ID, secretAccessKey: process.env.TIGRIS_CLIENT_SECRET },
  forcePathStyle: false,
});
const candidates = (snap.items ?? []).filter(i => !ONLY.length || ONLY.includes(i.id));
const targets = await missingThumbnails(candidates, key => bucketObjectExists(s3, CONTENT_BUCKET, key));
console.log(`Checked ${candidates.filter(thumbnailTarget).length} managed thumbnail objects.`);
if (!targets.length) { console.log('No missing thumbnail objects in the selected public content.'); process.exit(0); }
for (const item of targets) console.log(`Missing thumbnail: ${item.id} -> ${thumbnailTarget(item).key}`);
if (CHECK) process.exit(1);

await mkdir(OUT, { recursive: true });
const browser = await chromium.launch({ headless: true, channel: process.env.PLAYWRIGHT_CHANNEL || (process.platform === 'win32' ? 'msedge' : undefined) });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 960 }, deviceScaleFactor: 2, colorScheme: 'light' });

function bucketKey(item) {
  // Blog: derive from the href path so sub-folder stories (articles/HF/<slug>.html)
  // get their thumb where rebuild-manifest looks: articles/HF/<slug>/_thumb.webp.
  return thumbnailTarget(item);
}

const results = [];
for (const item of targets) {
  const page = await ctx.newPage();
  let how = 'fallback';
  try {
    const response = await page.goto(item.href, { waitUntil: 'load', timeout: 60000 });
    if (!response?.ok()) throw new Error(`Page returned HTTP ${response?.status() ?? 'unknown'}`);
    await page.addStyleTag({ content: 'a[data-vs-chrome],[data-vs-chrome]{display:none!important}' }).catch(() => {});
    // Wait (best-effort) for a chart to render.
    await page.waitForFunction(
      () => [...document.querySelectorAll('svg,canvas')].some(el => { const r = el.getBoundingClientRect(); return r.width > 320 && r.height > 180; }),
      null, { timeout: 18000 }
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
    await writeFile(OUT + `${encodeURIComponent(item.id)}.png`, png);
    let uploaded;
    if (UPLOAD) {
      const { key, format } = bucketKey(item);
      const body = await sharp(png).toFormat(format, { quality: format === 'webp' ? 82 : 86 }).toBuffer();
      try {
        await s3.send(new PutObjectCommand({ Bucket: CONTENT_BUCKET, Key: key, Body: body, ContentType: `image/${format}`, CacheControl: 'public, max-age=3600', IfNoneMatch: '*' }));
        uploaded = key;
      } catch (error) {
        if (error?.$metadata?.httpStatusCode !== 412) throw error;
      }
    }
    results.push({ id: item.id, type: item.type, how, ok: true, uploaded });
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
process.exit(results.some(r => !r.ok) ? 1 : 0);
