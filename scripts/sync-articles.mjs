// Copy net-new data stories from ctzn-articles -> vishal/articles/, extract
// metadata, and write vishal:articles/manifest.json (the hub's article registry).
// Run: node --env-file=../.env scripts/sync-articles.mjs   (creds via env; never printed)
import { S3Client, ListObjectsV2Command, GetObjectCommand, CopyObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { CONTENT_BUCKET } from './pipeline-config.mjs';

const client = new S3Client({
  region: process.env.AWS_REGION || 'auto',
  endpoint: process.env.TIGRIS_ENDPOINT,
  credentials: { accessKeyId: process.env.TIGRIS_CLIENT_ID, secretAccessKey: process.env.TIGRIS_CLIENT_SECRET },
  forcePathStyle: false,
});

const SRC = 'ctzn-articles';
const DST = CONTENT_BUCKET;
const PREFIX = 'articles';

const STUDIOS = new Set([
  'gdelt-media-agenda-lab', 'cfpb-crisis-monitor', 'doing-okay-shed', 'regulation-demand-guns',
  'presidential-election-atlas', 'political-identity-divergence', 'political-identification-us',
  'out-party-hate-not-in-party-love', 'partisans-got-constraint', 'sorting-was-conversion-not-replacement',
  'gen-z-gender-war-overstated', 'income-ladder-flipped', 'party-beats-place-seven-to-one',
  'one-national-election-county-swing-uniformity', 'merchant-right-county-residuals',
  'drug-availability-teens', 'religious-composition-dashboard', 'ad-spend-explorer',
  'nyc-taxi-covid-emergency', 'nyc-airbnb-atlas', 'progresso-dashboard', 'southwest-regression',
  'southwest-regression-exercise', 'share-of-wallet', 'fast-food-perceptual-map',
  'nyc-zip-health-segments', 'lottery-zip-psychographics',
]);

const TOPICS = {
  health: 'Public Health', politics: 'Politics & Elections', finance: 'Finance',
  demo: 'Demographics', opinion: 'Public Opinion',
};
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

async function listAll(Bucket, Prefix) {
  let t; const out = [];
  do {
    const r = await client.send(new ListObjectsV2Command({ Bucket, Prefix, ContinuationToken: t }));
    (r.Contents || []).forEach(o => out.push(o.Key));
    t = r.IsTruncated ? r.NextContinuationToken : undefined;
  } while (t);
  return out;
}
async function getText(Bucket, Key) {
  const r = await client.send(new GetObjectCommand({ Bucket, Key }));
  return r.Body.transformToString();
}
function titleCase(slug) {
  return slug.replace(/[-_]+/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}
function decodeEntities(s) {
  return s
    .replace(/&#39;|&#x27;|&rsquo;|&#8217;/g, '’')
    .replace(/&lsquo;|&#8216;/g, '‘')
    .replace(/&quot;|&#34;|&ldquo;|&#8220;/g, '“')
    .replace(/&rdquo;|&#8221;/g, '”')
    .replace(/&mdash;|&#8212;/g, '—')
    .replace(/&ndash;|&#8211;/g, '–')
    .replace(/&hellip;|&#8230;/g, '…')
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
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
  title = decodeEntities(title);
  desc = decodeEntities(desc || '');
  if (desc.length > 240) desc = desc.slice(0, 237).trimEnd() + '…';
  return { title, description: desc };
}

// concurrency pool
async function pool(items, n, fn) {
  const out = []; let i = 0;
  await Promise.all(Array.from({ length: n }, async () => {
    while (i < items.length) { const idx = i++; out[idx] = await fn(items[idx], idx); }
  }));
  return out;
}

// ---- plan ----
const srcKeys = await listAll(SRC);
const rootHtmlSlugs = srcKeys.filter(k => /^[^/]+\.html$/.test(k)).map(k => k.replace(/\.html$/, ''));
const netNew = rootHtmlSlugs.filter(s => !STUDIOS.has(s)).sort();
const thumbSlugs = new Set(srcKeys.filter(k => k.endsWith('/_thumb.webp')).map(k => k.replace(/\/_thumb\.webp$/, '')));
// keys to copy: each slug's <slug>.html + everything under <slug>/ ; plus shared topojson
const copyKeys = [];
for (const slug of netNew) {
  copyKeys.push(`${slug}.html`);
  srcKeys.filter(k => k.startsWith(`${slug}/`)).forEach(k => copyKeys.push(k));
}
if (srcKeys.includes('us_counties_10m.topojson')) copyKeys.push('us_counties_10m.topojson');
console.log(`Net-new: ${netNew.length} articles | objects to copy: ${copyKeys.length}`);

// ---- copy ---- (set SKIP_COPY=1 to rebuild only the manifest)
if (process.env.SKIP_COPY) {
  console.log('SKIP_COPY set — skipping object copy, rebuilding manifest only.');
} else {
  let copied = 0, copyErr = 0;
  await pool(copyKeys, 8, async key => {
    const Key = `${PREFIX}/${key}`;
    try {
      await client.send(new CopyObjectCommand({ Bucket: DST, Key, CopySource: `${SRC}/${key}`, MetadataDirective: 'COPY' }));
      copied++;
    } catch (e) {
      copyErr++; console.log('  copy ERR', key, e.name);
    }
  });
  console.log(`Copied ${copied}/${copyKeys.length} (errors: ${copyErr})`);
}

// ---- build manifest ----
const items = await pool(netNew, 8, async slug => {
  let meta;
  try { meta = extractMeta(await getText(SRC, `${slug}.html`), slug); }
  catch { meta = { title: titleCase(slug), description: '' }; }
  return {
    id: slug,
    type: 'article',
    title: meta.title,
    description: meta.description,
    topic: guessTopic(slug),
    tags: ['data story'],
    file: `${PREFIX}/${slug}.html`,
    thumb: thumbSlugs.has(slug) ? `${PREFIX}/${slug}/_thumb.webp` : null,
    accent: '#46688f',
    featured: false,
    status: 'published',
  };
});

const manifest = {
  _README: 'Article registry for the vishalsingh.org gallery. Edit to curate (status: published|hidden, featured, topic, tags, title, description). The hub reads this via ISR. Paths are relative to the content base URL.',
  generated: new Date().toISOString().slice(0, 10),
  count: items.length,
  items,
};
await client.send(new PutObjectCommand({
  Bucket: DST, Key: `${PREFIX}/manifest.json`,
  Body: JSON.stringify(manifest, null, 2),
  ContentType: 'application/json', CacheControl: 'public, max-age=60',
}));
console.log(`Wrote ${DST}:${PREFIX}/manifest.json with ${items.length} items.`);
console.log('Sample:', JSON.stringify(items.slice(0, 2), null, 1));
