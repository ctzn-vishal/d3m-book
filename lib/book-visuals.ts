import * as LucideIcons from 'lucide-react';
import { BookOpen, type LucideIcon } from 'lucide-react';

/**
 * Visual identity for the teaching book's structure — kept separate from both
 * the structural TOC (book-toc.ts) and the editorial prose (book-content.ts).
 * Cover, part pages, and chapter pages all read accents + icons from here so the
 * color/icon system lives in exactly one place.
 */

export type PartAccent = 'teal' | 'amber' | 'plum' | 'blue';

/** One accent per part index (0..6), aligned to the .hub-part-N gradient tints. */
export const PART_ACCENTS: PartAccent[] = [
  'teal', // Part 0  — Modern Data OS
  'amber', // Part I  — Language of Data
  'plum', // Part II — Visual Evidence
  'blue', // Part III — Quantifying Effects
  'teal', // Part IV — Language of Algorithms
  'amber', // Part V  — Unstructured / GenAI
  'plum', // Part VI — Operating the System
];

export function partAccent(index: number): PartAccent {
  return PART_ACCENTS[index] ?? 'teal';
}

/**
 * Full Tailwind class fragments per accent. Written as complete literal strings
 * (not interpolated) so Tailwind's content scanner can see them — this file is
 * included in the `content` globs for that reason.
 */
export const ACCENT: Record<
  PartAccent,
  { text: string; softBg: string; border: string; borderSoft: string; ring: string; dot: string }
> = {
  teal: {
    text: 'text-hub-teal',
    softBg: 'bg-hub-teal-soft',
    border: 'border-hub-teal',
    borderSoft: 'border-hub-teal/30',
    ring: 'ring-hub-teal/30',
    dot: 'bg-hub-teal',
  },
  amber: {
    text: 'text-hub-amber',
    softBg: 'bg-hub-amber-soft',
    border: 'border-hub-amber',
    borderSoft: 'border-hub-amber/30',
    ring: 'ring-hub-amber/30',
    dot: 'bg-hub-amber',
  },
  plum: {
    text: 'text-hub-plum',
    softBg: 'bg-hub-plum-soft',
    border: 'border-hub-plum',
    borderSoft: 'border-hub-plum/30',
    ring: 'ring-hub-plum/30',
    dot: 'bg-hub-plum',
  },
  blue: {
    text: 'text-hub-blue',
    softBg: 'bg-hub-blue-soft',
    border: 'border-hub-blue',
    borderSoft: 'border-hub-blue/30',
    ring: 'ring-hub-blue/30',
    dot: 'bg-hub-blue',
  },
};

/**
 * Resolve a lucide-react icon by name with a safe fallback. Drafted icon names
 * are validated here, so a hallucinated or renamed icon degrades to BookOpen
 * instead of crashing the build.
 */
export function resolveIcon(name: string | undefined | null): LucideIcon {
  if (!name) return BookOpen;
  const icons = LucideIcons as unknown as Record<string, LucideIcon | undefined>;
  return icons[name] ?? BookOpen;
}
