import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

/**
 * On-demand refresh for the gallery after the Tigris article manifest changes.
 * Point a Tigris bucket notification (or curl) at:
 *   POST /api/revalidate?secret=<REVALIDATE_SECRET>
 * Falls back to the ISR interval (page `revalidate`) if not configured.
 */
export async function POST(request: Request) {
  const secret = new URL(request.url).searchParams.get('secret');
  if (!process.env.REVALIDATE_SECRET || secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }
  revalidatePath('/');
  return NextResponse.json({ ok: true, revalidated: '/', at: Date.now() });
}
