// Rebuild vishal:articles/manifest.json from whatever HTML is in vishal/articles/.
// THIS is the going-forward refresh tool: drop new <slug>.html (+ <slug>/_thumb.webp)
// into the bucket, run this, and the gallery picks them up (ISR / /api/revalidate).
// Curation in the existing manifest (title/description/topic/tags/featured/status)
// is PRESERVED; only brand-new files get auto-extracted metadata.
// Run: pnpm rebuild-manifest   (node --env-file=../.env scripts/rebuild-manifest.mjs)
import { S3Client, ListObjectsV2Command, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';

const client = new S3Client({
  region: process.env.AWS_REGION || 'auto',
  endpoint: process.env.TIGRIS_ENDPOINT,
  credentials: { accessKeyId: process.env.TIGRIS_CLIENT_ID, secretAccessKey: process.env.TIGRIS_CLIENT_SECRET },
  forcePathStyle: false,
});
const DST = 'vishal';
const PREFIX = 'articles';

const TOPICS = { health: 'Public Health', politics: 'Politics & Elections', finance: 'Finance', demo: 'Demographics', opinion: 'Public Opinion' };
function guessTopic(s) {
  const t = s.toLowerCase();
  const has = (...w) => w.some(x => t.includes(x));
  if (has('overdose', 'mental-health', 'children', 'child', 'deadliest', 'surveillance', 'vanishing-cradle', 'wear-and-tear', 'loneliness', 'despair', 'stress', 'health')) return TOPICS.health;
  if (has('happiness', 'well-being', 'wellbeing', 'optimism', 'thriving', 'u-curve', 'u_curve', 'cushion', 'smiles', 'ladder', 'evening', 'two_clocks', 'unwinding', 'paradox', 'price-of-a-year')) return TOPICS.health;
  if (has('county', 'election', 'vote', 'voting', 'partisan', 'sort', 'diploma', 'purple', 'flip', 'swing', 'abortion', 'thermometer', 'censor', 'grain', 'defection', 'race-attitude', 'knowledge-sharpens', 'almanac')) return TOPICS.politics;
  if (has('rich', 'poor', 'income', 'mobility', 'born-rich', 'opportunity', 'financial', 'starting-line', 'locked-up', 'compensation', 'office-ladder', 'beat-the-model', 'residual', 'keeping-up', 'company-you-keep')) return TOPICS.finance;
  if (has('religion', 'devotion', 'denomination', 'generosity', 'dividend', 'marriage', 'ring', 'lgbt', 'girls-country', 'eight-americas', 'five-subway', 'geography', 'map', 'south-convergence')) return TOPICS.demo;
  return TOPICS.opinion;
}
function titleCase(slug) { return slug.replace(/[-_]+/g, ' ').replace(/\b\w/g, c => c.toUpperCase()); }
function decodeEntities(s) {
  return s
    .replace(/&#39;|&#x27;|&rsquo;|&#8217;/g, '’').replace(/&lsquo;|&#8216;/g, '‘')
    .replace(/&quot;|&#34;|&ldquo;|&#8220;/g, '“').replace(/&rdquo;|&#8221;/g, '”')
    .replace(/&mdash;|&#8212;/g, '—').replace(/&ndash;|&#8211;/g, '–').replace(/&hellip;|&#8230;/g, '…')
    .replace(/&nbsp;/g, ' ').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&#(\d+);/g, (_, n) => { try { return String.fromCodePoint(+n); } catch { return _; } })
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => { try { return String.fromCodePoint(parseInt(n, 16)); } catch { return _; } })
    .replace(/&amp;/g, '&');
}
function extractMeta(html, slug) {
  let title = (html.match(/<title[^>]*>([^<]*)<\/title>/i) || [])[1]?.trim() || titleCase(slug);
  let desc =
    (html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i) || [])[1]?.trim() ||
    (html.match(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']*)["']/i) || [])[1]?.trim();
  if (!desc) {
    const body = html.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<style[\s\S]*?<\/style>/gi, '');
    for (const m of body.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)) {
      const txt = m[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
      if (txt.length > 60) { desc = txt; break; }
    }
  }
  title = decodeEntities(title); desc = decodeEntities(desc || '');
  if (desc.length > 240) desc = desc.slice(0, 237).trimEnd() + '…';
  return { title, description: desc };
}
async function listAll(Bucket, Prefix) {
  let t; const out = [];
  do { const r = await client.send(new ListObjectsV2Command({ Bucket, Prefix, ContinuationToken: t })); (r.Contents || []).forEach(o => out.push(o.Key)); t = r.IsTruncated ? r.NextContinuationToken : undefined; } while (t);
  return out;
}
async function getText(Bucket, Key) { const r = await client.send(new GetObjectCommand({ Bucket, Key })); return r.Body.transformToString(); }

const keys = await listAll(DST, `${PREFIX}/`);
const htmlSlugs = keys.filter(k => new RegExp(`^${PREFIX}/[^/]+\\.html$`).test(k)).map(k => k.slice(PREFIX.length + 1, -5)).sort();
const thumbSlugs = new Set(keys.filter(k => k.endsWith('/_thumb.webp')).map(k => k.slice(PREFIX.length + 1).replace(/\/_thumb\.webp$/, '')));

let existing = {};
try { const m = JSON.parse(await getText(DST, `${PREFIX}/manifest.json`)); (m.items || []).forEach(it => { existing[it.id] = it; }); } catch { /* first run */ }

const items = []; let added = 0;
for (const slug of htmlSlugs) {
  const thumb = thumbSlugs.has(slug) ? `${PREFIX}/${slug}/_thumb.webp` : null;
  if (existing[slug]) {
    items.push({ ...existing[slug], file: `${PREFIX}/${slug}.html`, thumb }); // preserve curation; refresh file/thumb
  } else {
    added++;
    let meta; try { meta = extractMeta(await getText(DST, `${PREFIX}/${slug}.html`), slug); } catch { meta = { title: titleCase(slug), description: '' }; }
    items.push({ id: slug, type: 'article', title: meta.title, description: meta.description, topic: guessTopic(slug), tags: ['data story'], file: `${PREFIX}/${slug}.html`, thumb, accent: '#46688f', featured: false, status: 'published' });
  }
}
const removed = Object.keys(existing).filter(id => !htmlSlugs.includes(id));

const manifest = { _README: existing.__readme || 'Article registry for the vishalsingh.org gallery. Edit to curate (status: published|hidden, featured, topic, tags, title, description). Hub reads via ISR; paths relative to the content base URL.', generated: new Date().toISOString().slice(0, 10), count: items.length, items };
await client.send(new PutObjectCommand({ Bucket: DST, Key: `${PREFIX}/manifest.json`, Body: JSON.stringify(manifest, null, 2), ContentType: 'application/json', CacheControl: 'public, max-age=60' }));
console.log(`Manifest rebuilt: ${items.length} items (${added} new, ${removed.length} removed${removed.length ? ': ' + removed.join(', ') : ''}).`);
