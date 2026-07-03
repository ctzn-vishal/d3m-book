import {
  BarChart3,
  BookOpen,
  Bot,
  Boxes,
  BrainCircuit,
  Compass,
  Database,
  DollarSign,
  FileText,
  Filter,
  FlaskConical,
  Gauge,
  GitCompareArrows,
  LayoutDashboard,
  LineChart,
  ListChecks,
  MessageSquareText,
  Network,
  Rows3,
  ScanEye,
  Split,
  Table2,
  Target,
  Workflow,
  type LucideIcon,
} from 'lucide-react';

/**
 * Every icon name used by lib/book-content.ts's partContent/chapterContent
 * `icon` fields, as explicit named imports rather than `import * as
 * LucideIcons` — a namespace import can't be tree-shaken, so it used to pull
 * the entire ~1500-icon package (a ~150KB gzipped chunk) into every article
 * page via BookSidebar's per-part icon. Named imports let the bundler keep
 * only the ~20 icons actually used.
 *
 * Add a new icon here (import + map entry) when adding one to book-content.ts.
 */
const ICONS: Record<string, LucideIcon> = {
  BarChart3,
  Bot,
  Boxes,
  BrainCircuit,
  Compass,
  Database,
  DollarSign,
  FileText,
  Filter,
  FlaskConical,
  Gauge,
  GitCompareArrows,
  LayoutDashboard,
  LineChart,
  ListChecks,
  MessageSquareText,
  Network,
  Rows3,
  ScanEye,
  Split,
  Table2,
  Target,
  Workflow,
};

/**
 * Resolve a lucide-react icon by name with a safe fallback. Drafted icon names
 * (in book-content.ts) are validated here, so a hallucinated or renamed icon
 * degrades to BookOpen instead of crashing the build.
 */
export function resolveIcon(name: string | undefined | null): LucideIcon {
  if (!name) return BookOpen;
  return ICONS[name] ?? BookOpen;
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
  { icon: 'text-sky-600 dark:text-sky-400', chip: 'bg-sky-50 dark:bg-sky-950/40' }, // Part 0  — Modern Data OS
  { icon: 'text-emerald-600 dark:text-emerald-400', chip: 'bg-emerald-50 dark:bg-emerald-950/40' }, // Part I  — Language of Data
  { icon: 'text-violet-600 dark:text-violet-400', chip: 'bg-violet-50 dark:bg-violet-950/40' }, // Part II — Visual Evidence
  { icon: 'text-orange-600 dark:text-orange-400', chip: 'bg-orange-50 dark:bg-orange-950/40' }, // Part III — Quantifying Effects
  { icon: 'text-indigo-600 dark:text-indigo-400', chip: 'bg-indigo-50 dark:bg-indigo-950/40' }, // Part IV — Language of Algorithms
  { icon: 'text-rose-600 dark:text-rose-400', chip: 'bg-rose-50 dark:bg-rose-950/40' }, // Part V  — Unstructured / GenAI
  { icon: 'text-teal-600 dark:text-teal-400', chip: 'bg-teal-50 dark:bg-teal-950/40' }, // Part VI — D3M with AI Agents
];

export function partColor(index: number): PartColor {
  return PART_COLORS[index] ?? PART_COLORS[0];
}

/**
 * Hex equivalents of each PART_COLORS icon shade, for the rare spot (e.g. an
 * inline-styled accent bar) where Tailwind's JIT can't see a class built from
 * a runtime value and a literal hex is needed instead.
 */
export const PART_HEX: string[] = [
  '#0284c7', // sky-600
  '#059669', // emerald-600
  '#7c3aed', // violet-600
  '#ea580c', // orange-600
  '#4f46e5', // indigo-600
  '#e11d48', // rose-600
  '#0d9488', // teal-600
];

export function partHex(index: number): string {
  return PART_HEX[index] ?? PART_HEX[0];
}
