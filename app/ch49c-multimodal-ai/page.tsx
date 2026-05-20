import type { Metadata } from 'next';
import { BookShell } from '@/components/Book/BookShell';
import { book, findArticle } from '@/lib/book-toc';
import Article from './article.mdx';

export const metadata: Metadata = {
  title: `§20.4 Multimodal AI | ${book.title}`,
  description:
    'Text, images, audio, and video in one shared meaning space — and the business workflows that uses it.',
};

export default function Page() {
  return (
    <BookShell slug="ch49c-multimodal-ai" book={book} findArticle={findArticle}>
      <Article />
    </BookShell>
  );
}
