# Authoring new Tigris content (SEO + Google Dataset Search)

How to publish a new **data story** or **studio** to the Tigris `vishal` bucket so it
shows up in the gallery and is set up correctly for search engines and Google
Dataset Search.

The content is self-contained HTML served from `content.vishalsingh.org`. The hub
(`vishalsingh.org`) only *references* it. **Navigation chrome (the `↖︎ Vishal Singh`
pill) is injected per-bucket by `inject-chrome`, not baked into the source HTML** —
so the same HTML file can live on two different sites and still get the right nav in
each place. Keep your source HTML **site-neutral**: don't hard-code a `vishalsingh.org`
header into it.

---

## 1. What you author vs. what the pipeline injects

| In each HTML file (you write it) | Injected automatically by `inject-chrome` |
| --- | --- |
| `<title>` — concise, descriptive (≤ ~60 chars) | `↖︎ Vishal Singh` nav pill (reads `?from=` → "← Back to the book") |
| `<meta name="description">` — 1–2 sentences (~120–155 chars) | `og:title` / `og:description` / `og:image` |
| **Dataset JSON-LD** (data stories with a data source — §3) | `og:url`, `twitter:card`, `<link rel="canonical">` |

So you only need to write a good **`<title>`**, a good **`<meta name="description">`**,
and (for data-backed stories) a **Dataset JSON-LD** block. The title/description feed
both the gallery (auto-extracted into the manifest) **and** the Open Graph tags, so
write them well. `inject-chrome` adds OG/canonical from the registry — **don't
hand-write `og:`/`canonical` tags yourself** or you'll get duplicates.

> Canonical note: `inject-chrome` sets `<link rel="canonical">` to the
> `content.vishalsingh.org` copy. If a file's canonical home is actually the *other*
> site, set the canonical there and treat the bucket copy as secondary.

---

## 2. Bucket layout

```
vishal (bucket, public, served at content.vishalsingh.org)
├── articles/<slug>.html              ← a data story (Blog)
├── articles/<slug>/_thumb.webp       ← its gallery thumbnail (optional but recommended)
├── studios/<slug>/index.html         ← a studio (Teaching)
├── studios/<slug>/preview.jpg|png    ← its gallery thumbnail
└── studios/<slug>/...                ← any assets the studio HTML references (relative paths)
```

Slugs are lowercase-kebab (`loneliness-geography`). Upload with the Tigris CLI
(`tigris`/`t3`), the Tigris dashboard, or any S3 tool pointed at the `vishal` bucket
(the repo scripts read creds from `book-template/.env.local`; the bucket name is
centralized in `scripts/pipeline-config.mjs`). Bulk drops of many files at once are
fine — the pipeline ingests them all in one pass.

---

## 3. Google Dataset Search — Dataset JSON-LD

