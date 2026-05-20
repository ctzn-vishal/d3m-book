import type { Metadata } from 'next';
import { BookShell } from '@/components/Book/BookShell';
import { book, findArticle } from '@/lib/book-toc';
import Article from './article.mdx';

export const metadata: Metadata = {
  title: `§5.2 Chart Atlas | ${book.title}`,
  description:
    'A visual vocabulary for managers: common chart types, when to use them, what question they answer, and what can go wrong.',
};

export default function Page() {
  return (
    <BookShell slug="chart-atlas" book={book} findArticle={findArticle}>
      <Article />
    </BookShell>
  );
}
