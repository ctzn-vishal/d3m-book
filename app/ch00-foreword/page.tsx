import type { Metadata } from 'next';
import { BookShell } from '@/components/Book/BookShell';
import { book, findArticle } from '@/lib/book-toc';
import Article from './article.mdx';

export const metadata: Metadata = {
  title: `Foreword: How to Read This Book | ${book.title}`,
  description:
    'A short note on the modern data operating system frame, who the book is for, and how to use it.',
};

export default function Page() {
  return (
    <BookShell slug="ch00-foreword" book={book} findArticle={findArticle}>
      <Article />
    </BookShell>
  );
}
