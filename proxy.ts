import { NextResponse, type NextRequest } from 'next/server';
import { ADMIN_COOKIE, isValidSession } from '@/lib/admin-auth';

/**
 * Guards /admin (pages) and /api/admin/* (mutations) behind the shared-password
 * session cookie. The login page + login/logout endpoints are exempt. Fails
 * CLOSED: with no ADMIN_SECRET set, isValidSession is always false, so /admin is
 * locked rather than open.
 */
const EXEMPT = new Set(['/admin/login', '/api/admin/login', '/api/admin/logout']);

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (EXEMPT.has(pathname)) return NextResponse.next();

  if (await isValidSession(req.cookies.get(ADMIN_COOKIE)?.value)) {
    return NextResponse.next();
  }

  if (pathname.startsWith('/api/')) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }
  const url = req.nextUrl.clone();
  url.pathname = '/admin/login';
  url.search = '';
  url.searchParams.set('next', pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ['/admin', '/admin/:path*', '/api/admin/:path*'],
};
