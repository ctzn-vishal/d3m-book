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

/** True when the registry row was created within the last 30 days. */
function isNew(createdAt?: string): boolean {
  if (!createdAt) return false;
  const t = Date.parse(createdAt.replace(' ', 'T') + 'Z'); // 'YYYY-MM-DD HH:MM:SS' (UTC)
  return Number.isFinite(t) && Date.now() - t < 30 * 86400_000;
}

export function GalleryCard({ item }: { item: RegistryItem }) {
  const newTab = item.external || item.openInNewTab;
  const { Icon: TypeIcon, tone, solid, soft, bar } = TYPE_META[item.type];
  const inner = (
    <>
      <div className="relative aspect-[16/10] overflow-hidden bg-hub-paper2">
        {item.thumbnail ? (
          <Image
            src={item.thumbnail}
            alt=""
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
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

      <div className="flex flex-grow flex-col p-4">
        {item.topic && (
          <div className={`flex items-center gap-1.5 font-plex text-[10px] uppercase tracking-[0.06em] ${tone}`}>
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-current" />
            <span className="text-hub-ink-faint">{item.topic}</span>
          </div>
        )}
        <h3 className="mt-1.5 font-serif text-[17px] font-semibold leading-snug text-hub-ink">
          {item.title}
        </h3>
        <p className="mt-1.5 line-clamp-2 flex-grow text-[13px] leading-relaxed text-hub-ink-soft">
          {item.description}
        </p>
        <div className="mt-3 flex flex-wrap gap-1.5">
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
    'group flex h-full flex-col overflow-hidden rounded-2xl border border-hub-line bg-hub-card shadow-hub transition-[transform,border-color] duration-200 hover:-translate-y-1 hover:border-hub-line-strong no-underline';

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
