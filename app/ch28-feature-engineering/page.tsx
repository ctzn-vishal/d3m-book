import type { Metadata } from 'next';
import { BookShell } from '@/components/Book/BookShell';
import { book, findArticle } from '@/lib/book-toc';
import Article from './article.mdx';

export const metadata: Metadata = {
  title: `§14.4 Feature Engineering | ${book.title}`,
  description:
    'Feature engineering is where business knowledge becomes model input — and where, in the AutoML era, most managerial value concentrates.',
};

export default function Page() {
  return (
    <BookShell slug="ch28-feature-engineering" book={book} findArticle={findArticle}>
      <Article />
    </BookShell>
  );
}
