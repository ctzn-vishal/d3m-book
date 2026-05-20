import type { Metadata } from 'next';
import { BookShell } from '@/components/Book/BookShell';
import { book, findArticle } from '@/lib/book-toc';
import Article from './article.mdx';

export const metadata: Metadata = {
  title: `§23.1 The Data Product View | ${book.title}`,
  description:
    'Treating cards, memos, dashboards, studios, and case packs as products with owners, versions, and refresh cadences.',
};

export default function Page() {
  return (
    <BookShell slug="ch54-data-product-view" book={book} findArticle={findArticle}>
      <Article />
    </BookShell>
  );
}
