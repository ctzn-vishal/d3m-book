'use client';

import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowUpRight,
  GraduationCap,
  Newspaper,
  AppWindow,
  Database,
  type LucideIcon,
} from 'lucide-react';
import { TYPE_LABEL, type RegistryItem, type RegistryType } from '@/lib/registry-types';

/**
 * Per-type icon + accent (hub palette) — the visual key shared by the type
 * filter chips and the cards, so each of the four artifact classes reads at a
 * glance. `active` = solid-fill chip classes; `tone` = the idle icon/label color.
 */
export const TYPE_META: Record<
  RegistryType,
  { Icon: LucideIcon; active: string; tone: string; solid: string; soft: string; bar: string }
> = {
  Teaching: { Icon: GraduationCap, active: 'border-hub-teal bg-hub-teal text-white', tone: 'text-hub-teal', solid: 'bg-hub-teal text-white', soft: 'bg-hub-teal-soft text-hub-teal', bar: 'bg-hub-teal' },
  Blog: { Icon: Newspaper, active: 'border-hub-plum bg-hub-plum text-white', tone: 'text-hub-plum', solid: 'bg-hub-plum text-white', soft: 'bg-hub-plum-soft text-hub-plum', bar: 'bg-hub-plum' },
  App: { Icon: AppWindow, active: 'border-hub-blue bg-hub-blue text-white', tone: 'text-hub-blue', solid: 'bg-hub-blue text-white', soft: 'bg-hub-blue-soft text-hub-blue', bar: 'bg-hub-blue' },
  Dataset: { Icon: Database, active: 'border-hub-amber bg-hub-amber text-white', tone: 'text-hub-amber', solid: 'bg-hub-amber text-white', soft: 'bg-hub-amber-soft text-hub-amber', bar: 'bg-hub-amber' },
};

// First-party origins: our own content keeps its referrer (bucket analytics see
// the hub as the source); truly external links still get `noreferrer`.
const CONTENT_ORIGIN = (process.env.NEXT_PUBLIC_CONTENT_URL || 'https://content.vishalsingh.org').replace(/\/$/, '');
const SITE_ORIGIN = (process.env.NEXT_PUBLIC_SITE_URL || 'https://vishalsingh.org').replace(/\/$/, '');
function relFor(href: string): string {
  return href.startsWith(CONTENT_ORIGIN) || href.startsWith(SITE_ORIGIN) || href.startsWith('/')
    ? 'noopener'
    : 'noopener noreferrer';
}

// The catalog's created_at was backfilled in bulk by the 2026-06 timestamp
// migration — those rows aren't "new", so anything at or before the floor never
// badges. Real additions after it do.
const NEW_BADGE_FLOOR = '2026-06-25';

/** True when the registry row was created within the last 30 days (post-migration rows only). */
function isNew(createdAt?: string): boolean {
  if (!createdAt || createdAt.slice(0, 10) <= NEW_BADGE_FLOOR) return false;
  const t = Date.parse(createdAt.replace(' ', 'T') + 'Z'); // 'YYYY-MM-DD HH:MM:SS' (UTC)
  return Number.isFinite(t) && Date.now() - t < 30 * 86400_000;
}

/** Responsive-grid default (1/2/3 columns). Fixed-width contexts — the home
 *  page's topic shelves — pass their own so the browser doesn't fetch a
 *  1000px-wide source for a 320px card. */
const GRID_SIZES = '(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw';

export function GalleryCard({
  item,
  /** Hide the topic eyebrow where the surrounding context already states it —
   *  a topic shelf or a topic page repeats it on every card otherwise. */
  showTopic = true,
  sizes = GRID_SIZES,
}: {
  item: RegistryItem;
  showTopic?: boolean;
  sizes?: string;
}) {
  const newTab = item.external || item.openInNewTab;
  const { Icon: TypeIcon, tone, solid, soft, bar } = TYPE_META[item.type];
  const inner = (
    <>
      <div className="relative aspect-[16/9] overflow-hidden bg-hub-paper2">
        {item.thumbnail ? (
          <Image
            src={item.thumbnail}
            alt=""
            fill
            sizes={sizes}
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
          />
        ) : (
          <div className={`flex h-full w-full flex-col items-center justify-center gap-2 ${soft}`}>
            <TypeIcon size={32} strokeWidth={1.6} />
            <span className="font-serif text-xl font-semibold tracking-tight">{TYPE_LABEL[item.type]}</span>
          </div>
        )}
        {/* Type identity: color strip + prominent type pill (reads at a glance) */}
        <span className={`absolute inset-x-0 top-0 h-1 ${bar}`} />
        <span className="absolute left-2.5 top-2.5 inline-flex items-center gap-1.5">
          <span className={`inline-flex items-center gap-1 rounded-full ${solid} px-2 py-0.5 font-plex text-[10px] font-medium uppercase tracking-[0.06em] shadow-hub`}>
            <TypeIcon size={11} strokeWidth={2.5} />
            {TYPE_LABEL[item.type]}
          </span>
          {isNew(item.createdAt) && (
            <span className="inline-flex items-center rounded-full bg-hub-amber px-2 py-0.5 font-plex text-[10px] font-medium uppercase tracking-[0.06em] text-white shadow-hub">
              New
            </span>
          )}
        </span>
        {newTab && (
          <span className="absolute right-2.5 top-2.5 inline-flex items-center rounded-full bg-hub-card/90 p-1 text-hub-ink-soft shadow-hub backdrop-blur">
            <ArrowUpRight size={12} strokeWidth={2.5} />
          </span>
        )}
      </div>

      <div className="flex flex-grow flex-col px-4 pb-3.5 pt-3">
        {showTopic && item.topic && (
          <div className={`flex items-center gap-1.5 font-plex text-[10px] uppercase tracking-[0.06em] ${tone}`}>
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-current" />
            <span className="text-hub-ink-faint">{item.topic}</span>
          </div>
        )}
        {/* Clamped: cards sit in equal-height rows, so one three-line title
            would set the height of every card beside it. */}
        <h3 className={`line-clamp-2 font-serif text-[17px] font-semibold leading-snug text-hub-ink ${showTopic && item.topic ? 'mt-1.5' : ''}`}>
          {item.title}
        </h3>
        <p className="mt-1.5 line-clamp-2 flex-grow text-[13px] leading-relaxed text-hub-ink-soft">
          {item.description}
        </p>
        {/* One row of tags. max-h clips a wrapped second row cleanly (the gap
            puts it well past the cutoff), rather than letting a long tag set
            add 27px to every card in the row. */}
        <div className="mt-2.5 flex max-h-[22px] flex-wrap gap-1.5 overflow-hidden">
          {item.tags.slice(0, 3).map(t => (
            <span
              key={t}
              className="rounded border border-hub-line bg-hub-paper2 px-1.5 py-0.5 font-plex text-[10px] text-hub-ink-soft"
            >
              {t}
            </span>
          ))}
        </div>
      </div>
    </>
  );

  const className =
    'group flex h-full flex-col overflow-hidden rounded-2xl border border-hub-line bg-hub-card shadow-hub transition-[transform,border-color] duration-200 hover:-translate-y-1 hover:border-hub-line-strong no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hub-teal focus-visible:ring-offset-2 focus-visible:ring-offset-hub-paper';

  return newTab ? (
    <a href={item.href} target="_blank" rel={relFor(item.href)} className={className}>
      {inner}
    </a>
  ) : (
    <Link href={item.href} className={className}>
      {inner}
    </Link>
  );
}
