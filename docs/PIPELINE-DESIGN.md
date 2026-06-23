# Content platform design notes — Tigris → Gallery → Turso

Implementation notes for the next session. Captures (1) the target architecture for
the Tigris→gallery→Turso pipeline, (2) how to store **data-heavy interactive apps**
(e.g. `political-history`), and (3) the **CMS** decision (keep Drizzle Studio vs. build
an internal admin). Companion to [CONTENT-GUIDE.md](./CONTENT-GUIDE.md) and
[REGISTRY-CMS.md](./REGISTRY-CMS.md), which describe the system as it exists today.

---

## 0. Where we are (recap)

Self-contained HTML lives in the Tigris `vishal` bucket (served at
`content.vishalsingh.org`); the hub only references it. Four sources feed a registry:
studios (`lib/studios.ts`), apps (`content/gallery.json`), articles
(`articles/manifest.json` in-bucket), datasets (`datasets/manifest.json`).
`sync-registry.ts` derives all rows → UPSERTs the Turso `gallery` table (preserving
**curated** cols, refreshing **derived** cols) → writes `content/registry.snapshot.json`
(committed fallback). The app reads live Turso (`lib/registry-db.ts`, 2.5 s timeout) and
falls back to the snapshot; the gallery is ISR with a 10-min window. `inject-chrome`
adds the nav pill + OG/canonical to bucket HTML; `gen-story-sitemap` writes the sitemap.

**Known fragilities** (all hit on 2026-06-22):
- `inject-chrome` mutates bucket files **in place** → re-uploading raw HTML silently
  strips the chrome.
- Slug = filename, unvalidated → mis-named re-uploads create duplicates/orphans
  (`childrens_health.html`, `index.html`).
