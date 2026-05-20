import type { Metadata } from 'next';
import { BookShell } from '@/components/Book/BookShell';
import { book, findArticle } from '@/lib/book-toc';
import Article from './article.mdx';

export const metadata: Metadata = {
  title: `§21.4 Agents and Tool Use | ${book.title}`,
  description:
    'When an LLM becomes a workflow component — tools, memory, planning, and the human-approval gate.',
};

export default function Page() {
  return (
    <BookShell slug="ch51-agents-tools" book={book} findArticle={findArticle}>
      <Article />
    </BookShell>
  );
}
