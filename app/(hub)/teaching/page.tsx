import type { Metadata } from 'next';
import { TeachingCover } from '@/components/hub/TeachingCover';
import { book } from '@/lib/book-toc';

export const metadata: Metadata = {
  title: `${book.title} — Teaching`,
  description: book.subtitle,
};

export default function TeachingPage() {
  return <TeachingCover book={book} />;
}
