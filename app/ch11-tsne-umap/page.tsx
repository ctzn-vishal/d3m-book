import type { Metadata } from 'next';
import { BookShell } from '@/components/Book/BookShell';
import { book, findArticle } from '@/lib/book-toc';
import Article from './article.mdx';

export const metadata: Metadata = {
  title: `§11.3 Nonlinear Maps: t-SNE and UMAP | ${book.title}`,
  description:
    'When clusters are clear but axes lose meaning — and how to read a nonlinear map without overstating it.',
};

export default function Page() {
  return (
    <BookShell slug="ch11-tsne-umap" book={book} findArticle={findArticle}>
      <Article />
    </BookShell>
  );
}
