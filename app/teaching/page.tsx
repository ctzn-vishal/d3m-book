import type { Metadata } from 'next';
import { TeachingCover } from '@/components/Book/TeachingCover';
import { book } from '@/lib/book-toc';

export const metadata: Metadata = {
  title: `${book.title} — Contents`,
  description: book.subtitle,
};

export default function TeachingPage() {
  return <TeachingCover book={book} />;
}
