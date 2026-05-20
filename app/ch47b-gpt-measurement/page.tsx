import type { Metadata } from 'next';
import { BookShell } from '@/components/Book/BookShell';
import { book, findArticle } from '@/lib/book-toc';
import Article from './article.mdx';

export const metadata: Metadata = {
  title: `§19.3 GPT-as-Measurement | ${book.title}`,
  description:
    'From surface features to measured constructs — the bridge between classical NLP and the language-model age.',
};

export default function Page() {
  return (
    <BookShell slug="ch47b-gpt-measurement" book={book} findArticle={findArticle}>
      <Article />
    </BookShell>
  );
}
