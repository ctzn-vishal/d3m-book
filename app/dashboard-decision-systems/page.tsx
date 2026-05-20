import type { Metadata } from 'next';
import { BookShell } from '@/components/Book/BookShell';
import { book, findArticle } from '@/lib/book-toc';
import Article from './article.mdx';

export const metadata: Metadata = {
  title: `§8.1 Dashboard Decision Systems | ${book.title}`,
  description:
    'Dashboards should move from monitoring to diagnosis to decision. The soup dashboard becomes a critique and redesign case.',
};

export default function Page() {
  return (
    <BookShell slug="dashboard-decision-systems" book={book} findArticle={findArticle}>
      <Article />
    </BookShell>
  );
}
