# book-template

A Next.js boilerplate for publishing a long-form, data-driven online book —
multi-part, multi-chapter, multi-article — built from MDX and embedded
Recharts time-series figures. Distill-style typography, a sticky book bar,
a chapter table-of-contents drawer, and a small library of editorial
components (drop caps, callouts, key numbers, side notes, pull quotes,
small multiples, tab sets, data tables).

The template ships fully populated with seven worked example articles
drawn from a book about American social attitudes — read those for a
sense of what the components do together. Then strip them out and
replace with your own.

## Quick start

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). The book home page
is the front page; each article lives at `/<slug>`.

To build for production:

```bash
pnpm build
pnpm start
```

## Project layout

```
app/
  layout.tsx            Root layout — fonts, MainArea wrapper.
  page.tsx              Front page — renders <BookHome>.
  globals.css           Tailwind + a few page-chrome rules.
  [slug]/page.tsx       Fallback route for any TOC entry without a
                        dedicated page.tsx (renders a placeholder).
  <slug>/               One folder per article, e.g. ch01-introduction/.
    page.tsx              Imports the MDX, wraps in <BookShell>.
    article.mdx          The article itself.
    data/                JSON blobs the article imports into figures.
components/
  MainArea.tsx          The <main> wrapper.
  Book/
    BookShell.tsx       Sticky book bar + breadcrumb + footer nav.
    BookHome.tsx        Front-page layout (parts → chapters → articles).
    ChapterTocDrawer.tsx Floating "Contents" pill that opens the TOC.
    Figure.tsx          The Distill-style layout-zone wrapper.
    DropCap.tsx, KeyNumber.tsx, Callout.tsx, SideNote.tsx,
    PullQuote.tsx, Quote.tsx, Annotation.tsx, SmallMultiples.tsx,
    TabSet.tsx, DataTable.tsx, Step.tsx, SectionDivider.tsx,
    StaticChartV1.tsx   The article-component library.
    charts/
      timeseries-line-v1.tsx   The default chart component.
      timeseries-index-v1.tsx  Indexed (rebased-to-100) variant.
lib/
  book-toc.ts           The book's table of contents — single source
                        of truth for parts, chapters, article order.
  book-types.ts         Shared TS types (Book, Part, Chapter, Article).
  utils.ts              cn() — clsx + tailwind-merge.
viz/
  ui/{label,switch}.tsx Small Radix-backed primitives the chart uses.
  utils/cn.ts           Same cn() utility (chart-local copy).
public/
  <slug>/data/*.svg     Static (pre-rendered) chart SVGs, when used.
scripts/
  fetch-article-data.mjs  Optional: pull JSON aggregates from a Tigris
                          S3 bucket into app/<slug>/data/.
book.config.mjs         Per-article data manifest used by the fetch
                        script. Edit alongside `book-toc.ts`.
mdx-components.tsx      MDX provider stub.
tailwind.config.ts      Brand palette + article design tokens.
next.config.ts          Next + MDX wiring.
```

## Adding a new article

Three steps. None of them require touching component code.

### 1. Add a TOC entry

Edit [`lib/book-toc.ts`](lib/book-toc.ts). Find the chapter you want
the article to live under and add an entry:

```ts
{
  number: 8,
  title: 'My Chapter',
  articles: [
    { slug: 'ch08-my-article', number: '8', title: 'My Article', status: 'draft' },
  ],
},
```

`status` is `'planned' | 'draft' | 'published'`. Only `'published'`
articles are linked from the home page; all three render.

### 2. Create the folder

```bash
mkdir -p app/ch08-my-article/data
```

Add a `page.tsx` that mirrors the existing chapters:

```tsx
import type { Metadata } from 'next';
import { BookShell } from '@/components/Book/BookShell';
import { book, findArticle } from '@/lib/book-toc';
import Article from './article.mdx';

export const metadata: Metadata = {
  title: `§8 My Article | ${book.title}`,
  description: 'A one-line description of the article.',
};

export default function Page() {
  return (
    <BookShell slug="ch08-my-article" book={book} findArticle={findArticle}>
      <Article />
    </BookShell>
  );
}
```

### 3. Write the MDX

Open `app/ch08-my-article/article.mdx` and write. The editorial
components are imported per-file; copy the import block from any of
the existing articles (e.g. `app/ch01-introduction/article.mdx`).

