import { NextResponse } from 'next/server';
import { ADMIN_COOKIE, ADMIN_COOKIE_MAX_AGE, sessionToken, safeEqual } from '@/lib/admin-auth';
import { rateLimit, clientIp } from '@/lib/rate-limit';

/** Only allow redirecting back into the admin area (no open redirect). */
function sanitizeNext(n: string): string {
  return n.startsWith('/admin') && !n.startsWith('//') ? n : '/admin';
}

/** Reject cross-origin POSTs (CSRF). A genuine same-site form post sends a matching Origin. */
function sameOrigin(req: Request): boolean {
  const origin = req.headers.get('origin');
  if (!origin) return true; // some same-origin posts omit Origin; don't hard-block
  try { return new URL(origin).host === new URL(req.url).host; } catch { return false; }
}

// Single shared admin password — cap attempts per IP so it isn't brute-forceable.
const LOGIN_LIMIT = 5;
const LOGIN_WINDOW_MS = 15 * 60 * 1000;

export async function POST(req: Request) {
  if (!sameOrigin(req)) return NextResponse.json({ ok: false, error: 'bad origin' }, { status: 403 });

  const form = await req.formData();
  const next = sanitizeNext(String(form.get('next') ?? '/admin'));

  const { ok: withinLimit, retryAfterMs } = rateLimit(
    `admin-login:${clientIp(req)}`,
    LOGIN_LIMIT,
    LOGIN_WINDOW_MS
  );
  if (!withinLimit) {
    const url = new URL('/admin/login', req.url);
    url.searchParams.set('error', 'rate_limited');
    if (next !== '/admin') url.searchParams.set('next', next);
    return NextResponse.redirect(url, {
      status: 303,
      headers: { 'Retry-After': String(Math.ceil(retryAfterMs / 1000)) },
    });
  }

  const secret = process.env.ADMIN_SECRET;
  const password = String(form.get('password') ?? '');

  // Compare fixed-length hashes (not raw strings) so no password-length is leaked.
  const ok = !!secret && !!password && safeEqual(await sessionToken(password), await sessionToken(secret));
  if (!ok) {
    const url = new URL('/admin/login', req.url);
    url.searchParams.set('error', '1');
    if (next !== '/admin') url.searchParams.set('next', next);
    return NextResponse.redirect(url, { status: 303 });
  }

  const res = NextResponse.redirect(new URL(next, req.url), { status: 303 });
  res.cookies.set(ADMIN_COOKIE, await sessionToken(secret), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: ADMIN_COOKIE_MAX_AGE,
  });
  return res;
}
