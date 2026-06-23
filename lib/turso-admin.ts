import 'server-only';
import { createClient, type Client } from '@libsql/client';

/**
 * Server-only Turso connection that SELF-HEALS the token problem (§5.1).
 *
 * `TURSO_AUTH_TOKEN` may be a DB-scoped token (works directly) OR an org/platform
 * API token (the libsql DB endpoint 401s it). In the latter case we transparently
 * mint a short-lived DB-scoped token via the Turso Platform API — the same logic
 * scripts/_turso.mjs uses — so the live site + /admin work even when Vercel only
 * has a platform token. The working client is cached per server instance (mint
 * once), and failures reset so the next request retries instead of being stuck.
 *
 * Used by BOTH lib/registry-db.ts (live reads) and the /admin writes.
 */

let client: Client | null = null;
let mintedAt = 0;
let inflight: Promise<Client | null> | null = null;
let warned = false;
// The minted DB token is good for 1d; re-mint well before that (proactive), and
// also reset on a surfaced auth error (reactive, via withDb) so a long-lived
// serverless instance never gets stuck on an expired/revoked token.
const CLIENT_TTL_MS = 12 * 60 * 60 * 1000;

async function bearer(platformToken: string, path: string, init?: RequestInit) {
  const r = await fetch(`https://api.turso.tech${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${platformToken}`, ...(init?.headers ?? {}) },
  });
  if (!r.ok) throw new Error(`Turso platform API ${path} → ${r.status}`);
  return r.json();
}

/** Mint a DB-scoped, short-lived (1d) full-access token from a platform token. */
async function mintDbToken(platformToken: string, host: string): Promise<string> {
  const orgs = await bearer(platformToken, '/v1/organizations');
  const slug = orgs[0]?.slug;
  if (!slug) throw new Error('no organization slug from platform API');
  const dbs = (await bearer(platformToken, `/v1/organizations/${slug}/databases`)).databases ?? [];
  const dbName = dbs.find((d: any) => d.Hostname === host || d.hostname === host)?.Name ?? host.split('.')[0];
  const { jwt } = await bearer(
    platformToken,
    `/v1/organizations/${slug}/databases/${dbName}/auth/tokens?authorization=full-access&expiration=1d`,
    { method: 'POST' }
  );
  return jwt as string;
}

async function connect(): Promise<Client | null> {
  const url = process.env.TURSO_DATABASE_URL;
  const token = process.env.TURSO_AUTH_TOKEN;
  if (!url || !token) return null;
  const host = new URL(url.replace(/^libsql:/, 'https:')).host;

  // 1. Try the provided token directly (it may already be DB-scoped).
  try {
    const c = createClient({ url, authToken: token });
    await c.execute('SELECT 1');
    return c;
  } catch (e) {
    const isAuth = /401|unauthor/i.test((e as Error).message ?? '');
    if (!isAuth) throw e; // network/other → let connect() fail and retry later
  }

  // 2. Provided token was rejected (platform token) → mint a DB-scoped one.
  const jwt = await mintDbToken(token, host);
  const c = createClient({ url, authToken: jwt });
  await c.execute('SELECT 1');
  return c;
}

/**
 * Connected Turso client (mint-on-demand), or null when creds are missing or the
 * DB is unreachable — callers must handle null (read path falls back to the
 * snapshot; write path surfaces an error).
 */
export function getDbClient(): Promise<Client | null> {
  if (client && Date.now() - mintedAt < CLIENT_TTL_MS) return Promise.resolve(client);
  client = null; // stale (or none) → (re)connect, which re-mints if needed
  if (!inflight) {
    inflight = connect()
      .then(c => { client = c; mintedAt = Date.now(); inflight = null; return c; })
      .catch(e => {
        inflight = null;
        if (!warned) {
          warned = true;
          const msg = (e as Error).message ?? '';
          console.warn(
            /401|unauthor/i.test(msg)
              ? '[turso] auth failed — TURSO_AUTH_TOKEN is neither a DB-scoped token nor a usable platform token. Run `pnpm mint-db-token` and set it in Vercel.'
              : `[turso] connection failed — ${msg}`
          );
        }
        return null;
      });
  }
  return inflight;
}

/** Drop the cached client so the next getDbClient() reconnects and re-mints. */
export function resetDbClient(): void {
  client = null;
  mintedAt = 0;
}

/** Like getDbClient but throws if unavailable — for write paths that must not silently no-op. */
export async function requireDbClient(): Promise<Client> {
  const c = await getDbClient();
  if (!c) throw new Error('Turso unavailable — set TURSO_DATABASE_URL + a valid TURSO_AUTH_TOKEN.');
  return c;
}

function isAuthError(e: unknown): boolean {
  return /401|unauthor|expired|jwt|token/i.test((e as Error)?.message ?? '');
}

/**
 * Run a DB op; on an auth error (e.g. the minted token expired on a warm
 * instance), drop the cached client, re-mint, and retry ONCE. Use for writes so
 * a stale token self-heals instead of surfacing an error to the curator.
 */
export async function withDb<T>(fn: (db: Client) => Promise<T>): Promise<T> {
  try {
    return await fn(await requireDbClient());
  } catch (e) {
    if (!isAuthError(e)) throw e;
    resetDbClient();
    return fn(await requireDbClient());
  }
}

/** Cheap reachability check for the /api/registry-source health probe. */
export async function dbReachable(): Promise<boolean> {
  return (await getDbClient()) != null;
}
