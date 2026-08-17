# Diagram Audit & Implementation Plan

*Audit of the D3M book's visual layer against the `diagram-design` skill
(v2.4.0, installed user-scope from `cathrynlavery/diagram-design`).*

**Date:** 2026-08-17 · **Branch audited:** `main` @ `77a7ffa`

---

## 1. Scope and method

What was measured, so the numbers below can be re-derived:

- **75** `article.mdx` files under `app/*/`, containing **163** `<Figure>` uses.
- **25** component files under `components/Book/part0…part6`, exporting
  ~170 components and rendering **77** `<svg>` elements.
- Every component file scanned for: local palette constants, `bg-white`,
  `shadow-*`, `fill-slate-*`, `foreignObject`, and dark-mode tokens
  (`dark:`, `bg-card`, `border-border`, `var(--book-*)`).
- Dark-mode behaviour verified live: dev server on `:3000`, `dark` class
  applied to `<html>`, computed styles read off `/ch15-rag`.
- Import graph built from every `article.mdx` to find unused components.

**Key distinction used throughout.** `diagram-design` draws *schematics* —
architecture, flow, process, tree, layer stack, Venn, quadrant, timeline,
state machine, ER. It is **not** a charting tool. Roughly half the book's
77 SVGs are data charts (Observable Plot, Recharts, hand-rolled scales)
and are explicitly **out of scope** — see §5.

---

## 2. What exists today

| Part | Files | Exports | Dominant kind | Theme-aware? |
|---|---|---|---|---|
| Part 0 | `part0/Part0Diagrams.tsx` | 8 | schematic | ✗ |
| Part I | `part1/` × 4 | 10 | card grid + schematic | ✓ |
| Part II | `part2/` × 5 | 26 | data chart | partial (ChartAtlas only) |
| Part III | `part3/` × 2 | 28 | mixed chart / schematic | ✗ |
| Part IV | `part4/` × 4 | 39 | mixed | ✗ |
| Part V | `part5/` × 4 | 36 | **schematic-dominant** | ✗ |
| Part VI | `part6/` × 5 | 20 | **schematic-dominant** | ✗ |

The book already has a strong figure contract — `<Figure width=…>` zones,
numbered captions that state the finding, `not-prose` wrapping. The problem
is not the contract. It is what sits inside it.

---

## 3. Findings

### F1 — Nineteen of 25 component files ignore the book's dark theme

`tailwind.config.ts` sets `darkMode: 'class'` and `globals.css` defines a
full token set (`--book-surface`, `--book-card`, `--book-body`,
`--book-muted`, `--book-border`, `--book-link`) with a `.dark` override.
Only **6** of 25 part files reference any of it — the four `part1/` files,
`part2/ChartAtlas.tsx`, and `part6/Sources.tsx`.

Verified on `/ch15-rag` with `.dark` applied:

| | value |
|---|---|
| page background | `rgb(15, 23, 42)` |
| diagram card | `rounded-md border border-slate-200 bg-white p-4 shadow-sm` |
| computed card bg | `rgb(255, 255, 255)` |
| node fills | `white`, `#fef3c7`, `#ede9fe`, `#a7f3d0` |

The diagrams stay *readable* (dark ink on a white card) but they read as
light-mode slabs punched into a dark page. Every schematic in Parts 0,
II–VI behaves this way.

### F2 — Twelve files each redeclare their own palette

Twelve component files open with an identical-ish `const C = { ink, muted,
grid, blue, blueLight, navy, orange, orangeLight, green, greenLight, red,
redLight, purple, purpleLight, amber, amberLight, teal, tealLight, pink,
slate100, slate50 }`. Twenty-one hardcoded hexes, copy-pasted twelve times,
none tied to a theme token.

The practical consequence is F3.

### F3 — No focal hierarchy: colour is decoration, not signal

Because the palette offers ten hues, diagrams use ten hues. Examples:

- `ConfounderDAG` (`part3/ConceptDiagrams.tsx:188`) — three nodes, three
  different colours (blue / green / amber). Nothing is focal.
- `LethalTrifecta` (`part6/PlumbingGovernanceDiagrams.tsx:141`) — three
  circles, three colours, all at `opacity={0.55}`, so the intersection that
  *is the point of the diagram* is the muddiest region in it.
