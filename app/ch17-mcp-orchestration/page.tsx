import type { Metadata } from 'next';
import { BookShell } from '@/components/Book/BookShell';
import { book, findArticle } from '@/lib/book-toc';
import Article from './article.mdx';

export const metadata: Metadata = {
  title: `§17.4 MCP, Tools, and Orchestration | ${book.title}`,
  description:
    'How AI agents connect to the data stack: tool use, the Model Context Protocol, the Agent2Agent protocol, orchestration frameworks, and the durable-execution engines that keep agentic pipelines alive.',
};

export default function Page() {
  return (
    <BookShell slug="ch17-mcp-orchestration" book={book} findArticle={findArticle}>
      <Article />
    </BookShell>
  );
}
