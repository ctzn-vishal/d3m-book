import type { ReactNode } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { getRegistryItem, contentUrl } from '@/lib/registry';

/**
 * In-book reference to a gallery artifact (studio, data story, app, dataset).
 * Resolves the item by id from the unified registry and links to it, opening in
 * a new tab — the same behavior as clicking it from the main gallery. Falls back
 * to the studio's bucket URL if the id isn't in the registry yet.
 *
 * Usage in MDX (globally available, no import needed):
 *   <CaseRef id="southwest-regression">the Southwest regression studio</CaseRef>
 *
 * Pass `from` (the current chapter slug) so the artifact's "back" pill returns to
 * that chapter:  <CaseRef id="…" from="ch06-regression">…</CaseRef>
 */
export function CaseRef({ id, from, children }: { id: string; from?: string; children?: ReactNode }) {
  const item = getRegistryItem(id);
  const base = item?.href ?? contentUrl(`studios/${id}/index.html`);
  const external = item ? item.external || !!item.openInNewTab : true;
  // Only thread ?from onto self-contained artifact HTML (which reads it for the
  // back-to-the-book pill); skip it for internal routes like /datasets/[id].
  const href = from && external ? `${base}${base.includes('?') ? '&' : '?'}from=${encodeURIComponent(from)}` : base;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="font-medium text-link no-underline hover:underline"
    >
      {children ?? item?.title ?? id}
      <ArrowUpRight size={13} strokeWidth={2.5} className="ml-0.5 inline-block align-[-1px]" />
    </a>
  );
}
