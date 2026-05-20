import type { Metadata } from 'next';
import { BookShell } from '@/components/Book/BookShell';
import { book, findArticle } from '@/lib/book-toc';
import Article from './article.mdx';

export const metadata: Metadata = {
  title: `§14.2 The Supervised Learning Setup | ${book.title}`,
  description:
    'Target, features, unit of prediction, and label timing — the vocabulary every supervised model relies on.',
};

export default function Page() {
  return (
    <BookShell slug="ch26-supervised-setup" book={book} findArticle={findArticle}>
      <Article />
    </BookShell>
  );
}
