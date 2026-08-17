# Diagrams

How figures get drawn in this book. Read this before adding one.

The system comes from the `diagram-design` skill (v2.4.0), skinned to the
book's own tokens via the `d3m-book` profile. `.diagram-design` at the repo
root binds the two together, so a session that invokes the skill here resolves
the book's palette and typography rather than the skill's defaults.

---

## 1. First, decide whether to draw at all

> Would a reader learn more from this than from a well-written paragraph?

If no, write the paragraph. Three specific cases where the answer is usually no:

- **A list of things.** Use a table or bullets. If a three-column table
  communicates the same thing, the table wins — it is searchable, it copies,
  and it does not need a legend.
- **A simple before/after.** Two columns of text.
- **One shape with a label in it.** Just write the sentence.

And one case where the answer is usually yes even though a table exists: when
the *relationship between two simple facts* is the content. `SqlExecutionOrder`
is the clearest example in the book — written order and execution order are
each a trivial list, and the crossing lines between them are the whole lesson.

## 2. What this kit is not for

**Data charts.** Anything that maps a quantity to a position, length, or area —
scatter plots, line charts, bar charts, heatmaps, small multiples. Those belong
to the `dataviz` skill and to Observable Plot / Recharts. Roughly forty
components in `components/Book/part2`–`part5` are charts and are deliberately
untouched by the redraw work; they read theme tokens through `LEGACY_C`
(`components/Book/diagram/legacy.ts`) and nothing else.

The line is: **a schematic shows structure, a chart shows magnitude.** If moving
a box two inches to the left would change what the figure claims, it's a chart.

**Statistical notation.** Causal DAGs (`ConfounderDAG`,
`ReverseCausalityDiagram`) are conventionally drawn with diagonal arrows, and
straightening them would misrepresent the notation. Axis-based econ figures
(`ElasticityZones`, `OptimalMarkupDiagram`) put things at coordinates that mean
something. Neither uses `Connector`, and neither should.

## 3. Pick the visual type

Load the skill and let it route you. The types the book actually uses, with the
component to read as an example of each:

| Showing | Type | Example |
|---|---|---|
| Components and their connections | Architecture | `McpHub` |
| Decision logic with branches | Flowchart | `QualityTriageBoard` |
| States, transitions, and a retry | State machine | `StructuredOutputFlow` |
| Entities, keys, and cardinality | ER | `JoinModelDiagram` |
| Cross-functional phases | Swimlane | `RagPipeline` |
| Two-axis positioning | Quadrant | `RiskControlMap` |
| A cycle that writes back to shared state | Loop | `DataDecisionLoop` |
| Hierarchy by containment | Nested | `PromptStructureCard` |
| Parent to children | Tree | `MetricCompositionTree` |
| Stacked abstraction levels | Layer stack | `AgentStack` |
| Overlap between sets | Venn | `LethalTrifecta` |
| Conversion drop-off | Funnel | `RetargetingFunnel` |
| Events in time | Timeline | `EuAiActTimeline` |
| An ordered pipeline | Data flow / Process | `TextPipeline` |

Two traps worth naming, because both were in the book before:

- **A name is not a type.** `ArtefactFamilyTree` is called a tree and is a
  linear chain; it is drawn as a rail. `GovernanceQuadrants` is called a
  quadrant and is four independent checklists with no axes; it stayed a card
  grid. Draw the content, not the identifier.
- **A hub-and-spoke picture is rarely the argument.** `McpHub` drawn as a
  starburst says "this touches six systems", which was equally true before MCP
  existed. Drawn as a bus it says six connectors collapsed into one protocol,
  which is the actual claim.

## 4. The budget

| Limit | Value |
|---|---|
| Nodes | 9 |
| Arrows | 12 |
| **Accent elements** | **2** |
| Tree depth | 4 |
| Layers in a stack | 6 |
| Circles in a Venn | 3 |
| Lanes in a swimlane | 5 |
| Zones | 3 |

Over budget means **two diagrams**, not a denser one. `RagPipeline` was one
800×320 figure carrying indexing, retrieval, and generation at once — over the
node budget, which is why its connectors collided. It is now an overview
swimlane plus `RagRetrievalDetail`.

## 5. Colour

There is **one accent**, and it means *look here first*.

```
accent      #c87c2a / #e09a4f    ≤2 elements per diagram, strokes and fills
accent-ink  #9a5815 / #f0b06a    accent-coloured TEXT only (accent is 3.3:1)
pos / neg   teal / red            genuine valence, and nothing else
link                              hyperlinks. Not available to diagrams.
```

Everything that is not focal is `ink`, `muted`, or `soft`. The twelve
copy-pasted `const C` palettes — blue, navy, green, purple, amber, teal, pink,
and their `*Light` tints — are gone. If a diagram seems to need a fifth colour,
it needs a second diagram.