- `sync-registry` never hides orphan rows → a deleted file leaves a 404 card.
- `rebuild-manifest`'s topic guesser knows only 5 of 11 canonical topics → mis-topiced.
- The app reads with the raw `TURSO_AUTH_TOKEN`; a platform/expired token in Vercel
  makes it silently serve the **stale snapshot** (the "live CMS" isn't live).
- No `created_at`/`updated_at` → "last updated" isn't queryable.

A `pnpm verify-content` guard now flags un-injected / unregistered / dangling / non-kebab
items (shipped 2026-06-22).

---

## 1. Content taxonomy & the storage pattern for each

There are really **five** content shapes. Make the storage pattern explicit per shape:

| Shape | Example | Code lives | Data lives | Registry type | Source of truth |
| --- | --- | --- | --- | --- | --- |
| **Article / data story** | `overdose-deaths-2018-2024` | `vishal:articles/<slug>.html` | inline in the HTML | Blog | bucket scan → `articles/manifest.json` |
| **Studio** (interactive, small data) | `presidential-election-atlas` | `vishal:studios/<slug>/index.html` + assets (relative) | relative assets in same prefix | Teaching | `lib/studios.ts` |
| **Data-heavy app** ⭐ | `political-history` | `vishal:studios/<slug>/index.html` | **separate, versioned data prefix** in a data bucket, absolute URL | Teaching or App | `lib/studios.ts` or `content/gallery.json` |
| **External app / publication** | hosted elsewhere | external host | n/a | App | `content/gallery.json` |
| **Dataset** | `/datasets/[id]` | hub page | hub/bucket | Dataset | `datasets/manifest.json` |

The new, important one is the **data-heavy app**, which `political-history` already
models well (see §2).

---

## 2. Storing data-heavy interactive apps (the `political-history` pattern)

`political-history/` is `index.html` (74 KB) + a `data/` tree (~11 MB: 46 JSON files +
29 candidate JPGs; 8.7 MB is county-level returns). The key design decisions it already
gets right — **adopt these as the standard for any data-app**:

1. **Code/data separation.** `index.html` carries no data; it fetches from a base URL.
2. **Overridable absolute base.**
   `const DATA_BASE = window.PH_DATA_BASE || "https://ontopic-public-data.t3.tigrisfiles.io/political-history/v1";`
   The default points at Tigris; `window.PH_DATA_BASE` lets you re-point per environment
   without editing code.
3. **Versioned data prefix** (`/political-history/v1/…`). Bump to `/v2` on a breaking
   data-schema change so old deploys keep working.
4. **Chunked by access pattern.** Data is split per-year (`state/2024.json`,
   `county/returns/2024.json`) and loaded on demand — not one giant blob. Good.
5. **CDN for libraries** (D3, topojson from jsdelivr) — keeps the app file small.

Verified 2026-06-22: the data is live at `ontopic-public-data.t3.tigrisfiles.io` with
`Access-Control-Allow-Origin: *`, so cross-origin fetch from `content.vishalsingh.org`
works. **The data layer for this app is done.**

### Bucket strategy: one bucket or two?

Two viable layouts — pick one and standardize:

- **A. Single bucket (`vishal`), two roles by prefix.** Renderable HTML under
  `studios/`, `articles/`; data under `data/<app>/v<n>/`. App sets
  `window.<APP>_DATA_BASE = "https://content.vishalsingh.org/data/<app>/v1"`.
  *Pro:* one set of creds, one CORS config, one mental model. *Con:* the gallery bucket
  grows large; data + renderable content mixed.
- **B. Dedicated data bucket** (the current `ontopic-public-data`, or a new
  `vishal-data`) with `<app>/v<n>/` prefixes; renderable HTML stays in `vishal`.
  *Pro:* keeps `vishal` lean; data can be large/shared/versioned independently; already
  how `political-history` works. *Con:* a second bucket + CORS to maintain.

**Recommendation: B (dedicated public data bucket).** Data payloads are large, versioned,
and conceptually separate from "things the gallery renders." Keep `vishal` for renderable
HTML + thumbnails only. Requirements for the data bucket: **public read**, **CORS allow**
`https://content.vishalsingh.org` + `http://localhost:3000` (dev), `GET,HEAD`, and a long
`Cache-Control` (data is immutable per version — `public, max-age=31536000, immutable`).

### Integrating this specific app into the gallery (concrete steps)

Treat it as a **studio (Teaching)** — it's an interactive explorable like the existing
election studios, and the studio path handles hosting + preview + chrome cleanly. (If you'd
rather class it as a standalone product, register it as an **App** via
`content/gallery.json` instead — same result, different filter.)

1. Add `<meta name="description">` to `index.html` (currently missing — needed for the
   gallery card text + OG). ~120–155 chars.
2. *(Optional, recommended)* Add a `Dataset` JSON-LD block — this app is exceptionally
   data-rich (MEDSL county returns 1976–2024, ANES) and a strong Google Dataset Search
   candidate. See CONTENT-GUIDE §3.
3. Upload `index.html` → `vishal:studios/political-history/index.html`.
4. Create + upload a preview image → `vishal:studios/political-history/preview.jpg`.
5. Add an entry to `lib/studios.ts`:
   ```ts
   {
     slug: 'political-history',
     title: 'The American Political Almanac · 1976–2024',
     blurb: 'An interactive atlas of U.S. presidential elections — national, state, and county returns, demographics, and ANES survey shifts, 1976–2024.',
     domain: 'Elections',                 // → topic "Politics & Elections" via taxonomy.ts
     methodTags: ['maps', 'time series', 'elections'],
     relatedSlug: '<paired chapter article slug, if any>',
     preview: { src: 'preview.jpg' },
     accent: '#7c3aed',
   }
   ```
6. Run the publish steps: `pnpm sync-registry && pnpm inject-chrome && pnpm gen-story-sitemap`,
   then `pnpm verify-content`, commit the snapshot, push.
7. The data keeps loading from `ontopic-public-data/political-history/v1` (no change). If
   you consolidate to layout A later, mirror `data/` into the data bucket and set
   `window.PH_DATA_BASE` accordingly.

> Note: `inject-chrome` adds a fixed top-left pill over the app — fine for a full-screen
> interactive. Confirm it doesn't cover an app control; if it does, the app can reserve a
> top-left margin or we tweak the pill position.

---

## 3. Pipeline hardening (the Tier-1/2 work)

In rough priority order. Each is small; together they remove every failure class we hit.

### 3.1 One orchestrator command (Tier 1)
Add `pnpm publish` that runs the steps in the correct order and aborts on failure, so a
step can't be skipped:
```jsonc
// package.json
"publish-content": "pnpm rebuild-manifest && pnpm sync-registry && pnpm inject-chrome && pnpm gen-story-sitemap && pnpm verify-content"
```
(Name it `publish-content` to avoid clashing with npm's `publish` lifecycle.)

### 3.2 Auto-hide orphans in `sync-registry` (Tier 1)
Today orphan rows (source file gone) stay `published` → 404 cards. Soft-delete them:
```ts
// after computing `orphans` in sync-registry.ts
for (const id of orphans) {
  await db.execute({ sql: "UPDATE gallery SET status='hidden' WHERE id=? AND status!='hidden'", args: [id] });
}
console.log(`Hid ${orphans.length} orphan row(s).`);
```
Keeps the row (curation preserved) but removes it from the gallery (`WHERE status='published'`).
This alone would have auto-fixed the `index` dangling row.

### 3.3 Slug / filename validation in `rebuild-manifest` (Tier 2)
Prevent mis-named uploads from becoming stories:
- **Skip reserved names**: ignore `articles/index.html` (and any `index.html`).
- **Warn on non-kebab** slugs (underscores, uppercase).
- **Detect duplicate `<title>`** against existing items → warn "possible mis-named
  re-upload of <existing-slug>" instead of silently adding a dup.
This would have caught both `childrens_health` and `index.html`.

### 3.4 Kill the in-place-mutation fragility (Tier 2) — pick one
The root cause of "re-upload strips chrome." Two designs:
- **B1. Source/published split in the bucket.** Authors upload raw HTML to
  `src/articles/<slug>.html`; the pipeline writes the injected copy to
  `articles/<slug>.html`. Re-uploads only touch `src/`, so chrome can never be lost;
  `inject-chrome` becomes a pure build step (`src` → published). *Lowest-infra, recommended.*
- **B2. Inject at the edge.** Keep pure source in the bucket; a Next middleware / CF
  Worker injects the pill + OG on the fly when serving. *Most robust, but adds a serving
  layer and request-time cost.*

Until one ships, `verify-content` is the safety net — run it after every upload (and in CI).

### 3.5 Align the topic taxonomy (Tier 3)
`rebuild-manifest`'s keyword guesser only emits 5 of the 11 canonical topics in
`lib/taxonomy.ts` (why the PCA piece landed in "Public Opinion"). Either import `TOPICS`
and broaden the guesser, **or** stop guessing — leave a new article's `topic` null and set
it once in the CMS (topic is a curated column, so it sticks). Recommend the latter: less
magic, fewer wrong guesses.

### 3.6 Add `created_at` / `updated_at` (Tier 3)
```sql
ALTER TABLE gallery ADD COLUMN created_at TEXT DEFAULT (datetime('now'));
ALTER TABLE gallery ADD COLUMN updated_at TEXT DEFAULT (datetime('now'));
```
Set `updated_at = datetime('now')` in the UPSERT's `DO UPDATE` clause. Unlocks
queryable "last updated" (which we lacked), recency sort, and "new" badges. Mirror the two
columns in `db/schema.ts` so Drizzle Studio shows them.

---

## 4. The CMS decision — keep Drizzle Studio, or build our own?

**Your objectives are modest and well-bounded:** set display **order**, **hide** items,
toggle **featured**, occasionally fix **topic/title**. These map exactly to the curated
columns `sort`, `status`, `featured`, `topic`. That scale (≈110 rows, a handful of edits)
should drive the choice — don't over-build.

### Options, with trade-offs

**1. Drizzle Studio (status quo).** `pnpm studio` → dropdowns/checkboxes → writes Turso.
- ➕ Zero code to maintain; schema-aware; already works; safe (CHECK constraints).
- ➖ Local-only (must run on your dev machine; not phone/anywhere); generic grid (no
  drag-to-reorder; you type `sort` numbers); needs the DB token locally; single-user.

**2. Turso web dashboard.** Web, anywhere.
- ➕ No local tooling.
- ➖ Free-text cells (no dropdowns), SQL-ish, weakest UX. Not recommended as primary.

**3. Curation npm scripts** (small stepping stone). Tiny scripts over `_turso.mjs`:
`pnpm curate:hide <id>`, `curate:show <id>`, `curate:top <id>`, `curate:order <id> <n>`,
`curate:feature <id>` — each writes Turso **and** pings `/api/revalidate` so changes show
in seconds, not 15–20 min.
- ➕ ~30 min to build; scriptable/batchable; instant; no UI to maintain; kills the lag.
- ➖ Still CLI/local; not a visual reorder.

**4. Internal `/admin` page (build our own CMS).** A password-protected route in the Next
app: lists gallery rows, **drag-to-reorder** (writes `sort`), one-click hide/publish,
featured toggle, inline topic/title/description edit → server action writes Turso →
on-demand revalidate.
- ➕ Best UX (drag-reorder, filtered views); web + mobile; instant; you own it; naturally
  forces fixing the **server-side DB token** (§5), which also fixes live reads.
- ➖ ~½–1 day to build; auth to secure; another surface. Needs a DB-scoped token in the
  server runtime.

**5. Headless CMS** (Sanity/Payload/Directus/Keystone). 
- ➖ Overkill for one small table; new service/dependency/cost; you'd sync or migrate the
  registry. **Not recommended** at this scale.

### Recommendation

- **If you curate occasionally, from your laptop:** **keep Drizzle Studio** and add the
  **curation scripts (#3)** for the common ops + instant revalidate. Lowest effort,
  removes the only real pain (the 15–20 min lag and typing sort numbers). This is the
  pragmatic default.
- **If you curate often, want drag-to-reorder, or edit from your phone:** **build the
  `/admin` page (#4).** It's the right "own CMS," and it pairs with the live-token fix so
  the gallery is reliably live. Worth it only if you'll actually use it regularly.
- **Skip headless.** Too heavy for "order + hide + feature."

Decision rule: *frequency × need-to-edit-away-from-dev-machine*. Low → Studio + scripts.
High → `/admin`.

### `/admin` sketch (if you go that route)
- Route `app/admin/page.tsx` (server component) lists rows from Turso; a client component
  renders a sortable list (`@dnd-kit/sortable`) + row controls.
- Mutations via **server actions** (or `app/api/admin/route.ts`) using a **DB-scoped**
  token from server env; validate against the same CHECK vocabulary.
- Auth: simplest is Vercel **Password Protection** on the `/admin` path, or a single
  `ADMIN_SECRET` cookie check in middleware; upgrade to NextAuth later if multi-user.
- After each write: `revalidatePath('/')` (or `/gallery`) so edits show immediately.
- The committed snapshot stays the fallback; add a "Sync snapshot" button that runs the
  read-back + commit (or do it on a schedule, §5).

---

## 5. Make the live CMS actually live (do this regardless of §4 choice)

1. **Robust DB token.** `lib/registry-db.ts` uses the raw `TURSO_AUTH_TOKEN`; if Vercel's
   is a platform or expired token, the site silently serves the stale snapshot. Two fixes
   (do at least one):
   - Put a **non-expiring DB-scoped** token in Vercel (`pnpm mint-db-token` without an
     expiration), **or**
   - Move the platform→DB minting (already in `scripts/_turso.mjs`) into the **server
     runtime** so the app self-heals when given a platform token. Best long-term.
   Then add a tiny **health probe** (e.g. `/api/registry-source` returning `live|snapshot`)
   so you can tell at a glance whether edits are reaching the site.
2. **Instant updates.** The 15–20 min lag is the ISR window. Trigger on-demand
   `POST /api/revalidate?secret=…` from the CMS / curation scripts / `/admin` so edits
   show in seconds.
3. **Snapshot freshness.** Curation in Turso doesn't reach the committed snapshot until
   `sync-registry` reruns + commits. Add a **scheduled nightly** `sync-registry` + commit
   (cron / GitHub Action / `pnpm schedule`) so the fallback never drifts far.

---

## 6. Suggested implementation order (next session)

1. **Pipeline safety (fast):** `publish-content` orchestrator (§3.1) + orphan auto-hide
   (§3.2) + slug validation (§3.3). Wire `verify-content` into CI.
2. **Live reliability:** DB-token fix + health probe + instant revalidate (§5.1–5.2).
3. **CMS:** add curation scripts (§4-#3); decide Studio-vs-`/admin` by the decision rule.
4. **`political-history`:** ship it as a studio (§2). Good first exercise of the data-app
   pattern + the new `publish-content` command.
5. **Polish:** `created_at/updated_at` (§3.6); topic alignment (§3.5); auto OG/thumbnail
   via `next/og`; scheduled snapshot sync (§5.3); then consider the source/published split
   or edge injection (§3.4) to kill the re-upload fragility for good.

---

## 7. Open decisions for Vishal

- **Data bucket:** consolidate into `vishal` (layout A) or keep a dedicated data bucket
  (layout B, recommended)?
- **`political-history` class:** Teaching/studio (recommended) or App?
- **CMS:** Drizzle Studio + curation scripts (recommended for occasional curation) or build
  `/admin` (if frequent / mobile / drag-reorder)?
- **Re-upload fragility:** adopt the `src/`→published split (B1, recommended) or edge
  injection (B2), or rely on `verify-content` for now?

---

## 8. Decisions made (2026-06-23) + `/admin` v1 spec

**Shipped this session:** the full *American Political Almanac* is live as an **App**
(`vishal:apps/political-history/index.html`; data stays at
`ontopic-public-data/political-history/v1`). A first-class **`apps/` bucket prefix** was
added to `inject-chrome` + `verify-content`; sitemap/sync-registry needed no change
(they key off the snapshot href, which must be the `content.vishalsingh.org` bucket URL).
`presidential-election-atlas` was reclassified **App → Blog**. This is the reference
implementation of the §2 data-app pattern — follow it for the next data-heavy app.

**Resolved (was §7):**
- **CMS:** build an internal **`/admin`** (frequent edits + growing catalog justify it
  over Studio/scripts).
- **v1 scope:** **metadata curation of existing rows only** — order (`sort`), hide/publish
  (`status`), `featured`, `type`, `topic`, `title`, `description`, `tags`. No content
  editing; no row create/delete. **Booklets deferred to v2.**
- **Booklets:** **collection overlay + iframe** (a `collection` + `collection_items(order)`
  table over existing rows, rendered at `/report/[slug]` with each member in an iframe).
  **Do NOT add a 5th `report` type** — a booklet is a container, not an artifact class, so
  the 4-way `type` enum stays as-is.
- **Auth:** **shared password** (a secret checked in `middleware.ts`, or Vercel Password
  Protection on `/admin`). Upgrade to NextAuth later only if multiple editors appear.
- **Data bucket:** keep the dedicated public data bucket (layout B) — `political-history`
  already proves it.

### `/admin` v1 — build outline (metadata-only)
1. **Server-side DB token (prerequisite — also fixes §5.1).** `/admin` must WRITE to Turso,
   and the live read currently 401s on a platform token. Add `lib/turso-admin.ts`
   (server-only) that connects with a **DB-scoped** token — reuse the platform→DB minting in
   `scripts/_turso.mjs` so a platform token self-mints, or require a non-expiring DB token in
   Vercel. Use it for both `/admin` writes and (ideally) `lib/registry-db.ts` reads.
2. **Auth.** `middleware.ts` guards `/admin` + `/api/admin/*`: a tiny login form posts
   `ADMIN_SECRET`, set an httpOnly cookie, verify it in middleware. (Or enable Vercel
   Password Protection on the path and skip the form.)
3. **Route.** `app/admin/page.tsx` (server component) reads ALL rows (incl. hidden/draft)
   via the admin connection → passes to a client table.
4. **Client UI.** A sortable list (`@dnd-kit/sortable`) grouped by `featured`; per row:
   `status` dropdown, `featured` checkbox, `type` dropdown (App/Teaching/Blog/Dataset),
   `topic` dropdown (`lib/taxonomy` `TOPICS`), inline `title`/`description`/`tags` edit.
   Dropdown vocabularies come from the same lists the CHECK constraints enforce.
5. **Mutations.** Server actions (or `app/api/admin/route.ts`) write Turso, validating against
   the CHECK vocabulary; on success `revalidatePath('/')` (+ gallery routes) and/or POST the
   existing `/api/revalidate` so edits show in seconds, not the 10-min ISR window.
6. **Snapshot caveat.** Serverless can't `git commit`, so `/admin` updates **live Turso**
   only; the committed `registry.snapshot.json` fallback is still refreshed by
   `pnpm sync-registry` + commit (run locally or via a scheduled GH Action — §5.3). Document
   that distinction in the admin UI ("changes are live; snapshot syncs nightly").

### `/admin` v2 — booklets (deferred)
- Tables: `collection(id, slug, title, description, accent, featured, status, sort,
  created_at, updated_at)` + `collection_items(collection_id, item_id REFERENCES gallery(id),
  position, label?)` with `UNIQUE(collection_id, item_id)`; add CHECK constraints, mirror in
  `db/schema.ts`, serialize into the snapshot, extend `sync-registry` + `registry-db`.
- Route `app/report/[slug]/page.tsx`: ordered TOC + each member in an `<iframe>` (relative
  paths/CSS/JS resolve against the member's own URL — no rewriting) + prev/next + progress.
- Admin: a booklet editor (create collection, drag members into order). Open question to
  settle then: whether some members should be report-only (needs an `unlisted`/`member`
  status so they resolve in the booklet but stay out of the main gallery grid).
- Keep the **pre-stitched single HTML** approach (§ playlist Option B) in reserve ONLY for a
  future "export booklet to PDF/print" feature.

---

## 9. BUILT (2026-06-23 session) — §3, §5, §8 v1 shipped

Everything below is implemented, typechecked, `next build`-clean, run against prod, and
verified locally (login → live read of 114 rows → write persists + bumps `updated_at` →
reverted clean). v2 booklets remain deferred.

**§3 Pipeline hardening**
- **§3.1** `pnpm publish-content` orchestrator added to `package.json` (aborts on failure).
- **§3.2** `sync-registry.ts` now **auto-hides orphans** (soft-delete `status='hidden'`,
  curation preserved).
- **§3.3** `rebuild-manifest.mjs` **validates slugs**: skips reserved (`index`/`manifest`),
  warns on non-kebab, warns on duplicate `<title>` (mis-named re-upload).
- **§3.5** Topic guesser **removed** — new articles get no topic; set once in `/admin`.
- **§3.6** `created_at`/`updated_at` added (idempotent `pnpm migrate-timestamps`; mirrored in
  `db/schema.ts`, `migrate-gallery.mjs`, `sync-registry.ts` CREATE + ALTER guard, snapshot,
  `RegistryItem`). `updated_at` only bumps on a **real** content change (JS `rowChanged()`),
  not on every sync.

**§5 Live reliability**
- **§5.1** `lib/turso-admin.ts` — server-only connection that **self-mints** a DB-scoped token
  from a platform token; `lib/registry-db.ts` now reads through it (so live reads self-heal),
  bounded to 4 s with snapshot fallback. Health probe **`GET /api/registry-source`** →
  `live|snapshot`.
- **§5.2** `/admin` writes call `revalidatePath('/')` for instant updates.
- **§5.3** Nightly snapshot sync GitHub Action (`.github/workflows/sync-snapshot.yml`) — needs
  the repo secrets it documents.

**§8 `/admin` v1 (metadata-only CMS)**
- Auth: shared-password (`ADMIN_SECRET`) → httpOnly cookie, verified in `middleware.ts`
  (guards `/admin` + `/api/admin/*`, fails closed). `lib/admin-auth.ts` (Web-Crypto, edge-safe),
  `app/api/admin/login|logout`, `app/admin/login/page.tsx`.
- UI: `app/admin/page.tsx` (server, reads all rows) + `components/admin/AdminTable.tsx` (client):
  `@dnd-kit` drag-reorder, ⭐ feature toggle, type/status/topic dropdowns, inline
  title/description/tags, filter. Mutations: `app/admin/actions.ts` server actions (re-check
  auth, validate against the CHECK vocabulary, write Turso, revalidate). Vocab/types in
  `app/admin/types.ts`.

**Hardening from an adversarial review (same session, 14 confirmed findings fixed):**
- **`sync-registry` mass-blackout (HIGH):** a transient Tigris read used to return an empty
  source → the orphan sweep would hide the whole Blog+Dataset catalog and the nightly Action
  would commit it. `bucketJson` now throws on real failures (only a genuine 404 = "gone") so the
  sync **aborts before** the sweep; plus a **mass-hide safety valve** (refuse > max(5, 25%)).
- **Drag reorder vs featured-first (MED):** the optimistic list now re-groups featured-first
  (the same order the gallery/reload use), so cross-boundary drags don't silently snap back.
- **Token self-heal (MED):** `turso-admin` re-mints on a 12 h TTL and on auth error (`withDb`
  retry), so a warm instance never sticks on an expired 1-day token.
- **Optimistic revert (MED):** field edits revert per-field on the latest state; inputs are
  value-keyed so a failed save reseeds the DOM; reorder revert preserves concurrent edits.
- **Live-vs-snapshot (LOW):** an all-unpublished live DB no longer falls back to the snapshot
  (null = unreachable vs `[]` = empty-but-live now distinguished).
- **Nightly Action churn (LOW):** the commit step ignores the date-only `generated` line.
- **Auth hygiene (LOW):** login compares fixed-length hashes (no length leak); login/logout
  reject cross-origin POSTs (CSRF). Slug dup-detection now also catches same-batch new-vs-new.
- *Noted, not changed:* the shared-password cookie is an intentional single-curator design
  (§8); the topic-vocabulary edge (`domainToTopic` → non-canonical) is latent (all current
  studio domains map).

**Known follow-up — RESOLVED (2026-06-23):** the stray `studios/business_reviews_demo/`
upload that failed `verify-content` was an abandoned foreign-pipeline artifact (a GABRIEL
text-as-data case-builder demo: self-contained `site/index.html` with data inlined, a nested
`site/`+`data/` layout, synthetic SaaS-review corpus, never in `lib/studios.ts` or the
snapshot). A sibling `studios/business_reviews_full/` from the same upload batch was also
present. Both prefixes were **deleted** from the `vishal` bucket and `verify-content` now
exits 0. Lesson for next time: that text-as-data case-builder writes to
`studios/<case>/site/index.html` + `studios/<case>/data/…`, which is NOT the gallery's studio
layout (`studios/<slug>/index.html`) — point its output at a scratch/staging bucket, not the
public `vishal` gallery bucket. (Note: Tigris `ListObjectsV2` lagged badly during cleanup;
per-object `HeadObject`/`GetObject` are the strongly-consistent source of truth.)
