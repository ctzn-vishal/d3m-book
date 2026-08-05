'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { withDb } from '@/lib/turso-admin';
import { ADMIN_COOKIE, isValidSession } from '@/lib/admin-auth';
import { TYPE_OPTIONS, STATUS_OPTIONS, TOPIC_OPTIONS, TEACHING_OPTIONS, type RowPatch, type ActionResult } from './types';

/**
 * Server actions for /admin v1 — metadata curation of EXISTING rows only.
 * Every action re-checks the session cookie (defence in depth on top of
 * middleware), validates against the same vocabulary the CHECK constraints
 * enforce, writes live Turso, and revalidates the gallery so edits show in
 * seconds. The committed snapshot is NOT touched here (serverless can't commit) —
 * it's refreshed by `pnpm sync-registry` / the nightly action.
 */
async function assertAuthed() {
  const cookie = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (!(await isValidSession(cookie))) throw new Error('unauthorized');
}

function normalizeTags(tags: string[]): string[] {
  return [...new Set(tags.map(t => t.trim()).filter(Boolean))].slice(0, 12);
}

function bumpAndRevalidate() {
  revalidatePath('/');
  revalidatePath('/admin');
}

/** Patch one or more curated columns on a single row. */
export async function updateRow(id: string, patch: RowPatch): Promise<ActionResult> {
  try {
    await assertAuthed();
    if (!id) throw new Error('missing id');

    const sets: string[] = [];
    const args: (string | number | null)[] = [];

    if (patch.type !== undefined) {
      if (!TYPE_OPTIONS.includes(patch.type)) throw new Error(`invalid type: ${patch.type}`);
      sets.push('type=?'); args.push(patch.type);
    }
    if (patch.status !== undefined) {
      if (!STATUS_OPTIONS.includes(patch.status)) throw new Error(`invalid status: ${patch.status}`);
      sets.push('status=?'); args.push(patch.status);
    }
    if (patch.featured !== undefined) {
      sets.push('featured=?'); args.push(patch.featured ? 1 : 0);
    }
    if (patch.topic !== undefined) {
      const topic = patch.topic ? patch.topic.trim() : '';
      if (topic && !TOPIC_OPTIONS.includes(topic)) throw new Error(`invalid topic: ${topic}`);
      sets.push('topic=?'); args.push(topic || null);
    }
    if (patch.title !== undefined) {
      const title = patch.title.trim();
      if (!title) throw new Error('title cannot be empty');
      sets.push('title=?'); args.push(title);
    }
    if (patch.description !== undefined) {
      sets.push('description=?'); args.push(patch.description.trim());
    }
    if (patch.tags !== undefined) {
      sets.push('tags=?'); args.push(JSON.stringify(normalizeTags(patch.tags)));
    }
    if (patch.teaching !== undefined) {
      const teaching = patch.teaching ? patch.teaching.trim() : '';
      // Validate against the live TOC: an unknown slug wouldn't error at read
      // time, it would just never match a chapter and the pairing would vanish.
      if (teaching && !TEACHING_OPTIONS.some(o => o.slug === teaching)) {
        throw new Error(`unknown chapter slug: ${teaching}`);
      }
      sets.push('teaching=?'); args.push(teaching || null);
    }

    if (!sets.length) return { ok: true };
    sets.push("updated_at=datetime('now')");
    await withDb(db => db.execute({ sql: `UPDATE gallery SET ${sets.join(', ')} WHERE id=?`, args: [...args, id] }));
    bumpAndRevalidate();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message || 'Unknown error' };
  }
}

/**
 * Persist a new display order. `orderedIds` is the full list in display order;
 * each row's `sort` becomes its index. Only rows whose sort actually changed are
 * written (so a no-op drag, or dragging one row, touches the minimum). `sort` is
 * ordering metadata, so this does NOT bump updated_at.
 */
export async function reorder(orderedIds: string[]): Promise<ActionResult> {
  try {
    await assertAuthed();
    await withDb(async db => {
      const cur = new Map(
        (await db.execute('SELECT id, sort FROM gallery')).rows.map(r => [r.id as string, Number(r.sort)])
      );
      const writes = orderedIds
        .map((id, i) => ({ id, i }))
        .filter(({ id, i }) => cur.has(id) && cur.get(id) !== i)
        .map(({ id, i }) => ({ sql: 'UPDATE gallery SET sort=? WHERE id=?', args: [i, id] as (string | number)[] }));
      if (writes.length) await db.batch(writes, 'write');
    });
    bumpAndRevalidate();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message || 'Unknown error' };
  }
}