- `JoinModelDiagram` (`part1/DataLanguageVisuals.tsx:224`) — five entities,
  five colours.

`diagram-design`'s rule is 1–2 accent elements per diagram, everything else
ink/muted. That single change would do more for legibility than any
redraw.

### F4 — Connector and label defects in the flow diagrams

`RagPipeline` (`part5/RagVisionAgentDiagrams.tsx:64`) is representative:

- diagonal `<line>` connectors between off-axis nodes (`420,235 → 510,120`;
  `570,75 → 620,150`) instead of orthogonal elbows;
- arrow labels with **no mask rect** — `"top-k retrieve"` at `(465,180)`
  sits directly on the diagonal it annotates;
- `foreignObject` for text wrapping (4 uses in `Part0Diagrams.tsx`, 6 in
  `RagVisionAgentDiagrams.tsx`), which complicates any future SVG/PNG export.

~69 `shadow-sm`/`shadow-md` uses across 24 of 25 files; `diagram-design`
bans shadows in favour of hairline borders.

**Caution — do not over-apply.** A causal DAG is *conventionally* drawn
with diagonal arrows. `ConfounderDAG` and `ReverseCausalityDiagram` should
keep their diagonals; the orthogonal-elbow rule is for system schematics,
not for statistical notation. Same for axis-based econ figures
(`ElasticityZones`, `OptimalMarkupDiagram`).

### F5 — A complete Part I visual layer is built, data-backed, and wired to nothing

This is the largest single finding.

`components/Book/part1/DataLanguageVisuals.tsx` (19.9 KB) exports seven
components. **Zero** are imported by any article:

| Export | Intended article | Backing JSON |
|---|---|---|
| `GrainDecisionMap` | `ch01-reading-data` | `ch01-reading-data/data/case-grain-map.json` ✓ |
| `StructureCaseGrid` | `ch01-reading-data` | `case-structures.json` ✓ |
| `VariableTypeCards` | `ch01-reading-data` | `case-variable-types.json` ✓ |
| `QueryPipelineDiagram` | `ch02-sql` | none needed (static) |
| `JoinModelDiagram` | `ch02-joins` | none needed (static) |
| `ZillowWideLong` | `ch02-reshaping` | `zillow-wide-long.json` ✓ |
| `QualityTriageBoard` | `ch02-data-quality` | `case-quality-scan.json` ✓ |

The data files **already exist** in the right article directories. Two more
components are orphaned the same way: `part1/MetricFormulaLab.tsx` (with
`ch02-metrics/data/metric-lab.json` present) and
`part1/DashboardStoryboard.tsx`.

These are also the *only* diagram files written to the dark-mode tokens.
Reconnecting them is the cheapest large win available.

### F6 — Chapters 1–2 are the book's visual desert

Consequence of F5. Current state of Part I:

| Article | `<Figure>` | Conceptual diagram |
|---|---|---|
| `ch01-reading-data` | 2 | none (tables + TabSets) |
| `ch02-sql` | 1 | none |
| `ch02-joins` | 1 | none |
| `ch02-reshaping` | 1 | none |
| `ch02-metrics` | **0** | none |
| `ch02-data-quality` | 1 | none |
| `ch02-studio-data-language` | 1 | `DecisionBriefBuilder` |

Seven articles teaching grain, joins, reshaping, and metric contracts —
the conceptual foundation of the whole book — carry **one** conceptual
diagram between them. Section headings confirm the fit is exact:
"Four kinds of join" (Venn), "Joins change the grain" (ER + fan-out),
"Two shapes: wide and long" (data flow), "Triage, don't bulk-clean"
(flowchart), "A metric is a contract" (tree).

### F7 — Thin coverage in the AI chapters

| Article | `<Figure>` | Diagram |
|---|---|---|
| `ch15-rag` | 1 | `RagPipeline` |
| `ch15-ocr-document-ai` | 1 | `DocumentAIFlow` |
| `ch15-multimodal` | 1 | `MultimodalArchitecture` |
| `ch16-structured-outputs` | 1 | `StructuredOutputFlow` |
| `ch09-supervised-setup` | 1 | `SupervisedTaskTaxonomy` |
| `ch10-logistic-churn` | 1 | `ProbabilityScoreToAction` |
| `ch11-clustering` | 1 | `ClusterSmallMultiples` |
| `ch11-tsne-umap` | 1 | `TsneVsPca` |

