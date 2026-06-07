import type { Metadata } from 'next';
import { BookShell } from '@/components/Book/BookShell';
import { book, findArticle } from '@/lib/book-toc';
import Article from './article.mdx';

export const metadata: Metadata = {
  title: `§16.2 Structured Outputs and Extraction | ${book.title}`,
  description:
    'From free text to validated JSON — the bridge that lets LLMs feed downstream systems without manual cleanup.',
};

export default function Page() {
  return (
    <BookShell slug="ch16-structured-outputs" book={book} findArticle={findArticle}>
      <Article />
    </BookShell>
  );
}
