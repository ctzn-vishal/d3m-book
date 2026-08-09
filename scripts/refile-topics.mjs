#!/usr/bin/env node
/**
 * Apply content/refile-plan.json to the Turso `gallery` table.
 *
 * Bulk re-filing through the admin UI means dozens of individual clicks, which
 * is how a taxonomy drifts in the first place. This makes the same change a
 * reviewable diff: the plan is committed, the run is idempotent, and a stale id
 * is loud rather than silently skipped.
 *
 *   pnpm refile:dry    # show the diff, write nothing
 *   pnpm refile        # apply
 *
 * Only rows whose values actually differ are written, so re-running after a
 * partial failure costs nothing and reports "0 to change" once it has landed.
 * `updated_at` bumps only on rows that really changed.
 */

import { createClient } from '@libsql/client';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { TOPICS } from '../lib/taxonomy.ts';

const DRY = process.argv.includes('--dry-run');
const read = p => readFile(fileURLToPath(new URL(p, import.meta.url)), 'utf8');

const plan = JSON.parse(await read('../content/refile-plan.json'));
const collections = JSON.parse(await read('../content/collections.json')).collections;

const validTopics = new Set(TOPICS);
const validCollections = new Set(collections.map(c => c.slug));

// ── Validate the plan before touching the database ─────────────────────────
// A typo'd topic would otherwise write an uncontrolled value (there is no CHECK
// constraint on `topic`), and a typo'd collection slug would file a row into a
// collection with no hub. Fail the whole run rather than write half of it.
const problems = [];
const seen = new Set();
for (const e of plan.entries) {
  if (!e.id) problems.push('entry with no id');
  if (seen.has(e.id)) problems.push(`duplicate entry: ${e.id}`);
  seen.add(e.id);
  if (e.topic !== undefined && e.topic !== null && !validTopics.has(e.topic)) {
    problems.push(`${e.id}: unknown topic "${e.topic}"`);
  }
  if (e.collection !== undefined && e.collection !== null && !validCollections.has(e.collection)) {
    problems.push(`${e.id}: unknown collection "${e.collection}"`);
  }
  if (e.part !== undefined && e.part !== null && (!Number.isInteger(e.part) || e.part < 1)) {
    problems.push(`${e.id}: invalid part ${e.part}`);
  }
}
if (problems.length) {
  console.error('Plan is invalid — nothing was written:');
  for (const p of problems) console.error('  ' + p);
  process.exit(1);
}

const url = process.env.TURSO_DATABASE_URL;
if (!url) {
  console.error('TURSO_DATABASE_URL missing. Run via `pnpm refile` so .env.local is loaded.');
  process.exit(1);
}
const db = createClient({ url, authToken: process.env.TURSO_AUTH_TOKEN });

const current = new Map(
  (await db.execute('SELECT id, title, topic, collection, part FROM gallery')).rows.map(r => [
    r.id,
    { title: r.title, topic: r.topic ?? null, collection: r.collection ?? null, part: r.part ?? null },
  ])
);

const writes = [];
const missing = [];
let unchanged = 0;

for (const e of plan.entries) {
  const row = current.get(e.id);
  if (!row) {
    missing.push(e.id);
    continue;
  }
  const next = {
    topic: e.topic !== undefined ? e.topic : row.topic,
    collection: e.collection !== undefined ? e.collection : row.collection,
    part: e.part !== undefined ? e.part : row.part,
  };
  const diffs = [];
  if (next.topic !== row.topic) diffs.push(`topic: ${row.topic ?? '—'} → ${next.topic ?? '—'}`);
  if (next.collection !== row.collection) diffs.push(`collection: ${row.collection ?? '—'} → ${next.collection ?? '—'}`);
  if (Number(next.part ?? 0) !== Number(row.part ?? 0)) diffs.push(`part: ${row.part ?? '—'} → ${next.part ?? '—'}`);

  if (!diffs.length) {
    unchanged++;
    continue;
  }
  writes.push({ id: e.id, title: row.title, next, diffs });
}

console.log(`Plan: ${plan.entries.length} entries · ${writes.length} to change · ${unchanged} already correct · ${missing.length} not found\n`);

for (const w of writes) {
  console.log(`  ${w.id}`);
  console.log(`      ${String(w.title).slice(0, 70)}`);
  for (const d of w.diffs) console.log(`      ${d}`);
}

if (missing.length) {
  console.log('\n  NOT FOUND (id changed or row deleted — fix the plan):');
  for (const id of missing) console.log('    ' + id);
}

if (DRY) {
  console.log('\nDRY RUN — nothing written.');
  process.exit(missing.length ? 1 : 0);
}

if (writes.length) {
  await db.batch(
    writes.map(w => ({
      sql: "UPDATE gallery SET topic=?, collection=?, part=?, updated_at=datetime('now') WHERE id=?",
      args: [w.next.topic, w.next.collection, w.next.part, w.id],
    })),
    'write'
  );
}
console.log(`\nWrote ${writes.length} row(s).`);

// ── Post-run shape, so the result is visible without opening the site ──────
const after = await db.execute(
  "SELECT topic, COUNT(*) n FROM gallery WHERE status='published' GROUP BY topic ORDER BY n DESC"
);
console.log('\nPublished rows per topic:');
for (const r of after.rows) {
  const t = r.topic ?? '(no topic)';
  const flag = r.topic && !validTopics.has(r.topic) ? '   ← NOT IN VOCABULARY' : '';
  console.log(`  ${String(r.n).padStart(4)}  ${t}${flag}`);
}
console.log('\nNext: pnpm sync-registry && pnpm inject-chrome:dry');