RAG in particular is *the* canonical architecture-diagram topic and gets a
single 800×320 figure that tries to carry indexing, retrieval, and
generation at once — over the skill's 9-node budget, which is why the
connectors collide.

### F8 — Minor

- `ch08-seasonal-pricing` renders `SeasonalOptimalPriceCompare` **outside**
  a `<Figure>` — breaks the README's "number every figure" rule.
- Accessibility is good: all 77 `<svg>` carry `role="img"` + `aria-label`.
  Only 1 `<title>` and 0 `<desc>` exist. The skill prefers
  `<title>`/`<desc>` + `aria-labelledby`; `aria-label` is valid, so this is
  a consistency nit, not a defect.
- `ch00-foreword` and `ch04-studio-visual-brief` have 0 `<Figure>` — both
  are fine as prose.

---

## 4. Where `diagram-design` fits — and where it doesn't

The skill emits **standalone self-contained HTML with inline SVG**. The
book renders **React components inside MDX**, with a theme, typed props,
and live data. These are not the same target.

**Recommended posture: adopt the skill's design system and use it as an
authoring tool — not as an output pipeline.**

Concretely: use the skill to choose the visual type, plan the layout, and
enforce its rules (complexity budget, focal-accent limit, orthogonal
connectors, masked labels, legend-as-bottom-strip, 4px grid). Render the
result through a shared React primitive kit wired to the book's own
tokens. Skip the skill's HTML wrapper entirely — `<Figure>` already
provides the caption, width zone, and page chrome.

Also note the skill's default fonts (Instrument Serif / Geist / Geist Mono)
are **not** the book's (Fraunces / Inter / IBM Plex Mono / JetBrains Mono).
A brand profile must be onboarded or every generated diagram will be
typographically foreign.

### Out of scope — do not redraw these

~40 components are data charts. Leave them to the `dataviz` skill or leave
them alone:

- all of `part2/` except `VisualBriefWorkflow` — `SoupVisualEvidence` (50 KB),
  `MarketConcentrationCase` (42.5 KB), `ChartAtlas` (66.8 KB), `DashboardArc`
- `part3/CausalRegressionVisuals` statistical figures — `DiDParallelTrendsVisual`,
  `PanelFixedEffectsVisual`, `ZillowSyntheticControl`, `SoupSeasonScatter`,
  `SoupCrossPriceHeatmap`, `PricingOptimizer`, the regression ladders
- case-study files — `part4/RentHopCaseStudy`, `part4/LotteryStateCaseStudy`,
  `part5/NlpCaseStudies`
- chart-shaped exports elsewhere — `ThresholdProfitChart`, `CalibrationLiftPlots`,
  `ActualVsPredicted`, `FeatureImportanceBars`, `TfIdfBars`, `EmbeddingScatter`,
  `SqlAccuracyChart`, `MeasurementCostChart`, `ReachSimilarityCurve`

---

## 5. Work list

### 5a. Redraw — existing schematics, tiered

**Tier 1 — highest reader impact.** 27 components.

| Component | File | `diagram-design` type |
|---|---|---|
| `LadderPosition` *(used by 6 articles)* | part0 | Process / timeline |
| `ArtefactFamilyTree` | part0 | Tree |
| `EvidenceStackMap` | part0 | Layer stack |
| `StorageStackMap` | part0 | Medallion |
| `DataGenerationMap` | part0 | Data flow |
| `UseCaseRouter` | part0 | Flowchart |
| `DataDecisionLoop` | part0 | Loop |
| `CasePortfolio` | part0 | DP security matrix (grid) |
| `RagPipeline` | part5 | Architecture → **split into overview + retrieval detail** |
| `AgentWorkflowDiagram` | part5 | Loop + human gate |
| `MultimodalArchitecture` | part5 | Architecture |
| `DocumentAIFlow` | part5 | Process |
| `VisionPipeline` | part5 | Data flow |
| `StructuredOutputFlow` | part5 | **State machine** (validate → retry → accept) |
| `CustomerVoiceStudioFlow` | part5 | Process |
| `HumanApprovalGate` | part5 | Flowchart |
| `CnnFeatureHierarchy` | part5 | Layer stack |
| `PromptStructureCard` | part5 | Nested |
| `McpHub` | part6 | Architecture |
| `AgentStack` | part6 | Layer stack |
| `LethalTrifecta` | part6 | Venn |
| `AgentTraceTree` | part6 | Tree |
| `EuAiActTimeline` | part6 | Timeline |
| `TextToSqlFlow` | part6 | Data flow |
| `SemanticLayerDiagram` | part6 | Layer stack |
| `PredictiveAgentLoop` | part6 | Loop |
| `AgentAnatomy` / `AutonomyLadder` / `WorkflowVsAgent` | part6 | Nested / pyramid / quadrant |

