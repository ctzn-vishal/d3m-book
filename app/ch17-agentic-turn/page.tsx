import type { Metadata } from 'next';
import { BookShell } from '@/components/Book/BookShell';
import { book, findArticle } from '@/lib/book-toc';
import Article from './article.mdx';

export const metadata: Metadata = {
  title: `§17.1 The Agentic Turn | ${book.title}`,
  description:
    'What changes when an AI agent — not an analyst — operates the data-to-decision loop. The workflow-vs-agent distinction, the anatomy of a data agent, the autonomy dial, and where enterprise adoption really stands.',
};

export default function Page() {
  return (
    <BookShell slug="ch17-agentic-turn" book={book} findArticle={findArticle}>
      <Article />
    </BookShell>
  );
}
