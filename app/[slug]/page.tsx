import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { BookShell } from '@/components/Book/BookShell';
import { book, findArticle, getAllSlugs } from '@/lib/book-toc';
import { createArticleMetadata } from '@/lib/share-metadata';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllSlugs().map(slug => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const found = findArticle(slug);
  if (!found) {
    return { title: 'Not found' };
  }
  const description = `${found.article.title}, an article from ${book.title}.`;
  return createArticleMetadata(slug, description);
}

/**
 * Fallback for book-toc entries without a static app/<slug>/ directory yet.
 * Published articles are expected to always have a matching directory —
 * scripts/verify-book.mjs asserts that at build time — so reaching here with
 * a published article means the build check was bypassed; treat it as a
 * real 404 rather than serving a soft "not yet written" placeholder at a
 * sitemap-listed URL.
 */
export default async function BookArticlePage({ params }: Props) {
  const { slug } = await params;
  const found = findArticle(slug);
  if (!found) {
    notFound();
  }
  if (found.article.status === 'published') {
    notFound();
  }

  return (
    <BookShell slug={slug}>
      <p className="text-muted italic">
        This article is not yet written. The chapter scaffolding, navigation,
        and design system are ready — the prose will land in a future commit.
      </p>
      <p className="text-muted">
        Status: <span className="font-mono">{found.article.status}</span>
      </p>
    </BookShell>
  );
}
