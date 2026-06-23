// One-off (idempotent) migration: add created_at / updated_at to the Turso
// `gallery` table so "last updated" is queryable (recency sort, "new" badges).
// SQLite's ALTER TABLE ADD COLUMN can't take a non-constant default
// (datetime('now') / CURRENT_TIMESTAMP are rejected), so we add the columns as
// nullable TEXT and backfill existing rows. Fresh tables get the columns WITH a
// datetime('now') default from CREATE TABLE (sync-registry.ts / migrate-gallery.mjs).
// Safe to re-run: skips columns that already exist; only backfills NULLs.
// Run: pnpm migrate-timestamps   (node --env-file=../.env scripts/migrate-timestamps.mjs)
import { connectTurso } from './_turso.mjs';

const url = process.env.TURSO_DATABASE_URL;
if (!url) { console.error('TURSO_DATABASE_URL missing — aborting.'); process.exit(1); }
const db = await connectTurso(url, process.env.TURSO_AUTH_TOKEN);

const table = (await db.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='gallery'")).rows[0];
if (!table) { console.error('No `gallery` table found — run `pnpm sync-registry` first.'); process.exit(1); }

const cols = new Set((await db.execute('PRAGMA table_info(gallery)')).rows.map(r => r.name));
let added = 0;
for (const col of ['created_at', 'updated_at']) {
  if (!cols.has(col)) { await db.execute(`ALTER TABLE gallery ADD COLUMN ${col} TEXT`); added++; }
}
// Backfill any NULLs (newly-added columns, or rows that predate them).
const r1 = await db.execute("UPDATE gallery SET created_at = datetime('now') WHERE created_at IS NULL");
const r2 = await db.execute("UPDATE gallery SET updated_at = datetime('now') WHERE updated_at IS NULL");
console.log(`Timestamps migration: ${added} column(s) added; backfilled created_at=${r1.rowsAffected ?? 0}, updated_at=${r2.rowsAffected ?? 0} row(s).`);
process.exit(0);