**Tier 2 — 16 components.**

`AlgorithmicLifecycle` (loop), `SupervisedTaskTaxonomy` (tree),
`TrainTestSplitDiagram` (data flow), `LeakageMap` (data flow),
`FeatureCatalogDiagram` (nested), `ProbabilityScoreToAction` (data flow),
`DecisionTreeDiagram` (tree), `EnsembleCommittee` (architecture),
`ModelCard` (nested), `TargetingTaxonomy` (tree), `RetargetingFunnel`
(pyramid/funnel), `DriftSchematic` (data flow), `CustomerIntelligenceFlow`
(process), `TextPipeline` (data flow), `StructuredVsUnstructured` (Venn),
`RiskControlMap` (governance / layer stack), `ValidationLabSchematic`
(process), `AIWorkflowCard` (nested).

**Tier 3 — token migration only, no redraw.** Everything else in §4's
out-of-scope list still needs F1 fixed (dark-mode tokens, drop shadows).

### 5b. Reconnect — Part I orphans (do before authoring anything new)

Wire the seven `DataLanguageVisuals` exports plus `MetricFormulaLab` into
their articles. Review each against the skill first — two need rework
rather than a straight wire-in:

- `QualityTriageBoard` is a 2-column card grid; `ch02-data-quality`'s
  "Triage, don't bulk-clean" section wants an actual **flowchart**.
- `JoinModelDiagram` uses Bézier connectors and five colours; redraw as an
  **ER diagram** with cardinality markers.

### 5c. New — highest pedagogic payoff first

| # | Article | Proposed diagram | Type |
|---|---|---|---|
| 1 | `ch02-joins` | Inner / left / anti join on the same two tables | **Venn** |
| 2 | `ch02-joins` | Fan-out: why `innerJoinedCampaigns` inflates revenue vs `truthfulTotal` *(both already computed in the MDX)* | **Data flow** |
| 3 | `ch01-reading-data` | "One row = what?" — grain across the four case tables | **ER / data model** |
| 4 | `ch02-sql` | SQL logical execution order: FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY | **Data flow** |
| 5 | `ch02-data-quality` | Quality triage decision path | **Flowchart** |
| 6 | `ch02-metrics` | Metric composition tree (revenue → orders × AOV → …) | **Tree** |
| 7 | `ch02-reshaping` | Long ↔ wide, and which consumer wants which | **Process** |
| 8 | `ch15-rag` | RAG overview (index-time vs query-time as two lanes) | **Swimlane** |
| 9 | `ch16-structured-outputs` | Schema → parse → validate → retry → accept | **State machine** |
| 10 | `ch09-supervised-setup` | Unit → features → label timing → split | **Data flow** |
| 11 | `ch15-multimodal` | Modality encoders → shared space → tasks | **Architecture** |
| 12 | `ch10-logistic-churn` | Score → threshold → action queue | **Flowchart** |

---

## 6. Implementation plan

Phases are ordered so each unblocks the next. Phases 0–2 deliver most of
the value.

### Phase 0 — Brand onboarding *(≈1 session)*

1. Run the skill's onboarding to build a `d3m-book` profile mapping its
   semantic roles onto the book's tokens:

   | skill role | book source |
   |---|---|
   | `paper` / `paper-2` | `--book-surface` / `--book-card` |
   | `ink` | `--book-body` |
   | `muted` / `soft` | `--book-muted` |
   | `rule` | `--book-border` |
   | `link` | `--book-link` |
   | `accent` | **decide — see §7 Q1** |
   | title / node name / sublabel type | Fraunces / Inter / IBM Plex Mono |

2. Save it as a named profile and drop a `.diagram-design` marker at the
   repo root so future sessions skip the style-guide gate.

**Done when:** a throwaway diagram generated by the skill is visually
indistinguishable from a book figure in both themes.

