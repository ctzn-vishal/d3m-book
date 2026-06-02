'use client';

import * as React from 'react';

interface Heading {
  id: string;
  text: string;
  level: number;
}

/**
 * OnThisPage — a sticky in-page table of contents that scroll-spies the
 * current article's <h2>/<h3> headings (which carry stable ids from
 * rehype-slug). Renders nothing when an article has fewer than two
 * headings, so short reference cards aren't cluttered.
 *
 * Lives in the right rail of BookShell on xl screens only.
 */
export function OnThisPage() {
  const [headings, setHeadings] = React.useState<Heading[]>([]);
  const [activeId, setActiveId] = React.useState<string>('');

  React.useEffect(() => {
    const nodes = Array.from(
      document.querySelectorAll<HTMLElement>('article h2[id], article h3[id]')
    );
    const found: Heading[] = nodes
      .filter(n => n.textContent && n.textContent.trim().length > 0)
      .map(n => ({
        id: n.id,
        text: n.textContent!.trim().replace(/¶$/, ''),
        level: n.tagName === 'H3' ? 3 : 2,
      }));
    setHeadings(found);

    if (found.length === 0) return;

    const observer = new IntersectionObserver(
      entries => {
        const visible = entries
          .filter(e => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: '-96px 0px -66% 0px', threshold: [0, 1] }
    );

    nodes.forEach(n => observer.observe(n));
    return () => observer.disconnect();
  }, []);

  if (headings.length < 2) return null;

  return (
    <nav aria-label="On this page" className="text-[13px]">
      <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">
        On this page
      </p>
      <ul className="space-y-1 border-l border-border">
        {headings.map(h => {
          const isActive = h.id === activeId;
          return (
            <li key={h.id}>
              <a
                href={`#${h.id}`}
                onClick={() => setActiveId(h.id)}
                className={[
                  'block border-l-2 -ml-px py-0.5 leading-snug transition-colors',
                  h.level === 3 ? 'pl-5 text-[12px]' : 'pl-3.5',
                  isActive
                    ? 'border-link text-body font-medium'
                    : 'border-transparent text-muted hover:text-body hover:border-border-strong',
                ].join(' ')}
              >
                {h.text}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
