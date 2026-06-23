/**
 * Shared auth for /admin — a single shared password (`ADMIN_SECRET`).
 *
 * On login the password is checked against ADMIN_SECRET; on success we set an
 * httpOnly cookie whose value is an opaque hash of the secret (so the raw secret
 * is never the cookie). middleware.ts verifies that cookie on every /admin and
 * /api/admin request. Uses Web Crypto only (no node:crypto) so it runs in BOTH
 * the edge middleware and Node route handlers / server actions.
 */
export const ADMIN_COOKIE = 'vs_admin';
export const ADMIN_COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const buf = await crypto.subtle.digest('SHA-256', data);
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
}

/** Opaque cookie value derived from the secret. */
export function sessionToken(secret: string): Promise<string> {
  return sha256Hex(`vsadmin:v1:${secret}`);
}

/** Length-independent constant-time-ish compare. */
export function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/** True when the request cookie matches the configured ADMIN_SECRET. */
export async function isValidSession(cookieValue: string | undefined): Promise<boolean> {
  const secret = process.env.ADMIN_SECRET;
  if (!secret || !cookieValue) return false;
  return safeEqual(cookieValue, await sessionToken(secret));
}
