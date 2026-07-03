# CONTENT-MOVED — D3M Consolidation Pass (Medium)

Running ledger of every content cut or relocated during execution. Under **Medium** the
target loss is **≈ zero**: article prose is preserved verbatim; thin chapters merge so their
articles become sub-sections of a fuller chapter; studios are re-tagged, not rewritten. Any
real loss is flagged **⚠ LOSS** with what/where/why.

- **Branch:** `consolidation/medium` (cut from `origin/main`, 78 articles).
- **Spec:** `consolidation-pass/PROPOSAL-consolidation.md` — §3B chapter map, §5B old→new redirect table.
- **Excluded by decision:** `dynamic-pricing-soup-case` (§13.5) — uncommitted WIP, per Vishal ("ignore the dynamic-pricing case").

---

## Part 0 → new Ch 0 — slug renumber only
No content moved. Five articles renamed to clean `chNN-keyword` slugs; §0.0–0.4 unchanged;
five 301 redirects added. **Zero loss.**

| Old slug | New slug | § |
|---|---|---|
| ch00-0-foreword | ch00-foreword | 0.0 |
| ch00-1-what-is-d3m | ch00-data-origins | 0.1 |
| ch00-2-evidence-stack | ch00-data-storage | 0.2 |
| ch00-3-how-data-is-used | ch00-data-uses | 0.3 |
| ch00-4-data-to-decision-loop | ch00-decision-loop | 0.4 |

### Later update — §0.1–§0.4 merged into one chapter
The four section articles below were combined into a single chapter, **`ch00-data-system`**
(§0.1, "Data, Storage, Use, and the Decision Loop"), with the four titles preserved as `##`
sections in reading order. Prose preserved verbatim; figures/tables renumbered sequentially;
the cross-section framing was trimmed to short bridges. **Zero teaching content lost.** The
Foreword (`ch00-foreword`, §0.0) stays separate. Eight 301 redirects point the old paths at
the merged chapter (the four `chNN-keyword` slugs plus the four pre-consolidation slugs).

| Merged-away slug | § (old) | Now redirects to |
|---|---|---|
| ch00-data-origins | 0.1 | ch00-data-system |
| ch00-data-storage | 0.2 | ch00-data-system |
| ch00-data-uses | 0.3 | ch00-data-system |
| ch00-decision-loop | 0.4 | ch00-data-system |

---

## Parts I–VI → new Ch 1–17 — full renumber + chapter consolidation
**Zero teaching content lost.** All 73 articles' prose preserved verbatim; only slugs, §-numbers,
and cross-references changed, and thin chapters merged so their articles became sub-sections.

**Chapter merges (articles preserved as sub-sections):**
- old Ch 2 + Ch 3 + Ch 4(studio) → **new Ch 2** "Working With Business Tables" (§2.1–2.6)
- old Ch 6 + Ch 7 + Ch 8 → **new Ch 4** "Comparison, Uncertainty, and Dashboards" (§4.1–4.6)
- old Ch 9 + Ch 10 → **new Ch 5** "From Metrics to Counterfactuals" (§5.1–5.4)
- old Ch 18 **split**: §18.1–18.6 → **new Ch 13** "Text as Business Data"; §18.7–18.8 + old Ch 19 → **new Ch 14** "Applied Text, Embeddings, and Measured Constructs"
- old Ch 21 + Ch 22 → **new Ch 16** "LLMs, Workflows, and Governance" (§16.1–16.5)
- old Ch 23 + Ch 24 + Ch 25 → **new Ch 17** "Operating the D3M System" (§17.1–17.4)

**Studios** (§2.6, 4.6, 8.4, 12.4, 16.5, 17.4): re-tagged as trailing articles of their chapter; none keeps its own chapter number. No content change.

**Cross-references remapped mechanically** (single-pass, no double-apply): 268 §X.Y refs, 38 internal `/slug` links, 70 "Chapter N" refs across all 78 articles' prose + page.tsx titles. Verified: every remaining §X.Y resolves to a real new section; 0 old-slug links remain.

**Excluded (not a loss):** `dynamic-pricing-soup-case` (old §13.5) — uncommitted WIP, dropped per decision; never part of the published `origin/main` book.

