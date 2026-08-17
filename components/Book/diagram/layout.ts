import type { Pt } from './path';
import { snap } from './tokens';

/**
 * Layout arithmetic that would otherwise be re-derived — badly, and slightly
 * differently — in every diagram that needs it.
 *
 * Everything here returns grid-snapped coordinates. That isn't fussiness: the
 * 4px grid is what stops a row of boxes from being 3px out of alignment in a
 * way nobody can name but everybody can see.
 */

/** Evenly spaced left edges for `n` boxes of width `w` filling `[x, x+width]`. */
export function row(x: number, width: number, n: number, w: number): number[] {
  const gap = n > 1 ? (width - n * w) / (n - 1) : 0;
  return Array.from({ length: n }, (_, i) => snap(x + i * (w + gap)));
}

/** Left edges for `n` boxes of width `w` with a fixed `gap`, centred in `width`. */
export function centeredRow(x: number, width: number, n: number, w: number, gap: number): number[] {
  const total = n * w + (n - 1) * gap;
  const start = x + (width - total) / 2;
  return Array.from({ length: n }, (_, i) => snap(start + i * (w + gap)));
}

/**
 * Station centres around a ring, clockwise from the top.
 *
 * Loop diagrams are the one place a schematic legitimately leaves the
 * orthogonal grid — the ring *is* the meaning, and squaring it off would say
 * "pipeline" instead of "cycle".
 */
export function ring(cx: number, cy: number, radius: number, n: number): Pt[] {
  return Array.from({ length: n }, (_, i) => {
    const theta = (i / n) * Math.PI * 2 - Math.PI / 2;
    return [snap(cx + radius * Math.cos(theta)), snap(cy + radius * Math.sin(theta))] as Pt;
  });
}

/**
 * An arc along the ring from one station to the next, trimmed at both ends so
 * it starts and stops clear of the station boxes rather than under them.
 *
 * `trim` is in radians — roughly `boxWidth / (2 * radius)` for a box that
 * should just be cleared.
 */
export function ringArc(
  cx: number,
  cy: number,
  radius: number,
  n: number,
  from: number,
  trim = 0.28
): string {
  const step = (Math.PI * 2) / n;
  const a0 = (from / n) * Math.PI * 2 - Math.PI / 2 + trim;
  const a1 = a0 + step - 2 * trim;
  const p = (a: number) => `${(cx + radius * Math.cos(a)).toFixed(1)},${(cy + radius * Math.sin(a)).toFixed(1)}`;
  // sweep=1: clockwise, matching the station order.
  return `M ${p(a0)} A ${radius},${radius} 0 0,1 ${p(a1)}`;
}

/**
 * A straight spoke from a station toward the hub, trimmed at both ends.
 *
 * Spokes are the thing that distinguishes a loop from a circular process: they
 * say each pass writes state back to one shared place. Draw them dashed.
 */
export function spoke(
  station: Pt,
  hub: Pt,
  startTrim: number,
  endTrim: number
): string {
  const dx = hub[0] - station[0];
  const dy = hub[1] - station[1];
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  const a: Pt = [station[0] + ux * startTrim, station[1] + uy * startTrim];
  const b: Pt = [hub[0] - ux * endTrim, hub[1] - uy * endTrim];
  return `M ${a[0].toFixed(1)},${a[1].toFixed(1)} L ${b[0].toFixed(1)},${b[1].toFixed(1)}`;
}
