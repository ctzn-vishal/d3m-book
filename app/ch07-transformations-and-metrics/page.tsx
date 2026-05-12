import type { Metadata } from 'next';
import { BookShell } from '@/components/Book/BookShell';
import { book, findArticle } from '@/lib/book-toc';
import Article from './article.mdx';

export const metadata: Metadata = {
  title: `§7 Transformations and Business Metrics | ${book.title}`,
  description:
    'Transformations are not cosmetic — they encode business judgment. Metrics are not raw data — they are definitions. Both decisions are quiet, both shape every report downstream.',
};

export default function Page() {
  return (
    <BookShell slug="ch07-transformations-and-metrics" book={book} findArticle={findArticle}>
      <Article />
    </BookShell>
  );
}