**One pre-existing dangling ref corrected** (not a renumber artifact): §13.1 (`ch13-structured-to-unstructured`) cited a non-existent "§19.3" → retargeted to **§14.4** (GPT-as-Measurement / construct measurement), which is what the pitfall is about.

`book-toc.ts` rewritten to the 18-chapter structure; `next.config.ts` carries 80 permanent redirects (78 new + 2 legacy chained forward); `lib/studios.ts` `relatedSlug` cross-links remapped. **Build compiles, typecheck clean.**

---

## Cohesion pass — cross-reference fossils + foreword (no teaching content changed)
Pre-existing semantic errors flagged by `audit/flow.md`, corrected (these were wrong *before* the renumber):
- **§1.3** (`ch01-variable-types`): "Text … treated in Part **IV**" → **Part V** (where text-as-data actually lives).
- **§13.4** (`ch13-text-classification`): the Goose Island case was pointed at the GPT-as-measurement article; retargeted to the **§14.2** case study (the §14.4 reference one line up, to GPT-as-measurement, is correct and was left).
- **§5.1** & **§10.5**: the "artefact / card family map" was cited at **§0.2** (How Data Is Stored); the family actually lives at **§0.4** (The Data-to-Decision Loop, "Figure 4. The artifact family") — both refs retargeted.

Foreword (`ch00-foreword`, "A note on cases"), per PROPOSAL §6:
- Normalized the through-line brand `Bean &amp; Basket` → **Bean & Basket** across all articles (book-toc string already clean). 5 non-brand `&amp;` left as-is (render as `&` in MDX).
- Rewrote the standalone-cases paragraph to **name the six cases that actually run** (market-concentration/ad-spend, RentHop, NY Lottery ZIP, Trump tweets, Goose Island, Amazon reviews) alongside Progresso/Milk/Zillow.
- **BAV repointed, not dropped:** the foreword now states the BAV brand-survey data powers the Fast-Food Perceptual Map studio.
- Added an explicit step-off note: the Part III causal chapters deliberately leave Bean & Basket (clean identification needs field data a coffee chain can't supply).

**Final production build: compiles, typecheck clean, all 78 routes + 80 redirects generate.**

---

## Later pass — Part I consolidation + concept-check removal

**Chapter 1 merged.** §1.1 (`ch01-dataset`, "What Is a Dataset?"), §1.2 (`ch01-data-structures`,
"Data Structures"), and §1.3 (`ch01-variable-types`, "Variable Types and Measurement") were
combined into one chapter, **`ch01-reading-data`** (§1.1, "Grain, Structure, and Measurement"),
with the three titles preserved as `##` sections and the per-topic "executive question" demoted
to `###`. Figures renumbered 1–3; prose preserved verbatim. The §1.3 concept-check quiz was
dropped (see below). Data JSON (including the `case-*.json`) copied into the new folder. Six 301
redirects point the old paths (three `chNN-keyword` legacy slugs + the three per-section slugs)
at `/ch01-reading-data`. `book-toc.ts` + `articleBlurbs` updated; `chapterContent[1]` already
describes the merged chapter and was left as-is.

**Concept-check quizzes removed** (per decision, for a cleaner read): the two `QuizBlock`
"Concept check" modules in **`ch00-data-system`**, plus the ones in **`ch01-variable-types`**
(during the merge), **`ch02-reshaping`**, and **`ch02-data-quality`**. Surrounding prose and
Takeaways kept; unused `QuizBlock` imports removed.

**Chapter 2 polished (kept granular, 6 articles).** Added `###` subheadings for in-page
navigation — joins (+3), reshaping (+2), metrics (+3), data-quality (+3); `ch02-sql`/studio
already multi-`##`. Fixed three stale prose cross-references (pre-consolidation numbers):
`ch02-metrics` "pricing (Chapter 16)" → **Chapter 8** and "joins (Chapter 3)" → **Chapter 2**;
`ch02-joins` "causal analysis — Chapter 12 onward" → **Chapter 5 onward**. Added a `metric card`
tie-in (Part 0 artifact family) to `ch02-metrics`. No teaching content removed beyond the quizzes.
