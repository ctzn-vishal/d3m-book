#!/usr/bin/env node
/**
 * Fetch pre-computed JSON aggregates from a Tigris S3 bucket into
 * app/<slug>/data/. This is one example of how to populate per-article
 * data; replace the body of `fetchJson` with your own data source if
 * you don't use Tigris.
 *
 * Each article declares its data needs in `book.config.mjs` as a list of
 * { slug, files } where `files` is an array of:
 *   { graphId, filename }
 *
 * Usage:
 *   pnpm fetch-data                # fetch all articles
 *   pnpm fetch-data <slug>         # fetch one article's data
 *
 * The pnpm script invokes this with `node --env-file=.env` so .env is
 * loaded without needing the dotenv dependency.
 */

import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { writeFile, mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { articles } from '../book.config.mjs';

const requireEnv = (k) => {
  const v = process.env[k];
  if (!v) throw new Error(`Missing env ${k}. Check .env.`);
  return v;
};

const s3 = new S3Client({
  endpoint: requireEnv('TIGRIS_ENDPOINT'),
  credentials: {
    accessKeyId: requireEnv('TIGRIS_CLIENT_ID'),
    secretAccessKey: requireEnv('TIGRIS_CLIENT_SECRET'),
  },
  region: 'auto',
  forcePathStyle: false,
});
const bucket = requireEnv('TIGRIS_BUCKET_NAME');

async function fetchJson(key) {
  const resp = await s3.send(new GetObjectCommand({ Bucket: bucket, Key: key }));
  const body = await resp.Body.transformToString();
  return JSON.parse(body);
}

function keyFor(graphId) {
  const type = graphId.endsWith('_timetrend_demo') ? 'timetrend_demo' : 'timetrend';
  return `gss/2graph_jsons/${type}/${graphId}.json`;
}

async function fetchArticle(article) {
  const outDir = resolve(`app/${article.slug}/data`);
  await mkdir(outDir, { recursive: true });
  for (const file of article.files) {
    const key = keyFor(file.graphId);
    process.stdout.write(`  → ${file.filename} ${key}\n`);
    const data = await fetchJson(key);
    const outPath = `${outDir}/${file.filename}`;
    await writeFile(outPath, JSON.stringify(data, null, 2));
    process.stdout.write(`    ✓ ${outPath}\n`);
  }
}

async function main() {
  const target = process.argv[2];
  const todo = target ? articles.filter((a) => a.slug === target) : articles;
  if (target && todo.length === 0) {
    throw new Error(`No article with slug "${target}". Available: ${articles.map((a) => a.slug).join(', ')}`);
  }
  for (const article of todo) {
    process.stdout.write(`▼ ${article.slug}\n`);
    await fetchArticle(article);
  }
  process.stdout.write(`✅ Done\n`);
}

main().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});
