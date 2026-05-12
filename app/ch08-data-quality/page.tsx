import type { Metadata } from 'next';
import { BookShell } from '@/components/Book/BookShell';
import { book, findArticle } from '@/lib/book-toc';
import Article from './article.mdx';

export const metadata: Metadata = {
  title: `§8 Data Quality | ${book.title}`,
  description:
    'A data quality problem is usually a business process problem in disguise. The cheapest defense is to treat data hygiene as governance, not engineering.',
};

export default function Page() {
  return (
    <BookShell slug="ch08-data-quality" book={book} findArticle={findArticle}>
      <Article />
    </BookShell>
  );
}