To make a data story's **underlying dataset** eligible for
[Google Dataset Search](https://developers.google.com/search/docs/appearance/structured-data/dataset),
embed a `schema.org/Dataset` block in the HTML `<head>`. (The `/datasets/[id]` hub
pages already emit this; data stories that have a "Data Source" section should too.)

**Required:** `name`, `description` (must be **50–5000 characters**).
**Strongly recommended:** `distribution` → `DataDownload` (`contentUrl` + `encodingFormat`),
`creator`, `license`, `keywords`, `url`, `sameAs` (link to the original source),
`isAccessibleForFree`, plus `temporalCoverage` / `spatialCoverage` / `variableMeasured`
when they apply.

Copy-paste template (fill the `<...>` placeholders; escape real newlines in
`description` as `\n`):

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Dataset",
  "name": "<short dataset name>",
  "description": "<50–5000 chars: what it measures, units, coverage, and where it comes from>",
  "url": "https://content.vishalsingh.org/articles/<slug>.html",
  "sameAs": "<URL of the original/primary source>",
  "identifier": "<DOI or stable id, if any>",
  "keywords": ["<topic>", "<place>", "<method>"],
  "license": "https://creativecommons.org/licenses/by/4.0/",
  "isAccessibleForFree": true,
  "creator": {
    "@type": "Person",
    "name": "Vishal Singh",
    "affiliation": { "@type": "Organization", "name": "NYU Stern School of Business" }
  },
  "temporalCoverage": "1976/2024",
  "spatialCoverage": "United States",
  "variableMeasured": ["<variable 1>", "<variable 2>"],
  "distribution": [{
    "@type": "DataDownload",
    "encodingFormat": "text/csv",
    "contentUrl": "<direct URL to the data file, if you publish one>"
  }]
}
</script>
```

Notes:
- Put **one** `Dataset` block per page describing the source data. Use `citation` only
  to point at a *related paper*, not the dataset itself.
- Indexing also relies on the page being in a sitemap (`gen-story-sitemap` handles
  that — §4) and reachable (it is, publicly, from `content.vishalsingh.org`).
- A downloadable `distribution` (a real `contentUrl`) materially helps eligibility.
  If the story doesn't expose a file, you can still publish the `Dataset` with the
  other fields and link the source via `sameAs`.

---

## 4. Publish pipeline

All commands run from `book-template/` and read creds from **`book-template/.env.local`**
(Tigris S3 + Turso, plus `ANTHROPIC_API_KEY` for curation — see [REGISTRY-CMS.md](./REGISTRY-CMS.md)).

> **One command — `pnpm ship`:** runs the whole ingest chain and then proposes
> curation. It is `publish-content` (`rebuild-manifest → sync-registry → inject-chrome
> → gen-story-sitemap → verify-content`, aborting on the first failure) followed by
> `pnpm curate-new` (DRY). Then you review, apply, and commit — the two human gates:
>
> ```
> pnpm ship                                         # ingest a (bulk) drop + propose topic/tags
> #   → review scripts/.curate/proposals.json
> APPLY=1 pnpm curate-new && pnpm sync-registry      # write the approved curation
> git add content/registry.snapshot.json && git commit -m "…" && git push   # deploy
> ```
>
> **Curation is automated.** New articles come in with **empty tags and no topic**;
> `pnpm curate-new` reads each one and proposes a **topic** (from the 10-topic subject
> list in `lib/taxonomy.ts`) and **tags** (from the 38-tag method/chart/data vocabulary
> in `lib/tag-vocabulary.ts`), constrained to those controlled lists, and flags a
> candidate **new** topic when none fit (the topic list is meant to grow). Review the
> `proposals.json`, then `APPLY=1`. You can still hand-edit any row in **`/admin`**.
> Defaults to the cheap `claude-haiku-4-5` model; override with `CURATE_MODEL`.

### A new data story (Blog)
1. Upload `articles/<slug>.html` (+ `articles/<slug>/_thumb.webp`) to the bucket.
2. `pnpm rebuild-manifest` — adds it to `articles/manifest.json`, auto-extracting the
   `<title>`/`<meta description>` you wrote (existing curation is preserved).
3. `pnpm sync-registry` — inserts it into the Turso `gallery` table as a **Blog** row
   and rewrites `content/registry.snapshot.json`.
4. `pnpm inject-chrome` — adds the nav pill + OG/canonical to the new HTML.
5. `pnpm gen-story-sitemap` — refreshes `content.vishalsingh.org/sitemap.xml`.
6. `pnpm curate-new` — proposes a **topic + tags** from the controlled vocabularies;
   review `scripts/.curate/proposals.json`, then `APPLY=1 pnpm curate-new && pnpm
   sync-registry`. Set `featured` / `teaching` (paired chapter) in `/admin`.
7. Commit the updated `content/registry.snapshot.json` and push to `main` (deploys).
   If Vercel has a DB-scoped Turso token, the new row also appears via ISR (≤10 min)
   without a redeploy.

### A new studio (Teaching)
1. Upload `studios/<slug>/index.html` (+ `preview.jpg`/`preview.png` + any relative
   assets) to the bucket.
2. Add the entry to `lib/studios.ts` (slug, title, blurb, domain, `methodTags`,
   `relatedSlug` = the paired chapter article slug, `preview.src`, `accent`). This is
   the studio's metadata source and drives the in-book "Interactive studios" rails.
3. `pnpm sync-registry` — inserts it as a **Teaching** row + rewrites the snapshot.
4. `pnpm inject-chrome` — pill + OG/canonical.
5. `pnpm gen-story-sitemap`.
6. Commit `content/registry.snapshot.json` (+ `lib/studios.ts`) and push to `main`.

> `pnpm sync-studios` was the one-time `public/studios → bucket` migration; for a new
> studio just upload it to the bucket directly.

---

## 5. Pre-publish checklist

- [ ] `<title>` is concise and descriptive.
- [ ] `<meta name="description">` is written (≈120–155 chars).
- [ ] No hard-coded site nav / no hand-written `og:`/`canonical` (inject adds them).
- [ ] Data-backed story → `Dataset` JSON-LD added (`name` + 50–5000-char `description`).
- [ ] Thumbnail uploaded (`_thumb.webp` for stories, `preview.*` for studios).
- [ ] Ran `pnpm ship` (or the per-step chain; studios also need a `lib/studios.ts` entry).
- [ ] Reviewed `scripts/.curate/proposals.json` → `APPLY=1 pnpm curate-new` → `pnpm sync-registry`.
- [ ] Committed the updated `content/registry.snapshot.json` and deployed.
