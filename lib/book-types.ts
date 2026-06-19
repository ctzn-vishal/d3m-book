export type ArticleStatus = 'published' | 'draft' | 'planned';

export type Article = {
  slug: string;
  number: string;
  title: string;
  status: ArticleStatus;
};

export type Chapter = {
  number: number;
  title: string;
  articles: Article[];
};

export type Part = {
  numeral: string;
  title: string;
  chapters: Chapter[];
};

export type Book = {
  title: string;
  subtitle: string;
  parts: Part[];
};

export type ArticleLookup = {
  article: Article;
  prev: Article | null;
  next: Article | null;
} | null;

/**
 * Editorial summary content layered on top of the structural TOC.
 * Authored in lib/book-content.ts and merged in by accessor helpers so the
 * structural source of truth (book-toc.ts) stays clean and the prose lives in
 * one place the author can refine. All fields are drafted from the real
 * article MDX, then hand-edited.
 */
export type PartContent = {
  /** Short 4–8 word phrase shown under the part title. */
  tagline: string;
  /** 3–5 sentence framing of the whole part and its arc. */
  summary: string;
  /** 3–5 concrete capabilities the reader gains. */
  whatYoullLearn: string[];
  /** A lucide-react icon name (PascalCase); resolved with a safe fallback. */
  icon: string;
};

export type ChapterContent = {
  /** 2–4 sentence narrative of what the chapter covers and why it matters. */
  summary: string;
  /** One crisp sentence naming the unifying idea (subtitle). */
  throughLine: string;
  /** 5–9 concrete topic/technique phrases actually covered. */
  topics: string[];
  /** A lucide-react icon name (PascalCase); resolved with a safe fallback. */
  icon: string;
};
