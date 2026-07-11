'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { withDb } from '@/lib/turso-admin';
import { ADMIN_COOKIE, isValidSession } from '@/lib/admin-auth';
import { SOCIAL_STATUSES, type SocialStatus, type ActionResult } from './types';

/**
 * Server actions for /admin/social — the human gate of the Level-2 social
 * pipeline. Drafts are created only by scripts/social-drafts.ts; here they can
 * be edited, approved, rejected, or marked posted. Same defence-in-depth as the
 * gallery actions: re-check the session cookie, validate against the CHECK
 * vocabulary, write live Turso.
 */
async function assertAuthed() {
  const cookie = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (!(await isValidSession(cookie))) throw new Error('unauthorized');
}

export async function updateDraftText(id: string, text: string): Promise<ActionResult> {
  try {
    await assertAuthed();
    if (!id) throw new Error('missing id');
    const body = text.trim();
    if (!body) throw new Error('post text cannot be empty');
    await withDb(db =>
      db.execute({
        sql: "UPDATE social_queue SET text=?, updated_at=datetime('now') WHERE id=?",
        args: [body, id],
      })
    );
    revalidatePath('/admin/social');
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message || 'Unknown error' };
  }
}

export async function setDraftStatus(id: string, status: SocialStatus): Promise<ActionResult> {
  try {
    await assertAuthed();
    if (!id) throw new Error('missing id');
    if (!SOCIAL_STATUSES.includes(status)) throw new Error(`invalid status: ${status}`);
    await withDb(db =>
      db.execute({
        sql: `UPDATE social_queue SET status=?, updated_at=datetime('now'),
              posted_at=${status === 'posted' ? "datetime('now')" : 'posted_at'} WHERE id=?`,
        args: [status, id],
      })
    );
    revalidatePath('/admin/social');
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message || 'Unknown error' };
  }
}