```mdx
import { DropCap } from '@/components/Book/DropCap';
import { Figure } from '@/components/Book/Figure';
import TimeseriesLineV1 from '@/components/Book/charts/timeseries-line-v1';
import myData from './data/my-data.json';

<DropCap>

The opening paragraph leads with a concrete fact, not a definition.

</DropCap>

<Figure caption="Figure 1. The finding stated as a sentence.">
  <div className="not-prose">
    <TimeseriesLineV1
      data={myData}
      demographicGroups={['Democrat', 'Republican']}
      demographic="PolParty"
      defaultVisibleGroups={['Democrat', 'Republican']}
    />
  </div>
</Figure>
```

## Data shape

Charts read JSON blobs imported directly from `app/<slug>/data/*.json`.
Each blob has this shape:

```json
{
  "metadata": {
    "title": "...",
    "subtitle": "...",
    "demo_key": "[\"PolParty\"]",
    "demo_title": "Political Party"
  },
  "dataPointMetadata": [
    { "id": "year", "name": "Year", "type": "ordinal" },
    { "id": "value", "name": "%", "type": "numeric", "value_suffix": "%" }
  ],
  "dataPoints": [
    { "year": "1973", "value": 22.9, "n_actual": 660,
      "ci_lower": 19.4, "ci_upper": 26.4, "standard_error": 1.8,
      "PolParty": "Democrat" }
  ]
}
```

Years are **strings**, not numbers. `value` is the point estimate in
display units (a percent, not a proportion). `n_actual`, CI bounds,
and `standard_error` are optional but enable hover-tooltip detail and
sample-size sanity checks.

## Optional: fetching data from Tigris

If you have a Tigris (S3-compatible) bucket of pre-aggregated JSON, the
included fetch script populates `app/<slug>/data/` from it. Configure:

```bash
cp .env.example .env
# Fill in TIGRIS_ENDPOINT, TIGRIS_BUCKET_NAME, TIGRIS_CLIENT_ID,
# TIGRIS_CLIENT_SECRET.
```

Then declare the data files each article needs in
[`book.config.mjs`](book.config.mjs):

```js
{
  slug: 'ch08-my-article',
  files: [
    { graphId: 'gss_some_var_year_polparty_percent_timetrend_demo',
      filename: 'my-data.json' },
  ],
},
```

And run:

```bash
pnpm fetch-data                   # fetch all articles
pnpm fetch-data ch08-my-article   # fetch just one
```

Replace the body of `scripts/fetch-article-data.mjs` if your data
lives somewhere other than Tigris — the rest of the template
doesn't care where the JSON came from.

## Editorial conventions

The `components/Book/` library is opinionated. The conventions:

- **Number every figure**, sequentially through the article.
- **Captions state the finding**, not the variable name.
  *"Figure 1. The lines cross every time the White House does."*
  Not *"Figure 1. Confidence in the executive branch by party,
  1973–2024."*
- **Cross-reference every figure** in the prose, by number, in the
  paragraph immediately before or after the chart.
- **Plain-language demographic labels** in prose (translate at first
  mention, then drop the GSS coding).
- **One `<DropCap>`, one `<KeyNumber>`, at most one `<PullQuote>`**
  per article.
- **`<Figure width="...">`** picks the article's editorial weight:
  `body` (default), `body-outset` (~880px hero), `page-outset`
  (~1080px wide / 4-up grid), `screen-inset` (≤1 per article, single
  defining figure).
- **Wrap every chart in `<div className="not-prose">`** inside the
  `<Figure>`. Without it, Tailwind Typography's prose styling leaks
  into the chart's tooltip portal.

The seven shipped articles all follow these conventions; copy any of
them as a starting point.

## Removing the example articles

To strip the GSS examples and start clean:

1. Delete the seven `app/ch*/` folders.
2. Edit `lib/book-toc.ts` and replace the `book` constant with your
   own outline.
3. Edit `book.config.mjs` and clear the `articles` array.
4. Optionally delete `public/ch06-social-trust/` (the only public asset
   the examples use).

The `app/[slug]/page.tsx` fallback will render a placeholder for any
TOC entry without a dedicated `page.tsx`.

## License

MIT for the boilerplate code (components, scaffolding, scripts).
The shipped example articles draw on the public General Social Survey
data and are released under the same terms — strip them before you
publish your own work.
