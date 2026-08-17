/**
 * The one semantic palette for book schematics.
 *
 * This file is the **only** place in `components/Book/diagram` — and, once the
 * migration is finished, the only place under `components/Book/part*` — where a
 * colour is named. It replaces the twelve copy-pasted `const C = { ink, muted,
 * grid, blue, blueLight, navy, orange, … }` blocks, each of which hardcoded 21
 * light-mode hexes.
 *
 * Nothing here is a hex. Every value resolves through `rgb(var(--book-*) / α)`,
 * so light and dark are the *same markup* — the `.dark` class on `<html>` swaps
 * the channels underneath. See `app/globals.css` for the definitions and
 * `docs/DIAGRAMS.md` for when to reach for which role.
 *
 * Two consequences worth knowing before you use it:
 *
 * 1. **There is no ink-at-opacity fill.** The skill's default node treatments
 *    say things like `store: ink @ 0.05`, which works when ink is permanently
 *    near-black. Here `ink` inverts, so an ink wash would be a *pale* fill in
 *    light and a *bright* one in dark — backwards. Node fills come from
 *    `paper` / `paperAlt` instead, which are defined per theme and stay
 *    correctly ordered.
 *
 * 2. **Accent is for strokes and fills, not for text.** `accent` is 3.3:1 on
 *    light paper: fine for a border, a marker, or a wash, short of WCAG AA for
 *    9–12px type. Accent-coloured *text* uses `accentInk`.
 */

/* ------------------------------------------------------------------ */
/* Colour                                                              */
/* ------------------------------------------------------------------ */

const c = (name: string, alpha?: number) =>
  alpha === undefined ? `rgb(var(${name}))` : `rgb(var(${name}) / ${alpha})`;

export const T = {
  /**
   * Whatever the diagram is drawn *on* — the fill for a mask rect, so a
   * connector routed behind a node or a label doesn't show through.
   *
   * It's a var-with-fallback rather than a fixed token because the ground
   * depends on the container: `DiagramFrame` sits on `--book-card`, but a
   * `bare` frame sits directly on the page. `DiagramFrame` sets
   * `--diagram-ground` on its root and every mask inherits it, so a mask is
   * always exactly the colour behind it and never a near-miss.
   */
  ground: 'var(--diagram-ground, rgb(var(--book-card)))',
  /** Page surface. Node bodies, so they lift off the card ground. */
  paper: c('--book-surface'),
  /** Secondary fill — store nodes, zone washes, table stripes. */
  paperAlt: c('--book-card'),

  /** Primary text and primary stroke. */
  ink: c('--book-body'),
  /** Body text one step down from `ink` — prose inside a diagram. */
  subtle: c('--book-subtle'),
  /** Secondary text, default arrow stroke. */
  muted: c('--book-muted'),
  /** Sublabels, eyebrows, axis ticks. Quieter than `muted`. */
  soft: c('--book-muted', 0.72),

  /** Hairline borders — the only separator a figure gets. No shadows. */
  rule: c('--book-border'),
  /** Stronger hairline — baselines, external-node strokes. */
  ruleStrong: c('--book-border-strong'),

  /** The one focal hue. ≤2 elements per diagram. Never on text. */
  accent: c('--book-accent'),
  /** Accent text. AA on paper in both themes. */
  accentInk: c('--book-accent-ink'),
  /** Focal node fill. Alpha differs by theme — see globals.css. */
  accentTint: 'var(--book-accent-tint)',

  /** Hyperlinks and external/API calls. Reserved — not a diagram accent. */
  link: c('--book-link'),

  /**
   * The two semantic hues, and the *only* documented exception to the focal
   * rule. Use for genuine valence — supported/unsupported, control/gap,
   * pass/fail. A diagram may use the valence pair OR the accent, never both.
   */
  pos: c('--book-pos'),
  posTint: 'var(--book-pos-tint)',
  neg: c('--book-neg'),
  negTint: 'var(--book-neg-tint)',
} as const;

/** Colour role names that a connector, marker, or legend swatch can take. */
export type Tone = 'default' | 'ink' | 'accent' | 'link' | 'pos' | 'neg' | 'soft';

/** Stroke colour for a tone. `default` is the muted workhorse arrow. */
export const toneStroke: Record<Tone, string> = {
  default: T.muted,
  ink: T.ink,
  accent: T.accent,
  link: T.link,
  pos: T.pos,
  neg: T.neg,
  soft: T.soft,
};

/* ------------------------------------------------------------------ */
/* Stroke, radius, type                                                */
/* ------------------------------------------------------------------ */

export const S = {
  thin: 0.8,
  base: 1,
  strong: 1.2,
} as const;

export const R = {
  /** Small tags and chips. */
  sm: 4,
  /** Node boxes. */
  md: 6,
  /** Containers, zones, rings. */
  lg: 8,
} as const;

/**
 * Type ramp. Set these with Tailwind classes on `<text>` rather than
 * `font-family` attributes, so the figure inherits the app's loaded variable
 * fonts. `FONT` gives you the class strings.
 *
 * JetBrains Mono (`font-mono`) is deliberately absent: it is the book's code
 * face, and using it in a figure blurs the code/figure boundary. Diagram
 * technical type is IBM Plex Mono (`font-plex`).
 */
export const FONT = {
  /** Human-readable node names. Inter 12/600. */
  node: 'font-sans text-[12px] font-semibold',
  /** A node name that needs to be small — dense grids, leaf nodes. */
  nodeSm: 'font-sans text-[11px] font-semibold',
  /** Plain sentence inside a diagram. Inter 11/400. */
  body: 'font-sans text-[11px]',
  /** Field types, units, counts, ports. IBM Plex Mono 9. */
  sub: 'font-plex text-[9px]',
  /** Type tags, zone labels, axis labels. IBM Plex Mono 8, tracked, caps. */
  eyebrow: 'font-plex text-[8px] font-medium uppercase tracking-[0.18em]',
  /** Arrow annotations. IBM Plex Mono 8, lightly tracked. */
  arrow: 'font-plex text-[8px] tracking-[0.06em]',
  /** Editorial aside. Fraunces italic 13. Callouts only. */
  callout: 'font-serif text-[13px] italic',
} as const;

/** Rough advance width per character, for sizing label mask rects. */
export const CHAR_W = {
  /** IBM Plex Mono at 8px with 0.06em tracking. */
  arrow: 5.4,
  /** IBM Plex Mono at 8px with 0.18em tracking, uppercase. */
  eyebrow: 6.2,
  /** IBM Plex Mono at 9px. */
  sub: 5.4,
  /** Inter at 12px, semibold — proportional, so this is an average. */
  node: 6.6,
  /** Inter at 11px. */
  body: 5.7,
} as const;

/* ------------------------------------------------------------------ */
/* The 4px grid                                                        */
/* ------------------------------------------------------------------ */

export const GRID = 4;

/** Snap a coordinate to the 4px grid. Every x/y/w/h/gap must be on it. */
export const snap = (n: number) => Math.round(n / GRID) * GRID;

/** Snap upward — for widths that must still contain their content. */
export const snapUp = (n: number) => Math.ceil(n / GRID) * GRID;
