// Generate sitemap.xml for the data stories and upload it to the vishal bucket
// root, so https://content.vishalsingh.org/sitemap.xml lists every story.
// Run: pnpm gen-story-sitemap   (re-run after adding/curating articles)
import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';

const client = new S3Client({
  region: process.env.AWS_REGION || 'auto',
  endpoint: process.env.TIGRIS_ENDPOINT,
  credentials: { accessKeyId: process.env.TIGRIS_CLIENT_ID, secretAccessKey: process.env.TIGRIS_CLIENT_SECRET },
  forcePathStyle: false,
});
const DST = 'vishal';
const CONTENT = (process.env.NEXT_PUBLIC_CONTENT_URL || 'https://content.vishalsingh.org').replace(/\/$/, '');

const raw = await (await client.send(new GetObjectCommand({ Bucket: DST, Key: 'articles/manifest.json' }))).Body.transformToString();
const items = (JSON.parse(raw).items || []).filter(i => i.status !== 'hidden' && i.status !== 'draft');

const today = new Date().toISOString().slice(0, 10);
const urls = items
  .map(i => `  <url><loc>${CONTENT}/${i.file}</loc><lastmod>${today}</lastmod><changefreq>monthly</changefreq></url>`)
  .join('\n');
const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;

await client.send(new PutObjectCommand({
  Bucket: DST, Key: 'sitemap.xml', Body: xml,
  ContentType: 'application/xml', CacheControl: 'public, max-age=3600',
}));
console.log(`Wrote ${DST}:sitemap.xml with ${items.length} story URLs → ${CONTENT}/sitemap.xml`);
