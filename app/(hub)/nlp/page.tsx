import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Database,
  MonitorPlay,
  Newspaper,
} from 'lucide-react';
import { getRegistry } from '@/lib/registry-db';
import type { RegistryItem } from '@/lib/registry-types';
import { allArticles } from '@/lib/book-toc';
import { SITE_URL } from '@/lib/share-metadata';
import { JsonLd } from '@/components/JsonLd';

/**
 * /nlp — "The Measure of Words", a field booklet on text as data.
 *
 * A curated, cover-to-colophon reading path through the NLP material that
 * lives across the system: the data essays and live studios hosted on the
 * content origin (registry types Blog/Teaching), the NLP datasets, and the
 * book's Part V theory chapters. Curation lives HERE (ids + editorial deks);
 * titles, links, and thumbnails overlay from the live registry so gallery
 * edits propagate, with committed fallbacks so the booklet never loses a
 * chapter if a row is renamed or unpublished.
 */

export const revalidate = 600;

const BOOKLET_TITLE = 'The Measure of Words';
const BOOKLET_SUBTITLE = 'Text as data, from word counts to language models';

export const metadata: Metadata = {
  title: `${BOOKLET_TITLE} — a text-as-data field booklet · Vishal Singh`,
  description:
    'A field booklet by Vishal Singh: six data essays, two live studios, and a data shelf on text as data — dictionaries, topic models, and LLM measurement at scale.',
  alternates: { canonical: `${SITE_URL}/nlp` },
};

/* ── Curated contents ────────────────────────────────────────────────────
   `id` keys into the gallery registry; `title`/`href`/`thumbnail` are the
   committed fallbacks (overlaid by the live row when present). `dek` and the
   kicker/corpus labels are editorial and owned by this page. */

type Chapter = {
  id: string;
  kicker: string;
  corpus: string;
  dek: string;
  methods: string[];
  title: string;
  href: string;
  thumbnail?: string;
};

const CHAPTERS: Chapter[] = [
  {
    id: 'counting-discovering-measuring',
    kicker: 'Field guide',
    corpus: 'Three generations of text-as-data',
    dek: 'Dictionaries count, topic models discover, and language models measure. The opening essay maps the whole toolkit — what each generation of text analysis can and cannot see, and when a word count still beats a transformer.',
    methods: ['Dictionaries', 'Topic models', 'LLM measurement'],
    title: 'Counting, Discovering, Measuring — text analysis with and without LLMs',
    href: 'https://content.vishalsingh.org/articles/counting-discovering-measuring.html',
    thumbnail: 'https://content.vishalsingh.org/articles/counting-discovering-measuring/_thumb.webp',
  },
  {
    id: 'trump-tweets',
    kicker: 'Case study',
    corpus: 'The @realDonaldTrump archive · 2013–2018',
    dek: 'During the 2016 cycle one account posted from two devices — staff on an iPhone, the candidate on an Android. Word frequencies, time-of-day signatures, and sentiment indices are enough to tell the two thumbs apart.',
    methods: ['Authorship classification', 'Sentiment indices'],
    title: 'Two Thumbs, One Account',
    href: 'https://content.vishalsingh.org/articles/trump-tweets.html',
    thumbnail: 'https://content.vishalsingh.org/articles/trump-tweets/_thumb.webp',
  },
  {
    id: 'beer-goose-island',
    kicker: 'Case study',
    corpus: '≈20,000 tweets around an acquisition',
    dek: 'When Anheuser-Busch InBev bought Chicago’s Goose Island in 2011, Twitter supplied a natural experiment: split the mentions into the weeks before and after the deal and measure what “selling out” actually does to a craft brand’s voice.',
    methods: ['Sentiment', 'Event window', 'Regression'],
    title: 'Did Goose Island Sell Out?',
    href: 'https://content.vishalsingh.org/articles/beer-goose-island.html',
    thumbnail: 'https://content.vishalsingh.org/articles/beer-goose-island/_thumb.webp',
  },
  {
    id: 'risk-factor-boilerplate',
    kicker: 'Corpus study',
    corpus: '91,493 annual reports · fifteen years',
    dek: 'Corporate risk disclosure tripled in length, got harder to read, and learned new words on a schedule you can date — cyber, pandemic, climate. Boilerplate, measured at industrial scale.',
    methods: ['Readability', 'Vocabulary dating', 'N-grams'],
    title: 'The Risk Section That Ate the 10-K',
    href: 'https://content.vishalsingh.org/articles/risk-factor-boilerplate.html',
    thumbnail: 'https://content.vishalsingh.org/articles/risk-factor-boilerplate/_thumb.webp',
  },
  {
    id: 'politics-ate-the-newsroom',
    kicker: 'Corpus study',
    corpus: '209,527 HuffPost headlines · 2012–2022',
    dek: 'Politics triples its share of the newsroom, the listicle dies, and the arrival of every word can be dated. Ten years of headlines read as a time series of editorial attention.',
    methods: ['Category shares', 'Term timelines'],
    title: 'When Politics Ate the Newsroom',
    href: 'https://content.vishalsingh.org/articles/politics-ate-the-newsroom.html',
    thumbnail: 'https://content.vishalsingh.org/articles/politics-ate-the-newsroom/_thumb.webp',
  },
  {
    id: 'ai-news-framing',
    kicker: 'LLM measurement',
    corpus: 'Broadcast news, classified at scale',
    dek: 'Left-leaning channels cast AI as a classroom, a risk, and a governance problem; right-leaning channels cast it as a business engine and a national race. LLM classification turns framing itself into a measurable variable.',
    methods: ['LLM classification', 'Framing analysis'],
    title: 'AI’s Split-Screen Politics',
    href: 'https://content.vishalsingh.org/articles/ai-news-framing.html',
    thumbnail: 'https://content.vishalsingh.org/articles/ai-news-framing/_thumb.webp',
  },
];

