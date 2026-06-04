import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { BookShell } from '@/components/Book/BookShell';
import { book, findArticle, getAllSlugs } from '@/lib/book-toc';
import { createPreviewMetadata } from '@/lib/share-metadata';

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
  const title = `§${found.article.number} ${found.article.title} | ${book.title}`;
  const description = `${found.article.title}, an article from ${book.title}.`;
  return {
    title,
    description,
    ...createPreviewMetadata({
      title,
      description,
      imagePath: `/${slug}/opengraph-image`,
      imageAlt: `${found.article.title} preview card`,
      type: 'article',
    }),
  };
}

export default async function BookArticlePage({ params }: Props) {
  const { slug } = await params;
  const found = findArticle(slug);
  if (!found) {
    notFound();
  }

  return (
    <BookShell slug={slug} book={book} findArticle={findArticle}>
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
