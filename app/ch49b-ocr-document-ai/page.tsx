import type { Metadata } from 'next';
import { BookShell } from '@/components/Book/BookShell';
import { book, findArticle } from '@/lib/book-toc';
import Article from './article.mdx';

export const metadata: Metadata = {
  title: `§20.3 OCR and Document AI | ${book.title}`,
  description:
    'Reading scanned invoices, contracts, forms, and receipts — where layout understanding and structured extraction meet.',
};

export default function Page() {
  return (
    <BookShell slug="ch49b-ocr-document-ai" book={book} findArticle={findArticle}>
      <Article />
    </BookShell>
  );
}