**`pos`/`neg` are the one documented exception**, and they are narrow. Use them
when the subject *is* a valence — can-support against cannot-support
(`GrainDecisionMap`), matched against unmatched ground truth
(`ValidationLabSchematic`), the forecast against the failure rate
(`HorizonScorecard`). A diagram may use the valence pair *or* the accent, not
both, or the reader has three competing colours to rank.

Never write a hex. `tokens.ts` is the only file allowed to name a colour, and
every value there resolves through `rgb(var(--book-*))` so light and dark are
the same markup.

## 6. Connectors

**No diagonals between off-axis nodes.** `Connector` bends at right angles; a
plain straight line is legal only when the two endpoints share an x or a y.

Five rules that between them cover every connector defect the audit found:

1. **Label with a gap.** `ArrowLabel` masks and clears the stroke by 8px. A
   label sitting *on* its arrow hides the thing it annotates.
2. **A label mask must not overlap a node.** Nodes paint after labels, so a
   mask that lands inside a box gets covered and the text renders as a fragment
   on the border. Put the label on a stretch of connector in open canvas, or
   nudge it with `labelOffset`.
3. **No two connectors on the same path.** Crossings get a bridge (`hops`);
   parallel runs stay ≥12px apart (`mid`).
4. **Fan shared attach points.** Two arrows leaving one point on a box is a
   hard fail. Use `fan()` from `path.ts`, or — when more than three connectors
   share a side — a `TreeBus`, which is the only thing that routes a six-way
   fan-out without crossings.
5. **Don't route behind a non-endpoint box.** Reroute. A line that disappears
   under a box the reader has to ignore is a line the reader stops trusting.

## 7. The kit

`components/Book/diagram`. Read `index.ts` for the full surface.

```tsx
<DiagramFrame eyebrow="What this is" note="One quiet line.">
  <DiagramSvg width={792} height={240} title="…" desc="…">
    {/* Connectors first — z-order puts lines behind boxes. */}
    <Connector from={anchor.right(a)} to={anchor.left(b)} route="hvh" label="WRITES" />
    <Node {...a} variant="focal" label="The focal thing" sublabel="detail" />
    <Legend y={228} width={792} items={[{ kind: 'focal', label: '…' }]} />
  </DiagramSvg>
</DiagramFrame>
```

- `width` is **792** for a `page-outset` figure. Everything is on a 4px grid.
- `<Figure>` owns the caption, the number, and the width zone. `DiagramFrame`
  owns only the ground.
- `title` is the subject; `desc` is one sentence saying what the figure *shows*
  for a reader who can't see it. Describe the content, not the geometry.
- `Node` measures its own text block, so a two-line label pushes the sublabel
  down rather than landing on it. Trust it, but check the box is tall enough.
- No `foreignObject` (use `SvgText`, which wraps with `<tspan>`), no shadows,
  no background rect inside the SVG, and no JetBrains Mono — that is the book's
  code face, and using it in a figure blurs the code/figure boundary. Diagram
  mono is IBM Plex (`font-plex`).

## 8. Before you commit

- [ ] Could a node be removed? Could two be merged?
- [ ] Could an arrow be removed — is the relationship obvious from layout?
- [ ] ≤2 accent elements, and are they the right two?
- [ ] Every connector orthogonal; every label clear of its stroke and of every
      node; no two connectors sharing a path or an attach point.
- [ ] Every coordinate, width, height, and gap divisible by 4.
- [ ] `title` and `desc` both filled in, and `desc` describes content.
- [ ] **Rendered in light *and* dark.** Not "the tokens should handle it" —
      rendered. Most of the defects found during this migration were geometry,
      not colour, and geometry is invisible until you look.

There is a screenshot harness for the last one; it is gitignored, so recreate
it when you need it. Roughly:

```bash
node .shot.mjs /ch02-joins /tmp/out "title:The Bean" 1280
```

Launch Playwright against the dev server, toggle `dark` on `<html>`, and
screenshot the element whose `<svg><title>` matches — the pair of images is the
only reliable check that both themes work.

## 9. Where things live

```
components/Book/diagram/
  tokens.ts       the only file that names a colour
  legacy.ts       LEGACY_C — migration shim for the out-of-scope charts
  path.ts         orthogonal routing, bridges, fan()
  layout.ts       rows, rings, arcs, spokes
  text.tsx        SvgText — tspan wrapping, replaces foreignObject
  DiagramFrame    frame + svg + markers + Mask
  Node · Entity · Connector · ArrowLabel · Legend · Zone · Lane
  LayerStack · Tree · Venn
```

`docs/DIAGRAM-AUDIT.md` is the audit this system came out of. It records what
was wrong and why, which is often the fastest way to understand why a rule
here exists.
