import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight, FlaskConical, LayoutDashboard } from 'lucide-react';
import { book } from '@/lib/book-toc';
import { createPreviewMetadata } from '@/lib/share-metadata';
import { studios, relatedChapter, type Studio } from '@/lib/studios';

const pageTitle = `Case Study & Dashboard Gallery | ${book.title}`;
const pageDescription =
  'Interactive, self-contained dashboards and hands-on exercises that pair with the book — pricing, regression, exploratory views, and more.';

export const metadata: Metadata = {
  title: pageTitle,
  description: pageDescription,
  ...createPreviewMetadata({
    title: pageTitle,
    description: pageDescription,
    imagePath: '/studios/opengraph-image',
    imageAlt: 'D3M case study and dashboard gallery preview card',
  }),
};

function formatArticleNumber(num: string): string {
  return num.includes('.') ? `§${num}` : `Ch. ${num}`;
}

export default function StudiosGalleryPage() {
  return (
    <div className="bg-surface text-body min-h-screen flex flex-col">
      {/* Top bar — mirrors the article shell's sticky book bar. */}
      <div className="sticky top-0 z-30 border-b border-border bg-surface/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 lg:px-10 py-2.5">
          <Link
            href="/"
            className="text-sm font-display font-semibold text-body hover:text-link transition-colors truncate"
          >
            {book.title}
          </Link>
          <Link
            href="/"
            className="rounded-md px-3 py-1.5 text-xs font-medium text-muted hover:text-body hover:bg-card transition-colors"
          >
            ← Back to book
          </Link>
        </div>
      </div>

      {/* Hero */}
      <section className="border-b border-border bg-gradient-to-b from-[#EDF2F7] via-[#F4F8FC] to-[#FFFFFF]">
        <div className="mx-auto max-w-7xl px-6 lg:px-10 py-16 lg:py-24">
          <p className="text-xs uppercase tracking-[0.2em] text-muted">Interactive Studios</p>
          <h1 className="mt-3 font-display font-semibold tracking-tight text-body text-4xl sm:text-5xl lg:text-6xl leading-[1.02]">
            Case Study &amp; Dashboard Gallery
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-subtle leading-snug">
            Live, self-contained dashboards and hands-on exercises. Each one takes a
            method from the book off the page and onto real data — explore it directly,
            then jump to the chapter it pairs with.
          </p>
        </div>
      </section>

      {/* Card grid */}
      <section className="flex-1">
        <div className="mx-auto max-w-7xl px-6 lg:px-10 py-14">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {studios.map(studio => (
              <StudioCard key={studio.slug} studio={studio} />
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-border bg-card">
        <div className="mx-auto max-w-7xl px-6 lg:px-10 py-10 text-xs text-muted">
          {studios.length} interactive studios · part of {book.title}.
        </div>
      </footer>
    </div>
  );
}

function StudioCard({ studio }: { studio: Studio }) {
  const related = relatedChapter(studio);
  const KindIcon = studio.kind === 'exercise' ? FlaskConical : LayoutDashboard;
  const kindLabel = studio.kind === 'exercise' ? 'Exercise' : 'Dashboard';

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-sm transition-shadow hover:shadow-md">
      <div className="h-1 w-full" style={{ backgroundColor: studio.accent }} aria-hidden="true" />
      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-center justify-between gap-3">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted">
            {studio.domain}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-0.5 text-[11px] font-medium text-subtle">
            <KindIcon size={12} strokeWidth={2.5} aria-hidden="true" />
            {kindLabel}
          </span>
        </div>

        <h2 className="mt-3 font-display text-xl font-semibold leading-snug text-body">
          <Link href={`/studios/${studio.slug}`} className="hover:text-link transition-colors">
            <span className="absolute inset-0" aria-hidden="true" />
            {studio.title}
          </Link>
        </h2>

        <p className="mt-2.5 text-sm leading-relaxed text-muted">{studio.blurb}</p>

        <div className="mt-4 flex flex-wrap gap-1.5">
          {studio.methods.map(m => (
            <span
              key={m}
              className="rounded bg-card px-2 py-0.5 text-[11px] font-medium text-subtle"
            >
              {m}
            </span>
          ))}
        </div>

        <div className="mt-5 flex items-center justify-between border-t border-border/70 pt-4">
          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-link">
            Open studio
            <ArrowUpRight size={15} strokeWidth={2.5} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </span>
          {related && (
            // z-10 lifts this above the card's stretched title link so the
            // chapter cross-link stays independently clickable.
            <Link
              href={`/${related.slug}`}
              className="relative z-10 text-xs text-muted hover:text-link transition-colors"
            >
              Pairs with {formatArticleNumber(related.number)}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
