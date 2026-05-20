import type { Metadata } from 'next';
import { BookShell } from '@/components/Book/BookShell';
import { book, findArticle } from '@/lib/book-toc';
import Article from './article.mdx';

export const metadata: Metadata = {
  title: `§20.2 Computer Vision Fundamentals | ${book.title}`,
  description:
    'What CNNs and vision transformers actually do, the four output shapes that matter, and where vision AI ships in business.',
};

export default function Page() {
  return (
    <BookShell slug="ch49-vision-fundamentals" book={book} findArticle={findArticle}>
      <Article />
    </BookShell>
  );
}
