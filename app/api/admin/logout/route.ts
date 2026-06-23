import { NextResponse } from 'next/server';
import { ADMIN_COOKIE } from '@/lib/admin-auth';

/** Reject cross-origin POSTs so a third-party page can't force-logout the admin. */
function sameOrigin(req: Request): boolean {
  const origin = req.headers.get('origin');
  if (!origin) return true;
  try { return new URL(origin).host === new URL(req.url).host; } catch { return false; }
}

export async function POST(req: Request) {
  if (!sameOrigin(req)) return NextResponse.json({ ok: false, error: 'bad origin' }, { status: 403 });
  const res = NextResponse.redirect(new URL('/admin/login', req.url), { status: 303 });
  res.cookies.set(ADMIN_COOKIE, '', { httpOnly: true, path: '/', maxAge: 0 });
  return res;
}
