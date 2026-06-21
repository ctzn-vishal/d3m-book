import type { Metadata } from 'next';
import { BookShell } from '@/components/Book/BookShell';
import { book, findArticle } from '@/lib/book-toc';
import Article from './article.mdx';

export const metadata: Metadata = {
  title: `§17.5 Trust, Evaluation, and Governance | ${book.title}`,
  description:
    'Making data agents safe to deploy: outcome vs. trajectory evals, OpenTelemetry observability, the lethal trifecta and prompt injection, human approval gates, and the NIST / EU AI Act / ISO 42001 governance backdrop.',
};

export default function Page() {
  return (
    <BookShell slug="ch17-agent-governance" book={book} findArticle={findArticle}>
      <Article />
    </BookShell>
  );
}
