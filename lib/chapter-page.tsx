import type { Metadata } from 'next';
import type { ComponentType } from 'react';
import { BookShell } from '@/components/Book/BookShell';
import { createArticleMetadata } from '@/lib/share-metadata';
import { getArticleDescription } from '@/lib/book-content';

/**
 * One call replaces the ~19-line boilerplate every chapter page.tsx used to
 * repeat by hand (metadata + BookShell wiring). The description lookup
 * throws at module-load time (i.e. at `next build`) if a slug is missing
 * from lib/book-content.ts#articleDescriptions, so a typo'd slug fails the
 * build instead of silently shipping a blank meta description.
 */
export function chapterPage(slug: string, Article: ComponentType) {
  const description = getArticleDescription(slug);
  if (!description) {
    throw new Error(
      `chapterPage("${slug}"): no entry in lib/book-content.ts#articleDescriptions for this slug.`
    );
  }
  const metadata: Metadata = createArticleMetadata(slug, description);

  function Page() {
    return (
      <BookShell slug={slug}>
        <Article />
      </BookShell>
    );
  }

  return { metadata, Page };
}
