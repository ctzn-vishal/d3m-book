import type { Metadata } from 'next';
import { BookShell } from '@/components/Book/BookShell';
import { book, findArticle } from '@/lib/book-toc';
import Article from './article.mdx';

export const metadata: Metadata = {
  title: `§22.1 AI Evaluation, Risk, and Governance | ${book.title}`,
  description:
    'The eight evaluation dimensions, the risk-control map, and the AI workflow card every shipped system needs.',
};

export default function Page() {
  return (
    <BookShell slug="ch52-ai-governance" book={book} findArticle={findArticle}>
      <Article />
    </BookShell>
  );
}
