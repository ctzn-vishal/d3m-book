// Print a DB-scoped, non-expiring Turso token for the `gallery` registry DB —
// paste it into Vercel's TURSO_AUTH_TOKEN (Production) and book-template/.env.local
// so the live app + Drizzle Studio can read/write the table. The token in the repo
// .env is a PLATFORM token (no DB scope) that the app/Studio will 401 on.
// Run: pnpm mint-db-token   (node --env-file=../.env scripts/mint-db-token.mjs)
import { mintDbToken } from './_turso.mjs';

const url = process.env.TURSO_DATABASE_URL;
if (!url) { console.error('TURSO_DATABASE_URL missing.'); process.exit(1); }
const host = new URL(url.replace(/^libsql:/, 'https:')).host;
const { jwt, dbName } = await mintDbToken(process.env.TURSO_AUTH_TOKEN, host); // no expiration → long-lived

console.log(`\nDB-scoped token for "${dbName}". Paste as TURSO_AUTH_TOKEN in:`);
console.log('  • Vercel → Project → Settings → Environment Variables (Production), then redeploy');
console.log('  • book-template/.env.local  (for local Drizzle Studio + dev)\n');
console.log(jwt + '\n');
process.exit(0);
