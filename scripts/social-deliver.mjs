// pnpm social-deliver — hand APPROVED X drafts in the social_queue to Typefully
// as scheduled drafts (posted at your next free slot), then mark them 'posted'.
// The optional delivery leg of the Level-2 social pipeline: generation is
// social-drafts.ts, review is /admin/social, this is the X delivery adapter.
//
// LinkedIn and Instagram are intentionally NOT auto-delivered — their APIs are
// hostile to personal-account automation. Post those via the Copy button in
// /admin/social, then "Mark posted". Approved non-X drafts are listed here as a
// reminder.
//
// No-ops politely when TYPEFULLY_API_KEY is unset, so the daily cron is safe to
// run before the account is connected. Get a key: typefully.com → Settings → API.
// Run: pnpm social-deliver   (needs TURSO_* + TYPEFULLY_API_KEY in .env.local / CI)
import { createClient } from '@libsql/client';

const KEY = (process.env.TYPEFULLY_API_KEY || '').trim();

// ── Turso connect (direct token, else mint a DB-scoped token) ──
async function bearer(token, path, init) {
  const r = await fetch(`https://api.turso.tech${path}`, { ...init, headers: { Authorization: `Bearer ${token}`, ...(init?.headers ?? {}) } });
  if (!r.ok) throw new Error(`platform API ${path} → ${r.status}`);
  return r.json();
}
async function mint(token, host) {
  const slug = (await bearer(token, '/v1/organizations'))[0]?.slug;
  const dbs = (await bearer(token, `/v1/organizations/${slug}/databases`)).databases ?? [];
  const m = dbs.find(d => d.Hostname === host || d.hostname === host);
  const dbName = m?.Name ?? host.split('.')[0];
  const { jwt } = await bearer(token, `/v1/organizations/${slug}/databases/${dbName}/auth/tokens?authorization=full-access&expiration=1d`, { method: 'POST' });
  return jwt;
}
async function connect() {
  const url = process.env.TURSO_DATABASE_URL;
  if (!url) throw new Error('TURSO_DATABASE_URL missing');
  const token = process.env.TURSO_AUTH_TOKEN;
  const host = new URL(url.replace(/^libsql:/, 'https:')).host;
  if (token) { try { const c = createClient({ url, authToken: token }); await c.execute('SELECT 1'); return c; } catch { /* fall through to mint */ } }
  if (!token) throw new Error('TURSO_AUTH_TOKEN missing');
  const c = createClient({ url, authToken: await mint(token, host) });
  await c.execute('SELECT 1');
  return c;
}

const db = await connect();
let approved;
try {
  approved = (await db.execute("SELECT * FROM social_queue WHERE status='approved'")).rows;
} catch (e) {
  if (/no such table/i.test(e.message ?? '')) { console.log('No social_queue table yet — run pnpm social-drafts first.'); process.exit(0); }
  throw e;
}

const xDrafts = approved.filter(r => r.platform === 'x');
const manual = approved.filter(r => r.platform !== 'x');

if (manual.length) {
  console.log(`${manual.length} approved post(s) awaiting MANUAL delivery (Copy from /admin/social, then Mark posted):`);
  for (const m of manual) console.log(`  · [${m.platform}] ${m.item_id}`);
}

if (!xDrafts.length) { console.log('No approved X drafts to deliver.'); process.exit(0); }
if (!KEY) {
  console.log(`TYPEFULLY_API_KEY not set — ${xDrafts.length} approved X draft(s) left in the queue (deliver manually or add the key).`);
  process.exit(0);
}

let sent = 0, failed = 0;
for (const d of xDrafts) {
  // Post text, then the UTM'd link as a reply tweet (4 newlines = tweet split).
  const content = `${d.text}\n\n\n\n${d.link_url}`;
  try {
    const res = await fetch('https://api.typefully.com/v1/drafts/', {
      method: 'POST',
      headers: { 'X-API-KEY': `Bearer ${KEY}`, 'content-type': 'application/json' },
      body: JSON.stringify({ content, 'schedule-date': 'next-free-slot' }),
    });
    if (!res.ok) throw new Error(`Typefully API → ${res.status} ${(await res.text()).slice(0, 200)}`);
    await db.execute({
      sql: "UPDATE social_queue SET status='posted', posted_at=datetime('now'), updated_at=datetime('now') WHERE id=?",
      args: [d.id],
    });
    sent++;
    console.log(`  ✓ ${d.id} → Typefully (next free slot)`);
  } catch (e) {
    failed++;
    console.warn(`  ! ${d.id}: ${e.message} — left as approved.`);
  }
}
console.log(`Delivered ${sent}/${xDrafts.length} X draft(s) to Typefully${failed ? `, ${failed} failed` : ''}.`);
process.exit(failed ? 1 : 0);
