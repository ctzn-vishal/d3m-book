/**
 * In-memory fixed-window rate limiter for the admin login and revalidate
 * endpoints (design review P1.4). Per server instance — resets on cold
 * start/redeploy and isn't shared across concurrent Vercel instances, so
 * it's not a hard guarantee. For this site's threat model (a single shared
 * admin password, a single revalidate secret, no user accounts to protect)
 * that's an accepted tradeoff: it raises the cost of a brute-force attempt
 * without adding a Redis/Upstash dependency. Do not reach for this where a
 * real guarantee is required.
 */
type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

// Cheap safeguard against unbounded growth from spoofed/varying keys — not
// exact LRU, just a full reset once the map gets implausibly large for this
// site's traffic.
const MAX_BUCKETS = 5000;

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): { ok: boolean; retryAfterMs: number } {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || now >= bucket.resetAt) {
    if (buckets.size >= MAX_BUCKETS) buckets.clear();
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, retryAfterMs: 0 };
  }
  if (bucket.count >= limit) {
    return { ok: false, retryAfterMs: bucket.resetAt - now };
  }
  bucket.count++;
  return { ok: true, retryAfterMs: 0 };
}

/** Best-effort client IP from the standard proxy header (Vercel sets this). */
export function clientIp(req: Request): string {
  const xff = req.headers.get('x-forwarded-for');
  if (xff) return xff.split(',')[0].trim();
  return 'unknown';
}
