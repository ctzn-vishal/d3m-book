import type { Metadata } from 'next';
import { BookShell } from '@/components/Book/BookShell';
import { book, findArticle } from '@/lib/book-toc';
import Article from './article.mdx';

export const metadata: Metadata = {
  title: `§21.2 Prompting as Task Design | ${book.title}`,
  description:
    'A prompt is a structured task brief — the same fields a manager would give an analyst, applied to a language model.',
};

export default function Page() {
  return (
    <BookShell slug="ch50b-prompting" book={book} findArticle={findArticle}>
      <Article />
    </BookShell>
  );
}
