// Upload the case data bundle (16 datasets) to vishal/datasets/<id>/ and write
// vishal:datasets/manifest.json (the dataset registry the hub reads).
// Source: case/_tigris_data_bundle (catalog.json + per-file metadata JSON).
// Run: pnpm sync-datasets   (SKIP_UPLOAD=1 to rebuild manifest only)
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { CONTENT_BUCKET } from './pipeline-config.mjs';

const client = new S3Client({
  region: process.env.AWS_REGION || 'auto',
  endpoint: process.env.TIGRIS_ENDPOINT,
  credentials: { accessKeyId: process.env.TIGRIS_CLIENT_ID, secretAccessKey: process.env.TIGRIS_CLIENT_SECRET },
  forcePathStyle: false,
});
const DST = CONTENT_BUCKET;
const PREFIX = 'datasets';
const BUNDLE = new URL('../../case/_tigris_data_bundle/', import.meta.url);
const bpath = rel => fileURLToPath(new URL(rel, BUNDLE));

const ID_MAP = {
  'county/county.parquet': 'county-demographics',
  'milk/Milk_Field_Exp.csv': 'milk-field-experiment',
  'nlp/beer_sentiment.csv': 'beer-acquisition-tweets',
  'nlp/politics_books_short.csv': 'political-book-reviews',
  'nlp/Tump_tweet_WP.csv': 'trump-tweet-device',
  'part4/BAV_FastFood.csv': 'bav-fastfood-brands',
  'part4/nyc_zip_health_teach.csv': 'nyc-zip-health',
  'part4/psych_zip_baseline.parquet': 'zip-psychographic-baseline',
  'renthop/RentHop.csv': 'renthop-listings',
  'soup/Pricing_101_Progresso_Case.xlsx': 'progresso-pricing-workbook',
  'soup/soup_case_data_use.csv': 'progresso-soup-scanner',
  'state/1976-2024-president.csv': 'us-president-state-1976-2024',
  'state/dashboard_assets/data/president_state_results_by_candidate.csv': 'president-state-by-candidate',
  'state/state_1972_2016.xlsx': 'us-election-state-county-1972-2016',
  'zillow/Colorado_legalization.csv': 'colorado-legalization-housing',
  'zillow/State_zhvi_uc_sfrcondo_tier_0.33_0.67_sm_sa_month (11).csv': 'zillow-state-zhvi-panel',
};
const TOPIC_MAP = {
  'county-demographics': 'Demographics', 'milk-field-experiment': 'Pricing & CPG',
  'beer-acquisition-tweets': 'AI & Data', 'political-book-reviews': 'AI & Data', 'trump-tweet-device': 'AI & Data',
  'bav-fastfood-brands': 'Markets & Industry', 'nyc-zip-health': 'Public Health', 'zip-psychographic-baseline': 'Demographics',
  'renthop-listings': 'Markets & Industry', 'progresso-pricing-workbook': 'Pricing & CPG', 'progresso-soup-scanner': 'Pricing & CPG',
  'us-president-state-1976-2024': 'Politics & Elections', 'president-state-by-candidate': 'Politics & Elections', 'us-election-state-county-1972-2016': 'Politics & Elections',
  'colorado-legalization-housing': 'Finance', 'zillow-state-zhvi-panel': 'Finance',
};
const CT = { csv: 'text/csv', parquet: 'application/vnd.apache.parquet', xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' };

const catalog = JSON.parse(fs.readFileSync(bpath('metadata/catalog.json'), 'utf8'));
const items = [];
let uploaded = 0;

for (const c of catalog) {
  const id = ID_MAP[c.source_relative_path];
  if (!id) { console.log('  no id for', c.source_relative_path); continue; }
  const ext = c.format;
  const cleanBase = `${id}.${ext}`;
  const key = `${PREFIX}/${id}/${cleanBase}`;

  // columns from the per-file metadata json
  let columns = [];
  try {
    const meta = JSON.parse(fs.readFileSync(bpath(c.bundle_metadata_json_relative_path), 'utf8'));
    const table = (meta.tables || [])[0];
    columns = (table?.columns || []).map(col => ({
      name: col.name,
      dtype: String(col.dtype || '').split(' ')[0],
      nullPct: col.null_pct ?? null,
      unique: col.unique_count ?? null,
      examples: (col.examples || []).slice(0, 3),
    }));
  } catch { /* some formats (xlsx) may not have a clean column profile */ }

  // upload the data file
  if (!process.env.SKIP_UPLOAD) {
    const body = fs.readFileSync(bpath(c.bundle_data_relative_path));
    await client.send(new PutObjectCommand({
      Bucket: DST, Key: key, Body: body,
      ContentType: CT[ext] || 'application/octet-stream',
      ContentDisposition: `attachment; filename="${cleanBase}"`,
      CacheControl: 'public, max-age=3600',
    }));
    uploaded++;
    console.log(`  uploaded ${key} (${Math.round(c.size_bytes / 1024)}KB)`);
  }

  items.push({
    id, type: 'dataset',
    title: c.title,
    description: c.description || '',
    topic: TOPIC_MAP[id] || 'Other',
    tags: (c.domain_tags || []).slice(0, 4),
    format: ext,
    rows: c.row_count ?? null,
    cols: c.column_count ?? null,
    grain: c.grain || '',
    useCases: c.potential_use_cases || [],
    source: c.related_context || '',
    confidence: c.context_confidence || '',
    sizeBytes: c.size_bytes ?? null,
    sha256: c.sha256 || '',
    file: key,
    accent: '#46688f',
    featured: false,
    status: 'published',
    columns,
  });
}

const manifest = {
  _README: 'Dataset registry for the vishalsingh.org gallery. Edit to curate (status, featured, topic, tags, title, description). Hub reads via ISR; `file` is relative to the content base URL.',
  generated: new Date().toISOString().slice(0, 10),
  count: items.length,
  items,
};
await client.send(new PutObjectCommand({
  Bucket: DST, Key: `${PREFIX}/manifest.json`,
  Body: JSON.stringify(manifest, null, 2),
  ContentType: 'application/json', CacheControl: 'public, max-age=60',
}));
console.log(`Uploaded ${uploaded} data files. Wrote ${DST}:${PREFIX}/manifest.json with ${items.length} datasets.`);
