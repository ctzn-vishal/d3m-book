// One-off (idempotent) migration: rebuild the Turso `gallery` table WITH CHECK
// constraints so the CMS only accepts valid values (type ∈ App/Teaching/Blog/
// Dataset, status ∈ published/hidden/draft, the boolean flags ∈ 0/1). SQLite
// can't ALTER TABLE ADD CONSTRAINT, so we recreate + copy in a transaction.
// Safe to re-run: skips if the table already has CHECK constraints.
// Run: pnpm migrate-gallery   (node --env-file=../.env scripts/migrate-gallery.mjs)
import { connectTurso } from './_turso.mjs';

const COLS = 'id, type, title, description, domain, topic, tags, teaching, href, external, open_in_new_tab, thumbnail, accent, featured, status, sort';
const CREATE_WITH_CHECKS = `CREATE TABLE gallery_new (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('App','Teaching','Blog','Dataset')),
  title TEXT NOT NULL,
  description TEXT,
  domain TEXT,
  topic TEXT,
  tags TEXT,
  teaching TEXT,
  href TEXT NOT NULL,
  external INTEGER NOT NULL DEFAULT 0 CHECK (external IN (0,1)),
  open_in_new_tab INTEGER NOT NULL DEFAULT 0 CHECK (open_in_new_tab IN (0,1)),
  thumbnail TEXT,
  accent TEXT,
  featured INTEGER NOT NULL DEFAULT 0 CHECK (featured IN (0,1)),
  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('published','hidden','draft')),
  sort INTEGER NOT NULL DEFAULT 0
)`;

const db = await connectTurso(process.env.TURSO_DATABASE_URL, process.env.TURSO_AUTH_TOKEN);

const existing = (await db.execute("SELECT sql FROM sqlite_master WHERE type='table' AND name='gallery'")).rows[0];
if (!existing) { console.error('No `gallery` table found — run `pnpm sync-registry` first.'); process.exit(1); }
if (String(existing.sql).toUpperCase().includes('CHECK')) {
  console.log('gallery already has CHECK constraints — nothing to do.');
  process.exit(0);
}

const before = (await db.execute('SELECT COUNT(*) n FROM gallery')).rows[0].n;
await db.batch([
  CREATE_WITH_CHECKS,
  `INSERT INTO gallery_new (${COLS}) SELECT ${COLS} FROM gallery`,
  'DROP TABLE gallery',
  'ALTER TABLE gallery_new RENAME TO gallery',
], 'write');
const after = (await db.execute('SELECT COUNT(*) n FROM gallery')).rows[0].n;
console.log(`Migrated gallery with CHECK constraints. Rows: ${before} → ${after}.`);
process.exit(0);
