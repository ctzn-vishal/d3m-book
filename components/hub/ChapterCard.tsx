import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import type { Chapter } from '@/lib/book-types';
import { getChapterContent } from '@/lib/book-content';
import { ACCENT, resolveIcon, type PartAccent } from '@/lib/book-visuals';
import { studiosForChapter } from '@/lib/book-studios';

/**
 * One chapter, shown as a card on the teaching cover and on part pages.
 * The header (icon + number + title) links to the chapter overview page; each
 * article links to the article itself; paired studios open in a new tab.
 */
export function ChapterCard({ chapter, accent }: { chapter: Chapter; accent: PartAccent }) {
  const content = getChapterContent(chapter.number);
  const related = studiosForChapter(chapter);
  const Icon = resolveIcon(content?.icon);
  const a = ACCENT[accent];

  return (
    <div className="flex flex-col rounded-2xl border border-hub-line bg-hub-card p-5 shadow-hub transition-[transform,border-color] duration-200 hover:-translate-y-0.5 hover:border-hub-line-strong">
      <Link href={`/teaching/ch/${chapter.number}`} className="group/head flex items-start gap-3 no-underline">
        <span
          className={`mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${a.borderSoft} ${a.softBg} ${a.text}`}
        >
          <Icon size={18} strokeWidth={1.75} />
        </span>
        <span className="min-w-0">
          <span className="block font-plex text-[11px] uppercase tracking-[0.05em] text-hub-ink-faint">
            Chapter {chapter.number}
          </span>
          <span className="mt-0.5 block font-serif text-[18.5px] font-semibold leading-snug text-hub-ink decoration-hub-line-strong underline-offset-2 group-hover/head:underline">
            {chapter.title}
          </span>
        </span>
      </Link>

      {content?.throughLine && (
        <p className="mt-2.5 font-serif text-[13.5px] italic leading-snug text-hub-ink-soft">
          {content.throughLine}
        </p>
      )}

      <ul className="mt-3 flex flex-col gap-0.5">
        {chapter.articles.map(art => (
          <li key={art.slug}>
            <Link
              href={`/${art.slug}`}
              className="group/a -mx-2 flex gap-2.5 rounded-md px-2 py-1.5 text-[13.5px] leading-snug text-hub-ink-soft transition-colors hover:bg-hub-paper2 hover:text-hub-ink"
            >
              <span className="pt-px font-plex text-[11.5px] tabular-nums text-hub-ink-faint">{art.number}</span>
              <span className="decoration-hub-line-strong underline-offset-2 group-hover/a:underline">
                {art.title}
              </span>
            </Link>
          </li>
        ))}
      </ul>

      {related.length > 0 && (
        <div className="mt-3.5 flex flex-wrap items-center gap-1.5 border-t border-hub-line pt-3">
          <span className="font-plex text-[10px] uppercase tracking-[0.06em] text-hub-ink-faint">Studios</span>
          {related.map(s => (
            <a
              key={s.slug}
              href={`/studios/${s.slug}/index.html`}
              target="_blank"
              rel="noopener noreferrer"
              className={`rounded-md border ${a.borderSoft} ${a.softBg} px-2 py-0.5 font-plex text-[10.5px] ${a.text} transition-colors hover:border-hub-line-strong`}
            >
              {s.title.length > 34 ? `${s.title.slice(0, 32)}…` : s.title}
            </a>
          ))}
        </div>
      )}

      <Link
        href={`/teaching/ch/${chapter.number}`}
        className={`group/more mt-3.5 inline-flex items-center gap-1 font-plex text-[10.5px] uppercase tracking-[0.07em] ${a.text} no-underline`}
      >
        Chapter overview
        <ArrowUpRight size={12} strokeWidth={2.25} className="transition-transform group-hover/more:translate-x-0.5 group-hover/more:-translate-y-0.5" />
      </Link>
    </div>
  );
}
