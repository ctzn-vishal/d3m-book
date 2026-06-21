import * as LucideIcons from 'lucide-react';
import { BookOpen, type LucideIcon } from 'lucide-react';

/**
 * Resolve a lucide-react icon by name with a safe fallback. Drafted icon names
 * (in book-content.ts) are validated here, so a hallucinated or renamed icon
 * degrades to BookOpen instead of crashing the build.
 */
export function resolveIcon(name: string | undefined | null): LucideIcon {
  if (!name) return BookOpen;
  const icons = LucideIcons as unknown as Record<string, LucideIcon | undefined>;
  return icons[name] ?? BookOpen;
}

/**
 * A distinct, muted icon color per part, used on the contents page, part pages,
 * and chapter pages so each section of the book reads as its own color while
 * staying within a calm palette that suits the white reading theme. Written as
 * complete literal class strings (this file is in Tailwind's content globs) so
 * they are never purged.
 */
export type PartColor = { icon: string; chip: string };

export const PART_COLORS: PartColor[] = [
  { icon: 'text-sky-600', chip: 'bg-sky-50' }, // Part 0  — Modern Data OS
  { icon: 'text-emerald-600', chip: 'bg-emerald-50' }, // Part I  — Language of Data
  { icon: 'text-violet-600', chip: 'bg-violet-50' }, // Part II — Visual Evidence
  { icon: 'text-orange-600', chip: 'bg-orange-50' }, // Part III — Quantifying Effects
  { icon: 'text-indigo-600', chip: 'bg-indigo-50' }, // Part IV — Language of Algorithms
  { icon: 'text-rose-600', chip: 'bg-rose-50' }, // Part V  — Unstructured / GenAI
  { icon: 'text-teal-600', chip: 'bg-teal-50' }, // Part VI — D3M with AI Agents
];

export function partColor(index: number): PartColor {
  return PART_COLORS[index] ?? PART_COLORS[0];
}
