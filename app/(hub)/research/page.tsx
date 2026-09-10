import type { Metadata } from 'next';
import { ArrowDown, ArrowUpRight } from 'lucide-react';
import {
  profile,
  interests,
  published,
  working,
  getJournalHighlights,
  type Publication,
} from '@/lib/research';
import { SITE_URL } from '@/lib/share-metadata';
import { JsonLd } from '@/components/JsonLd';

export const metadata: Metadata = {
  title: 'Research — Vishal Singh',
  description:
    'Peer-reviewed and working papers by Vishal Singh, Professor of Marketing at NYU Stern — pricing, public health, retail competition, and the politics of consumption.',
  alternates: { canonical: `${SITE_URL}/research` },
};

const personLd = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: profile.name,
  jobTitle: `${profile.title}, ${profile.role}`,
  affiliation: { '@type': 'CollegeOrUniversity', name: profile.affiliation },
  email: `mailto:${profile.email}`,
  url: `${SITE_URL}/research`,
  sameAs: profile.links.map(l => l.href),
  knowsAbout: interests,
};

function PubItem({ pub }: { pub: Publication }) {
  return (
    <li className="border-b border-hub-line py-5 last:border-b-0">
      <p className="text-[15px] leading-[1.8] text-hub-ink">
        <span className="text-hub-ink-soft">{pub.authors}</span>
        {pub.year ? <span className="text-hub-ink-faint"> ({pub.year})</span> : null}.{' '}
        <span className="font-serif text-[16px] font-medium">“{pub.title}.”</span>{' '}
        <span className="italic text-hub-ink-soft">{pub.venue}</span>
        {pub.detail ? <span className="text-hub-ink-soft">, {pub.detail}</span> : null}.
        {pub.url ? (
          <a
            href={pub.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Read ${pub.title} (opens in a new tab)`}
            className="ml-1.5 inline-flex items-center gap-0.5 font-plex text-[11px] uppercase tracking-[0.04em] text-hub-teal hover:underline"
          >
            link <ArrowUpRight size={11} strokeWidth={2.5} aria-hidden="true" />
          </a>
        ) : null}
      </p>
      {pub.note ? (
        <span className="mt-2 inline-block rounded border border-hub-amber/30 bg-hub-amber-soft px-2 py-0.5 font-plex text-[10px] uppercase tracking-[0.04em] text-hub-amber">
          {pub.note}
        </span>
      ) : null}
    </li>
  );
}

function Section({ id, title, count, children }: { id: string; title: string; count?: number; children: React.ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-heading`} className="mt-12 scroll-mt-32 sm:mt-16 sm:scroll-mt-24">
      <div className="flex items-baseline gap-3 border-b-2 border-hub-line-strong pb-3">
        <h2 id={`${id}-heading`} className="font-serif text-[24px] font-medium leading-tight tracking-tight text-hub-ink sm:text-[28px]">{title}</h2>
        {count != null && (
          <span className="rounded-full border border-hub-line px-2.5 py-0.5 font-plex text-[12px] tabular-nums text-hub-ink-soft">{count}</span>
        )}
      </div>
      {children}
    </section>
  );
}

function JournalSummary() {
  const journal = getJournalHighlights().find(journal => journal.venue === 'Marketing Science');
  if (!journal) return null;

  return (
    <p className="border-b border-hub-line bg-hub-paper2 px-4 py-3 text-[13px] text-hub-ink-soft sm:px-5">
      Top Journal: <span className="font-medium text-hub-teal">{journal.venue} ({journal.count})</span>
    </p>
  );
}

export default function ResearchPage() {
  const publishedNewestFirst = [...published].reverse();

  return (
    <div>
      <JsonLd data={personLd} />
      <header className="hub-hero border-b border-hub-line">
        <div className="mx-auto max-w-4xl px-5 py-12 sm:px-8 sm:py-16">
          <div className="font-plex text-[11px] uppercase tracking-[0.16em] text-hub-teal">
            Research &amp; Publications
          </div>
          <h1 className="mt-4 font-serif text-[clamp(36px,5.4vw,56px)] font-medium leading-[1.06] tracking-tight text-hub-ink">
            {profile.name}
          </h1>
          <div className="mt-4 space-y-1 text-[15px] leading-relaxed text-hub-ink-soft">
            <p className="font-medium text-hub-ink">{profile.title}</p>
            <p>{profile.role}</p>
            <p>{profile.affiliation}</p>
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 font-plex text-[12px] text-hub-ink-soft">
            <a href={`mailto:${profile.email}`} className="hover:text-hub-teal">
              {profile.email}
            </a>
            {profile.links.map(l => (
              <a
                key={l.href}
                href={l.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-0.5 hover:text-hub-teal"
              >
                {l.label} <ArrowUpRight size={11} strokeWidth={2.5} aria-hidden="true" />
              </a>
            ))}
          </div>
          <div className="mt-7 flex flex-wrap gap-1.5">
            {interests.map(i => (
              <span
                key={i}
                className="rounded-full border border-hub-line bg-hub-card px-3 py-1 font-plex text-[11px] text-hub-ink-soft"
              >
                {i}
              </span>
            ))}
          </div>
          <nav aria-label="Research sections" className="mt-8 flex flex-wrap gap-x-6 gap-y-3 border-t border-hub-line pt-5 text-[13px] font-medium text-hub-ink-soft">
            <a href="#working-papers" className="inline-flex items-center gap-2 hover:text-hub-teal">Working papers <span className="font-plex text-[11px] text-hub-ink-faint">{working.length}</span><ArrowDown size={13} aria-hidden="true" /></a>
            <a href="#publications" className="inline-flex items-center gap-2 hover:text-hub-teal">Refereed publications <span className="font-plex text-[11px] text-hub-ink-faint">{published.length}</span><ArrowDown size={13} aria-hidden="true" /></a>
          </nav>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-5 pb-24 sm:px-8">
        <Section id="working-papers" title="Working Papers & Under Review" count={working.length}>
          <ul>
            {working.map(p => (
              <PubItem key={p.title} pub={p} />
            ))}
          </ul>
        </Section>

        <Section id="publications" title="Refereed Publications" count={published.length}>
          <JournalSummary />
          <ul>
            {publishedNewestFirst.map(p => (
              <PubItem key={`${p.title}-${p.year}`} pub={p} />
            ))}
          </ul>
        </Section>
      </div>
    </div>
  );
}
