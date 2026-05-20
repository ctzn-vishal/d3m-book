import type { Metadata } from 'next';
import { BookShell } from '@/components/Book/BookShell';
import { book, findArticle } from '@/lib/book-toc';
import Article from './article.mdx';

export const metadata: Metadata = {
  title: `§0.2 The D3M Evidence Stack | ${book.title}`,
  description:
    'Six evidence languages, the artefacts they produce, the studios that capstone them, and the case portfolio that anchors them.',
};

export default function Page() {
  return (
    <BookShell slug="ch00-2-evidence-stack" book={book} findArticle={findArticle}>
      <Article />
    </BookShell>
  );
}