### Phase 1 — Shared diagram kit *(foundation)*

Create `components/Book/diagram/`:

- `tokens.ts` — one semantic palette reading `var(--book-*)`, replacing the
  twelve copies of `const C`. Fixes **F1, F2, F3** at the root.
- `DiagramFrame.tsx` — replaces the ~12 duplicated local `Card`
  components. Hairline border, `bg-card`, **no shadow**, optional eyebrow.
- `Node.tsx` — the skill's node-type → treatment table (focal / step /
  store / external / optional / boundary) as variants.
- `Connector.tsx` — orthogonal elbow path builder (`r=8`), bridge/hop for
  crossings, three markers (default / accent / link).
- `ArrowLabel.tsx` — mandatory mask rect + 6–10px gap.
- `Legend.tsx` — bottom horizontal strip.

**Done when:** one Tier-1 diagram is rebuilt on the kit and renders
correctly in light and dark, and `tokens.ts` is the only place a hex
appears.

### Phase 2 — Reconnect Part I *(biggest content win)*

Per §5b. Import each component into its article, wrap in `<Figure>` with a
numbered finding-caption, cross-reference in prose. Rework
`QualityTriageBoard` → flowchart and `JoinModelDiagram` → ER.

**Done when:** `ch01-reading-data` and all five `ch02-*` teaching articles
carry at least one conceptual diagram; `pnpm build` passes.

### Phase 3 — Tier-1 redraws

Work file by file, not diagram by diagram — each file's local `const C` and
`Card` disappear as its diagrams migrate to the kit.

Order: `part0/Part0Diagrams` (highest reuse — `LadderPosition` alone appears
in 6 articles) → `part6/*` (4 files, newest content, most diagram-native) →
`part5/RagVisionAgentDiagrams`.

Run the skill's §9 taste gate on each. Split anything over 9 nodes.

**Done when:** all three groups render on the kit; no `const C` remains in
`part0`, `part5`, `part6`.

### Phase 4 — Tier-2 redraws

`part4/PredictionDiagrams`, `part4/SegmentationDiagrams`,
`part5/TextDiagrams`, `part5/MeasurementDiagrams`, the schematic half of
`part3/ConceptDiagrams`. Respect the F4 caution on DAGs and axis figures.

### Phase 5 — New diagrams

§5c items 1–12, in that order. Author each with the skill, render on the
kit.

### Phase 6 — Lock it in

- `docs/DIAGRAMS.md` — when to draw, which type, the complexity budget, the
  focal-accent rule, the kit's API.
- A `CLAUDE.md` note pointing future sessions at the kit and the profile.
- Tier-3 token migration sweep for the remaining chart files (F1 only).
- Fix `ch08-seasonal-pricing`'s unwrapped figure (F8).
- Decide `part1/DashboardStoryboard.tsx` — wire into `ch04-dashboards`
  alongside `DashboardArc`, or delete.

---

## 7. Decisions — approved 2026-08-17

**A1 — Accent colour.** Introduce a dedicated `--book-accent`, seeded from
the warm orange `#c87c2a` already present in all twelve palette copies,
with a `.dark` variant. `--book-link` stays reserved for hyperlinks. One
accent, ≤2 elements per diagram.

**A2 — Semantic colour.** Exactly two semantic hues survive — positive and
negative (`--book-pos`, `--book-neg`) — as a documented exception to the
focal rule, for genuine good/bad encodings like `GrainDecisionMap`'s
can/cannot-support and `RiskControlMap`. Every other hue is deleted;
non-focal elements are ink/muted.

**A3 — Scope.** Full run. Phases 0–6, Tiers 1 and 2 both, ~45 components.

**A4 — Static export.** Assume yes. Eliminate `foreignObject` during the
redraws (4 uses in `Part0Diagrams.tsx`, 6 in `RagVisionAgentDiagrams.tsx`)
rather than carrying it forward — use `<text>` with `<tspan>` line breaks.

### Working constraints

The book is under active development and the author is adding content in
parallel. Therefore:

- Work **file by file**, and commit at the end of each file or phase — not
  one large commit at the end.
- Touch prose only to add figure cross-references and captions. Do not
  rewrite article text.
- Do not change `lib/book-toc.ts` status values or article structure.
- `pnpm build` (which runs `scripts/verify-book.ts`) must pass before each
  commit.
