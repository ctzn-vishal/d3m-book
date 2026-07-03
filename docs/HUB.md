# vishalsingh.org — hub & spokes

How content is served, and how to add new **mini-apps** so they fit the hub.

## Tiers
- **In the hub app** (this repo): `/` gallery, `/teaching` cover + book articles, `/studios/*` viewer, `/research`, `/about`. Plain Next routes.
- **Spokes** (independent): standalone apps + static data stories in their own
  repos/deployments, surfaced through the gallery. Nothing is absorbed into a
  monorepo — spokes stay independent on purpose (easier dev, heavy data, own cadence).

## Adding a new mini-app (the recipe)

Keep it an **independent repo + its own Vercel project**. Then there are two ways
it can appear under the hub:

### A. Link out via a stable subdomain — recommended (esp. data-heavy)
1. Deploy the app; bind a custom subdomain on its Vercel project: `‹name›.vishalsingh.org`
   (never an ephemeral `*.vercel.app` preview URL).
2. Add a screenshot to `public/thumbnails/‹name›.png` (a chart/map from the app).
3. Register it in [`lib/gallery.ts`](lib/gallery.ts) → `HUB_APPS`: `type`, `title`,
   `description`, `tags`, `accent`, `thumbnail`, `external: true`,
   `href: 'https://‹name›.vishalsingh.org'`.

The gallery card opens it in a new tab. **Pros:** zero coupling, independent
scaling/caching, no hub proxy in the request path (so no Vercel proxy timeout or
cold-start seen through the hub). **Cons:** the URL bar shows the subdomain; SEO is
per-subdomain. This is the right default for data-heavy apps and the only sensible
option for Vite/SPA apps (e.g. `scrc-data`, which can't set a Next `basePath`).

### B. Proxy under a hub path — only when you want it to feel "in-site"
1. In [`next.config.ts`](next.config.ts) `rewrites()`, add (and uncomment):
   `{ source: '/apps/‹name›/:path*', destination: 'https://‹origin›/apps/‹name›/:path*' }`
2. The app must mount under that subpath in **its own** config, or `/_next` assets 404:
   - **Next app:** `basePath: '/apps/‹name›'` (+ `assetPrefix`) — one line.
   - **Vite app:** `base: '/apps/‹name›/'` and rebuild.
3. Register with `href: '/apps/‹name›'`. Cross-zone links from the hub must be plain
   `<a>` (no shared client router).
4. Keep the hub pinned to a current **Next 16.2.x** patch — the rewrite/middleware
   proxy path is the surface recent advisories touched.

### Choosing
- Data-heavy / independent cadence / Vite / fastest → **A (subdomain link-out)**.
- A Next app you control and want under one domain with unified SEO → **B (proxy)**.
- You can start with A and switch to B later: add `basePath` + the rewrite, then flip
  the gallery `href`. No other hub change.

## Current spokes (registered in `lib/gallery.ts`)
| App | Stack | Planned hub path | Today |
|---|---|---|---|
| well-being-atlas | Next (data story) | `/atlas/well-being` | external link |
| world-trade-atlas | Next | `/atlas/trade` | external link |
| health-of-americas-zip-codes | Next | `/apps/zip-health` | external link |
| ai-models table (v0) | Next | `/apps/ai-models` | external link |
| scrc-data | **Vite** | — | **external link only** |

Proxy rules for the Next spokes are scaffolded (commented) in `next.config.ts`;
uncomment each once its origin sets `basePath`.
