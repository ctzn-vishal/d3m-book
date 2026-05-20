import type { Metadata } from 'next';
import { BookShell } from '@/components/Book/BookShell';
import { book, findArticle } from '@/lib/book-toc';
import Article from './article.mdx';

export const metadata: Metadata = {
  title: `§12.1 Difference-in-Differences | ${book.title}`,
  description:
    'Difference-in-differences as a comparison of changes, with parallel trends as the key identifying assumption.',
};

export default function Page() {
  return (
    <BookShell slug="ch18-difference-in-differences" book={book} findArticle={findArticle}>
      <Article />
    </BookShell>
  );
}
