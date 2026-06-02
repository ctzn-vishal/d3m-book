# Data Driven Decision Making (D3M)

> *From Business Questions to Visual Evidence, Algorithms, and AI Workflows.*

An online MBA textbook by **Vishal Singh** (NYU Stern), built as a Next.js +
MDX site. The book teaches managers and analysts the six evidence languages
of modern data work — description, visual evidence, causal designs,
prediction, AI workflows, and the operating system that runs them — and
the one-page artefacts (cards, memos, studios) that turn analysis into
infrastructure.

The book is organized as seven Parts:

- **Part 0 — The D3M Mindset.** Foreword, what data-driven decision making
  means, and the evidence stack.
- **Part I — Language of Data.** Reading business tables before
  visualizing or modelling them.
- **Part II — Visual Evidence.** Visualization as a standalone evidence
  language with reusable motifs.
- **Part III — Quantifying Effects.** Experiments, regression, causal
  designs, and pricing.
- **Part IV — Language of Algorithms.** Predictive task design, supervised
  models, segmentation, and targeting.
- **Part V — Unstructured Data, Embeddings, and Generative AI.** Classical
  NLP, embeddings, GPT-as-measurement, RAG, vision, multimodal, LLMs,
  agents, and AI governance.
- **Part VI — Operating the D3M System.** Data products, decision memos,
  portfolio monitoring, and a final integrative case.

A through-line case (Bean &amp; Basket Coffee) runs across every Part, with
standalone data cases (Soup, Milk, Zillow, BAV, Airbnb, Yelp, Goose Island
Twitter, earnings calls, job postings) appended outside the chapter prose.

## Quick start

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). The book home page is
the front page; each article lives at `/<slug>`.

To build for production:

```bash
pnpm build
pnpm start
```

## Deployment

The book is configured for **Vercel**. The Next.js + MDX setup deploys
without additional configuration:

- Framework preset: **Next.js** (auto-detected)
- Build command: `pnpm build`
- Output: standard Next.js (no `output: 'export'` override)
- Install command: `pnpm install`

To deploy a fork:

1. Import the GitHub repo at [vercel.com/new](https://vercel.com/new).
2. Vercel detects Next.js and uses the defaults above.
3. No environment variables are required for the book content itself.

## Project layout

```
app/
  layout.tsx                Root layout — fonts, MainArea wrapper.
  page.tsx                  Book home page (renders BookHome).
  globals.css               Tailwind + page-chrome rules.
  [slug]/page.tsx           Fallback route for any TOC entry without a
                            dedicated page.tsx (renders a placeholder).
  <slug>/                   One folder per article.
    page.tsx                Imports the MDX, wraps in <BookShell>.
    article.mdx             The article itself.
    data/                   Optional: JSON the article imports into figures.

components/Book/            Editorial component library.
  BookShell.tsx, BookHome.tsx, ChapterTocDrawer.tsx
  Figure.tsx, DropCap.tsx, Callout.tsx, KeyNumber.tsx
  SideNote.tsx, PullQuote.tsx, DataTable.tsx, QuizBlock.tsx
  Pitfall.tsx, Takeaway.tsx
  Equation.tsx, M.tsx, SmallMultiples.tsx, TabSet.tsx, ...

components/Book/part0/      Decision ladder, artefact family tree,
                            evidence stack, case portfolio.
components/Book/part1/      Decision Brief Builder.
components/Book/part2/      Visual evidence components.
components/Book/part3/      CausalRegressionVisuals, ConceptDiagrams.
components/Book/part4/      PredictionDiagrams, SegmentationDiagrams.
components/Book/part5/      TextDiagrams, MeasurementDiagrams,
                            RagVisionAgentDiagrams.
components/Book/part6/      ArtefactCatalog, PortfolioMonitoring,
                            TwoStudioIntersection, DecisionMemoTemplate.

lib/book-toc.ts             Single source of truth — parts, chapters,
                            article order, slugs, status.
lib/book-types.ts           TypeScript types.
```

## The artefact family

Five one-page artefacts the book teaches the reader to write:

1. **Decision Question Card** (§9.1) — action, outcome, unit, timing,
   comparison, threshold.
2. **Predictive Task Contract** (§14.2) — target, features, unit of
   prediction, label timing.
3. **Model Card** (§15.5) — what the model does, where it fails, who
   owns it.
4. **AI Workflow Card** (§22.1) — what the workflow does, what governs
   it, who responds.
5. **Decision Memo** (§24.1) — the synthesis document that ships.

Each extends the discipline of the one above. The full chain appears in
[§0.2](/ch00-2-evidence-stack).

## Editorial conventions

The `components/Book/` library is opinionated. Conventions enforced
across the book:

- **Number every figure**, sequentially through the article.
- **Captions state the finding**, not the variable name.
- **Cross-reference every figure** in the prose, by number, immediately
  before or after the chart.
- **Plain-language business labels** in prose.
- **One `<DropCap>`, one `<KeyNumber>`, at most one `<PullQuote>`** per
  article.
- **`<Figure width="...">`** picks the article's editorial weight:
  `body` (default), `body-outset`, `page-outset`, `screen-inset`.
- **Wrap every chart in `<div className="not-prose">`** inside the
  `<Figure>` so prose styling doesn't leak into the chart.

Each article ends with a **`<Takeaway>`** block stating the managerial
rule (the label varies per article so the close doesn't feel stamped).
Genuine failure modes are flagged inline with **`<Pitfall>`** blocks — up
to three per article, each naming the failure and bolding the fix; filler
"what can go wrong" sections were removed rather than converted.

Concept-check quizzes are **consolidated to one `<QuizBlock>` per broad
chapter** (three questions), living in that chapter's designated article —
not one quiz per article.

## Authoring a new article

Three steps. None touch component code.

### 1. Add a TOC entry

Edit [`lib/book-toc.ts`](lib/book-toc.ts) and add an entry under the
right broad chapter:

```ts
{ slug: 'my-new-article', number: '6.3', title: 'My New Article', status: 'draft' },
```

`status` is `'planned' | 'draft' | 'published'`. Only `'published'`
articles are linked from the home page; all three render.

### 2. Create the folder

```bash
mkdir -p app/my-new-article
```

Add a `page.tsx` mirroring the existing chapters:

```tsx
import type { Metadata } from 'next';
import { BookShell } from '@/components/Book/BookShell';
import { book, findArticle } from '@/lib/book-toc';
import Article from './article.mdx';

export const metadata: Metadata = {
  title: `§6.3 My New Article | ${book.title}`,
  description: 'A one-line description of the article.',
};

export default function Page() {
  return (
    <BookShell slug="my-new-article" book={book} findArticle={findArticle}>
      <Article />
    </BookShell>
  );
}
```

### 3. Write the MDX

Open `app/my-new-article/article.mdx`. Copy the import block from any
existing article (e.g. `app/ch11-from-metrics-to-decisions/article.mdx`).

## License

MIT for the boilerplate scaffolding (components, layouts, scripts).
Book prose, figures, examples, and case-pack assets are the author's
work — see the repo for the prose license.
