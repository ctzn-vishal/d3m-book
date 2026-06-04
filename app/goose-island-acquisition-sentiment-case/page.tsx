import type { Metadata } from 'next';
import { BookShell } from '@/components/Book/BookShell';
import { book, findArticle } from '@/lib/book-toc';
import Article from './article.mdx';

export const metadata: Metadata = {
  title: `Case Study: Goose Island Acquisition Sentiment | ${book.title}`,
  description:
    'A standalone NLP case study using Goose Island tweets around the 2011 acquisition to separate product sentiment, event vocabulary, and social-media noise.',
};

export default function Page() {
  return (
    <BookShell slug="goose-island-acquisition-sentiment-case" book={book} findArticle={findArticle}>
      <Article />
    </BookShell>
  );
}
