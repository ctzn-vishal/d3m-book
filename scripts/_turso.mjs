// Shared Turso helpers for the maintenance scripts. TURSO_AUTH_TOKEN in the repo
// .env is an ORG/PLATFORM token (no DB scope) that the libsql DB endpoint 401s;
// these helpers transparently mint a DB-scoped token from it via the Turso
// Platform API. The DB name is resolved by matching the connection hostname
// against the org's database list (hostname is <db>-<org-slug>.<region>.turso.io).
import { createClient } from '@libsql/client';

export async function bearer(platformToken, path, init = {}) {
  const r = await fetch(`https://api.turso.tech${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${platformToken}`, ...(init.headers ?? {}) },
  });
  if (!r.ok) throw new Error(`Turso platform API ${path} → ${r.status}`);
  return r.json();
}

/** Mint a DB-scoped full-access token. `expiration` e.g. '1d'/'2w'; omit for non-expiring. */
export async function mintDbToken(platformToken, host, { expiration } = {}) {
  const orgs = await bearer(platformToken, '/v1/organizations');
  const slug = orgs[0]?.slug;
  if (!slug) throw new Error('no organization slug from platform API');
  const dbs = (await bearer(platformToken, `/v1/organizations/${slug}/databases`)).databases ?? [];
  const dbName = dbs.find(d => d.Hostname === host || d.hostname === host)?.Name ?? host.split('.')[0];
  const q = `authorization=full-access${expiration ? `&expiration=${expiration}` : ''}`;
  const { jwt } = await bearer(platformToken, `/v1/organizations/${slug}/databases/${dbName}/auth/tokens?${q}`, { method: 'POST' });
  return { jwt, dbName, slug };
}

/** Connect to the DB, minting a DB-scoped token if the provided one is rejected. */
export async function connectTurso(url, token) {
  const host = new URL(url.replace(/^libsql:/, 'https:')).host;
  if (token) {
    try { const c = createClient({ url, authToken: token }); await c.execute('SELECT 1'); return c; }
    catch { console.log('  · provided TURSO_AUTH_TOKEN rejected — minting a DB-scoped token via the platform API…'); }
  }
  if (!token) throw new Error('TURSO_AUTH_TOKEN missing');
  const { jwt } = await mintDbToken(token, host, { expiration: '1d' });
  const c = createClient({ url, authToken: jwt });
  await c.execute('SELECT 1');
  return c;
}
