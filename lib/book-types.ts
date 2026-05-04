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
