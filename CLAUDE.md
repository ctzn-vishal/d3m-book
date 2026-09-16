# CLAUDE.md

Notes for future sessions working on this book.

## Diagrams

**Read [`docs/DIAGRAMS.md`](docs/DIAGRAMS.md) before adding or changing a
figure.** The short version:

- Schematics render through `components/Book/diagram` — never as standalone
  HTML, and never with a locally declared palette. `tokens.ts` is the only file
  in the book allowed to name a colour.
- One accent (`--book-accent`), on at most two elements per diagram. Everything
  else is ink or muted. `pos`/`neg` exist for genuine good/bad valences only.
- Connectors bend at right angles. Diagonals are for causal DAGs and axis-based
  econ figures, which don't use this kit.
- Budget: 9 nodes, 12 arrows. Over budget means two diagrams.
- **Verify in light and dark by rendering, not by reasoning.** Most defects in
  this system have been geometry, and geometry is invisible until you look.

The `diagram-design` skill is installed and `.diagram-design` at the repo root
binds it to the `d3m-book` profile in `~/.diagram-design/profiles/`, which
mirrors the book's tokens and typography. Use the skill to *choose the visual
type and check the rules*; render the result through the kit.

Data charts — anything mapping quantity to position, length, or area — are out
of scope for that skill here. They belong to `dataviz`, and they read theme
tokens through `LEGACY_C` in `components/Book/diagram/legacy.ts`.

## Figures and prose

- Every figure is numbered and cross-referenced from the prose. Inserting one
  mid-article means renumbering the ones after it *and* their in-prose
  references.
- `<Figure>` owns the caption and the width zone (`body`, `body-outset`,
  `page-outset`, `screen-inset`). `DiagramFrame` owns only the ground the
  diagram sits on. Don't nest a second caption inside.
- A caption states the *finding*, not the subject. The subject goes in
  `DiagramFrame`'s eyebrow.

## Before committing

`pnpm build` runs `scripts/verify-book.ts` and a full Next build, and takes
about twenty seconds. Run it. `npx tsc --noEmit` is a three-second
pre-check when iterating.

Don't change `lib/book-toc.ts` status values or article structure as a side
effect of other work.

## Windows verification

If `pnpm` is not on PATH, use `npx.cmd --yes pnpm@9.0.0 build` (the
repository's pinned package-manager version). Use `npx.cmd tsc --noEmit`
for the type check. The `.cmd` launcher works without changing PowerShell's
execution policy.

For local Playwright checks, installed Edge is available through
`chromium.launch({ channel: 'msedge', headless: true })`; the bundled
Playwright Chromium browser may not be installed. Check teaching, part,
and MDX article pages in both themes at mobile and desktop widths.

## Public content URLs

- Registry `href` values in Turso and the snapshot remain storage URLs. Public
  registry readers project them into clean URLs and retain `sourceHref`; use
  `lib/content-urls.mjs` rather than deriving links independently.
- Default public slugs come from stable registry IDs, never titles. Editorial
  overrides live in `content/gallery.json` under `publicSlugs`, keyed by ID.
  When changing an override, retain the former slug in its `aliases` array.
  Build and registry sync validate collisions, including aliases.
- `/read/*`, `/studios/*`, and `/apps/*` serve registered HTML through route
  handlers. `/_content/*` proxies assets without forwarding credentials;
  its App Router directory is escaped as `app/%5Fcontent`.
- `pnpm test:content-urls` covers mapping, HTML transformation, and proxy behavior.
  With `pnpm dev --port 3100` running, `pnpm test:content-browser` checks Edge at
  mobile/desktop widths in both themes (`CONTENT_TEST_URL` overrides the origin).
- Deploy clean routes before running the content-publishing pipeline: injection
  and sitemap generation now publish the clean canonical URLs. Old bucket
  links remain available; HTTP redirects on the content domain require a
  separate change to that domain's serving layer.

## Front matter on bucket HTML

- `scripts/front-matter.mjs` rebuilds the kicker/title/dek/byline of every
  `articles/**` and `studios/**` file. It runs inside `applyChrome`, so it
  reaches both the served route (`lib/content-html.mjs`) and the bucket rewrite
  (`pnpm inject-chrome`) from one implementation. Apps are excluded.
- It hides the file's original parts (`data-vs-fm="hidden"`) instead of
  deleting them, and never moves or rewrites the `<h1>` — the rendered title
  disagrees with the registry title in a third of files, and the file wins.
  `reset()` returns a document to exactly what it was.
- Byline dates come from `CORPUS_DATE`, one date for everything. The registry's
  `createdAt` is ingest time (129 stories across 11 days) and `updatedAt` tracks
  pipeline runs; neither is editorial. Put a `publishedAt` on a registry row to
  override one file.
- It's the only concern that round-trips the document through cheerio, which is
  why it runs last and why the marker patterns above it tolerate both
  `data-vs-og` and `data-vs-og=""`.
- These files have no copy in git. Run `pnpm backup-content` before any pipeline
  change that touches file bodies, then `pnpm inject-chrome:dry` to see the
  blast radius.

## Gallery thumbnails

- The publish workflow polls Tigris hourly at minute 20 UTC; it is not an
  immediate upload webhook. GitHub schedules may be delayed. A manual run
  with thumbnails enabled publishes sooner.
- Thumbnail storage keys must decode URL escapes exactly once. Public URLs
  encode each key segment; never use an encoded URL pathname as an S3 key.
- `scripts/thumbnail-utils.mjs` shares image paths between screenshot generation
  and registry discovery. It covers published/unlisted articles, studios, and
  bucket-hosted apps; authored external/local images are left alone.
- Generation checks object existence, not just whether the registry has an image
  URL. Uploads use `If-None-Match: *` so existing images are never overwritten.
  Registry sync discovers generated app previews without a gallery.json edit.
- Local `pnpm publish-content` also generates/uploads missing thumbnails and
  folds them back into the manifest and registry before injecting metadata.
- `pnpm test:thumbnails` is offline. `pnpm verify-thumbnails` checks Tigris
  read-only. `pnpm gen-thumbnails` makes local review screenshots without uploads.
  Windows uses installed Edge; `PLAYWRIGHT_CHANNEL` can override the browser.
- `node scripts/gallery-images.browser.mjs` checks gallery image loading;
  `GALLERY_TEST_URL` selects the site (defaults to localhost:3100).
