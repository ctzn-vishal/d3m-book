import type { Metadata } from 'next';
import { BookShell } from '@/components/Book/BookShell';
import { book, findArticle } from '@/lib/book-toc';
import Article from './article.mdx';

export const metadata: Metadata = {
  title: `Foreword: How to Read This Book | ${book.title}`,
  description:
    "The book's wager, who it is for, how to read it, the Bean & Basket through-line and standalone cases, a note on the AI chapters, and what you will have at the end.",
};

export default function Page() {
  return (
    <BookShell slug="ch00-foreword" book={book} findArticle={findArticle}>
      <Article />
    </BookShell>
  );
}
