import Link from 'next/link';
import type { Chapter } from '@/lib/book-types';
import { getChapterContent } from '@/lib/book-content';
import { chapterHref } from '@/lib/book-toc';
import { resolveIcon, type PartColor } from '@/lib/book-visuals';
import { itemsForChapter } from '@/lib/registry';

/**
 * A chapter on the contents page and on part pages. The header links to the
 * chapter overview; each article links to the article; studios open in a new
 * tab. Styled in the book's reading theme (white card, Space Grotesk title,
 * sky-blue links). The icon carries its part's color.
 */
export function ChapterCard({ chapter, color }: { chapter: Chapter; color: PartColor }) {
  const content = getChapterContent(chapter.number);
  const related = itemsForChapter(chapter.articles.map(a => a.slug)).filter(i => i.type === 'Teaching');
  const Icon = resolveIcon(content?.icon);

  return (
    <div className="flex flex-col rounded-lg border border-border bg-surface p-5 transition-colors hover:border-border-strong">
      <Link href={chapterHref(chapter)} className="group flex items-start gap-3">
        <span className={`mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md ${color.chip} ${color.icon}`}>
          <Icon size={18} strokeWidth={1.9} />
        </span>
        <span className="min-w-0">
          <span className="block font-mono text-[11px] uppercase tracking-wider text-muted">
            Chapter {chapter.number}
          </span>
          <span className="mt-0.5 block font-display text-[17px] font-semibold leading-snug text-body transition-colors group-hover:text-link">
            {chapter.title}
          </span>
        </span>
      </Link>

      {content?.throughLine && (
        <p className="mt-2.5 text-[13px] leading-snug text-muted">{content.throughLine}</p>
      )}

      <ul className="mt-3 flex flex-col gap-0.5">
        {chapter.articles.map(art => (
          <li key={art.slug}>
            <Link
              href={`/${art.slug}`}
              className="group -mx-2 flex gap-2.5 rounded-md px-2 py-1.5 text-[13.5px] leading-snug text-subtle transition-colors hover:bg-card hover:text-link"
            >
              <span className="pt-px font-mono text-[11.5px] tabular-nums text-muted">{art.number}</span>
              <span>{art.title}</span>
            </Link>
          </li>
        ))}
      </ul>

      {related.length > 0 && (
        <div className="mt-3.5 flex flex-wrap items-center gap-1.5 border-t border-border pt-3">
          <span className="font-mono text-[10px] uppercase tracking-wider text-muted">Studios</span>
          {related.map(s => (
            <a
              key={s.id}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded border border-border bg-card px-2 py-0.5 text-[10.5px] text-subtle transition-colors hover:border-border-strong hover:text-link"
            >
              {s.title.length > 30 ? `${s.title.slice(0, 28)}…` : s.title}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
