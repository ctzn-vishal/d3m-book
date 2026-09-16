// Snapshot every HTML file in the content bucket to a dated prefix, server-side.
//
// These files have no copy in git — they were authored in folders whose
// generating code is gone — so the pipeline's in-place rewrites (inject-chrome)
// are the only version of them. The front-matter pass is designed to be
// reversible inside each file, but "reversible" is a property of code that
// could still have a bug in it, and a bucket copy is not.
//
// Run before a pipeline change that touches file bodies:
//   pnpm backup-content            → copies to backup/<today>/…
//   pnpm backup-content --list     → what's already backed up
// Copies are server-side (CopyObjectCommand), so nothing moves over the wire.
import { S3Client, ListObjectsV2Command, CopyObjectCommand } from '@aws-sdk/client-s3';
import { CONTENT_BUCKET } from './pipeline-config.mjs';

const client = new S3Client({
  region: process.env.AWS_REGION || 'auto',
  endpoint: process.env.TIGRIS_ENDPOINT,
  credentials: { accessKeyId: process.env.TIGRIS_CLIENT_ID, secretAccessKey: process.env.TIGRIS_CLIENT_SECRET },
  forcePathStyle: false,
});
const PREFIXES = ['articles', 'studios', 'apps'];
const STAMP = process.env.BACKUP_STAMP || new Date().toISOString().slice(0, 10);
const LIST = process.argv.includes('--list');

async function listAll(Prefix) {
  let token; const out = [];
  do {
    const r = await client.send(new ListObjectsV2Command({ Bucket: CONTENT_BUCKET, Prefix, ContinuationToken: token }));
    (r.Contents || []).forEach(o => out.push(o.Key));
    token = r.IsTruncated ? r.NextContinuationToken : undefined;
  } while (token);
  return out;
}
async function pool(items, n, fn) {
  let i = 0;
  await Promise.all(Array.from({ length: n }, async () => { while (i < items.length) await fn(items[i++]); }));
}

if (LIST) {
  const existing = await listAll('backup/');
  const byStamp = {};
  for (const key of existing) byStamp[key.split('/')[1]] = (byStamp[key.split('/')[1]] ?? 0) + 1;
  const stamps = Object.entries(byStamp).sort();
  console.log(stamps.length ? stamps.map(([s, n]) => `  backup/${s}/  ${n} file(s)`).join('\n') : '  (no backups yet)');
  process.exit(0);
}

const keys = [];
for (const p of PREFIXES) keys.push(...(await listAll(`${p}/`)).filter(k => k.endsWith('.html')));
console.log(`Copying ${keys.length} HTML file(s) to backup/${STAMP}/ in ${CONTENT_BUCKET}.`);

let done = 0, err = 0;
await pool(keys, 8, async key => {
  try {
    await client.send(new CopyObjectCommand({
      Bucket: CONTENT_BUCKET,
      // The source is a bucket-qualified, URL-encoded key.
      CopySource: `/${CONTENT_BUCKET}/${key.split('/').map(encodeURIComponent).join('/')}`,
      Key: `backup/${STAMP}/${key}`,
      ContentType: 'text/html; charset=utf-8',
      MetadataDirective: 'REPLACE',
    }));
    done++;
  } catch (e) { err++; console.log('  ERR', key, e.message); }
});
console.log(`Copied ${done} file(s) to backup/${STAMP}/ | errors: ${err}`);
