import { NextResponse } from 'next/server';
import { getRegistrySource } from '@/lib/registry-db';

/**
 * Health probe: is the gallery reading LIVE Turso or the committed SNAPSHOT?
 * `live`     → curation edits in Turso reach the site (DB token is good).
 * `snapshot` → DB unreachable / token rejected; the site serves the committed
 *              fallback (edits won't show until the snapshot is regenerated).
 * GET /api/registry-source  →  { source: 'live' | 'snapshot' }
 */
export const dynamic = 'force-dynamic';

export async function GET() {
  const source = await getRegistrySource();
  return NextResponse.json(
    { source, at: new Date().toISOString() },
    { headers: { 'cache-control': 'no-store' } }
  );
}
