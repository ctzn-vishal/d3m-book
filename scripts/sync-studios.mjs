// One-time + going-forward migration: mirror public/studios/** into the Tigris
// `vishal` bucket under the SAME `studios/` prefix, so every relative/absolute
// asset reference inside a self-contained studio HTML resolves identically when
// served from content.vishalsingh.org (e.g. an absolute /studios/shared/x.css →
// content.vishalsingh.org/studios/shared/x.css). Structure is preserved verbatim;
// no HTML is rewritten here (chrome/OG injection is a separate pass).
// Run: pnpm sync-studios   (node --env-file=../.env scripts/sync-studios.mjs)
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { CONTENT_BUCKET } from './pipeline-config.mjs';
import { readdir, readFile } from 'node:fs/promises';
import { join, relative, sep, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const client = new S3Client({
  region: process.env.AWS_REGION || 'auto',
  endpoint: process.env.TIGRIS_ENDPOINT,
  credentials: { accessKeyId: process.env.TIGRIS_CLIENT_ID, secretAccessKey: process.env.TIGRIS_CLIENT_SECRET },
  forcePathStyle: false,
});
const DST = CONTENT_BUCKET;
const ROOT = fileURLToPath(new URL('../public/studios', import.meta.url));

const CT = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json',
  '.topojson': 'application/json',
  '.geojson': 'application/json',
  '.csv': 'text/csv; charset=utf-8',
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.png': 'image/png', '.webp': 'image/webp', '.gif': 'image/gif',
  '.svg': 'image/svg+xml', '.ico': 'image/x-icon',
  '.woff': 'font/woff', '.woff2': 'font/woff2', '.ttf': 'font/ttf',
};

async function walk(dir) {
  const out = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) out.push(...(await walk(p)));
    else out.push(p);
  }
  return out;
}
async function pool(items, n, fn) {
  let i = 0;
  await Promise.all(Array.from({ length: n }, async () => { while (i < items.length) { const idx = i++; await fn(items[idx]); } }));
}

const files = await walk(ROOT);
console.log(`Uploading ${files.length} files from public/studios → ${DST}:studios/ ...`);
let ok = 0, err = 0;
await pool(files, 8, async abs => {
  const rel = relative(ROOT, abs).split(sep).join('/');
  const Key = `studios/${rel}`;
  const ext = extname(abs).toLowerCase();
  const isHtml = ext === '.html';
  try {
    const Body = await readFile(abs);
    await client.send(new PutObjectCommand({
      Bucket: DST, Key, Body,
      ContentType: CT[ext] || 'application/octet-stream',
      // HTML re-fetched hourly so chrome/OG injection + edits propagate; static assets cached hard.
      CacheControl: isHtml ? 'public, max-age=3600' : 'public, max-age=86400',
    }));
    ok++;
  } catch (e) { err++; console.log('  ERR', Key, e.message); }
});
console.log(`Done: ${ok} uploaded, ${err} errors.`);
