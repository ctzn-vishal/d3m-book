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
