/**
 * The "Interactive books" shelf: book-length projects, most built as their own
 * sites, plus two chart and map toolkits on ctzn.pub.
 *
 * This is a FORMAT, not a subject, so it is not a topic (lib/taxonomy.ts keeps
 * topics to what a piece is about) and not a registry type (the Turso `gallery`
 * table's CHECK constraint limits `type` to App/Teaching/Blog/Dataset). The
 * shelf is curated here and rendered above the topic shelves on the home page
 * and on /booklets. Items that also have a registry row (the Well-Being Atlas,
 * The Measure of Words) keep it, so they still appear on their topic shelf.
 *
 * Books under vishalsingh.org/<path> are separate Vercel projects mounted by
 * the `beforeFiles` rewrites in next.config.ts (BOOK_ZONES). Links to them must
 * be plain <a>, not next/link: they are another app, not a route of this one.
 */

export type BookKind = 'Book' | 'Toolkit';

export type ShelfBook = {
  id: string;
  kind: BookKind;
  title: string;
  subtitle?: string;
  description: string;
  /** Where the card opens. A root-relative path is a route or mounted zone on this site. */
  href: string;
  /** The address as shown on the card. */
  host: string;
  /** Co-authors, shown after the address (e.g. 'with Uma Huggins'). */
  credit?: string;
  /** Opens in a new tab (matches the gallery: each piece opens in a new tab). */
  newTab: boolean;
  /** Served by this app's router, so next/link can navigate to it. */
  internal?: boolean;
  thumbnail?: string;
  /** Written in public: chapters are drafted, revised and added on the live site. */
  inProgress: boolean;
};

export const BOOKS: ShelfBook[] = [
  {
    id: 'zipcode-destiny',
    kind: 'Book',
    title: 'ZIP Code Destiny',
    subtitle: 'From cradle to grave',
    description:
      'How where an American lives lines up with health, schooling, income and length of life, from birth to old age, at neighborhood, county and state grain.',
    href: '/zipcode',
    host: 'vishalsingh.org/zipcode',
    newTab: true,
    thumbnail: '/books/zipcode-destiny.jpg',
    inProgress: true,
  },
  {
    id: 'public-mind',
    kind: 'Book',
    title: 'The Public Mind',
    subtitle: 'Data essays on American partisanship, ideology and the political map',
    description:
      'How closely party identity came to line up with ideology, partisan feeling and issue positions from 1948 to 2024, what left and right mean, and what the county map of the vote records.',
    href: '/politics',
    host: 'vishalsingh.org/politics',
    newTab: true,
    thumbnail: '/books/public-mind.jpg',
    inProgress: true,
  },
  {
    id: 'weights-design-estimands',
    kind: 'Book',
    title: 'Weights, Design, and Estimands',
    subtitle: 'A field guide for applied researchers',
    description:
      'The three decisions inside “should I use the survey weights?”: the target quantity, how observations enter the estimator, and the design that governs uncertainty.',
    href: '/weights',
    host: 'vishalsingh.org/weights',
    newTab: true,
    thumbnail: '/books/weights-design-estimands.jpg',
    inProgress: true,
  },
  {
    id: 'decision-ai',
    kind: 'Book',
    title: 'Decision AI',
    subtitle: 'Case studies in turning model judgments into actions',
    description:
      'Case studies on decision models, systems that take evidence and typed questions and return a choice, a rubric score or a probability, in customer operations, code review and agent workflows.',
    href: '/decisionai',
    host: 'vishalsingh.org/decisionai',
    newTab: true,
    thumbnail: '/books/decision-ai.jpg',
    inProgress: true,
  },
  {
    id: 'south-asians-in-america',
    kind: 'Book',
    title: 'South Asians in America',
    subtitle: 'A data booklet in nine chapters',
    description:
      'The 6.45 million US residents who reported a single South Asian race in 2024: who they are, where they live, how they earn and form families, and how they vote.',
    // One bucket file served through the /read route handler, so a plain <a>.
    href: '/read/south-asians-in-america',
    host: 'vishalsingh.org/read/south-asians-in-america',
    newTab: true,
    thumbnail: '/books/south-asians-in-america.jpg',
    inProgress: false,
  },
  {
    id: 'well-being-atlas',
    kind: 'Book',
    title: 'The Well-Being Atlas',
    description:
      'Reproducible data essays on life satisfaction from Gallup World Poll, GSS and WVS microdata, across 50 years and 168 countries.',
    href: 'https://well-being-atlas.vercel.app/',
    host: 'well-being-atlas.vercel.app',
    newTab: true,
    thumbnail: '/happy_book.png',
    inProgress: false,
  },
  {
    id: 'measure-of-words',
    kind: 'Book',
    title: 'The Measure of Words',
    subtitle: 'Text as data, from word counts to language models',
    description:
      'Six data essays, two live studios and a data shelf, from dictionary word counts to LLM measurement at scale.',
    href: '/nlp',
    host: 'vishalsingh.org/nlp',
    newTab: false,
    internal: true,
    inProgress: false,
  },
  {
    id: 'ctzn-viz',
    kind: 'Toolkit',
    title: 'CTZN Viz',
    subtitle: 'Public data, drawn so you can check the claim',
    description:
      'Figures on elections, campaign money, public opinion, health and housing, drawn with reusable TypeScript chart and map components.',
    credit: 'with Uma Huggins',
    href: 'https://www.ctzn.pub/apps/viz',
    host: 'ctzn.pub/apps/viz',
    newTab: true,
    thumbnail: '/books/ctzn-viz.jpg',
    inProgress: true,
  },
  {
    id: 'ctzn-geo',
    kind: 'Toolkit',
    title: 'Five Choices Behind a Data Map',
    subtitle: 'ctzn-geo',
    description:
      'Live maps of US cities, counties, European regions and countries, each showing how the geography, class rule, colors, form or projection changes what the numbers appear to say.',
    credit: 'with Uma Huggins',
    href: 'https://www.ctzn.pub/apps/geo',
    host: 'ctzn.pub/apps/geo',
    newTab: true,
    thumbnail: '/books/ctzn-geo.jpg',
    inProgress: true,
  },
];
