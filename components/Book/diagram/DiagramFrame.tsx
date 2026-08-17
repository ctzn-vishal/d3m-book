'use client';

import * as React from 'react';

import { T, toneStroke, type Tone } from './tokens';

/**
 * The container every book schematic sits in, and the `<svg>` element inside
 * it.
 *
 * Replaces the ~12 near-identical local `Card` components — `rounded-md border
 * border-slate-200 bg-white p-4 shadow-sm` — that each part file declared for
 * itself. Two things change in the process:
 *
 * - **`bg-card`, not `bg-white`.** Nineteen of the book's 25 component files
 *   ignored the dark theme entirely, so on a dark page every figure read as a
 *   light-mode slab punched into it. The diagrams stayed legible; they just
 *   stopped belonging to the page.
 * - **No shadow.** Hairline borders instead. A shadow implies the figure floats
 *   above the page, which is exactly the impression a figure shouldn't give.
 *
 * `<Figure>` still owns the caption, the numbering, and the width zone. This
 * owns only the ground the diagram is drawn on.
 */

/* ------------------------------------------------------------------ */
/* Frame                                                               */
/* ------------------------------------------------------------------ */

export interface DiagramFrameProps {
  /**
   * Small tracked label above the diagram — the figure's *subject*, not its
   * finding. The finding belongs in the `<Figure caption>`, which is where a
   * reader skimming figures will look for it.
   */
  eyebrow?: string;
  /** One quiet line below the diagram. Keep it to a sentence. */
  note?: React.ReactNode;
  /** Drop the border and padding — for a diagram that supplies its own edge. */
  bare?: boolean;
  className?: string;
  children: React.ReactNode;
}

export function DiagramFrame({ eyebrow, note, bare, className, children }: DiagramFrameProps) {
  return (
    <div
      className={[
        bare ? '' : 'rounded-md border border-border bg-card p-4',
        'min-w-0',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      // Publishes the ground colour to every mask rect inside. See T.ground.
      style={
        {
          '--diagram-ground': bare ? 'rgb(var(--book-surface))' : 'rgb(var(--book-card))',
        } as React.CSSProperties
      }
    >
      {eyebrow && (
        <p className="mb-3 font-plex text-[10px] font-medium uppercase tracking-[0.16em] text-muted">
          {eyebrow}
        </p>
      )}
      {children}
      {note && <p className="mt-3 text-[11px] leading-snug text-muted">{note}</p>}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Marker id scoping                                                   */
/* ------------------------------------------------------------------ */

const IdContext = React.createContext<string>('dg');

/** Prefix for `<defs>` ids inside the current diagram. */
export function useDiagramId() {
  return React.useContext(IdContext);
}

/** `url(#…)` reference to one of the arrow markers, scoped to this diagram. */
export function useMarker() {
  const id = useDiagramId();
  return React.useCallback((tone: Tone) => `url(#${id}-arrow-${tone})`, [id]);
}

const TONES: Tone[] = ['default', 'ink', 'accent', 'link', 'pos', 'neg', 'soft'];

/* ------------------------------------------------------------------ */
/* Svg                                                                 */
/* ------------------------------------------------------------------ */

export interface DiagramSvgProps {
  /** Design-space width. Coordinates you write are in these units. */
  width: number;
  /** Design-space height. Remember ~60px extra when the diagram has a legend. */
  height: number;
  /** Short name of the subject — roughly the figure's title, ≤60 chars. */
  title: string;
  /**
   * One sentence saying what the diagram *shows*, for a reader who can't see
   * it. Describe the content, not the geometry: "Retrieval augments a prompt
   * with three chunks pulled from a vector index", not "a box with arrows to
   * three smaller boxes".
   */
  desc: string;
  /** Cap the rendered width so a small diagram doesn't stretch to the column. */
  maxWidth?: number;
  className?: string;
  children: React.ReactNode;
}

/**
 * The SVG canvas. Scales to its container, keeps its aspect ratio, and carries
 * the accessible-figure contract: `role="img"` plus `<title>`/`<desc>` wired
 * through `aria-labelledby`.
 *
 * The book already had `role="img"` + `aria-label` on all 77 of its SVGs, which
 * is valid — but only 1 had a `<title>` and none had a `<desc>`. A `<desc>` is
 * where the *finding* can live for a screen-reader user, and an `aria-label`
 * has nowhere to put it.
 *
 * Note the ids are prefixed per instance via `useId`. Two diagrams on one page
 * with bare `title`/`desc` ids would collide, and the second would be announced
 * with the first one's name.
 *
 * There is deliberately **no background rect**. An opaque `<rect
 * width="100%">` would paint over the themed frame beneath it; the canvas stays
 * transparent and the only opaque fills are node bodies and label masks, both
 * of which read `paper` from `tokens.ts`.
 */
export function DiagramSvg({
  width,
  height,
  title,
  desc,
  maxWidth,
  className,
  children,
}: DiagramSvgProps) {
  const id = React.useId().replace(/:/g, '');
  const marker = React.useCallback((tone: Tone) => `${id}-arrow-${tone}`, [id]);

  return (
    <IdContext.Provider value={id}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-labelledby={`${id}-title ${id}-desc`}
        className={['h-auto w-full', className].filter(Boolean).join(' ')}
        style={maxWidth ? { maxWidth } : undefined}
      >
        {/* <title> must be the first child — assistive tech may skip a later one. */}
        <title id={`${id}-title`}>{title}</title>
        <desc id={`${id}-desc`}>{desc}</desc>
        <defs>
          {TONES.map(tone => (
            <marker
              key={tone}
              id={marker(tone)}
              markerWidth={8}
              markerHeight={6}
              refX={7}
              refY={3}
              orient="auto"
            >
              <polygon points="0 0, 8 3, 0 6" fill={toneStroke[tone]} />
            </marker>
          ))}
        </defs>
        {children}
      </svg>
    </IdContext.Provider>
  );
}

/* ------------------------------------------------------------------ */
/* Small shared bits                                                   */
/* ------------------------------------------------------------------ */

/**
 * Opaque paper rect. Goes under a node body so a connector routed behind it
 * doesn't show through a tinted fill, and under an arrow label so the line
 * doesn't bleed through the text.
 */
export function Mask({
  x,
  y,
  width,
  height,
  rx = 6,
}: {
  x: number;
  y: number;
  width: number;
  height: number;
  rx?: number;
}) {
  return <rect x={x} y={y} width={width} height={height} rx={rx} fill={T.ground} />;
}
