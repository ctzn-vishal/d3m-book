import type { Metadata } from 'next';
import { BookShell } from '@/components/Book/BookShell';
import { book, findArticle } from '@/lib/book-toc';
import Article from './article.mdx';

export const metadata: Metadata = {
  title: `§1 What Is a Dataset? | ${book.title}`,
  description:
    'Before asking what model to use, ask what one row means. The same week of Bean & Basket sales tells two stories when you change the grain.',
};

export default function Page() {
  return (
    <BookShell slug="ch01-what-is-a-dataset" book={book} findArticle={findArticle}>
      <Article />
    </BookShell>
  );
}
