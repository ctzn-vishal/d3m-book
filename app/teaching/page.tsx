import type { Metadata } from 'next';
import { TeachingCover } from '@/components/Book/TeachingCover';
import { book } from '@/lib/book-toc';
import { SITE_URL } from '@/lib/share-metadata';
import { JsonLd } from '@/components/JsonLd';

export const metadata: Metadata = {
  title: `${book.title} — Contents`,
  description: book.subtitle,
  alternates: { canonical: `${SITE_URL}/teaching` },
};

const bookLd = {
  '@context': 'https://schema.org',
  '@type': 'Book',
  name: book.title,
  description: book.subtitle,
  author: { '@type': 'Person', name: 'Vishal Singh' },
  url: `${SITE_URL}/teaching`,
  inLanguage: 'en',
};

export default function TeachingPage() {
  return (
    <>
      <JsonLd data={bookLd} />
      <TeachingCover book={book} />
    </>
  );
}
