import type { Metadata } from 'next';
import { BookShell } from '@/components/Book/BookShell';
import { book, findArticle } from '@/lib/book-toc';
import Article from './article.mdx';

export const metadata: Metadata = {
  title: `§5 Joining Data | ${book.title}`,
  description:
    'Joins are how business context enters a table. They are also how duplicate explosions and missing matches enter the dashboard. The defense is the grain.',
};

export default function Page() {
  return (
    <BookShell slug="ch05-joining-data" book={book} findArticle={findArticle}>
      <Article />
    </BookShell>
  );
}
