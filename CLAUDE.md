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
