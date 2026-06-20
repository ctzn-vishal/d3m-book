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
| `topic` | Secondary filter chip (e.g. "Public Health"). Keep to the existing topic vocabulary. |
| `teaching` | Paired book chapter/article slug — makes it show in that chapter's "Featured" rail. |
| `title` / `description` / `tags` | Card text. `tags` is a JSON array string, e.g. `["data story","politics"]`. |
| `href` / `thumbnail` / `accent` / `domain` | Usually leave as-is (set from the content source). |

**To control the first few rows:** set `featured = true` on the ones you want up top,
and give them `sort` 0, 1, 2, … in the order you want. Everything else follows by
`featured`, then `sort`, then title.

Valid values are enforced by **CHECK constraints** in the DB — `type`, `status`, and
the boolean flags reject anything off-list, so a typo can't break the gallery.

---

## Editing with dropdowns — Drizzle Studio (recommended)

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

The `TURSO_AUTH_TOKEN` in the repo `.env` is an **org/platform** token — the database
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
