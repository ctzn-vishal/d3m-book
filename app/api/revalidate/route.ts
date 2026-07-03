import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { rateLimit, clientIp } from '@/lib/rate-limit';

/**
 * On-demand refresh for the gallery after the Tigris article manifest changes.
 * Point a Tigris bucket notification (or curl) at:
 *   POST /api/revalidate?secret=<REVALIDATE_SECRET>
 * Falls back to the ISR interval (page `revalidate`) if not configured.
 */
const REVALIDATE_LIMIT = 10;
const REVALIDATE_WINDOW_MS = 60 * 1000;

export async function POST(request: Request) {
  const secret = new URL(request.url).searchParams.get('secret');
  if (!process.env.REVALIDATE_SECRET || secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }

  const { ok: withinLimit, retryAfterMs } = rateLimit(
    `revalidate:${clientIp(request)}`,
    REVALIDATE_LIMIT,
    REVALIDATE_WINDOW_MS
  );
  if (!withinLimit) {
    return NextResponse.json(
      { ok: false, error: 'rate limited' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil(retryAfterMs / 1000)) } }
    );
  }

  revalidatePath('/');
  return NextResponse.json({ ok: true, revalidated: '/', at: Date.now() });
}
