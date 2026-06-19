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
