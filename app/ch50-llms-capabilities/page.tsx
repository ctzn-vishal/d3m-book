import type { Metadata } from 'next';
import { BookShell } from '@/components/Book/BookShell';
import { book, findArticle } from '@/lib/book-toc';
import Article from './article.mdx';

export const metadata: Metadata = {
  title: `§21.1 What LLMs Do — Capabilities and Limits | ${book.title}`,
  description:
    'Language models as language interfaces for workflows — the eight capabilities every manager should know.',
};

export default function Page() {
  return (
    <BookShell slug="ch50-llms-capabilities" book={book} findArticle={findArticle}>
      <Article />
    </BookShell>
  );
}
