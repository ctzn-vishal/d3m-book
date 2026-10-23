import type { Metadata } from 'next';
import { BookCard, IN_PROGRESS_PILL } from '@/components/hub/BookCard';
import { BOOKS, type BookKind } from '@/lib/books';
import { SITE_URL } from '@/lib/share-metadata';

export const metadata: Metadata = {
  title: 'Interactive books — Vishal Singh',
  description:
    'Book-length data projects by Vishal Singh, NYU Stern, built as websites: ZIP Code Destiny, The Public Mind, Weights, Design, and Estimands, and more, plus two chart and map toolkits on ctzn.pub.',
  alternates: { canonical: `${SITE_URL}/booklets` },
};

const GROUPS: { kind: BookKind; title: string; blurb: string }[] = [
  {
    kind: 'Book',
    title: 'Books',
    blurb: 'Data books and booklets, read chapter by chapter in the browser.',
  },
  {
    kind: 'Toolkit',
    title: 'Toolkits',
    blurb: 'Galleries of figures and maps, and the TypeScript components that draw them. Built with Uma Huggins and hosted on ctzn.pub.',
  },
];

export default function BookletsPage() {
  return (
    <div>
      <header className="hub-hero border-b border-hub-line">
        <div className="mx-auto max-w-6xl px-5 py-11 sm:px-7 sm:py-14">
          <div className="font-plex text-[12px] uppercase tracking-[0.16em] text-hub-amber">
            Vishal Singh · NYU Stern
          </div>
          <h1 className="mt-3 max-w-3xl font-serif text-[clamp(34px,5.8vw,56px)] font-semibold leading-[1.05] tracking-tight text-hub-ink">
            Interactive books
          </h1>
          <p className="mt-4 max-w-2xl text-[16.5px] leading-relaxed text-hub-ink-soft">
            Book-length projects, most built as their own sites, and two chart and map toolkits on ctzn.pub.
            Several are written in public: projects marked
            <span className={`mx-1 translate-y-[-1px] ${IN_PROGRESS_PILL}`}>In progress</span>
            are still adding chapters, which are drafted and revised on the live site.
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-5 pb-16 sm:px-7">
        {GROUPS.map(group => {
          const items = BOOKS.filter(b => b.kind === group.kind);
          if (items.length === 0) return null;
          return (
            <section key={group.kind} aria-labelledby={`${group.kind}-heading`} className="mt-10 sm:mt-12">
              <div className="flex items-baseline gap-3 border-b border-hub-line pb-3">
                <h2
                  id={`${group.kind}-heading`}
                  className="font-serif text-[clamp(22px,2.6vw,29px)] font-semibold leading-[1.1] tracking-tight text-hub-ink"
                >
                  {group.title}
                </h2>
                <span className="inline-flex shrink-0 items-center rounded-full border border-hub-line bg-hub-card px-2.5 py-1 font-plex text-[11px] font-medium tracking-[0.04em] text-hub-ink-soft">
                  {items.length}
                </span>
              </div>
              <p className="mt-2 max-w-2xl text-[13.5px] leading-relaxed text-hub-ink-soft">{group.blurb}</p>
              <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {items.map(book => (
                  <BookCard key={book.id} book={book} />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
