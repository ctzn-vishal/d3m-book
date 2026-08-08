'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { withDb } from '@/lib/turso-admin';
import { ADMIN_COOKIE, isValidSession } from '@/lib/admin-auth';
import {
  TYPE_OPTIONS,
  STATUS_OPTIONS,
  TOPIC_OPTIONS,
  TEACHING_OPTIONS,
  type RowPatch,
  type BulkPatch,
  type ActionResult,
} from './types';

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

/**
 * Accepts a `YYYY-MM-DD` date from the admin's date input and stores it in the
 * same `YYYY-MM-DD HH:MM:SS` UTC shape Turso already holds, so sorting stays a
 * plain string comparison. Empty clears the field.
 */
function normalizeDate(value: string | null): string | null {
  const v = (value ?? '').trim();
  if (!v) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v);
  if (!m) throw new Error(`invalid date (expected YYYY-MM-DD): ${v}`);
  const d = new Date(`${v}T00:00:00Z`);
  if (Number.isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== v) {
    throw new Error(`not a real date: ${v}`);
  }
  return `${v} 00:00:00`;
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
    if (patch.createdAt !== undefined) {
      sets.push('created_at=?'); args.push(normalizeDate(patch.createdAt));
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
 * Apply one patch to many rows in a single write.
 *
 * This exists for the taxonomy work: re-filing ~40 items one row at a time is
 * exactly how a vocabulary drifts in the first place. Validates once, then
 * issues a single batched UPDATE so a 40-row re-topic is one round trip rather
 * than 40 — and either all of it lands or none of it does.
 */
export async function updateRows(ids: string[], patch: BulkPatch): Promise<ActionResult> {
  try {
    await assertAuthed();
    const unique = [...new Set(ids.filter(Boolean))];
    if (!unique.length) throw new Error('no rows selected');

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
    if (!sets.length) throw new Error('nothing to change');

    sets.push("updated_at=datetime('now')");
    const placeholders = unique.map(() => '?').join(',');
    await withDb(db =>
      db.execute({
        sql: `UPDATE gallery SET ${sets.join(', ')} WHERE id IN (${placeholders})`,
        args: [...args, ...unique],
      })
    );
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
