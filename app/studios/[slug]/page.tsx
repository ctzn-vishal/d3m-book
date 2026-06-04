import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { book } from '@/lib/book-toc';
import { createPreviewMetadata } from '@/lib/share-metadata';
import { findStudio, getStudioSlugs, relatedChapter } from '@/lib/studios';

interface Props {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return getStudioSlugs().map(slug => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const studio = findStudio(slug);
  if (!studio) return { title: 'Studio not found' };
  const title = `${studio.title} | ${book.title}`;
  return {
    title,
    description: studio.blurb,
    ...createPreviewMetadata({
      title,
      description: studio.blurb,
      imagePath: `/studios/${studio.slug}/opengraph-image`,
      imageAlt: `${studio.title} preview card`,
    }),
  };
}

function formatArticleNumber(num: string): string {
  return num.includes('.') ? `§${num}` : `Ch. ${num}`;
}

export default async function StudioViewerPage({ params }: Props) {
  const { slug } = await params;
  const studio = findStudio(slug);
  if (!studio) notFound();

  const related = relatedChapter(studio);
  const src = `/studios/${studio.slug}/index.html`;

  return (
    <div className="flex h-dvh flex-col bg-surface">
      {/* Frame chrome — keeps the reader oriented while the dashboard fills
          the rest of the viewport and scrolls internally. */}
      <header className="z-10 border-b border-border bg-surface/95 backdrop-blur-md">
        <div className="flex items-center justify-between gap-4 px-4 sm:px-6 py-2.5">
          <div className="flex min-w-0 items-center gap-3">
            <Link
              href="/studios"
              className="inline-flex shrink-0 items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-muted hover:text-body hover:bg-card transition-colors"
            >
              <ArrowLeft size={14} strokeWidth={2.5} />
              <span className="hidden sm:inline">All studios</span>
            </Link>
            <div className="min-w-0">
              <p className="truncate text-sm font-display font-semibold text-body leading-tight">
                {studio.title}
              </p>
              <p className="truncate text-[11px] text-muted leading-tight">{studio.domain}</p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {related && (
              <Link
                href={`/${related.slug}`}
                className="hidden md:inline-block rounded-md px-3 py-1.5 text-xs font-medium text-muted hover:text-body hover:bg-card transition-colors"
              >
                Pairs with {formatArticleNumber(related.number)} {related.title}
              </Link>
            )}
            <a
              href={src}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card/60 px-3 py-1.5 text-xs font-medium text-muted hover:text-body hover:border-border-strong transition-colors"
            >
              <ExternalLink size={13} strokeWidth={2.5} />
              <span className="hidden sm:inline">Open in new tab</span>
            </a>
          </div>
        </div>
      </header>

      <iframe
        src={src}
        title={studio.title}
        className="w-full flex-1 border-0 bg-white"
        sandbox="allow-scripts allow-same-origin allow-downloads allow-popups allow-forms allow-modals"
      />
    </div>
  );
}
