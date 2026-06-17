import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'About — Vishal Singh',
  description:
    'About Vishal Singh, Professor of Marketing at NYU Stern — research, teaching, and interactive data work.',
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-16 sm:px-7 sm:py-20">
      <div className="font-plex text-[12px] uppercase tracking-[0.16em] text-hub-amber">About</div>
      <h1 className="mt-3 font-serif text-[clamp(32px,5.4vw,52px)] font-semibold leading-[1.06] tracking-tight text-hub-ink">
        Vishal Singh
      </h1>

      <div className="mt-7 space-y-5 text-[17px] leading-relaxed text-hub-ink-soft">
        <p>
          I’m a Professor of Marketing at NYU’s Stern School of Business. My research uses
          large-scale data to study pricing and competition, public health, retail markets, and the
          increasingly political character of everyday consumption — work that has appeared in{' '}
          <em>Marketing Science</em>, the <em>Journal of Marketing Research</em>,{' '}
          <em>Management Science</em>, <em>Psychological Science</em>, and the{' '}
          <em>Journal of Consumer Research</em>.
        </p>
        <p>
          I also build things. This site is where my interactive data work lives — dashboards and
          data stories that turn real datasets into decisions — alongside the teaching book{' '}
          <Link href="/teaching" className="text-hub-teal hover:underline">
            Data Driven Decision Making
          </Link>
          , which I’ve taught at NYU since 2012. The goal is the same in research and in the
          classroom: take the evidence seriously, and be honest about how much it actually tells us.
        </p>
        <p>
          Browse the{' '}
          <Link href="/gallery" className="text-hub-teal hover:underline">
            gallery
          </Link>{' '}
          of interactive apps and data stories, read the{' '}
          <Link href="/teaching" className="text-hub-teal hover:underline">
            book
          </Link>
          , or see the{' '}
          <Link href="/research" className="text-hub-teal hover:underline">
            research
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
