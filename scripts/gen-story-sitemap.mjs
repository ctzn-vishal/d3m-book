// Generate sitemap.xml + robots.txt for the bucket-hosted content (data stories
// + studios) and upload them to the vishal bucket root, so
// content.vishalsingh.org/sitemap.xml lists every self-contained HTML piece and
// content.vishalsingh.org/robots.txt points crawlers at it. Source = the
// committed registry snapshot (run `pnpm sync-registry` first), so it stays in
// lockstep with the gallery. <lastmod> is the item's real updated_at from the
// registry (never "today" — search engines learn to distrust always-fresh
// lastmod stamps and then ignore them).
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
// 'unlisted' items (booklet chapters) are public canonical pages too — indexed,
// just not gallery cards — so they stay in the sitemap.
const snap = JSON.parse(await readFile(fileURLToPath(new URL('../content/registry.snapshot.json', import.meta.url)), 'utf8'));
const items = (snap.items || [])
  .filter(i => (i.status === 'published' || i.status === 'unlisted') && typeof i.href === 'string' && i.href.startsWith(CONTENT + '/') && i.href.endsWith('.html'));

// One entry per unique URL; lastmod = the row's real last content change
// ('YYYY-MM-DD HH:MM:SS' UTC → date part), falling back to created_at, else no
// lastmod at all (better absent than fabricated).
const byLoc = new Map();
for (const i of items) {
  const stamp = (i.updatedAt || i.createdAt || '').slice(0, 10);
  const prev = byLoc.get(i.href);
  if (!prev || stamp > prev) byLoc.set(i.href, stamp);
}
const urls = [...byLoc.entries()]
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([loc, stamp]) =>
    `  <url><loc>${loc}</loc>${stamp ? `<lastmod>${stamp}</lastmod>` : ''}<changefreq>monthly</changefreq></url>`)
  .join('\n');
const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;

await client.send(new PutObjectCommand({
  Bucket: DST, Key: 'sitemap.xml', Body: xml,
  ContentType: 'application/xml', CacheControl: 'public, max-age=3600',
}));
console.log(`Wrote ${DST}:sitemap.xml with ${byLoc.size} URLs (stories + studios) → ${CONTENT}/sitemap.xml`);

// robots.txt on the content host: allow everything (same policy as the hub's
// app/robots.ts — for an academic site we want crawler + AI-engine visibility)
// and point at the sitemap so it's discoverable without Search Console.
const robots = `User-agent: *\nAllow: /\n\nSitemap: ${CONTENT}/sitemap.xml\n`;
await client.send(new PutObjectCommand({
  Bucket: DST, Key: 'robots.txt', Body: robots,
  ContentType: 'text/plain; charset=utf-8', CacheControl: 'public, max-age=3600',
}));
console.log(`Wrote ${DST}:robots.txt → ${CONTENT}/robots.txt`);
