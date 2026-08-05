/**
 * What counts as an "uncurated" gallery row — the single definition shared by
 * the `pnpm curate-new` CLI (scripts/curate-new.ts) and the /admin curation
 * queue, so the count you see in the UI is the same set the script would pick
 * up. Kept dependency-free (no DB, no snapshot, no server-only imports) so the
 * client-side admin table can import it directly.
 *
 * A freshly ingested HTML article lands with a title, a description, and an
 * href, but no topic and no meaningful tags — those are the human curation
 * step, and they are what this module detects.
 */

/**
 * Tags that carry no information: every ingested row gets one of these from its
 * artifact class, so a row tagged ONLY with these is effectively untagged.
 */
export const GENERIC_TAGS = new Set(['data story', 'dataset', 'studio', 'app']);

export function tagsAreGeneric(tags: readonly string[]): boolean {
  return tags.length === 0 || tags.every(t => GENERIC_TAGS.has(t.toLowerCase()));
}

/** The curated fields a row is still missing. Empty array = fully curated. */
export type CurationGap = 'topic' | 'tags';

export function curationGaps(row: { topic?: string | null; tags?: readonly string[] }): CurationGap[] {
  const gaps: CurationGap[] = [];
  if (!row.topic || row.topic === 'Other') gaps.push('topic');
  if (tagsAreGeneric(row.tags ?? [])) gaps.push('tags');
  return gaps;
}

export function needsCuration(row: { topic?: string | null; tags?: readonly string[] }): boolean {
  return curationGaps(row).length > 0;
}
