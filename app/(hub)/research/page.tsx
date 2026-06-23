import type { Metadata } from 'next';
import { ArrowUpRight } from 'lucide-react';
import {
  profile,
  interests,
  published,
  working,
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
    <li className="border-b border-hub-line py-3.5 last:border-b-0">
      <p className="text-[15px] leading-relaxed text-hub-ink">
        <span className="text-hub-ink-soft">{pub.authors}</span>
        {pub.year ? <span className="text-hub-ink-faint"> ({pub.year})</span> : null}.{' '}
        <span className="font-serif font-medium">“{pub.title}.”</span>{' '}
        <span className="italic text-hub-ink-soft">{pub.venue}</span>
        {pub.detail ? <span className="text-hub-ink-soft">, {pub.detail}</span> : null}.
        {pub.url ? (
          <a
            href={pub.url}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-1.5 inline-flex items-center gap-0.5 font-plex text-[11px] uppercase tracking-[0.04em] text-hub-teal hover:underline"
          >
            link <ArrowUpRight size={11} strokeWidth={2.5} />
          </a>
        ) : null}
      </p>
      {pub.note ? (
        <span className="mt-1 inline-block rounded border border-[#e8cfa9] bg-hub-amber-soft px-2 py-0.5 font-plex text-[10px] uppercase tracking-[0.04em] text-hub-amber">
          {pub.note}
        </span>
      ) : null}
    </li>
  );
}

function Section({ title, count, children }: { title: string; count?: number; children: React.ReactNode }) {
  return (
    <section className="mt-12">
      <div className="flex items-baseline gap-3 border-b-2 border-hub-line-strong pb-2">
        <h2 className="font-serif text-[24px] font-semibold text-hub-ink">{title}</h2>
        {count != null && (
          <span className="font-plex text-[12px] text-hub-ink-faint">{count}</span>
        )}
      </div>
      {children}
    </section>
  );
}

export default function ResearchPage() {
  const publishedNewestFirst = [...published].reverse();

  return (
    <div>
      <JsonLd data={personLd} />
      <header className="hub-hero border-b border-hub-line">
        <div className="mx-auto max-w-3xl px-5 py-14 sm:px-7">
          <div className="font-plex text-[12px] uppercase tracking-[0.16em] text-hub-amber">
            Research &amp; Publications
          </div>
          <h1 className="mt-3 font-serif text-[clamp(32px,5.4vw,52px)] font-semibold leading-[1.06] tracking-tight text-hub-ink">
            {profile.name}
          </h1>
          <div className="mt-2 space-y-0.5 text-[16px] leading-snug text-hub-ink-soft">
            <p>{profile.title}</p>
            <p>{profile.role}</p>
            <p>{profile.affiliation}</p>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 font-plex text-[12px] text-hub-ink-soft">
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
                {l.label} <ArrowUpRight size={11} strokeWidth={2.5} />
              </a>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap gap-1.5">
            {interests.map(i => (
              <span
                key={i}
                className="rounded-full border border-hub-line bg-hub-card px-3 py-1 font-plex text-[11px] text-hub-ink-soft"
              >
                {i}
              </span>
            ))}
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-5 pb-24 sm:px-7">
        <Section title="Working Papers & Under Review" count={working.length}>
          <ul>
            {working.map(p => (
              <PubItem key={p.title} pub={p} />
            ))}
          </ul>
        </Section>

        <Section title="Refereed Publications" count={published.length}>
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