const STUDIOS: Chapter[] = [
  {
    id: 'gdelt-media-agenda-lab',
    kicker: 'Live studio',
    corpus: 'Global news & television · live GDELT APIs',
    dek: 'Search global news and TV coverage as an agenda-setting lab: compare attention, tone, source geography, and station airtime, with evidence cards built from live queries.',
    methods: ['Attention & tone', 'Live API'],
    title: 'GDELT Media Agenda Lab',
    href: 'https://content.vishalsingh.org/studios/gdelt-media-agenda-lab/index.html',
    thumbnail: 'https://content.vishalsingh.org/studios/gdelt-media-agenda-lab/preview.jpg',
  },
  {
    id: 'cfpb-crisis-monitor',
    kicker: 'Live studio',
    corpus: 'Millions of CFPB consumer complaints',
    dek: 'Public complaint narratives as a crisis early-warning system: pin incident spikes, read consented narratives, and separate product-mix shifts from real operational improvement.',
    methods: ['Narratives', 'Shock analysis'],
    title: 'CFPB Crisis Monitor',
    href: 'https://content.vishalsingh.org/studios/cfpb-crisis-monitor/index.html',
    thumbnail: 'https://content.vishalsingh.org/studios/cfpb-crisis-monitor/preview.jpg',
  },
];

const DATASETS: { id: string; title: string; href: string; note: string }[] = [
  {
    id: 'trump-tweet-device',
    title: 'Trump tweet device corpus',
    href: '/datasets/trump-tweet-device',
    note: 'Tweets with device metadata — the raw material behind Chapter 02.',
  },
  {
    id: 'beer-acquisition-tweets',
    title: 'Beer acquisition tweet sentiment corpus',
    href: '/datasets/beer-acquisition-tweets',
    note: 'Goose Island mentions, before and after the deal — Chapter 03’s corpus.',
  },
  {
    id: 'political-book-reviews',
    title: 'Political books review corpus',
    href: '/datasets/political-book-reviews',
    note: 'Review text with ratings and metadata, ready for classification exercises.',
  },
  {
    id: 'renthop-listings',
    title: 'RentHop apartment listings',
    href: '/datasets/renthop-listings',
    note: 'Listing descriptions as features — text meets structured prediction.',
  },
];

/** Book chapters where the theory lives (slugs resolved against book-toc). */
const BOOK_SLUGS = [
  'ch13-text-as-data',
  'ch13-preprocessing-tfidf',
  'ch13-text-classification',
  'ch13-topic-models',
  'ch13-classical-nlp-limits',
  'ch14-embeddings',
  'ch14-gpt-measurement',
  'ch16-llm-capabilities',
  'ch16-structured-outputs',
];

