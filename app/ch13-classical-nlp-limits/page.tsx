import type { Metadata } from 'next';
import { BookShell } from '@/components/Book/BookShell';
import { book, findArticle } from '@/lib/book-toc';
import Article from './article.mdx';

export const metadata: Metadata = {
  title: `§13.6 Limits of Classical NLP | ${book.title}`,
  description:
    'Sarcasm, negation, polysemy, idiom, and context — the gallery of failure modes that motivates embeddings and LLMs.',
};

export default function Page() {
  return (
    <BookShell slug="ch13-classical-nlp-limits" book={book} findArticle={findArticle}>
      <Article />
    </BookShell>
  );
}
