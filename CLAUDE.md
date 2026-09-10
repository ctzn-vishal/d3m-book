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