const ARC = [
  {
    numeral: 'I',
    title: 'Counting',
    body: 'Dictionaries, word frequencies, readability. Transparent, fast, and auditable — the measures you can defend line by line.',
  },
  {
    numeral: 'II',
    title: 'Discovering',
    body: 'Topic models, clustering, embeddings. Let the corpus reveal its own structure before you impose one on it.',
  },
  {
    numeral: 'III',
    title: 'Measuring',
    body: 'LLMs as annotators: context-sensitive constructs — framing, stance, moral language — scored at scale and validated like any instrument.',
  },
];

/** Overlay live registry fields onto a curated entry (fallbacks keep it rendering). */
function overlay<T extends { id: string; title: string; href: string; thumbnail?: string }>(
  entry: T,
  byId: Map<string, RegistryItem>
): T {
  const live = byId.get(entry.id);
  if (!live) return entry;
  return {
    ...entry,
    title: live.title || entry.title,
    href: live.href || entry.href,
    thumbnail: live.thumbnail || entry.thumbnail,
  };
}

const bookletLd = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: BOOKLET_TITLE,
  description: `${BOOKLET_SUBTITLE} — a field booklet of data essays, live studios, and datasets.`,
  url: `${SITE_URL}/nlp`,
  author: {
    '@type': 'Person',
    name: 'Vishal Singh',
    affiliation: { '@type': 'CollegeOrUniversity', name: 'New York University, Stern School of Business' },
  },
  inLanguage: 'en',
  hasPart: CHAPTERS.map(c => ({ '@type': 'Article', name: c.title, url: c.href })),
};

function SectionHeading({
  kicker,
  title,
  lede,
}: {
  kicker: string;
  title: string;
  lede?: string;
}) {
  return (
    <div className="max-w-2xl">
      <p className="font-plex text-[11px] uppercase tracking-[0.2em] text-hub-amber">{kicker}</p>
      <h2 className="mt-1.5 font-serif text-[clamp(24px,3.4vw,32px)] font-semibold leading-tight text-hub-ink">
        {title}
      </h2>
      {lede && <p className="mt-2 text-[15px] leading-relaxed text-hub-ink-soft">{lede}</p>}
    </div>
  );
}

function ChapterRow({ chapter, index }: { chapter: Chapter; index: number }) {
  const no = String(index + 1).padStart(2, '0');
  return (
    <li className="border-t border-hub-line first:border-t-0">
      <a
        href={chapter.href}
        target="_blank"
        rel="noopener"
        className="group -mx-4 grid items-center gap-x-6 gap-y-4 rounded-2xl px-4 py-7 transition-colors hover:bg-hub-paper2 sm:grid-cols-[72px_minmax(0,1fr)] lg:grid-cols-[72px_minmax(0,1fr)_230px]"
      >
        <div className="hidden select-none font-serif text-[44px] font-semibold leading-none tracking-tight text-hub-ink/15 transition-colors group-hover:text-hub-teal/40 sm:block">
          {no}
        </div>

        <div className="min-w-0">
          <p className="font-plex text-[10.5px] uppercase tracking-[0.14em] text-hub-teal">
            {chapter.kicker}
            <span className="text-hub-ink-faint"> · {chapter.corpus}</span>
          </p>
          <h3 className="mt-1.5 font-serif text-[clamp(19px,2.6vw,23px)] font-semibold leading-snug text-hub-ink transition-colors group-hover:text-hub-teal">
            <span className="mr-2 font-plex text-[13px] font-normal text-hub-ink-faint sm:hidden">{no}</span>
            {chapter.title}
          </h3>
          <p className="mt-2 text-[14px] leading-relaxed text-hub-ink-soft">{chapter.dek}</p>
          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            {chapter.methods.map(m => (
              <span
                key={m}
                className="rounded border border-hub-line bg-hub-paper2 px-1.5 py-0.5 font-plex text-[10px] text-hub-ink-soft"
              >
                {m}
              </span>
            ))}
            <span className="ml-1 inline-flex items-center gap-1 font-plex text-[11px] uppercase tracking-[0.06em] text-hub-teal">
              Read <ArrowUpRight size={12} strokeWidth={2.5} />
            </span>
          </div>
        </div>

        {chapter.thumbnail && (
          <div className="relative hidden aspect-[16/10] overflow-hidden rounded-xl border border-hub-line bg-hub-paper2 shadow-hub lg:block">
            <Image
              src={chapter.thumbnail}
              alt=""
              fill
              sizes="230px"
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.05]"
            />
          </div>
        )}
      </a>
    </li>
  );
}

