import * as React from 'react';

export type FigureWidth =
  | 'body'          // matches the prose column (~768px). Default.
  | 'body-outset'   // slight breathing room (~880px); for hero charts that want air.
  | 'page-outset'   // wider than the prose column (~1080px); for SmallMultiples 4-up,
                    // wide tables, or comparison figures that need horizontal room.
  | 'screen-inset'; // close to viewport-edge, with a small inset; punctuation moments only.

export interface FigureProps {
  /**
   * Width zone. Borrowed from Distill / Radix / academic-article CSS
   * vernacular. The zone defines how far the figure breaks out of the
   * prose column at md: and up; below md:, all zones collapse to body
   * width (there's no horizontal room to escape into).
   *
   * Default: 'body' — same width as surrounding prose.
   */
  width?: FigureWidth;
  /**
   * Optional figcaption rendered below the figure content. Pass JSX so
   * you can inline figure numbers, links, etc. The figure itself does
   * not number — that's the author's call (per composition.md, every
   * figure is numbered + cross-referenced).
   *
   * If your inner content already renders its own <figcaption> (e.g.
   * <DataTable>), omit this — you don't want two captions.
   */
  caption?: React.ReactNode;
  /**
   * The figure body — typically a chart, SmallMultiples, table, or
   * image. Wrap in `not-prose` if not already (the wrapper does NOT
   * wrap in not-prose for you, since some captions are prose-styled).
   */
  children: React.ReactNode;
}

/**
 * Per-zone escape classes. Gated to `lg:` (1024px) and up — below that the
 * reading column already fills most of the viewport, so there's no room to
 * outset into and every zone collapses to body width.
 *
 * Width is sized against the CONTENT COLUMN, not the viewport: the book shell
 * (BookShell) marks col2 as a size container, so `100cqw` resolves to the
 * column's width. Each zone fills the column up to a pixel ceiling and centers
 * within it via a symmetric margin — `(100% - W) / 2`, where `100%` is the prose
 * column the figure sits in. Because the figure can never exceed the content
 * column, it never slides under the sticky left sidebar; it grows rightward into
 * the available space instead.
 *
 * The pixel ceilings keep the three zones distinct on wide screens (where the
 * column is wider than any single figure needs):
 *   body-outset   — up to 51rem (light breathing room past prose)
 *   page-outset   — up to 60rem (wide tables / 4-up small multiples)
 *   screen-inset  — up to 80rem (fills the column; punctuation moments)
 */
const WIDTH_CLASS: Record<FigureWidth, string> = {
  body: '',
  'body-outset':
    'lg:w-[min(100cqw,51rem)] lg:mx-[calc((100%_-_min(100cqw,51rem))_/_2)]',
  'page-outset':
    'lg:w-[min(100cqw,60rem)] lg:mx-[calc((100%_-_min(100cqw,60rem))_/_2)]',
  'screen-inset':
    'lg:w-[min(100cqw,80rem)] lg:mx-[calc((100%_-_min(100cqw,80rem))_/_2)]',
};

/**
 * Figure — Distill-style layout zone wrapper. Use to give a chart,
 * SmallMultiples, table, or image more (or less) horizontal room than
 * the prose column. Authors pick the zone editorially:
 *
 * | width        | Use for                                              |
 * | ------------ | ---------------------------------------------------- |
 * | body         | inline figure, single chart (default)                |
 * | body-outset  | hero chart that wants slight breathing room          |
 * | page-outset  | SmallMultiples 4-up, wide table, comparison figure   |
 * | screen-inset | rare — full-bleed-ish punctuation                    |
 *
 * Below md:, every zone collapses to body width.
 *
 * Implementation note: this component emits a `<figure>` element. If
 * an inner component (DataTable, SmallMultiples) also emits a
 * `<figure>`, you'd get nested figures. To avoid that, those
 * components should be passed without their own figure wrapper, OR you
 * wrap a chart's `<div>` directly without emitting a second figure.
 *
 * Use:
 *
 *   <Figure width="page-outset" caption="Figure 4. Confidence in four institutions, by education.">
 *     <SmallMultiples ...>...</SmallMultiples>
 *   </Figure>
 *
 * If your inner content is itself a complete figure (like DataTable or
 * the existing SmallMultiples, which both render their own
 * <figcaption>), omit `caption` and just use Figure for the width
 * escape:
 *
 *   <Figure width="page-outset">
 *     <SmallMultiples ...>...</SmallMultiples>
 *   </Figure>
 */
export function Figure({ width = 'body', caption, children }: FigureProps) {
  const escapeClass = WIDTH_CLASS[width];
  // We render a <div>, not a <figure>, when the child is already a
  // complete figure — to keep HTML valid (no nested <figure>). If a
  // caption is passed, we DO emit <figure>+<figcaption> here, on the
  // assumption the inner is a bare chart/table that doesn't have its
  // own caption.
  if (caption) {
    return (
      <figure className={['not-prose my-6 min-w-0', escapeClass].filter(Boolean).join(' ')}>
        {children}
        <figcaption className="mt-3 max-w-3xl border-t border-border/80 pt-2 text-[13px] italic leading-snug text-muted">
          {caption}
        </figcaption>
      </figure>
    );
  }
  return (
    <div className={['not-prose my-6 min-w-0', escapeClass].filter(Boolean).join(' ')}>
      {children}
    </div>
  );
}
