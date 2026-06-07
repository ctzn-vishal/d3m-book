import type { Metadata } from 'next';
import { BookShell } from '@/components/Book/BookShell';
import { book, findArticle } from '@/lib/book-toc';
import Article from './article.mdx';

export const metadata: Metadata = {
  title: `§16.5 Customer Voice Intelligence Studio | ${book.title}`,
  description:
    'A capstone that integrates every method in Part V into one Bean & Basket customer-voice loop.',
};

export default function Page() {
  return (
    <BookShell slug="ch16-studio-customer-voice" book={book} findArticle={findArticle}>
      <Article />
    </BookShell>
  );
}
