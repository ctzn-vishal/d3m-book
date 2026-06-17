import type { ReactNode } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { getGalleryItem } from '@/lib/gallery';

/**
 * In-book reference to a gallery artifact (case study, dashboard, data story).
 * Resolves the item by id from the unified registry and links to it, opening in
 * a new tab — the same behavior as clicking it from the main gallery. Falls back
 * to the studio HTML path if the id isn't in the registry yet.
 *
 * Usage in MDX (globally available, no import needed):
 *   <CaseRef id="southwest-regression">the Southwest regression studio</CaseRef>
 */
export function CaseRef({ id, children }: { id: string; children?: ReactNode }) {
  const item = getGalleryItem(id);
  const href = item?.href ?? `/studios/${id}/index.html`;
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
