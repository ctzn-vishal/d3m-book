import type { Metadata } from 'next';
import { BookShell } from '@/components/Book/BookShell';
import { book, findArticle } from '@/lib/book-toc';
import Article from './article.mdx';

export const metadata: Metadata = {
  title: `Case Study: Trump Tweet Source Classification | ${book.title}`,
  description:
    'A standalone NLP case study using tweet text and metadata to classify Android versus iPhone source labels.',
};

export default function Page() {
  return (
    <BookShell slug="trump-tweet-device-case" book={book} findArticle={findArticle}>
      <Article />
    </BookShell>
  );
}
