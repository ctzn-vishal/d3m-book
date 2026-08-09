/**
 * Collections — groups of related pieces that were each authored as a
 * standalone file.
 *
 * One concept covers what were previously three: a numbered series (the India
 * ad ledger), a curated booklet (/nlp), and the set of analyses over a single
 * dataset (/amazon). The difference is presentation, not structure:
 *
 *   - every member carries a `part`  ⇒ ordered series, rendered with prev/next
 *   - no member carries a `part`     ⇒ unordered set, order carries no meaning
 *
 * Membership lives on the gallery row (`collection` + `part`), NOT here, so a
 * new piece joins by setting two fields in /admin — no existing page is ever
 * rewritten to point at a later one. This file holds only the editorial shell:
 * what the collection is called and how it is introduced.
 *
 * Adding a collection: append an entry. A hub page appears automatically at
 * /c/<slug> as soon as any row claims the slug. If it later outgrows the
 * generic page, hand-build a route and set `href` — the collection keeps its
 * identity and the gallery keeps linking to one place.
 */

export interface Collection {
  /** URL segment; also the value stored on `gallery.collection`. */
  slug: string;
  title: string;
  /** One or two sentences introducing the collection. */
  blurb: string;
  /**
   * Bespoke route to use instead of the generated /c/<slug> hub. Set this when
   * a collection has grown its own charts or curation (e.g. /amazon, /nlp).
   */
  href?: string;
  /**
   * 'building' — more parts are coming, so the hub says "N so far" and never
   * renders a "Part 3 of 8" denominator against a total that doesn't exist yet.
   * 'complete' — the set is closed and can be counted.
   */
  status: 'building' | 'complete';
  /** Optional short label for the source/corpus behind the collection. */
  source?: string;
}

export const COLLECTIONS: Collection[] = [
  {
    slug: 'india-ad-ledger',
    title: 'The Political Ad Ledger',
    blurb:
      'A five-part read through India’s political advertising disclosures — who buys, what they say, and what the ledger leaves out.',
    status: 'building',
    source: 'Indian political ad disclosures',
  },
  {
    slug: 'amazon-reviews',
    title: 'Half a billion Amazon reviews',
    blurb:
      'Analyses over the Amazon Reviews 2023 corpus — 507.7M reviews across 33 product categories, 1996–2023.',
    href: '/amazon',
    status: 'building',
    source: 'Amazon Reviews 2023 aggregates',
  },
  {
    slug: 'measure-of-words',
    title: 'The Measure of Words',
    blurb:
      'A field booklet on text as data: dictionaries, topic models, and LLM measurement at scale.',
    href: '/nlp',
    status: 'complete',
    source: 'Text-as-data corpora',
  },
];

const BY_SLUG = new Map(COLLECTIONS.map(c => [c.slug, c]));

export function findCollection(slug: string): Collection | undefined {
  return BY_SLUG.get(slug);
}

/** Where a collection lives — its bespoke route if it has one, else the generated hub. */
export function collectionHref(c: Collection): string {
  return c.href ?? `/c/${c.slug}`;
}

/**
 * Collections that get a generated hub page. Ones with a bespoke `href` are
 * excluded — /amazon and /nlp own their own routes, and generating /c/amazon-reviews
 * alongside would split the same collection across two URLs.
 */
export const GENERATED_COLLECTIONS = COLLECTIONS.filter(c => !c.href);

/**
 * Order members for display: by `part` when present, then by title, so a
 * partially numbered collection still renders deterministically instead of
 * shuffling as rows are edited.
 */
export function sortMembers<T extends { part?: number; title: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    const ap = a.part ?? Number.MAX_SAFE_INTEGER;
    const bp = b.part ?? Number.MAX_SAFE_INTEGER;
    if (ap !== bp) return ap - bp;
    return a.title.localeCompare(b.title);
  });
}

/** True when every member carries a `part` — i.e. the collection reads in order. */
export function isOrdered(items: Array<{ part?: number }>): boolean {
  return items.length > 1 && items.every(i => typeof i.part === 'number');
}
