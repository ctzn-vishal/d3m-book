import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { getRegistry } from '@/lib/registry-db';
import { TOPICS, TOPIC_META, topicFromSlug, type Topic } from '@/lib/taxonomy';
import { GalleryCard } from '@/components/hub/GalleryCard';
import { SITE_URL } from '@/lib/share-metadata';
import { JsonLd } from '@/components/JsonLd';

/**
 * Server-rendered topic landing page — one per canonical topic (lib/taxonomy).
 * These are the indexable "shelf" pages the client-filtered gallery grid can't
 * be: stable URL, editorial intro, and a crawlable list of every published item
 * on the topic. Items come from live Turso (snapshot fallback) via ISR, so
 * curation in /admin shows here without a redeploy.
 */

export const revalidate = 600;

interface Props {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return TOPICS.map(t => ({ slug: TOPIC_META[t].slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const topic = topicFromSlug(slug);
  if (!topic) return { title: 'Topic not found' };
  const { blurb } = TOPIC_META[topic];
  return {
    title: `${topic} — Data Stories, Apps & Teaching | Vishal Singh`,
    description: blurb,
    alternates: { canonical: `${SITE_URL}/topic/${slug}` },
    openGraph: { siteName: 'vishalsingh.org' },
  };
}

export default async function TopicPage({ params }: Props) {
  const { slug } = await params;
  const topic = topicFromSlug(slug);
  if (!topic) notFound();

  const all = await getRegistry();
  const items = all.filter(i => i.topic === topic);
  const countByTopic = new Map<string, number>();
  for (const i of all) if (i.topic) countByTopic.set(i.topic, (countByTopic.get(i.topic) ?? 0) + 1);
  const otherTopics = TOPICS.filter((t): t is Topic => t !== topic && (countByTopic.get(t) ?? 0) > 0);

  const pageUrl = `${SITE_URL}/topic/${slug}`;
  const topicLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: `${topic} — Data Stories, Apps & Teaching`,
      description: TOPIC_META[topic].blurb,
      url: pageUrl,
      isPartOf: { '@type': 'WebSite', name: 'Vishal Singh', url: `${SITE_URL}/` },
      mainEntity: {
        '@type': 'ItemList',
        numberOfItems: items.length,
        itemListElement: items.map((i, idx) => ({
          '@type': 'ListItem',
          position: idx + 1,
          name: i.title,
          url: i.href.startsWith('http') ? i.href : `${SITE_URL}${i.href}`,
        })),
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Gallery', item: `${SITE_URL}/` },
        { '@type': 'ListItem', position: 2, name: topic, item: pageUrl },
      ],
    },
  ];

  return (
    <div>
      <JsonLd data={topicLd} />
      <header className="hub-hero border-b border-hub-line">
        <div className="mx-auto max-w-6xl px-5 py-10 sm:px-7 sm:py-12">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 font-plex text-[11px] uppercase tracking-[0.08em] text-hub-ink-soft hover:text-hub-teal"
          >
            <ArrowLeft size={13} strokeWidth={2.5} /> Gallery
          </Link>
          <div className="mt-4 font-plex text-[12px] uppercase tracking-[0.16em] text-hub-amber">
            Topic
          </div>
          <h1 className="mt-2 max-w-3xl font-serif text-[clamp(30px,5vw,46px)] font-semibold leading-[1.08] tracking-tight text-hub-ink">
            {topic}
          </h1>
          <p className="mt-3 max-w-2xl text-[16px] leading-relaxed text-hub-ink-soft">
            {TOPIC_META[topic].blurb}
          </p>
          <p className="mt-3 font-plex text-[11.5px] uppercase tracking-[0.06em] text-hub-ink-faint">
            {items.length} {items.length === 1 ? 'piece' : 'pieces'}
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-5 py-10 sm:px-7">
        {items.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {items.map(item => (
              <GalleryCard key={`${item.type}-${item.id}`} item={item} />
            ))}
          </div>
        ) : (
          <p className="rounded-2xl border border-dashed border-hub-line-strong bg-hub-card p-10 text-center text-hub-ink-soft">
            Nothing published under this topic yet — browse the <Link href="/" className="text-hub-teal hover:underline">full gallery</Link>.
          </p>
        )}

        {otherTopics.length > 0 && (
          <div className="mt-12 border-t border-hub-line pt-8">
            <h2 className="font-plex text-[11px] uppercase tracking-[0.1em] text-hub-ink-faint">
              More topics
            </h2>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {otherTopics.map(t => (
                <Link
                  key={t}
                  href={`/topic/${TOPIC_META[t].slug}`}
                  className="shrink-0 rounded-full border border-hub-line bg-hub-card px-3 py-1 font-plex text-[11px] uppercase tracking-[0.06em] text-hub-ink-soft transition-colors hover:border-hub-line-strong hover:text-hub-ink no-underline"
                >
                  {t} · {countByTopic.get(t)}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
