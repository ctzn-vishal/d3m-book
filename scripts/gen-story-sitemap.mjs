// Generate sitemap.xml for the bucket-hosted content (data stories + studios)
// and upload it to the vishal bucket root, so content.vishalsingh.org/sitemap.xml
// lists every self-contained HTML piece. Source = the committed registry snapshot
// (run `pnpm sync-registry` first), so it stays in lockstep with the gallery.
// Run: pnpm gen-story-sitemap
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { CONTENT_BUCKET } from './pipeline-config.mjs';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const client = new S3Client({
  region: process.env.AWS_REGION || 'auto',
  endpoint: process.env.TIGRIS_ENDPOINT,
  credentials: { accessKeyId: process.env.TIGRIS_CLIENT_ID, secretAccessKey: process.env.TIGRIS_CLIENT_SECRET },
  forcePathStyle: false,
});
const DST = CONTENT_BUCKET;
const CONTENT = (process.env.NEXT_PUBLIC_CONTENT_URL || 'https://content.vishalsingh.org').replace(/\/$/, '');

// Every published item whose canonical URL is bucket-hosted HTML — Blog stories
// (articles/*.html) AND Teaching studios (studios/**/index.html). Apps (external)
// and datasets (internal /datasets/[id]) belong in the hub sitemap, not here.
const snap = JSON.parse(await readFile(fileURLToPath(new URL('../content/registry.snapshot.json', import.meta.url)), 'utf8'));
const locs = [...new Set(
  (snap.items || [])
    .filter(i => i.status === 'published' && typeof i.href === 'string' && i.href.startsWith(CONTENT + '/') && i.href.endsWith('.html'))
    .map(i => i.href)
)].sort();

const today = new Date().toISOString().slice(0, 10);
const urls = locs
  .map(loc => `  <url><loc>${loc}</loc><lastmod>${today}</lastmod><changefreq>monthly</changefreq></url>`)
  .join('\n');
const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;

await client.send(new PutObjectCommand({
  Bucket: DST, Key: 'sitemap.xml', Body: xml,
  ContentType: 'application/xml', CacheControl: 'public, max-age=3600',
}));
console.log(`Wrote ${DST}:sitemap.xml with ${locs.length} URLs (stories + studios) → ${CONTENT}/sitemap.xml`);
