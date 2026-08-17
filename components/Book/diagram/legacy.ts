import { T } from './tokens';

/**
 * A drop-in replacement for the twelve copies of `const C`.
 *
 * This exists for the ~40 components the audit put out of scope for redrawing:
 * data charts built on Observable Plot, Recharts, and hand-rolled scales, which
 * belong to the `dataviz` skill rather than to this one. They still had F1 —
 * light-only hexes on a themed page — and fixing that shouldn't require
 * rewriting forty charts.
 *
 * So the *names* survive and the *values* change. A chart that says
 * `stroke={C.blue}` keeps compiling and starts flipping with the theme. What
 * it stops doing is picking a colour off a ten-hue shelf.
 *
 * ## How the hues collapse
 *
 * Three of the old names carry real meaning and keep a colour:
 *
 * - `orange` / `amber` → the one **accent**. These were already the warm
 *   highlight in most of the book's charts, so mapping them here usually lands
 *   the accent exactly where the author already wanted emphasis.
 * - `red` → **neg**, `teal` / `green` → **pos**, for the genuine good/bad
 *   encodings.
 *
 * The rest become a **monochrome value ramp**: ink, then progressively lighter
 * ink. That is the standard fallback when a design system has one hue and a
 * chart has several series — series stay distinguishable by *lightness*
 * instead of by hue, which also happens to survive greyscale printing and the
 * common forms of colour blindness.
 *
 * ## When not to use this
 *
 * If you are *drawing* something — a flow, a tree, an architecture — don't
 * import this. Use `Node`, `Connector`, and the variants, which encode meaning
 * rather than preserving an old call site. This is a migration aid for charts,
 * not a palette for schematics.
 */
export const LEGACY_C = {
  ink: T.ink,
  muted: T.muted,
  grid: T.rule,

  /* The value ramp. Ordered lightest-last, so a multi-series chart that walks
     these in declaration order gets a sensible descending emphasis. */
  navy: T.ink,
  blue: T.ink,
  purple: `rgb(var(--book-body) / 0.62)`,
  pink: T.ruleStrong,

  /* Fills that used to be the `*Light` tint of each hue. All the same wash now
     — they were only ever "the fill under that stroke". */
  blueLight: T.paperAlt,
  purpleLight: T.paperAlt,
  greenLight: T.paperAlt,
  tealLight: T.paperAlt,
  slate50: T.paperAlt,
  slate100: T.paperAlt,

  /* The accent, and the two semantic hues. */
  orange: T.accent,
  amber: T.accent,
  orangeLight: T.accentTint,
  amberLight: T.accentTint,
  sky: T.accent,
  skyLight: T.accentTint,

  green: T.pos,
  teal: T.pos,
  red: T.neg,
  redLight: T.negTint,
  negLight: T.negTint,
  posLight: T.posTint,
} as const;
