'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';

/**
 * KeyboardNav — left/right arrow keys page between articles, matching the
 * prev/next footer links. Ignores keypresses while the reader is typing in
 * an input, or while a modifier is held (so it never fights browser
 * shortcuts or the ⌘K palette).
 */
export function KeyboardNav({
  prevSlug,
  nextSlug,
}: {
  prevSlug: string | null;
  nextSlug: string | null;
}) {
  const router = useRouter();

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const t = e.target as HTMLElement | null;
      if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) {
        return;
      }
      if (e.key === 'ArrowLeft' && prevSlug) {
        router.push(`/${prevSlug}`);
      } else if (e.key === 'ArrowRight' && nextSlug) {
        router.push(`/${nextSlug}`);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [prevSlug, nextSlug, router]);

  return null;
}