export default async function NlpBookletPage() {
  const registry = await getRegistry();
  const byId = new Map(registry.map(i => [i.id, i]));

  const chapters = CHAPTERS.map(c => overlay(c, byId));
  const studios = STUDIOS.map(s => overlay(s, byId));
  const bookChapters = BOOK_SLUGS.map(slug => allArticles.find(a => a.slug === slug)).filter(
    (a): a is NonNullable<typeof a> => Boolean(a)
  );

  return (
    <div>
      <JsonLd data={bookletLd} />

      {/* ── Cover ─────────────────────────────────────────────────────── */}
      <header className="hub-hero border-b border-hub-line">
        <div className="mx-auto max-w-4xl px-5 py-16 sm:px-7 sm:py-20">
          <p className="font-plex text-[12px] uppercase tracking-[0.18em] text-hub-amber">
            A field booklet · Data-Driven Decision Making
          </p>
          <h1 className="mt-4 font-serif text-[clamp(38px,7vw,68px)] font-semibold leading-[1.03] tracking-tight text-hub-ink">
            The Measure of <span className="italic text-hub-teal">Words</span>
          </h1>
          <p className="mt-4 max-w-2xl font-serif text-[clamp(17px,2.6vw,22px)] font-medium leading-snug text-hub-ink-soft">
            {BOOKLET_SUBTITLE}.
          </p>
          <p className="mt-5 max-w-2xl text-[15.5px] leading-relaxed text-hub-ink-soft">
            Six data essays, two live studios, and a small data shelf on turning language into
            evidence — how analysts count, discover, and measure meaning in text, from dictionary
            word counts to LLM annotation at scale.
          </p>

          <p className="mt-6 text-[14.5px] text-hub-ink-soft">
            by <span className="font-serif font-semibold text-hub-ink">Vishal Singh</span>
            <span className="text-hub-ink-faint"> · Professor of Marketing, NYU Stern</span>
          </p>

          {/* Contents at a glance */}
          <dl className="mt-8 flex flex-wrap gap-x-8 gap-y-3 border-t border-hub-line pt-5">
            {[
              [String(chapters.length).padStart(2, '0'), 'chapters'],
              [String(studios.length).padStart(2, '0'), 'live studios'],
              [String(DATASETS.length).padStart(2, '0'), 'datasets'],
              ['300k+', 'documents measured'],
            ].map(([num, label]) => (
              <div key={label}>
                <dt className="sr-only">{label}</dt>
                <dd className="font-plex text-[13px] text-hub-ink">
                  <span className="text-[17px] font-medium tabular-nums text-hub-teal">{num}</span>{' '}
                  <span className="uppercase tracking-[0.1em] text-hub-ink-faint">{label}</span>
                </dd>
              </div>
            ))}
          </dl>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a
              href="#chapters"
              className="inline-flex items-center gap-2 rounded-md bg-hub-teal px-5 py-2.5 text-sm font-semibold text-white shadow-hub transition-opacity hover:opacity-90"
            >
              <BookOpen size={16} strokeWidth={2} /> Start reading
              <ArrowRight size={15} />
            </a>
            <Link
              href="/gallery"
              className="inline-flex items-center gap-2 rounded-md border border-hub-line-strong bg-hub-card px-4 py-2.5 text-sm font-medium text-hub-ink transition-colors hover:border-hub-teal hover:text-hub-teal"
            >
              Browse the full gallery
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-5 sm:px-7">
        {/* ── The arc ─────────────────────────────────────────────────── */}
        <section className="py-12 sm:py-14">
          <SectionHeading
            kicker="How to read this booklet"
            title="Three moves, in order"
            lede="Every essay that follows uses one or more of these moves. Together they are the working grammar of text as data."
          />
          <ol className="mt-8 grid gap-4 sm:grid-cols-3">
            {ARC.map(step => (
              <li
                key={step.numeral}
                className="rounded-2xl border border-hub-line bg-hub-card p-5 shadow-hub"
              >
                <p className="font-serif text-[22px] font-semibold italic leading-none text-hub-teal">
                  {step.numeral}
                </p>
                <h3 className="mt-2.5 font-serif text-[18px] font-semibold text-hub-ink">{step.title}</h3>
                <p className="mt-1.5 text-[13.5px] leading-relaxed text-hub-ink-soft">{step.body}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* ── Chapters ────────────────────────────────────────────────── */}
        <section id="chapters" className="scroll-mt-20 border-t border-hub-line-strong py-12 sm:py-14">
          <SectionHeading
            kicker="Contents"
            title="The chapters"
            lede="Read in order — the field guide first, then four corpora of increasing scale, ending where classification hands off to LLM measurement. Each opens in a new tab."
          />
          <ol className="mt-6">
            {chapters.map((c, i) => (
              <ChapterRow key={c.id} chapter={c} index={i} />
            ))}
          </ol>
        </section>

        {/* ── Live studios ────────────────────────────────────────────── */}
        <section className="border-t border-hub-line-strong py-12 sm:py-14">
          <SectionHeading
            kicker="Interlude"
            title="Live studios"
            lede="The essays are fixed arguments; these are open instruments. Both run on live text feeds — bring your own question."
          />
          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            {studios.map(s => (
              <a
                key={s.id}
                href={s.href}
                target="_blank"
                rel="noopener"
                className="group flex flex-col overflow-hidden rounded-2xl border border-hub-line bg-hub-card shadow-hub transition-[transform,border-color] duration-200 hover:-translate-y-1 hover:border-hub-line-strong"
              >
                {s.thumbnail && (
                  <div className="relative aspect-[16/9] overflow-hidden bg-hub-paper2">
                    <Image
                      src={s.thumbnail}
                      alt=""
                      fill
                      sizes="(max-width: 640px) 100vw, 50vw"
                      className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
                    />
                    <span className="absolute inset-x-0 top-0 h-1 bg-hub-teal" />
                    <span className="absolute left-2.5 top-2.5 inline-flex items-center gap-1 rounded-full bg-hub-teal px-2 py-0.5 font-plex text-[10px] font-medium uppercase tracking-[0.06em] text-white shadow-hub">
                      <MonitorPlay size={11} strokeWidth={2.5} /> {s.kicker}
                    </span>
                  </div>
                )}
                <div className="flex flex-grow flex-col p-5">
                  <p className="font-plex text-[10.5px] uppercase tracking-[0.14em] text-hub-ink-faint">
                    {s.corpus}
                  </p>
                  <h3 className="mt-1.5 font-serif text-[19px] font-semibold leading-snug text-hub-ink transition-colors group-hover:text-hub-teal">
                    {s.title}
                  </h3>
                  <p className="mt-1.5 flex-grow text-[13.5px] leading-relaxed text-hub-ink-soft">{s.dek}</p>
                  <span className="mt-3 inline-flex items-center gap-1 font-plex text-[11px] uppercase tracking-[0.06em] text-hub-teal">
                    Open studio <ArrowUpRight size={12} strokeWidth={2.5} />
                  </span>
                </div>
              </a>
            ))}
          </div>
        </section>

        {/* ── Data shelf ──────────────────────────────────────────────── */}
        <section className="border-t border-hub-line-strong py-12 sm:py-14">
          <SectionHeading
            kicker="Appendix"
            title="The data shelf"
            lede="The corpora behind the chapters, packaged for the classroom — download, replicate, disagree."
          />
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {DATASETS.map(d => (
              <li key={d.id}>
                <Link
                  href={d.href}
                  className="group flex h-full flex-col rounded-2xl border border-hub-line bg-hub-card p-4 shadow-hub transition-[transform,border-color] duration-200 hover:-translate-y-0.5 hover:border-hub-line-strong"
                >
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-hub-amber-soft text-hub-amber">
                    <Database size={15} strokeWidth={2} />
                  </span>
                  <h3 className="mt-2.5 font-serif text-[15.5px] font-semibold leading-snug text-hub-ink transition-colors group-hover:text-hub-teal">
                    {d.title}
                  </h3>
                  <p className="mt-1.5 flex-grow text-[12.5px] leading-relaxed text-hub-ink-soft">{d.note}</p>
                  <span className="mt-3 inline-flex items-center gap-1 font-plex text-[10.5px] uppercase tracking-[0.06em] text-hub-amber">
                    Dataset <ArrowRight size={11} strokeWidth={2.5} />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* ── Theory, in the book ─────────────────────────────────────── */}
        <section className="border-t border-hub-line-strong py-12 sm:py-14">
          <SectionHeading
            kicker="Companion reading"
            title="Where the theory lives"
            lede="Every method used above has a chapter in the D3M book — Part V walks from bag-of-words to embeddings, GPT-as-measurement, and structured LLM outputs."
          />
          <div className="mt-6 flex flex-wrap gap-2">
            {bookChapters.map(a => (
              <Link
                key={a.slug}
                href={`/${a.slug}`}
                className="inline-flex items-baseline gap-2 rounded-full border border-hub-line bg-hub-card px-3.5 py-1.5 text-[13px] text-hub-ink-soft transition-colors hover:border-hub-teal hover:text-hub-teal"
              >
                <span className="font-plex text-[10.5px] tabular-nums text-hub-ink-faint">§{a.number}</span>
                {a.title}
              </Link>
            ))}
          </div>
          <Link
            href="/teaching/part/V"
            className="mt-5 inline-flex items-center gap-1.5 font-plex text-[12px] uppercase tracking-[0.08em] text-hub-teal hover:underline"
          >
            Part V — Unstructured Data, Embeddings, and Generative AI
            <ArrowRight size={13} strokeWidth={2.5} />
          </Link>
        </section>

        {/* ── Coming soon ─────────────────────────────────────────────── */}
        <section className="border-t border-hub-line-strong py-12 sm:py-14">
          <SectionHeading
            kicker="Next in this booklet"
            title="A chapter in production"
            lede="The next essays extend the same measurement discipline a century back in time."
          />
          <div className="relative mt-8 overflow-hidden rounded-2xl border border-dashed border-hub-amber/60 bg-hub-amber-soft/50 p-6 sm:p-8">
            <span
              aria-hidden
              className="pointer-events-none absolute -right-4 -top-7 select-none font-serif text-[120px] font-semibold leading-none text-hub-amber/15"
            >
              07
            </span>
            <p className="inline-flex items-center gap-2 font-plex text-[10.5px] uppercase tracking-[0.14em] text-hub-amber">
              <Newspaper size={13} strokeWidth={2.25} />
              In production · arriving soon
            </p>
            <h3 className="relative mt-2 max-w-xl font-serif text-[clamp(21px,3vw,27px)] font-semibold leading-snug text-hub-ink">
              Moral Language and Political Orientation in the Historical American Press
            </h3>
            <p className="mt-1 font-plex text-[11.5px] uppercase tracking-[0.1em] text-hub-ink-faint">
              The digitized American press · 1890–1935
            </p>
            <p className="relative mt-3 max-w-2xl text-[14.5px] leading-relaxed text-hub-ink-soft">
              How did newspapers use moral language to make policies and social change look
              legitimate — or illegitimate? Moral-foundations dictionaries and context-sensitive LLM
              annotation over millions of historical newspaper articles, anchored on two first
              cases: Prohibition (1918–1933) and the influenza restrictions of 1918–19.
            </p>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {[
                'American Stories corpus',
                'Chronicling America',
                'Moral foundations',
                'LLM annotation',
                'Prohibition 1918–33',
                'Influenza 1918–19',
              ].map(t => (
                <span
                  key={t}
                  className="rounded border border-hub-amber/40 bg-hub-card/70 px-1.5 py-0.5 font-plex text-[10px] text-hub-ink-soft"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ── Colophon ────────────────────────────────────────────────── */}
        <footer className="border-t border-hub-line py-10 text-center">
          <p className="font-serif text-[15px] italic text-hub-ink-soft">
            {BOOKLET_TITLE} — assembled from the D3M gallery.
          </p>
          <p className="mt-1.5 font-plex text-[11px] uppercase tracking-[0.1em] text-hub-ink-faint">
            Vishal Singh · NYU Stern · vishalsingh.org
          </p>
        </footer>
      </main>
    </div>
  );
}
