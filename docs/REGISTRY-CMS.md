# Editing the gallery (Turso as a CMS)

The gallery is driven by one table — **`gallery`** in Turso (db `d3m`). It's the
single source of truth for every item (studios, data stories, apps, datasets):
their type, order, what's featured, topic, etc. Edit rows there and the site
updates — no code changes.

A committed snapshot (`content/registry.snapshot.json`) is the build-time fallback,
so the site always renders even if Turso is briefly unreachable. The app reads live
Turso (lib/registry-db.ts) and falls back to the snapshot.

---

## The columns you'll edit

| Column | What it does |
| --- | --- |
| `type` | **App / Teaching / Blog / Dataset** — the primary gallery filter. (dropdown) |
| `featured` | `true` floats the item to the **top** of the gallery. (checkbox) |
| `sort` | Lower number = earlier, *within* the same featured group. Use it to order the first few. |
| `status` | `published` (visible), `hidden` (soft-removed), `draft`. (dropdown) |
| `topic` | Secondary filter chip (e.g. "Health & Mortality"). Keep to the controlled list in `lib/taxonomy.ts` (10 subjects; `pnpm curate-new` proposes candidate new ones as the catalog grows). |
| `teaching` | Paired book chapter/article slug — makes it show in that chapter's "Featured" rail. |
| `title` / `description` / `tags` | Card text. `tags` is a JSON array string, e.g. `["data story","politics"]`. |
| `href` / `thumbnail` / `accent` / `domain` | Usually leave as-is (set from the content source). |

**To control the first few rows:** set `featured = true` on the ones you want up top,
and give them `sort` 0, 1, 2, … in the order you want. Everything else follows by
`featured`, then `sort`, then title.

Valid values are enforced by **CHECK constraints** in the DB — `type`, `status`, and
the boolean flags reject anything off-list, so a typo can't break the gallery.

---

## Editing with `/admin` (the built-in CMS — recommended)

The app ships a password-protected admin at **`/admin`** (e.g.
`https://vishalsingh.org/admin`) — the primary curation surface. It lists every
row (including `hidden`/`draft`) and lets you, with no code:

- **Drag to reorder** (writes `sort`). Clear any filter first — reordering applies
  to the full list.
- **⭐ Feature / unfeature** (floats an item to the top of the live gallery).
- Change **type**, **status**, and **topic** from dropdowns (the same vocabularies
  the DB CHECK constraints enforce, so you can't pick an invalid value).
- Edit **title**, **description**, and **tags** (comma-separated) inline.
- Filter by title / id / topic / tag, or by type, to find a row fast.

Every edit writes **live Turso** and revalidates the gallery, so changes show in
**seconds** (not the 10-min ISR window). The committed snapshot fallback is *not*
touched by `/admin` (serverless can't `git commit`) — it's refreshed by
`pnpm sync-registry` + commit, or the nightly GitHub Action
(`.github/workflows/sync-snapshot.yml`). v1 is **metadata-only**: no content
editing and no create/delete of rows.

### Setup (one-time)

1. **`ADMIN_SECRET`** — the shared admin password. Set it in `book-template/.env.local`
   (local) **and** Vercel → Settings → Environment Variables (Production). With it
   unset, `/admin` is **locked** (fails closed) and sign-in always fails.
2. **A working `TURSO_AUTH_TOKEN`** — `/admin` must *write* to Turso. The server
   self-heals a platform token into a DB-scoped one (`lib/turso-admin.ts`), but a
   non-expiring DB-scoped token (`pnpm mint-db-token`) is the robust choice. The
   admin page shows a green **“Live Turso · N rows”** badge when connected, or a red
   banner if it can't write.
3. Visit `/admin`, enter the password, curate. Use **Sign out** to clear the cookie.

> Health check: `GET /api/registry-source` returns `{"source":"live"}` when the
> site is reading live Turso, or `"snapshot"` when it has fallen back (token bad /
> DB down) — a quick way to tell whether your edits are reaching the site.

---

## Editing with dropdowns — Drizzle Studio (alternative)

The Turso web dashboard (app.turso.tech) is fine for quick boolean toggles and ad-hoc
SQL, but it shows `type`/`status` as **free-text** cells. For real **dropdowns** use
**Drizzle Studio**, which reads the schema in [`db/schema.ts`](../db/schema.ts):

```bash
cd book-template
pnpm studio          # → serves on 127.0.0.1:4983, opens https://local.drizzle.studio
```

In Studio, open the `gallery` table:
- `type` and `status` render as **dropdowns** of the allowed values.
- `featured` / `external` / `open_in_new_tab` render as **checkboxes**.
- Edit a cell, commit — it writes straight to the live Turso table.

> Requires a **DB-scoped token** in `book-template/.env.local` (see below). The schema
> in `db/schema.ts` must stay in sync with the table if columns ever change.

---

## One-time setup: the DB-scoped token

The `TURSO_AUTH_TOKEN` in the repo-root `.env` is an **org/platform** token (scripts now read `book-template/.env.local`, which can hold a direct DB token) — the database
rejects it (401). Drizzle Studio **and** the live site on Vercel need a **DB-scoped**
token. Generate one:

```bash
cd book-template
pnpm mint-db-token      # prints a DB-scoped token (does not echo it anywhere else)
```

Paste the printed token as `TURSO_AUTH_TOKEN`:
1. **`book-template/.env.local`** (gitignored) — so `pnpm studio` and local dev read live Turso.
2. **Vercel → Project → Settings → Environment Variables (Production)** + redeploy —
   so the live site reflects your edits. Also set `TURSO_DATABASE_URL` =
   `libsql://d3m-vsingh.aws-us-east-2.turso.io`.

If Vercel has the wrong (platform) token, the site silently serves the **snapshot**
(stale, but working) and logs:
`[registry] Turso auth failed (401) — … Run pnpm mint-db-token …`.

---

## How edits go live

- The home gallery re-reads Turso on an **ISR interval of 10 minutes**, so edits
  appear within ~10 min automatically (when Vercel has the DB token).
- For an **instant** refresh: `POST https://vishalsingh.org/api/revalidate?secret=<REVALIDATE_SECRET>`
  (set `REVALIDATE_SECRET` in Vercel first).
- The committed snapshot is only the fallback. To also refresh it (recommended after
  big changes, so the fallback isn't stale): `pnpm sync-registry` then commit
  `content/registry.snapshot.json`.

---

## Good to know

- **Re-running `pnpm sync-registry` won't clobber your edits.** It preserves the
  curated columns already in Turso (`type`, `title`, `description`, `topic`, `tags`,
  `teaching`, `featured`, `status`, `sort`) and only refreshes derived columns
  (`href`, `thumbnail`, `domain`, …) from the content source, then inserts any new
  content. So curate freely in Studio; syncing new content is safe.
- **Hiding an item:** set `status = hidden` (keeps the row; removes it from the
  gallery). Use `draft` for not-yet-ready items.
- **New content** (studios / data stories) gets added by the publish pipeline — see
  [CONTENT-GUIDE.md](./CONTENT-GUIDE.md).
