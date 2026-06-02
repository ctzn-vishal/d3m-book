import type { Metadata } from 'next';
import { BookShell } from '@/components/Book/BookShell';
import { book, findArticle } from '@/lib/book-toc';
import Article from './article.mdx';

export const metadata: Metadata = {
  title: `§21.1 LLM Capabilities and Prompting | ${book.title}`,
  description:
    'Language models as language interfaces for workflows — the eight capabilities every manager should know, and how to brief the model with a six-slot prompt.',
};

export default function Page() {
  return (
    <BookShell slug="ch50-llms-capabilities" book={book} findArticle={findArticle}>
      <Article />
    </BookShell>
  );
}
