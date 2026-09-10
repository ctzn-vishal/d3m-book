import Link from 'next/link';
import Image from 'next/image';
import { ArrowDown, ArrowRight, ArrowUpRight, BookOpen, Database, LayoutGrid } from 'lucide-react';
import type { Book } from '@/lib/book-types';
import { chapterHref } from '@/lib/book-toc';
import { getPartContent } from '@/lib/book-content';
import { BookFrame } from '@/components/Book/BookFrame';

/**
 * The book's cover / first page. A full-width hero image carries the title,
 * subtitle, and author byline; below it, "the arc of the book" presents the
 * table of contents at the Part grain — one card per part, each linking to
 * its overview and listing its chapters — so the cover doubles as real front
 * matter, not just a title banner.
 */

export function TeachingCover({ book }: { book: Book }) {
  const chapters = book.parts.flatMap(part => part.chapters);
  const published = chapters.flatMap(chapter => chapter.articles).filter(article => article.status === 'published');
  const firstSlug = published[0]?.slug;

  const hero = (
    <section className="border-b border-border">
      <div className="mx-auto max-w-[80rem] px-5 pb-12 pt-10 sm:px-8 sm:pb-16 lg:px-12 lg:pt-16">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-5">
          <p className="book-kicker text-accent-ink">The D3M textbook</p>
          <p className="book-kicker text-muted">NYU Stern · An open learning resource</p>
        </div>
        <div className="grid items-center gap-10 pt-10 lg:grid-cols-[1.35fr_1fr] lg:gap-16 lg:pt-12">
          <div>
            <p className="mb-5 text-sm text-subtle">Better questions. Stronger evidence. Better decisions.</p>
            <h1 className="max-w-3xl font-serif text-[clamp(3rem,5.7vw,5.25rem)] font-normal leading-[1.02] tracking-[-0.055em] text-body">
              Data Driven<br />Decision <span className="italic text-accent-ink">Making</span>
            </h1>
            <p className="mt-7 max-w-xl text-base leading-relaxed text-subtle sm:text-lg">
              {book.subtitle}
            </p>
            <p className="mt-4 max-w-lg text-[15px] leading-7 text-muted">
              A practical textbook for managers and analysts. Learn to read the data,
              question the evidence, and turn analysis into action — with real cases
              and interactive studios along the way.
            </p>

            {/* Author byline */}
            <div className="mt-7 flex items-center gap-3 text-sm">
              <span className="flex h-10 w-10 items-center justify-center rounded-full border border-border font-serif text-lg" aria-hidden="true">VS</span>
              <p>
                <a href="mailto:vsingh@stern.nyu.edu" className="font-medium text-body underline-offset-4 hover:underline">Vishal Singh</a>
                <span className="mt-0.5 block text-xs text-muted">NYU Stern School of Business</span>
              </p>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              {firstSlug && (
                <Link href={`/${firstSlug}`} className="book-button-primary">
                  <BookOpen size={16} aria-hidden="true" /> Start reading <ArrowRight size={16} aria-hidden="true" />
                </Link>
              )}
              <a href="#curriculum" className="book-button-secondary">
                Explore the contents <ArrowDown size={15} aria-hidden="true" />
              </a>
            </div>
          </div>

          <div className="border border-border bg-card p-3 sm:p-4">
            <div className="relative aspect-[5/4] overflow-hidden bg-body">
              <Image src="/hero.webp" alt="" fill priority sizes="(max-width: 1023px) 90vw, 40vw" className="object-cover" />
              {/* Light scrims so the collage stays visible; a drop-shadow on the text
                  keeps the white type legible without a heavy overlay. */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/10 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6 text-white drop-shadow-md sm:p-8">
                <p className="font-plex text-[10px] uppercase tracking-[0.2em] text-white/80">The question behind every chapter</p>
                <p className="mt-3 max-w-xs font-serif text-3xl leading-tight sm:text-4xl">What decision will this evidence improve?</p>
              </div>
            </div>
            <div className="flex items-center justify-between gap-4 px-2 pb-1 pt-4">
              <span className="book-kicker text-muted">From the classroom to practice</span>
              <span className="font-serif text-xl italic text-accent-ink">D3M</span>
            </div>
          </div>
        </div>
        <dl className="mt-12 grid grid-cols-3 border-y border-border sm:mt-16">
          {[[book.parts.length, 'Connected parts'], [chapters.length, 'Chapters'], [published.length, 'Published articles']].map(([value, label]) => (
            <div key={label} className="flex flex-col gap-1 border-r border-border px-3 py-5 first:pl-0 last:border-0 sm:flex-row sm:items-baseline sm:gap-3 sm:px-7">
              <dt className="text-[11px] text-muted sm:text-sm">{label}</dt>
              <dd className="order-first font-serif text-3xl tracking-tight sm:text-4xl">{value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );

  return (
    <BookFrame book={book} beforeContent={hero} showSidebar={false}>
      {/* ── The arc of the book — card TOC ───────────────────────────── */}
      <section id="curriculum" className="scroll-mt-24 py-14 sm:py-20">
        <div className="grid gap-5 md:grid-cols-[1fr_1fr] md:gap-16">
          <div>
            <p className="book-kicker text-accent-ink">The curriculum</p>
            <h2 className="mt-3 font-serif text-4xl leading-tight tracking-[-0.035em] sm:text-5xl">One book. Seven ways<br className="hidden sm:block" /> to think with data.</h2>
          </div>
          <p className="max-w-lg text-[15px] leading-7 text-muted md:self-end">
            Follow the full arc, from business tables to AI agents. Or begin with
            the question on your desk. Each part brings together the concepts,
            worked cases, and practical tools you need to make the next decision.
          </p>
        </div>

        <ol className="mt-10 border-t border-border sm:mt-12">
          {book.parts.map(part => {
            const content = getPartContent(part.numeral);
            return (
              <li key={part.numeral} className="grid gap-6 border-b border-border py-8 md:grid-cols-[1fr_1fr] md:gap-16 sm:py-10">
                <div className="flex items-start gap-5 sm:gap-7">
                  <span aria-hidden="true" className="w-12 shrink-0 font-serif text-4xl leading-none text-accent-ink sm:w-16 sm:text-5xl">{part.numeral}</span>
                  <div>
                    <p className="book-kicker text-muted">Part {part.numeral} · {part.chapters.length} {part.chapters.length === 1 ? 'chapter' : 'chapters'}</p>
                    <h3 className="mt-2 font-serif text-2xl leading-tight tracking-[-0.025em] sm:text-[1.75rem]">
                      <Link href={`/teaching/part/${part.numeral}`} className="transition-colors hover:text-accent-ink">{part.title}</Link>
                    </h3>
                    {content?.tagline && <p className="mt-3 text-sm leading-relaxed text-muted">{content.tagline}</p>}
                    <Link href={`/teaching/part/${part.numeral}`} className="mt-5 inline-flex items-center gap-2 text-xs font-medium text-accent-ink hover:underline hover:underline-offset-4">
                      Explore this part <ArrowUpRight size={14} aria-hidden="true" />
                    </Link>
                  </div>
                </div>
                <ul className="divide-y divide-border md:self-center">
                  {part.chapters.map(chapter => (
                    <li key={chapter.number}>
                      <Link href={chapterHref(chapter)} className="group flex items-center gap-4 py-3 text-sm leading-relaxed transition-colors hover:text-accent-ink">
                        <span className="font-plex text-xs tabular-nums text-muted">{String(chapter.number).padStart(2, '0')}</span>
                        <span className="flex-1">{chapter.title}</span>
                        <ArrowRight size={15} className="shrink-0 text-muted transition-transform group-hover:translate-x-1" aria-hidden="true" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
            );
          })}
        </ol>
      </section>

      {/* ── Companion data portraits ─────────────────────────────────────
          Standalone reads of the datasets the chapters draw on. Not part of
          the linear arc above, so they sit below it rather than inside a part. */}
      <section className="mb-14 grid border border-border bg-card md:grid-cols-2 sm:mb-20">
        <div className="p-7 sm:p-10">
          <p className="book-kicker text-accent-ink">Beyond the page</p>
          <h2 className="mt-3 font-serif text-3xl tracking-tight sm:text-4xl">Get your hands on the evidence.</h2>
          <p className="mt-4 text-sm leading-7 text-muted">The ideas become useful when you put them to work. Explore the datasets behind the chapters, or try a hands-on teaching studio.</p>
          <Link href="/?type=Teaching" className="book-button-secondary mt-6">
            <LayoutGrid size={15} aria-hidden="true" /> Explore interactive studios <ArrowUpRight size={15} aria-hidden="true" />
          </Link>
        </div>
        <Link href="/amazon" className="group flex flex-col justify-center border-t border-border p-7 transition-colors hover:bg-surface md:border-l md:border-t-0 sm:p-10">
          <div className="flex items-center gap-2 text-muted"><Database size={16} aria-hidden="true" /><span className="book-kicker">Dataset portrait</span></div>
          <h3 className="mt-4 font-serif text-2xl leading-tight sm:text-3xl">Half a billion<br />Amazon reviews</h3>
          <p className="mt-3 text-sm leading-7 text-muted">33 product categories. 1996–2023. A guided look at the ratings, growth, seasonality, and biases hiding inside the corpus.</p>
          <span className="mt-6 flex items-center gap-2 text-sm font-medium text-accent-ink">Open the portrait <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" aria-hidden="true" /></span>
        </Link>
      </section>
      <footer className="flex flex-wrap items-center justify-between gap-4 border-t border-border pb-24 pt-6 text-xs text-muted sm:pb-10">
        <p>Data Driven Decision Making · Vishal Singh · NYU Stern</p>
        <Link href="/" className="inline-flex items-center gap-2 hover:text-body">Back to the gallery <ArrowUpRight size={13} aria-hidden="true" /></Link>
      </footer>
    </BookFrame>
  );
}
